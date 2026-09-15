/* ===== FIREBASE (compat / non-module build) =====
   يعمل عند فتح الملف مباشرة من التخزين المحلي (content:// أو file://)
   بدون الحاجة لسيرفر، لأن import ES Modules لا يعمل من مصدر محلي. */
const firebaseConfig = {
  apiKey: "AIzaSyDwo9ylUI7cq7DodekA0vM7iMw-6COp3BI",
  authDomain: "saemad-8a204.firebaseapp.com",
  projectId: "saemad-8a204",
  storageBucket: "saemad-8a204.firebasestorage.app",
  messagingSenderId: "676932025599",
  appId: "1:676932025599:web:0076ca1cabc132883a60ca",
  measurementId: "G-JXTFZ6LGMQ"
};

const app = firebase.initializeApp(firebaseConfig);
let analytics = null;
try { analytics = firebase.analytics(); } catch (e) { /* analytics may fail offline/local - not critical */ }
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const DEFAULT_MASCOT_URL = 'https://i.ibb.co/dJszqfYR/1000311864.png';

document.addEventListener('DOMContentLoaded', function() {
  const y = new Date().getFullYear();
  document.querySelectorAll('#copyright-year, #copyright-year-home').forEach(function(el) { el.textContent = y; });
});

// ===== STATE =====
let currentUser = null;
let currentUserData = null;
let currentRoom = null;
let currentRoomId = null;
let currentGameData = null;
let selectedGameId = null;
let selectedVote = null;
let currentRating = 0;
let currentDetailRating = 0;
let isEliminated = false;
let isSpectator = false;
let ownCharacterRevealed = null;
let ownIsCapo = false;
let loginMethod = 'email';
let roomListeners = [];
let ownReady = false;
let lastPlayersArr = [];
let votedRound = null;

// case story / clue spotlight / vote countdown state (new room features)
let currentRoomGameCache = null;   // { id, data } of currentRoom.currentGameId's game doc (clues, caseStory...)
let caseStoryEndsAtCache = null;   // ms - guards against re-animating the story on every snapshot
let caseStoryTimerId = null;
let clueSpotlightKeyShown = null;  // "round_endsAtMs" - guards against re-animating the spotlight
let clueSpotlightTimerId = null;
let voteCountdownInterval = null;
const STORY_REVEAL_MS = 60000;     // قصة القضية تفضل ظاهرة 60 ثانية
const CLUE_SPOTLIGHT_MS = 60000;   // دليل كل جولة يفضل ظاهر 60 ثانية
const VOTE_WINDOW_MS = 90000;      // مدة عداد التصويت التقريبية لكل جولة

// ===== EXPOSE TO WINDOW =====
window.switchAuthTab = switchAuthTab;
window.setLoginMethod = setLoginMethod;
window.doRegister = doRegister;
window.doLogin = doLogin;
window.doGoogleSignIn = doGoogleSignIn;
window.doForgotPassword = doForgotPassword;
window.doSignOut = doSignOut;
window.navigateTo = navigateTo;
window.goBack = goBack;
window.quickJoin = quickJoin;
window.joinRoom = joinRoom;
window.sendChat = sendChat;
window.switchRoomTab = switchRoomTab;
window.selectStar = selectStar;
window.submitRating = submitRating;
window.openPlayerCard = openPlayerCard;
window.closePlayerCard = closePlayerCard;
window.copyRoomCode = copyRoomCode;
window.shareRoomLink = shareRoomLink;
window.selectVote = selectVote;
window.submitVote = submitVote;
window.goSpectator = goSpectator;
window.exitRoom = exitRoom;
window.playAgain = playAgain;
window.handleGameAction = handleGameAction;
window.applyCoupon = applyCoupon;
window.showGameDetail = showGameDetail;
window.shareGameLink = shareGameLink;
window.toggleReady = toggleReady;
window.kickPlayerFromRoom = kickPlayerFromRoom;
window.toggleRoomLock = toggleRoomLock;

// ===== SMOKE ATMOSPHERE =====
function initSmoke() {
  const atm = document.getElementById('atmosphere');
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'smoke-particle';
    const size = 60 + Math.random() * 120;
    p.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+(Math.random()*100)+'%;animation-duration:'+(8+Math.random()*12)+'s;animation-delay:'+(-Math.random()*12)+'s;';
    atm.appendChild(p);
  }
}
initSmoke();

// ===== PWA MANIFEST =====
function setupManifest() {
  const appUrl = window.location.origin + window.location.pathname;
  const manifest = {
    id: appUrl,
    name: "Capo - لعبة التحقيق",
    short_name: "Capo",
    description: "لعبة التحقيق والجريمة",
    start_url: appUrl,
    scope: appUrl,
    display: "standalone",
    background_color: "#050508",
    theme_color: "#0a0a0f",
    orientation: "portrait",
    icons: [
      { src: "https://i.ibb.co/cX7FVw1b/icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "https://i.ibb.co/cX7FVw1b/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "https://i.ibb.co/cX7FVw1b/icon.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "https://i.ibb.co/cX7FVw1b/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
  const blob = new Blob([JSON.stringify(manifest)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  document.getElementById('pwa-manifest').href = url;
}
setupManifest();

// ===== SERVICE WORKER (generated inline, no separate sw.js file) =====
function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const swSource = "self.addEventListener('install',function(e){self.skipWaiting();});"
      + "self.addEventListener('activate',function(e){self.clients.claim();});"
      + "self.addEventListener('fetch',function(e){});"; // pass-through, keeps app installable
    const swBlob = new Blob([swSource], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(swBlob);
    navigator.serviceWorker.register(swUrl).catch(function () {
      /* service workers need a secure origin (https/localhost) - silently
         skip when running from a local file/content:// so the app still works */
    });
  } catch (e) { /* not critical to app function */ }
}
setupServiceWorker();

// check deep link for room code or a specific game link
function checkDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const roomCode = params.get('room');
  if (roomCode) {
    window._pendingRoomCode = roomCode.toUpperCase();
  }
  const gameId = params.get('game');
  if (gameId) {
    window._pendingGameId = gameId;
  }
}
checkDeepLink();

// ===== SPLASH =====
(function animateSplashStatus() {
  const el = document.getElementById('splash-status');
  if (!el) return;
  const base = 'جارٍ التحميل';
  let dots = 0;
  const iv = setInterval(() => {
    dots = (dots + 1) % 4;
    el.textContent = base + '.'.repeat(dots);
  }, 350);
  window._splashDotsInterval = iv;
})();

setTimeout(() => {
  if (window._splashDotsInterval) clearInterval(window._splashDotsInterval);
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      let snap = await db.collection('users').doc(user.uid).get();
      if (!snap.exists) {
        // مهلة قصيرة تحسباً لسباق التسجيل العادي بالبريد (بيانات الحساب بتتكتب في نفس اللحظة تقريباً)
        await new Promise(r => setTimeout(r, 1200));
        snap = await db.collection('users').doc(user.uid).get();
      }
      if (!snap.exists) {
        // حساب اول مرة بجوجل لسه محتاج يستكمل بياناته - ممنوع نعمل له حساب تلقائي بدون لقب/اسم مستخدم
        showCompleteProfileScreen(user);
        return;
      }
      currentUserData = snap.data();
      updateProfileUI();
      showScreen('home');
      document.getElementById('bottom-nav').classList.add('visible');
      loadGames();
      loadNotifications();
      if (window._pendingGameId) {
        const gid = window._pendingGameId;
        window._pendingGameId = null;
        db.collection('games').doc(gid).get().then(function(doc) {
          if (doc.exists) showGameDetail({ id: doc.id, ...doc.data() });
        }).catch(function() {});
      }
      if (window._pendingRoomCode) {
        setTimeout(() => {
          document.getElementById('join-code-input').value = window._pendingRoomCode;
          window._pendingRoomCode = null;
          navigateTo('join');
        }, 500);
      }
    } else {
      showScreen('auth');
    }
  });
}, 2200);

// ===== USER DATA =====
async function loadUserData(uid) {
  const snap = await db.collection('users').doc(uid).get();
  if (snap.exists) {
    currentUserData = snap.data();
    updateProfileUI();
  }
}

function updateProfileUI() {
  if (!currentUserData) return;
  const alias = currentUserData.alias || 'PLAYER';
  const fname = currentUserData.firstName || '';
  const lname = currentUserData.lastName || '';
  const full = (fname + ' ' + lname).trim();
  document.getElementById('home-fullname').textContent = full;
  document.getElementById('home-alias').textContent = alias.toUpperCase();
  document.getElementById('profile-alias-display').textContent = alias.toUpperCase();
  document.getElementById('profile-name-display').textContent = full;
  document.getElementById('pf-username').textContent = '@' + (currentUserData.username || '');
  document.getElementById('pf-email').textContent = currentUserData.email || (currentUser ? currentUser.email : '');
  document.getElementById('pf-phone').textContent = currentUserData.phone || '-';
  const walletEl = document.getElementById('wallet-balance-amount');
  if (walletEl) walletEl.textContent = (currentUserData.walletBalance || 0) + ' جنيه';
}

// ===== AUTH =====
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('form-' + tab).classList.add('active');
}

function setLoginMethod(method, btn) {
  loginMethod = method;
  document.querySelectorAll('.login-opt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const input = document.getElementById('login-identifier');
  const label = document.getElementById('login-method-label');
  if (method === 'email') {
    input.type = 'email'; input.placeholder = 'name@example.com'; label.textContent = 'البريد الالكتروني';
  } else if (method === 'username') {
    input.type = 'text'; input.placeholder = 'ahmed123'; label.textContent = 'اسم المستخدم';
  } else {
    input.type = 'tel'; input.placeholder = '+966xxxxxxxxx'; label.textContent = 'رقم الهاتف';
  }
}

const BANNED_ALIASES = ['capo', 'كابو', 'كاپو', 'caрo'];
function isBannedAlias(alias) {
  const cleaned = alias.trim().toLowerCase().replace(/\s/g, '');
  return BANNED_ALIASES.some(b => cleaned.includes(b));
}

async function doRegister() {
  const fname = document.getElementById('reg-fname').value.trim();
  const lname = document.getElementById('reg-lname').value.trim();
  const alias = document.getElementById('reg-alias').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;

  document.getElementById('err-alias').classList.remove('show');
  document.getElementById('err-pass').classList.remove('show');

  if (!fname || !lname || !alias || !email || !username || !pass) {
    showToast('يرجى تعبئة جميع الحقول');
    return;
  }
  if (isBannedAlias(alias)) {
    document.getElementById('err-alias').classList.add('show');
    return;
  }
  if (pass !== pass2) {
    document.getElementById('err-pass').classList.add('show');
    return;
  }
  if (pass.length < 6) {
    showToast('كلمة المرور يجب ان تكون 6 احرف على الاقل');
    return;
  }

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    await cred.user.sendEmailVerification();
    await db.collection('users').doc(cred.user.uid).set({
      firstName: fname, lastName: lname, alias: alias, email: email,
      phone: phone, username: username, uid: cred.user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), purchasedGames: []
    });
    document.getElementById('verify-notice').classList.add('show');
    showToast('تم انشاء الحساب - تحقق من بريدك');
  } catch (e) {
    handleAuthError(e);
  }
}

async function doLogin() {
  const identifier = document.getElementById('login-identifier').value.trim();
  const pass = document.getElementById('login-pass').value;
  let email = identifier;

  if (!identifier || !pass) { showToast('يرجى ادخال بيانات الدخول'); return; }

  try {
    if (loginMethod === 'username') {
      const q = db.collection('users').where('username', '==', identifier);
      const snap = await q.get();
      if (snap.empty) { showToast('اسم المستخدم غير موجود'); return; }
      email = snap.docs[0].data().email;
    } else if (loginMethod === 'phone') {
      const q = db.collection('users').where('phone', '==', identifier);
      const snap = await q.get();
      if (snap.empty) { showToast('رقم الهاتف غير موجود'); return; }
      email = snap.docs[0].data().email;
    }
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (e) {
    handleAuthError(e);
  }
}

async function doGoogleSignIn() {
  try {
    await auth.signInWithPopup(googleProvider);
    // onAuthStateChanged هو اللي هيتكفل بالتحقق من وجود بيانات حساب فعلية وتوجيه المستخدم المناسب
  } catch (e) {
    handleAuthError(e);
  }
}

function showCompleteProfileScreen(user) {
  const parts = (user.displayName || '').split(' ');
  document.getElementById('cp-fname').value = parts[0] || '';
  document.getElementById('cp-lname').value = parts.slice(1).join(' ') || '';
  document.getElementById('cp-phone').value = '';
  document.getElementById('cp-alias').value = '';
  document.getElementById('cp-username').value = '';
  document.getElementById('cp-err-alias').classList.remove('show');
  showScreen('complete-profile');
}

async function completeGoogleProfile() {
  const user = auth.currentUser;
  if (!user) { showScreen('auth'); return; }
  const fname = document.getElementById('cp-fname').value.trim();
  const lname = document.getElementById('cp-lname').value.trim();
  const alias = document.getElementById('cp-alias').value.trim();
  const phone = document.getElementById('cp-phone').value.trim();
  const username = document.getElementById('cp-username').value.trim();
  document.getElementById('cp-err-alias').classList.remove('show');

  if (!fname || !lname || !alias || !username) { showToast('يرجى تعبئة جميع الحقول'); return; }
  if (isBannedAlias(alias)) { document.getElementById('cp-err-alias').classList.add('show'); return; }

  try {
    await db.collection('users').doc(user.uid).set({
      firstName: fname, lastName: lname, alias: alias, email: user.email || '',
      phone: phone, username: username, uid: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), purchasedGames: []
    });
    currentUser = user;
    await loadUserData(user.uid);
    showScreen('home');
    document.getElementById('bottom-nav').classList.add('visible');
    loadGames();
    loadNotifications();
  } catch (e) {
    console.error(e);
    showToast('حدث خطأ - حاول مرة اخرى');
  }
}
window.completeGoogleProfile = completeGoogleProfile;

// لو المستخدم قرر يلغي استكمال الحساب - نسجله خروج بدل ما نسيبه بحساب مصادقة من غير بيانات
async function cancelGoogleSignup() {
  try { await auth.signOut(); } catch (e) {}
  currentUser = null;
  currentUserData = null;
  showScreen('auth');
}
window.cancelGoogleSignup = cancelGoogleSignup;

async function doForgotPassword() {
  const email = document.getElementById('login-identifier').value.trim();
  if (!email || loginMethod !== 'email') {
    showToast('ادخل بريدك الالكتروني أولاً');
    return;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    document.getElementById('forgot-notice').classList.add('show');
  } catch (e) {
    showToast('البريد غير موجود');
  }
}

async function doSignOut() {
  clearRoomListeners();
  await auth.signOut();
  currentUser = null;
  currentUserData = null;
  currentRoom = null;
  currentRoomId = null;
  document.getElementById('bottom-nav').classList.remove('visible');
  showScreen('auth');
}

function handleAuthError(e) {
  const msgs = {
    'auth/email-already-in-use': 'البريد الالكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الالكتروني غير صحيح',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/too-many-requests': 'محاولات كثيرة - انتظر قليلاً',
    'auth/popup-closed-by-user': 'تم الغاء العملية'
  };
  showToast(msgs[e.code] || 'حدث خطأ - حاول مرة اخرى');
}

// ===== NAVIGATION =====
let screenHistory = [];

// زرار الرجوع الفعلي في الموبايل (أو زرار رجوع المتصفح) كان بيقفل الموقع كله بدل ما يرجع لشاشة سابقة جوه التطبيق.
// بنحقن history entry إضافي دايمًا عشان أول ضغطة رجوع توديك لشاشة سابقة جوه الموقع، ولما توصل لأول شاشة (مفيش تاريخ متبقي)
// بنسيب زرار الرجوع يشتغل بشكل طبيعي (يقفل الموقع) عشان المستخدم يقدر يخرج فعليًا لو حابب.
try { history.pushState({ screen: 'boot' }, '', location.href); } catch (e) {}
window.addEventListener('popstate', function() {
  if (screenHistory.length > 0) {
    goBack();
    try { history.pushState({ screen: 'sync' }, '', location.href); } catch (e) {}
  }
});

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = document.getElementById('screen-' + id);
  if (s) s.classList.add('active');
}

function navigateTo(id) {
  const active = document.querySelector('.screen.active');
  if (active) screenHistory.push(active.id.replace('screen-', ''));
  showScreen(id);

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
}

function goBack() {
  if (screenHistory.length > 0) {
    const prev = screenHistory.pop();
    showScreen(prev);
  } else {
    navigateTo('home');
  }
}

// ===== GAMES =====
async function loadGames() {
  try {
    const snap = await db.collection('games').get();
    const container = document.getElementById('games-scroll');
    container.innerHTML = '';
    if (snap.empty) {
      container.innerHTML = '<div style="padding:20px;color:var(--text-muted);font-size:0.82rem;">لا توجد العاب متاحة حالياً</div>';
      return;
    }
    snap.forEach(d => {
      const g = { id: d.id, ...d.data() };
      container.innerHTML += buildGameCard(g);
    });
  } catch (e) {
    console.error(e);
  }
}

// نجوم ثابتة (للعرض بس، مش تفاعلية) بتاخد متوسط تقييم وترسمه
function buildStaticStars(avg) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = avg >= i - 0.5;
    html += '<svg viewBox="0 0 24 24" fill="' + (filled ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.5" class="' + (filled ? '' : 'star-empty') + '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }
  return html;
}
const DIFFICULTY_MAP = { easy: ['سهل', 'diff-easy'], medium: ['متوسط', 'diff-medium'], hard: ['صعب', 'diff-hard'] };

function buildGameCard(g) {
  const isPaid = g.price && parseFloat(g.price) > 0;
  const badge = isPaid
    ? '<div class="game-badge badge-paid">' + (g.price || '') + ' جنيه</div>'
    : '<div class="game-badge badge-free">مجاني</div>';
  const imgContent = g.coverUrl
    ? '<img class="game-card-img" src="' + g.coverUrl + '" alt="" draggable="false" oncontextmenu="return false">'
    : '<div class="game-card-img-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold-dim)" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></div>';
  const diff = DIFFICULTY_MAP[g.difficulty] || DIFFICULTY_MAP.medium;
  const ratingCount = g.ratingCount || 0;
  const avg = ratingCount ? (g.ratingSum || 0) / ratingCount : 0;
  const mascotHtml = '<img class="game-card-mascot" src="' + (g.mascotUrl || DEFAULT_MASCOT_URL) + '" alt="" draggable="false" oncontextmenu="return false">';
  // بيانات اللعبة بتتخزن في data-game بشكل آمن (attributeEscape بيحول أي " أو ' أو & لكود HTML)
  // بدل ما نحقنها كـ JSON خام جوه onclick="" اللي كان بيكسر أي وقت اسم اللعبة أو أي حقل فيه علامة تنصيص
  const gameDataAttr = attributeEscape(JSON.stringify(g));
  return '<div class="game-card" data-game="' + gameDataAttr + '" onclick="flipGameCard(this)">'
    + '<div class="game-card-inner">'
    + '<div class="game-card-face game-card-front">'
    + imgContent + badge
    + '<div class="flip-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg></div>'
    + '<div class="game-card-body">'
    + '<div class="game-card-name">' + escapeHtml(g.name || 'لعبة') + '</div>'
    + '<div class="game-card-meta">'
    + '<div class="player-count-chips">'
    + (g.playerCounts || [4]).map(function(n) { return '<div class="pc-chip">' + n + '</div>'; }).join('')
    + '</div>'
    + '<span class="diff-chip ' + diff[1] + '">' + diff[0] + '</span>'
    + '<span style="margin-right:auto">' + (g.rounds || 5) + ' جولات</span>'
    + '</div>'
    + '</div></div>'
    + '<div class="game-card-face game-card-back">'
    + mascotHtml
    + '<div class="game-card-back-name">' + escapeHtml(g.name || 'لعبة') + '</div>'
    + '<div class="game-card-back-stars" data-gid="' + g.id + '">' + buildQuickRateStars(g.id, avg) + '<span class="gcb-count">(' + ratingCount + ')</span></div>'
    + '<div class="game-card-back-plays">اتلعبت ' + (g.playsCount || 0) + ' مرة</div>'
    + '<button class="game-card-back-btn" onclick="event.stopPropagation(); showGameDetailFromCard(this)">عرض التفاصيل</button>'
    + '</div>'
    + '</div></div>';
}

// تهريب آمن للنص عشان يتحط جوه HTML attribute من غير ما يكسره (مختلف عن escapeHtml العادي لأنه بيغطي علامات التنصيص الاتنين)
function attributeEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// بيقرأ بيانات اللعبة من data-game على الكارت (مش من onclick مباشرة) عشان يفضل شغال مهما كان اسم/وصف اللعبة فيه علامات تنصيص
function showGameDetailFromCard(btnEl) {
  const card = btnEl.closest('.game-card');
  if (!card || !card.dataset.game) return;
  try {
    const g = JSON.parse(card.dataset.game);
    showGameDetail(g);
  } catch (e) {
    console.error('تعذر قراءة بيانات اللعبة', e);
    showToast('حصل خطأ - جرب تاني');
  }
}
window.showGameDetailFromCard = showGameDetailFromCard;

// نجوم تفاعلية على ضهر الكارت مباشرة - عشان التقييم يبقى واضح من غير ما تدخل تفاصيل اللعبة
function buildQuickRateStars(gameId, avg) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = avg >= i - 0.5;
    html += '<svg class="qr-star" viewBox="0 0 24 24" fill="' + (filled ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.5" onclick="event.stopPropagation(); quickRateGame(\'' + gameId + '\', ' + i + ', this)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }
  return html;
}

async function quickRateGame(gameId, stars, starEl) {
  if (!currentUser) return;
  try {
    await db.collection('ratings').add({
      uid: currentUser.uid,
      alias: currentUserData ? currentUserData.alias : '',
      gameId: gameId,
      rating: stars,
      comment: '',
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('games').doc(gameId).update({
      ratingSum: firebase.firestore.FieldValue.increment(stars),
      ratingCount: firebase.firestore.FieldValue.increment(1)
    });
    showToast('شكراً على تقييمك (' + stars + ' نجوم)');
    // نلوّن النجوم فوراً محلياً من غير استنى قراءة جديدة
    const row = starEl.closest('.game-card-back-stars');
    if (row) {
      row.querySelectorAll('.qr-star').forEach(function(s, idx) {
        s.setAttribute('fill', idx < stars ? 'currentColor' : 'none');
      });
    }
  } catch (e) { showToast('فشل ارسال التقييم'); }
}
window.quickRateGame = quickRateGame;

window.flipGameCard = function(el) {
  el.classList.toggle('flipped');
};

function showGameDetail(g) {
  selectedGameId = g.id;
  currentGameData = g;
  document.getElementById('detail-hero-img').src = g.coverUrl || '';
  document.getElementById('detail-hero-img').style.display = g.coverUrl ? 'block' : 'none';
  document.getElementById('detail-name').textContent = g.name || '';
  document.getElementById('detail-desc').textContent = g.description || '';
  document.getElementById('detail-players').textContent = (g.playerCounts || [4]).join(' / ');
  document.getElementById('detail-rounds').textContent = (g.rounds || 5) + ' جولات';
  document.getElementById('detail-type').textContent = g.category || 'جريمة';
  const diff = DIFFICULTY_MAP[g.difficulty] || DIFFICULTY_MAP.medium;
  document.getElementById('detail-difficulty').textContent = diff[0];
  const isPaid = g.price && parseFloat(g.price) > 0;
  document.getElementById('detail-price').textContent = isPaid ? g.price + ' جنيه' : 'مجاني';
  document.getElementById('coupon-section').style.display = isPaid ? 'block' : 'none';
  document.getElementById('paypal-button-container').innerHTML = '';

  const ratingCount = g.ratingCount || 0;
  const avg = ratingCount ? (g.ratingSum || 0) / ratingCount : 0;
  document.getElementById('detail-rating-summary').innerHTML = buildStaticStars(avg)
    + '<span class="drs-count">' + (ratingCount ? (avg.toFixed(1) + ' (' + ratingCount + ' تقييم) - اتلعبت ' + (g.playsCount || 0) + ' مرة') : 'لسه معملهاش حد تقييم') + '</span>';

  // شخصيات القضية سر للاعب لحد ما يدخل اللعبة فعلاً - مبتتعرضش في شاشة التفاصيل قبل الدخول
  const charsSection = document.getElementById('detail-characters-section');
  charsSection.style.display = 'none';

  currentDetailRating = 0;
  document.querySelectorAll('#detail-stars-row .star-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('detail-rating-comment').value = '';

  const purchased = currentUserData && (currentUserData.purchasedGames || []).includes(g.id);
  const actionBtn = document.getElementById('detail-action-btn');
  if (!isPaid || purchased) {
    actionBtn.textContent = 'انضم لغرفة';
    actionBtn.onclick = function() { navigateTo('join'); };
  } else {
    actionBtn.textContent = 'اشتر الان - ' + g.price + ' جنيه';
    actionBtn.onclick = function() { initPayPal(g); };
  }
  navigateTo('game-detail');
}

function handlePlayNowClick() {
  if (!currentGameData) return;
  const g = currentGameData;
  const isPaid = g.price && parseFloat(g.price) > 0;
  const purchased = currentUserData && (currentUserData.purchasedGames || []).includes(g.id);
  if (isPaid && !purchased) {
    showToast('لازم تشتري اللعبة الأول');
    document.getElementById('detail-action-btn').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  playThisGameNow(g);
}
window.handlePlayNowClick = handlePlayNowClick;

function handleGameAction() {
  navigateTo('join');
}

// إنشاء غرفة فورية للعبة دي بالذات (من غير ما تعدي على شاشة اختيار العاب متعددة)
// وبعدين تقدر تبعت رابط/كود الغرفة لأصحابك مباشرة من شاشة الانتظار
async function playThisGameNow(g) {
  if (!currentUser || !currentUserData) { showToast('لازم تسجل دخول الأول'); return; }
  try {
    const roomRef = db.collection('rooms').doc();
    await roomRef.set({
      name: (currentUserData.alias || 'PLAYER') + ' - ' + (g.name || ''),
      code: generatePlayerRoomCode(),
      ownerUid: currentUser.uid,
      gameIds: [g.id],
      currentGameIndex: 0,
      currentGameId: g.id,
      gameName: g.name || '',
      status: 'waiting',
      currentRound: 0,
      totalRounds: g.rounds || 5,
      roundDone: false,
      votingOpen: false,
      eliminatedPlayers: [],
      capoEliminated: false,
      capoWon: false,
      isPublic: true,
      locked: false,
      maxPlayers: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    currentRoomId = roomRef.id;
    const roomSnap = await roomRef.get();
    currentRoom = roomSnap.data();
    const playerData = {
      uid: currentUser.uid,
      name: ((currentUserData.firstName || '') + ' ' + (currentUserData.lastName || '')).trim(),
      alias: currentUserData.alias || 'PLAYER',
      status: 'active',
      ready: false,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('rooms').doc(currentRoomId).collection('players').doc(currentUser.uid).set(playerData);
    enterRoom();
  } catch (e) {
    console.error(e);
    showToast('تعذر إنشاء الغرفة - حاول تاني');
  }
}
window.playThisGameNow = playThisGameNow;

function shareGameLink() {
  if (!selectedGameId) return;
  const url = window.location.origin + window.location.pathname + '?game=' + selectedGameId;
  const title = (currentGameData && currentGameData.name) || 'لعبة Capo';
  if (navigator.share) {
    navigator.share({ title: title, text: 'العب معايا ' + title + ' على Capo', url: url });
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('تم نسخ رابط اللعبة'));
  }
}

// PayPal
function initPayPal(g) {
  if (window.paypal) { renderPayPal(g); return; }
  const script = document.createElement('script');
  script.src = 'https://www.paypal.com/sdk/js?client-id=AW_M1acPABnrPp2AJklYALUDZ1OUA2NS6CPGp3D3ZB9fVIfmfD87le9WZmHF3fOCqINDO3RAtQGWLteZ&currency=USD';
  script.onload = function() { renderPayPal(g); };
  document.head.appendChild(script);
}
function renderPayPal(g) {
  document.getElementById('paypal-button-container').innerHTML = '';
  window.paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({ purchase_units: [{ amount: { value: String(g.price || '1') } }] });
    },
    onApprove: async function(data, actions) {
      await actions.order.capture();
      await db.collection('users').doc(currentUser.uid).update({ purchasedGames: firebase.firestore.FieldValue.arrayUnion(g.id) });
      currentUserData.purchasedGames = (currentUserData.purchasedGames || []).concat([g.id]);
      showToast('تم الشراء بنجاح');
      const actionBtn = document.getElementById('detail-action-btn');
      actionBtn.textContent = 'انضم لغرفة';
      actionBtn.onclick = function() { navigateTo('join'); };
    },
    onError: function() { showToast('فشل الدفع - حاول مرة اخرى'); }
  }).render('#paypal-button-container');
}

// ===== WALLET =====
function toggleWalletTopup() {
  const section = document.getElementById('wallet-topup-section');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}
window.toggleWalletTopup = toggleWalletTopup;

function initWalletTopup() {
  const amount = parseFloat(document.getElementById('wallet-topup-amount').value);
  if (!amount || amount <= 0) { showToast('اكتب مبلغ صحيح'); return; }
  if (window.paypal) { renderWalletPayPal(amount); return; }
  const script = document.createElement('script');
  script.src = 'https://www.paypal.com/sdk/js?client-id=AW_M1acPABnrPp2AJklYALUDZ1OUA2NS6CPGp3D3ZB9fVIfmfD87le9WZmHF3fOCqINDO3RAtQGWLteZ&currency=USD';
  script.onload = function() { renderWalletPayPal(amount); };
  document.head.appendChild(script);
}
window.initWalletTopup = initWalletTopup;

function renderWalletPayPal(amount) {
  const container = document.getElementById('wallet-paypal-container');
  container.innerHTML = '';
  window.paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({ purchase_units: [{ amount: { value: String(amount) } }] });
    },
    onApprove: async function(data, actions) {
      await actions.order.capture();
      try {
        await db.collection('users').doc(currentUser.uid).update({
          walletBalance: firebase.firestore.FieldValue.increment(amount)
        });
        currentUserData.walletBalance = (currentUserData.walletBalance || 0) + amount;
        document.getElementById('wallet-balance-amount').textContent = currentUserData.walletBalance + ' جنيه';
        showToast('تم شحن ' + amount + ' جنيه في محفظتك');
        document.getElementById('wallet-topup-section').style.display = 'none';
        document.getElementById('wallet-topup-amount').value = '';
      } catch (e) { showToast('حصل خطأ في تحديث الرصيد - كلم الدعم'); }
    },
    onError: function() { showToast('فشل الدفع - حاول مرة اخرى'); }
  }).render('#wallet-paypal-container');
}

async function applyCoupon() {
  const code = document.getElementById('coupon-input').value.trim().toUpperCase();
  if (!code) return;
  try {
    const snap = await db.collection('coupons').where('code', '==', code).where('active', '==', true).get();
    if (snap.empty) { showToast('كود الخصم غير صحيح'); return; }
    const coupon = snap.docs[0].data();
    if (coupon.gameId && coupon.gameId !== selectedGameId) { showToast('هذا الكود غير صالح لهذه اللعبة'); return; }
    const discount = coupon.discount || 0;
    if (discount >= 100) {
      await db.collection('users').doc(currentUser.uid).update({ purchasedGames: firebase.firestore.FieldValue.arrayUnion(selectedGameId) });
      currentUserData.purchasedGames = (currentUserData.purchasedGames || []).concat([selectedGameId]);
      showToast('تم تفعيل الكود - اللعبة مجانية الان');
      document.getElementById('detail-action-btn').textContent = 'انضم لغرفة';
    } else {
      const newPrice = (parseFloat(currentGameData.price || 0) * (1 - discount/100)).toFixed(2);
      document.getElementById('detail-price').textContent = newPrice + ' جنيه (بعد الخصم)';
      showToast('تم تطبيق خصم ' + discount + '%');
    }
  } catch (e) { showToast('خطأ في تطبيق الكود'); }
}

// ===== ROOM =====
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function quickJoin() {
  const code = document.getElementById('quick-code').value.trim().toUpperCase();
  if (!code) { showToast('ادخل كود الغرفة'); return; }
  await joinRoomByCode(code);
}

async function joinRoom() {
  const code = document.getElementById('join-code-input').value.trim().toUpperCase();
  if (!code) { showToast('ادخل كود الغرفة'); return; }
  await joinRoomByCode(code);
}

async function joinRoomByCode(code) {
  try {
    const q = db.collection('rooms').where('code', '==', code).where('status', 'in', ['waiting', 'active']);
    const snap = await q.get();
    if (snap.empty) { showToast('الغرفة غير موجودة او منتهية'); return; }
    const roomDoc = snap.docs[0];
    currentRoomId = roomDoc.id;
    currentRoom = roomDoc.data();

    // لو الغرفة مقفولة من صاحبها، امنع انضمام لاعبين جدد - لكن اسمح لأي لاعب موجود بالفعل انه يرجع (reconnect)
    const existingSelf = await db.collection('rooms').doc(currentRoomId).collection('players').doc(currentUser.uid).get();
    if (currentRoom.locked && !existingSelf.exists) {
      currentRoomId = null; currentRoom = null;
      showToast('الغرفة مقفولة حالياً ولا تقبل لاعبين جدد');
      return;
    }
    // متدخلش عدد لاعبين اكتر من العدد المحدد للغرفة
    if (currentRoom.maxPlayers && !existingSelf.exists) {
      const countSnap = await db.collection('rooms').doc(currentRoomId).collection('players').get();
      if (countSnap.size >= currentRoom.maxPlayers) {
        const maxP = currentRoom.maxPlayers;
        currentRoomId = null; currentRoom = null;
        showToast('الغرفة مكتملة بالفعل بعدد اللاعبين المحدد (' + maxP + ')');
        return;
      }
    }

    const playerData = {
      uid: currentUser.uid,
      name: ((currentUserData.firstName || '') + ' ' + (currentUserData.lastName || '')).trim(),
      alias: currentUserData.alias || 'PLAYER',
      bio: currentUserData.bio || '',
      status: 'active',
      ready: false,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('rooms').doc(currentRoomId).collection('players').doc(currentUser.uid).set(playerData, { merge: true });
    enterRoom();
  } catch (e) {
    console.error(e);
    showToast('حدث خطأ في الانضمام');
  }
}

function enterRoom() {
  isEliminated = false;
  isSpectator = false;
  selectedVote = null;
  ownCharacterRevealed = null;
  resetRoomFeatureState();
  document.getElementById('room-code-display').textContent = currentRoom.code || '';
  document.getElementById('room-game-title').textContent = currentRoom.gameName || '';
  showScreen('room');
  setupRoomListeners();
  document.getElementById('bottom-nav').classList.remove('visible');
}

// يصفّر كل الكاش والمؤقتات المحلية الخاصة بالميزات الجديدة (القصة/الدليل/التصويت/الاستعداد)
// عشان ميفضلوش شغالين على بيانات غرفة قديمة لما ندخل غرفة تانية
function resetRoomFeatureState() {
  currentRoomGameCache = null;
  caseStoryEndsAtCache = null;
  clueSpotlightKeyShown = null;
  ownReady = false;
  ownIsCapo = false;
  lastPlayersArr = [];
  votedRound = null;
  clearInterval(caseStoryTimerId); caseStoryTimerId = null;
  clearInterval(clueSpotlightTimerId); clueSpotlightTimerId = null;
  clearInterval(voteCountdownInterval); voteCountdownInterval = null;
  const storyEl = document.getElementById('case-story-screen');
  if (storyEl) storyEl.classList.remove('show');
  const spotEl = document.getElementById('clue-spotlight-screen');
  if (spotEl) spotEl.classList.remove('show');
}

// ===== PLAYER-CREATED ROOMS =====
let createRoomGamesCache = [];
async function openCreateRoomScreen() {
  navigateTo('create-room');
  const list = document.getElementById('create-room-games-list');
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const snap = await db.collection('games').get();
    createRoomGamesCache = [];
    snap.forEach(d => createRoomGamesCache.push({ id: d.id, ...d.data() }));
    renderCreateRoomGamesList();
  } catch (e) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;">تعذر تحميل الالعاب</div>';
  }
}
window.openCreateRoomScreen = openCreateRoomScreen;

function renderCreateRoomGamesList() {
  const list = document.getElementById('create-room-games-list');
  const played = (currentUserData && currentUserData.playedGameIds) || [];
  const purchased = (currentUserData && currentUserData.purchasedGames) || [];
  const balance = (currentUserData && currentUserData.walletBalance) || 0;
  list.innerHTML = createRoomGamesCache.map(g => {
    const isPaid = g.price && parseFloat(g.price) > 0;
    const owned = !isPaid || purchased.indexOf(g.id) !== -1;
    const canAfford = owned || balance >= parseFloat(g.price);
    const lockNote = (!owned && !canAfford)
      ? '<div class="wallet-locked-note">لعبة مدفوعة (' + g.price + ' جنيه) - رصيدك في المحفظة مش كافي، اشحن الأول من صفحة حسابي</div>'
      : (!owned && canAfford ? '<div class="wallet-locked-note" style="color:var(--accent-gold);">مدفوعة (' + g.price + ' جنيه) - هيتخصم من محفظتك أول ما تختارها</div>' : '');
    return '<label style="display:flex;align-items:flex-start;gap:10px;padding:10px;border:1px solid var(--border-subtle,#222230);border-radius:10px;margin-bottom:8px;' + (!owned && !canAfford ? 'opacity:0.5;' : '') + '">' +
      '<input type="checkbox" class="create-room-game-cb" value="' + g.id + '" data-owned="' + owned + '" data-canafford="' + canAfford + '" data-price="' + (g.price || 0) + '" ' + (!owned && !canAfford ? 'disabled' : '') + ' onchange="handleCreateRoomGameCheck(this, \'' + g.id + '\')">' +
      '<span style="flex:1;">' + escapeHtml(g.name || 'لعبة') +
        (played.indexOf(g.id) !== -1 ? '<span style="margin-right:8px;font-size:0.7rem;color:var(--text-muted);">لعبتها قبل كده</span>' : '') +
        lockNote +
      '</span>' +
    '</label>';
  }).join('') || '<div style="color:var(--text-muted);font-size:0.8rem;">لا توجد العاب متاحة</div>';
  updateMaxPlayersOptions();
}

// لما تحاول تختار لعبة مدفوعة لسه مشتريتهاش، بنخصم قيمتها من المحفظة فورًا ونضيفها لألعابك المشتراة (شراء مرة واحدة، تلعب بيها على طول بعد كده)
async function handleCreateRoomGameCheck(checkbox, gameId) {
  if (!checkbox.checked) { updateMaxPlayersOptions(); return; }
  const owned = checkbox.dataset.owned === 'true';
  if (owned) { updateMaxPlayersOptions(); return; }
  const price = parseFloat(checkbox.dataset.price) || 0;
  const balance = (currentUserData && currentUserData.walletBalance) || 0;
  if (balance < price) {
    checkbox.checked = false;
    showToast('رصيدك في المحفظة مش كافي - اشحن المحفظة الأول من صفحة حسابي');
    return;
  }
  checkbox.disabled = true;
  try {
    await db.collection('users').doc(currentUser.uid).update({
      walletBalance: firebase.firestore.FieldValue.increment(-price),
      purchasedGames: firebase.firestore.FieldValue.arrayUnion(gameId)
    });
    currentUserData.walletBalance = balance - price;
    currentUserData.purchasedGames = (currentUserData.purchasedGames || []).concat([gameId]);
    const walletEl = document.getElementById('wallet-balance-amount');
    if (walletEl) walletEl.textContent = currentUserData.walletBalance + ' جنيه';
    showToast('تم خصم ' + price + ' جنيه من محفظتك - اللعبة بقت ملكك دايمًا');
    checkbox.dataset.owned = 'true';
  } catch (e) {
    checkbox.checked = false;
    showToast('تعذر إتمام الشراء من المحفظة');
  }
  checkbox.disabled = false;
  updateMaxPlayersOptions();
}
window.handleCreateRoomGameCheck = handleCreateRoomGameCheck;

// يبني قائمة "عدد اللاعبين" حسب اول لعبة متختارة (عشان نلزم الغرفة بعدد محدد ومتدخلش اكتر او اقل منه)
function updateMaxPlayersOptions() {
  const wrap = document.getElementById('create-room-maxplayers-wrap');
  const select = document.getElementById('create-room-maxplayers');
  const firstChecked = document.querySelector('.create-room-game-cb:checked');
  if (!firstChecked) { wrap.style.display = 'none'; select.innerHTML = ''; return; }
  const game = createRoomGamesCache.find(g => g.id === firstChecked.value);
  const counts = (game && game.playerCounts && game.playerCounts.length) ? game.playerCounts : [4];
  select.innerHTML = counts.map(n => '<option value="' + n + '">' + n + ' لاعبين بالظبط</option>').join('');
  wrap.style.display = 'block';
}
window.updateMaxPlayersOptions = updateMaxPlayersOptions;

window.pickRandomGameForRoom = function() {
  if (!createRoomGamesCache.length) { showToast('مفيش العاب متاحة'); return; }
  document.querySelectorAll('.create-room-game-cb').forEach(cb => cb.checked = false);
  const pick = createRoomGamesCache[Math.floor(Math.random() * createRoomGamesCache.length)];
  const cb = document.querySelector('.create-room-game-cb[value="' + pick.id + '"]');
  if (cb) cb.checked = true;
  updateMaxPlayersOptions();
  showToast('تم اختيار: ' + (pick.name || 'لعبة'));
};

function generatePlayerRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function createRoomByPlayer() {
  if (!currentUser || !currentUserData) { showToast('سجل الدخول اولاً'); return; }
  const name = (document.getElementById('create-room-name').value || '').trim() || 'غرفة بدون اسم';
  const selectedIds = Array.from(document.querySelectorAll('.create-room-game-cb:checked')).map(cb => cb.value);
  if (!selectedIds.length) { showToast('اختر لعبة واحدة على الاقل او اضغط اختار لي'); return; }
  const firstGame = createRoomGamesCache.find(g => g.id === selectedIds[0]);
  const maxPlayersSelect = document.getElementById('create-room-maxplayers');
  const maxPlayers = maxPlayersSelect && maxPlayersSelect.value ? parseInt(maxPlayersSelect.value, 10) : null;
  try {
    const roomRef = db.collection('rooms').doc();
    await roomRef.set({
      name: name,
      code: generatePlayerRoomCode(),
      ownerUid: currentUser.uid,
      gameIds: selectedIds,
      currentGameIndex: 0,
      currentGameId: selectedIds[0],
      gameName: firstGame ? (firstGame.name || '') : '',
      status: 'waiting',
      currentRound: 0,
      totalRounds: (firstGame && firstGame.rounds) || 5,
      roundDone: false,
      votingOpen: false,
      eliminatedPlayers: [],
      capoEliminated: false,
      capoWon: false,
      isPublic: true,
      locked: false,
      maxPlayers: maxPlayers,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    currentRoomId = roomRef.id;
    const roomSnap = await roomRef.get();
    currentRoom = roomSnap.data();
    const playerData = {
      uid: currentUser.uid,
      name: ((currentUserData.firstName || '') + ' ' + (currentUserData.lastName || '')).trim(),
      alias: currentUserData.alias || 'PLAYER',
      status: 'active',
      ready: false,
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('rooms').doc(currentRoomId).collection('players').doc(currentUser.uid).set(playerData);
    enterRoom();
  } catch (e) {
    console.error(e);
    showToast('حدث خطأ في انشاء الغرفة');
  }
}
window.createRoomByPlayer = createRoomByPlayer;

async function loadPublicRooms() {
  const el = document.getElementById('live-rooms-list');
  if (!el) return;
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const snap = await db.collection('rooms').where('isPublic', '==', true).where('status', 'in', ['waiting', 'active']).limit(20).get();
    if (snap.empty) { el.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;">لا توجد غرف نشطة الان</div>'; return; }
    el.innerHTML = '';
    snap.forEach(d => {
      const r = d.data();
      el.innerHTML += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid var(--border-subtle,#222230);border-radius:10px;margin-bottom:8px;">' +
        '<div><div style="font-size:0.85rem;">' + escapeHtml(r.name || r.code || '') + '</div>' +
        '<div style="font-size:0.7rem;color:var(--text-muted);">' + escapeHtml(r.gameName || '') + '</div></div>' +
        '<button class="btn-join" style="width:auto;padding:8px 16px;margin-bottom:0;" onclick="enterSpectateRoom(\'' + d.id + '\')">مشاهدة</button>' +
      '</div>';
    });
  } catch (e) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;">تعذر تحميل الغرف</div>';
  }
}
window.loadPublicRooms = loadPublicRooms;

async function enterSpectateRoom(roomId) {
  try {
    const doc = await db.collection('rooms').doc(roomId).get();
    if (!doc.exists) { showToast('الغرفة غير موجودة'); return; }
    currentRoomId = roomId;
    currentRoom = doc.data();
    isSpectator = true;
    isEliminated = false;
    ownCharacterRevealed = null;
    resetRoomFeatureState();
    document.getElementById('room-code-display').textContent = currentRoom.code || '';
    document.getElementById('room-game-title').textContent = currentRoom.gameName || '';
    showScreen('room');
    setupRoomListeners();
    document.getElementById('bottom-nav').classList.remove('visible');
    document.getElementById('spectator-bar').classList.add('show');
    document.getElementById('chat-input').disabled = true;
  } catch (e) { showToast('تعذر فتح الغرفة'); }
}
window.enterSpectateRoom = enterSpectateRoom;

// ===== ROUND / CHARACTER LOGIC (owner-driven) =====
async function startGameInRoom() {
  if (!currentRoom || !currentRoomId) return;
  if (currentRoom.ownerUid !== currentUser.uid) { showToast('صاحب الغرفة بس يقدر يبدأ اللعبة'); return; }
  try {
    const gameDoc = await db.collection('games').doc(currentRoom.currentGameId).get();
    if (!gameDoc.exists) { showToast('اللعبة غير موجودة'); return; }
    const game = gameDoc.data();
    const characters = (game.characters || []).filter(c => c.name);
    if (!characters.length) { showToast('اللعبة دي لسه ملهاش شخصيات مضافة من لوحة التحكم'); return; }

    const playersSnap = await db.collection('rooms').doc(currentRoomId).collection('players').get();
    const playerDocs = playersSnap.docs;
    if (playerDocs.length < 2) { showToast('لازم على الاقل لاعبين اتنين'); return; }
    if (currentRoom.maxPlayers && playerDocs.length !== currentRoom.maxPlayers) {
      showToast('لازم الغرفة تكتمل بالظبط بـ ' + currentRoom.maxPlayers + ' لاعبين عشان تبدأ (حالياً ' + playerDocs.length + ')');
      return;
    }
    if (characters.length < playerDocs.length) { showToast('عدد الشخصيات في اللعبة اقل من عدد اللاعبين'); return; }

    const shuffled = characters.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }

    const batch = db.batch();
    playerDocs.forEach((pDoc, idx) => {
      const ch = shuffled[idx];
      batch.update(pDoc.ref, {
        characterId: ch.id || ('c' + idx),
        characterName: ch.name || '',
        characterBio: ch.bio || '',
        isCapo: !!ch.isCapo
      });
      batch.set(db.collection('users').doc(pDoc.id), {
        playedGameIds: firebase.firestore.FieldValue.arrayUnion(currentRoom.currentGameId)
      }, { merge: true });
    });
    batch.update(db.collection('rooms').doc(currentRoomId), {
      status: 'active',
      currentRound: 1,
      roundDone: false,
      votingOpen: true,
      eliminatedPlayers: [],
      capoEliminated: false,
      capoWon: false,
      totalRounds: game.rounds || 5,
      gameName: game.name || '',
      caseStory: game.caseStory || '',
      storyEndsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + STORY_REVEAL_MS)),
      clueRevealEndsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + STORY_REVEAL_MS + CLUE_SPOTLIGHT_MS)),
      voteEndsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + STORY_REVEAL_MS + CLUE_SPOTLIGHT_MS + VOTE_WINDOW_MS))
    });
    // "كم مرة اتلعبت" اللعبة بتتحسب على عدد اللاعبين الفعليين اللي بدأوا فيها
    batch.update(db.collection('games').doc(currentRoom.currentGameId), {
      playsCount: firebase.firestore.FieldValue.increment(playerDocs.length)
    });
    await batch.commit();
  } catch (e) {
    console.error(e);
    showToast('تعذر بدء اللعبة');
  }
}
window.startGameInRoom = startGameInRoom;

async function endRoundInRoom() {
  if (!currentRoom || !currentRoomId) return;
  if (currentRoom.ownerUid !== currentUser.uid) { showToast('صاحب الغرفة بس يقدر ينهي الجولة'); return; }
  try {
    const votesSnap = await db.collection('rooms').doc(currentRoomId).collection('votes').get();
    if (votesSnap.empty) { showToast('محدش صوّت لسه'); return; }
    const tally = {};
    votesSnap.forEach(d => {
      const t = d.data().targetUid;
      tally[t] = (tally[t] || 0) + 1;
    });
    let maxCount = -1, topUids = [];
    Object.keys(tally).forEach(uid => {
      if (tally[uid] > maxCount) { maxCount = tally[uid]; topUids = [uid]; }
      else if (tally[uid] === maxCount) { topUids.push(uid); }
    });
    const eliminatedUid = topUids[Math.floor(Math.random() * topUids.length)];

    const playersSnap = await db.collection('rooms').doc(currentRoomId).collection('players').get();
    const allPlayers = playersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
    const newEliminated = (currentRoom.eliminatedPlayers || []).slice();
    if (newEliminated.indexOf(eliminatedUid) === -1) newEliminated.push(eliminatedUid);
    const remainingCapos = allPlayers.filter(p => p.isCapo && newEliminated.indexOf(p.uid) === -1);
    const remainingInnocents = allPlayers.filter(p => !p.isCapo && newEliminated.indexOf(p.uid) === -1);

    const batch = db.batch();
    votesSnap.forEach(d => batch.delete(d.ref));
    const roomRef = db.collection('rooms').doc(currentRoomId);

    if (remainingCapos.length === 0) {
      // كل الكابوهات اتصيدوا - الأبرياء كسبوا
      batch.update(roomRef, { eliminatedPlayers: newEliminated, capoEliminated: true, votingOpen: false, roundDone: true });
      const winners = allPlayers.filter(p => !p.isCapo && newEliminated.indexOf(p.uid) === -1);
      recordGameWinners(batch, winners);
    } else if (remainingInnocents.length === 0) {
      // كل الأبرياء خرجوا وفضل الكابو/الكابوهات - يكسبوا فوراً من غير ما ننتظر اخر جولة
      batch.update(roomRef, { eliminatedPlayers: newEliminated, capoWon: true, votingOpen: false, roundDone: true });
      recordGameWinners(batch, remainingCapos);
    } else if ((currentRoom.currentRound || 1) >= (currentRoom.totalRounds || 5)) {
      batch.update(roomRef, { eliminatedPlayers: newEliminated, capoWon: true, votingOpen: false, roundDone: true });
      recordGameWinners(batch, remainingCapos);
    } else {
      batch.update(roomRef, {
        eliminatedPlayers: newEliminated,
        currentRound: (currentRoom.currentRound || 1) + 1,
        roundDone: false,
        votingOpen: true,
        clueRevealEndsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + CLUE_SPOTLIGHT_MS)),
        voteEndsAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + CLUE_SPOTLIGHT_MS + VOTE_WINDOW_MS))
      });
    }
    await batch.commit();
  } catch (e) {
    console.error(e);
    showToast('تعذر انهاء الجولة');
  }
}
window.endRoundInRoom = endRoundInRoom;

// يسجّل كل لاعب فايز في مجموعة wins عشان ميزة "أبرز اللاعبين" - بيتنفذ مرة واحدة بس (صاحب الغرفة هو اللي بينده الدالة دي)
function recordGameWinners(batch, winners) {
  const gameId = currentRoom.currentGameId || '';
  const gameName = currentRoom.gameName || '';
  winners.forEach(function(p) {
    const ref = db.collection('wins').doc();
    batch.set(ref, {
      uid: p.uid,
      alias: p.alias || '',
      name: p.name || '',
      gameId: gameId,
      gameName: gameName,
      roomId: currentRoomId,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
}

async function playNextGameInRoom() {
  if (!currentRoom || !currentRoomId || currentRoom.ownerUid !== currentUser.uid) return;
  try {
    const gameIds = currentRoom.gameIds || [];
    let nextIndex = (currentRoom.currentGameIndex || 0) + 1;
    if (nextIndex >= gameIds.length) nextIndex = 0;
    const nextGameId = gameIds[nextIndex];
    const gameDoc = await db.collection('games').doc(nextGameId).get();
    const game = gameDoc.exists ? gameDoc.data() : {};
    const playersSnap = await db.collection('rooms').doc(currentRoomId).collection('players').get();
    const batch = db.batch();
    playersSnap.forEach(d => {
      batch.update(d.ref, {
        characterId: firebase.firestore.FieldValue.delete(),
        characterName: firebase.firestore.FieldValue.delete(),
        characterBio: firebase.firestore.FieldValue.delete(),
        isCapo: firebase.firestore.FieldValue.delete()
      });
    });
    batch.update(db.collection('rooms').doc(currentRoomId), {
      currentGameIndex: nextIndex,
      currentGameId: nextGameId,
      gameName: game.name || '',
      totalRounds: game.rounds || 5,
      status: 'waiting',
      currentRound: 0,
      roundDone: false,
      votingOpen: false,
      eliminatedPlayers: [],
      capoEliminated: false,
      capoWon: false
    });
    await batch.commit();
    ownCharacterRevealed = null;
  } catch (e) { console.error(e); }
}
window.playNextGameInRoom = playNextGameInRoom;

function showCharacterReveal(p) {
  const overlay = document.getElementById('char-reveal-overlay');
  if (!overlay) return;
  document.getElementById('char-reveal-name').textContent = p.characterName || '';
  document.getElementById('char-reveal-bio').textContent = p.characterBio || '';
  const capoTag = document.getElementById('char-reveal-capo-tag');
  capoTag.style.display = p.isCapo ? 'block' : 'none';
  capoTag.classList.toggle('show-tag', !!p.isCapo);
  document.getElementById('char-reveal-game-name').textContent = (currentRoom && currentRoom.gameName) ? currentRoom.gameName : 'CAPO';
  ensureRoomGameLoaded().then(function(game) {
    document.getElementById('char-reveal-mascot').src = (game && game.mascotUrl) ? game.mascotUrl : DEFAULT_MASCOT_URL;
  });
  // نعيد تشغيل الأنيميشن من الاول في كل مرة يتكشف فيها كارت جديد
  const card = document.getElementById('char-reveal-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';
  overlay.classList.add('show');
}
window.closeCharacterReveal = function() {
  const overlay = document.getElementById('char-reveal-overlay');
  if (overlay) overlay.classList.remove('show');
};

function setupRoomListeners() {
  clearRoomListeners();

  // room status
  const unsub1 = db.collection('rooms').doc(currentRoomId).onSnapshot((snap) => {
    if (!snap.exists) { exitRoom(); return; }
    currentRoom = snap.data();
    updateRoomUI();
  });
  roomListeners.push(unsub1);

  // chat
  const chatQ = db.collection('rooms').doc(currentRoomId).collection('chat').orderBy('time', 'asc').limit(200);
  const unsub2 = chatQ.onSnapshot((snap) => {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    snap.forEach(d => {
      const msg = d.data();
      renderChatMsg(msg, container);
    });
    container.scrollTop = container.scrollHeight;
    const chatTab = document.querySelector('.room-tab-content#tab-chat');
    if (!chatTab.classList.contains('active')) {
      document.getElementById('chat-badge').classList.add('show');
    }
  });
  roomListeners.push(unsub2);

  // players
  const unsub3 = db.collection('rooms').doc(currentRoomId).collection('players').onSnapshot((snap) => {
    renderPlayers(snap);
    renderWaitingPlayers(snap);
    lastPlayersArr = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    buildVoteCandidates(lastPlayersArr);
    const count = snap.size;
    document.getElementById('waiting-players-count').textContent = count + ' لاعبين في الغرفة';
  });
  roomListeners.push(unsub3);

  // votes
  const unsub4 = db.collection('rooms').doc(currentRoomId).collection('votes').onSnapshot((snap) => {
    renderVotes(snap);
  });
  roomListeners.push(unsub4);

  // own character reveal + own ready state + kick detection (private, only this player sees it)
  const unsub5 = db.collection('rooms').doc(currentRoomId).collection('players').doc(currentUser.uid).onSnapshot((snap) => {
    if (!snap.exists) {
      // الدوكيومنت بتاعنا اتمسح وإحنا لسه في الغرفة (مش إحنا اللي عملنا exitRoom) = صاحب الغرفة طردنا
      if (currentRoomId && !isSpectator) {
        showToast('تم إخراجك من الغرفة');
        exitRoom();
      }
      return;
    }
    const p = snap.data();
    ownReady = !!p.ready;
    ownIsCapo = !!p.isCapo;
    updateReadyButtonUI();
    if (p.characterId && p.characterId !== ownCharacterRevealed) {
      ownCharacterRevealed = p.characterId;
      showCharacterReveal(p);
    }
  });
  roomListeners.push(unsub5);
}

function clearRoomListeners() {
  roomListeners.forEach(u => u());
  roomListeners = [];
}

function updateRoomUI() {
  if (!currentRoom) return;
  const status = currentRoom.status;
  const round = currentRoom.currentRound || 0;
  const totalRounds = currentRoom.totalRounds || 5;

  // round indicator
  if (round > 0) {
    document.getElementById('round-display').textContent = 'الجولة ' + round + ' من ' + totalRounds;
    buildRoundDots(round, totalRounds, currentRoom.roundDone);
  }

  if (status === 'waiting') {
    document.getElementById('waiting-screen').style.display = 'flex';
    document.getElementById('active-game-area').style.display = 'none';
    document.getElementById('game-ended-screen').classList.remove('show');
    hideCaseStoryScreen();
    hideClueSpotlight();
    stopVoteCountdown();
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) startBtn.style.display = (currentRoom.ownerUid === currentUser.uid) ? 'block' : 'none';
    updateReadyButtonUI();
    updateRoomLockUI();
  } else if (status === 'active') {
    document.getElementById('waiting-screen').style.display = 'none';
    document.getElementById('active-game-area').style.display = 'flex';
    document.getElementById('game-ended-screen').classList.remove('show');
    loadClues(round);
    buildVoteCandidates(lastPlayersArr);
    const endRoundBtn = document.getElementById('btn-end-round-owner');
    if (endRoundBtn) endRoundBtn.style.display = (currentRoom.ownerUid === currentUser.uid) ? 'block' : 'none';
    if (currentRoom.votingOpen) {
      document.getElementById('vote-badge').classList.add('show');
      document.getElementById('vote-round-info').textContent = 'صوت على من تعتقد انه كابو - جولة ' + round;
      startVoteCountdown(currentRoom.voteEndsAt);
    } else {
      document.getElementById('vote-badge').classList.remove('show');
      stopVoteCountdown();
    }
    // قصة القضية (60 ثانية) ثم دليل الجولة (60 ثانية) - شاشات تغطي المحتوى لحد ما تخلص
    checkRoundOverlays();
  } else if (status === 'ended') {
    showGameEnded();
  } else if (status === 'deleted') {
    clearRoomListeners();
    exitRoom();
    showToast('تم انهاء الغرفة من قبل الادمن');
  }

  // check if current user is eliminated
  if (currentRoom.eliminatedPlayers && currentRoom.eliminatedPlayers.includes(currentUser.uid)) {
    if (!isEliminated && !isSpectator) {
      isEliminated = true;
      document.getElementById('eliminated-overlay').classList.add('show');
    }
    document.getElementById('spectator-bar').classList.add('show');
    document.getElementById('chat-input').disabled = true;
    document.getElementById('btn-submit-vote').disabled = true;
  }

  // check if capo was eliminated (game over early)
  if (currentRoom.capoEliminated) {
    showGameEnded();
  }
  // check if capo(s) survived to the last round
  if (currentRoom.capoWon) {
    showGameEnded();
  }
}

// ===== CASE STORY REVEAL (60s, shown to everyone once per game start) =====
function checkRoundOverlays() {
  if (!currentRoom || currentRoom.status !== 'active') { hideCaseStoryScreen(); hideClueSpotlight(); return; }
  const now = Date.now();
  const storyEndsAt = currentRoom.storyEndsAt ? currentRoom.storyEndsAt.toMillis() : 0;
  if (currentRoom.caseStory && storyEndsAt > now) {
    showCaseStoryScreen(currentRoom.caseStory, storyEndsAt);
    hideClueSpotlight();
    return;
  }
  hideCaseStoryScreen();

  const clueEndsAt = currentRoom.clueRevealEndsAt ? currentRoom.clueRevealEndsAt.toMillis() : 0;
  if (clueEndsAt > now) {
    showClueSpotlight(currentRoom.currentRound || 1, clueEndsAt);
  } else {
    hideClueSpotlight();
  }
}

function showCaseStoryScreen(storyText, endsAtMs) {
  const screen = document.getElementById('case-story-screen');
  if (!screen) return;
  const isNew = caseStoryEndsAtCache !== endsAtMs;
  caseStoryEndsAtCache = endsAtMs;
  screen.classList.add('show');
  if (isNew) {
    document.getElementById('case-story-text').textContent = storyText || 'لا يوجد وصف لهذه القضية';
  }
  clearInterval(caseStoryTimerId);
  const ring = document.getElementById('case-story-ring');
  const circumference = 2 * Math.PI * 38;
  ring.style.strokeDasharray = circumference;
  function tick() {
    const remainMs = endsAtMs - Date.now();
    const remainSec = Math.max(0, Math.ceil(remainMs / 1000));
    document.getElementById('case-story-seconds').textContent = remainSec;
    const progress = Math.max(0, Math.min(1, remainMs / STORY_REVEAL_MS));
    ring.style.strokeDashoffset = circumference * (1 - progress);
    if (remainMs <= 0) {
      clearInterval(caseStoryTimerId);
      hideCaseStoryScreen();
      checkRoundOverlays();
    }
  }
  tick();
  caseStoryTimerId = setInterval(tick, 250);
}

function hideCaseStoryScreen() {
  const screen = document.getElementById('case-story-screen');
  if (screen) screen.classList.remove('show');
  clearInterval(caseStoryTimerId);
  caseStoryTimerId = null;
  caseStoryEndsAtCache = null;
}

// ===== ROUND CLUE SPOTLIGHT (60s, once per round) =====
function showClueSpotlight(round, endsAtMs) {
  const screen = document.getElementById('clue-spotlight-screen');
  if (!screen) return;
  const key = round + '_' + endsAtMs;
  const isNew = clueSpotlightKeyShown !== key;
  clueSpotlightKeyShown = key;
  screen.classList.add('show');
  document.getElementById('spotlight-round-label').textContent = 'دليل الجولة ' + round;

  if (isNew) {
    document.getElementById('spotlight-clues-wrap').innerHTML = '<div style="padding:10px;"><div class="spinner"></div></div>';
    ensureRoomGameLoaded().then(function(game) {
      const clues = ((game && game.clues) || []).filter(function(c) { return (c.round || 1) === round; });
      const wrap = document.getElementById('spotlight-clues-wrap');
      if (!clues.length) {
        wrap.innerHTML = '<div class="spotlight-clue-card"><div class="spotlight-clue-text">لا يوجد دليل مخصص لهذه الجولة</div></div>';
        return;
      }
      wrap.innerHTML = clues.map(function(c) {
        let media = '';
        if (c.imageUrl) media = '<img class="clue-media-img" style="margin-top:10px;" src="' + c.imageUrl + '" alt="" draggable="false" oncontextmenu="return false">';
        else if (c.videoUrl) media = '<div style="margin-top:10px;">' + buildClueVideoFrame(c.videoUrl) + '</div>';
        return '<div class="spotlight-clue-card">'
          + '<div class="spotlight-clue-title">' + escapeHtml(c.title || 'دليل') + '</div>'
          + (c.text ? '<div class="spotlight-clue-text">' + escapeHtml(c.text) + '</div>' : '')
          + media
          + '</div>';
      }).join('');
    });
  }

  clearInterval(clueSpotlightTimerId);
  const ring = document.getElementById('spotlight-ring');
  const circumference = 2 * Math.PI * 30;
  ring.style.strokeDasharray = circumference;
  function tick() {
    const remainMs = endsAtMs - Date.now();
    const remainSec = Math.max(0, Math.ceil(remainMs / 1000));
    document.getElementById('spotlight-seconds').textContent = remainSec;
    const progress = Math.max(0, Math.min(1, remainMs / CLUE_SPOTLIGHT_MS));
    ring.style.strokeDashoffset = circumference * (1 - progress);
    if (remainMs <= 0) {
      clearInterval(clueSpotlightTimerId);
      hideClueSpotlight();
    }
  }
  tick();
  clueSpotlightTimerId = setInterval(tick, 250);
}

function hideClueSpotlight() {
  const screen = document.getElementById('clue-spotlight-screen');
  if (screen) screen.classList.remove('show');
  clearInterval(clueSpotlightTimerId);
  clueSpotlightTimerId = null;
}

// ===== VOTE COUNTDOWN =====
function startVoteCountdown(voteEndsAtTs) {
  const el = document.getElementById('vote-timer');
  if (!el) return;
  if (!voteEndsAtTs) { stopVoteCountdown(); return; }
  const endsAtMs = voteEndsAtTs.toMillis ? voteEndsAtTs.toMillis() : voteEndsAtTs;
  clearInterval(voteCountdownInterval);
  el.style.display = 'block';
  function tick() {
    const remainSec = Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000));
    const mm = Math.floor(remainSec / 60);
    const ss = remainSec % 60;
    el.textContent = mm + ':' + String(ss).padStart(2, '0');
    el.classList.toggle('urgent', remainSec > 0 && remainSec <= 15);
    if (remainSec <= 0) clearInterval(voteCountdownInterval);
  }
  tick();
  voteCountdownInterval = setInterval(tick, 1000);
}
function stopVoteCountdown() {
  clearInterval(voteCountdownInterval);
  voteCountdownInterval = null;
  const el = document.getElementById('vote-timer');
  if (el) el.style.display = 'none';
}

// ===== READY-UP (waiting room feature) =====
async function toggleReady() {
  if (!currentRoomId || !currentUser || isSpectator) return;
  try {
    await db.collection('rooms').doc(currentRoomId).collection('players').doc(currentUser.uid).update({ ready: !ownReady });
  } catch (e) { showToast('تعذر تحديث حالة الاستعداد'); }
}
function updateReadyButtonUI() {
  const btn = document.getElementById('btn-ready-toggle');
  if (!btn) return;
  if (isSpectator) { btn.style.display = 'none'; return; }
  btn.style.display = 'inline-block';
  btn.classList.toggle('is-ready', ownReady);
  btn.textContent = ownReady ? '✓ جاهز' : 'لست جاهزاً - اضغط للتجهيز';
}

function renderWaitingPlayers(snap) {
  const list = document.getElementById('waiting-players-list');
  if (!list) return;
  const isOwner = currentRoom && currentUser && currentRoom.ownerUid === currentUser.uid;
  let html = '';
  let readyCount = 0;
  const total = snap.size;
  snap.forEach(function(d) {
    const p = d.data();
    if (p.ready) readyCount++;
    html += '<div class="waiting-player-row">'
      + '<div class="wp-ready-dot' + (p.ready ? ' ready' : '') + '"></div>'
      + '<div class="wp-alias">' + escapeHtml(p.alias || p.name || 'لاعب') + '</div>'
      + (isOwner && d.id !== currentUser.uid ? '<button class="wp-kick-btn" onclick="kickPlayerFromRoom(\'' + d.id + '\')">طرد</button>' : '')
      + '</div>';
  });
  list.innerHTML = html;
  const countEl = document.getElementById('waiting-players-count');
  if (countEl) countEl.textContent = total + ' لاعبين في الغرفة (' + readyCount + ' جاهزين)';
}

async function kickPlayerFromRoom(uid) {
  if (!currentRoom || !currentUser || currentRoom.ownerUid !== currentUser.uid) return;
  if (currentRoom.status !== 'waiting') { showToast('التاعب مينفعش غير قبل بدء اللعبة'); return; }
  try {
    await db.collection('rooms').doc(currentRoomId).collection('players').doc(uid).delete();
    showToast('تم طرد اللاعب');
  } catch (e) { showToast('تعذر طرد اللاعب'); }
}

// ===== ROOM LOCK (owner-only, blocks new joins) =====
async function toggleRoomLock() {
  if (!currentRoom || !currentUser || currentRoom.ownerUid !== currentUser.uid || !currentRoomId) return;
  try {
    await db.collection('rooms').doc(currentRoomId).update({ locked: !currentRoom.locked });
  } catch (e) { showToast('تعذر تحديث حالة القفل'); }
}
function updateRoomLockUI() {
  const el = document.getElementById('room-lock-toggle');
  if (!el) return;
  const isOwner = currentRoom && currentUser && currentRoom.ownerUid === currentUser.uid;
  if (!isOwner) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.classList.toggle('is-locked', !!currentRoom.locked);
  document.getElementById('room-lock-label').textContent = currentRoom.locked ? 'الغرفة مقفولة' : 'الغرفة مفتوحة';
}

function buildRoundDots(current, total, done) {
  const container = document.getElementById('round-dots');
  container.innerHTML = '';
  for (let i = 1; i <= total; i++) {
    const d = document.createElement('div');
    d.className = 'round-dot' + (i < current ? ' done' : i === current ? ' current' : '');
    container.appendChild(d);
  }
}

function renderChatMsg(msg, container) {
  const isMe = msg.uid === currentUser.uid;
  const isSystem = msg.type === 'system';
  const div = document.createElement('div');
  div.className = 'chat-msg' + (isSystem ? ' system' : isMe ? ' mine' : ' other');
  if (!isSystem) {
    div.innerHTML = '<div class="chat-msg-sender">' + (msg.alias || '') + '</div>'
      + '<div>' + escapeHtml(msg.text || '') + '</div>'
      + '<div class="chat-msg-time">' + formatTime(msg.time) + '</div>';
  } else {
    div.textContent = msg.text || '';
  }
  container.appendChild(div);
}

async function sendChat() {
  if (isEliminated && !isSpectator) return;
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !currentRoomId) return;
  input.value = '';
  await db.collection('rooms').doc(currentRoomId).collection('chat').add({
    uid: currentUser.uid,
    alias: currentUserData.alias || 'PLAYER',
    text: text,
    time: firebase.firestore.FieldValue.serverTimestamp(),
    type: 'user'
  });
}

// الأدلة كانت بتتقرا من rooms/{roomId}/clues وهي subcollection فاضية دايماً - مفيش حاجة بتكتب فيها
// الأدلة الحقيقية مخزنة جوه games/{gameId}.clues (اللي لوحة التحكم بتحفظها) - فده كان سبب "الأدلة مش بتظهر"
async function ensureRoomGameLoaded() {
  if (!currentRoom || !currentRoom.currentGameId) return null;
  if (currentRoomGameCache && currentRoomGameCache.id === currentRoom.currentGameId) return currentRoomGameCache.data;
  try {
    const doc = await db.collection('games').doc(currentRoom.currentGameId).get();
    currentRoomGameCache = { id: currentRoom.currentGameId, data: doc.exists ? doc.data() : {} };
  } catch (e) {
    currentRoomGameCache = { id: currentRoom.currentGameId, data: {} };
  }
  return currentRoomGameCache.data;
}

async function loadClues(round) {
  const container = document.getElementById('clues-list');
  container.innerHTML = '<div style="padding:20px;text-align:center;"><div class="spinner"></div></div>';
  try {
    const game = await ensureRoomGameLoaded();
    const allClues = (game && game.clues) || [];
    const visible = allClues.filter(c => (c.round || 1) <= round).sort((a, b) => (a.round || 1) - (b.round || 1));
    container.innerHTML = '';
    if (!visible.length) {
      container.innerHTML = '<div class="clue-locked">ادلة هذه الجولة لم تُكشف بعد</div>';
      return;
    }
    visible.forEach((clue, i) => { container.innerHTML += buildClueCard(clue, i + 1); });
    document.getElementById('clues-badge').classList.add('show');
  } catch (e) { console.error(e); container.innerHTML = '<div class="clue-locked">تعذر تحميل الادلة</div>'; }
}

let clueVideoUid = 0;
// اطار الفيديو السينمائي المخصص بتصميم التطبيق (زوايا ذهبية + شارة REC + زر تشغيل مركزي)
function buildClueVideoFrame(videoUrl) {
  const vid = 'clue-vid-' + (clueVideoUid++);
  return '<div class="clue-video-frame">'
    + '<div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>'
    + '<div class="clue-video-tag"><span class="rec-dot"></span>REC</div>'
    + '<video class="clue-media-video" id="' + vid + '" src="' + videoUrl + '" playsinline controls controlslist="nodownload" oncontextmenu="return false"'
    + ' onplay="this.parentElement.querySelector(\'.clue-video-play-overlay\').classList.add(\'hidden\')"'
    + ' onpause="this.parentElement.querySelector(\'.clue-video-play-overlay\').classList.remove(\'hidden\')"></video>'
    + '<div class="clue-video-play-overlay" onclick="document.getElementById(\'' + vid + '\').play()">'
    + '<div class="clue-video-play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>'
    + '</div>'
    + '</div>';
}

function buildClueCard(clue, idx) {
  let mediaHtml = '';
  if (clue.imageUrl) {
    mediaHtml = '<img class="clue-media-img" src="' + clue.imageUrl + '" alt="" draggable="false" oncontextmenu="return false">';
  } else if (clue.videoUrl) {
    mediaHtml = buildClueVideoFrame(clue.videoUrl);
  }
  return '<div class="clue-card">'
    + '<div class="clue-card-head">'
    + '<div class="clue-number">' + idx + '</div>'
    + '<div class="clue-title">' + escapeHtml(clue.title || 'دليل') + '</div>'
    + '<div class="clue-round-tag">جولة ' + (clue.round || '?') + '</div>'
    + '</div>'
    + '<div class="clue-body">'
    + (clue.text ? '<div class="clue-text">' + escapeHtml(clue.text) + '</div>' : '')
    + mediaHtml
    + '</div></div>';
}

function renderPlayers(snap) {
  const container = document.getElementById('players-list');
  container.innerHTML = '';
  snap.forEach(d => {
    const p = d.data();
    const eliminated = (currentRoom && currentRoom.eliminatedPlayers && currentRoom.eliminatedPlayers.includes(p.uid));
    const isMe = p.uid === currentUser.uid;
    container.innerHTML += '<div class="player-item" onclick="openPlayerCard(\'' + p.uid + '\',\'' + escapeHtml(p.alias || '') + '\',\'' + escapeHtml(p.name || '') + '\',\'' + escapeHtml(p.bio || '') + '\')">'
      + '<div class="player-avatar">'
      + '<img class="player-avatar-logo" src="https://i.ibb.co/NdHgx21b/logo.png" alt="" draggable="false" oncontextmenu="return false">'
      + '</div>'
      + '<div>'
      + '<div class="player-name">' + escapeHtml(p.name || 'لاعب') + (isMe ? ' <span style="font-size:0.7rem;color:var(--accent-gold-dim)">(انت)</span>' : '') + '</div>'
      + '<div class="player-alias">' + escapeHtml(p.alias || '') + '</div>'
      + '</div>'
      + '<div class="player-status ' + (eliminated ? 'status-eliminated' : 'status-active') + '">'
      + (eliminated ? 'خرج' : 'نشط')
      + '</div>'
      + '</div>';
  });
}

function renderVotes(snap) {
  if (!currentRoom || !currentRoom.votingOpen) return;
  const voteCounts = {};
  const voterMap = {};
  snap.forEach(d => {
    const v = d.data();
    voteCounts[v.targetUid] = (voteCounts[v.targetUid] || 0) + 1;
    if (!voterMap[v.targetUid]) voterMap[v.targetUid] = [];
    voterMap[v.targetUid].push(v.voterAlias || '?');
  });

  // update vote display
  document.querySelectorAll('.vote-candidate').forEach(el => {
    const uid = el.dataset.uid;
    const countEl = el.querySelector('.vote-cand-count');
    const votersEl = el.querySelector('.vote-cand-voters');
    if (countEl) countEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ' + (voteCounts[uid] || 0);
    if (votersEl && voterMap[uid]) votersEl.textContent = 'صوت: ' + voterMap[uid].join(', ');
  });
}

function selectVote(uid) {
  // كان الشرط بيمنع التصويت للمقصيين اللي مش في وضع المشاهدة فقط، وده كان بيسمح
  // (1) للاعب المقصي اللي دخل وضع المشاهدة انه يصوت برضو، و(2) لأي حد بيتفرج على غرفة مش لاعب فيها
  // إنه يصوت. اتصلحت هنا عشان "ميعرفش يتحكم أو يلعب" فعلاً تنطبق على كل مشاهد وكل مقصي
  if (isEliminated || isSpectator) return;
  if (!currentRoom || !currentRoom.votingOpen) return;
  selectedVote = uid;
  document.querySelectorAll('.vote-candidate').forEach(el => {
    el.classList.toggle('selected', el.dataset.uid === uid);
  });
  document.getElementById('btn-submit-vote').disabled = false;
}
window.selectVote = selectVote;

async function submitVote() {
  if (!selectedVote || !currentRoomId) return;
  try {
    await db.collection('rooms').doc(currentRoomId).collection('votes').doc(currentUser.uid).set({
      voterUid: currentUser.uid,
      voterAlias: currentUserData.alias || 'PLAYER',
      targetUid: selectedVote,
      round: currentRoom.currentRound || 1,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
    votedRound = currentRoom.currentRound || 1;
    document.getElementById('btn-submit-vote').disabled = true;
    document.getElementById('btn-submit-vote').textContent = 'تم التصويت';
    showToast('تم تسجيل تصويتك');
  } catch (e) { showToast('فشل التصويت'); }
}

function buildVoteCandidates(players) {
  if (!currentUser) return;
  const container = document.getElementById('vote-candidates');
  if (!container) return;
  container.innerHTML = '';
  players.forEach(p => {
    if (p.uid === currentUser.uid) return; // cant vote for self
    const eliminated = currentRoom && currentRoom.eliminatedPlayers && currentRoom.eliminatedPlayers.includes(p.uid);
    if (eliminated) return;
    const div = document.createElement('div');
    div.className = 'vote-candidate';
    div.dataset.uid = p.uid;
    div.onclick = function() { selectVote(p.uid); };
    div.innerHTML = '<div class="vote-check"><div class="vote-check-inner"></div></div>'
      + '<div><div class="vote-cand-name">' + escapeHtml(p.name || 'لاعب') + '<span class="vote-cand-alias">' + escapeHtml(p.alias || '') + '</span></div>'
      + '<div class="vote-cand-voters"></div>'
      + '</div>'
      + '<div class="vote-cand-count"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 0</div>';
    container.appendChild(div);
  });

  // اعادة ضبط زر التصويت حسب الجولة الحالية: لو صوّت فيها خليه معطل بـ"تم التصويت"، غير كده رجّعه لوضعه الافتراضي
  const submitBtn = document.getElementById('btn-submit-vote');
  const round = currentRoom ? (currentRoom.currentRound || 1) : 1;
  if (submitBtn) {
    if (votedRound === round) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'تم التصويت';
    } else {
      selectedVote = null;
      submitBtn.disabled = true;
      submitBtn.textContent = 'ارسل تصويتك';
    }
  }
}

function showGameEnded() {
  const capoWon = currentRoom && currentRoom.capoWon;
  const resultIcon = document.getElementById('result-icon');
  const resultTitle = document.getElementById('result-title');
  const resultSub = document.getElementById('result-sub');
  const resultMascot = document.getElementById('result-mascot');
  resultTitle.classList.remove('lose-shake');
  resultMascot.style.display = 'none';

  // "فريقك" فاز ولا لأ - بناءً على هل انت كابو ولا لأ (مش بس هل نجيت من الاقصاء)
  const iAmSpectatorLike = isSpectator;
  const iWon = capoWon ? ownIsCapo : !ownIsCapo;

  if (iAmSpectatorLike) {
    resultIcon.className = 'game-result-icon';
    resultIcon.innerHTML = '<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>';
    resultTitle.textContent = 'انتهت اللعبة';
    resultTitle.style.color = 'var(--accent-gold)';
    resultSub.textContent = capoWon ? 'نجح كابو في الاختباء حتى النهاية' : 'تم كشف كابو واعتقاله';
  } else if (iWon) {
    resultIcon.className = 'game-result-icon result-win';
    resultIcon.innerHTML = '<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    resultTitle.textContent = 'مبروك! ربحت';
    resultTitle.style.color = '#7ecba4';
    resultSub.textContent = capoWon ? 'نجحت تختبي من الكل لحد النهاية - انت كابو محترف' : 'كشفت كابو وأنقذت الكل - شغل محقق حقيقي';
  } else {
    resultIcon.className = 'game-result-icon result-lose';
    resultIcon.innerHTML = '<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    resultTitle.textContent = 'ضـــاع حقي';
    resultTitle.style.color = 'var(--accent-red-bright)';
    resultTitle.classList.add('lose-shake');
    resultSub.textContent = capoWon ? 'كابو ختلكم كلكم لحد النهاية' : 'اتكشفت... المرة الجاية بقى شاطر';
    resultMascot.src = DEFAULT_MASCOT_URL;
    resultMascot.style.display = 'block';
  }

  document.getElementById('waiting-screen').style.display = 'none';
  document.getElementById('active-game-area').style.display = 'none';
  document.getElementById('game-ended-screen').classList.add('show');
}

// يطلّع اللاعب برا الغرفة تمامًا عشان يختار لعبة تانية من الاول (مش نفس قائمة العاب الغرفة دي)
function playDifferentGame() {
  document.getElementById('game-ended-screen').classList.remove('show');
  exitRoom();
  navigateTo('home');
}
window.playDifferentGame = playDifferentGame;

function goSpectator() {
  isSpectator = true;
  document.getElementById('eliminated-overlay').classList.remove('show');
  document.getElementById('spectator-bar').classList.add('show');
}

async function exitRoom() {
  const isOwnerLeaving = currentRoom && currentUser && currentRoom.ownerUid === currentUser.uid && currentRoom.status !== 'deleted';
  if (isOwnerLeaving) {
    const closeIt = confirm('انت صاحب الغرفة. تحب تقفل الغرفة للجميع قبل ما تخرج؟\n(اضغط "الغاء" لو عايز تسيب الغرفة مفتوحة للباقيين)');
    if (closeIt) {
      try { await db.collection('rooms').doc(currentRoomId).update({ status: 'deleted' }); } catch (e) {}
    }
  }
  clearRoomListeners();
  resetRoomFeatureState();
  if (currentRoomId && currentUser) {
    try {
      await db.collection('rooms').doc(currentRoomId).collection('players').doc(currentUser.uid).delete();
    } catch (e) {}
  }
  currentRoom = null;
  currentRoomId = null;
  isEliminated = false;
  isSpectator = false;
  document.getElementById('bottom-nav').classList.add('visible');
  document.getElementById('eliminated-overlay').classList.remove('show');
  document.getElementById('spectator-bar').classList.remove('show');
  document.getElementById('game-ended-screen').classList.remove('show');
  document.getElementById('waiting-screen').style.display = 'flex';
  document.getElementById('active-game-area').style.display = 'none';
  navigateTo('home');
}

function playAgain() {
  document.getElementById('game-ended-screen').classList.remove('show');
  document.getElementById('waiting-screen').style.display = 'flex';
  document.getElementById('active-game-area').style.display = 'none';
  selectedVote = null;
  isEliminated = false;
  isSpectator = false;
  document.getElementById('spectator-bar').classList.remove('show');
  document.getElementById('chat-input').disabled = false;
  // لو صاحب الغرفة، جهّز اللعبة التالية في نفس الغرفة (أو أعد نفس اللعبة لو مفيش ألعاب تانية)
  if (currentRoom && currentUser && currentRoom.ownerUid === currentUser.uid) {
    playNextGameInRoom();
  }
}

// ===== ROOM TABS =====
function switchRoomTab(id, el) {
  document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.room-tab-content').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('tab-' + id).classList.add('active');
  if (id === 'chat') document.getElementById('chat-badge').classList.remove('show');
  if (id === 'clues') document.getElementById('clues-badge').classList.remove('show');
  if (id === 'vote') document.getElementById('vote-badge').classList.remove('show');
}

// ===== PLAYER CARD =====
function openPlayerCard(uid, alias, name, bio) {
  document.getElementById('modal-alias').textContent = alias.toUpperCase();
  document.getElementById('modal-name').textContent = name;
  document.getElementById('modal-bio').textContent = bio || 'لا توجد نبذة';
  document.getElementById('player-card-modal').classList.add('show');
}
function closePlayerCard(e) {
  if (!e || e.target === document.getElementById('player-card-modal')) {
    document.getElementById('player-card-modal').classList.remove('show');
  }
}

// ===== SHARE ROOM =====
function copyRoomCode() {
  if (!currentRoom) return;
  navigator.clipboard.writeText(currentRoom.code || '').then(() => showToast('تم نسخ الكود'));
}
function shareRoomLink() {
  if (!currentRoom) return;
  const url = window.location.origin + window.location.pathname + '?room=' + (currentRoom.code || '');
  if (navigator.share) {
    navigator.share({ title: 'انضم لغرفة Capo', text: 'انضم معي في لعبة التحقيق', url: url });
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('تم نسخ رابط الغرفة'));
  }
}

// ===== NOTIFICATIONS =====
async function loadNotifications() {
  try {
    const snap = await db.collection('notifications')
      .where('targetAll', '==', true)
      .orderBy('time', 'desc')
      .limit(20)
      .get();
    const container = document.getElementById('notifications-list');
    const previewContainer = document.getElementById('home-notifs-preview');
    container.innerHTML = '';
    previewContainer.innerHTML = '';
    let unread = false;
    snap.forEach(d => {
      const n = d.data();
      const read = (currentUserData && currentUserData.readNotifs && currentUserData.readNotifs.includes(d.id));
      if (!read) unread = true;
      const item = '<div class="notif-item"><div class="notif-dot' + (read ? ' read' : '') + '"></div><div><div class="notif-text">' + escapeHtml(n.text || '') + '</div><div class="notif-time">' + formatTime(n.time) + '</div></div></div>';
      container.innerHTML += item;
    });
    if (snap.size === 0) container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.82rem;">لا توجد اشعارات</div>';
    if (unread) document.getElementById('notif-badge-nav').classList.add('show');
    // preview first 2
    const items = container.querySelectorAll('.notif-item');
    for (let i = 0; i < Math.min(2, items.length); i++) {
      previewContainer.appendChild(items[i].cloneNode(true));
    }
    if (snap.size === 0) previewContainer.innerHTML = '<div style="padding:10px 0;color:var(--text-muted);font-size:0.8rem;">لا توجد اشعارات حديثة</div>';
  } catch (e) { console.error(e); }
}

// ===== TOP PLAYERS / HALL OF FAME =====
async function loadTopPlayers() {
  const container = document.getElementById('top-players-list');
  if (!container) return;
  container.innerHTML = '<div style="padding:20px;text-align:center;"><div class="spinner"></div></div>';
  try {
    const snap = await db.collection('wins').orderBy('time', 'desc').limit(500).get();
    const byUid = {};
    snap.forEach(function(d) {
      const w = d.data();
      if (!byUid[w.uid]) byUid[w.uid] = { uid: w.uid, alias: w.alias, name: w.name, wins: [] };
      byUid[w.uid].wins.push({ gameName: w.gameName, time: w.time });
    });
    const topPlayers = Object.values(byUid)
      .filter(function(p) { return p.wins.length > 3; })
      .sort(function(a, b) { return b.wins.length - a.wins.length; });
    if (!topPlayers.length) {
      container.innerHTML = '<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:0.85rem;">لسه محدش فاز في أكتر من 3 العاب</div>';
      return;
    }
    container.innerHTML = topPlayers.map(buildTopPlayerCard).join('');
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">تعذر تحميل قائمة الابطال</div>';
  }
}
window.loadTopPlayers = loadTopPlayers;

function buildTopPlayerCard(p) {
  const winsHtml = p.wins.slice(0, 10).map(function(w) {
    let dateStr = '';
    if (w.time && w.time.toDate) {
      const d = w.time.toDate();
      dateStr = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    }
    return '<div class="top-player-win-row"><span class="tpw-game">' + escapeHtml(w.gameName || 'لعبة') + '</span><span class="tpw-date">' + dateStr + '</span></div>';
  }).join('');
  return '<div class="top-player-card">'
    + '<div class="top-player-head">'
    + '<div class="top-player-avatar"><img src="https://i.ibb.co/NdHgx21b/logo.png" alt=""></div>'
    + '<div><div class="top-player-alias">' + escapeHtml(p.alias || p.name || 'لاعب') + '</div>'
    + '<div class="top-player-name">' + escapeHtml(p.name || '') + '</div></div>'
    + '<div class="top-player-count">' + p.wins.length + ' فوز</div>'
    + '</div>'
    + '<div class="top-player-wins">' + winsHtml + '</div>'
    + '</div>';
}

// ===== RATING =====
function selectStar(n) {
  currentRating = n;
  document.querySelectorAll('#stars-row .star-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i < n);
  });
}
async function submitRating() {
  if (!currentRating) { showToast('اختر عدد النجوم'); return; }
  const comment = document.getElementById('rating-comment').value.trim();
  try {
    await db.collection('ratings').add({
      uid: currentUser.uid,
      alias: currentUserData ? currentUserData.alias : '',
      rating: currentRating,
      comment: comment,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('شكراً على تقييمك');
    document.getElementById('rating-comment').value = '';
    currentRating = 0;
    document.querySelectorAll('#stars-row .star-btn').forEach(b => b.classList.remove('active'));
  } catch (e) { showToast('فشل ارسال التقييم'); }
}

// تقييم لعبة بعينها (النجوم اللي في شاشة تفاصيل اللعبة) - منفصل عن تقييم التطبيق العام فوق
function selectDetailStar(n) {
  currentDetailRating = n;
  document.querySelectorAll('#detail-stars-row .star-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i < n);
  });
}
window.selectDetailStar = selectDetailStar;

async function submitGameRating() {
  if (!currentDetailRating) { showToast('اختر عدد النجوم'); return; }
  if (!selectedGameId) return;
  const comment = document.getElementById('detail-rating-comment').value.trim();
  try {
    await db.collection('ratings').add({
      uid: currentUser.uid,
      alias: currentUserData ? currentUserData.alias : '',
      gameId: selectedGameId,
      rating: currentDetailRating,
      comment: comment,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });
    // نجمع متوسط تقييم اللعبة على نفس مستند اللعبة (ratingSum/ratingCount) عشان يظهر فوراً على الكارت والتفاصيل من غير كويريز اضافية
    await db.collection('games').doc(selectedGameId).update({
      ratingSum: firebase.firestore.FieldValue.increment(currentDetailRating),
      ratingCount: firebase.firestore.FieldValue.increment(1)
    });
    showToast('شكراً على تقييمك للعبة');
    document.getElementById('detail-rating-comment').value = '';
    currentDetailRating = 0;
    document.querySelectorAll('#detail-stars-row .star-btn').forEach(b => b.classList.remove('active'));
    // حدّث الملخص المعروض فوراً محلياً من غير ما نستنى قراءة تانية من السيرفر
    if (currentGameData && currentGameData.id === selectedGameId) {
      currentGameData.ratingSum = (currentGameData.ratingSum || 0) + currentDetailRating;
      currentGameData.ratingCount = (currentGameData.ratingCount || 0) + 1;
      const avg = currentGameData.ratingSum / currentGameData.ratingCount;
      document.getElementById('detail-rating-summary').innerHTML = buildStaticStars(avg)
        + '<span class="drs-count">' + avg.toFixed(1) + ' (' + currentGameData.ratingCount + ' تقييم) - اتلعبت ' + (currentGameData.playsCount || 0) + ' مرة</span>';
    }
  } catch (e) { showToast('فشل ارسال التقييم'); }
}
window.submitGameRating = submitGameRating;

// ===== UTILS =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

// ===== ANTI-COPY =====
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && ['s','p','c','u'].includes(e.key.toLowerCase())) e.preventDefault();
});

