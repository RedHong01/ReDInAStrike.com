import{a as P}from"./shared-D4KDHR44.js";import{k as A}from"./shared-DS4BD5M4.js";import"./shared-2OL6QP5Y.js";import{a as r}from"./shared-AFROVTVC.js";var V=".gdd-plates",H=".gdd-plate",k="data-plate-halftone",I=6,K=420,y=[],g=0;function L(){return window.__RED_ACTIVE_COLOR_SNOW__||null}r(L,"snow");function B(e){return{includeOffscreen:!0,viewportChecked:!0,reason:e,placeholder:!1}}r(B,"snowOptions");function Q(e){let t=e.querySelector(".project-media > img");return t?.complete&&t.naturalWidth?t:null}r(Q,"plateMediaImage");function Z(e,t){e.dataset.ditherMuted="true",A(e,P);let a=e.querySelector(".dither-preview-canvas");return a?(a.dataset.active="true",e.setAttribute(k,"true"),L()?.play?.(e,"in",Math.min(t,I),void 0,B("transition")),!0):(delete e.dataset.ditherMuted,!1)}r(Z,"holdPlate");function _(e){if(e.removeAttribute(k),delete e.dataset.ditherMuted,!e.isConnected)return;let t=e.querySelector(".dither-preview-canvas");t&&(t.dataset.active="false"),L()?.stopCard?.(e)}r(_,"dropPlate");function F(e){let t=e?.closest?.(V);if(!t)return!1;$({immediate:!0});let a=e.closest(H),l=[...t.querySelectorAll(H)].filter(c=>c!==a&&Q(c)),s=0;for(let c of l)Z(c,s)&&(y.push(c),s+=1);return y.length>0}r(F,"holdPlateField");function $({immediate:e=!1}={}){window.clearTimeout(g),g=0;let t=y;if(y=[],!t.length)return;if(e){t.forEach(_);return}let a=L(),l=0;t.forEach((s,c)=>{if(!s.isConnected)return;a?.play?.(s,"in",Math.min(c,I),void 0,{...B("transition"),mode:"restore"})===!0?l+=1:_(s)}),l&&(g=window.setTimeout(()=>{g=0,t.forEach(_)},K))}r($,"releasePlateField");var W=[".detail-page",".project-detail-drawer"],ee=W.join(", "),te=".gdd-plates",D="project-lightbox-style",i="project-lightbox",d="is-open",S="field",j=440,R=360,G="cubic-bezier(0.22, 1, 0.36, 1)",o=null,v=null,n=null,u=null,m=null,T=null,N="",Y="",x="",C=0,E=0,f=!1,w=!1;function b(e){return W.map(t=>`${t} ${e}`).join(`,
      `)}r(b,"scopedSelector");function M(){return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===!0}r(M,"prefersReducedMotion");function ne(){if(document.getElementById(D))return;let e=document.createElement("style");e.id=D,e.textContent=`
    @media not ((any-hover: hover) and (any-pointer: fine)) {
      ${b('img:not([data-lightbox-disabled="true"])')} {
        cursor: zoom-in;
      }

      ${b("a img")},
      ${b("button img")},
      ${b('[role="button"] img')} {
        cursor: pointer;
      }

      .${i} {
        cursor: zoom-out;
      }

      .${i}__image {
        cursor: default;
      }
    }

    .${i} {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: block;
      overflow: hidden;
      pointer-events: none;
      overscroll-behavior: contain;
      touch-action: none;
    }

    .${i}[hidden] {
      display: none !important;
    }

    .${i}.${d} {
      pointer-events: auto;
    }

    .${i}__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(var(--paper-rgb, 248, 247, 245), 0.965);
      opacity: 0;
      transition: opacity ${j}ms ease;
      will-change: opacity;
    }

    .${i}.${d} .${i}__backdrop {
      opacity: 1;
    }

    /* A filtered field is the backdrop: the page stays visible behind the
       plate, halftoned, instead of being covered by paper. */
    .${i}--${S} .${i}__backdrop {
      background: rgba(var(--paper-rgb, 248, 247, 245), 0.34);
    }

    .${i}__image {
      position: absolute;
      display: block;
      max-width: none;
      max-height: none;
      margin: 0;
      background: transparent;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
      transform-origin: center center;
      will-change: transform;
      backface-visibility: hidden;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.035);
    }

    @media (prefers-reduced-motion: reduce) {
      .${i}__backdrop,
      .${i}__image {
        transition: none !important;
      }
    }
  `,document.head.appendChild(e)}r(ne,"ensureStyles");function oe(){return o?.isConnected||(ne(),o=document.createElement("div"),o.className=i,o.hidden=!0,o.tabIndex=-1,o.setAttribute("role","dialog"),o.setAttribute("aria-modal","true"),o.setAttribute("aria-label","Image preview. Click outside the image or press Escape to close."),v=document.createElement("div"),v.className=`${i}__backdrop`,v.setAttribute("aria-hidden","true"),o.appendChild(v),n=document.createElement("img"),n.className=`${i}__image`,n.alt="",n.decoding="async",n.draggable=!1,o.appendChild(n),o.addEventListener("click",e=>{e.stopPropagation(),e.target!==n&&U()}),n.addEventListener("click",e=>{e.stopPropagation()}),document.body.appendChild(o)),o}r(oe,"ensureOverlay");function q(e,t){let a=Math.max(18,Math.min(window.innerWidth*.03,48)),l=Math.max(18,Math.min(window.innerHeight*.04,48)),s=Math.max(1,window.innerWidth-a*2),c=Math.max(1,window.innerHeight-l*2),h=Math.min(s/Math.max(1,e),c/Math.max(1,t)),p=Math.max(1,e*h),O=Math.max(1,t*h);return{left:(window.innerWidth-p)/2,top:(window.innerHeight-O)/2,width:p,height:O}}r(q,"getPreviewTargetRect");function z(e){n&&(n.style.left=`${e.left}px`,n.style.top=`${e.top}px`,n.style.width=`${e.width}px`,n.style.height=`${e.height}px`)}r(z,"setPreviewRect");function J(e,t){let a=e.left+e.width/2,l=e.top+e.height/2,s=t.left+t.width/2,c=t.top+t.height/2,h=Math.max(1e-4,e.width/Math.max(1,t.width)),p=Math.max(1e-4,e.height/Math.max(1,t.height));return`translate3d(${a-s}px, ${l-c}px, 0) scale(${h}, ${p})`}r(J,"transformBetweenRects");function re(){N=document.documentElement.style.overflow,Y=document.body.style.overflow,document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden"}r(re,"lockArticleScroll");function ie(){document.documentElement.style.overflow=N,document.body.style.overflow=Y}r(ie,"restoreArticleScroll");function ae(e){x=e.style.opacity,e.style.opacity="0"}r(ae,"hideSourceImage");function se(e=u){e instanceof HTMLImageElement&&(e.style.opacity=x,x="")}r(se,"restoreSourceImage");function le(e){let t=oe(),a=e.currentSrc||e.src;if(!a||!n)return;clearTimeout(C),cancelAnimationFrame(E),f=!1,u=e,w=!!e.closest(te)&&F(e),T=document.activeElement instanceof HTMLElement?document.activeElement:null;let l=e.getBoundingClientRect(),s=e.naturalWidth||Math.max(1,l.width),c=e.naturalHeight||Math.max(1,l.height);if(m=q(s,c),n.alt=e.alt||"Project image preview",n.src=a,n.style.transition="none",z(m),n.style.transform=M()?"none":J(l,m),t.classList.remove(d),t.classList.toggle(`${i}--${S}`,w),t.hidden=!1,re(),ae(e),M()){t.classList.add(d),n.style.transform="none",t.focus({preventScroll:!0});return}E=requestAnimationFrame(()=>{E=requestAnimationFrame(()=>{!o||o.hidden||f||(n.style.transition=`transform ${j}ms ${G}`,t.classList.add(d),n.style.transform="none",t.focus({preventScroll:!0}))})})}r(le,"openLightbox");function X(e,t){!o||!n||(o.hidden=!0,o.classList.remove(d),o.classList.remove(`${i}--${S}`),w=!1,n.removeAttribute("src"),n.style.removeProperty("left"),n.style.removeProperty("top"),n.style.removeProperty("width"),n.style.removeProperty("height"),n.style.removeProperty("transform"),n.style.removeProperty("transition"),se(t),ie(),u=null,m=null,T=null,f=!1,e instanceof HTMLElement&&e.isConnected&&e.focus({preventScroll:!0}))}r(X,"finishClose");function U(){if(!o||o.hidden||!n||f)return;f=!0,cancelAnimationFrame(E);let e=u,t=e||T,a=M();if(clearTimeout(C),a){X(t,e);return}let l=m||n.getBoundingClientRect(),s=e instanceof HTMLImageElement&&e.isConnected?e.getBoundingClientRect():null;w&&$(),n.style.transition=`transform ${R}ms ${G}`,o.classList.remove(d),n.style.transform=s?J(s,l):"scale(0.97)",C=window.setTimeout(()=>{X(t,e)},R)}r(U,"closeLightbox");function ce(e){return!(!(e instanceof HTMLImageElement)||!e.closest(ee)||e.closest(`.${i}`)||e.dataset.lightboxDisabled==="true"||e.closest('a[href], button, [role="button"]'))}r(ce,"isEligibleProjectImage");document.addEventListener("click",e=>{if(e.button!==0)return;let t=e.target;if(!(t instanceof Element))return;let a=t.closest("img");ce(a)&&(e.preventDefault(),le(a))});document.addEventListener("keydown",e=>{e.key==="Escape"&&o&&!o.hidden&&(e.preventDefault(),e.stopPropagation(),U())},{capture:!0});window.addEventListener("resize",()=>{if(!o||o.hidden||!n||!u||f)return;let e=u.naturalWidth||n.naturalWidth,t=u.naturalHeight||n.naturalHeight;!e||!t||(m=q(e,t),n.style.transition="none",n.style.transform="none",z(m))},{passive:!0});
