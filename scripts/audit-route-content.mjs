// Compare the complete document content from every entry route in two builds.
// Embedded applications are isolated here; audit:playable checks actual Unity.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'
const require = createRequire(import.meta.url)
let playwright
try { playwright = require('playwright') } catch {
  playwright = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))
}
const baseline = process.argv[2] || 'http://127.0.0.1:5175'
const candidate = process.argv[3] || 'http://127.0.0.1:4174'
const output = process.argv[4] || '/tmp/red-route-parity.json'
const build = await readFile('scripts/build.mjs', 'utf8')
const routes = [...build.match(/const routes = \[([\s\S]*?)\]/)[1].matchAll(/"([^"]*)"/g)].map(match => match[1])
const results = []
for (const engine of ['chromium', 'webkit']) {
  const browser = await playwright[engine].launch({ headless: true })
  try {
    const sides = []
    for (const origin of [baseline, candidate]) {
      const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.route('**/*', route => {
        const req = route.request()
        if (req.isNavigationRequest() && req.frame().parentFrame()) {
          return route.fulfill({ contentType: 'text/html', body: '<!doctype html><body>Frame isolated for document parity</body>' })
        }
        return route.continue()
      })
      const rows = []
      for (const route of routes) {
        await page.goto(origin + '/' + (route ? route + '/' : ''), { waitUntil: 'domcontentloaded' })
        await page.locator('[data-project-card]').first().waitFor({ state: 'attached' })
        if (route) await page.waitForSelector('.project-detail-drawer[data-drawer-state="settled"]')
        await page.evaluate(() => document.fonts.ready)
        const data = await page.evaluate(() => {
          const app = document.querySelector('#app')
          const normalize = value => value.replaceAll(location.origin, '{origin}')
          return {
            text: app.textContent.replace(/\s+/g, ' ').trim(),
            headings: [...app.querySelectorAll('h1,h2,h3')].map(e => e.textContent),
            images: [...app.querySelectorAll('img')].map(e => [normalize(e.src), e.alt]),
            iframes: [...app.querySelectorAll('iframe')].map(e => [normalize(e.src), e.title, e.allow]),
            links: [...app.querySelectorAll('a')].map(e => normalize(e.href)),
            cards: app.querySelectorAll('[data-project-card]').length,
          }
        })
        rows.push({ route, ...data })
      }
      assert.deepEqual(errors, [])
      sides.push(rows)
      await page.close()
    }
    for (let i=0; i<sides[0].length; i++) {
      for (const key of Object.keys(sides[0][i])) {
        const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
        assert.equal(hash(sides[1][i][key]), hash(sides[0][i][key]), `${engine} ${routes[i] || 'home'}: ${key}`)
      }
    }
    results.push({ engine, routes: routes.length, contentHash: createHash('sha256').update(JSON.stringify(sides[0])).digest('hex'), passed: true })
    console.log(`${engine}: all ${routes.length} routes preserve text, links, images and embeds`)
  } finally { await browser.close() }
}
await writeFile(output, JSON.stringify(results, null, 2) + '\n')
