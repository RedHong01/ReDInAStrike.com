// Verify the browser's color management as well as the encoder's raw pixels.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
const require = createRequire(import.meta.url)
const { chromium, webkit } = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))
const origin = process.argv[2] || 'http://127.0.0.1:4174'
const output = process.argv[3] || '/tmp/red-browser-image-parity.json'
const pairs = JSON.parse(await readFile('reference/lossless-image-verification.json', 'utf8'))
const results = []
for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await launcher.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.route(`${origin}/`, route => route.fulfill({ contentType: 'text/html', body: '<html><body></body></html>' }))
    await page.goto(origin)
    const images = await page.evaluate(async pairs => {
      const decode = async path => {
        const img = new Image(); img.src = '/' + path; await img.decode()
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data
      }
      const results = []
      for (const pair of pairs) {
        const a = await decode(pair.source), b = await decode(pair.optimized)
        let differentBytes = 0
        for (let i=0; i<a.length; i++) if (a[i] !== b[i]) differentBytes++
        results.push({ source: pair.source, bytes: a.length, differentBytes })
      }
      return results
    }, pairs)
    assert(images.every(image => image.differentBytes === 0), `${engine}: ${JSON.stringify(images)}`)
    results.push({ engine, images })
    console.log(`${engine}: ${images.length} images, identical browser-decoded RGBA`)
  } finally { await browser.close() }
}
await writeFile(output, JSON.stringify(results, null, 2) + '\n')
