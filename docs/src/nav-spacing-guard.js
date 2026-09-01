(() => {
  const STYLE_ID = "red-nav-spacing-guard-style"
  const MIN_GAP_PX = 8
  const MAX_GAP_PX = 14
  const EPSILON = 0.2

  let frame = 0
  let currentNav = null
  let observer = null
  const corrections = new WeakMap()
  const detailOffsets = new WeakMap()

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = `
      .nav-item {
        --nav-spacing-guard-x: 0px;
        translate: calc(var(--nav-typewriter-push-x, 0px) + var(--nav-spacing-guard-x, 0px)) 0;
      }

      .nav-detail[data-typewriter-nav="true"] {
        --nav-detail-constraint-x: 0px;
        translate: var(--nav-detail-constraint-x) 0;
      }
    `
    document.head.appendChild(style)
  }

  function readPx(element, name) {
    const inline = parseFloat(element?.style?.getPropertyValue(name) || "")
    if (Number.isFinite(inline)) return inline
    const computed = parseFloat(getComputedStyle(element).getPropertyValue(name) || "")
    return Number.isFinite(computed) ? computed : 0
  }

  function getCorrection(item) {
    return corrections.get(item) || 0
  }

  function setCorrection(item, value) {
    const next = Number.isFinite(value) ? value : 0
    const current = getCorrection(item)
    if (Math.abs(next - current) <= EPSILON) return false
    corrections.set(item, next)
    item.style.setProperty("--nav-spacing-guard-x", `${next.toFixed(2)}px`)
    return true
  }

  function getDetailOffset(detail) {
    return detailOffsets.get(detail) || 0
  }

  function setDetailOffset(detail, value) {
    const next = Number.isFinite(value) ? value : 0
    const current = getDetailOffset(detail)
    if (Math.abs(next - current) <= EPSILON) return false
    detailOffsets.set(detail, next)
    detail.style.setProperty("--nav-detail-constraint-x", `${next.toFixed(2)}px`)
    return true
  }

  function clearConstraints(items = []) {
    let changed = false
    items.forEach((item) => {
      changed = setCorrection(item, 0) || changed
      const detail = item.querySelector(".nav-detail")
      if (detail) changed = setDetailOffset(detail, 0) || changed
    })
    return changed
  }

  function activeIndexFor(items) {
    const catalogCategory = document.querySelector(".catalog")?.dataset.activeFilter || null
    if (catalogCategory) {
      const index = items.findIndex((item) => item.dataset.navCategory === catalogCategory)
      if (index >= 0) return index
    }

    const lockedIndex = items.findIndex((item) => item.classList.contains("is-nav-locked"))
    if (lockedIndex >= 0) return lockedIndex

    return items.findIndex((item) => item.classList.contains("is-nav-active"))
  }

  function renderedScale(nav, navRect) {
    const layoutWidth = nav.offsetWidth || 0
    if (layoutWidth <= 1 || navRect.width <= 1) return 1
    const scale = navRect.width / layoutWidth
    return Number.isFinite(scale) && scale > 0.05 ? scale : 1
  }

  function spacingGap(nav, scale) {
    const style = getComputedStyle(nav)
    const cssGap = parseFloat(style.columnGap || style.gap || "0")
    const logical = !Number.isFinite(cssGap) || cssGap <= 0
      ? MIN_GAP_PX
      : Math.max(MIN_GAP_PX, Math.min(MAX_GAP_PX, cssGap))
    return logical * scale
  }

  function nearestZero(min, max) {
    if (min <= 0 && max >= 0) return 0
    if (0 < min) return min
    return max
  }

  function navUsesHorizontalLayout(nav) {
    if (!nav?.isConnected) return false
    const density = document.body.dataset.navDensity || ""
    const compact = document.body.dataset.headerCompact === "true"
    if (density === "full") return false
    if ((density === "mobile" || density === "tiny") && !compact) return false

    const direction = getComputedStyle(nav).flexDirection
    return direction !== "column" && direction !== "column-reverse"
  }

  function locksActiveDetailToTitle(nav) {
    if (!nav?.isConnected) return false
    const density = document.body.dataset.navDensity || ""
    const compact = document.body.dataset.headerCompact === "true"
    return compact && (density === "mobile" || density === "tiny" || density === "titles")
  }

  function measure() {
    frame = 0
    const nav = document.querySelector(".nav-list")
    if (!nav) return
    bind(nav)

    const items = [...nav.querySelectorAll(".nav-item[data-nav-category]")]
    if (items.length < 2 || !navUsesHorizontalLayout(nav)) {
      clearConstraints(items)
      return
    }

    const activeIndex = activeIndexFor(items)
    if (activeIndex < 0) {
      clearConstraints(items)
      return
    }

    const activeItem = items[activeIndex]
    const activeDetail = activeItem.querySelector(".nav-detail.is-typewriter-visible")
    if (!activeDetail || activeDetail.getBoundingClientRect().width <= 1) {
      clearConstraints(items)
      return
    }

    const navRect = nav.getBoundingClientRect()
    const scale = renderedScale(nav, navRect)
    const gap = spacingGap(nav, scale)

    const nativeRects = items.map((item) => {
      const title = item.querySelector(".nav-title")
      const rect = title?.getBoundingClientRect()
      if (!rect) return null
      const typewriterPush = readPx(item, "--nav-typewriter-push-x")
      const guard = getCorrection(item)
      const renderedShift = (typewriterPush + guard) * scale
      return {
        left: rect.left - renderedShift,
        right: rect.right - renderedShift,
        width: rect.width,
        typewriterPush,
      }
    })

    const detailRect = activeDetail.getBoundingClientRect()
    const detailCurrentOffset = getDetailOffset(activeDetail)
    const detailNative = {
      left: detailRect.left - detailCurrentOffset * scale,
      right: detailRect.right - detailCurrentOffset * scale,
      width: detailRect.width,
    }

    if (!nativeRects[activeIndex] || detailNative.width <= 1 || navRect.width <= 1) {
      clearConstraints(items)
      return
    }

    // Compute how much title footprint lives on either side of the active category.
    // The subtitle may slide horizontally around its active anchor, but the active title
    // itself never moves. This lets pressure be shared by both sides instead of forcing
    // every preceding category into the same left clamp.
    const leftWidths = nativeRects
      .slice(0, activeIndex)
      .filter(Boolean)
      .reduce((sum, rect) => sum + rect.width, 0)
    const rightWidths = nativeRects
      .slice(activeIndex + 1)
      .filter(Boolean)
      .reduce((sum, rect) => sum + rect.width, 0)
    const leftCount = activeIndex
    const rightCount = items.length - activeIndex - 1
    const leftSpan = leftWidths + Math.max(0, leftCount - 1) * gap
    const rightSpan = rightWidths + Math.max(0, rightCount - 1) * gap

    const minDetailShift = navRect.left + leftSpan + (leftCount ? gap : 0) - detailNative.left
    const maxDetailShift = navRect.right - rightSpan - (rightCount ? gap : 0) - detailNative.right

    // If the current viewport has a feasible one-line solution, choose the smallest
    // subtitle displacement needed. In extremely narrow impossible states, choose the
    // midpoint so overflow pressure is shared instead of collapsing all titles together.
    const titleAnchorShift = nativeRects[activeIndex].right - detailNative.right
    const detailShiftRendered = locksActiveDetailToTitle(nav)
      ? titleAnchorShift
      : minDetailShift <= maxDetailShift
        ? nearestZero(minDetailShift, maxDetailShift)
        : (minDetailShift + maxDetailShift) * 0.5
    const detailShiftCss = detailShiftRendered / scale
    let changed = setDetailOffset(activeDetail, detailShiftCss)

    const exclusionLeft = detailNative.left + detailShiftRendered - gap
    const exclusionRight = detailNative.right + detailShiftRendered + gap
    const desiredRenderedShifts = new Array(items.length).fill(0)

    // Left side: walk outward from the active category. Every title must stay left of
    // the subtitle projection and preserve the same minimum rhythm to its neighbour.
    let leftBoundary = exclusionLeft
    for (let index = activeIndex - 1; index >= 0; index -= 1) {
      const rect = nativeRects[index]
      if (!rect) continue
      const shift = Math.min(0, leftBoundary - rect.right)
      desiredRenderedShifts[index] = shift
      leftBoundary = rect.left + shift - gap
    }

    // Right side mirrors the same rule. This is the piece the original typewriter push
    // did not have: subtitle pressure can now be distributed instead of being one-sided.
    let rightBoundary = exclusionRight
    for (let index = activeIndex + 1; index < items.length; index += 1) {
      const rect = nativeRects[index]
      if (!rect) continue
      const shift = Math.max(0, rightBoundary - rect.left)
      desiredRenderedShifts[index] = shift
      rightBoundary = rect.right + shift + gap
    }

    desiredRenderedShifts[activeIndex] = 0

    items.forEach((item, index) => {
      const rect = nativeRects[index]
      if (!rect) return
      const desiredTotalCssShift = desiredRenderedShifts[index] / scale
      const guardTarget = desiredTotalCssShift - rect.typewriterPush
      changed = setCorrection(item, guardTarget) || changed

      if (index !== activeIndex) {
        const detail = item.querySelector(".nav-detail")
        if (detail) changed = setDetailOffset(detail, 0) || changed
      }
    })

    // Typewriter spring and per-character width changes can continue after one measure.
    // Re-check until the hard geometry constraints and the soft motion both settle.
    const editing = activeDetail.classList.contains("is-typewriter-editing")
    if (changed || editing || document.documentElement.dataset.headerMotion === "moving") schedule()
  }

  function schedule() {
    if (frame) return
    frame = requestAnimationFrame(measure)
  }

  function bind(nav) {
    if (currentNav === nav) return
    observer?.disconnect()
    currentNav = nav
    if (!("MutationObserver" in window)) return

    observer = new MutationObserver(schedule)
    observer.observe(nav, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-typewriter-nav", "data-typewriter-text"],
    })
  }

  function start() {
    ensureStyle()
    bind(document.querySelector(".nav-list"))
    window.addEventListener("resize", schedule, { passive: true })
    window.visualViewport?.addEventListener("resize", schedule, { passive: true })
    window.visualViewport?.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("red:header-motion", schedule)

    if ("MutationObserver" in window) {
      const bodyObserver = new MutationObserver(schedule)
      bodyObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-nav-density", "data-header-compact", "data-layout-transition"],
      })
    }

    schedule()
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()
