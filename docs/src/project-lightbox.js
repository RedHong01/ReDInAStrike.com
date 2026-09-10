import {
  cancelBinaryPixelVeil,
  closeBinaryPixelVeil,
  openBinaryPixelVeil,
  syncBinaryPixelVeil,
} from "./binary-pixel-veil.js?v=20260910-plateveil1"

// A project body is the same markup in two containers: the drawer that opens
// under its card on the home grid, and the route that renders it on its own.
// The drawer is the real one, and it is the one without a <main> wrapper.
const PROJECT_BODY_SCOPES = [".detail-page", ".project-detail-drawer"]
const PROJECT_BODY_SELECTOR = PROJECT_BODY_SCOPES.join(", ")
// A booklet field is already a page of pixels. Opening a plate out of one hands
// the rest of the page to the shared binary dissolve rather than a plain fade.
const PIXEL_VEIL_SELECTOR = ".gdd-plates"

const LIGHTBOX_STYLE_ID = "project-lightbox-style"
const LIGHTBOX_CLASS = "project-lightbox"
const LIGHTBOX_OPEN_CLASS = "is-open"
const VEIL_MODIFIER = "pixel"
const LIGHTBOX_OPEN_MS = 440
const LIGHTBOX_CLOSE_MS = 360
const LIGHTBOX_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

let overlay = null
let backdrop = null
let previewImage = null
let activeSourceImage = null
let activeTargetRect = null
let previousFocus = null
let previousHtmlOverflow = ""
let previousBodyOverflow = ""
let previousSourceOpacity = ""
let closeTimer = 0
let animationFrame = 0
let isClosing = false
let usesPixelVeil = false

function scopedSelector(suffix) {
  return PROJECT_BODY_SCOPES.map((scope) => `${scope} ${suffix}`).join(",\n      ")
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
}

function ensureStyles() {
  if (document.getElementById(LIGHTBOX_STYLE_ID)) return

  const style = document.createElement("style")
  style.id = LIGHTBOX_STYLE_ID
  style.textContent = `
    @media not ((any-hover: hover) and (any-pointer: fine)) {
      ${scopedSelector('img:not([data-lightbox-disabled="true"])')} {
        cursor: zoom-in;
      }

      ${scopedSelector("a img")},
      ${scopedSelector("button img")},
      ${scopedSelector('[role="button"] img')} {
        cursor: pointer;
      }

      .${LIGHTBOX_CLASS} {
        cursor: zoom-out;
      }

      .${LIGHTBOX_CLASS}__image {
        cursor: default;
      }
    }

    .${LIGHTBOX_CLASS} {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: block;
      overflow: hidden;
      pointer-events: none;
      overscroll-behavior: contain;
      touch-action: none;
    }

    .${LIGHTBOX_CLASS}[hidden] {
      display: none !important;
    }

    .${LIGHTBOX_CLASS}.${LIGHTBOX_OPEN_CLASS} {
      pointer-events: auto;
    }

    .${LIGHTBOX_CLASS}__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(var(--paper-rgb, 248, 247, 245), 0.965);
      opacity: 0;
      transition: opacity ${LIGHTBOX_OPEN_MS}ms ease;
      will-change: opacity;
    }

    .${LIGHTBOX_CLASS}.${LIGHTBOX_OPEN_CLASS} .${LIGHTBOX_CLASS}__backdrop {
      opacity: 1;
    }

    /* The dissolve paints its own paper field, so the plain backdrop would only
       double it. */
    .${LIGHTBOX_CLASS}--${VEIL_MODIFIER} .${LIGHTBOX_CLASS}__backdrop {
      display: none;
    }

    .${LIGHTBOX_CLASS}__image {
      position: absolute;
      display: block;
      max-width: none;
      max-height: none;
      margin: 0;
      background: transparent;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
      transform-origin: center center;
      will-change: transform;
      backface-visibility: hidden;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.035);
    }

    @media (prefers-reduced-motion: reduce) {
      .${LIGHTBOX_CLASS}__backdrop,
      .${LIGHTBOX_CLASS}__image {
        transition: none !important;
      }
    }
  `
  document.head.appendChild(style)
}

function ensureOverlay() {
  if (overlay?.isConnected) return overlay

  ensureStyles()

  overlay = document.createElement("div")
  overlay.className = LIGHTBOX_CLASS
  overlay.hidden = true
  overlay.tabIndex = -1
  overlay.setAttribute("role", "dialog")
  overlay.setAttribute("aria-modal", "true")
  overlay.setAttribute("aria-label", "Image preview. Click outside the image or press Escape to close.")

  backdrop = document.createElement("div")
  backdrop.className = `${LIGHTBOX_CLASS}__backdrop`
  backdrop.setAttribute("aria-hidden", "true")
  overlay.appendChild(backdrop)

  previewImage = document.createElement("img")
  previewImage.className = `${LIGHTBOX_CLASS}__image`
  previewImage.alt = ""
  previewImage.decoding = "async"
  previewImage.draggable = false
  overlay.appendChild(previewImage)

  overlay.addEventListener("click", (event) => {
    if (event.target !== previewImage) closeLightbox()
  })

  previewImage.addEventListener("click", (event) => {
    event.stopPropagation()
  })

  document.body.appendChild(overlay)
  return overlay
}

function getPreviewTargetRect(naturalWidth, naturalHeight) {
  const marginX = Math.max(18, Math.min(window.innerWidth * 0.03, 48))
  const marginY = Math.max(18, Math.min(window.innerHeight * 0.04, 48))
  const availableWidth = Math.max(1, window.innerWidth - marginX * 2)
  const availableHeight = Math.max(1, window.innerHeight - marginY * 2)
  const scale = Math.min(
    availableWidth / Math.max(1, naturalWidth),
    availableHeight / Math.max(1, naturalHeight),
  )

  const width = Math.max(1, naturalWidth * scale)
  const height = Math.max(1, naturalHeight * scale)
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  }
}

function setPreviewRect(rect) {
  if (!previewImage) return
  previewImage.style.left = `${rect.left}px`
  previewImage.style.top = `${rect.top}px`
  previewImage.style.width = `${rect.width}px`
  previewImage.style.height = `${rect.height}px`
}

function transformBetweenRects(fromRect, toRect) {
  const fromCenterX = fromRect.left + fromRect.width / 2
  const fromCenterY = fromRect.top + fromRect.height / 2
  const toCenterX = toRect.left + toRect.width / 2
  const toCenterY = toRect.top + toRect.height / 2
  const scaleX = Math.max(0.0001, fromRect.width / Math.max(1, toRect.width))
  const scaleY = Math.max(0.0001, fromRect.height / Math.max(1, toRect.height))
  return `translate3d(${fromCenterX - toCenterX}px, ${fromCenterY - toCenterY}px, 0) scale(${scaleX}, ${scaleY})`
}

function lockArticleScroll() {
  previousHtmlOverflow = document.documentElement.style.overflow
  previousBodyOverflow = document.body.style.overflow
  document.documentElement.style.overflow = "hidden"
  document.body.style.overflow = "hidden"
}

function restoreArticleScroll() {
  document.documentElement.style.overflow = previousHtmlOverflow
  document.body.style.overflow = previousBodyOverflow
}

function hideSourceImage(sourceImage) {
  previousSourceOpacity = sourceImage.style.opacity
  sourceImage.style.opacity = "0"
}

function restoreSourceImage(sourceImage = activeSourceImage) {
  if (!(sourceImage instanceof HTMLImageElement)) return
  sourceImage.style.opacity = previousSourceOpacity
  previousSourceOpacity = ""
}

function openLightbox(sourceImage) {
  const root = ensureOverlay()
  const source = sourceImage.currentSrc || sourceImage.src
  if (!source || !previewImage) return

  clearTimeout(closeTimer)
  cancelAnimationFrame(animationFrame)
  isClosing = false

  activeSourceImage = sourceImage
  usesPixelVeil = !prefersReducedMotion() && Boolean(sourceImage.closest(PIXEL_VEIL_SELECTOR))
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null

  const sourceRect = sourceImage.getBoundingClientRect()
  const naturalWidth = sourceImage.naturalWidth || Math.max(1, sourceRect.width)
  const naturalHeight = sourceImage.naturalHeight || Math.max(1, sourceRect.height)
  activeTargetRect = getPreviewTargetRect(naturalWidth, naturalHeight)

  previewImage.alt = sourceImage.alt || "Project image preview"
  previewImage.src = source
  previewImage.style.transition = "none"
  setPreviewRect(activeTargetRect)
  previewImage.style.transform = prefersReducedMotion()
    ? "none"
    : transformBetweenRects(sourceRect, activeTargetRect)

  root.classList.remove(LIGHTBOX_OPEN_CLASS)
  root.classList.toggle(`${LIGHTBOX_CLASS}--${VEIL_MODIFIER}`, usesPixelVeil)
  root.hidden = false
  lockArticleScroll()
  hideSourceImage(sourceImage)

  // The dissolve runs on the zoom's own budget, so the page finishes coming
  // apart on the frame the plate finishes arriving.
  if (usesPixelVeil && !openBinaryPixelVeil(root, { durationMs: LIGHTBOX_OPEN_MS })) {
    usesPixelVeil = false
    root.classList.remove(`${LIGHTBOX_CLASS}--${VEIL_MODIFIER}`)
  }

  if (prefersReducedMotion()) {
    root.classList.add(LIGHTBOX_OPEN_CLASS)
    previewImage.style.transform = "none"
    root.focus({ preventScroll: true })
    return
  }

  animationFrame = requestAnimationFrame(() => {
    animationFrame = requestAnimationFrame(() => {
      if (!overlay || overlay.hidden || isClosing) return
      previewImage.style.transition = `transform ${LIGHTBOX_OPEN_MS}ms ${LIGHTBOX_EASE}`
      root.classList.add(LIGHTBOX_OPEN_CLASS)
      previewImage.style.transform = "none"
      root.focus({ preventScroll: true })
    })
  })
}

function finishClose(focusTarget, sourceImage) {
  if (!overlay || !previewImage) return
  cancelBinaryPixelVeil()
  overlay.hidden = true
  overlay.classList.remove(LIGHTBOX_OPEN_CLASS)
  overlay.classList.remove(`${LIGHTBOX_CLASS}--${VEIL_MODIFIER}`)
  usesPixelVeil = false
  previewImage.removeAttribute("src")
  previewImage.style.removeProperty("left")
  previewImage.style.removeProperty("top")
  previewImage.style.removeProperty("width")
  previewImage.style.removeProperty("height")
  previewImage.style.removeProperty("transform")
  previewImage.style.removeProperty("transition")
  restoreSourceImage(sourceImage)
  restoreArticleScroll()

  activeSourceImage = null
  activeTargetRect = null
  previousFocus = null
  isClosing = false

  if (focusTarget instanceof HTMLElement && focusTarget.isConnected) {
    focusTarget.focus({ preventScroll: true })
  }
}

function closeLightbox() {
  if (!overlay || overlay.hidden || !previewImage || isClosing) return
  isClosing = true
  cancelAnimationFrame(animationFrame)

  const sourceImage = activeSourceImage
  const focusTarget = sourceImage || previousFocus
  const reducedMotion = prefersReducedMotion()

  clearTimeout(closeTimer)

  if (reducedMotion) {
    finishClose(focusTarget, sourceImage)
    return
  }

  const targetRect = activeTargetRect || previewImage.getBoundingClientRect()
  const sourceRect = sourceImage instanceof HTMLImageElement && sourceImage.isConnected
    ? sourceImage.getBoundingClientRect()
    : null

  if (usesPixelVeil) closeBinaryPixelVeil({ durationMs: LIGHTBOX_CLOSE_MS })

  previewImage.style.transition = `transform ${LIGHTBOX_CLOSE_MS}ms ${LIGHTBOX_EASE}`
  overlay.classList.remove(LIGHTBOX_OPEN_CLASS)
  previewImage.style.transform = sourceRect
    ? transformBetweenRects(sourceRect, targetRect)
    : "scale(0.97)"

  closeTimer = window.setTimeout(() => {
    finishClose(focusTarget, sourceImage)
  }, LIGHTBOX_CLOSE_MS)
}

function isEligibleProjectImage(image) {
  if (!(image instanceof HTMLImageElement)) return false
  if (!image.closest(PROJECT_BODY_SELECTOR)) return false
  if (image.closest(`.${LIGHTBOX_CLASS}`)) return false
  if (image.dataset.lightboxDisabled === "true") return false
  if (image.closest("a[href], button, [role=\"button\"]")) return false
  return true
}

document.addEventListener("click", (event) => {
  if (event.button !== 0) return
  const target = event.target
  if (!(target instanceof Element)) return
  const image = target.closest("img")
  if (!isEligibleProjectImage(image)) return

  event.preventDefault()
  openLightbox(image)
})

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && overlay && !overlay.hidden) {
    event.preventDefault()
    closeLightbox()
  }
})

window.addEventListener("resize", () => {
  if (!overlay || overlay.hidden || !previewImage || !activeSourceImage || isClosing) return

  const naturalWidth = activeSourceImage.naturalWidth || previewImage.naturalWidth
  const naturalHeight = activeSourceImage.naturalHeight || previewImage.naturalHeight
  if (!naturalWidth || !naturalHeight) return

  syncBinaryPixelVeil()
  activeTargetRect = getPreviewTargetRect(naturalWidth, naturalHeight)
  previewImage.style.transition = "none"
  previewImage.style.transform = "none"
  setPreviewRect(activeTargetRect)
}, { passive: true })
