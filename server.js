import express from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const publicDir = path.join(__dirname, 'public');
const assetsDir = path.join(__dirname, 'src', 'assets');
const DATA_FILE = '/tmp/raqeem-store-data.json';

app.use(express.json({ limit: '6mb' }));
app.use(express.static(publicDir));
app.use('/src/assets', express.static(assetsDir));

const CATEGORIES = [
  { id: 'chargers', name_ar: 'الشواحن والكابلات', name_en: 'Chargers & Cables' },
  { id: 'bags', name_ar: 'الحقائب والحافظات', name_en: 'Bags & Sleeves' },
  { id: 'input', name_ar: 'الكيبورد والماوس', name_en: 'Keyboards & Mice' },
  { id: 'hubs', name_ar: 'الوصلات والـ Hubs', name_en: 'Hubs & Adapters' },
  { id: 'stands', name_ar: 'الحوامل والتبريد', name_en: 'Stands & Cooling' }
];

const PRODUCTS = [
  {
    id: 'gan-100w',
    cat: 'chargers',
    name_ar: 'شاحن GaN سريع 100 واط بمنفذين USB-C',
    name_en: '100W GaN Dual USB-C Fast Charger',
    short_ar: 'شحن فائق للابتوب والهاتف معاً + كابل مضفر 2 متر',
    short_en: 'Simultaneous laptop & phone fast charging + 2m braided cable',
    desc_ar: 'شاحن بتقنية GaN المتطورة بقدرة 100 واط مع منفذين USB-C PD للشحن السريع للابتوب والهاتف في وقت واحد، مرفق بكابل مضفر عالي التحمل بطول 2 متر مع حماية متكاملة من الحرارة والتيار الزائد.',
    desc_en: 'Compact 100W GaN wall charger with dual USB-C Power Delivery ports to fast-charge your laptop and phone simultaneously. Includes a heavy-duty 2m braided USB-C cable and multi-layer thermal protection.',
    price: 1650,
    disc: 15,
    img: '/src/assets/images/prod_gan_charger_1795625681381.jpg',
    gallery: ['/src/assets/images/prod_gan_charger_1795625681381.jpg']
  },
  {
    id: 'sleeve-15',
    cat: 'bags',
    name_ar: 'حافظة لابتوب مقاومة للماء 15.6 بوصة',
    name_en: 'Water-Resistant Ballistic Laptop Sleeve 15.6"',
    short_ar: 'نسيج باليستي مبطن لحماية كاملة من الصدمات والمطر',
    short_en: 'Padded ballistic nylon shell with weather-sealed zipper',
    desc_ar: 'حافظة مصممة من نسيج باليستي مقاوم للماء والتمزق مع بطانة مخملية داخلية تحمي اللابتوب من الصدمات والخدوش، وجيب أمامي بسحّاب مخصص للشاحن والكابلات.',
    desc_en: 'Crafted from water-repellent ballistic nylon with a plush microfiber interior that shields your laptop from drops and scratches, plus a dedicated zippered front pocket for chargers and cables.',
    price: 920,
    disc: 10,
    img: '/src/assets/images/prod_laptop_sleeve_1795625681035.jpg',
    gallery: ['/src/assets/images/prod_laptop_sleeve_1795625681035.jpg']
  },
  {
    id: 'mech-75',
    cat: 'input',
    name_ar: 'كيبورد ميكانيكي لاسلكي 75% احترافي',
    name_en: '75% Wireless Low-Profile Mechanical Keyboard',
    short_ar: 'توصيل بلوتوث وسلكي مع مفاتيح هادئة وإضاءة دافئة',
    short_en: 'Dual Bluetooth/USB-C connectivity with tactile quiet switches',
    desc_ar: 'لوحة مفاتيح ميكانيكية بحجم 75% توفر مساحة المكتب مع استجابة دقيقة وصوت هادئ، تدعم الاتصال عبر البلوتوث حتى 3 أجهزة أو عبر كابل USB-C مع بطارية تدوم أسابيع.',
    desc_en: 'Compact 75% layout mechanical keyboard engineered for clean desk ergonomics and quiet tactile typing. Pairs with up to 3 devices over Bluetooth or connects via USB-C with multi-week battery life.',
    price: 2850,
    disc: 12,
    img: '/src/assets/images/prod_mech_keyboard_1795625681897.jpg',
    gallery: ['/src/assets/images/prod_mech_keyboard_1795625681897.jpg']
  },
  {
    id: 'mouse-pro',
    cat: 'input',
    name_ar: 'ماوس لاسلكي مريح بعجلة معدنية دقيقة',
    name_en: 'Ergonomic Wireless Precision Mouse',
    short_ar: 'تصميم مريح لليد مع مستشعر حتى 4000 DPI',
    short_en: 'Contoured grip, machined metal scroll wheel, 4000 DPI sensor',
    desc_ar: 'ماوس لاسلكي مصمم لراحة اليد خلال ساعات العمل الطويلة مع عجلة تمرير معدنية سريعة، أزرار جانبية قابلة للتخصيص، وبطارية قابلة للشحن عبر USB-C.',
    desc_en: 'Sculpted wireless mouse built for all-day comfort featuring a machined alloy scroll wheel, silent switches, customizable side buttons, and USB-C fast recharging.',
    price: 1180,
    disc: 0,
    img: '/src/assets/images/prod_wireless_mouse_1795625681957.jpg',
    gallery: ['/src/assets/images/prod_wireless_mouse_1795625681957.jpg']
  },
  {
    id: 'hub-8in1',
    cat: 'hubs',
    name_ar: 'محول USB-C ألومنيوم 8 في 1 بدقة 4K',
    name_en: '8-in-1 CNC Aluminum USB-C Hub (4K HDMI)',
    short_ar: 'منفذ HDMI 4K وقارئ كروت SD ومنافذ USB 3.0 وشحن PD',
    short_en: '4K HDMI, dual USB-A 3.0, SD/TF reader, and 100W PD pass-through',
    desc_ar: 'موزع منافذ من الألومنيوم المعالج لتوسيع منافذ اللابتوب بكفاءة: مخرج HDMI بدقة 4K@60Hz، منفذا USB-A بسرعة 5Gbps، قارئ بطاقات SD/microSD، ومنفذ شحن PD حتى 100 واط.',
    desc_en: 'Precision CNC aluminum hub expanding a single USB-C port into 4K@60Hz HDMI, dual 5Gbps USB-A ports, SD/microSD slots, and 100W Power Delivery pass-through charging.',
    price: 1350,
    disc: 18,
    img: '/src/assets/images/prod_usbc_hub_1795625682866.jpg',
    gallery: ['/src/assets/images/prod_usbc_hub_1795625682866.jpg']
  },
  {
    id: 'stand-alu',
    cat: 'stands',
    name_ar: 'حامل لابتوب ألومنيوم قابل للطي والتهوية',
    name_en: 'Foldable Ventilated Aluminum Laptop Stand',
    short_ar: 'زوايا ارتفاع متعددة وتصميم مفتوح لتبريد أفضل',
    short_en: 'Multi-angle ergonomic elevation with open airflow vents',
    desc_ar: 'حامل لابتوب مصنوع من سبائك الألومنيوم المتينة مع فتحات تهوية هندسية لخفض حرارة الجهاز أثناء العمل، وقواعد سيليكون مانعة للانزلاق، يطوى بسهولة للحمل في الحقيبة.',
    desc_en: 'Sturdy anodized aluminum laptop riser with ventilated cutouts for passive heat dissipation, anti-slip silicone pads, and a flat-fold hinge for effortless portability.',
    price: 840,
    disc: 15,
    img: '/src/assets/images/prod_laptop_stand_1795625683449.jpg',
    gallery: ['/src/assets/images/prod_laptop_stand_1795625683449.jpg']
  }
];

const COUPONS = [
  { code: 'RAQEEM10', pct: 10 },
  { code: 'WELCOME15', pct: 15 },
  { code: 'PRO20', pct: 20 }
];

function loadState() {
  const initial = {
    users: {},
    orders: {},
    tickets: [],
    reviews: {
      'gan-100w': [
        { name: 'أحمد سامي', rate: 5, text: 'شاحن ممتاز جداً وبيشحن اللابتوب والموبايل بسرعة بدون سخونة.', at: Date.now() - 86400000 * 3 },
        { name: 'Mahmoud Adel', rate: 5, text: 'Build quality is solid and the braided cable is super durable.', at: Date.now() - 86400000 * 1 }
      ],
      'sleeve-15': [
        { name: 'سارة محمد', rate: 5, text: 'خامة محترمة وتبطين ممتاز بيحمي الجهاز في السفر.', at: Date.now() - 86400000 * 2 }
      ],
      'mech-75': [
        { name: 'كريم طارق', rate: 5, text: 'صوت المفاتيح هادئ ومريح في الكتابة والبرمجة.', at: Date.now() - 86400000 * 4 }
      ]
    }
  };
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return { ...initial, ...parsed, reviews: { ...initial.reviews, ...(parsed.reviews || {}) } };
    }
  } catch {}
  return initial;
}

const state = loadState();
function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state));
  } catch {}
}

function hashPw(pw) {
  return crypto.createHash('sha256').update(String(pw)).digest('hex');
}

app.get('/api/catalog', (_req, res) => {
  res.json({ categories: CATEGORIES, products: PRODUCTS });
});

app.get('/api/reviews/:pid', (req, res) => {
  const list = state.reviews[req.params.pid] || [];
  res.json([...list].sort((a, b) => b.at - a.at));
});

app.post('/api/reviews/:pid', (req, res) => {
  const { name, text, rate, uid } = req.body || {};
  if (!name || !text) return res.status(400).json({ error: 'missing_fields' });
  const pid = req.params.pid;
  if (!state.reviews[pid]) state.reviews[pid] = [];
  const item = {
    pid,
    uid: uid || 'guest',
    name: String(name).trim().slice(0, 60),
    text: String(text).trim().slice(0, 500),
    rate: Math.min(5, Math.max(1, Number(rate) || 5)),
    at: Date.now()
  };
  state.reviews[pid].unshift(item);
  saveState();
  res.json(item);
});

app.post('/api/coupons/apply', (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  const found = COUPONS.find((c) => c.code === code);
  if (!found) return res.status(404).json({ error: 'invalid_code' });
  res.json(found);
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, f1, f2, f3, phone, addr } = req.body || {};
  const em = String(email || '').trim().toLowerCase();
  if (!em || !password || String(password).length < 6) {
    return res.status(400).json({ error: 'invalid_input' });
  }
  if (Object.values(state.users).some((u) => u.email === em)) {
    return res.status(409).json({ error: 'email_exists' });
  }
  const uid = 'u_' + crypto.randomBytes(6).toString('hex');
  const user = { uid, email: em, pwHash: hashPw(password), f1, f2, f3, phone, addr };
  state.users[uid] = user;
  saveState();
  const { pwHash: _, ...safeUser } = user;
  res.json(safeUser);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const em = String(email || '').trim().toLowerCase();
  const user = Object.values(state.users).find((u) => u.email === em);
  if (!user || user.pwHash !== hashPw(password)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const { pwHash: _, ...safeUser } = user;
  res.json(safeUser);
});

app.put('/api/auth/profile/:uid', (req, res) => {
  const uid = req.params.uid;
  const existing = state.users[uid] || { uid };
  const { f1, f2, f3, phone, addr, email } = req.body || {};
  state.users[uid] = {
    ...existing,
    uid,
    email: email || existing.email || '',
    f1, f2, f3, phone, addr
  };
  saveState();
  const { pwHash: _, ...safeUser } = state.users[uid];
  res.json(safeUser);
});

app.post('/api/orders', (req, res) => {
  const o = req.body || {};
  if (!o.items || !o.items.length || !o.addr) {
    return res.status(400).json({ error: 'invalid_order' });
  }
  const id = 'RQ' + crypto.randomBytes(3).toString('hex').toUpperCase();
  const order = {
    id,
    uid: o.uid || 'guest',
    items: o.items,
    sub: Number(o.sub) || 0,
    disc: Number(o.disc) || 0,
    coupon: o.coupon || '',
    delivery: Number(o.delivery) || 0,
    total: Number(o.total) || 0,
    name: o.name || '',
    phone: o.phone || '',
    email: o.email || '',
    addr: o.addr,
    pay: o.pay || 'vodafone',
    ref: '',
    proof: '',
    payStatus: 'unpaid',
    status: 0,
    at: Date.now()
  };
  state.orders[id] = order;
  saveState();
  res.json(order);
});

app.get('/api/orders', (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.json([]);
  const list = Object.values(state.orders)
    .filter((o) => o.uid === uid)
    .sort((a, b) => b.at - a.at);
  res.json(list);
});

app.get('/api/orders/:id', (req, res) => {
  const order = state.orders[req.params.id];
  if (!order) return res.status(404).json({ error: 'not_found' });
  res.json(order);
});

app.post('/api/orders/:id/pay', (req, res) => {
  const order = state.orders[req.params.id];
  if (!order) return res.status(404).json({ error: 'not_found' });
  const { ref, proof } = req.body || {};
  if (!ref && !proof) return res.status(400).json({ error: 'missing_proof' });
  order.ref = String(ref || '').trim();
  order.proof = String(proof || '');
  order.payStatus = 'pending';
  order.status = Math.max(order.status, 1);
  saveState();
  res.json(order);
});

app.post('/api/tickets', (req, res) => {
  const { name, phone, email, msg } = req.body || {};
  if (!name || !msg) return res.status(400).json({ error: 'missing_fields' });
  const ticket = {
    id: 'TK-' + crypto.randomBytes(2).toString('hex').toUpperCase(),
    name: String(name).trim(),
    phone: String(phone || '').trim(),
    email: String(email || '').trim(),
    msg: String(msg).trim(),
    at: Date.now()
  };
  state.tickets.push(ticket);
  saveState();
  res.json(ticket);
});

app.get('/index', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`raqeem server listening on http://0.0.0.0:${PORT}`);
});
