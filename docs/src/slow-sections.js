// Slow'em Down — the drawer case study.
// Sources: the Innovative Game mechanic board (Figma 0tCbAiVUlrPId3RWd9LRif 644:422,
// 177 text nodes), the shipped Unity project InnovativeGameMechanicRedW, and the
// recordings in Spring26(T6)/Innovative Game Deisgn dated against the assignment
// deadlines on that board. Tuned values are read from the build.

const ink = "var(--case-ink)"
const accent = "color-mix(in srgb, var(--case-accent, var(--case-ink)) 55%, transparent)"
const accentSoft = "color-mix(in srgb, var(--case-accent, var(--case-ink)) 26%, transparent)"

const scopeDiagram = `
<svg viewBox="0 0 520 190" role="img" aria-label="The mechanic changed from slowing the whole scene to placing up to three local zones">
  <g font-family="var(--type-subtitle-font)" font-size="9" letter-spacing="0.06em" fill="${ink}">
    <rect x="20" y="34" width="200" height="104" fill="${accentSoft}" stroke="${ink}" stroke-width="0.8"/>
    <text x="120" y="26" text-anchor="middle">WEEK 1–5 — GLOBAL</text>
    <text x="120" y="90" text-anchor="middle" font-size="11">EVERYTHING SLOWS</text>
    <text x="120" y="106" text-anchor="middle">NO CHOICE TO MAKE</text>
    <rect x="300" y="34" width="200" height="104" fill="none" stroke="${ink}" stroke-width="0.8"/>
    <circle cx="345" cy="70" r="20" fill="${accent}" stroke="${ink}" stroke-width="0.8"/>
    <circle cx="405" cy="104" r="20" fill="${accent}" stroke="${ink}" stroke-width="0.8"/>
    <circle cx="455" cy="62" r="20" fill="${accent}" stroke="${ink}" stroke-width="0.8"/>
    <text x="400" y="26" text-anchor="middle">WEEK 6 ONWARD — LOCAL</text>
    <text x="400" y="152" text-anchor="middle">UP TO 3 ZONES · 15% TIME INSIDE · ENERGY RUNS DOWN</text>
    <path d="M232 86 L288 86" stroke="${ink}" stroke-width="1" marker-end="url(#slowArrow)"/>
    <text x="20" y="176">THE CHOICE THE PLAYER MAKES IS WHICH EVENT DESERVES THE SECONDS.</text>
  </g>
  <defs>
    <marker id="slowArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="${ink}"/>
    </marker>
  </defs>
</svg>`

const energyDiagram = `
<svg viewBox="0 0 520 140" role="img" aria-label="Energy drains twice as fast as it recovers and a zone needs twenty to start">
  <g font-family="var(--type-subtitle-font)" font-size="9" letter-spacing="0.06em" fill="${ink}">
    <rect x="20" y="40" width="400" height="26" fill="none" stroke="${ink}" stroke-width="0.8"/>
    <rect x="20" y="40" width="80" height="26" fill="${accentSoft}" stroke="none"/>
    <line x1="100" y1="34" x2="100" y2="72" stroke="${ink}" stroke-width="1"/>
    <text x="100" y="28" text-anchor="middle">20 — MINIMUM TO OPEN A ZONE</text>
    <text x="424" y="58">100</text>
    <text x="20" y="94">DRAIN  20 PER SECOND   ·   A FULL BAR BUYS 5 SECONDS OF SLOW</text>
    <text x="20" y="110">REFILL 10 PER SECOND   ·   TWICE AS LONG TO EARN AS TO SPEND</text>
    <text x="20" y="126">RIGHT CLICK CLOSES A ZONE AND STOPS THE DRAIN</text>
  </g>
</svg>`

export const slowSections = [
  {
    kind: "copy-grid",
    left: {
      title: "Brief",
      en: "An old woman is about to walk onto a level crossing, and a train is already coming. You cannot move her and you cannot stop the train. You can press Space, drop a pocket of slowed time onto one part of the scene, and buy yourself the seconds to do something about it.",
      zh: "一位老太太正要走上鐵道口，火車已經在路上。你無法移動她，也無法讓火車停下。你能做的是按下 Space，在場景的某一處放下一塊被減慢的時間，替自己爭取到足以介入的幾秒。",
    },
    right: {
      title: "Where it came from",
      en: "The pitch I wrote for it was one line: you'll like this game if you also like Dumb Ways to Die. I wanted the comedy of an accident you can see assembling itself, and the skill to be noticing it early rather than reacting fast.",
      zh: "我為它寫的 pitch 只有一句：如果你喜歡《Dumb Ways to Die》，你會喜歡這款遊戲。我想要的是那種「眼看著一場意外正在組裝起來」的喜劇感，而玩家的技巧在於及早察覺，而不是反應迅速。",
    },
  },
  {
    kind: "video",
    video: "assets/videos/slow-em-down-mechanic.mp4",
    poster: "assets/case-study/slow-gameplay.png",
    alt: "Slow’em Down local time-slow zone recording",
    label: "GAMEPLAY VIDEO / INNOVATIVEGAMEMECHANIC.MP4 / FULL RECORDING 1:36",
    caption: {
      en: "The complete walkthrough, uncut: the Space prompt, the click, the local zone, and the train or road events that slow inside it.",
      zh: "未經剪輯的完整走查：Space 提示、點擊、局部區域，以及在其中減速的火車或道路事件。",
    },
  },
  {
    kind: "spec-table",
    title: "The Concept Card",
    intro: {
      en: "The brief asked for a concept overview before anything was built. This is what I wrote, and it is the version the prototype was measured against.",
      zh: "作業要求在動工之前先寫出概念綱要。以下是我當時寫的版本，也是後來用來衡量原型的那一份。",
    },
    head: ["Field", "What I wrote"],
    rows: [
      ["Pitch", "Solve various puzzles by altering the game environment and interacting with elements within it using time-slowing abilities."],
      ["Genre", "Puzzle game."],
      ["Player skill", "“The players have to skilfully spot what is about to happen in each scene to accomplish a correction act that changes all.”"],
      ["Comparative title", "You’ll like this game if you also like Dumb Ways to Die."],
      ["Build", "Playable on itch.io — redinastrike.itch.io/innovative-game-mechanic"],
    ],
  },
  {
    kind: "system-grid",
    title: "Level 1 — The Level Crossing",
    items: [
      ["TRAIN", "The thing you cannot stop. It announces itself with a signal and then commits.", "你無法阻止的東西。它先以號誌宣告，接著就義無反顧。"],
      ["BIRD", "A pigeon that takes off when disturbed, and lands somewhere that matters.", "一隻受驚就起飛的鴿子，而牠會落在某個關鍵位置。"],
      ["PIANO", "The gag object. It falls once, and only once, and you get one chance to be ready for it.", "那個橋段道具。它只掉落一次，你也只有一次機會做好準備。"],
    ],
  },
  {
    kind: "diagram",
    title: "The Decision That Made It a Game",
    label: "WEEK 6 — SCOPE CHANGE",
    svg: scopeDiagram,
    caption: {
      en: "For the first five weeks the ability slowed the whole scene, which meant there was nothing to decide — you either used it or you did not. In Week 6 I cut it down to local zones. The moment slowing became partial, the player had to pick a target, and picking a target is the game.",
      zh: "前五週這個能力減慢的是整個場景，也就是說沒有任何選擇可言——你要嘛用、要嘛不用。第六週我把它縮小為局部區域。減速一旦變成局部的，玩家就必須挑一個目標，而「挑目標」正是這款遊戲本身。",
    },
  },
  {
    kind: "flow",
    title: "One Intervention",
    steps: [
      ["READ", "Watch the scene assemble. The outline tells you which objects time can touch.", "觀察場景如何組裝起來。輪廓會告訴你時間能作用在哪些物件上。"],
      ["SPACE", "Arm a zone. You need at least 20 energy on the bar to open one.", "啟動一個區域。能量條至少要有 20 才能開啟。"],
      ["CLICK", "Place it. A raycast puts the zone where you pointed, up to three at once.", "放置它。射線會把區域放在你指的位置，最多同時三個。"],
      ["WATCH", "Inside the zone time runs at 15%. Outside it, the accident keeps its schedule.", "區域內時間以 15% 速度流動。區域外，那場意外仍按原定時刻進行。"],
    ],
  },
  {
    kind: "diagram",
    title: "You Are Spending Something",
    label: "ENERGY BUDGET",
    svg: energyDiagram,
    caption: {
      en: "A zone drains 20 energy a second and the bar refills at 10, so slowing time costs twice what waiting earns. That asymmetry is the whole reason three zones is a real decision rather than a free upgrade — you cannot hold all three open and still have anything left when the train arrives.",
      zh: "一個區域每秒消耗 20 點能量，而能量條每秒只回復 10 點，因此減速的代價是等待所得的兩倍。正是這個不對稱讓「三個區域」成為真正的取捨，而不是免費的升級——你無法同時撐開三個區域，又在火車抵達時還剩下什麼。",
    },
  },
  {
    kind: "spec-table",
    title: "What the Week 6 Notes Asked For, and What Shipped",
    intro: {
      en: "I wrote five things I wanted after the scope change. Reading them against the build three of them are in there, and I can point at the class that does each one.",
      zh: "縮小尺度之後，我列了五件想做的事。把它們對照實作，其中三件確實做到了，而且每一件我都能指出負責的類別。",
    },
    head: ["What I wanted", "Shipped?", "Where it lives"],
    rows: [
      ["Highlight the woman's situation faster so players know what to intervene in", "No", "Still the open problem. Nothing in the build states the conflict."],
      ["More interactive objects, with outlines showing what is interactive", "Yes", "LocalTimeAffectable · MouseHoverOutlineHighlighter"],
      ["Move from global to local time deceleration", "Yes", "LocalSlowZoneController — the global class was kept and repurposed"],
      ["More zones, each with a smaller area, combined into a larger effect", "Yes", "maxSimultaneousZones = 3, right-click to close one"],
      ["Energy as the cost of holding zones open", "Yes", "maxEnergy 100 · drain 20/s · refill 10/s · 20 to start"],
    ],
    note: {
      en: "The first row is the one that matters. Every test failure below traces back to it: the mechanic works, and the scene never tells you what it is for.",
      zh: "第一列才是關鍵。下方每一次測試失敗都能追溯到它：機制本身可用，但場景從未告訴你它是為了什麼而存在。",
    },
  },
  {
    kind: "spec-table",
    title: "Three Tests, One Answer",
    intro: {
      en: "I ran the mechanic past players three times across the term. The notes are in the board in my own words, and they converge.",
      zh: "整個學期我讓玩家測試了三次這個機制。筆記以我自己的話留在板子上，而它們指向同一個結論。",
    },
    head: ["When", "What I recorded", "Reading"],
    rows: [
      ["Feb 26 — playtest brief", "“Players can feel what it is like to control time, and that experience itself is strong.” But: “the only thing players can really slow is the train. They cannot control the other things, so the space for player action is smaller than I imagined.”", "The fantasy lands. The verbs do not."],
      ["Week 8 — second session", "“Players understood the mechanic reasonably well — they could tell which objects the slowdown works on.” And: “the train track setup is the strongest; apart from the train track, the other setups are not strong.”", "Same finding, arrived at independently."],
      ["Week 10 — Kyle", "“The player was confused understanding the mechanic. I think the confusion has two parts…” — the note stops there.", "The one session where comprehension itself failed, and the analysis was never finished."],
    ],
    note: {
      en: "Two of three sessions say the same sentence in different words: the train works and nothing else does. I built a bird and a piano, and neither became something a player could act on.",
      zh: "三次裡有兩次用不同的話說了同一句：火車有效，其他都無效。我做了鴿子與鋼琴，但兩者都沒能變成玩家真正可以介入的東西。",
    },
  },
  {
    kind: "text",
    title: "Level 2 Was Designed and Not Reached",
    paragraphs: [
      {
        en: "The board carries a second storyboard — a kitchen, with a stove, a soup pot, a frying pan holding an egg, and boiling water. Four setups instead of three, all on timers, all in one room, so the zones would have to be spent against each other rather than dropped on the only thing that moves.",
        zh: "板子上還有第二份故事板——一間廚房，配上爐台、湯鍋、煎著蛋的平底鍋，以及一壺滾水。四個裝置而不是三個，全都各有計時、全都在同一個房間裡，因此區域必須彼此權衡使用，而不是往唯一會動的東西上一放了事。",
      },
      {
        en: "Level2.unity exists in the project. The kitchen does not. That gap is the honest state of this prototype: the fix for “only the train works” was designed on paper as a room where four things work at once, and the term ended before it was built.",
        zh: "Level2.unity 在專案裡，廚房卻不在。這個落差就是這個原型誠實的現況：針對「只有火車有效」的解法，已經在紙上設計成一個四件事同時運作的房間，而學期在它被做出來之前就結束了。",
      },
    ],
  },
  {
    kind: "callout",
    title: "The Recording I Had All Along",
    en: "The Feb 26 brief asked for a playtest captured with OBS and think-aloud commentary before a 5pm deadline. There is a six-minute recording with audio in the project folder, made at 4:18pm that day. I had written elsewhere that the playtest evidence was missing; it was in the same folder as everything else, under a filename that said nothing.",
    zh: "2 月 26 日的作業要求在下午五點前用 OBS 錄下一次帶口述的測試。專案資料夾裡就有一段六分鐘、帶音軌的錄影，錄製時間是當天下午 4:18。我曾在別處寫過測試證據闕如；它其實一直和其他檔案放在同一個資料夾，只是檔名什麼也沒說。",
  },
  {
    kind: "callout",
    title: "The Version Before This One",
    en: "Seven silent clips in the same folder are all dated 29 January — Book, location, identity recognized, Victim. They belong to the idea I opened the term with: subjective time distortion, referenced against Return of the Obra Dinn and its time-stopped murder case. That direction did not survive contact with the brief, and Dumb Ways to Die replaced it. I keep the clips because the level crossing only makes sense as the thing I chose instead.",
    zh: "同一資料夾裡有七段無聲短片，日期全是 1 月 29 日——Book、location、identity recognized、Victim。它們屬於我在學期初提出的構想：主觀時間扭曲，參照《Return of the Obra Dinn》那樁被凍結的兇案。那個方向沒能通過作業要求的檢驗，被《Dumb Ways to Die》取代。我留著這些片段，因為鐵道口只有作為「我改選的那個東西」才說得通。",
  },
]
