const LIGHTBOX_STYLE_ID = "project-lightbox-style"
const LIGHTBOX_CLASS = "project-lightbox"
const LIGHTBOX_OPEN_CLASS = "is-open"
const LIGHTBOX_CLOSE_MS = 170

let overlay = null
let previewImage = null
let activeSourceImage = null
let previousFocus = null
let previousHtmlOverflow = ""
let previousBodyOverflow = ""
let closeTimer = 0

function ensureStyles() {
  if (document.getElementById(LIGHTBOX_STYLE_ID)) return

  const style = document.createElement("style")
  style.id = LIGHTBOX_STYLE_ID
  style.textContent = `
    .detail-page img:not([data-lightbox-disabled="true"]) {
      cursor: zoom-in;
    }

    .detail-page a img,
    .detail-page button img,
    .detail-page [role="button"] img {
      cursor: pointer;
    }

    .${LIGHTBOX_CLASS} {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: clamp(18px, 3vw, 48px);
      background: rgba(var(--paper-rgb, 248, 247, 245), 0.965);
      opacity: 0;
      pointer-events: none;
      cursor: zoom-out;
      transition: opacity ${LIGHTBOX_CLOSE_MS}ms ease;
      overscroll-behavior: contain;
      touch-action: none;
    }

    .${LIGHTBOX_CLASS}[hidden] {
      display: none !important;
    }

    .${LIGHTBOX_CLASS}.${LIGHTBOX_OPEN_CLASS} {
      opacity: 1;
      pointer-events: auto;
    }

    .${LIGHTBOX_CLASS}__image {
      display: block;
      flex: none;
      max-width: none;
      max-height: none;
      margin: 0;
      background: transparent;
      object-fit: contain;
      cursor: default;
      user-select: none;
      -webkit-user-drag: none;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.035);
      transform: scale(0.985);
      transform-origin: center;
      transition: transform ${LIGHTBOX_CLOSE_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .${LIGHTBOX_CLASS}.${LIGHTBOX_OPEN_CLASS} .${LIGHTBOX_CLASS}__image {
      transform: scale(1);
    }

    @media (prefers-reduced-motion: reduce) {
      .${LIGHTBOX_CLASS},
      .${LIGHTBOX_CLASS}__image {
        transition: none;
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

  previewImage = document.createElement("img")
  previewImage.className = `${LIGHTBOX_CLASS}__image`
  previewImage.alt = ""
  previewImage.decoding = "async"
  previewImage.draggable = false
  overlay.appendChild(previewImage)

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeLightbox()
  })

  previewImage.addEventListener("click", (event) => {
    event.stopPropagation()
  })

  previewImage.addEventListener("load", sizePreviewImage)
  document.body.appendChild(overlay)
  return overlay
}

function sizePreviewImage() {
  if (!previewImage || !previewImage.naturalWidth || !previewImage.naturalHeight) return

  const horizontalPadding = Math.max(36, Math.min(window.innerWidth * 0.06, 96))
  const verticalPadding = Math.max(36, Math.min(window.innerHeight * 0.08, 96))
  const availableWidth = Math.max(1, window.innerWidth - horizontalPadding)
  const availableHeight = Math.max(1, window.innerHeight - verticalPadding)
  const scale = Math.min(
    availableWidth / previewImage.naturalWidth,
    availableHeight / previewImage.naturalHeight,
  )

  const renderedWidth = Math.max(1, Math.round(previewImage.naturalWidth * scale))
  const renderedHeight = Math.max(1, Math.round(previewImage.naturalHeight * scale))

  previewImage.style.width = `${renderedWidth}px`
  previewImage.style.height = `${renderedHeight}px`
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

function openLightbox(sourceImage) {
  const root = ensureOverlay()
  const source = sourceImage.currentSrc || sourceImage.src
  if (!source) return

  clearTimeout(closeTimer)
  activeSourceImage = sourceImage
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null

  previewImage.alt = sourceImage.alt || "Project image preview"
  previewImage.style.width = "auto"
  previewImage.style.height = "auto"

  root.hidden = false
  lockArticleScroll()

  if (previewImage.src !== source) {
    previewImage.src = source
  } else if (previewImage.complete) {
    sizePreviewImage()
  }

  requestAnimationFrame(() => {
    root.classList.add(LIGHTBOX_OPEN_CLASS)
    root.focus({ preventScroll: true })
  })
}

function closeLightbox() {
  if (!overlay || overlay.hidden) return

  overlay.classList.remove(LIGHTBOX_OPEN_CLASS)
  restoreArticleScroll()

  const focusTarget = activeSourceImage || previousFocus
  activeSourceImage = null
  previousFocus = null

  clearTimeout(closeTimer)
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  closeTimer = window.setTimeout(() => {
    if (!overlay) return
    overlay.hidden = true
    previewImage?.removeAttribute("src")
    previewImage?.style.removeProperty("width")
    previewImage?.style.removeProperty("height")
    if (focusTarget instanceof HTMLElement && focusTarget.isConnected) {
      focusTarget.focus({ preventScroll: true })
    }
  }, prefersReducedMotion ? 0 : LIGHTBOX_CLOSE_MS)
}

function isEligibleProjectImage(image) {
  if (!(image instanceof HTMLImageElement)) return false
  if (!image.closest(".detail-page")) return false
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
  if (overlay && !overlay.hidden) sizePreviewImage()
}, { passive: true })
