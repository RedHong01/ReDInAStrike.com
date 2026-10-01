import{a as P}from"./shared-K6BBGCQE.js";import{a as o}from"./shared-D4KDHR44.js";import{a as p,b as S,c as m,e as d,f as c,g as C,h as w,i as L,j as h,k as R}from"./shared-DS4BD5M4.js";import"./shared-2OL6QP5Y.js";import{a}from"./shared-AFROVTVC.js";var $="red-dither-working-config-v2",v="red-dither-presets-v2",q="red-dither-mode",A=new Set(p.map(([e])=>e));function N(e,n){try{return JSON.parse(localStorage.getItem(e)||"null")??n}catch{return n}}a(N,"loadJson");function _(e,n){try{localStorage.setItem(e,JSON.stringify(n))}catch{}}a(_,"saveJson");function H(){let e=new URLSearchParams(location.search).get("ditherConfig");return e?L(e,o):null}a(H,"configFromUrl");function U(){let e=new URLSearchParams(location.search);return e.get("ditherHub")==="1"||e.has("ditherConfig")}a(U,"hubRequestedFromUrl");function K(){let e=H();if(e)return e;let n=N($,null);if(n)return d(n,o);let i=localStorage.getItem(q);return i&&A.has(i)?d({mode:i==="dot"?"native":i},o):c(o,o)}a(K,"loadWorkingConfig");function j(){let e=N(v,[]);return Array.isArray(e)?e.filter(n=>n&&typeof n.name=="string"&&n.config).map(n=>({id:String(n.id||`${Date.now()}-${Math.random()}`),name:n.name.trim().slice(0,48)||"Untitled",config:d(n.config,o),createdAt:Number(n.createdAt)||Date.now()})):[]}a(j,"loadPresets");var t={hubEnabled:U(),workingConfig:K(),config:null,presets:j(),raf:0,observer:null,resizeObserver:null,panel:null,toastTimer:0};t.config=t.hubEnabled?c(t.workingConfig,o):c(o,o);function f(){t.workingConfig=c(t.config,o),_($,t.workingConfig)}a(f,"persistWorking");function D(e){t.hubEnabled=!!e,t.config=t.hubEnabled?c(t.workingConfig,o):c(o,o),t.panel&&(t.panel.dataset.open=t.hubEnabled?"true":"false"),s()}a(D,"setHubEnabled");function G(){t.raf=0,document.querySelectorAll(".project-card").forEach(e=>R(e,t.config)),b()}a(G,"renderAll");function s(){t.raf||(t.raf=requestAnimationFrame(G))}a(s,"requestRender");function M(e){A.has(e)&&(t.config.mode=e,t.hubEnabled&&f(),s())}a(M,"setMode");function z(e,n){if(!m.get(e))return;let r=d({...t.config,[e]:Number(n)},o),u=t.config.columns;t.config=r,e==="columns"&&t.config.columns!==u&&h(),t.hubEnabled&&f(),s()}a(z,"setParam");function F(e,n){return`${Number(n).toFixed(e.decimals??2)}${e.suffix||""}`}a(F,"formatValue");function J(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}a(J,"escapeHtml");function B(e){return`
    <label class="dither-lab__control">
      <span class="dither-lab__control-head">
        <span>${e.label}</span>
        <output data-dither-output="${e.key}"></output>
      </span>
      <input class="dither-lab__range" type="range"
        min="${e.min}" max="${e.max}" step="${e.step}"
        data-dither-param="${e.key}" />
    </label>`}a(B,"renderControl");function W(e){return`
    <section class="dither-lab__section">
      <div class="dither-lab__section-head">${e.title}</div>
      <p class="dither-lab__section-copy">${e.description}</p>
      <div class="dither-lab__controls">${e.controls.map(B).join("")}</div>
    </section>`}a(W,"renderGroup");function I(){return t.presets.length?['<option value="">Select preset…</option>',...t.presets.map(e=>`<option value="${e.id}">${J(e.name)}</option>`)].join(""):'<option value="">No saved presets</option>'}a(I,"presetOptions");function Y(){if(t.panel?.isConnected)return;let e=document.createElement("aside");e.className="dither-lab",e.dataset.open=t.hubEnabled?"true":"false",e.innerHTML=`
    <div class="dither-lab__sticky-head">
      <div class="dither-lab__head">
        <div>
          <div class="dither-lab__title">DITHER HUB</div>
          <div class="dither-lab__status" data-dither-status></div>
        </div>
        <button class="dither-lab__icon-button" type="button" data-dither-action="close" aria-label="Close Dither Hub">×</button>
      </div>
      <div class="dither-lab__pipeline">SOURCE → LUMINANCE → INK → THRESHOLD → GEOMETRY → PAPER / INK</div>
    </div>

    <section class="dither-lab__section">
      <div class="dither-lab__section-head">Mode</div>
      <p class="dither-lab__section-copy">Native Dot is the original site renderer. The other modes share the same two-color source logic and expose remixable geometry.</p>
      <div class="dither-lab__buttons">
        ${p.map(([n,i],r)=>`
          <button class="dither-lab__button" type="button" data-dither-mode="${n}">
            <span class="dither-lab__number">${r+1}</span><span>${i}</span>
          </button>`).join("")}
      </div>
    </section>

    ${S.map(W).join("")}

    <section class="dither-lab__section">
      <div class="dither-lab__section-head">Remix / Presets</div>
      <p class="dither-lab__section-copy">Working changes autosave in this browser. Snapshots let you keep multiple versions without changing the public site.</p>
      <div class="dither-lab__preset-row">
        <input class="dither-lab__text" type="text" maxlength="48" placeholder="Preset name" data-dither-preset-name />
        <button class="dither-lab__action" type="button" data-dither-action="save-preset">Save snapshot</button>
      </div>
      <div class="dither-lab__preset-row">
        <select class="dither-lab__select" data-dither-preset-select>${I()}</select>
        <button class="dither-lab__action" type="button" data-dither-action="load-preset">Load</button>
        <button class="dither-lab__action" type="button" data-dither-action="delete-preset">Delete</button>
      </div>
    </section>

    <section class="dither-lab__section">
      <div class="dither-lab__section-head">Publish Bridge</div>
      <p class="dither-lab__section-copy">The public default lives in dither-default.js. A remix URL preserves this exact working config; the publish prompt lets ChatGPT commit it as the public default.</p>
      <div class="dither-lab__actions">
        <button class="dither-lab__action" type="button" data-dither-action="reset-published">Reset to published</button>
        <button class="dither-lab__action" type="button" data-dither-action="copy-url">Copy remix URL</button>
        <button class="dither-lab__action" type="button" data-dither-action="copy-json">Copy config JSON</button>
        <button class="dither-lab__action dither-lab__action--strong" type="button" data-dither-action="copy-publish">Copy publish prompt</button>
      </div>
    </section>

    <div class="dither-lab__toast" data-dither-toast aria-live="polite"></div>`,e.addEventListener("click",ee),e.addEventListener("input",X),document.body.appendChild(e),t.panel=e,b()}a(Y,"mountPanel");function b(){if(!t.panel)return;t.panel.dataset.open=t.hubEnabled?"true":"false",t.panel.querySelectorAll("[data-dither-mode]").forEach(i=>{let r=i.dataset.ditherMode===t.config.mode;i.classList.toggle("is-active",r),i.setAttribute("aria-pressed",r?"true":"false")});for(let[i,r]of m){let u=t.panel.querySelector(`[data-dither-param="${i}"]`),E=t.panel.querySelector(`[data-dither-output="${i}"]`);u&&document.activeElement!==u&&(u.value=t.config[i]),E&&(E.textContent=F(r,t.config[i]))}let e=t.panel.querySelector("[data-dither-preset-select]");if(e){let i=e.value;e.innerHTML=I(),[...e.options].some(r=>r.value===i)&&(e.value=i)}let n=t.panel.querySelector("[data-dither-status]");n&&(n.textContent=C(t.config,o,o)?"MATCHES PUBLISHED DEFAULT":"WORKING REMIX · LOCAL")}a(b,"updatePanel");function l(e){let n=t.panel?.querySelector("[data-dither-toast]");n&&(n.textContent=e,n.classList.add("is-visible"),clearTimeout(t.toastTimer),t.toastTimer=setTimeout(()=>n.classList.remove("is-visible"),1800))}a(l,"showToast");function X(e){let n=e.target.closest("[data-dither-param]");n&&z(n.dataset.ditherParam,n.value)}a(X,"onPanelInput");function k(){let e=t.panel?.querySelector("[data-dither-preset-select]");return t.presets.find(n=>n.id===e?.value)||null}a(k,"selectedPreset");function V(){let e=t.panel?.querySelector("[data-dither-preset-name]"),n=e?.value.trim();if(!n){l("Name the preset first"),e?.focus();return}let i=t.presets.find(r=>r.name.toLowerCase()===n.toLowerCase());i?(i.config=c(t.config,o),i.createdAt=Date.now()):t.presets.push({id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,name:n.slice(0,48),config:c(t.config,o),createdAt:Date.now()}),_(v,t.presets),e&&(e.value=""),b(),l(i?"Preset updated":"Preset saved")}a(V,"savePreset");function Q(){let e=k();if(!e)return l("Select a preset");t.config=c(e.config,o),f(),h(),s(),l(`Loaded ${e.name}`)}a(Q,"loadPreset");function Z(){let e=k();if(!e)return l("Select a preset");t.presets=t.presets.filter(n=>n.id!==e.id),_(v,t.presets),b(),l(`Deleted ${e.name}`)}a(Z,"deletePreset");function O(){let e=new URL(location.href);return e.searchParams.set("ditherHub","1"),e.searchParams.set("ditherConfig",w(t.config,o)),e.toString()}a(O,"buildRemixUrl");async function g(e){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(e);let n=document.createElement("textarea");n.value=e,n.style.position="fixed",n.style.opacity="0",document.body.appendChild(n),n.select(),document.execCommand("copy"),n.remove()}a(g,"copyText");function ee(e){let n=e.target.closest("[data-dither-mode]");if(n)return M(n.dataset.ditherMode);let i=e.target.closest("[data-dither-action]")?.dataset.ditherAction;if(i){if(i==="close")D(!1);else if(i==="save-preset")V();else if(i==="load-preset")Q();else if(i==="delete-preset")Z();else if(i==="reset-published")t.config=c(o,o),f(),h(),s(),l("Reset to published default");else if(i==="copy-url")g(O()).then(()=>l("Remix URL copied"));else if(i==="copy-json")g(JSON.stringify(d(t.config,o),null,2)).then(()=>l("Config JSON copied"));else if(i==="copy-publish"){let r=`Publish this dither remix as the public default for RedHong01/ReDInAStrike.com: ${O()}`;g(r).then(()=>l("Publish prompt copied"))}}}a(ee,"onPanelClick");function y(){t.observer?.disconnect(),t.resizeObserver?.disconnect();let e=document.querySelector(".catalog");e&&(t.observer=new MutationObserver(s),t.observer.observe(e,{attributes:!0,subtree:!0,attributeFilter:["class","data-active-filter"]}),"ResizeObserver"in window&&(t.resizeObserver=new ResizeObserver(s),e.querySelectorAll(".project-media").forEach(n=>t.resizeObserver.observe(n))),e.querySelectorAll("img").forEach(n=>n.addEventListener("load",s,{passive:!0})))}a(y,"bindObservers");function x(){Y(),y(),s()}a(x,"boot");window.addEventListener("keydown",e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;let n=document.activeElement?.tagName,i=n==="INPUT"||n==="TEXTAREA"||n==="SELECT";if(!i&&e.shiftKey&&e.key.toLowerCase()==="d"){e.preventDefault(),D(!t.hubEnabled);return}if(!t.hubEnabled||i)return;let r=Number(e.key)-1;r>=0&&r<p.length&&M(p[r][0])});window.addEventListener("resize",s,{passive:!0});window.addEventListener("hashchange",()=>setTimeout(()=>{y(),s()},0));var T=document.querySelector("#app");T&&new MutationObserver(()=>{y(),s()}).observe(T,{childList:!0});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",x,{once:!0}):x();queueMicrotask(P);
