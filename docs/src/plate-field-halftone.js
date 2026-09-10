// Opening one plate out of a booklet field hands every other plate to the
// treatment the catalog already gives a card the active category does not
// match: the published dither surface underneath, and the colour halftone in
// active-color-snow.js as the way in and out of it.
//
// Nothing here draws a pixel. It decides which plates are held, renders the
// same surface `dither-public-runtime.js` renders for a muted card, and asks
// the existing motion to play over it. If either runtime is unavailable the
// plates still reach the held state, just without the transition.

import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js?v=20260905-perf1"
import { renderCard } from "./dither-engine.js?v=20260905-perf1"

const FIELD_SELECTOR = ".gdd-plates"
const PLATE_SELECTOR = ".gdd-plate"
const HELD_ATTRIBUTE = "data-plate-halftone"
// The stagger is per index; a sixteen-page field would otherwise trail the last
// plate a full half second behind the first.
const MAX_STAGGER_INDEX = 6
// active-color-snow's exit budget plus a frame, after which the held surface
// can be dropped and the photograph is the only thing left to see.
const RELEASE_MS = 420

let heldPlates = []
let releaseTimer = 0

function snow() {
  return window.__RED_ACTIVE_COLOR_SNOW__ || null
}

function snowOptions(reason) {
  return {
    // A field runs past the fold in both directions, and every plate in it is
    // part of the same gesture whether or not it is on screen.
    includeOffscreen: true,
    viewportChecked: true,
    reason,
    placeholder: false,
  }
}

function plateMediaImage(plate) {
  const img = plate.querySelector(".project-media > img")
  return img?.complete && img.naturalWidth ? img : null
}

function holdPlate(plate, index) {
  plate.dataset.ditherMuted = "true"
  renderCard(plate, PUBLISHED_DITHER_CONFIG)
  const canvas = plate.querySelector(".dither-preview-canvas")
  if (!canvas) {
    delete plate.dataset.ditherMuted
    return false
  }
  canvas.dataset.active = "true"
  plate.setAttribute(HELD_ATTRIBUTE, "true")
  // "in" is the direction a card takes when a filter mutes it: the colour
  // resolves down onto the dither surface and the snow canvas retires itself.
  snow()?.play?.(plate, "in", Math.min(index, MAX_STAGGER_INDEX), undefined, snowOptions("transition"))
  return true
}

function dropPlate(plate) {
  plate.removeAttribute(HELD_ATTRIBUTE)
  delete plate.dataset.ditherMuted
  if (!plate.isConnected) return
  const canvas = plate.querySelector(".dither-preview-canvas")
  if (canvas) canvas.dataset.active = "false"
  snow()?.stopCard?.(plate)
}

// Hold every plate in the field except the one being opened. Returns false when
// there is nothing to hold, so the lightbox can keep its plain backdrop.
export function holdPlateField(sourceImage) {
  const field = sourceImage?.closest?.(FIELD_SELECTOR)
  if (!field) return false

  releasePlateField({ immediate: true })

  const opened = sourceImage.closest(PLATE_SELECTOR)
  const plates = [...field.querySelectorAll(PLATE_SELECTOR)]
    .filter((plate) => plate !== opened && plateMediaImage(plate))

  let index = 0
  for (const plate of plates) {
    if (!holdPlate(plate, index)) continue
    heldPlates.push(plate)
    index += 1
  }
  return heldPlates.length > 0
}

// Resolve the field back into photographs. `restore` is the same mode a muted
// card uses when it is hovered back out of the halftone, so the return reads as
// the reverse of the way in rather than a second effect.
export function releasePlateField({ immediate = false } = {}) {
  window.clearTimeout(releaseTimer)
  releaseTimer = 0

  const plates = heldPlates
  heldPlates = []
  if (!plates.length) return

  if (immediate) {
    plates.forEach(dropPlate)
    return
  }

  const api = snow()
  let restored = 0
  plates.forEach((plate, index) => {
    if (!plate.isConnected) return
    const played = api?.play?.(
      plate,
      "in",
      Math.min(index, MAX_STAGGER_INDEX),
      undefined,
      { ...snowOptions("transition"), mode: "restore" },
    ) === true
    if (played) restored += 1
    else dropPlate(plate)
  })

  if (!restored) return
  releaseTimer = window.setTimeout(() => {
    releaseTimer = 0
    plates.forEach(dropPlate)
  }, RELEASE_MS)
}
