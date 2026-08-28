import {
  MOTION_GROUPS,
  MOTION_PARAM_META,
  PUBLISHED_MOTION_CONFIG,
  cloneMotionConfig,
  decodeMotionConfig,
  encodeMotionConfig,
  sanitizeMotionConfig,
} from "./motion-default.js"

const MOTION_WORKING_KEY = "red-motion-working-config-v1"
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
  const stored = loadJson(MOTION_WORKING_KEY, null)
  return stored ? sanitizeMotionConfig(stored) : cloneMotionConfig(PUBLISHED_MOTION_CONFIG)
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

function renderMotionPanel() {
  return `
    <section class="dither-lab__section" data-motion-hub-section>
      <div class="dither-lab__section-head">Typewriter / Text Motion</div>
      <p class="dither-lab__section-copy">Tune nav typing, body printing, viewport triggers, the edit caret, and the spring that pushes neighbouring categories away as a subtitle grows.</p>
      ${MOTION_GROUPS.map((group) => `
        <div class="dither-lab__motion-group">
          <div class="dither-lab__motion-group-head">${group.title}</div>
          <p class="dither-lab__motion-group-copy">${group.description}</p>
          <div class="dither-lab__controls">${group.controls.map(renderControl).join("")}</div>
        </div>`).join("")}
    </section>`
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
}

function setMotionParam(panel, key, rawValue) {
  if (!MOTION_PARAM_META.has(key)) return
  workingConfig = sanitizeMotionConfig({ ...workingConfig, [key]: Number(rawValue) })
  saveJson(MOTION_WORKING_KEY, workingConfig)
  syncPanelInputs(panel)
  publishRuntimeConfig(panel)
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
  const prompt = `Publish these dither + text-motion defaults for RedHong01/ReDInAStrike.com: ${url}`
  await copyText(prompt)
  showToast(panel, "Combined publish prompt copied")
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
  const section = wrapper.firstElementChild
  if (remixSection) panel.insertBefore(section, remixSection)
  else panel.appendChild(section)

  section.addEventListener("input", (event) => {
    const input = event.target.closest("[data-motion-param]")
    if (!input) return
    setMotionParam(panel, input.dataset.motionParam, input.value)
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
