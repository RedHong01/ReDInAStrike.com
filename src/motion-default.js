export const MOTION_GROUPS = [
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
  version: 1,
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
  config.bodyMaxDurationMs = Math.max(config.bodyMinDurationMs, config.bodyMaxDurationMs)
  config.version = 1
  return config
}

export function cloneMotionConfig(config) {
  return sanitizeMotionConfig(JSON.parse(JSON.stringify(config || {})))
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
