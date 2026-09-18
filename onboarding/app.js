/* Avrupa Cepte — Onboarding akışı
   Dört karşılama ekranı, 393×852, sahne başına 3,6 sn.
   Kurgu düğüm/kart/çizgiyle anlatılır; karakter illüstrasyonu yoktur.
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
const eBack = t => { const c = 1.24; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const lerp = (a, b, u) => a + (b - a) * u;
const sn = (t, p, ph = 0) => Math.sin((t / p + ph) * Math.PI * 2);
const set = (el, k, v) => el.setAttribute(k, v);
const tr = (x, y, s) => `translate(${x.toFixed(2)} ${y.toFixed(2)})` + (s != null && s !== 1 ? ` scale(${(+s).toFixed(4)})` : '');

/* Sahne sonunda içerik yumuşakça kapanır, başında açılır: döngü dikişsiz olur.
   Geçiş kısa tutulur, yoksa ilk karede ekran boş görünüyor. */
const fadeIn = t => eOut(seg(t, 0, .18));
const fadeOut = t => 1 - seg(t, SC - .20, SC);
const envelope = t => Math.min(fadeIn(t), fadeOut(t));

/* Durdurulmuş hâlde gösterilecek oturmuş kare. Sahne t=0'da tamamen
   saydam olduğu için, oynatma başlamadan 0. saniye gösterilirse ekran
   boş görünür ve sayfa bozuk sanılır. */
const POSTER = SC * 0.80;

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

function scene1() {
  const g = G([]);
  const links = G([], { fill: 'none' });
  g.appendChild(links);

  const CX1 = 196.5, CY1 = 266;

  /* Dış halka. Fotoğraflı olanlar insanları, manzaralılar yerleri temsil eder. */
  const ring = [
    { x: 196, y: 162, r: 31, img: 'people/kadin-1.jpg', flag: 'almanya', label: 'Berlin' },
    { x: 303, y: 213, r: 26, img: 'people/erkek-1.jpg', flag: 'hollanda', label: 'Rotterdam' },
    { x: 309, y: 316, r: 23, img: 'places/alpler.jpg', flag: 'avusturya', label: 'Viyana' },
    { x: 196, y: 368, r: 27, img: 'people/erkek-1.jpg', flip: true, flag: 'fransa', label: 'Lyon' },
    { x: 86, y: 318, r: 24, img: 'people/kadin-1.jpg', flip: true, flag: 'ispanya', label: 'Madrid' },
    { x: 92, y: 212, r: 22, img: 'places/kampus.jpg', flag: 'isvec', label: 'Lund' }
  ];

  /* merkez: sen */
  const me = G([
    S('circle', { class: 'nd-halo', cx: 0, cy: 0, r: 52 }),
    S('ellipse', { cx: 0, cy: 34, rx: 28, ry: 7, fill: '#0B1B3A', opacity: .10 }),
    S('circle', { class: 'nd', cx: 0, cy: 0, r: 34 }),
    S('path', {
      d: 'M0 -12 a10 10 0 1 1 0 .01 M-17 20 c2.4-10.6 9-17 17-17 s14.6 6.4 17 17 z',
      fill: '#fff'
    }),
    S('circle', { cx: 0, cy: 0, r: 34, fill: 'none', stroke: '#fff', 'stroke-width': 3 })
  ]);
  const meTag = flagBadge('turkiye', 'Sen');

  /* bağ çizgileri: merkezden her üyeye, ayrıca komşular arası iki yay */
  const spokes = ring.map(m => {
    const e = S('path', {
      class: 'ln', d: `M${CX1} ${CY1} L${m.x} ${m.y}`,
      pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1
    });
    links.appendChild(e);
    return e;
  });
  const chords = [[0, 1], [1, 2], [3, 4], [4, 5]].map(p => {
    const a = ring[p[0]], b = ring[p[1]];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const e = S('path', {
      class: 'ln',
      d: `M${a.x} ${a.y} Q${lerp(mx, CX1, .22).toFixed(1)} ${lerp(my, CY1, .22).toFixed(1)} ${b.x} ${b.y}`,
      pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1
    });
    links.appendChild(e);
    return e;
  });

  /* nabız noktaları: bağın canlı olduğunu gösterir */
  const pulses = spokes.map(() => {
    const e = S('circle', { class: 'nd', cx: CX1, cy: CY1, r: 3.2, opacity: 0 });
    links.appendChild(e);
    return { e, len: 0 };
  });

  const nodes = ring.map((m, i) => {
    const b = bubble(i, m.r, m.img, { flip: m.flip });
    const wrap = G([b]);
    g.appendChild(wrap);
    const badge = flagBadge(m.flag, m.label);
    g.appendChild(badge);
    /* dağılmış başlangıç konumu: merkezden dışarı doğru itilmiş */
    const dx = m.x - CX1, dy = m.y - CY1;
    const d = Math.hypot(dx, dy) || 1;
    return {
      m, wrap, badge,
      sx: CX1 + dx / d * (d + 86) + (i % 2 ? 18 : -18),
      sy: CY1 + dy / d * (d + 74),
      ph: i / ring.length
    };
  });

  g.appendChild(me);
  g.appendChild(meTag);

  return { g, update(t) {
    g.setAttribute('opacity', envelope(t).toFixed(3));

    nodes.forEach((n, i) => {
      const a = i * .07;
      const born = eOut(seg(t, a, a + .30));
      const u = eOut4(seg(t, .30 + a, 1.45 + a));
      const float = sn(t, 2.4, n.ph) * 3.4;
      const x = lerp(n.sx, n.m.x, u);
      const y = lerp(n.sy, n.m.y, u) + float;
      set(n.wrap, 'transform', tr(x, y, born * lerp(.72, 1, u)));
      set(n.wrap, 'opacity', born.toFixed(3));

      /* rozet baloncuğun altına, yerine oturduktan sonra iner */
      const bu = eBack(seg(t, 1.35 + i * .10, 2.0 + i * .10));
      set(n.badge, 'transform', tr(x, y + n.m.r + 15, clamp(bu)));
      set(n.badge, 'opacity', clamp(seg(t, 1.35 + i * .10, 1.62 + i * .10)).toFixed(3));
    });

    spokes.forEach((s, i) => {
      const a = 1.05 + i * .06;
      const d = eOut(seg(t, a, a + .5));
      set(s, 'stroke-dashoffset', (1 - d).toFixed(4));
      set(s, 'opacity', (d * .45).toFixed(3));
      const p = pulses[i];
      if (!p.len) p.len = s.getTotalLength();
      const pu = ((t / 1.8 + i * .16) % 1);
      if (p.len && d > .9) {
        const pt = s.getPointAtLength(p.len * pu);
        set(p.e, 'cx', pt.x.toFixed(2)); set(p.e, 'cy', pt.y.toFixed(2));
        set(p.e, 'opacity', (Math.sin(pu * Math.PI) * .9).toFixed(3));
      } else set(p.e, 'opacity', 0);
    });

    chords.forEach((c, i) => {
      const a = 1.5 + i * .09;
      const d = eOut(seg(t, a, a + .55));
      set(c, 'stroke-dashoffset', (1 - d).toFixed(4));
      set(c, 'opacity', (d * .3).toFixed(3));
    });

    const mu = eBack(seg(t, .05, .75));
    set(me, 'transform', tr(CX1, CY1, clamp(mu) * (1 + sn(t, 2.4, .3) * .02)));
    set(me, 'opacity', clamp(seg(t, .05, .32)).toFixed(3));
    const mt = eBack(seg(t, .55, 1.15));
    set(meTag, 'transform', tr(CX1, CY1 + 50, clamp(mt)));
    set(meTag, 'opacity', clamp(seg(t, .55, .78)).toFixed(3));
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
    rows: [['Merkez · sen', .05, .75], ['Baloncuklar iner', 0, 1.6], ['Bağ çizgileri', 1.05, 2.05], ['Ülke rozetleri', 1.35, 2.15]]
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
  full: 'Dört ekran arka arkaya oynar: buluşma, tavsiye, kişisel akış, erişim. Toplam 14,4 sn.',
  1: 'Tanıdıkların Avrupa’nın dört bir yanından gelip çevrende halka olur; her birinin altında bulunduğu ülke rozeti belirir.',
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
let dur = SC * 4;
let t = 0, playing = false, speed = 1, loopOn = true, last = 0, shown = -1;

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
    ? COPY.map((c, i) => [`0${i + 1} ${['Aidiyet', 'Tavsiye', 'Kişisel akış', 'Erişim'][i]}`, i * SC, (i + 1) * SC])
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
  const idx = mode === 'full' ? Math.min(3, Math.floor(time / SC)) : +mode - 1;
  const local = mode === 'full' ? time - idx * SC : time;
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

function setMode(m) {
  mode = m;
  dur = m === 'full' ? SC * 4 : SC;
  /* oynatma duruyorsa boş kare yerine oturmuş kare göster */
  t = playing ? 0 : POSTER;
  buildRows();
  $('#modeNote').textContent = NOTES[m];
  shown = -1;
  render(t);
}
function setPlaying(v) {
  playing = v;
  const b = $('#play');
  b.textContent = v ? 'Duraklat' : 'Oynat';
  b.setAttribute('aria-pressed', v);
  if (v) last = performance.now();
}

document.querySelectorAll('input[name=mode]').forEach(r =>
  r.addEventListener('change', () => { setMode(r.value); setPlaying(true); }));
document.querySelectorAll('input[name=speed]').forEach(r =>
  r.addEventListener('change', () => { speed = +r.value; }));
$('#loop').addEventListener('change', e => { loopOn = e.target.checked; });
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
    setMode(n); setPlaying(true);
    e.preventDefault();
  }
});

/* document.hidden kontrolü yok: gizli sekmede rAF zaten tetiklenmiyor,
   ama gömülü/önizleme ortamlarında sekme "gizli" sayılıp kare üretilebiliyor.
   O kontrol orada animasyonu tamamen durduruyordu. Sıçramayı dt sınırı önler. */
function tick(now) {
  if (playing) {
    const dt = Math.min((now - last) / 1000, .1);
    last = now;
    t += dt * speed;
    if (t >= dur) {
      if (loopOn) t -= dur;
      else { t = dur; setPlaying(false); }
    }
    render(t);
  } else last = now;
  requestAnimationFrame(tick);
}

/* Panodan derin bağlantı: /onboarding/#s=3 doğrudan üçüncü ekranı açar. */
function modeFromHash() {
  const m = /(?:^|[#&])s=([1-4])/.exec(location.hash);
  return m ? m[1] : 'full';
}
function applyHash() {
  const m = modeFromHash();
  $(`#m-${m}`).checked = true;
  setMode(m);
}
addEventListener('hashchange', () => { applyHash(); setPlaying(true); });

applyHash();
setPlaying(!matchMedia('(prefers-reduced-motion:reduce)').matches);
requestAnimationFrame(tick);
