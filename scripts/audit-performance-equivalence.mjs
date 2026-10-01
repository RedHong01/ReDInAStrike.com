// Before/after evidence against an unchanged local baseline server.
// node scripts/audit-performance-equivalence.mjs BASELINE CANDIDATE [output]
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
const require = createRequire(import.meta.url)
const dependencies = join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')
const { chromium } = require(join(dependencies, 'playwright'))
const { PNG } = require(join(dependencies, 'pngjs'))
const baseline = process.argv[2] || 'http://127.0.0.1:5175'
const candidate = process.argv[3] || 'http://127.0.0.1:4174'
const output = process.argv[4] || '/tmp/red-performance-equivalence'
await mkdir(output, { recursive: true })
const results = { grids: [], visuals: [], delivery: [] }
const browser = await chromium.launch({ headless: true })
try {
  // Test the actual before/after module in the same browser, at fixed inputs.
  for (const origin of [baseline, candidate]) {
    const page = await browser.newPage()
    await page.route(`${origin}/`, route => route.fulfill({ contentType: 'text/html', body: '<html><head></head><body></body></html>' }))
    await page.route('**/reveal-motion.js*', async route => {
      const response = await route.fetch()
      await route.fulfill({ response, body: `${await response.text()}\nwindow.__gridAudit = { buildGrid, PUBLISHED_MOTION_CONFIG };` })
    })
    await page.goto(origin)
    await page.evaluate(async () => { await import('/src/reveal-motion.js') })
    const probe = await page.evaluate(() => {
      const { buildGrid, PUBLISHED_MOTION_CONFIG } = window.__gridAudit
      function canvasFor(cols, rows, variant) {
        const canvas = document.createElement('canvas'); canvas.width = cols; canvas.height = rows
        canvas.dataset.ditherColumns = cols; canvas.dataset.ditherRows = rows
        const ctx = canvas.getContext('2d'); const pixels = ctx.createImageData(cols, rows)
        for (let i = 0; i < pixels.data.length; i++) pixels.data[i] = i % 4 === 3 ? 255 : (i * 37 + variant * 19) % 256
        ctx.putImageData(pixels, 0, 0); return canvas
      }
      function hash(array) {
        const bytes = new Uint8Array(array.buffer); let h = 2166136261
        for (const byte of bytes) h = Math.imul(h ^ byte, 16777619)
        return (h >>> 0).toString(16)
      }
      const hashes = []
      for (const [cols, rows] of [[168, 94], [120, 160], [60, 60]]) {
        for (const revealDirection of ['top', 'bottom', 'left', 'right', 'center']) {
          for (const variant of [0, 1, 2]) {
            const config = { ...PUBLISHED_MOTION_CONFIG, revealDirection, revealSeed: 41 + variant,
              revealClusterCount: 3 + variant, revealThresholdBias: variant * 0.13,
              revealClusterSize: 2 + variant, revealClusterSpread: variant * 0.3,
              revealClusterJitter: variant * 0.2, revealScanNoiseMix: variant * 0.35 }
            const grid = buildGrid(canvasFor(cols, rows, variant), config)
            hashes.push(Object.fromEntries(Object.entries(grid).map(([key, value]) => [key, ArrayBuffer.isView(value) ? hash(value) : value])))
          }
        }
      }
      const canvases = Array.from({ length: 40 }, (_, index) => canvasFor(168, 94, index))
      const started = performance.now()
      for (const canvas of canvases) buildGrid(canvas, PUBLISHED_MOTION_CONFIG)
      return { hashes, fortyCardsMs: performance.now() - started }
    })
    results.grids.push({ origin, ...probe }); await page.close()
  }
  assert.deepEqual(results.grids[0].hashes, results.grids[1].hashes, 'all seven pixel field arrays must match the baseline')
  console.log('Pixel field parity: 45 cases; 40-card setup ms:', results.grids.map(r => r.fortyCardsMs))

  for (const width of [430, 940, 1280]) {
    const captures = []
    for (const [label, origin] of [['before', baseline], ['after', candidate]]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      const errors = []; page.on('pageerror', error => errors.push(error.message))
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1400)
      if (width === 1280) results.delivery.push(await page.evaluate(label => {
        const resources = performance.getEntriesByType('resource')
        const code = resources.filter(r => /\.(js|css)(\?|$)/.test(r.name))
        return { label, codeRequests: code.length, codeBytes: code.reduce((sum, r) => sum + r.encodedBodySize, 0),
          localBytes: resources.filter(r => r.name.startsWith(location.origin)).reduce((sum, r) => sum + r.encodedBodySize, 0) }
      }, label))
      const states = []
      const snapshot = async name => {
        await page.mouse.move(0, 0); await page.waitForTimeout(350)
        // Third-party players paint on their own network clock. Compare their
        // source URLs and geometry, and mask only their interior in snapshots.
        const png = await page.screenshot({ path: join(output, `${label}-${width}-${name}.png`), mask: [page.locator('iframe')] })
        const structure = await page.evaluate(() => ({
          text: document.querySelector('#app').textContent.replace(/\s+/g, ' ').trim(),
          cards: document.querySelectorAll('[data-project-card]').length,
          headings: [...document.querySelectorAll('h1,h2,h3')].map(e => e.textContent),
          frames: [...document.querySelectorAll('iframe')].map(e => [e.getAttribute('src'), e.getAttribute('allow'), e.getAttribute('loading')]),
          width: document.documentElement.clientWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
          rects: [...document.querySelectorAll('.site-header, .project-row, .project-preview-copy, .project-detail-drawer')]
            .map(e => { const r=e.getClientRects()[0]; return r && [r.x,r.y,r.width,r.height].map(v=>Math.round(v*10)/10) }),
        }))
        states.push({ name, png, structure })
      }
      await snapshot('home')
      const card = page.locator('[data-project-card][data-index="0"]')
      await card.click({ position: { x: 60, y: 60 } }); await page.waitForTimeout(1200)
      await snapshot('preview')
      await card.click({ position: { x: 60, y: 60 } })
      await page.waitForSelector('.project-detail-drawer[data-drawer-state="settled"]'); await page.waitForTimeout(900)
      await snapshot('drawer')
      assert.deepEqual(errors, [], `${label} ${width}: page errors`)
      captures.push(states); await page.close()
    }
    for (let i=0;i<captures[0].length;i++) {
      const before = captures[0][i], after=captures[1][i]
      assert.deepEqual(after.structure, before.structure, `${width} ${before.name}: content and geometry`)
      const a=PNG.sync.read(before.png), b=PNG.sync.read(after.png)
      let differentPixels=0, maximumChannelDelta=0
      for(let p=0;p<a.data.length;p+=4) {
        let different=false
        for(let c=0;c<4;c++){const delta=Math.abs(a.data[p+c]-b.data[p+c]); maximumChannelDelta=Math.max(maximumChannelDelta,delta); if(delta) different=true}
        if(different) differentPixels++
      }
      const row={width,state:before.name,differentPixels,maximumChannelDelta,pixels:a.width*a.height}
      results.visuals.push(row); console.log(row)
      assert.equal(differentPixels, 0, `${width} ${before.name}: screenshot pixels`)
    }
  }
  console.log('Delivery:', results.delivery)
} finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2))
  await browser.close()
}
