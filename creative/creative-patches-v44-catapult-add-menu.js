(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    const uiMarker='function cmInstallUi(){';
    if(src.includes(uiMarker)&&!src.includes('function cmInstallCatapultFx(){')){
      const helper=`
function cmCatapultLayout(){
  const wrap=document.getElementById('cmFabWrap');
  if(!wrap)return;
  const rect=wrap.getBoundingClientRect();
  const cx=rect.left+rect.width/2;
  const cy=rect.top+rect.height/2;
  const goLeft=cx>window.innerWidth*.56;
  const goUp=cy>window.innerHeight*.46;
  const sx=goLeft?-1:1;
  const sy=goUp?-1:1;
  const pts=[
    {x:sx*104,y:sy*58},
    {x:sx*72,y:sy*112},
    {x:sx*18,y:sy*152}
  ];
  wrap.classList.toggle('cm-cat-left',goLeft);
  wrap.classList.toggle('cm-cat-right',!goLeft);
  wrap.classList.toggle('cm-cat-up',goUp);
  wrap.classList.toggle('cm-cat-down',!goUp);
  [...wrap.querySelectorAll('.cm-bubble')].forEach((b,i)=>{
    const p=pts[i]||pts[0];
    b.style.setProperty('--cat-x',p.x+'px');
    b.style.setProperty('--cat-y',p.y+'px');
    b.style.setProperty('--cat-delay',(i*48)+'ms');
    const path=wrap.querySelector('.cm-cat-path[data-i="'+i+'"]');
    const glow=wrap.querySelector('.cm-cat-glow[data-i="'+i+'"]');
    const bend=(goLeft?-1:1)*(goUp?-1:1)*(16+i*5);
    const pxSign=p.x===0?1:Math.sign(p.x);
    const pySign=p.y===0?1:Math.sign(p.y);
    const qx=p.x*.45-pySign*bend;
    const qy=p.y*.42+pxSign*bend;
    const d='M0 0 Q '+qx+' '+qy+' '+p.x+' '+p.y;
    if(path)path.setAttribute('d',d);
    if(glow)glow.setAttribute('d',d);
  });
  const soulPts=[[-18,58],[15,82],[-31,106],[30,128],[-8,148],[43,94],[-46,77]];
  [...wrap.querySelectorAll('.cm-cat-soul')].forEach((s,i)=>{
    const p=soulPts[i]||soulPts[0];
    s.style.setProperty('--soul-x',(sx*Math.abs(p[0]))+'px');
    s.style.setProperty('--soul-y',(sy*Math.abs(p[1]))+'px');
  });
}
function cmInstallCatapultFx(){
  const wrap=document.getElementById('cmFabWrap');
  const fab=document.getElementById('cmAddFab');
  if(!wrap||!fab||wrap.dataset.catapultReady==='44')return;
  wrap.dataset.catapultReady='44';
  wrap.classList.add('cm-catapult');
  const labels={
    'new-pokestop':'新規ポケストップ',
    'new-gym':'新規ジム',
    'new-power':'新規パワースポット'
  };
  wrap.querySelectorAll('.cm-bubble').forEach((b,i)=>{
    b.dataset.label=labels[b.dataset.layer]||'';
    b.style.setProperty('--cat-i',i);
  });
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.classList.add('cm-cat-svg');
  svg.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(ns,'defs');
  defs.innerHTML='<marker id="cmCatArrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="rgba(164,239,255,.96)"/></marker>';
  svg.appendChild(defs);
  for(let i=0;i<3;i++){
    const g=document.createElementNS(ns,'path');
    g.setAttribute('class','cm-cat-glow');
    g.dataset.i=i;
    svg.appendChild(g);
    const p=document.createElementNS(ns,'path');
    p.setAttribute('class','cm-cat-path');
    p.dataset.i=i;
    p.setAttribute('marker-end','url(#cmCatArrow)');
    svg.appendChild(p);
  }
  wrap.insertBefore(svg,fab);
  for(let i=0;i<7;i++){
    const s=document.createElement('i');
    s.className='cm-cat-soul';
    s.style.setProperty('--soul-delay',(i*.15)+'s');
    wrap.insertBefore(s,fab);
  }
  window.addEventListener('resize',()=>{if(wrap.classList.contains('open'))cmCatapultLayout()},{passive:true});
  cmCatapultLayout();
}
`;
      src=src.replace(uiMarker,helper+uiMarker);
      src=src.replace('cmInstallFab();cmEnableFabDrag();','cmInstallFab();cmEnableFabDrag();cmInstallCatapultFx();');
      src=src.replace('function cmOpenAddMenu(){cmAddMenuOpen=true;cmUpdateFab()}','function cmOpenAddMenu(){cmAddMenuOpen=true;cmUpdateFab();requestAnimationFrame(cmCatapultLayout)}');
      src=src.replace("fab.textContent=cmAddMenuOpen?'×':'＋';","fab.textContent='＋';");
    }

    const style=`<style id="cmV44CatapultStyle">
      .cm-fab-wrap.cm-catapult{overflow:visible!important;isolation:isolate}
      .cm-fab-wrap.cm-catapult .cm-add-fab{z-index:12!important;overflow:visible!important;transform-origin:center;transition:transform .16s ease,box-shadow .18s ease!important}
      .cm-fab-wrap.cm-catapult.open .cm-add-fab{transform:scale(1.06)!important;box-shadow:0 0 0 7px rgba(94,218,255,.16),0 0 28px rgba(83,205,255,.62),0 5px 18px rgba(0,0,0,.22)!important}
      .cm-fab-wrap.cm-catapult.open .cm-add-fab:before,.cm-fab-wrap.cm-catapult.open .cm-add-fab:after{content:'';position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(165,239,255,.82);pointer-events:none;animation:cmCatAura 1.12s ease-out infinite}
      .cm-fab-wrap.cm-catapult.open .cm-add-fab:after{inset:-20px;border-color:rgba(115,214,255,.34);animation-delay:.28s}
      @keyframes cmCatAura{0%{opacity:.95;transform:scale(.72)}70%{opacity:.22}100%{opacity:0;transform:scale(1.28)}}

      .cm-fab-wrap.cm-catapult .cm-bubble{z-index:10!important;width:52px!important;height:52px!important;left:2px!important;top:2px!important;border:1px solid rgba(255,255,255,.94)!important;background:rgba(255,255,255,.96)!important;box-shadow:0 0 0 3px rgba(120,225,255,.18),0 0 21px rgba(75,199,255,.46),0 8px 22px rgba(0,0,0,.22)!important;opacity:0!important;transform:translate(0,0) scale(.22)!important;pointer-events:none!important;transition:opacity .12s ease,transform .34s cubic-bezier(.16,1.32,.35,1)!important;transition-delay:0ms!important}
      .cm-fab-wrap.cm-catapult .cm-bubble img{width:38px!important;height:38px!important;filter:drop-shadow(0 0 7px rgba(101,218,255,.72))!important}
      .cm-fab-wrap.cm-catapult.open .cm-bubble{opacity:1!important;transform:translate(var(--cat-x),var(--cat-y)) scale(1)!important;pointer-events:auto!important;transition-delay:var(--cat-delay)!important}
      .cm-fab-wrap.cm-catapult:not(.open) .cm-bubble{opacity:0!important;pointer-events:none!important;transition-duration:.05s!important;transition-delay:0ms!important}
      .cm-fab-wrap.cm-catapult .cm-bubble:after{content:attr(data-label);position:absolute;top:50%;white-space:nowrap;border:1px solid rgba(128,204,224,.5);border-radius:999px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 4px 14px rgba(0,0,0,.13);padding:5px 9px;color:#116995;font-size:10px;font-weight:900;line-height:1;opacity:0;transform:translateY(-50%) scale(.9);transition:opacity .13s ease,transform .2s ease;pointer-events:none}
      .cm-fab-wrap.cm-catapult.open .cm-bubble:after{opacity:1;transform:translateY(-50%) scale(1);transition-delay:calc(var(--cat-delay) + 90ms)}
      .cm-fab-wrap.cm-catapult.cm-cat-left .cm-bubble:after{right:58px}
      .cm-fab-wrap.cm-catapult.cm-cat-right .cm-bubble:after{left:58px}

      .cm-cat-svg{position:absolute;left:28px;top:28px;width:1px;height:1px;overflow:visible;z-index:5;pointer-events:none}
      .cm-cat-glow,.cm-cat-path{fill:none;stroke-linecap:round;opacity:0;transition:opacity .08s ease}
      .cm-cat-glow{stroke:rgba(80,207,255,.24);stroke-width:10;filter:blur(5px)}
      .cm-cat-path{stroke:rgba(184,246,255,.97);stroke-width:2.2;stroke-dasharray:5 8;filter:drop-shadow(0 0 4px rgba(80,213,255,.96));animation:cmCatFlow .58s linear infinite}
      .cm-fab-wrap.cm-catapult.open .cm-cat-glow{opacity:.88}
      .cm-fab-wrap.cm-catapult.open .cm-cat-path{opacity:.98}
      @keyframes cmCatFlow{to{stroke-dashoffset:-26}}

      .cm-cat-soul{position:absolute;left:24px;top:24px;z-index:8;width:8px;height:8px;border-radius:50%;background:radial-gradient(circle,#fff 0 20%,#c8f8ff 28%,rgba(91,216,255,.42) 58%,transparent 74%);box-shadow:0 0 8px #c3f7ff,0 0 19px rgba(65,208,255,.85);opacity:0;pointer-events:none}
      .cm-fab-wrap.cm-catapult.open .cm-cat-soul{animation:cmSoulRise 1.18s ease-out infinite;animation-delay:var(--soul-delay)}
      @keyframes cmSoulRise{0%{opacity:0;transform:translate(0,0) scale(.25)}18%{opacity:.98}66%{opacity:.68}100%{opacity:0;transform:translate(var(--soul-x),var(--soul-y)) scale(1.08)}}
      @media (prefers-reduced-motion:reduce){.cm-fab-wrap.cm-catapult .cm-bubble,.cm-cat-path,.cm-cat-soul,.cm-add-fab:before,.cm-add-fab:after{animation:none!important;transition:none!important}}
    </style>`;
    if(!src.includes('id="cmV44CatapultStyle"'))src=src.replace('</head>',style+'</head>');
    return src;
  };
})();
