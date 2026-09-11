// Both text layers occupy one grid cell, reserving the title's space before
// hover. Typeface changes crossfade instead of changing table geometry.
export function enhanceProjectTables(root) {
  root.querySelectorAll("table.gdd-table tbody tr").forEach((row) => {
    const heading = row.querySelector("th:first-child")
    if (!heading || heading.querySelector(".table-row-label")) return
    const label = document.createElement("span")
    label.className = "table-row-label"
    const subtitle = document.createElement("span")
    subtitle.className = "table-row-label-subtitle"
    while (heading.firstChild) subtitle.appendChild(heading.firstChild)
    const title = subtitle.cloneNode(true)
    title.className = "table-row-label-title"
    title.setAttribute("aria-hidden", "true")
    label.append(subtitle, title)
    heading.append(label)
    row.tabIndex = 0
  })
}
