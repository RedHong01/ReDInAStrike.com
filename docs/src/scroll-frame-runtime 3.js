(() => {
  if (window.__RED_SCROLL_FRAME__) return

  const WINDOW_SCROLL = 1
  const VISUAL_SCROLL = 2
  const subscribers = []

  let frame = 0
  let sequence = 0
  let pendingSources = 0
  let lastScrollY = window.scrollY || window.pageYOffset || 0
  let latest = null

  function viewportHeight() {
    return Math.max(
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
      window.visualViewport?.height || 0,
      1,
    )
  }

  function flush(now) {
    frame = 0
    const sources = pendingSources
    pendingSources = 0
    const scrollY = window.scrollY || window.pageYOffset || 0
    const snapshot = Object.freeze({
      id: ++sequence,
      now,
      sources,
      windowScroll: Boolean(sources & WINDOW_SCROLL),
      visualScroll: Boolean(sources & VISUAL_SCROLL),
      scrollX: window.scrollX || window.pageXOffset || 0,
      scrollY,
      deltaY: scrollY - lastScrollY,
      viewportHeight: viewportHeight(),
      visualOffsetTop: window.visualViewport?.offsetTop || 0,
      visualOffsetLeft: window.visualViewport?.offsetLeft || 0,
    })
    lastScrollY = scrollY
    latest = snapshot

    for (const subscriber of subscribers) {
      try {
        subscriber.callback(snapshot)
      } catch (error) {
        window.setTimeout(() => { throw error }, 0)
      }
    }
  }

  function request(source = WINDOW_SCROLL) {
    pendingSources |= source
    if (!frame && !document.hidden) frame = requestAnimationFrame(flush)
  }

  function subscribe(callback, options = {}) {
    if (typeof callback !== "function") return () => {}
    const subscriber = {
      callback,
      priority: Number.isFinite(options.priority) ? options.priority : 0,
    }
    subscribers.push(subscriber)
    subscribers.sort((a, b) => a.priority - b.priority)

    return () => {
      const index = subscribers.indexOf(subscriber)
      if (index >= 0) subscribers.splice(index, 1)
    }
  }

  window.addEventListener("scroll", () => request(WINDOW_SCROLL), { passive: true })
  window.visualViewport?.addEventListener?.("scroll", () => request(VISUAL_SCROLL), { passive: true })
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) {
      cancelAnimationFrame(frame)
      frame = 0
      pendingSources = 0
      return
    }
    if (!document.hidden) lastScrollY = window.scrollY || window.pageYOffset || 0
  })

  window.__RED_SCROLL_FRAME__ = Object.freeze({
    version: 1,
    WINDOW_SCROLL,
    VISUAL_SCROLL,
    request,
    subscribe,
    get latest() { return latest },
    get pending() { return Boolean(frame) },
  })
})()
