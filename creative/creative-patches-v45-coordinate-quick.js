(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    const style=`<style id="cmV45CoordinateQuickStyle">
      #cmCoordinateQuickToggle{position:fixed;left:50%;bottom:calc(190px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:1585;height:30px;padding:0 13px;border:1px solid rgba(138,107,49,.34);border-radius:999px;background:rgba(255,253,247,.92);color:#4f3d26;font-size:11px;font-weight:950;box-shadow:0 2px 8px rgba(0,0,0,.12);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px)}
      #cmCoordinateQuickToggle.active{background:#f3d77f;color:#37270c}
      #cmCoordinateQuickPanel{position:fixed;left:50%;bottom:calc(228px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:1595;width:min(330px,calc(100vw - 24px));padding:10px;border:1px solid rgba(138,107,49,.30);border-radius:15px;background:rgba(48,40,29,.96);color:#fff8e8;box-shadow:0 8px 24px rgba(0,0,0,.28);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
      #cmCoordinateQuickPanel .cm-coordinate-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;font-size:12px;font-weight:950}
      #cmCoordinateQuickPanel .cm-coordinate-close{width:28px;height:28px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff8e8;font-size:17px;font-weight:900;padding:0}
      #cmCoordinateQuickPanel input{width:100%;height:40px;box-sizing:border-box;border:1px solid #c9b993;border-radius:10px;background:#fffdf7;color:#382d1d;padding:0 10px;font-size:14px}
      #cmCoordinateQuickPanel .cm-coordinate-actions{display:grid;grid-template-columns:1fr auto;gap:7px;margin-top:7px}
      #cmCoordinateQuickPanel .cm-coordinate-apply,#cmCoordinateQuickPanel .cm-coordinate-clear{height:38px;border:1px solid #b89a57;border-radius:10px;font-weight:950}
      #cmCoordinateQuickPanel .cm-coordinate-apply{background:#fff8e6;color:#37270c}
      #cmCoordinateQuickPanel .cm-coordinate-clear{background:rgba(255,255,255,.08);color:#fff8e8;padding:0 11px}
      #cmCoordinateQuickPanel .cm-coordinate-note{margin-top:6px;font-size:10px;line-height:1.35;color:rgba(255,248,232,.72)}
    </style>`;
    if(!src.includes('id="cmV45CoordinateQuickStyle"'))src=src.replace('</head>',style+'</head>');

    const runtime=`<script>(()=>{
      if(window.__cmV45CoordinateInstalled)return;
      window.__cmV45CoordinateInstalled=true;
      let toggle=null,panel=null,input=null;
      const placementActive=()=>!!(document.getElementById('cmSafeAddBar')||document.getElementById('cmMoveBar'));
      const hidePanel=()=>{if(panel)panel.style.display='none';if(toggle)toggle.classList.remove('active')};
      const removeUi=()=>{if(toggle?.isConnected)toggle.remove();if(panel?.isConnected)panel.remove();toggle=null;panel=null;input=null};
      const parseCoordinate=value=>{
        const raw=String(value||'').normalize('NFKC').replace(/，/g,',').trim();
        const parts=raw.split(',').map(x=>Number(x.trim()));
        if(parts.length!==2||!Number.isFinite(parts[0])||!Number.isFinite(parts[1]))return null;
        if(parts[0]<-90||parts[0]>90||parts[1]<-180||parts[1]>180)return null;
        return [parts[0],parts[1]];
      };
      const applyCoordinate=()=>{
        const ll=parseCoordinate(input?.value);
        if(!ll){try{msg('座標は「緯度, 経度」で入力してください',1600)}catch{}return}
        try{
          map.setView(ll,map.getZoom(),{animate:false});
          if(typeof cmSafeUpdateNearestWarning==='function')cmSafeUpdateNearestWarning();
          hidePanel();
          try{msg('入力した座標へ移動しました',1200)}catch{}
        }catch(e){try{msg('座標へ移動できませんでした',1600)}catch{}}
      };
      const ensurePanel=()=>{
        if(panel?.isConnected)return panel;
        panel=document.createElement('div');panel.id='cmCoordinateQuickPanel';panel.style.display='none';
        panel.innerHTML='<div class="cm-coordinate-head"><span>📍 座標入力</span><button class="cm-coordinate-close" type="button" aria-label="閉じる">×</button></div><input id="cmCoordinateQuickInput" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="35.681236, 139.767125"><div class="cm-coordinate-actions"><button class="cm-coordinate-apply" type="button">座標へ移動</button><button class="cm-coordinate-clear" type="button">クリア</button></div><div class="cm-coordinate-note">Wayfarerなどでコピーした「緯度, 経度」を貼り付けできます。</div>';
        document.body.appendChild(panel);input=panel.querySelector('#cmCoordinateQuickInput');
        panel.querySelector('.cm-coordinate-close').onclick=hidePanel;
        panel.querySelector('.cm-coordinate-apply').onclick=applyCoordinate;
        panel.querySelector('.cm-coordinate-clear').onclick=()=>{input.value='';input.focus()};
        input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyCoordinate()}});
        return panel;
      };
      const ensureToggle=()=>{
        if(toggle?.isConnected)return;
        toggle=document.createElement('button');toggle.id='cmCoordinateQuickToggle';toggle.type='button';toggle.textContent='📍 座標';
        document.body.appendChild(toggle);
        toggle.onclick=()=>{const p=ensurePanel(),opening=p.style.display==='none';p.style.display=opening?'block':'none';toggle.classList.toggle('active',opening);if(opening)setTimeout(()=>input?.focus(),50)};
      };
      const sync=()=>{if(placementActive())ensureToggle();else removeUi()};
      new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});
      sync();
    })();<\/script>`;
    if(!src.includes('__cmV45CoordinateInstalled'))src=src.replace('</body>',runtime+'</body>');

    return src;
  };
})();
