/* Avrupa Cepte — v1 Animasyon Akışı & Vektör Vitrini */
'use strict';

function eob(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}
function eoe(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function c01(x) { return Math.max(0, Math.min(1, x)); }

const A = 'assets/';

// 4 Mobil Tanıtım Sahnesi
// Sahne 01: 5sn, Sahne 02: 5sn, Sahne 03 (Son tanıtım ekranı): 10sn, Sahne 04 (Modal): 10sn
const scenes = [
  {
    title: 'Gönderini daha fazla<br>kişiye ulaştır.',
    subtitle: 'Ürününü veya hizmetini Avrupa Cepte akışında görünür kıl.',
    duration: 5,
    sidebarHeading: 'Bir paylaşımla<br>başlar.',
    sidebarDesc: 'Görünür ol. Bağ kur.<br>Sesini Avrupa’ya duyur.',
    noteTitle: 'Dikkat, doğalca<br>üzerinde.',
    note: 'Paylaşım merkezden büyüyerek açılır; ardından baloncuklar sırayla belirir.'
  },
  {
    title: 'İlgili topluluklara<br>ulaş.',
    subtitle: 'Tanıtımını yayınlamak istediğin sayfaları seç. İlgili toplulukta yer al.',
    duration: 5,
    sidebarHeading: 'Hedefe yönelik<br>topluluklar.',
    sidebarDesc: 'İlgili sayfaları seç.<br>Doğrudan hedef kitlende ol.',
    noteTitle: 'Ayrık ağ &<br>canlı topluluklar.',
    note: 'Baloncukların altından geçen esnek bağlantı yolları ve topluluklar arası ışık paketleri.'
  },
  {
    title: 'Sesin Avrupa’da<br>yankılansın.',
    subtitle: 'Paylaşımın şehirleri aşsın. Avrupa’daki insanlar seni duysun.',
    duration: 10,
    sidebarHeading: 'Sınırları aşan<br>bir etki.',
    sidebarDesc: 'Küre yaklaşır, şehirler aydınlanır.<br>Başarın verilerle taçlanır.',
    noteTitle: 'Görkemli yayılım &<br>başarı hissi.',
    note: 'Küre merkezden bize doğru yaklaşarak yerini başarı grafiğine ve onay anına bırakır. Canlı sayaçlar, katılım bildirimleri ve nabız efektleri anın heyecanını taşır.'
  }
];

let active = 0, playing = !matchMedia('(prefers-reduced-motion:reduce)').matches;
let auto = false, all = false, speed = 1, time = 0, motionTime = 0, last = 0, land = null;
let sceneRealTime = 0;
let globeVis = 1;

const bubbles = [[], [], []], phones = [], canvases = [], contexts = [];
const $ = s => document.querySelector(s);
function el(tag, cls, html = '') {
  const e = document.createElement(tag);
  e.className = cls;
  e.innerHTML = html;
  return e;
}

function makeBubble(scene, { x, y, size, src, tint = '#b6d1ff', glass, cls = '', label = '', html = '', amp = 6, phase = 0, photoStyle = '' }) {
  const div = el('div', `bubble ${cls}`,
    (src ? `<img class="bubble-photo" style="${photoStyle}" src="${A + src}" alt="">` : '') +
    (glass ? `<img class="bubble-glass" src="${A + glass}" alt="">` : `<div class="orb-shine" style="--orb-tint:${tint}"></div>`) +
    label + html);
  div.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;opacity:${scene === 0 ? '0' : '1'};`;
  phones[scene].querySelector('.phone-art').append(div);
  const b = {
    e: div, x, y, size, amp, phase,
    cx: x + size / 2, cy: y + size / 2,
    scale: 1,
    photoEl: div.querySelector('.bubble-photo'),
    labelEl: div.querySelector('.topic-label')
  };
  bubbles[scene].push(b);
  return b;
}

// 4 Telefon Çerçevesini Oluştur
scenes.forEach((s, i) => {
  const wrap = el('div', `phone-wrap${i === 0 ? ' active' : ''}`);
  wrap.dataset.scene = i;

  let phone;
  if (i < 3) {
    // Sahne 01, 02, 03: Standart Telefon Çerçevesi
    // SADECE SON EKRANDA (Sahne 03, i === 2) BUTON ÇIKAR!
    const isFinalTanitim = (i === 2);
    const canvasClass = (i === 1) ? 'network-canvas' : (i === 2) ? 'globe-canvas' : 'canvas-s0';

    phone = el('article', 'phone',
      `<div class="status" aria-hidden="true"><span>9:41</span><span class="status-levels"><img src="${A}s0-imgCellularConnection.svg" alt=""><img src="${A}s0-imgWifi.svg" alt=""><span class="battery"></span></span></div>` +
      `<nav class="phone-nav"><strong>Tanıtım Nedir?</strong>${!isFinalTanitim ? '<button class="skip" aria-label="Son sahneye geç">Atla</button>' : ''}</nav>` +
      `<div class="progress-segments" aria-hidden="true"><span><i></i></span><span><i></i></span><span><i></i></span></div>` +
      `<h2>${s.title}</h2><p class="subtitle">${s.subtitle}</p>` +
      `<div class="phone-art" role="img" aria-label="Sahne ${i + 1}"><canvas class="${canvasClass}" aria-hidden="true"></canvas></div>` +
      (isFinalTanitim ? `<div class="phone-footer"></div><button class="phone-cta">Tanıtım oluştur</button>` : ''));
    
    const skipBtn = phone.querySelector('.skip');
    if (skipBtn) skipBtn.onclick = () => selectScene(2);
    
    if (isFinalTanitim) {
      phone.querySelector('.phone-cta').onclick = () => toast('Tanıtım oluşturma akışı başlatılıyor…');
    }

    const cv = phone.querySelector('canvas'), dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = 393 * dpr; cv.height = 852 * dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    canvases.push(cv); contexts.push(ctx);
  }

  phone.setAttribute('aria-label', `Sahne ${i + 1}`);
  wrap.append(phone);
  $('#phones').append(wrap);
  phones.push(phone);
});

/* ── SAHNE 1 (01 Görünür ol): Başlangıç Gönderi & Metrikler ── */
makeBubble(0, { x: 5, y: 304, size: 56, src: 's0-imgImage1.png', tint: '#93bcff', cls: 'flag', phase: 1, amp: 4 });
makeBubble(0, { x: 313, y: 249, size: 117, src: 's0-imgImage3.png', tint: '#fe9ab8', cls: 'flag', phase: 3, amp: 5 });
const post = el('div', 'post-card',
  `<div class="post-header"><img class="post-avatar" src="${A}s0-imgImage159.png" alt=""><strong>Berlin Vize Danışmanlık</strong><span class="post-tag">Tanıtım</span></div>` +
  `<p class="post-copy">Mavi Kart ve oturum başvurularında uçtan uca danışmanlık. İlk görüşme ücretsiz.</p>` +
  `<div class="post-cover"><img src="${A}s0-imgImage160.png" alt=""><span class="visit">Ziyaret et ↗</span></div>`);
post.style.opacity = '0';
phones[0].querySelector('.phone-art').append(post);
makeBubble(0, { x: 14, y: 431, size: 155, cls: 'metric shadow', tint: '#baf4ff', phase: .4, html: `<img src="${A}people.png" alt=""><span>10 binlerce<br>ziyaret</span>`, amp: 8 });
makeBubble(0, { x: 188, y: 595, size: 151, cls: 'metric orange shadow', tint: '#ffca92', phase: 2, html: `<img src="${A}eye.png" alt=""><span>25.500<br>Görüntülenme</span>`, amp: 7 });
makeBubble(0, { x: 5, y: 622, size: 91, src: 's0-imgImage5.png', tint: '#a40003aa', cls: 'flag shadow', phase: 3.8, amp: 5 });
makeBubble(0, { x: 178, y: 294, size: 55, src: 's0-imgImage7.png', tint: '#c3ffbf', cls: 'flag shadow', phase: 1.5, amp: 4 });

/* ── SAHNE 2 (02 Topluluğuna ulaş): ORİJİNAL AĞ & BALONLARIN ALTINDA KALAN BAĞLANTILAR ── */
const net = [];

// Topluluk hapları: ülkelerde dairesel bayrak görseli, konularda doğru emoji.
function flagIcon(src, alt) {
  return `<img class="pill-flag" src="${A + src}" alt="${alt}">`;
}
function emojiIcon(e) {
  return `<span class="pill-emoji">${e}</span>`;
}
function commPill(iconHTML, name, big = false) {
  return `<span class="topic-label${big ? ' big' : ''}">${iconHTML}${name}</span>`;
}
const PILL_NL = () => commPill(flagIcon('flag-netherlands.svg', 'Hollanda bayrağı'), 'Hollanda');
const PILL_DE = () => commPill(flagIcon('flag-germany.svg', 'Almanya bayrağı'), 'Berlin');
const PILL_ER = () => commPill(emojiIcon('🎓'), 'Erasmus');
const PILL_DO = (big = false) => commPill(emojiIcon('⛰️'), 'Doğa', big);
// Orijinal Figma baloncuk hiyerarşisi ve cam katmanları
net.push(makeBubble(1, { x: 20, y: 329, size: 90, src: 's1-imgImage173.png', glass: 's1-imgFrame2121316838.svg', label: PILL_NL(), phase: .3, photoStyle: 'transform:scaleX(-1);', amp: 6 }));
net.push(makeBubble(1, { x: 144, y: 343, size: 39, src: 's1-imgImage3.png', glass: 's1-imgFrame2121316846.svg', cls: 'flag', phase: 2, amp: 5 }));
net.push(makeBubble(1, { x: 197, y: 309, size: 165, src: 's1-imgImage175.png', glass: 's1-imgFrame2121316839.svg', label: PILL_ER(), phase: 1, amp: 5 }));
net.push(makeBubble(1, { x: 74, y: 436, size: 114, src: 's1-imgGroup5.svg', glass: 's1-imgFrame2121316840.svg', phase: 0, amp: 8 }));
net.push(makeBubble(1, { x: 36, y: 567, size: 74, src: 's1-imgImage174.png', glass: 's1-imgFrame2121316842.svg', label: PILL_DE(), phase: 2.7, amp: 6 }));
net.push(makeBubble(1, { x: 163, y: 511, size: 222, src: 's1-imgImage176.png', glass: 's1-imgFrame2121316841.svg', label: PILL_DO(true), phase: 4, amp: 6 }));
net.push(makeBubble(1, { x: -78, y: 679, size: 301, src: 's1-imgImage1.png', glass: 's1-imgFrame2121316843.svg', cls: 'flag', phase: 1, amp: 8 }));
[[22, 447], [122, 645], [366, 474]].forEach(([x, y], i) => net.push(makeBubble(1, { x, y, size: 18, glass: 's1-imgFrame2121316844.svg', phase: i + 1, amp: 5 })));

// Orijinal Ağ Hatları (Bağlantılar Kesinlikle Balonların Altından Geçer)
const edges = [
  [0, 1], [1, 3], [3, 2], [3, 4], [3, 5],
  [4, 8], [7, 4], [7, 6], [8, 6], [5, 6],
  [9, 3], [0, 7]
];

/* ── SAHNE 3 (03 Sesini duyur): KÜRE MERKEZİ [196.5, 514], +340% VEKTÖR VE ONAY SAHNESİ ── */
const engageCard = el('div', 'engage-card',
  `<div class="ec-head"><img src="${A}s0-imgImage159.png" alt=""><span>Berlin Vize Danışmanlık</span><span class="ec-live"><i></i><b class="ec-viewers">118</b>&nbsp;canlı</span></div>` +
  `<div class="ec-growth"><span class="ec-pct">+0%</span><span class="ec-sub">Etkileşim artışı</span></div>` +
  `<div class="ec-track"><div class="ec-fill"></div></div>` +
  `<div class="ec-stat"><span class="ec-views">+8.400</span> görüntülenme • <span class="ec-likes">1.100</span> upvote</div>`);
engageCard.style.cssText = 'opacity:0;transform:translateY(20px) scale(.95)';
phones[2].querySelector('.phone-art').append(engageCard);
const ecPct = engageCard.querySelector('.ec-pct');
const ecFill = engageCard.querySelector('.ec-fill');
const ecViewers = engageCard.querySelector('.ec-viewers');
const ecViews = engageCard.querySelector('.ec-views');
const ecLikes = engageCard.querySelector('.ec-likes');

const spDefs = [
  { x: -110, y: -90, c: '#ffcc00', s: 24, d: 0 }, { x: 0, y: -120, c: '#00aaff', s: 28, d: .1 }, { x: 110, y: -90, c: '#ff9900', s: 26, d: .05 },
  { x: 125, y: 10, c: '#ffcc00', s: 22, d: .15 }, { x: 105, y: 105, c: '#44ffff', s: 30, d: .08 }, { x: 0, y: 130, c: '#ff8800', s: 24, d: .12 },
  { x: -105, y: 105, c: '#ffcc00', s: 28, d: .02 }, { x: -125, y: 10, c: '#00bbff', s: 24, d: .18 }
];
const checkScene = el('div', 'check-scene',
  `<div class="sparkles-bg">` +
  spDefs.map((s, i) => `<span class="sp" data-x="${s.x}" data-y="${s.y}" style="color:${s.c};font-size:${s.s}px;animation-delay:${s.d}s">${i % 2 === 0 ? '✦' : '★'}</span>`).join('') +
  `</div>` +
  `<div class="check-ring">` +
  `<svg class="check-svg" viewBox="0 0 90 90" fill="none">` +
  `<circle class="cc" cx="45" cy="45" r="38" stroke="#0055ff" stroke-width="5.5" stroke-linecap="round" stroke-dasharray="239" stroke-dashoffset="239"/>` +
  `<path class="cp" d="M25,45 L38,60 L65,28" stroke="#0055ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="68" stroke-dashoffset="68"/>` +
  `</svg>` +
  `</div>` +
  `<div class="check-text-wrap">` +
  `<p class="check-title">Tanıtımın tamamlandı!</p>` +
  `<p class="check-sub">Gönderin Avrupa genelinde <span class="check-count">0</span> kişiye ulaştı.</p>` +
  `</div>`);
checkScene.style.cssText = 'opacity:0;transform:translate(-50%,-50%) scale(.8)';
phones[2].querySelector('.phone-art').append(checkScene);
const ccEl = checkScene.querySelector('.cc');
const cpEl = checkScene.querySelector('.cp');
const checkCount = checkScene.querySelector('.check-count');
const spEls = [...checkScene.querySelectorAll('.sp')];
const s2CtaBtn = phones[2].querySelector('.phone-cta');
if (s2CtaBtn) {
  s2CtaBtn.style.opacity = '0';
  s2CtaBtn.style.transform = 'translateY(24px)';
  s2CtaBtn.style.pointerEvents = 'none';
}

// Küre evresine sığan tek-slot bildirim akışı: emojili avatar + el yapımı vektör etkileşim ikonu.
// Grafik kartı (3.0sn) çıkmadan bildirimler sahneden çekilir, çakışma olmaz.
const VJOIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8" r="3.4"/><path d="M3.5 19.5c.8-3.6 3.4-5.8 6.5-5.8s5.7 2.2 6.5 5.8"/><path d="M19 7.5v6M16 10.5h6"/></svg>';
const VSHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.6"/><circle cx="17.5" cy="5.5" r="2.6"/><circle cx="17.5" cy="18.5" r="2.6"/><path d="M8.3 10.7l6.9-4.2M8.3 13.3l6.9 4.2"/></svg>';
const VUPVOTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5"/><path d="M5.5 11.5L12 5l6.5 6.5"/></svg>';
const notifData = [
  { emoji: '👩🏻', bg: '#ffe4ec', name: 'Elif', text: 'Hollanda topluluğuna katıldı', icon: VJOIN, tint: '#0a7a42', chip: '#e9faf0' },
  { emoji: '🧔🏻', bg: '#e3ecff', name: 'Mert', text: 'Berlin sayfasında paylaştı', icon: VSHARE, tint: '#0055ff', chip: '#eef3ff' },
  { emoji: '👩🏻‍🎓', bg: '#fff3d6', name: 'Sofia', text: 'Erasmus grubunda upvote verdi', icon: VUPVOTE, tint: '#ea580c', chip: '#ffedd5' }
];
const liveStack = el('div', 'live-stack',
  notifData.map(n => `<div class="live-notif"><span class="ln-ava" style="background:${n.bg}">${n.emoji}</span><span class="ln-body"><strong>${n.name}</strong><small>${n.text}</small></span><span class="ln-chip" style="color:${n.tint};background:${n.chip}">${n.icon}</span></div>`).join(''));
liveStack.style.opacity = '0';
phones[2].querySelector('.phone-art').append(liveStack);
const notifEls = [...liveStack.querySelectorAll('.live-notif')];

// Grafik kartı görünürken kartın içinden yükselen tepki emojileri.
const reactData = ['⬆️', '🔥', '👏', '🎉', '⭐', '💯'];
const reactPos = [[6, 22], [22, 17], [38, 19], [58, 21], [74, 16], [88, 18]];
const reactLayer = el('div', 'react-layer',
  reactData.map((r, j) => `<span class="react" style="left:${reactPos[j][0]}%;font-size:${reactPos[j][1]}px">${r}</span>`).join(''));
reactLayer.style.opacity = '0';
phones[2].querySelector('.phone-art').append(reactLayer);
const reactEls = [...reactLayer.querySelectorAll('.react')];

// 10 Saniyelik Sahne 3 Zamanlama Sabitleri
const GFOUT = 3.5, GFDUR = 1.3;
const ESTART = 4.2, EDUR = 1.8;
const EHIDE = 6.8, EHIDEDUR = 0.5;
const CSTART = 7.0;

function dot(ctx, x, y, r, color) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
function glow(ctx, x, y, r = 16, alpha = .32) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(36,114,255,${alpha})`);
  g.addColorStop(1, 'rgba(67,130,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function qp(a, b, c, t) {
  const n = 1 - t;
  return [n * n * a[0] + 2 * n * t * b[0] + t * t * c[0], n * n * a[1] + 2 * n * t * b[1] + t * t * c[1]];
}
function pkt(ctx, a, b, c, p, outerAlpha = 1, col = '#fff', r = 2.4) {
  if (outerAlpha < 0.01) return;
  for (let k = 12; k >= 0; k--) {
    const u = p - k * .006;
    if (u < 0 || u > 1) continue;
    const pos = qp(a, b, c, u);
    ctx.globalAlpha = (1 - k / 13) * .7 * outerAlpha;
    dot(ctx, ...pos, r * (1 - k / 20), '#4489ff');
  }
  ctx.globalAlpha = outerAlpha;
  const pt = qp(a, b, c, p);
  glow(ctx, ...pt, 10, .6 * outerAlpha);
  dot(ctx, ...pt, r + 1, '#77aaff');
  dot(ctx, ...pt, r * .64, col);
  ctx.globalAlpha = 1;
}

const STAGGER = {
  0: { start: 0.25, step: 0.12 },
  1: { start: 0, step: 0 },
  2: { start: 99, step: 0 },
  3: { start: 99, step: 0 }
};

function moveBubbles(si, t, iT) {
  if (si === 1) {
    bubbles[1].forEach((b) => {
      const f = t * .65 + b.phase;
      const dx = Math.sin(f) * b.amp * .7, dy = Math.sin(f * .83 + b.phase) * b.amp;
      b.scale = 1 + Math.sin(f * .9) * 0.024;
      b.cx = b.x + b.size / 2 + dx;
      b.cy = b.y + b.size / 2 + dy;
      b.e.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${b.scale.toFixed(4)})`;
      b.e.style.opacity = '1';
    });
    return;
  }

  const cfg = STAGGER[si];
  if (!cfg || !bubbles[si]) return;
  const { start, step } = cfg;

  bubbles[si].forEach((b, j) => {
    const f = t * .65 + b.phase;
    const dx = Math.sin(f) * b.amp * .7, dy = Math.sin(f * .83 + b.phase) * b.amp;
    const pulseScale = 1 + Math.sin(t * 2.2 + b.phase) * 0.035;
    b.scale = pulseScale;
    b.cx = b.x + b.size / 2 + dx; b.cy = b.y + b.size / 2 + dy;

    const delay = start + j * step;
    const io = c01((iT - delay) / .3);
    b.e.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${(b.scale * eob(c01((iT - delay) / .6))).toFixed(4)})`;
    b.e.style.opacity = io;
  });
}

// Orijinal Ağ Çizimi: Çizgiler ve ışık paketleri KESİNLİKLE baloncukların altından akar
function drawNetwork(t, iT) {
  const ctx = contexts[1];
  ctx.clearRect(0, 0, 393, 852);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 307, 393, 545);
  ctx.clip();

  edges.forEach(([from, to], i) => {
    const a = net[from], c = net[to];
    if (!a || !c) return;
    const p0 = [a.cx, a.cy], p2 = [c.cx, c.cy];
    const bend = Math.sin(t * .5 + i) * 10;
    const p1 = [(a.cx + c.cx) / 2 + bend, (a.cy + c.cy) / 2 - 8 + Math.cos(i) * 10];

    ctx.beginPath();
    ctx.moveTo(...p0);
    ctx.quadraticCurveTo(...p1, ...p2);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#b4ccff';
    ctx.setLineDash([5, 6]);
    ctx.lineDashOffset = -t * 3;
    ctx.stroke();
    ctx.setLineDash([]);

    let p = (t / (2.3 + (i % 3) * .7) + i * .213) % 1;
    if (i % 2) p = 1 - p;
    pkt(ctx, p0, p1, p2, p, 1, '#ffffff', 2.4);

    const arrival = (t / (2.3 + (i % 3) * .7) + i * .213) % 1;
    if (arrival > .8) {
      const target = (i % 2) ? a : c, k = (arrival - .8) / .2;
      ctx.strokeStyle = `rgba(72,130,255,${(1 - k) * .35})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(target.cx, target.cy, (target.size / 2) * target.scale + 4 + k * 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  ctx.restore();
}

const sphere = { type: 'Sphere' }, grat = d3.geoGraticule().step([18, 14])();
const eCities = [
  { coords: [13.405, 52.52], name: 'Berlin' },
  { coords: [-.128, 51.507], name: 'Londra' },
  { coords: [2.352, 48.856], name: 'Paris' },
  { coords: [4.904, 52.367], name: 'Amsterdam' },
  { coords: [12.496, 41.903], name: 'Roma' },
  { coords: [-3.704, 40.417], name: 'Madrid' },
  { coords: [16.373, 48.208], name: 'Viyana' },
  { coords: [18.068, 59.329], name: 'Stokholm' }
];

// KÜRE MERKEZİ: [196.5, 514] (Orijinal Figma ve viewport optik merkezi)
const proj = d3.geoOrthographic().scale(165).translate([196.5, 514]).clipAngle(90);

function drawScene3(t, iT) {
  const ctx = contexts[2];
  ctx.clearRect(0, 0, 393, 852);
  const fIn = c01(iT / .4);
  const zoomP = c01((iT - GFOUT) / GFDUR);
  const fOut = 1 - zoomP;
  globeVis = fIn * fOut;

  if (globeVis > 0.008) {
    ctx.save();
    // Tam merkezden [196.5, 514] kullanıcıya doğru yaklaşarak büyüme
    const zoomScale = 1.0 + Math.pow(zoomP, 2.2) * 2.2;
    ctx.translate(196.5, 514);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-196.5, -514);

    const drift = Math.sin(t * .27) * 3;
    proj.rotate([-13 - drift, -40, 0]);
    const path = d3.geoPath(proj, ctx);
    const gv = globeVis;

    // Atmosferik Mavi Hale
    const hz = ctx.createRadialGradient(196, 508, 100, 196, 508, 206);
    hz.addColorStop(0, 'rgba(50,121,250,0.18)');
    hz.addColorStop(.8, 'rgba(150,190,255,0.12)');
    hz.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = gv; ctx.fillStyle = hz; ctx.fillRect(0, 308, 393, 410);

    // Yörünge Halkası
    ctx.save(); ctx.globalAlpha = gv * .4;
    ctx.beginPath(); ctx.ellipse(196.5, 514, 200, 64, t * .1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100,170,255,0.6)'; ctx.lineWidth = 1; ctx.setLineDash([4, 8]);
    ctx.lineDashOffset = -t * 12; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();

    // Küre Okyanus Gövdesi
    ctx.save();
    ctx.save(); ctx.shadowColor = '#4d83d531'; ctx.shadowBlur = 25; ctx.shadowOffsetY = 17;
    ctx.beginPath(); path(sphere);
    const oc = ctx.createRadialGradient(150, 420, 20, 221, 529, 202);
    oc.addColorStop(0, '#ffffff'); oc.addColorStop(.5, '#edf5ff'); oc.addColorStop(1, '#8cbbff');
    ctx.globalAlpha = gv; ctx.fillStyle = oc; ctx.fill(); ctx.restore();

    // Kara Parçaları ve Izgara
    ctx.save(); ctx.beginPath(); path(sphere); ctx.clip();
    ctx.globalAlpha = gv * .75; ctx.beginPath(); path(grat); ctx.lineWidth = .65; ctx.strokeStyle = '#82a9e333'; ctx.stroke();
    if (land) {
      ctx.beginPath(); path(land);
      const lg = ctx.createLinearGradient(0, 350, 200, 670);
      lg.addColorStop(0, '#b3d3ff'); lg.addColorStop(.55, '#77adff'); lg.addColorStop(1, '#3e7ee6');
      ctx.globalAlpha = gv; ctx.fillStyle = lg; ctx.fill();
      ctx.globalAlpha = gv * .9; ctx.lineWidth = .7; ctx.strokeStyle = '#609ae4'; ctx.stroke();
    }
    ctx.globalAlpha = gv * .35; ctx.beginPath(); path(grat); ctx.strokeStyle = '#ffffff23'; ctx.lineWidth = .5; ctx.stroke();
    const sh = ctx.createRadialGradient(155, 404, 0, 190, 505, 175);
    sh.addColorStop(0, '#ffffff45'); sh.addColorStop(.75, '#ffffff00'); sh.addColorStop(1, '#135aff14');
    ctx.fillStyle = sh; ctx.fillRect(20, 345, 353, 340); ctx.restore();
    ctx.globalAlpha = gv; ctx.beginPath(); path(sphere); ctx.lineWidth = 1; ctx.strokeStyle = '#cadfff'; ctx.stroke();
    ctx.restore();

    // İstanbul Merkezli Çıkış Hattı
    const ori = proj([28.98, 41.01]);
    const root = [205 + Math.sin(t * .8) * 2, 661 + Math.sin(t * .6) * 3], stem = [260, 598];
    ctx.globalAlpha = gv * .5; ctx.beginPath(); ctx.moveTo(...root); ctx.quadraticCurveTo(...stem, ...ori); ctx.strokeStyle = '#5892ff55'; ctx.lineWidth = 1.5; ctx.stroke();
    pkt(ctx, root, stem, ori, (t * .35) % 1, gv, '#fff', 2.2);

    // Avrupa Şehirlerine Ulaşan Işık Hatları
    eCities.forEach((item, i) => {
      const end = proj(item.coords);
      if (!end) return;
      const ctrl = [(ori[0] + end[0]) / 2 + (i % 2 ? 18 : -23), (ori[1] + end[1]) / 2 - 38 - (i % 3) * 8];
      ctx.globalAlpha = gv * (i < 4 ? .6 : .35);
      ctx.beginPath(); ctx.moveTo(...ori); ctx.quadraticCurveTo(...ctrl, ...end);
      ctx.strokeStyle = i < 4 ? '#307fff65' : '#6099ff45'; ctx.lineWidth = i < 4 ? 1.5 : 1; ctx.stroke();
      pkt(ctx, ori, ctrl, end, (t * .3 - i * .1 + 10) % 1, gv, '#fff', i < 4 ? 2 : 1.6);
      const rp = (t * .48 + i * .21) % 1;
      ctx.globalAlpha = gv * (1 - rp) * .35; ctx.beginPath(); ctx.arc(...end, 3 + rp * 13, 0, Math.PI * 2); ctx.lineWidth = 1; ctx.strokeStyle = `rgba(27,98,247,${(1 - rp) * .35})`; ctx.stroke();
      ctx.globalAlpha = gv * .25; glow(ctx, ...end, 12, 1);
      ctx.globalAlpha = gv; dot(ctx, ...end, 3.1, '#fff'); dot(ctx, ...end, 1.8, '#0055ff');
    });

    for (let j = 0; j < 3; j++) {
      const r = (t * .28 + j / 3) % 1;
      ctx.globalAlpha = gv * (1 - r) * .3; ctx.beginPath(); ctx.arc(...ori, 6 + r * 31, 0, Math.PI * 2); ctx.strokeStyle = `rgba(0,85,255,${(1 - r) * .3})`; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.globalAlpha = gv * .6; glow(ctx, ...ori, 24, 1); ctx.globalAlpha = gv; dot(ctx, ...ori, 6, '#fff'); dot(ctx, ...ori, 3.8, '#0055ff');
    ctx.restore();
  }

  /* Dev Engage Kartı (4.2s - 6.8s) */
  const eShow = eob(c01((iT - ESTART) / .55));
  const eHide = c01((iT - EHIDE) / EHIDEDUR);
  const eA = eShow * (1 - eHide);
  engageCard.style.opacity = eA;
  engageCard.style.transform = `translateY(${(1 - eShow) * 20}px) scale(${.95 + eShow * .05})`;

  /* Tepki emojileri kart görünürken yükselir, kartla birlikte kaybolur. */
  reactLayer.style.opacity = eA.toFixed(2);
  if (eA > .01) {
    reactEls.forEach((rEl, j) => {
      const cyc = (t * .5 + j * .37) % 1;
      const fade = Math.sin(cyc * Math.PI);
      rEl.style.transform = `translate(${(Math.sin(cyc * 5 + j) * 10).toFixed(1)}px,${(-cyc * 110).toFixed(1)}px) scale(${(0.7 + cyc * 0.6).toFixed(2)})`;
      rEl.style.opacity = (fade * eA).toFixed(2);
    });
  }
  const barP = eoe(c01((iT - ESTART - .2) / EDUR));
  ecFill.style.width = `${barP * 100}%`;
  ecPct.textContent = `+${Math.round(barP * 340)}%`;

  /* Canlı sayaçlar: izleyici, görüntülenme ve upvote her karede nefes alır. */
  const viewers = Math.max(0, Math.round(118 + iT * 7 + Math.sin(t * 1.3) * 12 + Math.sin(t * .7) * 8));
  if (viewers !== drawScene3._v) { drawScene3._v = viewers; ecViewers.textContent = viewers; }
  const views = Math.round(8400 + barP * 900 + Math.sin(t * 2.1) * 14);
  if (views !== drawScene3._vw) { drawScene3._vw = views; ecViews.textContent = '+' + views.toLocaleString('tr-TR'); }
  const likes = Math.round(1100 + barP * 320 + Math.sin(t * 1.7) * 4);
  if (likes !== drawScene3._lk) { drawScene3._lk = likes; ecLikes.textContent = likes.toLocaleString('tr-TR'); }

  /* Bildirimler tek slotta sırayla: 0.5sn'de başlar, grafik kartından önce (3.8sn) biter. */
  const NOTIF_T0 = .5, NOTIF_SLOT = 1.1;
  const niT = iT - NOTIF_T0;
  const showNotifs = niT > 0 && niT < notifEls.length * NOTIF_SLOT - .1;
  liveStack.style.opacity = showNotifs ? '1' : '0';
  if (showNotifs) {
    notifEls.forEach((nEl, k) => {
      const local = niT - k * NOTIF_SLOT;
      const appear = eob(c01(local / .3)), vanish = c01((local - (NOTIF_SLOT - .12)) / .12);
      const p = appear * (1 - vanish);
      nEl.style.opacity = p.toFixed(2);
      nEl.style.transform = `translateX(${((1 - appear) * 52).toFixed(1)}px) scale(${(0.92 + 0.08 * appear).toFixed(3)})`;
    });
  }

  /* Enerjik Sparkles & Checkmark Sahnesi (7.0s - 10.0s) */
  const cS = eob(c01((iT - CSTART) / .65));
  checkScene.style.opacity = cS;
  checkScene.style.transform = `translate(-50%,-50%) scale(${(.8 + cS * .2).toFixed(3)})`;
  const ccN = Math.round(eoe(c01((iT - CSTART - .8) / 1.2)) * 25000);
  if (ccN !== drawScene3._cc) { drawScene3._cc = ccN; checkCount.textContent = ccN.toLocaleString('tr-TR'); }
  if (ccEl) ccEl.style.strokeDashoffset = 239 * (1 - eoe(c01((iT - CSTART) / .75)));
  if (cpEl) cpEl.style.strokeDashoffset = 68 * (1 - eoe(c01((iT - CSTART - .5) / .45)));
  spEls.forEach((sp, i) => {
    const dx = parseFloat(sp.dataset.x), dy = parseFloat(sp.dataset.y);
    const p = eob(c01((iT - CSTART - .3 - i * .04) / .45));
    const pulseP = Math.sin(t * 5 + i) * 0.2;
    sp.style.opacity = Math.min(1, p);
    sp.style.transform = `translate(calc(-50% + ${(dx * p).toFixed(1)}px),calc(-50% + ${(dy * p).toFixed(1)}px)) scale(${(p * (1 + pulseP)).toFixed(3)}) rotate(${(t * 80 + i * 30).toFixed(0)}deg)`;
  });

  // SADECE SON EKRANDA BUTONUN ÇIKIŞI (7.8s anında akıcı kayarak belirir)
  if (s2CtaBtn) {
    const btnP = eob(c01((iT - 7.8) / .55));
    s2CtaBtn.style.opacity = btnP.toFixed(2);
    s2CtaBtn.style.transform = `translateY(${((1 - btnP) * 20).toFixed(1)}px)`;
    s2CtaBtn.style.pointerEvents = btnP > 0.5 ? 'auto' : 'none';
  }
}

function render(t) {
  const iT = sceneRealTime;
  const curDur = scenes[active].duration;
  const pRatio = c01(time / curDur);

  // Yukarıdaki ilerleme çubuğunun (progress segments) dinamik dolumu
  phones.forEach((phone, pIdx) => {
    const segs = phone.querySelectorAll('.progress-segments span i');
    if (segs.length > 0) {
      segs.forEach((seg, sIdx) => {
        if (all) {
          if (sIdx < pIdx) seg.style.width = '100%';
          else if (sIdx === pIdx) seg.style.width = `${(pRatio * 100).toFixed(1)}%`;
          else seg.style.width = '0%';
        } else {
          if (sIdx < active) seg.style.width = '100%';
          else if (sIdx === active) seg.style.width = `${(pRatio * 100).toFixed(1)}%`;
          else seg.style.width = '0%';
        }
      });
    }

    // Modal ekranı 6 segment çubuğu
    const segs6 = phone.querySelectorAll('.segments-6 span:first-child i');
    if (segs6.length > 0) {
      segs6.forEach(seg => {
        if (all) {
          seg.style.width = `${(pRatio * 100).toFixed(1)}%`;
        } else {
          seg.style.width = '100%';
        }
      });
    }
  });

  [0, 1, 2, 3].forEach(i => {
    if (!all && i !== active) return;
    const introT = (i === active) ? iT : 99;
    moveBubbles(i, t, introT);

    if (i === 0) {
      const pp = eob(c01(introT / .6)), po = c01(introT / .25);
      const dx = Math.sin(t * .45) * 1.8, dy = Math.sin(t * .55) * 3, rot = Math.sin(t * .35) * .45;
      post.style.transform = `translate3d(${dx}px,${dy}px,0) rotate(${rot}deg) scale(${pp.toFixed(4)})`;
      post.style.opacity = po;
      post.style.transformOrigin = 'center center';
    }
    if (i === 1) {
      drawNetwork(t, introT);
    }
    if (i === 2) drawScene3(t, introT);
  });

  $('#scrubber').value = time / curDur * 1000;
  $('#time').innerHTML = time.toFixed(1).replace('.', ',') + '<small>/ ' + curDur.toFixed(1).replace('.', ',') + ' saniye</small>';
}

function selectScene(i) {
  active = Math.max(0, Math.min(3, i));
  time = 0; motionTime = 0; sceneRealTime = 0;

  document.querySelectorAll('.phone-wrap').forEach((e, j) => {
    e.classList.toggle('active', j === active);
    e.inert = !all && j !== active;
  });
  document.querySelectorAll('.scene-tab').forEach((e, j) => {
    e.classList.toggle('selected', j === active);
    e.setAttribute('aria-current', j === active ? 'step' : 'false');
  });

  const cur = scenes[active];
  $('#director-heading').innerHTML = cur.sidebarHeading;
  $('#director-desc').innerHTML = cur.sidebarDesc;
  $('#note-title').innerHTML = cur.noteTitle;
  $('#note-text').textContent = cur.note;
  buildTicks(scenes[active].duration);

  render(0);

  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    phones[active].animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
  }
}

function setPlaying(v) {
  playing = v;
  $('#play').textContent = v ? 'Duraklat' : 'Oynat';
  $('#play').setAttribute('aria-pressed', v);
}

function resize() {
  const w = $('#screen').clientWidth;
  if (!w) return;
  const s = w / 393;
  $('#phones').style.transform = `scale(${s.toFixed(4)})`;
  document.documentElement.style.setProperty('--phone-scale', s.toFixed(4));
}

function buildTicks(dur) {
  const box = $('#ticks');
  if (!box) return;
  box.textContent = '';
  const step = dur > 6 ? 2 : 1;
  for (let v = 0; v <= Math.floor(dur); v += step) {
    const sp = document.createElement('span');
    sp.style.left = (v / dur * 100) + '%';
    sp.textContent = v;
    box.appendChild(sp);
  }
}

function toast(t) {
  const e = $('.toast');
  e.textContent = t;
  e.classList.add('show');
  clearTimeout(toast.tid);
  toast.tid = setTimeout(() => e.classList.remove('show'), 4200);
}

$('.scene-picker').onclick = e => {
  const b = e.target.closest('[data-scene]');
  if (b) selectScene(+b.dataset.scene);
};
$('#play').onclick = () => setPlaying(!playing);
$('#replay').onclick = () => { time = 0; motionTime = 0; sceneRealTime = 0; render(0); setPlaying(true); };
$('#scrubber').oninput = e => {
  const sc = +e.target.value / 1000 * scenes[active].duration;
  time = sc; motionTime = sc; sceneRealTime = sc; render(sc);
};
document.querySelectorAll('input[name=speed]').forEach(r =>
  r.addEventListener('change', () => { speed = +r.value; }));
$('#auto').addEventListener('change', e => { auto = e.target.checked; });

addEventListener('resize', resize);
addEventListener('keydown', e => {
  if (['INPUT', 'SELECT', 'BUTTON', 'A'].includes(document.activeElement.tagName)) return;
  if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
  if (e.code === 'ArrowRight') selectScene((active + 1) % 4);
  if (e.code === 'ArrowLeft') selectScene((active + 3) % 4);
});
document.addEventListener('visibilitychange', () => last = 0);

function tick(now) {
  if (last && playing) {
    const dt = Math.min((now - last) / 1000, .05) * speed;
    time += dt; motionTime += dt; sceneRealTime += dt;

    if (time >= scenes[active].duration) {
      if (active < 2) {
        // Tanıtım akışında süre dolunca otomatik sonraki ekrana geç
        selectScene(active + 1);
      } else {
        /* Son ekran (03 Sesini duyur): otomatik akışta başa döner, elle
           oynatılırken son karede bekler. */
        if (auto) selectScene(0);
        else time = scenes[active].duration;
      }
    }
  }
  last = now;
  if (playing) {
    render(motionTime);
  }
  requestAnimationFrame(tick);
}

fetch(A + 'land.geojson')
  .then(r => { if (!r.ok) throw Error(); return r.json(); })
  .then(d => { land = d; render(motionTime); })
  .catch(() => toast('Küre haritası yüklenemedi. Sayfayı yerel sunucu üzerinden aç.'));

resize();
// Panelden derin bağlantı: /tanitim/#s=3 doğrudan 3. sahneyi açar.
function sceneFromHash() {
  const m = /(?:^|[#&])s=(\d)/.exec(location.hash);
  return m ? Math.max(0, Math.min(3, +m[1] - 1)) : 0;
}
selectScene(sceneFromHash());
addEventListener('hashchange', () => selectScene(sceneFromHash()));
setPlaying(playing);
render(0);
requestAnimationFrame(tick);
