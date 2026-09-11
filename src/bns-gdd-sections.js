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
      zh: "最多四人的回合制策略射击游戏，场景是充满原始魔力的浮島。玩家扮演法師争奪这片古老土地：用奧术资源建造平台与擋弹掩体，并藉由走过格子来佔领土地。",
    },
    right: {
      title: "Primary Goal",
      en: "Eliminate the other players and be the last one standing. One session runs about 30 minutes.",
      zh: "淘汰其他玩家，成为最后存活的人。一局約 30 分钟。",
    },
  },
  {
    kind: "system-grid",
    title: "Three Game Pillars",
    items: [
      ["TRAVERSE", "Roll a D6 each move stage; move orthogonally and mark every grid you pass through.", "每个移动阶段擲一顆 D6；只能直向移动，并在经过的每一格留下领地标记。"],
      ["BUILD", "Spend resource cards on level blocks that raise the ground and block bullets.", "用资源卡建造高度方块，抬升地面并阻擋子弹。"],
      ["SHOOT", "Resolve a shot from your avatar's position; your own marks extend its range.", "从角色所在位置结算射击；自己的领地标记会延长射程。"],
    ],
  },
  {
    kind: "spec-table",
    title: "Play Value",
    intro: {
      en: "The document rates the experience it is aiming for, and names what produces each rating.",
      zh: "文件为目标体验评分，并说明每个评分由什么产生。",
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
      ["2ND ITERATION", "Added the Inventory System; every item and action card was rewritten around carrying weight.", "加入物品欄系统；所有物品与行动卡都依照负重重新设计。"],
      ["3RD ITERATION", "Added the AI System, and rebuilt turn progression around it.", "加入 AI 系统，并依此重建回合流程。"],
      ["4TH ITERATION", "Revised the AI System for clearer situational behaviour, and updated progression to match.", "修订 AI 系统，让情境行为更明确，并同步更新流程。"],
    ],
  },
  {
    kind: "symbol-key",
    title: "Components",
    intro: {
      en: "Art is still in progress, so the prototype runs on symbols and placeholders. Each symbol below is one countable thing on the table.",
      zh: "美术仍在进行中，因此原型以符号与替代物運作。以下每个符号都对应桌面上一个可计数的元件。",
    },
    items: [
      { name: "Action Card", qty: "×3 at setup", symbol: card("A"),
        copy: { en: "One available action: move, shoot, build, use an item, or place a unit.", zh: "一次可用行动：移动、射击、建造、使用物品或放置单位。" } },
      { name: "Resource Card", qty: "6 stack = 1 weight", symbol: card("R"),
        copy: { en: "One point of building resource. Spent to place a level block.", zh: "一点建造资源，用于放置高度方块。" } },
      { name: "Ammo Card", qty: "3 stack = 1 weight", symbol: card("M"),
        copy: { en: "One available shot.", zh: "一次可用射击。" } },
      { name: "HP Card", qty: "×4 at setup", symbol: card("H"),
        copy: { en: "One health point. At zero the player is eliminated.", zh: "一点生命值。歸零即淘汰。" } },
      { name: "Level Block", qty: "×3 at setup", symbol: block(),
        copy: { en: "A colour block the size of one grid square. It raises ground and stops bullets.", zh: "与格子同尺寸的颜色方块，可抬升地面并阻擋子弹。" } },
      { name: "Territory Mark", qty: "×56 at setup", symbol: mark(),
        copy: { en: "Dropped on every grid you walk through. Overwrites another player's mark.", zh: "走过的每一格都会留下，并覆盖其他玩家的标记。" } },
      { name: "Avatar Piece", qty: "1 per player", symbol: avatar(),
        copy: { en: "The player on the board. Up to four colours, so up to four players.", zh: "玩家在棋盘上的本体。最多四种颜色，即最多四位玩家。" } },
      { name: "D6", qty: "×1 shared", symbol: die(),
        copy: { en: "Rolled for movement distance and for base shooting range.", zh: "用于决定移动距离与基礎射程。" } },
      { name: "AI Unit", qty: "3 types", symbol: unit(),
        copy: { en: "Attack, Defense and Support Guards. Bought with territory marks and placed on the board.", zh: "攻击、防禦与支援守衛。以领地标记购买后放置到棋盘上。" } },
    ],
  },
  {
    kind: "flow",
    title: "Set-Up",
    steps: [
      ["COLOURS", "Each player claims one colour for their avatar, level blocks and territory marks.", "每位玩家选定一种颜色，套用在角色、方块与领地标记上。"],
      ["TURN ORDER", "Everyone rolls a D6; the highest roll takes the first turn.", "全体擲 D6，点数最高者先手。"],
      ["STARTING POINT", "In priority order, pick any square inside your own colour area. The area affects nothing after this.", "依顺序在自己的颜色区域内任选一格。此后该区域不再影响游戏。"],
      ["DEAL", "The GM hands each player 3 action cards, 3 level blocks, 4 HP cards and 56 territory marks.", "GM 发给每位玩家 3 张行动卡、3 块高度方块、4 张生命卡与 56 个领地标记。"],
    ],
  },
  {
    kind: "flow",
    title: "One Turn",
    steps: [
      ["ACTION CARDS", "Spend as many action cards as you hold; each buys one move, shot, build, item or unit placement.", "手上有几张行动卡就能用几次，每张换一次移动、射击、建造、使用物品或放置单位。"],
      ["SETTLEMENT", "Check the surrounding nine grid spaces; any items there are collected automatically.", "检查周围九格，该处物品自动收取。"],
      ["AI ACTIVITY", "Every surviving AI unit takes one turn according to its behaviour logic.", "每个存活的 AI 单位依行为逻辑执行一个回合。"],
      ["PURCHASE", "Spend territory marks on items. Nothing bought this step can be used until the next turn.", "用领地标记购买物品。此阶段购入的物品要到下一回合才能使用。"],
    ],
  },
  {
    kind: "spec-table",
    title: "Purchase Matrix",
    intro: {
      en: "Territory marks are the currency. Marks spent stay on the board as components — only their point value is consumed, and only unspent marks count toward the next purchase.",
      zh: "领地标记就是货幣。花掉的标记仍留在棋盘上作为元件，被消耗的只是它们的点数；下次购买只计算尚未动用的标记。",
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
      zh: "手牌上限为十个重量单位。超过就必须棄牌，或放棄本来能拿到的东西——物品欄系统正是在这一刻开始替玩家做决定。",
    },
  },
  {
    kind: "callout",
    title: "Endgame",
    en: "The game ends when one player is left standing and everyone else has reached 0 HP. There is no score and no alternative victory: the last player alive wins.",
    zh: "当只剩一位玩家存活、其餘玩家生命歸零时，游戏结束。没有分数，也没有其他胜利条件——最后活着的人获胜。",
  },
  {
    kind: "diagram",
    title: "Movement and Height",
    label: "MOVEMENT SYSTEM",
    svg: levelDiagram,
    caption: {
      en: "A D6 sets how far you move each turn, orthogonally only. Climbing to level 1 is free; level 2 and 3 each need one more pip than the distance alone. Coming down is free.",
      zh: "每回合以 D6 决定移动距离，且只能直向移动。爬上第 1 层免费；第 2、3 层各需比距离多出 1 点。往下走则不计代价。",
    },
  },
  {
    kind: "diagram",
    title: "Position Changes the Shot",
    label: "COMBAT SYSTEM",
    svg: bulletDiagram,
    caption: {
      en: "There are no bullet components — the player computes the trajectory. Range starts from a D6, travels straight in any of the eight directions, and gains one extra unit each time it crosses one of your own territory marks.",
      zh: "游戏没有子弹元件，弹道由玩家计算。射程由 D6 起算，可沿八个方向直线前进，每经过一个自己的领地标记就再延长一格。",
    },
  },
  {
    kind: "matrix",
    title: "AI Behaviour — Attack Guard",
    intro: {
      en: "The AI runs on a finite state machine. Read the unit's current state across the top and the situation it meets down the side; the cell is what it does next. A bare state name means it stays in or performs that state.",
      zh: "AI 以有限状态机運作。上方是单位目前的状态，左側是它遭遇的情境，交会的格子就是它的下一步。只写状态名称表示维持或执行该状态。",
    },
    states: ["Idle", "Patrol", "Search", "Attack", "Flee", "Chase", "Restore"],
    rows: [
      { condition: "No enemy player detected", cells: ["Idle", "Switch to Search", "Switch to Idle", "Switch to Search", "Switch to Idle", "Switch to Search", "Keep Flee"] },
      { condition: "Enemy player detected", cells: ["Switch to Chase", "Switch to Chase", "Switch to Chase", "Switch to Chase", "Keep Flee", "Chase", "Keep Restore"] },
      { condition: "Enemy player in attack range", cells: ["Attack", "Attack", "Attack", "Attack", "Keep Flee", "Attack", "Switch to Flee"] },
      { condition: "Enemy player left attack range", cells: ["Idle", "Patrol", "Search", "Switch to Chase", "Keep Flee", "Switch to Search", "Keep Restore"] },
      { condition: "Idle / Restore / Flee for more than 2 turns", cells: ["Switch to Patrol", "N/A", "N/A", "N/A", "Switch to Restore", "N/A", "Switch to Idle"] },
      { condition: "Low health (HP < 2)", cells: ["Idle", "Idle", "Switch to Flee", "Switch to Flee", "Flee", "Switch to Flee", "Keep Restore"] },
      { condition: "High health (HP > 2)", cells: ["Idle", "Patrol", "Search", "Chase", "Idle", "Chase", "Switch to Idle"] },
    ],
    legend: {
      en: "All levels of Attack Guard behave identically; only damage and range change with level. Transcribed from the source table without correction — including the Restore column's “Keep Flee”, which reads as a slip in the original.",
      zh: "各等级的攻击守衛行为相同，只有傷害与射程随等级改变。此表照原稿转录未作修正，包括 Restore 欄的「Keep Flee」——那在原文中看起来是筆誤。",
    },
  },
  {
    kind: "system-grid",
    title: "What Each State Does",
    items: [
      ["IDLE", "Remain stationary in place.", "原地不动。"],
      ["PATROL", "Move in a loop along a route planned by the player. The path must be continuous, connecting start and end. Moves 2 grid units per turn.", "沿玩家规划的路线循环移动，路径必须连续、首尾相接。每回合移动 2 格。"],
      ["SEARCH", "Act three times in total, moving 3 grid units each time while attempting to locate the player.", "总共行动三次，每次移动 3 格，尝试找到玩家。"],
      ["ATTACK", "Inflict damage once on a player within range; the value depends on the guard's level.", "对射程内的玩家造成一次傷害，数值依守衛等级而定。"],
      ["CHASE", "After discovering an enemy player, advance towards them 2 grid units at a time.", "发现敵方玩家后朝其前进，每次 2 格。"],
      ["FLEE", "Move in the opposite direction from the nearest enemy player, 3 grid units at a time.", "朝远离最近敵方玩家的方向移动，每次 3 格。"],
      ["RESTORE", "Recover 1 HP per turn while in this state.", "处于此状态时每回合恢復 1 点生命。"],
    ],
  },
  {
    kind: "matrix",
    title: "AI Behaviour — Defense and Support Guard",
    intro: {
      en: "Both support units share a second state set that replaces Search, Attack and Chase with Locate and Build.",
      zh: "两种支援单位共用第二套状态，以 Locate 与 Build 取代 Search、Attack 与 Chase。",
    },
    states: ["Idle", "Patrol", "Locate", "Build", "Flee", "Restore"],
    rows: [
      { condition: "No enemy player detected", cells: ["Idle", "Switch to Search", "Switch to Idle", "Switch to Search", "Switch to Idle", "Keep Flee"] },
      { condition: "Enemy player detected", cells: ["Switch to Chase", "Switch to Chase", "Flee", "Switch to Chase", "Keep Flee", ""] },
      { condition: "Build location set", cells: ["Attack", "Attack", "Attack", "Attack", "Keep Flee", ""] },
      { condition: "Idle / Restore / Flee for more than 2 turns", cells: ["Switch to Patrol", "N/A", "N/A", "N/A", "Switch to Restore", "Switch to Idle"] },
      { condition: "Low health (HP < 2)", cells: ["Idle", "Idle", "Switch to Flee", "Switch to Flee", "Flee", "Keep Restore"] },
      { condition: "High health (HP > 2)", cells: ["Idle", "Patrol", "Search", "Chase", "Idle", "Switch to Idle"] },
      { condition: "Build finished", cells: ["Patrol", "Patrol", "", "", "", ""] },
    ],
    legend: {
      en: "Transcribed as written. In the source this table still carries the Attack Guard's labels — several cells switch to Search, Chase or Attack, which are not states these units have, and a few cells are blank. That unresolved ambiguity is what the 4th iteration set out to clear up, and it is left visible here rather than tidied away.",
      zh: "照原稿转录。原文这张表仍沿用攻击守衛的标籤——有数格切换到 Search、Chase 或 Attack，而这些并不是这两种单位擁有的状态，另有几格是空白。第四次迭代想釐清的正是这种未解决的模糊，因此这里保留原样而不加以整理。",
    },
  },
  {
    kind: "text",
    title: "Upgrading Attack Guards",
    paragraphs: [
      {
        en: "Each upgrade costs twice the last: Level 1 starts at 5 territory marks, Level 2 costs 10. Upgrading for the first time is what unlocks the right to buy that level at all — a player who has never reached Level 2 cannot buy a Level 2 guard, while a player who has reached it can buy one at any time afterwards.",
        zh: "每次升级的成本是前一次的两倍：等级 1 从 5 个领地标记起算，等级 2 为 10 个。首次升级的作用是解锁购买资格——没有升到等级 2 的玩家买不到等级 2 守衛，而升过的玩家之后随时可以购买。",
      },
      {
        en: "The point of the initial upgrade is the licence, not the unit. It is the one place in the economy where spending buys access rather than a thing.",
        zh: "初次升级买到的是资格而不是单位。这是整个经济系统里唯一一处，花费换到的是权限而非实物。",
      },
    ],
  },
  {
    kind: "spec-table",
    title: "Trading System",
    intro: {
      en: "Auction items are priced against what they can destroy. Each row states the spend, the least and most it can return, and that return converted back into territory marks.",
      zh: "拍賣物品以其可摧毀的量定价。每一列列出花费、最少与最多的回报，以及换算回领地标记后的价值。",
    },
    head: ["Item", "Spend", "Min benefit", "Max benefit", "Min equivalent", "Max equivalent"],
    rows: [
      ["Dirty Bomb", "6 marks", "0 obstacles — nothing in range", "12 obstacles — a 4-unit area up to 3 levels high (4 × 3)", "0 marks", "36 marks"],
      ["Laser Beam", "7 marks", "0 obstacles — nothing in range", "14 obstacles destroyed in a line", "0 marks", "42 marks"],
      ["Super Bomb", "8 marks", "0 obstacles — nothing in range", "36 obstacles — a 4-unit area up to 4 levels high (6 × 6)", "0 marks", "108 marks"],
      ["Obstacle Building", "3 marks", "1 obstacle", "1 obstacle", "3 marks", "3 marks"],
      ["Wall Building Unit", "5 marks", "1 obstacle", "3 obstacles", "3 marks", "9 marks"],
    ],
    note: {
      en: "Every destructive item is worth nothing on an empty board and several times its price on a crowded one, so the auction is really a bet on how built-up the map will be when you use it.",
      zh: "所有破壞性物品在空曠棋盘上一文不值，在擁擠棋盘上则值数倍价格；因此拍賣实际上是在賭使用当下棋盘有多密集。",
    },
  },
  {
    kind: "callout",
    title: "Economic System",
    en: "The document opens this section with three headings — Engines, Economies, Ecologies — and stops there. Nothing is written under them. The same three ideas come back as questions in the playtest survey below, also unanswered, which places this analysis at the edge of where the fourth iteration actually got to.",
    zh: "文件在这一节列出三个标题——Engines、Economies、Ecologies——就此打住，底下没有任何内容。同样这三个概念又以问题的形式出现在下方的测试问卷里，同样没有作答；这标记出第四次迭代实际推进到的边界。",
  },
  {
    kind: "diagram",
    title: "The Board",
    label: "GAME BOARD",
    svg: boardDiagram,
    caption: {
      en: "A 15 × 15 square grid. Each player picks a starting point inside their own colour area; after that the area has no further effect on play.",
      zh: "15 × 15 的方格棋盘。每位玩家在自己的颜色区域内选擇起点；此后该区域不再影响游戏。",
    },
  },
  {
    kind: "callout",
    title: "What the Survey Showed",
    en: "From the fourth-round survey, most players could follow the basic rules: how to move, how to shoot, how to build obstacles. But the flow had grown bloated. Players had to learn a lot of progression rules before they started, so some lost patience or forgot the details of a step, and kept checking with the GM how to carry it out, such as placing and moving the AI units.",
    zh: "从第四轮问卷的反馈来看，大部分玩家都能懂得基础的游戏规则，也就是如何移动、怎么射击、如何建造障碍物。但现在的游戏流程有些臃肿，玩家刚开始玩就要学习很多 progression 方面的规则。这导致一些玩家失去耐心，甚至忘记某些流程上的细节，需要反复和 GM 确认具体怎么执行，比如怎么放置 AI 单位、怎么让它移动。",
  },
  {
    kind: "question-list",
    title: "Playtest & Game Analysis",
    intro: {
      en: "The document closes with the course's analysis questions. The first, how well players understood the rules, is answered above from the fourth-round survey. The others stay open in the source, and they still show what this iteration was trying to find out.",
      zh: "文件最后是课程给出的分析问题。第一个问题，玩家对规则理解得怎么样，已经用第四轮问卷的反馈在上面回答了。其余问题在原稿中仍然留白，但它们本身就说明了这一版想弄清楚什么。",
    },
    source: "https://docs.google.com/forms/d/1W9eUi115_sYqJcP5bP7Kbc8h68DsBsULKNPoIEV7_l0",
    groups: [
    {
      group: "Comprehension",
      questions: [
        "How difficult did players find your game, both in achieving the intermediate game goals and the overall goal of winning?",
        "How engaged were players in playing your game at the beginning, middle, and end of your game?",
        "Did players feel like they were progressing in the game?",
        "Did players feel like their decisions mattered with respect to winning the game?",
      ],
    },
    {
      group: "Resources and economy",
      questions: [
        "Were there any resources or other ownable game objects that players found so plentiful that they were practically worthless?",
        "Were there any resources or other ownable objects that players found so hard to obtain that it seemed impossible to win the game?",
        "Did resource trading feel worthwhile to your players?",
        "Is any game system in your game an economy? If so, what was it, what makes it that type of system, and what is that system\u2019s impact on gameplay?",
        "Is your game economy open or closed? What impact does that have on gameplay?",
        "Was the supply and demand of significant resources, currency, or commodities in your game too low? If so, what was it, and why did you think that? If the supply of one was found to be too low (even if playtesters didn\u2019t report that it was), what could you theoretically do to fix economic stagnation? If the supply of one was found to be too high (even if playtesters didn\u2019t report that it was), what could you theoretically do to fix economic inflation?",
      ],
    },
    {
      group: "Systems",
      questions: [
        "Is any game system in your game a reinforcing engine? If so, what was it, what makes it that type of system, and what is that system\u2019s impact on gameplay?",
        "Is any game system in your game a balancing engine? If so, what was it, what makes it that type of system, and what is that system\u2019s impact on gameplay?",
        "Is any game system in your game an ecology? If so, what was it, what makes it that type of system, and what is that system\u2019s impact on gameplay?",
      ],
    },
    {
      group: "Progression",
      questions: [
        "Is any progression in your game horizontal? Why",
        "Is there any progression in your game vertical? Why or why not? If it is, how does that affect gameplay?",
        "Is any progression in your game cyclical? Why or why not? If it is, how does that affect gameplay?",
        "How do narrative, time or turn-based events, or luck (randomness) affect the player's progression experience?",
      ],
    },
    {
      group: "Failure modes",
      questions: [
        "Did any players succumb to power creep in your game? If players tended to do so (even if you didn\u2019t observe them doing so), how would this affect the gameplay experience, and what could you theoretically do to fix that problem?",
        "Did any players seem to succumb to analysis paralysis in your game? If players tended to do so (even if you didn\u2019t observe them doing so), how would this affect the gameplay experience, and what could you theoretically do to fix that problem?",
      ],
    },
    {
      group: "Open",
      questions: [
        "What other observations did you make while observing players play your game",
      ],
    },
    ],
  },
]
