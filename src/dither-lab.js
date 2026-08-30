import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import "./native-halftone-bypass.js?v=20260829-batch2"
import { destroyPublicDitherRuntime } from "./dither-public-scheduler.js?v=20260830-breath5"
import "./scroll-magnet.js?v=20260829-magnet3"
import "./active-color-snow.js?v=20260829-handoff2"
import "./fine-signal-preset-runtime.js?v=20260830-finesignal1"
import "./active-color-replay-dedupe.js?v=20260829-activecolor2"
import "./active-color-transition-bridge.js?v=20260829-activecolor2"
import "./binary-pixel-handoff.js?v=20260830-binary2"

const params = new URLSearchParams(window.location.search)
const autoOpen =
  params.get("ditherHub") === "1" ||
  params.has("ditherConfig") ||
  params.has("motionConfig") ||
  params.has("activeColorConfig")
const publishedNeedsRuntime = PUBLISHED_DITHER_CONFIG?.mode && PUBLISHED_DITHER_CONFIG.mode !== "native"
let corePromise = null
let coreLoaded = false
let cssPromise = null

function ensureCss() {
  if (cssPromise) return cssPromise
  const existing = [...document.styleSheets]
    .map((sheet) => sheet.href || "")
    .find((href) => href.endsWith("/dither-lab.css") || href.endsWith("dither-lab.css"))
  if (existing) {
    cssPromise = Promise.resolve()
    return cssPromise
  }

  cssPromise = new Promise((resolve) => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = new URL("./dither-lab.css", import.meta.url).href
    link.addEventListener("load", resolve, { once: true })
    link.addEventListener("error", resolve, { once: true })
    document.head.appendChild(link)
  })
  return cssPromise
}

async function loadCore() {
  if (!corePromise) {
    corePromise = (async () => {
      window.__RED_NATIVE_HALFTONE_BYPASS__?.destroy?.()
      destroyPublicDitherRuntime?.()
      window.__RED_DITHER_PUBLIC_RUNTIME__?.destroy?.()
      await ensureCss()
      const module = await import("./dither-hub-entry.js")
      coreLoaded = true
      return module
    })()
  }
  return corePromise
}

if (!publishedNeedsRuntime) {
  destroyPublicDitherRuntime?.()
} else if (autoOpen) {
  loadCore()
}

window.addEventListener("keydown", async (event) => {
  if (coreLoaded) return
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const tag = document.activeElement?.tagName
  const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
  if (typing || !event.shiftKey || event.key.toLowerCase() !== "d") return

  event.preventDefault()
  await loadCore()
  requestAnimationFrame(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", {
      key: "d",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }))
  })
}, { passive: false })
