(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get("perf") === "0") return

  const ROOT_CLASS = "red-perf-pass-1"
  const PROJECT_MEDIA_SETTLE_MS = 120
  const LAYOUT_LOGO_BUCKET_PX = 4
  const LAYOUT_HEADER_BUCKET_PX = 2
  const HEADER_HEIGHT_VISUAL_STEP_PX = 1
  const LOGO_VISUAL_STEP_PX = 0.5
  const RULE_NATIVE_MARGIN_PX = 460
  const FOOTER_WAKE_MARGIN_PX = 1200
  const GEOMETRY_RESIZE_SETTLE_MS = 140

  document.documentElement.classList.add(ROOT_CLASS)
  document.documentElement.dataset.performancePass = "2"

  const perfState = {
    footerActive: false,
    geometryGeneration: 0,
    nativeRuleRectReads: 0,
    syntheticRuleRectReads: 0,
    nativeFooterRectReads: 0,
    syntheticFooterRectReads: 0,
    suppressedFooterFrames: 0,
  }

  window.__RED_PERF__ = Object.freeze({
    version: 2,
    projectMediaSettleMs: PROJECT_MEDIA_SETTLE_MS,
    layoutLogoBucketPx: LAYOUT_LOGO_BUCKET_PX,
    layoutHeaderBucketPx: LAYOUT_HEADER_BUCKET_PX,
    headerHeightVisualStepPx: HEADER_HEIGHT_VISUAL_STEP_PX,
    logoVisualStepPx: LOGO_VISUAL_STEP_PX,
    ruleNativeMarginPx: RULE_NATIVE_MARGIN_PX,
    footerWakeMarginPx: FOOTER_WAKE_MARGIN_PX,
  })
  window.__RED_PERF_STATE__ = perfState

  const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty
  const nativeGetBoundingClientRect = Element.prototype.getBoundingClientRect
  const nativeAddEventListener = EventTarget.prototype.addEventListener
  const nativeRemoveEventListener = EventTarget.prototype.removeEventListener
  const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window)
  const rootStyle = document.documentElement.style
  const pendingHeaderProperties = new Map()
  const headerStyleCache = new Map()
  const rootProxyCache = new Map()
  const geometryCache = new WeakMap()
  const footerPointerWrappers = new WeakMap()
  let header = null
  let currentLayoutHeaderHeight = 200
  let geometryGeneration = 0
  let geometryResizeTimer = 0
  let geometrySweepFrame = 0
  let appMutationObserver = null
  let footerWakeObserver = null
  let footerWakeTarget = null

  const HEADER_ONLY_PROPERTIES = new Set([
    "--nav-scale",
    "--detail-opacity",
    "--glass-alpha",
    "--glass-blur",
    "--header-glass-shadow-alpha",
    "--header-rule-alpha",
  ])
  const FOOTER_FRAME_CALLBACKS = new Set([
    "animateFooterGallery",
    "animateFooterGalleryLoop",
  ])

  function resolveHeader() {
    if (header?.isConnected) return header
    header = document.querySelector(".site-header")
    if (header) {
      for (const [name, value] of headerStyleCache) {
        writeNative(header.style, name, value)
      }
      flushPendingHeaderProperties()
    }
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
    const target = resolveHeader()
    if (!target) {
      pendingHeaderProperties.set(name, [next, priority])
      return
    }
    if (headerStyleCache.get(name) === next && target.style.getPropertyValue(name) === next) return
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
    if (name === "--perf-layout-header-height") {
      const numeric = Number.parseFloat(next)
      if (Number.isFinite(numeric)) currentLayoutHeaderHeight = numeric
    }
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

  window.requestAnimationFrame = function performanceScopedAnimationFrame(callback) {
    const callbackName = typeof callback === "function" ? callback.name : ""
    if (!perfState.footerActive && FOOTER_FRAME_CALLBACKS.has(callbackName)) {
      perfState.suppressedFooterFrames += 1
      return 0
    }
    return nativeRequestAnimationFrame(callback)
  }

  function isProjectRuleTarget(element) {
    if (!element?.classList) return false
    if (element.classList.contains("project-row")) return true
    return Boolean(
      element.classList.contains("project-card") &&
      element.previousElementSibling?.classList?.contains("project-card")
    )
  }

  function isFooterGeometryTarget(element) {
    return Boolean(element?.classList?.contains("about-section"))
  }

  function syntheticRect(record) {
    const scrollX = window.scrollX || window.pageXOffset || 0
    const scrollY = window.scrollY || window.pageYOffset || 0
    const headerDelta = currentLayoutHeaderHeight - record.headerHeight
    const left = record.documentLeft - scrollX
    const top = record.documentTop + headerDelta - scrollY
    if (typeof DOMRect === "function") {
      return new DOMRect(left, top, record.width, record.height)
    }
    return {
      x: left,
      y: top,
      top,
      left,
      width: record.width,
      height: record.height,
      right: left + record.width,
      bottom: top + record.height,
      toJSON() { return this },
    }
  }

  function cacheNativeRect(element, rect) {
    geometryCache.set(element, {
      generation: geometryGeneration,
      documentLeft: rect.left + (window.scrollX || window.pageXOffset || 0),
      documentTop: rect.top + (window.scrollY || window.pageYOffset || 0),
      width: rect.width,
      height: rect.height,
      headerHeight: currentLayoutHeaderHeight,
    })
    return rect
  }

  function isSyntheticRectNearViewport(rect, margin = RULE_NATIVE_MARGIN_PX) {
    const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
    return rect.bottom >= -margin && rect.top <= viewportHeight + margin
  }

  Element.prototype.getBoundingClientRect = function performanceScopedBoundingRect() {
    const isRuleTarget = isProjectRuleTarget(this)
    const isFooterTarget = isFooterGeometryTarget(this)
    if (!isRuleTarget && !isFooterTarget) {
      return nativeGetBoundingClientRect.call(this)
    }

    const cached = geometryCache.get(this)
    if (cached && cached.generation === geometryGeneration) {
      const projected = syntheticRect(cached)
      if (isRuleTarget && !isSyntheticRectNearViewport(projected)) {
        perfState.syntheticRuleRectReads += 1
        return projected
      }
      if (isFooterTarget && !perfState.footerActive) {
        perfState.syntheticFooterRectReads += 1
        return projected
      }
    }

    const rect = nativeGetBoundingClientRect.call(this)
    if (isRuleTarget) perfState.nativeRuleRectReads += 1
    if (isFooterTarget) perfState.nativeFooterRectReads += 1
    return cacheNativeRect(this, rect)
  }

  function setFooterActive(active) {
    const next = Boolean(active)
    if (perfState.footerActive === next) return
    perfState.footerActive = next
    document.documentElement.dataset.footerPerfActive = next ? "true" : "false"

    if (next) {
      nativeRequestAnimationFrame(() => {
        window.dispatchEvent(new Event("scroll"))
      })
    }
  }

  function footerPointerWrapper(listener) {
    if (footerPointerWrappers.has(listener)) return footerPointerWrappers.get(listener)
    const wrapped = function performanceFooterPointerMove(event) {
      if (!perfState.footerActive) return
      return listener.call(this, event)
    }
    footerPointerWrappers.set(listener, wrapped)
    return wrapped
  }

  EventTarget.prototype.addEventListener = function performanceScopedAddEventListener(type, listener, options) {
    if (
      this === window &&
      type === "pointermove" &&
      typeof listener === "function" &&
      listener.name === "updateFooterGalleryPointer"
    ) {
      return nativeAddEventListener.call(this, type, footerPointerWrapper(listener), options)
    }
    return nativeAddEventListener.call(this, type, listener, options)
  }

  EventTarget.prototype.removeEventListener = function performanceScopedRemoveEventListener(type, listener, options) {
    if (
      this === window &&
      type === "pointermove" &&
      typeof listener === "function" &&
      footerPointerWrappers.has(listener)
    ) {
      return nativeRemoveEventListener.call(this, type, footerPointerWrappers.get(listener), options)
    }
    return nativeRemoveEventListener.call(this, type, listener, options)
  }

  function invalidateGeometry() {
    geometryGeneration += 1
    perfState.geometryGeneration = geometryGeneration
  }

  function scheduleGeometryResizeInvalidation() {
    clearTimeout(geometryResizeTimer)
    geometryResizeTimer = window.setTimeout(() => {
      geometryResizeTimer = 0
      invalidateGeometry()
      setupFooterWakeObserver(true)
    }, GEOMETRY_RESIZE_SETTLE_MS)
  }

  function mutationTouchesProjectStructure(mutation) {
    if (mutation.type !== "childList") return false
    const nodes = [...mutation.addedNodes, ...mutation.removedNodes]
    return nodes.some((node) => {
      if (!(node instanceof Element)) return false
      return Boolean(
        node.matches?.(".project-row, .project-card, .catalog, .about-section") ||
        node.querySelector?.(".project-row, .project-card, .catalog, .about-section")
      )
    })
  }

  function setupFooterWakeObserver(force = false) {
    const nextTarget = document.querySelector(".about-section")
    if (!force && nextTarget === footerWakeTarget) return

    footerWakeObserver?.disconnect()
    footerWakeObserver = null
    footerWakeTarget = nextTarget || null

    if (!footerWakeTarget) {
      setFooterActive(false)
      return
    }

    if (!("IntersectionObserver" in window)) {
      setFooterActive(true)
      return
    }

    const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
    const wakeMargin = Math.max(FOOTER_WAKE_MARGIN_PX, Math.round(viewportHeight * 1.2))
    footerWakeObserver = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (entry) setFooterActive(entry.isIntersecting)
    }, {
      root: null,
      rootMargin: `${wakeMargin}px 0px`,
      threshold: 0,
    })
    footerWakeObserver.observe(footerWakeTarget)
  }

  function scheduleObserverSweep() {
    if (geometrySweepFrame) return
    geometrySweepFrame = nativeRequestAnimationFrame(() => {
      geometrySweepFrame = 0
      sweepDetachedResizeTargets()
      setupFooterWakeObserver()
    })
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

  const settledObservers = new Set()
  const NativeResizeObserver = window.ResizeObserver
  if (typeof NativeResizeObserver === "function") {
    class SettledResizeObserver {
      constructor(callback) {
        if (typeof callback !== "function") throw new TypeError("ResizeObserver callback must be a function")
        this.callback = callback
        this.pending = new Map()
        this.seen = new WeakMap()
        this.targets = new Set()
        this.timer = 0
        this.native = new NativeResizeObserver((entries) => this.handle(entries))
        settledObservers.add(this)
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
        settledObservers.add(this)
        this.targets.add(target)
        this.native.observe(target, options)
      }

      unobserve(target) {
        this.pending.delete(target)
        this.targets.delete(target)
        this.native.unobserve(target)
      }

      disconnect() {
        clearTimeout(this.timer)
        this.timer = 0
        this.pending.clear()
        this.targets.clear()
        this.native.disconnect()
        settledObservers.delete(this)
      }

      sweepDetached() {
        for (const target of [...this.targets]) {
          if (target?.isConnected) continue
          this.pending.delete(target)
          this.targets.delete(target)
          this.native.unobserve(target)
        }
        if (!this.targets.size) {
          this.native.disconnect()
          settledObservers.delete(this)
        }
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

  function sweepDetachedResizeTargets() {
    for (const observer of [...settledObservers]) observer.sweepDetached?.()
  }

  function setupAppMutationObserver() {
    const app = document.querySelector("#app")
    if (!app || !("MutationObserver" in window)) return

    appMutationObserver?.disconnect()
    appMutationObserver = new MutationObserver((mutations) => {
      if (mutations.some(mutationTouchesProjectStructure)) invalidateGeometry()
      scheduleObserverSweep()
    })
    appMutationObserver.observe(app, { childList: true, subtree: true })
    scheduleObserverSweep()
  }

  window.addEventListener("resize", scheduleGeometryResizeInvalidation, { passive: true })
  window.addEventListener("red:layout-geometry-invalidated", invalidateGeometry, { passive: true })

  if (document.body) {
    const headerMountObserver = new MutationObserver(() => {
      if (!resolveHeader()) return
      headerMountObserver.disconnect()
    })
    headerMountObserver.observe(document.body, { childList: true, subtree: true })
    setupAppMutationObserver()
    setupFooterWakeObserver()
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      setupAppMutationObserver()
      setupFooterWakeObserver()
    }, { once: true })
  }
})()
