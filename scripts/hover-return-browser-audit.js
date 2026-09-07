import { captureViewportDitherBoundaryField } from "/src/reveal-motion.js?v=20260905-perf1";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const frame = () => new Promise(requestAnimationFrame);
const results = {width:innerWidth,cases:[],errors:[]};
const report = () => parent.postMessage({hoverAudit:results}, location.origin);
function compareSurfaces(from, layers) {
 if (!from || !layers[0]) return null;
 const sample = document.createElement('canvas');
 sample.width = from.width; sample.height = from.height;
 const ctx = sample.getContext('2d', {willReadFrequently:true});
 ctx.imageSmoothingEnabled = false;
 for (const layer of layers) if (layer) ctx.drawImage(layer,0,0,sample.width,sample.height);
 const a = from.getContext('2d').getImageData(0,0,from.width,from.height).data;
 const b = ctx.getImageData(0,0,sample.width,sample.height).data;
 let total=0, changed=0;
 for(let i=0;i<a.length;i+=4){const diff=Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]));total+=diff;if(diff>8)changed++;}
 return {mean:total/(a.length/4),changed:changed/(a.length/4)};
}
const delta = field => field ? Math.max(...field.currentStrengths.map((n,i)=>Math.abs(n-field.targetStrengths[i]))) : null;
const waitUntil = async predicate => {for(let i=0;i<600;i++){if(predicate())return;await frame()}throw Error('Timed out waiting for runtime')};
try {
 await waitUntil(()=>document.querySelector('.project-card.is-filter-muted .dither-preview-canvas[data-active="true"]') && !document.querySelector('.catalog[data-filter-phase]'));
 await sleep(1800);
 const card=document.querySelector('.project-card.is-filter-muted');
 document.documentElement.style.scrollBehavior='auto';
 const media=card.querySelector('.project-media');
 const bottom=()=>document.querySelector('.site-header').getBoundingClientRect().bottom;
 scrollTo(0,media.getBoundingClientRect().top+scrollY-bottom()-20);
 await sleep(1400);
 for (const [name,hold,scrollReturn] of [['full-hover',1100,false],['quick-leave',90,false],['reenter-during-return',500,false],['scroll-return',200,true]]) {
  const item={name,completions:0,boundaryMissing:0,replacements:0,peakFieldError:0,samples:[]};
  results.cases.push(item);
  let heldSurface=null;
  let heldAt=0;
  const returnApi=window.__RED_HOVER_BINARY_RETURN__;
  const originalPlay=returnApi.play;
  returnApi.play=(target)=>{
   const snow=target.querySelector('.active-color-snow-canvas');
   const accepted=originalPlay(target);
   if(target===card && accepted){
    heldSurface=target.querySelector('.dither-hover-return-snow-canvas');
    heldAt=performance.now();
    item.reverseToHold=compareSurfaces(heldSurface,[snow]);
   }
   return accepted;
  };
  const observer=new MutationObserver(()=>{
   const held=card.querySelector('.dither-hover-return-snow-canvas');
   if(held && held!==heldSurface){
    heldSurface=held;heldAt=performance.now();
    item.reverseToHold=compareSurfaces(held,[card.querySelector('.active-color-snow-canvas')]);
   }
  });
  observer.observe(card,{childList:true,subtree:true});
  const onComplete=e=>{if(e.detail?.card===card){item.completions++;item.handoff=e.detail.handoff;item.phase=e.detail.phase;item.completedAt=performance.now();item.holdMs=item.completedAt-heldAt;item.holdToCanonical=compareSurfaces(heldSurface,[card.querySelector('.dither-preview-canvas[data-active="true"]'),card.querySelector('.dither-reveal-canvas')])}};
  window.addEventListener('red:hover-binary-return-complete',onComplete);
  // Exercise the same application listeners as pointer input without opening a card.
  card.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse'}));
  card.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse'}));
  await sleep(hold);
  item.entered=card.classList.contains('is-muted-restore-intent');
  if(scrollReturn){scrollTo(0,scrollY+36);await frame();}
  card.dispatchEvent(new PointerEvent('pointerleave',{pointerType:'mouse'}));
  if (name === 'reenter-during-return') {
   await sleep(90);
   card.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse'}));
   card.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse'}));
   await sleep(500);
   card.dispatchEvent(new PointerEvent('pointerleave',{pointerType:'mouse'}));
  }
  let previous=null;
  let previousError=null;
  item.errorIncreases=0;
  const start=performance.now();
  while(performance.now()-start<1800){
   await frame();
   if(!item.completions)continue;
   const canvas=card.querySelector('.dither-reveal-canvas');
   if(!canvas)item.boundaryMissing++;
   if(previous && canvas!==previous)item.replacements++;
   if(canvas)previous=canvas;
   const field=captureViewportDitherBoundaryField(card);
   const error=delta(field);
   if(error!==null){
    item.peakFieldError=Math.max(error,item.peakFieldError);
    if(previousError!==null && error>previousError+0.005)item.errorIncreases++;
    previousError=error;
    item.finalFieldError=error;
   }
   if(item.samples.length<5)item.samples.push({at:Math.round(performance.now()-item.completedAt),error,hasBoundary:!!canvas,returnClass:card.classList.contains('is-muted-restore-return')});
  }
  window.removeEventListener('red:hover-binary-return-complete',onComplete);
  observer.disconnect();
  returnApi.play=originalPlay;
  delete item.completedAt;
  if (!item.entered) results.errors.push(`${name}: hover did not start`);
  if (item.completions !== 1) results.errors.push(`${name}: ${item.completions} handoffs`);
  if (item.boundaryMissing || item.replacements) results.errors.push(`${name}: boundary owner lost`);
  if (item.errorIncreases) results.errors.push(`${name}: edge field regressed after handoff`);
  if (item.finalFieldError > 0.01) results.errors.push(`${name}: edge field did not settle`);
  if (!scrollReturn && item.peakFieldError > 0.01) results.errors.push(`${name}: stationary field restarted`);
  report();
  await sleep(350);
 }
 results.done=true; report();
}catch(e){results.errors.push(e.message);results.done=true;report()}
