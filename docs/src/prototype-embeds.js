// Entry frames verified against the source file's existing click connections.
// Instrument's title variants all lead to Home Page_Begining (368:4270).
// Use the finished title artwork; keep the same entry when restarting.
export const projectPrototypes = {
  "/service-game-ui": { file: "x2UXQnAzOO3RTxN8K6UFI7", page: "29:2", start: "1832:1605" },
  "/service-game-ui-2": { file: "x2UXQnAzOO3RTxN8K6UFI7", page: "841:964", start: "1443:2754" },
  "/assethub": { file: "HEpE6DzXmVK9AkYB8LDVuP", page: "57:142", start: "704:1008" },
  "/myfridge": { file: "WyaclaRqcYxl3dr3DbnhJ3", page: "327:902", start: "372:969", portrait: true },
}

export function prototypeHeroMarkup(project, { escapeHtml }) {
  const prototype = projectPrototypes[project.path]
  if (!prototype) return ""
  const url = new URL(`https://www.figma.com/proto/${prototype.file}`)
  url.search = new URLSearchParams({
    "page-id": prototype.page,
    "node-id": prototype.start,
    "starting-point-node-id": prototype.start,
    scaling: "contain",
    "content-scaling": "fixed",
  }).toString()
  const externalUrl = url.href
  url.hostname = "embed.figma.com"
  url.searchParams.set("embed-host", "redinastrike")
  url.searchParams.set("footer", "false")
  url.searchParams.set("show-proto-sidebar", "false")
  const title = `${project.pageTitle || project.title} interactive Figma prototype`
  return `<figure class="case-study-prototype${prototype.portrait ? ' case-study-prototype--portrait' : ''}">
    <div class="case-study-prototype-stage">
      <iframe src="${escapeHtml(url.href)}" title="${escapeHtml(title)}" loading="lazy" allow="fullscreen" allowfullscreen></iframe>
    </div>
    <figcaption class="case-study-prototype-toolbar">
      <span>Interactive prototype</span>
      <div class="case-study-prototype-actions">
        ${document.fullscreenEnabled ? '<button type="button" data-prototype-fullscreen aria-label="Expand prototype to full screen">Full screen ⤢</button>' : ""}
        <a href="${escapeHtml(externalUrl)}" target="_blank" rel="noopener noreferrer">Open in Figma ↗</a>
      </div>
    </figcaption>
    <p class="case-study-prototype-status" role="status"></p>
  </figure>`
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-prototype-fullscreen]")
  if (!button) return
  const figure = button.closest(".case-study-prototype")
  const status = figure.querySelector(".case-study-prototype-status")
  status.textContent = ""
  try {
    if (document.fullscreenElement === figure) await document.exitFullscreen()
    else await figure.requestFullscreen()
  } catch {
    status.textContent = "Full screen is unavailable. Use Open in Figma to explore the prototype."
  }
})

document.addEventListener("fullscreenchange", () => {
  document.querySelectorAll("[data-prototype-fullscreen]").forEach((button) => {
    const expanded = document.fullscreenElement === button.closest(".case-study-prototype")
    button.textContent = expanded ? "Exit full screen ↙" : "Full screen ⤢"
    button.setAttribute("aria-label", expanded ? "Exit prototype full screen" : "Expand prototype to full screen")
  })
})
