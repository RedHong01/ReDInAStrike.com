(() => {
  const STYLE_ID = "red-nav-spacing-guard-style"
  const MIN_GAP_PX = 8
  const EPSILON = 0.25

  let frame = 0
  let currentNav = null
  let observer = null
  const corrections = new WeakMap()

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = `
      .nav-item {
        --nav-spacing-guard-x: 0px;
        translate: calc(var(--nav-typewriter-push-x, 0px) + var(--nav-spacing-guard-x, 0px)) 0;
      }
    `
    document.head.appendChild(style)
  }

  function getCorrection(item) {
    return corrections.get(item) || 0
  }

  function setCorrection(item, value) {
    const next = Math.max(0, value)
    const current = getCorrection(item)
    if (Math.abs(next - current) <= EPSILON) return false
    corrections.set(item, next)
    item.style.setProperty("--nav-spacing-guard-x", `${next.toFixed(2)}px`)
    return true
  }

  function clearCorrections(items = []) {
    let changed = false
    items.forEach((item) => {
      if (getCorrection(item) <= EPSILON) return
      corrections.set(item, 0)
      item.style.setProperty("--nav-spacing-guard-x", "0px")
      changed = true
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

    const activeIndex = items.findIndex((item) => item.classList.contains("is-nav-active"))
    return activeIndex
  }

  function spacingGap(nav) {
    const cssGap = parseFloat(getComputedStyle(nav).columnGap || getComputedStyle(nav).gap || "0")
    if (!Number.isFinite(cssGap) || cssGap <= 0) return MIN_GAP_PX
    return Math.max(MIN_GAP_PX, Math.min(14, cssGap))
  }

  function measure() {
    frame = 0
    const nav = document.querySelector(".nav-list")
    if (!nav) return
    bind(nav)

    const items = [...nav.querySelectorAll(".nav-item[data-nav-category]")]
    if (items.length < 2 || document.body.dataset.navDensity === "full") {
      clearCorrections(items)
      return
    }

    const activeIndex = activeIndexFor(items)
    if (activeIndex <= 0) {
      clearCorrections(items)
      return
    }

    const activeDetail = items[activeIndex].querySelector(".nav-detail.is-typewriter-visible")
    if (!activeDetail) {
      clearCorrections(items)
      return
    }

    const gap = spacingGap(nav)
    const activeTitle = items[activeIndex].querySelector(".nav-title")
    const activeTitleRect = activeTitle?.getBoundingClientRect()
    if (!activeTitleRect) {
      clearCorrections(items)
      return
    }

    const baseRects = items.map((item) => {
      const title = item.querySelector(".nav-title")
      const rect = title?.getBoundingClientRect()
      if (!rect) return null
      const correction = getCorrection(item)
      return {
        left: rect.left - correction,
        right: rect.right - correction,
        width: rect.width,
      }
    })

    let previousRight = Number.NEGATIVE_INFINITY
    let changed = false

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      const base = baseRects[index]
      if (!base) continue

      if (index >= activeIndex) {
        changed = setCorrection(item, 0) || changed
        continue
      }

      const minimumLeft = Number.isFinite(previousRight) ? previousRight + gap : base.left
      let correction = Math.max(0, minimumLeft - base.left)

      const maxRight = index === activeIndex - 1
        ? activeTitleRect.left - gap
        : Number.POSITIVE_INFINITY
      if (Number.isFinite(maxRight)) {
        correction = Math.min(correction, Math.max(0, maxRight - base.right))
      }

      changed = setCorrection(item, correction) || changed
      previousRight = base.right + correction
    }

    // A spring frame can still be moving after this measurement. Re-check until
    // the physical spacing and the typewriter push settle on the same geometry.
    if (changed || document.documentElement.dataset.headerMotion === "moving") schedule()
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
