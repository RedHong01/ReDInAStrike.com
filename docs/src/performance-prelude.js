(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get("perf") === "0") return

  const ROOT_CLASS = "red-perf-pass-1"
  const PROJECT_MEDIA_SETTLE_MS = 120
  const LAYOUT_LOGO_BUCKET_PX = 4
  const LAYOUT_HEADER_BUCKET_PX = 2
  const HEADER_HEIGHT_VISUAL_STEP_PX = 1
  const LOGO_VISUAL_STEP_PX = 0.5

  document.documentElement.classList.add(ROOT_CLASS)
  document.documentElement.dataset.performancePass = "1"

  window.__RED_PERF__ = Object.freeze({
    version: 1,
    projectMediaSettleMs: PROJECT_MEDIA_SETTLE_MS,
    layoutLogoBucketPx: LAYOUT_LOGO_BUCKET_PX,
    layoutHeaderBucketPx: LAYOUT_HEADER_BUCKET_PX,
    headerHeightVisualStepPx: HEADER_HEIGHT_VISUAL_STEP_PX,
    logoVisualStepPx: LOGO_VISUAL_STEP_PX,
  })

  const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty
  const rootStyle = document.documentElement.style
  const pendingHeaderProperties = new Map()
  const headerStyleCache = new Map()
  const rootProxyCache = new Map()
  let header = null

  const HEADER_ONLY_PROPERTIES = new Set([
    "--nav-scale",
    "--detail-opacity",
    "--glass-alpha",
    "--glass-blur",
    "--header-glass-shadow-alpha",
    "--header-rule-alpha",
  ])

  function resolveHeader() {
    if (header?.isConnected) return header
    header = document.querySelector(".site-header")
    if (header) flushPendingHeaderProperties()
    return header
  }

  function writeNative(style, name, value, priority = "") {
    nativeSetProperty.call(style, name, String(value), priority || "")
  }

  function quantizedPx(value, step) {
    const numeric = Number.parseFloat(value)
    if (!Number.isFinite(numeric) || !String(value).trim().endsWith("px")) return String(value)
    const quantized = Math.round(numeric / step) * step
    const rounded = Math.round(quantized * 100) / 100
    return `${rounded}px`
  }

  function setHeaderProperty(name, value, priority = "") {
    const next = String(value)
    if (headerStyleCache.get(name) === next) return
    const target = resolveHeader()
    if (!target) {
      pendingHeaderProperties.set(name, [next, priority])
      return
    }
    headerStyleCache.set(name, next)
    writeNative(target.style, name, next, priority)
  }

  function flushPendingHeaderProperties() {
    if (!header?.isConnected || !pendingHeaderProperties.size) return
    for (const [name, [value, priority]] of pendingHeaderProperties) {
      headerStyleCache.set(name, value)
      writeNative(header.style, name, value, priority)
    }
    pendingHeaderProperties.clear()
  }

  function setRootProxy(name, value, priority = "") {
    const next = String(value)
    if (rootProxyCache.get(name) === next) return
    rootProxyCache.set(name, next)
    writeNative(rootStyle, name, next, priority)
  }

  CSSStyleDeclaration.prototype.setProperty = function performanceScopedSetProperty(name, value, priority) {
    if (this !== rootStyle || typeof name !== "string") {
      return nativeSetProperty.call(this, name, value, priority)
    }

    if (name === "--logo-size") {
      const visualValue = quantizedPx(value, LOGO_VISUAL_STEP_PX)
      setHeaderProperty("--logo-size", visualValue, priority)
      setRootProxy("--perf-layout-logo-size", quantizedPx(value, LAYOUT_LOGO_BUCKET_PX), priority)
      return
    }

    if (name === "--header-height") {
      const visualValue = quantizedPx(value, HEADER_HEIGHT_VISUAL_STEP_PX)
      setHeaderProperty("--header-height", visualValue, priority)
      setRootProxy("--perf-layout-header-height", quantizedPx(value, LAYOUT_HEADER_BUCKET_PX), priority)
      return
    }

    if (HEADER_ONLY_PROPERTIES.has(name)) {
      setHeaderProperty(name, value, priority)
      return
    }

    return nativeSetProperty.call(this, name, value, priority)
  }

  try {
    const rootComputed = getComputedStyle(document.documentElement)
    setRootProxy(
      "--perf-layout-logo-size",
      quantizedPx(rootComputed.getPropertyValue("--logo-size") || "150px", LAYOUT_LOGO_BUCKET_PX),
    )
    setRootProxy(
      "--perf-layout-header-height",
      quantizedPx(rootComputed.getPropertyValue("--header-height") || "200px", LAYOUT_HEADER_BUCKET_PX),
    )
  } catch {}

  if (document.body) {
    const headerMountObserver = new MutationObserver(() => {
      if (!resolveHeader()) return
      headerMountObserver.disconnect()
    })
    headerMountObserver.observe(document.body, { childList: true, subtree: true })
  }

  const NativeResizeObserver = window.ResizeObserver
  if (typeof NativeResizeObserver === "function") {
    class SettledResizeObserver {
      constructor(callback) {
        if (typeof callback !== "function") throw new TypeError("ResizeObserver callback must be a function")
        this.callback = callback
        this.pending = new Map()
        this.seen = new WeakMap()
        this.timer = 0
        this.native = new NativeResizeObserver((entries) => this.handle(entries))
      }

      handle(entries) {
        const immediate = []
        let hasDeferred = false

        for (const entry of entries) {
          const target = entry.target
          const isProjectMedia = target?.classList?.contains("project-media")
          if (!isProjectMedia) {
            immediate.push(entry)
            continue
          }

          const width = Math.round((entry.contentRect?.width || 0) * 2) / 2
          const height = Math.round((entry.contentRect?.height || 0) * 2) / 2
          const previous = this.seen.get(target)
          this.seen.set(target, { width, height })

          if (!previous) {
            immediate.push(entry)
            continue
          }

          if (previous.width === width && previous.height === height) continue
          this.pending.set(target, entry)
          hasDeferred = true
        }

        if (immediate.length) this.callback(immediate, this)
        if (!hasDeferred) return

        clearTimeout(this.timer)
        this.timer = window.setTimeout(() => this.flush(), PROJECT_MEDIA_SETTLE_MS)
      }

      flush() {
        clearTimeout(this.timer)
        this.timer = 0
        if (!this.pending.size) return
        const entries = [...this.pending.values()]
        this.pending.clear()
        this.callback(entries, this)
      }

      observe(target, options) {
        this.native.observe(target, options)
      }

      unobserve(target) {
        this.pending.delete(target)
        this.native.unobserve(target)
      }

      disconnect() {
        clearTimeout(this.timer)
        this.timer = 0
        this.pending.clear()
        this.native.disconnect()
      }

      takeRecords() {
        return typeof this.native.takeRecords === "function" ? this.native.takeRecords() : []
      }
    }

    try {
      Object.defineProperty(window, "ResizeObserver", {
        configurable: true,
        writable: true,
        value: SettledResizeObserver,
      })
    } catch {
      window.ResizeObserver = SettledResizeObserver
    }
  }
})()
