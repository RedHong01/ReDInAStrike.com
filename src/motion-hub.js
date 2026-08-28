import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { decodeConfig, encodeConfig, sanitizeConfig } from "./dither-engine.js"
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
let workingConfig = loadWorkingConfig()
let currentRuntimeConfig = cloneMotionConfig(PUBLISHED_MOTION_CONFIG)
let bodyObserver = null
let syncFrame = 0

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

function panelIsOpen(panel = document.querySelector(".dither-lab")) {
  return panel?.dataset.open === "true"
}

function runtimeConfigForPanel(panel) {
  return panelIsOpen(panel) ? workingConfig : PUBLISHED_MOTION_CONFIG
}

function publishRuntimeConfig(panel = document.querySelector(".dither-lab")) {
  currentRuntimeConfig = cloneMotionConfig(runtimeConfigForPanel(panel))
  window.__RED_MOTION_CONFIG__ = currentRuntimeConfig
  window.dispatchEvent(new CustomEvent("red:motion-config", { detail: currentRuntimeConfig }))
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

function readDitherWorkingConfig() {
  const encoded = new URLSearchParams(location.search).get("ditherConfig")
  if (encoded) {
    const shared = decodeConfig(encoded, PUBLISHED_DITHER_CONFIG)
    if (shared) return shared
  }
  const stored = loadJson("red-dither-working-config-v2", null)
  return stored
    ? sanitizeConfig(stored, PUBLISHED_DITHER_CONFIG)
    : sanitizeConfig(PUBLISHED_DITHER_CONFIG, PUBLISHED_DITHER_CONFIG)
}

function buildCombinedRemixUrl() {
  const url = new URL(location.href)
  const ditherConfig = readDitherWorkingConfig()
  url.searchParams.set("ditherHub", "1")
  url.searchParams.set("ditherConfig", encodeConfig(ditherConfig, PUBLISHED_DITHER_CONFIG))
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
  clearTimeout(showToast.timer)
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1800)
}

function interceptCombinedCopy(event, panel) {
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

  const dither = readDitherWorkingConfig()
  const combinedUrl = buildCombinedRemixUrl()

  if (action === "copy-url") {
    copyText(combinedUrl).then(() => showToast(panel, "Dither + motion remix URL copied"))
  } else if (action === "copy-json") {
    copyText(JSON.stringify({
      dither: sanitizeConfig(dither, PUBLISHED_DITHER_CONFIG),
      motion: sanitizeMotionConfig(workingConfig),
    }, null, 2)).then(() => showToast(panel, "Combined config JSON copied"))
  } else {
    const prompt = `Publish these dither + text-motion defaults for RedHong01/ReDInAStrike.com: ${combinedUrl}`
    copyText(prompt).then(() => showToast(panel, "Combined publish prompt copied"))
  }
}

function mountIntoPanel(panel) {
  if (!panel || panel.dataset.motionHubBound === "true") {
    if (panel) syncPanelInputs(panel)
    return
  }

  panel.dataset.motionHubBound = "true"
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

  panel.addEventListener("click", (event) => interceptCombinedCopy(event, panel), true)
  syncPanelInputs(panel)
  publishRuntimeConfig(panel)
}

function scheduleSync() {
  if (syncFrame) return
  syncFrame = requestAnimationFrame(() => {
    syncFrame = 0
    const panel = document.querySelector(".dither-lab")
    if (panel) mountIntoPanel(panel)
    publishRuntimeConfig(panel)
  })
}

function boot() {
  window.__RED_MOTION_CONFIG__ = cloneMotionConfig(PUBLISHED_MOTION_CONFIG)
  scheduleSync()

  if ("MutationObserver" in window) {
    bodyObserver = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) =>
        mutation.type === "childList" ||
        (mutation.type === "attributes" && mutation.attributeName === "data-open"),
      )
      if (relevant) scheduleSync()
    })
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-open"],
    })
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
  boot()
}
