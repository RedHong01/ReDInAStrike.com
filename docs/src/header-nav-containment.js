(() => {
  const STYLE_ID = "red-header-nav-containment-style"
  const SAFE_INSET_MIN = 6
  const SAFE_INSET_MAX = 14
  const SAFE_INSET_RATIO = 0.055
  const EPSILON = 0.35

  let frame = 0
  let currentShift = 0
  let currentNav = null
  let navObserver = null
  let bodyObserver = null
  let headerObserver = null

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = `
      .nav-list {
        --nav-containment-shift-y: 0px;
        translate: 0 var(--nav-containment-shift-y);
      }
    `
    document.head.appendChild(style)
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function headerElement() {
    return document.querySelector("[data-site-header]")
  }

  function navElement() {
    return document.querySelector(".nav-list")
  }

  function resetNav(nav = currentNav) {
    if (!nav) return
    nav.style.removeProperty("--nav-containment-shift-y")
    if (nav === currentNav) currentShift = 0
  }

  function bindNavObserver(nav) {
    if (currentNav === nav) return
    navObserver?.disconnect()
    resetNav(currentNav)
    currentNav = nav
    currentShift = 0
    if (!nav || !("MutationObserver" in window)) return

    navObserver = new MutationObserver(scheduleMeasure)
    navObserver.observe(nav, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "class",
        "data-typewriter-nav",
        "data-typewriter-text",
      ],
    })
  }

  function safeInset(headerRect) {
    return clamp(
      headerRect.height * SAFE_INSET_RATIO,
      SAFE_INSET_MIN,
      SAFE_INSET_MAX,
    )
  }

  function measure() {
    frame = 0
    const header = headerElement()
    const nav = navElement()
    bindNavObserver(nav)

    if (!header || !nav || !header.isConnected || !nav.isConnected) {
      resetNav(nav)
      return
    }

    const headerRect = header.getBoundingClientRect()
    const navRect = nav.getBoundingClientRect()
    if (headerRect.height <= 1 || navRect.height <= 1) {
      resetNav(nav)
      return
    }

    const baseTop = navRect.top - currentShift
    const baseBottom = navRect.bottom - currentShift
    const inset = safeInset(headerRect)
    const safeTop = headerRect.top + inset
    const safeBottom = headerRect.bottom - inset

    let nextShift = Math.min(0, safeBottom - baseBottom)
    const safeHeight = Math.max(0, safeBottom - safeTop)
    if (navRect.height <= safeHeight + 0.5) {
      nextShift = Math.max(nextShift, safeTop - baseTop)
      nextShift = Math.min(0, nextShift)
    }

    if (Math.abs(nextShift - currentShift) <= EPSILON) return
    currentShift = nextShift
    nav.style.setProperty("--nav-containment-shift-y", `${nextShift.toFixed(2)}px`)
  }

  function scheduleMeasure() {
    if (frame) return
    frame = requestAnimationFrame(measure)
  }

  function start() {
    ensureStyle()
    bindNavObserver(navElement())

    window.addEventListener("scroll", scheduleMeasure, { passive: true, capture: true })
    window.addEventListener("resize", scheduleMeasure, { passive: true })
    window.visualViewport?.addEventListener("resize", scheduleMeasure, { passive: true })
    window.visualViewport?.addEventListener("scroll", scheduleMeasure, { passive: true })
    window.addEventListener("red:header-motion", scheduleMeasure)
    window.addEventListener("red:home-return-transition", scheduleMeasure)

    if ("MutationObserver" in window) {
      bodyObserver = new MutationObserver(scheduleMeasure)
      bodyObserver.observe(document.body, {
        attributes: true,
        attributeFilter: [
          "data-nav-density",
          "data-header-compact",
          "data-layout-transition",
          "data-home-return-transition",
        ],
      })

      const header = headerElement()
      if (header) {
        headerObserver = new MutationObserver(scheduleMeasure)
        headerObserver.observe(header, {
          attributes: true,
          attributeFilter: ["style", "class"],
        })
      }
    }

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(scheduleMeasure)
      const header = headerElement()
      const nav = navElement()
      if (header) resizeObserver.observe(header)
      if (nav) resizeObserver.observe(nav)
    }

    scheduleMeasure()
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()
