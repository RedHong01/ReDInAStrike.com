// Section kinds for the Space Bounty Hunter drawer (/service-game-ui-2). They live
// in their own module, like extra-section-renderers.js, so the shared renderer file
// and main.js only need one line each; main.js merges this table into
// extraSectionRenderers and passes the same helpers:
// (section, { escapeHtml, gddPair, imageSourceAttrs }).
//
// Every chart is drawn in type, CSS and inline SVG from numbers written into
// sbh-sections.js, and every number there is re-derived by
// reference/projects/space-bounty-hunter/sheet-derivations.py. Colour follows the
// dataviz method: one blue ramp for ordered grades and magnitudes, three validated
// categorical slots for the calendar, text always in the page's ink.

const assetUrl = (path) => `${document.body.dataset.base || "/"}${String(path).replace(/^\/+/, "")}`
const fmt = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 })

function shell(section, body, { escapeHtml, gddPair }, extraClass = "") {
  return `
    <section class="framer-case-section gdd-section sbh-section ${extraClass}" aria-label="${escapeHtml(section.title)}">
      <h2 class="gdd-h2">${escapeHtml(section.title)}</h2>
      ${section.intro ? `<p class="gdd-intro">${gddPair(section.intro)}</p>` : ""}
      ${body}
      ${section.note ? `<p class="gdd-note">${gddPair(section.note)}</p>` : ""}
    </section>`
}

// A value-first tooltip, shown on hover and on keyboard focus of its parent.
function tip(escapeHtml, strong, line) {
  return `<span class="sbh-tip" aria-hidden="true"><strong>${escapeHtml(strong)}</strong>${line ? `<span>${escapeHtml(line)}</span>` : ""}</span>`
}

// Seven weeks of hand-ins, one column per course week, each tagged with the lesson
// from the first half of the course that it answers.
function timeline(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const weeks = section.weeks
    .map((week) => {
      if (week.empty) {
        return `
          <li class="sbh-week is-empty">
            <span class="sbh-week-mark" aria-hidden="true"></span>
            <span class="sbh-week-num">W${week.week}</span>
            <span class="sbh-week-date">${escapeHtml(week.date)}</span>
            <p class="sbh-week-copy">${gddPair(week)}</p>
          </li>`
      }
      return `
        <li class="sbh-week">
          <span class="sbh-week-mark" aria-hidden="true"></span>
          <span class="sbh-week-num">W${week.week}</span>
          <span class="sbh-week-date">${escapeHtml(week.date)}</span>
          <h3 class="sbh-week-title">${escapeHtml(week.title)}</h3>
          <p class="sbh-week-copy">${gddPair(week)}</p>
          <p class="sbh-week-lesson"><span class="sbh-week-lesson-key">Answers</span>${gddPair(week.lesson)}</p>
        </li>`
    })
    .join("")
  return shell(section, `<ol class="sbh-weeks sbh-bleed">${weeks}</ol>`, helpers, "sbh-timeline-section")
}

// The stat-scaling grid: attributes down, combat stats across, one ordered blue
// ramp for S > A > B > C. A dot marks a grade that already existed in the earlier
// sheet; a dashed empty cell marks one that was dropped.
function heatmap(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const gradeName = { S: "S", A: "A", B: "B", C: "C" }
  const columns = section.groups.flatMap((group, g) =>
    group.cols.map((col, i) => ({ ...col, group: group.label, start: i === 0 && g > 0 })),
  )
  const groupRow = section.groups
    .map((group, g) => `<th scope="colgroup" colspan="${group.cols.length}" class="${g > 0 ? "is-group-start" : ""}">${escapeHtml(group.label)}</th>`)
    .join("")
  const colRow = columns
    .map((col) => `<th scope="col" class="sbh-heat-col${col.start ? " is-group-start" : ""}" title="${escapeHtml(col.key)}"><span>${escapeHtml(col.short)}</span></th>`)
    .join("")
  const rows = section.rows
    .map((row) => {
      const before = row.before || {}
      const cells = columns
        .map((col) => {
          const grade = row.grades[col.key]
          const was = before[col.key]
          const groupClass = col.start ? " is-group-start" : ""
          if (!grade && was) {
            const label = `${row.name} on ${col.key}: ${was} on ${section.beforeLabel}, dropped by ${section.afterLabel}`
            return `<td class="sbh-g is-dropped${groupClass}" tabindex="0" aria-label="${escapeHtml(label)}">${tip(escapeHtml, `${row.name} × ${col.key}`, `${was} on ${section.beforeLabel} · dropped by ${section.afterLabel}`)}</td>`
          }
          if (!grade) return `<td class="sbh-g is-none${groupClass}"></td>`
          const status = was ? `already ${was} on ${section.beforeLabel}` : `added after ${section.beforeLabel}`
          const label = `${row.name} on ${col.key}: ${gradeName[grade]}, ${status}`
          return `<td class="sbh-g is-${grade.toLowerCase()}${was ? " was-there" : ""}${groupClass}" tabindex="0" aria-label="${escapeHtml(label)}"><span class="sbh-g-letter" aria-hidden="true">${grade}</span>${tip(escapeHtml, `${row.name} × ${col.key} · ${grade}`, status)}</td>`
        })
        .join("")
      const countBefore = Object.keys(before).length
      const countAfter = Object.keys(row.grades).length
      return `
        <tr>
          <th scope="row" class="sbh-heat-attr">${escapeHtml(row.name)}<em lang="zh-Hans">${escapeHtml(row.zh)}</em></th>
          ${cells}
          <td class="sbh-heat-delta"><span class="${countBefore === 0 ? "is-zero" : ""}">${countBefore}</span><i aria-hidden="true">→</i><strong>${countAfter}</strong></td>
        </tr>`
    })
    .join("")
  const legend = `
    <p class="sbh-heat-legend">
      ${section.scale.map((step) => `<span><i class="sbh-g-swatch is-${step.grade.toLowerCase()}" aria-hidden="true"></i><strong>${step.grade}</strong>${escapeHtml(step.label)}</span>`).join("")}
      <span><i class="sbh-g-swatch is-was" aria-hidden="true"></i>${escapeHtml(section.wasLabel)}</span>
      <span><i class="sbh-g-swatch is-dropped" aria-hidden="true"></i>${escapeHtml(section.droppedLabel)}</span>
    </p>`
  const table = `
    <div class="sbh-heat-wrap sbh-bleed">
      <div class="sbh-heat-scroll">
        <table class="sbh-heat">
          <caption class="gdd-sr">${escapeHtml(section.caption)}</caption>
          <thead>
            <tr class="sbh-heat-groups"><td></td>${groupRow}<td></td></tr>
            <tr class="sbh-heat-cols"><th scope="col" class="sbh-heat-attr-head">Attribute</th>${colRow}<th scope="col" class="sbh-heat-delta-head">${escapeHtml(section.beforeLabel)} → ${escapeHtml(section.afterLabel)}</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${legend}
    </div>`
  return shell(section, table, helpers, "sbh-heat-section")
}

// Backgrounds as two loops drawn in SVG: an arrow points at the background whose
// stats you pay with. Species and body modifiers sit beside it as ruled lists.
function build(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const deg = (a) => (a * Math.PI) / 180
  const point = (cx, cy, r, a) => [cx + r * Math.cos(deg(a)), cy + r * Math.sin(deg(a))]
  const arc = (cx, cy, r, a1, a2) => {
    const [x1, y1] = point(cx, cy, r, a1)
    const [x2, y2] = point(cx, cy, r, a2)
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }
  const gap = 17
  const loopSvg = (loop) => {
    const { cx, cy, r, nodes } = loop
    const ordered = nodes.map((node, i) => ({ ...node, next: nodes[(i + 1) % nodes.length] }))
    const arcs = ordered
      .map((node) => {
        let a2 = node.next.angle
        if (a2 <= node.angle) a2 += 360
        return `<path class="sbh-loop-arc" d="${arc(cx, cy, r, node.angle + gap, a2 - gap)}" marker-end="url(#sbh-arrow)" />`
      })
      .join("")
    const dots = nodes
      .map((node) => {
        const [x, y] = point(cx, cy, r, node.angle)
        return `
          <circle class="sbh-loop-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" />
          <text class="sbh-loop-name" x="${node.lx}" y="${node.ly}" text-anchor="${node.anchor || "middle"}">${escapeHtml(node.name)}</text>
          <text class="sbh-loop-zh" x="${node.lx}" y="${node.ly + 17}" text-anchor="${node.anchor || "middle"}" lang="zh-Hans">${escapeHtml(node.zh)}</text>
          <text class="sbh-loop-stats" x="${node.lx}" y="${node.ly + 33}" text-anchor="${node.anchor || "middle"}">${escapeHtml(node.stats)}</text>`
      })
      .join("")
    return `${arcs}${dots}`
  }
  const cycle = section.cycle
  const svg = `
    <svg class="sbh-loops" viewBox="${cycle.viewBox}" role="img" aria-labelledby="sbh-loops-title sbh-loops-desc">
      <title id="sbh-loops-title">${escapeHtml(cycle.title)}</title>
      <desc id="sbh-loops-desc">${escapeHtml(cycle.desc)}</desc>
      <defs>
        <marker id="sbh-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" class="sbh-loop-head" />
        </marker>
      </defs>
      ${cycle.loops.map(loopSvg).join("")}
    </svg>`
  const species = section.species
    .map(
      (item) => `
        <li class="sbh-species">
          <span class="sbh-species-name">${escapeHtml(item.name)}<em lang="zh-Hans">${escapeHtml(item.zh)}</em></span>
          <span class="sbh-species-mods">${item.plus.map((m) => `<span class="is-plus">${escapeHtml(m)}</span>`).join("")}${item.minus.map((m) => `<span class="is-minus">${escapeHtml(m)}</span>`).join("")}</span>
          ${item.lore ? `<span class="sbh-species-lore">${gddPair(item.lore)}</span>` : ""}
        </li>`,
    )
    .join("")
  const body = section.body
    .map(
      (item) => `
        <li><span class="sbh-body-name">${escapeHtml(item.name)}</span><span class="is-plus">${escapeHtml(item.plus)}</span><span class="is-minus">${escapeHtml(item.minus)}</span></li>`,
    )
    .join("")
  const html = `
    <div class="sbh-build sbh-bleed">
      <figure class="sbh-build-loops">
        ${svg}
        <figcaption>${gddPair(cycle.caption)}</figcaption>
      </figure>
      <div class="sbh-build-species">
        <h3 class="sbh-sub">${escapeHtml(section.speciesTitle)}</h3>
        <ul>${species}</ul>
      </div>
      <div class="sbh-build-body">
        <h3 class="sbh-sub">${escapeHtml(section.bodyTitle)}</h3>
        <ul class="sbh-body-list">${body}</ul>
        <p class="sbh-build-quote"><span class="sbh-build-quote-key">${escapeHtml(section.bodyNote.label)}</span>${gddPair(section.bodyNote)}</p>
      </div>
      <div class="sbh-build-decision">
        <h3 class="sbh-sub">${escapeHtml(section.decision.label)}</h3>
        <p>${gddPair(section.decision)}</p>
      </div>
    </div>`
  return shell(section, html, helpers, "sbh-build-section")
}

// Week 10: what held up, the three weaknesses as why / fix / test, and five
// testers' own answers side by side.
function playtest(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const strengths = section.strengths.map((item) => `<li>${gddPair(item)}</li>`).join("")
  const cards = section.weaknesses
    .map(
      (item, i) => `
        <article class="sbh-weak">
          <span class="sbh-weak-num">0${i + 1}</span>
          <h3 class="sbh-weak-title">${gddPair(item.title)}</h3>
          <dl>
            <div><dt>Why</dt><dd>${gddPair(item.why)}</dd></div>
            <div><dt>Fix</dt><dd>${gddPair(item.fix)}</dd></div>
            <div><dt>Test</dt><dd>${gddPair(item.test)}</dd></div>
            <div class="is-after"><dt>By Week 14</dt><dd>${gddPair(item.after)}</dd></div>
          </dl>
        </article>`,
    )
    .join("")
  const head = `<tr><th scope="col">${escapeHtml(section.testers.corner)}</th>${section.testers.labels.map((label) => `<th scope="col">${escapeHtml(label)}</th>`).join("")}</tr>`
  const rows = section.testers.rows
    .map((row) => `<tr><th scope="row">${gddPair(row.q)}</th>${row.answers.map((answer) => `<td>${gddPair(answer)}</td>`).join("")}</tr>`)
    .join("")
  const html = `
    <div class="sbh-playtest sbh-bleed">
      <div class="sbh-held">
        <h3 class="sbh-sub">${escapeHtml(section.strengthsTitle)}</h3>
        <ul>${strengths}</ul>
      </div>
      <div class="sbh-weaks">${cards}</div>
      <div class="sbh-testers">
        <h3 class="sbh-sub">${escapeHtml(section.testers.title)}</h3>
        <div class="sbh-testers-scroll">
          <table class="sbh-testers-table"><thead>${head}</thead><tbody>${rows}</tbody></table>
        </div>
      </div>
    </div>`
  return shell(section, html, helpers, "sbh-playtest-section")
}

// The full recording with its chapters as buttons that move the playhead.
function video(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`
  const chapters = section.chapters
    .map(
      (chapter) => `
        <li><button type="button" class="sbh-chapter" data-sbh-seek="${chapter.t}"><span class="sbh-chapter-time">${clock(chapter.t)}</span><span class="sbh-chapter-name">${escapeHtml(chapter.en)}<em lang="zh-Hans">${escapeHtml(chapter.zh)}</em></span></button></li>`,
    )
    .join("")
  const html = `
    <div class="sbh-video sbh-bleed">
      <figure class="sbh-video-figure">
        <video controls preload="metadata" playsinline poster="${escapeHtml(assetUrl(section.poster))}">
          <source src="${escapeHtml(assetUrl(section.video))}" type="video/mp4" />
        </video>
        <figcaption><span class="sbh-video-label">${escapeHtml(section.label)}</span>${gddPair(section.caption)}</figcaption>
      </figure>
      <nav class="sbh-chapters" aria-label="${escapeHtml(section.chaptersLabel)}">
        <h3 class="sbh-sub">${escapeHtml(section.chaptersLabel)}</h3>
        <ol>${chapters}</ol>
      </nav>
    </div>`
  return shell(section, html, helpers, "sbh-video-section")
}

// Landscape screens by journey stage. Each group spans as many columns as it has
// screens, and the groups are ordered so every row closes at the column count.
function screens(section, helpers) {
  const { escapeHtml, imageSourceAttrs } = helpers
  const groups = section.groups
    .map(
      (group) => `
        <div class="sbh-screen-group" style="--group-span:${group.screens.length}">
          <span class="sbh-screen-group-label">${escapeHtml(group.label)}</span>
          <div class="sbh-screen-row">
            ${group.screens
              .map(
                (screen) => `
                  <figure class="sbh-screen">
                    <img ${imageSourceAttrs(screen.image)} alt="${escapeHtml(screen.alt)}" width="1592" height="896" loading="lazy" decoding="async" />
                    <figcaption>${escapeHtml(screen.name)}</figcaption>
                  </figure>`,
              )
              .join("")}
          </div>
        </div>`,
    )
    .join("")
  return shell(section, `<div class="sbh-screens sbh-bleed" style="--screen-cols:${section.columns}">${groups}</div>`, helpers, "sbh-screens-section")
}

// The economy on one field: the currency's taps and sinks on the GDD's own
// four-word scale, the material chain from where it is found to the gun that uses
// it, and every gun's damage per second on one axis.
function economy(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const { currency, chain, arsenal } = section
  const steps = currency.scale.length - 1
  const at = (i) => `${((i / steps) * 100).toFixed(3)}%`
  const flowRows = (items) =>
    items
      .map((item) => {
        const from = currency.scale.indexOf(item.from)
        const to = currency.scale.indexOf(item.to)
        const single = from === to
        const text = single ? item.from : `${item.from} – ${item.to}`
        return `
          <div class="sbh-flow-row">
            <span class="sbh-flow-name">${escapeHtml(item.name)}<em lang="zh-Hans">${escapeHtml(item.zh)}</em></span>
            <span class="sbh-flow-track" role="img" aria-label="${escapeHtml(`${item.name}: ${item.detail || text}`)}">
              ${single ? `<i class="sbh-flow-dot" style="left:${at(from)}"></i>` : `<i class="sbh-flow-bar" style="left:${at(from)};width:calc(${at(to)} - ${at(from)})"></i>`}
            </span>
            <span class="sbh-flow-value">${escapeHtml(item.detail || text)}</span>
          </div>`
      })
      .join("")
  const axis = `<div class="sbh-flow-axis" aria-hidden="true"><span></span><span class="sbh-flow-ticks">${currency.scale.map((label, i) => `<i style="left:${at(i)}">${escapeHtml(label)}</i>`).join("")}</span><span></span></div>`
  const currencyHtml = `
    <figure class="sbh-currency">
      <figcaption class="sbh-sub">${escapeHtml(currency.title)}</figcaption>
      <div class="sbh-flow-group"><span class="sbh-flow-group-label">${escapeHtml(currency.sourcesLabel)}</span>${axis}${flowRows(currency.sources)}</div>
      <div class="sbh-flow-group"><span class="sbh-flow-group-label">${escapeHtml(currency.sinksLabel)}</span>${flowRows(currency.sinks)}</div>
      <p class="sbh-fig-note">${gddPair(currency.note)}</p>
    </figure>`

  const chainRows = chain.rows
    .map(
      (row) => `
        <li class="sbh-chain-row">
          <span class="sbh-chain-where">${gddPair(row.where)}</span>
          <span class="sbh-chain-raw">${escapeHtml(row.raw)}<em lang="zh-Hans">${escapeHtml(row.rawZh)}</em></span>
          <ul class="sbh-chain-out">
            ${row.out
              .map(
                (out) => `
                  <li class="${out.uses ? "" : "is-idle"}">
                    <span class="sbh-chain-how">${escapeHtml(out.how)}</span>
                    <strong>${escapeHtml(out.name)}<em lang="zh-Hans">${escapeHtml(out.zh)}</em></strong>
                    <span class="sbh-chain-use">${escapeHtml(out.uses || chain.idleLabel)}</span>
                  </li>`,
              )
              .join("")}
          </ul>
        </li>`,
    )
    .join("")
  const chainHtml = `
    <figure class="sbh-chain">
      <figcaption class="sbh-sub">${escapeHtml(chain.title)}</figcaption>
      <p class="sbh-chain-head" aria-hidden="true">${chain.head.map((cell) => `<span>${escapeHtml(cell)}</span>`).join("")}</p>
      <ol>${chainRows}</ol>
      <p class="sbh-fig-note">${gddPair(chain.note)}</p>
    </figure>`

  const pos = (value) => `${((value / arsenal.max) * 100).toFixed(3)}%`
  const ticks = arsenal.ticks.map((t) => `<i style="left:${pos(t)}">${fmt(t)}</i>`).join("")
  const classes = arsenal.classes
    .map((group) => {
      const values = group.weapons.map((w) => w.dps)
      const low = Math.min(...values)
      const high = Math.max(...values)
      const stacked = new Map()
      for (const w of group.weapons) stacked.set(w.dps, [...(stacked.get(w.dps) || []), w])
      const dots = [...stacked.entries()]
        .map(([dps, list]) => {
          const names = list.map((w) => w.name).join(", ")
          const w = list[0]
          const line = `${w.dmg} dmg × ${w.spm} shots/min × ${w.bullets} ÷ 60 · ${list.map((x) => x.mat).filter((m, i, all) => all.indexOf(m) === i).join(" / ")}`
          const flag = group.flags?.[names] || (list.length > 1 ? `${list.length} identical rows` : "")
          return `
            <span class="sbh-gun${flag ? " is-flagged" : ""}" style="left:${pos(dps)}" tabindex="0" aria-label="${escapeHtml(`${names}: ${fmt(dps)} damage per second. ${line}`)}">
              ${list.length > 1 ? `<b class="sbh-gun-count">×${list.length}</b>` : ""}
              ${tip(escapeHtml, `${names} · ${fmt(dps)} DPS`, line)}
            </span>
            ${flag ? `<span class="sbh-gun-flag" style="left:${pos(dps)}">${escapeHtml(flag)}</span>` : ""}`
        })
        .join("")
      return `
        <div class="sbh-arsenal-row">
          <span class="sbh-arsenal-name">${escapeHtml(group.name)}<em>${escapeHtml(group.ammo)} · <span lang="zh-Hans">${escapeHtml(group.zh)}</span></em></span>
          <span class="sbh-arsenal-track">
            <i class="sbh-arsenal-range" style="left:${pos(low)};width:calc(${pos(high)} - ${pos(low)})"></i>
            ${dots}
          </span>
          <span class="sbh-arsenal-band">${fmt(low)}${high !== low ? `–${fmt(high)}` : ""}</span>
        </div>`
    })
    .join("")
  const arsenalHtml = `
    <figure class="sbh-arsenal">
      <figcaption class="sbh-sub">${escapeHtml(arsenal.title)}</figcaption>
      <div class="sbh-arsenal-axis" aria-hidden="true"><span></span><span class="sbh-arsenal-ticks">${ticks}</span><span></span></div>
      ${classes}
      <p class="sbh-fig-note">${gddPair(arsenal.note)}</p>
    </figure>`

  return shell(section, `<div class="sbh-economy sbh-bleed">${currencyHtml}${chainHtml}${arsenalHtml}</div>`, helpers, "sbh-economy-section")
}

// EXP per level as thirty bars on one axis, the base game's drop maths written out
// as a chain, and each release's hours as bullet bars (all rare items, and the part
// a typical player wants).
function progression(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const { levels, chain, releases } = section
  const max = levels.max
  const cumulative = []
  levels.exp.reduce((sum, value, i) => (cumulative[i] = sum + value), 0)
  const bars = levels.exp
    .map((value, i) => {
      const level = i + 1
      const label = levels.labels.includes(level)
      const sp = level % 5 === 0 ? 5 : 2
      const text = `Level ${level}: ${fmt(value)} EXP to reach, ${fmt(cumulative[i])} in total. +1 attribute point, +${sp} skill points.`
      return `
        <span class="sbh-lvl${label ? " is-labelled" : ""}${level >= levels.wallFrom ? " is-wall" : ""}" tabindex="0" aria-label="${escapeHtml(text)}">
          <i style="height:${((value / max) * 100).toFixed(3)}%">${label ? `<b>${escapeHtml(levels.short[level] || fmt(value))}</b>` : ""}</i>
          ${tip(escapeHtml, `Level ${level} · ${fmt(value)} EXP`, `${fmt(cumulative[i])} in total · +${sp} skill points`)}
        </span>`
    })
    .join("")
  const axis = levels.gridlines.map((g) => `<i style="bottom:${((g / max) * 100).toFixed(3)}%"><span>${escapeHtml(g >= 1000000 ? `${g / 1000000}M` : `${g / 1000}k`)}</span></i>`).join("")
  const brackets = levels.brackets
    .map((b) => `<span class="sbh-lvl-bracket" style="grid-column:${b.from} / ${b.to + 1}"><strong>${escapeHtml(b.value)}</strong>${gddPair(b)}</span>`)
    .join("")
  const levelHtml = `
    <figure class="sbh-levels">
      <figcaption class="sbh-sub">${escapeHtml(levels.title)}</figcaption>
      <div class="sbh-lvl-brackets" aria-hidden="true">${brackets}</div>
      <div class="sbh-lvl-plot">
        <div class="sbh-lvl-grid" aria-hidden="true">${axis}</div>
        <div class="sbh-lvl-bars">${bars}</div>
      </div>
      <div class="sbh-lvl-axis" aria-hidden="true">${levels.exp.map((_, i) => `<span>${i + 1}</span>`).join("")}</div>
      <div class="sbh-lvl-axis is-sp" aria-hidden="true">${levels.exp.map((_, i) => `<span>${(i + 1) % 5 === 0 ? 5 : 2}</span>`).join("")}</div>
      <p class="sbh-lvl-key" aria-hidden="true"><span>${escapeHtml(levels.levelKey)}</span><span>${escapeHtml(levels.spKey)}</span></p>
      <p class="sbh-fig-note">${gddPair(levels.note)}</p>
    </figure>`

  const chainHtml = `
    <figure class="sbh-grind-chain">
      <figcaption class="sbh-sub">${escapeHtml(chain.title)}</figcaption>
      <ol>${chain.steps
        .map(
          (step) => `
            <li class="${step.result ? "is-result" : ""}">
              ${step.op ? `<span class="sbh-grind-op" aria-hidden="true">${escapeHtml(step.op)}</span>` : ""}
              <strong>${escapeHtml(step.value)}</strong>
              <span>${gddPair(step)}</span>
            </li>`,
        )
        .join("")}</ol>
    </figure>`

  const rmax = releases.max
  const rpos = (v) => `${((v / rmax) * 100).toFixed(3)}%`
  const releaseRows = releases.rows
    .map(
      (row) => `
        <div class="sbh-rel-row">
          <span class="sbh-rel-name">${escapeHtml(row.name)}<em lang="zh-Hans">${escapeHtml(row.zh)}</em></span>
          <span class="sbh-rel-track" tabindex="0" aria-label="${escapeHtml(`${row.name}: ${fmt(row.all)} hours for every rare item, ${fmt(row.wanted)} for what a typical player wants${row.sheet ? `; the sheet says ${fmt(row.sheet)}` : ""}`)}">
            <i class="sbh-rel-all" style="width:${rpos(row.all)}"></i>
            <i class="sbh-rel-want" style="width:${rpos(row.wanted)}"></i>
            ${row.sheet ? `<i class="sbh-rel-sheet" style="left:${rpos(Math.min(row.sheet, rmax))}"></i>` : ""}
            ${tip(escapeHtml, `${fmt(row.all)} h · ${fmt(row.wanted)} h wanted`, row.sheet ? `sheet: ${fmt(row.sheet)} h` : row.monsters)}
          </span>
          <span class="sbh-rel-value"><strong>${fmt(row.all)} h</strong> · ${fmt(row.wanted)} h${row.sheetNote ? `<em>${escapeHtml(row.sheetNote)}</em>` : ""}</span>
        </div>`,
    )
    .join("")
  const relTicks = releases.ticks.map((t) => `<i style="left:${rpos(t)}">${fmt(t)}</i>`).join("")
  const releaseHtml = `
    <figure class="sbh-releases">
      <figcaption class="sbh-sub">${escapeHtml(releases.title)}</figcaption>
      <p class="sbh-rel-legend" aria-hidden="true"><span><i class="is-all"></i>${escapeHtml(releases.allLabel)}</span><span><i class="is-want"></i>${escapeHtml(releases.wantLabel)}</span><span><i class="is-sheet"></i>${escapeHtml(releases.sheetLabel)}</span></p>
      <div class="sbh-rel-axis" aria-hidden="true"><span></span><span class="sbh-rel-ticks">${relTicks}</span><span></span></div>
      ${releaseRows}
      <p class="sbh-fig-note">${gddPair(releases.note)}</p>
    </figure>`

  return shell(section, `<div class="sbh-progression sbh-bleed">${levelHtml}${chainHtml}${releaseHtml}</div>`, helpers, "sbh-progression-section")
}

// Year one as one strip of weeks. Every week resets on Thursday; DLC weeks, event
// weeks and the holiday marker carry categorical colour and are labelled directly.
function calendar(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const special = new Map(section.special.map((s) => [s.week, s]))
  const cells = section.ranges
    .map((range, i) => {
      const week = i + 1
      const s = special.get(week)
      const kind = s ? ` is-${s.type}` : ""
      const what = s ? s.label : section.resetLabel
      return `<span class="sbh-cal-week${kind}" tabindex="0" aria-label="${escapeHtml(`Week ${week}, ${range}: ${what}`)}">${tip(escapeHtml, `Week ${week} · ${range}`, what)}</span>`
    })
    .join("")
  const weeks = section.ranges.length
  const col = (w) => `${w} / ${w + 1}`
  const quarters = section.quarters.map((q) => `<span style="grid-column:${q.from} / ${q.to + 1}">${escapeHtml(q.label)}</span>`).join("")
  const months = section.months.map((m) => `<span style="grid-column:${m.from} / span ${m.span}">${escapeHtml(m.label)}</span>`).join("")
  const above = section.labels
    .filter((l) => l.lane === "above")
    .map((l) => `<span class="sbh-cal-label is-${l.type}${l.align ? ` is-${l.align}` : ""}" style="grid-column:${l.span ? `${l.week} / span ${l.span}` : col(l.week)}">${escapeHtml(l.text)}</span>`)
    .join("")
  const below = section.labels
    .filter((l) => l.lane === "below")
    .map((l) => `<span class="sbh-cal-label is-${l.type}${l.align ? ` is-${l.align}` : ""}" style="grid-column:${l.span ? `${l.week} / span ${l.span}` : col(l.week)}">${escapeHtml(l.text)}</span>`)
    .join("")
  const legend = section.legend.map((item) => `<span><i class="is-${item.type}" aria-hidden="true"></i>${escapeHtml(item.label)}</span>`).join("")
  const tableRows = section.special
    .map((s) => `<tr><th scope="row">${s.week}</th><td>${escapeHtml(section.ranges[s.week - 1])}</td><td>${escapeHtml(s.label)}</td></tr>`)
    .join("")
  const design = section.event.items
    .map((item) => `<div class="sbh-event-item"><h3 class="sbh-sub">${escapeHtml(item.title)}</h3><p>${gddPair(item)}</p></div>`)
    .join("")
  const html = `
    <div class="sbh-calendar sbh-bleed">
      <p class="sbh-cal-legend">${legend}</p>
      <div class="sbh-cal-scroll">
        <div class="sbh-cal" style="--weeks:${weeks}">
          <div class="sbh-cal-quarters" aria-hidden="true">${quarters}</div>
          <div class="sbh-cal-lane is-above" aria-hidden="true">${above}</div>
          <div class="sbh-cal-strip" role="group" aria-label="${escapeHtml(section.stripLabel)}">${cells}</div>
          <div class="sbh-cal-lane is-below" aria-hidden="true">${below}</div>
          <div class="sbh-cal-months" aria-hidden="true">${months}</div>
        </div>
      </div>
      <details class="sbh-details">
        <summary>${escapeHtml(section.tableLabel)}</summary>
        <div class="gdd-table-scroll"><table class="gdd-table"><thead><tr><th scope="col">Week</th><th scope="col">Dates</th><th scope="col">What happens</th></tr></thead><tbody>${tableRows}</tbody></table></div>
      </details>
      <div class="sbh-event">
        <div class="sbh-event-head"><span class="sbh-event-key">${escapeHtml(section.event.key)}</span><h3 class="sbh-event-name">${escapeHtml(section.event.name)}</h3></div>
        ${design}
      </div>
    </div>`
  return shell(section, html, helpers, "sbh-calendar-section")
}

// One listener serves every chapter button: it finds the video in the same block.
if (typeof document !== "undefined" && !window.__sbhSeekBound) {
  window.__sbhSeekBound = true
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-sbh-seek]")
    if (!button) return
    const player = button.closest(".sbh-video")?.querySelector("video")
    if (!player) return
    player.currentTime = Number(button.dataset.sbhSeek) || 0
    player.play?.().catch(() => {})
  })
}

export const sbhSectionRenderers = {
  "sbh-timeline": timeline,
  "sbh-heatmap": heatmap,
  "sbh-build": build,
  "sbh-playtest": playtest,
  "sbh-video": video,
  "sbh-screens": screens,
  "sbh-economy": economy,
  "sbh-progression": progression,
  "sbh-calendar": calendar,
}
