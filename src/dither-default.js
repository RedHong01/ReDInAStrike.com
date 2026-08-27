// This file is the public-site source of truth for the dither effect.
// Editing this object changes what every visitor sees when the Dither Hub is closed.
export const PUBLISHED_DITHER_CONFIG = Object.freeze({
  version: 2,
  mode: "native",
  columns: 132,
  inkGain: 1.18,
  inkBias: -0.025,
  contrast: 1,
  threshold: 0.5,
  dotScale: 1,
  bayerScale: 1,
  blueScale: 1,
  blueMix: 1,
  screenAngle: 45,
  screenFrequency: 3.1,
  lineAngle: -45,
  lineLength: 1,
  lineWeight: 1,
})
