(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    const uiMarker='function cmInstallUi(){';
    if(src.includes(uiMarker)&&!src.includes('function cmInstallStandaloneSave(){')){
      const helper=`let cmStandaloneSaveMenu=null,cmStandaloneSaveBusy=false;
function cmCloseStandaloneSave(){
  if(cmStandaloneSaveMenu){cmStandaloneSaveMenu.remove();cmStandaloneSaveMenu=null}
}
function cmOpenStandaloneSave(){
  cmCloseStandaloneSave();
  try{cmCloseSaveMenu()}catch{}
  const w=document.createElement('div');
  w.id='cmStandaloneSaveMenu';
  w.innerHTML='<button id="cmStandaloneKmz" type="button">KMZで出力</button><button id="cmStandaloneCoords" type="button">座標一覧</button><button id="cmStandaloneClose" type="button">×</button>';
  document.body.appendChild(w);
  cmStandaloneSaveMenu=w;

  const stop=e=>{try{e.preventDefault()}catch{}try{e.stopPropagation()}catch{}try{e.stopImmediatePropagation()}catch{}};
  const kmz=w.querySelector('#cmStandaloneKmz');
  const coords=w.querySelector('#cmStandaloneCoords');
  const close=w.querySelector('#cmStandaloneClose');

  const runKmz=async e=>{
    stop(e);if(cmStandaloneSaveBusy)return;cmStandaloneSaveBusy=true;
    try{cmCloseStandaloneSave();await exportKmz()}catch(err){console.error(err);msg('KMZ出力に失敗しました',2200)}finally{cmStandaloneSaveBusy=false}
  };
  const runCoords=e=>{stop(e);cmCloseStandaloneSave();cmOpenCoords()};
  const runClose=e=>{stop(e);cmCloseStandaloneSave()};

  ['pointerup','touchend','click'].forEach(type=>kmz.addEventListener(type,runKmz,{capture:true,passive:false}));
  ['pointerup','touchend','click'].forEach(type=>coords.addEventListener(type,runCoords,{capture:true,passive:false}));
  ['pointerup','touchend','click'].forEach(type=>close.addEventListener(type,runClose,{capture:true,passive:false}));
}
function cmInstallStandaloneSave(){
  const old=document.getElementById('save');
  if(old)old.style.display='none';
  if(document.getElementById('cmStandaloneSaveButton'))return;

  const b=document.createElement('button');
  b.id='cmStandaloneSaveButton';
  b.type='button';
  b.textContent='💾';
  b.setAttribute('aria-label','保存・出力');
  b.title='保存・出力';
  document.body.appendChild(b);

  let last=0;
  const fire=e=>{
    const now=Date.now();
    try{e.preventDefault()}catch{}try{e.stopPropagation()}catch{}try{e.stopImmediatePropagation()}catch{}
    if(now-last<650)return;last=now;
    cmOpenStandaloneSave();
  };
  b.addEventListener('pointerup',fire,{capture:true,passive:false});
  b.addEventListener('touchend',fire,{capture:true,passive:false});
  b.addEventListener('click',fire,true);
}

function cmCatapultLayout(){
  const wrap=document.getElementById('cmFabWrap');
  if(!wrap)return;
  const rect=wrap.getBoundingClientRect();
  const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  const goLeft=cx>window.innerWidth*.54;
  const goUp=cy>window.innerHeight*.42;
  const sx=goLeft?-1:1,sy=goUp?-1:1;
  const pts=[
    {x:sx*104,y:sy*62},
    {x:sx*68,y:sy*118},
    {x:sx*16,y:sy*154}
  ];
  wrap.classList.toggle('cm-cat-left',goLeft);
  wrap.classList.toggle('cm-cat-right',!goLeft);
  wrap.classList.toggle('cm-cat-up',goUp);
  wrap.classList.toggle('cm-cat-down',!goUp);
  const bubbles=[...wrap.querySelectorAll('.cm-bubble')];
  bubbles.forEach((b,i)=>{
    const p=pts[i]||pts[0];
    b.style.setProperty('--cat-x',p.x+'px');
    b.style.setProperty('--cat-y',p.y+'px');
    b.style.setProperty('--cat-delay',(i*48)+'ms');
    const path=wrap.querySelector('.cm-cat-path[data-i="'+i+'"]');
    const glow=wrap.querySelector('.cm-cat-glow[data-i="'+i+'"]');
    if(path||glow){
      const bend=(goLeft?-1:1)*(goUp?-1:1)*(18+i*5);
      const qx=p.x*.42+(-p.y/Math.max(1,Math.abs(p.y)))*bend;
      const qy=p.y*.42+(p.x/Math.max(1,Math.abs(p.x)))*bend;
      const d='M0 0 Q '+qx+' '+qy+' '+p.x+' '+p.y;
      if(path)path.setAttribute('d',d);
      if(glow)glow.setAttribute('d',d);
    }
  });
}
function cmInstallCatapultFx(){
  const wrap=document.getElementById('cmFabWrap');
  const fab=document.getElementById('cmAddFab');
  if(!wrap||!fab||wrap.dataset.catapultReady==='1')return;
  wrap.dataset.catapultReady='1';
  wrap.classList.add('cm-catapult');
  const labels={
    'new-pokestop':'新規ポケストップ',
    'new-gym':'新規ジム',
    'new-power':'新規パワースポット'
  };
  wrap.querySelectorAll('.cm-bubble').forEach((b,i)=>{
    b.dataset.label=labels[b.dataset.layer]||'';
    b.style.setProperty('--cat-i',i);
    b.addEventListener('pointerdown',()=>wrap.classList.add('cm-cat-snuff'),true);
  });
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.classList.add('cm-cat-svg');
  svg.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(ns,'defs');
  defs.innerHTML='<marker id="cmCatArrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="rgba(126,225,255,.95)"/></marker>';
  svg.appendChild(defs);
  for(let i=0;i<3;i++){
    const g=document.createElementNS(ns,'path');
    g.setAttribute('class','cm-cat-glow');g.dataset.i=i;svg.appendChild(g);
    const p=document.createElementNS(ns,'path');
    p.setAttribute('class','cm-cat-path');p.dataset.i=i;p.setAttribute('marker-end','url(#cmCatArrow)');svg.appendChild(p);
  }
  wrap.insertBefore(svg,fab);
  for(let i=0;i<7;i++){
    const s=document.createElement('i');
    s.className='cm-cat-soul cm-cat-soul-'+i;
    wrap.insertBefore(s,fab);
  }
  const observer=new MutationObserver(()=>{
    if(wrap.classList.contains('open')){
      wrap.classList.remove('cm-cat-snuff');
      cmCatapultLayout();
    }else{
      wrap.classList.remove('cm-cat-snuff');
    }
  });
  observer.observe(wrap,{attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',()=>{if(wrap.classList.contains('open'))cmCatapultLayout()});
  cmCatapultLayout();
}
`;
      src=src.replace(uiMarker,helper+uiMarker.replace('{','{cmInstallStandaloneSave();'));
      src=src.replace('cmInstallFab();','cmInstallFab();cmInstallCatapultFx();');
      src=src.replace("fab.textContent=cmAddMenuOpen?'×':'＋';","fab.textContent='＋';");
    }

    const style=`<style id="cmV43StandaloneSaveStyle">
      #save{display:none!important}
      #cmStandaloneSaveButton{position:fixed;left:10px;bottom:calc(72px + env(safe-area-inset-bottom));z-index:6000;width:52px;height:52px;padding:0;border:1px solid var(--edge);border-radius:14px;background:#fffdf7;color:#382d1d;font-size:23px;font-weight:900;box-shadow:0 4px 14px rgba(0,0,0,.18);pointer-events:auto!important;touch-action:manipulation!important;-webkit-user-select:none;user-select:none}
      .left-hand #cmStandaloneSaveButton{left:auto;right:10px}
      body.cm-placement-docked #cmStandaloneSaveButton{display:none!important}
      #cmStandaloneSaveMenu{position:fixed;left:10px;bottom:calc(132px + env(safe-area-inset-bottom));z-index:6500;display:grid;grid-template-columns:1fr;gap:7px;width:min(260px,calc(100vw - 20px));padding:8px;border-radius:14px;background:rgba(48,40,29,.96);box-shadow:0 8px 24px rgba(0,0,0,.28);pointer-events:auto!important}
      .left-hand #cmStandaloneSaveMenu{left:auto;right:10px}
      #cmStandaloneSaveMenu button{min-height:46px;border:1px solid #b89a57;border-radius:11px;background:#fff8e6;color:#382d1d;padding:0 14px;font-weight:900;text-align:left;pointer-events:auto!important;touch-action:manipulation!important}
      #cmStandaloneSaveMenu #cmStandaloneClose{text-align:center;font-size:20px}

      .cm-fab-wrap.cm-catapult{overflow:visible!important;isolation:isolate}
      .cm-fab-wrap.cm-catapult .cm-add-fab{position:absolute!important;z-index:8!important;overflow:visible!important;transform-origin:center;transition:transform .16s ease,box-shadow .18s ease!important}
      .cm-fab-wrap.cm-catapult.open .cm-add-fab{transform:scale(1.05);box-shadow:0 0 0 7px rgba(90,211,255,.14),0 0 25px rgba(67,198,255,.55),0 5px 18px rgba(0,0,0,.22)!important}
      .cm-fab-wrap.cm-catapult.open .cm-add-fab:before,.cm-fab-wrap.cm-catapult.open .cm-add-fab:after{content:'';position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(149,235,255,.8);pointer-events:none;animation:cmCatAura 1.15s ease-out infinite}
      .cm-fab-wrap.cm-catapult.open .cm-add-fab:after{inset:-20px;border-color:rgba(121,212,255,.35);animation-delay:.32s}
      @keyframes cmCatAura{0%{opacity:.95;transform:scale(.72)}70%{opacity:.2}100%{opacity:0;transform:scale(1.25)}}

      .cm-fab-wrap.cm-catapult .cm-bubble{z-index:7!important;width:52px!important;height:52px!important;left:2px!important;top:2px!important;border:1px solid rgba(255,255,255,.92)!important;background:rgba(255,255,255,.96)!important;box-shadow:0 0 0 3px rgba(118,220,255,.18),0 0 20px rgba(80,197,255,.42),0 8px 22px rgba(0,0,0,.22)!important;opacity:0!important;transform:translate(0,0) scale(.25)!important;pointer-events:none!important;transition:opacity .12s ease,transform .34s cubic-bezier(.16,1.32,.35,1)!important;transition-delay:0ms!important}
      .cm-fab-wrap.cm-catapult .cm-bubble img{width:38px!important;height:38px!important;filter:drop-shadow(0 0 7px rgba(104,213,255,.68))!important}
      .cm-fab-wrap.cm-catapult.open .cm-bubble{opacity:1!important;transform:translate(var(--cat-x),var(--cat-y)) scale(1)!important;pointer-events:auto!important;transition-delay:var(--cat-delay)!important}
      .cm-fab-wrap.cm-catapult:not(.open) .cm-bubble{transition-duration:.055s!important;transition-delay:0ms!important}
      .cm-fab-wrap.cm-catapult.cm-cat-snuff .cm-bubble{opacity:0!important;transition:none!important;pointer-events:none!important}
      .cm-fab-wrap.cm-catapult .cm-bubble:after{content:attr(data-label);position:absolute;top:50%;transform:translateY(-50%) scale(.92);white-space:nowrap;border:1px solid rgba(127,198,220,.55);border-radius:999px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 4px 14px rgba(0,0,0,.13);padding:5px 9px;color:#116995;font-size:10px;font-weight:900;line-height:1;opacity:0;transition:opacity .13s ease,transform .2s ease;pointer-events:none}
      .cm-fab-wrap.cm-catapult.open .cm-bubble:after{opacity:1;transform:translateY(-50%) scale(1);transition-delay:calc(var(--cat-delay) + 90ms)}
      .cm-fab-wrap.cm-catapult.cm-cat-left .cm-bubble:after{left:58px}
      .cm-fab-wrap.cm-catapult.cm-cat-right .cm-bubble:after{right:58px}
      .cm-fab-wrap.cm-catapult.cm-cat-snuff .cm-bubble:after{opacity:0!important;transition:none!important}

      .cm-cat-svg{position:absolute;left:28px;top:28px;width:1px;height:1px;overflow:visible;z-index:4;pointer-events:none}
      .cm-cat-glow,.cm-cat-path{fill:none;stroke-linecap:round;opacity:0;transition:opacity .08s ease}
      .cm-cat-glow{stroke:rgba(82,207,255,.25);stroke-width:10;filter:blur(5px)}
      .cm-cat-path{stroke:rgba(176,244,255,.96);stroke-width:2.2;stroke-dasharray:5 8;filter:drop-shadow(0 0 4px rgba(80,213,255,.95));animation:cmCatFlow .58s linear infinite}
      .cm-fab-wrap.cm-catapult.open .cm-cat-glow{opacity:.85}
      .cm-fab-wrap.cm-catapult.open .cm-cat-path{opacity:.98}
      .cm-fab-wrap.cm-catapult.cm-cat-snuff .cm-cat-glow,.cm-fab-wrap.cm-catapult.cm-cat-snuff .cm-cat-path{opacity:0!important;transition:none!important}
      @keyframes cmCatFlow{to{stroke-dashoffset:-26}}

      .cm-cat-soul{position:absolute;left:24px;top:24px;z-index:6;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle,#fff 0 22%,#aef1ff 30%,rgba(90,210,255,.38) 60%,transparent 74%);box-shadow:0 0 8px #b8f5ff,0 0 18px rgba(65,207,255,.82);opacity:0;pointer-events:none}
      .cm-fab-wrap.cm-catapult.open .cm-cat-soul{animation:cmSoulRise 1.15s ease-out infinite}
      .cm-cat-soul-0{--sx:-18px;--sy:-58px;animation-delay:0s!important}.cm-cat-soul-1{--sx:14px;--sy:-82px;animation-delay:.18s!important}.cm-cat-soul-2{--sx:-32px;--sy:-105px;animation-delay:.34s!important}.cm-cat-soul-3{--sx:30px;--sy:-124px;animation-delay:.49s!important}.cm-cat-soul-4{--sx:-8px;--sy:-145px;animation-delay:.62s!important}.cm-cat-soul-5{--sx:42px;--sy:-92px;animation-delay:.78s!important}.cm-cat-soul-6{--sx:-46px;--sy:-76px;animation-delay:.93s!important}
      @keyframes cmSoulRise{0%{opacity:0;transform:translate(0,0) scale(.3)}18%{opacity:.96}70%{opacity:.62}100%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(1.05)}}
      .cm-fab-wrap.cm-catapult.cm-cat-snuff .cm-cat-soul{display:none!important}
      @media (prefers-reduced-motion:reduce){.cm-fab-wrap.cm-catapult .cm-bubble,.cm-cat-path,.cm-cat-soul,.cm-add-fab:before,.cm-add-fab:after{animation:none!important;transition:none!important}}
    </style>`;
    if(!src.includes('id="cmV43StandaloneSaveStyle"'))src=src.replace('</head>',style+'</head>');

    return src;
  };
})();
