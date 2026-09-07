const sleep = ms => new Promise(r=>setTimeout(r,ms));
const frame = () => new Promise(requestAnimationFrame);
const result={width:innerWidth,cases:[],errors:[]};
const report=()=>parent.postMessage({drawerAudit:result},location.origin);
const wait=async predicate=>{for(let i=0;i<600;i++){if(predicate())return;await frame()}throw Error('timed out')};
const rect=element=>element.getClientRects()[0];
try {
 await wait(()=>document.querySelector('a[href$="/service-game-ui-2/"]') && !document.querySelector('.catalog[data-filter-phase]'));
 await sleep(1200);
 const card=document.querySelector('a[href$="/service-game-ui-2/"]');
 card.click();
 await wait(()=>card.classList.contains('is-project-preview'));
 await sleep(1100);
 card.click();
 await wait(()=>document.querySelector('.project-detail-drawer[data-drawer-state="settled"]'));
 await sleep(1200);
 const drawer=document.querySelector('.project-detail-drawer');
 document.documentElement.style.scrollBehavior='auto';
 for(const amount of [0,70,180,70,0,260,100,0]) {
  const start=rect(drawer).top+scrollY-card.__detailHeaderOpenHeight-rect(document.querySelector('.site-header')).bottom;
  scrollTo(0,start+amount);
  const frameGaps=[];
  const started=performance.now();
  while(performance.now()-started<550){
   await frame();
   const progress=Number(getComputedStyle(card).getPropertyValue('--project-detail-header-progress'));
   if(progress>0.001 && progress<0.999) frameGaps.push(rect(drawer).top-rect(card).bottom);
  }
  const maxFrameGap=Math.max(0,...frameGaps.map(Math.abs));
  const c=rect(card),d=rect(drawer),header=rect(document.querySelector('.site-header'));
  const progress=Number(getComputedStyle(card).getPropertyValue('--project-detail-header-progress'));
  const gap=d.top-c.bottom;
  result.cases.push({amount,progress,gap,maxFrameGap,card:{top:c.top,bottom:c.bottom,height:c.height},drawerTop:d.top,headerBottom:header.bottom,start:card.__detailHeaderStart,expectedStart:d.top+scrollY-card.__detailHeaderOpenHeight,margin:getComputedStyle(card).marginBottom});
  // Past the compact endpoint article content is expected to scroll behind
  // the sticky header; during the shared edge travel there must be no seam.
  if(maxFrameGap>1) result.errors.push(`scroll ${amount}: transient seam ${maxFrameGap.toFixed(2)}px`);
  if(progress<0.999 && Math.abs(gap)>0.8) result.errors.push(`scroll ${amount}: seam ${gap.toFixed(2)}px`);
  report();
 }
 result.done=true;report();
} catch(error){result.errors.push(error.message);result.done=true;report()}
