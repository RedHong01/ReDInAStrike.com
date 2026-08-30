export const DITHER_MODES = [
  ["native", "Native Dot"],
  ["dot", "Dot Remix"],
  ["bayer", "Bayer 8×8"],
  ["blue", "Blue Noise"],
  ["atkinson", "Atkinson"],
  ["floyd", "Floyd–Steinberg"],
  ["screen", "Screen"],
  ["line", "Line"],
]

export const CONTROL_GROUPS = [
  {
    title: "Sampling",
    description: "How finely the source image is sampled before it becomes paper / ink.",
    controls: [
      { key: "columns", label: "Columns", min: 48, max: 240, step: 4, decimals: 0 },
    ],
  },
  {
    title: "Tone",
    description: "The shared luminance → ink mapping used by every generated mode.",
    controls: [
      { key: "inkGain", label: "Ink gain", min: 0.5, max: 2, step: 0.01, decimals: 2 },
      { key: "inkBias", label: "Ink bias", min: -0.35, max: 0.35, step: 0.005, decimals: 3 },
      { key: "contrast", label: "Contrast", min: 0.5, max: 2.2, step: 0.01, decimals: 2 },
      { key: "threshold", label: "Threshold", min: 0.2, max: 0.8, step: 0.005, decimals: 3 },
    ],
  },
  {
    title: "Dot / Ordered",
    description: "Geometry for the dot remix and ordered threshold patterns.",
    controls: [
      { key: "dotScale", label: "Dot scale", min: 0.45, max: 1.6, step: 0.01, decimals: 2 },
      { key: "bayerScale", label: "Bayer scale", min: 1, max: 4, step: 1, decimals: 0 },
      { key: "blueScale", label: "Noise scale", min: 0.5, max: 4, step: 0.05, decimals: 2 },
      { key: "blueMix", label: "Blue mix", min: 0, max: 1, step: 0.01, decimals: 2 },
    ],
  },
  {
    title: "Screen",
    description: "Angle and spatial frequency of the monochrome screen pattern.",
    controls: [
      { key: "screenAngle", label: "Angle", min: -90, max: 90, step: 1, decimals: 0, suffix: "°" },
      { key: "screenFrequency", label: "Frequency", min: 1.4, max: 7, step: 0.05, decimals: 2 },
    ],
  },
  {
    title: "Line",
    description: "Shape of each ink mark in the line renderer.",
    controls: [
      { key: "lineAngle", label: "Angle", min: -90, max: 90, step: 1, decimals: 0, suffix: "°" },
      { key: "lineLength", label: "Length", min: 0.3, max: 2, step: 0.01, decimals: 2 },
      { key: "lineWeight", label: "Weight", min: 0.35, max: 2.2, step: 0.01, decimals: 2 },
    ],
  },
]

export const PARAM_META = new Map(
  CONTROL_GROUPS.flatMap((group) => group.controls.map((control) => [control.key, control])),
)

const MODE_IDS = new Set(DITHER_MODES.map(([id]) => id))
const BAYER_8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
]

let sampleCache = new WeakMap()

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function roundToStep(value, step) {
  if (!Number.isFinite(step) || step <= 0) return value
  const precision = Math.max(0, String(step).split(".")[1]?.length || 0)
  return Number((Math.round(value / step) * step).toFixed(precision))
}

export function sanitizeConfig(input, published) {
  const config = { ...published, ...(input || {}) }
  if (!MODE_IDS.has(config.mode)) config.mode = published.mode
  for (const [key, meta] of PARAM_META) {
    const fallback = published[key]
    const raw = Number(config[key])
    const value = Number.isFinite(raw) ? raw : fallback
    config[key] = roundToStep(clamp(value, meta.min, meta.max), meta.step)
  }
  config.version = 2
  return config
}

export function cloneConfig(config, published) {
  return sanitizeConfig(JSON.parse(JSON.stringify(config)), published)
}

export function configsEqual(a, b, published) {
  return JSON.stringify(sanitizeConfig(a, published)) === JSON.stringify(sanitizeConfig(b, published))
}

export function encodeConfig(config, published) {
  const json = JSON.stringify(sanitizeConfig(config, published))
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export function decodeConfig(encoded, published) {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return sanitizeConfig(JSON.parse(new TextDecoder().decode(bytes)), published)
  } catch {
    return null
  }
}

export function resetSampleCache() {
  sampleCache = new WeakMap()
}

function parseObjectPositionRatio(value) {
  const parts = String(value || "50% 50%").trim().split(/\s+/).filter(Boolean)
  let x = 0.5
  let y = 0.5
  const assign = (part, axis) => {
    const token = part.toLowerCase()
    if (token === "left") x = 0
    else if (token === "right") x = 1
    else if (token === "top") y = 0
    else if (token === "bottom") y = 1
    else if (token === "center") axis === "y" ? (y = 0.5) : (x = 0.5)
    else if (token.endsWith("%")) {
      const ratio = clamp(parseFloat(token) / 100)
      if (Number.isFinite(ratio)) axis === "y" ? (y = ratio) : (x = ratio)
    }
  }
  if (parts.length === 1) assign(parts[0], "x")
  else {
    const firstIsVertical = parts[0] === "top" || parts[0] === "bottom"
    assign(parts[0], firstIsVertical ? "y" : "x")
    assign(parts[1], firstIsVertical ? "x" : "y")
  }
  return { x, y }
}

function getImageRect(img, width, height) {
  if (!img.naturalWidth || !img.naturalHeight) return null
  const style = getComputedStyle(img)
  const fit = style.objectFit || "fill"
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  let w = width
  let h = height
  if (fit === "cover" || fit === "contain" || fit === "scale-down") {
    const coverScale = Math.max(width / iw, height / ih)
    const containScale = Math.min(width / iw, height / ih)
    const scale = fit === "cover" ? coverScale : fit === "scale-down" ? Math.min(1, containScale) : containScale
    w = iw * scale
    h = ih * scale
  } else if (fit === "none") {
    w = iw
    h = ih
  }
  const pos = parseObjectPositionRatio(style.objectPosition)
  return { x: (width - w) * pos.x, y: (height - h) * pos.y, width: w, height: h }
}

function readColors() {
  const style = getComputedStyle(document.documentElement)
  return {
    paper: style.getPropertyValue("--paper").trim() || "#f8f7f5",
    ink: style.getPropertyValue("--ink").trim() || "rgb(69, 69, 69)",
  }
}

function sampleImage(img, cssWidth, cssHeight, config) {
  const style = getComputedStyle(img)
  const cols = Math.round(config.columns)
  const rows = Math.max(1, Math.round(cols * cssHeight / Math.max(1, cssWidth)))
  const key = [img.currentSrc || img.src, img.naturalWidth, img.naturalHeight, cols, rows, style.objectFit, style.objectPosition].join("|")
  const cached = sampleCache.get(img)
  if (cached?.key === key) return cached

  const canvas = document.createElement("canvas")
  canvas.width = cols
  canvas.height = rows
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  const { paper } = readColors()
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, cols, rows)
  const rect = getImageRect(img, cols, rows)
  if (!rect) return null

  try {
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height)
    const data = ctx.getImageData(0, 0, cols, rows).data
    const luminance = new Float32Array(cols * rows)
    for (let i = 0; i < cols * rows; i += 1) {
      const j = i * 4
      luminance[i] = (data[j] * 0.2126 + data[j + 1] * 0.7152 + data[j + 2] * 0.0722) / 255
    }
    const sample = { key, cols, rows, luminance }
    sampleCache.set(img, sample)
    return sample
  } catch {
    return null
  }
}

function buildInk(sample, config) {
  const ink = new Float32Array(sample.luminance.length)
  for (let i = 0; i < sample.luminance.length; i += 1) {
    const darkness = 1 - sample.luminance[i]
    const contrasted = clamp(0.5 + (darkness - 0.5) * config.contrast)
    ink[i] = clamp(contrasted * config.inkGain + config.inkBias)
  }
  return ink
}

function hashNoise(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return value - Math.floor(value)
}

function blueNoiseThreshold(x, y, config) {
  const scale = Math.max(0.01, config.blueScale)
  const px = x / scale
  const py = y / scale
  const a = hashNoise(px, py)
  const b = hashNoise(px + 19.19, py + 47.77)
  const c = hashNoise(px * 0.5 + 73.3, py * 0.5 + 11.9)
  const structured = clamp(a * 0.55 + Math.abs(a - b) * 0.30 + c * 0.15)
  const random = hashNoise(px * 3.17 + 5.9, py * 2.73 + 9.4)
  return structured * config.blueMix + random * (1 - config.blueMix)
}

function shiftedThreshold(value, config) {
  return clamp(value + (config.threshold - 0.5))
}

function buildDiffusionMap(sample, ink, config, type) {
  const { cols, rows } = sample
  const work = Float32Array.from(ink)
  const output = new Uint8Array(cols * rows)
  const add = (x, y, amount) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return
    work[y * cols + x] += amount
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i = y * cols + x
      const oldValue = clamp(work[i])
      const newValue = oldValue >= config.threshold ? 1 : 0
      output[i] = newValue
      const error = oldValue - newValue
      if (type === "atkinson") {
        const e = error / 8
        add(x + 1, y, e); add(x + 2, y, e); add(x - 1, y + 1, e)
        add(x, y + 1, e); add(x + 1, y + 1, e); add(x, y + 2, e)
      } else {
        add(x + 1, y, error * 7 / 16)
        add(x - 1, y + 1, error * 3 / 16)
        add(x, y + 1, error * 5 / 16)
        add(x + 1, y + 1, error / 16)
      }
    }
  }
  return output
}

function ensureCanvas(card) {
  const media = card.querySelector(".project-media")
  if (!media) return null
  let canvas = media.querySelector(":scope > .dither-preview-canvas")
  if (!canvas) {
    canvas = document.createElement("canvas")
    canvas.className = "dither-preview-canvas"
    canvas.setAttribute("aria-hidden", "true")
    media.appendChild(canvas)
  }
  return { media, canvas }
}

function paintBinaryCells(ctx, sample, ink, width, height, predicate) {
  const sx = width / sample.cols
  const sy = height / sample.rows
  for (let i = 0; i < ink.length; i += 1) {
    const x = i % sample.cols
    const y = Math.floor(i / sample.cols)
    if (!predicate(i, x, y)) continue
    ctx.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(sx), Math.ceil(sy))
  }
}

function renderDot(ctx, sample, ink, width, height, config) {
  const sx = width / sample.cols
  const sy = height / sample.rows
  const cell = Math.min(sx, sy)
  let hasDots = false
  ctx.beginPath()
  for (let i = 0; i < ink.length; i += 1) {
    const radius = Math.sqrt(ink[i]) * 0.54 * cell * config.dotScale
    if (radius < 0.08) continue
    const x = (i % sample.cols + 0.5) * sx
    const y = (Math.floor(i / sample.cols) + 0.5) * sy
    ctx.moveTo(x + radius, y)
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    hasDots = true
  }
  if (hasDots) ctx.fill()
}

function renderBayer(ctx, sample, ink, width, height, config) {
  const scale = Math.max(1, Math.round(config.bayerScale))
  paintBinaryCells(ctx, sample, ink, width, height, (i, x, y) => {
    const bx = Math.floor(x / scale) % 8
    const by = Math.floor(y / scale) % 8
    return ink[i] > shiftedThreshold((BAYER_8[by][bx] + 0.5) / 64, config)
  })
}

function renderBlue(ctx, sample, ink, width, height, config) {
  paintBinaryCells(ctx, sample, ink, width, height, (i, x, y) => ink[i] > shiftedThreshold(blueNoiseThreshold(x, y, config), config))
}

function renderDiffusion(ctx, sample, ink, width, height, config, type) {
  const map = buildDiffusionMap(sample, ink, config, type)
  paintBinaryCells(ctx, sample, ink, width, height, (i) => map[i] === 1)
}

function renderScreen(ctx, sample, ink, width, height, config) {
  const sx = width / sample.cols
  const sy = height / sample.rows
  const cell = Math.min(sx, sy)
  const angle = config.screenAngle * Math.PI / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const frequency = Math.max(0.1, config.screenFrequency)
  for (let i = 0; i < ink.length; i += 1) {
    const amount = ink[i]
    if (amount < 0.01) continue
    const x = (i % sample.cols + 0.5) * sx
    const y = (Math.floor(i / sample.cols) + 0.5) * sy
    const divisor = Math.max(1, cell * frequency)
    const u = (x * cos + y * sin) / divisor
    const v = (-x * sin + y * cos) / divisor
    const pattern = (Math.sin(u * Math.PI * 2) + Math.sin(v * Math.PI * 2)) * 0.25 + 0.5
    if (amount > shiftedThreshold(pattern, config)) {
      ctx.fillRect(Math.floor(x - sx * 0.5), Math.floor(y - sy * 0.5), Math.ceil(sx), Math.ceil(sy))
    }
  }
}

function renderLine(ctx, sample, ink, width, height, config) {
  const sx = width / sample.cols
  const sy = height / sample.rows
  const cell = Math.min(sx, sy)
  const angle = config.lineAngle * Math.PI / 180
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  const minimum = clamp((config.threshold - 0.5) * 0.2 + 0.03, 0, 0.18)
  ctx.lineCap = "round"
  for (let i = 0; i < ink.length; i += 1) {
    const amount = ink[i]
    if (amount < minimum) continue
    const x = (i % sample.cols + 0.5) * sx
    const y = (Math.floor(i / sample.cols) + 0.5) * sy
    const half = cell * (0.18 + amount * 0.55) * config.lineLength
    ctx.lineWidth = Math.max(0.55, cell * (0.10 + amount * 0.22) * config.lineWeight)
    ctx.beginPath()
    ctx.moveTo(x - dx * half, y - dy * half)
    ctx.lineTo(x + dx * half, y + dy * half)
    ctx.stroke()
  }
}

export function renderCard(card, config) {
  const overlay = ensureCanvas(card)
  if (!overlay) return
  const { media, canvas } = overlay
  const img = media.querySelector("img")
  const active = config.mode !== "native" && card.classList.contains("is-filter-muted") && !!card.closest(".catalog")?.dataset.activeFilter
  canvas.dataset.active = active ? "true" : "false"
  if (!active || !img?.complete || !img.naturalWidth) return

  const rect = media.getBoundingClientRect()
  const cssWidth = Math.max(1, Math.round(rect.width))
  const cssHeight = Math.max(1, Math.round(rect.height))
  const dpr = Math.min(devicePixelRatio || 1, 2)
  const targetWidth = Math.max(1, Math.round(cssWidth * dpr))
  const targetHeight = Math.max(1, Math.round(cssHeight * dpr))
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth
    canvas.height = targetHeight
  }
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`

  const sample = sampleImage(img, cssWidth, cssHeight, config)
  if (!sample) return
  const sourceKey = img.currentSrc || img.src || ""
  canvas.dataset.ditherColumns = String(sample.cols)
  canvas.dataset.ditherRows = String(sample.rows)
  canvas.dataset.ditherMode = config.mode || "native"
  canvas.dataset.ditherCssWidth = String(cssWidth)
  canvas.dataset.ditherCssHeight = String(cssHeight)
  canvas.dataset.ditherSource = sourceKey
  canvas.dataset.ditherRenderSignature = [
    config.mode || "native",
    sourceKey,
    img.naturalWidth,
    img.naturalHeight,
    cssWidth,
    cssHeight,
    sample.cols,
    sample.rows,
  ].join("|")

  const inkValues = buildInk(sample, config)
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const { paper, ink } = readColors()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, cssWidth, cssHeight)
  ctx.fillStyle = ink
  ctx.strokeStyle = ink

  if (config.mode === "dot") renderDot(ctx, sample, inkValues, cssWidth, cssHeight, config)
  else if (config.mode === "bayer") renderBayer(ctx, sample, inkValues, cssWidth, cssHeight, config)
  else if (config.mode === "blue") renderBlue(ctx, sample, inkValues, cssWidth, cssHeight, config)
  else if (config.mode === "atkinson") renderDiffusion(ctx, sample, inkValues, cssWidth, cssHeight, config, "atkinson")
  else if (config.mode === "floyd") renderDiffusion(ctx, sample, inkValues, cssWidth, cssHeight, config, "floyd")
  else if (config.mode === "screen") renderScreen(ctx, sample, inkValues, cssWidth, cssHeight, config)
  else if (config.mode === "line") renderLine(ctx, sample, inkValues, cssWidth, cssHeight, config)
}
