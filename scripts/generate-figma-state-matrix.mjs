import { writeFile } from "node:fs/promises"

const base = "http://127.0.0.1:5173/"

const projects = [
  "Serial Deminer",
  "Pitchfork",
  "Build and Shoot",
  "MyFridge",
  "Assets Hub",
  "Curtain",
  "Build n Shoot",
  "The Mystery of Instrument",
  "Super99",
  "Shroom Pot Showdown",
  "Space Bounty Hunter",
  "SushiGo",
  "Slow'em Down",
  "Butter Beatdown 2",
  "Squirrel Samurai",
  "To Be Chosen",
  "DAD",
  "Untitled Sans",
]

// Every width that sits directly above or below a CSS breakpoint is included.
// Device-sized anchors remain alongside the boundary cases for practical QA.
const viewports = [
  [1440, 900, "desktop-anchor"],
  [1201, 900, "above-1200"],
  [1200, 900, "at-1200"],
  [1181, 900, "above-1180"],
  [1180, 900, "at-1180"],
  [1024, 768, "tablet-landscape-anchor"],
  [1024, 1366, "tablet-portrait-anchor"],
  [981, 768, "above-980"],
  [980, 1308, "at-980"],
  [901, 1200, "above-900"],
  [900, 1200, "at-900"],
  [834, 1194, "ipad-portrait-anchor"],
  [721, 962, "above-720"],
  [720, 960, "at-720"],
  [701, 934, "above-700"],
  [700, 933, "at-700"],
  [641, 854, "above-640"],
  [640, 853, "at-640"],
  [601, 801, "above-600"],
  [600, 800, "at-600"],
  [561, 748, "above-560"],
  [560, 747, "at-560"],
  [521, 695, "above-520"],
  [520, 693, "at-520"],
  [390, 844, "phone-anchor"],
  [381, 825, "above-380"],
  [380, 823, "at-380"],
]

const globalStates = [
  ["baseline", {}],
  ["compact", {}],
  ["header-middle", {}],
  ["category-game", { "figma-state": "category", "figma-category": "game" }],
  ["category-ongoing", { "figma-state": "category", "figma-category": "ongoing" }],
  ["category-interaction", { "figma-state": "category", "figma-category": "interaction" }],
  ["category-graphic", { "figma-state": "category", "figma-category": "graphic" }],
  ["resume", {}],
]

const projectStates = [
  ["card-default", {}],
  ["card-hover", {}],
  ["card-focus", {}],
  ["card-pressed", {}],
  ["card-muted", {}],
  ["preview-opening-25", { "figma-state": "preview-opening", "figma-progress": "0.25" }],
  ["preview-opening-50", { "figma-state": "preview-opening", "figma-progress": "0.5" }],
  ["preview-opening-75", { "figma-state": "preview-opening", "figma-progress": "0.75" }],
  ["preview-expanded", { "figma-state": "preview" }],
  ["preview-closing-25", { "figma-state": "preview-closing", "figma-progress": "0.25" }],
  ["preview-closing-50", { "figma-state": "preview-closing", "figma-progress": "0.5" }],
  ["preview-closing-75", { "figma-state": "preview-closing", "figma-progress": "0.75" }],
  ["detail-expanded", {}],
  ["detail-compressed", {}],
  ["detail-minimized", {}],
  ["detail-exited", {}],
  ["lightbox", {}],
]

const mediaModes = [
  ["fine-normal", { "figma-pointer": "fine", "figma-motion": "normal" }],
  ["coarse-normal", { "figma-pointer": "coarse", "figma-motion": "normal" }],
  ["fine-reduced-motion", { "figma-pointer": "fine", "figma-motion": "reduce" }],
  ["coarse-reduced-motion", { "figma-pointer": "coarse", "figma-motion": "reduce" }],
]

function urlFor(state, projectIndex, extra = {}) {
  const url = new URL(base)
  url.searchParams.set("figma-state", extra["figma-state"] || state)
  if (projectIndex !== null) url.searchParams.set("figma-project", String(projectIndex))
  for (const [key, value] of Object.entries(extra)) {
    if (key !== "figma-state") url.searchParams.set(key, value)
  }
  return url.toString()
}

const frames = []
for (const [width, height, breakpoint] of viewports) {
  for (const [state, extra] of globalStates) {
    frames.push({
      name: `${width}×${height} / Global / ${state}`,
      width,
      height,
      breakpoint,
      state,
      url: urlFor(state, null, extra),
      selector: "body",
    })
  }
  projects.forEach((project, projectIndex) => {
    for (const [state, extra] of projectStates) {
      frames.push({
        name: `${width}×${height} / ${String(projectIndex + 1).padStart(2, "0")} ${project} / ${state}`,
        width,
        height,
        breakpoint,
        projectIndex,
        project,
        state,
        url: urlFor(state, projectIndex, extra),
        selector: state.startsWith("card-") || state.startsWith("preview-")
          ? `.project-row:has([data-index="${projectIndex}"])`
          : "body",
      })
    }
  })
}

const manifest = {
  generatedAt: new Date().toISOString(),
  source: base,
  editability: "HTML-to-Figma captures are converted into editable frames, text nodes, and image fills; native Figma component sets cover reusable interaction states.",
  coverage: {
    projects: projects.length,
    viewports: viewports.length,
    globalStates: globalStates.length,
    projectStates: projectStates.length,
    totalFrames: frames.length,
    mediaFeatures: [
      "orientation: landscape",
      "orientation: portrait",
      "hover: hover + pointer: fine",
      "hover: none + pointer: coarse",
      "prefers-reduced-motion: no-preference",
      "prefers-reduced-motion: reduce",
    ],
  },
  projects,
  viewports: viewports.map(([width, height, breakpoint]) => ({ width, height, breakpoint })),
  globalStates: globalStates.map(([state]) => state),
  projectStates: projectStates.map(([state]) => state),
  mediaModes: mediaModes.map(([mode]) => mode),
  completeFrameCountIncludingMediaModes: frames.length * mediaModes.length,
  frames,
}

await writeFile(new URL("../figma-state-matrix.json", import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify(manifest.coverage))
