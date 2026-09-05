import {
  ACTIVE_COLOR_GROUPS,
  ACTIVE_COLOR_PARAM_META,
  ACTIVE_COLOR_PRESETS,
  PUBLISHED_ACTIVE_COLOR_CONFIG,
  cloneActiveColorConfig,
  decodeActiveColorConfig,
  encodeActiveColorConfig,
  sanitizeActiveColorConfig,
} from "./active-color-default.js?v=20260905-perf1"

const WORKING_KEY = "red-active-color-working-config-v1"
let workingConfig = null
let panelObserver = null
let toastTimer = 0
let boundPanel = null

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
  const encoded = new URLSearchParams(location.search).get("activeColorConfig")
  return encoded ? decodeActiveColorConfig(encoded) : null
}

function loadWorkingConfig() {
  const shared = configFromUrl()
  if (shared) {
    saveJson(WORKING_KEY, shared)
    return shared
  }
  const stored = loadJson(WORKING_KEY, null)
  const next = stored ? sanitizeActiveColorConfig(stored) : cloneActiveColorConfig(PUBLISHED_ACTIVE_COLOR_CONFIG)
  saveJson(WORKING_KEY, next)
  return next
}

function panelIsOpen(panel) {
  return panel?.dataset.open === "true"
}

function publishRuntimeConfig(panel) {
  const next = panelIsOpen(panel)
    ? sanitizeActiveColorConfig(workingConfig || PUBLISHED_ACTIVE_COLOR_CONFIG)
    : cloneActiveColorConfig(PUBLISHED_ACTIVE_COLOR_CONFIG)
  window.__RED_ACTIVE_COLOR_CONFIG__ = next
  window.dispatchEvent(new CustomEvent("red:active-color-config", { detail: next }))
}

function formatValue(meta, value) {
  return `${Number(value).toFixed(meta.decimals ?? 2)}${meta.suffix || ""}`
}

function renderControl(control) {
  return `
    <label class="dither-lab__control">
      <span class="dither-lab__control-head">
        <span>${control.label}</span>
        <output data-active-color-output="${control.key}"></output>
      </span>
      <input class="dither-lab__range" type="range"
        min="${control.min}" max="${control.max}" step="${control.step}"
        data-active-color-param="${control.key}" />
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

function renderSection() {
  return `
    <section class="dither-lab__section" data-active-color-hub-section>
      <div class="dither-lab__section-head">Active Color Snow</div>
      <p class="dither-lab__section-copy">Category-matched cards now use the same pixel-screen language as the monochrome dither reveal, but every snow square is sampled from nearby colors in the original image. Filtered-out cards remain paper / ink Floyd.</p>

      <div class="dither-lab__motion-toolbar">
        <button class="dither-lab__action" type="button" data-active-color-action="toggle"></button>
        <button class="dither-lab__action" type="button" data-active-color-action="replay">Replay color snow</button>
      </div>

      ${ACTIVE_COLOR_GROUPS.map(renderGroup).join("")}

      <div class="dither-lab__motion-group">
        <div class="dither-lab__motion-group-head">Color Snow Presets</div>
        <p class="dither-lab__motion-group-copy">Use these as visual starting points; every value remains editable above.</p>
        <div class="dither-lab__motion-presets">
          ${ACTIVE_COLOR_PRESETS.map((preset) => `
            <button class="dither-lab__action" type="button" data-active-color-preset="${preset.id}">${preset.label}</button>`).join("")}
        </div>
      </div>
    </section>`
}

function ensureStyles() {
  if (document.getElementById("active-color-hub-runtime-style")) return
  const style = document.createElement("style")
  style.id = "active-color-hub-runtime-style"
  style.textContent = `
    .dither-lab__action[data-active-color-action="toggle"].is-active {
      background: var(--ink, #111);
      color: var(--paper, #fff);
    }
  `
  document.head.appendChild(style)
}

function syncInputs(panel) {
  panel.querySelectorAll("[data-active-color-param]").forEach((input) => {
    const key = input.dataset.activeColorParam
    const meta = ACTIVE_COLOR_PARAM_META.get(key)
    if (!meta) return
    if (document.activeElement !== input) input.value = workingConfig[key]
    const output = panel.querySelector(`[data-active-color-output="${key}"]`)
    if (output) output.textContent = formatValue(meta, workingConfig[key])
  })

  const toggle = panel.querySelector('[data-active-color-action="toggle"]')
  if (toggle) {
    toggle.textContent = workingConfig.activeColorEnabled ? "Color snow enabled" : "Color snow disabled"
    toggle.classList.toggle("is-active", workingConfig.activeColorEnabled)
    toggle.setAttribute("aria-pressed", workingConfig.activeColorEnabled ? "true" : "false")
  }
}

function commitWorking(panel, patch, { replay = true } = {}) {
  workingConfig = sanitizeActiveColorConfig({ ...workingConfig, ...patch })
  saveJson(WORKING_KEY, workingConfig)
  syncInputs(panel)
  publishRuntimeConfig(panel)
  if (replay && panelIsOpen(panel)) window.__RED_ACTIVE_COLOR_SNOW__?.replay?.(workingConfig)
}

function applyPreset(panel, presetId) {
  const preset = ACTIVE_COLOR_PRESETS.find((item) => item.id === presetId)
  if (!preset) return
  commitWorking(panel, preset.values)
  showToast(panel, `${preset.label} loaded`)
}

function showToast(panel, message) {
  const toast = panel.querySelector("[data-dither-toast]")
  if (!toast) return
  toast.textContent = message
  toast.classList.add("is-visible")
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800)
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

async function getCombinedConfig() {
  const [{ PUBLISHED_DITHER_CONFIG }, engine, motion] = await Promise.all([
    import("./dither-default.js?v=20260905-perf1"),
    import("./dither-engine.js?v=20260905-perf1"),
    import("./motion-default.js?v=20260905-perf1"),
  ])

  const params = new URLSearchParams(location.search)
  const sharedDither = params.get("ditherConfig")
    ? engine.decodeConfig(params.get("ditherConfig"), PUBLISHED_DITHER_CONFIG)
    : null
  const storedDither = loadJson("red-dither-working-config-v2", null)
  const dither = sharedDither || (storedDither
    ? engine.sanitizeConfig(storedDither, PUBLISHED_DITHER_CONFIG)
    : engine.sanitizeConfig(PUBLISHED_DITHER_CONFIG, PUBLISHED_DITHER_CONFIG))

  const sharedMotion = params.get("motionConfig") ? motion.decodeMotionConfig(params.get("motionConfig")) : null
  const storedMotion = loadJson("red-motion-working-config-v2", null)
  const runtimeMotion = window.__RED_MOTION_CONFIG__
  const textMotion = motion.sanitizeMotionConfig(sharedMotion || runtimeMotion || storedMotion || motion.PUBLISHED_MOTION_CONFIG)

  return {
    dither,
    engine,
    publishedDither: PUBLISHED_DITHER_CONFIG,
    motion,
    textMotion,
    activeColor: sanitizeActiveColorConfig(workingConfig),
  }
}

async function buildCombinedRemixUrl() {
  const combined = await getCombinedConfig()
  const url = new URL(location.href)
  url.searchParams.set("ditherHub", "1")
  url.searchParams.set("ditherConfig", combined.engine.encodeConfig(combined.dither, combined.publishedDither))
  url.searchParams.set("motionConfig", combined.motion.encodeMotionConfig(combined.textMotion))
  url.searchParams.set("activeColorConfig", encodeActiveColorConfig(combined.activeColor))
  return url.toString()
}

async function interceptCombinedCopy(event) {
  const actionButton = event.target.closest?.("[data-dither-action]")
  const panel = actionButton?.closest?.(".dither-lab")
  if (!actionButton || !panel || panel !== boundPanel) return
  const action = actionButton.dataset.ditherAction

  if (action === "reset-published") {
    workingConfig = cloneActiveColorConfig(PUBLISHED_ACTIVE_COLOR_CONFIG)
    saveJson(WORKING_KEY, workingConfig)
    syncInputs(panel)
    publishRuntimeConfig(panel)
    return
  }

  if (!["copy-url", "copy-json", "copy-publish"].includes(action)) return
  event.preventDefault()
  event.stopImmediatePropagation()

  const combined = await getCombinedConfig()
  if (action === "copy-url") {
    await copyText(await buildCombinedRemixUrl())
    showToast(panel, "Dither + reveal + color snow URL copied")
    return
  }

  if (action === "copy-json") {
    await copyText(JSON.stringify({
      dither: combined.engine.sanitizeConfig(combined.dither, combined.publishedDither),
      motion: combined.motion.sanitizeMotionConfig(combined.textMotion),
      activeColor: sanitizeActiveColorConfig(combined.activeColor),
    }, null, 2))
    showToast(panel, "Combined config JSON copied")
    return
  }

  const url = await buildCombinedRemixUrl()
  await copyText(`Publish these dither + monochrome reveal + active-color-snow + text-motion defaults for RedHong01/ReDInAStrike.com: ${url}`)
  showToast(panel, "Combined publish prompt copied")
}

function bindSection(panel, section) {
  section.addEventListener("input", (event) => {
    const input = event.target.closest("[data-active-color-param]")
    if (!input || !ACTIVE_COLOR_PARAM_META.has(input.dataset.activeColorParam)) return
    commitWorking(panel, { [input.dataset.activeColorParam]: Number(input.value) })
  })

  section.addEventListener("click", (event) => {
    const preset = event.target.closest("[data-active-color-preset]")?.dataset.activeColorPreset
    if (preset) {
      applyPreset(panel, preset)
      return
    }

    const action = event.target.closest("[data-active-color-action]")?.dataset.activeColorAction
    if (action === "toggle") {
      commitWorking(panel, { activeColorEnabled: !workingConfig.activeColorEnabled })
    } else if (action === "replay") {
      window.__RED_ACTIVE_COLOR_SNOW__?.replay?.(workingConfig)
      showToast(panel, "Color snow replayed")
    }
  })
}

function bindPanel(panel) {
  if (!panel) return false
  if (panel.dataset.activeColorHubBound === "true") {
    boundPanel = panel
    syncInputs(panel)
    publishRuntimeConfig(panel)
    return true
  }

  panel.dataset.activeColorHubBound = "true"
  boundPanel = panel
  ensureStyles()

  const sections = [...panel.querySelectorAll(":scope > .dither-lab__section")]
  const remixSection = sections.find((section) =>
    section.querySelector(".dither-lab__section-head")?.textContent?.trim() === "Remix / Presets",
  )
  const wrapper = document.createElement("div")
  wrapper.innerHTML = renderSection().trim()
  const section = wrapper.firstElementChild
  if (!section) return false
  if (remixSection) panel.insertBefore(section, remixSection)
  else panel.appendChild(section)
  bindSection(panel, section)
  syncInputs(panel)
  publishRuntimeConfig(panel)

  panelObserver?.disconnect()
  panelObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === "data-open")) {
      publishRuntimeConfig(panel)
    }
  })
  panelObserver.observe(panel, { attributes: true, attributeFilter: ["data-open"] })
  return true
}

function tryBind() {
  return bindPanel(document.querySelector(".dither-lab"))
}

workingConfig = loadWorkingConfig()
document.addEventListener("click", (event) => void interceptCombinedCopy(event), true)
if (!tryBind()) {
  const observer = new MutationObserver(() => {
    if (!tryBind()) return
    observer.disconnect()
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
}
