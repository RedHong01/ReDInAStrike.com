const navItems = [
  { label: "Game", detail: "Rapid Prototype / Alt Control", hash: "game" },
  { label: "On going", detail: "Latest Personal Project", hash: "ongoing" },
  { label: "Interaction", detail: "UI & UX Prototype / Plugin", hash: "interaction" },
  { label: "Graphic", detail: "Prints / Motion", hash: "graphic" },
  { label: "Resume", detail: "CV / Contact", hash: "resume" },
]

const projects = [
  {
    pageTitle: "Serial Deminer",
    displayTitle: "ArtCenter Game Jam Submission",
    date: "10/29/2024",
    path: "/serialdeminer",
    navHash: "game",
    image: "assets/framer-live/serial-deminer.png",
    imageFit: "contain",
    mediaBackground: "#f4a000",
  },
  {
    pageTitle: "Pitchfork",
    displayTitle: "Magazine Design",
    date: "12/9/2024",
    path: "/pitchfork",
    navHash: "graphic",
    image: "assets/framer-live/pitchfork.jpg",
    imagePosition: "center top",
  },
  {
    pageTitle: "Analog Game",
    displayTitle: "Analog Game",
    date: "11/15/2024",
    path: "/analog-game",
    navHash: "game",
    image: "assets/framer-live/analog-game.png",
  },
  {
    pageTitle: "My Fridge",
    displayTitle: "UI&UX Prototype",
    date: "4/29/2024",
    path: "/myfridge",
    navHash: "interaction",
    image: "assets/framer-live/my-fridge.png",
  },
  {
    pageTitle: "Assets Hub",
    displayTitle: "Production Design",
    date: "12/9/2024",
    path: "/assethub",
    navHash: "interaction",
    image: "assets/framer-live/youtube-pjbu-hq.jpg",
    youtube: "PjBUK45MWJs",
  },
  {
    pageTitle: "UI&UX Prototype",
    displayTitle: "UI&UX Prototype",
    date: "12/9/2024",
    path: "/uiux-prototype",
    navHash: "interaction",
    image: "assets/framer-live/uiux-prototype-2024.png",
  },
  {
    pageTitle: "Alternative Controller Game Prototype",
    displayTitle: "Alternative Controller Game Prototype",
    date: "12/9/2024",
    path: "/bns_gdd",
    navHash: "game",
    image: "assets/framer-live/youtube-pjbu-hq.jpg",
    youtube: "PjBUK45MWJs",
  },
  {
    pageTitle: "Service Game UI Prototype",
    displayTitle: "Service Game UI Prototype",
    date: "3/10/2026",
    path: "/service-game-ui",
    navHash: "interaction",
    image: "assets/framer-live/service-game-ui-2026-a.png",
  },
  {
    pageTitle: "Alternative Controller Game Prototype",
    displayTitle: "Alternative Controller Game Prototype",
    date: "11/4/2025",
    path: "/alt-controller-2025-a",
    navHash: "game",
    image: "assets/framer-live/alt-controller-2025-a.png",
  },
  {
    pageTitle: "Service Game UI Prototype",
    displayTitle: "Service Game UI Prototype",
    date: "3/10/2026",
    path: "/service-game-ui-2",
    navHash: "interaction",
    image: "assets/framer-live/service-game-ui-2026-b.png",
  },
  {
    pageTitle: "Alternative Controller Game Prototype",
    displayTitle: "Alternative Controller Game Prototype",
    date: "11/4/2025",
    path: "/alt-controller-2025-b",
    navHash: "game",
    image: "assets/framer-live/alt-controller-2025-b.png",
  },
  {
    pageTitle: "Game Prototype",
    displayTitle: "Game Prototype",
    date: "3/10/2026",
    path: "/game-prototype",
    navHash: "game",
    image: "assets/framer-live/game-prototype-2026.png",
    itchEmbed: "https://redinastrike.itch.io/innovative-game-mechanic/embed",
  },
  {
    pageTitle: "Alternative Controller Game Prototype",
    displayTitle: "Alternative Controller Game Prototype",
    date: "11/4/2025",
    path: "/alt-controller-2025-c",
    navHash: "game",
    image: "assets/framer-live/alt-controller-2025-c.png",
  },
  {
    pageTitle: "Narrative Design Document",
    displayTitle: "Narrative Design Document",
    date: "3/10/2025",
    path: "/monologue",
    navHash: "ongoing",
    image: "assets/framer-live/narrative-doc-2025-a.png",
  },
  {
    pageTitle: "Ongoing Game Project",
    displayTitle: "Ongoing Game Project",
    date: "11/4/2025-Present",
    path: "/ongoing-game-project",
    navHash: "ongoing",
    image: "assets/framer-live/ongoing-game-project.png",
    imageFit: "contain",
    mediaBackground: "#ffffff",
  },
  {
    pageTitle: "Narrative Design Document",
    displayTitle: "Narrative Design Document",
    date: "3/10/2025",
    path: "/narrative-design-document",
    navHash: "ongoing",
    image: "assets/framer-live/narrative-doc-2025-b.jpeg",
    imagePosition: "center top",
  },
]

const routeMap = new Map(projects.map((project) => [project.path, project]))
const catalogProjectEntries = projects.map((project, originalIndex) => ({ project, originalIndex }))
const catalogEntryDateOrder = (a, b) => {
  const dateDelta = projectDateRank(b.project) - projectDateRank(a.project)
  return dateDelta || a.originalIndex - b.originalIndex
}
const catalogProjectEntriesNewestFirst = [...catalogProjectEntries].sort(catalogEntryDateOrder)
const catalogProjectEntriesByCategory = new Map()
catalogProjectEntriesNewestFirst.forEach((entry) => {
  const category = entry.project.navHash
  const entries = catalogProjectEntriesByCategory.get(category) || []
  entries.push(entry)
  catalogProjectEntriesByCategory.set(category, entries)
})
const filterableProjectHashes = new Set(projects.map((project) => project.navHash))
const CATALOG_FILTER_EXIT_MS = 430
const CATALOG_FILTER_ENTER_MS = 560
const CATALOG_FILTER_STAGGER_MS = 28
const CATALOG_HALFTONE_DELAY_MS = 120
const CATALOG_HALFTONE_DRAW_MS = 1400
const CATALOG_MUTED_HOVER_MS = 475
const CATALOG_COLOR_SNOW_EXIT_COVER_MS = 140
const CATALOG_COLOR_SNOW_ENTER_COVER_MS = 220
const CATALOG_COLOR_SNOW_ENTER_DEFER_MS = 54
const CATALOG_COLOR_SNOW_SWAP_OVERLAP_MS = 128
const NAV_HOVER_SCROLL_DELAY_MS = 180
const HOME_RETURN_COVER_MS = 620
const HOME_RETURN_REVEAL_MS = 680
const HOME_RETURN_FONT_READY_MS = 520
const HOME_RETURN_READY_TIMEOUT_MS = 1100
const HALFTONE_RENDER_MARGIN = 1100
const HALFTONE_PROGRESS_STEPS = 260
const HALFTONE_LOGICAL_COLUMNS = 132
const HALFTONE_RENDER_FRAME_BUDGET_MS = 4.5
const HALFTONE_SOURCE_CACHE_LIMIT = 64
const HEADER_VISUAL_STYLE_PROPERTIES = new Set([
  "--header-height",
  "--logo-size",
  "--nav-scale",
  "--detail-opacity",
  "--glass-alpha",
  "--glass-blur",
  "--header-glass-shadow-alpha",
  "--header-rule-alpha",
])

function projectDateRank(project) {
  const rawDate = String(project.date || "").trim()
  if (/present/i.test(rawDate)) return Number.POSITIVE_INFINITY

  const match = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!match) return 0

  const [, month, day, year] = match
  return Date.UTC(Number(year), Number(month) - 1, Number(day))
}

function normalizeCatalogFilter(hash) {
  return hash && filterableProjectHashes.has(hash) ? hash : null
}

function getCatalogProjectEntries(category = null) {
  const normalizedCategory = normalizeCatalogFilter(category)

  if (!normalizedCategory) {
    return catalogProjectEntries.map((entry) => ({ ...entry, muted: false }))
  }

  const matching = (catalogProjectEntriesByCategory.get(normalizedCategory) || [])
    .map((entry) => ({ ...entry, muted: false }))
  const muted = catalogProjectEntriesNewestFirst
    .filter(({ project }) => project.navHash !== normalizedCategory)
    .map((entry) => ({ ...entry, muted: true }))

  return [...matching, ...muted]
}

function catalogRowsMarkup(category = null) {
  const entries = getCatalogProjectEntries(category)
  const rows = []

  for (let index = 0; index < entries.length; index += 2) {
    const first = entries[index]
    const second = entries[index + 1]
    const rowHash = category
      ? index === 0
        ? normalizeCatalogFilter(category)
        : ""
      : first.originalIndex === 0
        ? "game"
        : first.originalIndex === 14
          ? "ongoing"
          : ""

    rows.push(`
      <section class="project-row" id="${rowHash}">
        ${projectCard(first.project, first.originalIndex, index, { muted: first.muted })}
        ${second ? projectCard(second.project, second.originalIndex, index + 1, { muted: second.muted }) : ""}
      </section>`)
  }

  return rows.join("")
}

const framerProjectDetails = {
  "/bns_gdd": {
    year: "2024 Spring",
    title: "Build n Shoot",
    category: "Board Game Prototype",
    routeImage: "assets/framer-routes/03-bns_gdd.jpg",
    leadImage: "assets/framer-live/analog-game.png",
    leadAlt: "Build n Shoot board game concept landscape",
    summary:
      "A turn-based strategy shooting board-game prototype built around movement, building, territory control, and tactical combat on a 15 by 15 grid.",
    points: [
      "Player Format: PvP, maximum 4 players.",
      "Estimated Play Time: 30 minutes.",
      "Primary Goal: eliminate the other player and be the last one standing.",
      "Core hook: use movement to create building and shooting opportunities, reshaping the map into tactical advantage.",
    ],
    blocks: [
      {
        title: "System",
        body: "The design defines cards, avatars, dice, blocks, territory marks, power-ups, procedures, purchasing, combat range, and inventory rules as a complete board-game document.",
      },
      {
        title: "Design Focus",
        body: "The prototype connects traversal, building, shooting, and resource management into one turn structure, so each action can change both board state and future strategy.",
      },
    ],
  },
  "/myfridge": {
    year: "2024 Spring",
    title: "MyFridge",
    category: "UI&UX Prototype",
    routeImage: "assets/framer-routes/04-myfridge.jpg",
    leadImage: "assets/framer-live/my-fridge.png",
    leadAlt: "MyFridge mobile app interface overview",
    summary:
      "A refrigerator management and food-waste monitoring app prototype for tracking purchases, freshness status, storage planning, and shopping decisions.",
    points: [
      "Team project by Red, Mika, and Kaiyi.",
      "Research includes problem statement, interviews, insights, persona, competitor analysis, user flow, and wireframes.",
      "Final output includes high-fidelity mobile screens for onboarding, inventory, receipt scanning, waste tracking, and item details.",
    ],
    blocks: [
      {
        title: "Problem",
        body: "Fresh food often exceeds its shelf life because users do not plan purchase quantity, storage, and cooking timing clearly enough. The prototype focuses on reducing waste of both money and food.",
      },
      {
        title: "How Might We",
        body: "How might an app help users organize refrigerator storage, raw materials, leftovers, freshness reminders, meal plans, and shopping plans in one coherent flow?",
      },
    ],
  },
  "/assethub": {
    year: "2024 Spring",
    title: "AssetHub",
    category: "Interaction Prototype",
    routeImage: "assets/framer-routes/05-assethub.jpg",
    leadImage: "assets/framer-live/youtube-pjbu-hq.jpg",
    leadAlt: "AssetHub interface prototype",
    summary:
      "An interaction prototype for managing large collections of digital assets across online and offline resource locations.",
    points: [
      "Targets images, videos, 3D models, and text resources across multiple devices and platforms.",
      "Explores a concise system for locating and organizing files without losing context.",
      "Prototype documentation is presented through a layered interface and embedded design preview.",
    ],
    blocks: [
      {
        title: "Overview",
        body: "Managing vast collections of digital assets can become overwhelming and time-consuming. AssetHub proposes a central place that helps users target resources efficiently.",
      },
      {
        title: "Interaction",
        body: "The page frames the tool as a practical interface system rather than a marketing concept, emphasizing access, file context, and cross-platform organization.",
      },
    ],
  },
  "/pitchfork": {
    year: "2024 Fall",
    title: "Pitchfork Magazine",
    category: "Graphic Design",
    routeImage: "assets/framer-routes/06-pitchfork.jpg",
    leadImage: "assets/framer-live/pitchfork.jpg",
    leadAlt: "Pitchfork magazine cover design",
    summary:
      "A print-focused graphic design exercise reimagining a Pitchfork magazine cover with a high-contrast editorial hierarchy.",
    points: [
      "Cover subject: Beyonce, Cowboy Carter.",
      "Format explores masthead scale, editorial image cropping, barcode placement, and magazine-cover typography.",
      "The design uses a restrained black-and-white system to keep the image and title hierarchy dominant.",
    ],
    blocks: [
      {
        title: "Graphic System",
        body: "The page centers a single magazine cover as the finished artifact, with visual emphasis on typographic proportion, portrait placement, and print layout balance.",
      },
      {
        title: "Output",
        body: "The final cover is presented as a clean editorial object rather than a process-heavy case study.",
      },
    ],
  },
  "/monologue": {
    year: "2024 Fall",
    title: "\"Monologue\"",
    category: "Project Pitch",
    routeImage: "assets/framer-routes/08-monologue.jpg",
    leadImage: "assets/framer-live/narrative-doc-2025-a.png",
    leadAlt: "Monologue project pitch visual reference",
    summary:
      "A narrative game pitch about slow-paced, non-aggressive storytelling, visual interactive narrative language, and post-modern social problems.",
    points: [
      "Tone: slow-paced and non-aggressive.",
      "Narrative mode: visual interactive storytelling with music, narration, and sensory audiovisual language.",
      "Theme: personal struggle expanding into broader social challenges including identity, culture, depression, economics, and political shifts.",
    ],
    blocks: [
      {
        title: "Story Direction",
        body: "The story is told from a teenager's perspective in a semi-autobiographical mode, following a young individual across social classes and cultural fragmentation.",
      },
      {
        title: "Experience",
        body: "The pitch emphasizes an intuitive, sensory narrative style where visuals, music, and narration work together to carry emotion and story.",
      },
    ],
  },
}
const app = document.querySelector("#app")
const base = document.body.dataset.base || "/"
const siteState = {
  headerInitialized: false,
  targetProgress: 0,
  visualProgress: 0,
  followFrame: 0,
  lastFrameTime: 0,
  lastScrollY: 0,
  scrollFrame: 0,
  pendingScrollDelta: 0,
  resizeFrame: 0,
  layoutFrame: 0,
  layoutPendingRules: false,
  layoutPendingFooter: false,
  layoutTransitionTimer: 0,
  homeReturnTransition: null,
  homeReturnTransitionId: 0,
  homeReturnScrollLocked: false,
  homeReturnLockedScrollY: 0,
  homeReturnPreviousBodyOverflow: "",
  homeReturnPreviousHtmlOverflowAnchor: "",
  homeReturnPreviousBodyOverflowAnchor: "",
  navMetricKey: "",
  navHoverSpacingKey: "",
  headerMetricsWidth: -1,
  headerMetrics: null,
  headerStyleCache: Object.create(null),
  hasFooterGallery: false,
  hasProjectRuleTargets: false,
  ruleFadeFrame: 0,
  ruleFadeUpdates: [],
  catalogFilterTarget: null,
  catalogFilterCurrent: null,
  catalogFilterLocked: null,
  catalogFilterPhase: "idle",
  catalogFilterTimer: 0,
  catalogFilterEnterTimer: 0,
  catalogHalftoneFrame: 0,
  catalogHalftoneVisibleFrame: 0,
  catalogHalftoneProgress: 1,
  halftoneObserver: null,
  halftoneResizeObserver: null,
  halftoneObserverReady: false,
  halftoneNearCards: new Set(),
  halftoneRenderQueue: [],
  halftoneRenderQueued: new Set(),
  halftoneRenderFrame: 0,
  halftoneSourceCache: new Map(),
  catalogFilterCycle: 0,
  galleryFrame: 0,
  galleryLastFrameTime: 0,
  galleryLastScrollTime: 0,
  galleryLoopFrame: 0,
  galleryLoopLastTime: 0,
  galleryLoopDistance: 0,
  galleryLoopOffset: 0,
  galleryLoopBaseSpeed: 0,
  galleryLoopBoost: 0,
  galleryHorizontalFrozen: false,
  galleryPointerInitialized: false,
  galleryPointerX: null,
  galleryPointerY: null,
  galleryPointerMoved: false,
  galleryPointerFrame: 0,
  galleryPointerDirection: 0,
  galleryPointerSpeedRatio: 0,
  galleryHoveredTile: null,
  galleryHoverSuppressed: false,
  galleryCenterPauseUntil: 0,
  galleryHorizontalInputUntil: 0,
  galleryScrollPauseUntil: 0,
  galleryObservedScrollY: 0,
  galleryReveal: 0,
  galleryTargetReveal: 0,
  galleryShift: 0,
  galleryPocketBottom: 0,
  galleryTargetPocketBottom: 0,
  galleryPocketHeight: 0,
  galleryTargetPocketHeight: 0,
  aboutPull: 0,
  aboutTargetPull: 0,
  aboutCardOffset: 0,
  aboutCardTargetOffset: 0,
  resumeCardOffset: 0,
  resumeCardTargetOffset: 0,
  dom: {
    header: null,
    catalog: null,
    projectRows: [],
    cardRuleTargets: [],
    catalogContentNodes: [],
    mutedCards: [],
    gallery: null,
    galleryViewport: null,
    galleryTrack: null,
    galleryFirstSet: null,
    galleryFirstMeta: null,
    galleryTiles: [],
    about: null,
  },
  visibleHalftoneCards: [],
  galleryLayoutDirty: true,
  galleryLayoutMetrics: null,
  galleryViewportLeft: null,
  headerVisualBottom: 0,
  catalogContentBottomDocument: null,
  catalogContentBottomHeaderHeight: null,
  catalogContentBottomDirty: true,
  halftoneColors: null,
  halftoneColorsKey: "",
  reducedMotionQuery: null,
}

function refreshDomCache() {
  disconnectCatalogHalftoneObservers()
  const catalog = document.querySelector(".catalog")
  const gallery = document.querySelector(".footer-gallery")
  const galleryViewport = gallery?.querySelector(".footer-gallery-viewport") || null
  const galleryTrack = gallery?.querySelector(".footer-gallery-track") || null
  const gallerySets = gallery ? [...gallery.querySelectorAll(".footer-gallery-set")] : []

  siteState.dom = {
    header: document.querySelector("[data-site-header]"),
    catalog,
    projectRows: [...document.querySelectorAll(".project-row")],
    cardRuleTargets: [...document.querySelectorAll(".project-card + .project-card")],
    catalogContentNodes: catalog
      ? [...catalog.querySelectorAll(".project-media, .project-meta")].filter((node) => {
          const style = window.getComputedStyle(node)
          return style.display !== "none" && style.visibility !== "hidden"
        })
      : [],
    mutedCards: catalog ? [...catalog.querySelectorAll(".project-card.is-filter-muted")] : [],
    gallery,
    galleryViewport,
    galleryTrack,
    galleryFirstSet: gallerySets[0] || null,
    galleryFirstMeta: gallery?.querySelector(".footer-gallery-meta") || null,
    galleryTiles: gallery ? [...gallery.querySelectorAll(".footer-gallery-tile")] : [],
    about: document.querySelector(".about-section"),
  }
  siteState.visibleHalftoneCards = []
  siteState.halftoneRenderQueue = []
  siteState.halftoneRenderQueued.clear()
  if (siteState.halftoneRenderFrame) cancelAnimationFrame(siteState.halftoneRenderFrame)
  siteState.halftoneRenderFrame = 0
  siteState.galleryLayoutDirty = true
  siteState.galleryLayoutMetrics = null
  siteState.galleryViewportLeft = null
  siteState.catalogContentBottomDocument = null
  siteState.catalogContentBottomHeaderHeight = null
  siteState.catalogContentBottomDirty = true
  siteState.hasFooterGallery = Boolean(gallery)
  siteState.hasProjectRuleTargets = Boolean(
    siteState.dom.projectRows.length || siteState.dom.cardRuleTargets.length,
  )
  setupCatalogHalftoneObservers(catalog)
}

function getReducedMotionQuery() {
  if (siteState.reducedMotionQuery) return siteState.reducedMotionQuery
  siteState.reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
  return siteState.reducedMotionQuery
}

function prefersReducedMotion() {
  return getReducedMotionQuery().matches
}

function isHomeRoute() {
  return routeFromLocation() === "/"
}

function isHomeReturnTransitionActive() {
  return Boolean(siteState.homeReturnTransition)
}

function isCurrentHomeReturnTransition(id) {
  return siteState.homeReturnTransition?.id === id
}

function notifyHomeReturnTransition(active, phase = "") {
  window.dispatchEvent(
    new CustomEvent("red:home-return-transition", {
      detail: { active, phase },
    }),
  )
}

function setHomeReturnTransitionPhase(phase) {
  if (!siteState.homeReturnTransition) return
  siteState.homeReturnTransition.phase = phase
  document.documentElement.dataset.homeReturnTransition = phase
  document.body.dataset.homeReturnTransition = phase
  notifyHomeReturnTransition(true, phase)
}

function clearHomeReturnTransitionPhase() {
  delete document.documentElement.dataset.homeReturnTransition
  delete document.body.dataset.homeReturnTransition
  removeRootStyleProperty("--home-return-spacer-height")
  restoreHomeReturnOverflowAnchor()
  notifyHomeReturnTransition(false)
}

function currentHeaderHeight() {
  const headerRect = siteState.dom.header?.getBoundingClientRect()
  if (headerRect?.height > 0) return headerRect.height
  if (siteState.headerVisualBottom > 0) return siteState.headerVisualBottom
  return readHeaderMetrics().fullHeight
}

function setHomeReturnSpacerHeight(height = currentHeaderHeight()) {
  setRootStyleProperty("--home-return-spacer-height", `${Math.max(0, height).toFixed(2)}px`)
}

function lockHomeReturnScroll() {
  if (siteState.homeReturnScrollLocked) return
  siteState.homeReturnScrollLocked = true
  siteState.homeReturnPreviousBodyOverflow = document.body.style.overflow
  siteState.homeReturnPreviousHtmlOverflowAnchor = document.documentElement.style.overflowAnchor
  siteState.homeReturnPreviousBodyOverflowAnchor = document.body.style.overflowAnchor
  document.documentElement.style.overflowAnchor = "none"
  document.body.style.overflowAnchor = "none"
  document.body.style.overflow = "hidden"
}

function restoreHomeReturnOverflowAnchor() {
  document.documentElement.style.overflowAnchor = siteState.homeReturnPreviousHtmlOverflowAnchor
  document.body.style.overflowAnchor = siteState.homeReturnPreviousBodyOverflowAnchor
  siteState.homeReturnPreviousHtmlOverflowAnchor = ""
  siteState.homeReturnPreviousBodyOverflowAnchor = ""
}

function unlockHomeReturnScroll() {
  if (!siteState.homeReturnScrollLocked) return
  siteState.homeReturnScrollLocked = false
  document.body.style.overflow = siteState.homeReturnPreviousBodyOverflow
  siteState.homeReturnLockedScrollY = 0
  siteState.homeReturnPreviousBodyOverflow = ""
}

function asset(path) {
  return `${base}${path.replace(/^\/+/, "")}`
}

function hrefFor(path) {
  if (path === "/") return base
  const slug = path.replace(/^\/+/, "")
  return `${base}${slug}/`
}

function routeFromLocation() {
  const parts = window.location.pathname.split("/").filter(Boolean)
  const last = parts[parts.length - 1]
  if (!last) return "/"
  const candidate = `/${last}`
  return routeMap.has(candidate) ? candidate : "/"
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function easeOutCubic(value) {
  const progress = clamp(value, 0, 1)
  return 1 - (1 - progress) ** 3
}

function smoothstep(value) {
  const progress = clamp(value, 0, 1)
  return progress * progress * (3 - 2 * progress)
}

function waitForMs(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function waitForAnimationFrames(count = 1) {
  return new Promise((resolve) => {
    let remaining = Math.max(1, count)
    const tick = () => {
      remaining -= 1
      if (remaining <= 0) {
        resolve()
        return
      }
      window.requestAnimationFrame(tick)
    }
    window.requestAnimationFrame(tick)
  })
}

function waitForImageReady(image) {
  if (!(image instanceof HTMLImageElement)) return Promise.resolve()
  if (image.complete && image.naturalWidth > 0) {
    return typeof image.decode === "function" ? image.decode().catch(() => {}) : Promise.resolve()
  }
  if (typeof image.decode === "function") {
    return image.decode().catch(() => {})
  }

  return new Promise((resolve) => {
    const done = () => {
      image.removeEventListener("load", done)
      image.removeEventListener("error", done)
      resolve()
    }
    image.addEventListener("load", done, { once: true })
    image.addEventListener("error", done, { once: true })
  })
}

function applyHomeReturnTransitionVisual(transition = siteState.homeReturnTransition) {
  if (!transition) return
  const compactProgress = clamp(transition.compactProgress || 0, 0, 1)
  const coverProgress = clamp(transition.coverProgress || 0, 0, 1)
  siteState.visualProgress = compactProgress
  siteState.targetProgress = compactProgress
  applyHeaderProgress(compactProgress, { coverProgress })
  if (
    (transition.phase === "covering" || transition.phase === "covered") &&
    Math.abs((window.scrollY || window.pageYOffset || 0) - siteState.homeReturnLockedScrollY) > 0.5
  ) {
    window.scrollTo({ top: siteState.homeReturnLockedScrollY, left: 0, behavior: "auto" })
    siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
  }
  if (transition.phase === "revealing" && isHomeRoute() && (window.scrollY || window.pageYOffset || 0) !== 0) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
  }
}

function animateHomeReturnHeader({
  id,
  fromCover,
  toCover,
  fromCompact,
  toCompact,
  duration,
}) {
  return new Promise((resolve) => {
    const transition = siteState.homeReturnTransition
    if (!transition || transition.id !== id) {
      resolve(false)
      return
    }

    if (transition.frame) cancelAnimationFrame(transition.frame)
    transition.frame = 0
    transition.coverProgress = fromCover
    transition.compactProgress = fromCompact
    applyHomeReturnTransitionVisual(transition)

    if (duration <= 1) {
      transition.coverProgress = toCover
      transition.compactProgress = toCompact
      applyHomeReturnTransitionVisual(transition)
      resolve(true)
      return
    }

    let startTime = 0
    const step = (time) => {
      if (!isCurrentHomeReturnTransition(id)) {
        resolve(false)
        return
      }

      if (!startTime) startTime = time
      const progress = clamp((time - startTime) / duration, 0, 1)
      const eased = smoothstep(progress)
      transition.coverProgress = fromCover + (toCover - fromCover) * eased
      transition.compactProgress = fromCompact + (toCompact - fromCompact) * eased
      applyHomeReturnTransitionVisual(transition)

      if (progress >= 1) {
        transition.frame = 0
        resolve(true)
        return
      }

      transition.frame = requestAnimationFrame(step)
    }

    transition.frame = requestAnimationFrame(step)
  })
}

function homeUrl() {
  const url = new URL(hrefFor("/"), window.location.href)
  url.hash = ""
  return url
}

function pushHomeRoute() {
  const url = homeUrl()
  if (window.location.href !== url.href) {
    window.history.pushState(null, "", url.href)
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
}

async function waitForHomeFirstPaint(id) {
  await waitForAnimationFrames(2)
  if (!isCurrentHomeReturnTransition(id)) return false

  const fontReady = document.fonts?.ready?.catch?.(() => {}) || Promise.resolve()
  await Promise.race([fontReady, waitForMs(HOME_RETURN_FONT_READY_MS)])
  if (!isCurrentHomeReturnTransition(id)) return false

  const firstRowImages = [
    ...document.querySelectorAll('main[data-route="home"] .catalog .project-row:first-child img'),
  ]
  await Promise.race([
    Promise.all(firstRowImages.map((image) => waitForImageReady(image))),
    waitForMs(HOME_RETURN_READY_TIMEOUT_MS),
  ])
  await waitForAnimationFrames(1)
  return isCurrentHomeReturnTransition(id) && isHomeRoute()
}

async function settleHomeReturnScrollTop(id) {
  for (let attempt = 0; attempt < 18; attempt += 1) {
    if (!isCurrentHomeReturnTransition(id)) return false
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
    await waitForAnimationFrames(1)
    if ((window.scrollY || window.pageYOffset || 0) <= 0.5) return true
  }
  return isCurrentHomeReturnTransition(id)
}

function cancelHomeReturnTransition(options = {}) {
  const transition = siteState.homeReturnTransition
  if (!transition) return
  if (transition.frame) cancelAnimationFrame(transition.frame)
  siteState.homeReturnTransition = null
  clearHomeReturnTransitionPhase()
  unlockHomeReturnScroll()
  siteState.lastFrameTime = 0
  if (options.syncHeaderToScroll !== false) {
    const scrollY = window.scrollY || window.pageYOffset || 0
    setHeaderTarget(clamp(scrollY / readHeaderMetrics().distance, 0, 1), true)
  }
}

function finishHomeReturnTransition(id) {
  if (!isCurrentHomeReturnTransition(id)) return
  const transition = siteState.homeReturnTransition
  if (transition?.frame) cancelAnimationFrame(transition.frame)
  siteState.homeReturnTransition = null
  clearHomeReturnTransitionPhase()
  unlockHomeReturnScroll()
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  setHeaderTarget(0, true)
  siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
  setupNavHoverSpacing({ force: true })
  requestLayoutEffectsUpdate({
    rules: siteState.hasProjectRuleTargets,
    footer: siteState.hasFooterGallery,
  })
}

async function startHomeReturnTransition() {
  if (isHomeReturnTransitionActive()) return

  window.__RED_SCROLL_MAGNET__?.cancel?.({ suppress: HOME_RETURN_COVER_MS + HOME_RETURN_REVEAL_MS })
  const id = siteState.homeReturnTransitionId + 1
  siteState.homeReturnTransitionId = id
  const startCompactProgress = clamp(siteState.visualProgress, 0, 1)
  siteState.homeReturnLockedScrollY = window.scrollY || window.pageYOffset || 0
  siteState.homeReturnTransition = {
    id,
    phase: "covering",
    frame: 0,
    coverProgress: 0,
    compactProgress: startCompactProgress,
  }

  if (siteState.followFrame) cancelAnimationFrame(siteState.followFrame)
  siteState.followFrame = 0
  siteState.lastFrameTime = 0
  setHomeReturnSpacerHeight()
  lockHomeReturnScroll()
  setHomeReturnTransitionPhase("covering")

  const covered = await animateHomeReturnHeader({
    id,
    fromCover: 0,
    toCover: 1,
    fromCompact: startCompactProgress,
    toCompact: 0,
    duration: HOME_RETURN_COVER_MS,
  })
  if (!covered || !isCurrentHomeReturnTransition(id)) return

  setHomeReturnTransitionPhase("covered")
  pushHomeRoute()
  render()
  setHomeReturnSpacerHeight(readHeaderMetrics().fullHeight)
  const transition = siteState.homeReturnTransition
  if (transition && transition.id === id) {
    transition.coverProgress = 1
    transition.compactProgress = 0
    applyHomeReturnTransitionVisual(transition)
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  siteState.lastScrollY = window.scrollY || window.pageYOffset || 0

  const ready = await waitForHomeFirstPaint(id)
  if (!ready || !isCurrentHomeReturnTransition(id)) return

  unlockHomeReturnScroll()
  const scrollSettled = await settleHomeReturnScrollTop(id)
  if (!scrollSettled || !isCurrentHomeReturnTransition(id)) return
  setHomeReturnTransitionPhase("revealing")
  const revealed = await animateHomeReturnHeader({
    id,
    fromCover: 1,
    toCover: 0,
    fromCompact: 0,
    toCompact: 0,
    duration: HOME_RETURN_REVEAL_MS,
  })
  if (revealed) finishHomeReturnTransition(id)
}

function navigateHomeWithoutTransition() {
  cancelHomeReturnTransition({ syncHeaderToScroll: false })
  pushHomeRoute()
  render()
  setHeaderTarget(0, true)
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const latinTextPattern = /[A-Za-z0-9][A-Za-z0-9’'&./:+-]*(?:\s+[A-Za-z0-9][A-Za-z0-9’'&./:+-]*)*/g
const simplifiedChinesePhrases = [
  ["計畫", "计划"],
  ["佈局", "布局"],
]
const simplifiedChineseCharacters = new Map(
  Object.entries({
    並: "并",
    乾: "干",
    亂: "乱",
    佈: "布",
    來: "来",
    個: "个",
    們: "们",
    傳: "传",
    優: "优",
    儲: "储",
    內: "内",
    兩: "两",
    則: "则",
    創: "创",
    劃: "划",
    勁: "劲",
    動: "动",
    務: "务",
    勢: "势",
    勵: "励",
    區: "区",
    協: "协",
    參: "参",
    員: "员",
    問: "问",
    啟: "启",
    單: "单",
    嗶: "哔",
    嘗: "尝",
    圍: "围",
    圖: "图",
    團: "团",
    執: "执",
    場: "场",
    塊: "块",
    奮: "奋",
    學: "学",
    宮: "宫",
    實: "实",
    寶: "宝",
    將: "将",
    專: "专",
    對: "对",
    導: "导",
    層: "层",
    屬: "属",
    帶: "带",
    幟: "帜",
    庫: "库",
    廣: "广",
    強: "强",
    彈: "弹",
    後: "后",
    徑: "径",
    從: "从",
    愛: "爱",
    態: "态",
    慮: "虑",
    憂: "忧",
    應: "应",
    戰: "战",
    戲: "戏",
    戶: "户",
    掃: "扫",
    掙: "挣",
    換: "换",
    擊: "击",
    據: "据",
    攝: "摄",
    敗: "败",
    敘: "叙",
    數: "数",
    斷: "断",
    於: "于",
    時: "时",
    暢: "畅",
    會: "会",
    東: "东",
    條: "条",
    業: "业",
    構: "构",
    樂: "乐",
    標: "标",
    樣: "样",
    機: "机",
    檔: "档",
    檢: "检",
    權: "权",
    歡: "欢",
    歲: "岁",
    歷: "历",
    殘: "残",
    氣: "气",
    決: "决",
    沒: "没",
    淨: "净",
    測: "测",
    準: "准",
    滿: "满",
    漸: "渐",
    潔: "洁",
    潛: "潜",
    濟: "济",
    瀏: "浏",
    為: "为",
    無: "无",
    熱: "热",
    爾: "尔",
    牽: "牵",
    狀: "状",
    獎: "奖",
    獨: "独",
    獲: "获",
    獻: "献",
    現: "现",
    瑣: "琐",
    環: "环",
    畫: "画",
    當: "当",
    發: "发",
    盡: "尽",
    監: "监",
    盤: "盘",
    眾: "众",
    確: "确",
    碼: "码",
    磯: "矶",
    礙: "碍",
    礦: "矿",
    禮: "礼",
    種: "种",
    稱: "称",
    穩: "稳",
    競: "竞",
    節: "节",
    範: "范",
    簡: "简",
    紀: "纪",
    納: "纳",
    級: "级",
    細: "细",
    終: "终",
    組: "组",
    結: "结",
    絡: "络",
    給: "给",
    統: "统",
    經: "经",
    綜: "综",
    綠: "绿",
    維: "维",
    緊: "紧",
    線: "线",
    編: "编",
    緩: "缓",
    練: "练",
    縮: "缩",
    總: "总",
    繼: "继",
    續: "续",
    罰: "罚",
    義: "义",
    習: "习",
    聯: "联",
    聰: "聪",
    聲: "声",
    聽: "听",
    脈: "脉",
    腳: "脚",
    與: "与",
    興: "兴",
    蓋: "盖",
    藝: "艺",
    處: "处",
    螢: "萤",
    術: "术",
    裝: "装",
    複: "复",
    規: "规",
    視: "视",
    覺: "觉",
    覽: "览",
    觸: "触",
    計: "计",
    訊: "讯",
    討: "讨",
    記: "记",
    訪: "访",
    設: "设",
    評: "评",
    詞: "词",
    試: "试",
    該: "该",
    誌: "志",
    認: "认",
    誘: "诱",
    語: "语",
    課: "课",
    調: "调",
    談: "谈",
    論: "论",
    謎: "谜",
    講: "讲",
    識: "识",
    讀: "读",
    變: "变",
    讓: "让",
    負: "负",
    貨: "货",
    貫: "贯",
    責: "责",
    買: "买",
    費: "费",
    資: "资",
    質: "质",
    購: "购",
    賽: "赛",
    趨: "趋",
    跡: "迹",
    踐: "践",
    蹤: "踪",
    車: "车",
    較: "较",
    載: "载",
    輕: "轻",
    輯: "辑",
    輸: "输",
    轉: "转",
    辦: "办",
    這: "这",
    連: "连",
    進: "进",
    遊: "游",
    過: "过",
    達: "达",
    違: "违",
    適: "适",
    遷: "迁",
    遺: "遗",
    還: "还",
    邊: "边",
    邏: "逻",
    郵: "邮",
    醫: "医",
    銷: "销",
    錄: "录",
    錢: "钱",
    鍵: "键",
    鎖: "锁",
    鏈: "链",
    鐘: "钟",
    鑿: "凿",
    長: "长",
    門: "门",
    閃: "闪",
    開: "开",
    閒: "闲",
    間: "间",
    閱: "阅",
    關: "关",
    隊: "队",
    階: "阶",
    隨: "随",
    險: "险",
    隱: "隐",
    雙: "双",
    雜: "杂",
    離: "离",
    難: "难",
    電: "电",
    靈: "灵",
    響: "响",
    頁: "页",
    項: "项",
    順: "顺",
    須: "须",
    預: "预",
    領: "领",
    頭: "头",
    題: "题",
    額: "额",
    顏: "颜",
    類: "类",
    風: "风",
    飯: "饭",
    驗: "验",
    驟: "骤",
    體: "体",
    鬆: "松",
    鬥: "斗",
    鬱: "郁",
    魚: "鱼",
    鮮: "鲜",
    鵬: "鹏",
    麼: "么",
    點: "点",
    龐: "庞",
  })
)

function toSimplifiedChinese(value) {
  let result = String(value)
  simplifiedChinesePhrases.forEach(([traditional, simplified]) => {
    result = result.replaceAll(traditional, simplified)
  })
  return Array.from(result)
    .map((character) => simplifiedChineseCharacters.get(character) || character)
    .join("")
}

function wrapLatinRuns(html) {
  return String(html)
    .split(/(<[^>]+>|&[A-Za-z0-9#]+;)/g)
    .map((part) => {
      if (!part || part.startsWith("<") || part.startsWith("&")) return part
      return part.replace(latinTextPattern, '<span class="body-copy-latin">$&</span>')
    })
    .join("")
}

function formatChineseText(value) {
  return wrapLatinRuns(escapeHtml(toSimplifiedChinese(value)))
}

function formatChineseHtml(value) {
  return wrapLatinRuns(toSimplifiedChinese(value))
}

const copyTranslations = new Map([
  [
    "A turn-based strategy shooting board-game prototype built around movement, building, territory control, and tactical combat on a 15 by 15 grid.",
    "一個回合制策略射擊桌遊原型，以移動、建造、領地控制，以及 15 × 15 棋盤上的戰術戰鬥為核心。",
  ],
  ["Player Format: PvP, maximum 4 players.", "玩家形式：PvP，最多 4 名玩家。"],
  ["Estimated Play Time: 30 minutes.", "預估遊玩時間：30 分鐘。"],
  [
    "Primary Goal: eliminate the other player and be the last one standing.",
    "主要目標：淘汰其他玩家，成為最後留在場上的人。",
  ],
  [
    "Core hook: use movement to create building and shooting opportunities, reshaping the map into tactical advantage.",
    "核心機制：透過移動創造建造與射擊機會，將地圖重新塑造成戰術優勢。",
  ],
  [
    "The design defines cards, avatars, dice, blocks, territory marks, power-ups, procedures, purchasing, combat range, and inventory rules as a complete board-game document.",
    "此設計將卡牌、角色棋子、骰子、方塊、領地標記、增益道具、流程、購買、戰鬥範圍與庫存規則整理成一份完整的桌遊文件。",
  ],
  [
    "The prototype connects traversal, building, shooting, and resource management into one turn structure, so each action can change both board state and future strategy.",
    "原型將移動、建造、射擊與資源管理整合進同一個回合結構，使每個行動都能同時改變棋盤狀態與後續策略。",
  ],
  [
    "A refrigerator management and food-waste monitoring app prototype for tracking purchases, freshness status, storage planning, and shopping decisions.",
    "一個冰箱管理與食物浪費監測 App 原型，用於追蹤購買紀錄、新鮮度狀態、收納規劃與購物決策。",
  ],
  ["Team project by Red, Mika, and Kaiyi.", "由 Red、Mika 與 Kaiyi 共同完成的團隊專案。"],
  [
    "Research includes problem statement, interviews, insights, persona, competitor analysis, user flow, and wireframes.",
    "研究內容包含問題定義、訪談、洞察、使用者角色、競品分析、使用者流程與線框稿。",
  ],
  [
    "Final output includes high-fidelity mobile screens for onboarding, inventory, receipt scanning, waste tracking, and item details.",
    "最終輸出包含高保真手機介面，涵蓋新手引導、庫存、收據掃描、浪費追蹤與品項細節。",
  ],
  [
    "Fresh food often exceeds its shelf life because users do not plan purchase quantity, storage, and cooking timing clearly enough. The prototype focuses on reducing waste of both money and food.",
    "新鮮食材常因使用者沒有清楚規劃購買數量、儲存方式與烹調時間而超過保存期限。此原型聚焦於降低金錢與食物的雙重浪費。",
  ],
  [
    "How might an app help users organize refrigerator storage, raw materials, leftovers, freshness reminders, meal plans, and shopping plans in one coherent flow?",
    "一個 App 如何能在同一套連貫流程中，協助使用者整理冰箱收納、原材料、剩菜、新鮮度提醒、餐食計畫與購物計畫？",
  ],
  [
    "An interaction prototype for managing large collections of digital assets across online and offline resource locations.",
    "一個互動原型，用於管理分散在線上與離線資源位置中的大量數位素材。",
  ],
  [
    "Targets images, videos, 3D models, and text resources across multiple devices and platforms.",
    "目標涵蓋跨裝置與跨平台的圖片、影片、3D 模型與文字資源。",
  ],
  [
    "Explores a concise system for locating and organizing files without losing context.",
    "探索一套簡潔的定位與整理檔案系統，同時保留檔案原本的脈絡。",
  ],
  [
    "Prototype documentation is presented through a layered interface and embedded design preview.",
    "原型文件透過分層介面與嵌入式設計預覽呈現。",
  ],
  [
    "Managing vast collections of digital assets can become overwhelming and time-consuming. AssetHub proposes a central place that helps users target resources efficiently.",
    "管理龐大的數位素材集合容易變得繁瑣且耗時。AssetHub 提出一個集中位置，協助使用者更有效率地鎖定所需資源。",
  ],
  [
    "The page frames the tool as a practical interface system rather than a marketing concept, emphasizing access, file context, and cross-platform organization.",
    "此頁面將工具定位為實用的介面系統，而非行銷概念，並強調存取、檔案脈絡與跨平台整理。",
  ],
  [
    "A print-focused graphic design exercise reimagining a Pitchfork magazine cover with a high-contrast editorial hierarchy.",
    "一個以印刷為核心的平面設計練習，重新想像 Pitchfork 雜誌封面，並建立高對比的編輯層級。",
  ],
  ["Cover subject: Beyonce, Cowboy Carter.", "封面主題：Beyonce，Cowboy Carter。"],
  [
    "Format explores masthead scale, editorial image cropping, barcode placement, and magazine-cover typography.",
    "版式探索刊頭尺度、編輯影像裁切、條碼位置與雜誌封面字體排印。",
  ],
  [
    "The design uses a restrained black-and-white system to keep the image and title hierarchy dominant.",
    "設計使用克制的黑白系統，使影像與標題層級保持主導。",
  ],
  [
    "The page centers a single magazine cover as the finished artifact, with visual emphasis on typographic proportion, portrait placement, and print layout balance.",
    "頁面以單一雜誌封面作為完成品核心，視覺重點放在字體比例、人像位置與印刷版面平衡。",
  ],
  [
    "The final cover is presented as a clean editorial object rather than a process-heavy case study.",
    "最終封面被呈現為乾淨的編輯物件，而不是以流程為主的案例研究。",
  ],
  [
    "A narrative game pitch about slow-paced, non-aggressive storytelling, visual interactive narrative language, and post-modern social problems.",
    "一個敘事遊戲提案，關於慢節奏、非攻擊性的故事講述、視覺互動敘事語言，以及後現代社會問題。",
  ],
  ["Tone: slow-paced and non-aggressive.", "語氣：慢節奏且非攻擊性。"],
  [
    "Narrative mode: visual interactive storytelling with music, narration, and sensory audiovisual language.",
    "敘事模式：結合音樂、旁白與感官視聽語言的視覺互動敘事。",
  ],
  [
    "Theme: personal struggle expanding into broader social challenges including identity, culture, depression, economics, and political shifts.",
    "主題：個人掙扎延展至更廣泛的社會挑戰，包含身分、文化、憂鬱、經濟與政治變動。",
  ],
  [
    "The story is told from a teenager's perspective in a semi-autobiographical mode, following a young individual across social classes and cultural fragmentation.",
    "故事以青少年的視角和半自傳式方式講述，跟隨一名年輕個體穿越社會階層與文化碎片化。",
  ],
  [
    "The pitch emphasizes an intuitive, sensory narrative style where visuals, music, and narration work together to carry emotion and story.",
    "提案強調直覺且感官化的敘事風格，讓視覺、音樂與旁白共同承載情感與故事。",
  ],
  [
    "Created a decision-making gameplay structure centered around information reading, judgment, and player actions.",
    "建立一套以資訊閱讀、判斷與玩家行動為核心的決策型遊戲結構。",
  ],
  ["Completed a fully playable prototype within 48 hours.", "在 48 小時內完成可完整遊玩的原型。"],
  ["Awarded 1st Place at the 2024 ArtCenter Game Jam.", "獲得 2024 ArtCenter Game Jam 第一名。"],
  [
    "Designed interaction structures and UI animation systems for ingredient management workflows.",
    "為食材管理流程設計互動結構與 UI 動畫系統。",
  ],
  [
    "Designed the core gameplay loop, resource economy, combat systems, and AI mechanics.",
    "設計核心遊戲循環、資源經濟、戰鬥系統與 AI 機制。",
  ],
  [
    "Developed iterative gameplay systems including Movement, Combat, Inventory, and AI finite-state logic.",
    "開發可迭代的遊戲系統，包含移動、戰鬥、庫存與 AI 有限狀態邏輯。",
  ],
  [
    "Assisted Professor Chesley Nesaeny in his Type 1 course. Led individual and group critiques. Helped students conceptualize typographic ideas, create clear structures, and understand print practices.",
    "協助 Chesley Nesaeny 教授的 Type 1 課程。帶領個人與小組評圖，協助學生發展字體排印概念、建立清楚結構，並理解印刷實務。",
  ],
])

function bilingualText(value) {
  const english = escapeHtml(value)
  const translation = copyTranslations.get(String(value))
  if (!translation) return `<span class="body-copy-en">${english}</span>`

  return `<span class="body-copy-en">${english}</span><span class="body-copy-zh" lang="zh-Hans">${formatChineseText(translation)}</span>`
}

function bilingualRich(englishHtml, traditionalHtml) {
  return `<span class="body-copy-en">${englishHtml}</span><span class="body-copy-zh" lang="zh-Hans">${formatChineseHtml(traditionalHtml)}</span>`
}

function bilingualLine(value) {
  return `<span class="body-copy-line">${bilingualText(value)}</span>`
}

function headerMarkup() {
  const nav = navItems
    .map(
      (item) => `
        <a class="nav-item" href="${hrefFor("/")}#${item.hash}" data-nav-category="${escapeHtml(item.hash)}">
          <span class="nav-title">${escapeHtml(item.label)}</span>
          <span class="nav-detail">${escapeHtml(item.detail)}</span>
        </a>`
    )
    .join("")

  return `
    <header class="site-header" data-site-header>
      <div class="header-inner">
        <a class="brand" href="${hrefFor("/")}" aria-label="ReDInAStrikE home" data-home-logo>
          <span class="brand-square">
            <img class="brand-logo" src="${asset("assets/logo-vector.svg")}" alt="刹那繁红 ReDInAStrikE" />
          </span>
        </a>
        <nav class="nav-list" aria-label="Portfolio categories">${nav}</nav>
      </div>
      <div class="header-rule" aria-hidden="true"></div>
    </header>`
}

function mediaStyle(project) {
  return [
    "--media-aspect: 16 / 9",
    `--image-fit: ${project.imageFit || "cover"}`,
    `--image-position: ${project.imagePosition || "center center"}`,
    `--media-bg: ${project.mediaBackground || "#f2f2f2"}`,
  ].join("; ")
}

function projectCard(project, index, loadingIndex = index, options = {}) {
  const videoAttributes = project.youtube && !options.muted
    ? ` data-hover-youtube="${escapeHtml(project.youtube)}"`
    : ""
  const mutedClass = options.muted ? " is-filter-muted" : ""
  const mutedAttributes = options.muted ? ` data-filter-muted="true"` : ""
  const mediaBackgroundClass = project.mediaBackground ? " has-media-background" : ""
  const halftoneCanvas = options.muted
    ? `<canvas class="project-halftone" aria-hidden="true"></canvas>`
    : ""

  return `
    <a class="project-card${mutedClass}" href="${hrefFor(project.path)}" data-project-card data-section="${escapeHtml(project.navHash)}" data-index="${index}"${mutedAttributes}>
      <figure class="project-media${mediaBackgroundClass}" style="${mediaStyle(project)}"${videoAttributes}>
        <img
          src="${asset(project.image)}"
          alt="${escapeHtml(project.pageTitle)}"
          loading="${loadingIndex < 2 ? "eager" : "lazy"}"
          decoding="async"
        />
        ${halftoneCanvas}
      </figure>
      <div class="project-meta">
        <span class="project-title">${escapeHtml(project.displayTitle)}</span>
        <span class="project-date">${escapeHtml(project.date)}</span>
      </div>
    </a>`
}

function galleryTile(project, index, isClone = false) {
  const hiddenAttributes = isClone ? ` aria-hidden="true" tabindex="-1"` : ""
  const mediaBackgroundClass = project.mediaBackground ? " has-media-background" : ""

  return `
    <a class="footer-gallery-tile" href="${hrefFor(project.path)}" style="${mediaStyle(project)}"${hiddenAttributes}>
      <figure class="footer-gallery-media${mediaBackgroundClass}">
        <img
          src="${asset(project.image)}"
          alt="${escapeHtml(project.pageTitle)}"
          loading="eager"
          decoding="async"
        />
      </figure>
      <div class="footer-gallery-meta">
        <span>${escapeHtml(project.displayTitle)}</span>
        <span>${escapeHtml(project.date)}</span>
      </div>
    </a>`
}

function footerGalleryMarkup() {
  const tileSets = Array.from({ length: 4 }, (_, setIndex) => {
    const isClone = setIndex > 0
    const hiddenAttributes = isClone ? ` aria-hidden="true"` : ""
    const tiles = projects
      .map((project, index) => galleryTile(project, index, isClone))
      .join("")

    return `
            <div class="footer-gallery-set"${hiddenAttributes}>
              ${tiles}
            </div>`
  }).join("")

  return `
    <section class="footer-gallery" aria-label="Rotating project gallery">
      <div class="footer-gallery-viewport">
        <div class="footer-gallery-runner">
          <div class="footer-gallery-track">
            ${tileSets}
          </div>
        </div>
      </div>
    </section>`
}

const resumeProjects = [
  {
    title: "SerialDeminer",
    role: "Game Jam Prototype Design & Development",
    date: "March 2024",
    body: [
      "Created a decision-making gameplay structure centered around information reading, judgment, and player actions.",
      "Completed a fully playable prototype within 48 hours.",
      "Awarded 1st Place at the 2024 ArtCenter Game Jam.",
    ],
  },
  {
    title: "MyFridge",
    role: "Interactive Prototype Design & Development",
    date: "Sept-Oct 2024",
    body: [
      "Designed interaction structures and UI animation systems for ingredient management workflows.",
    ],
  },
  {
    title: "Build and Shoot",
    role: "Card Game Prototype Design",
    date: "Oct-Nov 2024",
    body: [
      "Designed the core gameplay loop, resource economy, combat systems, and AI mechanics.",
      "Developed iterative gameplay systems including Movement, Combat, Inventory, and AI finite-state logic.",
    ],
  },
  {
    title: "Dad Game",
    role: "Digital Game Prototype Design & Development",
    date: "Jan-Sept 2025",
    body: [
      "Designed the core gameplay loop, resource economy, combat systems, and AI mechanics.",
    ],
  },
  {
    title: "Drill and Thrill",
    role: "Lead Alt-Control Game Design & Development / Graphics Design",
    date: "Jan-Sept 2025",
    body: [
      "Designed the core gameplay loop, resource economy, combat systems, and AI mechanics.",
    ],
  },
  {
    title: "Shroom Show Down",
    role: "Lead Alt-Control Game Design & Development / Graphics Design",
    date: "Jan-Sept 2026",
    body: [
      "Designed the core gameplay loop, resource economy, combat systems, and AI mechanics.",
    ],
  },
  {
    title: "Curtain",
    role: "Game Prototype Design & Development / Graphics Design",
    date: "Mar-Nov 2025",
    body: [
      "Designed the core gameplay loop, resource economy, combat systems, and AI mechanics.",
    ],
  },
]

const resumeEducation = [
  {
    school: "ArtCenter College of Design:",
    programs: [
      {
        name: "BS - Entertainment Design - Game Design",
        date: "Sep 2023 - May 2027 (Anticipated)",
      },
    ],
  },
  {
    school: "California Institute of Technology",
    programs: [{ name: "Computer Science (Exchange Program)" }],
  },
  {
    school: "Occidental College",
    programs: [
      { name: "Computer Science (Exchange Program)" },
      { name: "Mathematics (Exchange Program)" },
    ],
  },
]

const resumeExperience = {
  role: "Teaching Assistant",
  place: "ArtCenter College of Design",
  courses: ["Type 1: Foundation"],
  body:
    "Assisted Professor Chesley Nesaeny in his Type 1 course. Led individual and group critiques. Helped students conceptualize typographic ideas, create clear structures, and understand print practices.",
}

const resumeSkills = [
  "Chinese",
  "English",
  "Rapid Prototype",
  "Game Design & Development",
  "Interaction Design & Development",
  "Typography",
  "Visual Design",
  "Motion Design",
]

const resumeTools =
  "Unity (Unity 6 & 2022.3+), Unreal Engine, Blender, Figma, Adobe Suite (Photoshop, After Effects, InDesign, Illustrator), Apple Creative Suite (Final Cut Pro, Logic Pro), TouchDesigner, C#, Swift, p5.js, Cinema 4D, Arduino IDE."

function resumeProjectMarkup(project) {
  const body = project.body.map(bilingualLine).join("")

  return `
        <article class="resume-project">
          <div class="resume-project-head">
            <div>
              <h3>${escapeHtml(project.title)}</h3>
              <p>${escapeHtml(project.role)}</p>
            </div>
            <time>${escapeHtml(project.date)}</time>
          </div>
          <p class="resume-project-body">${body}</p>
        </article>`
}

function resumeEducationMarkup(group) {
  const programs = group.programs
    .map(
      (program) => `
            <div class="resume-education-program${program.date ? " has-date" : ""}">
              <span>${escapeHtml(program.name)}</span>
              ${program.date ? `<time>${escapeHtml(program.date)}</time>` : ""}
            </div>`
    )
    .join("")

  return `
        <div class="resume-education-group">
          <h4>${escapeHtml(group.school)}</h4>
          ${programs}
        </div>`
}

function resumeDetailMarkup() {
  const projectItems = resumeProjects.map(resumeProjectMarkup).join("")
  const educationItems = resumeEducation.map(resumeEducationMarkup).join("")
  const skillItems = resumeSkills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")
  const courseItems = resumeExperience.courses.map((course) => `<span>${escapeHtml(course)}</span>`).join("")

  return `
      <section class="resume-detail" aria-label="Resume history">
        <div class="resume-projects" aria-label="Project history">
          ${projectItems}
        </div>
        <div class="resume-side">
          <section class="resume-info-block" aria-label="Education">
            <h3>Education</h3>
            <div class="resume-education-list">
              ${educationItems}
            </div>
          </section>
          <section class="resume-info-block" aria-label="Experience">
            <h3>Experience</h3>
            <div class="resume-experience">
              <h4>${escapeHtml(resumeExperience.role)}</h4>
              <p>${escapeHtml(resumeExperience.place)}</p>
              <div class="resume-course-list">${courseItems}</div>
              <p>${bilingualText(resumeExperience.body)}</p>
            </div>
          </section>
          <section class="resume-info-block resume-skills" aria-label="Skills">
            <h3>Skills</h3>
            <div class="resume-skills-grid">${skillItems}</div>
            <p class="resume-tools">${escapeHtml(resumeTools)}</p>
          </section>
        </div>
      </section>`
}

function aboutMarkup() {
  return `
    <section class="about-section" id="resume" aria-label="About Red Wang">
      <div class="about-card">
        <div class="about-copy">
          <h2>About:</h2>
          <p>
            ${bilingualRich(
              `Red Wang <span class="name-inline" lang="zh-Hans">“王紫鹏”</span> is a Game Design student and is now based in the LA area. An independent thinker who enjoys teamwork. Passionate for Game Design &amp; Development, Cinematic &amp; Media Arts, Interaction Design, Graphic Design and other Interdisciplinary practices.`,
              `Red Wang <span class="name-inline" lang="zh-Hans">「王紫鹏」</span> 是一名遊戲設計學生，目前居於洛杉磯地區。他是一位享受團隊合作的獨立思考者，熱衷於遊戲設計與開發、影像與媒體藝術、互動設計、平面設計，以及其他跨領域實踐。`,
            )}
          </p>
        </div>
        <div class="contact-copy" id="contact">
          <h2>Contact:</h2>
          <div class="contact-links">
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="https://www.instagram.com/red_cnfh/">Instagram</a>
            <a href="mailto:zwang29@inside.artcenter.edu">Email</a>
          </div>
        </div>
        <figure class="profile-portrait">
          <img src="${asset("assets/figma-home/about-profile.png")}" alt="Red Wang portrait" />
        </figure>
        <div class="profile-card">
          <h2 lang="zh-Hans">王紫鹏</h2>
          <p>Game Design Student at ArtCenter<br />College of Design</p>
          <div class="profile-actions">
            <a href="mailto:zwang29@inside.artcenter.edu">Contact Me</a>
            <a href="#game">Latest Project</a>
          </div>
        </div>
      </div>
      <div class="resume-card">
        <div class="about-resume-band" aria-hidden="true"></div>
        <p class="resume-word" aria-hidden="true">Resume</p>
        ${resumeDetailMarkup()}
      </div>
    </section>`
}

function homeMarkup() {
  return `
    ${headerMarkup()}
    <main class="site-main" data-route="home">
      <section class="catalog" aria-label="Project catalog">
        ${catalogRowsMarkup()}
      </section>
      ${footerGalleryMarkup()}
      ${aboutMarkup()}
    </main>`
}

function detailMarkup(project) {
  if (project.path === "/serialdeminer") return serialDeminerDetailMarkup(project)
  if (framerProjectDetails[project.path]) {
    return framerProjectDetailMarkup(project, framerProjectDetails[project.path])
  }

  const projectMedia = project.itchEmbed
    ? `<figure class="detail-screenshot detail-playable" aria-label="${escapeHtml(project.pageTitle)} playable game">
        <iframe
          src="${escapeHtml(project.itchEmbed)}"
          title="Play ${escapeHtml(project.pageTitle)} on itch.io"
          allow="autoplay; fullscreen; gamepad; pointer-lock"
          allowfullscreen
          loading="eager"
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      </figure>`
    : `<figure class="detail-screenshot">
        <img src="${asset(project.image)}" alt="${escapeHtml(project.pageTitle)} full-page reference" />
      </figure>`

  return `
    ${headerMarkup()}
    <main class="site-main detail-page" data-route="${escapeHtml(project.path)}">
      <article class="detail-shell">
        <div class="detail-heading">
          <div>
            <h1>${escapeHtml(project.pageTitle)}</h1>
            <p>${escapeHtml(project.displayTitle)}</p>
          </div>
          <span>${escapeHtml(project.date)}</span>
        </div>
        ${projectMedia}
      </article>
    </main>`
}

function framerProjectDetailMarkup(project, detail) {
  const points = detail.points
    .map((point) => `<li>${bilingualText(point)}</li>`)
    .join("")
  const blocks = detail.blocks
    .map(
      (block) => `
        <section>
          <h2>${escapeHtml(block.title)}</h2>
          <p>${bilingualText(block.body)}</p>
        </section>`
    )
    .join("")

  return `
    ${headerMarkup()}
    <main class="site-main detail-page framer-derived-page" data-route="${escapeHtml(project.path)}">
      <article class="framer-derived-shell" aria-label="${escapeHtml(detail.title)} project page">
        <section class="framer-derived-hero">
          <div class="framer-derived-hero-head">
            <h1>${escapeHtml(detail.title)}</h1>
            <p class="framer-derived-year">${escapeHtml(detail.year)}</p>
          </div>
          <span class="framer-derived-category">${escapeHtml(detail.category)}</span>
        </section>

        <section class="framer-derived-intro">
          <figure>
            <img src="${asset(detail.leadImage)}" alt="${escapeHtml(detail.leadAlt)}" loading="eager" />
          </figure>
          <div>
            <p>${bilingualText(detail.summary)}</p>
            <ul>${points}</ul>
          </div>
        </section>

        <section class="framer-derived-blocks">
          ${blocks}
        </section>

        <section class="framer-derived-reference" aria-label="${escapeHtml(detail.title)} full page">
          <figure>
            <img src="${asset(detail.routeImage)}" alt="${escapeHtml(detail.title)} Framer page capture" loading="lazy" />
          </figure>
        </section>

        <section class="framer-derived-footer">
          <div>
            <h2>Overview</h2>
            <p>${escapeHtml(project.displayTitle)}</p>
            <p>${escapeHtml(project.date)}</p>
          </div>
          <div>
            <h2>Access</h2>
            <p><a href="mailto:zwang29@inside.artcenter.edu">zwang29@inside.artcenter.edu</a></p>
          </div>
        </section>
      </article>
    </main>`
}

function caseImage(path, alt, className = "") {
  return `
    <figure class="framer-case-image ${className}">
      <img src="${asset(path)}" alt="${escapeHtml(alt)}" loading="lazy" />
    </figure>`
}

function youtubeEmbed(id, className = "") {
  return `
    <div class="framer-youtube ${className}">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}"
        title="Serial Deminer video"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>`
}

function serialDeminerDetailMarkup(project) {
  return `
    ${headerMarkup()}
    <main class="site-main detail-page framer-case-page" data-route="${escapeHtml(project.path)}">
      <article class="framer-case-shell" aria-label="Serial Deminer case study">
        <section class="framer-case-hero">
          <div class="framer-case-hero-head">
            <h1>Serial Deminer</h1>
            <p class="framer-case-year">2024 Fall</p>
          </div>
          <p class="framer-case-category">Game Design &amp; Level Design</p>
        </section>

        <section class="framer-case-section framer-media-section">
          ${youtubeEmbed("yZgmrNLV1Pg", "framer-youtube-wide")}
          <div class="framer-media-grid framer-media-grid-three">
            ${caseImage("assets/serial-deminer/01-iPBd_9mAN.png", "Serial Deminer gameplay view")}
            ${caseImage("assets/serial-deminer/02-we8S3oXEt.png", "Serial Deminer title menu")}
            ${caseImage("assets/serial-deminer/03-O5UGVmFqY.png", "Serial Deminer level select menu")}
          </div>
        </section>

        <section class="framer-case-section framer-copy-grid framer-copy-sans">
          <div>
            <h2>Brief</h2>
            <p>${bilingualRich(
              `In <em>Serial Miner</em>, you take on the role of a skilled de-miner on a high-stakes mission to clear hazardous landmines and create a safe path for an incoming convoy. Using a suite of specialized gadgets — including a marking flag, a metal detector, and explosives — your objective is to locate, mark, and detonate mines in a strategic, precise manner to ensure no explosives are left undetected.`,
              `在 <em>Serial Miner</em> 中，玩家扮演一名熟練的拆彈人員，執行高風險任務，清除危險地雷並為即將抵達的車隊建立安全路徑。玩家會使用一系列專用工具，包含標記旗、金屬探測器與爆裂物；目標是以策略性且精準的方式定位、標記並引爆地雷，確保沒有爆裂物被遺漏。`,
            )}</p>
          </div>
          <div>
            <h2>Key Features</h2>
            <p>${bilingualRich(
              `<strong>Marking Flag</strong>: Place flags to identify mines you've found, helping you avoid rechecking areas and making your path safer.`,
              `<strong>標記旗</strong>：放置旗幟來標示已找到的地雷，避免重複檢查同一區域，並讓路徑更安全。`,
            )}</p>
            <p>${bilingualRich(
              `<strong>Metal Detector</strong>: Sweeps for hidden mines; listen for beeps that indicate the proximity of a mine.`,
              `<strong>金屬探測器</strong>：掃描隱藏地雷；透過嗶聲判斷地雷的接近程度。`,
            )}</p>
            <p>${bilingualRich(
              `<strong>Explosives</strong>: Carefully place explosives on mines to clear them. Only use this gadget when in detonation range.`,
              `<strong>爆裂物</strong>：小心地將爆裂物放置在地雷上以清除它們。只有在可引爆範圍內才能使用此工具。`,
            )}</p>
          </div>
        </section>

        <section class="framer-case-section framer-media-section">
          ${caseImage("assets/serial-deminer/04-h_Ht3aFZJ.png", "GMTK Game Jam 2024", "framer-image-wide")}
          <div class="framer-media-grid framer-media-grid-three">
            ${caseImage("assets/serial-deminer/05-ouNqxE_cR.png", "Windowframe game reference")}
            ${caseImage("assets/serial-deminer/06-Oz6q4Ddvz.png", "Blueprint Hell game reference")}
            ${caseImage("assets/serial-deminer/07-L4wEXwwl6.png", "Puzzle game reference")}
          </div>
        </section>

        <section class="framer-case-section framer-text-section">
          <h2>Target Audience:</h2>
          <p>${bilingualRich(
            `After reflecting on the theme for this game jam, I first considered our target audience. Following discussions with my teammates and reviewing our research, we reached the following conclusions:`,
            `在思考這次 game jam 主題後，我首先考慮的是我們的目標受眾。經過與隊友討論並整理研究內容後，我們得到以下結論：`,
          )}</p>
          <p>${bilingualRich(
            `We analyzed the winning entries from the GMTK 2024 Game Jam on itch.io. After playing and discussing these games, one keyword stood out: “<strong>Puzzle</strong>.” Beyond impressive visuals and arts, we noticed that clever and engaging puzzle designs consistently captivated us and left a lasting impression. Based on this, we concluded that our target audience should be players who enjoy a <strong>Casual gaming experience</strong> and are <strong>Enthusiastic about solving puzzles</strong>.`,
            `我們分析了 itch.io 上 GMTK 2024 Game Jam 的獲獎作品。遊玩並討論這些作品後，一個關鍵詞變得非常明確：「<strong>解謎</strong>」。除了令人印象深刻的視覺與美術，我們也注意到聰明且有趣的謎題設計總是能吸引我們並留下深刻印象。基於此，我們認為目標受眾應該是喜歡 <strong>休閒遊戲體驗</strong> 並且 <strong>熱衷解謎</strong> 的玩家。`,
          )}</p>
          <p>${bilingualRich(
            `Secondly, as a 48-hour game jam project, an important target audience of our project includes <strong>Game design professionals and students</strong> like us. These individuals value design details, the game’s relevance to the theme, and its overall completeness as a finished product.`,
            `其次，作為一個 48 小時 game jam 專案，我們的重要目標受眾也包含像我們一樣的 <strong>遊戲設計專業人士與學生</strong>。這類人會重視設計細節、作品與主題的關聯性，以及它作為完成品的整體完整度。`,
          )}</p>
          <p>${bilingualRich(
            `Of course, another key audience includes <strong>Game enthusiasts and critics</strong> interested in exploring jam entries—those who enjoy browsing diverse games and experiencing the creative ideas these lightweight projects deliver.`,
            `當然，另一個重要受眾是對探索 jam 作品有興趣的 <strong>遊戲愛好者與評論者</strong>；他們喜歡瀏覽各式各樣的遊戲，並體驗這些輕量專案所傳達的創意想法。`,
          )}</p>
        </section>

        <section class="framer-case-section framer-text-section">
          <h2>Player Experience:</h2>
          <p>${bilingualRich(
            `Based on our target audience and the competition's theme, we began brainstorming the game experience we wanted to create. Expanding on the theme of “chain reaction,” we envisioned an experience where a single trigger sets off a series of automatic events like dominoes falling. This experience should feel exciting—seamless, satisfying, unpredictable, and chaotically dangerous.`,
            `基於目標受眾與比賽主題，我們開始發想想要創造的遊戲體驗。延伸「連鎖反應」的主題，我們想像一種由單一觸發點啟動一連串自動事件的體驗，就像骨牌倒下一樣。這種體驗應該令人興奮、流暢、滿足、不可預測，並帶有混亂的危險感。`,
          )}</p>
          <p>${bilingualRich(
            `From a puzzle perspective, solving puzzles is a slow yet deliberate process. Therefore, our game experience should encourage a steady pace, allowing players to explore and understand the puzzles at their own rhythm.`,
            `從解謎角度來看，解謎是一個緩慢但需要深思熟慮的過程。因此，我們的遊戲體驗應鼓勵穩定的節奏，讓玩家能依照自己的步調探索並理解謎題。`,
          )}</p>
          <p>${bilingualRich(
            `Thus, our game’s experience prompt is: <strong>“Explore and solve puzzles in a relaxed and enjoyable atmosphere, while experiencing how a single key action can influence the entire puzzle-solving process.”</strong>`,
            `因此，我們的遊戲體驗提示是：<strong>「在輕鬆愉快的氛圍中探索並解決謎題，同時體驗一個關鍵行動如何影響整個解謎過程。」</strong>`,
          )}</p>
          <p>${bilingualRich(
            `The gameplay is designed to last 3-5 minutes, allowing players to make numerous attempts within a short time without losing progress upon failure. Players are immersed in a relaxed and enjoyable environment, focused on exploring puzzles and mastering the game mechanics.`,
            `遊玩時長被設計為 3 到 5 分鐘，讓玩家能在短時間內多次嘗試，並且不會因失敗而失去大量進度。玩家會沉浸在輕鬆愉快的環境中，專注於探索謎題與掌握遊戲機制。`,
          )}</p>
        </section>

        <section class="framer-case-section framer-media-section">
          <div class="framer-media-grid framer-media-grid-two">
            ${caseImage("assets/serial-deminer/08-kqrm2l48I.png", "Death Coming reference")}
            ${caseImage("assets/serial-deminer/09-impQt8jik.png", "Bejeweled reference")}
            ${youtubeEmbed("0yMnnqxGgME", "framer-youtube-half")}
            ${youtubeEmbed("Unz-V2NGGCg", "framer-youtube-half")}
          </div>
        </section>

        <section class="framer-case-section framer-text-section">
          <h2>Research &amp; Exploration:</h2>
          <p>${bilingualRich(
            `When brainstorming the game’s format and mechanics, we explored various directions and references. I initially proposed “Bejeweled” as the inspiration for our project. I believe its gameplay, where players rearrange a 2D grid of gems through simple drag-and-drop actions, aligns well with the theme of “chain reaction.” A single, light action can trigger potential chain explosions, allowing players to enjoy the automatic interactions between gems of different colors and properties while earning score rewards.`,
            `在發想遊戲形式與機制時，我們探索了不同方向與參考。我最初提出以 “Bejeweled” 作為專案靈感來源。我認為它讓玩家透過簡單拖放動作重新排列 2D 格子中的寶石，這種玩法與「連鎖反應」主題相當契合。一個輕量的單一步驟就能觸發潛在的連鎖爆發，讓玩家在獲得分數獎勵的同時，享受不同顏色與屬性寶石之間的自動互動。`,
          )}</p>
          <p>${bilingualRich(
            `Another game reference comes from the Chinese 2D puzzle game <em>“死神来了” (Death Coming)</em>. Unlike <em>Bejeweled</em>, this game focuses more on the connection between narrative and gameplay. Players take on the role of a trainee grim reaper, interacting with objects in each level’s scene. Using fewer steps to trigger more object interactions and cause more character deaths results in higher scores. The key takeaway from this game is its engaging premise and setting, which are tightly integrated with the gameplay, creating a cohesive and immersive experience.`,
            `另一個遊戲參考來自中文 2D 解謎遊戲 <em>《死神來了》（Death Coming）</em>。不同於 <em>Bejeweled</em>，這款遊戲更強調敘事與玩法之間的連結。玩家扮演實習死神，與每個關卡場景中的物件互動。使用越少步驟觸發越多物件互動，並造成更多角色死亡，就能得到更高分數。這款遊戲給我們的重要啟發，是它有吸引人的前提與設定，並與玩法緊密整合，形成連貫且沉浸的體驗。`,
          )}</p>
        </section>

        <section class="framer-case-section framer-media-section">
          <div class="framer-media-grid framer-media-grid-three framer-media-grid-checkers">
            ${caseImage("assets/serial-deminer/10-Rg6ZVaB8p.png", "Puzzle layout research diagram")}
            ${caseImage("assets/serial-deminer/11-UU2kbPdbH.png", "Puzzle layout chain diagram")}
            ${caseImage("assets/serial-deminer/12-VG2jA9Il6.png", "Puzzle layout map diagram")}
          </div>
          ${caseImage("assets/serial-deminer/13-zIT2xV17Q.png", "Level sketch", "framer-image-centered")}
        </section>

        <section class="framer-case-section framer-text-section">
          <h2>Design &amp; Iteration:</h2>
          <p>${bilingualRich(
            `Based on our research, we initially considered a gameplay design focused on a maze that players could navigate by creating paths through explosions. Players would need to find a way to clear obstacles and continue exploring. This would involve making a key decision after careful thought to progress. The maze’s puzzles should strike a balance between being neither too easy nor too difficult—players should quickly understand what needs to be done (how to approach the puzzle) but spend time figuring out how to execute it (how to solve the puzzle).`,
            `基於研究，我們一開始考慮以迷宮為核心的玩法設計，讓玩家透過爆炸創造路徑並在迷宮中前進。玩家需要找到清除障礙並繼續探索的方法，而這需要在深思熟慮後做出關鍵決策才能推進。迷宮謎題需要在不過於簡單與不過於困難之間取得平衡；玩家應能快速理解需要做什麼，也就是如何接近謎題，但需要花時間思考如何執行，也就是如何解開謎題。`,
          )}</p>
          <p>${bilingualRich(
            `We refined this idea further, considering what setting and actions would best fit our gameplay. We drew inspiration from the real-life concept of miners using explosives to carve out mine shafts, shaping our game’s premise. Players take on the role of a path designer working for miners, responsible for determining the placement of explosives.`,
            `我們進一步細化這個想法，思考什麼樣的設定與行動最適合這套玩法。我們從現實中礦工使用爆裂物開鑿礦道的概念汲取靈感，並以此形塑遊戲前提。玩家扮演為礦工工作的路徑設計者，負責決定爆裂物的放置位置。`,
          )}</p>
          <p>${bilingualRich(
            `To align with the chain reaction theme, the entire explosion sequence can only be initiated once. Players cannot manually detonate each explosive but must strategically arrange them in specific positions and quantities to ensure the first explosive connects with the last, completing the chain and clearing the path to progress.`,
            `為了符合連鎖反應主題，整段爆炸序列只能被啟動一次。玩家不能手動引爆每個爆裂物，而必須以特定位置與數量進行策略性排列，確保第一個爆裂物能連接到最後一個，完成連鎖並清出前進路徑。`,
          )}</p>
        </section>

        <section class="framer-case-section framer-media-section">
          <div class="framer-media-grid framer-media-grid-two framer-level-top">
            ${caseImage("assets/serial-deminer/14-ouluH8FSt.png", "Level design blockout")}
            ${caseImage("assets/serial-deminer/15-bK7P1H_1k.png", "Level design editor view")}
          </div>
          ${caseImage("assets/serial-deminer/16-kp3Djjey5.png", "Serial Deminer level design overview", "framer-image-centered framer-level-wide")}
        </section>

        <section class="framer-case-section framer-text-section">
          <h2>Design &amp; Iteration (Level Design):</h2>
          <p>${bilingualRich(
            `Bedi and I were responsible for the in-game level design. We translated the initial 2D sketches into 3D levels based on narrative and gameplay requirements, followed by internal playtesting and adjustments. While designing the levels, I considered player flow, ensuring the progression matched the narrative. The early levels were designed to be the simplest, gradually increasing in complexity and difficulty. During playtesting, we ensured each level’s puzzle-solving time stayed within 3-5 minutes to align with the game’s <strong>“Casual puzzle-solving”</strong> experience.`,
            `Bedi 和我負責遊戲內的關卡設計。我們根據敘事與玩法需求，將最初的 2D 草圖轉換為 3D 關卡，接著進行內部測試與調整。在設計關卡時，我會考慮玩家流動，確保進程與敘事相符。早期關卡被設計為最簡單的形式，之後逐步提升複雜度與難度。在測試過程中，我們確保每個關卡的解謎時間維持在 3 到 5 分鐘內，以符合遊戲的 <strong>「休閒解謎」</strong> 體驗。`,
          )}</p>
        </section>

        <section class="framer-case-footer">
          <div>
            <h2>Access</h2>
            <p>Itch.io:</p>
            <p><a href="https://drcharless-scp.itch.io/serial-deminer" target="_blank" rel="noreferrer">https://drcharless-scp.itch.io/serial-deminer</a></p>
          </div>
        </section>
      </article>
    </main>`
}

function render() {
  const route = routeFromLocation()
  const project = routeMap.get(route)
  app.innerHTML = project ? detailMarkup(project) : homeMarkup()
  siteState.navMetricKey = ""
  siteState.navHoverSpacingKey = ""
  refreshDomCache()
  resetCatalogFilterState()
  setupHeader()
  setupNavHoverSpacing({ force: true })
  setupNavHoverInteraction()
  setupFooterGallery()
  if (document.fonts) {
    document.fonts.ready.then(() => setupNavHoverSpacing({ force: true })).catch(() => {})
  }
  setupHoverEmbeds()
}

function readHeaderMetrics() {
  const width = window.innerWidth
  if (siteState.headerMetrics && siteState.headerMetricsWidth === width) {
    return siteState.headerMetrics
  }

  const fullHeight = width < 760 ? 186 : width < 1120 ? 210 : 200
  const compactHeight = width < 560 ? 84 : width < 760 ? 88 : 78
  const fullLogo = 150
  const compactLogo = width < 760 ? 52 : 48
  const distance = width < 680 ? 150 : 205
  const metrics = { width, fullHeight, compactHeight, fullLogo, compactLogo, distance }
  siteState.headerMetricsWidth = width
  siteState.headerMetrics = metrics
  return metrics
}

function inlineStyleValueMatches(current, next) {
  if (current === next) return true
  const currentMatch = String(current).trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/)
  const nextMatch = String(next).trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/)
  if (!currentMatch || !nextMatch) return false
  const currentNumber = Number.parseFloat(current)
  const nextNumber = Number.parseFloat(next)
  return (
    Number.isFinite(currentNumber) &&
    Number.isFinite(nextNumber) &&
    currentMatch[2] === nextMatch[2] &&
    Math.abs(currentNumber - nextNumber) < 0.01
  )
}

function setRootStyleProperty(name, value) {
  const next = String(value)
  if (siteState.headerStyleCache[name] === next) {
    const header =
      HEADER_VISUAL_STYLE_PROPERTIES.has(name) && window.__RED_PERF__
        ? siteState.dom.header || document.querySelector("[data-site-header]")
        : null
    if (!header || inlineStyleValueMatches(header.style.getPropertyValue(name), next)) return
  }
  siteState.headerStyleCache[name] = next
  document.documentElement.style.setProperty(name, next)
}

function removeRootStyleProperty(name) {
  if (!(name in siteState.headerStyleCache) && !document.documentElement.style.getPropertyValue(name)) return
  delete siteState.headerStyleCache[name]
  document.documentElement.style.removeProperty(name)
}

function setBodyDatasetValue(name, value) {
  if (document.body.dataset[name] === value) return
  document.body.dataset[name] = value
}

function setElementStyleProperty(element, name, value) {
  if (element.style.getPropertyValue(name) === value) return
  element.style.setProperty(name, value)
}

function invalidateCatalogContentBottom() {
  siteState.catalogContentBottomDocument = null
  siteState.catalogContentBottomHeaderHeight = null
  siteState.catalogContentBottomDirty = true
}

function requestLayoutEffectsUpdate(options = {}) {
  if (options.rules) siteState.layoutPendingRules = true
  if (options.footer) siteState.layoutPendingFooter = true
  if (!siteState.layoutPendingRules && !siteState.layoutPendingFooter) return
  if (siteState.layoutFrame) return

  siteState.layoutFrame = requestAnimationFrame(() => {
    siteState.layoutFrame = 0
    const updateRules = siteState.layoutPendingRules
    const updateFooter = siteState.layoutPendingFooter
    siteState.layoutPendingRules = false
    siteState.layoutPendingFooter = false

    if (updateRules) updateProjectRuleReveal()
    if (updateFooter) updateFooterGalleryReveal()
  })
}

function applyHeaderProgress(progress, options = {}) {
  const metrics = readHeaderMetrics()
  const coverProgress = clamp(options.coverProgress || 0, 0, 1)
  const viewportHeight = Math.max(
    window.innerHeight || 0,
    document.documentElement.clientHeight || 0,
    metrics.fullHeight,
  )
  const baseHeight = metrics.fullHeight + (metrics.compactHeight - metrics.fullHeight) * progress
  const height = baseHeight + (viewportHeight - baseHeight) * coverProgress
  const logo = metrics.fullLogo + (metrics.compactLogo - metrics.fullLogo) * progress
  const navScale = 1 + (0.88 - 1) * progress
  const detailOpacity = 1
  const glassAlpha = 0.76 + (0.96 - 0.76) * coverProgress
  const glassBlur = 18 + (26 - 18) * coverProgress
  const glassShadowAlpha = 0
  const ruleAlpha = 0.82

  setRootStyleProperty("--header-height", `${height.toFixed(2)}px`)
  setRootStyleProperty("--logo-size", `${logo.toFixed(2)}px`)
  setRootStyleProperty("--nav-scale", navScale.toFixed(4))
  setRootStyleProperty("--detail-opacity", detailOpacity.toFixed(4))
  setRootStyleProperty("--glass-alpha", glassAlpha.toFixed(4))
  setRootStyleProperty("--glass-blur", `${glassBlur.toFixed(2)}px`)
  setRootStyleProperty("--header-glass-shadow-alpha", glassShadowAlpha.toFixed(4))
  setRootStyleProperty("--header-rule-alpha", ruleAlpha.toFixed(4))
  siteState.headerVisualBottom = height

  const isCompact = progress > 0.7
  const density =
    metrics.width < 560
      ? "tiny"
      : metrics.width < 760
        ? "mobile"
        : isCompact
          ? "titles"
          : "full"
  const headerCompact = isCompact ? "true" : "false"
  setBodyDatasetValue("navDensity", density)
  setBodyDatasetValue("headerCompact", headerCompact)
  const navMetricKey = `${density}:${headerCompact}`
  if (siteState.navMetricKey !== navMetricKey) {
    siteState.navMetricKey = navMetricKey
    setupNavHoverSpacing()
  }
  requestLayoutEffectsUpdate({
    rules: siteState.hasProjectRuleTargets,
    footer: siteState.hasFooterGallery,
  })
}

function updateProjectRuleReveal() {
  const { header, projectRows, cardRuleTargets } = siteState.dom
  const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  if (!viewportHeight) return

  const visibleTop = clamp(
    siteState.headerVisualBottom > 0
      ? siteState.headerVisualBottom
      : header?.getBoundingClientRect().bottom || 0,
    0,
    viewportHeight - 1,
  )
  const visibleBottom = viewportHeight
  const visibleHeight = Math.max(1, visibleBottom - visibleTop)
  const edgeHoldDistance = clamp(visibleHeight * 0.035, 18, 42)
  const edgeFadeDistance = clamp(visibleHeight * 0.13, 68, 168)
  const ruleRevealFromY = (y) => {
    const edgeDistance = Math.min(y - visibleTop, visibleBottom - y)
    return smoothstep((edgeDistance - edgeHoldDistance) / edgeFadeDistance).toFixed(3)
  }

  const ruleUpdates = siteState.ruleFadeUpdates
  ruleUpdates.length = 0
  projectRows.forEach((row) => {
    const rect = row.getBoundingClientRect()
    ruleUpdates.push(row, "--project-rule-weight", ruleRevealFromY(rect.bottom))
  })

  cardRuleTargets.forEach((card) => {
    const rect = card.getBoundingClientRect()
    ruleUpdates.push(card, "--card-rule-weight", ruleRevealFromY(rect.top))
  })

  for (let index = 0; index < ruleUpdates.length; index += 3) {
    setElementStyleProperty(ruleUpdates[index], ruleUpdates[index + 1], ruleUpdates[index + 2])
  }
}

function requestRuleFadeUpdate() {
  if (!siteState.hasProjectRuleTargets) return
  requestLayoutEffectsUpdate({ rules: true })
}

function getCatalogContentBottom(catalog, fallback = 0) {
  if (!catalog) return fallback

  const canUseDocumentCache = siteState.dom.catalog === catalog && !catalog.dataset.filterPhase
  const scrollY = window.scrollY || window.pageYOffset || 0
  if (
    canUseDocumentCache &&
    !siteState.catalogContentBottomDirty &&
    Number.isFinite(siteState.catalogContentBottomDocument) &&
    Number.isFinite(siteState.catalogContentBottomHeaderHeight)
  ) {
    const headerDelta = siteState.headerVisualBottom - siteState.catalogContentBottomHeaderHeight
    return Math.max(0, siteState.catalogContentBottomDocument + headerDelta - scrollY)
  }

  let bottom = -Infinity
  const nodes = siteState.dom.catalog === catalog
    ? siteState.dom.catalogContentNodes
    : [...catalog.querySelectorAll(".project-media, .project-meta")]
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect()
    if (rect.width > 0.5 && rect.height > 0.5) {
      bottom = Math.max(bottom, rect.bottom)
    }
  })

  if (!Number.isFinite(bottom)) return fallback

  if (canUseDocumentCache) {
    siteState.catalogContentBottomDocument = bottom + scrollY
    siteState.catalogContentBottomHeaderHeight = siteState.headerVisualBottom
    siteState.catalogContentBottomDirty = false
  }
  return bottom
}

function readFooterGalleryLayoutMetrics(gallery) {
  const { galleryTrack: track, galleryFirstSet: firstSet, galleryFirstMeta: firstMeta } = siteState.dom
  const setStyle = firstSet ? window.getComputedStyle(firstSet) : null
  const metaStyle = firstMeta ? window.getComputedStyle(firstMeta) : null
  const trackStyle = track ? window.getComputedStyle(track) : null
  const gap = parseFloat(setStyle?.columnGap || setStyle?.gap || "") || 24
  const trackGap = parseFloat(trackStyle?.columnGap || trackStyle?.gap || "") || 0
  const metaLineHeight =
    parseFloat(metaStyle?.lineHeight || "") ||
    (parseFloat(metaStyle?.fontSize || "") || 14) * 1.25
  const metaPaddingTop = parseFloat(metaStyle?.paddingTop || "") || 12
  const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
  const metaHeight = clamp(
    metaPaddingTop + metaLineHeight * 2 + 6,
    viewportWidth <= 700 ? 48 : 50,
    viewportWidth <= 700 ? 66 : 72,
  )

  siteState.galleryLayoutMetrics = {
    gap,
    trackGap,
    metaHeight,
    tileCount: firstSet?.querySelectorAll(".footer-gallery-tile").length || projects.length,
  }
  siteState.galleryLayoutDirty = false
  return siteState.galleryLayoutMetrics
}

function getFooterGalleryLayoutMetrics(gallery) {
  if (!siteState.galleryLayoutMetrics || siteState.galleryLayoutDirty) {
    return readFooterGalleryLayoutMetrics(gallery)
  }
  return siteState.galleryLayoutMetrics
}

function setFooterGalleryStyles(
  reveal = siteState.galleryReveal,
  shift = siteState.galleryShift,
  pocketHeight = siteState.galleryPocketHeight,
) {
  const { gallery, catalog } = siteState.dom
  if (!gallery) return

  const { gap, trackGap, metaHeight, tileCount } = getFooterGalleryLayoutMetrics(gallery)
  const visibleReveal = clamp(reveal, 0, 1)
  const targetPocket = Math.max(0, pocketHeight || 0)
  const headerBottom = Math.max(0, siteState.headerVisualBottom)
  const pocketBottom = Math.max(0, siteState.galleryPocketBottom || 0)
  if (!Number.isFinite(siteState.galleryViewportLeft)) {
    const galleryRect = gallery.getBoundingClientRect()
    siteState.galleryViewportLeft = galleryRect.left
  }
  const viewportWidth = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  )
  const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  const finalContentBottom = getCatalogContentBottom(catalog, headerBottom)
  const overlapPadding = clamp(viewportHeight * 0.012, 8, 18)
  const overlapSafePocket = Math.max(0, pocketBottom - Math.max(headerBottom, finalContentBottom + overlapPadding))
  const availablePocket = Math.max(0, pocketBottom - headerBottom)
  const visibleCapacity = Math.min(availablePocket, targetPocket, overlapSafePocket)
  const contentHeight = visibleCapacity
  const visiblePocket = visibleReveal > 0.001 ? contentHeight : 0
  const pocketTop = Math.max(headerBottom, pocketBottom - visiblePocket)
  const revealShift = 0
  const mediaHeight = Math.max(0, contentHeight - metaHeight)
  const widthFromPocket = mediaHeight * (viewportWidth <= 700 ? 1.24 : 1.55)
  const minTileCount =
    viewportWidth <= 700
      ? 1.35
      : viewportWidth <= 980
        ? 1.95
        : 2.2
  const maxTileCount =
    viewportWidth <= 700
      ? 2.45
      : viewportWidth <= 980
        ? 3.45
        : 4.55
  const targetTileCount = clamp(
    viewportWidth / Math.max(widthFromPocket + gap, 1),
    minTileCount,
    maxTileCount,
  )
  const rawTileWidth =
    (viewportWidth - gap * Math.max(0, targetTileCount - 1)) / targetTileCount
  const minTileWidth = clamp(
    viewportWidth * (viewportWidth <= 700 ? 0.56 : 0.2),
    viewportWidth <= 700 ? 170 : 240,
    viewportWidth <= 700 ? 300 : 420,
  )
  const maxTileWidth = clamp(
    viewportWidth * (viewportWidth <= 700 ? 0.92 : 0.46),
    viewportWidth <= 700 ? 320 : 360,
    viewportWidth <= 700 ? 620 : 1120,
  )
  const tileWidth = clamp(rawTileWidth, minTileWidth, maxTileWidth)
  const setWidth = tileCount > 0
    ? tileWidth * tileCount + gap * Math.max(0, tileCount - 1)
    : 0
  setElementStyleProperty(gallery, "--gallery-reveal", visibleReveal.toFixed(4))
  setElementStyleProperty(gallery, "--gallery-pocket-height", `${visiblePocket.toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-content-height", `${contentHeight.toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-pocket-top", `${pocketTop.toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-reveal-y", `${revealShift.toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-viewport-left", `${(-siteState.galleryViewportLeft).toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-tile-width", `${tileWidth.toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-set-width", `${setWidth.toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-meta-space", `${metaHeight.toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-opacity", visiblePocket > 1 ? "1" : "0")
  setElementStyleProperty(gallery, "--gallery-enter-x", "0px")
  setElementStyleProperty(gallery, "--gallery-scroll-shift", "0px")
  gallery.dataset.galleryRevealed = visiblePocket > 1 ? "true" : "false"
  setFooterGalleryLoopMetrics(gallery, setWidth, trackGap)
}

function wrapGalleryLoopOffset(offset, distance) {
  if (!Number.isFinite(distance) || distance <= 0) return 0
  return ((offset % distance) + distance) % distance
}

function requestFooterGalleryLoop() {
  if (siteState.galleryLoopFrame) return
  siteState.galleryLoopLastTime = 0
  siteState.galleryLoopFrame = requestAnimationFrame(animateFooterGalleryLoop)
}

function isFooterGalleryMotionReady(gallery) {
  return gallery.dataset.galleryRevealed === "true" && siteState.galleryReveal > 0.98
}

function readFooterGalleryScrollY() {
  const layoutY = window.scrollY || window.pageYOffset || 0
  const visualY = window.visualViewport?.pageTop
  return Number.isFinite(visualY) ? visualY : layoutY
}

function holdFooterGalleryDuringScroll(time = performance.now()) {
  siteState.galleryScrollPauseUntil = Math.max(siteState.galleryScrollPauseUntil, time + 320)
  siteState.galleryHorizontalFrozen = true
}

function isFooterGalleryScrollSettling(time) {
  const scrollY = readFooterGalleryScrollY()
  if (Math.abs(scrollY - siteState.galleryObservedScrollY) > 0.1) {
    siteState.galleryObservedScrollY = scrollY
    holdFooterGalleryDuringScroll(time)
  }

  const settling = time < siteState.galleryScrollPauseUntil
  siteState.galleryHorizontalFrozen = settling
  return settling
}

function clearFooterGalleryAutoscroll() {
  siteState.galleryPointerDirection = 0
  siteState.galleryPointerSpeedRatio = 0
}

function suppressFooterGalleryHoverUntilPointerMove() {
  siteState.galleryHoveredTile = null
  siteState.galleryHoverSuppressed = true
  clearFooterGalleryAutoscroll()
}

function resetFooterGalleryPointer() {
  if (siteState.galleryPointerFrame) cancelAnimationFrame(siteState.galleryPointerFrame)
  siteState.galleryPointerFrame = 0
  siteState.galleryPointerMoved = false
  siteState.galleryPointerX = null
  siteState.galleryPointerY = null
  siteState.galleryHoveredTile = null
  siteState.galleryHoverSuppressed = false
  clearFooterGalleryAutoscroll()
}

function isPointerInsideElement(element) {
  if (!element || !element.isConnected) return false
  const x = siteState.galleryPointerX
  const y = siteState.galleryPointerY
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false

  const rect = element.getBoundingClientRect()
  return (
    rect.width > 1 &&
    rect.height > 1 &&
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  )
}

function findFooterGalleryTileAtPointer() {
  const x = siteState.galleryPointerX
  const y = siteState.galleryPointerY
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null

  const { gallery, galleryViewport: viewport } = siteState.dom
  if (!gallery || !viewport || !isFooterGalleryMotionReady(gallery)) return null

  const viewportRect = viewport.getBoundingClientRect()
  if (
    viewportRect.width <= 1 ||
    viewportRect.height <= 1 ||
    x < viewportRect.left ||
    x > viewportRect.right ||
    y < viewportRect.top ||
    y > viewportRect.bottom
  ) {
    return null
  }

  const elements = document.elementsFromPoint(x, y)
  for (const element of elements) {
    const tile = element.closest?.(".footer-gallery-tile")
    if (tile && gallery.contains(tile)) return tile
  }

  return null
}

function getFooterGalleryHoveredTile({ requirePointerInside = false, allowPointerHitTest = false } = {}) {
  const tile = siteState.galleryHoveredTile
  if (tile?.isConnected) {
    if (!requirePointerInside || isPointerInsideElement(tile)) return tile
    suppressFooterGalleryHoverUntilPointerMove()
    return null
  } else if (tile) {
    siteState.galleryHoveredTile = null
  }

  if (allowPointerHitTest && !siteState.galleryHoverSuppressed) {
    const pointedTile = findFooterGalleryTileAtPointer()
    siteState.galleryHoveredTile = pointedTile
    return pointedTile
  }

  siteState.galleryHoveredTile = null
  return null
}

function setFooterGalleryHoveredTile(event) {
  if (event.pointerType === "touch") return

  const previousX = siteState.galleryPointerX
  const previousY = siteState.galleryPointerY
  const moved =
    !Number.isFinite(previousX) ||
    !Number.isFinite(previousY) ||
    Math.hypot(event.clientX - previousX, event.clientY - previousY) > 0.5
  if (siteState.galleryHoverSuppressed && !moved) return

  siteState.galleryPointerX = event.clientX
  siteState.galleryPointerY = event.clientY
  siteState.galleryHoveredTile = event.currentTarget
  siteState.galleryHoverSuppressed = false
  clearFooterGalleryAutoscroll()
  requestFooterGalleryLoop()
}

function clearFooterGalleryHoveredTile(event) {
  if (event.currentTarget === siteState.galleryHoveredTile) {
    suppressFooterGalleryHoverUntilPointerMove()
  }
  updateFooterGalleryAutoscrollFromPointer()
}

function updateFooterGalleryAutoscrollFromPointer() {
  const { gallery } = siteState.dom
  const pointerX = siteState.galleryPointerX
  if (!gallery || !isFooterGalleryMotionReady(gallery) || !Number.isFinite(pointerX)) {
    clearFooterGalleryAutoscroll()
    return
  }

  if (getFooterGalleryHoveredTile({ requirePointerInside: true })) {
    clearFooterGalleryAutoscroll()
    requestFooterGalleryLoop()
    return
  }

  const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
  if (viewportWidth <= 1) {
    clearFooterGalleryAutoscroll()
    return
  }

  const x = clamp(pointerX, 0, viewportWidth)
  const centerX = viewportWidth / 2
  const distanceFromCenter = Math.abs(x - centerX) / (viewportWidth / 2)
  const edgeProgress = clamp((distanceFromCenter - 0.08) / 0.92, 0, 1)

  if (edgeProgress <= 0) {
    clearFooterGalleryAutoscroll()
    return
  }

  siteState.galleryPointerDirection = x < centerX ? 1 : -1
  siteState.galleryPointerSpeedRatio = 0.16 + Math.pow(edgeProgress, 1.35) * 2.55
  requestFooterGalleryLoop()
}

function processFooterGalleryPointerMove() {
  siteState.galleryPointerFrame = 0
  const moved = siteState.galleryPointerMoved
  siteState.galleryPointerMoved = false
  if (moved) {
    siteState.galleryHoverSuppressed = false
    const pointedTile = findFooterGalleryTileAtPointer()
    if (pointedTile) {
      siteState.galleryHoveredTile = pointedTile
      clearFooterGalleryAutoscroll()
      requestFooterGalleryLoop()
      return
    }
    siteState.galleryHoveredTile = null
  }

  updateFooterGalleryAutoscrollFromPointer()
}

function updateFooterGalleryPointer(event) {
  if (event.pointerType === "touch") return

  const previousX = siteState.galleryPointerX
  const previousY = siteState.galleryPointerY
  siteState.galleryPointerMoved ||= !Number.isFinite(previousX) ||
    !Number.isFinite(previousY) ||
    Math.hypot(event.clientX - previousX, event.clientY - previousY) > 0.5
  siteState.galleryPointerX = event.clientX
  siteState.galleryPointerY = event.clientY

  if (siteState.galleryPointerFrame) return
  siteState.galleryPointerFrame = requestAnimationFrame(processFooterGalleryPointerMove)
}

function centerFooterGalleryTile(gallery, tile, elapsed, distance) {
  const { galleryViewport: viewport } = siteState.dom
  if (!viewport || !tile) return false

  const viewportRect = viewport.getBoundingClientRect()
  const tileRect = tile.getBoundingClientRect()
  if (viewportRect.width <= 1 || tileRect.width <= 1) return false

  const viewportCenter = viewportRect.left + viewportRect.width / 2
  const tileCenter = tileRect.left + tileRect.width / 2
  const delta = tileCenter - viewportCenter
  if (Math.abs(delta) < 0.35) return false

  const followSpeed = 8.5
  const amount = 1 - Math.exp(-followSpeed * elapsed)
  siteState.galleryLoopOffset = wrapGalleryLoopOffset(
    siteState.galleryLoopOffset + delta * amount,
    distance,
  )
  setElementStyleProperty(gallery, "--gallery-loop-offset", `${(-siteState.galleryLoopOffset).toFixed(2)}px`)
  return true
}

function handleFooterGalleryHorizontalWheel(event, time = performance.now()) {
  const { gallery } = siteState.dom
  const hoveredTile = getFooterGalleryHoveredTile({
    requirePointerInside: true,
    allowPointerHitTest: false,
  })
  const distance = siteState.galleryLoopDistance
  if (
    !gallery ||
    !hoveredTile ||
    !isFooterGalleryMotionReady(gallery) ||
    !Number.isFinite(distance) ||
    distance <= 0
  ) {
    return false
  }

  const deltaX = Number.isFinite(event.deltaX) ? event.deltaX : 0
  const deltaY = Number.isFinite(event.deltaY) ? event.deltaY : 0
  const usesShiftWheel = event.shiftKey && Math.abs(deltaY) > Math.abs(deltaX)
  const horizontalDelta = usesShiftWheel ? deltaY : deltaX
  const isHorizontal =
    Math.abs(horizontalDelta) > 0.35 &&
    Math.abs(horizontalDelta) >= Math.abs(deltaY) * 0.55
  if (!isHorizontal) return false

  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerWidth : 1
  const pixelDelta = horizontalDelta * unit
  const settleDuration = clamp(220 + Math.abs(pixelDelta) * 0.35, 260, 680)
  siteState.galleryHorizontalInputUntil = Math.max(
    siteState.galleryHorizontalInputUntil,
    time + settleDuration,
  )
  siteState.galleryCenterPauseUntil = Math.max(
    siteState.galleryCenterPauseUntil,
    siteState.galleryHorizontalInputUntil,
  )
  siteState.galleryLoopOffset = wrapGalleryLoopOffset(
    siteState.galleryLoopOffset + pixelDelta,
    distance,
  )
  gallery.style.setProperty("--gallery-loop-offset", `${(-siteState.galleryLoopOffset).toFixed(2)}px`)
  requestFooterGalleryLoop()
  return true
}

function setFooterGalleryLoopMetrics(gallery, setWidthOverride = 0, trackGapOverride = null) {
  const { galleryTrack: track, galleryFirstSet: firstSet } = siteState.dom
  if (!track || !firstSet) return

  const trackGap = Number.isFinite(trackGapOverride)
    ? trackGapOverride
    : getFooterGalleryLayoutMetrics(gallery).trackGap
  const cssSetWidth = Number.isFinite(setWidthOverride) && setWidthOverride > 0
    ? setWidthOverride
    : parseFloat(window.getComputedStyle(gallery).getPropertyValue("--gallery-set-width"))
  const measuredSetWidth = cssSetWidth > 0 ? cssSetWidth : firstSet.getBoundingClientRect().width
  const setWidth =
    Number.isFinite(cssSetWidth) && cssSetWidth > 0
      ? cssSetWidth
      : measuredSetWidth
  if (!Number.isFinite(setWidth) || setWidth <= 0) return

  const distance = setWidth + trackGap
  const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
  const pxPerSecond = viewportWidth <= 700 ? 38 : viewportWidth <= 1440 ? 48 : 56
  const duration = clamp(distance / pxPerSecond, 42, 120)
  const previousDistance = siteState.galleryLoopDistance

  setElementStyleProperty(gallery, "--gallery-loop-distance", `${distance.toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-loop-x", `${(-distance).toFixed(2)}px`)
  setElementStyleProperty(gallery, "--gallery-loop-duration", `${duration.toFixed(2)}s`)

  if (siteState.galleryHorizontalFrozen) {
    siteState.galleryLoopDistance = distance
    siteState.galleryLoopBaseSpeed = distance / duration
    setElementStyleProperty(gallery, "--gallery-loop-offset", `${(-siteState.galleryLoopOffset).toFixed(2)}px`)
    return
  }

  if (previousDistance > 0 && Math.abs(previousDistance - distance) > 0.5) {
    siteState.galleryLoopOffset = wrapGalleryLoopOffset(
      (siteState.galleryLoopOffset / previousDistance) * distance,
      distance,
    )
  }

  siteState.galleryLoopDistance = distance
  siteState.galleryLoopBaseSpeed = distance / duration
  siteState.galleryLoopOffset = wrapGalleryLoopOffset(siteState.galleryLoopOffset, distance)

  setElementStyleProperty(gallery, "--gallery-loop-offset", `${(-siteState.galleryLoopOffset).toFixed(2)}px`)

  const distanceChanged = previousDistance <= 0 || Math.abs(previousDistance - distance) > 0.5
  if (distanceChanged) updateFooterGalleryAutoscrollFromPointer()

  if (distanceChanged || !siteState.galleryLoopFrame) {
    const canRunHorizontally =
      isFooterGalleryMotionReady(gallery) &&
      (getFooterGalleryHoveredTile() ||
        (siteState.galleryPointerDirection !== 0 &&
          siteState.galleryPointerSpeedRatio > 0))

    if (canRunHorizontally) {
      requestFooterGalleryLoop()
    }
  }
}

function animateFooterGalleryLoop(time) {
  const { gallery } = siteState.dom
  if (!gallery) {
    siteState.galleryLoopFrame = 0
    siteState.galleryLoopLastTime = 0
    return
  }

  const reducedMotion = prefersReducedMotion()
  if (reducedMotion) {
    siteState.galleryLoopBoost = 0
    siteState.galleryLoopOffset = 0
    setElementStyleProperty(gallery, "--gallery-loop-offset", "0px")
    siteState.galleryLoopFrame = 0
    siteState.galleryLoopLastTime = 0
    return
  }

  const distance = siteState.galleryLoopDistance
  const active = isFooterGalleryMotionReady(gallery)
  const direction = siteState.galleryPointerDirection
  const speedRatio = clamp(siteState.galleryPointerSpeedRatio || 0, 0, 2.8)
  const elapsed = siteState.galleryLoopLastTime
    ? Math.min(0.05, (time - siteState.galleryLoopLastTime) / 1000)
    : 1 / 60
  siteState.galleryLoopLastTime = time
  const settling = isFooterGalleryScrollSettling(time)
  const horizontalSettling = time < siteState.galleryHorizontalInputUntil
  const hoveredTile = getFooterGalleryHoveredTile({ requirePointerInside: true })
  if (hoveredTile && siteState.galleryCenterPauseUntil > 0 && time >= siteState.galleryCenterPauseUntil) {
    siteState.galleryCenterPauseUntil = 0
  }
  if (!horizontalSettling && siteState.galleryHorizontalInputUntil > 0) {
    siteState.galleryHorizontalInputUntil = 0
  }
  const centerPaused = !!hoveredTile && (settling || horizontalSettling || time < siteState.galleryCenterPauseUntil)
  const canCenter = !!hoveredTile && !centerPaused
  const canAutoscroll = !hoveredTile && !horizontalSettling && direction !== 0 && speedRatio > 0

  if (
    !Number.isFinite(distance) ||
    distance <= 0 ||
    !active ||
    (!canCenter && !canAutoscroll && !centerPaused && !horizontalSettling)
  ) {
    siteState.galleryLoopFrame = 0
    siteState.galleryLoopLastTime = 0
    return
  }

  if (!settling && !horizontalSettling) {
    if (canCenter) {
      centerFooterGalleryTile(gallery, hoveredTile, elapsed, distance)
    } else if (canAutoscroll) {
      const speed = Math.max(0, siteState.galleryLoopBaseSpeed) * speedRatio
      siteState.galleryLoopOffset = wrapGalleryLoopOffset(
        siteState.galleryLoopOffset + direction * speed * elapsed,
        distance,
      )
      setElementStyleProperty(gallery, "--gallery-loop-offset", `${(-siteState.galleryLoopOffset).toFixed(2)}px`)
    }
  }

  siteState.galleryLoopFrame = requestAnimationFrame(animateFooterGalleryLoop)
}

function applyFooterComposition() {
  const { about } = siteState.dom
  if (about) {
    const pull = Math.max(0, siteState.aboutPull || 0)
    setElementStyleProperty(about, "--about-pull-y", `${pull.toFixed(2)}px`)
    setElementStyleProperty(about, "--about-card-offset-y", `${Math.max(0, siteState.aboutCardOffset || 0).toFixed(2)}px`)
    setElementStyleProperty(about, "--resume-card-offset-y", `${Math.max(0, siteState.resumeCardOffset || 0).toFixed(2)}px`)
  }
  setFooterGalleryStyles(siteState.galleryReveal, siteState.galleryShift, siteState.galleryPocketHeight)
}

function setFooterCompositionTargets(
  reveal,
  pocketBottom,
  pocketHeight,
  aboutPull,
  aboutCardOffset,
  resumeCardOffset,
  immediate = false,
) {
  siteState.galleryTargetReveal = clamp(reveal, 0, 1)
  siteState.galleryTargetPocketBottom = Math.max(0, pocketBottom)
  siteState.galleryTargetPocketHeight = Math.max(0, pocketHeight)
  siteState.aboutTargetPull = Math.max(0, aboutPull)
  siteState.aboutCardTargetOffset = Math.max(0, aboutCardOffset)
  siteState.resumeCardTargetOffset = Math.max(0, resumeCardOffset)

  if (immediate) {
    if (siteState.galleryFrame) cancelAnimationFrame(siteState.galleryFrame)
    siteState.galleryFrame = 0
    siteState.galleryLastFrameTime = 0
    siteState.galleryReveal = siteState.galleryTargetReveal
    siteState.galleryPocketBottom = siteState.galleryTargetPocketBottom
    siteState.galleryPocketHeight = siteState.galleryTargetPocketHeight
    siteState.aboutPull = siteState.aboutTargetPull
    siteState.aboutCardOffset = siteState.aboutCardTargetOffset
    siteState.resumeCardOffset = siteState.resumeCardTargetOffset
    applyFooterComposition()
    return
  }

  if (!siteState.galleryFrame) {
    siteState.galleryFrame = requestAnimationFrame(animateFooterGallery)
  }
}

function updateFooterGalleryReveal(options = {}) {
  if (!siteState.hasFooterGallery) return 0

  const { header, catalog, gallery, galleryViewport: viewport, about } = siteState.dom
  if (!header || !catalog || !gallery || !viewport || !about) return 0

  const aboutRect = about.getBoundingClientRect()
  const headerBottom =
    siteState.headerVisualBottom > 0
      ? siteState.headerVisualBottom
      : header.getBoundingClientRect().bottom
  const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
  const finalContentBottom = getCatalogContentBottom(catalog, headerBottom)
  const naturalAboutTop = aboutRect.top + (siteState.aboutPull || 0)
  const targetPocketHeight = clamp(
    viewportHeight * (viewportWidth <= 700 ? 0.5 : 0.52),
    viewportWidth <= 700 ? 300 : 380,
    viewportWidth <= 700 ? 580 : 980,
  )
  const pullStartTop = viewportHeight + clamp(viewportHeight * 0.1, 96, 240)
  const pullEndTop = Math.min(
    headerBottom + targetPocketHeight,
    viewportHeight - clamp(viewportHeight * 0.1, 80, 180),
  )
  const pullRange = Math.max(1, pullStartTop - pullEndTop)
  const naturalPullProgress = clamp((pullStartTop - naturalAboutTop) / pullRange, 0, 1)
  const pullProgress = easeOutCubic(naturalPullProgress)
  const desiredAboutTop = pullStartTop + (pullEndTop - pullStartTop) * pullProgress
  const maxAboutPull = Math.max(0, naturalAboutTop - headerBottom - 1)
  const aboutPull =
    pullProgress > 0.001 ? clamp(naturalAboutTop - desiredAboutTop, 0, maxAboutPull) : 0
  const aboutTop = naturalAboutTop - aboutPull
  const remainingLayerTravel = 1 - pullProgress
  const aboutCardOffset = pullProgress > 0.001
    ? clamp(viewportHeight * 0.14, 84, 150) * Math.pow(remainingLayerTravel, 0.72)
    : 0
  const resumeCardOffset = pullProgress > 0.001
    ? clamp(viewportHeight * 0.27, 150, 280) * Math.pow(remainingLayerTravel, 2.25)
    : 0
  const visualAboutTop = aboutTop + aboutCardOffset
  const rawPocketHeight = Math.max(0, visualAboutTop - headerBottom)
  const aboutRuleVisible = visualAboutTop <= window.innerHeight + 1 && visualAboutTop > headerBottom
  const viewportPocketHeight = aboutRuleVisible
    ? Math.min(rawPocketHeight, Math.max(0, window.innerHeight - headerBottom))
    : 0
  const minPocketGap = clamp(window.innerHeight * 0.06, 36, 88)
  const clearBuffer = clamp(viewportHeight * 0.012, 8, 18)
  const clearDistance = clamp(window.innerHeight * 0.08, 58, 140)
  const pocketDistance = clamp(window.innerHeight * 0.18, 140, 300)

  const contentCleared = clamp((headerBottom - clearBuffer - finalContentBottom) / clearDistance, 0, 1)
  const pocketFormed = aboutRuleVisible
    ? clamp((viewportPocketHeight - minPocketGap) / pocketDistance, 0, 1)
    : 0
  const clearanceProgress = easeOutCubic(contentCleared)
  const reveal = easeOutCubic(Math.min(clearanceProgress, pocketFormed))
  const overlapPadding = clearBuffer
  const blockedTop = Math.max(headerBottom, Math.min(visualAboutTop, finalContentBottom + overlapPadding))
  const galleryTopTarget = clamp(
    blockedTop + (headerBottom - blockedTop) * clearanceProgress,
    headerBottom,
    visualAboutTop,
  )
  const availableGalleryHeight = Math.max(0, visualAboutTop - galleryTopTarget)

  if (reveal <= 0.001 || availableGalleryHeight <= 1) {
    siteState.galleryShift = Math.max(siteState.galleryShift, 0)
  }
  const galleryTargetHeight = aboutRuleVisible ? targetPocketHeight : 0
  siteState.galleryLoopBoost = 0
  setFooterCompositionTargets(
    reveal,
    visualAboutTop,
    galleryTargetHeight,
    aboutPull,
    aboutCardOffset,
    resumeCardOffset,
    options.immediate === true,
  )
  return reveal
}

function animateFooterGallery(time) {
  const elapsed = siteState.galleryLastFrameTime
    ? Math.min(0.05, (time - siteState.galleryLastFrameTime) / 1000)
    : 1 / 60
  siteState.galleryLastFrameTime = time

  const followSpeed = 7.5
  const amount = 1 - Math.exp(-followSpeed * elapsed)
  siteState.galleryReveal += (siteState.galleryTargetReveal - siteState.galleryReveal) * amount
  siteState.galleryPocketBottom +=
    (siteState.galleryTargetPocketBottom - siteState.galleryPocketBottom) * amount
  siteState.galleryPocketHeight +=
    (siteState.galleryTargetPocketHeight - siteState.galleryPocketHeight) * amount
  siteState.aboutPull += (siteState.aboutTargetPull - siteState.aboutPull) * amount
  siteState.aboutCardOffset +=
    (siteState.aboutCardTargetOffset - siteState.aboutCardOffset) * amount
  siteState.resumeCardOffset +=
    (siteState.resumeCardTargetOffset - siteState.resumeCardOffset) * amount

  const returnSpeed = 16
  siteState.galleryShift *= Math.exp(-returnSpeed * elapsed)

  const isSettled =
    Math.abs(siteState.galleryTargetReveal - siteState.galleryReveal) < 0.001 &&
    Math.abs(siteState.galleryTargetPocketBottom - siteState.galleryPocketBottom) < 0.2 &&
    Math.abs(siteState.galleryTargetPocketHeight - siteState.galleryPocketHeight) < 0.2 &&
    Math.abs(siteState.aboutTargetPull - siteState.aboutPull) < 0.2 &&
    Math.abs(siteState.aboutCardTargetOffset - siteState.aboutCardOffset) < 0.2 &&
    Math.abs(siteState.resumeCardTargetOffset - siteState.resumeCardOffset) < 0.2 &&
    Math.abs(siteState.galleryShift) < 0.2

  if (isSettled) {
    siteState.galleryReveal = siteState.galleryTargetReveal
    siteState.galleryPocketBottom = siteState.galleryTargetPocketBottom
    siteState.galleryPocketHeight = siteState.galleryTargetPocketHeight
    siteState.aboutPull = siteState.aboutTargetPull
    siteState.aboutCardOffset = siteState.aboutCardTargetOffset
    siteState.resumeCardOffset = siteState.resumeCardTargetOffset
    siteState.galleryShift = 0
    siteState.galleryFrame = 0
    siteState.galleryLastFrameTime = 0
    applyFooterComposition()
    return
  }

  applyFooterComposition()
  siteState.galleryFrame = requestAnimationFrame(animateFooterGallery)
}

function nudgeFooterGallery() {
  if (!siteState.hasFooterGallery) return

  const { gallery } = siteState.dom
  if (!gallery) return

  siteState.galleryObservedScrollY = readFooterGalleryScrollY()
  holdFooterGalleryDuringScroll()
  siteState.galleryLoopBoost = 0
  updateFooterGalleryAutoscrollFromPointer()
  requestLayoutEffectsUpdate({ footer: true })

  if (
    isFooterGalleryMotionReady(gallery) &&
    (getFooterGalleryHoveredTile() ||
      (siteState.galleryPointerDirection !== 0 &&
        siteState.galleryPointerSpeedRatio > 0))
  ) {
    requestFooterGalleryLoop()
  }

  siteState.galleryShift = 0
}

function setupFooterGallery() {
  if (siteState.galleryFrame) cancelAnimationFrame(siteState.galleryFrame)
  if (siteState.galleryLoopFrame) cancelAnimationFrame(siteState.galleryLoopFrame)
  if (siteState.galleryPointerFrame) cancelAnimationFrame(siteState.galleryPointerFrame)
  siteState.galleryFrame = 0
  siteState.galleryPointerFrame = 0
  siteState.galleryPointerMoved = false
  siteState.galleryLastFrameTime = 0
  siteState.galleryLastScrollTime = 0
  siteState.galleryLoopFrame = 0
  siteState.galleryLoopLastTime = 0
  siteState.galleryLoopDistance = 0
  siteState.galleryLoopOffset = 0
  siteState.galleryLoopBaseSpeed = 0
  siteState.galleryLoopBoost = 0
  siteState.galleryHorizontalFrozen = false
  siteState.galleryPointerX = null
  siteState.galleryPointerY = null
  siteState.galleryPointerDirection = 0
  siteState.galleryPointerSpeedRatio = 0
  siteState.galleryHoveredTile = null
  siteState.galleryHoverSuppressed = false
  siteState.galleryCenterPauseUntil = 0
  siteState.galleryHorizontalInputUntil = 0
  siteState.galleryScrollPauseUntil = 0
  siteState.galleryObservedScrollY = readFooterGalleryScrollY()
  siteState.galleryReveal = 0
  siteState.galleryTargetReveal = 0
  siteState.galleryShift = 0
  siteState.galleryPocketHeight = 0
  siteState.galleryTargetPocketHeight = 0
  siteState.galleryPocketBottom = 0
  siteState.galleryTargetPocketBottom = 0
  siteState.aboutPull = 0
  siteState.aboutTargetPull = 0
  siteState.aboutCardOffset = 0
  siteState.aboutCardTargetOffset = 0
  siteState.resumeCardOffset = 0
  siteState.resumeCardTargetOffset = 0
  updateFooterGalleryReveal({ immediate: true })

  const { gallery, galleryTiles } = siteState.dom
  if (!siteState.galleryPointerInitialized) {
    siteState.galleryPointerInitialized = true
    window.addEventListener("pointermove", updateFooterGalleryPointer, { passive: true })
    window.addEventListener("pointerleave", resetFooterGalleryPointer, { passive: true })
    window.addEventListener("pointercancel", resetFooterGalleryPointer, { passive: true })
    window.addEventListener("blur", resetFooterGalleryPointer)
    document.addEventListener(
      "pointerout",
      (event) => {
        if (!event.relatedTarget) resetFooterGalleryPointer()
      },
      { passive: true },
    )
  }

  galleryTiles.forEach((tile) => {
    tile.addEventListener("pointerenter", setFooterGalleryHoveredTile, { passive: true })
    tile.addEventListener("pointerleave", clearFooterGalleryHoveredTile, { passive: true })
    tile.addEventListener("pointercancel", clearFooterGalleryHoveredTile, { passive: true })
  })

  if (gallery) {
    updateFooterGalleryAutoscrollFromPointer()
  }
}

function resetCatalogFilterState() {
  window.clearTimeout(siteState.catalogFilterTimer)
  window.clearTimeout(siteState.catalogFilterEnterTimer)
  if (siteState.catalogHalftoneFrame) cancelAnimationFrame(siteState.catalogHalftoneFrame)
  if (siteState.catalogHalftoneVisibleFrame) cancelAnimationFrame(siteState.catalogHalftoneVisibleFrame)
  siteState.catalogFilterTimer = 0
  siteState.catalogFilterEnterTimer = 0
  siteState.catalogHalftoneFrame = 0
  siteState.catalogHalftoneVisibleFrame = 0
  siteState.halftoneRenderQueue = []
  siteState.halftoneRenderQueued.clear()
  if (siteState.halftoneRenderFrame) cancelAnimationFrame(siteState.halftoneRenderFrame)
  siteState.halftoneRenderFrame = 0
  siteState.catalogHalftoneProgress = 1
  siteState.catalogFilterTarget = null
  siteState.catalogFilterCurrent = null
  siteState.catalogFilterLocked = null
  siteState.catalogFilterPhase = "idle"
  siteState.catalogFilterCycle += 1
  clearCatalogSnowTiming(document.querySelector(".catalog"))
}

function catalogFilterDuration(duration) {
  return prefersReducedMotion() ? 1 : duration
}

function catalogActiveColorConfig() {
  const fallbackConfig = {
    activeColorEnabled:
      document.documentElement.getAttribute("data-red-active-color-snow") !== "false",
    activeColorDurationMs: 660,
    activeColorExitDurationMs: 350,
    activeColorDelayMs: 10,
    activeColorStaggerMs: 26,
    activeColorSettleMs: 110,
  }

  return (
    window.__RED_ACTIVE_COLOR_SNOW__?.getConfig?.() ||
    window.__RED_ACTIVE_COLOR_CONFIG__ ||
    fallbackConfig
  )
}

function readCatalogSnowDuration(catalog, key) {
  const value = Number(catalog?.dataset?.[key])
  return Number.isFinite(value) && value > 0 ? value : null
}

function clearCatalogSnowTiming(catalog) {
  if (!catalog) return
  delete catalog.dataset.colorSnowExitDurationMs
  delete catalog.dataset.colorSnowEnterDurationMs
  delete catalog.dataset.colorSnowEnterDeferMs
}

function planCatalogExitSnowTiming(catalog) {
  if (!catalog || prefersReducedMotion()) {
    clearCatalogSnowTiming(catalog)
    return
  }

  const config = catalogActiveColorConfig()
  if (!config?.activeColorEnabled) {
    clearCatalogSnowTiming(catalog)
    return
  }

  const base = Math.max(1, Number(config.activeColorExitDurationMs) || 350)
  catalog.dataset.colorSnowExitDurationMs = String(Math.round(
    base + catalogFilterDuration(CATALOG_COLOR_SNOW_EXIT_COVER_MS),
  ))
  delete catalog.dataset.colorSnowEnterDurationMs
  delete catalog.dataset.colorSnowEnterDeferMs
}

function planCatalogEnterSnowTiming(catalog, commitCostMs = 0) {
  if (!catalog || prefersReducedMotion()) {
    clearCatalogSnowTiming(catalog)
    return
  }

  const config = catalogActiveColorConfig()
  if (!config?.activeColorEnabled) {
    clearCatalogSnowTiming(catalog)
    return
  }

  const rebuildCover = Math.min(220, Math.max(0, commitCostMs) * 5)
  const cardCover = Math.min(180, Math.max(0, catalog.querySelectorAll(".project-card").length - 1) * 6)
  const base =
    Math.max(1, Number(config.activeColorDurationMs) || 660) +
    Math.max(0, Number(config.activeColorSettleMs) || 0)

  catalog.dataset.colorSnowEnterDurationMs = String(Math.round(
    base +
      catalogFilterDuration(CATALOG_COLOR_SNOW_ENTER_COVER_MS) +
      rebuildCover +
      cardCover,
  ))
  catalog.dataset.colorSnowEnterDeferMs = String(Math.round(
    catalogFilterDuration(CATALOG_COLOR_SNOW_ENTER_DEFER_MS) +
      Math.min(120, Math.max(0, commitCostMs) * 2),
  ))
  delete catalog.dataset.colorSnowExitDurationMs
}

function catalogFineSignalSnowDuration(catalog, direction) {
  const fallbackConfig = {
    activeColorExitDurationMs: 350,
    activeColorDelayMs: 10,
    activeColorStaggerMs: 26,
  }
  const config = catalogActiveColorConfig()
  if (!catalog || !config?.activeColorEnabled || prefersReducedMotion()) return 0

  const cards = [...catalog.querySelectorAll(".project-card")]
  if (!cards.length) return 0

  const override = readCatalogSnowDuration(
    catalog,
    direction === "out"
      ? "colorSnowExitDurationMs"
      : "colorSnowEnterDurationMs",
  )
  const baseDuration =
    override ??
    (
      direction === "out"
        ? Number(config.activeColorExitDurationMs)
        : Number(config.activeColorDurationMs) + Number(config.activeColorSettleMs || 0)
    )
  const startDelay = Number(config.activeColorDelayMs) || 0
  const stagger = Number(config.activeColorStaggerMs) || 0
  const finalDelay = Math.max(0, cards.length - 1) * Math.max(0, stagger)
  const total = Math.max(0, baseDuration || 0) + startDelay + finalDelay
  const fallbackTotal =
    Math.max(0, fallbackConfig.activeColorExitDurationMs) +
    fallbackConfig.activeColorDelayMs +
    Math.max(0, cards.length - 1) * fallbackConfig.activeColorStaggerMs
  return catalogFilterDuration(Math.max(total, fallbackTotal))
}

function setCatalogCardTimingVars(catalog, property, step = CATALOG_FILTER_STAGGER_MS, maxDelay = 196) {
  const cards = [...catalog.querySelectorAll(".project-card")]
  cards.forEach((card, index) => {
    card.style.setProperty(property, `${Math.min(index * step, maxDelay)}ms`)
  })

  return cards.length ? Math.min((cards.length - 1) * step, maxDelay) : 0
}

function clearCatalogCardTimingVars(catalog) {
  catalog.querySelectorAll(".project-card").forEach((card) => {
    card.style.removeProperty("--project-filter-exit-delay")
    card.style.removeProperty("--project-filter-enter-delay")
  })
}

function updateCatalogFilterDataset(catalog, category) {
  if (category) {
    catalog.dataset.activeFilter = category
  } else {
    delete catalog.dataset.activeFilter
  }
}

function refreshCatalogAfterFilter(catalog) {
  setupHoverEmbeds()
  setupFilteredCatalogRestore(catalog)
  updateVisibleCatalogHalftoneCards(catalog)
  invalidateCatalogContentBottom()
  requestLayoutEffectsUpdate({ rules: true, footer: true })
  if (catalog) {
    const firstRow = catalog.querySelector(".project-row")
    firstRow?.style.setProperty("--project-rule-weight", "1")
  }
}

function stopCatalogHalftoneAnimation() {
  if (siteState.catalogHalftoneFrame) cancelAnimationFrame(siteState.catalogHalftoneFrame)
  siteState.catalogHalftoneFrame = 0
}

function stopCatalogHalftoneVisibleUpdate() {
  if (siteState.catalogHalftoneVisibleFrame) cancelAnimationFrame(siteState.catalogHalftoneVisibleFrame)
  siteState.catalogHalftoneVisibleFrame = 0
}

function scheduleCatalogHalftoneRender(card) {
  if (!card || siteState.halftoneRenderQueued.has(card)) return
  siteState.halftoneRenderQueued.add(card)
  siteState.halftoneRenderQueue.push(card)
  if (siteState.halftoneRenderFrame) return
  siteState.halftoneRenderFrame = requestAnimationFrame(processCatalogHalftoneRenderQueue)
}

function processCatalogHalftoneRenderQueue() {
  siteState.halftoneRenderFrame = 0
  const start = performance.now()
  const colors = readCatalogHalftoneColors()
  let processed = 0

  while (siteState.halftoneRenderQueue.length) {
    if (processed > 0 && performance.now() - start >= HALFTONE_RENDER_FRAME_BUDGET_MS) break
    const card = siteState.halftoneRenderQueue.shift()
    siteState.halftoneRenderQueued.delete(card)
    processed += 1

    if (!card?.isConnected || !card.classList.contains("is-filter-muted")) continue
    if (
      siteState.halftoneObserver &&
      siteState.halftoneObserverReady &&
      !siteState.halftoneNearCards.has(card)
    ) {
      continue
    }
    drawProjectHalftone(card, siteState.catalogHalftoneProgress, colors)
  }

  if (siteState.halftoneRenderQueue.length) {
    siteState.halftoneRenderFrame = requestAnimationFrame(processCatalogHalftoneRenderQueue)
  }
}

function readCatalogHalftoneColors() {
  const root = document.documentElement
  const style = window.getComputedStyle(root)
  const paperColor = style.getPropertyValue("--paper").trim() || "#f8f7f5"
  const inkColor = style.getPropertyValue("--ink").trim() || "rgb(69, 69, 69)"
  const key = `${paperColor}|${inkColor}`
  if (siteState.halftoneColors && siteState.halftoneColorsKey === key) {
    return siteState.halftoneColors
  }

  siteState.halftoneColorsKey = key
  siteState.halftoneColors = { paperColor, inkColor }
  return siteState.halftoneColors
}

function disconnectCatalogHalftoneObservers() {
  siteState.halftoneObserver?.disconnect()
  siteState.halftoneResizeObserver?.disconnect()
  siteState.halftoneObserver = null
  siteState.halftoneResizeObserver = null
  siteState.halftoneObserverReady = false
  siteState.halftoneNearCards.clear()
}

function setupCatalogHalftoneObservers(catalog = siteState.dom.catalog) {
  if (!catalog) return

  const mutedCards = siteState.dom.catalog === catalog
    ? siteState.dom.mutedCards
    : [...catalog.querySelectorAll(".project-card.is-filter-muted")]
  if (!mutedCards.length) {
    siteState.halftoneObserverReady = true
    return
  }

  if ("IntersectionObserver" in window) {
    siteState.halftoneObserver = new IntersectionObserver(
      (entries) => {
        siteState.halftoneObserverReady = true
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            siteState.halftoneNearCards.add(entry.target)
          } else {
            siteState.halftoneNearCards.delete(entry.target)
          }
        })
        requestVisibleCatalogHalftones()
      },
      { root: null, rootMargin: `${HALFTONE_RENDER_MARGIN}px 0px`, threshold: 0 },
    )
  }

  if ("ResizeObserver" in window) {
    siteState.halftoneResizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const media = entry.target
        const card = media.closest(".project-card")
        if (!card) return

        const cssWidth = Math.max(1, Math.round(entry.contentRect.width))
        const cssHeight = Math.max(1, Math.round(entry.contentRect.height))
        const previous = card.__projectHalftoneGeometry
        if (previous?.cssWidth === cssWidth && previous?.cssHeight === cssHeight) return

        card.__projectHalftoneGeometry = { cssWidth, cssHeight }
        card.__projectHalftoneRenderKey = null
        const image = card.querySelector(".project-media img")
        if (image) image.__projectHalftoneSourceDescriptor = null
        if (card.closest(".catalog")?.dataset.activeFilter) {
          requestVisibleCatalogHalftones()
        }
      })
    })
  }

  mutedCards.forEach((card) => {
    siteState.halftoneObserver?.observe(card)
    const media = card.querySelector(".project-media")
    if (media) siteState.halftoneResizeObserver?.observe(media)
  })

  if (!siteState.halftoneObserver) {
    siteState.halftoneObserverReady = true
  }
}

function invalidateCatalogHalftoneGeometry(catalog = siteState.dom.catalog) {
  if (!catalog) return
  const cards = siteState.dom.catalog === catalog
    ? siteState.dom.mutedCards
    : [...catalog.querySelectorAll(".project-card.is-filter-muted")]
  cards.forEach((card) => {
    card.__projectHalftoneGeometry = null
    card.__projectHalftoneRenderKey = null
    const image = card.querySelector(".project-media img")
    if (image) image.__projectHalftoneSourceDescriptor = null
  })
}

function isNearViewport(element, margin = HALFTONE_RENDER_MARGIN) {
  if (!element || !element.isConnected) return false

  const rect = element.getBoundingClientRect()
  const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
  return (
    rect.bottom >= -margin &&
    rect.top <= viewportHeight + margin &&
    rect.right >= -margin &&
    rect.left <= viewportWidth + margin
  )
}

function updateVisibleCatalogHalftoneCards(catalog = siteState.dom.catalog) {
  if (!catalog || !catalog.dataset.activeFilter) {
    siteState.visibleHalftoneCards = []
    return siteState.visibleHalftoneCards
  }

  const cards = siteState.dom.catalog === catalog
    ? siteState.dom.mutedCards
    : [...catalog.querySelectorAll(".project-card.is-filter-muted")]

  if (siteState.dom.catalog === catalog && siteState.halftoneObserver && siteState.halftoneObserverReady) {
    siteState.visibleHalftoneCards = [...siteState.halftoneNearCards].filter(
      (card) => card.isConnected && card.closest(".catalog") === catalog && card.classList.contains("is-filter-muted"),
    )
  } else {
    siteState.visibleHalftoneCards = cards.filter((card) => isNearViewport(card))
  }
  return siteState.visibleHalftoneCards
}

function parseObjectPositionRatio(value) {
  const parts = String(value || "50% 50%").trim().split(/\s+/).filter(Boolean)
  let x = 0.5
  let y = 0.5

  const assign = (part, axis) => {
    const token = part.toLowerCase()
    if (token === "left") {
      x = 0
      return
    }
    if (token === "right") {
      x = 1
      return
    }
    if (token === "top") {
      y = 0
      return
    }
    if (token === "bottom") {
      y = 1
      return
    }
    if (token === "center") {
      if (axis === "y") y = 0.5
      else x = 0.5
      return
    }
    if (token.endsWith("%")) {
      const ratio = clamp(parseFloat(token) / 100, 0, 1)
      if (Number.isFinite(ratio)) {
        if (axis === "y") y = ratio
        else x = ratio
      }
    }
  }

  if (parts.length === 1) {
    assign(parts[0], "x")
    return { x, y }
  }

  const firstIsVertical = parts[0] === "top" || parts[0] === "bottom"
  assign(parts[0], firstIsVertical ? "y" : "x")
  assign(parts[1], firstIsVertical ? "x" : "y")
  return { x, y }
}

function getHalftoneImageRect(img, cssWidth, cssHeight, styleOverride = null) {
  if (!img.naturalWidth || !img.naturalHeight) return null

  const computed = styleOverride || window.getComputedStyle(img)
  const fit = computed.objectFit || "fill"
  const imageWidth = img.naturalWidth
  const imageHeight = img.naturalHeight
  let width = cssWidth
  let height = cssHeight

  if (fit === "cover" || fit === "contain" || fit === "scale-down") {
    const coverScale = Math.max(cssWidth / imageWidth, cssHeight / imageHeight)
    const containScale = Math.min(cssWidth / imageWidth, cssHeight / imageHeight)
    const scale =
      fit === "cover"
        ? coverScale
        : fit === "scale-down"
          ? Math.min(1, containScale)
          : containScale
    width = imageWidth * scale
    height = imageHeight * scale
  } else if (fit === "none") {
    width = imageWidth
    height = imageHeight
  }

  const position = parseObjectPositionRatio(computed.objectPosition)
  return {
    x: (cssWidth - width) * position.x,
    y: (cssHeight - height) * position.y,
    width,
    height,
  }
}

function ensureProjectHalftoneSource(img, cssWidth, cssHeight, paperColor) {
  const cols = HALFTONE_LOGICAL_COLUMNS
  const rows = Math.max(1, Math.round(cols * cssHeight / Math.max(1, cssWidth)))
  const descriptorBase = [
    img.currentSrc || img.src || img.getAttribute("src") || "",
    img.naturalWidth,
    img.naturalHeight,
    cols,
    rows,
    paperColor,
  ].join("|")
  let descriptor = img.__projectHalftoneSourceDescriptor
  if (descriptor?.base !== descriptorBase) {
    const computed = window.getComputedStyle(img)
    descriptor = {
      base: descriptorBase,
      objectFit: computed.objectFit,
      objectPosition: computed.objectPosition,
    }
    descriptor.key = [
      descriptorBase,
      descriptor.objectFit,
      descriptor.objectPosition,
    ].join("|")
    img.__projectHalftoneSourceDescriptor = descriptor
  }

  const sampleKey = descriptor.key

  const cached = siteState.halftoneSourceCache.get(sampleKey)
  if (cached) {
    return cached
  }

  const imageRect = getHalftoneImageRect(img, cols, rows, descriptor)
  if (!imageRect) return null

  const sampleCanvas = document.createElement("canvas")
  sampleCanvas.width = cols
  sampleCanvas.height = rows
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true })
  if (!sampleContext) return null

  sampleContext.fillStyle = paperColor
  sampleContext.fillRect(0, 0, cols, rows)

  try {
    sampleContext.drawImage(
      img,
      imageRect.x,
      imageRect.y,
      imageRect.width,
      imageRect.height,
    )

    const data = sampleContext.getImageData(0, 0, cols, rows).data
    const dots = new Float32Array(cols * rows * 3)
    let dotCount = 0
    for (let index = 0; index < cols * rows; index += 1) {
      const sourceIndex = index * 4
      const red = data[sourceIndex]
      const green = data[sourceIndex + 1]
      const blue = data[sourceIndex + 2]
      const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255
      const ink = clamp((1 - luminance) * 1.18 - 0.025, 0, 1)
      const radius = Math.sqrt(ink) * 0.54
      if (radius < 0.08) continue

      const col = index % cols
      const row = Math.floor(index / cols)
      dots[dotCount] = col + 0.5
      dots[dotCount + 1] = row + 0.5
      dots[dotCount + 2] = radius
      dotCount += 3
    }

    const sample = {
      key: sampleKey,
      cols,
      rows,
      dots: dots.subarray(0, dotCount),
    }

    siteState.halftoneSourceCache.set(sampleKey, sample)
    while (siteState.halftoneSourceCache.size > HALFTONE_SOURCE_CACHE_LIMIT) {
      const oldestKey = siteState.halftoneSourceCache.keys().next().value
      siteState.halftoneSourceCache.delete(oldestKey)
    }
    return sample
  } catch (error) {
    return null
  }
}

function getProjectHalftoneGeometry(card, media) {
  const cached = card.__projectHalftoneGeometry
  let cssWidth = cached?.cssWidth
  let cssHeight = cached?.cssHeight

  if (!cssWidth || !cssHeight) {
    const rect = media.getBoundingClientRect()
    cssWidth = Math.max(1, Math.round(rect.width))
    cssHeight = Math.max(1, Math.round(rect.height))
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const targetWidth = Math.max(1, Math.round(cssWidth * pixelRatio))
  const targetHeight = Math.max(1, Math.round(cssHeight * pixelRatio))
  const sizeKey = `${cssWidth}x${cssHeight}|${pixelRatio}`
  if (cached?.sizeKey === sizeKey) return cached

  const geometry = {
    cssWidth,
    cssHeight,
    pixelRatio,
    targetWidth,
    targetHeight,
    sizeKey,
  }
  card.__projectHalftoneGeometry = geometry
  return geometry
}

function bindHalftoneImageLoad(img) {
  if (img.__projectHalftoneLoadBound) return
  img.__projectHalftoneLoadBound = true
  img.addEventListener(
    "load",
    () => {
      img.__projectHalftoneLoadBound = false
      const catalog = img.closest(".catalog")
      if (catalog) invalidateCatalogContentBottom()
      if (catalog?.dataset.activeFilter) {
        requestVisibleCatalogHalftones()
        requestLayoutEffectsUpdate({ footer: true, rules: true })
      }
    },
    { once: true },
  )
}

function drawProjectHalftone(card, progress, colors = readCatalogHalftoneColors()) {
  const canvas = card.querySelector(".project-halftone")
  const media = card.querySelector(".project-media")
  const img = media?.querySelector("img")
  if (!canvas || !media) return false

  const geometry = getProjectHalftoneGeometry(card, media)
  const { cssWidth, cssHeight, pixelRatio, targetWidth, targetHeight, sizeKey } = geometry

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth
    canvas.height = targetHeight
    canvas.__projectHalftoneRenderKey = null
  }

  const context = canvas.__projectHalftoneContext || canvas.getContext("2d")
  if (!context) return false
  canvas.__projectHalftoneContext = context

  const { paperColor, inkColor } = colors
  const paintPaper = () => {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.clearRect(0, 0, cssWidth, cssHeight)
  }

  if (!img || !img.complete || !img.naturalWidth) {
    paintPaper()
    if (img) bindHalftoneImageLoad(img)
    return false
  }

  const sample = ensureProjectHalftoneSource(img, cssWidth, cssHeight, paperColor)
  if (!sample) return false

  const dotProgress = clamp(progress, 0, 1)
  const progressKey = Math.round(dotProgress * HALFTONE_PROGRESS_STEPS)
  const renderKey = `${sample.key}|${inkColor}|${sizeKey}|${progressKey}`
  if (canvas.__projectHalftoneRenderKey === renderKey) return true
  canvas.__projectHalftoneRenderKey = renderKey

  paintPaper()
  if (dotProgress <= 0.001) return true

  context.fillStyle = inkColor
  const scaleX = cssWidth / sample.cols
  const scaleY = cssHeight / sample.rows
  const radiusScale = Math.min(scaleX, scaleY)
  let hasDots = false
  context.beginPath()

  for (let index = 0; index < sample.dots.length; index += 3) {
    const x = sample.dots[index] * scaleX
    const y = sample.dots[index + 1] * scaleY
    const radius = sample.dots[index + 2] * radiusScale * dotProgress
    if (radius < 0.08) continue

    context.moveTo(x + radius, y)
    context.arc(x, y, radius, 0, Math.PI * 2)
    hasDots = true
  }

  if (hasDots) context.fill()
  return true
}

function renderCatalogHalftones(catalog, progress = siteState.catalogHalftoneProgress, options = {}) {
  if (!catalog) return
  siteState.catalogHalftoneProgress = clamp(progress, 0, 1)
  const visibleOnly = options.visibleOnly !== false
  const cards = visibleOnly
    ? (siteState.dom.catalog === catalog
        ? siteState.visibleHalftoneCards
        : updateVisibleCatalogHalftoneCards(catalog))
    : (siteState.dom.catalog === catalog
        ? siteState.dom.mutedCards
        : [...catalog.querySelectorAll(".project-card.is-filter-muted")])
  cards.forEach(scheduleCatalogHalftoneRender)
}

function requestVisibleCatalogHalftones() {
  const { catalog, mutedCards } = siteState.dom
  if (!catalog?.dataset.activeFilter || !mutedCards.length) return
  if (siteState.catalogHalftoneVisibleFrame) return

  siteState.catalogHalftoneVisibleFrame = requestAnimationFrame(() => {
    siteState.catalogHalftoneVisibleFrame = 0
    updateVisibleCatalogHalftoneCards(catalog)
    renderCatalogHalftones(catalog, siteState.catalogHalftoneProgress, { visibleOnly: true })
  })
}

function clearCatalogHalftoneInline(catalog) {
  stopCatalogHalftoneAnimation()
  stopCatalogHalftoneVisibleUpdate()
  renderCatalogHalftones(catalog, 1)
}

function primeCatalogHalftoneDots(catalog, progress = 0) {
  stopCatalogHalftoneAnimation()
  stopCatalogHalftoneVisibleUpdate()
  renderCatalogHalftones(catalog, progress)
}

function animateCatalogHalftoneDots(catalog, cycle, options = {}) {
  stopCatalogHalftoneAnimation()

  if (!catalog.querySelector(".project-card.is-filter-muted")) return

  const duration = catalogFilterDuration(options.duration || CATALOG_HALFTONE_DRAW_MS)
  const delay = catalogFilterDuration(options.delay || 0)
  const start = performance.now()

  const animate = (time) => {
    if (cycle !== siteState.catalogFilterCycle) {
      siteState.catalogHalftoneFrame = 0
      return
    }

    const elapsed = time - start
    const progress = elapsed < delay ? 0 : clamp((elapsed - delay) / duration, 0, 1)
    renderCatalogHalftones(catalog, smoothstep(progress))

    if (progress >= 1) {
      renderCatalogHalftones(catalog, 1)
      siteState.catalogHalftoneFrame = 0
      return
    }

    siteState.catalogHalftoneFrame = requestAnimationFrame(animate)
  }

  siteState.catalogHalftoneFrame = requestAnimationFrame(animate)
}

function scrollToCatalogFilterTop() {
  if (!document.querySelector(".catalog")) return
  const currentY = window.scrollY || window.pageYOffset || 0
  if (currentY <= 2) return

  window.scrollTo({
    top: 0,
    behavior: catalogFilterDuration(240) <= 1 ? "auto" : "smooth",
  })
}

function scrollToPageSection(hash, options = {}) {
  const target = document.getElementById(hash)
  if (!target) return false

  const currentY = window.scrollY || window.pageYOffset || 0
  const headerOffset = readHeaderMetrics().compactHeight + 1
  const top = Math.max(0, target.getBoundingClientRect().top + currentY - headerOffset)
  window.scrollTo({
    top,
    behavior: options.immediate || catalogFilterDuration(240) <= 1 ? "auto" : "smooth",
  })
  return true
}

function updatePageHash(hash) {
  const nextUrl = `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ""}`
  window.history.replaceState(null, "", nextUrl)
}

function scheduleScrollToPageSection(hash, options = {}) {
  const delay = Number.isFinite(options.delay) ? options.delay : 0
  const attempts = Math.max(1, options.attempts || 2)
  let count = 0

  const run = () => {
    const scroll = () => scrollToPageSection(hash, options)
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(scroll)
    } else {
      scroll()
    }

    count += 1
    if (count < attempts) {
      window.setTimeout(run, catalogFilterDuration(180))
    }
  }

  window.setTimeout(run, delay)
}

function replaceCatalogFilterImmediately(category) {
  const catalog = document.querySelector(".catalog")
  if (!catalog) return

  const normalizedCategory = normalizeCatalogFilter(category)
  window.clearTimeout(siteState.catalogFilterTimer)
  window.clearTimeout(siteState.catalogFilterEnterTimer)
  siteState.catalogFilterTimer = 0
  siteState.catalogFilterEnterTimer = 0
  siteState.catalogFilterTarget = normalizedCategory
  siteState.catalogFilterCurrent = normalizedCategory
  siteState.catalogFilterPhase = "idle"
  siteState.catalogFilterCycle += 1
  catalog.innerHTML = catalogRowsMarkup(normalizedCategory)
  refreshDomCache()
  delete catalog.dataset.filterPhase
  delete catalog.dataset.halftonePhase
  clearCatalogSnowTiming(catalog)
  catalog.style.removeProperty("--catalog-filter-min-height")
  clearCatalogCardTimingVars(catalog)
  clearCatalogHalftoneInline(catalog)
  updateCatalogFilterDataset(catalog, normalizedCategory)
  refreshCatalogAfterFilter(catalog)
}

function commitCatalogFilterTransition(cycle) {
  if (cycle !== siteState.catalogFilterCycle) return

  const catalog = document.querySelector(".catalog")
  if (!catalog) {
    resetCatalogFilterState()
    return
  }

  const category = siteState.catalogFilterTarget
  const commitStarted = performance.now()
  catalog.innerHTML = catalogRowsMarkup(category)
  refreshDomCache()
  siteState.catalogFilterCurrent = category
  siteState.catalogFilterPhase = "entering"
  updateCatalogFilterDataset(catalog, category)
  primeCatalogHalftoneDots(catalog)
  const enterDelay = setCatalogCardTimingVars(
    catalog,
    "--project-filter-enter-delay",
    CATALOG_FILTER_STAGGER_MS,
    224,
  )
  refreshCatalogAfterFilter(catalog)
  planCatalogEnterSnowTiming(catalog, performance.now() - commitStarted)
  catalog.dataset.filterPhase = "entering"
  catalog.dataset.halftonePhase = "primed"

  catalog.getBoundingClientRect()
  window.setTimeout(() => requestAnimationFrame(() => {
    if (cycle !== siteState.catalogFilterCycle) return
    catalog.dataset.filterPhase = "settling"
    catalog.dataset.halftonePhase = "waiting"
    requestLayoutEffectsUpdate({ rules: siteState.hasProjectRuleTargets })
    window.setTimeout(() => {
      if (cycle !== siteState.catalogFilterCycle) return
      if (!catalog.isConnected || catalog.dataset.filterPhase !== "settling") return
      catalog.dataset.halftonePhase = "printing"
      animateCatalogHalftoneDots(catalog, cycle, {
        duration: CATALOG_HALFTONE_DRAW_MS,
      })
    }, catalogFilterDuration(CATALOG_FILTER_ENTER_MS + enterDelay + CATALOG_HALFTONE_DELAY_MS))
  }), catalogFilterDuration(CATALOG_COLOR_SNOW_ENTER_DEFER_MS + 34))

  siteState.catalogFilterEnterTimer = window.setTimeout(() => {
    if (cycle !== siteState.catalogFilterCycle) return

    if (siteState.catalogFilterTarget !== siteState.catalogFilterCurrent) {
      startCatalogFilterTransition()
      return
    }

    delete catalog.dataset.filterPhase
    delete catalog.dataset.halftonePhase
    clearCatalogSnowTiming(catalog)
    catalog.style.removeProperty("--catalog-filter-min-height")
    catalog.style.removeProperty("--catalog-halftone-progress")
    clearCatalogCardTimingVars(catalog)
    clearCatalogHalftoneInline(catalog)
    invalidateCatalogContentBottom()
    siteState.catalogFilterPhase = "idle"
    siteState.catalogFilterTimer = 0
    siteState.catalogFilterEnterTimer = 0
    requestLayoutEffectsUpdate({ rules: true, footer: true })
  }, Math.max(
    catalogFilterDuration(CATALOG_FILTER_ENTER_MS) + enterDelay + 80,
    catalogFilterDuration(CATALOG_FILTER_ENTER_MS + CATALOG_HALFTONE_DELAY_MS + CATALOG_HALFTONE_DRAW_MS) +
      enterDelay +
      160,
  ))
}

function startCatalogFilterTransition() {
  const catalog = document.querySelector(".catalog")
  if (!catalog) {
    siteState.catalogFilterCurrent = siteState.catalogFilterTarget
    siteState.catalogFilterPhase = "idle"
    return
  }

  window.clearTimeout(siteState.catalogFilterTimer)
  window.clearTimeout(siteState.catalogFilterEnterTimer)
  const cycle = siteState.catalogFilterCycle + 1
  siteState.catalogFilterCycle = cycle
  siteState.catalogFilterPhase = "exiting"
  invalidateCatalogContentBottom()
  const height = Math.ceil(catalog.getBoundingClientRect().height)
  catalog.style.setProperty("--catalog-filter-min-height", `${Math.max(0, height)}px`)
  updateCatalogFilterDataset(catalog, siteState.catalogFilterTarget)
  planCatalogExitSnowTiming(catalog)
  const exitDelay = setCatalogCardTimingVars(
    catalog,
    "--project-filter-exit-delay",
    Math.max(18, CATALOG_FILTER_STAGGER_MS - 6),
    176,
  )
  catalog.dataset.filterPhase = "exiting"

  const snowExitDuration = catalogFineSignalSnowDuration(catalog, "out")
  const cssExitDuration = catalogFilterDuration(CATALOG_FILTER_EXIT_MS) + exitDelay + 40
  const snowSwapDuration = Math.max(
    0,
    snowExitDuration - catalogFilterDuration(CATALOG_COLOR_SNOW_SWAP_OVERLAP_MS),
  )
  siteState.catalogFilterTimer = window.setTimeout(() => {
    commitCatalogFilterTransition(cycle)
  }, Math.max(cssExitDuration, snowSwapDuration))
}

function setCatalogFilter(category) {
  const nextCategory = normalizeCatalogFilter(category)
  const catalog = document.querySelector(".catalog")
  if (!catalog) {
    siteState.catalogFilterTarget = nextCategory
    siteState.catalogFilterCurrent = nextCategory
    return
  }

  const noChange =
    siteState.catalogFilterTarget === nextCategory &&
    siteState.catalogFilterCurrent === nextCategory &&
    siteState.catalogFilterPhase !== "exiting"
  if (noChange) return

  siteState.catalogFilterTarget = nextCategory
  if (siteState.catalogFilterPhase === "exiting") {
    updateCatalogFilterDataset(catalog, nextCategory)
    return
  }

  startCatalogFilterTransition()
}

function cancelCatalogMutedRestore(catalog = document.querySelector(".catalog")) {
  if (!catalog) return

  catalog.querySelectorAll(".project-card.is-muted-restore-intent, .project-card.is-muted-restore-return").forEach((card) => {
    window.clearTimeout(card.__catalogMutedReturnTimer)
    card.__catalogMutedReturnTimer = 0
    card.classList.remove("is-muted-restore-intent")
    card.classList.remove("is-muted-restore-return")
  })
}

function setupFilteredCatalogRestore(catalog) {
  if (!catalog) return

  catalog.querySelectorAll(".project-card.is-filter-muted").forEach((card) => {
    const clearIntent = () => {
      if (!card.classList.contains("is-muted-restore-intent")) return

      window.clearTimeout(card.__catalogMutedReturnTimer)
      card.classList.remove("is-muted-restore-intent")
      card.classList.add("is-muted-restore-return")
      card.__catalogMutedReturnTimer = window.setTimeout(() => {
        card.classList.remove("is-muted-restore-return")
        card.__catalogMutedReturnTimer = 0
      }, catalogFilterDuration(CATALOG_MUTED_HOVER_MS) + 30)
    }

    const scheduleIntent = (event) => {
      if (event?.pointerType === "touch") return
      if (!card.isConnected || !card.classList.contains("is-filter-muted")) return

      window.clearTimeout(card.__catalogMutedReturnTimer)
      card.__catalogMutedReturnTimer = 0
      card.classList.remove("is-muted-restore-return")
      card.classList.add("is-muted-restore-intent")
    }

    card.addEventListener("pointerenter", scheduleIntent, { passive: true })
    card.addEventListener("pointerleave", clearIntent, { passive: true })
    card.addEventListener("pointercancel", clearIntent, { passive: true })
    card.addEventListener("focusin", scheduleIntent)
    card.addEventListener("focusout", clearIntent)
  })
}

function setupNavHoverSpacing(options = {}) {
  const nav = document.querySelector(".nav-list")
  if (!nav) return

  const items = [...nav.querySelectorAll(".nav-item")]
  const spacingKey = [
    document.body.dataset.navDensity || "",
    document.body.dataset.headerCompact || "",
    Math.round(window.innerWidth || 0),
    items.map((item) => item.textContent.trim()).join("|"),
  ].join(":")

  if (!options.force && siteState.navHoverSpacingKey === spacingKey) return
  siteState.navHoverSpacingKey = spacingKey

  items.forEach((item) => {
    const title = item.querySelector(".nav-title")
    const detail = item.querySelector(".nav-detail")
    if (!title || !detail) return

    const titleWidth = title.scrollWidth || title.offsetWidth || title.getBoundingClientRect().width
    const detailWidth = detail.scrollWidth || detail.getBoundingClientRect().width
    const hoverSpace = clamp(Math.ceil((detailWidth - titleWidth) / 2 + 10), 0, 120)
    setElementStyleProperty(item, "--nav-hover-space", `${hoverSpace}px`)
    setElementStyleProperty(item, "--nav-title-width", `${Math.ceil(titleWidth)}px`)
    setElementStyleProperty(
      item,
      "--nav-detail-layout-width",
      `${Math.ceil(Math.max(titleWidth, detailWidth))}px`,
    )
  })
}

function setupNavHoverInteraction() {
  const nav = document.querySelector(".nav-list")
  if (!nav) return

  const items = [...nav.querySelectorAll(".nav-item")]
  const itemsByCategory = new Map(
    items
      .map((item) => [normalizeCatalogFilter(item.dataset.navCategory), item])
      .filter(([category]) => category),
  )
  let clearTimer = 0
  let hoverScrollTimer = 0
  let hoveredItem = null
  let visualStateKey = ""

  const itemForCategory = (category) => itemsByCategory.get(category) || null

  const clearHoverScroll = () => {
    window.clearTimeout(hoverScrollTimer)
    hoverScrollTimer = 0
  }

  const setVisualActive = (activeItem) => {
    const lockedItem = itemForCategory(siteState.catalogFilterLocked)
    const suppressLockedDetail = Boolean(lockedItem && activeItem && activeItem !== lockedItem)
    const nextVisualStateKey = [
      activeItem?.dataset.navCategory || "",
      siteState.catalogFilterLocked || "",
      suppressLockedDetail ? "suppressed" : "open",
    ].join(":")

    if (visualStateKey === nextVisualStateKey) return
    visualStateKey = nextVisualStateKey

    items.forEach((item) => {
      item.classList.toggle("is-nav-active", item === activeItem && item !== lockedItem)
      item.classList.toggle("is-nav-locked", item === lockedItem)
      item.classList.toggle("is-nav-lock-suppressed", item === lockedItem && suppressLockedDetail)
    })
  }

  const scheduleHoverScroll = (activeItem, category) => {
    clearHoverScroll()
    if (!category || siteState.catalogFilterLocked) return

    hoverScrollTimer = window.setTimeout(() => {
      hoverScrollTimer = 0
      if (siteState.catalogFilterLocked) return
      if (hoveredItem !== activeItem) return
      if (siteState.catalogFilterTarget !== category && siteState.catalogFilterCurrent !== category) return
      scrollToCatalogFilterTop()
    }, catalogFilterDuration(NAV_HOVER_SCROLL_DELAY_MS))
  }

  const clearActive = () => {
    window.clearTimeout(clearTimer)
    clearTimer = 0
    clearHoverScroll()
    hoveredItem = null
    setVisualActive(itemForCategory(siteState.catalogFilterLocked))
    if (!siteState.catalogFilterLocked) setCatalogFilter(null)
  }

  const setActive = (activeItem, options = {}) => {
    window.clearTimeout(clearTimer)
    clearTimer = 0
    if (options.cancelHoverScroll) clearHoverScroll()
    const category = normalizeCatalogFilter(activeItem?.dataset.navCategory || null)
    setVisualActive(activeItem)

    if (siteState.catalogFilterLocked && !options.forceFilter) return

    setCatalogFilter(category)
    if (options.preview) scheduleHoverScroll(activeItem, category)
  }

  const updateFilterHash = (category) => {
    updatePageHash(category)
  }

  const initialHash = decodeURIComponent(window.location.hash.replace(/^#/, ""))
  const initialCategory = normalizeCatalogFilter(initialHash)
  if (initialCategory && document.querySelector(".catalog")) {
    siteState.catalogFilterLocked = initialCategory
    replaceCatalogFilterImmediately(initialCategory)
    setVisualActive(itemForCategory(initialCategory))
  } else if (initialHash === "resume" && document.querySelector(".catalog")) {
    scheduleScrollToPageSection("resume", { immediate: true, attempts: 5, delay: 180 })
  }

  nav.addEventListener("pointerenter", () => {
    window.clearTimeout(clearTimer)
    clearTimer = 0
  })

  nav.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return
    clearTimer = window.setTimeout(clearActive, 130)
  })

  nav.addEventListener("focusout", (event) => {
    if (!event.relatedTarget || !nav.contains(event.relatedTarget)) clearActive()
  })

  items.forEach((item) => {
    item.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return
      hoveredItem = item
      setActive(item, { preview: true })
    })

    item.addEventListener("focusin", () => {
      hoveredItem = item
      setActive(item, { preview: true })
    })

    item.addEventListener("click", (event) => {
      clearHoverScroll()
      if (item.dataset.navCategory === "resume") {
        event.preventDefault()
        siteState.catalogFilterLocked = null
        cancelCatalogMutedRestore()

        if (!document.querySelector(".catalog")) {
          window.location.href = `${hrefFor("/")}#resume`
          return
        }

        updateFilterHash("resume")
        replaceCatalogFilterImmediately(null)
        scheduleScrollToPageSection("resume", { attempts: 4, delay: 20 })
        return
      }

      const category = normalizeCatalogFilter(item.dataset.navCategory)
      if (!category) {
        siteState.catalogFilterLocked = null
        cancelCatalogMutedRestore()
        setCatalogFilter(null)
        return
      }

      event.preventDefault()

      if (!document.querySelector(".catalog")) {
        window.location.href = `${hrefFor("/")}#${category}`
        return
      }

      siteState.catalogFilterLocked = category
      cancelCatalogMutedRestore()
      updateFilterHash(category)
      setActive(item, { cancelHoverScroll: true, forceFilter: true })
    })
  })
}

function animateHeader(time) {
  const elapsed = siteState.lastFrameTime
    ? Math.min(0.05, (time - siteState.lastFrameTime) / 1000)
    : 1 / 60
  siteState.lastFrameTime = time

  const followSpeed = 9
  const amount = 1 - Math.exp(-followSpeed * elapsed)
  siteState.visualProgress += (siteState.targetProgress - siteState.visualProgress) * amount

  if (Math.abs(siteState.targetProgress - siteState.visualProgress) < 0.001) {
    siteState.visualProgress = siteState.targetProgress
    siteState.followFrame = 0
    siteState.lastFrameTime = 0
    applyHeaderProgress(siteState.visualProgress)
    return
  }

  applyHeaderProgress(siteState.visualProgress)
  siteState.followFrame = requestAnimationFrame(animateHeader)
}

function setHeaderTarget(nextProgress, immediate = false) {
  const targetProgress = clamp(nextProgress, 0, 1)
  if (!immediate && Math.abs(targetProgress - siteState.targetProgress) < 0.0005) return
  siteState.targetProgress = targetProgress

  if (immediate) {
    if (siteState.followFrame) cancelAnimationFrame(siteState.followFrame)
    siteState.followFrame = 0
    siteState.lastFrameTime = 0
    siteState.visualProgress = siteState.targetProgress
    applyHeaderProgress(siteState.visualProgress)
    return
  }

  if (!siteState.followFrame) {
    siteState.followFrame = requestAnimationFrame(animateHeader)
  }
}

function updateHeaderFromScroll(delta) {
  if (isHomeReturnTransitionActive()) return
  const metrics = readHeaderMetrics()
  if (window.scrollY <= 2 && delta <= 0) {
    setHeaderTarget(0)
    return
  }
  if (Math.abs(delta) < 0.35) return
  setHeaderTarget(siteState.targetProgress + delta / metrics.distance)
}

function requestScrollEffectsUpdate(delta) {
  if (isHomeReturnTransitionActive()) return
  siteState.pendingScrollDelta += delta
  if (siteState.scrollFrame) return

  siteState.scrollFrame = requestAnimationFrame(() => {
    const pendingDelta = siteState.pendingScrollDelta
    siteState.pendingScrollDelta = 0
    siteState.scrollFrame = 0

    updateHeaderFromScroll(pendingDelta)
    nudgeFooterGallery()
    requestLayoutEffectsUpdate({ rules: siteState.hasProjectRuleTargets })
    if (!siteState.halftoneObserver || !siteState.halftoneObserverReady) {
      requestVisibleCatalogHalftones()
    }
  })
}

function startResponsiveLayoutTransition() {
  document.body.dataset.layoutTransition = "true"
  window.clearTimeout(siteState.layoutTransitionTimer)
  siteState.layoutTransitionTimer = window.setTimeout(() => {
    delete document.body.dataset.layoutTransition
    siteState.layoutTransitionTimer = 0
  }, 620)
}

function setupHeader() {
  siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
  siteState.galleryObservedScrollY = readFooterGalleryScrollY()
  if (isHomeReturnTransitionActive()) {
    applyHomeReturnTransitionVisual()
  } else {
    setHeaderTarget(clamp(siteState.lastScrollY / readHeaderMetrics().distance, 0, 1), true)
  }

  if (siteState.headerInitialized) return
  siteState.headerInitialized = true

  window.addEventListener(
    "wheel",
    (event) => {
      const time = performance.now()
      const handledGalleryWheel = handleFooterGalleryHorizontalWheel(event, time)
      const verticalDelta = Number.isFinite(event.deltaY) ? event.deltaY : 0
      const horizontalDelta = Number.isFinite(event.deltaX) ? event.deltaX : 0
      const hasVerticalScroll =
        Math.abs(verticalDelta) > 0.35 &&
        Math.abs(verticalDelta) >= Math.abs(horizontalDelta) * 0.55
      if (!handledGalleryWheel || hasVerticalScroll) {
        holdFooterGalleryDuringScroll(time)
      }
      updateHeaderFromScroll(event.deltaY)
    },
    { passive: true }
  )

  window.addEventListener(
    "touchmove",
    () => holdFooterGalleryDuringScroll(),
    { passive: true },
  )

  window.addEventListener(
    "scroll",
    () => {
      const current = window.scrollY || window.pageYOffset || 0
      const delta = current - siteState.lastScrollY
      siteState.lastScrollY = current
      requestScrollEffectsUpdate(delta)
    },
    { passive: true }
  )

  window.addEventListener("resize", () => {
    if (siteState.resizeFrame) return
    siteState.resizeFrame = requestAnimationFrame(() => {
      siteState.resizeFrame = 0
      siteState.headerMetricsWidth = -1
      siteState.headerMetrics = null
      siteState.galleryLayoutDirty = true
      siteState.galleryLayoutMetrics = null
      siteState.galleryViewportLeft = null
      invalidateCatalogHalftoneGeometry()
      invalidateCatalogContentBottom()
      startResponsiveLayoutTransition()
      if (isHomeReturnTransitionActive()) {
        applyHomeReturnTransitionVisual()
      } else {
        applyHeaderProgress(siteState.visualProgress)
      }
      setupNavHoverSpacing({ force: true })
      requestLayoutEffectsUpdate({ rules: true, footer: true })
      requestVisibleCatalogHalftones()
    })
  })
}

function setupHoverEmbeds() {
  document.querySelectorAll("[data-hover-youtube]").forEach((media) => {
    const id = media.dataset.hoverYoutube
    let iframe = null

    const isFilteredOut = () => media.closest(".project-card")?.classList.contains("is-filter-muted")

    const unmount = () => {
      if (!iframe) return
      iframe.remove()
      iframe = null
    }

    const mount = () => {
      if (iframe || !id) return
      if (isFilteredOut()) {
        unmount()
        return
      }
      iframe = document.createElement("iframe")
      iframe.className = "hover-video"
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&playsinline=1&controls=1&loop=1&playlist=${encodeURIComponent(id)}`
      media.appendChild(iframe)
    }

    media.addEventListener("mouseenter", mount)
    media.addEventListener("mouseleave", unmount)
    media.addEventListener("focusin", mount)
    media.addEventListener("focusout", unmount)
  })
}

function handleHomeLogoClick(event) {
  const logo = event.target?.closest?.("[data-home-logo]")
  if (!logo) return
  if (event.defaultPrevented) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (Number.isFinite(event.button) && event.button !== 0) return

  if (isHomeReturnTransitionActive()) {
    event.preventDefault()
    return
  }

  if (isHomeRoute()) return

  event.preventDefault()
  if (prefersReducedMotion()) {
    navigateHomeWithoutTransition()
    return
  }

  startHomeReturnTransition()
}

function handlePopState() {
  cancelHomeReturnTransition()
  render()
}

document.addEventListener("click", handleHomeLogoClick, { capture: true })
window.addEventListener("popstate", handlePopState)
render()
