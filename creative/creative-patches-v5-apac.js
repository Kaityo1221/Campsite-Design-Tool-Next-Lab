(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    // Campsite Design Tool旧CREATIVE MODEから、安全な設計支援だけを移植する。
    // NEXT LAB側の編集UI・座標入力・カスタム円・ポリゴン等は変更しない。
    const helperNeedle='function snapshot(){';
    const helpers=`const APAC_MAX_ADDITIONAL=25;
function apacAdditionalRecords(){return records.filter(r=>r&&!r.deleted&&isNew(r.layer))}
function apacIssueSignature(r){if(!r||r.deleted||!isNew(r.layer))return'';const near=nearestRecord(r.latlng,r.id);if(!near||!Number.isFinite(near.distance)||near.distance>=50)return'';return String(near.record?.id||'')+'|'+near.distance.toFixed(1)}
function apacRefreshReviews(){apacAdditionalRecords().forEach(r=>{const sig=apacIssueSignature(r),reason=String(r.applicationComment||'').trim();if(!sig){r.applicationCommentNeedsReview=false;return}r.applicationCommentNeedsReview=!reason||String(r.applicationCommentSignature||'')!==sig})}
function ensureApacGuide(){let box=document.getElementById('apacCreativeGuide');if(box)return box;box=document.createElement('div');box.id='apacCreativeGuide';box.style.cssText='margin-top:10px;padding:9px;border:1px solid rgba(240,204,123,.55);border-radius:12px;background:rgba(255,248,230,.10);color:#fff8e8;font-size:10px;line-height:1.55';box.innerHTML='<div style="display:flex;justify-content:space-between;gap:8px;font-weight:900"><span>設計チェック</span><span id="apacCreativeCount">0 / 25</span></div><div style="display:flex;justify-content:space-between;gap:8px;margin-top:4px"><span>50m未満</span><span id="apacCreativeUnder50">0</span></div><div style="display:flex;justify-content:space-between;gap:8px"><span>理由の再確認</span><span id="apacCreativeReview">0</span></div><details style="margin-top:7px"><summary style="cursor:pointer;font-weight:900">APAC設計ガイド</summary><div style="margin-top:6px">・50mを基本とし、50m未満は自動NGにせず要確認として扱います。<br>・ゲームスポットを一箇所へ集中させず、公園内を自然に移動できる配置を考えます。<br>・入口や狭い通路への滞留、本来の利用者と衝突しやすいスポーツ施設中央への集中を避けます。<br>・活動範囲はミートアップで想定される移動範囲として確認します。<br>・30m / 40mは例外確認の参考表示です。</div></details>';circlePanel.appendChild(box);return box}
function renderApacGuide(){apacRefreshReviews();const box=ensureApacGuide(),adds=apacAdditionalRecords(),under=adds.filter(r=>!!apacIssueSignature(r)),review=under.filter(r=>r.applicationCommentNeedsReview);const c=box.querySelector('#apacCreativeCount'),u=box.querySelector('#apacCreativeUnder50'),v=box.querySelector('#apacCreativeReview');if(c){c.textContent=adds.length+' / '+APAC_MAX_ADDITIONAL;c.style.color=adds.length>APAC_MAX_ADDITIONAL?'#ffb4a8':'#fff8e8'}if(u)u.textContent=String(under.length);if(v){v.textContent=String(review.length);v.style.color=review.length?'#ffd27d':'#bde3b9'}}
`;
    if(src.includes(helperNeedle))src=src.replace(helperNeedle,helpers+helperNeedle);

    // 追加ゲームスポットは3種合計25件まで。読み込み済みデータは壊さず、新規追加だけを止める。
    const addNeedle="if(helperRadius!==50)r.customRadius=helperRadius;records.push(r);drawRecord(r);";
    const addReplacement="if(helperRadius!==50)r.customRadius=helperRadius;if(isNew(r.layer)&&apacAdditionalRecords().length>=APAC_MAX_ADDITIONAL){msg('追加ゲームスポットは最大25個です',1800);renderApacGuide();return}records.push(r);drawRecord(r);";
    if(src.includes(addNeedle))src=src.replace(addNeedle,addReplacement);

    // 旧追加フローが残っている場合にも同じ上限を適用する。
    const legacyAddNeedle="const r={id:crypto.randomUUID?.()||String(Date.now()),layer:activeLayer,latlng:[ll.lat,ll.lng],title:layerDefs.find(x=>x[0]===activeLayer)?.[1]||'新規スポット',memo:'',deleted:false};records.push(r);drawRecord(r);";
    const legacyAddReplacement="const r={id:crypto.randomUUID?.()||String(Date.now()),layer:activeLayer,latlng:[ll.lat,ll.lng],title:layerDefs.find(x=>x[0]===activeLayer)?.[1]||'新規スポット',memo:'',deleted:false};if(isNew(r.layer)&&apacAdditionalRecords().length>=APAC_MAX_ADDITIONAL){msg('追加ゲームスポットは最大25個です',1800);renderApacGuide();return}records.push(r);drawRecord(r);";
    src=src.split(legacyAddNeedle).join(legacyAddReplacement);

    // コメントを編集した時点の距離条件を記録する。位置や周辺条件が変われば再確認扱いに戻す。
    const commentNeedle="ft.oninput=()=>{r.applicationComment=ft.value.slice(0,300);if(ct)ct.textContent=r.applicationComment.length+' / 300';snapshot()}";
    const commentReplacement="ft.oninput=()=>{r.applicationComment=ft.value.slice(0,300);r.applicationCommentSignature=apacIssueSignature(r);r.applicationCommentNeedsReview=false;if(ct)ct.textContent=r.applicationComment.length+' / 300';snapshot();renderApacGuide()}";
    if(src.includes(commentNeedle))src=src.replace(commentNeedle,commentReplacement);

    // POI位置確定後、50m未満条件が変わっていれば理由を再確認する。
    const moveNeedle="clearDraft();r.latlng=to;pushHistory({type:'move',id:r.id,from:old,to});drawAll();snapshot();msg('位置を調整しました')";
    const moveReplacement="const oldSig=apacIssueSignature(r);clearDraft();r.latlng=to;const newSig=apacIssueSignature(r);if(isNew(r.layer)&&String(r.applicationComment||'').trim()&&oldSig!==newSig)r.applicationCommentNeedsReview=true;pushHistory({type:'move',id:r.id,from:old,to});drawAll();snapshot();renderApacGuide();msg(r.applicationCommentNeedsReview?'位置を調整しました。50m未満の理由を再確認してください':'位置を調整しました',1800)";
    if(src.includes(moveNeedle))src=src.replace(moveNeedle,moveReplacement);

    // エディタ開始時・再描画時に設計チェックを同期する。
    const beginNeedle="function beginEditor(){entry.classList.add('hidden');setTimeout(()=>map.invalidateSize(),50)}";
    const beginReplacement="function beginEditor(){entry.classList.add('hidden');ensureApacGuide();renderApacGuide();setTimeout(()=>map.invalidateSize(),50)}";
    if(src.includes(beginNeedle))src=src.replace(beginNeedle,beginReplacement);

    const drawNeedle="function drawAll(){layerDefs.forEach(([k])=>groups[k].clearLayers());polygonGroup.clearLayers();records.forEach(drawRecord);polygons.forEach(p=>{if(!p.deleted)p.layerObj=L.polygon(p.points,{pane:'polygon',color:'#5a8b5f',weight:3,fillColor:'#6ea979',fillOpacity:.09,interactive:false}).addTo(polygonGroup)});if(polygonVisible){if(!map.hasLayer(polygonGroup))polygonGroup.addTo(map)}else if(map.hasLayer(polygonGroup))map.removeLayer(polygonGroup);renderRecordCircles()}";
    const drawReplacement=drawNeedle.slice(0,-1)+";renderApacGuide()}";
    if(src.includes(drawNeedle))src=src.replace(drawNeedle,drawReplacement);

    return src;
  };
})();
