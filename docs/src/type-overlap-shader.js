(() => {
  const STYLE_ID = "red-type-overlap-shader-style"
  const LAYER_CLASS = "type-overlap-shader-layer"
  const SLICE_CLASS = "type-overlap-shader-slice"
  const COPY_CLASS = "type-overlap-shader-copy"
  const LEGACY_ATTRIBUTE = "data-type-overlap-shader"
  const MIN_OVERLAP_PX = 1.2
  const TARGET_SELECTOR = [
    ".site-header .brand",
    ".site-header .nav-title",
    ".site-header .nav-detail.is-typewriter-visible",
  ].join(",")

  let frame = 0
  let observer = null
  let resizeObserver = null
  let observedHeader = null
  let observedElements = new WeakSet()

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID)
    if (style) return
    style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = `
      @supports (mix-blend-mode: difference) {
        .site-header .${LAYER_CLASS} {
          position: fixed;
          inset: 0;
          z-index: 3;
          overflow: visible;
          pointer-events: none;
          contain: layout style;
        }

        .site-header .${SLICE_CLASS} {
          position: fixed;
          overflow: hidden;
          pointer-events: none;
        }

        .site-header .${COPY_CLASS} {
          position: absolute !important;
          margin: 0 !important;
          padding: 0 !important;
          max-width: none !important;
          max-height: none !important;
          min-width: 0 !important;
          min-height: 0 !important;
          overflow: visible !important;
          visibility: visible !important;
          opacity: 1 !important;
          clip-path: none !important;
          transform: none !important;
          translate: none !important;
          pointer-events: none !important;
          color: #fff !important;
          mix-blend-mode: difference;
          text-shadow: none !important;
        }

        .site-header .${COPY_CLASS} * {
          color: #fff !important;
          opacity: 1 !important;
          visibility: visible !important;
          text-shadow: none !important;
        }

        .site-header .${COPY_CLASS}.brand .brand-logo,
        .site-header .${COPY_CLASS} .brand-logo {
          filter: invert(1);
        }
      }
    `
    document.head.appendChild(style)
  }

  function schedule() {
    if (frame) return
    frame = requestAnimationFrame(measure)
  }

  function ownerFor(element) {
    return element.closest(".nav-item") || element.closest(".brand") || element
  }

  function isVisible(element, rect) {
    if (!element?.isConnected || !rect || rect.width <= 1 || rect.height <= 1) return false
    const style = getComputedStyle(element)
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number.parseFloat(style.opacity || "1") > 0.01
    )
  }

  function intersectionRect(a, b) {
    const left = Math.max(a.left, b.left)
    const top = Math.max(a.top, b.top)
    const right = Math.min(a.right, b.right)
    const bottom = Math.min(a.bottom, b.bottom)
    const width = right - left
    const height = bottom - top
    if (width <= MIN_OVERLAP_PX || height <= MIN_OVERLAP_PX) return null
    return { left, top, right, bottom, width, height }
  }

  function collectTargets(header) {
    return [...header.querySelectorAll(TARGET_SELECTOR)]
      .filter((element) => !element.closest(`.${LAYER_CLASS}`))
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          element,
          owner: ownerFor(element),
          rect,
          visible: isVisible(element, rect),
        }
      })
      .filter((item) => item.visible)
  }

  function priorityFor(element) {
    if (element.closest(".brand")) return 100

    const item = element.closest(".nav-item")
    const selected =
      item?.classList.contains("is-nav-active") ||
      (
        item?.classList.contains("is-nav-locked") &&
        !item?.classList.contains("is-nav-lock-suppressed")
      ) ||
      item?.matches(":focus-visible") ||
      item?.matches(":hover")

    if (selected && element.classList.contains("nav-title")) return 82
    if (selected && element.classList.contains("nav-detail")) return 78
    if (element.classList.contains("nav-title")) return 46
    if (element.classList.contains("nav-detail")) return 42
    return 20
  }

  function lowerPriorityTarget(a, b) {
    const priorityA = priorityFor(a.element)
    const priorityB = priorityFor(b.element)
    if (priorityA < priorityB) return a
    if (priorityB < priorityA) return b
    return a.rect.left > b.rect.left || a.rect.top > b.rect.top ? a : b
  }

  function ensureLayer(header) {
    let layer = header.querySelector(`:scope > .${LAYER_CLASS}`)
    if (layer) return layer
    layer = document.createElement("div")
    layer.className = LAYER_CLASS
    layer.setAttribute("aria-hidden", "true")
    header.appendChild(layer)
    return layer
  }

  function px(value) {
    return `${Number(value).toFixed(2)}px`
  }

  function applyTextMetrics(copy, source, sourceRect, clipRect) {
    const style = getComputedStyle(source)
    copy.style.left = px(sourceRect.left - clipRect.left)
    copy.style.top = px(sourceRect.top - clipRect.top)
    copy.style.width = px(sourceRect.width)
    copy.style.height = px(sourceRect.height)
    copy.style.display = style.display === "inline" ? "block" : style.display
    copy.style.fontFamily = style.fontFamily
    copy.style.fontSize = style.fontSize
    copy.style.fontStyle = style.fontStyle
    copy.style.fontWeight = style.fontWeight
    copy.style.lineHeight = style.lineHeight
    copy.style.letterSpacing = style.letterSpacing
    copy.style.textAlign = style.textAlign
    copy.style.textTransform = style.textTransform
    copy.style.whiteSpace = style.whiteSpace
  }

  function makeSlice(layer, source, sourceRect, clipRect) {
    const slice = document.createElement("div")
    slice.className = SLICE_CLASS
    slice.style.left = px(clipRect.left)
    slice.style.top = px(clipRect.top)
    slice.style.width = px(clipRect.width)
    slice.style.height = px(clipRect.height)

    const copy = source.cloneNode(true)
    copy.classList.add(COPY_CLASS)
    copy.removeAttribute("id")
    copy.removeAttribute(LEGACY_ATTRIBUTE)
    copy.setAttribute("aria-hidden", "true")
    applyTextMetrics(copy, source, sourceRect, clipRect)

    copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"))
    copy.querySelectorAll(`[${LEGACY_ATTRIBUTE}]`).forEach((node) => {
      node.removeAttribute(LEGACY_ATTRIBUTE)
    })

    slice.appendChild(copy)
    layer.appendChild(slice)
  }

  function clearLegacyAttributes(header) {
    header.querySelectorAll(`[${LEGACY_ATTRIBUTE}]`).forEach((element) => {
      element.removeAttribute(LEGACY_ATTRIBUTE)
    })
  }

  function renderSlices(header, targets) {
    const layer = ensureLayer(header)
    layer.replaceChildren()

    for (let i = 0; i < targets.length; i += 1) {
      for (let j = i + 1; j < targets.length; j += 1) {
        const a = targets[i]
        const b = targets[j]
        if (a.owner === b.owner) continue

        const overlap = intersectionRect(a.rect, b.rect)
        if (!overlap) continue
        const target = lowerPriorityTarget(a, b)
        makeSlice(layer, target.element, target.rect, overlap)
      }
    }
  }

  function observeElement(element) {
    if (!resizeObserver || observedElements.has(element)) return
    observedElements.add(element)
    resizeObserver.observe(element)
  }

  function bindHeader(header) {
    if (observedHeader === header) return
    observedHeader = header
    resizeObserver?.disconnect()
    observedElements = new WeakSet()
    resizeObserver = "ResizeObserver" in window ? new ResizeObserver(schedule) : null
    if (resizeObserver && header) observeElement(header)
  }

  function measure() {
    frame = 0
    const header = document.querySelector(".site-header")
    if (!header) return
    bindHeader(header)
    clearLegacyAttributes(header)

    const targets = collectTargets(header)
    targets.forEach((item) => observeElement(item.element))
    renderSlices(header, targets)
  }

  function start() {
    ensureStyle()
    observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.target?.closest?.(`.${LAYER_CLASS}`))) return
      schedule()
    })
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "data-nav-density",
        "data-header-compact",
        "data-layout-transition",
        "data-typewriter-nav",
      ],
    })

    window.addEventListener("resize", schedule, { passive: true })
    window.visualViewport?.addEventListener("resize", schedule, { passive: true })
    window.visualViewport?.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("red:header-motion", schedule)
    window.addEventListener("red:route-change", schedule)
    document.fonts?.ready?.then(schedule).catch?.(() => {})
    schedule()
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()
