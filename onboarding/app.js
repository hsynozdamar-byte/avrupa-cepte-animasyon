/* Avrupa Cepte — Onboarding akışı
   Dört karşılama ekranı, 393×852. Dördü de 10 sn.
   Ekranlar arası beklemede sahnenin yerel saati akmaya devam eder: son kare
   donmaz, geçiş döngü gibi akar.
   01 küre, rota ve portrelerle; 02–04 tasarım dosyasındaki gerçek arayüz
   parçalarıyla (gönderi, cevaplar, sayfa seçimi, tanıtım, bildirimler).
   Renkler CSS değişkenlerinden gelir, koyu tema da doğru çalışır. */
'use strict';

const NS = 'http://www.w3.org/2000/svg';
const D1 = 10.0;                /* 01 · küre, rota ve sağa kıvrılıp uzaklaşan uçak */
const D2 = 10.0;                /* 02 · akış dolar, soru öne çıkar, cevaplar gelir */
const D3 = 10.0;                /* 03 · sayfa seçimi, konu küresi ve haberler */
const D4 = 10.0;                /* 04 · tanıtım paylaşılır, Avrupa'ya dağılır, istatistik */
const CX = 196.5, CY = 272;     /* sanat alanının merkezi */

/* ---------- yardımcılar ---------- */
function S(tag, a, kids) {
  const e = document.createElementNS(NS, tag);
  if (a) for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]);
  if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(c => c && e.appendChild(c));
  return e;
}
const G = (kids, a) => S('g', a, kids);
const txt = (s, a) => S('text', a, document.createTextNode(s));
const $ = s => document.querySelector(s);
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eOut = t => 1 - Math.pow(1 - t, 3);
const eOut4 = t => 1 - Math.pow(1 - t, 4);
const eIn3 = t => t * t * t;
const eInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eBack = t => { const c = 1.24; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const lerp = (a, b, u) => a + (b - a) * u;
const sn = (t, p, ph = 0) => Math.sin((t / p + ph) * Math.PI * 2);
const set = (el, k, v) => el.setAttribute(k, v);
const tr = (x, y, s) => `translate(${x.toFixed(2)} ${y.toFixed(2)})` + (s != null && s !== 1 ? ` scale(${(+s).toFixed(4)})` : '');

/* Sahne kısa bir açılışla girer ve bitince son karesinde kalır; döngü yok.
   Sonraki ekrana yalnızca "Devam et" ile geçilir. */
const fadeIn = t => eOut(seg(t, 0, .18));
const envelope = t => fadeIn(t);

/* Durdurulmuş hâlde gösterilecek oturmuş kare. Sahne t=0'da tamamen
   saydam olduğu için, oynatma başlamadan 0. saniye gösterilirse ekran
   boş görünür ve sayfa bozuk sanılır. */
const DURS = [D1, D2, D3, D4];
const STARTS = DURS.map((_, i) => DURS.slice(0, i).reduce((a, b) => a + b, 0));
const TOTAL = DURS.reduce((a, b) => a + b, 0);
const poster = m => (m === 'full' ? DURS[0] * .9 : DURS[+m - 1] * (m === '1' ? .9 : .8));

/* Sabit dağılım: her yüklemede aynı kompozisyon. */
function rnd(seed) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

/* ---------- ortak parçalar ---------- */
function node(r) {
  return G([
    S('circle', { class: 'nd-halo', cx: 0, cy: 0, r: r * 2.1 }),
    S('circle', { class: 'nd', cx: 0, cy: 0, r: r })
  ]);
}
function pill(label, cls) {
  const w = label.length * 6.9 + 22, h = 24;
  return G([
    S('rect', { class: 'pill', x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2 }),
    txt(label, { class: cls || 't-ink', x: 0, y: 4.2, 'font-size': 11.5, 'text-anchor': 'middle' })
  ]);
}
function skelCard(w, h, lines, r) {
  const g = G([S('rect', { class: 'card', x: -w / 2, y: -h / 2, width: w, height: h, rx: r == null ? 14 : r })]);
  lines.forEach(l => g.appendChild(S('rect', { class: l[3] || 'sk', x: -w / 2 + l[0], y: -h / 2 + l[1], width: l[2], height: 5, rx: 2.5 })));
  return g;
}

/* ═══════════ 01 · Aidiyet ═══════════ */
/* Topluluk baloncukları: gerçek fotoğraf, beyaz halka, altında ülke rozeti.
   Dil tanıtım akışından geliyor; orada da daire içinde fotoğraf + bayraklı
   hap kullanılıyor. Fotoğraf havuzu şimdilik iki portre, bu yüzden yer
   görselleriyle karıştırılıyor. */
const AST = '/assets/';

function bubble(id, r, img, opts) {
  opts = opts || {};
  const g = G([]);
  const cid = `bc${id}`;
  g.appendChild(S('defs', null,
    S('clipPath', { id: cid }, S('circle', { cx: 0, cy: 0, r: r }))));
  /* yumuşak taban gölgesi */
  g.appendChild(S('ellipse', { cx: 0, cy: r * .96, rx: r * .82, ry: r * .2, fill: '#0B1B3A', opacity: .10 }));
  g.appendChild(S('circle', { class: 'card-soft', cx: 0, cy: 0, r: r }));
  g.appendChild(S('image', {
    href: AST + img, x: -r, y: -r, width: r * 2, height: r * 2,
    preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#${cid})`,
    transform: opts.flip ? `scale(-1 1)` : null
  }));
  /* cam parlaması: sol üstten gelen ışık */
  g.appendChild(S('path', {
    d: `M0 ${-r} A${r} ${r} 0 0 0 ${-r * .72} ${r * .69} A${r * 1.25} ${r * 1.25} 0 0 1 0 ${-r} Z`,
    fill: '#fff', opacity: .16
  }));
  g.appendChild(S('circle', { cx: 0, cy: 0, r: r, fill: 'none', stroke: '#fff', 'stroke-width': r > 24 ? 3 : 2.4 }));
  g.appendChild(S('circle', { cx: 0, cy: 0, r: r + (r > 24 ? 1.5 : 1.2), fill: 'none', stroke: '#0B1B3A', 'stroke-width': 1, opacity: .07 }));
  return g;
}

/* Bayraklı ülke rozeti: dairesel bayrak + şehir/ülke adı */
function flagBadge(flag, label) {
  const fs = 10.5;
  const w = label.length * fs * .56 + 30, h = 21;
  const cid = `fb${flagBadge.n = (flagBadge.n || 0) + 1}`;
  return G([
    S('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: '#fff' }),
    S('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: 'none', stroke: '#DDE4F1', 'stroke-width': 1 }),
    S('defs', null, S('clipPath', { id: cid }, S('circle', { cx: -w / 2 + 12, cy: 0, r: 6.6 }))),
    S('image', {
      href: `${AST}flags/${flag}.svg`, x: -w / 2 + 5.4, y: -6.6, width: 13.2, height: 13.2,
      'clip-path': `url(#${cid})`
    }),
    S('circle', { cx: -w / 2 + 12, cy: 0, r: 6.6, fill: 'none', stroke: '#0B1B3A', 'stroke-width': .9, opacity: .12 }),
    txt(label, { class: 't-ink', x: -w / 2 + 22, y: 3.7, 'font-size': fs })
  ]);
}

/* İlk ekranın zaman çizelgesi (sn). Buton ile geçildiği için acele yok. */
const T1 = {
  globeIn: [0, 1.2],       /* küre sağ alttan kadraja yükselir */
  orbit: [.5, 3.1],        /* uçak kürenin arkasından çıkar, 1,5 tur atar */
  dive: [3.1, 4.3],        /* uçak Avrupa'ya dalar, kamera onunla yakınlaşır */
  zoom: [3.1, 4.3],
  spin: [0, 4.2],          /* küre döner, Avrupa'da durur (dönüş hızlandı) */
  tilt: [2.4, 4.2],
  dots: 3.7,               /* şehir noktaları */
  fly: [4.3, 9.4],         /* rota uçuşu, şehirlerde yavaşlar */
  flyby: 1.55,             /* çıkış: ön planda sağa kıvrılır, sağ üstten uzaklaşır */
  end: D1
};

/* Harita verisi (Natural Earth 110m) tanıtım akışıyla ortak. */
let LAND = null;
const smooth = x => x * x * (3 - 2 * x);

/* Kağıt uçak, vektör. İkondaki uçağın renkleri üstten görünüşte çizilir:
   AB mavisi kanat (yıldız halkası, arka köşede Birleşik Krallık bayrağı) ve
   kırmızı kanat (hilal ve yıldız). Burun her zaman gidiş yönüne bakar.
   roll: -1..1, dönüşlere yatış. Alçalan kanat daralır ve kararır. */
function makePlane() {
  const L = 29, W = 21;
  const clipL = S('path');
  const defs = S('defs', null, [
    S('linearGradient', { id: 'pwBlue', x1: 1, y1: 0, x2: 0, y2: 0 }, [
      S('stop', { offset: 0, 'stop-color': '#3D7BFF' }), S('stop', { offset: 1, 'stop-color': '#1741C4' })]),
    S('linearGradient', { id: 'pwRed', x1: 1, y1: 0, x2: 0, y2: 0 }, [
      S('stop', { offset: 0, 'stop-color': '#FF5B4C' }), S('stop', { offset: 1, 'stop-color': '#CF2A22' })]),
    S('clipPath', { id: 'pwClipL' }, clipL)
  ]);

  const wingL = S('path', { fill: 'url(#pwBlue)' });
  const flapL = S('path', { fill: '#fff', opacity: .16 });
  const wingR = S('path', { fill: 'url(#pwRed)' });
  const flapR = S('path', { fill: '#fff', opacity: .16 });
  const shadeL = S('path', { fill: '#061233', opacity: 0 });
  const shadeR = S('path', { fill: '#2A0606', opacity: 0 });
  const fold = S('path', { fill: 'none', stroke: '#fff', 'stroke-opacity': .55, 'stroke-width': .9, 'stroke-linecap': 'round' });

  const stars = G([]);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    stars.appendChild(S('circle', { cx: Math.cos(a) * 4.2, cy: Math.sin(a) * 4.2, r: .75, fill: '#FFD43B' }));
  }
  /* Union Jack, 30×20 birimde; mavi kanadın arka köşesine kırpılır */
  const uk = G([
    S('rect', { width: 30, height: 20, fill: '#012169' }),
    S('path', { d: 'M0 0L30 20M30 0L0 20', stroke: '#fff', 'stroke-width': 4 }),
    S('path', { d: 'M0 0L30 20M30 0L0 20', stroke: '#C8102E', 'stroke-width': 1.5 }),
    S('path', { d: 'M15 0V20M0 10H30', stroke: '#fff', 'stroke-width': 6 }),
    S('path', { d: 'M15 0V20M0 10H30', stroke: '#C8102E', 'stroke-width': 3.4 })
  ]);
  const ukWrap = G([uk], { 'clip-path': 'url(#pwClipL)' });
  const crescent = G([
    S('circle', { cx: 0, cy: 0, r: 3.6, fill: '#fff' }),
    S('circle', { cx: 1.1, cy: 0, r: 2.9, fill: '#E3372C' }),
    S('circle', { cx: 3.3, cy: 0, r: .9, fill: '#fff' })
  ]);
  const body = G([wingL, ukWrap, flapL, stars, shadeL, wingR, flapR, crescent, shadeR, fold]);
  const g = G([defs, body]);

  const f = n => n.toFixed(2);
  return { g, update(x, y, head, roll, sc, op, t) {
    const r = clamp(roll, -1, 1);
    const flut = Math.sin(t * 23) * .6;
    const yL = -W * (1 - .5 * Math.max(-r, 0) + .12 * Math.max(r, 0)) + flut;
    const yR = W * (1 - .5 * Math.max(r, 0) + .12 * Math.max(-r, 0)) - flut;
    const fy = 2.6 * r;
    const nose = `M${L} 0`;
    const dL = `${nose} L${-L} ${f(yL)} L${-L + 7} ${f(fy - 1)} Z`;
    const dR = `${nose} L${-L} ${f(yR)} L${-L + 7} ${f(fy + 1)} Z`;
    set(wingL, 'd', dL); set(shadeL, 'd', dL); set(clipL, 'd', dL);
    set(wingR, 'd', dR); set(shadeR, 'd', dR);
    set(flapL, 'd', `${nose} L${-L + 7} ${f(fy - 1)} L${-L + 3} ${f(yL * .28 + fy)} Z`);
    set(flapR, 'd', `${nose} L${-L + 7} ${f(fy + 1)} L${-L + 3} ${f(yR * .28 + fy)} Z`);
    set(fold, 'd', `${nose} L${-L + 7} ${f(fy)}`);
    set(shadeL, 'opacity', f(Math.max(-r, 0) * .3));
    set(shadeR, 'opacity', f(Math.max(r, 0) * .3));
    /* bayrak: kanadın arka dış köşesinden merkeze doğru */
    const fh = Math.abs(yL) * .62;
    set(uk, 'transform', `translate(${-L} ${f(yL)}) scale(${f(17 / 30)} ${f(fh / 20)})`);
    set(stars, 'transform', `translate(-4 ${f(yL * .42)}) scale(1 ${f(Math.abs(yL) / W)})`);
    set(crescent, 'transform', `translate(-12 ${f(yR * .55)}) scale(1 ${f(Math.abs(yR) / W)})`);

    set(g, 'transform', `translate(${f(x)} ${f(y)}) scale(${sc.toFixed(3)})`);
    set(body, 'transform', `rotate(${f(head)})`);
    set(g, 'opacity', op.toFixed(3));
  } };
}
const wrapDeg = a => ((a + 540) % 360) - 180;
const deg = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;

/* Kübik B-spline'ı Bézier parçalarına çevirir. Uçlar sabitlenir (ilk ve son
   nokta üçlenir). k > 0 ara noktaları komşularının ortasından dışa iter;
   k = .5 eğriyi noktalardan tam geçirir, küçük değerler daha yumuşak kavis verir. */
function bspline(pts, k) {
  const P = pts.map((p, i) => {
    if (i === 0 || i === pts.length - 1) return p;
    const m = [(pts[i - 1][0] + pts[i + 1][0]) / 2, (pts[i - 1][1] + pts[i + 1][1]) / 2];
    return [p[0] + k * (p[0] - m[0]), p[1] + k * (p[1] - m[1])];
  });
  const Q = [P[0], P[0]].concat(P, [P[P.length - 1], P[P.length - 1]]);
  const f = v => v.toFixed(1);
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i + 3 < Q.length; i++) {
    const [a, b, c, e] = [Q[i], Q[i + 1], Q[i + 2], Q[i + 3]];
    const b1 = [(4 * b[0] + 2 * c[0]) / 6, (4 * b[1] + 2 * c[1]) / 6];
    const b2 = [(2 * b[0] + 4 * c[0]) / 6, (2 * b[1] + 4 * c[1]) / 6];
    const b3 = [(b[0] + 4 * c[0] + e[0]) / 6, (b[1] + 4 * c[1] + e[1]) / 6];
    d += ` C${f(b1[0])} ${f(b1[1])} ${f(b2[0])} ${f(b2[1])} ${f(b3[0])} ${f(b3[1])}`;
  }
  return d;
}

/* Keskin köşeleri genişletir: dönüşü keskin olan her ara noktanın yerine, tepesi
   o noktada olan R yarıçaplı bir yay koyar. Uçak şehrin üstünden geçer ama
   dönüşü geniş bir kavisle, yatarak yapar. */
function roundCorners(pts, R, minTurn) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, c, b] = [pts[i - 1], pts[i], pts[i + 1]];
    const u = [c[0] - a[0], c[1] - a[1]], v = [b[0] - c[0], b[1] - c[1]];
    const lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]);
    const ha = Math.atan2(u[1], u[0]), hb = Math.atan2(v[1], v[0]);
    let turn = hb - ha;
    turn = Math.atan2(Math.sin(turn), Math.cos(turn));
    if (Math.abs(turn) * 180 / Math.PI < minTurn) { out.push(c); continue; }
    /* yayın merkezi dönüşün içinde; tepe noktası şehir */
    const w = [u[0] / lu - v[0] / lv, u[1] / lu - v[1] / lv];
    const lw = Math.hypot(w[0], w[1]) || 1;
    const r = Math.min(R, lu * .55, lv * .55);
    const O = [c[0] - w[0] / lw * r, c[1] - w[1] / lw * r];
    const mid = Math.atan2(c[1] - O[1], c[0] - O[0]);
    const half = Math.abs(turn) / 2, dir = Math.sign(turn);
    for (let k = -2; k <= 2; k++) {
      const ang = mid + dir * half * k / 2;
      out.push([O[0] + Math.cos(ang) * r, O[1] + Math.sin(ang) * r]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

const grad = (id, a, stops) => S('radialGradient', Object.assign({ id }, a),
  stops.map(s => S('stop', { offset: s[0], style: `stop-color:${s[1]};stop-opacity:${s[2]}` })));

/* Artan bir tablodan ters arama: tab[i] ≥ u olan kesirli indeks. */
function invert(tab, u) {
  let lo = 0, hi = tab.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (tab[m] < u) lo = m; else hi = m; }
  const span = tab[hi] - tab[lo] || 1;
  return lo + (u - tab[lo]) / span;
}

function scene1() {
  const g = G([]);
  /* Kürenin durduğu yer: sanat alanı 58–580 arası, ortası 319. GY 282'deyken
     küre üstte kalıyor, altında boşluk birikiyordu. Yakın plan merkezi (MY)
     değişmedi: dalıştan sonraki konumlar aynı. */
  const GX = 196.5, GY = 316;
  const MX = 196.5, MY = 270;       /* yakın plan haritanın merkezi */
  const R0 = 116, R1 = 690;         /* küre yarıçapı → Avrupa yakın planı */
  const FOCUS = [12.6, 49.6];       /* yakın planın merkezi: Madrid'den İstanbul'a */

  /* Uçağın sırayla geçtiği şehirler: harita merkezi çevresinde saat yönünde
     tek, geniş bir tur (sıra, merkeze göre açılarından). Geri dönüş yok.
     Almanya için Hamburg: Paris–Stokholm hattının üstünde; Berlin turun
     içinde kalıp saç tokası dönüşe yol açıyordu. */
  const cities = [
    { ll: [-3.70, 40.42], r: 23, img: 'people/kadin-1.jpg', flag: 'ispanya', label: 'Madrid' },
    { ll: [2.35, 48.86], r: 24, img: 'people/kisi-4.jpg', flag: 'fransa', label: 'Paris' },
    { ll: [9.99, 53.55], r: 25, img: 'people/kisi-1.jpg', flag: 'almanya', label: 'Hamburg' },
    { ll: [18.07, 59.33], r: 22, img: 'people/kisi-3.jpg', flag: 'isvec', label: 'Stokholm' },
    { ll: [21.01, 52.23], r: 21, img: 'people/kisi-2.jpg', flag: 'polonya', label: 'Varşova' },
    { ll: [28.98, 41.01], r: 24, img: 'people/erkek-1.jpg', flag: 'turkiye', label: 'İstanbul' },
    { ll: [12.50, 41.90], r: 23, img: 'people/kisi-5.jpg', flag: 'italya', label: 'Roma' }
  ];
  const APPROACH = [-2.6, 36.2];    /* dalışın bittiği nokta: Cebelitarık açıkları, tura güneyden girilir */

  const proj = d3.geoOrthographic().clipAngle(90);
  const geo = d3.geoPath(proj);
  const grat = d3.geoGraticule().step([20, 15])();

  /* ---- tanımlar ---- */
  const mid = 'obMapFade';
  g.appendChild(S('defs', null, [
    S('linearGradient', { id: mid + 'G', x1: 0, y1: 0, x2: 0, y2: 852, gradientUnits: 'userSpaceOnUse' }, [
      S('stop', { offset: .07, 'stop-color': '#fff', 'stop-opacity': 0 }),
      S('stop', { offset: .15, 'stop-color': '#fff', 'stop-opacity': 1 }),
      S('stop', { offset: .5, 'stop-color': '#fff', 'stop-opacity': 1 }),
      S('stop', { offset: .59, 'stop-color': '#fff', 'stop-opacity': 0 })
    ]),
    S('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: -100, y: 0, width: 600, height: 852 },
      S('rect', { x: -100, y: 0, width: 600, height: 852, fill: `url(#${mid}G)` })),
    grad('obSea', { cx: .36, cy: .3, r: .8 }, [[0, 'var(--surface)', 1], [.5, 'var(--tint)', 1], [1, 'var(--brand-mid)', .28]]),
    grad('obHi', { cx: .32, cy: .26, r: .34 }, [[0, '#FFFFFF', .7], [1, '#FFFFFF', 0]]),
    grad('obAtmo', { cx: .5, cy: .5, r: .5 }, [[0, 'var(--brand)', 0], [.8, 'var(--brand)', 0], [.84, 'var(--brand)', .06], [1, 'var(--brand)', 0]])
  ]));

  const stage = G([], { mask: `url(#${mid})` });
  g.appendChild(stage);
  const atmo = S('circle', { fill: 'url(#obAtmo)' });
  stage.appendChild(atmo);

  const back = G([]);                /* kürenin arkasında kalan uçak ve iz */
  stage.appendChild(back);
  const map = G([]);
  const sea = S('path', { fill: 'url(#obSea)' });
  const gratP = S('path', { class: 'globe-grat' });
  const landP = S('path', { class: 'globe-land' });
  const hi = S('path', { fill: 'url(#obHi)' });
  const rim = S('path', { class: 'globe-rim' });
  [sea, gratP, landP, hi, rim].forEach(e => map.appendChild(e));
  stage.appendChild(map);
  const front = G([]);
  stage.appendChild(front);

  /* ---- yakın plan: rota, noktalar, kişiler ---- */
  const trail = S('path', { class: 'ln', 'stroke-dasharray': '1.5 5', 'stroke-width': 1.8, opacity: 0, mask: 'url(#obTrailMask)' });
  const trailReveal = S('path', { fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round' });
  g.appendChild(S('defs', null, S('mask', { id: 'obTrailMask', maskUnits: 'userSpaceOnUse', x: -100, y: -100, width: 600, height: 1000 }, trailReveal)));
  /* iz de haritanın maskesiyle söner, metnin üstüne taşmaz */
  g.appendChild(G([trail], { mask: `url(#${mid})` }));
  const dots = G([]);
  const people = G([]);
  g.appendChild(dots);
  g.appendChild(people);

  proj.translate([MX, MY]).scale(R1).rotate([-FOCUS[0], -FOCUS[1]]);
  cities.forEach((c, i) => {
    const p = proj(c.ll);
    c.x = p[0]; c.y = p[1];
    c.dot = node(4.2);
    dots.appendChild(c.dot);
    c.ripple = S('circle', { class: 'ring', r: c.r, 'stroke-width': 1.4, opacity: 0 });
    dots.appendChild(c.ripple);
    c.bub = G([bubble(`c${i}`, c.r, c.img)]);
    people.appendChild(c.bub);
    c.badge = flagBadge(c.flag, c.label);
    people.appendChild(c.badge);
  });
  const A = proj(APPROACH);
  /* Rota: şehirlerin yakınından süzülen kübik B-spline. Eğrilik sürekli
     değişir, ani kırılma olmaz; kontrol noktaları biraz dışa itilir ki eğri
     şehirlere yakın geçsin. Çıkış: Roma'ya batıya doğru girildiği için uçak
     batıdan devam edip sol kenarda yaklaşık sabit yarıçapla yukarı bankaya
     girer, tepede düzelir ve sağ üst köşeden çıkar. Kuyruk analitik üretiliyor:
     sabit adım + sabit dönüş açısı = sabit yarıçap, yani hep aynı dönüş hızı.
     Elle konulmuş seyrek noktalar bırakıldı; roundCorners onlarda düz parça +
     kısa yay ürettiği için dönüş basamaklı hissediliyordu (0,1 sn sabit açı,
     sonra 0,07 sn'de 34° savrulma). Aşağıdan U dönüşü de bırakıldı: metin
     580'de başladığı için altta ~140px yer var, yarıçap uçaktan küçük kalıyor.
     Bu yol şehir baloncuklarının arasından da geçmez, sol kenarı kullanır. */
  const exitTail = (() => {
    const last = cities[cities.length - 1];
    const DS = 18, DH = 6.2 * Math.PI / 180, HOLD = 21, TAPER = 9;
    const out = [];
    let x = last.x, y = last.y, h = Math.PI;      /* Roma'ya batıya doğru girilir */
    for (let i = 0; i < 42; i++) {
      h += DH * clamp((HOLD + TAPER - i) / TAPER);   /* son üçte birde düzelir */
      x += Math.cos(h) * DS; y += Math.sin(h) * DS;
      out.push([x, y]);
    }
    return out;
  })();
  const ctrl = [[A[0], A[1]]].concat(cities.map(c => [c.x, c.y])).concat(exitTail);
  const routeD = bspline(roundCorners(ctrl, 60, 20), 0);
  set(trail, 'd', routeD);
  set(trailReveal, 'd', routeD);

  /* parıltı: şehirler uyandıkça topluluğun üstünde çakar, son saniyelerde sürer */
  const sparkCity = sparkles(cities.map((c, i) => [c.x + (i % 2 ? 27 : -27), c.y - 28 - (i % 3) * 7, .85, (i * .19) % 1])
    .concat([[CX - 128, 214, .7, .12], [CX + 132, 246, .75, .58], [CX - 96, 452, .7, .83], [CX + 108, 436, .65, .35]]));
  g.appendChild(sparkCity.g);
  /* küre kadraja girerken çevresinde ışık: ilk saniyeler de boş kalmasın */
  const sparkGlobe = sparkles([[GX - 142, GY - 96, 1, 0], [GX + 146, GY - 52, .85, .3], [GX - 118, GY + 104, .8, .55],
    [GX + 124, GY + 92, .9, .78], [GX + 8, GY - 146, .75, .16], [GX - 34, GY + 150, .7, .92]]);
  g.appendChild(sparkGlobe.g);

  /* ---- uçak ---- */
  const plane = makePlane();
  front.appendChild(plane.g);
  const toLayer = layer => { if (plane.g.parentNode !== layer) layer.appendChild(plane.g); };

  const TRAIL_N = 26;
  const orbitDots = [];
  for (let k = 0; k < TRAIL_N; k++) {
    const b = S('circle', { r: 1.7, class: 'nd', opacity: 0 });
    const f = S('circle', { r: 1.7, class: 'nd', opacity: 0 });
    back.appendChild(b); front.insertBefore(f, plane.g);
    orbitDots.push({ b, f });
  }

  /* Yörünge: arkadan (üstten) çıkar, 1,5 tur atar, alt önde sola giderken ayrılır.
     Açısal hız önde yüksek, arkada düşük; kalkışta sıfırdan hızlanır. */
  const TH0 = -Math.PI / 2, TH1 = Math.PI / 2 + Math.PI * 2;
  const ON = 600;
  const orbitTab = [0];
  for (let i = 1; i <= ON; i++) {
    const th = TH0 + (TH1 - TH0) * (i - .5) / ON;
    const w = (1 + .55 * Math.sin(th)) * (.18 + .82 * smooth(clamp((th - TH0) / 1.8)));
    orbitTab.push(orbitTab[i - 1] + 1 / w);
  }
  orbitTab.forEach((v, i) => { orbitTab[i] = v / orbitTab[ON]; });
  const theta = t => TH0 + (TH1 - TH0) * invert(orbitTab, seg(t, T1.orbit[0], T1.orbit[1])) / ON;
  const endOmega = ((TH1 - TH0) / ON) / (orbitTab[ON] - orbitTab[ON - 1]) / (T1.orbit[1] - T1.orbit[0]);

  const RX = 1.44, RY = .42, TILT = -14 * Math.PI / 180;

  /* ---- rota hız profili: şehirlerde yavaşlar, aralarda hızlanır ---- */
  const RL = trail.getTotalLength();
  const STEP = 2;
  const pts = [];
  for (let s = 0; s <= RL; s += STEP) pts.push(trail.getPointAtLength(s));
  const cityS = cities.map(c => {
    let best = 0, bd = 1e9;
    pts.forEach((p, i) => { const d = Math.hypot(p.x - c.x, p.y - c.y); if (d < bd) { bd = d; best = i * STEP; } });
    return best;
  });
  const lastS = cityS[cityS.length - 1];
  const speed = s => {
    let dip = 0;
    cityS.forEach(cs => { dip += Math.exp(-Math.pow((s - cs) / 75, 2)); });
    const start = .3 + .7 * smooth(clamp(s / 150));
    const out = 1 + .18 * smooth(clamp((s - lastS) / 160));
    return (1 - .38 * Math.min(1, dip)) * start * out;
  };
  const timeTab = [0];
  for (let i = 1; i < pts.length; i++) timeTab.push(timeTab[i - 1] + STEP / speed((i - .5) * STEP));
  const TT = timeTab[timeTab.length - 1];
  timeTab.forEach((v, i) => { timeTab[i] = v / TT; });
  const F0 = T1.fly[0], F1 = T1.fly[1];
  const FE = F1 - T1.flyby;                         /* tur son şehirde biter */
  const uEnd = timeTab[Math.round(lastS / STEP)];   /* son şehrin normalize zamanı */
  /* Çıkış zamana bağlı: Roma'dan sonra hızlanır, uzaklaşırken en hızlı. Dönüş
     hızı yine de düzgün, çünkü kavis geniş ve sabit yarıçaplı. */
  const flyQ = q => .4 * q + .6 * q * q;
  const sAt = t => (t <= FE
    ? invert(timeTab, seg(t, F0, FE) * uEnd) * STEP
    : lastS + (RL - lastS) * flyQ(seg(t, FE, F1)));
  const passAt = cityS.map(cs => F0 + (timeTab[Math.round(cs / STEP)] / uEnd) * (FE - F0));
  const at = s => trail.getPointAtLength(clamp(s, 0, RL));


  /* Topluluk ağı: vurgulu şehirlerin çevresindeki diğer şehirler. İçlerinde kişi
     yok; uçak bir şehre uğrayıp kişi belirince, oradan en yakın noktalara ince
     kavisli bağlar uzanır, bağ ulaştığı nokta bir dalgayla yanar. */
  const NETWORK = [
    [-9.14, 38.72], [2.17, 41.39], [-0.13, 51.51], [4.90, 52.37], [8.54, 47.37],
    [11.58, 48.14], [12.57, 55.68], [10.75, 59.91], [24.94, 60.17], [14.42, 50.08],
    [16.37, 48.21], [19.04, 47.50], [23.73, 37.98], [26.10, 44.43], [27.14, 38.42]
  ];
  const netG = G([], { mask: `url(#${mid})` });
  g.insertBefore(netG, dots);
  const perHub = cities.map(() => 0);
  const network = NETWORK.map(ll => {
    const p = proj(ll);
    let hub = 0, bd = 1e9;
    cities.forEach((c, i) => { const d = Math.hypot(c.x - p[0], c.y - p[1]); if (d < bd) { bd = d; hub = i; } });
    const c = cities[hub];
    const mx = (c.x + p[0]) / 2, my = (c.y + p[1]) / 2;
    const nx = -(p[1] - c.y) * .2, ny = (p[0] - c.x) * .2;
    const arc = S('path', {
      class: 'ln', d: `M${c.x.toFixed(1)} ${c.y.toFixed(1)} Q${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`,
      pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, 'stroke-width': 1, opacity: 0
    });
    const ring = S('circle', { class: 'ring', r: 7, 'stroke-width': 1.2, opacity: 0 });
    const pin = G([
      S('circle', { r: 3.4, fill: '#fff' }),
      S('circle', { class: 'nd', r: 2.2 })
    ]);
    netG.appendChild(arc); netG.appendChild(ring); netG.appendChild(pin);
    const order = perHub[hub]++;
    return { arc, ring, pin, x: p[0], y: p[1], hub, delay: .35 + order * .14 };
  });

  let lastKey = '';
  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    /* ---- kamera ve küre ---- */
    const ent = eOut4(seg(t, T1.globeIn[0], T1.globeIn[1]));
    const zoomRaw = seg(t, T1.zoom[0], T1.zoom[1]);
    /* yakın plan: yavaş başlar, ortada hızlanır, yumuşak iner */
    const zoom = zoomRaw < .5 ? 16 * Math.pow(zoomRaw, 5) : 1 - Math.pow(-2 * zoomRaw + 2, 5) / 2;
    const live = 1 - zoom;
    const gx = lerp(GX + 86, GX, ent) + Math.sin(t * .8) * 8 * live;
    const gy = lerp(GY + 250, GY, ent) + Math.cos(t * .6) * 5 * live;
    const k = lerp(.42, 1, ent);
    const cx = lerp(gx, MX, zoom), cy = lerp(gy, MY, zoom);
    const spin = eInOut(seg(t, T1.spin[0], T1.spin[1]));
    const tiltU = eInOut(seg(t, T1.tilt[0], T1.tilt[1]));
    const lon = lerp(-200, FOCUS[0], spin);
    const lat = lerp(6, FOCUS[1], tiltU);
    const scale = R0 * k * Math.pow(R1 / R0, zoom);
    proj.translate([cx, cy]).scale(scale).rotate([-lon, -lat]);

    const key = [cx, cy, scale, lon, lat].map(v => v.toFixed(2)).join();
    if (key !== lastKey) {
      lastKey = key;
      const sph = geo({ type: 'Sphere' });
      [sea, hi, rim].forEach(e => set(e, 'd', sph));
      set(gratP, 'd', geo(grat));
      if (LAND) set(landP, 'd', geo(LAND));
    }
    const appear = eOut(seg(t, 0, .6));
    set(map, 'opacity', appear.toFixed(3));
    set(sea, 'opacity', (1 - zoom * .85).toFixed(3));
    set(hi, 'opacity', live.toFixed(3));
    set(rim, 'opacity', live.toFixed(3));
    set(gratP, 'opacity', (1 - zoom * .6).toFixed(3));
    set(landP, 'opacity', lerp(1, .5, zoom).toFixed(3));
    set(atmo, 'cx', cx.toFixed(1)); set(atmo, 'cy', cy.toFixed(1));
    set(atmo, 'r', (scale * 1.18).toFixed(1));
    set(atmo, 'opacity', (appear * live).toFixed(3));

    /* ---- uçak ---- */
    const orbitPt = (th, ox, oy, kk) => {
      const x = Math.cos(th) * R0 * RX * kk, y = Math.sin(th) * R0 * RY * kk;
      return { x: ox + x * Math.cos(TILT) - y * Math.sin(TILT), y: oy + x * Math.sin(TILT) + y * Math.cos(TILT), z: Math.sin(th) };
    };
    const setTrail = (th, fade, ox, oy, kk) => orbitDots.forEach((d, i) => {
      const a = th - (i + 1) * .085;
      const tp = orbitPt(a, ox, oy, kk);
      const op = a > TH0 ? (1 - i / TRAIL_N) * .55 * fade : 0;
      set(d.f, 'cx', tp.x.toFixed(1)); set(d.f, 'cy', tp.y.toFixed(1));
      set(d.b, 'cx', tp.x.toFixed(1)); set(d.b, 'cy', tp.y.toFixed(1));
      set(d.f, 'opacity', tp.z > 0 ? op.toFixed(3) : 0);
      set(d.b, 'opacity', tp.z > 0 ? 0 : (op * .6).toFixed(3));
    });

    if (t < T1.orbit[0]) {
      set(plane.g, 'opacity', 0);
      setTrail(TH0, 0, gx, gy, k);
    } else if (t < T1.dive[0]) {
      const th = theta(t);
      const p = orbitPt(th, gx, gy, k);
      const head = deg(orbitPt(th - .02, gx, gy, k), orbitPt(th + .04, gx, gy, k));
      const turn = wrapDeg(deg(orbitPt(th + .1, gx, gy, k), orbitPt(th + .14, gx, gy, k)) - deg(orbitPt(th - .14, gx, gy, k), orbitPt(th - .1, gx, gy, k)));
      const born = eOut(seg(t, T1.orbit[0], T1.orbit[0] + .45));
      const depth = (p.z + 1) / 2;
      toLayer(p.z > 0 ? front : back);
      plane.update(p.x, p.y, head, turn / 40, born * lerp(.5, 1.08, depth), born * lerp(.72, 1, depth), t);
      setTrail(th, born, gx, gy, k);
    } else if (t < T1.fly[0]) {
      /* Dalış: yörüngeden ayrılıp kamera yakınlaşırken yaklaşma noktasına iner. */
      const d0 = T1.dive[0];
      const gx0 = GX + Math.sin(d0 * .8) * 8, gy0 = GY + Math.cos(d0 * .6) * 5;
      const P0 = orbitPt(TH1, gx0, gy0, 1);
      const P0n = orbitPt(TH1 + .02, gx0, gy0, 1);
      const dirX = P0n.x - P0.x, dirY = P0n.y - P0.y, dl = Math.hypot(dirX, dirY);
      const dur = T1.dive[1] - d0;
      const v0 = endOmega * R0 * RX;                 /* yörüngeden çıkış hızı, px/sn */
      const EA = .8;                                   /* başta hızlı, sonda yavaş */
      const Aq = proj(APPROACH);
      /* Kontrol kolu kirişi aşarsa eğri geri kıvrılıyor ve uçak o karede burnunu
         180° çeviriyor. Kol kirişin %46'sıyla sınırlı: dalış hep tek yönlü. */
      const chord = Math.hypot(Aq[0] - P0.x, Aq[1] - P0.y);
      const h0 = Math.min(v0 * dur / (3 * (1 + EA)), chord * .46);
      const toM = { x: cities[0].x - A[0], y: cities[0].y - A[1] };
      const tl = Math.hypot(toM.x, toM.y);
      const B0 = P0, B1 = { x: P0.x + dirX / dl * h0, y: P0.y + dirY / dl * h0 };
      const B3 = { x: Aq[0], y: Aq[1] }, B2 = { x: B3.x - toM.x / tl * 90, y: B3.y - toM.y / tl * 90 };
      const x0 = seg(t, d0, T1.dive[1]);
      const u = x0 + EA * x0 * (1 - x0);
      const bz = (uu, a, b, c, d) => {
        const m = 1 - uu;
        return m * m * m * a + 3 * m * m * uu * b + 3 * m * uu * uu * c + uu * uu * uu * d;
      };
      const pt = uu => ({ x: bz(uu, B0.x, B1.x, B2.x, B3.x), y: bz(uu, B0.y, B1.y, B2.y, B3.y) });
      const p = pt(u);
      const head = deg(pt(Math.max(0, u - .01)), pt(Math.min(1, u + .02)));
      const turn = wrapDeg(deg(pt(u + .04), pt(u + .06)) - deg(pt(u - .06), pt(u - .04)));
      toLayer(front);
      plane.update(p.x, p.y, head, turn / 30, lerp(1.08, .92, smooth(x0)), 1, t);
      setTrail(TH1, 1 - seg(t, d0, d0 + .5), gx, gy, k);
    } else {
      setTrail(TH1, 0, gx, gy, k);
      toLayer(g);
      const s = sAt(t);
      if (t < F1) {
        const p = at(s);
        const q = seg(t, FE, F1);                      /* çıkış ilerlemesi */
        /* Çıkışta burun daha geniş bir yol parçasından yön alır: kavis keskin
           olsa da uçak dönüşü yayarak yapar, kırılma hissi kalmaz. Yatış ölçüsü
           pencere genişliğine bölünür, yoksa geniş pencerede kat kat büyür. */
        const hw = lerp(12, 34, smooth(q));
        const head = deg(at(s - hw / 3), at(s + hw));
        const turn = wrapDeg(deg(at(s + hw * 4 / 3), at(s + hw * 2))
          - deg(at(s - hw * 2), at(s - hw * 4 / 3))) * 12 / hw;
        const vn = speed(s) * TT / RL;               /* ortalamaya göre hız */
        /* Çıkış (FE–F1, T1.flyby sn). pk: ön plan geçişinde 3,4 katına büyür;
           aw: sağ üst köşeye tırmanırken küçülür, yani uzaklaşır. Sönme kadrajı
           terk ettikten sonra; bulanıklık yok, hareket tek başına anlatıyor. */
        const pk = Math.pow(clamp(q / .46), 1.6);        /* büyüme yavaş başlar */
        const aw = smooth(clamp((q - .5) / .5));
        const sc = .92 * (1 + .07 * (vn - 1)) * (1 + 1.85 * pk) * (1 - .84 * aw);
        plane.update(p.x, p.y + sn(t, .9) * 1.2 * (1 - .7 * pk), head, turn * vn / 32 * (1 - .5 * aw), sc,
          1 - smooth(clamp((q - .82) / .18)), t);
      } else set(plane.g, 'opacity', 0);
    }

    /* ---- rota ve kişiler ---- */
    const sNow = Math.min(t < F0 ? 0 : sAt(t), lastS);   /* iz son şehirde biter */
    set(trailReveal, 'stroke-dasharray', `${sNow.toFixed(1)} ${RL.toFixed(1)}`);
    set(trail, 'opacity', (t > F0 ? .7 : 0).toFixed(3));

    cities.forEach((c, i) => {
      const p = proj(c.ll);
      const a = T1.dots + i * .06;
      const du = eBack(seg(t, a, a + .4));
      const pass = passAt[i];
      const grow = eBack(seg(t, pass - .06, pass + .42));
      set(c.dot, 'transform', tr(p[0], p[1], clamp(du) * (1 - clamp(grow))));
      set(c.dot, 'opacity', clamp(seg(t, a, a + .2)).toFixed(3));

      const rp = seg(t, pass, pass + .6);
      set(c.ripple, 'transform', tr(c.x, c.y, .6 + rp * 1.2));
      set(c.ripple, 'opacity', (rp > 0 && rp < 1 ? (1 - rp) * .5 : 0).toFixed(3));

      const float = sn(t, 2.4, i / cities.length) * 2.4 * clamp(grow);
      set(c.bub, 'transform', tr(c.x, c.y + float, clamp(grow) * lerp(.2, 1, clamp(grow))));
      set(c.bub, 'opacity', clamp(seg(t, pass - .06, pass + .1)).toFixed(3));

      const bu = eBack(seg(t, pass + .16, pass + .6));
      set(c.badge, 'transform', tr(c.x, c.y + float + c.r + 14, clamp(bu)));
      set(c.badge, 'opacity', clamp(seg(t, pass + .16, pass + .36)).toFixed(3));
    });


    network.forEach(n => {
      const a = passAt[n.hub] + n.delay;
      const d = eInOut(seg(t, a, a + .55));
      set(n.arc, 'stroke-dashoffset', (1 - d).toFixed(4));
      set(n.arc, 'opacity', (d > 0 ? .32 : 0).toFixed(3));
      const hit = a + .5;
      const pu = eBack(seg(t, hit, hit + .35));
      set(n.pin, 'transform', tr(n.x, n.y, clamp(pu)));
      set(n.pin, 'opacity', clamp(seg(t, hit, hit + .15)).toFixed(3));
      const rp = seg(t, hit, hit + .7);
      set(n.ring, 'transform', tr(n.x, n.y, .4 + rp * 1.4));
      set(n.ring, 'opacity', (rp > 0 && rp < 1 ? (1 - rp) * .6 : 0).toFixed(3));
    });
    sparkCity.update(t, seg(t, 5.4, 6.2));   /* sonda sönmüyor: bekleme ölü kalmasın */
    sparkGlobe.update(t, seg(t, .55, 1.15) * (1 - seg(t, 3.1, 3.7)));
  } };
}

/* ═══════════ tasarımdaki ortak arayüz parçaları ═══════════ */
/* Hepsi Avrupa Cepte.pdf'ten: gönderi kartı (s.77), sayfa seçimi (s.70),
   "konu seçtin" hapları (s.112), tanıtım gönderisi (s.31), bildirimler
   (s.103). Ölçüler 393 genişlikte, kart genişliği 345. */

/* SF Symbols'daki mühürlü onay (checkmark.seal): tırtıklı daire. */
function sealPath(r) {
  const N = 10, ri = r * .88, br = ri * .38;
  let d = '';
  for (let i = 0; i < N; i++) {
    const a0 = i / N * Math.PI * 2 - Math.PI / 2, a1 = (i + 1) / N * Math.PI * 2 - Math.PI / 2;
    const p0 = [Math.cos(a0) * ri, Math.sin(a0) * ri], p1 = [Math.cos(a1) * ri, Math.sin(a1) * ri];
    if (!i) d += `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}`;
    d += ` A${br.toFixed(2)} ${br.toFixed(2)} 0 0 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
  }
  return d + 'Z';
}
const CHECK = 'M-3.1 .1 L-1.1 2.2 L3.2 -2.4';
const UW = 345, UL = CX - UW / 2, PAD = 16;   /* kart genişliği, sol kenar, iç boşluk */

let UID = 0;
function photo(href, r, ring) {
  const id = `ph${++UID}`;
  return G([
    S('defs', null, S('clipPath', { id }, S('circle', { cx: 0, cy: 0, r }))),
    S('circle', { class: 'card-soft', cx: 0, cy: 0, r }),
    S('image', { href, x: -r, y: -r, width: r * 2, height: r * 2, preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#${id})` }),
    S('circle', { class: ring || 'ui-ring', cx: 0, cy: 0, r })
  ]);
}
const face = (img, r) => photo(`${AST}people/${img}`, r);
const flagDot = (flag, r) => photo(`${AST}flags/${flag}.svg`, r, 'ui-ring-thin');
/* Figtree için kaba metin genişliği; hap ve rozetler buna göre boyutlanır */
const tw = (s, fs, k) => s.length * fs * (k || .56);

/* Sayfa hapı: dairesel bayrak ya da emoji + "/ad". Sol kenardan, dikey ortadan. */
function pagePill(label, icon, fs) {
  fs = fs || 12.5;
  const h = Math.round(fs * 2.1), w = tw(label, fs, .56) + h + 12;
  const ic = icon.length > 3
    ? G([flagDot(icon, h * .34)], { transform: tr(h / 2, 0) })
    : txt(icon, { x: h / 2, y: fs * .38, 'font-size': fs, 'text-anchor': 'middle' });
  const g = G([
    S('rect', { class: 'ui-pill', x: 0, y: -h / 2, width: w, height: h, rx: h / 2 }),
    ic,
    txt(label, { class: 'ui-name', x: h - 2, y: fs * .36, 'font-size': fs })
  ]);
  g.w = w;
  return g;
}

/* Mühürlü tür rozeti: "Sordu" gri, "Haber" mavi */
function kindBadge(kind) {
  const b = kind === 'Haber';
  return G([
    S('path', { class: b ? 'ui-seal-b' : 'ui-seal', d: sealPath(7.6) }),
    S('path', { class: b ? 'ui-seal-b' : 'ui-seal', d: CHECK, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    txt(kind, { class: b ? 'ui-brand-t' : 'ui-mute', x: 11, y: 4.2, 'font-size': 12.5 })
  ]);
}

/* oy · cevap · paylaş satırı; dikey ortası y=0 */
function actionRow(up, co) {
  const upT = txt(String(up), { class: 'ui-up-t', x: 14, y: 4.6, 'font-size': 13.5, 'text-anchor': 'middle' });
  const coT = txt(String(co), { class: 'ui-mute', x: 15, y: 4.6, 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 600 });
  const comment = G([
    S('rect', { class: 'ui-ghost', x: 0, y: -17, width: 58, height: 34, rx: 12 }),
    coT,
    S('path', {
      class: 'ui-ico', transform: tr(40, -1),
      d: 'M-5.4 -5 H5.4 A3.4 3.4 0 0 1 8.8 -1.6 V1.6 A3.4 3.4 0 0 1 5.4 5 H-1.6 L-6.6 8 L-5.6 4.7 A3.4 3.4 0 0 1 -8.8 1.6 V-1.6 A3.4 3.4 0 0 1 -5.4 -5 Z'
    })
  ], { transform: tr(66, 0) });
  const g = G([
    G([
      S('rect', { class: 'ui-up', x: 0, y: -17, width: 58, height: 34, rx: 12 }),
      upT,
      S('path', { class: 'ui-up-i', d: 'M0 -6.2 L6.2 0 L2.7 0 L2.7 5.6 L-2.7 5.6 L-2.7 0 L-6.2 0 Z', transform: tr(38, 0) })
    ]),
    comment,
    G([
      S('rect', { class: 'ui-ghost', x: -19, y: -17, width: 38, height: 34, rx: 12 }),
      S('path', { class: 'ui-ico', d: 'M-5 -1.2 V5.2 A2.2 2.2 0 0 0 -2.8 7.4 H2.8 A2.2 2.2 0 0 0 5 5.2 V-1.2' }),
      S('path', { class: 'ui-ico', d: 'M0 3 V-7.4 M-3.1 -4.4 L0 -7.6 L3.1 -4.4' })
    ], { transform: tr(UW - PAD * 2 - 19, 0) })
  ]);
  return { g, upT, coT, comment };
}

/* Başlık satırı: portre, ad, tür rozeti, şehir · süre, menü */
function postHead(img, name, kind, meta) {
  const AV = 15, nx = PAD + AV * 2 + 10;
  return G([
    G([face(img, AV)], { transform: tr(PAD + AV, PAD + AV) }),
    txt(name, { class: 'ui-name', x: nx, y: PAD + 13, 'font-size': 15 }),
    G([kindBadge(kind)], { transform: tr(nx + tw(name, 15, .55) + 14, PAD + 8.5) }),
    txt(meta, { class: 'ui-mute', x: nx, y: PAD + 31, 'font-size': 12.5 }),
    G([S('path', { class: 'ui-menu', d: 'M0 0 H18' }), S('path', { class: 'ui-menu', d: 'M0 5.5 H18' })],
      { transform: tr(UW - PAD - 18, PAD + 9) })
  ]);
}

/* Akıştaki tam gönderi (s.76): başlık, metin, sayfa hapı, aksiyonlar */
function feedPost(o) {
  const g = G([]);
  const plate = S('rect', { class: 'ui-card', x: 0, y: 0, width: UW, height: 10, rx: 24, filter: 'url(#obPostSh)' });
  g.appendChild(plate);
  g.appendChild(postHead(o.img, o.name, o.kind, o.meta));
  o.lines.forEach((s, i) => g.appendChild(txt(s, { class: 'ui-body', x: PAD, y: 80 + i * 21, 'font-size': 15 })));
  const yL = 80 + (o.lines.length - 1) * 21;
  const pp = pagePill(o.page[0], o.page[1]);
  set(pp, 'transform', tr(PAD, yL + 30));
  g.appendChild(pp);
  const ar = actionRow(o.up, o.co);
  set(ar.g, 'transform', tr(PAD, yL + 72));
  g.appendChild(ar.g);
  g.h = yL + 72 + 17 + PAD;
  set(plate, 'height', g.h);
  return g;
}

/* Yumuşak kenarlı görünüm alanı: akış yukarıda ve metnin üstünde söner. */
function viewMask(id, y0, y1, f) {
  const gid = `${id}G`, span = y1 - y0;
  return [
    S('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: 0, y1: y0, x2: 0, y2: y1 }, [
      S('stop', { offset: 0, 'stop-color': '#000' }),
      S('stop', { offset: (f / span).toFixed(4), 'stop-color': '#fff' }),
      S('stop', { offset: (1 - f / span).toFixed(4), 'stop-color': '#fff' }),
      S('stop', { offset: 1, 'stop-color': '#000' })
    ]),
    S('mask', { id, maskUnits: 'userSpaceOnUse', x: -200, y: -400, width: 800, height: 1600 },
      S('rect', { x: -200, y: -400, width: 800, height: 1600, fill: `url(#${gid})` }))
  ];
}

/* Parıltı: dört köşeli küçük yıldızlar, verilen noktalarda sırayla parlar.
   Her nokta [x, y, ölçek, faz]; faz döngü içindeki gecikme, hepsi aynı anda
   parlamasın diye. update(t, on) ile şiddeti dışarıdan kısılabilir. */
const SPARK = 'M0 -1 Q.2 -.2 1 0 Q.2 .2 0 1 Q-.2 .2 -1 0 Q-.2 -.2 0 -1 Z';
function sparkles(list, cls) {
  const items = list.map(([x, y, sc, ph]) => ({
    e: S('path', { class: cls || 'ui-logo', d: SPARK, opacity: 0 }), x, y, sc: sc || 1, ph: ph || 0
  }));
  const g = G(items.map(i => i.e));
  return { g, update(t, on) {
    const k = on == null ? 1 : clamp(on);
    items.forEach(i => {
      const u = (t / 1.5 + i.ph) % 1;
      const f = Math.sin(Math.PI * clamp(u / .6)) * k;
      set(i.e, 'transform', tr(i.x, i.y, (i.sc * (3.4 + 2.6 * f)).toFixed(3)));
      set(i.e, 'opacity', (f * .85).toFixed(3));
    });
  } };
}

/* ═══════════ 02 · Sor, paylaş, tavsiye al ═══════════ */
/* Akış kayar ve sorunun olduğu gönderide durur. Avrupa'nın farklı
   şehirlerinden cevaplar tek tek yazılarak gelir ve kartın altına dizilir;
   biri "En iyi cevap" seçilir, kartın içine çıkar ve gönderi "Soru
   Çözüldü" olur. Kalan cevaplar aşağıda kalır: sohbet sürüyor. */
function scene2() {
  const g = G([]);
  const AV = 15, ANS_T = 118, ANS_H = 108;
  const TOP = 92, RH = 48, RG = 7;
  const layout = u => {
    const content = ANS_T + (ANS_H + 14) * u;
    const pillCY = content + 13;
    const actCY = pillCY + 40;
    return { pillCY, actCY, h: actCY + 17 + PAD };
  };
  const H0 = layout(0).h;

  const view = G([], { mask: 'url(#obView2)' });
  g.appendChild(S('defs', null, viewMask('obView2', 58, 584, 30)));
  g.appendChild(view);

  /* --- akış: gönderiler tek tek girer (kaydırma yok), soru aralarından öne çıkar.
     Hepsi aynı yükseklikte (~204) olduğu için yuvalar sabit aralıklı. --- */
  const FS2 = .78, SP = 172, FX = UL + UW * (1 - FS2) / 2;
  const SLOT = i => TOP + i * SP;
  const fills = [
    { img: 'kisi-2.jpg', name: 'Selin Aydın', kind: 'Haber', meta: 'Brüksel • 1s', page: ['/schengen vizesi', '✈️'], up: 38, co: 12,
      lines: ['Schengen’de yeni giriş-çıkış sistemi:', 'bilmen gereken beş şey.'], slot: 0, a: .12 },
    { img: 'erkek-1.jpg', name: 'Mert Şahin', kind: 'Sordu', meta: 'Rotterdam • 3s', page: ['/hollanda', 'hollanda'], up: 9, co: 6,
      lines: ['Rotterdam’da uygun oda arayan var mı?', 'Birlikte ev tutabiliriz.'], slot: 2, a: .62 },
    { img: 'kisi-5.jpg', name: 'Emre Kaya', kind: 'Paylaştı', meta: 'Viyana • 5s', page: ['/kariyer', '💼'], up: 21, co: 7,
      lines: ['Viyana’da mülakat sürecim: üç turda', 'neler soruldu?'], slot: 3, a: .9 },
    { img: 'kisi-4.jpg', name: 'Can Demir', kind: 'Sordu', meta: 'Münih • 7s', page: ['/almanya', 'almanya'], up: 14, co: 5,
      lines: ['Münih’te Anmeldung randevusu', 'ne kadar sürede çıkıyor?'], slot: 4, a: 1.18 }
  ].map(o => { const e = feedPost(o); view.appendChild(e); return Object.assign({ e }, o); });

  /* --- soru kartı --- */
  const card = G([]);
  view.appendChild(card);
  const plate = S('rect', { class: 'ui-card', x: 0, y: 0, width: UW, height: H0, rx: 24, filter: 'url(#obCardSh)' });
  card.appendChild(plate);

  const name = txt('Elif Yılmaz', { class: 'ui-name', x: PAD + AV * 2 + 10, y: PAD + 13, 'font-size': 15 });
  const asked = G([kindBadge('Sordu')], { opacity: 0 });
  card.appendChild(G([
    G([face('kadin-1.jpg', AV)], { transform: tr(PAD + AV, PAD + AV) }),
    name, asked,
    txt('Berlin • 2s', { class: 'ui-mute', x: PAD + AV * 2 + 10, y: PAD + 31, 'font-size': 12.5 }),
    G([S('path', { class: 'ui-menu', d: 'M0 0 H18' }), S('path', { class: 'ui-menu', d: 'M0 5.5 H18' })],
      { transform: tr(UW - PAD - 18, PAD + 9) })
  ]));
  ['Mavi Kart başvurusunda randevuyu', 'nasıl hızlandırdınız?'].forEach((s, i) =>
    card.appendChild(txt(s, { class: 'ui-body', x: PAD, y: 80 + i * 21, 'font-size': 15 })));

  /* en iyi cevap kutusu: yukarıdan aşağı açılır */
  const ansBox = S('rect', { class: 'ui-ans', x: PAD, y: ANS_T, width: UW - PAD * 2, height: ANS_H, rx: 16 });
  const ansRect = S('rect', { x: PAD, y: ANS_T, width: UW - PAD * 2, height: ANS_H, rx: 16 });
  g.querySelector('defs').appendChild(S('clipPath', { id: 'obAnsClip' }, ansRect));
  const ansIn = G([], { 'clip-path': 'url(#obAnsClip)' });
  const ans = G([ansBox, ansIn], { opacity: 0 });
  card.appendChild(ans);
  const ansHead = G([
    G([face('kisi-3.jpg', 11)], { transform: tr(PAD + 14 + 11, ANS_T + 22) }),
    txt('Zeynep T.', { class: 'ui-name', x: PAD + 14 + 32, y: ANS_T + 26, 'font-size': 13.5 })
  ]);
  ansIn.appendChild(ansHead);
  const best = G([
    S('circle', { class: 'ui-ok-fill', cx: 0, cy: 0, r: 8.2 }),
    S('path', { d: CHECK, fill: 'none', stroke: '#fff', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    txt('En iyi cevap', { class: 'ui-ok', x: 11, y: 4.3, 'font-size': 13 })
  ]);
  ansIn.appendChild(best);
  const aLines = [
    'Ben Berlin’de üç hafta bekledim. Randevu',
    'için sabah 07.00’de bakmak işe yarıyor;',
    'evrak listesini de mesajla atayım.'
  ].map((s, i) => txt(s, { class: 'ui-body', x: PAD + 14, y: ANS_T + 50 + i * 19, 'font-size': 13.5, opacity: 0 }));
  aLines.forEach(e => ansIn.appendChild(e));

  const euPill = pagePill('/avrupa', 'avrupa');
  card.appendChild(euPill);
  const solvedW = 112;
  const solved = G([
    S('rect', { class: 'ui-ok-fill', x: -solvedW / 2, y: -15, width: solvedW, height: 30, rx: 15 }),
    txt('Soru Çözüldü', { class: 'ui-ok-ink', x: 0, y: 4.6, 'font-size': 13, 'text-anchor': 'middle' })
  ], { opacity: 0 });
  card.appendChild(solved);
  const act = actionRow(4, 0);
  card.appendChild(act.g);
  /* seçim çerçevesi: büyümeden önce bu gönderinin seçildiği görünür */
  const pick2 = S('rect', { class: 'ui-sel', x: -3, y: -3, width: UW + 6, height: H0 + 6, rx: 27, opacity: 0 });
  card.appendChild(pick2);

  /* --- cevaplar: her biri başka bir şehirden, yazılarak gelir --- */
  const REPLIES = [
    { img: 'kisi-4.jpg', name: 'Can D.', flag: 'almanya', city: 'Münih', text: 'Randevular gece 00.00’da açılıyor, dene.', a: 3.3, side: -1 },
    { img: 'kisi-3.jpg', name: 'Zeynep T.', flag: 'almanya', city: 'Berlin', text: 'Sabah 07.00’de bakmak işe yarıyor.', a: 3.82, side: 1, best: true },
    { img: 'kisi-1.jpg', name: 'Deniz A.', flag: 'hollanda', city: 'Amsterdam', text: 'IND’de de böyleydi, iptalleri takip et.', a: 4.34, side: -1 },
    { img: 'kisi-5.jpg', name: 'Emre K.', flag: 'avusturya', city: 'Viyana', text: 'Takipteyim, ben de randevu bekliyorum.', a: 4.86, side: 1 },
    /* soru çözüldükten sonra da sohbet sürüyor: akış yukarı kayar, yenileri gelir */
    { img: 'kadin-1.jpg', name: 'Elif Y.', flag: 'fransa', city: 'Lyon', text: 'Lyon’da da aynı yöntem işe yaradı.', a: 8.5, side: -1 },
    { img: 'erkek-1.jpg', name: 'Mert Ş.', flag: 'turkiye', city: 'İstanbul', text: 'Konsolosluk hattı sabah 08.00’de açılıyor.', a: 9.15, side: 1 }
  ];
  const rows = REPLIES.map((r, k) => {
    const cid = `obType${k}`;
    const typeRect = S('rect', { x: 50, y: 26, width: 0, height: 20 });
    const nx = 52, fx = nx + tw(r.name, 13.5, .55) + 12;
    const green = S('rect', { class: 'ui-ans', x: 0, y: 0, width: UW, height: RH, rx: 16, opacity: 0 });
    const when = txt('şimdi', { class: 'ui-mute', x: UW - 14, y: 20, 'font-size': 11.5, 'text-anchor': 'end' });
    const tick = G([
      S('circle', { class: 'ui-ok-fill', cx: 0, cy: 0, r: 8 }),
      S('path', { d: CHECK, fill: 'none', stroke: '#fff', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
    ], { opacity: 0 });
    const e = G([
      S('defs', null, S('clipPath', { id: cid }, typeRect)),
      S('rect', { class: 'ui-card', x: 0, y: 0, width: UW, height: RH, rx: 16, filter: 'url(#obRowSh)' }),
      green,
      G([face(r.img, 14)], { transform: tr(24, RH / 2) }),
      txt(r.name, { class: 'ui-name', x: nx, y: 20, 'font-size': 13.5 }),
      G([flagDot(r.flag, 5.5)], { transform: tr(fx, 15.6) }),
      txt(r.city, { class: 'ui-mute', x: fx + 9, y: 20, 'font-size': 12 }),
      when,
      txt(r.text, { class: 'ui-body', x: nx, y: 38, 'font-size': 13, 'clip-path': `url(#${cid})` })
    ], { opacity: 0 });
    e.appendChild(G([tick], { transform: tr(UW - 22, RH / 2) }));
    view.appendChild(e);
    return Object.assign({ e, typeRect, green, when, tick, k }, r);
  });
  const slot = k => TOP + H0 + 12 + k * (RH + RG);
  const others = rows.filter(r => !r.best);
  /* parıltı: cevap seçilince kartın üstünde, sonra "Soru Çözüldü" rozetinde */
  const sparkBest = sparkles([[UW - 96, 150, 1, 0], [UW - 52, 132, .8, .4], [UW - 140, 140, .75, .7]]);
  const sparkOk = sparkles([[UW - 44, 42, 1, .15], [UW - 128, 34, .85, .55], [UW - 86, 62, .7, .85]]);
  card.appendChild(sparkBest.g);
  card.appendChild(sparkOk.g);
  /* cevaplar gelirken akışın üstünde hafif ışık: ekran hep canlı kalsın */
  const sparkFeed = sparkles([[UL + 22, 300, .8, 0], [UL + UW - 26, 336, .75, .37],
    [UL + 52, 420, .7, .64], [UL + UW - 62, 452, .8, .85], [UL + UW / 2, 276, .65, .21]]);
  view.appendChild(sparkFeed.g);
  const bestRow = rows.find(r => r.best);

  let laid = false;
  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    /* ad genişliği DOM'a girince ölçülür; gizliyken 0 döner, o zaman
       görünür olduğu ilk karede yeniden denenir */
    if (!laid) {
      const w = name.getComputedTextLength();
      set(asked, 'transform', tr(PAD + AV * 2 + 10 + (w || 84) + 15, PAD + 8.5));
      set(asked, 'opacity', w ? 1 : 0);
      laid = w > 0;
    }

    /* gönderiler tek tek akışa girer; 2,3'ten sonra soru kartı öne çıkar,
       diğerleri hafifçe yukarı süzülüp söner */
    /* Akış 60px süzülüp duruyor: soru kartı ekranın ortasında (y≈204) kalıyor.
       2,3'te mavi seçim çerçevesi çakıyor, 2,95'te kart büyüyüp tepeye çıkıyor. */
    const foc = eInOut(seg(t, 2.35, 3.0));
    const drift = eInOut(seg(t, .75, 1.85)) * 60;
    const pk2 = seg(t, 1.85, 2.02) * (1 - seg(t, 2.45, 2.7));
    set(pick2, 'opacity', (pk2 * (.55 + .45 * Math.abs(Math.sin((t - 1.85) * 4.2)))).toFixed(3));
    fills.forEach(f => {
      const u = eOut4(seg(t, f.a, f.a + .75));
      const y = SLOT(f.slot) + (1 - u) * 46 - drift - foc * 28;
      set(f.e, 'transform', tr(FX, y, FS2));
      /* tepede görünüm maskesi (58) zaten söndürüyor, ayrıca sönüm gerekmiyor */
      set(f.e, 'opacity', (clamp(seg(t, f.a, f.a + .32)) * (1 - seg(foc, 0, .62))).toFixed(3));
    });

    const open = eInOut(seg(t, 6.05, 7.15));
    const L = layout(open);
    set(plate, 'height', L.h.toFixed(1));
    /* soru çözüldükten sonra akış yavaşça yukarı süzülüyor: ekran donmuyor,
       yeni cevaplar alttan girecek yeri buluyor */
    /* sonda akış yavaşça kayar: 1,5 sn'de 118px, yeni cevaplara yer açar */
    const late = eOut(seg(t, 8.35, 9.6)) * 118;
    const cu = eOut4(seg(t, .38, 1.0));
    set(card, 'transform', tr(lerp(FX, UL, foc),
      lerp(SLOT(1) + (1 - cu) * 46 - drift, TOP, foc) - late
        + Math.sin(t * .8) * 1.4 * seg(t, 8.3, 9.0), lerp(FS2, 1, foc)));
    set(card, 'opacity', clamp(seg(t, .38, .68)).toFixed(3));
    /* parıltı: cevap seçilirken, kutu açılırken ve rozetlerde */
    sparkBest.update(t, seg(t, 5.6, 5.95) * (1 - seg(t, 7.6, 7.9)));
    sparkOk.update(t, seg(t, 7.95, 8.3));
    sparkFeed.update(t, seg(t, 3.4, 3.9) * (1 - seg(t, 6.0, 6.5)) + seg(t, 8.1, 8.6) * .8);

    set(ansRect, 'height', Math.max(.01, ANS_H * open).toFixed(2));
    set(ansBox, 'height', Math.max(.01, ANS_H * open).toFixed(2));
    set(ans, 'opacity', (open > 0 ? 1 : 0).toFixed(3));
    set(ansHead, 'opacity', clamp(seg(t, 6.6, 6.9)).toFixed(3));
    aLines.forEach((e, i) => set(e, 'opacity', clamp(seg(t, 6.72 + i * .14, 7.05 + i * .14)).toFixed(3)));
    const bu = eBack(seg(t, 7.2, 7.72));
    set(best, 'transform', tr(UW - PAD - 14 - 78, ANS_T + 22, clamp(bu)));
    set(best, 'opacity', clamp(seg(t, 7.2, 7.45)).toFixed(3));

    set(euPill, 'transform', tr(PAD, L.pillCY));
    set(act.g, 'transform', tr(PAD, L.actCY));
    const su = eBack(seg(t, 7.9, 8.45));
    set(solved, 'transform', tr(UW - PAD - solvedW / 2, L.pillCY, clamp(su)));
    set(solved, 'opacity', clamp(seg(t, 7.9, 8.15)).toFixed(3));

    /* cevaplar */
    let arrived = 0, bump = 0;
    rows.forEach(r => {
      const u = eBack(seg(t, r.a, r.a + .6));
      const ue = clamp(u);
      let x = UL + r.side * (1 - ue) * 46, y = slot(r.k) + (1 - ue) * 16, s = lerp(.95, 1, ue);
      let op = clamp(seg(t, r.a, r.a + .2));
      set(r.typeRect, 'width', ((UW - 66) * eOut(seg(t, r.a + .3, r.a + .95))).toFixed(1));
      if (t >= r.a + .45) arrived++;
      bump = Math.max(bump, 1 - clamp(Math.abs(t - (r.a + .45)) / .2));

      if (r.best) {
        const hl = seg(t, 5.6, 5.95);
        set(r.green, 'opacity', hl.toFixed(3));
        set(r.when, 'opacity', (1 - hl).toFixed(3));
        set(r.tick, 'opacity', hl.toFixed(3));
        set(r.tick, 'transform', tr(0, 0, lerp(.4, 1, clamp(eBack(seg(t, 5.6, 6.0))))));
        /* kartın içindeki kutuya yükselir, kutu açılınca yerini ona bırakır */
        if (open > 0) {
          x = lerp(x, UL + PAD, open);
          y = lerp(y, TOP + ANS_T, open);
          s = lerp(1, (UW - PAD * 2) / UW, open);
          op *= 1 - seg(open, .55, .95);
        }
      } else if (open > 0) {
        const j = others.indexOf(r);
        y = Math.max(y, TOP + L.h + 12 + j * (RH + RG));
      }
      /* yerleşen satırlar hafifçe süzülür: sohbet donmuş görünmez */
      y += Math.sin(t * .95 + r.k * 1.1) * 1.5 * clamp(seg(t, r.a + .8, r.a + 1.3));
      y -= late;
      op *= 1 - seg(y, 470, 510);
      set(r.e, 'transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(r.side * 3 * (1 - ue)).toFixed(2)}) scale(${s.toFixed(4)})`);
      set(r.e, 'opacity', op.toFixed(3));
    });
    act.coT.textContent = arrived;
    act.upT.textContent = 4 + Math.round(10 * clamp(seg(t, 3.3, 5.4)) + 9 * clamp(seg(t, 6.0, 10.0)));
    set(act.comment, 'transform', tr(66, 0, 1 + bump * .1));
    /* seçilen cevap her zaman en üstte çizilir */
    if (view.lastChild !== bestRow.e) view.appendChild(bestRow.e);
  } };
}

/* ═══════════ 03 · Gündemi takip et ═══════════ */
/* Sayfa seçimi (s.70): konumdan otomatik seçilen iki sayfanın altına iki
   sayfa daha işaretlenir. Kartlar hapına dönüşüp "6 konu seçtin" bulutuna
   (s.112) uçar; altından bu sayfalardan gelen gönderilerle akış kurulur. */
function scene3() {
  const g = G([]);
  const view = G([], { mask: 'url(#obView3)' });
  g.appendChild(S('defs', null, [
    ...viewMask('obView3', 58, 584, 30),
    S('clipPath', { id: 'obNewsImg' }, S('rect', { x: 12, y: 12, width: 88, height: 88, rx: 14 }))
  ]));
  g.appendChild(view);

  const CH = 78, CG = 8, TOP = 92;
  const PAGES = [
    { label: '/avrupa', icon: 'avrupa', title: 'Tüm Avrupa gündemi ve haberler', meta: '41.8K üye • 1.4K paylaşım', auto: true },
    { label: '/hollanda', icon: 'hollanda', title: 'Yaşadığın ülkenin topluluğu', meta: '12.4K üye • 118 paylaşım', auto: true },
    { label: '/kariyer', icon: '💼', title: 'İş ilanları, CV, mülakat deneyimleri', meta: '41.8K üye • 1.4K paylaşım', pick: .85 },
    { label: '/konut', icon: '🏡', title: 'Ev ve oda ilanları, kira sözleşmeleri', meta: '4.5K üye • 44 paylaşım', pick: 1.2 },
    { label: '/eğitim', icon: '🎓', title: 'Üniversite, dil okulu ve burslar', meta: '28.1K üye • 640 paylaşım', pick: 1.55 }
  ];
  const EXTRA = [{ label: '/schengen vizesi', icon: '✈️', a: 2.7 }, { label: '/sağlık', icon: '🏥', a: 2.85 }];

  const cards = PAGES.map((p, k) => {
    const y = TOP + k * (CH + CG);
    const sel = S('rect', { class: 'ui-sel', x: 0, y: 0, width: UW, height: CH, rx: 18, opacity: 0 });
    const off = S('path', { class: 'ui-chk-off', d: 'M-6 .5 L-2 4.5 L6.5 -4.5', opacity: p.auto ? 1 : .45 });
    const on = S('path', { class: 'ui-chk-on', d: 'M-6 .5 L-2 4.5 L6.5 -4.5', opacity: 0 });
    const chk = G([S('circle', { class: 'ui-chk', cx: 0, cy: 0, r: 17 }), off, on]);
    const ripple = S('circle', { class: 'ring', cx: 0, cy: 0, r: 17, 'stroke-width': 1.6, opacity: 0 });
    const body = G([
      S('rect', { class: 'ui-page', x: 0, y: 0, width: UW, height: CH, rx: 18 }),
      sel,
      p.auto ? txt('Konumuna göre otomatik seçildi.', { class: 'ui-brand-t', x: UW - 14, y: 26, 'font-size': 11, 'text-anchor': 'end' }) : null,
      txt(p.title, { class: 'ui-name', x: 14, y: 52, 'font-size': 14, 'font-weight': 600 }),
      txt(p.meta, { class: 'ui-mute', x: 14, y: 70, 'font-size': 12.5 }),
      G([ripple, chk], { transform: tr(UW - 36, 50) })
    ]);
    const e = G([body]);
    view.appendChild(e);
    return Object.assign({ e, body, sel, off, on, chk, ripple, y }, p);
  });

  /* Konu küresi: seçilen konular 3B bir küreye dizilir, küre her konuyu öne
     getirip durur, o konuya basılır ve ilgili haber parıltıyla açılır.
     Derinlik ölçek + opaklıkla, sıra da her karede yeniden dizilerek verilir. */
  const sphere = G([]);
  view.appendChild(sphere);
  const LON = 360 / 7;
  const TOPICS = [
    { key: 0, lon: 0, lat: -15 },            /* dokunulan 1 */
    { key: 2, lon: LON, lat: 19 },
    { key: 'e0', lon: LON * 2, lat: -7 },    /* dokunulan 2 */
    { key: 1, lon: LON * 3, lat: 17 },
    { key: 3, lon: LON * 4, lat: -20 },      /* dokunulan 3 */
    { key: 4, lon: LON * 5, lat: 8 },
    { key: 'e1', lon: LON * 6, lat: -4 }
  ];
  const RSX = 117, RSY = 82, SX = CX - 7, SY = 250;   /* SX: geniş haplar sağa taşmasın */
  const pills = {};
  cards.forEach((c, k) => { pills[k] = pagePill(c.label, c.icon, 13); sphere.appendChild(pills[k]); });
  const extras = EXTRA.map((x, i) => {
    const pill = pagePill(x.label, x.icon, 13);
    sphere.appendChild(pill);
    pills['e' + i] = pill;
    return Object.assign({ pill, key: 'e' + i }, x);
  });
  const halo = S('ellipse', { class: 'ring', cx: SX, cy: SY, rx: RSX + 16, ry: RSY + 14, 'stroke-width': 1.2, opacity: 0 });
  sphere.insertBefore(halo, sphere.firstChild);
  const tapRing = S('circle', { class: 'ring', cx: 0, cy: 0, r: 20, 'stroke-width': 1.8, opacity: 0 });
  sphere.appendChild(tapRing);
  const chosen = txt('7 konu seçtin', { class: 'ui-mute', x: CX, y: 146, 'font-size': 13.5, 'text-anchor': 'middle', opacity: 0 });
  view.appendChild(chosen);

  /* --- dokunulan konunun haberi --- */
  const NEWS = [
    { ti: 0, img: 'fransa.jpg', lines: ['AB dijital vize sistemi için', 'tarihi açıkladı'], meta: 'Avrupa Komisyonu • 2 sa', tap: 3.62 },
    { ti: 2, img: 'almanya.jpg', lines: ['Randevu kotaları üç ülkede', 'birden artırıldı'], meta: '/schengen vizesi • 5 sa', tap: 5.82 },
    { ti: 4, img: 'hollanda.jpg', lines: ['Amsterdam’da kira tavanı', 'genişletiliyor'], meta: '/konut • 12 sa', tap: 8.02 }
  ];
  const NH3 = 112, NY = 396;
  const news = NEWS.map(n => {
    const e = G([
      S('rect', { class: 'ui-card', x: 0, y: 0, width: UW, height: NH3, rx: 20, filter: 'url(#obCardSh)' }),
      G([S('image', { href: `${AST}places/${n.img}`, x: 12, y: 12, width: 88, height: 88, preserveAspectRatio: 'xMidYMid slice' })],
        { 'clip-path': 'url(#obNewsImg)' }),
      ...n.lines.map((s, i) => txt(s, { class: 'ui-name', x: 114, y: 38 + i * 21, 'font-size': 14.5, 'font-weight': 600 })),
      txt(n.meta, { class: 'ui-mute', x: 114, y: 86, 'font-size': 12.5 })
    ], { opacity: 0 });
    view.appendChild(e);
    return Object.assign({ e }, n);
  });
  const sparkNews = sparkles([[UL + 18, NY - 10, 1, 0], [UL + UW - 24, NY - 6, .9, .34],
    [UL + UW - 60, NY + NH3 + 6, .8, .68], [UL + 70, NY + NH3 + 10, .75, .12],
    [UL + UW - 14, NY + NH3 / 2, .7, .52], [UL + 6, NY + NH3 / 2, .7, .88]]);
  view.appendChild(sparkNews.g);
  const sparkSph = sparkles([[SX - 128, SY - 58, 1, .1], [SX + 130, SY - 32, .85, .44],
    [SX - 92, SY + 76, .8, .7], [SX + 100, SY + 68, .9, .9], [SX + 6, SY - 104, .75, .26],
    [SX - 138, SY + 30, .7, .62], [SX + 140, SY + 46, .75, .08], [SX - 20, SY + 110, .65, .5]]);
  view.appendChild(sparkSph.g);

  /* küre dönüşü: her konuyu öne getirip durur */
  const ROT0 = 96, STOP = [0, -LON * 2, -LON * 4];
  const TURN = [[2.85, 3.5], [5.05, 5.7], [7.25, 7.9]];

  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    const gather = eInOut(seg(t, 2.0, 2.85));      /* kartlar hapa dönüşür */
    cards.forEach((c, k) => {
      const a = .06 + k * .08;
      const inU = eOut4(seg(t, a, a + .5));
      if (c.pick) {
        const sl = seg(t, c.pick, c.pick + .22);
        set(c.sel, 'opacity', sl.toFixed(3));
        set(c.off, 'opacity', (.45 * (1 - sl)).toFixed(3));
        set(c.on, 'opacity', sl.toFixed(3));
        set(c.chk, 'transform', tr(0, 0, 1 + .16 * Math.sin(Math.PI * seg(t, c.pick, c.pick + .32))));
        const rp = seg(t, c.pick, c.pick + .6);
        set(c.ripple, 'r', (17 + rp * 16).toFixed(2));
        set(c.ripple, 'opacity', (rp > 0 && rp < 1 ? (1 - rp) * .5 : 0).toFixed(3));
      }
      const y = c.y + (1 - inU) * 36;
      set(c.e, 'transform', tr(UL, y - gather * 26, lerp(1, .96, gather)));
      set(c.e, 'opacity', (clamp(seg(t, a, a + .3)) * (1 - seg(gather, 0, .6))).toFixed(3));
      c.px = UL + 14; c.py = y + 24;
      c.born = clamp(seg(t, a, a + .3));
    });
    set(chosen, 'opacity', (clamp(seg(t, 2.55, 2.9)) * (1 - seg(t, 3.3, 3.6))).toFixed(3));

    /* dönüş açısı: duraklarda hafif salınım, ekran hiç donmuyor */
    let rot = ROT0;
    TURN.forEach((w, i) => { if (t >= w[0]) rot = lerp(i ? STOP[i - 1] : ROT0, STOP[i], eInOut(seg(t, w[0], w[1]))); });
    rot += Math.sin(t * 1.3) * 3.4 - Math.max(0, t - 8.35) * 2.8;   /* sonda yavaşça dönmeyi sürdürür */
    set(halo, 'opacity', (gather * .3).toFixed(3));
    set(halo, 'transform', tr(0, Math.sin(t * .9) * 2.2));

    const tap = NEWS.map(n => 1 - clamp(Math.abs(t - n.tap) / .3));
    const order = TOPICS.map((tp, i) => {
      const a = (tp.lon + rot) * Math.PI / 180, la = tp.lat * Math.PI / 180;
      const X = Math.sin(a) * Math.cos(la), Y = Math.sin(la), Z = Math.cos(a) * Math.cos(la);
      return { i, tp, sx: SX + X * RSX, sy: SY + Y * RSY + Math.sin(t * 1.3 + i) * 2.4, Z, d: (Z + 1) / 2 };
    }).sort((u, v) => u.Z - v.Z);

    let tapPos = null;
    order.forEach(o => {
      const pill = pills[o.tp.key];
      const ci = typeof o.tp.key === 'number' ? cards[o.tp.key] : null;
      const ex = ci ? null : extras.find(e => e.key === o.tp.key);
      const bump = NEWS.reduce((m, n, k) => (n.ti === o.i ? Math.max(m, tap[k]) : m), 0);
      if (bump > .02) tapPos = [o.sx, o.sy];
      const dep = lerp(.66, 1.1, o.d);
      let x = o.sx, y = o.sy, sc = dep, op = lerp(.32, 1, o.d);
      if (ci) {
        x = lerp(ci.px, o.sx, gather);
        y = lerp(ci.py, o.sy, gather) - Math.sin(gather * Math.PI) * 20;
        sc = lerp(1, dep, gather);
        op = ci.born * lerp(1, lerp(.32, 1, o.d), gather);
      } else {
        const u = clamp(eBack(seg(t, ex.a, ex.a + .5)));
        sc = u * dep;
        op = clamp(seg(t, ex.a, ex.a + .2)) * lerp(.32, 1, o.d);
      }
      /* hapın kaydı sol kenarından: küre ortalı dursun diye yarısı kadar sola */
      const half = (pill.w || 0) / 2 * (sc * (1 + bump * .18));
      set(pill, 'transform', tr(x - (ci ? lerp(0, half, gather) : half), y, sc * (1 + bump * .18)));
      set(pill, 'opacity', op.toFixed(3));
      sphere.appendChild(pill);                     /* arkadan öne sırala */
    });

    /* dokunuş halkası */
    const tapMax = Math.max(...tap);
    if (tapPos && tapMax > .02) {
      const k = tap.indexOf(tapMax);
      const rp = seg(t, NEWS[k].tap, NEWS[k].tap + .55);
      set(tapRing, 'cx', tapPos[0].toFixed(1)); set(tapRing, 'cy', tapPos[1].toFixed(1));
      set(tapRing, 'r', (18 + rp * 26).toFixed(1));
      set(tapRing, 'opacity', (rp > 0 && rp < 1 ? (1 - rp) * .6 : 0).toFixed(3));
    } else set(tapRing, 'opacity', 0);
    sphere.appendChild(tapRing);

    /* haber kartı: dokunuştan hemen sonra açılır, sıradaki dokunuşta çekilir */
    let anyNews = 0;
    news.forEach((n, k) => {
      const inA = n.tap + .12, out = k < news.length - 1 ? news[k + 1].tap - .25 : 99;
      const u = eOut4(seg(t, inA, inA + .55));
      const o = clamp(seg(t, inA, inA + .3)) * (1 - seg(t, out, out + .4));
      set(n.e, 'transform', tr(UL, NY + (1 - u) * 34 + (1 - o) * 10, 1));
      set(n.e, 'opacity', o.toFixed(3));
      anyNews = Math.max(anyNews, o);
    });
    sparkNews.update(t, anyNews);
    sparkSph.update(t, gather);
  } };
}

/* ═══════════ 04 · Binlerce kişiye ulaş ═══════════ */
/* Tanıtım gönderisi (s.31) yayına girer; erişim dalgaları yayılır, farklı
   ülkelerden kişiler izleyici sırasına eklenir, sayaç büyür ve bildirimler
   (s.103) gelir: yayına alındı, görüntülenme, tıklama, ülkeler. */
function scene4() {
  const g = G([]);
  const view = G([], { mask: 'url(#obView4)' });
  g.appendChild(S('defs', null, [
    ...viewMask('obView4', 58, 584, 30),
    S('clipPath', { id: 'obPromoImg' }, S('rect', { x: PAD, y: 110, width: UW - PAD * 2, height: 128, rx: 14 })),
    S('linearGradient', { id: 'obPromoShade', x1: 0, y1: 0, x2: 0, y2: 1 }, [
      S('stop', { offset: .45, 'stop-color': '#000', 'stop-opacity': 0 }),
      S('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': .5 })
    ])
  ]));
  g.appendChild(view);
  const TOP = 92, CH = 254;

  /* erişim dalgaları, kartın arkasında */
  const waves = [0, 1, 2].map(() => {
    const e = S('ellipse', { class: 'ring', cx: CX, cy: TOP + CH / 2, rx: 180, ry: 130, 'stroke-width': 1.4, opacity: 0 });
    view.appendChild(e);
    return e;
  });

  /* --- tanıtım kartı --- */
  const img = S('image', { href: `${AST}places/almanya.jpg`, x: PAD, y: 110, width: UW - PAD * 2, height: 128, preserveAspectRatio: 'xMidYMid slice' });
  const live = G([
    S('circle', { class: 'ui-ok-fill', cx: 0, cy: 0, r: 3.6 }),
    S('circle', { class: 'ui-ok-fill', cx: 0, cy: 0, r: 3.6, opacity: .35 })
  ], { opacity: 0 });
  const card = G([
    S('rect', { class: 'ui-card', x: 0, y: 0, width: UW, height: CH, rx: 24, filter: 'url(#obCardSh)' }),
    S('circle', { class: 'ui-logo', cx: PAD + 15, cy: PAD + 15, r: 15 }),
    txt('BV', { x: PAD + 15, y: PAD + 19.5, 'font-size': 12, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }),
    txt('Berlin Vize Danışmanlık', { class: 'ui-name', x: PAD + 40, y: PAD + 20, 'font-size': 15 }),
    S('rect', { class: 'ui-tag', x: UW - PAD - 66, y: PAD + 3, width: 66, height: 24, rx: 12 }),
    txt('Tanıtım', { class: 'ui-mute', x: UW - PAD - 33 + 5, y: PAD + 19.3, 'font-size': 12, 'text-anchor': 'middle' }),
    G([live], { transform: tr(UW - PAD - 54, PAD + 15) }),
    txt('Mavi Kart ve oturum başvurularında uçtan', { class: 'ui-body', x: PAD, y: 72, 'font-size': 14.5 }),
    txt('uca danışmanlık. İlk görüşme ücretsiz.', { class: 'ui-body', x: PAD, y: 92, 'font-size': 14.5 }),
    G([img, S('rect', { x: PAD, y: 110, width: UW - PAD * 2, height: 128, fill: 'url(#obPromoShade)' })], { 'clip-path': 'url(#obPromoImg)' }),
    txt('Ziyaret et', { x: UW - PAD - 30, y: 226, 'font-size': 13, 'font-weight': 600, fill: '#fff', 'text-anchor': 'end' }),
    S('path', { d: 'M-3.5 3.5 L3.5 -3.5 M-1.8 -3.5 H3.5 V1.8', stroke: '#fff', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: tr(UW - PAD - 19, 221.5) })
  ]);
  view.appendChild(card);

  /* --- paylaşılma anı: tanıtım Avrupa'ya dağılır (01'deki his) ---
     Kart küçülüp tepeye çekilir, altında şehirler tek tek uyanır: pin, halka,
     Berlin'den uzanan kavis ve o şehirdeki kişi. Sonra kişiler izleyici sırasına
     akar, kart büyür ve istatistikler gelir. */
  /* Avrupa haritası: 01'in kullandığı kara verisinin Mercator izdüşümü. Pinler
     de aynı izdüşümden geçiyor, yani kişiler gerçekten kendi ülkelerinde. */
  const MY = 366;
  const m4 = d3.geoMercator().center([12, 50]).scale(520).translate([CX, MY]);
  const CITY = { almanya: [13.4, 52.52], hollanda: [4.89, 52.37], fransa: [2.35, 48.86],
    avusturya: [16.37, 48.21], belcika: [4.35, 50.85], isvec: [18.07, 59.33], italya: [12.5, 41.9] };
  const MAP = {};
  Object.entries(CITY).forEach(([k, ll]) => { const q = m4(ll); MAP[k] = [q[0], q[1]]; });
  const ORG = MAP.almanya;
  const mapG = G([], { opacity: 0 });
  view.appendChild(mapG);
  const land4 = S('path', { class: 'globe-land' });
  const path4 = d3.geoPath(m4);
  g.querySelector('defs').appendChild(
    S('clipPath', { id: 'obMap4' }, S('rect', { x: 14, y: 202, width: 365, height: 322, rx: 26 })));
  mapG.appendChild(G([land4], { 'clip-path': 'url(#obMap4)' }));
  let land4Set = false;
  const pins = {};
  Object.entries(MAP).forEach(([f, [x, y]]) => {
    let arc = null;
    if (f !== 'almanya') {
      const mx = (ORG[0] + x) / 2, my = (ORG[1] + y) / 2;
      const nx = -(y - ORG[1]), ny = x - ORG[0], nl = Math.hypot(nx, ny) || 1;
      arc = S('path', {
        class: 'ln', fill: 'none', 'stroke-width': 1.3, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, opacity: 0,
        d: `M${ORG[0]} ${ORG[1]} Q${(mx + nx / nl * 24).toFixed(1)} ${(my + ny / nl * 24).toFixed(1)} ${x} ${y}`
      });
      mapG.appendChild(arc);
    }
    const ring = S('circle', { class: 'ring', cx: x, cy: y, r: 7, 'stroke-width': 1.4, opacity: 0 });
    const dot = S('circle', { class: 'ui-dot', cx: x, cy: y, r: 3.2, opacity: 0 });
    mapG.appendChild(ring); mapG.appendChild(dot);
    pins[f] = { arc, ring, dot };
  });
  const sparkMap = sparkles([[CX - 66, MY - 112, 1, 0], [CX + 74, MY - 66, .85, .3], [CX - 24, MY + 44, .8, .6],
    [CX + 34, MY + 88, .9, .85], [CX - 112, MY - 6, .75, .45], [CX + 104, MY - 104, .8, .15],
    [CX - 148, MY + 70, .7, .72], [CX + 150, MY + 24, .7, .38], [CX + 2, MY + 132, .65, .05]]);
  mapG.appendChild(sparkMap.g);

  /* --- izleyici sırası: farklı ülkelerden kişiler --- */
  const AUD = [['kisi-1.jpg', 'almanya'], ['erkek-1.jpg', 'hollanda'], ['kisi-2.jpg', 'fransa'], ['kisi-4.jpg', 'avusturya'],
    ['kisi-3.jpg', 'belcika'], ['kisi-5.jpg', 'isvec'], ['kadin-1.jpg', 'italya']];
  const AY = TOP + CH + 30;
  const aud = AUD.map((p, i) => {
    const e = G([face(p[0], 14), G([flagDot(p[1], 5.2)], { transform: tr(10, 10) })], { opacity: 0 });
    view.appendChild(e);
    return { e, x: UL + 14 + i * 21, flag: p[1], a: 1.5 + i * .2 };
  });
  const TX = UL + 14 + 6 * 21 + 28;
  const reach = txt('0 kişi gördü', { class: 'ui-name', x: TX, y: AY - 1, 'font-size': 14.5, opacity: 0 });
  const reachSub = txt('7 ülkeden • şimdi', { class: 'ui-mute', x: TX, y: AY + 15, 'font-size': 12, opacity: 0 });
  view.appendChild(reach);
  view.appendChild(reachSub);
  /* parıltı: görüntülenme sayacının çevresinde, tanıtım görüldükçe kıpırdar */
  const spark = sparkles([[TX - 20, AY - 14, 1, 0], [TX + 96, AY - 8, .8, .37], [TX + 52, AY + 22, .75, .72],
    [UL + 20, AY - 22, .7, .55], [UL + 96, AY - 24, .65, .9]]);
  view.appendChild(spark.g);

  /* --- bildirimler --- */
  const NT = AY + 32, NH = 56, NG = 6;
  const MEGA = 'M-6.5 -2.6 H-3 L4.5 -7 V7 L-3 2.6 H-6.5 Z M-4.4 2.6 L-3 7.2';
  /* göz: görüntülenme, ok: karttaki “Ziyaret et” bağlantısı */
  const EYE = 'M-7.5 0 C-4.5 -4.6 4.5 -4.6 7.5 0 C4.5 4.6 -4.5 4.6 -7.5 0 Z M0 -2.1 A2.1 2.1 0 1 1 0 2.1 A2.1 2.1 0 1 1 0 -2.1';
  const LINK = 'M-5 5 L5 -5 M-2.6 -5 H5 V2.6';
  /* Bildirimler yalnızca üründe gerçekten olan şeyler: yayına alınma,
     görüntülenme, karttaki “Ziyaret et” tıklaması, hangi ülkelerden görüldüğü.
     Profil görüntüleme, öne çıkma ve tanıtımdan mesajlaşma yok: öyle bir
     özellik bulunmuyor. */
  const NOTES4 = [
    { icon: 'mega', title: 'Tanıtımın yayına alındı', sub: '/almanya ve /avrupa sayfalarında', when: 'şimdi', a: 5.7 },
    { icon: 'eye', title: 'Tanıtımın 5.000 kez görüntülendi', sub: 'Son bir saatte', when: '1 dk', a: 6.7 },
    { icon: 'link', title: '“Ziyaret et” 320 kez tıklandı', sub: 'Tanıtım kartından siteye', when: '2 dk', a: 7.7 },
    { icon: 'avrupa', title: 'Tanıtımın 7 ülkeden görüntülendi', sub: 'Almanya, Hollanda, Fransa…', when: '5 dk', a: 8.7 }
  ];
  const notes = NOTES4.map(n => {
    let ic;
    if (n.icon === 'mega') ic = G([S('circle', { class: 'ui-tint', cx: 0, cy: 0, r: 18 }), S('path', { class: 'ui-ico-b', d: MEGA })]);
    else if (n.icon === 'eye') ic = G([S('circle', { class: 'ui-tint', cx: 0, cy: 0, r: 18 }), S('path', { class: 'ui-ico-b', d: EYE })]);
    else if (n.icon === 'link') ic = G([S('circle', { class: 'ui-tint', cx: 0, cy: 0, r: 18 }), S('path', { class: 'ui-ico-b', d: LINK })]);
    else ic = flagDot('avrupa', 18);
    const e = G([
      S('rect', { class: 'ui-card', x: 0, y: 0, width: UW, height: NH, rx: 16, filter: 'url(#obRowSh)' }),
      G([ic], { transform: tr(14 + 18, NH / 2) }),
      txt(n.title, { class: 'ui-name', x: 62, y: 24, 'font-size': 13.5, 'font-weight': 600 }),
      txt(n.sub, { class: 'ui-mute', x: 62, y: 42, 'font-size': 12.5 }),
      txt(n.when, { class: 'ui-mute', x: UW - 14, y: 24, 'font-size': 11.5, 'text-anchor': 'end' }),
      S('circle', { class: 'ui-dot', cx: UW - 18, cy: 39, r: 3.5 })
    ], { opacity: 0 });
    view.appendChild(e);
    return Object.assign({ e }, n);
  });

  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    const cu = eOut4(seg(t, 0, .9));
    /* paylaşılma anı: kart .62'ye küçülüp tepeye çekilir, 6,5'te geri büyür */
    if (!land4Set && LAND) { set(land4, 'd', path4(LAND)); land4Set = true; }
    const eur = eInOut(seg(t, 1.1, 1.75)) * (1 - eInOut(seg(t, 4.5, 5.2)));
    const sc4 = lerp(.95, 1, cu) * lerp(1, .62, eur);
    set(card, 'transform', tr(UL + UW * (1 - sc4) / 2, lerp(TOP + (1 - cu) * 28, 64, eur), sc4));
    set(card, 'opacity', clamp(seg(t, 0, .35)).toFixed(3));
    set(mapG, 'opacity', eur.toFixed(3));
    sparkMap.update(t, seg(t, 1.8, 2.3));
    /* görsel yavaşça yakınlaşmadan oturur */
    const k = lerp(1.1, 1, eOut(seg(t, 0, 3)));
    set(img, 'transform', `translate(${CX - UL} 174) scale(${k.toFixed(4)}) translate(${UL - CX} -174)`);

    /* yayında: yeşil nokta nabız atar */
    set(live, 'opacity', clamp(seg(t, 1.1, 1.35)).toFixed(3));
    const lp = ((t - 1.1) % 1.4) / 1.4;
    set(live.lastChild, 'r', (3.6 + (t > 1.1 ? lp * 5 : 0)).toFixed(2));
    set(live.lastChild, 'opacity', (t > 1.1 ? (1 - lp) * .45 : 0).toFixed(3));

    /* dalgalar 2,2 sn'lik döngüyle yayılmayı sürdürür: erişim akmaya devam ediyor */
    const WP = 2.2, wEnd = 1;   /* dalgalar sonda da sürüyor */
    waves.forEach((w, i) => {
      set(w, 'cx', lerp(CX, ORG[0], eur).toFixed(1));
      set(w, 'cy', lerp(TOP + CH / 2, ORG[1], eur).toFixed(1));
      const a = 1.2 + i * .55;
      const u = t < a ? 0 : ((t - a) % WP) / 1.9;
      if (u <= 0 || u >= 1) { set(w, 'opacity', 0); return; }
      const e = eOut(u);
      set(w, 'rx', (150 + e * 150).toFixed(1));
      set(w, 'ry', (110 + e * 170).toFixed(1));
      set(w, 'opacity', ((1 - u) * .35 * wEnd).toFixed(3));
    });
    spark.update(t, seg(t, 5.5, 6.0));

    aud.forEach((p, i) => {
      const u = clamp(eBack(seg(t, p.a, p.a + .45)));
      const fly = eInOut(seg(t, 4.55 + i * .04, 5.2 + i * .04));
      const [mx, my] = MAP[p.flag];
      const pin = pins[p.flag];
      /* şehir uyanır: kavis uzanır, halka açılır, kişi çıkar */
      const au = seg(t, p.a - .3, p.a + .1);
      if (pin.arc) {
        set(pin.arc, 'stroke-dashoffset', (1 - eInOut(au)).toFixed(4));
        set(pin.arc, 'opacity', (au > 0 ? .55 * (1 - fly) : 0).toFixed(3));
      }
      const rp = seg(t, p.a, p.a + .7);
      set(pin.ring, 'r', (7 + rp * 20).toFixed(1));
      set(pin.ring, 'opacity', (rp > 0 && rp < 1 ? (1 - rp) * .55 : 0).toFixed(3));
      set(pin.dot, 'opacity', (clamp(seg(t, p.a - .25, p.a)) * (1 - fly)).toFixed(3));
      set(p.e, 'transform', tr(lerp(mx, p.x, fly), lerp(my, AY, fly) + (1 - u) * 8, u * lerp(1.34, 1, fly)));
      set(p.e, 'opacity', clamp(seg(t, p.a, p.a + .18)).toFixed(3));
    });
    const n = Math.round(eOut(seg(t, 5.2, 9.7)) * 1248) * 10 + Math.floor(Math.max(0, t - 9.7) * 5) * 10;
    reach.textContent = n.toLocaleString('tr-TR') + ' kişi gördü';
    set(reach, 'opacity', clamp(seg(t, 5.25, 5.55)).toFixed(3));
    set(reachSub, 'opacity', clamp(seg(t, 5.4, 5.7)).toFixed(3));

    /* yeni bildirim en üste girer, eskileri aşağı iter */
    notes.forEach((m, i) => {
      let push = 0;
      for (let j = i + 1; j < notes.length; j++) push += eInOut(seg(t, notes[j].a, notes[j].a + .5));
      const u = eOut4(seg(t, m.a, m.a + .55));
      const y = NT + push * (NH + NG) - (1 - u) * 18;
      set(m.e, 'transform', tr(UL, y, lerp(.96, 1, u)));
      set(m.e, 'opacity', (clamp(seg(t, m.a, m.a + .25)) * (1 - seg(y, NT + 2 * (NH + NG) - 30, NT + 2 * (NH + NG) + 10))).toFixed(3));
    });
  } };
}

/* ═══════════ içerik ═══════════ */
const COPY = [
  {
    head: 'Avrupa’nın her yerinde<br>bir tanıdığın var',
    sub: 'Avrupa’da yaşayanlar ve gitmeyi planlayanlar<br>için tek topluluk.',
    cta: 'Devam et',
    rows: [['Küre kadraja yükselir', 0, 1.2], ['Uçak kürenin çevresinde', .5, 3.1], ['Küre döner, Avrupa’da durur', 0, 4.2], ['Dalış ve Avrupa yakın planı', 3.1, 4.3], ['Uçak rotada', 4.3, 7.85], ['Kişiler ve rozetler', 4.35, 8.4], ['Topluluk ağı', 4.8, 8.7], ['Uçak kıvrılıp hızla uzaklaşır', 7.85, 9.4]]
  },
  {
    head: 'Sor, paylaş,<br>tavsiye al',
    sub: 'Vize, oturum, eğitim, ev, iş, seyahat, sağlık…<br>Deneyimini paylaş, tavsiye ver, tavsiye iste.',
    cta: 'Devam et',
    rows: [['Gönderiler akışa girer', .12, 1.5], ['Soru seçilir (mavi çerçeve)', 1.85, 2.35], ['Soru büyüyüp öne çıkar', 2.35, 3.0], ['Şehirlerden cevaplar', 3.3, 5.4], ['En iyi cevap seçilir', 5.6, 6.0], ['Cevap karta çıkar', 6.05, 7.15], ['En iyi cevap rozeti', 7.2, 7.72], ['Soru çözüldü', 7.9, 8.45], ['Sohbet sürüyor', 8.35, 10.0]]
  },
  {
    head: 'Gündemi takip et,<br>hiçbir şeyi kaçırma',
    sub: 'Eğitim, vize, seyahat, haber…<br>Sayfaları takip et, akışını kendine göre kur.',
    cta: 'Devam et',
    rows: [['Sayfa kartları', .06, 1.0], ['Konumdan otomatik seçim', .06, 1.0], ['Kullanıcı seçer', .85, 1.9], ['Konular küreye dizilir', 2.0, 2.85], ['Küre döner, konu öne gelir', 2.85, 3.5], ['Dokunuş ve haber', 3.62, 5.6], ['İkinci konu', 5.05, 7.8], ['Üçüncü konu', 7.25, 10.0]]
  },
  {
    head: 'İşletmeni binlerce kişiye<br>kolayca ulaştır',
    sub: 'Hizmetini Avrupa’daki ve Türkiye’deki<br>müşterilerine tek yerden duyur.',
    cta: 'Hemen başla',
    rows: [['Tanıtım kartı', 0, .9], ['Yayında', 1.0, 1.25], ['Kart küçülür, Avrupa haritası', 1.1, 1.75], ['Şehirler uyanır', 1.5, 3.2], ['Kişiler izleyici sırasına akar', 4.55, 5.25], ['Erişim dalgaları', 1.0, 10.0], ['Erişim sayacı', 5.2, 9.7], ['Bildirimler', 5.7, 9.3]]
  }
];
const NOTES = {
  full: 'Dört ekran sırayla, birer kez oynar. Her ekran son karesinde 1,5 sn bekler, sonra sıradakine geçer; “Devam et” beklemeden geçirir. Son ekranda kalır, döngü yok.',
  1: 'Şehirler uyandıkça topluluğun üstünde parıltı çakar, son saniyeye kadar sürer. Küre sağ alttan kadraja yükselir, uçak arkasından çıkıp çevresinde tur atar ve Avrupa’ya dalar; kamera onunla yakınlaşır. Tur bitince sol kenardan geniş bir bankaya girer, büyür ve hızlanarak sağ üst köşeden uzaklaşır. İkondaki uçak şehirlerin üzerinden geçtikçe noktalar büyür; içinden o şehirdeki kişi ve ülke rozeti çıkar.',
  2: 'Akış kayar ve sorunun olduğu gönderide durur. Farklı şehirlerden cevaplar yazılarak gelip kartın altına dizilir; biri en iyi cevap seçilip kartın içine çıkar, gönderi “Soru Çözüldü” olur. Rozetlerde parıltı çakar; sonrasında akış yukarı süzülür ve iki cevap daha gelir, sohbet donup kalmaz.',
  3: 'Konumdan seçilen iki sayfaya üç sayfa daha işaretlenir (beş kart, 2,5 sn); yedi konu hapına dönüşüp 3B bir konu küresine dizilir. Küre her konuyu öne getirip durur, o konuya basılır ve ilgili haber parıltıyla açılır. Duraklarda bile salınım sürer, ekran donmaz.',
  4: 'Tanıtım yayına girince kart küçülür ve altında Avrupa açılır: Berlin’den uzanan kavisler şehirleri tek tek uyandırır, her şehirden bir kişi çıkar (01’deki his). Sonra kişiler izleyici sırasına akar, kart büyür ve istatistikler gelir: sayaç, dalgalar ve tanıtımla ilgili bildirimler (yayın, görüntülenme, “Ziyaret et” tıklaması, ülkeler).'
};

/* ═══════════ kurulum ═══════════ */
const art = $('#art');
/* 02–04'ün ortak gölgeleri; kök SVG'de durur ki gizli sahnelerden etkilenmesin */
art.appendChild(S('defs', null, [
  S('filter', { id: 'obCardSh', x: '-25%', y: '-20%', width: '150%', height: '150%' },
    S('feDropShadow', { dx: 0, dy: 10, stdDeviation: 14, 'flood-color': '#0B1B3A', 'flood-opacity': .13 })),
  S('filter', { id: 'obPostSh', x: '-25%', y: '-20%', width: '150%', height: '150%' },
    S('feDropShadow', { dx: 0, dy: 6, stdDeviation: 10, 'flood-color': '#0B1B3A', 'flood-opacity': .08 })),
  S('filter', { id: 'obRowSh', x: '-10%', y: '-30%', width: '120%', height: '180%' },
    S('feDropShadow', { dx: 0, dy: 4, stdDeviation: 7, 'flood-color': '#0B1B3A', 'flood-opacity': .09 }))
]));
const builders = [scene1, scene2, scene3, scene4];
const scenes = builders.map(b => {
  const s = b();
  art.appendChild(s.g);
  return s;
});

let mode = 'full';
let dur = TOTAL;
let t = 0, playing = false, speed = 1, last = 0, shown = -1, holdUntil = 0;
/* Sahne bitince zaman çizelgesi son karede durur ama sahnenin yerel saati
   akmaya devam eder (idle): parıltı, salınım, dalga sürer, kare donmaz. */
let idle = 0;
const HOLD = 1.5;                  /* tam akışta ekranlar arası bekleme (sn) */
const progEls = [...$('#obProg').children].map(i => i.firstElementChild);

function scaleStage() {
  const w = $('#screen').clientWidth;
  $('#stage').style.transform = `scale(${w / 393})`;
}
addEventListener('resize', scaleStage);
if (window.ResizeObserver) new ResizeObserver(scaleStage).observe($('#screen'));
scaleStage();

/* ---------- zaman çizelgesi ---------- */
let rowEls = [];
function buildRows() {
  const box = $('#rows');
  box.textContent = '';
  rowEls = [];
  const list = mode === 'full'
    ? COPY.map((c, i) => [`0${i + 1} ${['Aidiyet', 'Tavsiye', 'Kişisel akış', 'Erişim'][i]}`, STARTS[i], STARTS[i] + DURS[i]])
    : COPY[+mode - 1].rows;

  list.forEach(r => {
    const row = document.createElement('div');
    row.className = 'tl-row';
    const lab = document.createElement('div');
    lab.className = 'tl-label';
    lab.innerHTML = `<b></b><small></small>`;
    lab.querySelector('b').textContent = r[0];
    lab.querySelector('small').textContent =
      `${r[1].toFixed(2).replace('.', ',')} → ${r[2].toFixed(2).replace('.', ',')}`;
    const track = document.createElement('div');
    track.className = 'track';
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.left = (r[1] / dur * 100) + '%';
    bar.style.width = Math.max(1.2, (r[2] - r[1]) / dur * 100) + '%';
    track.appendChild(bar);
    row.appendChild(lab); row.appendChild(track);
    box.appendChild(row);
    rowEls.push({ bar, a: r[1], b: r[2] });
  });

  const ticks = $('#ticks');
  ticks.textContent = '';
  const step = dur > 8 ? 2 : 1;
  for (let s = 0; s <= Math.floor(dur); s += step) {
    const sp = document.createElement('span');
    sp.style.left = (s / dur * 100) + '%';
    sp.textContent = s;
    ticks.appendChild(sp);
  }
  $('#scrub').max = Math.round(dur * 1000);
}

/* ---------- ekran metni ---------- */
function showScene(i) {
  if (i === shown) return;
  shown = i;
  const c = COPY[i];
  /* metinler sabit ve güvenli; satır sonları <br> ile, her biri tam iki satır */
  $('#obHead').innerHTML = c.head;
  $('#obSub').innerHTML = c.sub;
  $('#obCta').textContent = c.cta;
}

/* extra: tam akışta ekranlar arası beklemede sahnenin yerel saati akmaya devam
   eder. Zaman çizelgesi ve scrub `time`de kalır, ama parıltı/salınım donmaz:
   bekleme ölü kare değil, sahnenin sakin devamı olur. */
function render(time, extra) {
  let idx = +mode - 1;
  if (mode === 'full') { idx = 0; while (idx < 3 && time >= STARTS[idx + 1]) idx++; }
  const local = (mode === 'full' ? time - STARTS[idx] : time) + (extra || 0);
  showScene(idx);
  scenes.forEach((s, k) => {
    if (k === idx) { s.g.style.display = ''; s.update(local); }
    else s.g.style.display = 'none';
  });

  /* hikâye çubuğu: bulunduğumuz dilim dolar, öncekiler tam, sonrakiler boş.
     Tam akışta dilim süre + bekleme boyunca dolduğu için tam dolunca geçilir. */
  const span = mode === 'full' && idx < 3 ? DURS[idx] + HOLD : DURS[idx];
  progEls.forEach((b, k) => { b.style.width = ((k < idx ? 1 : k > idx ? 0 : clamp(local / span)) * 100).toFixed(2) + '%'; });

  $('#time').innerHTML = time.toFixed(2).replace('.', ',') + '<small>saniye</small>';
  $('#scrub').value = Math.round(time * 1000);
  $('#playhead').style.left = (time / dur * 100) + '%';
  rowEls.forEach(r => r.bar.classList.toggle('on', time >= r.a && time <= r.b));
}

function setMode(m, autoplay) {
  mode = m;
  dur = m === 'full' ? TOTAL : DURS[+m - 1];
  holdUntil = 0;
  /* oynatılacaksa her zaman 0'dan; duruyorsa boş kare yerine oturmuş kare */
  t = autoplay ? 0 : poster(m);
  buildRows();
  $('#modeNote').textContent = NOTES[m];
  shown = -1;
  render(t);
}
const sceneAt = time => { let i = 0; while (i < 3 && time >= STARTS[i + 1]) i++; return i; };
const atEnd = () => {
  if (mode !== 'full') return t >= dur - 1e-3;
  const i = sceneAt(t);
  return t >= STARTS[i] + DURS[i] - 2e-3;
};

/* Telefondaki "Devam et" ve "Atla": gerçek uygulamadaki gibi ekranı ilerletir. */
function goTo(i) {
  holdUntil = 0;
  if (mode === 'full') { t = STARTS[i]; render(t); setPlaying(true); return; }
  $(`#m-${i + 1}`).checked = true;
  setMode(String(i + 1), true);
  t = 0; render(0); setPlaying(true);
}
$('#obCta').addEventListener('click', () => { const i = mode === 'full' ? sceneAt(t) : +mode - 1; if (i < 3) goTo(i + 1); });
$('.skip').addEventListener('click', () => goTo(3));

function setPlaying(v) {
  /* bitmiş bir ekranda Oynat: tam akışta sıradaki ekrana, son ekranda ve
     tekil ekranda baştan */
  if (v && !playing && atEnd()) {
    const i = sceneAt(t);
    t = mode === 'full' ? (i < 3 ? STARTS[i + 1] : 0) : 0;
    render(t);
  }
  if (!v) holdUntil = 0;
  playing = v;
  const b = $('#play');
  b.textContent = v ? 'Duraklat' : 'Oynat';
  b.setAttribute('aria-pressed', v);
  if (v) last = performance.now();
}

document.querySelectorAll('input[name=mode]').forEach(r =>
  r.addEventListener('change', () => { setMode(r.value, true); setPlaying(true); }));
document.querySelectorAll('input[name=speed]').forEach(r =>
  r.addEventListener('change', () => { speed = +r.value; }));
$('#play').addEventListener('click', () => setPlaying(!playing));
$('#replay').addEventListener('click', () => { t = 0; render(0); setPlaying(true); });
$('#scrub').addEventListener('input', e => { setPlaying(false); t = +e.target.value / 1000; render(t); });

addEventListener('keydown', e => {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (e.code === 'Space') { setPlaying(!playing); e.preventDefault(); }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const order = ['full', '1', '2', '3', '4'];
    const i = order.indexOf(mode);
    const n = order[(i + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length];
    $(`#m-${n === 'full' ? 'full' : n}`).checked = true;
    setMode(n, true); setPlaying(true);
    e.preventDefault();
  }
});

/* document.hidden kontrolü yok: gizli sekmede rAF zaten tetiklenmiyor,
   ama gömülü/önizleme ortamlarında sekme "gizli" sayılıp kare üretilebiliyor.
   O kontrol orada animasyonu tamamen durduruyordu. Sıçramayı dt sınırı önler. */
function tick(now) {
  if (playing) {
    /* rAF zaman damgası tıklama anından biraz önce olabilir; zaman geri gitmesin. */
    const dt = Math.max(0, Math.min((now - last) / 1000, .1));
    last = now;
    if (holdUntil) {
      /* tam akış: ekranın son karesinde kısa bekleme, sonra sıradaki ekran */
      if (now >= holdUntil) { holdUntil = 0; idle = 0; t = STARTS[sceneAt(t) + 1]; render(t); }
      else render(t, HOLD - (holdUntil - now) / 1000);
    } else {
      const i = sceneAt(t);
      t += dt * speed;
      if (mode === 'full') {
        const end = STARTS[i] + DURS[i] - 1e-3;
        if (t >= end) {
          t = end;
          if (i < 3) { holdUntil = now + HOLD * 1000 / speed; idle = 0; }
          else idle += dt * speed;           /* son ekran: durmaz, akmaya devam eder */
        } else idle = 0;
      } else if (t >= dur) { t = dur; idle += dt * speed; } else idle = 0;
      render(t, idle);
    }
  } else last = now;
  requestAnimationFrame(tick);
}

/* Panodan derin bağlantı: /onboarding/#s=3 doğrudan üçüncü ekranı açar. */
function modeFromHash() {
  const m = /(?:^|[#&])s=([1-4])/.exec(location.hash);
  return m ? m[1] : 'full';
}
function applyHash(autoplay) {
  const m = modeFromHash();
  $(`#m-${m}`).checked = true;
  setMode(m, autoplay);
}
addEventListener('hashchange', () => { applyHash(true); setPlaying(true); });

fetch('/tanitim/assets/land.geojson')
  .then(r => r.json())
  .then(d => { LAND = d; render(t); })
  .catch(() => {});

const autoplay = !matchMedia('(prefers-reduced-motion:reduce)').matches;
applyHash(autoplay);
setPlaying(autoplay);
requestAnimationFrame(tick);
