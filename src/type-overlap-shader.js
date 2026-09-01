(() => {
  const STYLE_ID = "red-type-overlap-shader-style"
  const LAYER_CLASS = "type-overlap-shader-layer"
  const SLICE_CLASS = "type-overlap-shader-slice"
  const COPY_CLASS = "type-overlap-shader-copy"
  const CANVAS_CLASS = "type-overlap-shader-canvas"
  const LEGACY_ATTRIBUTE = "data-type-overlap-shader"
  const MIN_OVERLAP_PX = 1.2
  const MASK_MAX_DPR = 2
  const MASK_ALPHA_THRESHOLD = 10
  const MASK_MIN_PIXELS = 2
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
  let pendingMaskImages = new WeakSet()

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
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: 0 0;
          mask-position: 0 0;
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-mode: alpha;
          mask-mode: alpha;
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

        .site-header .${CANVAS_CLASS} {
          position: fixed;
          display: block;
          pointer-events: none;
          mix-blend-mode: difference;
          image-rendering: auto;
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

  function unionRect(a, b) {
    if (!a) return { ...b }
    const left = Math.min(a.left, b.left)
    const top = Math.min(a.top, b.top)
    const right = Math.max(a.right, b.right)
    const bottom = Math.max(a.bottom, b.bottom)
    return { left, top, right, bottom, width: right - left, height: bottom - top }
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

  function numericCss(value, fallback = 0) {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  function parsedLineHeight(style, fontSize) {
    const lineHeight = numericCss(style.lineHeight, NaN)
    if (Number.isFinite(lineHeight)) return lineHeight
    return fontSize * 1.2
  }

  function renderedTextScale(style, rect) {
    const fontSize = numericCss(style.fontSize, 16)
    const lineHeight = parsedLineHeight(style, fontSize)
    if (!lineHeight || rect.height <= 0) return 1
    return Math.max(0.1, rect.height / lineHeight)
  }

  function fontString(style, fontSize) {
    const fontStyle = style.fontStyle || "normal"
    const fontStretch =
      style.fontStretch && style.fontStretch !== "normal" ? style.fontStretch : ""
    const fontWeight = style.fontWeight || "400"
    const fontFamily = style.fontFamily || "serif"
    return [fontStyle, fontStretch, fontWeight, `${fontSize}px`, fontFamily]
      .filter(Boolean)
      .join(" ")
  }

  function normalizedTextAlign(style) {
    const direction = style.direction || "ltr"
    const align = style.textAlign || "left"
    if (align === "start") return direction === "rtl" ? "right" : "left"
    if (align === "end") return direction === "rtl" ? "left" : "right"
    if (align === "match-parent") return direction === "rtl" ? "right" : "left"
    return align
  }

  function textXForAlign(rect, align) {
    if (align === "right") return rect.right
    if (align === "center") return rect.left + rect.width / 2
    return rect.left
  }

  function textWidthWithSpacing(ctx, characters, letterSpacing) {
    return characters.reduce((total, character, index) => {
      return total + ctx.measureText(character).width + (index ? letterSpacing : 0)
    }, 0)
  }

  function drawTextWithSpacing(ctx, text, x, y, align, letterSpacing) {
    const characters = Array.from(text)
    if (!characters.length) return

    if (!letterSpacing || "letterSpacing" in ctx) {
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${letterSpacing || 0}px`
      ctx.fillText(text, x, y)
      return
    }

    const width = textWidthWithSpacing(ctx, characters, letterSpacing)
    let cursor = x
    if (align === "right") cursor -= width
    if (align === "center") cursor -= width / 2

    const previousAlign = ctx.textAlign
    ctx.textAlign = "left"
    characters.forEach((character, index) => {
      if (index) cursor += letterSpacing
      ctx.fillText(character, cursor, y)
      cursor += ctx.measureText(character).width
    })
    ctx.textAlign = previousAlign
  }

  function imageIsDrawable(image) {
    return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
  }

  function requestImageMaskRefresh(image) {
    if (!image || pendingMaskImages.has(image)) return
    pendingMaskImages.add(image)

    const done = () => {
      pendingMaskImages.delete(image)
      schedule()
    }

    image.addEventListener("load", done, { once: true })
    image.addEventListener("error", done, { once: true })
    image.decode?.().then(done).catch(done)
  }

  function drawImageMask(ctx, image, clipRect) {
    if (!imageIsDrawable(image)) {
      requestImageMaskRefresh(image)
      return false
    }

    const rect = image.getBoundingClientRect()
    if (!intersectionRect(rect, clipRect)) return true

    try {
      ctx.drawImage(image, rect.left, rect.top, rect.width, rect.height)
      return true
    } catch {
      return false
    }
  }

  function drawTextMask(ctx, element, rect) {
    const text = (element.textContent || "").replace(/\s+/g, " ").trim()
    if (!text) return true

    const style = getComputedStyle(element)
    const fontSize = numericCss(style.fontSize, 16)
    const scale = renderedTextScale(style, rect)
    const renderedFontSize = Math.max(1, fontSize * scale)
    const align = normalizedTextAlign(style)
    const letterSpacing = Math.max(0, numericCss(style.letterSpacing, 0) * scale)

    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, numericCss(style.opacity, 1)))
    ctx.fillStyle = "#fff"
    ctx.font = fontString(style, renderedFontSize)
    ctx.textBaseline = "alphabetic"
    ctx.textAlign = align
    ctx.direction = style.direction || "ltr"

    const metrics = ctx.measureText(text)
    const ascent = metrics.actualBoundingBoxAscent || renderedFontSize * 0.78
    const descent = metrics.actualBoundingBoxDescent || renderedFontSize * 0.22
    const y = rect.top + (rect.height - ascent - descent) / 2 + ascent
    const x = textXForAlign(rect, align)

    drawTextWithSpacing(ctx, text, x, y, align, letterSpacing)
    ctx.restore()
    return true
  }

  function drawBlockerMask(ctx, blocker, clipRect) {
    const images = [...blocker.element.querySelectorAll("img")]
    if (blocker.element.matches?.("img")) images.unshift(blocker.element)

    if (images.length) {
      return images.reduce((ready, image) => {
        return drawImageMask(ctx, image, clipRect) && ready
      }, true)
    }

    return drawTextMask(ctx, blocker.element, blocker.rect)
  }

  function maskHasVisiblePixels(ctx, width, height) {
    try {
      const data = ctx.getImageData(0, 0, width, height).data
      let visiblePixels = 0
      for (let index = 3; index < data.length; index += 4) {
        if (data[index] > MASK_ALPHA_THRESHOLD) visiblePixels += 1
        if (visiblePixels >= MASK_MIN_PIXELS) return true
      }
      return false
    } catch {
      return true
    }
  }

  function normalizeMaskAlpha(ctx, width, height) {
    try {
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3]
        if (alpha <= MASK_ALPHA_THRESHOLD) {
          data[index] = 0
          data[index + 1] = 0
          data[index + 2] = 0
          data[index + 3] = 0
          continue
        }
        data[index] = 255
        data[index + 1] = 255
        data[index + 2] = 255
        data[index + 3] = alpha
      }
      ctx.putImageData(imageData, 0, 0)
      return true
    } catch {
      return false
    }
  }

  function makeBlockerMaskCanvas(clipRect, blockers) {
    if (!clipRect || !blockers.length) return null

    const dpr = Math.max(1, Math.min(MASK_MAX_DPR, window.devicePixelRatio || 1))
    const width = Math.max(1, Math.ceil(clipRect.width * dpr))
    const height = Math.max(1, Math.ceil(clipRect.height * dpr))
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return null

    ctx.setTransform(dpr, 0, 0, dpr, -clipRect.left * dpr, -clipRect.top * dpr)

    const ready = blockers.reduce((allReady, blocker) => {
      if (!intersectionRect(blocker.rect, clipRect)) return allReady
      return drawBlockerMask(ctx, blocker, clipRect) && allReady
    }, true)

    if (!ready) return null
    normalizeMaskAlpha(ctx, width, height)
    if (!maskHasVisiblePixels(ctx, width, height)) return null

    return { canvas, width, height, dpr }
  }

  function drawElementMask(ctx, item, clipRect) {
    const images = [...item.element.querySelectorAll("img")]
    if (item.element.matches?.("img")) images.unshift(item.element)

    if (images.length) {
      return images.reduce((ready, image) => {
        return drawImageMask(ctx, image, clipRect) && ready
      }, true)
    }

    return drawTextMask(ctx, item.element, item.rect)
  }

  function makeOverlapCanvas(clipRect, target, blockers) {
    const blockerMask = makeBlockerMaskCanvas(clipRect, blockers)
    if (!blockerMask) return null

    const { width, height, dpr } = blockerMask
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return null

    ctx.setTransform(dpr, 0, 0, dpr, -clipRect.left * dpr, -clipRect.top * dpr)
    const ready = drawElementMask(ctx, target, clipRect)
    if (!ready) return null

    normalizeMaskAlpha(ctx, width, height)
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = "destination-in"
    ctx.drawImage(blockerMask.canvas, 0, 0)
    ctx.restore()

    if (!maskHasVisiblePixels(ctx, width, height)) return null
    return canvas
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

  function addMaskedRegion(regions, target, blocker, overlap) {
    const existing = regions.get(target.element)
    if (existing) {
      existing.clipRect = unionRect(existing.clipRect, overlap)
      if (!existing.blockers.some((item) => item.element === blocker.element)) {
        existing.blockers.push(blocker)
      }
      return
    }

    regions.set(target.element, {
      target,
      clipRect: { ...overlap },
      blockers: [blocker],
    })
  }

  function makeSlice(layer, source, sourceRect, clipRect, blockers) {
    const target = { element: source, rect: sourceRect }
    const overlapCanvas = makeOverlapCanvas(clipRect, target, blockers)
    if (!overlapCanvas) return

    overlapCanvas.className = CANVAS_CLASS
    overlapCanvas.setAttribute("aria-hidden", "true")
    overlapCanvas.style.left = px(clipRect.left)
    overlapCanvas.style.top = px(clipRect.top)
    overlapCanvas.style.width = px(clipRect.width)
    overlapCanvas.style.height = px(clipRect.height)
    layer.appendChild(overlapCanvas)
  }

  function clearLegacyAttributes(header) {
    header.querySelectorAll(`[${LEGACY_ATTRIBUTE}]`).forEach((element) => {
      element.removeAttribute(LEGACY_ATTRIBUTE)
    })
  }

  function renderSlices(header, targets) {
    const layer = ensureLayer(header)
    layer.replaceChildren()
    const regions = new Map()

    for (let i = 0; i < targets.length; i += 1) {
      for (let j = i + 1; j < targets.length; j += 1) {
        const a = targets[i]
        const b = targets[j]
        if (a.owner === b.owner) continue

        const overlap = intersectionRect(a.rect, b.rect)
        if (!overlap) continue
        const target = lowerPriorityTarget(a, b)
        const blocker = target === a ? b : a
        addMaskedRegion(regions, target, blocker, overlap)
      }
    }

    regions.forEach(({ target, clipRect, blockers }) => {
      makeSlice(layer, target.element, target.rect, clipRect, blockers)
    })
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
