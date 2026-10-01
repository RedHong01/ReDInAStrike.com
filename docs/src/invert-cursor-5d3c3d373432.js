var W=Object.defineProperty;var n=(p,i)=>W(p,"name",{value:i,configurable:!0});(()=>{const p="red-invert-cursor-style",i="red-invert-cursor",d="has-red-invert-cursor",m="is-preview-label",f="is-paragraph-target",_="Click again to view",h="(any-hover: hover) and (any-pointer: fine)",c="cubic-bezier(0.22, 1, 0.36, 1)";let o=null,l=null,r=null,g=0,L=0,S=0,y=!1,x=!1,u=0,C=!1;function T(){if(document.getElementById(p))return;const e=document.createElement("style");e.id=p,e.textContent=`
      .${i} {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 2147483647;
        display: none;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        opacity: 0;
        pointer-events: none;
        mix-blend-mode: difference;
        transform: translate3d(-100px, -100px, 0);
        will-change: transform, opacity;
        cursor: none !important;
      }

      .${i}.is-visible {
        opacity: 1;
      }

      /* Paragraphs use the line-aware caret from main.js as their sole
         pointer surface. Keep this chip hidden while the pointer is over
         selectable copy so the square and vertical states never overlap. */
      .${i}.${f} {
        opacity: 0 !important;
      }

      /* During the paragraph caret's reverse squeeze, keep the square cursor
         hidden until that owner has completed its return. This prevents a
         one-frame A/B overlap when the pointer leaves selectable copy. */
      html[data-paragraph-caret-transition="true"] .${i} {
        opacity: 0 !important;
      }

      .${i}__chip {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 14px;
        height: 14px;
        padding: 0;
        overflow: hidden;
        background: #fff;
        color: #000;
        white-space: nowrap;
        image-rendering: pixelated;
        transform: translate(-50%, -50%);
        transform-origin: center center;
        transition:
          width 420ms ${c},
          height 420ms ${c},
          padding 420ms ${c};
      }

      .${i}.${m} .${i}__chip {
        height: 22px;
        padding: 0 12px;
      }

      .${i}__label {
        display: block;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        font-family: var(--type-subtitle-font, var(--mono, "Courier New", monospace));
        font-size: var(--project-caption-size, var(--type-subtitle-size, 13px));
        line-height: 1;
        letter-spacing: 0.01em;
        text-transform: none;
        transform: translate3d(-6px, 0, 0);
        transition:
          opacity 260ms ease,
          max-width 420ms ${c},
          transform 420ms ${c};
      }

      .${i}.${m} .${i}__label {
        max-width: 18rem;
        opacity: 1;
        transform: translate3d(0, 0, 0);
        transition-delay: 48ms, 0ms, 0ms;
      }

      @media (prefers-reduced-motion: reduce) {
        .${i}__chip,
        .${i}__label {
          transition-duration: 1ms !important;
          transition-delay: 0ms !important;
        }
      }

      @media ${h} {
        html.${d},
        html.${d} *,
        html.${d} *::before,
        html.${d} *::after {
          cursor: none !important;
        }

        .${i} {
          display: block;
        }
      }
    `,document.head.appendChild(e)}n(T,"ensureStyle");function v(e){document.documentElement.classList.toggle(d,e)}n(v,"setNativeCursorHidden");function E(e){let t=e;for(;t&&t!==document.documentElement;){if(t.nodeType===1){const a=t.nodeName;if(a==="IFRAME"||a==="EMBED"||a==="OBJECT")return!0}t=t.parentNode,t&&t.nodeType===11&&(t=t.host)}return!1}n(E,"isForeignSurface");function D(e){if(!e||typeof e.closest!="function")return!1;const t=e.closest('img:not([data-lightbox-disabled="true"])');if(t?.closest(".detail-page, .project-detail-drawer")&&!t.closest('a[href], button, [role="button"], .project-lightbox'))return"Click to view detail";const a=e.closest(".project-card.is-project-preview");return!a||a.classList.contains("project-preview-exit-ghost")||a.classList.contains("project-preview-expand-ghost")||a.hasAttribute("data-project-detail-open")?!1:_}n(D,"isPreviewLabelTarget");function O(e){if(!e||typeof e.closest!="function")return!1;const t=e.closest("p");return!t||window.getComputedStyle(t).userSelect==="none"?!1:!t.closest(".project-preview-copy, .project-meta, [aria-hidden='true']")}n(O,"isParagraphCaretTarget");function I(){if(!r)return 14;const e=r.style.maxWidth,t=r.style.opacity;r.style.maxWidth="none",r.style.opacity="0";const a=Math.ceil(r.scrollWidth);return r.style.maxWidth=e,r.style.opacity=t,Math.max(14,a+24)}n(I,"measureLabelWidth");function A(e){if(!(!o||!l||!r)){if(x===e){e&&u>0&&(l.style.width=`${u}px`);return}x=e,o.classList.toggle(m,!!e),e?(r.textContent=e,u=I(),l.style.width=`${u}px`):l.style.width="14px"}}n(A,"setLabelActive");function j(){g=0,o&&(o.style.transform=`translate3d(${Math.round(L)}px, ${Math.round(S)}px, 0)`,o.classList.toggle("is-visible",y))}n(j,"render");function w(){g||(g=requestAnimationFrame(j))}n(w,"scheduleRender");function s(){y=!1,o?.classList.remove(f),A(!1),w()}n(s,"hideCursor");function M(e,t,a){L=e,S=t,y=!0;const N=O(a);o?.classList.toggle(f,N),A(N?!1:D(a)),w()}n(M,"showCursorAt");function X(e){if(e.pointerType==="touch"||e.isPrimary===!1){s();return}if(E(e.target)){s();return}M(e.clientX,e.clientY,e.target)}n(X,"handlePointerMove");function R(e){if(!(e.pointerType==="touch"||e.isPrimary===!1)){if(E(e.target)){s();return}v(!0),M(e.clientX,e.clientY,e.target)}}n(R,"handlePointerDown");function B(e){const t=e.relatedTarget;(!t||E(t))&&s()}n(B,"handlePointerOut");function z(e){(e.target===document.documentElement||e.target===document.body)&&s()}n(z,"handleDocumentLeave");function k(){document.hidden&&s()}n(k,"handleVisibilityChange");function b(){C||!window.matchMedia?.(h).matches||(C=!0,T(),v(!0),o=document.createElement("div"),o.className=i,o.setAttribute("aria-hidden","true"),l=document.createElement("div"),l.className=`${i}__chip`,r=document.createElement("span"),r.className=`${i}__label`,r.textContent=_,l.appendChild(r),o.appendChild(l),document.body.appendChild(o),window.addEventListener("pointermove",X,{passive:!0}),window.addEventListener("pointerdown",R,{passive:!0}),window.addEventListener("pointerup",R,{passive:!0}),window.addEventListener("pointerout",B,{passive:!0}),window.addEventListener("blur",s,{passive:!0}),window.addEventListener("resize",w,{passive:!0}),document.addEventListener("mouseleave",z,{passive:!0}),document.documentElement.addEventListener("mouseleave",s,{passive:!0}),document.addEventListener("visibilitychange",k,{passive:!0}))}n(b,"start");function U(){v(!1),s()}n(U,"stopNativeOverride");const $=window.matchMedia?.(h),P=n(e=>{e.matches?b():U()},"handlePointerCapabilityChange");$?.addEventListener?.("change",P),$?.addEventListener||$?.addListener?.(P),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b,{once:!0}):b()})();
