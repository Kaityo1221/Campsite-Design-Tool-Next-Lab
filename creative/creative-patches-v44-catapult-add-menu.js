(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    // Keep the catapult prototype deliberately CSS-only.
    // The existing add-menu click flow already closes immediately after a POI type is chosen.
    src=src.replace("fab.textContent=cmAddMenuOpen?'×':'＋';","fab.textContent='＋';");

    const style=`<style id="cmV44CatapultStyle">
      .cm-fab-wrap{overflow:visible!important;isolation:isolate}
      .cm-fab-wrap .cm-add-fab{z-index:12!important;overflow:visible!important;transform-origin:center;transition:transform .16s ease,box-shadow .18s ease!important}
      .cm-fab-wrap.open .cm-add-fab{transform:scale(1.06)!important;box-shadow:0 0 0 7px rgba(94,218,255,.16),0 0 28px rgba(83,205,255,.62),0 5px 18px rgba(0,0,0,.22)!important}
      .cm-fab-wrap.open .cm-add-fab:before,.cm-fab-wrap.open .cm-add-fab:after{content:'';position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(165,239,255,.82);pointer-events:none;animation:cmCatAura 1.12s ease-out infinite}
      .cm-fab-wrap.open .cm-add-fab:after{inset:-20px;border-color:rgba(115,214,255,.34);animation-delay:.28s}
      @keyframes cmCatAura{0%{opacity:.95;transform:scale(.72)}70%{opacity:.22}100%{opacity:0;transform:scale(1.28)}}

      .cm-fab-wrap .cm-bubble{z-index:10!important;width:52px!important;height:52px!important;left:2px!important;top:2px!important;border:1px solid rgba(255,255,255,.94)!important;background:rgba(255,255,255,.96)!important;box-shadow:0 0 0 3px rgba(120,225,255,.18),0 0 21px rgba(75,199,255,.46),0 8px 22px rgba(0,0,0,.22)!important;opacity:0!important;transform:translate(0,0) scale(.22)!important;pointer-events:none!important}
      .cm-fab-wrap .cm-bubble img{width:38px!important;height:38px!important;filter:drop-shadow(0 0 7px rgba(101,218,255,.72))!important}

      .right-hand .cm-fab-wrap .cm-bubble[data-layer="new-pokestop"]{--cat-x:-104px;--cat-y:-58px;--cat-angle:29deg;--cat-len:112px;--cat-delay:0ms}
      .right-hand .cm-fab-wrap .cm-bubble[data-layer="new-gym"]{--cat-x:-72px;--cat-y:-112px;--cat-angle:57deg;--cat-len:126px;--cat-delay:48ms}
      .right-hand .cm-fab-wrap .cm-bubble[data-layer="new-power"]{--cat-x:-18px;--cat-y:-152px;--cat-angle:83deg;--cat-len:145px;--cat-delay:96ms}
      .left-hand .cm-fab-wrap .cm-bubble[data-layer="new-pokestop"]{--cat-x:104px;--cat-y:-58px;--cat-angle:151deg;--cat-len:112px;--cat-delay:0ms}
      .left-hand .cm-fab-wrap .cm-bubble[data-layer="new-gym"]{--cat-x:72px;--cat-y:-112px;--cat-angle:123deg;--cat-len:126px;--cat-delay:48ms}
      .left-hand .cm-fab-wrap .cm-bubble[data-layer="new-power"]{--cat-x:18px;--cat-y:-152px;--cat-angle:97deg;--cat-len:145px;--cat-delay:96ms}

      .cm-fab-wrap.open .cm-bubble{opacity:1!important;transform:translate(var(--cat-x),var(--cat-y)) scale(1)!important;pointer-events:auto!important;animation:cmCatLaunch .36s cubic-bezier(.16,1.28,.35,1) both;animation-delay:var(--cat-delay)!important}
      .cm-fab-wrap:not(.open) .cm-bubble{opacity:0!important;transform:translate(0,0) scale(.22)!important;pointer-events:none!important;animation:none!important;transition:none!important}
      @keyframes cmCatLaunch{0%{opacity:0;transform:translate(0,0) scale(.2)}62%{opacity:1;transform:translate(calc(var(--cat-x)*1.04),calc(var(--cat-y)*1.04)) scale(1.08)}100%{opacity:1;transform:translate(var(--cat-x),var(--cat-y)) scale(1)}}

      .cm-fab-wrap .cm-bubble:before{content:'';position:absolute;left:50%;top:50%;width:var(--cat-len);height:3px;transform-origin:0 50%;transform:rotate(var(--cat-angle));background:repeating-linear-gradient(90deg,rgba(188,247,255,.96) 0 7px,rgba(188,247,255,.12) 7px 14px);border-radius:999px;box-shadow:0 0 7px rgba(72,213,255,.95),0 0 18px rgba(72,213,255,.45);opacity:0;pointer-events:none}
      .cm-fab-wrap.open .cm-bubble:before{opacity:.92;animation:cmCatTrail .62s linear infinite}
      @keyframes cmCatTrail{to{background-position:28px 0}}

      .cm-fab-wrap .cm-bubble:after{position:absolute;top:50%;white-space:nowrap;border:1px solid rgba(128,204,224,.5);border-radius:999px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 4px 14px rgba(0,0,0,.13);padding:5px 9px;color:#116995;font-size:10px;font-weight:900;line-height:1;opacity:0;transform:translateY(-50%) scale(.9);transition:opacity .13s ease,transform .2s ease;pointer-events:none}
      .cm-fab-wrap .cm-bubble[data-layer="new-pokestop"]:after{content:'新規ポケストップ'}
      .cm-fab-wrap .cm-bubble[data-layer="new-gym"]:after{content:'新規ジム'}
      .cm-fab-wrap .cm-bubble[data-layer="new-power"]:after{content:'新規パワースポット'}
      .right-hand .cm-fab-wrap .cm-bubble:after{right:58px}
      .left-hand .cm-fab-wrap .cm-bubble:after{left:58px}
      .cm-fab-wrap.open .cm-bubble:after{opacity:1;transform:translateY(-50%) scale(1);transition-delay:calc(var(--cat-delay) + 90ms)}

      @media (prefers-reduced-motion:reduce){.cm-fab-wrap .cm-bubble,.cm-fab-wrap .cm-bubble:before,.cm-add-fab:before,.cm-add-fab:after{animation:none!important;transition:none!important}}
    </style>`;
    if(!src.includes('id="cmV44CatapultStyle"'))src=src.replace('</head>',style+'</head>');
    return src;
  };
})();
