import"./shared-K6BBGCQE.js";import{e as N,g as q}from"./shared-J3X76UIW.js";import{a}from"./shared-AFROVTVC.js";var c=q(window.__RED_MOTION_CONFIG__||N),p=null,L=null,E=null,F=null,w=null,b=null,R=0,D=0,W=null,_=0,y=0,x=0,h=null,P=new WeakMap,S=new WeakMap,g=new Map,Y=["#app main p","#app main li","#app main figcaption","#app .resume-project-body","#app .resume-sidebar-body","#app .resume-education-program","#app .resume-project-head p","#app .resume-project-head time","#app .detail-heading p","#app .detail-heading span","#app .framer-derived-year","#app .framer-derived-category","#app .framer-case-year","#app .framer-case-category","#app .body-copy-en","#app .body-copy-zh"].join(","),G=[".nav-detail",".site-header",".dither-lab",".project-lightbox",".project-meta",".footer-gallery-meta","[data-typewriter-skip]"].join(","),ae=["#app .project-meta[data-typewriter-body]","#app .footer-gallery-meta[data-typewriter-body]"].join(","),ie=["active-color-snow-canvas","active-color-placeholder-canvas","dither-preview-canvas","dither-reveal-canvas","dither-resize-snow-canvas","dither-hover-return-snow-canvas","binary-pixel-handoff-canvas"];function M(){return new URLSearchParams(window.location.search).has("figma-state")||window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches}a(M,"prefersReducedMotion");function oe(){if(document.querySelector("#typewriter-runtime-styles"))return;let e=document.createElement("style");e.id="typewriter-runtime-styles",e.textContent=`
    @keyframes typewriter-caret-blink {
      0%, 46% { opacity: 1; }
      47%, 100% { opacity: 0; }
    }

    .nav-detail[data-typewriter-nav="true"] {
      max-height: 24px !important;
      max-width: min(360px, calc(100vw - 32px)) !important;
      overflow: visible !important;
      visibility: hidden !important;
      opacity: 1 !important;
      clip-path: none !important;
      transform: none !important;
      transition: none !important;
      will-change: auto !important;
    }

    .nav-detail[data-typewriter-nav="true"].is-typewriter-visible {
      visibility: visible !important;
    }

    body[data-nav-density="full"] .nav-detail[data-typewriter-nav="true"] {
      max-width: min(260px, calc(100vw - var(--header-pad) * 2 - var(--logo-width) - 80px)) !important;
      max-height: 18px !important;
      margin-top: 1px;
      transform: none !important;
    }

    body[data-header-compact="true"] .nav-detail[data-typewriter-nav="true"] {
      max-width: min(260px, calc(100vw - 32px)) !important;
      max-height: 18px !important;
      margin-top: 0;
    }

    .nav-detail[data-typewriter-nav="true"].is-typewriter-editing::after,
    [data-typewriter-body="typing"]::after {
      content: "";
      display: inline-block;
      width: var(--tw-caret-width, 1px);
      height: 0.92em;
      margin-left: 0.08em;
      vertical-align: -0.08em;
      background: currentColor;
      animation: typewriter-caret-blink var(--tw-caret-blink, 520ms) steps(1, end) infinite;
      pointer-events: none;
    }

    .nav-item {
      --nav-typewriter-push-x: 0px;
      translate: var(--nav-typewriter-push-x) 0;
      will-change: transform, translate;
    }

    [data-typewriter-body] {
      position: relative;
    }

    [data-typewriter-body="observing"] {
      visibility: hidden;
    }

    [data-typewriter-body="typing"],
    [data-typewriter-body="done"] {
      visibility: visible;
    }

    @media (prefers-reduced-motion: reduce) {
      .nav-detail[data-typewriter-nav="true"].is-typewriter-editing::after,
      [data-typewriter-body="typing"]::after {
        animation: none;
        opacity: 0;
      }
    }
  `,document.head.append(e)}a(oe,"ensureStyles");function X(){document.documentElement.style.setProperty("--tw-caret-blink",`${c.caretBlinkMs}ms`),document.documentElement.style.setProperty("--tw-caret-width",`${c.caretWidthPx}px`)}a(X,"applyMotionCssVariables");function se(){return document.querySelector(".catalog")?.dataset.activeFilter||null}a(se,"getCatalogFilter");function Z(){return se()||w||b}a(Z,"getEffectiveNavCategory");function z(e){let t=e.dataset.typewriterText||e.textContent||"";e.dataset.typewriterText=t,e.dataset.typewriterNav="true",e.textContent="";let n={detail:e,text:t,count:0,target:0,accumulator:0,lastTime:0,frame:0};return S.set(e,n),n}a(z,"createNavState");function I(e){let t=e.text.slice(0,e.count);e.detail.textContent!==t&&(e.detail.textContent=t);let n=e.count!==e.target,r=e.count>0||n||e.target>0;e.detail.classList.toggle("is-typewriter-visible",r),e.detail.classList.toggle("is-typewriter-editing",n),v()}a(I,"renderNavState");function J(e,t){e.frame=0,e.lastTime||(e.lastTime=t);let n=Math.min(80,t-e.lastTime);e.lastTime=t,e.accumulator+=n;let r=e.target>e.count,i=Math.max(1,r?c.navTypeMs:c.navDeleteMs),s=!1;for(;e.count!==e.target&&e.accumulator>=i;)e.accumulator-=i,e.count+=r?1:-1,s=!0;if(s&&I(e),e.count!==e.target){e.frame=requestAnimationFrame(o=>J(e,o));return}e.accumulator=0,e.lastTime=0,I(e)}a(J,"animateNavState");function ce(e,t){let n=S.get(e)||z(e),r=t?n.text.length:0;n.target!==r&&(n.target=r,n.accumulator=0,n.lastTime=0,I(n),n.frame||(n.frame=requestAnimationFrame(i=>J(n,i))))}a(ce,"setNavTarget");function m(){let e=document.querySelector(".nav-list");if(!e)return;let t=Z();e.querySelectorAll(".nav-item[data-nav-category]").forEach(n=>{let r=n.querySelector(".nav-detail");r&&(S.has(r)||z(r),ce(r,n.dataset.navCategory===t))}),v()}a(m,"refreshNavTargets");function le(){for(let[e]of g)e.isConnected||g.delete(e)}a(le,"clearDetachedPushStates");function j(e){let t=g.get(e);return t||(t={item:e,x:0,velocity:0,target:0},g.set(e,t)),t}a(j,"getPushState");function A(){y||(y=requestAnimationFrame(K))}a(A,"requestNavPushFrame");function de(e){if(!e?.isConnected)return!1;let t=document.body.dataset.navDensity||"",n=document.body.dataset.headerCompact==="true";if(t==="full"||n&&(t==="mobile"||t==="tiny"||t==="titles")||(t==="mobile"||t==="tiny")&&!n)return!1;let r=getComputedStyle(e).flexDirection;return r!=="column"&&r!=="column-reverse"}a(de,"navUsesHorizontalPush");function ue(e=[]){y&&cancelAnimationFrame(y),y=0,x=0,e.forEach(t=>{let n=j(t);n.x=0,n.velocity=0,n.target=0,t.style.setProperty("--nav-typewriter-push-x","0px")})}a(ue,"clearAllPushOffsets");function fe(){_=0;let e=document.querySelector(".nav-list");if(!e)return;let t=[...e.querySelectorAll(".nav-item[data-nav-category]")];if(le(),t.forEach(f=>{j(f).target=0}),M()||!de(e)||t.length<2){ue(t);return}let n=Z(),r=t.findIndex(f=>f.dataset.navCategory===n);if(r<=0){A();return}let s=t[r].querySelector(".nav-detail"),o=s?S.get(s):null;if(!s||!o||o.count<=0){A();return}let d=s.getBoundingClientRect(),l=e.getBoundingClientRect();if(d.width<=1||l.width<=1){A();return}let u=d.left-c.navPushGapPx;for(let f=r-1;f>=0;f-=1){let C=t[f],O=j(C),$=C.getBoundingClientRect(),U=$.left-O.x,ne=$.right-O.x,T=Math.min(0,u-ne),re=l.left-U;T=Math.max(T,re),O.target=T,u=U+T-c.navPushGapPx}A()}a(fe,"measureNavPushTargets");function v(){_||(_=requestAnimationFrame(fe))}a(v,"scheduleNavPushMeasure");function K(e){y=0;let t=x?Math.min(.034,(e-x)/1e3):1/60;x=e;let n=!1,r=Math.max(1,c.navSpringStiffness),i=Math.max(0,c.navSpringDamping),s=Math.max(.1,c.navSpringMass);for(let o of g.values())if(o.item.isConnected){if(M())o.x=o.target,o.velocity=0;else{let d=o.x-o.target,l=(-r*d-i*o.velocity)/s;o.velocity+=l*t,o.x+=o.velocity*t,Math.abs(o.x-o.target)<.08&&Math.abs(o.velocity)<1.2?(o.x=o.target,o.velocity=0):n=!0}o.item.style.setProperty("--nav-typewriter-push-x",`${o.x.toFixed(2)}px`)}n?y=requestAnimationFrame(K):x=0}a(K,"animateNavPush");function Q(){let e=document.querySelector(".nav-list");if(e){if(W!==e&&(h?.disconnect(),h=null,W=e,w=null,b=null,g.clear()),e.dataset.typewriterBound==="true"&&h){m();return}e.dataset.typewriterBound="true",e.querySelectorAll(".nav-item[data-nav-category]").forEach(t=>{let n=t.querySelector(".nav-detail");n&&!S.has(n)&&z(n),t.addEventListener("pointerenter",()=>{w=t.dataset.navCategory||null,m()}),t.addEventListener("pointerleave",()=>{w===t.dataset.navCategory&&(w=null),m()}),t.addEventListener("focusin",()=>{b=t.dataset.navCategory||null,m()}),t.addEventListener("focusout",()=>{b===t.dataset.navCategory&&(b=null),m()})}),"ResizeObserver"in window&&(h=new ResizeObserver(v),h.observe(e)),m()}}a(Q,"bindNav");function k(){E?.disconnect(),E=null;let e=document.querySelector(".catalog");!e||!("MutationObserver"in window)||(E=new MutationObserver(t=>{t.some(n=>n.attributeName==="data-active-filter")&&m()}),E.observe(e,{attributes:!0,attributeFilter:["data-active-filter"]}))}a(k,"bindCatalogObserver");function pe(){F?.disconnect(),"MutationObserver"in window&&(F=new MutationObserver(e=>{e.some(t=>t.attributeName==="data-nav-density"||t.attributeName==="data-header-compact")&&v()}),F.observe(document.body,{attributes:!0,attributeFilter:["data-nav-density","data-header-compact"]}))}a(pe,"bindBodyAttributeObserver");function me(e){let t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),n=[],r=0;for(;t.nextNode();){let i=t.currentNode,s=i.nodeValue||"";s&&(/^\s+$/.test(s)&&s.includes(`
`)||(n.push({node:i,text:s,start:r,end:r+s.length}),r+=s.length))}return{records:n,total:r}}a(me,"collectTypingTextNodes");function ye(e){let t=new Set,n=null,r=null;try{r=document.createRange();for(let i of e){let s=i.text,o=/\S+\s*/g,d;for(;d=o.exec(s);){let l=d.index,u=Math.min(s.length,d.index+d[0].length);r.setStart(i.node,l),r.setEnd(i.node,u);let f=r.getClientRects();if(!f.length)continue;let C=f[0].top;n!==null&&Math.abs(C-n)>2&&t.add(i.start+l),n=f[f.length-1].top}}}catch{return t}finally{r?.detach?.()}return t}a(ye,"measureLineStarts");function ve(e){return/[.!?。！？;；:：]/.test(e)?c.bodyPunctuationPauseMs:/[,，、]/.test(e)?c.bodyCommaPauseMs:/\s/.test(e)?c.bodyCharMs*c.bodySpaceFactor:c.bodyCharMs}a(ve,"charDuration");function ge(e,t,n){let r=new Array(n);for(let l of e)for(let u=0;u<l.text.length;u+=1)r[l.start+u]=l.text[u];let i=new Float32Array(n+1),s=0;for(let l=0;l<n;l+=1)t.has(l)&&(s+=c.bodyLinePauseMs),s+=ve(r[l]||""),i[l+1]=s;if(!s)return i;let d=Math.min(c.bodyMaxDurationMs,Math.max(c.bodyMinDurationMs,s))/s;if(Math.abs(d-1)>.001)for(let l=1;l<i.length;l+=1)i[l]*=d;return i}a(ge,"buildTimeline");function B(e,t){if(e.visibleCount!==t){e.visibleCount=t;for(let n of e.records){let r="";t>=n.end?r=n.text:t>n.start&&(r=n.text.slice(0,t-n.start)),n.node.nodeValue!==r&&(n.node.nodeValue=r)}}}a(B,"setVisibleCharacterCount");function he(e,t){let n=0,r=e.length-1;for(;n<r;){let i=Math.ceil((n+r)/2);e[i]<=t?n=i:r=i-1}return n}a(he,"findTimelineCount");function we(e){B(e,e.total),e.block.dataset.typewriterBody="done",e.block.style.removeProperty("min-height"),e.block.removeAttribute("aria-busy"),e.frame=0,p?.unobserve(e.block)}a(we,"finishBodyState");function ee(e,t){e.startedAt||(e.startedAt=t);let n=t-e.startedAt,r=he(e.timeline,n);if(B(e,r),r>=e.total){we(e);return}e.frame=requestAnimationFrame(i=>ee(e,i))}a(ee,"animateBodyState");function be(e){if(M())return;let t=P.get(e);if(t?.started||e.dataset.typewriterBody==="done")return;let n=e.getBoundingClientRect();if(n.width<=1||n.height<=1)return;let{records:r,total:i}=me(e);if(!r.length||i<2){e.dataset.typewriterBody="done",p?.unobserve(e);return}let s=ye(r),o=ge(r,s,i),d=t||{block:e,records:r,total:i,timeline:o,visibleCount:-1,started:!1,startedAt:0,frame:0};if(d.records=r,d.total=i,d.timeline=o,d.started=!0,P.set(e,d),e.dataset.typewriterBody="typing",e.setAttribute("aria-busy","true"),!e.hasAttribute("aria-label")){let u=(e.textContent||"").trim();u&&e.setAttribute("aria-label",u)}e.style.minHeight=`${Math.ceil(n.height)}px`,B(d,0);let l=Math.min(c.blockStaggerMs*3,D*c.blockStaggerMs);D=(D+1)%4,window.setTimeout(()=>{e.dataset.typewriterBody==="typing"&&(d.frame=requestAnimationFrame(u=>ee(d,u)))},l)}a(be,"startBodyState");function xe(e){e.filter(n=>n.isIntersecting).sort((n,r)=>n.boundingClientRect.top-r.boundingClientRect.top).forEach(n=>be(n.target))}a(xe,"handleBodyIntersections");function V(){let e=[...document.querySelectorAll('[data-typewriter-body="observing"]')];if(p?.disconnect(),p=null,!("IntersectionObserver"in window)||M()){e.forEach(t=>{t.dataset.typewriterBody="done",t.style.removeProperty("min-height")});return}p=new IntersectionObserver(xe,{root:null,rootMargin:`0px 0px -${c.triggerBottomPct}% 0px`,threshold:c.triggerThreshold}),e.forEach(t=>p.observe(t))}a(V,"configureBodyObserver");function Se(e){return!e.isConnected||e.matches(G)||e.closest(G)||e.dataset.typewriterBody||e.querySelector(Y)?!1:(e.textContent||"").trim().length>=2}a(Se,"shouldTypeBodyBlock");function Me(){document.querySelectorAll(ae).forEach(e=>{let t=P.get(e);t&&(t.frame&&cancelAnimationFrame(t.frame),B(t,t.total),P.delete(e)),e.removeAttribute("data-typewriter-body"),e.removeAttribute("aria-busy"),e.style.removeProperty("min-height"),p?.unobserve(e)})}a(Me,"releaseStaticMetaBlocks");function te(){if(Me(),M()||(p||V(),!p))return;[...document.querySelectorAll(Y)].forEach(t=>{Se(t)&&(t.dataset.typewriterBody="observing",p.observe(t))})}a(te,"scanBodyBlocks");function Ce(){R||(R=requestAnimationFrame(()=>{R=0,Q(),k(),te()}))}a(Ce,"scheduleScan");function Te(e){if(e.type!=="childList")return!1;let t=[...e.addedNodes,...e.removedNodes];return t.length?t.every(n=>n instanceof Element&&ie.some(r=>n.classList.contains(r))):!1}a(Te,"runtimeCanvasMutationOnly");function Ee(){L?.disconnect();let e=document.querySelector("#app");!e||!("MutationObserver"in window)||(L=new MutationObserver(t=>{t.some(n=>n.type==="childList"&&!Te(n))&&Ce()}),L.observe(e,{childList:!0,subtree:!0}))}a(Ee,"bindAppObserver");function Ae(e){let t=c.triggerThreshold,n=c.triggerBottomPct;c=q(e||N),X(),(t!==c.triggerThreshold||n!==c.triggerBottomPct)&&V(),v()}a(Ae,"applyMotionConfig");function H(){oe(),X(),V(),Q(),k(),pe(),te(),Ee(),window.addEventListener("hashchange",()=>{m(),v()}),window.addEventListener("resize",v,{passive:!0}),window.addEventListener("red:motion-config",e=>Ae(e.detail))}a(H,"boot");document.readyState==="loading"?document.addEventListener("DOMContentLoaded",H,{once:!0}):H();
