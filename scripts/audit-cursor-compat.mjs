import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
function dependency(name) {
  try { return require(name) } catch {
    return require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules", name))
  }
}
const { chromium, firefox, webkit } = dependency("playwright")
const { PNG } = dependency("pngjs")
const origin = process.argv[2] || "http://127.0.0.1:5174"
const engines = { chromium, firefox, webkit }
const errors = []

function rgbAt(buffer, x, y) {
  const png = PNG.sync.read(buffer)
  const offset = (y * png.width + x) * 4
  return [...png.data.slice(offset, offset + 3)]
}

for (const [name, engine] of Object.entries(engines)) {
  const browser = await engine.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 500, height: 400 } })
    page.on("pageerror", (error) => errors.push(`${name}: ${error.message}`))
    await page.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })
    await page.locator(".red-invert-cursor").waitFor({ state: "attached" })
    await page.evaluate(() => {
      const surface = document.createElement("div")
      surface.id = "cursor-audit-surface"
      surface.style.cssText = "position:fixed;inset:0;z-index:2147483646;background:linear-gradient(90deg,#000 0 50%,#fff 50%);"
      document.body.append(surface)
    })
    await page.mouse.move(100, 100)
    await page.waitForTimeout(80)
    const cursor = await page.locator(".red-invert-cursor").evaluate((node) => {
      const style = getComputedStyle(node)
      return {
        width: style.width,
        height: style.height,
        radius: style.borderRadius,
        blend: style.mixBlendMode,
        opacity: style.opacity,
        display: style.display,
        renderer: node.dataset.renderer,
        transform: style.transform,
        nativeCursor: getComputedStyle(document.documentElement).cursor,
      }
    })
    assert.equal(cursor.width, "14px", `${name}: square width`)
    assert.equal(cursor.height, "14px", `${name}: square height`)
    assert.equal(cursor.radius, "0px", `${name}: square corners`)
    assert.equal(cursor.blend, "difference", `${name}: difference compositor`)
    assert.equal(cursor.opacity, "1", `${name}: pointer visible`)
    assert.notEqual(cursor.display, "none", `${name}: pointer displayed`)
    assert.equal(cursor.nativeCursor, "none", `${name}: native pointer suppressed`)
    assert.equal(
      await page.locator("html").evaluate((node) => node.classList.contains("has-red-invert-cursor")),
      true,
      `${name}: invert cursor active class`,
    )
    assert.match(cursor.transform, /^matrix\(1, 0, 0, 1, 93, 93\)$/, `${name}: pointer alignment`)

    const darkShot = await page.screenshot()
    const darkPixel = rgbAt(darkShot, 100, 100)
    await page.mouse.move(400, 100)
    await page.waitForTimeout(80)
    const lightShot = await page.screenshot()
    const lightPixel = rgbAt(lightShot, 400, 100)
    assert(darkPixel.every((value) => value > 235), `${name}: black surface inverts to white`)
    assert(lightPixel.every((value) => value < 20), `${name}: white surface inverts to black`)
    console.log(`PASS ${name}: ${cursor.renderer}, square + difference blend`)
    await page.close()

    if (name === "webkit") {
      const touch = await browser.newPage({
        viewport: { width: 820, height: 1180 },
        isMobile: true,
        hasTouch: true,
        userAgent: "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      })
      await touch.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })
      assert.equal(await touch.locator(".red-invert-cursor").count(), 0, "touch-only iPad keeps native behavior")
      assert.notEqual(
        await touch.locator("html").evaluate((node) => getComputedStyle(node).cursor),
        "none",
        "touch-only iPad cursor is not suppressed",
      )
      console.log("PASS webkit: touch-only iPad fallback")
      await touch.close()
    }
  } finally {
    await browser.close()
  }
}

{
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 500, height: 400 } })
    await page.addInitScript(() => {
      const nativeMatchMedia = window.matchMedia.bind(window)
      const query = "(any-hover: hover) and (any-pointer: fine)"
      const listeners = new Set()
      const capability = {
        matches: false,
        media: query,
        addEventListener(type, listener) { if (type === "change") listeners.add(listener) },
        removeEventListener(type, listener) { if (type === "change") listeners.delete(listener) },
        addListener(listener) { listeners.add(listener) },
        removeListener(listener) { listeners.delete(listener) },
        dispatch(value) {
          this.matches = value
          for (const listener of listeners) listener.call(this, { matches: value, media: query })
        },
      }
      window.matchMedia = (value) => value === query ? capability : nativeMatchMedia(value)
      window.__cursorCapability = capability
    })
    await page.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })
    assert.equal(await page.locator(".red-invert-cursor").count(), 0, "no fine pointer at startup")
    await page.evaluate(() => window.__cursorCapability.dispatch(true))
    await page.locator(".red-invert-cursor").waitFor({ state: "attached" })
    console.log("PASS hybrid device: pointer attachment enables cursor without reload")
  } finally {
    await browser.close()
  }
}

assert.deepEqual(errors, [], "page errors")
