/* Avrupa Cepte — Onboarding akışı
   Dört karşılama ekranı, 393×852. İlk ekran 12,2 sn, diğerleri 3,6 sn.
   İlk ekran küre, rota ve portrelerle; diğerleri düğüm/kart/çizgiyle anlatılır.
   Renkler CSS değişkenlerinden gelir, koyu tema da doğru çalışır. */
'use strict';

const NS = 'http://www.w3.org/2000/svg';
const SC = 3.6;                 /* sahne süresi */
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
const DURS = [12.2, SC, SC, SC];
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

/* Sayfa hapı: markanın /sayfa gösterimi. İkon ya dairesel bayrak ya emoji. */
function pagePill(icon, name, emoji) {
  const fs = 11.5;
  const label = '/' + name;
  const w = label.length * fs * .55 + 34, h = 26;
  const cid = `pp${pagePill.n = (pagePill.n || 0) + 1}`;
  const kids = [
    S('rect', { x: -w / 2 + 2, y: -h / 2 + 3, width: w, height: h, rx: h / 2, fill: '#0B1B3A', opacity: .07 }),
    S('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: '#fff' }),
    S('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: 'none', stroke: '#E3EAF7' })
  ];
  if (emoji) {
    kids.push(txt(emoji, { x: -w / 2 + 14, y: 4.6, 'font-size': 14, 'text-anchor': 'middle' }));
  } else {
    kids.push(S('defs', null, S('clipPath', { id: cid }, S('circle', { cx: -w / 2 + 14, cy: 0, r: 8 }))));
    kids.push(S('image', { href: `${AST}flags/${icon}.svg`, x: -w / 2 + 6, y: -8, width: 16, height: 16, 'clip-path': `url(#${cid})` }));
    kids.push(S('circle', { cx: -w / 2 + 14, cy: 0, r: 8, fill: 'none', stroke: '#0B1B3A', 'stroke-width': .9, opacity: .12 }));
  }
  kids.push(txt(label, { class: 't-ink', x: -w / 2 + 26, y: 4.1, 'font-size': fs, 'font-weight': 700 }));
  return G(kids);
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
  pages: 10.8,             /* sayfa hapları */
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

/* Catmull-Rom noktalarından yumuşak SVG yolu. */
function smoothPath(p) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  return d;
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

  /* Uçağın sırayla geçtiği şehirler. */
  const cities = [
    { ll: [-3.70, 40.42], r: 23, img: 'people/kadin-1.jpg', flag: 'ispanya', label: 'Madrid' },
    { ll: [2.35, 48.86], r: 24, img: 'people/kisi-4.jpg', flag: 'fransa', label: 'Paris' },
    { ll: [18.07, 59.33], r: 22, img: 'people/kisi-3.jpg', flag: 'isvec', label: 'Stokholm' },
    { ll: [13.40, 52.52], r: 25, img: 'people/kisi-1.jpg', flag: 'almanya', label: 'Berlin' },
    { ll: [21.01, 52.23], r: 21, img: 'people/kisi-2.jpg', flag: 'polonya', label: 'Varşova' },
    { ll: [12.50, 41.90], r: 23, img: 'people/kisi-5.jpg', flag: 'italya', label: 'Roma' },
    { ll: [28.98, 41.01], r: 24, img: 'people/erkek-1.jpg', flag: 'turkiye', label: 'İstanbul' }
  ];
  const APPROACH = [-6.5, 46.2];    /* dalışın bittiği nokta: İspanya açıkları */

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
    grad('obSea', { cx: .36, cy: .3, r: .8 }, [[0, 'var(--surface)', 1], [.5, 'var(--tint)', 1], [1, 'var(--brand-mid)', .5]]),
    grad('obShade', { cx: .32, cy: .28, r: .88 }, [[0, '#0A2A6B', 0], [.62, '#0A2A6B', 0], [1, '#0A2A6B', .3]]),
    grad('obHi', { cx: .32, cy: .26, r: .34 }, [[0, '#FFFFFF', .7], [1, '#FFFFFF', 0]]),
    grad('obAtmo', { cx: .5, cy: .5, r: .5 }, [[0, 'var(--brand)', 0], [.8, 'var(--brand)', 0], [.85, 'var(--brand)', .17], [1, 'var(--brand)', 0]])
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
  const shade = S('path', { fill: 'url(#obShade)' });
  const hi = S('path', { fill: 'url(#obHi)' });
  const rim = S('path', { class: 'globe-rim' });
  [sea, gratP, landP, shade, hi, rim].forEach(e => map.appendChild(e));
  stage.appendChild(map);
  const front = G([]);
  stage.appendChild(front);

  /* ---- yakın plan: rota, noktalar, kişiler ---- */
  const trail = S('path', { class: 'ln', 'stroke-dasharray': '1.5 5', 'stroke-width': 1.8, opacity: 0, mask: 'url(#obTrailMask)' });
  const trailReveal = S('path', { fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round' });
  g.appendChild(S('defs', null, S('mask', { id: 'obTrailMask', maskUnits: 'userSpaceOnUse', x: -100, y: -100, width: 600, height: 1000 }, trailReveal)));
  g.appendChild(trail);
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
  const routePts = [[A[0], A[1]]].concat(cities.map(c => [c.x, c.y])).concat([[430, 520]]);
  set(trail, 'd', smoothPath(routePts));
  set(trailReveal, 'd', smoothPath(routePts));

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
    cityS.forEach(cs => { dip += Math.exp(-Math.pow((s - cs) / 52, 2)); });
    const start = .3 + .7 * smooth(clamp(s / 150));
    const out = 1 + .8 * smooth(clamp((s - lastS) / 160));
    return (1 - .58 * Math.min(1, dip)) * start * out;
  };
  const timeTab = [0];
  for (let i = 1; i < pts.length; i++) timeTab.push(timeTab[i - 1] + STEP / speed((i - .5) * STEP));
  const TT = timeTab[timeTab.length - 1];
  timeTab.forEach((v, i) => { timeTab[i] = v / TT; });
  const F0 = T1.fly[0], F1 = T1.fly[1];
  const sAt = t => invert(timeTab, seg(t, F0, F1)) * STEP;
  const passAt = cityS.map(cs => F0 + timeTab[Math.round(cs / STEP)] * (F1 - F0));
  const at = s => trail.getPointAtLength(clamp(s, 0, RL));

  const pages = [
    { e: pagePill(null, 'schengen', '✈️'), x: 82, y: 128 },
    { e: pagePill('avrupa', 'avrupa'), x: 110, y: 470 }
  ];
  pages.forEach(p => g.appendChild(p.e));

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
      [sea, shade, hi, rim].forEach(e => set(e, 'd', sph));
      set(gratP, 'd', geo(grat));
      if (LAND) set(landP, 'd', geo(LAND));
    }
    const appear = eOut(seg(t, 0, .6));
    set(map, 'opacity', appear.toFixed(3));
    set(sea, 'opacity', (1 - zoom * .85).toFixed(3));
    set(shade, 'opacity', live.toFixed(3));
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
      if (s < RL - 1) {
        const p = at(s);
        const head = deg(at(s - 4), at(s + 12));
        const turn = wrapDeg(deg(at(s + 16), at(s + 24)) - deg(at(s - 24), at(s - 16)));
        const vn = speed(s) * TT / RL;               /* ortalamaya göre hız */
        plane.update(p.x, p.y + sn(t, .9) * 1.2, head, turn * vn / 32, .92 * (1 + .07 * (vn - 1)), 1, t);
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

    pages.forEach((pg, i) => {
      const a = T1.pages + i * .16;
      const pu = eBack(seg(t, a, a + .55));
      set(pg.e, 'transform', tr(pg.x, pg.y + sn(t, 3.6, i * .4) * 3, clamp(pu)));
      set(pg.e, 'opacity', clamp(seg(t, a, a + .24)).toFixed(3));
    });
  } };
}

/* ═══════════ 02 · Sor, paylaş, tavsiye al ═══════════ */
function scene2() {
  const g = G([]);
  const cardY = 214;
  const links = G([]);
  g.appendChild(links);

  const nodes = [[64, 150], [330, 158], [52, 356], [342, 346]].map(p => {
    const e = G([
      S('circle', { class: 'card-soft', cx: 0, cy: 0, r: 16 }),
      S('circle', { class: 'nd', cx: 0, cy: 0, r: 6.5 })
    ]);
    g.appendChild(e);
    return { e, x: p[0], y: p[1] };
  });

  const lns = nodes.map(n => {
    const d = `M${n.x} ${n.y} Q${lerp(n.x, CX, .55).toFixed(1)} ${lerp(n.y, cardY, .3).toFixed(1)} ${CX} ${cardY}`;
    const e = S('path', { class: 'ln', d: d, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
    links.appendChild(e);
    return e;
  });

  const ask = skelCard(240, 96, [[20, 44, 132], [20, 58, 178], [20, 72, 96]], 18);
  ask.insertBefore(S('circle', { class: 'nd', cx: -96, cy: -26, r: 7 }), ask.children[1]);
  ask.appendChild(txt('Soru', { class: 't-brand', x: -80, y: -22, 'font-size': 12 }));
  g.appendChild(ask);

  const answers = [
    { label: 'Vize', from: 0, y: 318 },
    { label: 'Oturum', from: 1, y: 352 },
    { label: 'Ev', from: 3, y: 386 }
  ].map(a => {
    const w = 210, h = 28;
    const e = G([
      S('rect', { class: 'card', x: -w / 2, y: -h / 2, width: w, height: h, rx: 10 }),
      S('circle', { class: 'nd', cx: -w / 2 + 16, cy: 0, r: 4.4 }),
      txt(a.label, { class: 't-ink', x: -w / 2 + 28, y: 4, 'font-size': 11.5 }),
      S('rect', { class: 'sk', x: 8, y: -2.5, width: 70, height: 5, rx: 2.5 })
    ]);
    g.appendChild(e);
    return { e, a };
  });

  const count = pill('3 tavsiye', 't-brand');
  g.appendChild(count);

  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    const au = eBack(seg(t, 0, .62));
    set(ask, 'transform', tr(CX, cardY + sn(t, SC) * 3, clamp(au)));
    set(ask, 'opacity', clamp(seg(t, 0, .3)).toFixed(3));

    nodes.forEach((n, i) => {
      const u = eBack(seg(t, .45 + i * .1, 1.15 + i * .1));
      set(n.e, 'transform', tr(n.x, n.y + sn(t, 2.4, i * .25) * 3.5, clamp(u)));
      set(n.e, 'opacity', clamp(seg(t, .45 + i * .1, .8 + i * .1)).toFixed(3));
    });

    lns.forEach((l, i) => {
      const d = eOut(seg(t, .95 + i * .09, 1.75 + i * .09));
      set(l, 'stroke-dashoffset', (1 - d).toFixed(4));
      set(l, 'opacity', (d * .5).toFixed(3));
    });

    answers.forEach((an, i) => {
      const a = 1.3 + i * .22;
      const u = eOut4(seg(t, a, a + .85));
      const src = nodes[an.a.from];
      set(an.e, 'transform', tr(lerp(src.x, CX, u), lerp(src.y, an.a.y, u), lerp(.5, 1, u)));
      set(an.e, 'opacity', clamp(seg(t, a, a + .28)).toFixed(3));
    });

    const cu = eBack(seg(t, 2.65, 3.2));
    set(count, 'transform', tr(CX, 432, clamp(cu)));
    set(count, 'opacity', clamp(seg(t, 2.65, 2.9)).toFixed(3));
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
    head: 'Avrupa’nın her yerinde bir tanıdığın var',
    sub: 'Avrupa’da yaşayanlar ve gitmeyi planlayanlar için tek topluluk.',
    cta: 'Devam et',
    rows: [['Küre kadraja yükselir', 0, 1.9], ['Uçak kürenin çevresinde', .8, 4.9], ['Küre döner, Avrupa’da durur', 0, 6.5], ['Dalış ve Avrupa yakın planı', 4.9, 6.7], ['Uçak rotada', 6.7, 11.0], ['Kişiler ve rozetler', 6.8, 11.2], ['Sayfa hapları', 10.8, 11.5]]
  },
  {
    head: 'Sor, paylaş, tavsiye al',
    sub: 'Vize, oturum, eğitim, ev, iş, seyahat, sağlık… Deneyimini paylaş, tavsiye ver, tavsiye iste.',
    cta: 'Devam et',
    rows: [['Soru kartı', 0, .7], ['Topluluk düğümleri', .45, 1.45], ['Tavsiye akışı', .95, 2.6], ['Tavsiye sayacı', 2.65, 3.3]]
  },
  {
    head: 'Gündemi takip et, hiçbir şeyi kaçırma',
    sub: 'Eğitim, vize, seyahat, haber… Sayfaları takip et, akışını kendine göre kur.',
    cta: 'Devam et',
    rows: [['Dağınık kartlar', 0, .8], ['Seçim ve ayrışma', .74, 1.95], ['Akışa yerleşme', 1.5, 2.4], ['Etiketler', 2.15, 3.15]]
  },
  {
    head: 'Hizmetini veya İşletmeni binlerce kişiye kolayca ulaştır',
    sub: 'Hem Avrupa’daki hem Türkiye’deki potansiyel müşterilerine tek yerden ulaş.',
    cta: 'Hemen başla',
    rows: [['Hizmet kartı', 0, .7], ['Erişim dalgaları', .62, 2.6], ['Topluluk ızgarası', .86, 2.9], ['Erişim sayacı', .9, 3.05]]
  }
];
const NOTES = {
  full: 'Dört ekran sırayla, birer kez oynar. Her ekran son karesinde 1,5 sn bekler, sonra sıradakine geçer; “Devam et” beklemeden geçirir. Son ekranda kalır, döngü yok.',
  1: 'Küre sağ alttan kadraja yükselir, uçak arkasından çıkıp çevresinde tur atar ve Avrupa’ya dalar; kamera onunla yakınlaşır. İkondaki uçak şehirlerin üzerinden geçtikçe noktalar büyür; içinden o şehirdeki kişi ve ülke rozeti çıkar.',
  2: 'Soru kartı ortada durur; topluluk düğümlerinden gelen tavsiyeler kartın altına yığılır.',
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
  $('#obHead').textContent = c.head;
  $('#obSub').textContent = c.sub;
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
