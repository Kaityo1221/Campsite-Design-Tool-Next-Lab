(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;
  window.applyCreativePatches=function(src){
    src=previous(src);

    // 詳細パネル自体をさらにコンパクト化
    src=src.replace("width:'min(330px,88vw)'","width:'min(230px,74vw)'");
    src=src.replace("width:'min(270px,82vw)'","width:'min(230px,74vw)'");

    // 操作ボタンは文字幅ベース
    src=src.replace('<button id="applyRadius" type="button" style="width:100%;height:38px;margin-top:7px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900">半径を反映</button>','<button id="applyRadius" type="button" style="display:block;width:max-content;max-width:100%;height:34px;margin:7px auto 0;padding:0 12px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900;font-size:12px">半径を反映</button>');
    src=src.replace('<button id="applyCoordinate" type="button" style="width:100%;height:38px;margin-top:7px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900">座標へ移動</button>','<button id="applyCoordinate" type="button" style="display:block;width:max-content;max-width:100%;height:34px;margin:7px auto 0;padding:0 12px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900;font-size:12px">座標へ移動</button>');
    src=src.replace('<button id="applyCoordinate" type="button" style="display:block;width:auto;height:36px;margin:7px auto 0;padding:0 14px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900">この座標に追加</button>','<button id="applyCoordinate" type="button" style="display:block;width:max-content;max-width:100%;height:34px;margin:7px auto 0;padding:0 12px;border:1px solid #b89a57;border-radius:9px;background:#fff8e6;font-weight:900;font-size:12px">座標へ移動</button>');

    // 座標入力は「移動のみ」。押したら詳細パネルを先に閉じて地図を移動する
    const start="panel.querySelector('#applyCoordinate').onclick=()=>{";
    const end="};add.onclick=()=>{";
    const s=src.indexOf(start),e=s>=0?src.indexOf(end,s):-1;
    if(s>=0&&e>s){
      const replacement="panel.querySelector('#applyCoordinate').onclick=()=>{const raw=panel.querySelector('#coordinateInput').value.trim().replace(/，/g,','),parts=raw.split(',').map(x=>Number(x.trim()));if(parts.length!==2||!Number.isFinite(parts[0])||!Number.isFinite(parts[1])||parts[0]<-90||parts[0]>90||parts[1]<-180||parts[1]>180){msg('座標は「緯度, 経度」で入力してください');return}panel.style.display='none';const ll=[parts[0],parts[1]];map.setView(ll,map.getZoom(),{animate:false});marker.setLatLng(ll);draft.c50.setLatLng(ll);draft.c40.setLatLng(ll);updateNearestHint();msg('入力した座標へ移動しました',1200)";
      src=src.slice(0,s)+replacement+src.slice(e);
    }
    return src;
  };
})();
