import { captureViewportDitherBoundaryField } from "/src/reveal-motion.js?v=20260905-perf1";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const frame = () => new Promise(requestAnimationFrame);
const results = {width:innerWidth,cases:[],errors:[]};
const report = () => parent.postMessage({hoverAudit:results}, location.origin);
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
  const onComplete=e=>{if(e.detail?.card===card){item.completions++;item.handoff=e.detail.handoff;item.phase=e.detail.phase;item.completedAt=performance.now()}};
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
