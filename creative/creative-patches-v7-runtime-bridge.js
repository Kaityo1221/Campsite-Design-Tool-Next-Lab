(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);
    const START='// ===== CREATIVE MODE intuitive UX v6 =====';
    const END='// ===== /CREATIVE MODE intuitive UX v6 =====';
    const a=src.indexOf(START),b=src.indexOf(END,a);
    if(a<0||b<0)return src;
    const end=b+END.length;
    let block=src.slice(a,end);
    // Save menu stays beside the fixed bottom-left floppy icon regardless of handedness.
    block=block.replace('.left-hand .cm-save-menu{left:auto;right:10px}', '.left-hand .cm-save-menu{left:10px;right:auto}');
    src=src.slice(0,a)+src.slice(end);
    const writeNeedle='document.open();document.write(html);document.close();';
    if(!src.includes(writeNeedle))return src;
    const runtimeBridge=`const creativeIntuitiveUx=${JSON.stringify(block)};const creativeBaseEnd='})();\\n</script>';if(html.includes(creativeBaseEnd))html=html.replace(creativeBaseEnd,creativeIntuitiveUx+'\\n})();\\n</script>');else console.warn('Creative intuitive UX injection target missing');`;
    return src.replace(writeNeedle,runtimeBridge+writeNeedle);
  };
})();
