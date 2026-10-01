import { build, transform } from "esbuild"
import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { basename, join } from "node:path"

// Keep authored files readable and the development server unchanged. Only
// production HTML references these content-addressed assets.
export async function productionAssets(root, template) {
  const scripts = [...template.matchAll(/<script\b([^>]*?)src="%BASE%([^"?]+)(?:\?[^"]*)?"([^>]*)><\/script>/g)]
  const modules = scripts.filter((match) => /type="module"/.test(match[1] + match[3]))
  const classic = scripts.filter((match) => !modules.includes(match))
  const styles = [...template.matchAll(/<link rel="stylesheet" href="%BASE%([^"?]+)(?:\?[^"]*)?"\s*\/>/g)]
  const outdir = join(root, "dist", "src")
  const files = []
  const replacements = new Map()
  const moduleBuild = await build({
    absWorkingDir: root,
    entryPoints: modules.map((match) => match[2]),
    outdir,
    entryNames: "[name]-[hash]",
    // import.meta.url consumers resolve sibling styles and ../ project links.
    // Keep shared chunks at the same depth as the original src modules.
    chunkNames: "shared-[hash]",
    bundle: true,
    splitting: true,
    format: "esm",
    target: "es2022",
    minify: true,
    charset: "utf8",
    // The render kernel uses callback names to suspend offscreen footer work.
    keepNames: true,
    metafile: true,
    write: false,
    logLevel: "silent",
  })
  for (const file of moduleBuild.outputFiles) files.push({ name: basename(file.path), contents: file.contents })
  for (const match of modules) {
    const entry = Object.entries(moduleBuild.metafile.outputs)
      .find(([, output]) => output.entryPoint === match[2])
    if (!entry) throw new Error(`Missing production entry: ${match[2]}`)
    replacements.set(match[0], `<script${match[1]}src="%BASE%src/${basename(entry[0])}"${match[3]}></script>`)
  }

  for (const match of classic) {
    // The capture loader resolves its sibling bundle from currentScript.src.
    // Preserve public script locations instead of relocating that contract.
    if (!match[2].startsWith("src/")) continue
    const source = await readFile(join(root, match[2].startsWith("src/") ? match[2] : `public/${match[2]}`), "utf8")
    const { code } = await transform(source, { minify: true, keepNames: true, charset: "utf8", target: "es2022" })
    const hash = createHash("sha256").update(code).digest("hex").slice(0, 12)
    const name = `${basename(match[2], ".js")}-${hash}.js`
    files.push({ name, contents: code })
    replacements.set(match[0], `<script${match[1]}src="%BASE%src/${name}"${match[3]}></script>`)
  }

  const css = await build({
    stdin: { contents: styles.map((match) => `@import "./${match[1]}";`).join("\n"), resolveDir: root, loader: "css" },
    outfile: join(outdir, "site.css"),
    bundle: true,
    minify: true,
    charset: "utf8",
    target: "es2022",
    write: false,
    logLevel: "silent",
    plugins: [{ name: "preserve-font-urls", setup(builder) {
      builder.onResolve({ filter: /.*/ }, (args) => args.kind === "url-token" ? { path: args.path, external: true } : null)
    } }],
  })
  const cssContents = css.outputFiles[0].contents
  const cssHash = createHash("sha256").update(cssContents).digest("hex").slice(0, 12)
  const cssName = `site-${cssHash}.css`
  files.push({ name: cssName, contents: cssContents })
  styles.forEach((match, index) => replacements.set(match[0], index ? "" : `<link rel="stylesheet" href="%BASE%src/${cssName}" />`))
  for (const [original, replacement] of replacements) template = template.replace(original, replacement)
  template = template.replace(/^[\t ]+$/gm, "")

  return {
    template,
    async write(outRoot) {
      await Promise.all(files.map((file) => writeFile(join(outRoot, "src", file.name), file.contents)))
    },
  }
}
