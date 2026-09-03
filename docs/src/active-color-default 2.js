export const ACTIVE_COLOR_GROUPS = [
  {
    title: "Color Snow Timing",
    description: "Timing for category-matched cards. The image dissolves into local-color static on exit and resolves from the same static on entry.",
    controls: [
      { key: "activeColorDurationMs", label: "Reveal duration", min: 180, max: 1800, step: 10, decimals: 0, suffix: " ms" },
      { key: "activeColorExitDurationMs", label: "Dissolve duration", min: 160, max: 900, step: 10, decimals: 0, suffix: " ms" },
      { key: "activeColorDelayMs", label: "Start delay", min: 0, max: 500, step: 10, decimals: 0, suffix: " ms" },
      { key: "activeColorStaggerMs", label: "Card stagger", min: 0, max: 160, step: 2, decimals: 0, suffix: " ms" },
      { key: "activeColorSettleMs", label: "Final settle", min: 0, max: 500, step: 10, decimals: 0, suffix: " ms" },
      { key: "activeColorBreathHoldMs", label: "Category breath hold", min: 0, max: 520, step: 10, decimals: 0, suffix: " ms" },
      { key: "activeColorBreathAmount", label: "Category breath amount", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "activeColorBreathRate", label: "Category breath rate", min: 0.12, max: 1.6, step: 0.01, decimals: 2, suffix: " Hz" },
      { key: "activeColorCurve", label: "Resolve curve", min: 0.35, max: 3, step: 0.05, decimals: 2 },
      { key: "activeColorSeed", label: "Random seed", min: 1, max: 9999, step: 1, decimals: 0 },
    ],
  },
  {
    title: "Local Color Sampling",
    description: "Colors are selected from the image itself. Neighbour sampling pulls each square toward the closest local image color instead of inventing a separate palette.",
    controls: [
      { key: "activeColorCellPx", label: "Pixel cell", min: 2, max: 24, step: 1, decimals: 0, suffix: " px" },
      { key: "activeColorPaletteLevels", label: "Palette levels", min: 4, max: 32, step: 1, decimals: 0 },
      { key: "activeColorNeighborRadius", label: "Neighbour radius", min: 0, max: 4, step: 1, decimals: 0 },
      { key: "activeColorNeighborMix", label: "Neighbour color mix", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "activeColorSaturation", label: "Color saturation", min: 0.45, max: 1.5, step: 0.01, decimals: 2 },
    ],
  },
  {
    title: "Chromatic Static",
    description: "Controls how much local color appears inside the unresolved pixel field and how strongly neighboring squares form small signal clusters.",
    controls: [
      { key: "activeColorNoiseDensity", label: "Color snow density", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "activeColorFlicker", label: "Snow flicker", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "activeColorPaperRatio", label: "Paper / color balance", min: 0, max: 1, step: 0.01, decimals: 2 },
      { key: "activeColorClusterSize", label: "Signal cluster size", min: 1, max: 14, step: 1, decimals: 0 },
      { key: "activeColorClusterMix", label: "Cluster mix", min: 0, max: 1, step: 0.01, decimals: 2 },
    ],
  },
]

export const ACTIVE_COLOR_PARAM_META = new Map(
  ACTIVE_COLOR_GROUPS.flatMap((group) => group.controls.map((control) => [control.key, control])),
)

export const PUBLISHED_ACTIVE_COLOR_CONFIG = Object.freeze({
  version: 1,
  activeColorEnabled: true,
  activeColorDurationMs: 660,
  activeColorExitDurationMs: 350,
  activeColorDelayMs: 10,
  activeColorStaggerMs: 26,
  activeColorSettleMs: 110,
  activeColorBreathHoldMs: 220,
  activeColorBreathAmount: 0.56,
  activeColorBreathRate: 0.42,
  activeColorCurve: 1.4,
  activeColorSeed: 41,
  activeColorCellPx: 3,
  activeColorPaletteLevels: 28,
  activeColorNeighborRadius: 1,
  activeColorNeighborMix: 0.46,
  activeColorSaturation: 1.08,
  activeColorNoiseDensity: 0.55,
  activeColorFlicker: 0.62,
  activeColorPaperRatio: 0.5,
  activeColorClusterSize: 3,
  activeColorClusterMix: 0.16,
})

export const ACTIVE_COLOR_PRESETS = [
  {
    id: "local-color-soft",
    label: "Local Color Soft",
    values: {
      activeColorDurationMs: 720,
      activeColorExitDurationMs: 390,
      activeColorBreathHoldMs: 260,
      activeColorBreathAmount: 0.5,
      activeColorBreathRate: 0.36,
      activeColorCellPx: 6,
      activeColorPaletteLevels: 16,
      activeColorNeighborRadius: 2,
      activeColorNeighborMix: 0.72,
      activeColorNoiseDensity: 0.62,
      activeColorFlicker: 0.5,
      activeColorPaperRatio: 0.43,
      activeColorClusterSize: 5,
      activeColorClusterMix: 0.34,
    },
  },
  {
    id: "chromatic-static",
    label: "Chromatic Static",
    values: {
      activeColorDurationMs: 610,
      activeColorExitDurationMs: 340,
      activeColorBreathHoldMs: 180,
      activeColorBreathAmount: 0.7,
      activeColorBreathRate: 0.58,
      activeColorCellPx: 4,
      activeColorPaletteLevels: 22,
      activeColorNeighborRadius: 1,
      activeColorNeighborMix: 0.58,
      activeColorNoiseDensity: 0.82,
      activeColorFlicker: 0.78,
      activeColorPaperRatio: 0.26,
      activeColorClusterSize: 3,
      activeColorClusterMix: 0.2,
    },
  },
  {
    id: "palette-blocks",
    label: "Palette Blocks",
    values: {
      activeColorDurationMs: 840,
      activeColorExitDurationMs: 430,
      activeColorBreathHoldMs: 280,
      activeColorBreathAmount: 0.44,
      activeColorBreathRate: 0.3,
      activeColorCellPx: 9,
      activeColorPaletteLevels: 9,
      activeColorNeighborRadius: 3,
      activeColorNeighborMix: 0.88,
      activeColorSaturation: 0.92,
      activeColorNoiseDensity: 0.68,
      activeColorFlicker: 0.34,
      activeColorPaperRatio: 0.38,
      activeColorClusterSize: 8,
      activeColorClusterMix: 0.58,
    },
  },
  {
    id: "fine-signal",
    label: "Fine Signal",
    values: {
      activeColorDurationMs: 660,
      activeColorExitDurationMs: 350,
      activeColorBreathHoldMs: 220,
      activeColorBreathAmount: 0.56,
      activeColorBreathRate: 0.42,
      activeColorCellPx: 3,
      activeColorPaletteLevels: 28,
      activeColorNeighborRadius: 1,
      activeColorNeighborMix: 0.46,
      activeColorSaturation: 1.08,
      activeColorNoiseDensity: 0.55,
      activeColorFlicker: 0.62,
      activeColorPaperRatio: 0.5,
      activeColorClusterSize: 3,
      activeColorClusterMix: 0.16,
    },
  },
]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function roundToStep(value, step) {
  if (!Number.isFinite(step) || step <= 0) return value
  const precision = Math.max(0, String(step).split(".")[1]?.length || 0)
  return Number((Math.round(value / step) * step).toFixed(precision))
}

export function sanitizeActiveColorConfig(input, fallback = PUBLISHED_ACTIVE_COLOR_CONFIG) {
  const config = { ...fallback, ...(input || {}) }
  for (const [key, meta] of ACTIVE_COLOR_PARAM_META) {
    const raw = Number(config[key])
    const fallbackValue = Number(fallback[key])
    const value = Number.isFinite(raw) ? raw : fallbackValue
    config[key] = roundToStep(clamp(value, meta.min, meta.max), meta.step)
  }
  config.activeColorEnabled = config.activeColorEnabled !== false
  config.version = 1
  return config
}

export function cloneActiveColorConfig(config) {
  return sanitizeActiveColorConfig(JSON.parse(JSON.stringify(config || {})))
}

export function encodeActiveColorConfig(config) {
  const json = JSON.stringify(sanitizeActiveColorConfig(config))
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export function decodeActiveColorConfig(encoded) {
  try {
    const base64 = String(encoded || "").replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return sanitizeActiveColorConfig(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}
