/*
 * Lazy loader for figma-capture.js (377 KB).
 *
 * The real bundle is only needed when the site owner captures the page into Figma.
 * This stub keeps every entry point callable and pulls the bundle in on first use.
 *
 * Entry points kept working:
 *   window.figma.captureForDesign(options)        - the only surface the bundle puts on window
 *   window.figma.startClipboardFlow(...)          - same argument shape the bundle registers
 *   window.figma.startMultiCaptureAutomaticFlow(...)
 *   window.figma.startMultiCaptureSelectionFlow(...)
 *   window.figma.loadCaptureBundle()              - force the bundle in
 *
 * Eager load (no console interaction needed) when the URL asks for a capture:
 *   #figmacapture=...   - the hash the bundle's own bootstrapper reads
 *   ?figma-state=...    - the state the site's applyFigmaCaptureState() capture flow uses
 *   ?figma-capture=1    - explicit opt-in
 */
;(function () {
  var current = document.currentScript
  var bundleUrl = new URL("figma-capture.js", (current && current.src) || document.baseURI).href

  var figma = (window.figma = window.figma || {})
  var loadPromise = null

  function loadBundle() {
    if (loadPromise) return loadPromise
    loadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script")
      script.src = bundleUrl
      script.async = true
      script.onload = function () {
        resolve(window.figma)
      }
      script.onerror = function () {
        loadPromise = null
        reject(new Error("[figma-capture] failed to load " + bundleUrl))
      }
      ;(document.head || document.documentElement).appendChild(script)
    })
    return loadPromise
  }

  figma.loadCaptureBundle = loadBundle

  // Stub: replaced by the bundle's real implementation once it loads.
  var stub = function captureForDesign(options) {
    return loadBundle().then(function () {
      var real = window.figma && window.figma.captureForDesign
      if (typeof real !== "function" || real === stub) {
        throw new Error("[figma-capture] bundle loaded but captureForDesign was not registered")
      }
      return real(options)
    })
  }
  figma.captureForDesign = stub

  // Same argument shapes the bundle registers internally, routed through captureForDesign.
  figma.startClipboardFlow = function (selector, delayMs, verbose, extractSourceData) {
    return figma.captureForDesign({
      selector: selector,
      delayMs: delayMs,
      verbose: verbose,
      extractSourceData: extractSourceData,
    })
  }

  figma.startMultiCaptureAutomaticFlow = function (captureId, endpoint, selector, delayMs, verbose, extractSourceData) {
    return figma.captureForDesign({
      captureId: captureId,
      endpoint: endpoint,
      selector: selector,
      delayMs: delayMs,
      verbose: verbose,
      extractSourceData: extractSourceData,
    })
  }

  // The selection flow is only reachable through the bundle's own hash bootstrapper
  // (selector "*"), which runs once when the bundle executes. Hand it the hash it expects.
  figma.startMultiCaptureSelectionFlow = function (captureId, endpoint, verbose, extractSourceData) {
    var hash =
      "#figmacapture=" +
      encodeURIComponent(captureId || "") +
      "&figmaendpoint=" +
      encodeURIComponent(endpoint || "") +
      "&figmaselector=*" +
      "&figmalogverbose=" +
      (verbose ? "true" : "false") +
      "&figmasource=" +
      (extractSourceData ? "true" : "false")
    if (loadPromise) {
      // Bundle already ran its bootstrapper; a reload is the only way to re-arm it.
      window.location.hash = hash
      window.location.reload()
      return loadPromise
    }
    window.location.hash = hash
    return loadBundle()
  }

  function urlWantsCapture() {
    if (/^#figmacapture(?:[=&]|$)/.test(window.location.hash)) return true
    var params = new URLSearchParams(window.location.search)
    var state = params.get("figma-state")
    if (state) return true
    var optIn = params.get("figma-capture")
    if (optIn !== null && optIn !== "0" && optIn !== "false") return true
    return false
  }

  if (urlWantsCapture()) loadBundle()
  else
    window.addEventListener("hashchange", function () {
      if (!loadPromise && /^#figmacapture(?:[=&]|$)/.test(window.location.hash)) loadBundle()
    })
})()
