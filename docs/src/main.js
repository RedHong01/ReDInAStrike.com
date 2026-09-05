import {
  BINARY_MOTION_DEFAULTS,
  buildBinaryOrder,
  constrainBinaryGridSize,
  readBinaryColors,
  smooth01,
} from "./binary-surface-core.js"
import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import {
  boundaryMetrics,
  boundaryVisibility,
  readViewportBoundaryContext,
  viewportBoundsForCard,
} from "./viewport-boundary-core.js?v=20260904-drawer-header1"

const navItems = [
  { label: "Game", detail: "Rapid Prototype / Alt Control", hash: "game" },
  { label: "On going", detail: "Latest Personal Project", hash: "ongoing" },
  { label: "Interaction", detail: "UI & UX Prototype / Plugin", hash: "interaction" },
  { label: "Graphic", detail: "Prints / Motion", hash: "graphic" },
  { label: "Resume", detail: "CV / Contact", hash: "resume" },
]

const CATALOG_DEFAULT_EAGER_IMAGE_COUNT = 2
const CATALOG_FILTER_EAGER_IMAGE_COUNT = 12
const PROJECT_PREVIEW_FILTER_VALUE = "project-preview"
const PROJECT_PREVIEW_FILTER_MUTED_ATTRIBUTE = "data-project-preview-filter-muted"
const PROJECT_PREVIEW_PREVIOUS_FILTER_ATTRIBUTE = "data-project-preview-previous-filter"
const PROJECT_PREVIEW_ACTIVE_ATTRIBUTE = "data-project-preview-active"
const PROJECT_PREVIEW_HEADER_SEAM_ATTRIBUTE = "data-project-preview-header-seam"
const PROJECT_PREVIEW_ABOUT_SEAM_ATTRIBUTE = "data-project-preview-about-seam"
const DITHER_CATEGORY_ENTER_ATTRIBUTE = "data-dither-category-enter-reveal"
const MEDIA_DOMINANT_SAMPLE_MAX = 42
const MEDIA_DOMINANT_ALPHA_MIN = 24
const MEDIA_DOMINANT_CACHE_LIMIT = 96
const MEDIA_EDGE_SAMPLE_RATIO = 0.08
const MEDIA_EDGE_SAMPLE_MIN_PX = 2
const PROJECT_DETAIL_DRAWER_CLOSE_MS = 760

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
    pageTitle: "Build and Shoot",
    displayTitle: "Analog Game",
    date: "11/15/2024",
    path: "/analog-game",
    navHash: "game",
    image: "assets/framer-live/analog-game.png",
  },
  {
    pageTitle: "MyFridge",
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
    pageTitle: "Assets Hub",
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
    pageTitle: "The Mystery of Instrument",
    displayTitle: "Service Game UI Prototype",
    date: "3/10/2026",
    path: "/service-game-ui",
    navHash: "interaction",
    image: "assets/framer-live/service-game-ui-2026-a.png",
  },
  {
    pageTitle: "Super99",
    displayTitle: "Alternative Controller Game Prototype",
    date: "11/4/2025",
    path: "/alt-controller-2025-a",
    navHash: "game",
    image: "assets/framer-live/alt-controller-2025-a.png",
  },
  {
    pageTitle: "Space Bounty Hunter",
    displayTitle: "Service Game UI Prototype",
    date: "3/10/2026",
    path: "/service-game-ui-2",
    navHash: "interaction",
    image: "assets/framer-live/service-game-ui-2026-b.png",
  },
  {
    pageTitle: "SushiGo",
    displayTitle: "Alternative Controller Game Prototype",
    date: "11/4/2025",
    path: "/alt-controller-2025-b",
    navHash: "game",
    image: "assets/framer-live/alt-controller-2025-b.png",
  },
  {
    pageTitle: "Slow'em Down",
    displayTitle: "Game Prototype",
    date: "3/10/2026",
    path: "/game-prototype",
    navHash: "game",
    image: "assets/framer-live/game-prototype-2026.png",
    itchEmbed: "https://redinastrike.itch.io/innovative-game-mechanic/embed",
  },
  {
    pageTitle: "Squirrel Samurai",
    displayTitle: "Alternative Controller Game Prototype",
    date: "11/4/2025",
    path: "/alt-controller-2025-c",
    navHash: "game",
    image: "assets/framer-live/alt-controller-2025-c.png",
  },
  {
    pageTitle: "To Be Chosen",
    displayTitle: "Narrative Design Document",
    date: "3/10/2025",
    path: "/monologue",
    navHash: "ongoing",
    image: "assets/framer-live/narrative-doc-2025-a.png",
  },
  {
    pageTitle: "DAD",
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
const CATALOG_MUTED_HOVER_MS = 356
const CATALOG_COLOR_SNOW_EXIT_COVER_MS = 140
const CATALOG_COLOR_SNOW_ENTER_COVER_MS = 220
const CATALOG_COLOR_SNOW_ENTER_DEFER_MS = 54
const CATALOG_COLOR_SNOW_SWAP_OVERLAP_MS = 128
const CATALOG_COLOR_SNOW_VIEWPORT_MARGIN = 620
const CATALOG_ENTER_DITHER_READY_MAX_WAIT_MS = 320
const CATALOG_RULE_SCROLL_SETTLE_MS = 120
const ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE = "data-active-color-restore-ready"
const BINARY_HANDOFF_SKIP_ATTRIBUTE = "data-binary-handoff-skip"
// Ignore tiny jitter-frame weight changes so subpixel boundary drift does not
// continuously flip transition direction while scrolling.
const PROJECT_RULE_WEIGHT_UPDATE_EPSILON = 0.004
const NAV_HOVER_SCROLL_DELAY_MS = 180
const SECTION_SCROLL_MIN_MS = 620
const SECTION_SCROLL_MAX_MS = 1380
const SECTION_SCROLL_DISTANCE_RATIO = 0.28
const SECTION_SCROLL_INPUT_GRACE_MS = 90
const SECTION_SCROLL_MAGNET_SUPPRESS_MS = 780
const HOME_RETURN_COVER_MS = 620
const HOME_RETURN_REVEAL_MS = 680
const HOME_RETURN_FONT_READY_MS = 520
const HOME_RETURN_READY_TIMEOUT_MS = 1100
const PROJECT_EXPAND_MIN_MS = 420
const PROJECT_EXPAND_MAX_MS = 780
const PROJECT_EXPAND_DISTANCE_RATIO = 0.34
const PROJECT_EXPAND_MASK_FADE_MS = 260
// Keep the paint-only colour wipe mounted for its full visual lifetime. The
// CSS values are mirrored here so the state teardown never truncates a slow,
// physical-looking edge motion.
const PROJECT_PREVIEW_SURFACE_DURATION_MS = 820
const PROJECT_PREVIEW_SURFACE_RETRACT_DURATION_MS = 760
const PROJECT_PREVIEW_EXIT_SOURCE_REVEAL_MS = 220
const ROUTE_EXIT_SNOW_MAX_CELLS = 76000
const ROUTE_EXIT_SNOW_MIN_COLUMNS = 144
const ROUTE_EXIT_SNOW_SOFTNESS = 0.105
const ROUTE_EXIT_SNOW_INK_NOISE = 0.18
const HALFTONE_RENDER_MARGIN = 1100
const HALFTONE_PROGRESS_STEPS = 260
const HALFTONE_LOGICAL_COLUMNS = 132
const HALFTONE_RENDER_FRAME_BUDGET_MS = 4.5
const HALFTONE_SOURCE_CACHE_LIMIT = 64
const PROJECT_RULE_UPDATE_MARGIN = 280
const HEADER_SCROLL_EDGE_EPSILON = 0.006
const HEADER_SCROLL_ANCHOR_JITTER_PX = 1.5
const HEADER_SCROLL_DIRECT_INPUT_MS = 260
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
  const eagerImageLimit = normalizeCatalogFilter(category)
    ? CATALOG_FILTER_EAGER_IMAGE_COUNT
    : CATALOG_DEFAULT_EAGER_IMAGE_COUNT

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
        ${projectCard(first.project, first.originalIndex, index, { muted: first.muted, eagerImageLimit })}
        ${second ? projectCard(second.project, second.originalIndex, index + 1, { muted: second.muted, eagerImageLimit }) : ""}
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
  headerMotionSettledAt: 0,
  headerDirectScrollInputUntil: 0,
  lastScrollY: 0,
  scrollFrame: 0,
  pendingScrollDelta: 0,
  sectionScrollFrame: 0,
  sectionScrollToken: 0,
  sectionScrollTimers: new Set(),
  sectionScrollCleanup: null,
  sectionScrollPreviousBehavior: null,
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
  previewHeaderSeamCard: null,
  ruleGeometryCache: new WeakMap(),
  ruleGeometryGeneration: 0,
  aboutNaturalTopCache: null,
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
  hoverEmbedMediaBound: new WeakSet(),
  filteredRestoreCardsBound: new WeakSet(),
  mediaBackgroundImageBound: new WeakSet(),
  mediaBackgroundCache: new Map(),
  projectPreviewMotionId: 0,
  projectPreviewExitGhosts: new Set(),
  projectPreviewExpandGhosts: new Set(),
  scrollDirection: 1,
  projectDetailDrawer: null,
  catalogRuleScrollTimer: 0,
  catalogRuleScrollActive: false,
}

function getCatalogElement() {
  return siteState.dom.catalog || document.querySelector(".catalog")
}

function setCatalogRuleScrollTransition(active) {
  const catalog = getCatalogElement()
  if (!catalog) return

  if (active) catalog.dataset.ruleScroll = "true"
  else catalog.removeAttribute("data-rule-scroll")
}

function markCatalogRuleScrollActivity(delta = 0) {
  if (Math.abs(delta || 0) < 0.01) return

  if (!siteState.catalogRuleScrollActive) {
    siteState.catalogRuleScrollActive = true
    setCatalogRuleScrollTransition(true)
  }

  if (siteState.catalogRuleScrollTimer) {
    window.clearTimeout(siteState.catalogRuleScrollTimer)
    siteState.catalogRuleScrollTimer = 0
  }

  siteState.catalogRuleScrollTimer = window.setTimeout(() => {
    siteState.catalogRuleScrollTimer = 0
    siteState.catalogRuleScrollActive = false
    setCatalogRuleScrollTransition(false)
  }, CATALOG_RULE_SCROLL_SETTLE_MS)
}

function refreshDomCache() {
  const ditherOwnsMuted = publicDitherOwnsMutedCards()
  if (ditherOwnsMuted) stopLegacyCatalogHalftoneWork()
  else disconnectCatalogHalftoneObservers()
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
    catalogContentNodes: catalog ? [...catalog.querySelectorAll(".project-media, .project-meta")] : [],
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
  invalidateRuleGeometry()
  if (siteState.catalogRuleScrollActive) setCatalogRuleScrollTransition(true)
  else setCatalogRuleScrollTransition(false)
  if (!ditherOwnsMuted) setupCatalogHalftoneObservers(catalog)
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

function isScrollMagnetMotionActive() {
  return document.documentElement.dataset.scrollMagnet === "moving"
}

function isSectionScrollMotionActive() {
  return document.documentElement.dataset.sectionScroll === "moving" ||
    Boolean(siteState.sectionScrollFrame)
}

function isHeaderMotionActive() {
  return Boolean(siteState.followFrame) || Math.abs(siteState.targetProgress - siteState.visualProgress) > 0.0015
}

function footerGalleryWorkActive(gallery = siteState.dom.gallery) {
  if (!siteState.hasFooterGallery || !gallery) return false
  const perfState = window.__RED_PERF_STATE__
  if (!perfState) return true
  return Boolean(
    perfState.footerActive ||
      siteState.galleryFrame ||
      siteState.galleryLoopFrame ||
      siteState.galleryReveal > 0.001 ||
      siteState.galleryTargetReveal > 0.001 ||
      siteState.aboutPull > 0.2 ||
      siteState.aboutTargetPull > 0.2 ||
      siteState.aboutCardOffset > 0.2 ||
      siteState.resumeCardOffset > 0.2,
  )
}

function headerMotionSnapshot() {
  return {
    version: 1,
    moving: isHeaderMotionActive(),
    settledAt: siteState.headerMotionSettledAt,
    targetProgress: siteState.targetProgress,
    visualProgress: siteState.visualProgress,
  }
}

function publishHeaderMotionState(active = isHeaderMotionActive()) {
  const root = document.documentElement
  const next = active ? "moving" : "settled"
  if (!active) {
    siteState.headerMotionSettledAt = performance.now()
    root.dataset.headerMotionSettledAt = siteState.headerMotionSettledAt.toFixed(1)
  }
  if (root.dataset.headerMotion === next) return
  root.dataset.headerMotion = next
  window.dispatchEvent(new CustomEvent("red:header-motion", { detail: headerMotionSnapshot() }))
}

function markHeaderDirectScrollInput() {
  siteState.headerDirectScrollInputUntil = Math.max(
    siteState.headerDirectScrollInputUntil,
    performance.now() + HEADER_SCROLL_DIRECT_INPUT_MS,
  )
}

window.__RED_HEADER_MOTION__ = {
  version: 1,
  isMoving: isHeaderMotionActive,
  snapshot: headerMotionSnapshot,
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

// The cover transition lifts the header out of flow, so the spacer that
// replaces it has to match the header's flow footprint, not its shrunken
// visual height — otherwise the page jumps as the transition starts.
function setHomeReturnSpacerHeight(height = headerFlowHeight()) {
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

function normalizedPathname(pathname) {
  const clean = String(pathname || "/").replace(/\/+$/, "")
  return clean || "/"
}

function homePathname() {
  return normalizedPathname(new URL(base, window.location.href).pathname)
}

function routeFromNavigationUrl(url) {
  if (!(url instanceof URL)) return null
  if (url.origin !== window.location.origin) return null

  const pathname = normalizedPathname(url.pathname)
  if (pathname === "/" || pathname === homePathname()) return "/"

  const parts = url.pathname.split("/").filter(Boolean)
  const last = parts[parts.length - 1]
  if (!last) return "/"

  const candidate = `/${last}`
  return routeMap.has(candidate) ? candidate : null
}

function decodedUrlHash(url) {
  const rawHash = String(url?.hash || "").replace(/^#/, "")
  try {
    return decodeURIComponent(rawHash)
  } catch {
    return rawHash
  }
}

function routeTargetFromUrl(value = homeUrl()) {
  let url
  try {
    url = value instanceof URL ? new URL(value.href) : new URL(value, window.location.href)
  } catch {
    return null
  }

  const path = routeFromNavigationUrl(url)
  if (!path) return null
  const hash = decodedUrlHash(url)

  return {
    url,
    path,
    hash,
    scrollMode: path === "/" && hash === "resume" ? "section" : "top",
  }
}

function pushRouteUrl(target) {
  if (!target?.url) return
  if (window.location.href !== target.url.href) {
    window.history.pushState(null, "", target.url.href)
  }
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

function routeSnowHash(value, seed = 1) {
  let hash = Math.imul((value + 0x9e3779b9) ^ seed, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  return (hash >>> 0) / 4294967295
}

function visibleDitherCellPx() {
  const canvases = [
    ...document.querySelectorAll(
      '.dither-preview-canvas[data-active="true"], .project-halftone[data-active="true"]',
    ),
  ]
  const values = canvases
    .map((canvas) => Number(canvas.dataset.ditherCellPx))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b)

  if (values.length) return values[Math.floor(values.length / 2)]

  const config = PUBLISHED_DITHER_CONFIG
  const referenceWidth = Number(config.adaptiveReferenceWidth) || 604
  const columns = Number(config.columns) || 240
  return referenceWidth / columns
}

function routeExitSnowGrid() {
  const viewportWidth = Math.max(1, Math.ceil(window.innerWidth || document.documentElement.clientWidth || 1))
  const viewportHeight = Math.max(1, Math.ceil(window.innerHeight || document.documentElement.clientHeight || 1))
  const baseCellPx = clamp(
    visibleDitherCellPx() * 1.35,
    Number(PUBLISHED_DITHER_CONFIG.adaptiveMinCellPx) || 1.95,
    (Number(PUBLISHED_DITHER_CONFIG.adaptiveMaxCellPx) || 3.6) * 2.2,
  )
  const cols = Math.max(ROUTE_EXIT_SNOW_MIN_COLUMNS, Math.round(viewportWidth / baseCellPx))
  const rows = Math.max(1, Math.round(viewportHeight / baseCellPx))
  const grid = constrainBinaryGridSize(cols, rows, {
    ...PUBLISHED_DITHER_CONFIG,
    adaptiveMaxGridCells: Math.min(
      ROUTE_EXIT_SNOW_MAX_CELLS,
      Number(PUBLISHED_DITHER_CONFIG.adaptiveMaxGridCells) || ROUTE_EXIT_SNOW_MAX_CELLS,
    ),
  })

  return {
    ...grid,
    viewportWidth,
    viewportHeight,
  }
}

function rgbaCss(rgba, alpha = 1) {
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${alpha})`
}

function rectOverlapsViewportBelowHeader(rect, headerBottom) {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
  return Boolean(
    rect &&
      rect.width > 0.5 &&
      rect.height > 0.5 &&
      rect.right > 0 &&
      rect.left < viewportWidth &&
      rect.bottom > headerBottom &&
      rect.top < viewportHeight
  )
}

function drawRouteImageSample(ctx, image, rect) {
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return false

  const style = window.getComputedStyle(image)
  const imageRect = getHalftoneImageRect(image, rect.width, rect.height, style)
  if (!imageRect) return false

  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.left, rect.top, rect.width, rect.height)
  ctx.clip()
  try {
    ctx.drawImage(
      image,
      rect.left + imageRect.x,
      rect.top + imageRect.y,
      imageRect.width,
      imageRect.height,
    )
  } catch {
    ctx.restore()
    return false
  }
  ctx.restore()
  return true
}

function drawRouteCanvasSample(ctx, canvas, rect) {
  if (!canvas || canvas.width <= 1 || canvas.height <= 1) return false

  try {
    ctx.drawImage(canvas, rect.left, rect.top, rect.width, rect.height)
    return true
  } catch {
    return false
  }
}

function numericStylePixel(value, fallback = 0) {
  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? number : fallback
}

function drawRouteBorderSamples(ctx, element, rect, colors) {
  const style = window.getComputedStyle(element)
  const ink = rgbaCss(colors.ink)
  const topWidth = numericStylePixel(style.borderTopWidth)
  const bottomWidth = numericStylePixel(style.borderBottomWidth)
  const leftWidth = numericStylePixel(style.borderLeftWidth)
  const rightWidth = numericStylePixel(style.borderRightWidth)

  ctx.save()
  ctx.fillStyle = ink
  if (topWidth > 0.25 && style.borderTopStyle !== "none") {
    ctx.fillRect(rect.left, rect.top, rect.width, topWidth)
  }
  if (bottomWidth > 0.25 && style.borderBottomStyle !== "none") {
    ctx.fillRect(rect.left, rect.bottom - bottomWidth, rect.width, bottomWidth)
  }
  if (leftWidth > 0.25 && style.borderLeftStyle !== "none") {
    ctx.fillRect(rect.left, rect.top, leftWidth, rect.height)
  }
  if (rightWidth > 0.25 && style.borderRightStyle !== "none") {
    ctx.fillRect(rect.right - rightWidth, rect.top, rightWidth, rect.height)
  }
  ctx.restore()
}

function routeTextElementText(element) {
  const ownText = [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
  if (ownText) return ownText
  if (element.children.length) return ""
  return (element.textContent || "").replace(/\s+/g, " ").trim()
}

function routeTextAlignX(rect, align) {
  if (align === "right" || align === "end") return rect.right
  if (align === "center") return rect.left + rect.width / 2
  return rect.left
}

function drawRouteTextSample(ctx, element, rect, colors) {
  const text = routeTextElementText(element)
  if (!text) return false

  const style = window.getComputedStyle(element)
  if (style.visibility === "hidden" || style.display === "none") return false
  const opacity = Number.parseFloat(style.opacity || "1")
  if (Number.isFinite(opacity) && opacity <= 0.01) return false

  const fontSize = numericStylePixel(style.fontSize, 16)
  const lineHeight = numericStylePixel(style.lineHeight, fontSize * 1.15)
  const align = style.textAlign === "start"
    ? style.direction === "rtl" ? "right" : "left"
    : style.textAlign === "end"
      ? style.direction === "rtl" ? "left" : "right"
      : style.textAlign
  const y = rect.top + Math.max(fontSize, (rect.height - lineHeight) / 2 + fontSize * 0.82)

  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.left, rect.top, rect.width, rect.height)
  ctx.clip()
  ctx.globalAlpha = Number.isFinite(opacity) ? opacity : 1
  ctx.fillStyle = rgbaCss(colors.ink)
  ctx.font = [
    style.fontStyle || "normal",
    style.fontWeight || "400",
    `${Math.max(1, fontSize)}px`,
    style.fontFamily || "serif",
  ].join(" ")
  ctx.textAlign = align || "left"
  ctx.textBaseline = "alphabetic"
  ctx.fillText(text, routeTextAlignX(rect, align), y)
  ctx.restore()
  return true
}

function collectRouteTextSampleElements(root) {
  const selector = [
    "h1",
    "h2",
    "h3",
    "p",
    "li",
    "a",
    "span",
    "time",
    "figcaption",
    ".project-title",
    ".project-date",
  ].join(",")
  return [...root.querySelectorAll(selector)].filter((element) => {
    if (element.closest(".site-header, .page-route-exit-snow, .type-overlap-shader-layer")) return false
    return Boolean(routeTextElementText(element))
  })
}

function sampleRouteExitSurface(grid, colors, headerBottom) {
  const canvas = document.createElement("canvas")
  canvas.width = grid.cols
  canvas.height = grid.rows
  const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: true })
  if (!ctx) return null

  const viewportWidth = Math.max(1, grid.viewportWidth)
  const viewportHeight = Math.max(1, grid.viewportHeight)
  const scaleX = grid.cols / viewportWidth
  const scaleY = grid.rows / viewportHeight
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0)
  ctx.fillStyle = rgbaCss(colors.paper)
  ctx.fillRect(0, 0, viewportWidth, viewportHeight)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, headerBottom, viewportWidth, Math.max(0, viewportHeight - headerBottom))
  ctx.clip()

  const main = document.querySelector(".site-main")
  const root = main || document.body
  const visualElements = [
    ...root.querySelectorAll("img, canvas, iframe, video"),
  ].filter((element) => {
    if (element.closest(".site-header, .page-route-exit-snow, .type-overlap-shader-layer")) return false
    if (element.classList.contains("active-color-snow-canvas")) return false
    if (element.classList.contains("dither-resize-snow-canvas")) return false
    if (element.classList.contains("binary-pixel-handoff-canvas")) return false
    const style = window.getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number.parseFloat(style.opacity || "1") > 0.01 &&
      rectOverlapsViewportBelowHeader(rect, headerBottom)
    )
  })

  visualElements.forEach((element) => {
    const rect = element.getBoundingClientRect()
    if (element instanceof HTMLImageElement) {
      drawRouteImageSample(ctx, element, rect)
    } else if (element instanceof HTMLCanvasElement) {
      drawRouteCanvasSample(ctx, element, rect)
    } else {
      ctx.save()
      ctx.fillStyle = rgbaCss(colors.ink, 0.92)
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height)
      ctx.restore()
    }
  })

  collectRouteTextSampleElements(root).forEach((element) => {
    const rect = element.getBoundingClientRect()
    if (!rectOverlapsViewportBelowHeader(rect, headerBottom)) return
    drawRouteTextSample(ctx, element, rect, colors)
  })

  root.querySelectorAll("*").forEach((element) => {
    const rect = element.getBoundingClientRect()
    if (!rectOverlapsViewportBelowHeader(rect, headerBottom)) return
    drawRouteBorderSamples(ctx, element, rect, colors)
  })

  ctx.restore()
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  try {
    const data = ctx.getImageData(0, 0, grid.cols, grid.rows).data
    const bits = new Uint8Array(grid.cols * grid.rows)
    for (let index = 0; index < bits.length; index += 1) {
      const offset = index * 4
      const paperDistance =
        (data[offset] - colors.paper[0]) ** 2 +
        (data[offset + 1] - colors.paper[1]) ** 2 +
        (data[offset + 2] - colors.paper[2]) ** 2
      const inkDistance =
        (data[offset] - colors.ink[0]) ** 2 +
        (data[offset + 1] - colors.ink[1]) ** 2 +
        (data[offset + 2] - colors.ink[2]) ** 2
      bits[index] = inkDistance <= paperDistance ? 1 : 0
    }
    return bits
  } catch {
    return null
  }
}

function drawRouteExitSnowFrame(
  context,
  imageData,
  orders,
  colors,
  progress,
  frameSeed,
  sourceBits = null,
  headerBottom = 0,
) {
  const data = imageData.data
  const paper = colors.paper
  const ink = colors.ink
  const easedProgress = smooth01(progress)
  const softness = ROUTE_EXIT_SNOW_SOFTNESS
  const cols = imageData.width
  const rows = imageData.height
  const headerRow = Math.max(0, Math.round(headerBottom / Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1) * rows))
  const hasSourceBits = Boolean(sourceBits && sourceBits.length === orders.length)

  for (let index = 0; index < orders.length; index += 1) {
    const offset = index * 4
    const row = Math.floor(index / cols)
    if (row < headerRow) {
      data[offset + 3] = 0
      continue
    }

    const order = orders[index]
    if (order > easedProgress) {
      data[offset + 3] = 0
      continue
    }

    const edge = clamp((easedProgress - order) / softness, 0, 1)
    const isBoundary = edge < 1
    const flicker = routeSnowHash(index, frameSeed)
    const sourceInk = hasSourceBits ? sourceBits[index] === 1 : flicker < 0.018
    const alpha = isBoundary ? Math.round(255 * (0.45 + edge * 0.55)) : 255

    if (hasSourceBits && !sourceInk) {
      data[offset + 3] = 0
      continue
    }

    const useInk = isBoundary
      ? flicker < ROUTE_EXIT_SNOW_INK_NOISE + (1 - edge) * 0.34
        ? !sourceInk
        : sourceInk
      : sourceInk
    const color = useInk ? ink : paper

    data[offset] = color[0]
    data[offset + 1] = color[1]
    data[offset + 2] = color[2]
    data[offset + 3] = alpha
  }

  context.putImageData(imageData, 0, 0)
}

function startCatalogRouteExitSnow(duration) {
  const catalog = document.querySelector(".catalog")
  const player = window.__RED_ACTIVE_COLOR_SNOW__
  if (!catalog || !player?.playCatalog || prefersReducedMotion()) return

  const attribute = "data-color-snow-exit-duration-ms"
  const previous = catalog.getAttribute(attribute)
  catalog.setAttribute(attribute, String(Math.max(1, Math.round(duration))))
  player.playCatalog(catalog, "out", {
    force: true,
    includeMuted: true,
    includeOffscreen: false,
    reason: "route-exit",
  })
  if (previous === null) catalog.removeAttribute(attribute)
  else catalog.setAttribute(attribute, previous)
}

function playRouteExitSnow(id, duration = HOME_RETURN_COVER_MS) {
  if (prefersReducedMotion()) return Promise.resolve(true)
  const transition = siteState.homeReturnTransition
  if (!transition || transition.id !== id) return Promise.resolve(false)

  startCatalogRouteExitSnow(duration)

  const canvas = document.createElement("canvas")
  canvas.className = "page-route-exit-snow"
  canvas.setAttribute("aria-hidden", "true")
  const context = canvas.getContext("2d", { alpha: true })
  if (!context) return Promise.resolve(false)

  const grid = routeExitSnowGrid()
  canvas.width = grid.cols
  canvas.height = grid.rows
  canvas.style.width = `${grid.viewportWidth}px`
  canvas.style.height = `${grid.viewportHeight}px`
  document.body.appendChild(canvas)

  const colors = readBinaryColors()
  const headerBottom = clamp(currentHeaderHeight(), 0, grid.viewportHeight)
  const sourceBits = sampleRouteExitSurface(grid, colors, headerBottom)
  const imageData = context.createImageData(grid.cols, grid.rows)
  const orders = new Float32Array(grid.cols * grid.rows)
  const seed = Math.round(performance.now()) ^ grid.cols ^ (grid.rows << 8)
  const binaryOrder = buildBinaryOrder(
    grid.cols,
    grid.rows,
    BINARY_MOTION_DEFAULTS.seed + grid.cols * 7 + grid.rows * 11,
  )
  const headerRow = clamp(headerBottom / Math.max(1, grid.viewportHeight), 0, 1)
  const visibleSpan = Math.max(0.001, 1 - headerRow)
  for (let index = 0; index < orders.length; index += 1) {
    const x = index % grid.cols
    const y = Math.floor(index / grid.cols)
    const rowRatio = y / Math.max(1, grid.rows - 1)
    const fromHeader = clamp((rowRatio - headerRow) / visibleSpan, 0, 1)
    const edgeOrigin = Math.pow(fromHeader, 0.82)
    const lateralDrift = (x / Math.max(1, grid.cols - 1)) * 0.045
    orders[index] = clamp(
      edgeOrigin * 0.66 +
        binaryOrder[index] * 0.28 +
        routeSnowHash(index, seed) * 0.05 +
        lateralDrift,
      0,
      1,
    )
  }

  let frame = 0
  let startTime = 0
  let frameCount = 0
  let resolved = false

  const cleanup = () => {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    canvas.remove()
    if (siteState.homeReturnTransition?.snowCleanup === cleanup) {
      siteState.homeReturnTransition.snowCleanup = null
    }
  }

  transition.snowCleanup?.()
  transition.snowCleanup = cleanup

  return new Promise((resolve) => {
    const finish = (value) => {
      if (resolved) return
      resolved = true
      resolve(value)
    }

    const step = (time) => {
      if (!isCurrentHomeReturnTransition(id)) {
        cleanup()
        finish(false)
        return
      }

      if (!startTime) startTime = time
      const progress = clamp((time - startTime) / Math.max(1, duration), 0, 1)
      drawRouteExitSnowFrame(
        context,
        imageData,
        orders,
        colors,
        progress,
        seed + frameCount * 37,
        sourceBits,
        headerBottom,
      )
      frameCount += 1

      if (progress >= 1) {
        frame = 0
        finish(true)
        return
      }

      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
  })
}

function cleanupRouteExitSnow(id) {
  const transition = siteState.homeReturnTransition
  if (!transition || transition.id !== id) return
  transition.snowCleanup?.()
  transition.snowCleanup = null
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
  if (
    transition.phase === "revealing" &&
    transition.scrollMode !== "section" &&
    (window.scrollY || window.pageYOffset || 0) !== 0
  ) {
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

function projectExpandDuration(distance) {
  if (prefersReducedMotion()) return 1
  return clamp(
    PROJECT_EXPAND_MIN_MS + Math.abs(distance) * PROJECT_EXPAND_DISTANCE_RATIO,
    PROJECT_EXPAND_MIN_MS,
    PROJECT_EXPAND_MAX_MS,
  )
}

function animateProjectCardExpand({ id, card, fromHeight, toHeight, fromScrollY, toScrollY, duration }) {
  return new Promise((resolve) => {
    const transition = siteState.homeReturnTransition
    if (!transition || transition.id !== id) {
      resolve(false)
      return
    }

    const setFrame = (heightValue, scrollYValue) => {
      card.style.minHeight = `${heightValue.toFixed(2)}px`
      window.scrollTo({ top: scrollYValue, left: 0, behavior: "auto" })
      siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
    }

    if (transition.frame) cancelAnimationFrame(transition.frame)
    transition.frame = 0

    if (duration <= 1) {
      setFrame(toHeight, toScrollY)
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
      setFrame(
        fromHeight + (toHeight - fromHeight) * eased,
        fromScrollY + (toScrollY - fromScrollY) * eased,
      )

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

function projectExpandMaskColor(card) {
  const inline = card.style.getPropertyValue("--preview-media-bg")
  if (inline) return inline
  const computed = getComputedStyle(card)
  const fromVar = computed.getPropertyValue("--preview-media-bg") || computed.getPropertyValue("--media-bg")
  if (fromVar && fromVar.trim()) return fromVar.trim()
  return computed.backgroundColor || "var(--paper)"
}

function fadeOutProjectExpandMask(mask, duration, id) {
  return new Promise((resolve) => {
    if (!mask?.isConnected) {
      resolve()
      return
    }
    if (duration <= 1 || prefersReducedMotion()) {
      resolve()
      return
    }

    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      mask.removeEventListener("transitionend", onEnd)
      resolve()
    }
    const onEnd = (event) => {
      if (event.target !== mask || event.propertyName !== "opacity") return
      finish()
    }

    mask.addEventListener("transitionend", onEnd)
    mask.style.transition = `opacity ${duration}ms ease`
    requestAnimationFrame(() => {
      if (!isCurrentHomeReturnTransition(id)) {
        finish()
        return
      }
      mask.style.opacity = "0"
    })
    window.setTimeout(finish, duration + 140)
  })
}

async function startProjectExpandTransition(card, target) {
  if (!card?.isConnected || !target) return
  if (isHomeReturnTransitionActive()) return

  const id = siteState.homeReturnTransitionId + 1
  siteState.homeReturnTransitionId = id
  const detailUrl = new URL(target.url.href)
  detailUrl.searchParams.set("preview-side", card.dataset.cardSide === "right" ? "right" : "left")
  const detailTarget = { ...target, url: detailUrl }

  cancelSectionScroll({ suppressMagnet: PROJECT_EXPAND_MAX_MS + PROJECT_EXPAND_MASK_FADE_MS + 400 })
  window.__RED_SCROLL_MAGNET__?.cancel?.({ suppress: PROJECT_EXPAND_MAX_MS + PROJECT_EXPAND_MASK_FADE_MS + 400 })
  if (siteState.followFrame) cancelAnimationFrame(siteState.followFrame)
  siteState.followFrame = 0
  cancelLayoutEffectsUpdate({ clearPending: true })
  siteState.lastFrameTime = 0

  const headerHeight = currentHeaderHeight()
  const startRect = card.getBoundingClientRect()
  const startScrollY = window.scrollY || window.pageYOffset || 0
  const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  const fromHeight = startRect.height
  const toHeight = Math.max(fromHeight, viewportHeight - headerHeight)
  const toScrollY = clamp(startScrollY + (startRect.top - headerHeight), 0, pageMaxScrollY())
  const maskColor = projectExpandMaskColor(card)

  let mask = null
  const cleanup = () => {
    delete document.body.dataset.projectExpandTransition
    delete document.documentElement.dataset.projectExpandTransition
    card.style.minHeight = ""
    card.style.willChange = ""
    mask?.remove()
    mask = null
  }

  siteState.homeReturnTransition = {
    id,
    frame: 0,
    phase: "covering",
    mode: "card-grow",
    targetPath: detailTarget.path,
    targetHash: detailTarget.hash,
    targetHref: detailTarget.url.href,
    scrollMode: target.scrollMode,
    targetCompactProgress: 0,
    snowCleanup: cleanup,
  }
  document.documentElement.dataset.projectExpandTransition = "true"
  document.body.dataset.projectExpandTransition = "true"
  card.style.willChange = "min-height"

  const grew = await animateProjectCardExpand({
    id,
    card,
    fromHeight,
    toHeight,
    fromScrollY: startScrollY,
    toScrollY,
    duration: projectExpandDuration(Math.abs(toHeight - fromHeight) + Math.abs(toScrollY - startScrollY)),
  })
  if (!grew || !isCurrentHomeReturnTransition(id)) return

  mask = document.createElement("div")
  mask.className = "project-expand-mask"
  mask.setAttribute("aria-hidden", "true")
  mask.style.top = `${headerHeight}px`
  mask.style.setProperty("--project-expand-mask-color", maskColor)
  document.body.appendChild(mask)

  lockHomeReturnScroll()
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  siteState.lastScrollY = 0
  card.style.willChange = ""

  pushRouteUrl(detailTarget)
  render()

  const ready = await waitForRouteFirstPaint(id, detailTarget)
  if (!ready || !isCurrentHomeReturnTransition(id)) return

  unlockHomeReturnScroll()
  const scrollSettled = await settleRouteScrollPosition(id, target)
  if (!scrollSettled || !isCurrentHomeReturnTransition(id)) return

  await fadeOutProjectExpandMask(mask, PROJECT_EXPAND_MASK_FADE_MS, id)
  if (!isCurrentHomeReturnTransition(id)) return
  finishHomeReturnTransition(id)
}

function homeUrl() {
  const url = new URL(hrefFor("/"), window.location.href)
  url.hash = ""
  return url
}

function pushHomeRoute() {
  pushRouteUrl(routeTargetFromUrl(homeUrl()))
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
}

function targetRouteDatasetValue(path) {
  return path === "/" ? "home" : path
}

async function waitForRouteFirstPaint(id, target) {
  await waitForAnimationFrames(2)
  if (!isCurrentHomeReturnTransition(id)) return false

  const fontReady = document.fonts?.ready?.catch?.(() => {}) || Promise.resolve()
  await Promise.race([fontReady, waitForMs(HOME_RETURN_FONT_READY_MS)])
  if (!isCurrentHomeReturnTransition(id)) return false

  const main = document.querySelector(".site-main")
  if (!main || main.dataset.route !== targetRouteDatasetValue(target.path)) return false

  const images = [...main.querySelectorAll("img")].filter(
    (image, index) => index < 6 || image.loading === "eager",
  )
  await Promise.race([
    Promise.all(images.map((image) => waitForImageReady(image))),
    waitForMs(HOME_RETURN_READY_TIMEOUT_MS),
  ])
  await waitForAnimationFrames(1)
  return isCurrentHomeReturnTransition(id)
}

function currentRouteCompactProgress() {
  const scrollY = window.scrollY || window.pageYOffset || 0
  return clamp(scrollY / readHeaderMetrics().distance, 0, 1)
}

function sectionScrollTop(hash) {
  const target = document.getElementById(hash)
  if (!target) return null
  const currentY = window.scrollY || window.pageYOffset || 0
  const headerOffset = readHeaderMetrics().compactHeight + 1
  return Math.max(0, target.getBoundingClientRect().top + currentY - headerOffset)
}

function pageMaxScrollY() {
  return Math.max(
    0,
    document.documentElement.scrollHeight -
      Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0),
  )
}

function sectionScrollDuration(distance) {
  if (prefersReducedMotion()) return 1
  return clamp(
    SECTION_SCROLL_MIN_MS + Math.abs(distance) * SECTION_SCROLL_DISTANCE_RATIO,
    SECTION_SCROLL_MIN_MS,
    SECTION_SCROLL_MAX_MS,
  )
}

function syncScrollDrivenVisuals({
  syncHeader = true,
  syncFooter = true,
  syncRules = true,
  publishMoving = false,
} = {}) {
  const currentY = window.scrollY || window.pageYOffset || 0
  siteState.lastScrollY = currentY
  siteState.pendingScrollDelta = 0

  if (syncHeader && !isHomeReturnTransitionActive()) {
    const progress = clamp(currentY / readHeaderMetrics().distance, 0, 1)
    if (publishMoving) {
      if (siteState.followFrame) cancelAnimationFrame(siteState.followFrame)
      siteState.followFrame = 0
      siteState.lastFrameTime = 0
      siteState.targetProgress = progress
      siteState.visualProgress = progress
      applyHeaderProgress(progress)
      publishHeaderMotionState(true)
    } else {
      setHeaderTarget(progress, true)
    }
  }

  if (syncFooter && siteState.hasFooterGallery) {
    updateFooterGalleryReveal({ immediate: true })
  }

  if (syncRules && siteState.hasProjectRuleTargets) {
    updateProjectRuleReveal()
  }
}

function clearSectionScrollTimers() {
  siteState.sectionScrollTimers.forEach((timer) => window.clearTimeout(timer))
  siteState.sectionScrollTimers.clear()
}

function cleanupSectionScrollEnvironment() {
  siteState.sectionScrollCleanup?.()
  siteState.sectionScrollCleanup = null
  if (siteState.sectionScrollPreviousBehavior !== null) {
    document.documentElement.style.scrollBehavior = siteState.sectionScrollPreviousBehavior
    siteState.sectionScrollPreviousBehavior = null
  }
  delete document.documentElement.dataset.sectionScroll
}

function cancelSectionScroll(options = {}) {
  siteState.sectionScrollToken += 1
  if (siteState.sectionScrollFrame) cancelAnimationFrame(siteState.sectionScrollFrame)
  siteState.sectionScrollFrame = 0
  clearSectionScrollTimers()
  cleanupSectionScrollEnvironment()
  if (options.sync) syncScrollDrivenVisuals()
  if (options.suppressMagnet) {
    window.__RED_SCROLL_MAGNET__?.cancel?.({ suppress: options.suppressMagnet })
  }
}

async function settleRouteScrollPosition(id, target) {
  for (let attempt = 0; attempt < 18; attempt += 1) {
    if (!isCurrentHomeReturnTransition(id)) return false
    if (target.scrollMode === "section" && target.hash) {
      scrollToPageSection(target.hash, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
    siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
    await waitForAnimationFrames(1)
    if (target.scrollMode === "section" && target.hash) {
      const expectedTop = sectionScrollTop(target.hash)
      if (expectedTop === null) return true
      if (Math.abs((window.scrollY || window.pageYOffset || 0) - expectedTop) <= 1.5) return true
    } else if ((window.scrollY || window.pageYOffset || 0) <= 0.5) {
      return true
    }
  }
  return isCurrentHomeReturnTransition(id)
}

function cancelHomeReturnTransition(options = {}) {
  const transition = siteState.homeReturnTransition
  if (!transition) return
  if (transition.frame) cancelAnimationFrame(transition.frame)
  transition.snowCleanup?.()
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
  transition?.snowCleanup?.()
  const finalCompactProgress = Number.isFinite(transition?.targetCompactProgress)
    ? transition.targetCompactProgress
    : currentRouteCompactProgress()
  const shouldScrollTop = transition?.scrollMode !== "section"
  const targetHash = transition?.targetHash || ""
  siteState.homeReturnTransition = null
  clearHomeReturnTransitionPhase()
  unlockHomeReturnScroll()
  if (shouldScrollTop) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    setHeaderTarget(0, true)
  } else {
    setHeaderTarget(finalCompactProgress, true)
    if (targetHash) scrollToPageSection(targetHash, { immediate: true })
    setHeaderTarget(currentRouteCompactProgress(), true)
  }
  siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
  setupNavHoverSpacing({ force: true })
  requestLayoutEffectsUpdate({
    rules: siteState.hasProjectRuleTargets,
    footer: siteState.hasFooterGallery,
  })
}

async function startHomeReturnTransition(value = homeUrl(), options = {}) {
  const target = routeTargetFromUrl(value)
  if (!target) return
  if (isHomeReturnTransitionActive()) return

  cancelSectionScroll({ suppressMagnet: HOME_RETURN_COVER_MS + HOME_RETURN_REVEAL_MS })
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
    targetPath: target.path,
    targetHash: target.hash,
    targetHref: target.url.href,
    scrollMode: target.scrollMode,
    targetCompactProgress: target.scrollMode === "section" ? currentRouteCompactProgress() : 0,
    snowCleanup: null,
  }

  if (siteState.followFrame) cancelAnimationFrame(siteState.followFrame)
  siteState.followFrame = 0
  cancelLayoutEffectsUpdate({ clearPending: true })
  siteState.lastFrameTime = 0
  setHomeReturnSpacerHeight()
  lockHomeReturnScroll()
  setHomeReturnTransitionPhase("covering")

  const [covered] = await Promise.all([
    animateHomeReturnHeader({
      id,
      fromCover: 0,
      toCover: 1,
      fromCompact: startCompactProgress,
      toCompact: 0,
      duration: HOME_RETURN_COVER_MS,
    }),
    playRouteExitSnow(id, HOME_RETURN_COVER_MS),
  ])
  if (!covered || !isCurrentHomeReturnTransition(id)) return

  setHomeReturnTransitionPhase("covered")
  const homeSpacerHeight = readHeaderMetrics().fullHeight
  setHomeReturnSpacerHeight(homeSpacerHeight)
  unlockHomeReturnScroll()
  siteState.homeReturnLockedScrollY = 0
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  siteState.lastScrollY = window.scrollY || window.pageYOffset || 0
  cancelLayoutEffectsUpdate({ clearPending: true })
  if (options.updateHistory !== false) pushRouteUrl(target)
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  render()
  cleanupRouteExitSnow(id)
  setHomeReturnSpacerHeight(homeSpacerHeight)
  lockHomeReturnScroll()
  const transition = siteState.homeReturnTransition
  if (transition && transition.id === id) {
    transition.coverProgress = 1
    transition.compactProgress = 0
    applyHomeReturnTransitionVisual(transition)
  }
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  siteState.lastScrollY = window.scrollY || window.pageYOffset || 0

  const ready = await waitForRouteFirstPaint(id, target)
  if (!ready || !isCurrentHomeReturnTransition(id)) return

  unlockHomeReturnScroll()
  const scrollSettled = await settleRouteScrollPosition(id, target)
  if (!scrollSettled || !isCurrentHomeReturnTransition(id)) return
  const revealCompactProgress = target.scrollMode === "section" ? currentRouteCompactProgress() : 0
  siteState.homeReturnTransition.targetCompactProgress = revealCompactProgress
  setHomeReturnTransitionPhase("revealing")
  const revealed = await animateHomeReturnHeader({
    id,
    fromCover: 1,
    toCover: 0,
    fromCompact: revealCompactProgress,
    toCompact: revealCompactProgress,
    duration: HOME_RETURN_REVEAL_MS,
  })
  if (revealed) finishHomeReturnTransition(id)
}

function navigateRouteWithoutTransition(value = homeUrl(), options = {}) {
  const target = routeTargetFromUrl(value)
  if (!target) return
  cancelSectionScroll({ suppressMagnet: SECTION_SCROLL_MAGNET_SUPPRESS_MS })
  cancelHomeReturnTransition({ syncHeaderToScroll: false })
  if (options.updateHistory !== false) pushRouteUrl(target)
  if (target.scrollMode !== "section") window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  render()
  if (target.scrollMode === "section" && target.hash) {
    scrollToPageSection(target.hash, { immediate: true })
    scheduleScrollToPageSection(target.hash, { immediate: true, attempts: 5 })
    setHeaderTarget(currentRouteCompactProgress(), true)
  } else {
    setHeaderTarget(0, true)
  }
}

function navigateHomeWithoutTransition() {
  navigateRouteWithoutTransition(homeUrl())
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
  const background = project.mediaBackground || "#f2f2f2"
  const hex = /^#([\da-f]{6})$/i.exec(background)?.[1]
  const rgb = hex ? Number.parseInt(hex, 16) : null
  return [
    "--media-aspect: 16 / 9",
    `--image-fit: ${project.imageFit || "cover"}`,
    `--image-position: ${project.imagePosition || "center center"}`,
    `--preview-image-fit: ${project.previewImageFit || "contain"}`,
    `--preview-image-position: ${project.previewImagePosition || project.imagePosition || "center center"}`,
    `--media-bg: ${background}`,
    `--preview-ink: ${rgb === null ? "var(--ink)" : previewInkForRgb(rgb >> 16, (rgb >> 8) & 255, rgb & 255)}`,
    `--preview-rule: ${rgb === null ? "var(--rule)" : previewRuleForRgb(rgb >> 16, (rgb >> 8) & 255, rgb & 255)}`,
  ].join("; ")
}

function projectPreviewSummary(project) {
  if (project.path === "/serialdeminer") {
    return "A 48-hour game jam project combining mine-detection tools, first-person exploration, and compact puzzle levels in one playable prototype."
  }

  const knownSummary = framerProjectDetails[project.path]?.summary
  if (knownSummary) return knownSummary

  const practice = {
    game: "game design",
    ongoing: "ongoing game and narrative",
    interaction: "interaction design",
    graphic: "graphic design",
  }[project.navHash] || "interdisciplinary design"

  return `A selected project from Red Wang’s ${practice} practice. The full project page documents its process, system, and final outcome.`
}

function projectLeadSide(project) {
  const requestedSide = new URLSearchParams(window.location.search).get("preview-side")
  if (requestedSide === "left" || requestedSide === "right") return requestedSide
  return projects.indexOf(project) % 2 === 0 ? "left" : "right"
}

function projectLeadMarkup(project, { detail = false } = {}) {
  const side = projectLeadSide(project)
  const title = project.pageTitle || project.displayTitle
  const leadLabel = detail ? `${title} project introduction` : `${title} project preview`

  return `
    <section class="project-lead project-card is-project-preview" data-card-side="${side}" data-media-bg-mode="${project.mediaBackground ? "fixed" : "image"}" aria-label="${escapeHtml(leadLabel)}" style="${mediaStyle(project)}">
      <figure class="project-media${project.mediaBackground ? " has-media-background" : ""}">
        <img
          src="${asset(project.image)}"
          alt="${escapeHtml(title)}"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </figure>
      <div class="project-preview-copy">
        <div class="project-preview-head">
          <h2>${escapeHtml(title)}</h2>
          <p class="project-preview-meta">${escapeHtml(project.displayTitle)}<br />${escapeHtml(project.date)}</p>
        </div>
        <p class="project-preview-summary">${escapeHtml(projectPreviewSummary(project))}</p>
        <span class="project-preview-enter">${detail ? "Scroll to view project ↓" : "Click again to view project ↗"}</span>
      </div>
    </section>`
}

function projectCard(project, index, loadingIndex = index, options = {}) {
  const eagerImageLimit = Number.isFinite(options.eagerImageLimit)
    ? Math.max(0, options.eagerImageLimit)
    : CATALOG_DEFAULT_EAGER_IMAGE_COUNT
  const eagerImage = loadingIndex < eagerImageLimit
  const fetchPriority = eagerImage && loadingIndex < 4 ? "high" : "auto"
  const videoAttributes = project.youtube && !options.muted
    ? ` data-hover-youtube="${escapeHtml(project.youtube)}"`
    : ""
  const mutedClass = options.muted ? " is-filter-muted" : ""
  const mutedAttributes = options.muted ? ` data-filter-muted="true"` : ""
  const mediaBackgroundClass = project.mediaBackground ? " has-media-background" : ""
  const mediaBackgroundMode = project.mediaBackground ? "fixed" : "image"
  const halftoneCanvas = options.muted
    ? `<canvas class="project-halftone" aria-hidden="true"></canvas>`
    : ""
  const cardSide = loadingIndex % 2 === 0 ? "left" : "right"

  return `
    <a class="project-card${mutedClass}" href="${hrefFor(project.path)}" data-project-card data-card-side="${cardSide}" data-section="${escapeHtml(project.navHash)}" data-index="${index}" data-media-bg-mode="${mediaBackgroundMode}" aria-expanded="false" style="${mediaStyle(project)}"${mutedAttributes}>
      <figure class="project-media${mediaBackgroundClass}"${videoAttributes}>
        <img
          src="${asset(project.image)}"
          alt="${escapeHtml(project.pageTitle)}"
          loading="${eagerImage ? "eager" : "lazy"}"
          fetchpriority="${fetchPriority}"
          decoding="async"
        />
        ${halftoneCanvas}
      </figure>
      <div class="project-meta">
        <span class="project-title">${escapeHtml(project.displayTitle)}</span>
        <span class="project-date">${escapeHtml(project.date)}</span>
      </div>
      <div class="project-preview-copy" aria-hidden="true">
        <div class="project-preview-head">
          <h2>${escapeHtml(project.pageTitle)}</h2>
          <p class="project-preview-meta" data-typewriter-skip>${escapeHtml(project.displayTitle)}<br />${escapeHtml(project.date)}</p>
        </div>
        <p class="project-preview-summary">${escapeHtml(projectPreviewSummary(project))}</p>
        <span class="project-preview-enter" data-typewriter-skip>Click again to view project ↗</span>
      </div>
    </a>`
}

function dominantMediaCacheKey(img) {
  const source = img.currentSrc || img.src || img.getAttribute("src") || ""
  return `${source}:${img.naturalWidth}x${img.naturalHeight}`
}

function trimMediaDominantCache() {
  while (siteState.mediaBackgroundCache.size > MEDIA_DOMINANT_CACHE_LIMIT) {
    const first = siteState.mediaBackgroundCache.keys().next().value
    siteState.mediaBackgroundCache.delete(first)
  }
}

function previewInkForRgb(red, green, blue) {
  const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue
  return luma < 92 ? "rgb(248 247 245)" : "rgb(69 69 69)"
}

function previewRuleForRgb(red, green, blue) {
  const linear = (channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
  const darkLuminance = linear(17)
  const darkContrast = (Math.max(luminance, darkLuminance) + 0.05) /
    (Math.min(luminance, darkLuminance) + 0.05)
  const whiteContrast = 1.05 / (luminance + 0.05)
  return whiteContrast > darkContrast ? "#ffffff" : "#111111"
}

function addMediaColorBucket(buckets, pixels, index) {
  const alpha = pixels[index + 3]
  if (alpha < MEDIA_DOMINANT_ALPHA_MIN) return false

  const red = pixels[index]
  const green = pixels[index + 1]
  const blue = pixels[index + 2]
  const bucketKey = `${red >> 4}:${green >> 4}:${blue >> 4}`
  const bucket = buckets.get(bucketKey) || { count: 0, red: 0, green: 0, blue: 0 }
  bucket.count += 1
  bucket.red += red
  bucket.green += green
  bucket.blue += blue
  buckets.set(bucketKey, bucket)
  return true
}

function dominantMediaBucket(buckets) {
  let dominant = null
  for (const bucket of buckets.values()) {
    if (!dominant || bucket.count > dominant.count) dominant = bucket
  }
  return dominant
}

function mediaBackgroundFromBucket(bucket) {
  if (!bucket) return null

  const red = Math.round(bucket.red / bucket.count)
  const green = Math.round(bucket.green / bucket.count)
  const blue = Math.round(bucket.blue / bucket.count)
  return {
    background: `rgb(${red} ${green} ${blue})`,
    ink: previewInkForRgb(red, green, blue),
    rule: previewRuleForRgb(red, green, blue),
  }
}

function dominantMediaBackgroundFromImage(img) {
  if (!img?.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) return null

  const key = dominantMediaCacheKey(img)
  const cached = siteState.mediaBackgroundCache.get(key)
  if (cached) return cached

  const scale = MEDIA_DOMINANT_SAMPLE_MAX / Math.max(img.naturalWidth, img.naturalHeight)
  const width = Math.max(1, Math.round(img.naturalWidth * Math.min(1, scale)))
  const height = Math.max(1, Math.round(img.naturalHeight * Math.min(1, scale)))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d", {
    alpha: true,
    colorSpace: "srgb",
    willReadFrequently: true,
  })
  if (!context) return null

  try {
    context.drawImage(img, 0, 0, width, height)
    const pixels = context.getImageData(0, 0, width, height).data
    const fullBuckets = new Map()
    const edgeBuckets = new Map()
    const edgeSize = Math.max(
      MEDIA_EDGE_SAMPLE_MIN_PX,
      Math.round(Math.min(width, height) * MEDIA_EDGE_SAMPLE_RATIO),
    )

    for (let y = 0; y < height; y += 1) {
      const yIsEdge = y < edgeSize || y >= height - edgeSize
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4
        if (!addMediaColorBucket(fullBuckets, pixels, index)) continue
        if (yIsEdge || x < edgeSize || x >= width - edgeSize) {
          addMediaColorBucket(edgeBuckets, pixels, index)
        }
      }
    }

    const dominant = dominantMediaBucket(edgeBuckets) || dominantMediaBucket(fullBuckets)
    if (!dominant) return null

    const result = mediaBackgroundFromBucket(dominant)
    if (!result) return null

    siteState.mediaBackgroundCache.set(key, result)
    trimMediaDominantCache()
    return result
  } catch {
    return null
  }
}

function applyDominantMediaBackground(card) {
  if (!card || card.dataset.mediaBgMode === "fixed") return false

  const media = card.querySelector(".project-media")
  const img = media?.querySelector("img")
  if (!media || !img) return false

  const result = dominantMediaBackgroundFromImage(img)
  if (!result) return false

  card.style.setProperty("--media-bg", result.background)
  card.style.setProperty("--preview-media-bg", result.background)
  card.style.setProperty("--preview-ink", result.ink)
  card.style.setProperty("--preview-rule", result.rule)
  media.classList.add("has-media-background")
  return true
}

function bindDominantMediaBackground(card) {
  if (!card || card.dataset.mediaBgMode === "fixed") return

  if (applyDominantMediaBackground(card)) return

  const img = card.querySelector(".project-media img")
  if (!img || siteState.mediaBackgroundImageBound.has(img)) return

  siteState.mediaBackgroundImageBound.add(img)
  const applyWhenReady = () => {
    if (card.isConnected) applyDominantMediaBackground(card)
  }
  img.addEventListener("load", applyWhenReady, { once: true, passive: true })
  img.addEventListener("error", applyWhenReady, { once: true, passive: true })
}

function setupMediaDominantBackgrounds(root = document) {
  root.querySelectorAll?.(".project-card").forEach(bindDominantMediaBackground)
}

function galleryTile(project, index, isClone = false) {
  const hiddenAttributes = isClone ? ` aria-hidden="true" tabindex="-1"` : ""
  const mediaBackgroundClass = project.mediaBackground ? " has-media-background" : ""
  // The gallery sits below the catalog and renders four repeated sets. Keep
  // those images out of the critical request/decode path; the browser will
  // still prefetch them as the footer approaches the viewport.
  const imageLoading = "lazy"

  return `
    <a class="footer-gallery-tile" href="${hrefFor(project.path)}" style="${mediaStyle(project)}"${hiddenAttributes}>
      <figure class="footer-gallery-media${mediaBackgroundClass}">
        <img
          src="${asset(project.image)}"
          alt="${escapeHtml(project.pageTitle)}"
          loading="${imageLoading}"
          fetchpriority="low"
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
          <img src="${asset("assets/figma-home/about-profile.png")}" alt="Red Wang portrait" loading="lazy" fetchpriority="low" decoding="async" />
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
        <img src="${asset(project.image)}" alt="${escapeHtml(project.pageTitle)} full-page reference" loading="lazy" fetchpriority="low" decoding="async" />
      </figure>`

  return `
    ${headerMarkup()}
    <main class="site-main detail-page" data-route="${escapeHtml(project.path)}">
      ${projectLeadMarkup(project, { detail: true })}
      <article class="detail-shell">
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
      ${projectLeadMarkup(project, { detail: true })}
      <article class="framer-derived-shell" aria-label="${escapeHtml(detail.title)} project page">
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

const SERIAL_DEMINER_ASSET_VERSION = "20260831-rgb1"

function caseImagePath(path) {
  if (path.includes("?")) return path
  if (path.startsWith("assets/serial-deminer/")) {
    return `${path}?v=${SERIAL_DEMINER_ASSET_VERSION}`
  }
  return path
}

function caseImage(path, alt, className = "") {
  return `
    <figure class="framer-case-image ${className}">
      <img src="${asset(caseImagePath(path))}" alt="${escapeHtml(alt)}" loading="lazy" />
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
      ${projectLeadMarkup(project, { detail: true })}
      <article class="framer-case-shell" aria-label="Serial Deminer case study">
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
  setupMediaDominantBackgrounds(app)
  setupHeader()
  setupNavHoverSpacing({ force: true })
  setupNavHoverInteraction()
  setupFooterGallery()
  if (document.fonts) {
    document.fonts.ready
      .then(() => {
        setupNavHoverSpacing({ force: true })
        invalidateRuleGeometry()
        requestLayoutEffectsUpdate({
          rules: siteState.hasProjectRuleTargets,
          footer: siteState.hasFooterGallery,
        })
      })
      .catch(() => {})
  }
  setupHoverEmbeds()
}

// The Figma capture runner needs deterministic, reloadable snapshots of the
// same page states that users reach through scroll and interaction.
function applyFigmaCaptureState() {
  const state = new URLSearchParams(window.location.search).get("figma-state")
  if (!state || !document.querySelector(".site-main")) return

  const about = document.querySelector(".about-section")
  if (about) {
    // Capture the settled layout, not the transient scroll-reveal opacity.
    for (const [property, value] of [
      ["--about-info-reveal", "1"],
      ["--about-info-shift", "0px"],
      ["--about-pull-y", "0px"],
      ["--about-card-offset-y", "0px"],
      ["--resume-card-offset-y", "0px"],
    ]) about.style.setProperty(property, value)
    about.querySelectorAll(".about-copy, .contact-copy, .profile-portrait, .profile-card, .resume-word, .resume-detail")
      .forEach((element) => {
        element.style.opacity = "1"
        element.style.clipPath = "none"
        element.style.transform = "none"
        element.style.transition = "none"
      })
  }

  if (state === "compact") {
    const scrollTop = Math.min(420, Math.max(0, document.documentElement.scrollHeight - window.innerHeight))
    window.scrollTo({ top: scrollTop, left: 0, behavior: "auto" })
    syncScrollDrivenVisuals({ publishMoving: true })
    return
  }

  if (state === "interaction") {
    replaceCatalogFilterImmediately("interaction")
    return
  }

  if (state === "expanded") {
    const card = document.querySelector('[data-project-card][data-index="0"]')
    if (card) {
      commitProjectPreviewState(card, true)
      card.scrollIntoView({ block: "start", behavior: "auto" })
      syncScrollDrivenVisuals({ publishMoving: true })
    }
    return
  }

  if (state === "resume") {
    scheduleScrollToPageSection("resume", { immediate: true, attempts: 2, delay: 0 })
  }
}

/**
 * Snap a header height onto the same pixel grid the performance prelude uses
 * when it writes --header-height, so the painted header bottom, the sticky
 * preview top and the cached geometry all agree to the pixel instead of
 * disagreeing by a fraction that shimmers frame to frame.
 */
function quantizeHeaderHeight(value) {
  const step = window.__RED_PERF__?.headerHeightVisualStepPx || 0
  if (!(step > 0) || !Number.isFinite(value)) return value
  return Math.round(value / step) * step
}

/**
 * How much vertical space the header occupies in normal flow. This stays fixed
 * for a given breakpoint even while the header shrinks, so scrolling never
 * reflows the document underneath it.
 */
function headerFlowHeight() {
  return readHeaderMetrics().fullHeight
}

/**
 * Header geometry is a pure function of the layout viewport width, so the
 * result is cached until something can actually change it. The cache is
 * invalidated synchronously from the resize listener rather than re-read here:
 * this runs through headerFlowHeight() from cachedRuleRect(), once per rule
 * element per frame, and window.innerWidth is a layout-dependent read. Probing
 * it to validate the cache cost ~17 reads per scroll frame — more than the
 * arithmetic it was guarding.
 */
function readHeaderMetrics() {
  if (siteState.headerMetrics) {
    return siteState.headerMetrics
  }

  const width = window.innerWidth
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

function setRuleRevealWeight(element, name, value) {
  const next = Number.parseFloat(value)
  if (!Number.isFinite(next)) return
  const current = Number.parseFloat(element.style.getPropertyValue(name))
  if (Number.isFinite(current) && Math.abs(current - next) < PROJECT_RULE_WEIGHT_UPDATE_EPSILON) return
  element.style.setProperty(name, value)
}

function cachedRuleRect(record) {
  const scrollX = window.scrollX || window.pageXOffset || 0
  const scrollY = window.scrollY || window.pageYOffset || 0
  const headerDelta = headerFlowHeight() - record.headerHeight
  const left = record.documentLeft - scrollX
  const top = record.documentTop + headerDelta - scrollY
  return {
    top,
    left,
    width: record.width,
    height: record.height,
    right: left + record.width,
    bottom: top + record.height,
  }
}

function readCachedRuleRect(element) {
  const cached = siteState.ruleGeometryCache.get(element)
  if (cached?.generation === siteState.ruleGeometryGeneration) {
    return cachedRuleRect(cached)
  }

  const rect = element.getBoundingClientRect()
  const scrollX = window.scrollX || window.pageXOffset || 0
  const scrollY = window.scrollY || window.pageYOffset || 0
  siteState.ruleGeometryCache.set(element, {
    generation: siteState.ruleGeometryGeneration,
    documentTop: rect.top + scrollY,
    documentLeft: rect.left + scrollX,
    width: rect.width,
    height: rect.height,
    headerHeight: headerFlowHeight(),
  })
  return rect
}

function readCachedAboutNaturalTop(about) {
  const cached = siteState.aboutNaturalTopCache
  const scrollY = window.scrollY || window.pageYOffset || 0
  if (cached?.element === about && cached.generation === siteState.ruleGeometryGeneration) {
    const headerDelta = headerFlowHeight() - cached.headerHeight
    return cached.documentTop + headerDelta - scrollY
  }

  const rect = about.getBoundingClientRect()
  const naturalTop = rect.top + Math.max(0, siteState.aboutPull || 0)
  siteState.aboutNaturalTopCache = {
    element: about,
    generation: siteState.ruleGeometryGeneration,
    documentTop: naturalTop + scrollY,
    headerHeight: headerFlowHeight(),
  }
  return naturalTop
}

function invalidateCatalogContentBottom() {
  siteState.catalogContentBottomDocument = null
  siteState.catalogContentBottomHeaderHeight = null
  siteState.catalogContentBottomDirty = true
  invalidateRuleGeometry()
}

function invalidateRuleGeometry() {
  siteState.ruleGeometryCache = new WeakMap()
  siteState.ruleGeometryGeneration += 1
  siteState.aboutNaturalTopCache = null
}

function requestLayoutEffectsUpdate(options = {}) {
  if (options.rules) siteState.layoutPendingRules = true
  if (options.footer && footerGalleryWorkActive()) siteState.layoutPendingFooter = true
  if (!siteState.layoutPendingRules && !siteState.layoutPendingFooter) return
  if (isHomeReturnTransitionActive()) return
  if (siteState.layoutFrame) return

  siteState.layoutFrame = requestAnimationFrame((frameTime) => {
    siteState.layoutFrame = 0
    const updateRules = siteState.layoutPendingRules
    const updateFooter = siteState.layoutPendingFooter && footerGalleryWorkActive()
    siteState.layoutPendingRules = false
    siteState.layoutPendingFooter = false

    if (updateRules) updateProjectRuleReveal(frameTime)
    if (updateFooter) updateFooterGalleryReveal()
  })
}

function cancelLayoutEffectsUpdate(options = {}) {
  if (siteState.layoutFrame) cancelAnimationFrame(siteState.layoutFrame)
  siteState.layoutFrame = 0
  if (options.clearPending) {
    siteState.layoutPendingRules = false
    siteState.layoutPendingFooter = false
  }
}

/**
 * Backfill whatever height the header gave up so its footprint in normal flow
 * stays constant while it shrinks. The backfill is capped at the current scroll
 * offset: reserving more than that would leave bare paper below a compact
 * header sitting near the top of the page. Ordinary scrolling never reaches the
 * cap — the header sheds less height than the scroll distance that sheds it —
 * so this only bites if the header is left compact at a scroll position that
 * cannot hide the reserved space.
 */
function syncHeaderFlowGap(height = siteState.headerVisualBottom) {
  const metrics = readHeaderMetrics()
  const visualHeight = height > 0 ? height : metrics.fullHeight
  const scrollTop = Math.max(0, window.scrollY || window.pageYOffset || 0)
  const flowGap = clamp(metrics.fullHeight - visualHeight, 0, scrollTop)
  setRootStyleProperty("--header-flow-gap", `${flowGap.toFixed(2)}px`)
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
  const height = quantizeHeaderHeight(baseHeight + (viewportHeight - baseHeight) * coverProgress)
  const logo = metrics.fullLogo + (metrics.compactLogo - metrics.fullLogo) * progress
  const navScale = 1 + (0.88 - 1) * progress
  const detailOpacity = 1
  const glassAlpha = 0.76 + (1 - 0.76) * coverProgress
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
  setRootStyleProperty("--project-preview-sticky-top", `${height.toFixed(2)}px`)
  siteState.headerVisualBottom = height
  syncHeaderFlowGap(height)

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
  requestProjectDetailHeaderUpdate()
  requestLayoutEffectsUpdate({
    rules: siteState.hasProjectRuleTargets,
    footer: siteState.hasFooterGallery,
  })
}

function requestProjectDetailHeaderUpdate() {
  const drawerState = activeProjectDetailDrawer()
  const card = drawerState?.card
  if (!card?.isConnected || !drawerState?.element || drawerState.element.dataset.drawerState === "closing") return
  const scrollY = window.scrollY || window.pageYOffset || 0
  // Keep the sticky hand-off tied to the header's painted edge. The compact
  // state can be reached after the header animation has stopped writing its
  // custom property, leaving the old expanded value in the cascade. Reading
  // the live rect here corrects that stale frame without scrolling the page.
  const headerRect = siteState.dom.header?.getBoundingClientRect?.()
  const liveHeaderBottom = headerRect && Number.isFinite(headerRect.bottom) ? Math.max(0, headerRect.bottom) : 0
  if (liveHeaderBottom > 0) {
    setRootStyleProperty("--project-preview-sticky-top", `${liveHeaderBottom.toFixed(2)}px`)
  }
  const headerHeight = Math.max(siteState.headerVisualBottom || 0, readHeaderMetrics().compactHeight)
  if (!Number.isFinite(card.__detailHeaderStart)) {
    const rect = card.getBoundingClientRect()
    card.__detailHeaderStart = rect.top + scrollY
    card.__detailHeaderOpenHeight = Math.max(1, rect.height)
  }
  const openHeight = card.__detailHeaderOpenHeight
  const compactHeight = Math.min(openHeight, window.innerWidth < 560 ? 76 : window.innerWidth < 980 ? 84 : 92)
  const stickyStart = card.__detailHeaderStart - headerHeight
  const progress = clamp((scrollY - stickyStart) / Math.max(180, openHeight - compactHeight + headerHeight * 0.6), 0, 1)
  setElementStyleProperty(card, "--project-detail-header-progress", progress.toFixed(4))
  setElementStyleProperty(card, "--project-detail-header-expanded-height", `${openHeight.toFixed(2)}px`)
  setElementStyleProperty(card, "--project-detail-header-min-height", `${compactHeight.toFixed(2)}px`)
  setElementStyleProperty(card, "--project-detail-header-pad", `${(8 + (1 - progress) * 34).toFixed(2)}px`)
  if (progress > 0.28) card.setAttribute("data-project-detail-header-compressed", "true")
  else card.removeAttribute("data-project-detail-header-compressed")
  // Keep the media paint until the header is genuinely at its minimum. This
  // gives the sticky card a stable hand-off point instead of hiding the image
  // as soon as the metadata starts collapsing.
  if (progress > 0.82) card.setAttribute("data-project-detail-header-minimized", "true")
  else card.removeAttribute("data-project-detail-header-minimized")
}

/**
 * The header and About surface each own a boundary rule. An expanded preview
 * has matching top and bottom rules, so it yields only the edge that is
 * physically sharing a seam and takes it back as soon as it separates.
 * The state lives on the card, so a card retracting toward its collapsed slot
 * keeps the seam it was drawn with instead of borrowing the next card's.
 */
function syncProjectPreviewSeams(boundaryContext) {
  const card = boundaryContext.expandedCard || null
  const previous = siteState.previewHeaderSeamCard
  if (previous && previous !== card) {
    previous.removeAttribute(PROJECT_PREVIEW_HEADER_SEAM_ATTRIBUTE)
    previous.removeAttribute(PROJECT_PREVIEW_ABOUT_SEAM_ATTRIBUTE)
  }
  siteState.previewHeaderSeamCard = card
  if (!card) return

  const headerShared = boundaryContext.expandedMeetsHeader
  const aboutShared = boundaryContext.expandedMeetsAbout
  setProjectPreviewSeamAttribute(card, PROJECT_PREVIEW_HEADER_SEAM_ATTRIBUTE, headerShared)
  setProjectPreviewSeamAttribute(card, PROJECT_PREVIEW_ABOUT_SEAM_ATTRIBUTE, aboutShared)
}

function setProjectPreviewSeamAttribute(card, attribute, enabled) {
  if (enabled === card.hasAttribute(attribute)) return
  if (enabled) card.setAttribute(attribute, "true")
  else card.removeAttribute(attribute)
}

function updateProjectRuleReveal(frameTime = null) {
  const { projectRows, cardRuleTargets } = siteState.dom
  const boundaryContext = readViewportBoundaryContext(frameTime)
  syncProjectPreviewSeams(boundaryContext)
  if (!boundaryContext.bottom) return

  const previewActive = Boolean(boundaryContext.expandedRow)
  const liveRuleRectCache = new WeakMap()
  const ruleRectFor = (element) => {
    if (!previewActive) return readCachedRuleRect(element)
    const cached = liveRuleRectCache.get(element)
    if (cached) return cached
    const rect = element.getBoundingClientRect()
    liveRuleRectCache.set(element, rect)
    return rect
  }

  const ruleBoundaryCache = new WeakMap()
  const ruleBoundaryFor = (element) => {
    const targetCard = element?.matches?.(".project-card")
      ? element
      : element?.querySelector?.(".project-card") || null
    const cacheKey = targetCard || element
    const cached = ruleBoundaryCache.get(cacheKey)
    if (cached) return cached

    const bounds = viewportBoundsForCard(targetCard, boundaryContext)
    const metrics = boundaryMetrics(bounds)
    const updateMargin = Math.max(
      PROJECT_RULE_UPDATE_MARGIN,
      metrics.hold + metrics.depth,
    )
    const result = {
      ruleRevealFromY(y) {
        return boundaryVisibility(y, bounds, metrics, smoothstep).toFixed(3)
      },
      ruleYNeedsUpdate(y) {
        return y >= bounds.top - updateMargin && y <= bounds.bottom + updateMargin
      },
    }
    ruleBoundaryCache.set(cacheKey, result)
    return result
  }

  const ruleUpdates = siteState.ruleFadeUpdates
  ruleUpdates.length = 0
  projectRows.forEach((row) => {
    if (row.classList.contains("has-project-preview") || row.classList.contains("is-before-project-preview")) {
      ruleUpdates.push(row, "--project-rule-weight", "1")
      return
    }
    const rect = ruleRectFor(row)
    const boundary = ruleBoundaryFor(row)
    if (!boundary.ruleYNeedsUpdate(rect.bottom)) return
    ruleUpdates.push(row, "--project-rule-weight", boundary.ruleRevealFromY(rect.bottom))
  })

  cardRuleTargets.forEach((card) => {
    const row = card.closest(".project-row")
    if (row?.classList.contains("has-project-preview")) {
      ruleUpdates.push(card, "--card-rule-weight", "1")
      return
    }
    const rect = ruleRectFor(card)
    const boundary = ruleBoundaryFor(card)
    if (!boundary.ruleYNeedsUpdate(rect.top)) return
    ruleUpdates.push(card, "--card-rule-weight", boundary.ruleRevealFromY(rect.top))
  })

  for (let index = 0; index < ruleUpdates.length; index += 3) {
    setRuleRevealWeight(ruleUpdates[index], ruleUpdates[index + 1], ruleUpdates[index + 2])
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
    const headerDelta = headerFlowHeight() - siteState.catalogContentBottomHeaderHeight
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
    siteState.catalogContentBottomHeaderHeight = headerFlowHeight()
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

function applyFooterComposition(frameTime = null) {
  const { about } = siteState.dom
  if (about) {
    const pull = Math.max(0, siteState.aboutPull || 0)
    const reveal = clamp(siteState.galleryReveal || 0, 0, 1)
    const direction = siteState.scrollDirection >= 0 ? "down" : "up"
    const shift = (1 - reveal) * 18 * (siteState.scrollDirection >= 0 ? 1 : -1)
    about.dataset.drawerDirection = direction
    setElementStyleProperty(about, "--about-pull-y", `${pull.toFixed(2)}px`)
    setElementStyleProperty(about, "--about-card-offset-y", `${Math.max(0, siteState.aboutCardOffset || 0).toFixed(2)}px`)
    setElementStyleProperty(about, "--resume-card-offset-y", `${Math.max(0, siteState.resumeCardOffset || 0).toFixed(2)}px`)
    setElementStyleProperty(about, "--about-info-reveal", reveal.toFixed(4))
    setElementStyleProperty(about, "--about-info-shift", `${shift.toFixed(2)}px`)
  }
  if (siteState.previewHeaderSeamCard?.isConnected) {
    // Share the boundary snapshot with the other frame consumers. Without a
    // timestamp the boundary helper has to repeat its DOM measurements for
    // every footer animation tick.
    syncProjectPreviewSeams(readViewportBoundaryContext(frameTime))
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
    applyFooterComposition(performance.now())
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

  const headerBottom =
    siteState.headerVisualBottom > 0
      ? siteState.headerVisualBottom
      : header.getBoundingClientRect().bottom
  const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
  const finalContentBottom = getCatalogContentBottom(catalog, headerBottom)
  const naturalAboutTop = readCachedAboutNaturalTop(about)
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
    applyFooterComposition(time)
    return
  }

  applyFooterComposition(time)
  siteState.galleryFrame = requestAnimationFrame(animateFooterGallery)
}

function nudgeFooterGallery() {
  if (!siteState.hasFooterGallery) return

  const { gallery } = siteState.dom
  if (!gallery) return
  if (!footerGalleryWorkActive(gallery)) return

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
    activeColorBreathHoldMs: 220,
    activeColorBreathAmount: 0.56,
    activeColorBreathRate: 0.42,
  }

  return (
    window.__RED_ACTIVE_COLOR_SNOW__?.getConfig?.() ||
    window.__RED_ACTIVE_COLOR_CONFIG__ ||
    fallbackConfig
  )
}

function catalogColorSnowBreathHoldMs(config) {
  const value = Math.max(0, Number(config?.activeColorBreathHoldMs) || 0)
  return catalogFilterDuration(Math.min(520, value))
}

function catalogColorSnowSwapOverlapMs(config) {
  if (prefersReducedMotion()) return 0
  const defaultOverlap = catalogFilterDuration(CATALOG_COLOR_SNOW_SWAP_OVERLAP_MS)
  const breathHold = catalogColorSnowBreathHoldMs(config)
  if (!breathHold) return defaultOverlap
  return Math.min(defaultOverlap, Math.max(48, breathHold * 0.35))
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
    base +
      catalogFilterDuration(CATALOG_COLOR_SNOW_EXIT_COVER_MS) +
      catalogColorSnowBreathHoldMs(config),
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
      catalogColorSnowBreathHoldMs(config) +
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
    activeColorBreathHoldMs: 220,
  }
  const config = catalogActiveColorConfig()
  if (!catalog || !config?.activeColorEnabled || prefersReducedMotion()) return 0

  const cards = catalogColorSnowMotionCards(catalog, direction)
  if (!cards.length) return 0

  const override = readCatalogSnowDuration(
    catalog,
    direction === "out"
      ? "colorSnowExitDurationMs"
      : "colorSnowEnterDurationMs",
  )
  const baseDuration = override ?? (
    (
      direction === "out"
        ? Number(config.activeColorExitDurationMs)
        : Number(config.activeColorDurationMs) + Number(config.activeColorSettleMs || 0)
    ) + catalogColorSnowBreathHoldMs(config)
  )
  const startDelay = Number(config.activeColorDelayMs) || 0
  const stagger = Number(config.activeColorStaggerMs) || 0
  const finalDelay = Math.max(0, cards.length - 1) * Math.max(0, stagger)
  const total = Math.max(0, baseDuration || 0) + startDelay + finalDelay
  const fallbackTotal =
    Math.max(0, fallbackConfig.activeColorExitDurationMs) +
    fallbackConfig.activeColorDelayMs +
    Math.max(0, cards.length - 1) * fallbackConfig.activeColorStaggerMs +
    catalogFilterDuration(fallbackConfig.activeColorBreathHoldMs)
  return catalogFilterDuration(Math.max(total, fallbackTotal))
}

function catalogColorSnowMotionCards(catalog, direction) {
  if (!catalog) return []

  const cards = [...catalog.querySelectorAll(".project-card")]
  const candidates = direction === "out"
    ? cards
    : cards.filter((card) => !card.classList.contains("is-filter-muted"))
  return candidates.filter((card) => isNearViewport(card, CATALOG_COLOR_SNOW_VIEWPORT_MARGIN))
}

function catalogColorSnowMotionDelay(catalog, direction, step, maxDelay) {
  const cards = catalogColorSnowMotionCards(catalog, direction)
  return cards.length ? Math.min(Math.max(0, cards.length - 1) * step, maxDelay) : 0
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
  setupMediaDominantBackgrounds(catalog)
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
  if (publicDitherOwnsMutedCards()) return
  if (!card || siteState.halftoneRenderQueued.has(card)) return
  siteState.halftoneRenderQueued.add(card)
  siteState.halftoneRenderQueue.push(card)
  if (siteState.halftoneRenderFrame) return
  siteState.halftoneRenderFrame = requestAnimationFrame(processCatalogHalftoneRenderQueue)
}

function processCatalogHalftoneRenderQueue() {
  siteState.halftoneRenderFrame = 0
  if (publicDitherOwnsMutedCards()) {
    siteState.halftoneRenderQueue.length = 0
    siteState.halftoneRenderQueued.clear()
    return
  }
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

function publicDitherOwnsMutedCards() {
  const mode = document.documentElement.getAttribute("data-red-published-dither")
  return Boolean(mode && mode !== "native")
}

function stopLegacyCatalogHalftoneWork() {
  stopCatalogHalftoneAnimation()
  stopCatalogHalftoneVisibleUpdate()
  if (siteState.halftoneRenderFrame) cancelAnimationFrame(siteState.halftoneRenderFrame)
  siteState.halftoneRenderFrame = 0
  siteState.halftoneRenderQueue.length = 0
  siteState.halftoneRenderQueued.clear()
  disconnectCatalogHalftoneObservers()
  siteState.halftoneObserverReady = true
}

function setupCatalogHalftoneObservers(catalog = siteState.dom.catalog) {
  if (!catalog) return
  if (publicDitherOwnsMutedCards()) {
    stopLegacyCatalogHalftoneWork()
    return
  }

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

function catalogVisibleDitherIncompleteCount(catalog) {
  if (!catalog?.dataset.activeFilter || !publicDitherOwnsMutedCards()) return 0

  return [...catalog.querySelectorAll(".project-card.is-filter-muted")]
    .filter((card) => isNearViewport(card, CATALOG_COLOR_SNOW_VIEWPORT_MARGIN))
    .filter((card) => {
      const media = card.querySelector(".project-media")
      const canvas = media?.querySelector('.dither-preview-canvas[data-active="true"]')
      return (
        card.hasAttribute("data-dither-pending") ||
        card.hasAttribute("data-dither-category-enter-reveal") ||
        media?.getAttribute("data-dither-ready") !== "true" ||
        !canvas ||
        canvas.width <= 1 ||
        canvas.height <= 1
      )
    })
    .length
}

function settleCatalogFilterEnter(catalog, cycle, usesLegacyHalftone, motionEnterDelay) {
  if (cycle !== siteState.catalogFilterCycle) return
  if (!catalog.isConnected || catalog.dataset.filterPhase !== "entering") return

  catalog.dataset.filterPhase = "settling"
  if (usesLegacyHalftone) catalog.dataset.halftonePhase = "waiting"
  else delete catalog.dataset.halftonePhase
  requestLayoutEffectsUpdate({ rules: siteState.hasProjectRuleTargets })

  if (!usesLegacyHalftone) return
  window.setTimeout(() => {
    if (cycle !== siteState.catalogFilterCycle) return
    if (!catalog.isConnected || catalog.dataset.filterPhase !== "settling") return
    catalog.dataset.halftonePhase = "printing"
    animateCatalogHalftoneDots(catalog, cycle, {
      duration: CATALOG_HALFTONE_DRAW_MS,
    })
  }, catalogFilterDuration(CATALOG_FILTER_ENTER_MS + motionEnterDelay + CATALOG_HALFTONE_DELAY_MS))
}

function waitForCatalogEnterDitherReady(
  catalog,
  cycle,
  usesLegacyHalftone,
  motionEnterDelay,
  startedAt = performance.now(),
) {
  if (cycle !== siteState.catalogFilterCycle) return
  if (!catalog?.isConnected || catalog.dataset.filterPhase !== "entering") return

  const elapsed = performance.now() - startedAt
  const ready =
    usesLegacyHalftone ||
    catalogVisibleDitherIncompleteCount(catalog) <= 0 ||
    elapsed >= catalogFilterDuration(CATALOG_ENTER_DITHER_READY_MAX_WAIT_MS)

  if (ready) {
    requestAnimationFrame(() => {
      settleCatalogFilterEnter(catalog, cycle, usesLegacyHalftone, motionEnterDelay)
    })
    return
  }

  requestAnimationFrame(() => {
    waitForCatalogEnterDitherReady(
      catalog,
      cycle,
      usesLegacyHalftone,
      motionEnterDelay,
      startedAt,
    )
  })
}

function updateVisibleCatalogHalftoneCards(catalog = siteState.dom.catalog) {
  if (publicDitherOwnsMutedCards()) {
    siteState.visibleHalftoneCards = []
    return siteState.visibleHalftoneCards
  }

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
  if (publicDitherOwnsMutedCards()) return
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
  if (publicDitherOwnsMutedCards()) return
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
  if (publicDitherOwnsMutedCards()) return
  renderCatalogHalftones(catalog, 1)
}

function primeCatalogHalftoneDots(catalog, progress = 0) {
  stopCatalogHalftoneAnimation()
  stopCatalogHalftoneVisibleUpdate()
  if (publicDitherOwnsMutedCards()) return
  renderCatalogHalftones(catalog, progress)
}

function animateCatalogHalftoneDots(catalog, cycle, options = {}) {
  stopCatalogHalftoneAnimation()
  if (publicDitherOwnsMutedCards()) return

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

  const top = sectionScrollTop(hash)
  if (top === null) return false

  if (options.immediate || prefersReducedMotion()) {
    cancelSectionScroll({ suppressMagnet: SECTION_SCROLL_MAGNET_SUPPRESS_MS })
    window.scrollTo({ top, left: 0, behavior: "auto" })
    syncScrollDrivenVisuals({ publishMoving: false })
    publishHeaderMotionState(false)
    return true
  }

  const startY = window.scrollY || window.pageYOffset || 0
  const distance = top - startY
  const duration = Number.isFinite(options.duration)
    ? Math.max(1, options.duration)
    : sectionScrollDuration(distance)
  if (Math.abs(distance) <= 1.5 || duration <= 1) {
    cancelSectionScroll({ suppressMagnet: SECTION_SCROLL_MAGNET_SUPPRESS_MS })
    window.scrollTo({ top, left: 0, behavior: "auto" })
    syncScrollDrivenVisuals({ publishMoving: false })
    publishHeaderMotionState(false)
    return true
  }

  cancelSectionScroll()
  const token = siteState.sectionScrollToken + 1
  siteState.sectionScrollToken = token
  const startedAt = performance.now()
  let targetY = top
  const previousBehavior = document.documentElement.style.scrollBehavior
  siteState.sectionScrollPreviousBehavior = previousBehavior
  document.documentElement.style.scrollBehavior = "auto"
  document.documentElement.dataset.sectionScroll = "moving"
  window.__RED_SCROLL_MAGNET__?.cancel?.({ suppress: duration + SECTION_SCROLL_MAGNET_SUPPRESS_MS })

  const cancelByInput = () => {
    if (performance.now() - startedAt < SECTION_SCROLL_INPUT_GRACE_MS) return
    cancelSectionScroll({ sync: true, suppressMagnet: SECTION_SCROLL_MAGNET_SUPPRESS_MS })
  }
  window.addEventListener("wheel", cancelByInput, { passive: true, capture: true })
  window.addEventListener("touchstart", cancelByInput, { passive: true, capture: true })
  window.addEventListener("keydown", cancelByInput, { passive: true, capture: true })
  siteState.sectionScrollCleanup = () => {
    window.removeEventListener("wheel", cancelByInput, { capture: true })
    window.removeEventListener("touchstart", cancelByInput, { capture: true })
    window.removeEventListener("keydown", cancelByInput, { capture: true })
  }

  publishHeaderMotionState(true)
  const finish = () => {
    if (token !== siteState.sectionScrollToken) return
    siteState.sectionScrollFrame = 0
    const finalTop = sectionScrollTop(hash) ?? targetY
    window.scrollTo({ top: clamp(finalTop, 0, pageMaxScrollY()), left: 0, behavior: "auto" })
    cleanupSectionScrollEnvironment()
    syncScrollDrivenVisuals({ publishMoving: false })
    publishHeaderMotionState(false)
    window.__RED_SCROLL_MAGNET__?.cancel?.({ suppress: SECTION_SCROLL_MAGNET_SUPPRESS_MS })
  }

  const frame = (time) => {
    if (token !== siteState.sectionScrollToken) return
    const raw = clamp((time - startedAt) / duration, 0, 1)
    const nextTarget = sectionScrollTop(hash)
    if (nextTarget !== null) {
      targetY += (nextTarget - targetY) * 0.36
    }

    const eased = smoothstep(raw)
    const nextY = clamp(startY + (targetY - startY) * eased, 0, pageMaxScrollY())
    window.scrollTo({ top: nextY, left: 0, behavior: "auto" })
    syncScrollDrivenVisuals({ publishMoving: true })

    if (raw >= 1) {
      finish()
      return
    }

    siteState.sectionScrollFrame = requestAnimationFrame(frame)
  }

  siteState.sectionScrollFrame = requestAnimationFrame(frame)
  return true
}

function updatePageHash(hash) {
  const nextUrl = `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ""}`
  window.history.replaceState(null, "", nextUrl)
}

function scheduleScrollToPageSection(hash, options = {}) {
  const delay = Number.isFinite(options.delay) ? options.delay : 0
  const attempts = options.immediate ? Math.max(1, options.attempts || 2) : 1
  let count = 0
  clearSectionScrollTimers()

  const run = () => {
    siteState.sectionScrollTimers.delete(timer)
    const scroll = () => scrollToPageSection(hash, options)
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(scroll)
    } else {
      scroll()
    }

    count += 1
    if (count < attempts) {
      timer = window.setTimeout(run, catalogFilterDuration(180))
      siteState.sectionScrollTimers.add(timer)
    }
  }

  let timer = window.setTimeout(run, delay)
  siteState.sectionScrollTimers.add(timer)
}

function replaceCatalogFilterImmediately(category) {
  clearProjectPreviewExitGhosts()
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
  clearProjectPreviewFilterState(catalog, { restoreFilter: false, refresh: false })
  delete catalog.dataset.projectPreview
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
  clearProjectPreviewFilterState(catalog, { restoreFilter: false, refresh: false })
  delete catalog.dataset.projectPreview
  const usesLegacyHalftone = !publicDitherOwnsMutedCards()
  catalog.dataset.filterPhase = "entering"
  if (usesLegacyHalftone) catalog.dataset.halftonePhase = "primed"
  else delete catalog.dataset.halftonePhase
  catalog.innerHTML = catalogRowsMarkup(category)
  refreshDomCache()
  siteState.catalogFilterCurrent = category
  siteState.catalogFilterPhase = "entering"
  updateCatalogFilterDataset(catalog, category)
  if (usesLegacyHalftone) primeCatalogHalftoneDots(catalog)
  setCatalogCardTimingVars(
    catalog,
    "--project-filter-enter-delay",
    CATALOG_FILTER_STAGGER_MS,
    224,
  )
  const motionEnterDelay = catalogColorSnowMotionDelay(
    catalog,
    "in",
    CATALOG_FILTER_STAGGER_MS,
    224,
  )
  refreshCatalogAfterFilter(catalog)
  planCatalogEnterSnowTiming(catalog, performance.now() - commitStarted)

  catalog.getBoundingClientRect()
  window.setTimeout(() => requestAnimationFrame(() => {
    if (cycle !== siteState.catalogFilterCycle) return
    waitForCatalogEnterDitherReady(catalog, cycle, usesLegacyHalftone, motionEnterDelay)
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
    catalogFilterDuration(CATALOG_FILTER_ENTER_MS) + motionEnterDelay + 80,
    catalogFineSignalSnowDuration(catalog, "in") + 80,
    usesLegacyHalftone
      ? catalogFilterDuration(CATALOG_FILTER_ENTER_MS + CATALOG_HALFTONE_DELAY_MS + CATALOG_HALFTONE_DRAW_MS) +
        motionEnterDelay +
        160
      : 0,
  ))
}

function startCatalogFilterTransition() {
  clearProjectPreviewExitGhosts()
  // A detail drawer owns a ResizeObserver and an expanded document subtree.
  // Close it before replacing catalog rows so filtering cannot leave a stale
  // observer or detached drawer state behind.
  if (activeProjectDetailDrawer()) closeProjectDetailDrawer({ immediate: true })
  const catalog = document.querySelector(".catalog")
  if (!catalog) {
    siteState.catalogFilterCurrent = siteState.catalogFilterTarget
    siteState.catalogFilterPhase = "idle"
    return
  }

  const preview = activeProjectPreview()
  if (preview) {
    const previewMotionId = siteState.projectPreviewMotionId + 1
    siteState.projectPreviewMotionId = previewMotionId
    const exitMotion = createProjectPreviewExitGhost(preview)
    clearProjectPreviewExpandMotion(preview)
    clearProjectPreviewHeightLock(preview)
    document.documentElement.dataset.projectPreviewTransition = "filtering"
    commitProjectPreviewState(preview, false)
    runProjectPreviewExitGhost(exitMotion, preview, {
      clearTransition: true,
      motionId: previewMotionId,
      fade: true,
    })
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
  setCatalogCardTimingVars(
    catalog,
    "--project-filter-exit-delay",
    Math.max(18, CATALOG_FILTER_STAGGER_MS - 6),
    176,
  )
  const motionExitDelay = catalogColorSnowMotionDelay(
    catalog,
    "out",
    Math.max(18, CATALOG_FILTER_STAGGER_MS - 6),
    176,
  )
  catalog.dataset.filterPhase = "exiting"

  const activeColorConfig = catalogActiveColorConfig()
  const snowExitDuration = catalogFineSignalSnowDuration(catalog, "out")
  const cssExitDuration = catalogFilterDuration(CATALOG_FILTER_EXIT_MS) + motionExitDelay + 40
  const snowSwapDuration = Math.max(
    0,
    snowExitDuration - catalogColorSnowSwapOverlapMs(activeColorConfig),
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
    card.removeAttribute(ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE)
    card.classList.remove("is-muted-restore-intent")
    card.classList.remove("is-muted-restore-return")
  })
}

function catalogMutedHoverSuppressed(event) {
  return Boolean(
    event?.type?.startsWith?.("pointer") &&
      window.__RED_ACTIVE_COLOR_SNOW__?.hoverSuppressed?.(),
  )
}

function setupFilteredCatalogRestore(catalog) {
  if (!catalog) return

  catalog.querySelectorAll(".project-card.is-filter-muted").forEach((card) => {
    if (siteState.filteredRestoreCardsBound.has(card)) return
    siteState.filteredRestoreCardsBound.add(card)

    const clearIntent = () => {
      if (!card.classList.contains("is-muted-restore-intent")) return

      window.clearTimeout(card.__catalogMutedReturnTimer)
      card.removeAttribute(ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE)
      card.classList.remove("is-muted-restore-intent")
      card.classList.add("is-muted-restore-return")
      card.__catalogMutedReturnTimer = window.setTimeout(() => {
        card.classList.remove("is-muted-restore-return")
        card.__catalogMutedReturnTimer = 0
      }, catalogFilterDuration(CATALOG_MUTED_HOVER_MS) + 30)
    }

    const scheduleIntent = (event) => {
      if (event?.pointerType === "touch") return
      if (catalogMutedHoverSuppressed(event)) return
      if (!card.isConnected || !card.classList.contains("is-filter-muted")) return

      window.clearTimeout(card.__catalogMutedReturnTimer)
      card.__catalogMutedReturnTimer = 0
      if (card.classList.contains("is-muted-restore-intent")) return
      card.removeAttribute(ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE)
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
  let hoveredItem = null
  let visualStateKey = ""

  const itemForCategory = (category) => itemsByCategory.get(category) || null

  const setVisualActive = (activeItem) => {
    const lockedItem = itemForCategory(siteState.catalogFilterLocked)
    const visibleItem = lockedItem || activeItem
    const nextVisualStateKey = [
      visibleItem?.dataset.navCategory || "",
      siteState.catalogFilterLocked || "",
    ].join(":")

    if (visualStateKey === nextVisualStateKey) return
    visualStateKey = nextVisualStateKey

    items.forEach((item) => {
      item.classList.toggle("is-nav-active", item === visibleItem && item !== lockedItem)
      item.classList.toggle("is-nav-locked", item === lockedItem)
      item.classList.remove("is-nav-lock-suppressed")
    })
  }

  const clearActive = () => {
    window.clearTimeout(clearTimer)
    clearTimer = 0
    hoveredItem = null
    setVisualActive(itemForCategory(siteState.catalogFilterLocked))
    if (!siteState.catalogFilterLocked) setCatalogFilter(null)
  }

  const setActive = (activeItem, options = {}) => {
    window.clearTimeout(clearTimer)
    clearTimer = 0
    const category = normalizeCatalogFilter(activeItem?.dataset.navCategory || null)
    setVisualActive(activeItem)

    if (siteState.catalogFilterLocked && !options.forceFilter) return

    setCatalogFilter(category)
  }

  const updateFilterHash = (category) => {
    updatePageHash(category)
  }

  const initialHash = decodedUrlHash(new URL(window.location.href))
  const initialCategory = normalizeCatalogFilter(initialHash)
  if (initialCategory && document.querySelector(".catalog")) {
    siteState.catalogFilterLocked = initialCategory
    replaceCatalogFilterImmediately(initialCategory)
    setVisualActive(itemForCategory(initialCategory))
  } else if (
    initialHash === "resume" &&
    document.querySelector(".catalog") &&
    siteState.homeReturnTransition?.targetHash !== "resume"
  ) {
    scheduleScrollToPageSection("resume", { immediate: true, attempts: 5, delay: 180 })
  }

  nav.addEventListener("pointerenter", () => {
    window.clearTimeout(clearTimer)
    clearTimer = 0
  })

  nav.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return
    // A detail line is an absolutely positioned child and can temporarily
    // cross the nav boundary while its reveal/layout transition is running.
    // Do not clear the active category while the pointer is still inside the
    // nav hit region; otherwise the detail disappears and immediately causes
    // another enter/leave cycle under a stationary pointer.
    if (event.relatedTarget && nav.contains(event.relatedTarget)) return
    if (nav.matches(":hover")) return
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
      if (event.defaultPrevented) return
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
      setActive(item, { forceFilter: true })
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
    publishHeaderMotionState(false)
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
    publishHeaderMotionState(false)
    return
  }

  publishHeaderMotionState(true)
  if (!siteState.followFrame) {
    siteState.followFrame = requestAnimationFrame(animateHeader)
  }
}

function shouldSuppressHeaderScrollDelta(delta) {
  if (isSectionScrollMotionActive()) return true
  if (isScrollMagnetMotionActive()) return true
  if (performance.now() < siteState.headerDirectScrollInputUntil) return true
  if (!isHeaderMotionActive()) return false

  const deltaDirection = Math.sign(delta)
  const motionDirection = Math.sign(siteState.targetProgress - siteState.visualProgress)
  if (!deltaDirection || !motionDirection) return false
  if (deltaDirection !== motionDirection) return true

  return Math.abs(delta) <= HEADER_SCROLL_ANCHOR_JITTER_PX * 2.5
}

function updateHeaderFromScroll(delta) {
  if (isHomeReturnTransitionActive()) return
  const metrics = readHeaderMetrics()
  const scrollY = window.scrollY || window.pageYOffset || 0
  if (scrollY <= 2 && delta <= 0) {
    setHeaderTarget(0)
    return
  }
  if (Math.abs(delta) < 0.35) return

  const nearExpanded = siteState.targetProgress <= HEADER_SCROLL_EDGE_EPSILON
  const nearCompact = siteState.targetProgress >= 1 - HEADER_SCROLL_EDGE_EPSILON
  if (
    scrollY > metrics.distance + 24 &&
    Math.abs(delta) <= HEADER_SCROLL_ANCHOR_JITTER_PX &&
    (nearExpanded || nearCompact)
  ) {
    setHeaderTarget(nearCompact ? 1 : 0)
    return
  }

  setHeaderTarget(siteState.targetProgress + delta / metrics.distance)
}

function requestScrollEffectsUpdate(delta) {
  if (isHomeReturnTransitionActive()) return
  if (Math.abs(delta) > 0.35) {
    siteState.scrollDirection = delta > 0 ? 1 : -1
    document.documentElement.dataset.drawerDirection = delta > 0 ? "down" : "up"
  }
  siteState.pendingScrollDelta += delta
  if (siteState.scrollFrame) return

  siteState.scrollFrame = requestAnimationFrame(() => {
    const pendingDelta = siteState.pendingScrollDelta
    siteState.pendingScrollDelta = 0
    siteState.scrollFrame = 0

    if (!shouldSuppressHeaderScrollDelta(pendingDelta)) updateHeaderFromScroll(pendingDelta)
    if (!isHeaderMotionActive()) syncHeaderFlowGap()
    requestProjectDetailHeaderUpdate()
    nudgeFooterGallery()
    markCatalogRuleScrollActivity(pendingDelta)
    requestLayoutEffectsUpdate({ rules: siteState.hasProjectRuleTargets })
    if (!siteState.halftoneObserver || !siteState.halftoneObserverReady) {
      requestVisibleCatalogHalftones()
    }
  })
}

function startResponsiveLayoutTransition() {
  // A resize drag can emit dozens of events. Keep one transition window for
  // the burst instead of restarting it on every event, which would leave the
  // header perpetually animating and accumulate layout work.
  if (document.body.dataset.layoutTransition === "true") return
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
      if (hasVerticalScroll && isSectionScrollMotionActive()) return
      if (hasVerticalScroll) {
        markHeaderDirectScrollInput()
        updateHeaderFromScroll(verticalDelta)
      }
    },
    { passive: true }
  )

  window.addEventListener(
    "touchmove",
    () => holdFooterGalleryDuringScroll(),
    { passive: true },
  )

  const handleScrollFrame = (snapshot = null) => {
    if (snapshot && !snapshot.windowScroll) return
    const current = snapshot?.scrollY ?? (window.scrollY || window.pageYOffset || 0)
    const delta = current - siteState.lastScrollY
    siteState.lastScrollY = current
    requestScrollEffectsUpdate(delta)
  }
  if (window.__RED_SCROLL_FRAME__?.subscribe) {
    window.__RED_SCROLL_FRAME__.subscribe(handleScrollFrame, { priority: 10 })
  } else {
    window.addEventListener("scroll", handleScrollFrame, { passive: true })
  }

  window.addEventListener("resize", () => {
    // Drop viewport-derived caches synchronously, before the coalescing frame:
    // anything reading header metrics between this event and that frame must
    // see the new width, not the previous one.
    siteState.headerMetricsWidth = -1
    siteState.headerMetrics = null
    // Set the transition state in the resize event itself, before the next
    // paint. Waiting for the coalesced RAF lets media-query layout changes
    // flash at their new breakpoint for one frame.
    startResponsiveLayoutTransition()
    if (siteState.resizeFrame) return
    siteState.resizeFrame = requestAnimationFrame(() => {
      siteState.resizeFrame = 0
      siteState.galleryLayoutDirty = true
      siteState.galleryLayoutMetrics = null
      siteState.galleryViewportLeft = null
      invalidateCatalogHalftoneGeometry()
      invalidateCatalogContentBottom()
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
    if (siteState.hoverEmbedMediaBound.has(media)) return
    siteState.hoverEmbedMediaBound.add(media)
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

function activeProjectPreview() {
  return document.querySelector(".project-card.is-project-preview:not(.project-preview-exit-ghost)")
}

function ensureProjectHalftoneCanvas(card) {
  const media = card?.querySelector?.(".project-media")
  if (!media || media.querySelector(".project-halftone")) return

  const canvas = document.createElement("canvas")
  canvas.className = "project-halftone"
  canvas.setAttribute("aria-hidden", "true")
  media.appendChild(canvas)
}

function restoreCardBaseMutedState(card) {
  if (!card) return

  window.clearTimeout(card.__catalogMutedReturnTimer)
  card.__catalogMutedReturnTimer = 0
  card.removeAttribute(ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE)
  card.removeAttribute(PROJECT_PREVIEW_ACTIVE_ATTRIBUTE)
  card.removeAttribute(PROJECT_PREVIEW_FILTER_MUTED_ATTRIBUTE)
  card.removeAttribute(DITHER_CATEGORY_ENTER_ATTRIBUTE)
  card.classList.remove("is-muted-restore-intent", "is-muted-restore-return")

  if (card.dataset.filterMuted === "true") {
    card.classList.add("is-filter-muted")
    ensureProjectHalftoneCanvas(card)
  } else {
    card.classList.remove("is-filter-muted")
  }
}

function clearProjectPreviewFilterState(catalog, options = {}) {
  if (!catalog) return

  const restoreFilter = options.restoreFilter !== false
  const refresh = options.refresh !== false
  const previousFilter = catalog.getAttribute(PROJECT_PREVIEW_PREVIOUS_FILTER_ATTRIBUTE)
  catalog.querySelectorAll(".project-card").forEach(restoreCardBaseMutedState)
  catalog.removeAttribute(PROJECT_PREVIEW_PREVIOUS_FILTER_ATTRIBUTE)
  delete catalog.dataset.projectPreviewFilter
  clearProjectPreviewRowState(catalog)

  if (restoreFilter) {
    if (previousFilter !== null) {
      if (previousFilter) catalog.dataset.activeFilter = previousFilter
      else delete catalog.dataset.activeFilter
    } else if (catalog.dataset.activeFilter === PROJECT_PREVIEW_FILTER_VALUE) {
      delete catalog.dataset.activeFilter
    }
  }

  if (!refresh) return
  refreshDomCache()
  setupFilteredCatalogRestore(catalog)
  updateVisibleCatalogHalftoneCards(catalog)
  window.__RED_DITHER_PUBLIC_RUNTIME__?.render?.()
}

function syncProjectPreviewFilterState(catalog, activeCard) {
  if (!catalog || !activeCard) {
    clearProjectPreviewFilterState(catalog)
    return
  }

  if (!catalog.hasAttribute(PROJECT_PREVIEW_PREVIOUS_FILTER_ATTRIBUTE)) {
    catalog.setAttribute(PROJECT_PREVIEW_PREVIOUS_FILTER_ATTRIBUTE, catalog.dataset.activeFilter || "")
  }
  if (!catalog.dataset.activeFilter) {
    catalog.dataset.activeFilter = PROJECT_PREVIEW_FILTER_VALUE
  }
  catalog.dataset.projectPreviewFilter = "true"

  catalog.querySelectorAll(".project-card").forEach((card) => {
    window.clearTimeout(card.__catalogMutedReturnTimer)
    card.__catalogMutedReturnTimer = 0
    card.removeAttribute(ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE)
    card.classList.remove("is-muted-restore-intent", "is-muted-restore-return")

    if (card === activeCard) {
      card.setAttribute(PROJECT_PREVIEW_ACTIVE_ATTRIBUTE, "true")
      card.removeAttribute(PROJECT_PREVIEW_FILTER_MUTED_ATTRIBUTE)
      card.removeAttribute(DITHER_CATEGORY_ENTER_ATTRIBUTE)
      card.classList.remove("is-filter-muted")
      return
    }

    card.removeAttribute(PROJECT_PREVIEW_ACTIVE_ATTRIBUTE)
    card.setAttribute(PROJECT_PREVIEW_FILTER_MUTED_ATTRIBUTE, "true")
    card.setAttribute(DITHER_CATEGORY_ENTER_ATTRIBUTE, "true")
    card.classList.add("is-filter-muted")
    ensureProjectHalftoneCanvas(card)
    bindDominantMediaBackground(card)
  })

  refreshDomCache()
  setupFilteredCatalogRestore(catalog)
  updateVisibleCatalogHalftoneCards(catalog)
  window.__RED_DITHER_PUBLIC_RUNTIME__?.render?.()
}

function refreshAfterProjectPreviewChange() {
  window.dispatchEvent(new Event("red:layout-geometry-invalidated"))
  invalidateRuleGeometry()
  invalidateCatalogContentBottom()
  siteState.galleryLayoutDirty = true
  window.__RED_SCROLL_MAGNET__?.cancel?.({ suppress: 760 })
  window.__RED_SCROLL_MAGNET__?.refresh?.()
  requestLayoutEffectsUpdate({ rules: true, footer: true })
}

function clearProjectPreviewRowState(catalog) {
  catalog?.querySelectorAll?.(".project-row.has-project-preview, .project-row.is-before-project-preview")
    .forEach((row) => {
      row.classList.remove("has-project-preview", "is-before-project-preview")
    })
}

function syncProjectPreviewRows(card, expanded) {
  const catalog = card?.closest?.(".catalog")
  clearProjectPreviewRowState(catalog)
  if (!expanded) return

  const row = card.closest(".project-row")
  row?.classList.add("has-project-preview")
  const previousRow = row?.previousElementSibling
  if (previousRow?.classList?.contains("project-row")) {
    previousRow.classList.add("is-before-project-preview")
  }
}

function prepareProjectPreviewExpandMotion(card) {
  if (!card) return

  // Keep the originating side available to the paint-only transition layers.
  // Geometry still comes from FLIP; this attribute only controls reveal order.
  card.dataset.projectPreviewMotionSide = card.dataset.cardSide === "right" ? "right" : "left"

  const rect = card.getBoundingClientRect()
  const viewportWidth = Math.max(
    window.innerWidth || 0,
    document.documentElement.clientWidth || 0,
    Math.ceil(rect.right),
    1,
  )
  const startLeft = clamp(Math.round(rect.left), 0, viewportWidth)
  const startRight = clamp(Math.round(viewportWidth - rect.right), 0, viewportWidth)

  card.style.setProperty("--project-preview-start-left", `${startLeft}px`)
  card.style.setProperty("--project-preview-start-right", `${startRight}px`)
  if (rect.height > 0) card.style.setProperty("--project-preview-start-height", `${rect.height.toFixed(2)}px`)
  card.setAttribute("data-project-preview-expanding", "true")
}

function normalProjectCardFallbackRect(card, sourceRect) {
  const row = card?.closest?.(".project-row")
  if (!row || !sourceRect) return sourceRect

  const viewportWidth = Math.max(
    window.innerWidth || 0,
    document.documentElement.clientWidth || 0,
    1,
  )
  const rowRect = row.getBoundingClientRect()
  const compactLayout = window.matchMedia?.("(max-width: 980px), (orientation: portrait)")?.matches === true
  if (compactLayout) {
    return {
      left: rowRect.left,
      right: rowRect.right,
      top: sourceRect.top,
      bottom: sourceRect.bottom,
      width: rowRect.width,
      height: sourceRect.height,
    }
  }

  const style = getComputedStyle(row)
  const gap = Number.parseFloat(style.columnGap) || 0
  const columnWidth = Math.max(0, (rowRect.width - gap) / 2)
  const side = card.dataset.cardSide === "right" ? "right" : "left"
  const left = side === "right" ? rowRect.left + columnWidth + gap : rowRect.left
  const right = side === "right" ? rowRect.right : left + columnWidth

  return {
    left: clamp(left, 0, viewportWidth),
    right: clamp(right, 0, viewportWidth),
    top: sourceRect.top,
    bottom: sourceRect.bottom,
    width: Math.max(0, right - left),
    height: sourceRect.height,
  }
}

function createProjectPreviewExitGhost(card) {
  if (!card?.isConnected) return null
  const side = card.dataset.cardSide === "right" ? "right" : "left"

  const rect = card.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null

  const sourceRect = {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
  const sourceRow = card.closest(".project-row")
  const ghost = card.cloneNode(true)
  ghost.classList.add("project-preview-exit-ghost")
  ghost.dataset.projectPreviewMotionSide = card.dataset.cardSide === "right" ? "right" : "left"
  ghost.classList.remove("is-muted-restore-intent", "is-muted-restore-return", "is-filter-muted")
  ghost.setAttribute("aria-hidden", "true")
  ghost.setAttribute("tabindex", "-1")
  ghost.removeAttribute("href")
  ghost.removeAttribute("id")
  ghost.removeAttribute("data-project-card")
  ghost.removeAttribute("data-project-preview-expanding")
  ghost.removeAttribute("data-project-preview-exiting")
  ghost.removeAttribute(PROJECT_PREVIEW_ACTIVE_ATTRIBUTE)
  ghost.removeAttribute(PROJECT_PREVIEW_FILTER_MUTED_ATTRIBUTE)
  ghost.removeAttribute(DITHER_CATEGORY_ENTER_ATTRIBUTE)
  ghost.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"))
  ghost
    .querySelectorAll(".dither-preview-canvas, .dither-reveal-canvas, .project-halftone, iframe")
    .forEach((element) => element.remove())
  ghost.querySelectorAll(".project-media img").forEach((image) => {
    image.loading = "eager"
    image.decoding = "async"
  })
  const copy = ghost.querySelector(".project-preview-copy")
  copy?.setAttribute("aria-hidden", "false")
  if (copy) {
    copy.style.animation = "none"
    copy.style.opacity = "0"
    copy.style.transform = `translate3d(${side === "right" ? "-18px" : "18px"}, 0, 0)`
  }

  sourceRow?.classList.add("is-project-preview-exit-source")
  card.classList.add("is-project-preview-exit-source-card")
  ghost.__projectPreviewExitSourceRow = sourceRow
  ghost.__projectPreviewExitSourceCard = card

  ghost.style.setProperty("--project-preview-ghost-left", `${sourceRect.left + window.scrollX}px`)
  ghost.style.setProperty("--project-preview-ghost-top", `${sourceRect.top + window.scrollY}px`)
  ghost.style.setProperty("--project-preview-ghost-width", `${sourceRect.width}px`)
  ghost.style.setProperty("--project-preview-ghost-height", `${sourceRect.height}px`)

  document.body.appendChild(ghost)
  siteState.projectPreviewExitGhosts.add(ghost)
  return {
    ghost,
    sourceRect,
    fallbackRect: normalProjectCardFallbackRect(card, sourceRect),
  }
}

function projectPreviewRect(rect) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return null
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * Keep the source card painted while the row changes shape, then grow a
 * preview snapshot from that exact edge. The real card stays in the document
 * as the accessible target; the snapshot only hides the layout reflow that
 * would otherwise read as a jump.
 */
function createProjectPreviewExpandGhost(card, sourceRect, targetRect) {
  if (!card?.isConnected || !sourceRect || !targetRect) return null

  const ghost = card.cloneNode(true)
  const side = card.dataset.cardSide === "right" ? "right" : "left"
  ghost.classList.add("project-preview-expand-ghost")
  ghost.dataset.projectPreviewMotionSide = side
  ghost.classList.remove("is-muted-restore-intent", "is-muted-restore-return", "is-filter-muted")
  ghost.setAttribute("aria-hidden", "true")
  ghost.setAttribute("tabindex", "-1")
  ghost.removeAttribute("href")
  ghost.removeAttribute("id")
  ghost.removeAttribute("data-project-card")
  ghost.removeAttribute("data-project-preview-expanding")
  ghost.removeAttribute("data-project-preview-exiting")
  ghost.removeAttribute(PROJECT_PREVIEW_ACTIVE_ATTRIBUTE)
  ghost.removeAttribute(PROJECT_PREVIEW_FILTER_MUTED_ATTRIBUTE)
  ghost.removeAttribute(DITHER_CATEGORY_ENTER_ATTRIBUTE)
  ghost.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"))
  ghost.querySelectorAll(".dither-preview-canvas, .dither-reveal-canvas, .project-halftone, iframe")
    .forEach((element) => element.remove())
  ghost.querySelectorAll(".project-media img").forEach((image) => {
    image.loading = "eager"
    image.decoding = "async"
  })
  const copy = ghost.querySelector(".project-preview-copy")
  copy?.setAttribute("aria-hidden", "false")
  if (copy) {
    copy.style.animation = "none"
    copy.style.opacity = "0"
    copy.style.transform = `translate3d(${side === "right" ? "-18px" : "18px"}, 0, 0)`
  }

  ghost.style.setProperty("--project-preview-expand-origin", side === "right" ? "100% 50%" : "0% 50%")
  ghost.style.left = `${sourceRect.left}px`
  ghost.style.top = `${sourceRect.top}px`
  ghost.style.width = `${sourceRect.width}px`
  ghost.style.height = `${sourceRect.height}px`
  ghost.style.setProperty("--project-preview-expand-target-left", `${targetRect.left}px`)
  ghost.style.setProperty("--project-preview-expand-target-top", `${targetRect.top}px`)
  ghost.style.setProperty("--project-preview-expand-target-width", `${targetRect.width}px`)
  ghost.style.setProperty("--project-preview-expand-target-height", `${targetRect.height}px`)
  // The fixed paint layer starts at the source card's bounds. Keep its
  // directional wipe in viewport coordinates, but clamp the initial insets
  // to the source box so the first frame never clips the card away.
  ghost.style.setProperty("--project-preview-ghost-start-left", `${clamp(sourceRect.left - targetRect.left, 0, sourceRect.width)}px`)
  ghost.style.setProperty("--project-preview-ghost-start-right", `${clamp(targetRect.right - sourceRect.right, 0, sourceRect.width)}px`)

  document.body.appendChild(ghost)
  siteState.projectPreviewExpandGhosts.add(ghost)
  // Force the source-sized snapshot to paint before the target geometry is
  // applied. This makes the expansion a continuous horizontal gesture.
  void ghost.offsetWidth
  window.requestAnimationFrame(() => {
    if (!ghost.isConnected) return
    ghost.dataset.projectPreviewExpandState = "target"
    ghost.style.left = `${targetRect.left}px`
    ghost.style.top = `${targetRect.top}px`
    ghost.style.width = `${targetRect.width}px`
    ghost.style.height = `${targetRect.height}px`
    if (copy) {
      copy.style.opacity = "1"
      copy.style.transform = "translate3d(0, 0, 0)"
    }
  })

  return ghost
}

function validPreviewTargetRect(rect) {
  return Boolean(rect && rect.width > 0 && rect.height > 0)
}

function applyProjectPreviewExitTarget(exitMotion, targetCard) {
  if (!exitMotion?.ghost?.isConnected) return

  const { ghost, sourceRect, fallbackRect } = exitMotion
  const measuredRect = targetCard?.isConnected ? targetCard.getBoundingClientRect() : null
  const targetRect = validPreviewTargetRect(measuredRect) ? measuredRect : fallbackRect
  const left = clamp(targetRect.left - sourceRect.left, 0, sourceRect.width)
  const right = clamp(sourceRect.right - targetRect.right, 0, sourceRect.width)
  const top = clamp(targetRect.top - sourceRect.top, 0, sourceRect.height)
  const bottom = clamp(sourceRect.bottom - targetRect.bottom, 0, sourceRect.height)

  ghost.style.setProperty("--project-preview-exit-left", `${left}px`)
  ghost.style.setProperty("--project-preview-exit-right", `${right}px`)
  ghost.style.setProperty("--project-preview-exit-top", `${top}px`)
  ghost.style.setProperty("--project-preview-exit-bottom", `${bottom}px`)
  ghost.setAttribute("data-project-preview-exiting", "true")
}

function clearProjectPreviewExitGhosts() {
  for (const ghost of [...siteState.projectPreviewExpandGhosts]) {
    ghost.__projectPreviewExpandCard?.removeAttribute("data-project-preview-expand-ghosting")
    ghost.remove()
  }
  siteState.projectPreviewExpandGhosts.clear()
  if (!siteState.projectPreviewExitGhosts.size) return
  for (const ghost of [...siteState.projectPreviewExitGhosts]) {
    releaseProjectPreviewExitSource(ghost)
    ghost?.remove()
  }
  siteState.projectPreviewExitGhosts.clear()
}

function releaseProjectPreviewExitSource(ghost) {
  window.clearTimeout(ghost?.__projectPreviewExitSourceRevealTimer)
  if (ghost) ghost.__projectPreviewExitSourceRevealTimer = 0
  revealProjectPreviewExitSourceRow(ghost)
  ghost?.__projectPreviewExitSourceCard?.classList.remove("is-project-preview-exit-source-card")
}

function revealProjectPreviewExitSourceRow(ghost) {
  ghost?.__projectPreviewExitSourceRow?.classList.remove("is-project-preview-exit-source")
}

function runProjectPreviewExitGhost(
  exitMotion,
  targetCard,
  { clearTransition = false, motionId = 0, fade = false } = {},
) {
  if (!exitMotion?.ghost?.isConnected) {
    releaseProjectPreviewExitSource(exitMotion?.ghost)
    if (clearTransition && motionId === siteState.projectPreviewMotionId) {
      delete document.documentElement.dataset.projectPreviewTransition
    }
    return
  }

  const { ghost } = exitMotion
  if (fade) ghost.setAttribute("data-project-preview-exit-mode", "switching")
  else applyProjectPreviewExitTarget(exitMotion, targetCard)

  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    ghost.removeEventListener("animationend", handleAnimationEnd)
    ghost.removeEventListener("transitionend", handleTransitionEnd)
    releaseProjectPreviewExitSource(ghost)
    siteState.projectPreviewExitGhosts.delete(ghost)
    ghost.remove()
    if (clearTransition && motionId === siteState.projectPreviewMotionId) {
      delete document.documentElement.dataset.projectPreviewTransition
      refreshAfterProjectPreviewChange()
    }
  }
  const handleAnimationEnd = (event) => {
    if (event.target !== ghost) return
    cleanup()
  }
  const handleTransitionEnd = (event) => {
    if (event.target !== ghost || event.propertyName !== "opacity") return
    cleanup()
  }

  ghost.addEventListener("animationend", handleAnimationEnd)
  ghost.addEventListener("transitionend", handleTransitionEnd)
  if (fade) {
    ghost.__projectPreviewExitSourceRevealTimer = window.setTimeout(() => {
      ghost.__projectPreviewExitSourceRevealTimer = 0
      if (!ghost.isConnected || motionId !== siteState.projectPreviewMotionId) return
      revealProjectPreviewExitSourceRow(ghost)
    }, catalogFilterDuration(PROJECT_PREVIEW_EXIT_SOURCE_REVEAL_MS))
    // Let the outgoing snapshot paint once before fading it out.
    window.requestAnimationFrame(() => {
      if (!ghost.isConnected || motionId !== siteState.projectPreviewMotionId) return
      ghost.style.opacity = "0"
    })
  }
  window.setTimeout(cleanup, catalogFilterDuration(420) + 140)
}

function clearProjectPreviewExpandMotion(card) {
  if (!card) return

  card.removeAttribute("data-project-preview-expanding")
  delete card.dataset.projectPreviewMotionSide
  card.style.removeProperty("--project-preview-start-left")
  card.style.removeProperty("--project-preview-start-right")
}

function clearProjectPreviewHeightLock(card) {
  card?.style.removeProperty("--project-preview-start-height")
}

function commitProjectPreviewState(card, expanded) {
  const current = activeProjectPreview()
  const catalog = card.closest(".catalog")
  const retainsHoverMotion =
    expanded &&
    card?.classList.contains("is-filter-muted") &&
    (card.matches(":hover") || card.matches(":focus-within")) &&
    (
      card.classList.contains("is-muted-restore-intent") ||
      card.getAttribute("data-active-color-motion") === "true" ||
      card.getAttribute(ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE) === "true"
    )
  if (retainsHoverMotion) {
    card.setAttribute(BINARY_HANDOFF_SKIP_ATTRIBUTE, "true")
  }
  window.__RED_ACTIVE_COLOR_SNOW__?.stopCard?.(card)
  if (current && current !== card) {
    window.__RED_ACTIVE_COLOR_SNOW__?.stopCard?.(current)
  }
  syncProjectPreviewRows(card, false)
  if (current && current !== card) {
    current.classList.remove("is-project-preview")
    current.setAttribute("aria-expanded", "false")
    current.querySelector(".project-preview-copy")?.setAttribute("aria-hidden", "true")
    clearProjectPreviewExpandMotion(current)
    clearProjectPreviewHeightLock(current)
  }

  bindDominantMediaBackground(card)
  if (expanded) applyDominantMediaBackground(card)

  card.classList.toggle("is-project-preview", expanded)
  card.setAttribute("aria-expanded", expanded ? "true" : "false")
  card.querySelector(".project-preview-copy")?.setAttribute("aria-hidden", expanded ? "false" : "true")
  syncProjectPreviewRows(card, expanded)
  catalog?.toggleAttribute("data-project-preview", expanded)
  if (expanded) syncProjectPreviewFilterState(catalog, card)
  else clearProjectPreviewFilterState(catalog)
  refreshAfterProjectPreviewChange()
}

function setProjectPreview(card, expanded) {
  if (!card?.isConnected) return
  const current = activeProjectPreview()
  if (expanded && current === card) return
  if (!expanded && current !== card) return
  window.clearTimeout(card.__projectPreviewCollapseTimer)
  card.__projectPreviewCollapseTimer = 0
  card.removeAttribute("data-project-preview-collapsing")
  card.removeAttribute("data-project-preview-ready")
  const detailDrawer = activeProjectDetailDrawer()
  if (detailDrawer && (!expanded || detailDrawer.card !== card) && !card.__projectPreviewCollapseWithDrawer) {
    closeProjectDetailDrawer({ immediate: true })
  }

  const motionId = siteState.projectPreviewMotionId + 1
  siteState.projectPreviewMotionId = motionId
  // Rapid preview changes must never accumulate outgoing full-bleed layers.
  // The current preview can provide the next snapshot after the old one leaves.
  clearProjectPreviewExitGhosts()

  if (prefersReducedMotion()) {
    commitProjectPreviewState(card, expanded)
    return
  }

  if (!expanded) {
    // Keep the real card in its original grid cell while its surface retracts.
    // Removing the preview class here would reflow the row before the physical
    // retract could be seen, which was the source of the old relocation jump.
    card.setAttribute("data-project-preview-collapsing", "true")
    document.documentElement.dataset.projectPreviewTransition = "exiting"
    card.__projectPreviewCollapseTimer = window.setTimeout(() => {
      if (!card.isConnected || motionId !== siteState.projectPreviewMotionId) return
      card.removeAttribute("data-project-preview-collapsing")
      clearProjectPreviewExpandMotion(card)
      clearProjectPreviewHeightLock(card)
      commitProjectPreviewState(card, false)
      delete document.documentElement.dataset.projectPreviewTransition
    }, PROJECT_PREVIEW_SURFACE_RETRACT_DURATION_MS)
    return
  }

  prepareProjectPreviewExpandMotion(card)
  document.documentElement.dataset.projectPreviewTransition = "expanding"
  commitProjectPreviewState(card, expanded)
  // The real media remains the paint anchor. Only the background/rules animate;
  // type is revealed after that surface has reached full bleed.
  window.setTimeout(() => {
    if (motionId !== siteState.projectPreviewMotionId || !card.isConnected) return
    card.removeAttribute("data-project-preview-expanding")
    card.setAttribute("data-project-preview-ready", "true")
    delete document.documentElement.dataset.projectPreviewTransition
    refreshAfterProjectPreviewChange()
  }, PROJECT_PREVIEW_SURFACE_DURATION_MS)
}

function projectDetailBodyMarkup(project) {
  const fullMarkup = detailMarkup(project)
  const mainStart = fullMarkup.indexOf("<main")
  if (mainStart < 0) return fullMarkup
  const bodyStart = fullMarkup.indexOf(">", mainStart)
  const bodyEnd = fullMarkup.lastIndexOf("</main>")
  if (bodyStart < 0 || bodyEnd <= bodyStart) return fullMarkup
  return fullMarkup.slice(bodyStart + 1, bodyEnd)
}

function activeProjectDetailDrawer() {
  return siteState.projectDetailDrawer?.element?.isConnected
    ? siteState.projectDetailDrawer
    : null
}

function closeProjectDetailDrawer({ immediate = false, afterClose = null, onCloseStart = null } = {}) {
  const drawerState = activeProjectDetailDrawer()
  if (!drawerState) return
  const { element, card } = drawerState
  const reducedMotion = prefersReducedMotion()
  // A second caller must not turn an in-flight close into an immediate
  // teardown (dismiss + preview collapse used to race this path).
  if (element.dataset.drawerState === "closing" && !immediate) return
  const shouldAnimate = !immediate && !reducedMotion
  // Notify coordinated preview collapse before the drawer starts retracting.
  // This lets both surfaces animate in parallel; waiting for drawer teardown
  // before restoring the grid used to leave a visible pause in the old card
  // column during rapid open/close clicks.
  onCloseStart?.(card)
  // The card is a sticky secondary header while the article is open. On
  // compact layouts it may currently be compressed to only a title; animate
  // that height back to its natural preview size at the same time as the
  // drawer retracts so removing the sticky state cannot cause a second jump.
  if (shouldAnimate && card?.isConnected) {
    // The preview can gain height while the drawer is open (lazy media and
    // fonts commonly finish during that interval). The detail-header height
    // captured at open time is therefore stale by close time. Measure the
    // current natural preview height before entering the closing state so the
    // sticky lead can interpolate to the real grid height instead of snapping
    // when data-project-detail-open is removed.
    const hadDetailOpen = card.hasAttribute("data-project-detail-open")
    const hadHeaderCompressed = card.hasAttribute("data-project-detail-header-compressed")
    const hadHeaderMinimized = card.hasAttribute("data-project-detail-header-minimized")
    card.removeAttribute("data-project-detail-open")
    card.removeAttribute("data-project-detail-header-compressed")
    card.removeAttribute("data-project-detail-header-minimized")
    const naturalPreviewHeight = card.getBoundingClientRect().height
    if (hadDetailOpen) card.setAttribute("data-project-detail-open", "true")
    if (hadHeaderCompressed) card.setAttribute("data-project-detail-header-compressed", "true")
    if (hadHeaderMinimized) card.setAttribute("data-project-detail-header-minimized", "true")
    if (Number.isFinite(naturalPreviewHeight) && naturalPreviewHeight > 0) {
      setElementStyleProperty(card, "--project-detail-header-expanded-height", `${naturalPreviewHeight.toFixed(2)}px`)
    }
    card.setAttribute("data-project-detail-header-closing", "true")
    card.removeAttribute("data-project-detail-header-minimized")
    void card.offsetHeight
    setElementStyleProperty(card, "--project-detail-header-progress", "0")
  }
  const finish = () => {
    const coordinatedPreviewCollapse = card?.__projectPreviewCollapseWithDrawer === true
    drawerState.resizeObserver?.disconnect?.()
    element.style.removeProperty("max-height")
    element.remove()
    drawerState.row?.removeAttribute("data-project-detail-open")
    if (card?.isConnected) {
      card.removeAttribute("data-project-detail-open")
      card.removeAttribute("data-project-detail-header-compressed")
      card.removeAttribute("data-project-detail-header-minimized")
      card.removeAttribute("data-project-detail-header-closing")
      delete card.__detailHeaderStart
      delete card.__detailHeaderOpenHeight
      card.removeAttribute("aria-controls")
      card.setAttribute("aria-expanded", "true")
      card.style.removeProperty("--project-detail-header-progress")
      card.style.removeProperty("--project-detail-header-expanded-height")
      card.style.removeProperty("--project-detail-header-min-height")
      card.style.removeProperty("--project-detail-header-pad")
    }
    if (siteState.projectDetailDrawer === drawerState) siteState.projectDetailDrawer = null
    if (coordinatedPreviewCollapse && card?.isConnected) {
      // The visual retract started with the drawer. Commit the grid restore
      // in this same teardown task, after the drawer is removed, so the
      // browser never paints an intermediate row with a missing drawer slot.
      window.clearTimeout(card.__projectPreviewCollapseTimer)
      card.__projectPreviewCollapseTimer = 0
      card.removeAttribute("data-project-preview-collapsing")
      card.removeAttribute("data-project-preview-ready")
      clearProjectPreviewExpandMotion(card)
      clearProjectPreviewHeightLock(card)
      commitProjectPreviewState(card, false)
    } else {
      refreshAfterProjectPreviewChange()
    }
    afterClose?.(card)
  }
  if (shouldAnimate) {
    const height = element.firstElementChild?.scrollHeight || element.getBoundingClientRect().height || 0
    // A settled drawer intentionally uses max-height:none. CSS cannot
    // interpolate from none to zero, so establish a concrete pixel start,
    // enter the closing state, then release the inline value on the next
    // frame to let the max-height transition run all the way to zero.
    element.style.setProperty("--project-detail-drawer-height", `${height}px`)
    element.dataset.drawerState = "closing"
    element.style.setProperty("max-height", `${height}px`)
    void element.offsetHeight
    window.requestAnimationFrame(() => {
      if (element.isConnected && element.dataset.drawerState === "closing") {
        element.style.removeProperty("max-height")
      }
    })
  } else {
    element.dataset.drawerState = "closed"
  }
  if (!shouldAnimate) {
    finish()
    return
  }
  window.setTimeout(finish, PROJECT_DETAIL_DRAWER_CLOSE_MS)
}

function openProjectDetailDrawer(card, target) {
  if (!card?.isConnected || !target?.path) return
  const project = routeMap.get(target.path)
  if (!project) return

  const existing = activeProjectDetailDrawer()
  if (existing?.card === card && existing.element.dataset.drawerState !== "closing") return
  if (existing) closeProjectDetailDrawer({ immediate: true })

  const row = card.closest(".project-row")
  if (!row) return
  const drawer = document.createElement("section")
  drawer.className = `project-detail-drawer${project.path === "/serialdeminer" ? " framer-case-page" : framerProjectDetails[project.path] ? " framer-derived-page" : ""}`
  drawer.id = `project-detail-drawer-${String(card.dataset.index || target.path.slice(1)).replace(/[^a-z0-9_-]+/gi, "-")}`
  drawer.dataset.drawerState = "closed"
  drawer.dataset.drawerDirection = siteState.scrollDirection >= 0 ? "down" : "up"
  drawer.setAttribute("aria-label", `${project.pageTitle} project details`)
  drawer.innerHTML = `<div class="project-detail-drawer-inner">${projectDetailBodyMarkup(project)}</div>`
  // Keep the drawer immediately after the activated card. On compact layouts
  // the neighboring card remains in the same row, so inserting after the row
  // would place Pitchfork before Serial's full article instead of below it.
  card.after(drawer)

  // Capture the natural expanded surface before the sticky inner-header
  // selector applies its compressed height interpolation.
  const detailHeaderRect = card.getBoundingClientRect()
  card.__detailHeaderStart = detailHeaderRect.top + (window.scrollY || window.pageYOffset || 0)
  card.__detailHeaderOpenHeight = Math.max(1, detailHeaderRect.height)

  const inner = drawer.firstElementChild
  inner?.querySelectorAll(".project-lead").forEach((lead) => lead.remove())
  row.setAttribute("data-project-detail-open", "true")
  const updateHeight = () => {
    if (inner) drawer.style.setProperty("--project-detail-drawer-height", `${inner.scrollHeight}px`)
  }
  updateHeight()
  const resizeObserver = typeof ResizeObserver === "function" && inner
    ? new ResizeObserver(updateHeight)
    : null
  resizeObserver?.observe(inner)

  const drawerState = { element: drawer, card, row, resizeObserver }
  siteState.projectDetailDrawer = drawerState
  card.setAttribute("data-project-detail-open", "true")
  card.setAttribute("aria-controls", drawer.id)
  card.setAttribute("aria-expanded", "true")
  requestProjectDetailHeaderUpdate()
  refreshAfterProjectPreviewChange()

  requestAnimationFrame(() => {
    if (!drawer.isConnected || siteState.projectDetailDrawer !== drawerState) return
    drawer.dataset.drawerState = "open"
    window.setTimeout(() => {
      if (!drawer.isConnected || siteState.projectDetailDrawer !== drawerState) return
      drawer.dataset.drawerState = "settled"
      drawer.style.removeProperty("--project-detail-drawer-height")
    }, prefersReducedMotion() ? 0 : 760)
  })
}

function dismissProjectPreview(event) {
  const current = activeProjectPreview()
  if (!current || current.contains(event.target)) return
  if (event.target?.closest?.(".project-detail-drawer")) return
  if (event.target?.closest?.(".site-header")) return
  if (event.target?.closest?.("[data-project-card]")) return
  // Let the drawer finish its physical retract first. Calling
  // setProjectPreview immediately afterwards used to see the still-mounted
  // drawer and force an immediate close, cancelling the compact animation.
  const drawerState = activeProjectDetailDrawer()
  if (drawerState) {
    closeProjectDetailDrawer({
      // Start the preview retract at the same time as the drawer retract.
      // The drawer remains mounted for its own animation, while the card's
      // source row is restored on the same timeline instead of one after the
      // other (which read as a one-frame stall in rapid interactions).
      onCloseStart: (card) => {
        if (card?.isConnected && activeProjectPreview() === card) {
          card.__projectPreviewCollapseWithDrawer = true
          setProjectPreview(card, false)
        }
      },
      afterClose: (card) => {
        if (card) delete card.__projectPreviewCollapseWithDrawer
      },
    })
    return
  }
  setProjectPreview(current, false)
}

function handleProjectPreviewKeydown(event) {
  if (event.key !== "Escape") return
  if (activeProjectDetailDrawer()) {
    event.preventDefault()
    const drawerState = activeProjectDetailDrawer()
    closeProjectDetailDrawer()
    drawerState?.card?.focus?.({ preventScroll: true })
    return
  }
  const current = activeProjectPreview()
  if (!current) return
  event.preventDefault()
  setProjectPreview(current, false)
  current.focus({ preventScroll: true })
}

function handleRouteLinkClick(event) {
  const link = event.target?.closest?.("a[href]")
  if (!link) return
  if (event.defaultPrevented) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (Number.isFinite(event.button) && event.button !== 0) return
  if (link.target && link.target !== "_self") return
  if (link.hasAttribute("download")) return

  let target
  try {
    target = routeTargetFromUrl(new URL(link.getAttribute("href"), window.location.href))
  } catch {
    return
  }
  if (!target) return

  if (isHomeReturnTransitionActive()) {
    event.preventDefault()
    return
  }

  const projectCard = link.closest?.("[data-project-card]") || null
  if (
    projectCard &&
    document.documentElement.hasAttribute("data-project-preview-transition") &&
    projectCard.classList.contains("is-project-preview")
  ) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (projectCard && target.path !== routeFromLocation() && !projectCard.classList.contains("is-project-preview")) {
    event.preventDefault()
    event.stopPropagation()
    closeProjectDetailDrawer({ immediate: true })
    setProjectPreview(projectCard, true)
    return
  }

  if (projectCard && projectCard.classList.contains("is-project-preview") && target.path !== routeFromLocation()) {
    event.preventDefault()
    event.stopPropagation()
    if (activeProjectDetailDrawer()?.card === projectCard) {
      closeProjectDetailDrawer()
      return
    }
    clearProjectPreviewExitGhosts()
    openProjectDetailDrawer(projectCard, target)
    return
  }

  if (target.path === routeFromLocation()) {
    const hashCategory = normalizeCatalogFilter(target.hash)
    if (target.path === "/" && (hashCategory || target.hash === "resume")) return
    if (target.path !== "/" || !target.hash) event.preventDefault()
    return
  }

  event.preventDefault()
  if (prefersReducedMotion()) {
    clearProjectPreviewExitGhosts()
    navigateRouteWithoutTransition(target.url)
    return
  }

  clearProjectPreviewExitGhosts()
  startHomeReturnTransition(target.url)
}

function handlePopState() {
  const target = routeTargetFromUrl(new URL(window.location.href))
  if (!target) {
    clearProjectPreviewExitGhosts()
    cancelHomeReturnTransition()
    render()
    return
  }

  const currentDomRoute = document.querySelector(".site-main")?.dataset.route
  if (currentDomRoute === targetRouteDatasetValue(target.path) || prefersReducedMotion()) {
    clearProjectPreviewExitGhosts()
    navigateRouteWithoutTransition(target.url, { updateHistory: false })
    return
  }

  clearProjectPreviewExitGhosts()
  cancelHomeReturnTransition({ syncHeaderToScroll: false })
  startHomeReturnTransition(target.url, { updateHistory: false })
}

document.addEventListener("click", handleRouteLinkClick, { capture: true })
document.addEventListener("click", dismissProjectPreview)
document.addEventListener("keydown", handleProjectPreviewKeydown)
window.addEventListener("wheel", clearProjectPreviewExitGhosts, { passive: true })
window.addEventListener("touchstart", clearProjectPreviewExitGhosts, { passive: true })
window.addEventListener("red:public-dither-ready", (event) => {
  if (event?.detail?.generated) stopLegacyCatalogHalftoneWork()
})
window.addEventListener("popstate", handlePopState)
render()
applyFigmaCaptureState()
