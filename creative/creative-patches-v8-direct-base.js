(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);
    const needle='let html=await res.text();';
    if(!src.includes(needle))return src;
    const direct=`
  // Apply the intuitive UX directly to base-v7 inside the runtime.
  // This avoids transporting executable source through nested document.write calls.
  try{
    const uxRes=await fetch('./creative-patches-v6-intuitive.js?v=20260910-06',{cache:'no-store'});
    if(!uxRes.ok)throw Error('直感UIパッチを取得できません ('+uxRes.status+')');
    const uxCode=await uxRes.text();
    const outerPatch=window.applyCreativePatches;
    window.applyCreativePatches=s=>s;
    Function(uxCode)();
    if(typeof window.applyCreativePatches!=='function')throw Error('直感UIパッチの初期化に失敗しました');
    html=window.applyCreativePatches(html);
    window.applyCreativePatches=outerPatch;
  }catch(e){
    document.body.style.cssText='margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#8c2f28;white-space:pre-wrap';
    document.body.textContent='CREATIVE MODE 読み込みエラー\\n\\n'+(e&&e.stack?e.stack:(e&&e.message?e.message:String(e)));
    return;
  }
`;
    return src.replace(needle,needle+direct);
  };
})();
