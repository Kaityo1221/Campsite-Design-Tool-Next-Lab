(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);
    const target='https://kaityo1221.github.io/Campsite-Design-Tool-JP/';

    // CREATIVE MODE の「戻る」と、KMZ出力後の「Campsite Design Toolに戻る」は
    // Next Lab の開発ランディングを経由せず、本体メイン画面へ直接戻す。
    src=src.replace(/location\.href\s*=\s*['"]\.\.\/index\.html['"]/g,`location.href='${target}'`);

    return src;
  };
})();
