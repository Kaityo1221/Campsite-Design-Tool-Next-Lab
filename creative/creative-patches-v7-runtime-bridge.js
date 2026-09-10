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

    // Safari/HTML parser safety:
    // The v6 block itself contains strings such as </script>. If JSON.stringify(block) is
    // embedded verbatim into the runtime <script>, HTML parsing terminates early even though
    // the sequence is inside a JavaScript string. Encode every '<' before embedding so the
    // generated runtime source never contains a raw closing-script sequence.
    const safeBlockJson=JSON.stringify(block).replace(/</g,'\\u003c');
    const runtimeBridge=`const creativeIntuitiveUx=${safeBlockJson};const creativeBaseEnd='})();\\n<\\/script>';if(html.includes(creativeBaseEnd))html=html.replace(creativeBaseEnd,creativeIntuitiveUx+'\\n})();\\n<\\/script>');else console.warn('Creative intuitive UX injection target missing');`;
    return src.replace(writeNeedle,runtimeBridge+writeNeedle);
  };
})();
