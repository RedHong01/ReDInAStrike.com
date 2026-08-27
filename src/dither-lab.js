import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import {
  CONTROL_GROUPS,
  DITHER_MODES,
  PARAM_META,
  cloneConfig,
  configsEqual,
  decodeConfig,
  encodeConfig,
  renderCard,
  resetSampleCache,
  sanitizeConfig,
} from "./dither-engine.js"

const WORKING_CONFIG_KEY = "red-dither-working-config-v2"
const PRESETS_KEY = "red-dither-presets-v2"
const LEGACY_MODE_KEY = "red-dither-mode"
const MODE_IDS = new Set(DITHER_MODES.map(([id]) => id))

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
  const encoded = new URLSearchParams(location.search).get("ditherConfig")
  return encoded ? decodeConfig(encoded, PUBLISHED_DITHER_CONFIG) : null
}

function hubRequestedFromUrl() {
  const params = new URLSearchParams(location.search)
  return params.get("ditherHub") === "1" || params.has("ditherConfig")
}

function loadWorkingConfig() {
  const shared = configFromUrl()
  if (shared) return shared

  const stored = loadJson(WORKING_CONFIG_KEY, null)
  if (stored) return sanitizeConfig(stored, PUBLISHED_DITHER_CONFIG)

  const legacyMode = localStorage.getItem(LEGACY_MODE_KEY)
  if (legacyMode && MODE_IDS.has(legacyMode)) {
    return sanitizeConfig({ mode: legacyMode === "dot" ? "native" : legacyMode }, PUBLISHED_DITHER_CONFIG)
  }

  return cloneConfig(PUBLISHED_DITHER_CONFIG, PUBLISHED_DITHER_CONFIG)
}

function loadPresets() {
  const raw = loadJson(PRESETS_KEY, [])
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item) => item && typeof item.name === "string" && item.config)
    .map((item) => ({
      id: String(item.id || `${Date.now()}-${Math.random()}`),
      name: item.name.trim().slice(0, 48) || "Untitled",
      config: sanitizeConfig(item.config, PUBLISHED_DITHER_CONFIG),
      createdAt: Number(item.createdAt) || Date.now(),
    }))
}

const state = {
  hubEnabled: hubRequestedFromUrl(),
  workingConfig: loadWorkingConfig(),
  config: null,
  presets: loadPresets(),
  raf: 0,
  observer: null,
  resizeObserver: null,
  panel: null,
  toastTimer: 0,
}

state.config = state.hubEnabled
  ? cloneConfig(state.workingConfig, PUBLISHED_DITHER_CONFIG)
  : cloneConfig(PUBLISHED_DITHER_CONFIG, PUBLISHED_DITHER_CONFIG)

function persistWorking() {
  state.workingConfig = cloneConfig(state.config, PUBLISHED_DITHER_CONFIG)
  saveJson(WORKING_CONFIG_KEY, state.workingConfig)
}

function setHubEnabled(enabled) {
  state.hubEnabled = !!enabled
  state.config = state.hubEnabled
    ? cloneConfig(state.workingConfig, PUBLISHED_DITHER_CONFIG)
    : cloneConfig(PUBLISHED_DITHER_CONFIG, PUBLISHED_DITHER_CONFIG)
  if (state.panel) state.panel.dataset.open = state.hubEnabled ? "true" : "false"
  requestRender()
}

function renderAll() {
  state.raf = 0
  document.querySelectorAll(".project-card").forEach((card) => renderCard(card, state.config))
  updatePanel()
}

function requestRender() {
  if (state.raf) return
  state.raf = requestAnimationFrame(renderAll)
}

function setMode(mode) {
  if (!MODE_IDS.has(mode)) return
  state.config.mode = mode
  if (state.hubEnabled) persistWorking()
  requestRender()
}

function setParam(key, rawValue) {
  const meta = PARAM_META.get(key)
  if (!meta) return
  const next = sanitizeConfig({ ...state.config, [key]: Number(rawValue) }, PUBLISHED_DITHER_CONFIG)
  const previousColumns = state.config.columns
  state.config = next
  if (key === "columns" && state.config.columns !== previousColumns) resetSampleCache()
  if (state.hubEnabled) persistWorking()
  requestRender()
}

function formatValue(meta, value) {
  return `${Number(value).toFixed(meta.decimals ?? 2)}${meta.suffix || ""}`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderControl(control) {
  return `
    <label class="dither-lab__control">
      <span class="dither-lab__control-head">
        <span>${control.label}</span>
        <output data-dither-output="${control.key}"></output>
      </span>
      <input class="dither-lab__range" type="range"
        min="${control.min}" max="${control.max}" step="${control.step}"
        data-dither-param="${control.key}" />
    </label>`
}

function renderGroup(group) {
  return `
    <section class="dither-lab__section">
      <div class="dither-lab__section-head">${group.title}</div>
      <p class="dither-lab__section-copy">${group.description}</p>
      <div class="dither-lab__controls">${group.controls.map(renderControl).join("")}</div>
    </section>`
}

function presetOptions() {
  if (!state.presets.length) return `<option value="">No saved presets</option>`
  return [
    `<option value="">Select preset…</option>`,
    ...state.presets.map((preset) => `<option value="${preset.id}">${escapeHtml(preset.name)}</option>`),
  ].join("")
}

function mountPanel() {
  if (state.panel?.isConnected) return
  const panel = document.createElement("aside")
  panel.className = "dither-lab"
  panel.dataset.open = state.hubEnabled ? "true" : "false"
  panel.innerHTML = `
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
        ${DITHER_MODES.map(([id, label], index) => `
          <button class="dither-lab__button" type="button" data-dither-mode="${id}">
            <span class="dither-lab__number">${index + 1}</span><span>${label}</span>
          </button>`).join("")}
      </div>
    </section>

    ${CONTROL_GROUPS.map(renderGroup).join("")}

    <section class="dither-lab__section">
      <div class="dither-lab__section-head">Remix / Presets</div>
      <p class="dither-lab__section-copy">Working changes autosave in this browser. Snapshots let you keep multiple versions without changing the public site.</p>
      <div class="dither-lab__preset-row">
        <input class="dither-lab__text" type="text" maxlength="48" placeholder="Preset name" data-dither-preset-name />
        <button class="dither-lab__action" type="button" data-dither-action="save-preset">Save snapshot</button>
      </div>
      <div class="dither-lab__preset-row">
        <select class="dither-lab__select" data-dither-preset-select>${presetOptions()}</select>
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

    <div class="dither-lab__toast" data-dither-toast aria-live="polite"></div>`

  panel.addEventListener("click", onPanelClick)
  panel.addEventListener("input", onPanelInput)
  document.body.appendChild(panel)
  state.panel = panel
  updatePanel()
}

function updatePanel() {
  if (!state.panel) return
  state.panel.dataset.open = state.hubEnabled ? "true" : "false"

  state.panel.querySelectorAll("[data-dither-mode]").forEach((button) => {
    const active = button.dataset.ditherMode === state.config.mode
    button.classList.toggle("is-active", active)
    button.setAttribute("aria-pressed", active ? "true" : "false")
  })

  for (const [key, meta] of PARAM_META) {
    const input = state.panel.querySelector(`[data-dither-param="${key}"]`)
    const output = state.panel.querySelector(`[data-dither-output="${key}"]`)
    if (input && document.activeElement !== input) input.value = state.config[key]
    if (output) output.textContent = formatValue(meta, state.config[key])
  }

  const select = state.panel.querySelector("[data-dither-preset-select]")
  if (select) {
    const selected = select.value
    select.innerHTML = presetOptions()
    if ([...select.options].some((option) => option.value === selected)) select.value = selected
  }

  const status = state.panel.querySelector("[data-dither-status]")
  if (status) {
    status.textContent = configsEqual(state.config, PUBLISHED_DITHER_CONFIG, PUBLISHED_DITHER_CONFIG)
      ? "MATCHES PUBLISHED DEFAULT"
      : "WORKING REMIX · LOCAL"
  }
}

function showToast(message) {
  const toast = state.panel?.querySelector("[data-dither-toast]")
  if (!toast) return
  toast.textContent = message
  toast.classList.add("is-visible")
  clearTimeout(state.toastTimer)
  state.toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800)
}

function onPanelInput(event) {
  const input = event.target.closest("[data-dither-param]")
  if (input) setParam(input.dataset.ditherParam, input.value)
}

function selectedPreset() {
  const select = state.panel?.querySelector("[data-dither-preset-select]")
  return state.presets.find((preset) => preset.id === select?.value) || null
}

function savePreset() {
  const input = state.panel?.querySelector("[data-dither-preset-name]")
  const name = input?.value.trim()
  if (!name) {
    showToast("Name the preset first")
    input?.focus()
    return
  }

  const existing = state.presets.find((preset) => preset.name.toLowerCase() === name.toLowerCase())
  if (existing) {
    existing.config = cloneConfig(state.config, PUBLISHED_DITHER_CONFIG)
    existing.createdAt = Date.now()
  } else {
    state.presets.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.slice(0, 48),
      config: cloneConfig(state.config, PUBLISHED_DITHER_CONFIG),
      createdAt: Date.now(),
    })
  }

  saveJson(PRESETS_KEY, state.presets)
  if (input) input.value = ""
  updatePanel()
  showToast(existing ? "Preset updated" : "Preset saved")
}

function loadPreset() {
  const preset = selectedPreset()
  if (!preset) return showToast("Select a preset")
  state.config = cloneConfig(preset.config, PUBLISHED_DITHER_CONFIG)
  persistWorking()
  resetSampleCache()
  requestRender()
  showToast(`Loaded ${preset.name}`)
}

function deletePreset() {
  const preset = selectedPreset()
  if (!preset) return showToast("Select a preset")
  state.presets = state.presets.filter((item) => item.id !== preset.id)
  saveJson(PRESETS_KEY, state.presets)
  updatePanel()
  showToast(`Deleted ${preset.name}`)
}

function buildRemixUrl() {
  const url = new URL(location.href)
  url.searchParams.set("ditherHub", "1")
  url.searchParams.set("ditherConfig", encodeConfig(state.config, PUBLISHED_DITHER_CONFIG))
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

function onPanelClick(event) {
  const modeButton = event.target.closest("[data-dither-mode]")
  if (modeButton) return setMode(modeButton.dataset.ditherMode)

  const action = event.target.closest("[data-dither-action]")?.dataset.ditherAction
  if (!action) return

  if (action === "close") setHubEnabled(false)
  else if (action === "save-preset") savePreset()
  else if (action === "load-preset") loadPreset()
  else if (action === "delete-preset") deletePreset()
  else if (action === "reset-published") {
    state.config = cloneConfig(PUBLISHED_DITHER_CONFIG, PUBLISHED_DITHER_CONFIG)
    persistWorking()
    resetSampleCache()
    requestRender()
    showToast("Reset to published default")
  } else if (action === "copy-url") {
    copyText(buildRemixUrl()).then(() => showToast("Remix URL copied"))
  } else if (action === "copy-json") {
    copyText(JSON.stringify(sanitizeConfig(state.config, PUBLISHED_DITHER_CONFIG), null, 2)).then(() => showToast("Config JSON copied"))
  } else if (action === "copy-publish") {
    const prompt = `Publish this dither remix as the public default for RedHong01/ReDInAStrike.com: ${buildRemixUrl()}`
    copyText(prompt).then(() => showToast("Publish prompt copied"))
  }
}

function bindObservers() {
  state.observer?.disconnect()
  state.resizeObserver?.disconnect()
  const catalog = document.querySelector(".catalog")
  if (!catalog) return

  state.observer = new MutationObserver(requestRender)
  state.observer.observe(catalog, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class", "data-active-filter"],
  })

  if ("ResizeObserver" in window) {
    state.resizeObserver = new ResizeObserver(requestRender)
    catalog.querySelectorAll(".project-media").forEach((media) => state.resizeObserver.observe(media))
  }

  catalog.querySelectorAll("img").forEach((img) => img.addEventListener("load", requestRender, { passive: true }))
}

function boot() {
  mountPanel()
  bindObservers()
  requestRender()
}

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const tag = document.activeElement?.tagName
  const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"

  if (!typing && event.shiftKey && event.key.toLowerCase() === "d") {
    event.preventDefault()
    setHubEnabled(!state.hubEnabled)
    return
  }

  if (!state.hubEnabled || typing) return
  const index = Number(event.key) - 1
  if (index >= 0 && index < DITHER_MODES.length) setMode(DITHER_MODES[index][0])
})

window.addEventListener("resize", requestRender, { passive: true })
window.addEventListener("hashchange", () => setTimeout(() => {
  bindObservers()
  requestRender()
}, 0))

const appRoot = document.querySelector("#app")
if (appRoot) {
  new MutationObserver(() => {
    bindObservers()
    requestRender()
  }).observe(appRoot, { childList: true })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true })
else boot()
