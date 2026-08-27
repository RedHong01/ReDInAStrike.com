const DITHER_STORAGE_KEY = "red-dither-mode"
const DITHER_COLUMNS = 132
const DITHER_MODES = [
  ["dot", "Dot"],
  ["bayer", "Bayer 8x8"],
  ["blue", "Blue Noise"],
  ["atkinson", "Atkinson"],
  ["floyd", "Floyd-Steinberg"],
  ["screen", "Screen 45deg"],
  ["line", "Line"],
]

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

const state = {
  mode: localStorage.getItem(DITHER_STORAGE_KEY) || "dot",
  sampleCache: new WeakMap(),
  raf: 0,
  observer: null,
  resizeObserver: null,
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
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

function sampleImage(img, cssWidth, cssHeight) {
  const style = getComputedStyle(img)
  const key = [img.currentSrc || img.src, img.naturalWidth, img.naturalHeight, Math.round(cssWidth), Math.round(cssHeight), style.objectFit, style.objectPosition].join("|")
  const cached = state.sampleCache.get(img)
  if (cached?.key === key) return cached

  const cols = DITHER_COLUMNS
  const rows = Math.max(1, Math.round(cols * cssHeight / Math.max(1, cssWidth)))
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
    const ink = new Float32Array(cols * rows)
    for (let i = 0; i < cols * rows; i += 1) {
      const j = i * 4
      const lum = (data[j] * 0.2126 + data[j + 1] * 0.7152 + data[j + 2] * 0.0722) / 255
      luminance[i] = lum
      ink[i] = clamp((1 - lum) * 1.18 - 0.025)
    }
    const sample = { key, cols, rows, luminance, ink }
    state.sampleCache.set(img, sample)
    return sample
  } catch {
    return null
  }
}

function hashNoise(x, y) {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return v - Math.floor(v)
}

function blueNoiseThreshold(x, y) {
  const a = hashNoise(x, y)
  const b = hashNoise(x + 19.19, y + 47.77)
  const c = hashNoise(x * 0.5 + 73.3, y * 0.5 + 11.9)
  return clamp(a * 0.55 + Math.abs(a - b) * 0.30 + c * 0.15)
}

function getDiffusionMap(sample, type) {
  const cacheKey = `_${type}`
  if (sample[cacheKey]) return sample[cacheKey]
  const { cols, rows, ink } = sample
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
      const newValue = oldValue >= 0.5 ? 1 : 0
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
        add(x + 1, y + 1, error * 1 / 16)
      }
    }
  }
  sample[cacheKey] = output
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

function paintBinaryCells(ctx, sample, width, height, predicate) {
  const sx = width / sample.cols
  const sy = height / sample.rows
  for (let i = 0; i < sample.ink.length; i += 1) {
    const x = i % sample.cols
    const y = Math.floor(i / sample.cols)
    if (!predicate(i, x, y)) continue
    ctx.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(sx), Math.ceil(sy))
  }
}

function renderBayer(ctx, sample, width, height) {
  paintBinaryCells(ctx, sample, width, height, (i, x, y) => sample.ink[i] > (BAYER_8[y % 8][x % 8] + 0.5) / 64)
}

function renderBlue(ctx, sample, width, height) {
  paintBinaryCells(ctx, sample, width, height, (i, x, y) => sample.ink[i] > blueNoiseThreshold(x, y))
}

function renderDiffusion(ctx, sample, width, height, type) {
  const map = getDiffusionMap(sample, type)
  paintBinaryCells(ctx, sample, width, height, (i) => map[i] === 1)
}

function renderScreen(ctx, sample, width, height) {
  const sx = width / sample.cols
  const sy = height / sample.rows
  const cell = Math.min(sx, sy)
  const angle = Math.PI / 4
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  for (let i = 0; i < sample.ink.length; i += 1) {
    const amount = sample.ink[i]
    if (amount < 0.03) continue
    const x = (i % sample.cols + 0.5) * sx
    const y = (Math.floor(i / sample.cols) + 0.5) * sy
    const u = (x * cos + y * sin) / Math.max(1, cell * 3.1)
    const v = (-x * sin + y * cos) / Math.max(1, cell * 3.1)
    const threshold = ((Math.sin(u * Math.PI * 2) + Math.sin(v * Math.PI * 2)) * 0.25 + 0.5)
    if (amount > threshold) ctx.fillRect(Math.floor(x - sx * 0.5), Math.floor(y - sy * 0.5), Math.ceil(sx), Math.ceil(sy))
  }
}

function renderLine(ctx, sample, width, height) {
  const sx = width / sample.cols
  const sy = height / sample.rows
  const cell = Math.min(sx, sy)
  ctx.lineCap = "round"
  const angle = -Math.PI / 4
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  for (let i = 0; i < sample.ink.length; i += 1) {
    const amount = sample.ink[i]
    if (amount < 0.06) continue
    const x = (i % sample.cols + 0.5) * sx
    const y = (Math.floor(i / sample.cols) + 0.5) * sy
    const half = cell * (0.18 + amount * 0.55)
    ctx.lineWidth = Math.max(0.7, cell * (0.10 + amount * 0.22))
    ctx.beginPath()
    ctx.moveTo(x - dx * half, y - dy * half)
    ctx.lineTo(x + dx * half, y + dy * half)
    ctx.stroke()
  }
}

function renderCard(card) {
  const overlay = ensureCanvas(card)
  if (!overlay) return
  const { media, canvas } = overlay
  const img = media.querySelector("img")
  const active = state.mode !== "dot" && card.classList.contains("is-filter-muted") && !!card.closest(".catalog")?.dataset.activeFilter
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

  const sample = sampleImage(img, cssWidth, cssHeight)
  if (!sample) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const { paper, ink } = readColors()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, cssWidth, cssHeight)
  ctx.fillStyle = ink
  ctx.strokeStyle = ink

  if (state.mode === "bayer") renderBayer(ctx, sample, cssWidth, cssHeight)
  else if (state.mode === "blue") renderBlue(ctx, sample, cssWidth, cssHeight)
  else if (state.mode === "atkinson") renderDiffusion(ctx, sample, cssWidth, cssHeight, "atkinson")
  else if (state.mode === "floyd") renderDiffusion(ctx, sample, cssWidth, cssHeight, "floyd")
  else if (state.mode === "screen") renderScreen(ctx, sample, cssWidth, cssHeight)
  else if (state.mode === "line") renderLine(ctx, sample, cssWidth, cssHeight)
}

function renderAll() {
  state.raf = 0
  document.querySelectorAll(".project-card").forEach(renderCard)
  updatePanel()
}

function requestRender() {
  if (state.raf) return
  state.raf = requestAnimationFrame(renderAll)
}

function setMode(mode) {
  if (!DITHER_MODES.some(([id]) => id === mode)) return
  state.mode = mode
  localStorage.setItem(DITHER_STORAGE_KEY, mode)
  requestRender()
}

function updatePanel() {
  document.querySelectorAll("[data-dither-mode]").forEach((button) => {
    const active = button.dataset.ditherMode === state.mode
    button.classList.toggle("is-active", active)
    button.setAttribute("aria-pressed", active ? "true" : "false")
  })
}

function mountPanel() {
  if (document.querySelector(".dither-lab")) return
  const panel = document.createElement("aside")
  panel.className = "dither-lab"
  panel.innerHTML = `<div class="dither-lab__head"><span class="dither-lab__title">DITHER PREVIEW</span><span class="dither-lab__keys">1-7</span></div><div class="dither-lab__buttons">${DITHER_MODES.map(([id, label], index) => `<button class="dither-lab__button" type="button" data-dither-mode="${id}"><span class="dither-lab__number">${index + 1}</span><span>${label}</span></button>`).join("")}</div>`
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-dither-mode]")
    if (button) setMode(button.dataset.ditherMode)
  })
  document.body.appendChild(panel)
  updatePanel()
}

function bindObservers() {
  state.observer?.disconnect()
  state.resizeObserver?.disconnect()
  const catalog = document.querySelector(".catalog")
  if (!catalog) return
  state.observer = new MutationObserver(requestRender)
  state.observer.observe(catalog, { attributes: true, subtree: true, attributeFilter: ["class", "data-active-filter"] })
  if ("ResizeObserver" in window) {
    state.resizeObserver = new ResizeObserver(requestRender)
    catalog.querySelectorAll(".project-media").forEach((media) => state.resizeObserver.observe(media))
  }
  catalog.querySelectorAll("img").forEach((img) => img.addEventListener("load", requestRender, { passive: true }))
}

function boot() {
  mountPanel()
  bindObservers()
  requestRender()
}

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const tag = document.activeElement?.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
  const index = Number(event.key) - 1
  if (index >= 0 && index < DITHER_MODES.length) setMode(DITHER_MODES[index][0])
})

window.addEventListener("resize", requestRender, { passive: true })
window.addEventListener("hashchange", () => setTimeout(() => { bindObservers(); requestRender() }, 0))

const appRoot = document.querySelector("#app")
if (appRoot) {
  new MutationObserver(() => {
    bindObservers()
    requestRender()
  }).observe(appRoot, { childList: true })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true })
else boot()
