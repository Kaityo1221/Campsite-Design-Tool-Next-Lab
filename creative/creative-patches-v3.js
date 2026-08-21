(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;
  window.applyCreativePatches=function(src){
    src=previous(src);

    src=src.replace("width:'min(330px,88vw)'","width:'min(270px,82vw)'");
    src=src.replace('<button id="applyRadius" type="button" style="width:100%;height:38px;margin-top:7px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900">半径を反映</button>','<button id="applyRadius" type="button" style="display:block;width:auto;height:36px;margin:7px auto 0;padding:0 14px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900">半径を反映</button>');
    src=src.replace('<button id="applyCoordinate" type="button" style="width:100%;height:38px;margin-top:7px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900">座標へ移動</button>','<button id="applyCoordinate" type="button" style="display:block;width:auto;height:36px;margin:7px auto 0;padding:0 14px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900">この座標に追加</button>');

    const start="panel.querySelector('#applyCoordinate').onclick=()=>{";
    const end="};add.onclick=()=>{";
    const s=src.indexOf(start),e=s>=0?src.indexOf(end,s):-1;
    if(s>=0&&e>s){
      const replacement="panel.querySelector('#applyCoordinate').onclick=()=>{const raw=panel.querySelector('#coordinateInput').value.trim().replace(/，/g,','),parts=raw.split(',').map(x=>Number(x.trim()));if(parts.length!==2||!Number.isFinite(parts[0])||!Number.isFinite(parts[1])||parts[0]<-90||parts[0]>90||parts[1]<-180||parts[1]>180){msg('座標は「緯度, 経度」で入力してください');return}const r={id:crypto.randomUUID?.()||String(Date.now()),layer:activeLayer,latlng:[parts[0],parts[1]],title:layerDefs.find(x=>x[0]===activeLayer)?.[1]||'新規スポット',memo:'',deleted:false};if(helperRadius!==50)r.customRadius=helperRadius;records.push(r);drawRecord(r);pushHistory({type:'add',id:r.id});renderRecordCircles();snapshot();panel.style.display='none';msg('入力した座標に追加しました',1400)";
      src=src.slice(0,s)+replacement+src.slice(e);
    }
    return src;
  };
})();
