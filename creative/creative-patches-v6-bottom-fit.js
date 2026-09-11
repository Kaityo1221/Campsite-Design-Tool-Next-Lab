window.applyCreativeBottomBarFitPatch=function(src){
  const oldBar="Object.assign(bar.style,{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'calc(132px + env(safe-area-inset-bottom))',zIndex:'1450',display:'flex',gap:'7px',alignItems:'center'});";
  const newBar="const saveBox=$('save').getBoundingClientRect(),toolBox=$('toolbox').getBoundingClientRect(),leftHandLayout=document.body.classList.contains('left-hand'),barLeft=(leftHandLayout?toolBox.right:saveBox.right)+6,barRight=window.innerWidth-(leftHandLayout?saveBox.left:toolBox.left)+6;Object.assign(bar.style,{position:'fixed',left:barLeft+'px',right:barRight+'px',transform:'none',bottom:'calc(72px + env(safe-area-inset-bottom))',zIndex:'1450',display:'grid',gridTemplateColumns:'minmax(0,1fr) 44px 40px',gap:'5px',alignItems:'stretch'});";

  const oldAdd="Object.assign(add.style,{minWidth:'164px',height:'52px',padding:'0 16px',border:'2px solid #8a6b31',borderRadius:'15px',background:'#fff8e6',color:'#37270c',fontWeight:'950',fontSize:'16px',boxShadow:'0 5px 16px rgba(0,0,0,.28)'});";
  const newAdd="Object.assign(add.style,{minWidth:'0',width:'100%',height:'52px',padding:'0 5px',border:'2px solid #8a6b31',borderRadius:'15px',background:'#fff8e6',color:'#37270c',fontWeight:'950',fontSize:'clamp(11px,3.4vw,14px)',whiteSpace:'nowrap',boxShadow:'0 5px 16px rgba(0,0,0,.28)'});";

  const oldDetail="Object.assign(detail.style,{height:'42px',padding:'0 10px',border:'1px solid rgba(138,107,49,.65)',borderRadius:'11px',background:'rgba(255,253,247,.9)',color:'#6d5a3c',fontWeight:'800',fontSize:'12px'});";
  const newDetail="Object.assign(detail.style,{width:'44px',height:'52px',padding:'0 2px',border:'1px solid rgba(138,107,49,.65)',borderRadius:'11px',background:'rgba(255,253,247,.9)',color:'#6d5a3c',fontWeight:'800',fontSize:'11px'});";

  const oldClose="Object.assign(close.style,{width:'44px',height:'44px',border:'2px solid #8a6b31',borderRadius:'14px',background:'rgba(255,253,247,.96)',color:'#5d4630',fontWeight:'950',fontSize:'24px'});";
  const newClose="Object.assign(close.style,{width:'40px',height:'52px',border:'2px solid #8a6b31',borderRadius:'14px',background:'rgba(255,253,247,.96)',color:'#5d4630',fontWeight:'950',fontSize:'22px'});";

  const oldPanel="bottom:'calc(190px + env(safe-area-inset-bottom))'";
  const newPanel="bottom:'calc(132px + env(safe-area-inset-bottom))'";

  if(src.includes(oldBar))src=src.replace(oldBar,newBar);
  if(src.includes(oldAdd))src=src.replace(oldAdd,newAdd);
  if(src.includes(oldDetail))src=src.replace(oldDetail,newDetail);
  if(src.includes(oldClose))src=src.replace(oldClose,newClose);
  if(src.includes(oldPanel))src=src.replace(oldPanel,newPanel);
  return src;
};
