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
  },
  {
    title: '3X Büyüme ile<br>zirveye çık.',
    subtitle: 'Premium paket ile 5 sayfaya kadar yayınla, 3 kat daha fazla etkileşim kazan.',
    duration: 10,
    sidebarHeading: 'Daha fazla sayfaya<br>mı ihtiyacın var?',
    sidebarDesc: 'Premium ile tanıtımını daha fazla<br>toplulukta göster, 3x büyü.',
    noteTitle: '3X Büyüme &<br>Avrupa Etkisi.',
    note: 'Figma modal ekranındaki gri alanda Avrupa haritası, 4 topluluk balonu ve 3x büyüme grafiği canlanır.'
  }
];

let active = 0, playing = !matchMedia('(prefers-reduced-motion:reduce)').matches;
let auto = false, all = false, speed = 1, time = 0, motionTime = 0, last = 0, land = null;
let sceneRealTime = 0;
let globeVis = 1;

const bubbles = [[], [], [], []], phones = [], canvases = [], contexts = [];
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
      phone.querySelector('.phone-cta').onclick = () => selectScene(3);
    }

    const cv = phone.querySelector('canvas'), dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = 393 * dpr; cv.height = 852 * dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    canvases.push(cv); contexts.push(ctx);
  } else {
    // Sahne 04: Figma Premium Modal Ekranı (media_1789069975401.png ile 1:1)
    phone = el('article', 'phone phone-modal-view',
      `<div class="status" aria-hidden="true"><span>9:41</span><span class="status-levels"><img src="${A}s0-imgCellularConnection.svg" alt=""><img src="${A}s0-imgWifi.svg" alt=""><span class="battery"></span></span></div>` +
      `<nav class="modal-phone-nav">` +
        `<button class="nav-back-btn" aria-label="Geri"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>` +
        `<strong>Tanıtım</strong>` +
      `</nav>` +
      `<div class="segments-6" aria-hidden="true"><span><i></i></span><span></span><span></span><span></span><span></span><span></span></div>` +
      `<div class="modal-standard-caption">Standart • 0/1 sayfa seçebilirsin</div>` +
      `<div class="modal-sheet-card">` +
        `<div class="sheet-header-row">` +
          `<h3>Daha fazla sayfaya mı ihtiyacın var?</h3>` +
          `<button class="sheet-close-icon" aria-label="Kapat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>` +
        `</div>` +
        `<!-- GRİ ALAN: 3X BÜYÜME VEKTÖR HARİTA ANİMASYONU -->` +
        `<div class="modal-anim-graybox">` +
          `<canvas class="graybox-canvas" aria-hidden="true"></canvas>` +
          `<div class="gb-cloud gb-cloud-tl"></div><div class="gb-cloud-bl"></div><div class="gb-cloud-br"></div>` +
          `<!-- Merkez AB Hub -->` +
          `<div class="gb-eu-hub">` +
            `<div class="gb-eu-pulse"></div>` +
            `<div class="gb-eu-core">` +
              `<svg class="gb-eu-stars" viewBox="0 0 40 40">` +
                `<g fill="#ffcc00" transform="translate(20,20)">` +
                  Array.from({length: 12}, (_, k) => {
                    const angle = (k * 30 - 90) * Math.PI / 180;
                    const sx = Math.cos(angle) * 12.5, sy = Math.sin(angle) * 12.5;
                    return `<polygon points="${sx},${sy-2.4} ${sx+1.5},${sy+1.8} ${sx-2.3},${sy-0.8} ${sx+2.3},${sy-0.8} ${sx-1.5},${sy+1.8}"/>`;
                  }).join('') +
                `</g>` +
              `</svg>` +
            `</div>` +
          `</div>` +
          `<!-- 4 Yüzen Topluluk Baloncuğu -->` +
          `<div class="gb-bubble gb-b-nl" id="gb-b-nl">` +
            `<div class="gb-bubble-inner"><img src="${A}netherlands_windmill.jpg" alt="Hollanda"></div>` +
            `<div class="gb-pill"><img class="pill-flag" src="${A}flag-netherlands.svg" alt="Hollanda bayrağı"><span>Hollanda</span></div>` +
          `</div>` +
          `<div class="gb-bubble gb-b-de" id="gb-b-de">` +
            `<div class="gb-bubble-inner"><img src="${A}germany_landmark.jpg" alt="Berlin"></div>` +
            `<div class="gb-pill"><img class="pill-flag" src="${A}flag-germany.svg" alt="Almanya bayrağı"><span>Berlin</span></div>` +
          `</div>` +
          `<div class="gb-bubble gb-b-er" id="gb-b-er">` +
            `<div class="gb-bubble-inner"><img src="${A}erasmus_university.jpg" alt="Erasmus"></div>` +
            `<div class="gb-pill"><span class="pill-emoji">🎓</span><span>Erasmus</span></div>` +
          `</div>` +
          `<div class="gb-bubble gb-b-alp" id="gb-b-alp">` +
            `<div class="gb-bubble-inner"><img src="${A}alps_mountains.jpg" alt="Doğa"></div>` +
            `<div class="gb-pill"><span class="pill-emoji">⛰️</span><span>Doğa</span></div>` +
          `</div>` +
          `<!-- 3X Büyüme Bar Grafiği Montajı -->` +
          `<div class="gb-chart-assembly">` +
            `<div class="gb-crown-group">` +
              `<svg class="gb-crown-svg" viewBox="0 0 24 24" fill="#ffb700"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>` +
              `<span class="gb-3x-text">3x</span>` +
            `</div>` +
            `<div class="gb-bars-container">` +
              `<div class="gb-bar-track"><div class="gb-3d-bar" data-h="28"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div>` +
              `<div class="gb-bar-track"><div class="gb-3d-bar" data-h="42"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div>` +
              `<div class="gb-bar-track"><div class="gb-3d-bar" data-h="60"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div>` +
              `<div class="gb-bar-track"><div class="gb-3d-bar" data-h="84"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div>` +
              `<div class="gb-bar-track"><div class="gb-3d-bar" data-h="112"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div>` +
            `</div>` +
            `<svg class="gb-arrow-curve" viewBox="0 0 140 140" fill="none"><path d="M 12 112 Q 55 98 106 32" stroke="#0055ff" stroke-width="4.5" stroke-linecap="round" fill="none"/><polygon points="106,18 118,34 98,38" fill="#0055ff"/></svg>` +
          `</div>` +
          `<!-- Vektör Uçak -->` +
          `<div class="gb-airplane"><svg viewBox="0 0 24 24" fill="#6ba6ff" width="22" height="22"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>` +
        `</div>` +
        `<!-- Modal Sheet Alt Kısımları -->` +
        `<h4 class="sheet-subhead">Premium’da 5 sayfaya kadar yayınla.</h4>` +
        `<p class="sheet-desc">Standard paketle yalnızca 1 sayfa seçebilirsin. Premium ile tanıtımını daha fazla toplulukta göster.</p>` +
        `<div class="sheet-benefit-list">` +
          `<div class="sheet-benefit-card"><div class="sbc-icon"><svg viewBox="0 0 24 24" fill="#0055ff"><rect x="3" y="12" width="4" height="9" rx="1.5"/><rect x="10" y="7" width="4" height="14" rx="1.5"/><rect x="17" y="3" width="4" height="18" rx="1.5"/></svg></div><span class="sbc-text">3x daha fazla erişim</span><svg class="sbc-crown" viewBox="0 0 24 24" fill="#0055ff"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg></div>` +
          `<div class="sheet-benefit-card"><div class="sbc-icon"><svg viewBox="0 0 24 24" fill="#0055ff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><span class="sbc-text">5 sayfaya kadar yayınla</span><svg class="sbc-crown" viewBox="0 0 24 24" fill="#0055ff"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg></div>` +
          `<div class="sheet-benefit-card"><div class="sbc-icon"><svg viewBox="0 0 24 24" fill="#0055ff"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div><span class="sbc-text">3 kat daha fazla etkileşim</span><svg class="sbc-crown" viewBox="0 0 24 24" fill="#0055ff"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg></div>` +
        `</div>` +
        `<a href="#" class="sheet-link">1 sayfayla devam et</a>` +
        `<button class="sheet-cta-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="#ffcc00"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg><span>Premiuma geç</span></button>` +
      `</div>`);

    phone.querySelector('.nav-back-btn').onclick = () => selectScene(2);
    phone.querySelector('.sheet-close-icon').onclick = () => selectScene(0);
    phone.querySelector('.sheet-link').onclick = e => { e.preventDefault(); selectScene(0); };
    phone.querySelector('.sheet-cta-btn').onclick = () => toast('Premium tanıtım akışı başlatılıyor...');

    const cv = phone.querySelector('.graybox-canvas'), dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = 353 * dpr; cv.height = 235 * dpr;
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

/* ── SAHNE 4 (04 3X Büyüme): Gri Alan İçinde Vektör Harita & 3X Grafiği ── */
const gbProj = d3.geoMercator().scale(165).center([13, 51.5]).translate([115, 110]);
const gbPins = [
  { coords: [-3.7, 40.4] }, // Madrid
  { coords: [2.35, 48.8] }, // Paris
  { coords: [-.12, 51.5] }, // Londra
  { coords: [12.5, 41.9] }, // Roma
  { coords: [13.4, 52.5] }  // Berlin
];

// Merkez AB Hub: (112, 104)
const gbHubPos = [112, 104];
const gbTargets = [
  { pos: [43, 41], ctrl: [75, 60] },     // Hollanda (gb-b-nl)
  { pos: [181, 39], ctrl: [155, 60] },   // Berlin (gb-b-de)
  { pos: [39, 157], ctrl: [70, 140] },   // Erasmus (gb-b-er)
  { pos: [181, 161], ctrl: [155, 145] }, // Doğa (gb-b-alp)
  { pos: [248, 115], ctrl: [185, 95] }   // 3X Bar Chart
];

const gbBars = [...phones[3].querySelectorAll('.gb-3d-bar')];
const gbCrown = phones[3].querySelector('.gb-crown-svg');
const gbAirplane = phones[3].querySelector('.gb-airplane');
const gbBubbles = [
  $('#gb-b-nl'),
  $('#gb-b-de'),
  $('#gb-b-er'),
  $('#gb-b-alp')
];

function drawScene4(t, iT) {
  const ctx = contexts[3];
  ctx.clearRect(0, 0, 353, 235);

  const path = d3.geoPath(gbProj, ctx);

  // 1. Zemin Işıltısı (Merkez Mavi Parıltı)
  const bgGlow = ctx.createRadialGradient(112, 104, 20, 112, 104, 160);
  bgGlow.addColorStop(0, 'rgba(0, 100, 255, 0.16)');
  bgGlow.addColorStop(0.7, 'rgba(0, 85, 255, 0.05)');
  bgGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, 353, 235);

  // 2. Avrupa Haritası (3D Relief Görünüm)
  if (land) {
    ctx.save();
    ctx.translate(2, 5);
    ctx.beginPath(); path(land);
    ctx.fillStyle = 'rgba(0, 50, 150, 0.12)';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath(); path(land);
    const lg = ctx.createLinearGradient(40, 20, 240, 200);
    lg.addColorStop(0, '#7eb6ff');
    lg.addColorStop(0.5, '#408eff');
    lg.addColorStop(1, '#1a6ce6');
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();
    ctx.restore();
  }

  // 3. Konum İğneleri (Pulsing Pins)
  gbPins.forEach((pin, i) => {
    const pt = gbProj(pin.coords);
    if (!pt) return;
    const pulse = (t * 0.9 + i * 0.25) % 1;

    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 3 + pulse * 10, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 85, 255, ${(1 - pulse) * 0.55})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0055ff';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });

  // 4. Merkez AB Hub'ından Çıkan Beyaz Kesikli Işık Hatları & Işık Paketleri
  gbTargets.forEach((tg, i) => {
    const p0 = gbHubPos;
    const p2 = tg.pos;
    const ctrl = tg.ctrl;

    ctx.beginPath();
    ctx.moveTo(...p0);
    ctx.quadraticCurveTo(...ctrl, ...p2);
    ctx.lineWidth = i === 4 ? 2.6 : 1.8;
    ctx.strokeStyle = i === 4 ? 'rgba(0, 110, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -t * (i === 4 ? 12 : 8);
    ctx.stroke();
    ctx.setLineDash([]);

    const pktPos = (t * 0.55 + i * 0.2) % 1;
    pkt(ctx, p0, ctrl, p2, pktPos, 1, '#ffffff', i === 4 ? 2.8 : 2.2);
  });

  // 5. DOM Elemanlarının Canlı Hareketi
  gbBubbles.forEach((bEl, i) => {
    if (bEl) {
      const fy = Math.sin(t * 1.8 + i * 1.2) * 4;
      bEl.style.transform = `translateY(${fy.toFixed(2)}px)`;
    }
  });

  gbBars.forEach((bar, j) => {
    const baseH = [24, 38, 56, 78, 106][j];
    const wave = 0.88 + Math.sin(t * 2.2 + j * 0.55) * 0.12;
    bar.style.height = `${(baseH * wave).toFixed(1)}px`;
  });

  if (gbCrown) {
    gbCrown.style.transform = `translateY(${Math.sin(t * 2.2) * 3}px)`;
  }

  if (gbAirplane) {
    const aT = (t * 0.25) % 1;
    const ax = 12 + aT * 70;
    const ay = 85 - Math.sin(aT * Math.PI) * 25;
    gbAirplane.style.transform = `translate(${ax.toFixed(1)}px, ${ay.toFixed(1)}px) rotate(${22 - aT * 8}deg)`;
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
          seg.style.width = (active === 3) ? `${(pRatio * 100).toFixed(1)}%` : '100%';
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
    if (i === 3) drawScene4(t, introT);
  });

  $('#scrubber').value = time / curDur * 1000;
  $('#time').textContent = `${time.toFixed(1).padStart(4, '0')} / ${curDur.toFixed(1).padStart(4, '0')}`;
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
  $('#caption').textContent = `0${active + 1} / 04`;

  render(0);

  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    phones[active].animate(
      [{ opacity: 0, transform: `scale(var(--phone-scale)) translateY(12px)` }, { opacity: 1, transform: `scale(var(--phone-scale)) translateY(0)` }],
      { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
    // Premium sheet sahneye alttan kayarak girer, avantaj kartları kademeli belirir.
    if (active === 3) {
      const sheet = phones[3].querySelector('.modal-sheet-card');
      if (sheet) sheet.animate(
        [{ transform: 'translateY(64px)', opacity: .4 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
      phones[3].querySelectorAll('.sheet-benefit-card').forEach((card, k) => {
        card.animate(
          [{ opacity: 0, transform: 'translateY(14px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
          { duration: 450, delay: 200 + k * 90, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
      });
    }
  }
}

function setPlaying(v) {
  playing = v;
  $('#play').textContent = v ? 'II' : '>';
  $('#play').setAttribute('aria-label', v ? 'Duraklat' : 'Oynat');
}

function resize() {
  const mob = innerWidth <= 650;
  let s = Math.min(.94, (innerHeight - (mob ? 225 : 207)) / 852);
  s = Math.max(mob ? .45 : .48, s);

  if (all) {
    const count = scenes.length; // 4
    const av = innerWidth > 1100 ? innerWidth - 320 : innerWidth - 48;
    s = Math.min(s, (av - (count - 1) * 16) / (393 * count));
    s = Math.max(.36, s);
  } else {
    s = Math.min(s, (innerWidth - 36) / 393);
  }
  document.documentElement.style.setProperty('--phone-scale', s.toFixed(4));
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
$('#speed').onchange = e => speed = +e.target.value;
$('#auto').onclick = () => { auto = !auto; $('#auto').setAttribute('aria-pressed', auto); };
$('#view-toggle').onclick = () => {
  all = !all;
  document.body.classList.toggle('all-view', all);
  $('#view-toggle').setAttribute('aria-pressed', all);
  $('#view-toggle').innerHTML = all ? 'Tek sahneye dön <span>↙</span>' : 'Tüm sahneleri birlikte gör <span>↔</span>';
  document.querySelectorAll('.phone-wrap').forEach((e, i) => e.inert = !all && i !== active);
  resize();
  render(motionTime);
};
$('#return-single').onclick = () => $('#view-toggle').click();

addEventListener('resize', resize);
addEventListener('keydown', e => {
  if (['INPUT', 'SELECT', 'BUTTON', 'A'].includes(document.activeElement.tagName)) return;
  if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
  if (e.code === 'ArrowRight') selectScene((active + 1) % 4);
  if (e.code === 'ArrowLeft') selectScene((active + 3) % 4);
});
document.addEventListener('visibilitychange', () => last = 0);

function tick(now) {
  if (last && playing && !document.hidden) {
    const dt = Math.min((now - last) / 1000, .05) * speed;
    time += dt; motionTime += dt; sceneRealTime += dt;

    if (time >= scenes[active].duration) {
      if (active < 2) {
        // Tanıtım akışında süre dolunca otomatik sonraki ekrana geç
        selectScene(active + 1);
      } else if (active === 2) {
        // Son tanıtım ekranında (Sesini duyur) buton hazır halde bekle
        if (auto) {
          selectScene(3);
        } else {
          time = scenes[active].duration;
        }
      } else if (active === 3) {
        if (auto) {
          selectScene(0);
        } else {
          time = scenes[active].duration;
        }
      }
    }
  }
  last = now;
  if (playing && !document.hidden) {
    render(motionTime);
  }
  requestAnimationFrame(tick);
}

fetch(A + 'land.geojson')
  .then(r => { if (!r.ok) throw Error(); return r.json(); })
  .then(d => { land = d; render(motionTime); })
  .catch(() => toast('Küre haritası yüklenemedi. Sayfayı yerel sunucu üzerinden aç.'));

resize();
selectScene(0);
setPlaying(playing);
render(0);
requestAnimationFrame(tick);
