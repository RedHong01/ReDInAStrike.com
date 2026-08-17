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
    mediaAspect: "1.4 / 1",
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
const app = document.querySelector("#app")
const base = document.body.dataset.base || "/"
const siteState = {
  headerInitialized: false,
  targetProgress: 0,
  visualProgress: 0,
  followFrame: 0,
  lastFrameTime: 0,
  lastScrollY: 0,
  layoutTransitionTimer: 0,
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function headerMarkup() {
  const nav = navItems
    .map(
      (item) => `
        <a class="nav-item" href="${hrefFor("/")}#${item.hash}">
          <span class="nav-title">${escapeHtml(item.label)}</span>
          <span class="nav-detail">${escapeHtml(item.detail)}</span>
        </a>`
    )
    .join("")

  return `
    <header class="site-header" data-site-header>
      <div class="header-inner">
        <a class="brand" href="${hrefFor("/")}" aria-label="ReDInAStrikE home">
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
    `--media-aspect: ${project.mediaAspect || "16 / 9"}`,
    `--image-fit: ${project.imageFit || "cover"}`,
    `--image-position: ${project.imagePosition || "center center"}`,
    `--media-bg: ${project.mediaBackground || "#f2f2f2"}`,
  ].join("; ")
}

function projectCard(project, index) {
  const videoAttributes = project.youtube
    ? ` data-hover-youtube="${escapeHtml(project.youtube)}"`
    : ""

  return `
    <a class="project-card" href="${hrefFor(project.path)}" data-project-card data-section="${escapeHtml(project.navHash)}" data-index="${index}">
      <figure class="project-media" style="${mediaStyle(project)}"${videoAttributes}>
        <img
          src="${asset(project.image)}"
          alt="${escapeHtml(project.pageTitle)}"
          loading="${index < 2 ? "eager" : "lazy"}"
        />
      </figure>
      <div class="project-meta">
        <span class="project-title">${escapeHtml(project.displayTitle)}</span>
        <span class="project-date">${escapeHtml(project.date)}</span>
      </div>
    </a>`
}

function aboutMarkup() {
  return `
    <section class="about-section" id="resume" aria-label="About Red Wang">
      <div class="about-copy">
        <h2>About</h2>
        <p>
          Red Wang "王紫鵬“is a Game Design student and is now based in the LA area.
          An independent thinker who enjoys teamwork. Passionate for Game Design &amp;
          Development, Cinematic &amp; Media Arts, Interaction Design, Graphic Design
          and other Interdisciplinary practices.
        </p>
      </div>
      <div class="contact-copy" id="contact">
        <h2>Contact</h2>
        <a href="#" aria-label="Twitter">Twitter</a>
        <a href="https://www.instagram.com/red_cnfh/">Instagram</a>
        <a href="mailto:zwang29@inside.artcenter.edu">Email</a>
      </div>
      <figure class="profile-portrait">
        <img src="${asset("assets/framer-live/profile.jpeg")}" alt="Red Wang portrait" />
      </figure>
      <div class="profile-card">
        <h2>王紫鵬</h2>
        <p>Red Wang</p>
        <span>Game Design Student at ArtCenter College of Design</span>
        <div class="profile-actions">
          <a href="mailto:zwang29@inside.artcenter.edu">Contact Me</a>
          <a href="#game">Latest Project</a>
        </div>
      </div>
    </section>`
}

function homeMarkup() {
  const rows = []
  for (let index = 0; index < projects.length; index += 2) {
    const rowHash = index === 0 ? "game" : index === 14 ? "ongoing" : ""
    rows.push(`
      <section class="project-row" id="${rowHash}">
        ${projectCard(projects[index], index)}
        ${projects[index + 1] ? projectCard(projects[index + 1], index + 1) : ""}
      </section>`)
  }

  return `
    ${headerMarkup()}
    <main class="site-main" data-route="home">
      <section class="catalog" aria-label="Project catalog">
        ${rows.join("")}
      </section>
      ${aboutMarkup()}
    </main>`
}

function detailMarkup(project) {
  if (project.path === "/serialdeminer") return serialDeminerDetailMarkup(project)

  return `
    ${headerMarkup()}
    <main class="site-main detail-page" data-route="${escapeHtml(project.path)}">
      <article class="detail-shell">
        <a class="back-link" href="${hrefFor("/")}">Back</a>
        <div class="detail-heading">
          <p>${escapeHtml(project.displayTitle)}</p>
          <h1>${escapeHtml(project.pageTitle)}</h1>
          <span>${escapeHtml(project.date)}</span>
        </div>
        <figure class="detail-screenshot">
          <img src="${asset(project.image)}" alt="${escapeHtml(project.pageTitle)} full-page reference" />
        </figure>
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
          <div class="framer-case-kicker">2024 Fall</div>
          <h1>Serial Deminer</h1>
          <p>Game Design &amp; Level Design</p>
          <img class="framer-case-hero-logo" src="${asset("assets/logo-vector.svg")}" alt="ReDInAStrikE logo" />
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
            <p>In <em>Serial Miner</em>, you take on the role of a skilled de-miner on a high-stakes mission to clear hazardous landmines and create a safe path for an incoming convoy. Using a suite of specialized gadgets — including a marking flag, a metal detector, and explosives — your objective is to locate, mark, and detonate mines in a strategic, precise manner to ensure no explosives are left undetected.</p>
          </div>
          <div>
            <h2>Key Features</h2>
            <p><strong>Marking Flag</strong>: Place flags to identify mines you've found, helping you avoid rechecking areas and making your path safer.</p>
            <p><strong>Metal Detector</strong>: Sweeps for hidden mines; listen for beeps that indicate the proximity of a mine.</p>
            <p><strong>Explosives</strong>: Carefully place explosives on mines to clear them. Only use this gadget when in detonation range.</p>
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
          <p>After reflecting on the theme for this game jam, I first considered our target audience. Following discussions with my teammates and reviewing our research, we reached the following conclusions:</p>
          <p>We analyzed the winning entries from the GMTK 2024 Game Jam on itch.io. After playing and discussing these games, one keyword stood out: “<strong>Puzzle</strong>.” Beyond impressive visuals and arts, we noticed that clever and engaging puzzle designs consistently captivated us and left a lasting impression. Based on this, we concluded that our target audience should be players who enjoy a <strong>Casual gaming experience</strong> and are <strong>Enthusiastic about solving puzzles</strong>.</p>
          <p>Secondly, as a 48-hour game jam project, an important target audience of our project includes <strong>Game design professionals and students</strong> like us. These individuals value design details, the game’s relevance to the theme, and its overall completeness as a finished product.</p>
          <p>Of course, another key audience includes <strong>Game enthusiasts and critics</strong> interested in exploring jam entries—those who enjoy browsing diverse games and experiencing the creative ideas these lightweight projects deliver.</p>
        </section>

        <section class="framer-case-section framer-text-section">
          <h2>Player Experience:</h2>
          <p>Based on our target audience and the competition's theme, we began brainstorming the game experience we wanted to create. Expanding on the theme of “chain reaction,” we envisioned an experience where a single trigger sets off a series of automatic events like dominoes falling. This experience should feel exciting—seamless, satisfying, unpredictable, and chaotically dangerous.</p>
          <p>From a puzzle perspective, solving puzzles is a slow yet deliberate process. Therefore, our game experience should encourage a steady pace, allowing players to explore and understand the puzzles at their own rhythm.</p>
          <p>Thus, our game’s experience prompt is: <strong>“Explore and solve puzzles in a relaxed and enjoyable atmosphere, while experiencing how a single key action can influence the entire puzzle-solving process.”</strong></p>
          <p>The gameplay is designed to last 3-5 minutes, allowing players to make numerous attempts within a short time without losing progress upon failure. Players are immersed in a relaxed and enjoyable environment, focused on exploring puzzles and mastering the game mechanics.</p>
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
          <p>When brainstorming the game’s format and mechanics, we explored various directions and references. I initially proposed “Bejeweled” as the inspiration for our project. I believe its gameplay, where players rearrange a 2D grid of gems through simple drag-and-drop actions, aligns well with the theme of “chain reaction.” A single, light action can trigger potential chain explosions, allowing players to enjoy the automatic interactions between gems of different colors and properties while earning score rewards.</p>
          <p>Another game reference comes from the Chinese 2D puzzle game <em>“死神来了” (Death Coming)</em>. Unlike <em>Bejeweled</em>, this game focuses more on the connection between narrative and gameplay. Players take on the role of a trainee grim reaper, interacting with objects in each level’s scene. Using fewer steps to trigger more object interactions and cause more character deaths results in higher scores. The key takeaway from this game is its engaging premise and setting, which are tightly integrated with the gameplay, creating a cohesive and immersive experience.</p>
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
          <p>Based on our research, we initially considered a gameplay design focused on a maze that players could navigate by creating paths through explosions. Players would need to find a way to clear obstacles and continue exploring. This would involve making a key decision after careful thought to progress. The maze’s puzzles should strike a balance between being neither too easy nor too difficult—players should quickly understand what needs to be done (how to approach the puzzle) but spend time figuring out how to execute it (how to solve the puzzle).</p>
          <p>We refined this idea further, considering what setting and actions would best fit our gameplay. We drew inspiration from the real-life concept of miners using explosives to carve out mine shafts, shaping our game’s premise. Players take on the role of a path designer working for miners, responsible for determining the placement of explosives.</p>
          <p>To align with the chain reaction theme, the entire explosion sequence can only be initiated once. Players cannot manually detonate each explosive but must strategically arrange them in specific positions and quantities to ensure the first explosive connects with the last, completing the chain and clearing the path to progress.</p>
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
          <p>Bedi and I were responsible for the in-game level design. We translated the initial 2D sketches into 3D levels based on narrative and gameplay requirements, followed by internal playtesting and adjustments. While designing the levels, I considered player flow, ensuring the progression matched the narrative. The early levels were designed to be the simplest, gradually increasing in complexity and difficulty. During playtesting, we ensured each level’s puzzle-solving time stayed within 3-5 minutes to align with the game’s <strong>“Casual puzzle-solving”</strong> experience.</p>
        </section>

        <section class="framer-case-footer">
          <img class="framer-case-footer-logo" src="${asset("assets/logo-vector.svg")}" alt="ReDInAStrikE logo" />
          <div>
            <h2>Overview</h2>
            <p>2024 ArtCenter Game Jam Project</p>
            <p>Game designer &amp; Level Designer</p>
          </div>
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
  setupHeader()
  setupNavHoverSpacing()
  setupNavHoverInteraction()
  if (document.fonts) {
    document.fonts.ready.then(setupNavHoverSpacing).catch(() => {})
  }
  setupHoverEmbeds()
}

function readHeaderMetrics() {
  const width = window.innerWidth
  const fullHeight = width < 560 ? 220 : width < 760 ? 230 : width < 1120 ? 210 : 200
  const compactHeight = width < 560 ? 84 : width < 760 ? 88 : 78
  const fullLogo = 150
  const compactLogo = width < 760 ? 52 : 48
  const distance = width < 680 ? 150 : 205
  return { width, fullHeight, compactHeight, fullLogo, compactLogo, distance }
}

function applyHeaderProgress(progress) {
  const metrics = readHeaderMetrics()
  const height = metrics.fullHeight + (metrics.compactHeight - metrics.fullHeight) * progress
  const logo = metrics.fullLogo + (metrics.compactLogo - metrics.fullLogo) * progress
  const navScale = 1 + (0.88 - 1) * progress
  const detailOpacity = 1
  const glassProgress = clamp(progress * 1.35, 0, 1)
  const glassAlpha = 0.98 + (0.76 - 0.98) * glassProgress
  const glassBlur = 18 * glassProgress
  const glassShadowAlpha = 0
  const ruleAlpha = 1 - 0.18 * glassProgress

  document.documentElement.style.setProperty("--header-height", `${height.toFixed(2)}px`)
  document.documentElement.style.setProperty("--logo-size", `${logo.toFixed(2)}px`)
  document.documentElement.style.setProperty("--nav-scale", navScale.toFixed(4))
  document.documentElement.style.setProperty("--detail-opacity", detailOpacity.toFixed(4))
  document.documentElement.style.setProperty("--header-glass-alpha", glassAlpha.toFixed(4))
  document.documentElement.style.setProperty("--header-glass-blur", `${glassBlur.toFixed(2)}px`)
  document.documentElement.style.setProperty("--header-glass-shadow-alpha", glassShadowAlpha.toFixed(4))
  document.documentElement.style.setProperty("--header-rule-alpha", ruleAlpha.toFixed(4))

  const density =
    metrics.width < 560
      ? "tiny"
      : metrics.width < 760
        ? "mobile"
        : metrics.width < 1320 || progress > 0.16
          ? "titles"
          : "full"
  document.body.dataset.navDensity = density
  document.body.dataset.headerCompact = progress > 0.7 ? "true" : "false"
}

function setupNavHoverSpacing() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    const title = item.querySelector(".nav-title")
    const detail = item.querySelector(".nav-detail")
    if (!title || !detail) return

    const titleWidth = title.getBoundingClientRect().width
    const detailWidth = detail.scrollWidth || detail.getBoundingClientRect().width
    const hoverSpace = clamp(Math.ceil((detailWidth - titleWidth) / 2 + 10), 0, 120)
    item.style.setProperty("--nav-hover-space", `${hoverSpace}px`)
  })
}

function setupNavHoverInteraction() {
  const nav = document.querySelector(".nav-list")
  if (!nav) return

  const items = [...nav.querySelectorAll(".nav-item")]
  let clearTimer = 0

  const clearActive = () => {
    window.clearTimeout(clearTimer)
    clearTimer = 0
    items.forEach((item) => item.classList.remove("is-nav-active"))
  }

  const setActive = (activeItem) => {
    window.clearTimeout(clearTimer)
    clearTimer = 0
    items.forEach((item) => item.classList.toggle("is-nav-active", item === activeItem))
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
      setActive(item)
    })

    item.addEventListener("focusin", () => setActive(item))
  })
}

function animateHeader(time) {
  const elapsed = siteState.lastFrameTime
    ? Math.min(0.05, (time - siteState.lastFrameTime) / 1000)
    : 1 / 60
  siteState.lastFrameTime = time

  const followSpeed = 15
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
  siteState.targetProgress = clamp(nextProgress, 0, 1)

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
  const metrics = readHeaderMetrics()
  if (window.scrollY <= 2 && delta <= 0) {
    setHeaderTarget(0)
    return
  }
  if (Math.abs(delta) < 0.35) return
  setHeaderTarget(siteState.targetProgress + delta / metrics.distance)
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
  setHeaderTarget(clamp(siteState.lastScrollY / readHeaderMetrics().distance, 0, 1), true)

  if (siteState.headerInitialized) return
  siteState.headerInitialized = true

  window.addEventListener(
    "wheel",
    (event) => updateHeaderFromScroll(event.deltaY),
    { passive: true }
  )

  window.addEventListener(
    "scroll",
    () => {
      const current = window.scrollY || window.pageYOffset || 0
      const delta = current - siteState.lastScrollY
      siteState.lastScrollY = current
      updateHeaderFromScroll(delta)
    },
    { passive: true }
  )

  window.addEventListener("resize", () => {
    startResponsiveLayoutTransition()
    applyHeaderProgress(siteState.visualProgress)
    setupNavHoverSpacing()
  })
}

function setupHoverEmbeds() {
  document.querySelectorAll("[data-hover-youtube]").forEach((media) => {
    const id = media.dataset.hoverYoutube
    let iframe = null

    const mount = () => {
      if (iframe || !id) return
      iframe = document.createElement("iframe")
      iframe.className = "hover-video"
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&playsinline=1&controls=1&loop=1&playlist=${encodeURIComponent(id)}`
      media.appendChild(iframe)
    }

    const unmount = () => {
      if (!iframe) return
      iframe.remove()
      iframe = null
    }

    media.addEventListener("mouseenter", mount)
    media.addEventListener("mouseleave", unmount)
    media.addEventListener("focusin", mount)
    media.addEventListener("focusout", unmount)
  })
}

window.addEventListener("popstate", render)
render()
