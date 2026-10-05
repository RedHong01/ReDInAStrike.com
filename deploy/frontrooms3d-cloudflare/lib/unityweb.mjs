import { closeSync, openSync, readSync } from "node:fs"

// The real compression of a Unity Build/*.unityweb file, read from its first bytes:
// "gzip" (gzip magic), "br" (Unity's Brotli comment block) or null (uncompressed).
export function unitywebEncoding(file) {
  const fd = openSync(file, "r")
  try {
    const head = Buffer.alloc(64)
    const n = readSync(fd, head, 0, 64, 0)
    if (n >= 2 && head[0] === 0x1f && head[1] === 0x8b) return "gzip"
    if (head.subarray(0, n).toString("latin1").includes("UnityWeb Compressed Content (brotli)")) return "br"
    return null
  } finally {
    closeSync(fd)
  }
}
