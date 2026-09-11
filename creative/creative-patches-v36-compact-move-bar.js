(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    // Put nearest-POI distance inside the move bar and compact the vertical footprint.
    src=src.replace(
      '<strong id="cmMoveRadiusValue">50m</strong><button id="cmMoveConfirm"',
      '<strong id="cmMoveRadiusValue">50m</strong><span id="cmMoveNearest" class="cm-move-nearest">最短POI --</span><button id="cmMoveConfirm"'
    );

    src=src.replace(
      'function cmMoveLeverOffset(radius){const r=Math.max(30,Math.min(50,Number(radius)||50));return ((50-r)/20)*44-22}',
      'function cmMoveLeverOffset(radius){const r=Math.max(30,Math.min(50,Number(radius)||50));return ((50-r)/20)*34-17}'
    );
    src=src.replace('drag.startRadius-dy*.24','drag.startRadius-dy*.32');

    const warningStart=src.indexOf('function cmSafeUpdateNearestWarning(){');
    const warningEnd=warningStart>=0?src.indexOf('function cmSafeRemoveNearestWarning(){',warningStart):-1;
    if(warningStart>=0&&warningEnd>=0){
      const replacement=`function cmSafeUpdateNearestWarning(){
  if(!cmAddMode&&!cmMoveSession){
    if(cmSafeNearestWarning)cmSafeNearestWarning.style.display='none';
    return;
  }
  const c=map.getCenter();
  const excludeId=cmMoveSession?.r?.id;
  const n=cmNearest([c.lat,c.lng],excludeId);
  const m=n&&Number.isFinite(Number(n.distance))?Number(n.distance):null;

  if(cmMoveSession){
    if(cmSafeNearestWarning)cmSafeNearestWarning.style.display='none';
    const t=document.getElementById('cmMoveNearest');
    if(!t)return;
    if(m===null){t.textContent='最短POI --';t.classList.remove('danger','safe');return}
    t.textContent=(m<50?'⚠ ':'✓ ')+'最短POI '+m.toFixed(1)+'m';
    t.classList.toggle('danger',m<50);
    t.classList.toggle('safe',m>=50);
    return;
  }

  const d=cmSafeEnsureNearestWarning();
  if(m===null){d.style.display='none';return}
  d.style.display='block';
  d.classList.toggle('danger',m<50);
  d.classList.toggle('safe',m>=50);
  d.textContent=(m<50?'⚠ ':'✓ ')+'最短POI '+m.toFixed(1)+'m';
}
`;
      src=src.slice(0,warningStart)+replacement+src.slice(warningEnd);
    }

    const style=`<style id="cmV36CompactMoveBarStyle">
      .cm-move-bar{
        width:min(360px,calc(100vw - 18px));
        grid-template-columns:64px 38px minmax(92px,1fr) 74px 20px!important;
        gap:4px!important;
        padding:2px 5px 2px 3px!important;
        border-radius:24px!important;
      }
      .cm-move-lever{width:64px!important;height:70px!important}
      .cm-move-labels{top:2px!important;width:21px!important;height:66px!important;grid-template-rows:repeat(3,22px)!important;font-size:9px!important}
      .cm-move-labels i{line-height:22px!important}
      .cm-move-track{left:39px!important;height:46px!important}
      .cm-move-knob{left:39px!important;width:34px!important;height:34px!important}
      .cm-move-bar strong{font-size:11px!important}
      .cm-move-nearest{font-size:10.5px;font-weight:950;white-space:nowrap;text-align:center;line-height:1.15;color:#6a5a43;overflow:hidden;text-overflow:ellipsis}
      .cm-move-nearest.danger{color:#9a4618}
      .cm-move-nearest.safe{color:#49623f}
      .cm-move-confirm{height:28px!important;font-size:11px!important;padding:0 8px!important}
      .cm-move-cancel{width:20px!important;height:20px!important}
    </style>`;
    if(!src.includes('id="cmV36CompactMoveBarStyle"'))src=src.replace('</head>',style+'</head>');

    return src;
  };
})();
