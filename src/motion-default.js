export const REVEAL_MODES = [
  ["none", "None"],
  ["pixel-snow", "Pixel Snow"],
  ["threshold-sweep", "Threshold Sweep"],
  ["cluster-bloom", "Cluster Bloom"],
  ["scan-lock", "Scan Lock"],
]

export const REVEAL_DIRECTIONS = [
  ["top", "Top → Bottom"],
  ["bottom", "Bottom → Top"],
  ["left", "Left → Right"],
  ["right", "Right → Left"],
  ["center", "Center → Out"],
]

export const MOTION_GROUPS = [
  {
    title: "Reveal Timing",
    description: "Global timing for the square-pixel image reveal that resolves into the final dither canvas.",
    controls: [
      { key: "revealDurationMs", label: "Reveal duration", min: 180, max: 3200, step: 10, decimals: 0, suffix: " ms" },
      { key: "revealDelayMs", label: "Start delay", min: 0, max: 1200, step: 10, decimals: 0, suffix: " ms" },
      { key: "revealStaggerMs", label: "Card stagger", min: 0, max: 220, step: 2, decimals: 0, suffix: " ms" },
      { key: "revealSettleMs", label: "Final settle", min: 0, max: 800, step: 10, decimals: 0, suffix: " ms" },
      { key: "revealCurve", label: "Resolve curve", min: 0.35, max: 3.5, step: 0.05, decimals: 2 },
      { key: "revealSeed", label: "Random seed", min: 1, max: 9999, step: 1, decimals: 0 },
    ],
  },
  {
    title: "Pixel Screen",
    description: "Grid scale and snow behaviour. Unresolved cells flicker as binary paper / ink noise before locking to the final image.",
    controls: [
      { key: "revealCellPx", label: "Pixel cell", min: 2, max: 28, step: 1, decimals: 0, suffix: " px" },
      { key: "revealNoisePeak", label: "Snow density", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "revealNoiseFlicker", label: "Snow flicker", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "revealNoisePersistence", label: "Noise persistence", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "revealThresholdBias", label: "Threshold bias", min: -1, max: 1, step: 0.02, decimals: 2 },
    ],
  },
  {
    title: "Cluster Bloom",
    description: "Controls the size, count, spread and local randomness of blooming pixel islands.",
    controls: [
      { key: "revealClusterSize", label: "Cluster size", min: 1, max: 12, step: 0.25, decimals: 2 },
      { key: "revealClusterCount", label: "Cluster count", min: 1, max: 18, step: 1, decimals: 0 },
      { key: "revealClusterSpread", label: "Cluster spread", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "revealClusterJitter", label: "Cluster jitter", min: 0, max: 1, step: 0.01, decimals: 2 },
    ],
  },
  {
    title: "Scan Lock",
    description: "Directional screen-lock front with a noisy feathered edge. Direction is selectable above these controls.",
    controls: [
      { key: "revealScanFeather", label: "Scan feather", min: 0.01, max: 0.65, step: 0.01, decimals: 2 },
      { key: "revealScanNoiseMix", label: "Edge noise mix", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "revealScanOvershoot", label: "Lock overshoot", min: 0, max: 0.35, step: 0.01, decimals: 2 },
    ],
  },
  {
    title: "Nav Typewriter",
    description: "Typing / deletion cadence and the blinking edit caret for category subtitles.",
    controls: [
      { key: "navTypeMs", label: "Type / character", min: 6, max: 60, step: 1, decimals: 0, suffix: " ms" },
      { key: "navDeleteMs", label: "Delete / character", min: 5, max: 50, step: 1, decimals: 0, suffix: " ms" },
      { key: "caretBlinkMs", label: "Caret blink", min: 180, max: 1200, step: 10, decimals: 0, suffix: " ms" },
      { key: "caretWidthPx", label: "Caret width", min: 0.5, max: 3, step: 0.1, decimals: 1, suffix: " px" },
    ],
  },
  {
    title: "Body Print",
    description: "Per-character rhythm, line pauses, punctuation timing, and block staggering for text entering the viewport.",
    controls: [
      { key: "bodyCharMs", label: "Body / character", min: 2, max: 24, step: 0.5, decimals: 1, suffix: " ms" },
      { key: "bodySpaceFactor", label: "Whitespace factor", min: 0.1, max: 1, step: 0.05, decimals: 2 },
      { key: "bodyCommaPauseMs", label: "Comma pause", min: 0, max: 100, step: 1, decimals: 0, suffix: " ms" },
      { key: "bodyLinePauseMs", label: "New-line pause", min: 0, max: 220, step: 1, decimals: 0, suffix: " ms" },
      { key: "bodyPunctuationPauseMs", label: "Sentence pause", min: 0, max: 180, step: 1, decimals: 0, suffix: " ms" },
      { key: "bodyMinDurationMs", label: "Minimum block time", min: 80, max: 1500, step: 10, decimals: 0, suffix: " ms" },
      { key: "bodyMaxDurationMs", label: "Maximum block time", min: 400, max: 6000, step: 20, decimals: 0, suffix: " ms" },
      { key: "blockStaggerMs", label: "Block stagger", min: 0, max: 240, step: 5, decimals: 0, suffix: " ms" },
    ],
  },
  {
    title: "Viewport Trigger",
    description: "When body / subtitle printing begins as the text enters the visible page.",
    controls: [
      { key: "triggerThreshold", label: "Visible threshold", min: 0.01, max: 0.8, step: 0.01, decimals: 2 },
      { key: "triggerBottomPct", label: "Bottom inset", min: 0, max: 40, step: 1, decimals: 0, suffix: "%" },
    ],
  },
  {
    title: "Nav Push Spring",
    description: "Only neighbouring, non-active categories move. The selected category remains anchored while the typed subtitle pushes collisions away.",
    controls: [
      { key: "navPushGapPx", label: "Collision gap", min: 0, max: 40, step: 1, decimals: 0, suffix: " px" },
      { key: "navSpringStiffness", label: "Spring stiffness", min: 60, max: 700, step: 5, decimals: 0 },
      { key: "navSpringDamping", label: "Spring damping", min: 5, max: 60, step: 1, decimals: 0 },
      { key: "navSpringMass", label: "Spring mass", min: 0.4, max: 2.5, step: 0.05, decimals: 2 },
    ],
  },
]

export const MOTION_PARAM_META = new Map(
  MOTION_GROUPS.flatMap((group) => group.controls.map((control) => [control.key, control])),
)

export const PUBLISHED_MOTION_CONFIG = Object.freeze({
  version: 2,
  revealEnabled: true,
  revealMode: "scan-lock",
  revealDirection: "top",
  revealDurationMs: 550,
  revealDelayMs: 0,
  revealStaggerMs: 30,
  revealSettleMs: 130,
  revealCurve: 0.8,
  revealSeed: 17,
  revealCellPx: 5,
  revealNoisePeak: 0.15,
  revealNoiseFlicker: 0.58,
  revealNoisePersistence: 0.68,
  revealThresholdBias: -0.76,
  revealClusterSize: 3.25,
  revealClusterCount: 11,
  revealClusterSpread: 0.58,
  revealClusterJitter: 0.26,
  revealScanFeather: 0.44,
  revealScanNoiseMix: 0.32,
  revealScanOvershoot: 0.11,
  navTypeMs: 22,
  navDeleteMs: 14,
  caretBlinkMs: 520,
  caretWidthPx: 1,
  bodyCharMs: 6,
  bodySpaceFactor: 0.35,
  bodyCommaPauseMs: 14,
  bodyLinePauseMs: 55,
  bodyPunctuationPauseMs: 28,
  bodyMinDurationMs: 260,
  bodyMaxDurationMs: 1800,
  blockStaggerMs: 40,
  triggerThreshold: 0.12,
  triggerBottomPct: 12,
  navPushGapPx: 10,
  navSpringStiffness: 320,
  navSpringDamping: 22,
  navSpringMass: 1,
})

export const REVEAL_PRESETS = [
  {
    id: "soft-snow",
    label: "Soft Snow",
    values: {
      revealEnabled: true,
      revealMode: "pixel-snow",
      revealDurationMs: 760,
      revealCellPx: 7,
      revealNoisePeak: 0.42,
      revealNoiseFlicker: 0.58,
      revealNoisePersistence: 0.22,
      revealCurve: 1.35,
      revealSettleMs: 130,
    },
  },
  {
    id: "dense-monitor",
    label: "Dense Monitor",
    values: {
      revealEnabled: true,
      revealMode: "pixel-snow",
      revealDurationMs: 610,
      revealCellPx: 4,
      revealNoisePeak: 0.7,
      revealNoiseFlicker: 0.82,
      revealNoisePersistence: 0.36,
      revealCurve: 1.05,
      revealSettleMs: 90,
    },
  },
  {
    id: "threshold-print",
    label: "Threshold Print",
    values: {
      revealEnabled: true,
      revealMode: "threshold-sweep",
      revealDurationMs: 880,
      revealCellPx: 6,
      revealNoisePeak: 0.2,
      revealNoiseFlicker: 0.24,
      revealThresholdBias: -0.08,
      revealCurve: 1.5,
      revealSettleMs: 120,
    },
  },
  {
    id: "cluster-bloom",
    label: "Cluster Bloom",
    values: {
      revealEnabled: true,
      revealMode: "cluster-bloom",
      revealDurationMs: 960,
      revealCellPx: 7,
      revealClusterSize: 4.6,
      revealClusterCount: 7,
      revealClusterSpread: 0.62,
      revealClusterJitter: 0.26,
      revealNoisePeak: 0.16,
      revealSettleMs: 140,
    },
  },
  {
    id: "scan-lock",
    label: "Scan Lock",
    values: {
      revealEnabled: true,
      revealMode: "scan-lock",
      revealDirection: "top",
      revealDurationMs: 720,
      revealCellPx: 6,
      revealScanFeather: 0.16,
      revealScanNoiseMix: 0.38,
      revealScanOvershoot: 0.1,
      revealNoisePeak: 0.24,
      revealSettleMs: 100,
    },
  },
]

const REVEAL_MODE_IDS = new Set(REVEAL_MODES.map(([id]) => id))
const REVEAL_DIRECTION_IDS = new Set(REVEAL_DIRECTIONS.map(([id]) => id))

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function roundToStep(value, step) {
  if (!Number.isFinite(step) || step <= 0) return value
  const precision = Math.max(0, String(step).split(".")[1]?.length || 0)
  return Number((Math.round(value / step) * step).toFixed(precision))
}

export function sanitizeMotionConfig(input, fallback = PUBLISHED_MOTION_CONFIG) {
  const config = { ...fallback, ...(input || {}) }
  for (const [key, meta] of MOTION_PARAM_META) {
    const raw = Number(config[key])
    const fallbackValue = Number(fallback[key])
    const value = Number.isFinite(raw) ? raw : fallbackValue
    config[key] = roundToStep(clamp(value, meta.min, meta.max), meta.step)
  }
  config.revealEnabled = config.revealEnabled !== false
  config.revealMode = REVEAL_MODE_IDS.has(config.revealMode) ? config.revealMode : fallback.revealMode
  config.revealDirection = REVEAL_DIRECTION_IDS.has(config.revealDirection) ? config.revealDirection : fallback.revealDirection
  config.bodyMaxDurationMs = Math.max(config.bodyMinDurationMs, config.bodyMaxDurationMs)
  config.version = 2
  return config
}

export function cloneMotionConfig(config) {
  return sanitizeMotionConfig(JSON.parse(JSON.stringify(config || {})))
}

// The viewport boundary reveal (the "snow" dissolve where a muted card
// crosses the top/bottom edge of the screen) is armed by two independent
// callers — the scheduler that first paints a muted card, and the runtime
// that keeps it breathing while the page is stationary. Both must resolve
// the exact same config, or handing the reveal off between them mid-scroll
// makes reveal-motion.js rebuild its noise grid with different values and
// flash before settling.
export function boundaryRevealMotionConfig(input) {
  const base = sanitizeMotionConfig(
    input ?? (typeof window !== "undefined" ? window.__RED_MOTION_CONFIG__ : null) ?? PUBLISHED_MOTION_CONFIG,
  )
  return {
    ...base,
    revealNoiseFlicker: Math.max(base.revealNoiseFlicker, 1),
    revealNoisePeak: Math.max(base.revealNoisePeak, 0.52),
  }
}

export function encodeMotionConfig(config) {
  const json = JSON.stringify(sanitizeMotionConfig(config))
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export function decodeMotionConfig(encoded) {
  try {
    const base64 = String(encoded || "").replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return sanitizeMotionConfig(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}
