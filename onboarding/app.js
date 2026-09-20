/* Avrupa Cepte — Onboarding akışı
   Dört karşılama ekranı, 393×852. İlk ekran 12,2 sn, ikincisi 8 sn,
   kalanlar 3,6 sn. İlk ekran küre, rota ve portrelerle; ikincisi tasarım
   dosyasındaki gerçek gönderi kartıyla; kalanlar düğüm/kart/çizgiyle.
   Renkler CSS değişkenlerinden gelir, koyu tema da doğru çalışır. */
'use strict';

const NS = 'http://www.w3.org/2000/svg';
const SC = 3.6;                 /* henüz elden geçmemiş sahnelerin süresi */
const D2 = 8.0;                 /* 02 · gerçek gönderi kartı, anlatacak daha çok şey var */
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
const DURS = [12.2, D2, SC, SC];
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
  globeIn: [0, 1.9],       /* küre sağ alttan kadraja yükselir */
  orbit: [.8, 4.9],        /* uçak kürenin arkasından çıkar, 1,5 tur atar */
  dive: [4.9, 6.7],        /* uçak Avrupa'ya dalar, kamera onunla yakınlaşır */
  zoom: [4.9, 6.7],
  spin: [0, 6.5],          /* küre döner, Avrupa'da durur */
  tilt: [3.9, 6.5],
  dots: 5.9,               /* şehir noktaları */
  fly: [6.7, 11.0],        /* rota uçuşu, şehirlerde yavaşlar */
  end: 12.2
};
const D1 = T1.end;

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
  const GX = 196.5, GY = 282;       /* kürenin durduğu yer */
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
     şehirlere yakın geçsin. Rotadan sonra güneye, kadraj dışına süzülür. */
  const ctrl = [[A[0], A[1]]].concat(cities.map(c => [c.x, c.y])).concat([[70, 470], [10, 600]]);
  const routeD = bspline(roundCorners(ctrl, 60, 20), 0);
  set(trail, 'd', routeD);
  set(trailReveal, 'd', routeD);

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
    const out = 1 + .8 * smooth(clamp((s - lastS) / 160));
    return (1 - .38 * Math.min(1, dip)) * start * out;
  };
  const timeTab = [0];
  for (let i = 1; i < pts.length; i++) timeTab.push(timeTab[i - 1] + STEP / speed((i - .5) * STEP));
  const TT = timeTab[timeTab.length - 1];
  timeTab.forEach((v, i) => { timeTab[i] = v / TT; });
  const F0 = T1.fly[0], F1 = T1.fly[1];
  const sAt = t => invert(timeTab, seg(t, F0, F1)) * STEP;
  const passAt = cityS.map(cs => F0 + timeTab[Math.round(cs / STEP)] * (F1 - F0));
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
      const h0 = v0 * dur / (3 * (1 + EA));
      const Aq = proj(APPROACH);
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
      if (t < F1 && s < RL - STEP * 2) {
        const p = at(s);
        const head = deg(at(s - 4), at(s + 12));
        const turn = wrapDeg(deg(at(s + 16), at(s + 24)) - deg(at(s - 24), at(s - 16)));
        const vn = speed(s) * TT / RL;               /* ortalamaya göre hız */
        /* kadrajın alt kenarına, metne yaklaşınca söner */
        const fadeOut = 1 - seg(p.y, 430, 490);
        plane.update(p.x, p.y + sn(t, .9) * 1.2, head, turn * vn / 32, .92 * (1 + .07 * (vn - 1)), fadeOut, t);
      } else set(plane.g, 'opacity', 0);
    }

    /* ---- rota ve kişiler ---- */
    const sNow = t < F0 ? 0 : sAt(t);
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
  } };
}

/* ═══════════ 02 · Sor, paylaş, tavsiye al ═══════════ */
/* Tasarım dosyasındaki gerçek gönderi kartı: başlık satırı (portre, ad, mühürlü
   "Sordu" rozeti, şehir · süre), soru metni, /avrupa hapı, oy–cevap–paylaş
   satırı; içinde yeşil çerçeveli "En iyi cevap" kutusu ve "Soru Çözüldü"
   hapı. Ölçüler ve renkler Avrupa Cepte.pdf s.77'den alındı. */

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

function scene2() {
  const g = G([]);

  /* --- ölçüler (kart içi koordinat) --- */
  const W = 345, PAD = 16;          /* kart genişliği ve iç boşluk */
  const AV = 15;                    /* soruyu soranın portre yarıçapı */
  const ANS_T = 118, ANS_H = 108;   /* cevap kutusunun üst kenarı ve yüksekliği */
  const MID = 312;                  /* kart dikey merkezde durur, iki yana büyür */
  const CL = CX - W / 2;            /* kartın sol kenarı (sahne koordinatı) */

  const layout = u => {
    const content = ANS_T + (ANS_H + 14) * u;
    const pillCY = content + 13;
    const actCY = pillCY + 40;
    return { content, pillCY, actCY, h: actCY + 17 + PAD };
  };

  g.appendChild(S('defs', null, [
    S('filter', { id: 'obCardSh', x: '-25%', y: '-20%', width: '150%', height: '150%' },
      S('feDropShadow', { dx: 0, dy: 10, stdDeviation: 14, 'flood-color': '#0B1B3A', 'flood-opacity': .13 })),
    S('clipPath', { id: 'obAskFace' }, S('circle', { cx: 0, cy: 0, r: AV })),
    S('clipPath', { id: 'obAnsFace' }, S('circle', { cx: 0, cy: 0, r: 11 })),
    S('clipPath', { id: 'obEuClip' }, S('circle', { cx: 0, cy: 0, r: 9 }))
  ]));

  /* --- kart gövdesi --- */
  const card = G([]);
  g.appendChild(card);
  const plate = S('rect', { class: 'ui-card', x: 0, y: 0, width: W, height: 200, rx: 24, filter: 'url(#obCardSh)' });
  card.appendChild(plate);

  /* --- başlık satırı --- */
  const head = G([
    G([S('image', { href: AST + 'people/kadin-1.jpg', x: -AV, y: -AV, width: AV * 2, height: AV * 2, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#obAskFace)' }),
      S('circle', { class: 'ui-ring', cx: 0, cy: 0, r: AV })], { transform: tr(PAD + AV, PAD + AV) })
  ]);
  const name = txt('Elif Yılmaz', { class: 'ui-name', x: PAD + AV * 2 + 10, y: PAD + 13, 'font-size': 15 });
  head.appendChild(name);
  const asked = G([
    S('path', { class: 'ui-seal', d: sealPath(7.6) }),
    S('path', { class: 'ui-seal', d: CHECK, 'stroke-width': 1.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    txt('Sordu', { class: 'ui-mute', x: 11, y: 4.2, 'font-size': 12.5 })
  ], { opacity: 0 });
  head.appendChild(asked);
  head.appendChild(txt('Berlin • 2s', { class: 'ui-mute', x: PAD + AV * 2 + 10, y: PAD + 31, 'font-size': 12.5 }));
  head.appendChild(G([
    S('path', { class: 'ui-menu', d: 'M0 0 H18' }),
    S('path', { class: 'ui-menu', d: 'M0 5.5 H18' })
  ], { transform: tr(W - PAD - 18, PAD + 9) }));
  card.appendChild(head);

  /* --- soru metni --- */
  const qLines = ['Mavi Kart başvurusunda randevuyu', 'nasıl hızlandırdınız?'].map((s, i) =>
    txt(s, { class: 'ui-body', x: PAD, y: 80 + i * 21, 'font-size': 15 }));
  qLines.forEach(e => card.appendChild(e));

  /* --- en iyi cevap kutusu --- */
  const ansBox = S('rect', { class: 'ui-ans', x: PAD, y: ANS_T, width: W - PAD * 2, height: ANS_H, rx: 16 });
  const ansRect = S('rect', { x: PAD, y: ANS_T, width: W - PAD * 2, height: ANS_H, rx: 16 });
  g.querySelector('defs').appendChild(S('clipPath', { id: 'obAnsClip' }, ansRect));
  const ansIn = G([], { 'clip-path': 'url(#obAnsClip)' });
  const ans = G([ansBox, ansIn], { opacity: 0 });
  card.appendChild(ans);

  const ansHead = G([
    G([S('image', { href: AST + 'people/kisi-3.jpg', x: -11, y: -11, width: 22, height: 22, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#obAnsFace)' }),
      S('circle', { class: 'ui-ring', cx: 0, cy: 0, r: 11 })], { transform: tr(PAD + 14 + 11, ANS_T + 22) }),
    txt('Zeynep T.', { class: 'ui-name', x: PAD + 14 + 32, y: ANS_T + 26, 'font-size': 13.5 })
  ]);
  ansIn.appendChild(ansHead);
  const bestBadge = G([
    S('circle', { class: 'ui-ok-fill', cx: 0, cy: 0, r: 8.2 }),
    S('path', { d: CHECK, fill: 'none', stroke: '#fff', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
  ]);
  const bestText = txt('En iyi cevap', { class: 'ui-ok', x: 11, y: 4.3, 'font-size': 13, 'font-weight': 600 });
  const best = G([bestBadge, bestText], { transform: tr(W - PAD - 14 - 78, ANS_T + 22) });
  ansIn.appendChild(best);

  const aLines = [
    'Ben Berlin’de üç hafta bekledim. Randevu',
    'için sabah 07.00’de bakmak işe yarıyor;',
    'evrak listesini de mesajla atayım.'
  ].map((s, i) => txt(s, { class: 'ui-body', x: PAD + 14, y: ANS_T + 50 + i * 19, 'font-size': 13.5, opacity: 0 }));
  aLines.forEach(e => ansIn.appendChild(e));

  /* --- /avrupa hapı ve Soru Çözüldü --- */
  const euW = 86;
  const euPill = G([
    S('rect', { class: 'ui-pill', x: 0, y: -13, width: euW, height: 26, rx: 13 }),
    G([S('image', { href: AST + 'flags/avrupa.svg', x: -9, y: -9, width: 18, height: 18, 'clip-path': 'url(#obEuClip)' }),
      S('circle', { class: 'ui-ring-thin', cx: 0, cy: 0, r: 9 })], { transform: tr(22, 0) }),
    txt('/avrupa', { class: 'ui-name', x: 35, y: 4.3, 'font-size': 12.5 })
  ]);
  card.appendChild(euPill);

  const solvedW = 112;
  const solved = G([
    S('rect', { class: 'ui-ok-fill', x: -solvedW / 2, y: -15, width: solvedW, height: 30, rx: 15 }),
    txt('Soru Çözüldü', { class: 'ui-ok-ink', x: 0, y: 4.6, 'font-size': 13, 'text-anchor': 'middle' })
  ], { opacity: 0 });
  card.appendChild(solved);

  /* --- oy · cevap · paylaş satırı --- */
  const upCount = txt('4', { class: 'ui-up-t', x: 14, y: 4.6, 'font-size': 13.5, 'text-anchor': 'middle' });
  const up = G([
    S('rect', { class: 'ui-up', x: 0, y: -17, width: 58, height: 34, rx: 12 }),
    upCount,
    S('path', { class: 'ui-up-i', d: 'M0 -6.2 L6.2 0 L2.7 0 L2.7 5.6 L-2.7 5.6 L-2.7 0 L-6.2 0 Z', transform: tr(38, 0) })
  ]);
  card.appendChild(up);

  const coCount = txt('0', { class: 'ui-mute', x: 15, y: 4.6, 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 600 });
  const coIcon = S('path', {
    class: 'ui-ico',
    d: 'M-5.4 -5 H5.4 A3.4 3.4 0 0 1 8.8 -1.6 V1.6 A3.4 3.4 0 0 1 5.4 5 H-1.6 L-6.6 8 L-5.6 4.7 A3.4 3.4 0 0 1 -8.8 1.6 V-1.6 A3.4 3.4 0 0 1 -5.4 -5 Z',
    transform: tr(40, -1)
  });
  const comment = G([
    S('rect', { class: 'ui-ghost', x: 0, y: -17, width: 58, height: 34, rx: 12 }),
    coCount, coIcon
  ]);
  card.appendChild(comment);

  const share = G([
    S('rect', { class: 'ui-ghost', x: -19, y: -17, width: 38, height: 34, rx: 12 }),
    S('path', { class: 'ui-ico', d: 'M-5 -1.2 V5.2 A2.2 2.2 0 0 0 -2.8 7.4 H2.8 A2.2 2.2 0 0 0 5 5.2 V-1.2' }),
    S('path', { class: 'ui-ico', d: 'M0 3 V-7.4 M-3.1 -4.4 L0 -7.6 L3.1 -4.4' })
  ]);
  card.appendChild(share);

  /* --- cevaplayanlar: karta doğru süzülen portreler --- */
  const FLY = [
    { img: 'people/kisi-3.jpg', from: [-34, 268], a: 1.15 },
    { img: 'people/kisi-2.jpg', from: [428, 224], a: 1.65 },
    { img: 'people/erkek-1.jpg', from: [432, 352], a: 2.15 }
  ].map((f, i) => {
    const e = bubble(`fly${i}`, 15, f.img);
    set(e, 'opacity', 0);
    g.appendChild(e);
    return Object.assign({ e }, f);
  });

  let laid = false;
  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    /* ad metninin genişliği ancak DOM'a girince ölçülebilir; rozet bir kez
       yerleşir, sonra sabit kalır. */
    if (!laid) {
      /* gizliyken ölçü 0 döner; o durumda rozet yerleşmemiş sayılır ve
         görünür olduğu ilk karede yeniden denenir. */
      const w = name.getComputedTextLength();
      set(asked, 'transform', tr(PAD + AV * 2 + 10 + (w || 84) + 15, PAD + 8.5));
      set(asked, 'opacity', w ? 1 : 0);
      laid = w > 0;
    }

    /* kart girişi */
    const inU = eOut4(seg(t, 0, .9));
    const open = eInOut(seg(t, 2.9, 4.3));
    const L = layout(open);
    set(plate, 'height', L.h.toFixed(1));
    set(card, 'transform', tr(CL, MID - L.h / 2 + (1 - inU) * 22 + sn(t, 5.2) * 2, lerp(.94, 1, inU)));
    set(card, 'opacity', clamp(seg(t, 0, .34)).toFixed(3));

    /* cevap kutusu yukarıdan aşağı açılır, içindekiler sırayla belirir */
    set(ansRect, 'height', Math.max(.01, ANS_H * open).toFixed(2));
    set(ansBox, 'height', Math.max(.01, ANS_H * open).toFixed(2));
    set(ans, 'opacity', (open > 0 ? 1 : 0).toFixed(3));
    set(ansHead, 'opacity', clamp(seg(t, 3.15, 3.5)).toFixed(3));
    aLines.forEach((e, i) => set(e, 'opacity', clamp(seg(t, 3.45 + i * .16, 3.8 + i * .16)).toFixed(3)));
    const bu = eBack(seg(t, 4.35, 4.95));
    set(best, 'transform', tr(W - PAD - 14 - 78, ANS_T + 22, clamp(bu)));
    set(best, 'opacity', clamp(seg(t, 4.35, 4.6)).toFixed(3));

    /* alt satırlar açılan kutuyla birlikte iner */
    set(euPill, 'transform', tr(PAD, L.pillCY));
    set(up, 'transform', tr(PAD, L.actCY));
    set(share, 'transform', tr(W - PAD - 19, L.actCY));

    const su = eBack(seg(t, 5.15, 5.8));
    set(solved, 'transform', tr(W - PAD - solvedW / 2, L.pillCY, clamp(su)));
    set(solved, 'opacity', clamp(seg(t, 5.15, 5.4)).toFixed(3));

    /* cevaplar geldikçe sayaçlar döner */
    let arrived = 0;
    FLY.forEach(f => {
      const u = eInOut(seg(t, f.a, f.a + .55));
      const tx = CL + PAD + 66 + 40, ty = MID - L.h / 2 + L.actCY;
      const px = lerp(f.from[0], tx, u), py = lerp(f.from[1], ty, u) - Math.sin(u * Math.PI) * 26;
      set(f.e, 'transform', tr(px, py, lerp(1, .18, u * u)));
      set(f.e, 'opacity', (u >= 1 ? 0 : clamp(seg(t, f.a, f.a + .18)) * (1 - u * u * .2)).toFixed(3));
      if (u >= 1) arrived++;
    });
    coCount.textContent = arrived;
    upCount.textContent = 4 + Math.round(7 * clamp(seg(t, 1.2, 2.75)));
    const bump = FLY.reduce((m, f) => Math.max(m, 1 - clamp(Math.abs(t - (f.a + .55)) / .22)), 0);
    set(comment, 'transform', tr(PAD + 66, L.actCY, 1 + bump * .09));
  } };
}

/* ═══════════ 03 · Gündemi takip et ═══════════ */
function scene3() {
  const g = G([]);
  const colY = [206, 268, 330];
  const picked = [0, 2, 4];
  const tagNames = ['Eğitim', 'Vize', 'Seyahat'];

  const scatter = [[98, 152], [288, 140], [76, 250], [312, 246], [118, 384], [278, 394]];
  const cards = scatter.map((p, i) => {
    const e = skelCard(116, 34, [[14, 11, 44], [14, 21, 66]], 11);
    g.appendChild(e);
    const pi = picked.indexOf(i);
    return { e, x: p[0], y: p[1], pi };
  });

  /* seçilenlerin büyüyen hâli, ayrı katman */
  const big = picked.map((i, k) => {
    const w = 244, h = 50;
    const e = G([
      S('rect', { class: 'card', x: -w / 2, y: -h / 2, width: w, height: h, rx: 15 }),
      S('circle', { class: 'nd', cx: -w / 2 + 22, cy: 0, r: 7 }),
      S('rect', { class: 'sk', x: -w / 2 + 40, y: -9, width: 104, height: 5, rx: 2.5 }),
      S('rect', { class: 'sk-on', x: -w / 2 + 40, y: 3, width: 62, height: 5, rx: 2.5 })
    ]);
    g.appendChild(e);
    return { e, y: colY[k], from: scatter[i] };
  });

  const guide = S('path', { class: 'ln-faint', d: `M${CX - 130} 182 V354`, pathLength: 1 });
  g.insertBefore(guide, g.firstChild);

  const tags = tagNames.map((n, k) => {
    const e = pill(n, 't-brand');
    g.appendChild(e);
    return { e, y: colY[k] };
  });

  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    cards.forEach((c, i) => {
      const born = eOut(seg(t, i * .06, .5 + i * .06));
      const fade = c.pi >= 0
        ? 1 - seg(t, .7 + c.pi * .12, 1.15 + c.pi * .12)
        : lerp(1, .18, eOut(seg(t, .95 + i * .05, 1.95 + i * .05)));
      const shrink = c.pi >= 0 ? 1 : lerp(1, .84, eOut(seg(t, .95, 1.95)));
      set(c.e, 'transform', tr(c.x, c.y + sn(t, SC, i * .17) * 4, born * shrink));
      set(c.e, 'opacity', (born * fade).toFixed(3));
    });

    big.forEach((b, k) => {
      const a = .74 + k * .12;
      const u = eOut4(seg(t, a, a + .95));
      set(b.e, 'transform', tr(lerp(b.from[0], CX, u), lerp(b.from[1], b.y, u), lerp(.48, 1, u)));
      set(b.e, 'opacity', clamp(seg(t, a, a + .3)).toFixed(3));
    });

    const gu = eOut(seg(t, 1.5, 2.3));
    set(guide, 'stroke-dasharray', 1);
    set(guide, 'stroke-dashoffset', (1 - gu).toFixed(4));
    set(guide, 'opacity', (gu * .5).toFixed(3));

    tags.forEach((tg, k) => {
      const a = 2.15 + k * .14;
      const u = eBack(seg(t, a, a + .6));
      set(tg.e, 'transform', tr(CX + 74, tg.y, clamp(u)));
      set(tg.e, 'opacity', clamp(seg(t, a, a + .25)).toFixed(3));
    });
  } };
}

/* ═══════════ 04 · Binlerce kişiye ulaş ═══════════ */
function scene4() {
  const g = G([]);
  const cardY = 196;

  const waves = [0, 1, 2].map(() => {
    const e = S('ellipse', { class: 'ring', cx: CX, cy: cardY, rx: 20, ry: 14, 'stroke-width': 1.6, opacity: 0 });
    g.appendChild(e);
    return e;
  });

  /* topluluk ızgarası: petek düzeni, kart merkezinden uzaklığa göre sırayla yanar */
  const dots = [];
  const rowsN = [5, 4, 5];
  for (let r = 0; r < 3; r++) for (let c = 0; c < rowsN[r]; c++) {
    const x = (rowsN[r] === 5 ? 84 : 112) + c * 56, y = 300 + r * 50;
    const e = G([
      S('circle', { class: 'card-soft', cx: 0, cy: 0, r: 15 }),
      S('circle', { class: 'nd', cx: 0, cy: 0, r: 6 })
    ]);
    g.appendChild(e);
    dots.push({ e, x, y, d: Math.hypot(x - CX, y - cardY), ph: (r * 5 + c) * .07 % 1 });
  }
  const maxD = Math.max.apply(null, dots.map(d => d.d));

  const card = G([
    S('rect', { class: 'card', x: -122, y: -40, width: 244, height: 80, rx: 20 }),
    S('rect', { class: 'card-soft', x: -104, y: -22, width: 44, height: 44, rx: 14 }),
    S('circle', { class: 'nd', cx: -82, cy: 0, r: 8 }),
    S('rect', { class: 'sk', x: -48, y: -14, width: 104, height: 6, rx: 3 }),
    S('rect', { class: 'sk-on', x: -48, y: 2, width: 66, height: 6, rx: 3 }),
    G([
      S('circle', { class: 'nd', cx: 0, cy: 0, r: 10 }),
      S('path', { d: 'M-4.4 0 l3.2 3.2 l6 -6.6', stroke: '#fff', 'stroke-width': 2.1, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
    ], { transform: 'translate(94 -20)' })
  ]);
  g.appendChild(card);

  const count = pill('0 kişi', 't-brand');
  const countTxt = count.querySelector('text');
  g.appendChild(count);

  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    const cu = eBack(seg(t, 0, .66));
    const cy = cardY + sn(t, SC) * 3;
    set(card, 'transform', tr(CX, cy, clamp(cu)));
    set(card, 'opacity', clamp(seg(t, 0, .3)).toFixed(3));

    waves.forEach((w, k) => {
      const a = .62 + k * .44;
      const u = seg(t, a, a + 1.5);
      if (u <= 0 || u >= 1) { set(w, 'opacity', 0); return; }
      const e = eOut(u);
      set(w, 'cy', cy.toFixed(2));
      set(w, 'rx', (24 + e * 214).toFixed(1));
      set(w, 'ry', (16 + e * 172).toFixed(1));
      set(w, 'stroke-width', (1.9 - e).toFixed(2));
      set(w, 'opacity', ((1 - u) * .42).toFixed(3));
    });

    let lit = 0;
    dots.forEach(d => {
      const a = .86 + (d.d / maxD) * 1.5;
      const u = eBack(seg(t, a, a + .5));
      if (u > .6) lit++;
      set(d.e, 'transform', tr(d.x, d.y + sn(t, SC, d.ph) * 3, clamp(u)));
      set(d.e, 'opacity', clamp(seg(t, a, a + .22)).toFixed(3));
    });

    const pu = eOut(seg(t, .95, 3.05));
    countTxt.textContent = Math.round(pu * 2480 / 10 * 10).toLocaleString('tr-TR') + ' kişi';
    const su = eBack(seg(t, .9, 1.45));
    set(count, 'transform', tr(CX, 440, clamp(su)));
    set(count, 'opacity', clamp(seg(t, .9, 1.15)).toFixed(3));
  } };
}

/* ═══════════ içerik ═══════════ */
const COPY = [
  {
    head: 'Avrupa’nın her yerinde<br>bir tanıdığın var',
    sub: 'Avrupa’da yaşayanlar ve gitmeyi planlayanlar<br>için tek topluluk.',
    cta: 'Devam et',
    rows: [['Küre kadraja yükselir', 0, 1.9], ['Uçak kürenin çevresinde', .8, 4.9], ['Küre döner, Avrupa’da durur', 0, 6.5], ['Dalış ve Avrupa yakın planı', 4.9, 6.7], ['Uçak rotada', 6.7, 11.0], ['Topluluk ağı', 7.4, 11.9], ['Kişiler ve rozetler', 6.8, 11.2]]
  },
  {
    head: 'Sor, paylaş,<br>tavsiye al',
    sub: 'Vize, oturum, eğitim, ev, iş, seyahat, sağlık…<br>Deneyimini paylaş, tavsiye ver, tavsiye iste.',
    cta: 'Devam et',
    rows: [['Soru kartı', 0, .9], ['Topluluktan cevaplar', 1.15, 2.75], ['En iyi cevap açılır', 2.9, 4.4], ['Cevap metni', 3.15, 4.4], ['En iyi cevap rozeti', 4.35, 4.95], ['Soru çözüldü', 5.15, 5.8]]
  },
  {
    head: 'Gündemi takip et,<br>hiçbir şeyi kaçırma',
    sub: 'Eğitim, vize, seyahat, haber…<br>Sayfaları takip et, akışını kendine göre kur.',
    cta: 'Devam et',
    rows: [['Dağınık kartlar', 0, .8], ['Seçim ve ayrışma', .74, 1.95], ['Akışa yerleşme', 1.5, 2.4], ['Etiketler', 2.15, 3.15]]
  },
  {
    head: 'İşletmeni binlerce kişiye<br>kolayca ulaştır',
    sub: 'Hizmetini Avrupa’daki ve Türkiye’deki<br>müşterilerine tek yerden duyur.',
    cta: 'Hemen başla',
    rows: [['Hizmet kartı', 0, .7], ['Erişim dalgaları', .62, 2.6], ['Topluluk ızgarası', .86, 2.9], ['Erişim sayacı', .9, 3.05]]
  }
];
const NOTES = {
  full: 'Dört ekran sırayla, birer kez oynar. Her ekran son karesinde 1,5 sn bekler, sonra sıradakine geçer; “Devam et” beklemeden geçirir. Son ekranda kalır, döngü yok.',
  1: 'Küre sağ alttan kadraja yükselir, uçak arkasından çıkıp çevresinde tur atar ve Avrupa’ya dalar; kamera onunla yakınlaşır. İkondaki uçak şehirlerin üzerinden geçtikçe noktalar büyür; içinden o şehirdeki kişi ve ülke rozeti çıkar.',
  2: 'Tasarımdaki gerçek gönderi kartı: soru ortada durur, topluluktan gelen cevaplar sayacı çevirir, en iyi cevap kartın içinde açılır ve gönderi “Soru Çözüldü” rozetini alır.',
  3: 'Altı başlıktan üçü seçilip tek sütuna iner, kalanlar arkaya çekilir; etiketler yerine oturur.',
  4: 'Hizmet kartı yayına girer; dalgalar topluluğa yayıldıkça düğümler ve sayaç büyür.'
};

/* ═══════════ kurulum ═══════════ */
const art = $('#art');
const builders = [scene1, scene2, scene3, scene4];
const scenes = builders.map(b => {
  const s = b();
  art.appendChild(s.g);
  return s;
});

let mode = 'full';
let dur = TOTAL;
let t = 0, playing = false, speed = 1, last = 0, shown = -1, holdUntil = 0;
const HOLD = 1.5;                  /* tam akışta ekranlar arası bekleme (sn) */

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
  [...$('#obDots').children].forEach((d, k) => d.classList.toggle('on', k === i));
}

function render(time) {
  let idx = +mode - 1;
  if (mode === 'full') { idx = 0; while (idx < 3 && time >= STARTS[idx + 1]) idx++; }
  const local = mode === 'full' ? time - STARTS[idx] : time;
  showScene(idx);
  scenes.forEach((s, k) => {
    if (k === idx) { s.g.style.display = ''; s.update(local); }
    else s.g.style.display = 'none';
  });

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
      if (now >= holdUntil) { holdUntil = 0; t = STARTS[sceneAt(t) + 1]; render(t); }
    } else {
      const i = sceneAt(t);
      t += dt * speed;
      if (mode === 'full') {
        const end = STARTS[i] + DURS[i] - 1e-3;
        if (t >= end) {
          t = end;
          if (i < 3) holdUntil = now + HOLD * 1000 / speed;
          else setPlaying(false);            /* son ekranda kalır, döngü yok */
        }
      } else if (t >= dur) { t = dur; setPlaying(false); }
      render(t);
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
