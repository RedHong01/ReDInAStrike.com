import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require("playwright")) } catch {
  ({ chromium } = require(join(
    homedir(),
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
  )))
}

const origin = process.argv[2] || "http://127.0.0.1:5174"
const browser = await chromium.launch({ headless: true })
const errors = []

async function open(width, height = 932) {
  const page = await browser.newPage({ viewport: { width, height } })
  page.on("pageerror", (error) => errors.push(`${width}: ${error.message}`))
  await page.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })
  await page.evaluate(() => document.fonts.ready)
  return page
}

async function settlePreview(page) {
  await page.waitForFunction(() =>
    !document.documentElement.hasAttribute("data-project-preview-transition") &&
    !document.querySelector(".project-preview-exit-ghost"),
  )
}

async function placePreviewTop(page, card, offset) {
  await card.evaluate((element, targetOffset) => {
    const header = document.querySelector(".site-header").getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    window.scrollTo({
      top: Math.max(0, scrollY + rect.top - header.bottom - targetOffset),
      behavior: "instant",
    })
  }, offset)
  await page.waitForTimeout(100)
}

async function scrollToAboutSeam(page, card) {
  for (let step = 0; step < 24; step += 1) {
    const snapshot = await seamSnapshot(card)
    if (Math.abs(snapshot.aboutGap) <= 2) return snapshot
    await page.evaluate(() => window.scrollBy(0, Math.max(120, innerHeight * 0.42)))
    await page.waitForTimeout(100)
  }
  return seamSnapshot(card)
}

async function scrollAwayFromAbout(page, card) {
  for (let step = 0; step < 12; step += 1) {
    const snapshot = await seamSnapshot(card)
    if (snapshot.aboutGap > 2) return snapshot
    await page.evaluate(() => window.scrollBy(0, -Math.max(120, innerHeight * 0.42)))
    await page.waitForTimeout(100)
  }
  return seamSnapshot(card)
}

async function seamSnapshot(card) {
  return card.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const header = document.querySelector(".site-header").getBoundingClientRect()
    const about = document.querySelector(".about-card")?.getBoundingClientRect()
    const rule = getComputedStyle(element, "::before")
    return {
      gap: rect.top - header.bottom,
      aboutGap: about ? about.top - rect.bottom : null,
      shared: element.hasAttribute("data-project-preview-header-seam"),
      opacity: rule.opacity,
      color: rule.backgroundColor,
      aboutShared: element.hasAttribute("data-project-preview-about-seam"),
      aboutOpacity: getComputedStyle(element, "::after").opacity,
    }
  })
}

async function checkHeaderSeam(width) {
  const page = await open(width)
  const card = page.locator('[data-project-card][data-index="4"]')
  await card.click({ position: { x: 80, y: 80 } })
  await settlePreview(page)

  await placePreviewTop(page, card, 72)
  const separated = await seamSnapshot(card)
  assert(separated.gap > 2, `${width}: preview separates from header`)
  assert.equal(separated.shared, false, `${width}: separate preview owns top rule`)
  assert.equal(separated.opacity, "1", `${width}: separate top rule is visible`)
  assert.equal(separated.color, "rgb(255, 255, 255)", `${width}: dark preview keeps white rule`)

  await placePreviewTop(page, card, 0)
  const shared = await seamSnapshot(card)
  assert(shared.gap <= 2, `${width}: preview reaches header`)
  assert.equal(shared.shared, true, `${width}: header owns shared seam`)
  assert.equal(shared.opacity, "0", `${width}: preview top rule is removed at header`)

  await placePreviewTop(page, card, 72)
  const restored = await seamSnapshot(card)
  assert(restored.gap > 2, `${width}: preview leaves header again`)
  assert.equal(restored.shared, false, `${width}: preview retakes separated seam`)
  assert.equal(restored.opacity, "1", `${width}: preview top rule returns`)
  await page.close()
  console.log(`PASS header seam ${width}`)
}

async function checkAboutSeam(width) {
  const page = await open(width)
  if (width <= 980) {
    const card = page.locator('[data-project-card][data-index="15"]')
    await card.click({ position: { x: 80, y: 80 } })
    await settlePreview(page)
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }))
    await page.waitForTimeout(120)
    const separated = await seamSnapshot(card)
    assert(separated.aboutGap > 2, `${width}: single-column preview keeps About clearance`)
    assert.equal(separated.aboutShared, false, `${width}: single-column preview does not hide About-separated rule`)
    assert.equal(separated.aboutOpacity, "1", `${width}: single-column bottom rule remains visible`)
    await page.close()
    console.log(`PASS About clearance ${width}`)
    return
  }

  const card = page.locator('[data-project-card][data-index="12"]')
  await card.click({ position: { x: 80, y: 80 } })
  await settlePreview(page)

  const separated = await seamSnapshot(card)
  assert(separated.aboutGap > 2, `${width}: preview separates from About`)
  assert.equal(separated.aboutShared, false, `${width}: About-separated preview owns bottom rule`)
  assert.equal(separated.aboutOpacity, "1", `${width}: separated bottom rule is visible`)

  const shared = await scrollToAboutSeam(page, card)
  assert(Math.abs(shared.aboutGap) <= 2, `${width}: preview reaches About`)
  assert.equal(shared.aboutShared, true, `${width}: About owns shared seam`)
  assert.equal(shared.aboutOpacity, "0", `${width}: preview bottom rule is removed at About`)

  const restored = await scrollAwayFromAbout(page, card)
  assert(restored.aboutGap > 2, `${width}: preview leaves About again`)
  assert.equal(restored.aboutShared, false, `${width}: preview retakes separated bottom seam`)
  assert.equal(restored.aboutOpacity, "1", `${width}: separated bottom rule returns`)
  await page.close()
  console.log(`PASS About seam ${width}`)
}

async function sampleOutgoingPreview(page, duration = 260) {
  return page.evaluate(async (sampleDuration) => {
    const samples = []
    let sawSnow = false
    const started = performance.now()
    while (performance.now() - started < sampleDuration) {
      await new Promise(requestAnimationFrame)
      sawSnow ||= Boolean(document.querySelector('[data-active-color-motion="true"] .active-color-snow-canvas'))
      const ghosts = [...document.querySelectorAll(".project-preview-exit-ghost")]
      samples.push(ghosts.map((ghost) => {
        const style = getComputedStyle(ghost)
        return {
          animation: style.animationName,
          clip: style.clipPath,
          opacity: Number(style.opacity),
        }
      }))
    }
    return { frames: samples, sawSnow }
  }, duration)
}

function checkFixedFade(result, label) {
  const samples = result.frames
  assert(samples.some((sample) => sample.length), `${label}: outgoing snapshot appears`)
  assert(samples.every((sample) => sample.length <= 1), `${label}: at most one outgoing snapshot`)
  const frames = samples.flat()
  assert(frames.every((frame) => frame.animation === "none"), `${label}: no geometric retraction`)
  assert.equal(new Set(frames.map((frame) => frame.clip)).size, 1, `${label}: fixed snapshot geometry`)
  for (let index = 1; index < frames.length; index++) {
    assert(frames[index].opacity <= frames[index - 1].opacity + 0.01, `${label}: opacity does not rebound`)
  }
}

async function checkCategoryHandoff() {
  const page = await open(1280, 900)
  const card = page.locator('[data-project-card][data-index="4"]')
  await card.click({ position: { x: 80, y: 80 } })
  await settlePreview(page)
  await page.locator('[data-nav-category="graphic"]').hover()
  await page.waitForFunction(() => document.querySelector('.catalog[data-filter-phase="exiting"]'))
  const samples = await sampleOutgoingPreview(page)
  checkFixedFade(samples, "category handoff")
  assert.equal(samples.sawSnow, true, "category handoff leaves Fine Signal Snow in control")
  assert.equal(await page.locator(".project-card.is-project-preview").count(), 0, "category handoff collapses live full-bleed card")
  await page.waitForFunction(() => !document.querySelector(".catalog[data-filter-phase]"))
  assert.equal(await page.locator(".project-preview-exit-ghost").count(), 0, "category handoff cleans snapshot")
  assert.equal(await page.locator(".is-project-preview-exit-source").count(), 0, "category handoff releases source row")
  await page.close()
  console.log("PASS category preview handoff")
}

async function checkLiveCategorySurfaceHandoff() {
  const page = await open(1280, 900)
  await page.locator('[data-nav-category="graphic"]').hover()
  await page.waitForFunction(() => document.querySelector('.catalog[data-filter-phase="color-snow"]'))
  await page.waitForTimeout(900)

  const sourceCount = await page.evaluate(() =>
    [...document.querySelectorAll('.project-card.is-filter-muted')]
      .filter((card) => card.querySelector('.dither-preview-canvas[data-active="true"]'))
      .length,
  )
  assert(sourceCount > 0, "live category surface: filtered cards have a binary source")

  await page.locator('[data-nav-category="game"]').hover()
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.active-color-snow-canvas')]
      .some((canvas) => canvas.dataset.activeColorSource === "live-binary"),
  )
  const liveSourceCount = await page.locator('.active-color-snow-canvas[data-active-color-source="live-binary"]').count()
  assert(liveSourceCount > 0, "live category surface: exit motion uses current binary pixels")
  await page.close()
  console.log("PASS live category surface handoff")
}

async function checkHoverClickContinuity(width, hoverState) {
  const page = await open(width, 900)
  await page.locator('[data-nav-category="graphic"]').click()
  await page.waitForFunction(() => !document.querySelector('.catalog[data-filter-phase]'))
  const card = page.locator('.project-card.is-filter-muted').first()
  await card.scrollIntoViewIfNeeded()
  const index = await card.getAttribute("data-index")
  await page.evaluate((selectedIndex) => {
    window.__hoverClickHandoffLog = []
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const owner = mutation.target instanceof Element
          ? mutation.target.closest('.project-card')
          : null
        if (!owner || owner.dataset.index !== selectedIndex) continue
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue
          if (node.matches('.active-color-snow-canvas, .binary-pixel-handoff-canvas')) {
            window.__hoverClickHandoffLog.push(node.className)
          }
        }
      }
    })
    observer.observe(document.querySelector('#app'), { childList: true, subtree: true })
  }, index)

  if (hoverState !== "none") {
    await card.hover()
    await page.waitForFunction((selectedIndex) => {
      const card = document.querySelector(`.project-card[data-index="${selectedIndex}"]`)
      return card?.matches(':hover') && card.querySelector('.active-color-snow-canvas')
    }, index)
    if (hoverState === "finished") {
      await page.waitForFunction((selectedIndex) => {
        const card = document.querySelector(`.project-card[data-index="${selectedIndex}"]`)
        return card?.getAttribute('data-active-color-restore-ready') === 'true' &&
          !card.querySelector('.active-color-snow-canvas')
      }, index)
    }
    await page.mouse.down()
    await page.mouse.up()
  } else {
    await card.evaluate((element) => element.click())
  }

  await page.waitForFunction((selectedIndex) =>
    document.querySelector(`.project-card.is-project-preview[data-index="${selectedIndex}"]`),
  index)
  await settlePreview(page)
  const log = await page.evaluate(() => window.__hoverClickHandoffLog)
  assert.equal(
    log.filter((className) => className === "active-color-snow-canvas").length,
    hoverState === "none" ? 0 : 1,
    `${width}/${hoverState}: pointer and click focus share one hover initiate`,
  )
  assert.equal(
    log.filter((className) => className === "binary-pixel-handoff-canvas").length,
    hoverState === "none" ? 1 : 0,
    `${width}/${hoverState}: only a non-hover click starts a binary handoff`,
  )
  assert.equal(await card.getAttribute('data-binary-handoff-skip'), null, "click intent is consumed")
  await page.close()
  console.log(`PASS hover click continuity ${width} ${hoverState}`)
}

async function checkRapidSwitching() {
  const page = await open(1280, 900)
  await page.locator('[data-project-card][data-index="4"]').click({ position: { x: 80, y: 80 } })
  await settlePreview(page)

  for (const index of [6, 8, 10, 12]) {
    await page.locator(`[data-project-card][data-index="${index}"]`).evaluate((card) => card.click())
    const samples = await sampleOutgoingPreview(page, 70)
    checkFixedFade(samples, `rapid switch to ${index}`)
  }
  await settlePreview(page)
  assert.equal(
    await page.locator(".project-card.is-project-preview").getAttribute("data-index"),
    "12",
    "rapid switching settles on latest card",
  )
  assert.equal(await page.locator(".project-preview-exit-ghost").count(), 0, "rapid switching leaves no snapshot")
  assert.equal(await page.locator(".is-project-preview-exit-source").count(), 0, "rapid switching releases all rows")
  await page.close()
  console.log("PASS rapid preview switching")
}

async function checkDesktopMediaGeometry() {
  const page = await open(1280, 900)
  const card = page.locator('[data-project-card]').first()
  const before = await card.locator('.project-media > img').evaluate((image) => {
    const rect = image.getBoundingClientRect()
    return { x: rect.x, width: rect.width }
  })

  await card.click({ position: { x: 80, y: 80 } })
  await settlePreview(page)
  const snapshot = async () => card.evaluate((element) => {
    const image = element.querySelector('.project-media > img')
    const media = element.querySelector('.project-media')
    const copy = element.querySelector('.project-preview-copy')
    const catalog = element.closest('.catalog')
    const imageRect = image.getBoundingClientRect()
    const mediaRect = media.getBoundingClientRect()
    const cardRect = element.getBoundingClientRect()
    const catalogRect = catalog.getBoundingClientRect()
    const copyStyle = getComputedStyle(copy)
    return {
      side: element.dataset.cardSide,
      image: { left: imageRect.left, right: imageRect.right, top: imageRect.top, bottom: imageRect.bottom, width: imageRect.width },
      media: { left: mediaRect.left, right: mediaRect.right, top: mediaRect.top, bottom: mediaRect.bottom },
      card: { left: cardRect.left, right: cardRect.right, width: cardRect.width },
      catalog: { left: catalogRect.left, right: catalogRect.right },
      gap: Number.parseFloat(getComputedStyle(element.closest('.project-row')).columnGap) || 0,
      copyOuterPadding: element.dataset.cardSide === 'left'
        ? Number.parseFloat(copyStyle.paddingRight)
        : Number.parseFloat(copyStyle.paddingLeft),
      objectFit: getComputedStyle(image).objectFit,
    }
  })

  const assertBounded = (result, label) => {
    const topGap = result.image.top - result.media.top
    const bottomGap = result.media.bottom - result.image.bottom
    assert(topGap >= 0 && bottomGap >= 0, `${label}: image stays inside both rules`)
    assert(Math.abs(topGap - bottomGap) <= 1, `${label}: image is vertically centered`)
    assert.equal(result.objectFit, 'contain', `${label}: image content is not cropped`)
    assert(result.card.width >= 1279, `${label}: card remains full bleed`)
    const expectedOuterPadding = result.catalog.left - result.card.left
    assert(
      Math.abs(result.copyOuterPadding - expectedOuterPadding) <= 1,
      `${label}: preview type follows the live logo/catalog inset`,
    )
    if (result.side === 'left') {
      assert(Math.abs(result.image.left - result.catalog.left) <= 1, `${label}: left media follows catalog inset`)
      assert(Math.abs(result.image.right - (result.media.right - result.gap / 2)) <= 1, `${label}: left media preserves the center gutter`)
    } else {
      assert(Math.abs(result.image.left - (result.media.left + result.gap / 2)) <= 1, `${label}: right media preserves the center gutter`)
      assert(Math.abs(result.image.right - result.catalog.right) <= 1, `${label}: right media follows catalog inset`)
    }
  }
  const expanded = await snapshot()
  assertBounded(expanded, 'desktop media geometry')
  assert(Math.abs(expanded.image.left - before.x) <= 1, 'desktop media geometry: valid horizontal origin remains stable')
  assert(Math.abs(expanded.image.width - before.width) <= 1, 'desktop media geometry: valid width remains stable')

  await page.evaluate(() => window.scrollTo({ top: 150, behavior: 'instant' }))
  await page.waitForTimeout(650)
  assertBounded(await snapshot(), 'responsive header media geometry')
  await page.close()

  const edgePage = await open(1280, 900)
  const edgeCard = edgePage.locator('[data-project-card][data-index="4"]')
  await edgeCard.evaluate((element) => {
    const header = document.querySelector('.site-header').getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    window.scrollTo({
      top: Math.max(0, scrollY + rect.top - header.bottom + rect.height * 0.42),
      behavior: 'instant',
    })
    element.click()
  })
  await settlePreview(edgePage)
  const edgeResult = await edgeCard.evaluate((element) => {
    const image = element.querySelector('.project-media > img').getBoundingClientRect()
    const media = element.querySelector('.project-media').getBoundingClientRect()
    return {
      image: { top: image.top, bottom: image.bottom },
      media: { top: media.top, bottom: media.bottom },
      objectFit: getComputedStyle(element.querySelector('.project-media > img')).objectFit,
    }
  })
  assert(edgeResult.image.top >= edgeResult.media.top, 'moving header click: image is not clipped above the preview')
  assert(edgeResult.image.bottom <= edgeResult.media.bottom, 'moving header click: image is not clipped below the preview')
  assert.equal(edgeResult.objectFit, 'contain', 'moving header click: image content remains contained')
  await edgePage.close()
  console.log("PASS responsive preview content bounds")
}

try {
  for (const width of [430, 940, 1280]) await checkHeaderSeam(width)
  for (const width of [430, 940, 1280]) await checkAboutSeam(width)
  await checkCategoryHandoff()
  await checkLiveCategorySurfaceHandoff()
  for (const width of [430, 940, 1280]) {
    for (const hoverState of ["running", "finished", "none"]) {
      await checkHoverClickContinuity(width, hoverState)
    }
  }
  await checkRapidSwitching()
  await checkDesktopMediaGeometry()
  assert.deepEqual(errors, [], "page errors")
} finally {
  await browser.close()
}
