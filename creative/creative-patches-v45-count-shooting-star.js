(()=>{
  const previous=window.applyCreativePatches;
  if(typeof previous!=='function')return;

  window.applyCreativePatches=function(src){
    src=previous(src);

    const installMarker='function cmSafeInstallAddBar(){';
    if(src.includes(installMarker)){
      const helper=`function cmPlayPoiCountTrail(origin){
  const target=document.getElementById('cmCount');
  if(!origin||!target)return;
  const pulse=()=>{
    try{target.animate([
      {transform:'scale(1)',filter:'drop-shadow(0 0 0 rgba(91,220,255,0))'},
      {transform:'scale(1.09)',filter:'drop-shadow(0 0 10px rgba(91,220,255,.95))'},
      {transform:'scale(1)',filter:'drop-shadow(0 0 0 rgba(91,220,255,0))'}
    ],{duration:190,easing:'cubic-bezier(.2,.8,.25,1)'})}catch{}
  };
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){pulse();return}

  const a=origin.getBoundingClientRect(),b=target.getBoundingClientRect();
  const sx=a.left+a.width*.5,sy=a.top+a.height*.42,ex=b.left+b.width*.5,ey=b.top+b.height*.5;
  const side=ex<sx?1:-1;
  const cx=sx+side*Math.min(56,Math.max(28,Math.abs(ex-sx)*.10));
  const cy=(sy+ey)*.5+Math.min(28,Math.max(8,Math.abs(sy-ey)*.025));
  const q=t=>{const u=1-t;return{x:u*u*sx+2*u*t*cx+t*t*ex,y:u*u*sy+2*u*t*cy+t*t*ey}};

  const layer=document.createElement('div');
  layer.style.cssText='position:fixed;inset:0;z-index:4200;pointer-events:none;overflow:hidden';
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('viewBox','0 0 '+window.innerWidth+' '+window.innerHeight);
  svg.style.cssText='position:absolute;inset:0;overflow:visible';
  const path=document.createElementNS(ns,'path');
  path.setAttribute('d','M '+sx+' '+sy+' Q '+cx+' '+cy+' '+ex+' '+ey);
  path.setAttribute('fill','none');path.setAttribute('stroke','rgba(111,229,255,.92)');path.setAttribute('stroke-width','2.4');path.setAttribute('stroke-linecap','round');
  path.style.filter='drop-shadow(0 0 4px rgba(61,211,255,.95)) drop-shadow(0 0 9px rgba(88,220,255,.58))';
  const glow=path.cloneNode(false);glow.setAttribute('stroke','rgba(93,215,255,.32)');glow.setAttribute('stroke-width','7');glow.style.filter='blur(3px)';
  svg.append(glow,path);layer.appendChild(svg);

  const tail=[];
  for(let i=0;i<7;i++){
    const d=document.createElement('i');
    const size=Math.max(2,6-i*.55);
    d.style.cssText='position:absolute;width:'+size+'px;height:'+size+'px;margin-left:'+(-size/2)+'px;margin-top:'+(-size/2)+'px;border-radius:50%;background:rgba(181,246,255,'+(0.92-i*.095)+');box-shadow:0 0 '+(8-i*.55)+'px rgba(74,220,255,.9);will-change:transform,opacity';
    layer.appendChild(d);tail.push(d);
  }
  const star=document.createElement('b');
  star.textContent='✦';
  star.style.cssText='position:absolute;left:0;top:0;color:#fff;font-size:17px;line-height:1;text-shadow:0 0 3px #fff,0 0 8px #6ee8ff,0 0 14px rgba(61,211,255,.95);transform:translate(-50%,-50%);will-change:transform,opacity';
  layer.appendChild(star);document.body.appendChild(layer);

  let len=0;try{len=path.getTotalLength()}catch{}
  if(len>0){path.style.strokeDasharray=String(len);glow.style.strokeDasharray=String(len)}
  const started=performance.now(),duration=320;
  const frame=now=>{
    const p=Math.min(1,(now-started)/duration),t=1-Math.pow(1-p,2.15),head=q(t);
    star.style.transform='translate('+(head.x)+'px,'+(head.y)+'px) translate(-50%,-50%) scale('+(1+.18*Math.sin(Math.PI*p))+')';
    star.style.opacity=String(p<.92?1:Math.max(0,(1-p)/.08));
    tail.forEach((d,i)=>{const tt=Math.max(0,t-i*.032),pt=q(tt),fade=Math.max(0,1-i*.12);d.style.transform='translate('+pt.x+'px,'+pt.y+'px)';d.style.opacity=String(fade*(p<.9?1:(1-p)/.1))});
    if(len>0){const remain=len*(1-t);path.style.strokeDashoffset=String(remain);glow.style.strokeDashoffset=String(remain);const op=p<.82?(.25+.55*p):Math.max(0,(1-p)/.18);path.style.opacity=String(op);glow.style.opacity=String(op*.68)}
    if(p<1)requestAnimationFrame(frame);else{layer.remove();pulse()}
  };
  requestAnimationFrame(frame);
}
`;
      src=src.replace(installMarker,helper+installMarker);
    }

    const confirmNeedle="d.querySelector('#cmSafeAddConfirm').onclick=e=>{e.preventDefault();e.stopPropagation();if(!cmAddMode)return;if(groups[activeLayer]&&!map.hasLayer(groups[activeLayer]))groups[activeLayer].addTo(map);cmPinchUntil=0;const before=records.length;cmPlace(map.getCenter());if(records.length>before){renderLayerPanel();msg('追加しました。続けて配置できます',1200)}cmSafeEnsureAddCircle()};";
    const confirmReplacement="d.querySelector('#cmSafeAddConfirm').onclick=e=>{e.preventDefault();e.stopPropagation();if(!cmAddMode)return;if(groups[activeLayer]&&!map.hasLayer(groups[activeLayer]))groups[activeLayer].addTo(map);cmPinchUntil=0;const before=records.length,origin=e.currentTarget;cmPlace(map.getCenter());if(records.length>before){renderLayerPanel();cmPlayPoiCountTrail(origin);msg('追加しました。続けて配置できます',1200)}cmSafeEnsureAddCircle()};";
    if(src.includes(confirmNeedle))src=src.replace(confirmNeedle,confirmReplacement);

    return src;
  };
})();
