(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    // Finalize the catapult add-menu UI while keeping the existing 2x2 launch layout intact.
    // Explicit confirm must always place visibly, even immediately after an iPhone pinch gesture.
    const startNeedle="  activeLayer=layer;cmAddMode=true;activeTool='add';cmCloseAddMenu();cmUpdateFab();status.classList.add('fade');renderLayerPanel();";
    const startReplacement="  activeLayer=layer;cmAddMode=true;activeTool='add';cmCloseAddMenu();cmUpdateFab();status.classList.add('fade');if(groups[layer]&&!map.hasLayer(groups[layer]))groups[layer].addTo(map);renderLayerPanel();";
    if(src.includes(startNeedle))src=src.replace(startNeedle,startReplacement);

    const confirmNeedle="d.querySelector('#cmSafeAddConfirm').onclick=e=>{e.preventDefault();e.stopPropagation();if(!cmAddMode)return;cmPlace(map.getCenter());cmSafeEnsureAddCircle()};";
    const confirmReplacement="d.querySelector('#cmSafeAddConfirm').onclick=e=>{e.preventDefault();e.stopPropagation();if(!cmAddMode)return;if(groups[activeLayer]&&!map.hasLayer(groups[activeLayer]))groups[activeLayer].addTo(map);cmPinchUntil=0;const before=records.length;cmPlace(map.getCenter());if(records.length>before){renderLayerPanel();msg('追加しました。続けて配置できます',1200)}cmSafeEnsureAddCircle()};";
    if(src.includes(confirmNeedle))src=src.replace(confirmNeedle,confirmReplacement);

    const style=`<style id="cmV44CatapultStyle">
      .cm-fab-wrap{overflow:visible!important;isolation:isolate}
      .cm-fab-wrap .cm-add-fab{z-index:12!important;overflow:visible!important;transform-origin:center;transition:transform .16s ease,box-shadow .18s ease!important}
      .cm-fab-wrap.open .cm-add-fab{transform:scale(1.06)!important;box-shadow:0 0 0 7px rgba(94,218,255,.16),0 0 28px rgba(83,205,255,.62),0 5px 18px rgba(0,0,0,.22)!important}
      .cm-fab-wrap.open .cm-add-fab:before,.cm-fab-wrap.open .cm-add-fab:after{content:'';position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(165,239,255,.82);pointer-events:none;animation:cmCatAura 1.12s ease-out infinite}
      .cm-fab-wrap.open .cm-add-fab:after{inset:-20px;border-color:rgba(115,214,255,.34);animation-delay:.28s}
      @keyframes cmCatAura{0%{opacity:.95;transform:scale(.72)}70%{opacity:.22}100%{opacity:0;transform:scale(1.28)}}

      #entry:not(.hidden)~#cmStandaloneSaveButton,#entry:not(.hidden)~#cmStandaloneSaveMenu{display:none!important}

      .cm-fab-wrap .cm-bubble{z-index:10!important;width:54px!important;height:54px!important;left:1px!important;top:1px!important;border:1px solid rgba(255,236,190,.92)!important;border-radius:10px!important;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(243,236,217,.96))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -2px 5px rgba(141,120,64,.12),0 3px 8px rgba(0,0,0,.18)!important;opacity:0!important;transform:translate(0,0) scale(.22)!important;pointer-events:none!important}
      .cm-fab-wrap .cm-bubble img{width:34px!important;height:34px!important;filter:drop-shadow(0 0 4px rgba(101,218,255,.38))!important}

      .right-hand .cm-fab-wrap .cm-bubble[data-layer="new-pokestop"]{--cat-x:-54px;--cat-y:0px;--cat-delay:0ms}
      .right-hand .cm-fab-wrap .cm-bubble[data-layer="new-gym"]{--cat-x:-54px;--cat-y:-54px;--cat-delay:48ms}
      .right-hand .cm-fab-wrap .cm-bubble[data-layer="new-power"]{--cat-x:0px;--cat-y:-54px;--cat-delay:96ms}
      .left-hand .cm-fab-wrap .cm-bubble[data-layer="new-pokestop"]{--cat-x:54px;--cat-y:0px;--cat-delay:0ms}
      .left-hand .cm-fab-wrap .cm-bubble[data-layer="new-gym"]{--cat-x:54px;--cat-y:-54px;--cat-delay:48ms}
      .left-hand .cm-fab-wrap .cm-bubble[data-layer="new-power"]{--cat-x:0px;--cat-y:-54px;--cat-delay:96ms}

      .cm-fab-wrap.open .cm-bubble{opacity:1!important;transform:translate(var(--cat-x),var(--cat-y)) scale(1)!important;pointer-events:auto!important;animation:cmCatLaunch .36s cubic-bezier(.16,1.28,.35,1) both;animation-delay:var(--cat-delay)!important}
      .cm-fab-wrap:not(.open) .cm-bubble{opacity:0!important;transform:translate(0,0) scale(.22)!important;pointer-events:none!important;animation:none!important;transition:none!important}
      @keyframes cmCatLaunch{0%{opacity:0;transform:translate(0,0) scale(.2)}62%{opacity:1;transform:translate(calc(var(--cat-x)*1.025),calc(var(--cat-y)*1.025)) scale(1.04)}100%{opacity:1;transform:translate(var(--cat-x),var(--cat-y)) scale(1)}}

      .cm-fab-wrap .cm-bubble:before,.cm-fab-wrap.open .cm-bubble:before{display:none!important;content:none!important;opacity:0!important;animation:none!important}
      .cm-fab-wrap .cm-bubble:after,.cm-fab-wrap.open .cm-bubble:after{display:none!important;content:none!important;opacity:0!important;transform:none!important}

      /* Handed placement for the v34 safe add bar. Keep DOM and placement logic untouched. */
      .cm-safe-add-bar{
        grid-template-areas:"value confirm cancel lever";
        grid-template-columns:46px 64px 24px 76px!important;
        justify-content:end!important;
      }
      .cm-safe-add-lever{grid-area:lever}
      #cmSafeAddRadiusValue{grid-area:value}
      .cm-safe-add-confirm{grid-area:confirm}
      .cm-safe-add-cancel{grid-area:cancel}

      .right-hand .cm-safe-add-bar{
        left:auto!important;
        right:8px!important;
        transform:none!important;
        padding-right:21px!important;
      }

      .left-hand .cm-safe-add-bar{
        left:8px!important;
        right:auto!important;
        transform:none!important;
        grid-template-areas:"lever cancel confirm value";
        grid-template-columns:76px 24px 64px 46px!important;
        justify-content:start!important;
      }
      .left-hand .cm-safe-add-labels{left:52px!important;text-align:left!important}
      .left-hand .cm-safe-add-track{left:31px!important}
      .left-hand .cm-safe-add-knob{left:31px!important}

      @media (prefers-reduced-motion:reduce){.cm-fab-wrap .cm-bubble,.cm-add-fab:before,.cm-add-fab:after{animation:none!important;transition:none!important}}
    </style>`;
    if(!src.includes('id="cmV44CatapultStyle"'))src=src.replace('</head>',style+'</head>');
    return src;
  };
})();
