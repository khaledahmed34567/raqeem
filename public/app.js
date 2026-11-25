const GOV = "الدقهلية";
const MK = [
  "المنصورة", "طلخا", "ميت غمر", "دكرنس", "أجا", "السنبلاوين",
  "المنزلة", "بلقاس", "شربين", "المطرية", "بني عبيد", "تمي الأمديد",
  "ميت سلسيل", "الجمالية", "منية النصر", "نبروه", "محلة دمنة", "جمصة"
];
const IPS = [
  "https://ipn.eg/S/khaleda.abdelarazek/instapay/3TZ1Js",
  "https://ipn.eg/S/khaledahmedelbrbary/instapay/3kazGV",
  "https://ipn.eg/S/khaledahmedabdelrazik/instapay/5P4ogR"
];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

const T = {
  ar: {
    home: "الرئيسية", shop: "المتجر", track: "تتبع الطلب", help: "الأسئلة والدعم",
    faq: "الأسئلة الشائعة", support: "الدعم الفني",
    hk: "متجر رقيم لملحقات اللابتوب",
    h1: "ملحقات اللابتوب الأساسية", h2: "بوضوح كامل وتوصيل سريع.",
    hp: "شواحن GaN، حقائب مقاومة للماء، كيبوردات ميكانيكية، ومحولات USB-C أصلية بأسعار شفافة وضمان حقيقي حتى باب منزلك.",
    shopn: "تصفح المنتجات", m1: "توصيل داخل الدقهلية", m2: "شحن مجاني من 5 قطع", m3: "دفع إلكتروني وفاتورة QR",
    shop_sub: "اختر القسم أو ابحث عن الملحق المناسب لجهازك، مع خصومات فورية وكود خصم RAQEEM10.",
    faq_sub: "إجابات واضحة حول الطلب، التوصيل، ومراجعة الدفع.",
    sup_sub: "هل لديك استفسار عن منتج أو طلب؟ أرسل رسالتك أو تواصل معنا مباشرة.",
    search: "ابحث عن منتج...", all: "الكل", add: "أضف للسلة", cart: "السلة",
    empty: "السلة فارغة حالياً", sub: "المجموع الفرعي", dl: "التوصيل", free: "مجاني",
    tot: "الإجمالي", cp: "كود الخصم (مثال: RAQEEM10)", ap: "تطبيق",
    name: "الاسم", phone: "رقم الهاتف", email: "البريد الإلكتروني",
    msg: "اكتب استفسارك أو مشكلتك بالتفصيل", send: "إرسال",
    pay: "طريقة الدفع (أونلاين)", vf: "فودافون كاش", ip: "إنستاباي",
    ref: "رقم التحويل أو مرجع العملية", up: "إرفاق صورة الإيصال (اختياري)",
    place: "تأكيد الطلب", oid: "رقم الطلب", rv: "تقييمات العملاء",
    cm: "شارك رأيك في المنتج...", max: "الحد الأقصى 8 قطع من كل منتج", egp: "ج.م",
    s: ["تم الاستلام", "قيد المراجعة", "خرج للتوصيل", "تم التسليم"],
    wait: "تم استلام بيانات التحويل وجارٍ مراجعتها من الإدارة",
    ok: "تمت الموافقة على الدفع", inv: "عرض الفاتورة", nf: "لم يتم العثور على طلب بهذا الرقم",
    sent: "تم إرسال رسالتك بنجاح", bad: "كود الخصم غير صالح",
    fd: "التوصيل 20 ج.م ويصبح مجانياً عند طلب 5 قطع أو أكثر",
    need: "يرجى استكمال جميع البيانات المطلوبة", acc: "باسم",
    login: "تسجيل الدخول", signup: "إنشاء حساب", logout: "تسجيل الخروج",
    f1: "الاسم الأول", f2: "الاسم الثاني", f3: "الاسم الثالث", pw: "كلمة المرور (6+ أحرف)",
    mk: "المركز", st: "الشارع", hn: "رقم البيت", lm: "علامة مميزة",
    done: "حفظ البيانات", hm: "عنوان الحساب", ot: "توصيل لعنوان آخر",
    need_acc: "سجّل الدخول أو أنشئ حساباً لإتمام الطلب ومتابعة حالة التوصيل",
    wel: "أهلاً بك في رقيم", saved: "تم تحديث بياناتك", edit: "تعديل بياناتي",
    bad_ph: "أدخل رقم هاتف مصري صحيح (مثال: 1012345678)",
    bad_em: "يرجى إدخال بريد إلكتروني صحيح", bad_pw: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    bad_cred: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    email_used: "هذا البريد مسجل بالفعل، يمكنك تسجيل الدخول",
    err: "حدث خطأ غير متوقع، حاول مرة أخرى",
    ps: { unpaid: "غير مدفوعة", pending: "قيد مراجعة الدفع", approved: "مدفوعة" },
    ps_l: "حالة الدفع", how_pay: "أتمم التحويل ثم أرسل رقم العملية أو صورة الإيصال",
    psend: "إرسال بيانات الدفع", psent: "تم إرسال بيانات الدفع للمراجعة",
    prt: "طباعة الفاتورة", it: "المنتج", qt: "الكمية", pc: "السعر",
    no_res: "لا توجد منتجات مطابقة لبحثك", no_rev: "لا توجد تقييمات بعد — كن أول من يقيّم هذا المنتج",
    my_orders: "طلباتك السابقة:", added_cart: "تمت الإضافة للسلة"
  },
  en: {
    home: "Home", shop: "Shop", track: "Track Order", help: "FAQ & Support",
    faq: "Frequently Asked Questions", support: "Technical Support",
    hk: "raqeem Laptop Accessories",
    h1: "Essential Laptop Gear,", h2: "Clear Pricing & Fast Delivery.",
    hp: "GaN fast chargers, water-resistant sleeves, wireless mechanical keyboards, and aluminum USB-C hubs delivered straight to your door.",
    shopn: "Browse Store", m1: "Delivery across Dakahlia", m2: "Free shipping on 5+ items", m3: "Online payment & QR invoice",
    shop_sub: "Filter by category or search for the gear you need. Try promo code RAQEEM10.",
    faq_sub: "Clear answers regarding ordering, shipping fees, and payment verification.",
    sup_sub: "Questions about compatibility or an existing order? Send us a message or reach out on WhatsApp.",
    search: "Search products...", all: "All", add: "Add to Cart", cart: "Shopping Cart",
    empty: "Your cart is currently empty", sub: "Subtotal", dl: "Delivery", free: "Free",
    tot: "Total", cp: "Promo code (e.g. RAQEEM10)", ap: "Apply",
    name: "Full Name", phone: "Phone Number", email: "Email Address",
    msg: "Describe your question or issue", send: "Send Message",
    pay: "Online Payment Method", vf: "Vodafone Cash", ip: "InstaPay",
    ref: "Transfer reference number", up: "Attach receipt screenshot (optional)",
    place: "Confirm Order", oid: "Order ID", rv: "Customer Reviews",
    cm: "Write your review...", max: "Maximum 8 units per product", egp: "EGP",
    s: ["Received", "Under Review", "Out for Delivery", "Delivered"],
    wait: "Payment details submitted and currently under admin review",
    ok: "Payment Approved", inv: "View Invoice", nf: "No order found with this ID",
    sent: "Your support message has been sent", bad: "Invalid discount code",
    fd: "Delivery is 20 EGP and becomes free on orders with 5+ items",
    need: "Please complete all required fields", acc: "Account Name",
    login: "Log In", signup: "Create Account", logout: "Log Out",
    f1: "First Name", f2: "Middle Name", f3: "Last Name", pw: "Password (6+ chars)",
    mk: "District (Markaz)", st: "Street", hn: "Building / House No.", lm: "Landmark",
    done: "Save Details", hm: "Saved Address", ot: "Deliver to Another Address",
    need_acc: "Sign in or create an account to place your order and track delivery",
    wel: "Welcome to raqeem", saved: "Account details saved", edit: "Edit My Details",
    bad_ph: "Enter a valid Egyptian mobile number (e.g. 1012345678)",
    bad_em: "Please enter a valid email address", bad_pw: "Password must be at least 6 characters",
    bad_cred: "Incorrect email or password",
    email_used: "This email is already registered, please log in",
    err: "Something went wrong, please try again",
    ps: { unpaid: "Unpaid", pending: "Under Review", approved: "Paid" },
    ps_l: "Payment Status", how_pay: "Complete the transfer, then submit your reference or receipt",
    psend: "Submit Payment Proof", psent: "Payment proof submitted for review",
    prt: "Print Invoice", it: "Item", qt: "Qty", pc: "Price",
    no_res: "No products match your search", no_rev: "No reviews yet — be the first to review",
    my_orders: "Your recent orders:", added_cart: "Added to cart"
  }
};

const FQ = [
  [
    "كيف أطلب من المتجر؟",
    "تصفح المنتجات وأضف ما تحتاجه إلى السلة، ثم سجّل الدخول أو أنشئ حسابك بعنوانك في الدقهلية، واختر وسيلة الدفع وأكّد الطلب للحصول على رقم التتبع والفاتورة.",
    "How do I place an order?",
    "Browse the catalog and add items to your cart, sign in or create an account with your Dakahlia address, pick an online payment method, and confirm to receive your order ID and invoice."
  ],
  [
    "ما طرق الدفع المتاحة؟",
    "الدفع يتم أونلاين عبر فودافون كاش أو إنستاباي. بعد تأكيد الطلب تظهر الفاتورة وبها بيانات التحويل، وبعد التحويل ترسل رقم العملية أو صورة الإيصال.",
    "Which payment methods are supported?",
    "Payments are processed online via Vodafone Cash or InstaPay. Your invoice displays the transfer details, where you can submit the transaction reference or receipt screenshot."
  ],
  [
    "ما تكلفة التوصيل ومدة الشحن؟",
    "تكلفة التوصيل 20 جنيهاً داخل جميع مراكز الدقهلية، ويصبح التوصيل مجانياً تماماً عند طلب 5 قطع أو أكثر في نفس الطلب.",
    "What is the delivery fee?",
    "Flat delivery is 20 EGP across Dakahlia Governorate, and shipping becomes completely free on orders of 5 or more items."
  ],
  [
    "كيف أتابع حالة طلبي وفاتورتي؟",
    "من زر «تتبع الطلب» في الشريط العلوي أدخل رقم الطلب لتشاهد مراحل التجهيز والتوصيل وحالة الدفع، ويمكنك فتح الفاتورة وطباعتها في أي وقت.",
    "How do I track my order and invoice?",
    "Click Track Order in the top bar and enter your order ID to view live preparation/delivery stages, payment status, and open or print your invoice."
  ]
];

let L = localStorage.rq_l || "ar";
let cats = [];
let prods = [];
let cart = [];
let cp = null;
let cat = "all";
let queryText = "";
let rate = 5;
let me = null;
let INV = null;
let busy = false;

try { cart = JSON.parse(localStorage.rq_c || "[]"); } catch {}
try { me = JSON.parse(localStorage.rq_u || "null"); } catch {}

const t = (k) => T[L][k] ?? k;
const nm = (o, f) => o[`${f}_${L}`] || o[`${f}_ar`] || o[`${f}_en`] || "";
const pr = (p) => (p.disc ? Math.round(p.price * (100 - p.disc) / 100) : Number(p.price));

window.cl = (id) => $(id).classList.remove("on");
const op = (id) => $(id).classList.add("on");

const toast = (msg) => {
  const d = document.createElement("div");
  d.textContent = msg;
  $("toast").appendChild(d);
  setTimeout(() => d.remove(), 3600);
};

async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

function ui() {
  document.documentElement.lang = L;
  document.documentElement.dir = L === "ar" ? "rtl" : "ltr";
  $("lg").textContent = L === "ar" ? "EN" : "ع";
  document.querySelectorAll("[data-i]").forEach((el) => {
    el.textContent = t(el.dataset.i);
  });
  document.querySelectorAll("[data-p]").forEach((el) => {
    el.placeholder = t(el.dataset.p);
  });
  $("fq").innerHTML = FQ.map((f) => `
    <details class="fq">
      <summary>${esc(L === "ar" ? f[0] : f[2])}</summary>
      <p>${esc(L === "ar" ? f[1] : f[3])}</p>
    </details>
  `).join("");
  $("ua").classList.toggle("authed", !!me);
  shop();
  cartUI();
}

window.lang = () => {
  L = L === "ar" ? "en" : "ar";
  localStorage.rq_l = L;
  ui();
  if ($("dr").classList.contains("on")) openC();
  if (INV && $("ovI").classList.contains("on")) renderInvoice();
};

async function loadCatalog() {
  try {
    const data = await api("/api/catalog");
    cats = data.categories || [];
    prods = data.products || [];
    if (prods.length) {
      cart = cart.filter((c) => prods.some((p) => p.id === c.id));
      saveCart();
    }
    shop();
  } catch {
    toast(t("err"));
  }
}

window.setCat = (c) => {
  cat = c;
  shop();
};

window.setSearch = (val) => {
  queryText = String(val || "").trim().toLowerCase();
  shop();
};

function catName(catId) {
  const c = cats.find((x) => x.id === catId);
  return c ? nm(c, "name") : "";
}

function shop() {
  $("chips").innerHTML = `
    <button class="chip ${cat === "all" ? "on" : ""}" type="button" onclick="setCat('all')">${esc(t("all"))}</button>
    ${cats.map((c) => `
      <button class="chip ${cat === c.id ? "on" : ""}" type="button" onclick="setCat('${esc(c.id)}')">${esc(nm(c, "name"))}</button>
    `).join("")}
  `;

  const list = prods.filter((p) => {
    if (cat !== "all" && p.cat !== cat) return false;
    if (!queryText) return true;
    const hay = `${p.name_ar} ${p.name_en} ${p.short_ar} ${p.short_en} ${p.desc_ar} ${p.desc_en}`.toLowerCase();
    return hay.includes(queryText);
  });

  if (!list.length) {
    $("grid").innerHTML = `<div class="empty-state">${esc(t("no_res"))}</div>`;
    return;
  }

  $("grid").innerHTML = list.map((p) => `
    <article class="card" onclick="showP('${esc(p.id)}')">
      <div class="card-media">
        <img src="${esc(p.img)}" alt="${esc(nm(p, "name"))}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-kicker">
          <span>${esc(catName(p.cat))}</span>
          ${p.disc ? `<span class="disc-txt">-${p.disc}%</span>` : ""}
        </div>
        <h3>${esc(nm(p, "name"))}</h3>
        <p class="card-short">${esc(nm(p, "short"))}</p>
        <div class="card-foot">
          <div class="pr num">
            ${pr(p)} <span class="cur">${esc(t("egp"))}</span>
            ${p.disc ? `<s>${p.price}</s>` : ""}
          </div>
          <button class="btn sm" type="button" onclick="event.stopPropagation();quickAdd('${esc(p.id)}')">${esc(t("add"))}</button>
        </div>
      </div>
    </article>
  `).join("");
}

window.showP = async (id) => {
  const p = prods.find((x) => x.id === id);
  if (!p) return;
  const g = [p.img, ...(p.gallery || [])].filter((v, i, a) => a.indexOf(v) === i);
  op("ovP");
  $("pb").innerHTML = `
    <div class="two">
      <div>
        <div class="main-img"><img id="mnImg" src="${esc(p.img)}" alt="${esc(nm(p, "name"))}"></div>
        ${g.length > 1 ? `
          <div class="th">
            ${g.map((u, i) => `
              <button type="button" class="${i === 0 ? "on" : ""}" onclick="pickImg(this,'${esc(u)}')">
                <img src="${esc(u)}" alt="">
              </button>
            `).join("")}
          </div>
        ` : ""}
      </div>
      <div>
        <div class="card-kicker" style="margin-bottom:6px">
          <span>${esc(catName(p.cat))}</span>
          ${p.disc ? `<span class="disc-txt">-${p.disc}%</span>` : ""}
        </div>
        <h2 style="font-size:1.5rem;line-height:1.35">${esc(nm(p, "name"))}</h2>
        <div class="pr num" style="font-size:1.7rem;margin:12px 0">
          ${pr(p)} <span class="cur">${esc(t("egp"))}</span>
          ${p.disc ? `<s>${p.price}</s>` : ""}
        </div>
        <p style="color:var(--text-secondary);line-height:1.75">${esc(nm(p, "desc"))}</p>
        <div class="row" style="margin:18px 0 8px">
          <select id="pq" style="max-width:110px">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<option value="${n}">${n}</option>`).join("")}
          </select>
          <button class="btn" type="button" onclick="addC('${esc(id)}')">${esc(t("add"))}</button>
        </div>
        <small style="color:var(--muted)">${esc(t("max"))}</small>
      </div>
    </div>

    <div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--border)">
      <h3 style="margin-bottom:10px">${esc(t("rv"))}</h3>
      <div id="rvs"></div>
      <div style="margin-top:16px">
        <div id="stars" style="margin-bottom:8px">
          ${[1, 2, 3, 4, 5].map((n) => `
            <span class="star on" onclick="setR(${n})" data-n="${n}">
              <svg class="ico" viewBox="0 0 24 24" style="fill:currentColor"><path d="m12 2 3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8 5.6 21.5l1.7-7.2L2 9.6 9 9z"/></svg>
            </span>
          `).join("")}
        </div>
        <input id="rn" placeholder="${esc(t("name"))}" value="${esc(me ? `${me.f1 || ""} ${me.f2 || ""}`.trim() : "")}">
        <textarea id="rc" rows="2" placeholder="${esc(t("cm"))}"></textarea>
        <button class="btn sm" type="button" onclick="sendR('${esc(id)}')" style="margin-top:6px">${esc(t("send"))}</button>
      </div>
    </div>
  `;
  rate = 5;
  loadR(id);
};

window.pickImg = (btn, url) => {
  $("mnImg").src = url;
  btn.parentNode.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
  btn.classList.add("on");
};

window.setR = (n) => {
  rate = n;
  document.querySelectorAll("#stars .star").forEach((s) => {
    s.classList.toggle("on", Number(s.dataset.n) <= n);
  });
};

async function loadR(id) {
  try {
    const list = await api(`/api/reviews/${encodeURIComponent(id)}`);
    $("rvs").innerHTML = list.length ? list.map((x) => `
      <div class="li" style="display:block">
        <div style="display:flex;justify-content:space-between;gap:8px">
          <strong>${esc(x.name)}</strong>
          <span style="color:#f5a623">${"★".repeat(Math.min(5, Math.max(1, x.rate | 0)))}</span>
        </div>
        <p style="color:var(--text-secondary);margin-top:4px">${esc(x.text)}</p>
      </div>
    `).join("") : `<p style="color:var(--muted)">${esc(t("no_rev"))}</p>`;
  } catch {}
}

window.sendR = async (id) => {
  const n = ($("rn").value || (me && me.f1) || "").trim();
  const c = $("rc").value.trim();
  if (!n || !c) return toast(t("need"));
  try {
    await api(`/api/reviews/${encodeURIComponent(id)}`, {
      method: "POST",
      body: JSON.stringify({ name: n, text: c, rate, uid: me?.uid || "guest" })
    });
    $("rc").value = "";
    loadR(id);
  } catch {
    toast(t("err"));
  }
};

/* Cart */
function saveCart() {
  localStorage.rq_c = JSON.stringify(cart);
  cartUI();
}

const cnt = () => cart.reduce((a, c) => a + c.q, 0);
function cartUI() { $("cc").textContent = cnt(); }

window.quickAdd = (id) => {
  const item = cart.find((c) => c.id === id);
  if (item) item.q = Math.min(8, item.q + 1);
  else cart.push({ id, q: 1 });
  saveCart();
  toast(t("added_cart"));
};

window.addC = (id) => {
  const q = Number($("pq").value) || 1;
  const item = cart.find((c) => c.id === id);
  if (item) item.q = Math.min(8, item.q + q);
  else cart.push({ id, q });
  saveCart();
  cl("ovP");
  openC();
};

window.qty = (id, d) => {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.q += d;
  if (item.q > 8) item.q = 8;
  if (item.q < 1) cart = cart.filter((c) => c.id !== id);
  saveCart();
  openC();
};

function calc() {
  const sub = cart.reduce((a, c) => {
    const p = prods.find((x) => x.id === c.id);
    return a + (p ? pr(p) * c.q : 0);
  }, 0);
  const d = cp ? Math.round(sub * cp.pct / 100) : 0;
  const n = cnt();
  const dl = n === 0 || n >= 5 ? 0 : 20;
  return { sub, d, dl, tot: Math.max(0, sub - d) + dl };
}

/* Forms & Helpers */
const inp = (id, k, ty = "text", v = "") =>
  `<input id="${id}" type="${ty}" placeholder="${esc(t(k))}" value="${esc(v)}">`;
const nf = (p, v = {}) =>
  `<div class="g3">${inp(p + "1", "f1", "text", v.f1 || "")}${inp(p + "2", "f2", "text", v.f2 || "")}${inp(p + "3", "f3", "text", v.f3 || "")}</div>`;
const phf = (id, v = "") =>
  `<div class="pf"><span>+20</span><input id="${id}" inputmode="numeric" maxlength="11" placeholder="1XXXXXXXXX" value="${esc(String(v || "").replace("+20", ""))}"></div>`;
const af = (p, v = {}) => `
  <div class="g3">
    <input value="${GOV}" disabled>
    <select id="${p}m">
      <option value="">${esc(t("mk"))}</option>
      ${MK.map((m) => `<option${m === v.markaz ? " selected" : ""}>${esc(m)}</option>`).join("")}
    </select>
    ${inp(p + "s", "st", "text", v.street || "")}
  </div>
  <div class="g3">
    ${inp(p + "h", "hn", "text", v.house || "")}
    ${inp(p + "l", "lm", "text", v.landmark || "")}
  </div>
`;

const nph = (v) => {
  v = String(v).replace(/\D/g, "");
  if (v.startsWith("20")) v = v.slice(2);
  return v.replace(/^0/, "");
};
const ra = (p) => {
  const a = {
    gov: GOV,
    markaz: $(p + "m").value,
    street: $(p + "s").value.trim(),
    house: $(p + "h").value.trim(),
    landmark: $(p + "l").value.trim()
  };
  if (!a.markaz || !a.street || !a.house || !a.landmark) {
    toast(t("need"));
    return null;
  }
  return a;
};
const rp = (p) => {
  const d = {
    f1: $(p + "1").value.trim(),
    f2: $(p + "2").value.trim(),
    f3: $(p + "3").value.trim()
  };
  if (!d.f1 || !d.f2 || !d.f3) { toast(t("need")); return null; }
  const n = nph($(p + "ph").value);
  if (!/^1[0125]\d{8}$/.test(n)) { toast(t("bad_ph")); return null; }
  d.phone = "+20" + n;
  d.addr = ra(p);
  return d.addr ? d : null;
};
const okProf = (p) => !!(p && p.f1 && p.f2 && p.f3 && p.phone && p.addr && p.addr.markaz && p.addr.street && p.addr.house && p.addr.landmark);
const fullName = (p) => [p.f1, p.f2, p.f3].filter(Boolean).join(" ");
const adt = (a) => [a.gov, a.markaz, a.street, `${t("hn")} ${a.house}`, a.landmark].filter(Boolean).join("، ");
const isMail = (e) => /^\S+@\S+\.\S+$/.test(e);

function setSession(user) {
  me = user;
  if (user) localStorage.rq_u = JSON.stringify(user);
  else localStorage.removeItem("rq_u");
  $("ua").classList.toggle("authed", !!me);
  if ($("dr").classList.contains("on")) openC();
}

/* Auth Modal */
window.openU = () => {
  cl("dr");
  op("ovU");
  authView(me ? (okProf(me) ? "account" : "complete") : "login");
};

window.showAuth = (m) => {
  cl("dr");
  op("ovU");
  authView(m);
};

window.authView = (m) => {
  const b = $("ub");
  const tabs = `
    <div class="tb">
      <button type="button" class="btn ${m === "login" ? "" : "g"}" onclick="authView('login')">${esc(t("login"))}</button>
      <button type="button" class="btn ${m === "signup" ? "" : "g"}" onclick="authView('signup')">${esc(t("signup"))}</button>
    </div>
  `;
  const fw = 'style="width:100%;margin-top:10px"';

  if (m === "login") {
    b.innerHTML = `${tabs}${inp("le", "email", "email")}${inp("lp", "pw", "password")}
      <button type="button" class="btn" ${fw} onclick="doLogin()">${esc(t("login"))}</button>`;
  } else if (m === "signup") {
    b.innerHTML = `${tabs}${nf("u")}${inp("uem", "email", "email")}${inp("upw", "pw", "password")}${phf("uph")}${af("u")}
      <button type="button" class="btn" ${fw} onclick="doSignup()">${esc(t("signup"))}</button>`;
  } else if (m === "complete") {
    const v = me || {};
    b.innerHTML = `<h3 style="margin-bottom:10px">${esc(t("done"))}</h3>
      ${nf("c", v)}${phf("cph", v.phone)}${af("c", v.addr)}
      <button type="button" class="btn" ${fw} onclick="doSave()">${esc(t("done"))}</button>`;
  } else {
    b.innerHTML = `
      <h3 style="margin-bottom:8px">${esc(fullName(me))}</h3>
      <p style="color:var(--text-secondary);margin-bottom:16px">
        ${esc(me.email)}<br>
        <span dir="ltr">${esc(me.phone)}</span><br>
        ${esc(adt(me.addr))}
      </p>
      <div class="row">
        <button type="button" class="btn g" onclick="authView('complete')">${esc(t("edit"))}</button>
        <button type="button" class="btn g" onclick="cl('ovU');openT()">${esc(t("track"))}</button>
        <button type="button" class="btn" onclick="doOut()">${esc(t("logout"))}</button>
      </div>
    `;
  }
};

window.doLogin = async () => {
  if (busy) return;
  const em = $("le").value.trim();
  const pw = $("lp").value;
  if (!isMail(em) || !pw) return toast(t("need"));
  busy = true;
  try {
    const user = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: em, password: pw }) });
    setSession(user);
    cl("ovU");
    toast(t("wel"));
    if (cart.length) openC();
  } catch (e) {
    toast(e.error === "invalid_credentials" ? t("bad_cred") : t("err"));
  }
  busy = false;
};

window.doSignup = async () => {
  if (busy) return;
  const d = rp("u");
  if (!d) return;
  const em = $("uem").value.trim();
  const pw = $("upw").value;
  if (!isMail(em)) return toast(t("bad_em"));
  if (pw.length < 6) return toast(t("bad_pw"));
  busy = true;
  try {
    const user = await api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ ...d, email: em, password: pw })
    });
    setSession(user);
    cl("ovU");
    toast(t("wel"));
    if (cart.length) openC();
  } catch (e) {
    toast(e.error === "email_exists" ? t("email_used") : t("err"));
  }
  busy = false;
};

window.doSave = async () => {
  const d = rp("c");
  if (!d || !me) return;
  try {
    const user = await api(`/api/auth/profile/${encodeURIComponent(me.uid)}`, {
      method: "PUT",
      body: JSON.stringify({ ...d, email: me.email })
    });
    setSession(user);
    cl("ovU");
    toast(t("saved"));
    if (cart.length) openC();
  } catch {
    toast(t("err"));
  }
};

window.doOut = () => {
  setSession(null);
  cl("ovU");
};

/* Cart Drawer & Checkout */
window.openC = () => {
  op("dr");
  const c = calc();
  if (!cart.length) {
    $("cb").innerHTML = `<p style="color:var(--muted)">${esc(t("empty"))}</p>`;
    return;
  }

  let h = cart.map((i) => {
    const p = prods.find((x) => x.id === i.id);
    if (!p) return "";
    return `
      <div class="li">
        <div class="li-img"><img src="${esc(p.img)}" alt="${esc(nm(p, "name"))}"></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:0.95rem">${esc(nm(p, "name"))}</div>
          <div class="pr num" style="font-size:1rem">${pr(p) * i.q} <span class="cur">${esc(t("egp"))}</span></div>
        </div>
        <div class="q">
          <button type="button" onclick="qty('${esc(i.id)}',-1)">−</button>
          <span class="num" style="min-width:18px;text-align:center">${i.q}</span>
          <button type="button" onclick="qty('${esc(i.id)}',1)">+</button>
        </div>
      </div>
    `;
  }).join("");

  h += `
    <div class="row" style="margin:14px 0">
      <input id="cpi" placeholder="${esc(t("cp"))}">
      <button class="btn g sm" type="button" onclick="applyC()">${esc(t("ap"))}</button>
    </div>
    <div class="tot num">
      <div><span>${esc(t("sub"))}</span><span>${c.sub} ${esc(t("egp"))}</span></div>
      ${cp ? `<div><span>${esc(cp.code)} (-${cp.pct}%)</span><span>-${c.d} ${esc(t("egp"))}</span></div>` : ""}
      <div><span>${esc(t("dl"))}</span><span>${c.dl ? `${c.dl} ${esc(t("egp"))}` : esc(t("free"))}</span></div>
      <div class="gt"><span>${esc(t("tot"))}</span><span>${c.tot} ${esc(t("egp"))}</span></div>
    </div>
    <small style="color:var(--muted);display:block;margin-bottom:12px">${esc(t("fd"))}</small>
  `;

  if (!me) {
    h += `
      <p style="color:var(--text-secondary);margin:12px 0">${esc(t("need_acc"))}</p>
      <button class="btn" type="button" style="width:100%" onclick="showAuth('signup')">${esc(t("signup"))}</button>
      <button class="btn g" type="button" style="width:100%;margin-top:8px" onclick="showAuth('login')">${esc(t("login"))}</button>
    `;
  } else if (!okProf(me)) {
    h += `<button class="btn" type="button" style="width:100%;margin-top:12px" onclick="openU()">${esc(t("done"))}</button>`;
  } else {
    h += `
      <label class="rd on" id="rh">
        <input type="radio" name="ad" id="ah" checked onchange="adc()">
        <span><strong>${esc(t("hm"))}</strong><br><small style="color:var(--muted)">${esc(adt(me.addr))}</small></span>
      </label>
      <label class="rd" id="ro">
        <input type="radio" name="ad" id="ao" onchange="adc()">
        <span><strong>${esc(t("ot"))}</strong></span>
      </label>
      <div id="oab" style="display:none">${af("o")}</div>
      <label class="lb">${esc(t("pay"))}</label>
      <select id="pm">
        <option value="vodafone">${esc(t("vf"))}</option>
        <option value="instapay">${esc(t("ip"))}</option>
      </select>
      <button class="btn" id="pl" type="button" style="width:100%;margin-top:12px" onclick="place()">${esc(t("place"))}</button>
    `;
  }

  $("cb").innerHTML = h;
};

window.adc = () => {
  const o = $("ao").checked;
  $("oab").style.display = o ? "block" : "none";
  $("rh").classList.toggle("on", !o);
  $("ro").classList.toggle("on", o);
};

window.applyC = async () => {
  const code = $("cpi").value.trim().toUpperCase();
  if (!code) return;
  try {
    cp = await api("/api/coupons/apply", { method: "POST", body: JSON.stringify({ code }) });
    openC();
  } catch {
    toast(t("bad"));
  }
};

window.place = async () => {
  if (busy || !cart.length) return;
  if (!me || !okProf(me)) return openU();
  const a = $("ao").checked ? ra("o") : me.addr;
  if (!a) return;
  const c = calc();
  const items = cart.map((i) => {
    const p = prods.find((x) => x.id === i.id);
    return p ? { id: i.id, name: nm(p, "name"), price: pr(p), q: i.q } : null;
  }).filter(Boolean);
  if (!items.length) return;

  busy = true;
  $("pl").disabled = true;
  try {
    const order = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        uid: me.uid,
        items,
        sub: c.sub,
        disc: c.d,
        coupon: cp ? cp.code : "",
        delivery: c.dl,
        total: c.tot,
        name: fullName(me),
        phone: me.phone,
        email: me.email || "",
        addr: a,
        pay: $("pm").value
      })
    });
    cart = [];
    cp = null;
    saveCart();
    cl("dr");
    showInv(order.id, order);
  } catch {
    toast(t("err"));
    if ($("pl")) $("pl").disabled = false;
  }
  busy = false;
};

/* Orders, Tracking & Invoice */
window.openT = async (id) => {
  op("ovT");
  $("tid").value = id || "";
  $("tr").innerHTML = "";
  if (id) return trk(id);
  if (me) {
    try {
      const list = await api(`/api/orders?uid=${encodeURIComponent(me.uid)}`);
      if (list.length) {
        $("tr").innerHTML = `
          <p style="color:var(--muted);margin-bottom:8px;font-size:0.9rem">${esc(t("my_orders"))}</p>
          <div class="chips">
            ${list.map((o) => `
              <button type="button" class="chip mono" onclick="trk('${esc(o.id)}')">#${esc(o.id)} · ${o.total} ${esc(t("egp"))}</button>
            `).join("")}
          </div>
        `;
      }
    } catch {}
  }
};

window.trk = async (id) => {
  const oid = (typeof id === "string" ? id : $("tid").value).trim();
  $("tid").value = oid;
  if (!oid) return;
  try {
    const o = await api(`/api/orders/${encodeURIComponent(oid)}`);
    $("tr").innerHTML = `
      <div class="st">
        ${T[L].s.map((x, i) => `<div class="${i <= o.status ? "d" : ""}"><i>${i + 1}</i>${esc(x)}</div>`).join("")}
      </div>
      <div class="tot num">
        <div><span>${esc(t("tot"))}</span><span>${o.total} ${esc(t("egp"))}</span></div>
        <div><span>${esc(t("ps_l"))}</span><span>${esc(T[L].ps[o.payStatus])}</span></div>
      </div>
      <button class="btn" type="button" style="width:100%" onclick="showInvId('${esc(o.id)}')">${esc(t("inv"))}</button>
    `;
  } catch {
    $("tr").innerHTML = `<p style="color:var(--muted)">${esc(t("nf"))}</p>`;
  }
};

window.showInvId = async (id) => {
  try {
    const o = await api(`/api/orders/${encodeURIComponent(id)}`);
    showInv(id, o);
  } catch {
    toast(t("err"));
  }
};

window.showInv = (id, o) => {
  INV = { id, o };
  cl("ovT");
  op("ovI");
  renderInvoice();
};

function renderInvoice() {
  $("ib").innerHTML = invHTML(INV.id, INV.o);
  drawQR(INV.id);
}

function drawQR(id) {
  const url = `${location.origin}${location.pathname}?verify=${encodeURIComponent(id)}`;
  const go = () => {
    const el = $("qr");
    if (el && window.QRCode) {
      el.innerHTML = "";
      new window.QRCode(el, { text: url, width: 100, height: 100 });
    }
  };
  if (window.QRCode) go();
  else {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.onload = go;
    document.head.appendChild(s);
  }
}

function invHTML(id, o) {
  const s = o.payStatus;
  const P = T[L].ps;
  const vf = o.pay === "vodafone";
  const how = vf ? t("vf") : t("ip");
  const ap = s === "approved";

  let payBlock = "";
  if (s === "unpaid") {
    payBlock = `
      <div class="np" style="margin-top:14px">
        <h3 style="margin-bottom:8px">${esc(t("how_pay"))}</h3>
        <div class="inf">
          <strong class="num">${esc(t("tot"))}: ${o.total} ${esc(t("egp"))}</strong><br>
          ${esc(t("acc"))}: KHALED AHMED ABD EL RAZEK AHMED MOUSTAFA<br>
          ${vf ? `${esc(t("vf"))}: <span dir="ltr" class="mono">+20 1023311470</span>` : IPS.map((u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`).join("")}
        </div>
        <input id="rf2" placeholder="${esc(t("ref"))}">
        <label class="lb" style="color:#4b5c53">${esc(t("up"))}</label>
        <input type="file" id="pi" accept="image/*">
        <button class="btn" id="pb2" type="button" style="width:100%;margin-top:8px" onclick="payS('${esc(id)}')">${esc(t("psend"))}</button>
      </div>
    `;
  } else if (s === "pending") {
    payBlock = `
      <div class="inf" style="text-align:center">
        <strong>${esc(t("wait"))}</strong>
        ${o.ref ? `<div class="mt mono" style="margin-top:4px">${esc(t("ref"))}: ${esc(o.ref)}</div>` : ""}
      </div>
    `;
  } else {
    payBlock = `
      <div style="text-align:center;margin:12px 0">
        <h3 style="color:#2a9472">${esc(t("ok"))}</h3>
      </div>
    `;
  }

  return `
    <div class="inv ${ap ? "paid" : ""}">
      <div class="ih">
        <img src="/logo-dark.png" alt="raqeem Store">
        <span class="sb s${s}">${esc(P[s])}</span>
      </div>
      <p class="mt">${esc(t("oid"))}: <strong class="mono">${esc(id)}</strong><br>${new Date(o.at).toLocaleString(L === "ar" ? "ar-EG" : "en-GB")}</p>
      <p style="margin:8px 0"><strong>${esc(o.name)}</strong> — <span dir="ltr" class="mono">${esc(o.phone)}</span><br>${esc(adt(o.addr))}</p>
      <table>
        <tr><th>${esc(t("it"))}</th><th>${esc(t("qt"))}</th><th>${esc(t("pc"))}</th><th>${esc(t("tot"))}</th></tr>
        ${o.items.map((i) => `<tr><td>${esc(i.name)}</td><td>${i.q}</td><td>${i.price}</td><td>${i.price * i.q}</td></tr>`).join("")}
      </table>
      <div class="tot num">
        <div><span>${esc(t("sub"))}</span><span>${o.sub} ${esc(t("egp"))}</span></div>
        ${o.disc ? `<div><span>${esc(o.coupon)}</span><span>-${o.disc} ${esc(t("egp"))}</span></div>` : ""}
        <div><span>${esc(t("dl"))}</span><span>${o.delivery ? `${o.delivery} ${esc(t("egp"))}` : esc(t("free"))}</span></div>
        <div class="gt"><span>${esc(t("tot"))}</span><span>${o.total} ${esc(t("egp"))}</span></div>
      </div>
      <div class="inf">
        <strong>${esc(t("pay"))}:</strong> ${esc(how)}<br>
        <strong>${esc(t("ps_l"))}:</strong> ${esc(P[s])}
      </div>
      ${payBlock}
      <div style="display:flex;justify-content:center;margin:14px 0"><div id="qr"></div></div>
      <button class="btn np" type="button" style="width:100%" onclick="window.print()">${esc(t("prt"))}</button>
      <p class="mt" style="text-align:center;margin-top:10px">raqeem Store · powered by sarmad</p>
    </div>
  `;
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

window.payS = async (id) => {
  const b = $("pb2");
  const f = $("pi").files[0];
  const ref = $("rf2").value.trim();
  if (!f && !ref) return toast(t("need"));
  b.disabled = true;
  try {
    const proof = f ? await readAsDataURL(f) : "";
    const updated = await api(`/api/orders/${encodeURIComponent(id)}/pay`, {
      method: "POST",
      body: JSON.stringify({ ref, proof })
    });
    INV.o = updated;
    renderInvoice();
    toast(t("psent"));
  } catch {
    toast(t("err"));
    if (b) b.disabled = false;
  }
};

/* Support Ticket */
window.sendS = async () => {
  const name = $("s1").value.trim();
  const phone = $("s2").value.trim();
  const email = $("s3").value.trim();
  const msg = $("s4").value.trim();
  if (!name || !msg) return toast(t("need"));
  try {
    const tk = await api("/api/tickets", {
      method: "POST",
      body: JSON.stringify({ name, phone, email, msg })
    });
    ["s1", "s2", "s3", "s4"].forEach((id) => { $(id).value = ""; });
    toast(`${t("sent")} (${tk.id})`);
  } catch {
    toast(t("err"));
  }
};

/* Init */
ui();
loadCatalog();

const vq = new URLSearchParams(location.search).get("verify");
if (vq) openT(vq);

setTimeout(() => {
  const sp = $("sp");
  if (sp) {
    sp.classList.add("hide");
    setTimeout(() => sp.remove(), 400);
  }
}, 450);
