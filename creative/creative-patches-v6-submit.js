(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;
  window.applyCreativePatches=function(src){
    src=previous(src);
    const injected=`<script>
(()=>{
  const saveButton=document.getElementById('save');
  if(!saveButton)return;
  const originalSave=saveButton.onclick;
  const cleanName=value=>String(value||'campsite').replace(/[\\/:*?"<>|]/g,'_').trim()||'campsite';
  const pad=n=>String(n).padStart(2,'0');
  const makeCheckId=()=>{const d=new Date(),stamp=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'-'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds()),tail=Math.random().toString(36).slice(2,6).toUpperCase();return 'CM-'+stamp+'-'+tail};
  const nearestFor=r=>{let best=null;for(const other of records){if(!other||other.deleted||other.id===r.id)continue;const d=map.distance(r.latlng,other.latlng);if(!best||d<best.distance)best={record:other,distance:d}}return best};
  const typeLabel=r=>{const k=String(r?.layer||'');if(k.includes('gym'))return'Gym';if(k.includes('power'))return'PowerSpot';return'PokéStop'};
  const roleLabel=r=>isNew(r?.layer)?'追加ゲームスポット':'既存ゲームスポット';
  const under50Records=()=>records.filter(r=>r&&!r.deleted&&isNew(r.layer)).map(r=>({r,near:nearestFor(r)})).filter(x=>x.near&&x.near.distance<50);
  const download=(blob,name)=>{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)};
  const buildTxt=(items,checkId,campsiteName)=>{
    const lines=['Campsite Design Tool / CREATIVE MODE','50m未満 但し書き一覧','',
      'キャンプサイト名: '+campsiteName,
      'チェックID: '+checkId,
      '生成日時: '+new Date().toLocaleString('ja-JP'),'',
      '※50m未満は自動的に設置不可・不合格とは判定しません。設計上の理由を確認するための補助情報です。',''];
    items.forEach(({r,near},i)=>{
      lines.push('['+(i+1)+'] '+(r.title||'名称なし'));
      lines.push('座標: '+Number(r.latlng[0]).toFixed(7)+', '+Number(r.latlng[1]).toFixed(7));
      lines.push('最寄り: '+(near.record.title||'名称なし')+' / '+roleLabel(near.record)+' / '+typeLabel(near.record));
      lines.push('距離: '+near.distance.toFixed(1)+'m');
      lines.push('理由: '+String(r.applicationComment||'').trim());
      lines.push('');
    });
    lines.push('フォーム貼り付け用','チェックID: '+checkId);
    return lines.join('\\n');
  };
  saveButton.onclick=async()=>{
    const items=under50Records();
    if(!items.length){return originalSave&&originalSave.call(saveButton)}
    apacRefreshReviews?.();
    const needsReview=items.filter(({r})=>!String(r.applicationComment||'').trim()||r.applicationCommentNeedsReview);
    if(needsReview.length){msg('50m未満の申請時コメントを確認してください',2200);renderApacGuide?.();return}
    const raw=prompt('ファイル名を入力してください',sourceName+'_creative');
    if(raw===null){msg('保存をキャンセルしました');return}
    const campsiteName=cleanName(String(raw).replace(/\\.kmz$/i,''));
    const checkId=makeCheckId();
    try{
      const kml=buildMyMapsKml();
      const kmzZip=new JSZip();
      kmzZip.file('doc.kml',kml);
      const kmzBytes=await kmzZip.generateAsync({type:'uint8array',compression:'DEFLATE'});
      const outer=new JSZip();
      outer.file(campsiteName+'_完成KMZ_'+checkId+'.kmz',kmzBytes);
      outer.file(campsiteName+'_50m未満但し書き_'+checkId+'.txt',buildTxt(items,checkId,campsiteName));
      const blob=await outer.generateAsync({type:'blob',compression:'DEFLATE'});
      download(blob,campsiteName+'_提出用設計データ_'+checkId+'.zip');
      msg('完成KMZと但し書きTXTを書き出しました',2200);
    }catch(e){console.error(e);msg('提出用データの生成に失敗しました',2200)}
  };
})();
<\/script>`;
    return src.replace('</body>',injected+'</body>');
  };
})();
