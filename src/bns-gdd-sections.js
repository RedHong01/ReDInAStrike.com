// Build n Shoot — Game Design Document (4th Iteration), rebuilt for the project
// drawer. Content comes from MovementGame_4thIteration_GDDRW_Draft.pdf; the
// structure is authored, not flattened, because the source is a diagrammatic
// document: symbol keys, purchase matrices and an AI state table carry as much
// of the design as the prose does. Diagrams are inline SVG in the site's ink /
// rule / soft-surface language rather than page screenshots.

const ink = "var(--case-ink)"
// Highlighted cells and blocks take the project's sampled theme colour so the
// diagrams read as part of this project rather than as generic grey figures.
const accent = "color-mix(in srgb, var(--case-accent, var(--case-ink)) 55%, transparent)"
const accentSoft = "color-mix(in srgb, var(--case-accent, var(--case-ink)) 30%, transparent)"

// The component symbols. The GDD runs on placeholders, so these are drawn as a
// consistent key rather than illustrated: one stroke weight, one corner radius,
// a mono letter where the original used a labelled placeholder card.
function svg(body, w = 34, h = 34) {
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false">${body}</svg>`
}

function card(letter) {
  return svg(
    `<rect x="7" y="3" width="20" height="28" rx="2.5" fill="none" stroke="${ink}" stroke-width="1.1"/>` +
      `<text x="17" y="21" text-anchor="middle" font-family="var(--type-subtitle-font)" font-size="11" fill="${ink}">${letter}</text>`,
  )
}

function block() {
  return svg(
    `<path d="M17 5 L29 12 L29 24 L17 31 L5 24 L5 12 Z" fill="${accentSoft}" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>` +
      `<path d="M5 12 L17 19 L29 12 M17 19 L17 31" fill="none" stroke="${ink}" stroke-width="0.8" opacity="0.65"/>`,
  )
}

function mark() {
  return svg(
    `<rect x="6" y="6" width="22" height="22" fill="none" stroke="${ink}" stroke-width="1.1"/>` +
      `<path d="M6 6 L28 28 M28 6 L6 28" stroke="${ink}" stroke-width="0.8" opacity="0.5"/>`,
  )
}

function avatar() {
  return svg(
    `<circle cx="17" cy="12" r="5.5" fill="none" stroke="${ink}" stroke-width="1.1"/>` +
      `<path d="M7 30 C7 22 27 22 27 30 Z" fill="${accentSoft}" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>`,
  )
}

function die() {
  return svg(
    `<rect x="5" y="5" width="24" height="24" rx="3" fill="none" stroke="${ink}" stroke-width="1.1"/>` +
      [
        [11, 11],
        [23, 11],
        [11, 17],
        [23, 17],
        [11, 23],
        [23, 23],
      ]
        .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="1.7" fill="${ink}"/>`)
        .join(""),
  )
}

function unit() {
  return svg(
    `<path d="M17 4 L28 11 V23 L17 30 L6 23 V11 Z" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>` +
      `<circle cx="17" cy="17" r="4.5" fill="${accent}" stroke="${ink}" stroke-width="0.9"/>`,
  )
}

// A single grid square, reused across the board diagrams.
function cell(x, y, s, fill) {
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${fill || "none"}" stroke="${ink}" stroke-width="0.6" opacity="0.9"/>`
}

const levelDiagram = `
<svg viewBox="0 0 460 190" role="img" aria-label="Climbing level blocks costs an extra dice point per level">
  <g font-family="var(--type-subtitle-font)" font-size="9" letter-spacing="0.06em" fill="${ink}">
    ${[0, 1, 2, 3, 4, 5].map((i) => cell(20 + i * 46, 118, 46, i === 0 ? accentSoft : "none")).join("")}
    <rect x="112" y="72" width="46" height="46" fill="${accentSoft}" stroke="${ink}" stroke-width="0.6"/>
    <rect x="158" y="72" width="46" height="46" fill="${accent}" stroke="${ink}" stroke-width="0.6"/>
    <rect x="158" y="26" width="46" height="46" fill="${accent}" stroke="${ink}" stroke-width="0.6"/>
    <text x="43" y="146" text-anchor="middle">START</text>
    <text x="135" y="100" text-anchor="middle">LV 1</text>
    <text x="181" y="100" text-anchor="middle">LV 2</text>
    <text x="181" y="54" text-anchor="middle">LV 3</text>
    <path d="M43 112 L43 96 L112 96" fill="none" stroke="${ink}" stroke-width="1" stroke-dasharray="3 3"/>
    <path d="M204 49 L246 49" fill="none" stroke="${ink}" stroke-width="1"/>
    <text x="256" y="46">CLIMB LV1 → NO COST</text>
    <text x="256" y="60">CLIMB LV2 / LV3 → +1 TO THE D6</text>
    <text x="256" y="74">DESCEND → FREE, AS FLAT GRID</text>
  </g>
</svg>`

const bulletDiagram = `
<svg viewBox="0 0 460 180" role="img" aria-label="A bullet travels its D6 range and gains one unit for each of the player's own territory marks">
  <g font-family="var(--type-subtitle-font)" font-size="9" letter-spacing="0.06em" fill="${ink}">
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => cell(20 + i * 40, 60, 40, i >= 3 && i <= 4 ? accent : "none")).join("")}
    <circle cx="40" cy="80" r="7" fill="${ink}"/>
    <text x="40" y="118" text-anchor="middle">AVATAR</text>
    <path d="M52 80 L332 80" fill="none" stroke="${ink}" stroke-width="1.2" marker-end="url(#gddArrow)"/>
    <text x="160" y="46" text-anchor="middle">D6 RANGE = 4</text>
    <text x="280" y="46" text-anchor="middle">+1 PER OWN MARK</text>
    <text x="20" y="152">OWN TERRITORY MARKS EXTEND THE SHOT — THE EFFECT CAN REPEAT</text>
    <text x="20" y="166">BULLETS TRAVEL STRAIGHT: ORTHOGONAL OR DIAGONAL, NO TURNS</text>
  </g>
  <defs>
    <marker id="gddArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="${ink}"/>
    </marker>
  </defs>
</svg>`

const boardDiagram = `
<svg viewBox="0 0 300 300" role="img" aria-label="A fifteen by fifteen grid with a starting corner for each of up to four players">
  <g>
    ${Array.from({ length: 15 }, (_, r) =>
      Array.from({ length: 15 }, (_, c) => {
        const corner =
          (r < 3 && c < 3) || (r < 3 && c > 11) || (r > 11 && c < 3) || (r > 11 && c > 11)
        return cell(15 + c * 18, 15 + r * 18, 18, corner ? accentSoft : "none")
      }).join(""),
    ).join("")}
  </g>
  <g font-family="var(--type-subtitle-font)" font-size="8" letter-spacing="0.06em" fill="${ink}">
    <text x="15" y="10">15 × 15</text>
    <text x="285" y="296" text-anchor="end">SHADED — PLAYER START AREAS</text>
  </g>
</svg>`

export const bnsGddSections = [
  {
    kind: "copy-grid",
    title: "Overview",
    left: {
      title: "Setting",
      en: "A turn-based strategy shooting game for up to four players, set on floating islands infused with raw magical energy. Players are mages competing for the ancient lands: they build platforms and bullet-blocking bunkers out of arcane resources, and claim territory simply by walking over it.",
      zh: "最多四人的回合制策略射擊遊戲，場景是充滿原始魔力的浮島。玩家扮演法師爭奪這片古老土地：用奧術資源建造平台與擋彈掩體，並藉由走過格子來佔領土地。",
    },
    right: {
      title: "Primary Goal",
      en: "Eliminate the other players and be the last one standing. One session runs about 30 minutes.",
      zh: "淘汰其他玩家，成為最後存活的人。一局約 30 分鐘。",
    },
  },
  {
    kind: "system-grid",
    title: "Three Game Pillars",
    items: [
      ["TRAVERSE", "Roll a D6 each move stage; move orthogonally and mark every grid you pass through.", "每個移動階段擲一顆 D6；只能直向移動，並在經過的每一格留下領地標記。"],
      ["BUILD", "Spend resource cards on level blocks that raise the ground and block bullets.", "用資源卡建造高度方塊，抬升地面並阻擋子彈。"],
      ["SHOOT", "Resolve a shot from your avatar's position; your own marks extend its range.", "從角色所在位置結算射擊；自己的領地標記會延長射程。"],
    ],
  },
  {
    kind: "spec-table",
    title: "Play Value",
    intro: {
      en: "The document rates the experience it is aiming for, and names what produces each rating.",
      zh: "文件為目標體驗評分，並說明每個評分由什麼產生。",
    },
    head: ["Axis", "Rating", "What produces it"],
    rows: [
      ["Novelty", "Mid-High", "The player can reshape the map by building their own territory."],
      ["Challenge", "Mid-High", "Enemy players and the obstacles they build get in the way."],
      ["Stimulation", "Mid", "The map can change at any time because of another player's building action."],
      ["Harmony", "Low", "Last-man-standing leaves little room for cooperative play."],
      ["Threat", "High", "Elimination is permanent, and the board can turn against you."],
    ],
  },
  {
    kind: "flow",
    title: "Revision History",
    steps: [
      ["2ND ITERATION", "Added the Inventory System; every item and action card was rewritten around carrying weight.", "加入物品欄系統；所有物品與行動卡都依照負重重新設計。"],
      ["3RD ITERATION", "Added the AI System, and rebuilt turn progression around it.", "加入 AI 系統，並依此重建回合流程。"],
      ["4TH ITERATION", "Revised the AI System for clearer situational behaviour, and updated progression to match.", "修訂 AI 系統，讓情境行為更明確，並同步更新流程。"],
    ],
  },
  {
    kind: "symbol-key",
    title: "Components",
    intro: {
      en: "Art is still in progress, so the prototype runs on symbols and placeholders. Each symbol below is one countable thing on the table.",
      zh: "美術仍在進行中，因此原型以符號與替代物運作。以下每個符號都對應桌面上一個可計數的元件。",
    },
    items: [
      { name: "Action Card", qty: "×3 at setup", symbol: card("A"),
        copy: { en: "One available action: move, shoot, build, use an item, or place a unit.", zh: "一次可用行動：移動、射擊、建造、使用物品或放置單位。" } },
      { name: "Resource Card", qty: "6 stack = 1 weight", symbol: card("R"),
        copy: { en: "One point of building resource. Spent to place a level block.", zh: "一點建造資源，用於放置高度方塊。" } },
      { name: "Ammo Card", qty: "3 stack = 1 weight", symbol: card("M"),
        copy: { en: "One available shot.", zh: "一次可用射擊。" } },
      { name: "HP Card", qty: "×4 at setup", symbol: card("H"),
        copy: { en: "One health point. At zero the player is eliminated.", zh: "一點生命值。歸零即淘汰。" } },
      { name: "Level Block", qty: "×3 at setup", symbol: block(),
        copy: { en: "A colour block the size of one grid square. It raises ground and stops bullets.", zh: "與格子同尺寸的顏色方塊，可抬升地面並阻擋子彈。" } },
      { name: "Territory Mark", qty: "×56 at setup", symbol: mark(),
        copy: { en: "Dropped on every grid you walk through. Overwrites another player's mark.", zh: "走過的每一格都會留下，並覆蓋其他玩家的標記。" } },
      { name: "Avatar Piece", qty: "1 per player", symbol: avatar(),
        copy: { en: "The player on the board. Up to four colours, so up to four players.", zh: "玩家在棋盤上的本體。最多四種顏色，即最多四位玩家。" } },
      { name: "D6", qty: "×1 shared", symbol: die(),
        copy: { en: "Rolled for movement distance and for base shooting range.", zh: "用於決定移動距離與基礎射程。" } },
      { name: "AI Unit", qty: "3 types", symbol: unit(),
        copy: { en: "Attack, Defense and Support Guards. Bought with territory marks and placed on the board.", zh: "攻擊、防禦與支援守衛。以領地標記購買後放置到棋盤上。" } },
    ],
  },
  {
    kind: "flow",
    title: "One Turn",
    steps: [
      ["ACTION CARDS", "Spend as many action cards as you hold; each buys one move, shot, build, item or unit placement.", "手上有幾張行動卡就能用幾次，每張換一次移動、射擊、建造、使用物品或放置單位。"],
      ["SETTLEMENT", "Check the surrounding nine grid spaces; any items there are collected automatically.", "檢查周圍九格，該處物品自動收取。"],
      ["AI ACTIVITY", "Every surviving AI unit takes one turn according to its behaviour logic.", "每個存活的 AI 單位依行為邏輯執行一個回合。"],
      ["PURCHASE", "Spend territory marks on items. Nothing bought this step can be used until the next turn.", "用領地標記購買物品。此階段購入的物品要到下一回合才能使用。"],
    ],
  },
  {
    kind: "spec-table",
    title: "Purchase Matrix",
    intro: {
      en: "Territory marks are the currency. Marks spent stay on the board as components — only their point value is consumed, and only unspent marks count toward the next purchase.",
      zh: "領地標記就是貨幣。花掉的標記仍留在棋盤上作為元件，被消耗的只是它們的點數；下次購買只計算尚未動用的標記。",
    },
    head: ["Marks", "Item", "Category", "Effect", "Weight", "Stackable"],
    rows: [
      ["8", "Dirty Bomb", "Power-Up", "Destroys every block within a 4-unit grid after the move action.", "1", "No"],
      ["3", "Move Boost", "Power-Up", "The next movement allows 3 extra grid units. Lasts two turns.", "3 stack = 1", "Yes"],
      ["3", "Resource Card", "Resource", "Build blocks.", "6 stack = 1", "Yes"],
      ["3", "Action Card", "Resource", "Allows one move action.", "1", "No"],
      ["3", "Ammo Card", "Resource", "Allows one shot action.", "3 stack = 1", "Yes"],
      ["9", "HP Card", "HP", "One health point.", "2 stack = 1", "Yes"],
      ["5", "Attack Guard — Lv 1", "Units", "Placed on the map; keeps acting until its HP reaches zero.", "2 stack = 1", "Yes"],
      ["10", "Attack Guard — Lv 2", "Units", "Same behaviour, higher damage and health.", "2 stack = 1", "Yes"],
      ["20", "Attack Guard — Lv 3", "Units", "Same behaviour, higher damage and health.", "2 stack = 1", "Yes"],
      ["6", "Defense Guard", "Units", "Placed on the map; holds position and protects.", "2 stack = 1", "Yes"],
      ["7", "Support Guard", "Units", "Placed on the map; restores and assists.", "2 stack = 1", "Yes"],
    ],
    note: {
      en: "Hand limit: ten weights of cards and items. Exceed it and you must discard, or refuse what you would otherwise gain — which is the moment the inventory system starts making decisions for you.",
      zh: "手牌上限為十個重量單位。超過就必須棄牌，或放棄本來能拿到的東西——物品欄系統正是在這一刻開始替玩家做決定。",
    },
  },
  {
    kind: "diagram",
    title: "Movement and Height",
    label: "MOVEMENT SYSTEM",
    svg: levelDiagram,
    caption: {
      en: "A D6 sets how far you move each turn, orthogonally only. Climbing to level 1 is free; level 2 and 3 each need one more pip than the distance alone. Coming down is free.",
      zh: "每回合以 D6 決定移動距離，且只能直向移動。爬上第 1 層免費；第 2、3 層各需比距離多出 1 點。往下走則不計代價。",
    },
  },
  {
    kind: "diagram",
    title: "Position Changes the Shot",
    label: "COMBAT SYSTEM",
    svg: bulletDiagram,
    caption: {
      en: "There are no bullet components — the player computes the trajectory. Range starts from a D6, travels straight in any of the eight directions, and gains one extra unit each time it crosses one of your own territory marks.",
      zh: "遊戲沒有子彈元件，彈道由玩家計算。射程由 D6 起算，可沿八個方向直線前進，每經過一個自己的領地標記就再延長一格。",
    },
  },
  {
    kind: "matrix",
    title: "AI Behaviour",
    intro: {
      en: "Each AI unit reads its current state across the top and the situation it meets down the side. The cell is what it does next. This table is the 4th iteration's main revision.",
      zh: "AI 單位以上方的目前狀態、左側的遭遇情境查表，交會的格子就是它的下一步。這張表是第四次迭代的主要修訂。",
    },
    states: ["Idle", "Patrol", "Search", "Attack", "Flee", "Chase", "Restore"],
    rows: [
      { condition: "No enemy detected", cells: ["Keep Idle", "Switch to Search", "Switch to Idle", "Switch to Search", "Switch to Idle", "Switch to Search", "Keep Restore"] },
      { condition: "Enemy detected", cells: ["Switch to Chase", "Switch to Chase", "Switch to Chase", "Switch to Chase", "Keep Flee", "Keep Chase", "Switch to Chase"] },
      { condition: "Enemy in attack range", cells: ["Switch to Attack", "Switch to Attack", "Switch to Attack", "Switch to Attack", "Keep Flee", "Switch to Attack", "Switch to Flee"] },
      { condition: "Enemy left attack range", cells: ["Switch to Idle", "Switch to Patrol", "Switch to Search", "Switch to Chase", "Keep Flee", "Switch to Search", "Keep Restore"] },
      { condition: "Idle / Restore / Flee for more than 2 turns", cells: ["Switch to Patrol", "N/A", "N/A", "N/A", "Switch to Restore", "N/A", "Switch to Idle"] },
      { condition: "Low health (HP < 2)", cells: ["Switch to Idle", "Switch to Idle", "Switch to Flee", "Switch to Flee", "Keep Flee", "Switch to Flee", "Keep Restore"] },
      { condition: "High health (HP > 2)", cells: ["Keep Idle", "Keep Patrol", "Keep Search", "Keep Chase", "Switch to Idle", "Keep Chase", "Switch to Idle"] },
    ],
    legend: {
      en: "Attack guards upgrade through three levels; each level costs about twice the last, starting at 5 territory marks. The point of the inventory limit is that you cannot simply hold every unit you can afford.",
      zh: "攻擊守衛可升級三個等級，每級成本約為前一級的兩倍，從 5 個領地標記起跳。物品欄上限的意義，就是讓玩家無法把買得起的單位全部帶在身上。",
    },
  },
  {
    kind: "diagram",
    title: "The Board",
    label: "GAME BOARD",
    svg: boardDiagram,
    caption: {
      en: "A 15 × 15 square grid. Each player picks a starting point inside their own colour area; after that the area has no further effect on play.",
      zh: "15 × 15 的方格棋盤。每位玩家在自己的顏色區域內選擇起點；此後該區域不再影響遊戲。",
    },
  },
]
