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
        ${
          project.youtube
            ? `<span class="hover-play-label">Hover to play</span>`
            : ""
        }
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

function render() {
  const route = routeFromLocation()
  const project = routeMap.get(route)
  app.innerHTML = project ? detailMarkup(project) : homeMarkup()
  setupHeader()
  setupHoverEmbeds()
}

function readHeaderMetrics() {
  const width = window.innerWidth
  const fullHeight = width < 560 ? 250 : width < 760 ? 230 : width < 1120 ? 210 : 200
  const compactHeight = width < 560 ? 86 : 78
  const fullLogo = 150
  const compactLogo = width < 560 ? 42 : 48
  const distance = width < 680 ? 150 : 205
  return { width, fullHeight, compactHeight, fullLogo, compactLogo, distance }
}

function applyHeaderProgress(progress) {
  const metrics = readHeaderMetrics()
  const height = metrics.fullHeight + (metrics.compactHeight - metrics.fullHeight) * progress
  const logo = metrics.fullLogo + (metrics.compactLogo - metrics.fullLogo) * progress
  const navScale = 1 + (0.88 - 1) * progress
  const detailOpacity =
    metrics.width < 1320 || progress > 0.16 ? 0 : clamp(1 - progress * 2.4, 0, 1)

  document.documentElement.style.setProperty("--header-height", `${height.toFixed(2)}px`)
  document.documentElement.style.setProperty("--logo-size", `${logo.toFixed(2)}px`)
  document.documentElement.style.setProperty("--nav-scale", navScale.toFixed(4))
  document.documentElement.style.setProperty("--detail-opacity", detailOpacity.toFixed(4))

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

function animateHeader(time) {
  const elapsed = siteState.lastFrameTime
    ? Math.min(0.05, (time - siteState.lastFrameTime) / 1000)
    : 1 / 60
  siteState.lastFrameTime = time

  const followSpeed = 42
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

  window.addEventListener("resize", () => applyHeaderProgress(siteState.visualProgress))
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
