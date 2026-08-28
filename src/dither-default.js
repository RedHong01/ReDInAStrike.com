// This file is the public-site source of truth for the dither effect.
// Editing this object changes what every visitor sees when the Dither Hub is closed.
export const PUBLISHED_DITHER_CONFIG = Object.freeze({
  version: 2,
  mode: "floyd",
  columns: 240,
  inkGain: 0.75,
  inkBias: -0.01,
  contrast: 2.2,
  threshold: 0.535,
  dotScale: 0.6,
  bayerScale: 2,
  blueScale: 1.2,
  blueMix: 0.63,
  screenAngle: 88,
  screenFrequency: 3.7,
  lineAngle: -88,
  lineLength: 0.44,
  lineWeight: 1.01,
})
