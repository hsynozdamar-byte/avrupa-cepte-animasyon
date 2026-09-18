/* Avrupa Cepte — Figma Promo Flow / native HTML, CSS and Canvas.
   Akış: 01-03 tanıtım öncesi hikaye (otomatik akar, 03'te CTA'da durur),
   04 tanıtım sırasında açılan premium teşviki (bottom-sheet). */
const A = 'assets/';
const scenes = [
  {kind:'story', title:'Gönderini daha fazla<br>kişiye ulaştır.',subtitle:'Ürününü veya hizmetini Avrupa Cepte akışında görünür kıl.',duration:9, noteTitle:'Dikkat, doğalca<br>üzerinde.',note:'Hafifçe süzülen baloncuklar, yumuşak büyüyüp küçülmeler ve öne çıkan bir paylaşım.'},
  {kind:'story', title:'İlgili topluluklara<br>ulaş.',subtitle:'Tanıtımını yayınlamak istediğin sayfaları seç. İlgili toplulukta yer al.',duration:10,noteTitle:'Her bağlantı,<br>yeni bir insan.',note:'Baloncuklarla birlikte esneyen yollar. Topluluklar arasında gidip gelen ışıklar ve her varışta hafif bir yankı.'},
  {kind:'story', title:'Sesin Avrupa’da<br>yankılansın.',subtitle:'Paylaşımın şehirleri aşsın. Avrupa’daki insanlar seni duysun.',duration:12,noteTitle:'Bir paylaşım.<br>Avrupa kadar etki.',note:'Paylaşımından doğan ışık, küre üzerinden Avrupa’ya yayılıyor. Her ışık, başka bir şehre ve başka bir insana ulaşıyor.'},
  {kind:'premium', title:'3X Büyüme ile<br>zirveye çık.',subtitle:'Premium paket ile 5 sayfaya kadar yayınla, 3 kat daha fazla etkileşim kazan.',duration:10,noteTitle:'3X Büyüme &<br>Avrupa etkisi.',note:'Tanıtım anında açılan sheet: Avrupa haritası üzerinde 4 topluluk balonu ve 3X büyüme grafiği canlanır.'}
];
let active=0, playing=!matchMedia('(prefers-reduced-motion: reduce)').matches, auto=true, all=false, speed=1, time=0, motionTime=0, last=0, land=null;
const bubbles=[[],[],[],[]], phones=[], canvases=[], contexts=[];
const $=s=>document.querySelector(s);
function element(tag,cls,html=''){const e=document.createElement(tag);e.className=cls;e.innerHTML=html;return e;}
function makeBubble(scene,{x,y,size,src,tint='#b6d1ff',glass,cls='',label='',html='',amp=6,phase=0,photoStyle=''}){
  const e=element('div',`bubble ${cls}`,`${src?`<img class="bubble-photo" style="${photoStyle}" src="${A+src}" alt="">`:''}${glass?`<img class="bubble-glass" src="${A+glass}" alt="">`:`<div class="orb-shine" style="--orb-tint:${tint}"></div>`}${label}${html}`);
  e.style.width=e.style.height=size+'px';e.style.left=x+'px';e.style.top=y+'px';phones[scene].querySelector('.phone-art').append(e);
  const b={e,x,y,size,amp,phase,cx:x+size/2,cy:y+size/2,scale:1};bubbles[scene].push(b);return b;
}
scenes.forEach((s,i)=>{
  const wrap=element('div',`phone-wrap${i===0?' active':''}`);wrap.dataset.scene=i;
  let phone;
  if(s.kind==='story'){
    phone=element('article','phone',`<div class="status" aria-hidden="true"><span>9:41</span><span class="status-levels"><img src="${A}s0-imgCellularConnection.svg" alt=""><img src="${A}s0-imgWifi.svg" alt=""><span class="battery"></span></span></div><nav class="phone-nav"><strong>Tanıtım Nedir?</strong>${i<2?'<button class="skip" aria-label="Hikaye finaline geç">Atla</button>':''}</nav><div class="progress-segments" aria-hidden="true"><span><i></i></span><span><i></i></span><span><i></i></span></div><h2>${s.title}</h2><p class="subtitle">${s.subtitle}</p><div class="phone-art" role="img" aria-label="${i===0?'Paylaşımın çevresinde süzülen ülke ve erişim baloncukları':i===1?'İnsanlar ve topluluklar arasında ışıklarla canlanan bağlantı ağı':'Paylaşımdan Avrupa şehirlerine ve insanlara yayılan ışık yolları'}"><canvas class="${i===2?'globe':'network'}-canvas" aria-hidden="true"></canvas></div><div class="phone-footer"></div><button class="phone-cta">${i===2?'Tanıtım oluştur':'Devam et'}</button>`);
    phone.setAttribute('aria-label',`Hikaye ${i+1}: ${s.title.replace('<br>',' ')}`);
    const skip=phone.querySelector('.skip');if(skip)skip.onclick=()=>selectScene(2);
    // Hikaye finalindeki CTA, tanıtım sırasındaki premium sheet'ini açar.
    phone.querySelector('.phone-cta').onclick=()=>i<2?selectScene(i+1):selectScene(3);
    const canvas=phone.querySelector('canvas'),dpr=Math.min(devicePixelRatio||1,2);canvas.width=393*dpr;canvas.height=852*dpr;const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);canvases.push(canvas);contexts.push(ctx);
  }else{
    // Sahne 04: tanıtım sırasında açılan premium bottom-sheet'i.
    let stars='';for(let k=0;k<12;k++){const a=(k*30-90)*Math.PI/180,sx=(Math.cos(a)*12.5).toFixed(1),sy=(Math.sin(a)*12.5).toFixed(1);stars+=`<polygon points="${sx},${sy-2.4} ${sx+1.5},${sy+1.8} ${sx-2.3},${sy-0.8} ${sx+2.3},${sy-0.8} ${sx-1.5},${sy+1.8}"/>`;}
    phone=element('article','phone phone-modal-view',
      `<div class="status" aria-hidden="true"><span>9:41</span><span class="status-levels"><img src="${A}s0-imgCellularConnection.svg" alt=""><img src="${A}s0-imgWifi.svg" alt=""><span class="battery"></span></span></div>`+
      `<nav class="modal-phone-nav"><button class="nav-back-btn" aria-label="Tanıtıma dön"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button><strong>Tanıtım</strong></nav>`+
      `<div class="segments-6" aria-hidden="true"><span><i></i></span><span></span><span></span><span></span><span></span><span></span></div>`+
      `<div class="modal-standard-caption">Standart • 0/1 sayfa seçebilirsin</div>`+
      `<div class="modal-sheet-card"><div class="sheet-header-row"><h3>Daha fazla sayfaya mı ihtiyacın var?</h3><button class="sheet-close-icon" aria-label="Kapat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`+
      `<div class="modal-anim-graybox"><canvas class="graybox-canvas" aria-hidden="true"></canvas><div class="gb-cloud gb-cloud-tl"></div><div class="gb-cloud-bl"></div><div class="gb-cloud-br"></div>`+
      `<div class="gb-eu-hub"><div class="gb-eu-pulse"></div><div class="gb-eu-core"><svg class="gb-eu-stars" viewBox="0 0 40 40"><g fill="#ffcc00" transform="translate(20,20)">${stars}</g></svg></div></div>`+
      `<div class="gb-bubble gb-b-nl"><div class="gb-bubble-inner"><img src="${A}netherlands_windmill.jpg" alt="Hollanda"></div><div class="gb-pill"><img class="pill-flag" src="${A}flag-netherlands.svg" alt="Hollanda bayrağı"><span>Hollanda</span></div></div>`+
      `<div class="gb-bubble gb-b-de"><div class="gb-bubble-inner"><img src="${A}germany_landmark.jpg" alt="Berlin"></div><div class="gb-pill"><img class="pill-flag" src="${A}flag-germany.svg" alt="Almanya bayrağı"><span>Berlin</span></div></div>`+
      `<div class="gb-bubble gb-b-er"><div class="gb-bubble-inner"><img src="${A}erasmus_university.jpg" alt="Erasmus"></div><div class="gb-pill"><span class="pill-emoji">🎓</span><span>Erasmus</span></div></div>`+
      `<div class="gb-bubble gb-b-alp"><div class="gb-bubble-inner"><img src="${A}alps_mountains.jpg" alt="Doğa"></div><div class="gb-pill"><span class="pill-emoji">⛰️</span><span>Doğa</span></div></div>`+
      `<div class="gb-chart-assembly"><div class="gb-crown-group"><svg class="gb-crown-svg" viewBox="0 0 24 24" fill="#ffb700"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg><span class="gb-3x-text">3x</span></div>`+
      `<div class="gb-bars-container"><div class="gb-bar-track"><div class="gb-3d-bar"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div><div class="gb-bar-track"><div class="gb-3d-bar"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div><div class="gb-bar-track"><div class="gb-3d-bar"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div><div class="gb-bar-track"><div class="gb-3d-bar"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div><div class="gb-bar-track"><div class="gb-3d-bar"><div class="gb-bar-front"></div><div class="gb-bar-top"></div><div class="gb-bar-side"></div></div></div></div>`+
      `<svg class="gb-arrow-curve" viewBox="0 0 140 140" fill="none"><path d="M 12 112 Q 55 98 106 32" stroke="#0055ff" stroke-width="4.5" stroke-linecap="round" fill="none"/><polygon points="106,18 118,34 98,38" fill="#0055ff"/></svg></div>`+
      `<div class="gb-airplane"><svg viewBox="0 0 24 24" fill="#6ba6ff" width="22" height="22"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div></div>`+
      `<h4 class="sheet-subhead">Premium’da 5 sayfaya kadar yayınla.</h4><p class="sheet-desc">Standard paketle yalnızca 1 sayfa seçebilirsin. Premium ile tanıtımını daha fazla toplulukta göster.</p>`+
      `<div class="sheet-benefit-list"><div class="sheet-benefit-card"><div class="sbc-icon"><svg viewBox="0 0 24 24" fill="#0055ff"><rect x="3" y="12" width="4" height="9" rx="1.5"/><rect x="10" y="7" width="4" height="14" rx="1.5"/><rect x="17" y="3" width="4" height="18" rx="1.5"/></svg></div><span class="sbc-text">3x daha fazla erişim</span><svg class="sbc-crown" viewBox="0 0 24 24" fill="#0055ff"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg></div><div class="sheet-benefit-card"><div class="sbc-icon"><svg viewBox="0 0 24 24" fill="#0055ff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><span class="sbc-text">5 sayfaya kadar yayınla</span><svg class="sbc-crown" viewBox="0 0 24 24" fill="#0055ff"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg></div><div class="sheet-benefit-card"><div class="sbc-icon"><svg viewBox="0 0 24 24" fill="#0055ff"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div><span class="sbc-text">3 kat daha fazla etkileşim</span><svg class="sbc-crown" viewBox="0 0 24 24" fill="#0055ff"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg></div></div>`+
      `<a href="#" class="sheet-link">1 sayfayla devam et</a><button class="sheet-cta-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="#ffcc00"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg><span>Premiuma geç</span></button></div>`);
    phone.setAttribute('aria-label','Premium teşviki: 3X Büyüme sheet’i');
    phone.querySelector('.nav-back-btn').onclick=()=>selectScene(2);
    phone.querySelector('.sheet-close-icon').onclick=()=>selectScene(2);
    phone.querySelector('.sheet-link').onclick=e=>{e.preventDefault();toast('Standart paketle devam ediliyor: 1 sayfa seçebilirsin.');selectScene(2);};
    phone.querySelector('.sheet-cta-btn').onclick=()=>toast('Premium tanıtım akışı başlatılıyor...');
    const cv=phone.querySelector('.graybox-canvas'),dpr=Math.min(devicePixelRatio||1,2);cv.width=353*dpr;cv.height=235*dpr;const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);canvases.push(cv);contexts.push(ctx);
  }
  wrap.append(phone);$('#phones').append(wrap);phones.push(phone);
});
const art0=phones[0].querySelector('.phone-art');
makeBubble(0,{x:5,y:304,size:56,src:'s0-imgImage1.png',tint:'#93bcff',cls:'flag',phase:1,amp:4});
makeBubble(0,{x:313,y:249,size:117,src:'s0-imgImage3.png',tint:'#fe9ab8',cls:'flag',phase:3,amp:5});
const post=element('div','post-card',`<div class="post-header"><img class="post-avatar" src="${A}s0-imgImage159.png" alt=""><strong>Berlin Vize Danışmanlık</strong><span class="post-tag">Tanıtım</span></div><p class="post-copy">Mavi Kart ve oturum başvurularında uçtan uca danışmanlık. İlk görüşme ücretsiz.</p><div class="post-cover"><img src="${A}s0-imgImage160.png" alt="Berlin Vize Danışmanlık tanıtımı"><span class="visit">Ziyaret et ↗</span></div>`);art0.append(post);
makeBubble(0,{x:14,y:431,size:155,cls:'metric shadow',tint:'#baf4ff',phase:.4,html:`<img src="${A}people.png" alt=""><span>10 binlerce<br>ziyaret</span>`,amp:8});
makeBubble(0,{x:188,y:595,size:151,cls:'metric orange shadow',tint:'#ffca92',phase:2,html:`<img src="${A}eye.png" alt=""><span>25.500<br>Görüntülenme</span>`,amp:7});
makeBubble(0,{x:5,y:622,size:91,src:'s0-imgImage5.png',tint:'#a40003aa',cls:'flag shadow',phase:3.8,amp:5});
makeBubble(0,{x:178,y:294,size:55,src:'s0-imgImage7.png',tint:'#c3ffbf',cls:'flag shadow',phase:1.5,amp:4});
// Scene 2 retains the original photo, flag and glass exports, with live paths.
// Pills use the same community language as the v1 flow and the premium sheet.
// Countries show their circular flag image, topics show the matching emoji.
function flagIcon(src,alt){return `<img class="pill-flag" src="${A+src}" alt="${alt}">`;}
function emojiIcon(e){return `<span class="pill-emoji">${e}</span>`;}
function commPill(iconHTML,name,big=false){return `<span class="topic-label${big?' big':''}">${iconHTML}${name}</span>`;}
const PILL_NL=()=>commPill(flagIcon('flag-netherlands.svg','Hollanda bayrağı'),'Hollanda');
const PILL_DE=()=>commPill(flagIcon('flag-germany.svg','Almanya bayrağı'),'Berlin');
const PILL_ER=()=>commPill(emojiIcon('🎓'),'Erasmus');
const PILL_DO=(big=false)=>commPill(emojiIcon('⛰️'),'Doğa',big);
const net=[];
net.push(makeBubble(1,{x:20,y:329,size:90,src:'s1-imgImage173.png',glass:'s1-imgFrame2121316838.svg',phase:.3,photoStyle:'transform:scaleX(-1);',amp:6,label:PILL_NL()}));
net.push(makeBubble(1,{x:144,y:343,size:39,src:'s1-imgImage3.png',glass:'s1-imgFrame2121316846.svg',cls:'flag',phase:2,amp:5}));
net.push(makeBubble(1,{x:197,y:309,size:165,src:'s1-imgImage175.png',glass:'s1-imgFrame2121316839.svg',label:PILL_ER(),phase:1,amp:5}));
net.push(makeBubble(1,{x:74,y:436,size:114,src:'s1-imgGroup5.svg',glass:'s1-imgFrame2121316840.svg',phase:0,amp:8}));
net.push(makeBubble(1,{x:36,y:567,size:74,src:'s1-imgImage174.png',glass:'s1-imgFrame2121316842.svg',phase:2.7,amp:6,label:PILL_DE()}));
net.push(makeBubble(1,{x:163,y:511,size:222,src:'s1-imgImage176.png',glass:'s1-imgFrame2121316841.svg',label:PILL_DO(true),phase:4,amp:6}));
net.push(makeBubble(1,{x:-78,y:679,size:301,src:'s1-imgImage1.png',glass:'s1-imgFrame2121316843.svg',cls:'flag',phase:1,amp:8}));
[[22,447],[122,645],[366,474]].forEach(([x,y],i)=>net.push(makeBubble(1,{x,y,size:18,glass:'s1-imgFrame2121316844.svg',phase:i+1,amp:5})));
const edges=[[0,1],[1,3],[3,2],[3,4],[3,5],[4,8],[7,4],[7,6],[8,6],[5,6],[9,3],[0,7]];
// Scene 3: country geometry is Natural Earth; all reused images are Figma exports.
const reach=[];
reach.push(makeBubble(2,{x:26,y:329,size:76,src:'s1-imgImage173.png',glass:'s1-imgFrame2121316838.svg',cls:'reach-person',phase:.7,amp:5,label:'<span class="city-tag"><i></i>Berlin</span>'}));
reach.push(makeBubble(2,{x:288,y:379,size:76,src:'s1-imgImage174.png',glass:'s1-imgFrame2121316842.svg',cls:'reach-person',phase:2.1,amp:5,label:'<span class="city-tag"><i></i>Londra</span>'}));
reach.push(makeBubble(2,{x:20,y:538,size:72,src:'s1-imgImage174.png',glass:'s1-imgFrame2121316842.svg',cls:'reach-person',phase:4,amp:5,label:'<span class="city-tag"><i></i>Paris</span>'}));
reach.push(makeBubble(2,{x:293,y:568,size:65,src:'s1-imgImage173.png',glass:'s1-imgFrame2121316838.svg',cls:'reach-person',phase:3.1,amp:5,label:'<span class="city-tag"><i></i>Amsterdam</span>'}));
makeBubble(2,{x:160,y:320,size:91,cls:'reach-bubble',tint:'#baf4ff',phase:2,amp:4,html:'<strong>Bir<br>paylaşım.</strong><small>Binlerce bağ.</small>'});
makeBubble(2,{x:325,y:493,size:39,src:'s0-imgImage7.png',tint:'#c3ffbf',cls:'flag shadow',phase:1,amp:4});
makeBubble(2,{x:14,y:445,size:37,src:'s0-imgImage1.png',tint:'#93bcff',cls:'flag shadow',phase:2.8,amp:4});
const broadcast=element('div','broadcast-card',`<img class="broadcast-thumb" src="${A}s0-imgImage160.png" alt=""><span><strong>Senin paylaşımın</strong><small>Avrupa’ya ulaşıyor</small></span><span class="voice-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`);phones[2].querySelector('.phone-art').append(broadcast);
const word=element('span','globe-word','AVRUPA');phones[2].querySelector('.phone-art').append(word);
// Scene 4 (premium): gri kutudaki canlı elemanlar.
const gbBars=[...phones[3].querySelectorAll('.gb-3d-bar')];
const gbCrown=phones[3].querySelector('.gb-crown-svg');
const gbAirplane=phones[3].querySelector('.gb-airplane');
const gbBubbles=[...phones[3].querySelectorAll('.gb-bubble')];
function moveBubbles(i,t){
  bubbles[i].forEach((b,j)=>{const f=t*.65+b.phase;const dx=Math.sin(f)*b.amp*.7,dy=Math.sin(f*.83+b.phase)*b.amp;
  const receive=i===2&&j<4?Math.pow(Math.max(0,Math.cos(t*1.8-j*1.5)),12)*.05:0;
  b.scale=1+Math.sin(f*.9)*.024+receive;b.cx=b.x+b.size/2+dx;b.cy=b.y+b.size/2+dy;
  b.e.style.transform=`translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${b.scale.toFixed(4)})`;
  });
}
function dot(ctx,x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function glow(ctx,x,y,r=16,alpha=.32){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(36,114,255,${alpha})`);g.addColorStop(1,'rgba(67,130,255,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);}
function qpoint(a,b,c,t){const n=1-t;return [n*n*a[0]+2*n*t*b[0]+t*t*c[0],n*n*a[1]+2*n*t*b[1]+t*t*c[1]];}
function drawPacket(ctx,a,b,c,p,color='#fff',radius=2.4){
  for(let k=12;k>=0;k--){const u=p-k*.006;if(u<0||u>1)continue;const pos=qpoint(a,b,c,u);ctx.globalAlpha=(1-k/13)*.7;dot(ctx,...pos,radius*(1-k/20),'#4489ff');}
  ctx.globalAlpha=1;const pt=qpoint(a,b,c,p);glow(ctx,...pt,10,.6);dot(ctx,...pt,radius+1,'#77aaff');dot(ctx,...pt,radius*.64,color);
}
function drawNetwork(t){const ctx=contexts[1];ctx.clearRect(0,0,393,852);ctx.save();ctx.beginPath();ctx.rect(0,307,393,545);ctx.clip();
  edges.forEach(([from,to],i)=>{const a=net[from],c=net[to],p0=[a.cx,a.cy],p2=[c.cx,c.cy],bend=Math.sin(t*.5+i)*10;const p1=[(a.cx+c.cx)/2+bend,(a.cy+c.cy)/2-8+Math.cos(i)*10];
  ctx.beginPath();ctx.moveTo(...p0);ctx.quadraticCurveTo(...p1,...p2);ctx.lineWidth=2.4;ctx.strokeStyle='#b4ccff';ctx.setLineDash([5,6]);ctx.lineDashOffset=-t*3;ctx.stroke();ctx.setLineDash([]);
  let p=(t/(2.3+i%3*.7)+i*.213)%1;if(i%2)p=1-p;drawPacket(ctx,p0,p1,p2,p);
  const arrival=(t/(2.3+i%3*.7)+i*.213)%1;
  if(arrival>.8){const target=i%2?a:c,k=(arrival-.8)/.2;ctx.strokeStyle=`rgba(72,130,255,${(1-k)*.3})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(target.cx,target.cy,target.size/2*target.scale+4+k*12,0,Math.PI*2);ctx.stroke();}
  });ctx.restore();}
const sphere={type:'Sphere'},graticule=d3.geoGraticule().step([20,15])();
const europeCities=[[13.405,52.52],[-.128,51.507],[2.352,48.856],[4.904,52.367],[12.496,41.903],[-3.704,40.417],[16.373,48.208],[18.068,59.329]];
const projection=d3.geoOrthographic().scale(165).translate([196.5,514]).clipAngle(90);
function drawGlobe(t){
  const ctx=contexts[2];ctx.clearRect(0,0,393,852);const drift=Math.sin(t*.27)*3;projection.rotate([-13-drift,-40,0]);const path=d3.geoPath(projection,ctx);
  const haze=ctx.createRadialGradient(196,508,100,196,508,206);haze.addColorStop(0,'#3279fa18');haze.addColorStop(.8,'#96beff13');haze.addColorStop(1,'#ffffff00');ctx.fillStyle=haze;ctx.fillRect(0,308,393,410);
  ctx.save();ctx.shadowColor='#4d83d531';ctx.shadowBlur=25;ctx.shadowOffsetY=17;ctx.beginPath();path(sphere);const ocean=ctx.createRadialGradient(150,420,20,221,529,202);ocean.addColorStop(0,'#ffffff');ocean.addColorStop(.5,'#edf5ff');ocean.addColorStop(1,'#8cbbff');ctx.fillStyle=ocean;ctx.fill();ctx.restore();
  ctx.save();ctx.beginPath();path(sphere);ctx.clip();ctx.beginPath();path(graticule);ctx.lineWidth=.65;ctx.strokeStyle='#82a9e333';ctx.stroke();
  if(land){ctx.beginPath();path(land);const lg=ctx.createLinearGradient(0,350,200,670);lg.addColorStop(0,'#b3d3ff');lg.addColorStop(.55,'#77adff');lg.addColorStop(1,'#3e7ee6');ctx.fillStyle=lg;ctx.fill();ctx.lineWidth=.7;ctx.strokeStyle='#609ae4';ctx.stroke();}
  // Fine luminous latitude grid, visible through the land.
  ctx.beginPath();path(graticule);ctx.strokeStyle='#ffffff23';ctx.lineWidth=.5;ctx.stroke();
  const shine=ctx.createRadialGradient(155,404,0,190,505,175);shine.addColorStop(0,'#ffffff45');shine.addColorStop(.75,'#ffffff00');shine.addColorStop(1,'#135aff14');ctx.fillStyle=shine;ctx.fillRect(20,345,353,340);ctx.restore();
  ctx.beginPath();path(sphere);ctx.lineWidth=1;ctx.strokeStyle='#cadfff';ctx.stroke();
  const origin=projection([28.98,41.01]);
  const root=[205+Math.sin(t*.8)*2,661+Math.sin(t*.6)*3];const stem=[260,598];ctx.beginPath();ctx.moveTo(...root);ctx.quadraticCurveTo(...stem,...origin);ctx.strokeStyle='#5892ff55';ctx.lineWidth=1.5;ctx.stroke();drawPacket(ctx,root,stem,origin,(t*.35)%1,'#fff',2.2);
  europeCities.forEach((city,i)=>{const end=projection(city),control=[(origin[0]+end[0])/2+(i%2?18:-23),(origin[1]+end[1])/2-38-i%3*8];
  ctx.beginPath();ctx.moveTo(...origin);ctx.quadraticCurveTo(...control,...end);ctx.strokeStyle=i<4?'#307fff65':'#6099ff45';ctx.lineWidth=i<4?1.5:1;ctx.stroke();
  const p=(t*.3-i*.1+10)%1;drawPacket(ctx,origin,control,end,p,'#fff',i<4?2:1.6);
  const ripple=(t*.48+i*.21)%1;ctx.beginPath();ctx.arc(...end,3+ripple*13,0,Math.PI*2);ctx.lineWidth=1;ctx.strokeStyle=`rgba(27,98,247,${(1-ripple)*.35})`;ctx.stroke();glow(ctx,...end,12,.25);dot(ctx,...end,3.1,'#fff');dot(ctx,...end,1.8,'#0055ff');
  if(i<4){const target=reach[i],dest=[target.cx,target.cy],bend=[(end[0]+dest[0])/2,(end[1]+dest[1])/2-30];ctx.beginPath();ctx.moveTo(...end);ctx.quadraticCurveTo(...bend,...dest);ctx.setLineDash([2,4]);ctx.lineWidth=1.4;ctx.strokeStyle='#69a0ff75';ctx.stroke();ctx.setLineDash([]);drawPacket(ctx,end,bend,dest,(t*.31-i*.16+10)%1,'#fff',2.5);}
  });
  for(let j=0;j<3;j++){const r=(t*.28+j/3)%1;ctx.beginPath();ctx.arc(...origin,6+r*31,0,Math.PI*2);ctx.strokeStyle=`rgba(0,85,255,${(1-r)*.3})`;ctx.lineWidth=1.5;ctx.stroke();}glow(ctx,...origin,24,.6);dot(ctx,...origin,6,'#fff');dot(ctx,...origin,3.8,'#0055ff');
  broadcast.style.transform=`translate3d(${Math.sin(t*.8)*2}px,${Math.sin(t*.6)*3}px,0)`;
  broadcast.querySelectorAll('.voice-bars i').forEach((e,i)=>e.style.transform=`scaleY(${.25+Math.abs(Math.sin(t*2.7+i*.9))*.85})`);
}
// Premium sheet: gri kutudaki Avrupa haritası, hub ışıkları, balonlar ve 3X grafik.
const gbProj=d3.geoMercator().scale(165).center([13,51.5]).translate([115,110]);
const gbPins=[[-3.7,40.4],[2.35,48.8],[-.12,51.5],[12.5,41.9],[13.4,52.5]];
const gbHub=[112,104];
const gbTargets=[{pos:[43,41],ctrl:[75,60]},{pos:[181,39],ctrl:[155,60]},{pos:[39,157],ctrl:[70,140]},{pos:[181,161],ctrl:[155,145]},{pos:[248,115],ctrl:[185,95]}];
function drawPremium(t){
  const ctx=contexts[3];ctx.clearRect(0,0,353,235);const path=d3.geoPath(gbProj,ctx);
  const bg=ctx.createRadialGradient(112,104,20,112,104,160);bg.addColorStop(0,'rgba(0,100,255,0.16)');bg.addColorStop(.7,'rgba(0,85,255,0.05)');bg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=bg;ctx.fillRect(0,0,353,235);
  if(land){ctx.save();ctx.translate(2,5);ctx.beginPath();path(land);ctx.fillStyle='rgba(0,50,150,0.12)';ctx.fill();ctx.restore();
    ctx.save();ctx.beginPath();path(land);const lg=ctx.createLinearGradient(40,20,240,200);lg.addColorStop(0,'#7eb6ff');lg.addColorStop(.5,'#408eff');lg.addColorStop(1,'#1a6ce6');ctx.fillStyle=lg;ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.stroke();ctx.restore();}
  gbPins.forEach((coords,i)=>{const pt=gbProj(coords);if(!pt)return;const pulse=(t*.9+i*.25)%1;
    ctx.beginPath();ctx.arc(pt[0],pt[1],3+pulse*10,0,Math.PI*2);ctx.strokeStyle=`rgba(0,85,255,${(1-pulse)*.55})`;ctx.lineWidth=1.2;ctx.stroke();
    ctx.beginPath();ctx.arc(pt[0],pt[1],3.5,0,Math.PI*2);ctx.fillStyle='#0055ff';ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#fff';ctx.stroke();
    ctx.beginPath();ctx.arc(pt[0],pt[1],1.5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();});
  gbTargets.forEach((tg,i)=>{ctx.beginPath();ctx.moveTo(...gbHub);ctx.quadraticCurveTo(...tg.ctrl,...tg.pos);
    ctx.lineWidth=i===4?2.6:1.8;ctx.strokeStyle=i===4?'rgba(0,110,255,0.8)':'rgba(255,255,255,0.9)';ctx.setLineDash([4,4]);ctx.lineDashOffset=-t*(i===4?12:8);ctx.stroke();ctx.setLineDash([]);
    drawPacket(ctx,gbHub,tg.ctrl,tg.pos,(t*.55+i*.2)%1,'#fff',i===4?2.8:2.2);});
  gbBubbles.forEach((bEl,i)=>{if(bEl)bEl.style.transform=`translateY(${(Math.sin(t*1.8+i*1.2)*4).toFixed(2)}px)`;});
  gbBars.forEach((bar,j)=>{const base=[24,38,56,78,106][j],wave=.88+Math.sin(t*2.2+j*.55)*.12;bar.style.height=`${(base*wave).toFixed(1)}px`;});
  if(gbCrown)gbCrown.style.transform=`translateY(${(Math.sin(t*2.2)*3).toFixed(1)}px)`;
  if(gbAirplane){const aT=(t*.25)%1;gbAirplane.style.transform=`translate(${(12+aT*70).toFixed(1)}px,${(85-Math.sin(aT*Math.PI)*25).toFixed(1)}px) rotate(${(22-aT*8).toFixed(1)}deg)`;}
}
function render(t){[0,1,2,3].forEach(i=>{if(!all&&i!==active)return;moveBubbles(i,t);if(i===0)post.style.transform=`translate3d(${Math.sin(t*.45)*1.8}px,${Math.sin(t*.55)*3}px,0) rotate(${Math.sin(t*.35)*.45}deg)`;if(i===1)drawNetwork(t);if(i===2)drawGlobe(t);if(i===3)drawPremium(t);});
  // Telefon üstü ilerleme: hikaye 3 segmente, premium sheet 6 kademeye dolar.
  const ratio=Math.min(1,time/scenes[active].duration);
  phones.forEach((phone,pIdx)=>{phone.querySelectorAll('.progress-segments span i').forEach((seg,sIdx)=>{
    seg.style.width=all?(sIdx<pIdx||(active===3&&pIdx<3)?'100%':sIdx===pIdx&&pIdx===active?`${(ratio*100).toFixed(1)}%`:'0%'):(sIdx<active||active===3? '100%':sIdx===active?`${(ratio*100).toFixed(1)}%`:'0%');});
    const seg6=phone.querySelector('.segments-6 span:first-child i');if(seg6)seg6.style.width=active===3?`${(ratio*100).toFixed(1)}%`:'0%';});
  $('#scrubber').value=time/scenes[active].duration*1000;$('#time').textContent=`${time.toFixed(1).padStart(4,'0')} / ${scenes[active].duration.toFixed(1).padStart(4,'0')}`;}
function selectScene(i){active=Math.max(0,Math.min(3,i));time=0;motionTime=0;document.querySelectorAll('.phone-wrap').forEach((el,j)=>{el.classList.toggle('active',j===active);el.inert=!all&&j!==active;});document.querySelectorAll('.scene-tab').forEach((el,j)=>{el.classList.toggle('selected',j===active);el.setAttribute('aria-current',j===active?'step':'false');});$('#note-title').innerHTML=scenes[active].noteTitle;$('#note-text').textContent=scenes[active].note;$('#caption').textContent=`0${active+1} / 04 · ${scenes[active].kind==='story'?'HİKAYE':'PREMIUM'}`;render(time);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const art=phones[active].querySelector('.phone-art');if(art)art.animate([{opacity:0,transform:'translateY(10px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'});if(active===3){const sheet=phones[3].querySelector('.modal-sheet-card');if(sheet)sheet.animate([{transform:'translateY(64px)',opacity:.4},{transform:'translateY(0)',opacity:1}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});phones[3].querySelectorAll('.sheet-benefit-card').forEach((card,k)=>{card.animate([{opacity:0,transform:'translateY(14px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:450,delay:200+k*90,easing:'cubic-bezier(.22,1,.36,1)'});});}}}
function setPlaying(value){playing=value;$('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'Duraklat':'Oynat');}
function setAuto(value){auto=value;$('#auto').setAttribute('aria-pressed',auto);}
function resize(){const mobile=innerWidth<=650;let scale=Math.min(.94,(innerHeight-(mobile?225:207))/852);scale=Math.max(mobile?.45:.48,scale);if(all){const available=innerWidth>1100?innerWidth-380:innerWidth-65;scale=Math.min(scale,(available-48)/(393*4));if(mobile)scale=Math.max(.36,scale);}else scale=Math.min(scale,(innerWidth-36)/393);document.documentElement.style.setProperty('--phone-scale',scale.toFixed(4));}
function toast(text){const e=$('.toast');e.textContent=text;e.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.classList.remove('show'),4200);}
document.querySelectorAll('.scene-picker').forEach(nav=>nav.onclick=e=>{const b=e.target.closest('[data-scene]');if(b)selectScene(Number(b.dataset.scene));});
$('#play').onclick=()=>setPlaying(!playing);$('#replay').onclick=()=>{time=0;motionTime=0;render(time);setPlaying(true);};$('#scrubber').oninput=e=>{time=Number(e.target.value)/1000*scenes[active].duration;motionTime=time;render(motionTime);};$('#speed').onchange=e=>speed=Number(e.target.value);$('#auto').onclick=()=>setAuto(!auto);
$('#view-toggle').onclick=()=>{all=!all;document.body.classList.toggle('all-view',all);$('#view-toggle').setAttribute('aria-pressed',all);$('#view-toggle').innerHTML=all?'Tek sahneye dön <span>↙</span>':'Tüm sahneleri birlikte gör <span>↔</span>';document.querySelectorAll('.phone-wrap').forEach((el,i)=>el.inert=!all&&i!==active);resize();render(time);};
$('#return-single').onclick=()=>$('#view-toggle').click();
addEventListener('resize',resize);addEventListener('keydown',e=>{if(['INPUT','SELECT','BUTTON','A'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();setPlaying(!playing);}if(e.code==='ArrowRight')selectScene((active+1)%4);if(e.code==='ArrowLeft')selectScene((active+3)%4);});
// Hidden tabs do not accumulate time; one deterministic clock controls every layer.
document.addEventListener('visibilitychange',()=>last=0);
function tick(now){if(last&&playing&&!document.hidden){const dt=Math.min((now-last)/1000,.05)*speed;time+=dt;motionTime+=dt;
  if(time>scenes[active].duration){
    if(active<2)selectScene(active+1); // Hikaye 01→02→03 otomatik akar.
    else if(active===2){if(auto)selectScene(3);else time=scenes[active].duration;} // Finalde CTA beklenir.
    else{if(auto)selectScene(0);else time=scenes[active].duration;} // Premium sonrası başa dön.
  }}last=now;if(playing&&!document.hidden)render(motionTime);requestAnimationFrame(tick);}
fetch(A+'land.geojson').then(r=>{if(!r.ok)throw Error('Globe geometry unavailable');return r.json();}).then(data=>{land=data;render(time);}).catch(error=>{console.error(error);toast('Küre haritası yüklenemedi. Sayfayı yerel sunucu üzerinden aç.');});
resize();selectScene(0);setPlaying(playing);setAuto(auto);render(0);requestAnimationFrame(tick);
