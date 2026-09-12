// Section kinds that only a few case studies need. They live here rather than in
// main.js because main.js is shared by every task and is where parallel edits
// collide; main.js only hands a section to this table and passes its helpers in.
//
// Each renderer receives (section, { escapeHtml, gddPair, imageSourceAttrs }) and returns the same
// outer shape as the GDD renderers in main.js: a .gdd-section with a .gdd-h2, an
// optional .gdd-intro and an optional .gdd-note, so spacing and the full-bleed
// rules apply unchanged.

function sectionShell(section, body, { escapeHtml, gddPair }, extraClass = "") {
  return `
    <section class="framer-case-section gdd-section ${extraClass}" aria-label="${escapeHtml(section.title)}">
      <h2 class="gdd-h2">${escapeHtml(section.title)}</h2>
      ${section.intro ? `<p class="gdd-intro">${gddPair(section.intro)}</p>` : ""}
      ${body}
      ${section.note ? `<p class="gdd-note">${gddPair(section.note)}</p>` : ""}
    </section>`
}

// Three acts as three columns of numbered beats. An act can ask for two inner
// columns so a long middle act sits at the same height as the short ones either
// side of it, instead of trailing far below them.
function acts(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const columns = section.acts
    .map((act) => {
      const beats = act.beats
        .map(
          (beat) => `
            <li class="gdd-act-beat">
              <span class="gdd-act-num">${String(beat.n).padStart(2, "0")}</span>
              <span class="gdd-act-copy">${gddPair(beat)}</span>
            </li>`,
        )
        .join("")
      const quote = act.quote
        ? `<blockquote class="gdd-act-quote">${gddPair(act.quote)}${act.quote.who ? `<cite>${escapeHtml(act.quote.who)}</cite>` : ""}</blockquote>`
        : ""
      return `
        <article class="gdd-act" style="--act-span:${act.span || 4}">
          <header class="gdd-act-head">
            <span class="gdd-act-label">${escapeHtml(act.label)}</span>
            <span class="gdd-act-name">${escapeHtml(act.name)}</span>
          </header>
          <ol class="gdd-act-beats${act.split ? " is-split" : ""}"${act.split ? ` style="--act-rows:${Math.ceil(act.beats.length / 2)}"` : ""}>${beats}</ol>
          ${quote}
        </article>`
    })
    .join("")
  return sectionShell(section, `<div class="gdd-acts">${columns}</div>`, helpers, "gdd-acts-section")
}

// A readable rebuild of a POV switch chart: one row per beat, one column per
// playable character. A filled dot is the character carrying the beat, a ring is
// a character present inside that viewpoint. Colours are the chart's own legend.
function povLanes(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const laneStyle = (lane) => `style="--lane:${lane.color}"`
  const head = section.lanes
    .map((lane) => `<th scope="col" class="gdd-lane-head" ${laneStyle(lane)}><span class="gdd-lane-dot is-pov" aria-hidden="true"></span>${escapeHtml(lane.name)}</th>`)
    .join("")
  const laneName = Object.fromEntries(section.lanes.map((lane) => [lane.key, lane.name]))
  // A lane ends where its character leaves: the thread is drawn down to the exit
  // mark and not below it.
  const gone = new Set()
  const rows = section.beats
    .map((beat) => {
      const exiting = beat.exit || (beat.event ? beat.lane : null)
      const cells = section.lanes
        .map((lane) => {
          const laneState = gone.has(lane.key) ? " is-gone" : exiting === lane.key ? " is-ending" : ""
          let mark = ""
          let label = ""
          if ((beat.event && beat.lane === lane.key) || beat.exit === lane.key) {
            mark = `<span class="gdd-lane-dot is-exit" aria-hidden="true"></span>`
            label = `${lane.name} leaves`
          } else if (beat.pov === lane.key) {
            mark = `<span class="gdd-lane-dot is-pov" aria-hidden="true"></span>`
            label = `${lane.name} carries the viewpoint`
          } else if (beat.present?.includes(lane.key)) {
            mark = `<span class="gdd-lane-dot is-present" aria-hidden="true"></span>`
            label = `${lane.name} present`
          }
          return `<td class="gdd-lane-cell${laneState}" ${laneStyle(lane)}>${mark}${label ? `<span class="gdd-sr">${escapeHtml(label)}</span>` : ""}</td>`
        })
        .join("")
      if (exiting) gone.add(exiting)
      const who = beat.event ? "" : `<span class="gdd-lane-pov">${escapeHtml(laneName[beat.pov] || "")}${beat.with ? ` <em>${escapeHtml(beat.with)}</em>` : ""}</span>`
      const choice = beat.choice ? `<span class="gdd-lane-choice"><span class="gdd-lane-choice-mark">CHOICE</span>${gddPair(beat.choice)}</span>` : ""
      return `
        <tr class="${beat.event ? "is-event" : ""}">
          <th scope="row">${escapeHtml(beat.scene || "")}</th>
          ${cells}
          <td class="gdd-lane-text">${who}<span class="gdd-lane-copy">${gddPair(beat)}</span>${choice}</td>
        </tr>`
    })
    .join("")
  const table = `
    <div class="gdd-table-scroll">
      <table class="gdd-table gdd-lanes">
        <thead><tr><th scope="col">Scene</th>${head}<th scope="col">What happens</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="gdd-lane-legend" aria-hidden="true">
      <span><span class="gdd-lane-dot is-pov"></span>carries the viewpoint</span>
      <span><span class="gdd-lane-dot is-present"></span>present inside it</span>
      <span><span class="gdd-lane-dot is-exit"></span>leaves the group</span>
    </p>`
  return sectionShell(section, table, helpers, "gdd-lanes-section")
}

// Narrative mechanisms with the share of play each is budgeted, one row each:
// the principle on the left, two worked examples on the right.
function mechanisms(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const rows = section.items
    .map((item) => {
      const examples = item.examples
        .map(
          (example) => `
            <div class="gdd-mech-example">
              <span class="gdd-mech-example-label">${escapeHtml(example.label)}</span>
              <p>${gddPair(example)}</p>
            </div>`,
        )
        .join("")
      return `
        <article class="gdd-mech">
          <div class="gdd-mech-lead">
            <span class="gdd-mech-role">${escapeHtml(item.role)}</span>
            <h3 class="gdd-mech-name">${escapeHtml(item.name)}</h3>
            <div class="gdd-mech-share" role="img" aria-label="${escapeHtml(item.shareLabel)}">
              <span class="gdd-mech-bar"><span style="width:${Math.max(0, Math.min(100, item.share))}%"></span></span>
              <span class="gdd-mech-share-label">${escapeHtml(item.shareLabel)}</span>
            </div>
            <p class="gdd-mech-principle">${gddPair(item.principle)}</p>
          </div>
          <div class="gdd-mech-examples">${examples}</div>
        </article>`
    })
    .join("")
  const coda = section.coda ? `<p class="gdd-mech-coda">${gddPair(section.coda)}</p>` : ""
  return sectionShell(section, `<div class="gdd-mechs">${rows}</div>${coda}`, helpers, "gdd-mechs-section")
}

// A persona laid out as type: who, the line they would say, and four columns of
// the board's own tags. `before` keeps the pre-interview line beside the final
// one, so the reader can see what the research changed.
function persona(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const columns = section.columns
    .map(
      (column) => `
        <div class="gdd-persona-col">
          <h3 class="gdd-persona-col-label">${escapeHtml(column.label)}</h3>
          <ul>${column.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>`,
    )
    .join("")
  const before = section.before
    ? `<figure class="gdd-persona-before"><figcaption>${escapeHtml(section.before.label || "Before the interviews")}</figcaption><blockquote>${gddPair(section.before)}</blockquote></figure>`
    : ""
  const body = `
    <div class="gdd-persona">
      <div class="gdd-persona-who">
        <span class="gdd-persona-tag">${escapeHtml(section.tag || "")}</span>
        <span class="gdd-persona-name">${escapeHtml(section.name)}</span>
        ${section.bio ? `<p class="gdd-persona-bio">${gddPair(section.bio)}</p>` : ""}
      </div>
      <div class="gdd-persona-voice">
        <blockquote class="gdd-persona-quote">${gddPair(section.quote)}</blockquote>
        ${before}
      </div>
      <div class="gdd-persona-cols">${columns}</div>
    </div>`
  return sectionShell(section, body, helpers, "gdd-persona-section")
}

// App screens grouped by flow on one grid: each group spans as many columns as it
// has screens, so the groups close whole rows when their counts add up.
function screens(section, helpers) {
  const { escapeHtml, imageSourceAttrs } = helpers
  const groups = section.groups
    .map(
      (group) => `
        <div class="gdd-screen-group" style="--group-span:${group.screens.length}">
          <span class="gdd-screen-group-label">${escapeHtml(group.label)}</span>
          <div class="gdd-screen-row">
            ${group.screens
              .map(
                (screen) => `
                  <figure class="gdd-screen">
                    <img ${imageSourceAttrs(screen.image)} alt="${escapeHtml(screen.alt || screen.name)}" loading="lazy" decoding="async" />
                    <figcaption>${escapeHtml(screen.name)}</figcaption>
                  </figure>`,
              )
              .join("")}
          </div>
        </div>`,
    )
    .join("")
  return sectionShell(section, `<div class="gdd-screens" style="--screen-cols:${section.columns}">${groups}</div>`, helpers, "gdd-screens-section")
}

// A user flow as lanes of type instead of a picture of a flowchart. Pages are
// boxed, actions are dots, decisions are diamonds with their branches written
// out, and a branch that leaves the lane names where it goes.
function flowLanes(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const lanes = section.lanes
    .map((lane) => {
      const nodes = lane.nodes
        .map((node) => {
          const branches = node.branches?.length
            ? `<ul class="gdd-flow-branches">${node.branches.map((b) => `<li><span class="gdd-flow-branch-key">${escapeHtml(b.key)}</span>${escapeHtml(b.to)}</li>`).join("")}</ul>`
            : ""
          return `<li class="gdd-flow-node is-${node.type}"><span class="gdd-flow-mark" aria-hidden="true"></span><span class="gdd-flow-text">${escapeHtml(node.text)}</span>${branches}</li>`
        })
        .join("")
      return `
        <article class="gdd-flow-lane">
          <header><span class="gdd-flow-step">${escapeHtml(lane.step)}</span><span class="gdd-flow-name">${escapeHtml(lane.name)}</span></header>
          <ol>${nodes}</ol>
        </article>`
    })
    .join("")
  const key = `
    <p class="gdd-flow-key" aria-hidden="true">
      <span class="is-page"><span class="gdd-flow-mark"></span>page</span>
      <span class="is-action"><span class="gdd-flow-mark"></span>action</span>
      <span class="is-decision"><span class="gdd-flow-mark"></span>decision</span>
    </p>`
  return sectionShell(section, `<div class="gdd-flow-lanes" style="--lane-count:${section.lanes.length}">${lanes}</div>${key}`, helpers, "gdd-flow-section")
}

// Survey results from repeated playtest rounds, drawn in type and CSS rather than
// pasted as a spreadsheet screenshot. Ordered answers (Likert-style) become
// diverging stacked bars centred on the neutral answer, one bar per round, so the
// rounds read against each other on a shared centre line; single-choice questions
// become dumbbells (earlier round -> later round). Every value reachable in a
// tooltip is also in the table at the end, and the bar ends carry direct labels.
function survey(section, helpers) {
  const { escapeHtml, gddPair } = helpers
  const rounds = section.rounds
  const pct = (count, total) => (total ? Math.round((count / total) * 100) : 0)
  const tone = { 2: "is-pos2", 1: "is-pos1", 0: "is-neu", "-1": "is-neg1", "-2": "is-neg2" }

  const figures = section.figures?.length
    ? `<div class="gdd-survey-figures">${section.figures
        .map(
          (figure) => `
          <div class="gdd-survey-figure">
            <span class="gdd-survey-figure-value">${escapeHtml(figure.value)}</span>
            <span class="gdd-survey-figure-label">${gddPair(figure.label)}</span>
          </div>`,
        )
        .join("")}</div>`
    : ""

  const likert = section.likert
    .map((question) => {
      const legend = question.scale
        .map((label, i) => `<span class="gdd-lk-key ${tone[question.poles[i]]}"><i aria-hidden="true"></i>${escapeHtml(label)}</span>`)
        .join("")
      const bars = rounds
        .map((round) => {
          const counts = question.counts[round.key]
          const total = counts.reduce((sum, count) => sum + count, 0)
          const answers = question.scale
            .map((label, i) => ({ label, pole: question.poles[i], count: counts[i] }))
            .filter((answer) => answer.count > 0)
            .sort((a, b) => a.pole - b.pole)
          const countWhere = (test) => answers.filter(test).reduce((sum, answer) => sum + answer.count, 0)
          const negative = countWhere((answer) => answer.pole < 0)
          const neutral = countWhere((answer) => answer.pole === 0)
          const positive = countWhere((answer) => answer.pole > 0)
          // The track spans -100%..+100% of answers; the neutral share straddles the centre.
          const start = 50 - ((negative + neutral / 2) / total) * 50
          const end = start + ((negative + neutral + positive) / total) * 50
          // Each segment sits on the track by its own offset, so widths are shares
          // of the track itself and nothing overhangs the track's box.
          let offset = start
          const segments = answers
            .map((answer, i) => {
              const width = (answer.count / total) * 50
              const ends = `${i === 0 ? " is-first" : ""}${i === answers.length - 1 ? " is-last" : ""}`
              const text = `${answer.count} of ${total}, ${pct(answer.count, total)}% — ${answer.label}, ${round.label}`
              const html = `<span class="gdd-lk-seg ${tone[answer.pole]}${ends}" style="left:${offset.toFixed(3)}%;width:${width.toFixed(3)}%" tabindex="0" aria-label="${escapeHtml(text)}"><span class="gdd-survey-tip" aria-hidden="true"><strong>${answer.count} of ${total} · ${pct(answer.count, total)}%</strong><span><i></i>${escapeHtml(answer.label)} — ${escapeHtml(round.label)}</span></span></span>`
              offset += width
              return html
            })
            .join("")
          const blank = question.blank?.[round.key] ? ` · ${question.blank[round.key]} blank` : ""
          return `
            <div class="gdd-lk-bar">
              <span class="gdd-lk-round">${escapeHtml(round.short)} <em>${total}${blank}</em></span>
              <div class="gdd-lk-track">
                ${negative ? `<span class="gdd-lk-total is-neg" style="right:${(100 - start).toFixed(3)}%">${pct(negative, total)}%</span>` : ""}
                ${segments}
                ${positive ? `<span class="gdd-lk-total is-pos" style="left:${end.toFixed(3)}%">${pct(positive, total)}%</span>` : ""}
              </div>
            </div>`
        })
        .join("")
      return `
        <div class="gdd-lk-row">
          <div class="gdd-lk-question">
            <span class="gdd-lk-question-text">${gddPair(question)}</span>
            <span class="gdd-lk-legend">${legend}</span>
          </div>
          <div class="gdd-lk-bars">${bars}</div>
        </div>`
    })
    .join("")

  const dumbbells = (section.dumbbells || [])
    .map((chart) => {
      const [first, last] = rounds
      const rows = chart.items
        .map((item) => {
          const a = (item[first.key] / chart.base[first.key]) * 100
          const b = (item[last.key] / chart.base[last.key]) * 100
          const low = Math.min(a, b)
          const dot = (round, value, count) =>
            `<span class="gdd-db-dot is-${round.key}" style="left:${value.toFixed(3)}%" tabindex="0" aria-label="${escapeHtml(`${count} of ${chart.base[round.key]}, ${Math.round(value)}% — ${item.label}, ${round.label}`)}"><span class="gdd-survey-tip" aria-hidden="true"><strong>${count} of ${chart.base[round.key]} · ${Math.round(value)}%</strong><span><i></i>${escapeHtml(round.label)}</span></span></span>`
          return `
            <div class="gdd-db-row">
              <span class="gdd-db-label">${escapeHtml(item.label)}<em lang="zh-Hans">${escapeHtml(item.zh)}</em></span>
              <div class="gdd-db-track">
                <span class="gdd-db-line" style="left:${low.toFixed(3)}%;width:${Math.abs(b - a).toFixed(3)}%"></span>
                ${dot(first, a, item[first.key])}
                ${dot(last, b, item[last.key])}
                <span class="gdd-db-value ${b >= a ? "is-right" : "is-left"}" style="left:${b.toFixed(3)}%">${Math.round(b)}%</span>
              </div>
            </div>`
        })
        .join("")
      return `
        <figure class="gdd-db">
          <figcaption class="gdd-db-title">${gddPair(chart)}</figcaption>
          <p class="gdd-db-legend" aria-hidden="true">${rounds.map((round) => `<span class="is-${round.key}"><i></i><strong>${escapeHtml(round.label)}</strong><em> · ${chart.base[round.key]}</em></span>`).join("")}</p>
          <div class="gdd-db-rows">
            <div class="gdd-db-axis" aria-hidden="true"><span></span><span class="gdd-db-ticks"><i style="left:0%">0%</i><i style="left:25%">25%</i><i style="left:50%">50%</i><i style="left:75%">75%</i><i style="left:100%">100%</i></span></div>
            ${rows}
          </div>
          ${chart.note ? `<p class="gdd-db-note">${gddPair(chart.note)}</p>` : ""}
        </figure>`
    })
    .join("")

  const quotes = section.quotes
    ? `<div class="gdd-survey-quotes">${rounds
        .map(
          (round) => `
          <div class="gdd-survey-quote-col">
            <span class="gdd-survey-quote-round">${escapeHtml(round.label)} · ${escapeHtml(round.date)}</span>
            ${(section.quotes[round.key] || []).map((quote) => `<blockquote>${gddPair(quote)}</blockquote>`).join("")}
          </div>`,
        )
        .join("")}</div>`
    : ""

  const tableFor = (title, head, rows) => `
    <div class="gdd-table-scroll gdd-survey-table">
      <table class="gdd-table">
        <caption>${title}</caption>
        <thead><tr>${head.map((cell) => `<th scope="col">${escapeHtml(cell)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell, i) => (i === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`)).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`
  const roundHead = ["Answer", ...rounds.map((round) => `${round.label} (${round.n})`)]
  const tables = [
    ...section.likert.map((question) =>
      tableFor(
        escapeHtml(question.en),
        roundHead,
        [
          ...question.scale.map((label, i) => [label, ...rounds.map((round) => String(question.counts[round.key][i]))]),
          ...(question.blank ? [["No answer", ...rounds.map((round) => String(question.blank[round.key] || 0))]] : []),
        ],
      ),
    ),
    ...(section.dumbbells || []).map((chart) =>
      tableFor(
        escapeHtml(chart.en),
        roundHead,
        [
          ...chart.items.map((item) => [item.label, ...rounds.map((round) => String(item[round.key]))]),
          ...(chart.blank ? [["No answer", ...rounds.map((round) => String(chart.blank[round.key] || 0))]] : []),
        ],
      ),
    ),
    ...(section.extraTables || []).map((extra) => tableFor(escapeHtml(extra.en), extra.head, extra.rows)),
  ].join("")
  const tableView = `
    <details class="gdd-survey-details">
      <summary>${escapeHtml(section.tableLabel || "Every count, both rounds")}</summary>
      <div class="gdd-survey-tables">${tables}</div>
    </details>`

  const body = `
    <div class="gdd-survey">
      ${figures}
      <div class="gdd-lk">${likert}</div>
      ${dumbbells ? `<div class="gdd-dbs">${dumbbells}</div>` : ""}
      ${quotes}
      ${tableView}
    </div>`
  return sectionShell(section, body, helpers, "gdd-survey-section")
}

export const extraSectionRenderers = {
  acts,
  "pov-lanes": povLanes,
  mechanisms,
  persona,
  screens,
  "flow-lanes": flowLanes,
  survey,
  "case-gallery": caseGallery,
  "evidence-table": evidenceTable,
  "reference-links": referenceLinks,
  audience,
}

function caseGallery(section, { escapeHtml, gddPair, imageSourceAttrs }) {
  const items = section.items.map((item) => `<figure class="case-reference-figure"><img ${imageSourceAttrs(item.image)} alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async" /><figcaption><strong>${escapeHtml(item.label)}</strong><span>${gddPair(item.caption)}</span></figcaption></figure>`).join("")
  return sectionShell(section, `<div class="case-reference-gallery">${items}</div>`, { escapeHtml, gddPair }, "case-reference-section")
}

function evidenceTable(section, { escapeHtml, gddPair }) {
  const rows = section.rows.map((row) => `<tr><th scope="row">${escapeHtml(row[0])}</th><td>${gddPair(row[1])}</td></tr>`).join("")
  return sectionShell(section, `<div class="gdd-table-scroll"><table class="gdd-table case-evidence-table"><tbody>${rows}</tbody></table></div>`, { escapeHtml, gddPair }, "case-reference-section")
}

function referenceLinks(section, { escapeHtml, gddPair }) {
  const links = section.items.map((item) => `<li><a href="${escapeHtml(item.href)}"${item.external ? ' target="_blank" rel="noreferrer"' : ""}>${escapeHtml(item.label)} ↗</a><span>${gddPair(item.copy)}</span></li>`).join("")
  return sectionShell(section, `<ul class="case-reference-links">${links}</ul>`, { escapeHtml, gddPair }, "case-reference-section")
}

// Who a game is for, opening the drawer: the player experience goal and the
// target audience as type, beside a positioning map — solo ↔ social across,
// casual ↔ hardcore up. The project's target is a shaded zone; neighbouring
// player groups sit as chips, filled when they are the core of the audience.
// Coordinates run from -1 to 1 on both axes.
// The game's own name sits in whichever corner of its field leaves the most
// room, measured as boxes rather than points: a name is much wider than it is
// tall, and so is every audience label beside it. Units are plane fractions
// against a 2:1 plane roughly 750px wide, which is what the layout gives it.
const PLANE_W = 750 // the plane is ~750 × 375 in the drawer at desktop width
const PLANE_H = 375
const CHAR_W = 7.6 // average glyph width of the 15px label face
const LINE_H = 20

// Everything below works in the map's own −1…1 coordinates, so a box is sized
// as a fraction of the plane and doubled to span that range.
const spanX = (px) => (Math.min(px, 220) / PLANE_W) * 2
const spanY = (px) => (px / PLANE_H) * 2

function groupSide(group) {
  return group.side || (group.x > 0.24 ? "left" : "right")
}

function groupLabelBox(group) {
  const w = spanX(CHAR_W * String(group.label).length + 24)
  const h = spanY(LINE_H)
  const left = groupSide(group) === "left" ? group.x - w : group.x
  return { x0: left, x1: left + w, y0: group.y - h / 2, y1: group.y + h / 2 }
}

function zoneLabelBox(zone, corner) {
  // "THIS GAME" runs in front of the name on the same line, so the box is one
  // line tall and about 70px wider than the name itself.
  const w = spanX(CHAR_W * String(zone.label).length + 86)
  const h = spanY(LINE_H + 8)
  const x0 = corner.endsWith("l") ? zone.x0 + spanX(12) : zone.x1 - spanX(12) - w
  const y1 = corner.startsWith("t") ? zone.y1 - spanY(10) : zone.y0 + spanY(10) + h
  return { x0, x1: x0 + w, y0: y1 - h, y1 }
}

function overlapArea(a, b) {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)
  return w > 0 && h > 0 ? w * h : 0
}

// The game's own name sits in whichever corner of its field collides least
// with the audience labels, so the two never have to share the same pixels.
function zoneLabelCorner(zone, groups) {
  const boxes = groups.map(groupLabelBox)
  let best = "tl"
  let bestCost = Infinity
  for (const corner of ["tl", "bl", "tr", "br"]) {
    const box = zoneLabelBox(zone, corner)
    const cost = boxes.reduce((sum, other) => sum + overlapArea(box, other), 0)
    if (cost < bestCost - 0.000001) {
      bestCost = cost
      best = corner
    }
  }
  return best
}

function audience(section, { escapeHtml, gddPair }) {
  const map = section.map
  const pct = (value) => Math.round(((value + 1) / 2) * 1000) / 10
  const zone = map.target
  const [solo, social] = map.x || ["Solo", "Social"]
  const [casual, hardcore] = map.y || ["Casual", "Hardcore"]
  // Each group is a point with its name set beside it, the way the survey
  // charts label a bar. The name always runs towards the middle of the plane,
  // so a point near an edge cannot push its own label off the figure.
  const chips = map.groups
    .map(
      (group, index) =>
        `<li class="case-audience-chip${group.core ? " is-core" : ""}" data-side="${groupSide(group)}" style="left:${pct(group.x)}%;top:${100 - pct(group.y)}%;--i:${index}"><span class="case-audience-chip-index" aria-hidden="true">${index + 1}</span><span class="case-audience-chip-label">${escapeHtml(group.label)}</span></li>`,
    )
    .join("")
  // Narrow screens cannot hold free-set labels without them colliding, so the
  // points keep numbers there and the names move into a key under the plane.
  const key = map.groups
    .map((group, index) => `<li class="case-audience-key-item${group.core ? " is-core" : ""}"><span>${index + 1}</span>${escapeHtml(group.label)}</li>`)
    .join("")
  const plane = `
      <figure class="case-audience-map" aria-label="${escapeHtml(map.alt || `Target audience map for ${zone.label}`)}">
        <div class="case-audience-plane">
          <span class="case-audience-axis case-audience-axis--x" aria-hidden="true"></span>
          <span class="case-audience-axis case-audience-axis--y" aria-hidden="true"></span>
          <span class="case-audience-pole case-audience-pole--top">${escapeHtml(hardcore)}</span>
          <span class="case-audience-pole case-audience-pole--bottom">${escapeHtml(casual)}</span>
          <span class="case-audience-pole case-audience-pole--left">${escapeHtml(solo)}</span>
          <span class="case-audience-pole case-audience-pole--right">${escapeHtml(social)}</span>
          <div class="case-audience-zone" data-corner="${zoneLabelCorner(zone, map.groups)}" style="left:${pct(zone.x0)}%;top:${100 - pct(zone.y1)}%;width:${pct(zone.x1) - pct(zone.x0)}%;height:${pct(zone.y1) - pct(zone.y0)}%"><span class="case-audience-zone-label"><em>This game</em>${escapeHtml(zone.label)}</span></div>
          <ul class="case-audience-chips">${chips}</ul>
        </div>
        <ol class="case-audience-key">${key}</ol>
      </figure>`
  const copy = `
      <div class="case-audience-copy">
        <h3 class="case-audience-heading">Player Experience Goal</h3>
        <p>${gddPair(section.goal)}</p>
      </div>
      <div class="case-audience-copy">
        <h3 class="case-audience-heading">Target Audience</h3>
        <p>${gddPair(section.audience)}</p>
      </div>`
  return sectionShell({ ...section, title: section.title || "Who It Is For" }, `<div class="case-audience-grid">${copy}${plane}</div>`, { escapeHtml, gddPair }, "case-audience-section")
}
