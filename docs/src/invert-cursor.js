(() => {
  const STYLE_ID = "red-invert-cursor-style"
  const CURSOR_CLASS = "red-invert-cursor"
  const ACTIVE_CLASS = "has-red-invert-cursor"
  const LABEL_CLASS = "is-preview-label"
  const CURSOR_SIZE = 14
  const LABEL_TEXT = "Click again to view"
  const POINTER_MEDIA = "(any-hover: hover) and (any-pointer: fine)"
  // Match --nav-ease used across the paper UI.
  const MOTION_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
  const EXPAND_MS = 420
  const LABEL_FADE_MS = 260

  let host = null
  let chip = null
  let label = null
  let frame = 0
  let pointerX = 0
  let pointerY = 0
  let pointerVisible = false
  let labelActive = false
  let labelWidth = 0
  let mounted = false

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return

    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = `
      .${CURSOR_CLASS} {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 2147483647;
        display: none;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        opacity: 0;
        pointer-events: none;
        mix-blend-mode: difference;
        transform: translate3d(-100px, -100px, 0);
        will-change: transform, opacity;
        cursor: none !important;
      }

      .${CURSOR_CLASS}.is-visible {
        opacity: 1;
      }

      .${CURSOR_CLASS}__chip {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: ${CURSOR_SIZE}px;
        height: ${CURSOR_SIZE}px;
        padding: 0;
        overflow: hidden;
        background: #fff;
        color: #000;
        white-space: nowrap;
        image-rendering: pixelated;
        transform: translate(-50%, -50%);
        transform-origin: center center;
        transition:
          width ${EXPAND_MS}ms ${MOTION_EASE},
          height ${EXPAND_MS}ms ${MOTION_EASE},
          padding ${EXPAND_MS}ms ${MOTION_EASE};
      }

      .${CURSOR_CLASS}.${LABEL_CLASS} .${CURSOR_CLASS}__chip {
        height: 22px;
        padding: 0 12px;
      }

      .${CURSOR_CLASS}__label {
        display: block;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        font-family: var(--type-subtitle-font, var(--mono, "Courier New", monospace));
        font-size: var(--project-caption-size, var(--type-subtitle-size, 13px));
        line-height: 1;
        letter-spacing: 0.01em;
        text-transform: none;
        transform: translate3d(-6px, 0, 0);
        transition:
          opacity ${LABEL_FADE_MS}ms ease,
          max-width ${EXPAND_MS}ms ${MOTION_EASE},
          transform ${EXPAND_MS}ms ${MOTION_EASE};
      }

      .${CURSOR_CLASS}.${LABEL_CLASS} .${CURSOR_CLASS}__label {
        max-width: 18rem;
        opacity: 1;
        transform: translate3d(0, 0, 0);
        transition-delay: 48ms, 0ms, 0ms;
      }

      @media (prefers-reduced-motion: reduce) {
        .${CURSOR_CLASS}__chip,
        .${CURSOR_CLASS}__label {
          transition-duration: 1ms !important;
          transition-delay: 0ms !important;
        }
      }

      @media ${POINTER_MEDIA} {
        html.${ACTIVE_CLASS},
        html.${ACTIVE_CLASS} *,
        html.${ACTIVE_CLASS} *::before,
        html.${ACTIVE_CLASS} *::after {
          cursor: none !important;
        }

        .${CURSOR_CLASS} {
          display: block;
        }
      }
    `
    document.head.appendChild(style)
  }

  function setNativeCursorHidden(hidden) {
    document.documentElement.classList.toggle(ACTIVE_CLASS, hidden)
  }

  function isForeignSurface(node) {
    let current = node
    while (current && current !== document.documentElement) {
      if (current.nodeType === 1) {
        const tag = current.nodeName
        if (tag === "IFRAME" || tag === "EMBED" || tag === "OBJECT") return true
      }
      current = current.parentNode
      if (current && current.nodeType === 11) current = current.host
    }
    return false
  }

  function isPreviewLabelTarget(node) {
    if (!node || typeof node.closest !== "function") return false
    // The same expanding chip used by catalog previews also describes the
    // existing project lightbox. Keep its eligibility rules aligned.
    const image = node.closest('img:not([data-lightbox-disabled="true"])')
    if (image?.closest(".detail-page, .project-detail-drawer") &&
        !image.closest('a[href], button, [role="button"], .project-lightbox')) {
      return "Click to view detail"
    }
    const card = node.closest(".project-card.is-project-preview")
    if (!card) return false
    if (card.classList.contains("project-preview-exit-ghost")) return false
    if (card.classList.contains("project-preview-expand-ghost")) return false
    // Once the article drawer is open, the second click has already happened.
    if (card.hasAttribute("data-project-detail-open")) return false
    return LABEL_TEXT
  }

  function measureLabelWidth() {
    if (!label) return CURSOR_SIZE
    const prevMax = label.style.maxWidth
    const prevOpacity = label.style.opacity
    label.style.maxWidth = "none"
    label.style.opacity = "0"
    const textWidth = Math.ceil(label.scrollWidth)
    label.style.maxWidth = prevMax
    label.style.opacity = prevOpacity
    // Match expanded horizontal padding (12px * 2).
    return Math.max(CURSOR_SIZE, textWidth + 24)
  }

  function setLabelActive(next) {
    if (!host || !chip || !label) return
    if (labelActive === next) {
      if (next && labelWidth > 0) chip.style.width = `${labelWidth}px`
      return
    }
    labelActive = next
    host.classList.toggle(LABEL_CLASS, Boolean(next))
    if (next) {
      label.textContent = next
      labelWidth = measureLabelWidth()
      chip.style.width = `${labelWidth}px`
    } else {
      chip.style.width = `${CURSOR_SIZE}px`
    }
  }

  function render() {
    frame = 0
    if (!host) return
    // Chip self-centers via translate(-50%, -50%), so the host tracks the tip.
    host.style.transform = `translate3d(${Math.round(pointerX)}px, ${Math.round(pointerY)}px, 0)`
    host.classList.toggle("is-visible", pointerVisible)
  }

  function scheduleRender() {
    if (frame) return
    frame = requestAnimationFrame(render)
  }

  function hideCursor() {
    pointerVisible = false
    setLabelActive(false)
    scheduleRender()
  }

  function showCursorAt(x, y, target) {
    pointerX = x
    pointerY = y
    pointerVisible = true
    setLabelActive(isPreviewLabelTarget(target))
    scheduleRender()
  }

  function handlePointerMove(event) {
    if (event.pointerType === "touch" || event.isPrimary === false) {
      hideCursor()
      return
    }

    if (isForeignSurface(event.target)) {
      hideCursor()
      return
    }

    showCursorAt(event.clientX, event.clientY, event.target)
  }

  function handlePointerDown(event) {
    if (event.pointerType === "touch" || event.isPrimary === false) return
    if (isForeignSurface(event.target)) {
      hideCursor()
      return
    }

    // Re-assert native hide on press; some engines briefly restore the OS cursor
    // when hit-testing clickable controls with leftover cursor:* declarations.
    setNativeCursorHidden(true)
    showCursorAt(event.clientX, event.clientY, event.target)
  }

  function handlePointerOut(event) {
    const related = event.relatedTarget
    if (!related || isForeignSurface(related)) hideCursor()
  }

  function handleDocumentLeave(event) {
    if (event.target === document.documentElement || event.target === document.body) {
      hideCursor()
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) hideCursor()
  }

  function start() {
    if (mounted || !window.matchMedia?.(POINTER_MEDIA).matches) return
    mounted = true
    ensureStyle()
    setNativeCursorHidden(true)

    host = document.createElement("div")
    host.className = CURSOR_CLASS
    host.setAttribute("aria-hidden", "true")

    chip = document.createElement("div")
    chip.className = `${CURSOR_CLASS}__chip`

    label = document.createElement("span")
    label.className = `${CURSOR_CLASS}__label`
    label.textContent = LABEL_TEXT

    chip.appendChild(label)
    host.appendChild(chip)
    document.body.appendChild(host)

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("pointerup", handlePointerDown, { passive: true })
    window.addEventListener("pointerout", handlePointerOut, { passive: true })
    window.addEventListener("blur", hideCursor, { passive: true })
    window.addEventListener("resize", scheduleRender, { passive: true })
    document.addEventListener("mouseleave", handleDocumentLeave, { passive: true })
    document.documentElement.addEventListener("mouseleave", hideCursor, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true })
  }

  function stopNativeOverride() {
    setNativeCursorHidden(false)
    hideCursor()
  }

  const pointerMedia = window.matchMedia?.(POINTER_MEDIA)
  const handlePointerCapabilityChange = (event) => {
    if (event.matches) start()
    else stopNativeOverride()
  }
  pointerMedia?.addEventListener?.("change", handlePointerCapabilityChange)
  if (!pointerMedia?.addEventListener) pointerMedia?.addListener?.(handlePointerCapabilityChange)

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()
