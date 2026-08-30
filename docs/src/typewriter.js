import {
  PUBLISHED_MOTION_CONFIG,
  sanitizeMotionConfig,
} from "./motion-default.js"
import "./motion-hub.js"

let motion = sanitizeMotionConfig(window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG)
let bodyObserver = null
let appObserver = null
let catalogObserver = null
let bodyAttributeObserver = null
let hoveredNavCategory = null
let focusedNavCategory = null
let scanFrame = 0
let bodyStartSequence = 0
let currentNav = null
let navPushMeasureFrame = 0
let navPushFrame = 0
let navPushLastTime = 0

const bodyStates = new WeakMap()
const navStates = new WeakMap()
const navPushStates = new Map()

const BODY_SELECTOR = [
  "#app main p",
  "#app main li",
  "#app main figcaption",
  "#app .project-meta",
  "#app .footer-gallery-meta",
  "#app .resume-project-body",
  "#app .resume-sidebar-body",
  "#app .resume-education-program",
  "#app .resume-project-head p",
  "#app .resume-project-head time",
  "#app .detail-heading p",
  "#app .detail-heading span",
  "#app .framer-derived-year",
  "#app .framer-derived-category",
  "#app .framer-case-year",
  "#app .framer-case-category",
  "#app .body-copy-en",
  "#app .body-copy-zh",
].join(",")

const BODY_EXCLUDE_SELECTOR = [
  ".nav-detail",
  ".site-header",
  ".dither-lab",
  ".project-lightbox",
  "[data-typewriter-skip]",
].join(",")

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
}

function ensureStyles() {
  if (document.querySelector("#typewriter-runtime-styles")) return
  const style = document.createElement("style")
  style.id = "typewriter-runtime-styles"
  style.textContent = `
    @keyframes typewriter-caret-blink {
      0%, 46% { opacity: 1; }
      47%, 100% { opacity: 0; }
    }

    .nav-detail[data-typewriter-nav="true"] {
      max-height: 24px !important;
      max-width: min(360px, calc(100vw - 32px)) !important;
      overflow: visible !important;
      visibility: hidden !important;
      opacity: 1 !important;
      clip-path: none !important;
      transform: none !important;
      transition: none !important;
      will-change: auto !important;
    }

    .nav-detail[data-typewriter-nav="true"].is-typewriter-visible {
      visibility: visible !important;
    }

    body[data-nav-density="full"] .nav-detail[data-typewriter-nav="true"] {
      max-width: min(260px, calc(100vw - var(--header-pad) * 2 - var(--logo-width) - 80px)) !important;
      max-height: 18px !important;
      margin-top: 1px;
      transform: none !important;
    }

    .nav-detail[data-typewriter-nav="true"].is-typewriter-editing::after,
    [data-typewriter-body="typing"]::after {
      content: "";
      display: inline-block;
      width: var(--tw-caret-width, 1px);
      height: 0.92em;
      margin-left: 0.08em;
      vertical-align: -0.08em;
      background: currentColor;
      animation: typewriter-caret-blink var(--tw-caret-blink, 520ms) steps(1, end) infinite;
      pointer-events: none;
    }

    .nav-item {
      --nav-typewriter-push-x: 0px;
      translate: var(--nav-typewriter-push-x) 0;
      will-change: transform, translate;
    }

    [data-typewriter-body] {
      position: relative;
    }

    [data-typewriter-body="observing"] {
      visibility: hidden;
    }

    [data-typewriter-body="typing"],
    [data-typewriter-body="done"] {
      visibility: visible;
    }

    /*
     * Generated dither must always cover the responsive media box while its expensive
     * backing bitmap waits for the settled ResizeObserver redraw. The old bitmap is
     * stretched by CSS for those few frames; the native dot layer underneath is hidden
     * so stale circular halftone can never bleed around the edges.
     */
    .project-media {
      overflow: hidden;
    }

    .dither-preview-canvas {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
    }

    .catalog[data-active-filter]
      .project-card.is-filter-muted:has(.dither-preview-canvas[data-active="true"])
      .project-halftone {
      opacity: 0 !important;
      visibility: hidden !important;
    }

    @media (prefers-reduced-motion: reduce) {
      .nav-detail[data-typewriter-nav="true"].is-typewriter-editing::after,
      [data-typewriter-body="typing"]::after {
        animation: none;
        opacity: 0;
      }
    }
  `
  document.head.append(style)
}

function applyMotionCssVariables() {
  document.documentElement.style.setProperty("--tw-caret-blink", `${motion.caretBlinkMs}ms`)
  document.documentElement.style.setProperty("--tw-caret-width", `${motion.caretWidthPx}px`)
}

function getCatalogFilter() {
  return document.querySelector(".catalog")?.dataset.activeFilter || null
}

function getEffectiveNavCategory() {
  return focusedNavCategory || hoveredNavCategory || getCatalogFilter()
}

function createNavState(detail) {
  const fullText = detail.dataset.typewriterText || detail.textContent || ""
  detail.dataset.typewriterText = fullText
  detail.dataset.typewriterNav = "true"
  detail.textContent = ""
  const state = {
    detail,
    text: fullText,
    count: 0,
    target: 0,
    accumulator: 0,
    lastTime: 0,
    frame: 0,
  }
  navStates.set(detail, state)
  return state
}

function renderNavState(state) {
  const nextText = state.text.slice(0, state.count)
  if (state.detail.textContent !== nextText) state.detail.textContent = nextText

  const editing = state.count !== state.target
  const visible = state.count > 0 || editing || state.target > 0
  state.detail.classList.toggle("is-typewriter-visible", visible)
  state.detail.classList.toggle("is-typewriter-editing", editing)
  scheduleNavPushMeasure()
}

function animateNavState(state, time) {
  state.frame = 0
  if (!state.lastTime) state.lastTime = time
  const elapsed = Math.min(80, time - state.lastTime)
  state.lastTime = time
  state.accumulator += elapsed

  const growing = state.target > state.count
  const interval = Math.max(1, growing ? motion.navTypeMs : motion.navDeleteMs)
  let changed = false

  while (state.count !== state.target && state.accumulator >= interval) {
    state.accumulator -= interval
    state.count += growing ? 1 : -1
    changed = true
  }

  if (changed) renderNavState(state)

  if (state.count !== state.target) {
    state.frame = requestAnimationFrame((nextTime) => animateNavState(state, nextTime))
    return
  }

  state.accumulator = 0
  state.lastTime = 0
  renderNavState(state)
}

function setNavTarget(detail, visible) {
  const state = navStates.get(detail) || createNavState(detail)
  const nextTarget = visible ? state.text.length : 0
  if (state.target === nextTarget) return
  state.target = nextTarget
  state.accumulator = 0
  state.lastTime = 0
  renderNavState(state)
  if (!state.frame) {
    state.frame = requestAnimationFrame((time) => animateNavState(state, time))
  }
}

function refreshNavTargets() {
  const nav = document.querySelector(".nav-list")
  if (!nav) return

  const activeCategory = getEffectiveNavCategory()
  nav.querySelectorAll(".nav-item[data-nav-category]").forEach((item) => {
    const detail = item.querySelector(".nav-detail")
    if (!detail) return
    if (!navStates.has(detail)) createNavState(detail)
    setNavTarget(detail, item.dataset.navCategory === activeCategory)
  })
  scheduleNavPushMeasure()
}

function clearDetachedPushStates() {
  for (const [item] of navPushStates) {
    if (!item.isConnected) navPushStates.delete(item)
  }
}

function getPushState(item) {
  let state = navPushStates.get(item)
  if (!state) {
    state = { item, x: 0, velocity: 0, target: 0 }
    navPushStates.set(item, state)
  }
  return state
}

function requestNavPushFrame() {
  if (navPushFrame) return
  navPushFrame = requestAnimationFrame(animateNavPush)
}

function setAllPushTargetsToZero(items = []) {
  items.forEach((item) => {
    getPushState(item).target = 0
  })
  requestNavPushFrame()
}

function measureNavPushTargets() {
  navPushMeasureFrame = 0
  const nav = document.querySelector(".nav-list")
  if (!nav) return

  const items = [...nav.querySelectorAll(".nav-item[data-nav-category]")]
  clearDetachedPushStates()
  items.forEach((item) => { getPushState(item).target = 0 })

  if (
    prefersReducedMotion() ||
    document.body.dataset.navDensity === "full" ||
    items.length < 2
  ) {
    setAllPushTargetsToZero(items)
    return
  }

  const category = getEffectiveNavCategory()
  const activeIndex = items.findIndex((item) => item.dataset.navCategory === category)
  if (activeIndex <= 0) {
    requestNavPushFrame()
    return
  }

  const activeItem = items[activeIndex]
  const detail = activeItem.querySelector(".nav-detail")
  const detailState = detail ? navStates.get(detail) : null
  if (!detail || !detailState || detailState.count <= 0) {
    requestNavPushFrame()
    return
  }

  const detailRect = detail.getBoundingClientRect()
  const navRect = nav.getBoundingClientRect()
  if (detailRect.width <= 1 || navRect.width <= 1) {
    requestNavPushFrame()
    return
  }

  let rightBoundary = detailRect.left - motion.navPushGapPx

  for (let index = activeIndex - 1; index >= 0; index -= 1) {
    const item = items[index]
    const push = getPushState(item)
    const rect = item.getBoundingClientRect()
    const baseLeft = rect.left - push.x
    const baseRight = rect.right - push.x
    let target = Math.min(0, rightBoundary - baseRight)

    const minimumTarget = navRect.left - baseLeft
    target = Math.max(target, minimumTarget)
    push.target = target
    rightBoundary = baseLeft + target - motion.navPushGapPx
  }

  requestNavPushFrame()
}

function scheduleNavPushMeasure() {
  if (navPushMeasureFrame) return
  navPushMeasureFrame = requestAnimationFrame(measureNavPushTargets)
}

function animateNavPush(time) {
  navPushFrame = 0
  const elapsed = navPushLastTime ? Math.min(0.034, (time - navPushLastTime) / 1000) : 1 / 60
  navPushLastTime = time
  let moving = false

  const stiffness = Math.max(1, motion.navSpringStiffness)
  const damping = Math.max(0, motion.navSpringDamping)
  const mass = Math.max(0.1, motion.navSpringMass)

  for (const state of navPushStates.values()) {
    if (!state.item.isConnected) continue

    if (prefersReducedMotion()) {
      state.x = state.target
      state.velocity = 0
    } else {
      const displacement = state.x - state.target
      const acceleration = (-stiffness * displacement - damping * state.velocity) / mass
      state.velocity += acceleration * elapsed
      state.x += state.velocity * elapsed

      if (Math.abs(state.x - state.target) < 0.08 && Math.abs(state.velocity) < 1.2) {
        state.x = state.target
        state.velocity = 0
      } else {
        moving = true
      }
    }

    state.item.style.setProperty("--nav-typewriter-push-x", `${state.x.toFixed(2)}px`)
  }

  if (moving) navPushFrame = requestAnimationFrame(animateNavPush)
  else navPushLastTime = 0
}

function bindNav() {
  const nav = document.querySelector(".nav-list")
  if (!nav) return

  if (currentNav !== nav) {
    currentNav = nav
    hoveredNavCategory = null
    focusedNavCategory = null
    navPushStates.clear()
  }

  if (nav.dataset.typewriterBound === "true") {
    refreshNavTargets()
    return
  }

  nav.dataset.typewriterBound = "true"
  nav.querySelectorAll(".nav-item[data-nav-category]").forEach((item) => {
    const detail = item.querySelector(".nav-detail")
    if (detail && !navStates.has(detail)) createNavState(detail)

    item.addEventListener("pointerenter", () => {
      hoveredNavCategory = item.dataset.navCategory || null
      refreshNavTargets()
    })

    item.addEventListener("pointerleave", () => {
      if (hoveredNavCategory === item.dataset.navCategory) hoveredNavCategory = null
      refreshNavTargets()
    })

    item.addEventListener("focusin", () => {
      focusedNavCategory = item.dataset.navCategory || null
      refreshNavTargets()
    })

    item.addEventListener("focusout", () => {
      if (focusedNavCategory === item.dataset.navCategory) focusedNavCategory = null
      refreshNavTargets()
    })
  })

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleNavPushMeasure)
    observer.observe(nav)
  }

  refreshNavTargets()
}

function bindCatalogObserver() {
  catalogObserver?.disconnect()
  catalogObserver = null
  const catalog = document.querySelector(".catalog")
  if (!catalog || !("MutationObserver" in window)) return

  catalogObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === "data-active-filter")) {
      refreshNavTargets()
    }
  })

  catalogObserver.observe(catalog, {
    attributes: true,
    attributeFilter: ["data-active-filter"],
  })
}

function bindBodyAttributeObserver() {
  bodyAttributeObserver?.disconnect()
  if (!("MutationObserver" in window)) return
  bodyAttributeObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) =>
      mutation.attributeName === "data-nav-density" || mutation.attributeName === "data-header-compact",
    )) {
      scheduleNavPushMeasure()
    }
  })
  bodyAttributeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-nav-density", "data-header-compact"],
  })
}

function collectTypingTextNodes(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  const records = []
  let offset = 0
  while (walker.nextNode()) {
    const node = walker.currentNode
    const value = node.nodeValue || ""
    if (!value) continue
    if (/^\s+$/.test(value) && value.includes("\n")) continue
    records.push({
      node,
      text: value,
      start: offset,
      end: offset + value.length,
    })
    offset += value.length
  }
  return { records, total: offset }
}

function measureLineStarts(records) {
  const starts = new Set()
  let previousTop = null
  let range = null
  try {
    range = document.createRange()
    for (const record of records) {
      const text = record.text
      const tokenPattern = /\S+\s*/g
      let match
      while ((match = tokenPattern.exec(text))) {
        const localStart = match.index
        const localEnd = Math.min(text.length, match.index + match[0].length)
        range.setStart(record.node, localStart)
        range.setEnd(record.node, localEnd)
        const rects = range.getClientRects()
        if (!rects.length) continue
        const top = rects[0].top
        if (previousTop !== null && Math.abs(top - previousTop) > 2) {
          starts.add(record.start + localStart)
        }
        previousTop = rects[rects.length - 1].top
      }
    }
  } catch {
    return starts
  } finally {
    range?.detach?.()
  }
  return starts
}

function charDuration(character) {
  if (/[.!?。！？;；:：]/.test(character)) return motion.bodyPunctuationPauseMs
  if (/[,，、]/.test(character)) return motion.bodyCommaPauseMs
  if (/\s/.test(character)) return motion.bodyCharMs * motion.bodySpaceFactor
  return motion.bodyCharMs
}

function buildTimeline(records, lineStarts, total) {
  const chars = new Array(total)
  for (const record of records) {
    for (let index = 0; index < record.text.length; index += 1) {
      chars[record.start + index] = record.text[index]
    }
  }

  const timeline = new Float32Array(total + 1)
  let elapsed = 0
  for (let index = 0; index < total; index += 1) {
    if (lineStarts.has(index)) elapsed += motion.bodyLinePauseMs
    elapsed += charDuration(chars[index] || "")
    timeline[index + 1] = elapsed
  }

  if (!elapsed) return timeline
  const targetDuration = Math.min(
    motion.bodyMaxDurationMs,
    Math.max(motion.bodyMinDurationMs, elapsed),
  )
  const scale = targetDuration / elapsed
  if (Math.abs(scale - 1) > 0.001) {
    for (let index = 1; index < timeline.length; index += 1) {
      timeline[index] *= scale
    }
  }
  return timeline
}

function setVisibleCharacterCount(state, count) {
  if (state.visibleCount === count) return
  state.visibleCount = count

  for (const record of state.records) {
    let next = ""
    if (count >= record.end) next = record.text
    else if (count > record.start) next = record.text.slice(0, count - record.start)
    if (record.node.nodeValue !== next) record.node.nodeValue = next
  }
}

function findTimelineCount(timeline, elapsed) {
  let low = 0
  let high = timeline.length - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (timeline[mid] <= elapsed) low = mid
    else high = mid - 1
  }
  return low
}

function finishBodyState(state) {
  setVisibleCharacterCount(state, state.total)
  state.block.dataset.typewriterBody = "done"
  state.block.style.removeProperty("min-height")
  state.block.removeAttribute("aria-busy")
  state.frame = 0
  bodyObserver?.unobserve(state.block)
}

function animateBodyState(state, time) {
  if (!state.startedAt) state.startedAt = time
  const elapsed = time - state.startedAt
  const count = findTimelineCount(state.timeline, elapsed)
  setVisibleCharacterCount(state, count)

  if (count >= state.total) {
    finishBodyState(state)
    return
  }

  state.frame = requestAnimationFrame((nextTime) => animateBodyState(state, nextTime))
}

function startBodyState(block) {
  if (prefersReducedMotion()) return
  const existing = bodyStates.get(block)
  if (existing?.started || block.dataset.typewriterBody === "done") return

  const rect = block.getBoundingClientRect()
  if (rect.width <= 1 || rect.height <= 1) return

  const { records, total } = collectTypingTextNodes(block)
  if (!records.length || total < 2) {
    block.dataset.typewriterBody = "done"
    bodyObserver?.unobserve(block)
    return
  }

  const lineStarts = measureLineStarts(records)
  const timeline = buildTimeline(records, lineStarts, total)
  const state = existing || {
    block,
    records,
    total,
    timeline,
    visibleCount: -1,
    started: false,
    startedAt: 0,
    frame: 0,
  }
  state.records = records
  state.total = total
  state.timeline = timeline
  state.started = true
  bodyStates.set(block, state)

  block.dataset.typewriterBody = "typing"
  block.setAttribute("aria-busy", "true")
  if (!block.hasAttribute("aria-label")) {
    const readable = (block.textContent || "").trim()
    if (readable) block.setAttribute("aria-label", readable)
  }
  block.style.minHeight = `${Math.ceil(rect.height)}px`
  setVisibleCharacterCount(state, 0)

  const sequenceDelay = Math.min(motion.blockStaggerMs * 3, bodyStartSequence * motion.blockStaggerMs)
  bodyStartSequence = (bodyStartSequence + 1) % 4
  window.setTimeout(() => {
    if (block.dataset.typewriterBody !== "typing") return
    state.frame = requestAnimationFrame((time) => animateBodyState(state, time))
  }, sequenceDelay)
}

function handleBodyIntersections(entries) {
  const entering = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

  entering.forEach((entry) => startBodyState(entry.target))
}

function configureBodyObserver() {
  const observing = [...document.querySelectorAll('[data-typewriter-body="observing"]')]
  bodyObserver?.disconnect()
  bodyObserver = null

  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    observing.forEach((block) => {
      block.dataset.typewriterBody = "done"
      block.style.removeProperty("min-height")
    })
    return
  }

  bodyObserver = new IntersectionObserver(handleBodyIntersections, {
    root: null,
    rootMargin: `0px 0px -${motion.triggerBottomPct}% 0px`,
    threshold: motion.triggerThreshold,
  })
  observing.forEach((block) => bodyObserver.observe(block))
}

function shouldTypeBodyBlock(block, candidateSet) {
  if (!block.isConnected) return false
  if (block.matches(BODY_EXCLUDE_SELECTOR) || block.closest(BODY_EXCLUDE_SELECTOR)) return false
  if (block.dataset.typewriterBody) return false

  for (const other of candidateSet) {
    if (other !== block && block.contains(other)) return false
  }

  const text = (block.textContent || "").trim()
  return text.length >= 2
}

function scanBodyBlocks() {
  if (prefersReducedMotion()) return
  if (!bodyObserver) configureBodyObserver()
  if (!bodyObserver) return

  const raw = [...document.querySelectorAll(BODY_SELECTOR)]
  const candidateSet = new Set(raw)
  raw.forEach((block) => {
    if (!shouldTypeBodyBlock(block, candidateSet)) return
    block.dataset.typewriterBody = "observing"
    bodyObserver.observe(block)
  })
}

function scheduleScan() {
  if (scanFrame) return
  scanFrame = requestAnimationFrame(() => {
    scanFrame = 0
    bindNav()
    bindCatalogObserver()
    scanBodyBlocks()
  })
}

function bindAppObserver() {
  appObserver?.disconnect()
  const app = document.querySelector("#app")
  if (!app || !("MutationObserver" in window)) return
  appObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === "childList")) scheduleScan()
  })
  appObserver.observe(app, { childList: true, subtree: true })
}

function applyMotionConfig(nextConfig) {
  const previousTriggerThreshold = motion.triggerThreshold
  const previousTriggerBottomPct = motion.triggerBottomPct
  motion = sanitizeMotionConfig(nextConfig || PUBLISHED_MOTION_CONFIG)
  applyMotionCssVariables()

  if (
    previousTriggerThreshold !== motion.triggerThreshold ||
    previousTriggerBottomPct !== motion.triggerBottomPct
  ) {
    configureBodyObserver()
  }

  scheduleNavPushMeasure()
}

function boot() {
  ensureStyles()
  applyMotionCssVariables()
  configureBodyObserver()
  bindNav()
  bindCatalogObserver()
  bindBodyAttributeObserver()
  scanBodyBlocks()
  bindAppObserver()

  window.addEventListener("hashchange", () => {
    refreshNavTargets()
    scheduleNavPushMeasure()
  })
  window.addEventListener("resize", scheduleNavPushMeasure, { passive: true })
  window.addEventListener("red:motion-config", (event) => applyMotionConfig(event.detail))
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
  boot()
}
