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
    <text x="120" y="26" text-anchor="middle">FIRST VERSION — GLOBAL</text>
    <text x="120" y="90" text-anchor="middle" font-size="11">EVERYTHING SLOWS</text>
    <text x="120" y="106" text-anchor="middle">NO CHOICE TO MAKE</text>
    <rect x="300" y="34" width="200" height="104" fill="none" stroke="${ink}" stroke-width="0.8"/>
    <circle cx="345" cy="70" r="20" fill="${accent}" stroke="${ink}" stroke-width="0.8"/>
    <circle cx="405" cy="104" r="20" fill="${accent}" stroke="${ink}" stroke-width="0.8"/>
    <circle cx="455" cy="62" r="20" fill="${accent}" stroke="${ink}" stroke-width="0.8"/>
    <text x="400" y="26" text-anchor="middle">AFTER THE CUT — LOCAL</text>
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
      title: "What the Player Does",
      en: "An old woman is about to walk onto a level crossing, and a train is already coming. You cannot move her and you cannot stop the train. You can press Space, drop a pocket of slowed time onto one part of the scene, and buy yourself the seconds to do something about it.",
      zh: "一位老太太正要走上铁道口，火车已经在路上。你无法移动她，也无法让火车停下。你能做的是按下 Space，在场景的某一处放下一块被减慢的时间，替自己争取到足以介入的几秒。",
    },
    right: {
      title: "Who It Is For",
      en: "The pitch I wrote for it was one line: you'll like this game if you also like Dumb Ways to Die. It is for players who enjoy that kind of quick, dark-comic accident. I wanted the comedy of an accident you can see assembling itself, and the skill to be noticing it early rather than reacting fast.",
      zh: "我为它写的 pitch 只有一句：如果你喜欢《Dumb Ways to Die》，你会喜欢这款游戏。它是给喜欢那种短促、带点黑色幽默的意外的玩家的。我想要的是那种“眼看着一场意外正在组装起来”的喜剧感，而玩家的技巧在于及早察觉，而不是反应迅速。",
    },
  },
  {
    kind: "video",
    video: "assets/videos/slow-em-down-mechanic.mp4",
    poster: "assets/case-study/slow-gameplay.png",
    alt: "Slow’em Down local time-slow zone recording",
    label: "GAMEPLAY VIDEO / FIRST ROUND / FULL RECORDING 1:36",
    caption: {
      en: "The first round, uncut: a player at the laptop on the left, the game on the right — the Space prompt, the click, the zone on the road, and the train and traffic slowing inside it.",
      zh: "第一轮试玩，未经剪辑：左边是坐在笔记本前的玩家，右边是游戏画面——Space 提示、点击、路面上的减速区，以及在其中变慢的火车和车流。",
    },
  },
  {
    kind: "spec-table",
    title: "The Concept Card",
    intro: {
      en: "Before building anything I wrote the game down in five lines: what it is, who it is for, and the one skill it asks of the player. It is the version I measured the prototype against.",
      zh: "动手之前，我先用五行字把这个游戏写下来：它是什么、为谁而做、要求玩家具备哪一种技巧。之后我一直拿这张卡片检验原型。",
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
    kind: "callout",
    kicker: "Design intent",
    title: "Why Local Time",
    en: "Most games bend time for the whole world at once: slow everything, freeze everything. I wanted the distortion to belong to the player, a small, personal and limited pocket of slowed time, so the challenge is not stopping events but choosing when and where to spend it. The idea is older than the level crossing. I first wrote it in January for a detective concept, and it is the part that survived.",
    zh: "大多数游戏一次就改变整个世界的时间：全部变慢，或者全部冻结。我希望这种扭曲属于玩家自己：一小团私人的、有限的减速时间，于是挑战不在于阻止事件，而在于选择何时、何地把它用掉。这个想法比铁道口更早。我一月时为一个侦探题材的构想第一次写下它，而它正是那个构想里留下来的部分。",
  },
  {
    kind: "system-grid",
    title: "Level 1 — The Level Crossing",
    items: [
      ["TRAIN", "The thing you cannot stop. It announces itself with a signal and then commits.", "你无法阻止的东西。它先以号志宣告，接着就义无反顾。"],
      ["BIRD", "A pigeon that takes off when disturbed, and lands somewhere that matters.", "一只受惊就起飞的鸽子，而牠会落在某个关键位置。"],
      ["PIANO", "The gag object. It falls once, and only once, and you get one chance to be ready for it.", "那个桥段道具。它只掉落一次，你也只有一次机会做好准备。"],
    ],
  },
  {
    kind: "plates",
    title: "The Level I Drew First",
    intro: {
      en: "Before building the crossing I drew it as nine frames. The middle row is the accident. The bottom row is the save: the barrier holds her until the train has gone, which is the moment the slowed seconds have to buy.",
      zh: "在把铁道口做出来之前，我先把它画成九格分镜。中间一排是意外；最下面一排是救下她的那一种结局：栏杆拦住她，直到火车开过去——这正是那几秒减速时间要替玩家换来的那一刻。",
    },
    plates: [
      { image: "assets/case-study/slow-em-down/storyboard-01.jpg", span: 4, alt: "Storyboard frame 1: a quiet level crossing with the barrier raised", label: "01 · A QUIET CROSSING" },
      { image: "assets/case-study/slow-em-down/storyboard-02.jpg", span: 4, alt: "Storyboard frame 2: the signal starts flashing as the old woman walks up", label: "02 · THE SIGNAL STARTS" },
      { image: "assets/case-study/slow-em-down/storyboard-03.jpg", span: 4, alt: "Storyboard frame 3: a warning mark over the old woman as she keeps walking", label: "03 · SHE KEEPS WALKING" },
      { image: "assets/case-study/slow-em-down/storyboard-04.jpg", span: 4, alt: "Storyboard frame 4: the barrier arm swings down as the train approaches", label: "04 · THE ARM COMES DOWN" },
      { image: "assets/case-study/slow-em-down/storyboard-05.jpg", span: 4, alt: "Storyboard frame 5: the old woman on the tracks as the train arrives", label: "05 · ON THE TRACKS" },
      { image: "assets/case-study/slow-em-down/storyboard-06.jpg", span: 4, alt: "Storyboard frame 6: the train hits, shown as a cartoon explosion", label: "06 · TOO LATE" },
      { image: "assets/case-study/slow-em-down/storyboard-07.jpg", span: 4, alt: "Storyboard frame 7: the barrier arm swings down in the rescue branch", label: "04 · THE ARM COMES DOWN" },
      { image: "assets/case-study/slow-em-down/storyboard-08.jpg", span: 4, alt: "Storyboard frame 8: the barrier holds the old woman back from the tracks", label: "05 · THE BARRIER HOLDS HER" },
      { image: "assets/case-study/slow-em-down/storyboard-09.jpg", span: 4, alt: "Storyboard frame 9: the train passes while the old woman waits safely", label: "06 · THE TRAIN PASSES" },
    ],
  },
  {
    kind: "diagram",
    kicker: "Iteration",
    title: "The Decision That Made It a Game",
    label: "SCOPE CHANGE — WHOLE SCENE TO ZONES",
    svg: scopeDiagram,
    caption: {
      en: "In the first version the ability slowed the whole scene, which left the player nothing to decide — you either used it or you did not. So I cut it down to local zones. The moment slowing became partial, the player had to pick a target, and picking a target is the game.",
      zh: "第一版里，这个能力会减慢整个场景，玩家因此无从选择——要么用，要么不用。于是我把它缩小成局部区域。减速一旦变成局部的，玩家就必须挑一个目标，而“挑目标”正是这个游戏本身。",
    },
  },
  {
    kind: "flow",
    title: "One Intervention",
    steps: [
      ["READ", "Watch the scene assemble. The outline tells you which objects time can touch.", "观察场景如何组装起来。轮廓会告诉你时间能作用在哪些物件上。"],
      ["SPACE", "Arm a zone. You need at least 20 energy on the bar to open one.", "启动一个区域。能量条至少要有 20 才能开启。"],
      ["CLICK", "Place it. A raycast puts the zone where you pointed, up to three at once.", "放置它。射线会把区域放在你指的位置，最多同时三个。"],
      ["WATCH", "Inside the zone time runs at 15%. Outside it, the accident keeps its schedule.", "区域内时间以 15% 速度流动。区域外，那场意外仍按原定时刻进行。"],
    ],
  },
  {
    kind: "diagram",
    title: "You Are Spending Something",
    label: "ENERGY BUDGET",
    svg: energyDiagram,
    caption: {
      en: "A zone drains 20 energy a second and the bar refills at 10, so slowing time costs twice what waiting earns. That asymmetry is the whole reason three zones is a real decision rather than a free upgrade — you cannot hold all three open and still have anything left when the train arrives.",
      zh: "一个区域每秒消耗 20 点能量，而能量条每秒只回复 10 点，因此减速的代价是等待所得的两倍。正是这个不对称让「三个区域」成为真正的取舍，而不是免费的升级——你无法同时撑开三个区域，又在火车抵达时还剩下什么。",
    },
  },
  {
    kind: "spec-table",
    kicker: "Design problem",
    title: "What I Wanted After the Cut, and What Shipped",
    intro: {
      en: "After the scope change I wrote down five things I wanted players to get. Four of them are in the build; the one that matters most is not.",
      zh: "缩小尺度之后，我写下了五件希望玩家能得到的东西。其中四件已经做进游戏；最重要的那一件还没有。",
    },
    head: ["What I wanted", "Shipped?", "What the player gets"],
    rows: [
      ["Highlight the woman's situation faster so players know what to intervene in", "No", "Still the open problem: nothing in the scene tells players what the woman is about to walk into."],
      ["More interactive objects, with outlines showing what is interactive", "Yes", "Hovering outlines every object time can touch, so players see their options before committing."],
      ["Move from global to local time deceleration", "Yes", "A zone lands where you click, so slowing time becomes a choice of target."],
      ["More zones, each with a smaller area, combined into a larger effect", "Yes", "Up to three zones at once; right-click closes one early."],
      ["Energy as the cost of holding zones open", "Yes", "A 100-point bar that drains 20 a second, refills 10, and needs 20 to open a zone, so every zone is a cost."],
    ],
    note: {
      en: "The first row is the one that matters. Every test failure below traces back to it: the mechanic works, and the scene never tells you what it is for.",
      zh: "第一列才是关键。下方每一次测试失败都能追溯到它：机制本身可用，但场景从未告诉你它是为了什么而存在。",
    },
  },
  {
    kind: "case-gallery",
    kicker: "Iteration",
    title: "Two Rounds, Side by Side",
    intro: {
      en: "The first round of recordings, from late February, shows a zone as a flat disc painted on the road and energy as a bare number. By the second round in March the zone had risen into a translucent dome you can see into, markers counted the zones you had left, the bar turned red as it ran out, and the scene waited on a start screen until the player was ready.",
      zh: "二月底的第一轮录像里，减速区是画在路面上的一块扁平圆盘，能量只是一个数字。到三月的第二轮，减速区变成了一个看得进去的半透明罩子，屏幕上的标记会显示还剩几个区域，能量快用完时变成红色，而场景会停在开始画面，等玩家准备好再开始。",
    },
    items: [
      {
        image: "assets/case-study/slow-em-down/round-1.jpg",
        label: "Round 1 · 26 February",
        alt: "First-round build: a flat slow zone on the road and a numeric energy bar",
        caption: { en: "Round one: the zone is a flat disc on the road, and the energy is just a number under the prompt.", zh: "第一轮：减速区是路面上的一块扁平圆盘，能量只是提示文字下方的一个数字。" },
      },
      {
        image: "assets/case-study/slow-em-down/round-2.jpg",
        label: "Round 2 · 12 March",
        alt: "Second-round build: a translucent dome slow zone with a zone marker and a full energy bar",
        caption: { en: "Round two: the zone rises into a dome you can see into, and a marker in the corner shows the zones still available.", zh: "第二轮：减速区变成一个看得进去的罩子，角落里的标记显示还能用几个区域。" },
      },
    ],
  },
  {
    kind: "video",
    video: "assets/videos/slow-em-down-round-2.mp4",
    poster: "assets/case-study/slow-em-down/round-2-poster.jpg",
    alt: "Slow’em Down second-round build recording",
    label: "GAMEPLAY VIDEO / SECOND ROUND / FULL RECORDING 0:22",
    caption: {
      en: "The second-round build from its start screen: a dome dropped on the crossing, the train passing through it, and the energy bar draining towards red.",
      zh: "第二轮版本，从开始画面起：一个罩子落在铁道口上，火车从中穿过，能量条一路掉向红色。",
    },
  },
  {
    kind: "spec-table",
    kicker: "Playtest",
    title: "Three Tests, One Answer",
    intro: {
      en: "I put the mechanic in front of players three times. My notes from each session are on the board, in my own words, and they converge.",
      zh: "我把这个机制拿给玩家试了三次。每一次的笔记都用我自己的话记在设计板上，而它们指向同一个结论。",
    },
    head: ["When", "What I recorded", "Reading"],
    rows: [
      ["Feb 26 — first session", "“Players can feel what it is like to control time, and that experience itself is strong.” But: “the only thing players can really slow is the train. They cannot control the other things, so the space for player action is smaller than I imagined.”", "The fantasy lands. The verbs do not."],
      ["Second session", "“Players understood the mechanic reasonably well — they could tell which objects the slowdown works on.” And: “the train track setup is the strongest; apart from the train track, the other setups are not strong.”", "Same finding, arrived at independently."],
      ["Third session — Kyle", "“The player was confused understanding the mechanic. I think the confusion has two parts…” — the note stops there.", "The one session where comprehension itself failed, and the analysis was never finished."],
    ],
    note: {
      en: "Two of three sessions say the same sentence in different words: the train works and nothing else does. I built a bird and a piano, and neither became something a player could act on.",
      zh: "三次里有两次用不同的话说了同一句：火车有效，其他都无效。我做了鸽子与钢琴，但两者都没能变成玩家真正可以介入的东西。",
    },
  },
  {
    kind: "text",
    title: "Level 2 Was Designed and Not Reached",
    paragraphs: [
      {
        en: "The board carries a second storyboard — a kitchen, with a stove, a soup pot, a frying pan holding an egg, and boiling water. Four setups instead of three, all on timers, all in one room, so the zones would have to be spent against each other rather than dropped on the only thing that moves.",
        zh: "板子上还有第二份故事板——一间厨房，配上炉台、汤锅、煎着蛋的平底锅，以及一壶滚水。四个装置而不是三个，全都各有计时、全都在同一个房间里，因此区域必须彼此权衡使用，而不是往唯一会动的东西上一放了事。",
      },
      {
        en: "Level2.unity exists in the project. The kitchen does not. That gap is the honest state of this prototype: the fix for “only the train works” was designed on paper as a room where four things work at once, and I ran out of time before I could build it.",
        zh: "Level2.unity 在专案里，厨房却不在。这个落差就是这个原型诚实的现况：针对「只有火车有效」的解法，已经在纸上设计成一个四件事同时运作的房间，而我在把它做出来之前就用完了时间。",
      },
    ],
  },
  {
    kind: "spec-table",
    kicker: "Player flow",
    title: "The Five Minutes I Planned",
    intro: {
      en: "I planned the demo as one player's five minutes, screen by screen, with a time budget for each. What shipped is the part that tests the mechanic.",
      zh: "我把这个试玩版规划成一位玩家的五分钟，一屏一屏地排好，每一屏都有时间预算。最后做出来的，是真正用来检验机制的那一部分。",
    },
    head: ["Screen", "What the player does", "Planned", "Built?"],
    rows: [
      ["Start", "A title card and one button; the scene stays frozen until the player is ready.", "5–10 s", "Yes"],
      ["Tutorial", "Learn to open a slow zone before anything is at stake.", "30 s", "As an on-screen prompt"],
      ["Level 1 — the crossing", "Get her to the far side untouched. The train and the piano can kill her; the barrier holds her for five seconds until the lights turn red.", "1 min", "Yes — reach the goal to win, the train ends it, Enter retries"],
      ["Level 1 report", "How long the rescue took, and how many attempts failed.", "5–10 s", "A win or lose screen, without the numbers"],
      ["Level 2 — the kitchen", "Slow the right corner before the egg burns in the pan or the cat gets in.", "1.5 min", "No"],
      ["Level 2 report", "How long it took to secure the kitchen, and how many tries.", "5–10 s", "No"],
      ["End", "Everything the player achieved, on one screen.", "5–10 s", "No"],
    ],
  },
  {
    kind: "callout",
    title: "Hearing a First-Time Player",
    en: "I recorded the Feb 26 session with OBS while the player thought aloud: six minutes with audio, made at 4:18pm that day. It is the closest look I have at someone meeting the mechanic for the first time, in their own words.",
    zh: "2 月 26 日那次测试，我用 OBS 录下了玩家边玩边说出想法的过程：六分钟，带音轨，录于当天下午 4:18。这是我能看到的、新玩家第一次接触这个机制时最直接的记录，用的是他们自己的话。",
  },
  {
    kind: "callout",
    title: "The Version Before This One",
    en: "Seven silent clips in the same folder are all dated 29 January — Book, location, identity recognized, Victim. They belong to the idea I started with: subjective time distortion, referenced against Return of the Obra Dinn and its time-stopped murder case. I let that direction go, and Dumb Ways to Die replaced it. I keep the clips because the level crossing only makes sense as the thing I chose instead.",
    zh: "同一个文件夹里有七段无声短片，日期全是 1 月 29 日——Book、location、identity recognized、Victim。它们属于我最初的构想：主观时间扭曲，参照《Return of the Obra Dinn》那桩被冻结的凶案。后来我放下了这个方向，换成了《Dumb Ways to Die》式的思路。我留着这些片段，因为铁道口只有作为“我改选的那个东西”才说得通。",
  },
]
