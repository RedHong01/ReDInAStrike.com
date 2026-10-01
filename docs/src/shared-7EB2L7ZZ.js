import{a as M,b as $,c as v,d as y,e as c,f as x,g as d,h,j as I,k as T}from"./shared-J3X76UIW.js";import{a as n}from"./shared-AFROVTVC.js";var u="red-motion-working-config-v2",k="red-motion-working-config-v1",P=!1,r=null,E=null,C=0,w=0,L=0;function R(t,e){try{return JSON.parse(localStorage.getItem(t)||"null")??e}catch{return e}}n(R,"loadJson");function f(t,e){try{localStorage.setItem(t,JSON.stringify(e))}catch{}}n(f,"saveJson");function H(){let t=new URLSearchParams(location.search).get("motionConfig");return t?T(t):null}n(H,"configFromUrl");function F(){let t=H();if(t)return f(u,t),t;let e=R(u,null)||R(k,null),o=e?d(e):h(c);return f(u,o),o}n(F,"loadWorkingConfig");function G(){if(document.querySelector("#motion-hub-runtime-styles"))return;let t=document.createElement("style");t.id="motion-hub-runtime-styles",t.textContent=`
    .dither-lab__motion-group {
      margin-top: 14px;
      padding-top: 11px;
      border-top: 1px dashed rgba(0, 0, 0, 0.15);
    }
    .dither-lab__motion-group:first-of-type { margin-top: 8px; }
    .dither-lab__motion-group-head {
      font-size: 10px;
      line-height: 1.1;
      letter-spacing: 0.035em;
    }
    .dither-lab__motion-group-copy {
      margin: 4px 0 9px;
      font-size: 8.5px;
      line-height: 1.35;
      color: var(--muted, rgba(0, 0, 0, 0.48));
    }
    .dither-lab__motion-modes,
    .dither-lab__motion-presets {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      margin-top: 8px;
    }
    .dither-lab__motion-toolbar {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 8px;
    }
    .dither-lab__motion-select {
      width: 100%;
      min-width: 0;
    }
    .dither-lab__button[data-motion-reveal-mode].is-active,
    .dither-lab__action[data-motion-action="toggle-reveal"].is-active {
      background: var(--ink, #111);
      color: var(--paper, #fff);
    }
  `,document.head.append(t)}n(G,"ensureHubStyles");function U(t){return t?.dataset.open==="true"}n(U,"panelIsOpen");function m(t){let e=U(t)?d(r||c):h(c);window.__RED_MOTION_CONFIG__=e,window.dispatchEvent(new CustomEvent("red:motion-config",{detail:e}))}n(m,"publishRuntimeConfig");function j(t,e){return`${Number(e).toFixed(t.decimals??2)}${t.suffix||""}`}n(j,"formatValue");function B(t){return`
    <label class="dither-lab__control">
      <span class="dither-lab__control-head">
        <span>${t.label}</span>
        <output data-motion-output="${t.key}"></output>
      </span>
      <input class="dither-lab__range" type="range"
        min="${t.min}" max="${t.max}" step="${t.step}"
        data-motion-param="${t.key}" />
    </label>`}n(B,"renderControl");function A(t){return`
    <div class="dither-lab__motion-group">
      <div class="dither-lab__motion-group-head">${t.title}</div>
      <p class="dither-lab__motion-group-copy">${t.description}</p>
      <div class="dither-lab__controls">${t.controls.map(B).join("")}</div>
    </div>`}n(A,"renderGroup");function z(){let t=v.slice(0,4);return`
    <section class="dither-lab__section" data-motion-hub-section data-motion-section="reveal">
      <div class="dither-lab__section-head">Image Reveal Motion</div>
      <p class="dither-lab__section-copy">Animate the final dither as a square-pixel screen resolving from binary snow. The reveal never changes the final Floyd / Bayer / Screen result; it only controls how that result appears.</p>

      <div class="dither-lab__motion-toolbar">
        <button class="dither-lab__action" type="button" data-motion-action="toggle-reveal"></button>
        <button class="dither-lab__action" type="button" data-motion-action="replay-reveal">Replay reveal</button>
      </div>

      <div class="dither-lab__motion-modes">
        ${M.map(([e,o],i)=>`
          <button class="dither-lab__button" type="button" data-motion-reveal-mode="${e}">
            <span class="dither-lab__number">${i+1}</span><span>${o}</span>
          </button>`).join("")}
      </div>

      <div class="dither-lab__motion-group">
        <div class="dither-lab__motion-group-head">Scan Direction</div>
        <p class="dither-lab__motion-group-copy">Used by Scan Lock; Center → Out is useful for a screen boot / calibration feel.</p>
        <select class="dither-lab__select dither-lab__motion-select" data-motion-reveal-direction>
          ${$.map(([e,o])=>`<option value="${e}">${o}</option>`).join("")}
        </select>
      </div>

      ${t.map(A).join("")}

      <div class="dither-lab__motion-group">
        <div class="dither-lab__motion-group-head">Reveal Presets</div>
        <p class="dither-lab__motion-group-copy">Starting points only. Every value remains exposed above after loading a preset.</p>
        <div class="dither-lab__motion-presets">
          ${x.map(e=>`
            <button class="dither-lab__action" type="button" data-motion-reveal-preset="${e.id}">${e.label}</button>`).join("")}
        </div>
      </div>
    </section>`}n(z,"renderRevealPanel");function J(){return`
    <section class="dither-lab__section" data-motion-hub-section data-motion-section="text">
      <div class="dither-lab__section-head">Typewriter / Text Motion</div>
      <p class="dither-lab__section-copy">Tune nav typing, body printing, viewport triggers, the edit caret, and the spring that pushes neighbouring categories away as a subtitle grows.</p>
      ${v.slice(4).map(A).join("")}
    </section>`}n(J,"renderTextMotionPanel");function V(){return`${z()}${J()}`}n(V,"renderMotionPanel");function g(t){t.querySelectorAll("[data-motion-param]").forEach(i=>{let a=i.dataset.motionParam,l=y.get(a);if(!l)return;document.activeElement!==i&&(i.value=r[a]);let s=t.querySelector(`[data-motion-output="${a}"]`);s&&(s.textContent=j(l,r[a]))}),t.querySelectorAll("[data-motion-reveal-mode]").forEach(i=>{let a=i.dataset.motionRevealMode===r.revealMode;i.classList.toggle("is-active",a),i.setAttribute("aria-pressed",a?"true":"false")});let e=t.querySelector('[data-motion-action="toggle-reveal"]');e&&(e.textContent=r.revealEnabled?"Reveal enabled":"Reveal disabled",e.classList.toggle("is-active",r.revealEnabled),e.setAttribute("aria-pressed",r.revealEnabled?"true":"false"));let o=t.querySelector("[data-motion-reveal-direction]");o&&document.activeElement!==o&&(o.value=r.revealDirection)}n(g,"syncPanelInputs");function p(t,e){r=d({...r,...e}),f(u,r),g(t),m(t)}n(p,"commitWorking");function K(t,e,o){y.has(e)&&p(t,{[e]:Number(o)})}n(K,"setMotionParam");function W(t,e){let o=x.find(i=>i.id===e);o&&(p(t,o.values),b(t,`${o.label} loaded`))}n(W,"applyRevealPreset");async function q(){let[{PUBLISHED_DITHER_CONFIG:t},e]=await Promise.all([import("./shared-TIJMPZLA.js"),import("./shared-5AERPHDB.js")]),o=new URLSearchParams(location.search),i=o.get("ditherConfig")?e.decodeConfig(o.get("ditherConfig"),t):null,a=R("red-dither-working-config-v2",null);return{dither:i||(a?e.sanitizeConfig(a,t):e.sanitizeConfig(t,t)),engine:e,published:t}}n(q,"getCombinedConfig");async function N(){let{dither:t,engine:e,published:o}=await q(),i=new URL(location.href);return i.searchParams.set("ditherHub","1"),i.searchParams.set("ditherConfig",e.encodeConfig(t,o)),i.searchParams.set("motionConfig",I(r)),i.toString()}n(N,"buildCombinedRemixUrl");async function S(t){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(t);let e=document.createElement("textarea");e.value=t,e.style.position="fixed",e.style.opacity="0",document.body.appendChild(e),e.select(),document.execCommand("copy"),e.remove()}n(S,"copyText");function b(t,e){let o=t.querySelector("[data-dither-toast]");o&&(o.textContent=e,o.classList.add("is-visible"),clearTimeout(L),L=setTimeout(()=>o.classList.remove("is-visible"),1800))}n(b,"showToast");async function Y(t,e){let o=t.target.closest?.("[data-dither-action]")?.dataset.ditherAction;if(!o)return;if(o==="reset-published"){r=h(c),f(u,r),g(e),m(e);return}if(!["copy-url","copy-json","copy-publish"].includes(o))return;if(t.preventDefault(),t.stopImmediatePropagation(),o==="copy-url"){let D=await N();await S(D),b(e,"Dither + motion remix URL copied");return}let{dither:i,engine:a,published:l}=await q();if(o==="copy-json"){await S(JSON.stringify({dither:a.sanitizeConfig(i,l),motion:d(r)},null,2)),b(e,"Combined config JSON copied");return}let _=`Publish these dither + image-reveal + text-motion defaults for RedHong01/ReDInAStrike.com: ${await N()}`;await S(_),b(e,"Combined publish prompt copied")}n(Y,"interceptCombinedCopy");function Q(t,e){e.addEventListener("input",o=>{let i=o.target.closest("[data-motion-param]");i&&K(t,i.dataset.motionParam,i.value)}),e.addEventListener("change",o=>{let i=o.target.closest("[data-motion-reveal-direction]");i&&p(t,{revealDirection:i.value})}),e.addEventListener("click",o=>{let i=o.target.closest("[data-motion-reveal-mode]")?.dataset.motionRevealMode;if(i){p(t,{revealMode:i,revealEnabled:i!=="none"});return}let a=o.target.closest("[data-motion-reveal-preset]")?.dataset.motionRevealPreset;if(a){W(t,a);return}let l=o.target.closest("[data-motion-action]")?.dataset.motionAction;l==="toggle-reveal"?p(t,{revealEnabled:!r.revealEnabled}):l==="replay-reveal"&&(window.__RED_REVEAL_MOTION__?.replay?.(r),b(t,"Reveal replayed"))})}n(Q,"bindMotionSectionEvents");function X(t){if(!t||t.dataset.motionHubBound==="true")return t&&(g(t),m(t)),!!t;t.dataset.motionHubBound="true";let e=t.querySelector(".dither-lab__title");e&&(e.textContent="DITHER / MOTION HUB");let i=[...t.querySelectorAll(":scope > .dither-lab__section")].find(s=>s.querySelector(".dither-lab__section-head")?.textContent?.trim()==="Remix / Presets"),a=document.createElement("div");return a.innerHTML=V().trim(),[...a.children].forEach(s=>{i?t.insertBefore(s,i):t.appendChild(s),Q(t,s)}),t.addEventListener("click",s=>{Y(s,t)},!0),E?.disconnect(),E=new MutationObserver(s=>{s.some(_=>_.attributeName==="data-open")&&m(t)}),E.observe(t,{attributes:!0,attributeFilter:["data-open"]}),g(t),m(t),!0}n(X,"bindPanel");function O(){C||(C=requestAnimationFrame(()=>{C=0;let t=document.querySelector(".dither-lab");X(t)||w||(w=requestAnimationFrame(()=>{w=0,O()}))}))}n(O,"scheduleBind");function tt(){if(P){O();return}P=!0,r=F(),G(),O()}n(tt,"activateMotionHub");export{tt as activateMotionHub};
