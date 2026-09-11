(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    // CREATIVE MODE v31: safe center-crosshair POI move mode.
    // Keep record coordinates untouched until the user explicitly confirms.
    const moveStart=src.indexOf('function cmBeginMove(r){');
    const moveEnd=moveStart>=0?src.indexOf('function cmClearPreview',moveStart):-1;
    if(moveStart>=0&&moveEnd>=0){
      const replacement=`let cmMoveCrosshair=null;
function cmMoveCrosshairElement(){
  const d=document.createElement('div');
  d.id='cmMoveCrosshair';
  d.setAttribute('aria-hidden','true');
  d.innerHTML='<span class="cm-move-cross-h"></span><span class="cm-move-cross-v"></span><span class="cm-move-cross-c"></span>';
  Object.assign(d.style,{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:'54px',height:'54px',zIndex:'1445',pointerEvents:'none',display:'none'});
  document.body.appendChild(d);
  return d;
}
function cmShowMoveCrosshair(){
  if(!cmMoveCrosshair||!cmMoveCrosshair.isConnected)cmMoveCrosshair=cmMoveCrosshairElement();
  cmMoveCrosshair.style.display='block';
}
function cmHideMoveCrosshair(){
  if(cmMoveCrosshair)cmMoveCrosshair.style.display='none';
}
function cmPrepareMoveGauge(){
  const g=cmInstallRadiusGauge();
  g.classList.add('cm-move-mode');
  g.style.display='block';
  const confirm=g.querySelector('#cmConfirmPlace');
  const close=g.querySelector('#cmAddModeClose');
  if(confirm){confirm.textContent='移動確定';confirm.setAttribute('aria-label','POIの移動を確定')}
  if(close){close.setAttribute('aria-label','移動をキャンセル');close.title='移動をキャンセル'}
  cmSetGuideRadius(50);
  cmBindRadiusHandle();
  if(!g._cmMoveCapture){
    g._cmMoveCapture=e=>{
      if(!cmMoveSession)return;
      const confirmBtn=e.target.closest?.('#cmConfirmPlace');
      const closeBtn=e.target.closest?.('#cmAddModeClose');
      if(!confirmBtn&&!closeBtn)return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if(confirmBtn)cmConfirmMove();else cmCancelMove();
    };
    g.addEventListener('click',g._cmMoveCapture,true);
  }
  return g;
}
function cmRestoreMoveGauge(){
  const g=cmRadiusGauge;
  if(!g)return;
  g.classList.remove('cm-move-mode');
  const confirm=g.querySelector('#cmConfirmPlace');
  const close=g.querySelector('#cmAddModeClose');
  if(confirm){confirm.textContent='確定';confirm.setAttribute('aria-label','POIを追加')}
  if(close){close.setAttribute('aria-label','追加を終了');close.removeAttribute('title')}
  g.style.display='none';
}
function cmBeginMove(r){
  if(!r||r.deleted||!cmIsNew(r))return;
  cmCloseSheet();
  cmExitAddMode(false);
  if(cmMoveSession)cmEndMove();

  const old=[Number(r.latlng[0]),Number(r.latlng[1])];
  const originalOpacity=1;
  if(r.marker?.setOpacity)r.marker.setOpacity(0);

  const ghost=L.marker(old,{
    icon:recordIcon(r),
    pane:'placement',
    interactive:false,
    keyboard:false,
    opacity:.34,
    zIndexOffset:2200
  }).addTo(map);
  const ghostEl=ghost.getElement?.();
  if(ghostEl)ghostEl.style.pointerEvents='none';

  const center=map.getCenter();
  const circle=L.circle(center,{
    radius:50,
    color:'#d18a00',
    fillColor:'#d18a00',
    weight:1.5,
    fillOpacity:.025,
    renderer:circleRenderer,
    pane:'distance',
    interactive:false
  }).addTo(map);
  const onMapMove=()=>{
    if(!cmMoveSession||cmMoveSession.r!==r)return;
    circle.setLatLng(map.getCenter());
  };

  cmMoveSession={r,old,ghost,circle,onMapMove,originalOpacity};
  activeTool='move';
  map.on('move',onMapMove);
  cmHidePersistentCrosshair();
  cmShowMoveCrosshair();
  cmPrepareMoveGauge();
  msg('地図を動かして十字を移動先に合わせてください',1800);
}
beginMove=cmBeginMove;
function cmConfirmMove(){
  if(!cmMoveSession)return;
  const {r,old}=cmMoveSession;
  const center=map.getCenter();
  const to=[center.lat,center.lng];
  cmEndMove();
  r.latlng=to;
  pushHistory({type:'move',id:r.id,from:old,to});
  drawAll();
  snapshot();
  cmPersistCurrent();
  msg('POIを移動しました',1400);
}
function cmEndMove(){
  if(!cmMoveSession){cmHideMoveCrosshair();cmRestoreMoveGauge();return}
  const {r,ghost,circle,onMapMove,originalOpacity}=cmMoveSession;
  try{map.off('move',onMapMove)}catch{}
  try{if(ghost)map.removeLayer(ghost)}catch{}
  try{if(circle)map.removeLayer(circle)}catch{}
  if(r?.marker?.setOpacity)r.marker.setOpacity(originalOpacity??1);
  cmMoveSession=null;
  if(activeTool==='move')activeTool='';
  cmHideMoveCrosshair();
  cmRestoreMoveGauge();
}
function cmCancelMove(){
  if(!cmMoveSession)return;
  cmEndMove();
  msg('位置調整をキャンセルしました',1200);
}
`;
      src=src.slice(0,moveStart)+replacement+src.slice(moveEnd);
    }

    // While moving, marker taps and map taps are inert. Only panning/zooming moves the target.
    src=src.replace('function cmOpenRecord(r){cmCloseSheet();','function cmOpenRecord(r){if(cmMoveSession)return;cmCloseSheet();');
    src=src.replace('function cmMapClick(e){if(Date.now()<cmRadiusGestureUntil)return;','function cmMapClick(e){if(cmMoveSession)return;if(Date.now()<cmRadiusGestureUntil)return;');

    // Reuse the add-mode 30/40/50m lever in move mode, including iOS Safari gesture locking.
    const bindStart=src.indexOf('function cmBindRadiusHandle(){');
    const installStart=bindStart>=0?src.indexOf('function cmInstallUi(){',bindStart):-1;
    if(bindStart>=0&&installStart>=0){
      const replacement=`function cmBindRadiusHandle(){
  const handle=document.getElementById('cmRadiusHandle');
  if(!handle)return;
  cmSetLeverVisual(cmGuideRadius);
  if(handle.dataset.radiusHandleReady==='31')return;
  handle.dataset.radiusHandleReady='31';
  handle.style.touchAction='none';
  handle.style.userSelect='none';
  handle.style.webkitUserSelect='none';

  let drag=null;
  let lastStep=null;
  let pageLock=null;
  let mapLock=null;

  const block=(e,ms=900)=>{
    if(e&&e.cancelable)e.preventDefault();
    if(e)e.stopPropagation();
    cmBlockPlacementForRadius(ms);
  };

  const lockSurface=()=>{
    if(pageLock)return;
    const de=document.documentElement,b=document.body;
    pageLock={
      deOverflow:de.style.overflow,
      deOverscroll:de.style.overscrollBehavior,
      bOverflow:b.style.overflow,
      bOverscroll:b.style.overscrollBehavior,
      bTouchAction:b.style.touchAction
    };
    de.style.overflow='hidden';
    de.style.overscrollBehavior='none';
    b.style.overflow='hidden';
    b.style.overscrollBehavior='none';
    b.style.touchAction='none';

    mapLock={
      dragging:!!map.dragging?.enabled?.(),
      touchZoom:!!map.touchZoom?.enabled?.(),
      doubleClickZoom:!!map.doubleClickZoom?.enabled?.()
    };
    try{map.dragging?.disable?.()}catch{}
    try{map.touchZoom?.disable?.()}catch{}
    try{map.doubleClickZoom?.disable?.()}catch{}
  };

  const unlockSurface=()=>{
    if(pageLock){
      const de=document.documentElement,b=document.body;
      de.style.overflow=pageLock.deOverflow;
      de.style.overscrollBehavior=pageLock.deOverscroll;
      b.style.overflow=pageLock.bOverflow;
      b.style.overscrollBehavior=pageLock.bOverscroll;
      b.style.touchAction=pageLock.bTouchAction;
      pageLock=null;
    }
    if(mapLock){
      try{if(mapLock.dragging)map.dragging?.enable?.()}catch{}
      try{if(mapLock.touchZoom)map.touchZoom?.enable?.()}catch{}
      try{if(mapLock.doubleClickZoom)map.doubleClickZoom?.enable?.()}catch{}
      mapLock=null;
    }
  };

  const applyLive=radius=>{
    cmApplyGuideRadiusLive(radius);
    if(cmMoveSession?.circle)cmMoveSession.circle.setRadius(radius);
  };
  const applySnap=radius=>{
    cmSetGuideRadius(radius);
    if(cmMoveSession?.circle)cmMoveSession.circle.setRadius(radius);
  };

  const begin=(id,y,e)=>{
    if(!cmAddMode&&!cmMoveSession)return false;
    block(e,1400);
    lockSurface();
    drag={id,startY:y,startRadius:cmGuideRadius,current:cmGuideRadius};
    lastStep=Math.round(cmGuideRadius/10)*10;
    handle.classList.add('dragging');
    cmSetLeverVisual(cmGuideRadius);
    return true;
  };

  const move=(y,e)=>{
    if(!drag)return;
    block(e,1100);
    const dy=y-drag.startY;
    const next=Math.max(30,Math.min(50,drag.startRadius-dy*.24));
    drag.current=next;
    applyLive(next);
    cmSetLeverVisual(next);
    const step=Math.round(next/10)*10;
    if(step!==lastStep){
      lastStep=step;
      try{navigator.vibrate?.(5)}catch{}
    }
  };

  const finish=e=>{
    if(!drag){unlockSurface();return}
    block(e,900);
    const snap=Math.max(30,Math.min(50,Math.round(drag.current/10)*10));
    drag=null;
    handle.classList.remove('dragging');
    applySnap(snap);
    cmSetLeverVisual(snap);
    const range=cmRadiusGauge?.querySelector('#cmRadiusRange');
    if(range)range.step='10';
    unlockSurface();
  };

  const findTouch=(list,id)=>Array.from(list||[]).find(t=>t.identifier===id);
  handle.addEventListener('touchstart',e=>{
    if(e.touches.length!==1||drag)return;
    const t=e.touches[0];
    begin(t.identifier,t.clientY,e);
  },{passive:false});
  handle.addEventListener('touchmove',e=>{
    if(!drag)return;
    const t=findTouch(e.touches,drag.id);
    if(t)move(t.clientY,e);else block(e);
  },{passive:false});
  handle.addEventListener('touchend',e=>{
    if(!drag)return;
    const t=findTouch(e.changedTouches,drag.id);
    if(t)finish(e);else block(e);
  },{passive:false});
  handle.addEventListener('touchcancel',e=>finish(e),{passive:false});

  handle.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch'||drag)return;
    if(!begin(e.pointerId,e.clientY,e))return;
    try{handle.setPointerCapture(e.pointerId)}catch{}
  });
  handle.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch'||!drag||drag.id!==e.pointerId)return;
    move(e.clientY,e);
  });
  handle.addEventListener('pointerup',e=>{
    if(e.pointerType==='touch'||!drag||drag.id!==e.pointerId)return;
    finish(e);
    try{handle.releasePointerCapture(e.pointerId)}catch{}
  });
  handle.addEventListener('pointercancel',e=>{
    if(e.pointerType==='touch')return;
    finish(e);
  });
  handle.addEventListener('click',e=>block(e,700),true);
}
`;
      src=src.slice(0,bindStart)+replacement+src.slice(installStart);
    }

    const style=`<style id="cmV31MoveStyle">
      #cmMoveCrosshair .cm-move-cross-h,
      #cmMoveCrosshair .cm-move-cross-v{
        position:absolute;
        left:50%;top:50%;
        background:rgba(255,255,255,.97);
        box-shadow:0 0 0 1px rgba(56,45,29,.60),0 1px 4px rgba(0,0,0,.34);
        border-radius:2px;
      }
      #cmMoveCrosshair .cm-move-cross-h{width:46px;height:3px;transform:translate(-50%,-50%)}
      #cmMoveCrosshair .cm-move-cross-v{width:3px;height:46px;transform:translate(-50%,-50%)}
      #cmMoveCrosshair .cm-move-cross-c{
        position:absolute;left:50%;top:50%;width:8px;height:8px;
        transform:translate(-50%,-50%);border-radius:50%;
        background:#d8b766;border:2px solid #fff;
        box-shadow:0 1px 4px rgba(0,0,0,.35);
      }
      .cm-radius-gauge.cm-move-mode .cm-radius-gauge-head.cm-radius-gauge-compact{
        grid-template-columns:40px 74px 16px!important;
      }
      .cm-radius-gauge.cm-move-mode .cm-confirm-place{
        padding:0 8px!important;
        white-space:nowrap!important;
      }
    </style>`;
    if(!src.includes('id="cmV31MoveStyle"'))src=src.replace('</head>',style+'</head>');

    return src;
  };
})();
