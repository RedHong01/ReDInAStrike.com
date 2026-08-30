import {
  MOTION_GROUPS,
  MOTION_PARAM_META,
  PUBLISHED_MOTION_CONFIG,
  REVEAL_DIRECTIONS,
  REVEAL_MODES,
  REVEAL_PRESETS,
  cloneMotionConfig,
  decodeMotionConfig,
  encodeMotionConfig,
  sanitizeMotionConfig,
} from "./motion-default.js"

const MOTION_WORKING_KEY = "red-motion-working-config-v2"
const LEGACY_MOTION_WORKING_KEY = "red-motion-working-config-v1"
let active = false
let workingConfig = null
let panelObserver = null
let syncFrame = 0
let retryFrame = 0
let toastTimer = 0

function loadJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null")
    return value ?? fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

function configFromUrl() {
  const encoded = new URLSearchParams(location.search).get("motionConfig")
  return encoded ? decodeMotionConfig(encoded) : null
}

function loadWorkingConfig() {
  const shared = configFromUrl()
  if (shared) {
    saveJson(MOTION_WORKING_KEY, shared)
    return shared
  }
  const stored = loadJson(MOTION_WORKING_KEY, null) || loadJson(LEGACY_MOTION_WORKING_KEY, null)
  const next = stored ? sanitizeMotionConfig(stored) : cloneMotionConfig(PUBLISHED_MOTION_CONFIG)
  saveJson(MOTION_WORKING_KEY, next)
  return next
}

function ensureHubStyles() {
  if (document.querySelector("#motion-hub-runtime-styles")) return
  const style = document.createElement("style")
  style.id = "motion-hub-runtime-styles"
  style.textContent = `
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
  `
  document.head.append(style)
}

function panelIsOpen(panel) {
  return panel?.dataset.open === "true"
}

function publishRuntimeConfig(panel) {
  const next = panelIsOpen(panel)
    ? sanitizeMotionConfig(workingConfig || PUBLISHED_MOTION_CONFIG)
    : cloneMotionConfig(PUBLISHED_MOTION_CONFIG)
  window.__RED_MOTION_CONFIG__ = next
  window.dispatchEvent(new CustomEvent("red:motion-config", { detail: next }))
}

function formatValue(meta, value) {
  return `${Number(value).toFixed(meta.decimals ?? 2)}${meta.suffix || ""}`
}

function renderControl(control) {
  return `
    <label class="dither-lab__control">
      <span class="dither-lab__control-head">
        <span>${control.label}</span>
        <output data-motion-output="${control.key}"></output>
      </span>
      <input class="dither-lab__range" type="range"
        min="${control.min}" max="${control.max}" step="${control.step}"
        data-motion-param="${control.key}" />
    </label>`
}

function renderGroup(group) {
  return `
    <div class="dither-lab__motion-group">
      <div class="dither-lab__motion-group-head">${group.title}</div>
      <p class="dither-lab__motion-group-copy">${group.description}</p>
      <div class="dither-lab__controls">${group.controls.map(renderControl).join("")}</div>
    </div>`
}

function renderRevealPanel() {
  const revealGroups = MOTION_GROUPS.slice(0, 4)
  return `
    <section class="dither-lab__section" data-motion-hub-section data-motion-section="reveal">
      <div class="dither-lab__section-head">Image Reveal Motion</div>
      <p class="dither-lab__section-copy">Animate the final dither as a square-pixel screen resolving from binary snow. The reveal never changes the final Floyd / Bayer / Screen result; it only controls how that result appears.</p>

      <div class="dither-lab__motion-toolbar">
        <button class="dither-lab__action" type="button" data-motion-action="toggle-reveal"></button>
        <button class="dither-lab__action" type="button" data-motion-action="replay-reveal">Replay reveal</button>
      </div>

      <div class="dither-lab__motion-modes">
        ${REVEAL_MODES.map(([id, label], index) => `
          <button class="dither-lab__button" type="button" data-motion-reveal-mode="${id}">
            <span class="dither-lab__number">${index + 1}</span><span>${label}</span>
          </button>`).join("")}
      </div>

      <div class="dither-lab__motion-group">
        <div class="dither-lab__motion-group-head">Scan Direction</div>
        <p class="dither-lab__motion-group-copy">Used by Scan Lock; Center → Out is useful for a screen boot / calibration feel.</p>
        <select class="dither-lab__select dither-lab__motion-select" data-motion-reveal-direction>
          ${REVEAL_DIRECTIONS.map(([id, label]) => `<option value="${id}">${label}</option>`).join("")}
        </select>
      </div>

      ${revealGroups.map(renderGroup).join("")}

      <div class="dither-lab__motion-group">
        <div class="dither-lab__motion-group-head">Reveal Presets</div>
        <p class="dither-lab__motion-group-copy">Starting points only. Every value remains exposed above after loading a preset.</p>
        <div class="dither-lab__motion-presets">
          ${REVEAL_PRESETS.map((preset) => `
            <button class="dither-lab__action" type="button" data-motion-reveal-preset="${preset.id}">${preset.label}</button>`).join("")}
        </div>
      </div>
    </section>`
}

function renderTextMotionPanel() {
  const textGroups = MOTION_GROUPS.slice(4)
  return `
    <section class="dither-lab__section" data-motion-hub-section data-motion-section="text">
      <div class="dither-lab__section-head">Typewriter / Text Motion</div>
      <p class="dither-lab__section-copy">Tune nav typing, body printing, viewport triggers, the edit caret, and the spring that pushes neighbouring categories away as a subtitle grows.</p>
      ${textGroups.map(renderGroup).join("")}
    </section>`
}

function renderMotionPanel() {
  return `${renderRevealPanel()}${renderTextMotionPanel()}`
}

function syncPanelInputs(panel) {
  panel.querySelectorAll("[data-motion-param]").forEach((input) => {
    const key = input.dataset.motionParam
    const meta = MOTION_PARAM_META.get(key)
    if (!meta) return
    if (document.activeElement !== input) input.value = workingConfig[key]
    const output = panel.querySelector(`[data-motion-output="${key}"]`)
    if (output) output.textContent = formatValue(meta, workingConfig[key])
  })

  panel.querySelectorAll("[data-motion-reveal-mode]").forEach((button) => {
    const selected = button.dataset.motionRevealMode === workingConfig.revealMode
    button.classList.toggle("is-active", selected)
    button.setAttribute("aria-pressed", selected ? "true" : "false")
  })

  const toggle = panel.querySelector('[data-motion-action="toggle-reveal"]')
  if (toggle) {
    toggle.textContent = workingConfig.revealEnabled ? "Reveal enabled" : "Reveal disabled"
    toggle.classList.toggle("is-active", workingConfig.revealEnabled)
    toggle.setAttribute("aria-pressed", workingConfig.revealEnabled ? "true" : "false")
  }

  const direction = panel.querySelector("[data-motion-reveal-direction]")
  if (direction && document.activeElement !== direction) direction.value = workingConfig.revealDirection
}

function commitWorking(panel, patch) {
  workingConfig = sanitizeMotionConfig({ ...workingConfig, ...patch })
  saveJson(MOTION_WORKING_KEY, workingConfig)
  syncPanelInputs(panel)
  publishRuntimeConfig(panel)
}

function setMotionParam(panel, key, rawValue) {
  if (!MOTION_PARAM_META.has(key)) return
  commitWorking(panel, { [key]: Number(rawValue) })
}

function applyRevealPreset(panel, presetId) {
  const preset = REVEAL_PRESETS.find((item) => item.id === presetId)
  if (!preset) return
  commitWorking(panel, preset.values)
  showToast(panel, `${preset.label} loaded`)
}

async function getCombinedConfig() {
  const [{ PUBLISHED_DITHER_CONFIG }, engine] = await Promise.all([
    import("./dither-default.js"),
    import("./dither-engine.js"),
  ])
  const params = new URLSearchParams(location.search)
  const shared = params.get("ditherConfig")
    ? engine.decodeConfig(params.get("ditherConfig"), PUBLISHED_DITHER_CONFIG)
    : null
  const stored = loadJson("red-dither-working-config-v2", null)
  const dither = shared || (stored
    ? engine.sanitizeConfig(stored, PUBLISHED_DITHER_CONFIG)
    : engine.sanitizeConfig(PUBLISHED_DITHER_CONFIG, PUBLISHED_DITHER_CONFIG))
  return { dither, engine, published: PUBLISHED_DITHER_CONFIG }
}

async function buildCombinedRemixUrl() {
  const { dither, engine, published } = await getCombinedConfig()
  const url = new URL(location.href)
  url.searchParams.set("ditherHub", "1")
  url.searchParams.set("ditherConfig", engine.encodeConfig(dither, published))
  url.searchParams.set("motionConfig", encodeMotionConfig(workingConfig))
  return url.toString()
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  textarea.remove()
}

function showToast(panel, message) {
  const toast = panel.querySelector("[data-dither-toast]")
  if (!toast) return
  toast.textContent = message
  toast.classList.add("is-visible")
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800)
}

async function interceptCombinedCopy(event, panel) {
  const action = event.target.closest?.("[data-dither-action]")?.dataset.ditherAction
  if (!action) return

  if (action === "reset-published") {
    workingConfig = cloneMotionConfig(PUBLISHED_MOTION_CONFIG)
    saveJson(MOTION_WORKING_KEY, workingConfig)
    syncPanelInputs(panel)
    publishRuntimeConfig(panel)
    return
  }

  if (!["copy-url", "copy-json", "copy-publish"].includes(action)) return
  event.preventDefault()
  event.stopImmediatePropagation()

  if (action === "copy-url") {
    const url = await buildCombinedRemixUrl()
    await copyText(url)
    showToast(panel, "Dither + motion remix URL copied")
    return
  }

  const { dither, engine, published } = await getCombinedConfig()
  if (action === "copy-json") {
    await copyText(JSON.stringify({
      dither: engine.sanitizeConfig(dither, published),
      motion: sanitizeMotionConfig(workingConfig),
    }, null, 2))
    showToast(panel, "Combined config JSON copied")
    return
  }

  const url = await buildCombinedRemixUrl()
  const prompt = `Publish these dither + image-reveal + text-motion defaults for RedHong01/ReDInAStrike.com: ${url}`
  await copyText(prompt)
  showToast(panel, "Combined publish prompt copied")
}

function bindMotionSectionEvents(panel, section) {
  section.addEventListener("input", (event) => {
    const input = event.target.closest("[data-motion-param]")
    if (!input) return
    setMotionParam(panel, input.dataset.motionParam, input.value)
  })

  section.addEventListener("change", (event) => {
    const direction = event.target.closest("[data-motion-reveal-direction]")
    if (direction) commitWorking(panel, { revealDirection: direction.value })
  })

  section.addEventListener("click", (event) => {
    const mode = event.target.closest("[data-motion-reveal-mode]")?.dataset.motionRevealMode
    if (mode) {
      commitWorking(panel, { revealMode: mode, revealEnabled: mode !== "none" })
      return
    }

    const preset = event.target.closest("[data-motion-reveal-preset]")?.dataset.motionRevealPreset
    if (preset) {
      applyRevealPreset(panel, preset)
      return
    }

    const action = event.target.closest("[data-motion-action]")?.dataset.motionAction
    if (action === "toggle-reveal") {
      commitWorking(panel, { revealEnabled: !workingConfig.revealEnabled })
    } else if (action === "replay-reveal") {
      window.__RED_REVEAL_MOTION__?.replay?.(workingConfig)
      showToast(panel, "Reveal replayed")
    }
  })
}

function bindPanel(panel) {
  if (!panel || panel.dataset.motionHubBound === "true") {
    if (panel) {
      syncPanelInputs(panel)
      publishRuntimeConfig(panel)
    }
    return !!panel
  }

  panel.dataset.motionHubBound = "true"
  const title = panel.querySelector(".dither-lab__title")
  if (title) title.textContent = "DITHER / MOTION HUB"

  const sections = [...panel.querySelectorAll(":scope > .dither-lab__section")]
  const remixSection = sections.find((section) =>
    section.querySelector(".dither-lab__section-head")?.textContent?.trim() === "Remix / Presets",
  )
  const wrapper = document.createElement("div")
  wrapper.innerHTML = renderMotionPanel().trim()
  const inserted = [...wrapper.children]
  inserted.forEach((section) => {
    if (remixSection) panel.insertBefore(section, remixSection)
    else panel.appendChild(section)
    bindMotionSectionEvents(panel, section)
  })

  panel.addEventListener("click", (event) => void interceptCombinedCopy(event, panel), true)

  panelObserver?.disconnect()
  panelObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === "data-open")) {
      publishRuntimeConfig(panel)
    }
  })
  panelObserver.observe(panel, { attributes: true, attributeFilter: ["data-open"] })

  syncPanelInputs(panel)
  publishRuntimeConfig(panel)
  return true
}

function scheduleBind() {
  if (syncFrame) return
  syncFrame = requestAnimationFrame(() => {
    syncFrame = 0
    const panel = document.querySelector(".dither-lab")
    if (bindPanel(panel)) return
    if (!retryFrame) {
      retryFrame = requestAnimationFrame(() => {
        retryFrame = 0
        scheduleBind()
      })
    }
  })
}

export function activateMotionHub() {
  if (active) {
    scheduleBind()
    return
  }
  active = true
  workingConfig = loadWorkingConfig()
  ensureHubStyles()
  scheduleBind()
}
