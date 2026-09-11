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

export const extraSectionRenderers = {
  acts,
  "pov-lanes": povLanes,
  mechanisms,
  persona,
  screens,
  "flow-lanes": flowLanes,
}
