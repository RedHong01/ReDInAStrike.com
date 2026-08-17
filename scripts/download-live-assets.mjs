import { mkdir, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"

const root = resolve(".")
const outDir = join(root, "public", "assets", "framer-live")

const assets = [
  [
    "serial-deminer.png",
    "https://framerusercontent.com/images/aPQ2y7JopPbg9DqErR0wRHycbY.png?scale-down-to=512&width=871&height=379",
  ],
  [
    "pitchfork.jpg",
    "https://framerusercontent.com/images/Cl05tGSCcAdjrWiCv0rF9nnFtk.jpg?lossless=1&width=612&height=792",
  ],
  [
    "analog-game.png",
    "https://framerusercontent.com/images/CzSQdqgWZgHfvxg4sv2gNOwbGpE.png?scale-down-to=1024&lossless=1&width=1792&height=1024",
  ],
  [
    "my-fridge.png",
    "https://framerusercontent.com/images/VVYb2RJDaPRfbQ6ISU9NXpguc.png?scale-down-to=1024&lossless=1&width=3018&height=2160",
  ],
  ["youtube-pjbu-hq.jpg", "https://i.ytimg.com/vi/PjBUK45MWJs/hqdefault.jpg"],
  [
    "uiux-prototype-2024.png",
    "https://framerusercontent.com/images/UMjWygjphZTUCdSDZHDvN0yiAWE.png?scale-down-to=1024&width=1920&height=1080",
  ],
  [
    "service-game-ui-2026-a.png",
    "https://framerusercontent.com/images/GJDS7Fqe2tHNN5Fy3gvXhUOnnso.png?scale-down-to=1024&width=1920&height=1080",
  ],
  [
    "alt-controller-2025-a.png",
    "https://framerusercontent.com/images/BaMhb8l6yUFgQF60cu8wA7KwvM.png?scale-down-to=1024&width=3840&height=2160",
  ],
  [
    "service-game-ui-2026-b.png",
    "https://framerusercontent.com/images/GJxufx1lG2IMaLKpRhdgDKIk.png?scale-down-to=1024&width=1920&height=1080",
  ],
  [
    "alt-controller-2025-b.png",
    "https://framerusercontent.com/images/gYKy6uoJ4ySEBRNdhJJ7YPVCA0.png?scale-down-to=1024&width=1920&height=1080",
  ],
  [
    "game-prototype-2026.png",
    "https://framerusercontent.com/images/33Y5ecvzJlK6hGP3rqhF1dR4.png?scale-down-to=1024&width=2585&height=1467",
  ],
  [
    "alt-controller-2025-c.png",
    "https://framerusercontent.com/images/XtkipXmflPxPwfNl4ZM8TjUxsQ.png?scale-down-to=1024&width=1920&height=1080",
  ],
  [
    "narrative-doc-2025-a.png",
    "https://framerusercontent.com/images/g6N5wll86s9WLZAHGglvAGsXrI.png?scale-down-to=1024&width=1920&height=1080",
  ],
  [
    "ongoing-game-project.png",
    "https://framerusercontent.com/images/7JGUCwM4vXpqUzAGOnI5rjxIFg.png?scale-down-to=1024&lossless=1&width=1400&height=808",
  ],
  [
    "narrative-doc-2025-b.jpeg",
    "https://framerusercontent.com/images/I9tVvVMmbawWouFnXqdSmkR4DKk.jpeg?scale-down-to=1024&lossless=1&width=2901&height=3764",
  ],
  [
    "profile.jpeg",
    "https://framerusercontent.com/images/6A4PMho91A8ZokblfDI5JDcLy4.jpeg?width=631&height=1508",
  ],
]

await mkdir(outDir, { recursive: true })

for (const [fileName, url] of assets) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(join(outDir, fileName), buffer)
  console.log(`Downloaded ${fileName}`)
}
