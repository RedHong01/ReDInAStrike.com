const NAV_TYPE_INTERVAL = 38
const NAV_DELETE_INTERVAL = 24
const BODY_BASE_INTERVAL = 10
const BODY_LINE_PAUSE = 95
const BODY_PUNCTUATION_PAUSE = 46
const BODY_MIN_DURATION = 460
const BODY_MAX_DURATION = 2800
const BODY_ROOT_MARGIN = "0px 0px -12% 0px"

const bodyObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(handleBodyIntersections, {
      root: null,
      rootMargin: BODY_ROOT_MARGIN,
      threshold: 0.12,
    })
  : null

const bodyStates = new WeakMap()
const navStates = new WeakMap()
let appObserver = null
let catalogObserver = null
let hoveredNavCategory = null
let focusedNavCategory = null
let scanFrame = 0
let bodyStartSequence = 0

const BODY_SELECTOR = [
  "#app main p",
  "#app main li",
  "#app .about-section p",
  "#app .about-section li",
  "#app .resume-project-body",
  "#app .resume-sidebar-body",
  "#app .resume-education-program",
  "#app .body-copy-en",
  "#app .body-copy-zh",
].join(",")

const BODY_EXCLUDE_SELECTOR = [
  ".nav-detail",
  ".project-meta",
  ".footer-gallery-meta",
  ".detail-heading",
  ".framer-derived-hero",
  ".framer-case-hero",
  ".resume-project-head",
  ".resume-education-head",
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
      width: 1px;
      height: 0.92em;
      margin-left: 0.08em;
      vertical-align: -0.08em;
      background: currentColor;
      animation: typewriter-caret-blink 720ms steps(1, end) infinite;
      pointer-events: none;
    }

    [data-typewriter-body] {
      position: relative;
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
}

function animateNavState(state, time) {
  state.frame = 0
  if (!state.lastTime) state.lastTime = time
  const elapsed = Math.min(80, time - state.lastTime)
  state.lastTime = time
  state.accumulator += elapsed

  const growing = state.target > state.count
  const interval = growing ? NAV_TYPE_INTERVAL : NAV_DELETE_INTERVAL
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
}

function bindNav() {
  const nav = document.querySelector(".nav-list")
  if (!nav || nav.dataset.typewriterBound === "true") {
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
  if (/[.!?。！？;；:：]/.test(character)) return BODY_PUNCTUATION_PAUSE
  if (/[,，、]/.test(character)) return BODY_BASE_INTERVAL * 2.2
  if (/\s/.test(character)) return BODY_BASE_INTERVAL * 0.35
  return BODY_BASE_INTERVAL
}

function buildTimeline(records, lineStarts, total) {
  const chars = new Array(total)
  for (const record of records) {
    for (let i = 0; i < record.text.length; i += 1) {
      chars[record.start + i] = record.text[i]
    }
  }

  const timeline = new Float32Array(total + 1)
  let elapsed = 0
  for (let index = 0; index < total; index += 1) {
    if (lineStarts.has(index)) elapsed += BODY_LINE_PAUSE
    elapsed += charDuration(chars[index] || "")
    timeline[index + 1] = elapsed
  }

  if (!elapsed) return timeline
  const targetDuration = Math.min(BODY_MAX_DURATION, Math.max(BODY_MIN_DURATION, elapsed))
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
  block.style.minHeight = `${Math.ceil(rect.height)}px`
  setVisibleCharacterCount(state, 0)

  const sequenceDelay = Math.min(240, bodyStartSequence * 70)
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
  if (!bodyObserver || prefersReducedMotion()) return
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

function boot() {
  ensureStyles()
  bindNav()
  bindCatalogObserver()
  scanBodyBlocks()
  bindAppObserver()
  window.addEventListener("hashchange", refreshNavTargets)
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
  boot()
}
