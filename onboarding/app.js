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
function scene1() {
  const g = G([]);
  const R = 104, N = 8;
  const rand = rnd(7);
  const ring = G([]);
  const links = G([]);
  g.appendChild(links);
  g.appendChild(ring);

  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / N);
    const x = CX + Math.cos(a) * R, y = CY + Math.sin(a) * R * .84;
    const sx = CX + Math.cos(a) * R * (1.44 + rand() * .34) + (rand() - .5) * 44;
    const sy = CY + Math.sin(a) * R * (1.30 + rand() * .32) + (rand() - .5) * 38;
    const e = node(7);
    ring.appendChild(e);
    const trail = S('path', { class: 'ln-faint', d: `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${((sx + x) / 2).toFixed(1)} ${((sy + y) / 2 - 26).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`, pathLength: 1 });
    links.appendChild(trail);
    pts.push({ e, x, y, sx, sy, trail, ph: i / N });
  }

  /* komşu bağlar: halkayı kuran yay dizisi */
  const chords = [];
  for (let i = 0; i < N; i++) {
    const a = pts[i], b = pts[(i + 1) % N];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const d = `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${lerp(mx, CX, .30).toFixed(1)} ${lerp(my, CY, .30).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    const e = S('path', { class: 'ln', d: d, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
    links.appendChild(e);
    chords.push(e);
  }
  /* merkezden üç kısa bağ: "senin tanıdıkların" */
  const spokes = [1, 4, 6].map(i => {
    const p = pts[i];
    const e = S('path', {
      class: 'ln', d: `M${CX} ${CY} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
      pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1
    });
    links.appendChild(e);
    return e;
  });

  /* merkez: sen */
  const me = G([
    S('circle', { class: 'nd-halo', cx: 0, cy: 0, r: 30 }),
    S('circle', { class: 'nd', cx: 0, cy: 0, r: 13 }),
    S('circle', { cx: 0, cy: 0, r: 5.4, fill: '#fff' })
  ]);
  g.appendChild(me);

  /* şehir etiketleri */
  const tags = [
    { i: 1, e: pill('Berlin'), dx: 46, dy: -6 },
    { i: 4, e: pill('Viyana'), dx: -50, dy: 10 },
    { i: 6, e: pill('Rotterdam'), dx: -58, dy: -8 }
  ];
  tags.forEach(t2 => g.appendChild(t2.e));

  return { g, update(t) {
    const env = envelope(t);
    g.setAttribute('opacity', env.toFixed(3));
    const spin = sn(t, SC) * 1.6;
    ring.setAttribute('transform', `rotate(${spin.toFixed(2)} ${CX} ${CY})`);
    links.setAttribute('transform', `rotate(${spin.toFixed(2)} ${CX} ${CY})`);

    pts.forEach((p, i) => {
      const a = i * .055;
      const born = eOut(seg(t, a, a + .34));
      const u = eOut4(seg(t, .42 + a, 1.58 + a));
      const br = 1 + sn(t, 1.8, p.ph) * .06;
      set(p.e, 'transform', tr(lerp(p.sx, p.x, u), lerp(p.sy, p.y, u), born * br));
      set(p.e, 'opacity', (born * lerp(.45, 1, u)).toFixed(3));
      set(p.trail, 'stroke-dasharray', 1);
      set(p.trail, 'stroke-dashoffset', (1 - u).toFixed(4));
      set(p.trail, 'opacity', ((1 - seg(t, 1.5, 2.2)) * .2).toFixed(3));
    });

    chords.forEach((c, i) => {
      const a = 1.52 + i * .052;
      const d = eOut(seg(t, a, a + .55));
      set(c, 'stroke-dashoffset', (1 - d).toFixed(4));
      set(c, 'opacity', (d * .62).toFixed(3));
    });

    const mu = eBack(seg(t, 2.25, 2.9));
    set(me, 'transform', tr(CX, CY, clamp(mu) * (1 + sn(t, 1.8, .3) * .035)));
    set(me, 'opacity', clamp(seg(t, 2.25, 2.55)).toFixed(3));

    spokes.forEach((sp, i) => {
      const d = eOut(seg(t, 2.6 + i * .09, 3.15 + i * .09));
      set(sp, 'stroke-dashoffset', (1 - d).toFixed(4));
      set(sp, 'opacity', (d * .5).toFixed(3));
    });

    tags.forEach((t2, k) => {
      const a = 2.55 + k * .16;
      const u = eOut(seg(t, a, a + .55));
      const p = pts[t2.i];
      set(t2.e, 'transform', tr(p.x + t2.dx * u, p.y + t2.dy, lerp(.85, 1, u)));
      set(t2.e, 'opacity', u.toFixed(3));
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
    rows: [['Dağınık düğümler', 0, .6], ['Halkaya toplanma', .42, 1.7], ['Bağ çizgileri', 1.52, 2.6], ['Şehir etiketleri', 2.3, 3.3]]
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
  1: 'Dağınık düğümler bir halkada buluşur, aralarında bağ çizgileri kurulur, merkezde sen kalırsın.',
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
