// Space Bounty Hunter (/service-game-ui-2) — the drawer case study.
// Sources: the Game as Service course decks (Week 1, Week 4, Week 5, Spring 2026);
// the team's Drive ("Space Bounty Hunters (Weiting, Red, Kaine)"): MMORPG Slides
// (3/12), the Week 10 deck, prototype link and playtest questions (3/27), the pitch
// (4/9), and the final deliverables folder — Slides Space Bounty Hunters, GDD Space
// Bounty Hunters, Data Sheets Space Bounty Hunters (last edited 4/23), Qualitative
// Playtest Summaries, SpaceBountyHunters.mov; Red's 3/18 download of the data sheet;
// the Figma file "Game-as-Sevice", page "Project 2: Space Bounty Hunters" (screens,
// flow chart, sticky notes); Red's SpaceBountyHuntersDesign.ai and its SVG exports.
// Every number is re-derived in reference/projects/space-bounty-hunter/sheet-derivations.py.
// Testers are identified by number only. Chinese is written in Simplified — see
// tbc-sections.js for why.

const pair = (en, zh) => ({ en, zh })

// --- The stat sheet, 4/23 (grades) and 3/18 (before) ---------------------------------
const heatRows = [
  ["Resolve", "意志", { Health: "S", Armor: "B", Shield: "B", "Shock Resist": "C", "Toxin Resist": "C", "Burn Resist": "C", "Cryo Resist": "C", "Critical Resistance": "B" }, { Health: "S", Armor: "B", Shield: "B", "Shock Damage": "C", "Shock Resist": "C", "Toxin Damage": "C", "Toxin Resist": "C", "Burn Damage": "C", "Burn Resist": "C", "Cryo Damage": "C", "Cryo Resist": "C" }],
  ["Strength", "力量", { Health: "A", Armor: "A", "Gun Stability": "S", "Physical Damage": "A" }, { Health: "A", Armor: "A", "Gun Stability": "S" }],
  ["Agility", "敏捷", { "Physical Damage": "A", "Critical Chance": "A" }, {}],
  ["Marksman", "枪法", { "Gun Damage": "S", "Gun Stability": "A", "Physical Damage": "C", "Critical Damage": "B" }, { "Gun Damage": "S" }],
  ["Tech", "科技", { Health: "B", Armor: "S", "Grenade Damage": "A", "Shock Damage": "B", "Shock Resist": "B", "Damage to Robotics": "A" }, { Health: "B", Armor: "S" }],
  ["Hack", "骇入", { Shield: "A", "Shield Regen Rate": "S", "Grenade Cooldown": "A", "Shock Damage": "S", "Shock Resist": "S", "Cryo Damage": "B", "Cryo Resist": "B", "Damage to Robotics": "S" }, { Shield: "A", "Shield Regen Rate": "S" }],
  ["Biology", "生物学", { "Toxin Damage": "S", "Toxin Resist": "S" }, {}],
  ["Chemistry", "化学", { "Toxin Damage": "B", "Toxin Resist": "B", "Burn Damage": "S", "Burn Resist": "S", "Cryo Damage": "S", "Cryo Resist": "S" }, {}],
  ["Physics", "物理", { "Shield Regen Delay": "S", "Grenade Damage": "S", "Grenade Cooldown": "S", "Physical Damage": "A", "Burn Damage": "B", "Burn Resist": "B" }, { "Grenade Damage": "S", "Grenade Cooldown": "S" }],
  ["Perception", "感知", { "Gun Weakspot Damage": "S", "Critical Chance": "S", "Critical Resistance": "A" }, { "Gun Weakspot Damage": "S" }],
  ["Stealth", "潜行", { "Gun Weakspot Damage": "A", "Critical Damage": "S" }, {}],
  ["Charm", "魅力", { "Critical Chance": "B", "Critical Damage": "B", "Critical Resistance": "B", "Damage to Humanoids": "S" }, {}],
].map(([name, zh, grades, before]) => ({ name, zh, grades, before }))

// --- Weapon Stats: DPS = shots per minute × damage ÷ 60 × bullets per shot -------------
const gun = (name, dmg, spm, bullets, mat) => ({ name, dmg, spm, bullets, mat, dps: Math.round(((spm * dmg * bullets) / 60) * 10) / 10 })
const arsenalClasses = [
  { name: "Auto Rifle", zh: "自动步枪", ammo: "Primary", weapons: [gun("Auto 01", 21, 600, 1, "Metal Plating"), gun("Auto 02", 29, 450, 1, "Metal Plating"), gun("Auto 03", 18, 720, 1, "Metal Plating"), gun("Auto 04", 33, 360, 1, "Metal Plating"), gun("Auto 05", 33, 360, 1, "Liquid Metal")], flags: { "Auto 04, Auto 05": "04 = 05" } },
  { name: "Burst Rifle", zh: "点射步枪", ammo: "Primary", weapons: [gun("Burst 01", 35, 108, 3, "Metal Plating"), gun("Burst 02", 29, 130, 3, "Metal Plating"), gun("Burst 03", 23, 180, 3, "Metal Plating"), gun("Burst 04", 35, 110, 4, "Metal Plating"), gun("Burst 05", 33, 360, 5, "Irridium")], flags: { "Burst 05": "Burst 05 · 990" } },
  { name: "Dual Pistols", zh: "双持手枪", ammo: "Primary", weapons: [1, 2, 3, 4, 5].map((i) => gun(`Pistols 0${i}`, 33, 360, 2, i < 5 ? "Metal Plating" : "Bio Spores")), flags: { "Pistols 01, Pistols 02, Pistols 03, Pistols 04, Pistols 05": "five identical rows" } },
  { name: "Sniper Rifle", zh: "狙击步枪", ammo: "Special", weapons: [gun("Sniper 01", 240, 140, 1, "Metal Plating"), gun("Sniper 02", 320, 90, 1, "Metal Plating"), gun("Sniper 03", 400, 72, 1, "Metal Plating"), gun("Sniper 04", 400, 72, 1, "Metal Plating"), gun("Sniper 05", 400, 72, 1, "Bio Spores")], flags: { "Sniper 02, Sniper 03, Sniper 04, Sniper 05": "02–05 all at 480" } },
  { name: "Shotgun", zh: "霰弹枪", ammo: "Special", weapons: [gun("Shotgun 01", 27, 80, 12, "Metal Plating"), gun("Shotgun 02", 12, 240, 12, "Metal Plating"), gun("Shotgun 03", 18, 140, 8, "Metal Plating"), gun("Shotgun 04", 200, 120, 1, "Metal Plating"), gun("Shotgun 05", 22, 80, 12, "Timber")] },
  { name: "Rocket Launcher", zh: "火箭筒", ammo: "Heavy", weapons: [1, 2, 3, 4, 5].map((i) => gun(`Rocket 0${i}`, 2400, 20, 1, i < 5 ? "Metal Plating" : "Fungal Spores")), flags: { "Rocket 01, Rocket 02, Rocket 03, Rocket 04, Rocket 05": "five identical rows" } },
]

// --- Live Ops 1yr plan: the sheet's own date ranges, Monday to Sunday ------------------
const weekRanges = [
  "Apr 1–7", "Apr 8–14", "Apr 15–21", "Apr 22–28", "Apr 29–May 5", "May 6–12", "May 13–19", "May 20–26", "May 27–Jun 2",
  "Jun 3–9", "Jun 10–16", "Jun 17–23", "Jun 24–30", "Jul 1–7", "Jul 8–14", "Jul 15–21", "Jul 22–28", "Jul 29–Aug 4",
  "Aug 5–11", "Aug 12–18", "Aug 19–25", "Aug 26–Sep 1", "Sep 2–8", "Sep 9–15", "Sep 16–22", "Sep 23–29", "Sep 30–Oct 6",
  "Oct 7–13", "Oct 14–20", "Oct 21–27", "Oct 28–Nov 3", "Nov 4–10", "Nov 11–17", "Nov 18–24", "Nov 25–Dec 1", "Dec 2–8",
  "Dec 9–15", "Dec 16–22", "Dec 23–29", "Dec 30–Jan 5", "Jan 6–12", "Jan 13–19", "Jan 20–26", "Jan 27–Feb 2", "Feb 3–9",
  "Feb 10–16", "Feb 17–23", "Feb 24–Mar 2", "Mar 3–9", "Mar 10–16", "Mar 17–23", "Mar 24–30", "Mar 31–Apr 6",
]

const screen = (file, name, alt) => ({ image: `assets/sbh/screens/${file}.jpg`, name, alt })

export const sbhSections = [
  {
    kind: "copy-grid",
    left: {
      title: "Brief",
      en: "Space Bounty Hunters is a sci-fi first-person-shooter MMORPG we designed in the second half of Game as Service, Spring 2026. The syllabus gave weeks 7 to 14 to begin an MMORPG on any platform. We chose console and PC and one fantasy: take a contract, fly to a planet, hunt the thing that lives there, and turn what you carve off it into better gear. Nothing here was built in an engine. This is the design package the course asked for: slides, a data sheet, a GDD, a clickable Figma prototype and a recording of it.",
      zh: "Space Bounty Hunters 是我们在 2026 年春季 Game as Service 课程后半段设计的一款科幻第一人称射击 MMORPG。教学大纲给了第 7 到第 14 周，让每组开始设计一款任意平台的 MMORPG。我们选了主机与 PC，只抓一个幻想：接下合约，飞到一颗星球，猎杀住在那里的东西，再把从它身上取下的材料做成更好的装备。这里没有任何东西是在引擎里做出来的，而是课程要求的整套设计：演示文稿、数据表、GDD、可点击的 Figma 原型，以及原型的录屏。",
    },
    right: {
      title: "Team and my part",
      en: "Kaine, Weiting and me. The GDD and the data sheet live in Kaine’s Drive, and our weekly hand-ins in Weiting’s. My part, as the files show it: the character-creation screens and the visual kit behind them — the body silhouettes, the vertical step rails, the contour-map texture and the ₿ on every price — drawn in Illustrator on 3/18 and 3/19 and brought into our shared Figma. I also asked the question that put the background choice in front of the twelve stats.",
      zh: "Kaine、Weiting 和我。GDD 和数据表存在 Kaine 的 Drive 里，每周的作业提交在 Weiting 的文件夹里。按文件能看到的，我负责的是角色创建的界面，以及它背后的视觉素材——人物剪影、竖向的步骤标签、等高线地图纹理，还有每个价格旁边的 ₿——3 月 18、19 日在 Illustrator 里画好，再导进我们共用的 Figma。让“选择背景”排到十二项属性前面的那个问题，也是我提出来的。",
    },
  },
  {
    kind: "sbh-timeline",
    title: "Seven Weeks of Hand-ins",
    intro: pair(
      "The first half of the course had already taught the kit: a pitch deck in Week 1, economy spreadsheets in Week 4, live ops, monetization and the GDD in Week 5. The MMORPG ran the same kit again, faster and bigger. Each hand-in below is tagged with the lesson it answers.",
      "课程前半段已经把这套工具教过一遍：第 1 周的提案演示文稿，第 4 周的经济系统表格，第 5 周的长线运营、商业化与 GDD。MMORPG 把同一套工具又跑了一遍，更快，也更大。下面每一次提交，都标出了它回应的是哪一课。",
    ),
    weeks: [
      { week: 7, date: "3/5", title: "Kickoff", en: "The slides and the data sheet are opened the day the project starts.", zh: "项目开始当天，演示文稿和数据表就建好了。", lesson: pair("Syllabus: begin an MMORPG, weeks 7–14", "教学大纲：第 7–14 周开始一款 MMORPG") },
      { week: 8, date: "3/12", title: "First deck", en: "SCI-FI FPS MMORPG: twelve attributes, a four-step loop, Credits as the currency, three social systems, and an art-direction slide that still says Placeholder.", zh: "第一版演示文稿：十二项属性、四步循环、叫作 Credits 的货币、三个社交系统，以及一张还写着 Placeholder 的美术方向页。", lesson: pair("Week 1: the eight-slide pitch deck", "第 1 周：八页提案演示文稿") },
      { week: 9, date: "3/18–3/19", title: "Numbers and a look", en: "My 3/18 copy of the sheet: 22 grades, five of twelve attributes doing nothing, the weapon tab empty. The next day my Illustrator kit goes into Figma.", zh: "我在 3/18 下载的那份数据表：22 个评级，十二项属性里有五项什么也不影响，武器页还是空的。第二天，我的 Illustrator 素材导进了 Figma。", lesson: pair("Week 4: put the attributes in a spreadsheet", "第 4 周：把属性放进表格") },
      { week: 10, date: "3/26–3/27", title: "Prototype and playtest", en: "The clickable prototype goes in with ten playtest questions. The deck gains guild halls, raids, faction wars and a Halloween event, Headless Hunts.", zh: "可点击原型连同十个试玩问题一起提交。演示文稿加上了公会大厅、团队副本、阵营战，以及万圣节活动 Headless Hunts。", lesson: pair("Week 5: event frameworks and holidays", "第 5 周：活动框架与节日") },
      { week: 11, date: "4/2", empty: true, en: "Nothing in the files is dated this week.", zh: "文件里没有这一周的记录。" },
      { week: 12, date: "4/9", title: "The pitch", en: "Eleven slides for an imaginary publisher: free to play, cosmetic sales, a 70/30 split between the game and live ops, launch in March 2031.", zh: "给一个假想发行商的十一页提案：免费游玩、只卖外观、本体与长线运营按 70/30 分配人力，2031 年 3 月上线。", lesson: pair("Outcome 5: plan a roadmap and explain it", "学习目标 5：规划路线图并讲清楚") },
      { week: 13, date: "4/16", title: "GDD and final deck", en: "The GDD follows the course template, milestones and all. The deck fills in the playtest feedback, the metagame and a persona.", zh: "GDD 按课程模板来写，连里程碑都照着填。演示文稿补上了试玩反馈、元游戏设计和用户画像。", lesson: pair("Week 5: a good GDD settles arguments", "第 5 周：好的 GDD 能平息争论") },
      { week: 14, date: "4/23", title: "Final hand-in", en: "The sheet ends at 55 grades, 30 levels, 30 guns and a year of live ops. With it: the GDD, five written playtest summaries and the 4:34 recording.", zh: "数据表最终有 55 个评级、30 个等级、30 把枪和一整年的运营日历。一起交上的还有 GDD、五份文字试玩总结，以及 4 分 34 秒的录屏。", lesson: pair("Week 5: video, slides, wireframes, spreadsheets, GDD", "第 5 周：视频、演示文稿、线框、表格、GDD") },
    ],
  },
  {
    kind: "copy-grid",
    left: {
      title: "The Pitch",
      en: "Our pitch line was “Star Wars meets Monster Hunter.” The gap we claimed: shooters rarely give you deep builds and long progression, and MMOs rarely give you precise gunplay. So the hunt is the progression. You don’t level by finishing quests; you get stronger because the thing you killed dropped the material your next gun needs. The audience line was wide, 14 to 50 on console and PC, but the player we pictured was narrower: someone who likes grinding for a gun with friends.",
      zh: "我们的一句话提案是“星球大战遇上怪物猎人”。我们认定的空缺是：射击游戏很少给你深度的构筑和长线成长，MMO 又很少给你精准的枪感。所以狩猎本身就是成长。你不是靠做任务升级，而是因为你猎杀的东西，掉落了下一把枪需要的材料。受众写得很宽，14 到 50 岁、主机与 PC，但我们心里想的玩家更窄：喜欢和朋友一起为一把枪反复刷的人。",
    },
    right: {
      title: "The Mantra",
      en: "The GDD opens with one question for every feature: “Does this make me feel like a bounty hunter prepping for the next big hunt?” Under it sit three pillars: customization and expression, fast and responsive first-person combat, and progression through loot and destinations. The pillars also set what the rest of this page measures: builds in the stat sheet, combat in the prototype, loot and destinations in the grind and the calendar.",
      zh: "GDD 开头写着一个问题，每个功能都要回答它：“这会让我觉得自己是一名正在为下一场大狩猎做准备的赏金猎人吗？”下面是三根支柱：定制与表达、快速灵敏的第一人称战斗、由战利品和目的地推动的成长。这三根支柱也决定了这一页接下来度量什么：属性表里的构筑、原型里的战斗、刷取时长与运营日历里的战利品和目的地。",
    },
  },
  {
    kind: "persona",
    title: "Alex Chen, 22",
    intro: pair(
      "The Week 5 brief asked for one persona. Ours is the player the grind is built for, and his list of frustrations reads like the ways a grind fails.",
      "第 5 周的作业要求做一个用户画像。我们的画像，就是这套“刷”的系统所服务的玩家；他的不满清单，读起来正像一套刷取系统失败的方式。",
    ),
    tag: "Persona · final slides",
    name: "Alex Chen",
    bio: pair(
      "22, a computer-science student in Singapore. Plays online almost every night, mostly MMORPGs and looter shooters, usually with friends or his guild, always tuning his build and his PvP.",
      "22 岁，新加坡的计算机专业学生。几乎每晚都在线上玩，多是 MMORPG 和刷宝射击，通常和朋友或公会一起，总在打磨自己的构筑和 PvP。",
    ),
    quote: pair(
      "“I enjoy grinding for better gear and playing with friends to become stronger together.”",
      "“我喜欢为了更好的装备反复刷，也喜欢和朋友一起变强。”",
    ),
    columns: [
      { label: "Goals and needs", items: ["Keep improving his build", "Rare gear and cosmetics", "Guilds and raids that matter", "Long-term progression", "Clear goals, structured activities"] },
      { label: "Frustrations", items: ["Grinding with no meaningful reward", "No content updates", "Unbalanced PvP", "Solo play feels less rewarding"] },
      { label: "Player types", items: ["Achiever", "Socializer", "Killer", "Explorer"] },
      { label: "Where he plays", items: ["PC, consoles, mobile", "Steam and Discord", "YouTube and Twitch"] },
    ],
  },
  {
    kind: "flow",
    title: "One Hunt, 20 to 30 Minutes",
    steps: [
      ["01 · Pick", "Take a bounty on the Star Map", "在星图上接下一份悬赏"],
      ["02 · Hunt", "Land, gather, and kill the target", "降落、采集、击杀目标"],
      ["03 · Loot", "A guaranteed bounty, random materials", "悬赏奖励必得，材料随机掉落"],
      ["04 · Craft", "Turn materials and ₿ into gear, then pick again", "把材料和 ₿ 变成装备，再接下一份"],
    ],
  },
  {
    kind: "sbh-heatmap",
    title: "Twelve Attributes, Twenty-Five Stats",
    intro: pair(
      "Each attribute point you spend scales some combat stats more than others, and the sheet grades every pairing S, A, B or C. On 3/18 it had 22 grades across 18 stats, and five attributes — Agility, Biology, Chemistry, Stealth and Charm — did nothing at all. By 4/23 it had 55 across 25: 18 grades kept, 4 dropped, 37 added. The grid is the 4/23 sheet; a dot marks a grade that was already there on 3/18.",
      "每投入一点属性，都会让某些战斗数值涨得比别的多；数据表给每一组对应关系打了 S、A、B 或 C。3/18 那一版只有 18 项战斗数值、22 个评级，而且有五项属性——敏捷、生物学、化学、潜行、魅力——什么也不影响。到 4/23，它有 25 项数值、55 个评级：保留 18 个，删掉 4 个，新增 37 个。下面是 4/23 的版本；带圆点的格子，表示 3/18 时就已经有这个评级。",
    ),
    note: pair(
      "Two readings of my own, not the team’s. Weighted S = 4 down to C = 1, Hack carries 26 points of effect and Agility 6, which is where a balance pass would start. And the one column nobody fills is Damage to Monsters, in a game about hunting monsters.",
      "两点是我自己的解读，不是团队的结论。如果把 S 记作 4、C 记作 1，骇入一共带来 26 点影响，敏捷只有 6——平衡调整应该从这个差距开始。还有，唯一一列谁都没有填的，是“对怪物伤害”，而这是一款关于猎杀怪物的游戏。",
    ),
    caption: "Stat-scaling grades for twelve attributes across twenty-five combat stats in the 4/23 sheet, with the grades that already existed on 3/18 marked.",
    beforeLabel: "3/18",
    afterLabel: "4/23",
    wasLabel: "graded on 3/18",
    droppedLabel: "dropped after 3/18",
    scale: [
      { grade: "S", label: "scales most" },
      { grade: "A", label: "" },
      { grade: "B", label: "" },
      { grade: "C", label: "scales least" },
    ],
    groups: [
      { label: "Defense", cols: [{ key: "Health", short: "Health" }, { key: "Armor", short: "Armor" }] },
      { label: "Shield", cols: [{ key: "Shield", short: "Shield" }, { key: "Shield Regen Rate", short: "Regen rate" }, { key: "Shield Regen Delay", short: "Regen delay" }] },
      { label: "Gun", cols: [{ key: "Gun Damage", short: "Damage" }, { key: "Gun Weakspot Damage", short: "Weak spot" }, { key: "Gun Stability", short: "Stability" }] },
      { label: "Grenade", cols: [{ key: "Grenade Damage", short: "Damage" }, { key: "Grenade Cooldown", short: "Cooldown" }] },
      { label: "Physical", cols: [{ key: "Physical Damage", short: "Damage" }] },
      {
        label: "Elemental",
        cols: [
          { key: "Shock Damage", short: "Shock" }, { key: "Shock Resist", short: "Shock res." },
          { key: "Toxin Damage", short: "Toxin" }, { key: "Toxin Resist", short: "Toxin res." },
          { key: "Burn Damage", short: "Burn" }, { key: "Burn Resist", short: "Burn res." },
          { key: "Cryo Damage", short: "Cryo" }, { key: "Cryo Resist", short: "Cryo res." },
        ],
      },
      { label: "Critical", cols: [{ key: "Critical Chance", short: "Chance" }, { key: "Critical Damage", short: "Damage" }, { key: "Critical Resistance", short: "Resist" }] },
      { label: "Damage to", cols: [{ key: "Damage to Humanoids", short: "Humanoids" }, { key: "Damage to Robotics", short: "Robotics" }, { key: "Damage to Monsters", short: "Monsters" }] },
    ],
    rows: heatRows,
  },
  {
    kind: "sbh-build",
    title: "Pick a Background, Inherit a Weakness",
    intro: pair(
      "Character creation stacks three choices. A background puts +5 across its own stats and −5 across another background’s, so every strength arrives with someone else’s weakness. Species adds a smaller push, and body shape only moves stats at the extremes. Points can be moved freely afterwards: the choices decide where you start, not where you have to stay.",
      "角色创建叠加了三个选择。背景会在自己的属性上加 +5，同时在另一个背景的属性上扣 −5，所以每一份长处，都带着别人的短处一起到来。种族再推一小把，体型只在极端时才影响属性。之后点数可以自由重新分配：这些选择决定你从哪里出发，而不是你必须停在哪里。",
    ),
    cycle: {
      viewBox: "0 0 640 336",
      title: "The background loops",
      desc: "The Scientist pays with the Wreckingball's stats, the Wreckingball with the Shadow's, and the Shadow with the Scientist's. The Technician and the Deceiver pay with each other's. The Wild Card takes plus five anywhere and minus seven anywhere.",
      loops: [
        {
          cx: 190, cy: 184, r: 112,
          nodes: [
            { angle: -90, name: "The Scientist", zh: "科学家", stats: "Physics · Biology · Chemistry", lx: 190, ly: 18 },
            { angle: 30, name: "The Wreckingball", zh: "破坏球", stats: "Strength · Resolve", lx: 287, ly: 266 },
            { angle: 150, name: "The Shadow", zh: "暗影", stats: "Agility · Marksman", lx: 93, ly: 266 },
          ],
        },
        {
          cx: 520, cy: 184, r: 70,
          nodes: [
            { angle: -90, name: "The Technician", zh: "技师", stats: "Hack · Tech", lx: 520, ly: 60 },
            { angle: 90, name: "The Deceiver", zh: "欺诈者", stats: "Stealth · Perception · Charm", lx: 520, ly: 280 },
          ],
        },
      ],
      caption: pair(
        "Each arrow points at the background whose stats you pay with: the Scientist’s −5 lands on the Wreckingball’s Strength and Resolve. Three backgrounds make a loop, two make a pair, and the Wild Card sits outside both at +5 anywhere and −7 anywhere.",
        "每个箭头都指向你要付出属性的那个背景：科学家的 −5 落在破坏球的力量与意志上。三个背景组成一个环，两个背景组成一对，百搭则在两者之外：任意 +5，任意 −7。",
      ),
    },
    speciesTitle: "Five species, each nets to zero",
    species: [
      { name: "Human", zh: "人类", plus: ["+1 Marksman", "+1 Agility", "+1 Strength"], minus: ["−1 Physics", "−1 Chemistry", "−1 Biology"], lore: pair("The galaxy’s masters of firepower, who underuse its science.", "银河中最擅长火力的一族，却很少用上科学。") },
      { name: "Android", zh: "仿生人", plus: ["+1 Tech", "+1 Hack"], minus: ["−1 Charm", "−1 Perception"], lore: pair("Built by humans long ago; they escaped servitude and are growing cultures of their own. The sheet still calls them Robot.", "很久以前由人类制造，逃离了奴役，正在形成自己的文化。数据表里仍然叫他们 Robot。") },
      { name: "Magenta Alien", zh: "品红外星人", plus: ["+1 Charm", "+1 Chemistry"], minus: ["−2 Strength"], lore: pair("Reshaped their bodies to fit human society and hold power in the Galactic Empire, frail as they are.", "改变自己的形态以融入人类社会，身体虽然脆弱，却在银河帝国里身居要职。") },
      { name: "Yellow Alien", zh: "黄色外星人", plus: ["+1 Biology", "+1 Resolve"], minus: ["−2 Stealth"], lore: pair("Cracked their genetic code centuries before humanity; the fluorescent glow of their skin won’t come off.", "比人类早几个世纪破解了自己的基因密码；皮肤的荧光却怎么也去不掉。") },
      { name: "Cyan Alien", zh: "青色外星人", plus: ["+1 Physics", "+1 Perception"], minus: ["−2 Agility"], lore: pair("The GDD never wrote their story.", "GDD 里没有写他们的故事。") },
    ],
    bodyTitle: "Body, at the extremes only",
    body: [
      { name: "Towering", plus: "+1 Perception", minus: "−1 Stealth" },
      { name: "Tiny", plus: "+1 Stealth", minus: "−1 Perception" },
      { name: "Starved", plus: "+1 Agility", minus: "−1 Resolve" },
      { name: "Obese", plus: "+1 Resolve", minus: "−1 Agility" },
    ],
    bodyNote: {
      label: "The sheet’s own note",
      en: "“Body size/shape affects stats??!!?? But only at extreme end values?”",
      zh: "“体型会影响属性？？！！？？但只在极端值的时候？”",
    },
    decision: {
      label: "Background first",
      en: "On our flow chart, my sticky note asked whether the background or the twelve stats should come first. The answer that came back: background, so a new player doesn’t have to look at all twelve right away. It is also the first fix the Week 10 feedback asked for.",
      zh: "在我们的流程图上，我贴了一张便签，问背景和十二项属性应该哪个先出现。得到的回答是：背景先，这样新玩家不必一上来就面对全部十二项。这也正是第 10 周试玩反馈要求的第一个修改。",
    },
  },
  {
    kind: "sbh-playtest",
    title: "Week 10: Five Testers",
    intro: pair(
      "In Week 10 we put the clickable prototype in front of players with ten questions. Our deck kept three strengths and three weaknesses; the written summaries in our final folder keep five people’s answers. All five had trouble with how the stats were shown, and no two picked the same favourite.",
      "第 10 周，我们带着十个问题，把可点击原型交给玩家试玩。演示文稿记下了三个优点和三个缺点；最终文件夹里的文字总结，保留了五个人的回答。五个人都觉得属性的呈现方式有问题，而且没有两个人选中同一项最喜欢的属性。",
    ),
    strengthsTitle: "What held up",
    strengths: [
      pair("The core loop read without help: planet → hunt → kill → loot → upgrade → repeat.", "核心循环不用解释就能看懂：星球 → 狩猎 → 击杀 → 拾取 → 升级 → 重复。"),
      pair("The backgrounds felt thematic, and the science stats were the most interesting on paper.", "背景很有主题感，三项科学属性在纸面上最有意思。"),
      pair("Different parts pulled different players: builds and combat, crafting and pets, home and guild decor, PvP gun feel.", "不同的部分吸引不同的玩家：构筑与战斗、制作与宠物、家园与公会装饰、PvP 的枪感。"),
    ],
    weaknesses: [
      {
        title: pair("Too many stats at the start", "一开始属性太多"),
        why: pair("Too many decisions at once; all twelve stats arrive together.", "同时要做的决定太多；十二项属性一起涌上来。"),
        fix: pair("Group them and show only the stats your choice changes, with the rest a tap away.", "把属性分组，只显示你的选择会改变的那几项，其余的点一下再看。"),
        test: pair("Show fewer stats at once in Figma and see whether choosing gets easier.", "在 Figma 里一次少显示几项，看选择是否变得更容易。"),
        after: pair("Background now comes first and each card names only its own stats. The allocation screen still lists all twelve.", "背景现在排在最前，每张卡片只写自己的属性。但分配属性的界面仍然列出全部十二项。"),
      },
      {
        title: pair("The tutorial hides the hook", "新手教程没有展示卖点"),
        why: pair("It teaches moving and shooting, not what makes this game itself, before dropping you on the Star Map.", "它教了移动和射击，却没教这款游戏独有的东西，就把你丢到了星图上。"),
        fix: pair("Show the C.A.T., grenades, melee and crafting from alien bodies before the first planet. An MMO can afford a longer tutorial.", "在第一颗星球之前，先展示机械猫 C.A.T.、手雷、近战，以及用外星生物尸体制作装备。MMO 可以有更长的教程。"),
        test: pair("Ask whether the tutorial feels engaging, and listen for questions about what makes the game stand out.", "问玩家教程是否让人投入，并留意他们会不会追问这款游戏的特别之处。"),
        after: pair("The final tutorial runs four stages before the Star Map: the start, weapons, pet and grenade, crafting.", "最终版的教程在进入星图之前分为四段：开场、武器、宠物与手雷、制作。"),
      },
      {
        title: pair("The vision is cloudy", "愿景看不清"),
        why: pair("No real feedback: you never watch a reward land on your character.", "没有真正的反馈：你从来看不到奖励落到自己的角色身上。"),
        fix: pair("Show progression plainly: what you earned, what it unlocks, where it leads.", "把成长清楚地摆出来：你得到了什么、它解锁了什么、它通往哪里。"),
        test: pair("Add a mission-reward screen; ask about reward frequency, levelling pace and the level cap, set at 30.", "加一个任务奖励界面；询问奖励频率、升级节奏，以及定在 30 级的等级上限。"),
        after: pair("A result screen and a level-up card went into the prototype.", "原型里加上了结算界面和升级卡片。"),
      },
    ],
    testers: {
      title: "Five testers, in their own words",
      corner: "Question",
      labels: ["T1", "T2", "T3", "T4", "T5"],
      rows: [
        {
          q: pair("Most interesting part of making a character", "创建角色时最有意思的部分"),
          answers: [
            pair("Background plus species, like building a story", "背景加种族，像在搭一个故事"),
            pair("Stats that specialise with the background", "随背景而专精的属性"),
            pair("Nothing; doesn’t care about background", "没有；不在乎背景"),
            pair("The plus-and-minus trade-offs", "加减之间的取舍"),
            pair("One build touching combat, exploring and crafting", "一个构筑同时影响战斗、探索和制作"),
          ],
        },
        {
          q: pair("How confusing were the stats?", "属性有多难懂？"),
          answers: [
            pair("Very: what is Resolve versus Charm?", "非常难懂：意志和魅力有什么区别？"),
            pair("Moderately: Agility, Marksman and Strength overlap", "中等：敏捷、枪法和力量互相重叠"),
            pair("Very, and worrying for PvP fairness", "非常难懂，还担心 PvP 不公平"),
            pair("Fine as ideas, badly presented", "概念没问题，呈现得不好"),
            pair("Overwhelming, but interesting", "信息过载，但有意思"),
          ],
        },
        {
          q: pair("Most interesting stat", "最有意思的属性"),
          answers: [
            pair("Biology: healing and toxins", "生物学：治疗与毒素"),
            pair("Hack: play beyond combat", "骇入：战斗之外的玩法"),
            pair("Agility: aiming speed for PvP", "敏捷：PvP 需要的开镜速度"),
            pair("Perception: weak points and traps", "感知：弱点与陷阱"),
            pair("Tech: armour plus the companion", "科技：护甲加上伙伴"),
          ],
        },
        {
          q: pair("Least interesting stat", "最无趣的属性"),
          answers: [
            pair("Physics: too narrow", "物理：太窄"),
            pair("Speech: not for a shooter", "口才：不属于射击游戏"),
            pair("Speech: irrelevant", "口才：无关紧要"),
            pair("Chemistry: too broad", "化学：太宽"),
            pair("Strength: generic", "力量：太普通"),
          ],
        },
        {
          q: pair("The game’s goal, in their words", "他们眼中的游戏目标"),
          answers: [
            pair("Planets, kill, loot, upgrade", "星球、击杀、拾取、升级"),
            pair("Hunt, extract, craft, repeat", "狩猎、撤离、制作、重复"),
            pair("Farm PvE to dominate PvP", "刷 PvE，为了称霸 PvP"),
            pair("Optimise, master, clear hunts faster", "优化、精通、更快清完狩猎"),
            pair("Hunt, gather, craft, with friends", "狩猎、采集、制作，和朋友一起"),
          ],
        },
        {
          q: pair("What they would buy", "会买什么"),
          answers: [
            pair("Skins for the C.A.T.", "机械猫 C.A.T. 的皮肤"),
            pair("Armour transmogs", "护甲幻化"),
            pair("Clean weapon skins", "干净的武器皮肤"),
            pair("Nothing; would rather earn it", "什么都不买，宁愿自己挣"),
            pair("Home and decor", "家园与装饰"),
          ],
        },
      ],
    },
    note: pair(
      "Four of the five answers to “what would you buy?” are tabs in the final store: C.A.T., armour skins, weapon skins and decor. The fifth tester would rather earn everything.",
      "五个人对“你会买什么”的回答里，有四个成了最终商店的标签页：C.A.T.、护甲皮肤、武器皮肤、装饰。第五个人宁愿什么都自己挣。",
    ),
  },
  {
    kind: "sbh-video",
    title: "The Prototype, Start to Finish",
    intro: pair(
      "The whole recording of the clickable Figma prototype, uncut. It follows a first-time player from the title screen through character creation and the tutorial to the Star Map, the guild hall, an upgrade, the Halloween event and crafting.",
      "可点击 Figma 原型的完整录屏，没有剪辑。它跟着一名第一次玩的玩家，从标题画面、角色创建和新手教程，一路走到星图、公会大厅、一次升级、万圣节活动和制作。",
    ),
    video: "assets/videos/space-bounty-hunters.mp4",
    poster: "assets/sbh/recording-poster.jpg",
    label: "Recording · 4:34",
    caption: pair("Recorded from our Figma prototype and uploaded on 4/23, the day of the final hand-in.", "从我们的 Figma 原型录制，4/23 上传，也就是最终提交那天。"),
    chaptersLabel: "Chapters",
    chapters: [
      { t: 0, en: "Title", zh: "标题画面" },
      { t: 8, en: "Background", zh: "背景" },
      { t: 30, en: "Species and stats", zh: "种族与属性" },
      { t: 60, en: "Appearance", zh: "外观" },
      { t: 66, en: "Prologue and tutorial", zh: "序章与教程" },
      { t: 119, en: "The C.A.T.", zh: "机械猫 C.A.T." },
      { t: 138, en: "Star Map", zh: "星图" },
      { t: 164, en: "Guild hall", zh: "公会大厅" },
      { t: 195, en: "Activities and PvP", zh: "活动与 PvP" },
      { t: 205, en: "Weapon upgrade", zh: "武器升级" },
      { t: 227, en: "Headless Hunts", zh: "无头狩猎" },
      { t: 242, en: "Crafting", zh: "制作" },
    ],
  },
  {
    kind: "sbh-screens",
    title: "Sixteen Screens From the Prototype",
    intro: pair(
      "Exported from our Figma file in the order a first-time player meets them. Select a screen to see it full size.",
      "从我们的 Figma 文件导出，按第一次玩的玩家遇到它们的顺序排列。点击任意画面可以查看原尺寸。",
    ),
    columns: 4,
    groups: [
      {
        label: "Character creation",
        screens: [
          screen("cc-background", "Background", "Background selection: the Wrecking Ball emblem beside the Technician, Shadow, Deceiver, Scientist and Wild Cards"),
          screen("cc-species", "Species", "Species selection: two human silhouettes on a platform, the species tabs and the player stats list"),
          screen("cc-appearance", "Appearance", "Appearance: a grid of face and nose options beside a character silhouette"),
          screen("cc-finalise", "Finalise", "Finalise: the Scientist emblem, the finalized stat bars and a name field beside the finished character"),
        ],
      },
      {
        label: "Tutorial",
        screens: [
          screen("tutorial-grenade", "Grenade pickup", "Tutorial: an arrow points at a grenade on the ground while a red monster waits on the ridge"),
          screen("tutorial-pet-command", "Commanding the C.A.T.", "Tutorial: the pet command wheel with Attack, Defend, Follow, Summon and Status around the cat"),
          screen("tutorial-cat", "Your C.A.T.", "The C.A.T. screen: the robot cat's status, abilities and upgrade bars"),
        ],
      },
      { label: "Star Map", screens: [screen("star-map", "Star Map", "Star Map: planets on orbit lines with level tags and a list of destinations and danger ratings")] },
      {
        label: "Guild and PvP",
        screens: [
          screen("guild-hall", "Guild hall", "Guild hall in first person, with Members, Events, Building and Shop buttons"),
          screen("pvp", "PvP event", "PvP combat: a featured PvP event with rewards and entry requirements"),
        ],
      },
      {
        label: "Gear",
        screens: [
          screen("weapon-upgrade", "Weapon upgrade", "Upgrade Your Weapon: the Big Gun at level 1 with locked slots and an upgrade price of 500 ₿"),
          screen("crafting", "Crafting panel", "Crafting panel: recipes for armour, modules and materials with the resources each one needs"),
        ],
      },
      { label: "Live ops", screens: [screen("headless-hunts", "Headless Hunts", "Redemption, the Headless Hunts event screen: event overview, clue collection and trophy drops")] },
      {
        label: "Store",
        screens: [
          screen("store", "Store", "Store: tabs for weapon skins, armour skins, decor, the C.A.T., other items and the battle pass"),
          screen("battle-pass", "Battle pass", "Battle pass: Season 3, 60 tiers, a free and a premium reward track"),
          screen("premium-currency", "Premium currency", "Premium currency: three ₿ packs at $4.99, $9.99 and $19.99, stated as cosmetic only"),
        ],
      },
    ],
    note: pair(
      "Some March copy survived on screen: the Scientist card lists the Wrecking Ball’s bonuses, and the allocation screen in the recording still calls the twelfth stat Speech.",
      "有些三月的文字留在了界面上：科学家的卡片写着破坏球的加成，录屏里的属性分配界面也仍然把第十二项属性叫作口才。",
    ),
  },
  {
    kind: "sbh-economy",
    title: "₿, Seven Raw Materials, Thirty Guns",
    intro: pair(
      "The Week 4 brief said to make sure the game has a currency and that the currency has a name. Ours had three: Credits in March, Bits on the loop slide and the stat screen, and Bitcoin, ₿, in the GDD, the sheet and the store. What held still was the split. ₿ comes from bounties, challenges, events and leaderboards and goes into gear; materials come off the planets and whatever lives on them. Repeat clears pay less ₿ but the same materials, so farming one monster stays worth it.",
      "第 4 周的作业要求：游戏里要有货币，而且货币要有名字。我们的货币有过三个名字：三月叫 Credits，在循环页和属性界面里叫 Bits，在 GDD、数据表和商店里叫 Bitcoin，也就是 ₿。一直没变的是分工：₿ 来自悬赏、挑战、活动和排行榜，花在装备上；材料来自星球和星球上的生物。重复通关给的 ₿ 会变少，材料却一样多，所以反复刷同一只怪物依然值得。",
    ),
    currency: {
      title: "₿ in and out, on the GDD’s own scale",
      scale: ["Small", "Medium", "Large", "Huge"],
      sourcesLabel: "Sources",
      sinksLabel: "Sinks",
      sources: [
        { name: "Bounty hunts", zh: "悬赏狩猎", from: "Medium", to: "Huge", detail: "Medium on repeats, Huge on a first clear" },
        { name: "Collection challenges", zh: "收集挑战", from: "Small", to: "Huge" },
        { name: "Event rewards", zh: "活动奖励", from: "Large", to: "Large" },
        { name: "Weekly leaderboard", zh: "每周排行榜", from: "Medium", to: "Huge" },
      ],
      sinks: [
        { name: "Upgrading gear", zh: "升级装备", from: "Large", to: "Large" },
        { name: "Buying gear", zh: "购买装备", from: "Small", to: "Large" },
      ],
      note: pair("The GDD sizes each flow in words, not numbers; turning the words into prices is still to do.", "GDD 只用文字描述每一项的大小，没有数字；把这些文字变成价格，还没有做。"),
    },
    chain: {
      title: "Where each material comes from, and what uses it",
      head: ["Found at", "Raw", "Refined into", "Used by"],
      idleLabel: "no gun yet",
      rows: [
        { where: pair("Metal pools", "金属池"), raw: "Metaloid", rawZh: "类金属", out: [{ how: "refine", name: "Liquid Metals", zh: "液态金属", uses: "Auto 05" }] },
        { where: pair("Ore deposits", "矿床"), raw: "Metallic Ore", rawZh: "金属矿石", out: [{ how: "refine", name: "Metal Plating", zh: "金属镀板", uses: "24 guns, tiers 01–04" }] },
        { where: pair("Trash piles", "垃圾堆"), raw: "Plastics", rawZh: "塑料", out: [{ how: "refine", name: "Carbon Fiber", zh: "碳纤维", uses: null }] },
        {
          where: pair("Flora", "植物"), raw: "Xylem", rawZh: "木质部",
          out: [
            { how: "refine", name: "Timber", zh: "木材", uses: "Shotgun 05" },
            { how: "grow in a lab", name: "Fungal Spores", zh: "真菌孢子", uses: "Rocket 05" },
          ],
        },
        { where: pair("Alien and animal bodies", "外星生物与动物尸体"), raw: "Biomass", rawZh: "生物质", out: [{ how: "grow in a lab", name: "Bio Spores", zh: "生物孢子", uses: "Pistols 05, Sniper 05" }] },
        { where: pair("Ore deposits", "矿床"), raw: "Mineral Geode", rawZh: "矿物晶洞", out: [{ how: "crack, by chance", name: "Calcium · Granite · Silver · Titanium", zh: "钙 · 花岗岩 · 银 · 钛", uses: null }] },
        { where: pair("Robotic or heavy aliens", "机械或重甲外星生物"), raw: "Heavy Metal", rawZh: "重金属", out: [{ how: "refine", name: "Irridium", zh: "铱", uses: "Burst 05" }] },
      ],
      note: pair(
        "Six of the eleven refined materials have a gun waiting for them. Carbon Fiber and the four geode rewards don’t yet: in the sheet they are made, never spent.",
        "十一种精炼材料里，有六种已经有枪在等着。碳纤维和四种晶洞奖励还没有：在数据表里，它们只被制造出来，却从来没有被花掉。",
      ),
    },
    arsenal: {
      title: "Damage per second, all thirty guns",
      max: 1000,
      ticks: [0, 250, 500, 750, 1000],
      classes: arsenalClasses,
      note: pair(
        "Inside a class, guns trade fire rate for damage and land in the same band: primaries near 200, specials between 336 and 576, the rocket at 800. Three rows break the pattern. Burst 05, at 990, deals roughly four times what its siblings do; the pistols and rockets are five copies of one row; and past Sniper 01 the snipers get weaker, not stronger.",
        "同一类枪之间，用射速换伤害，最后落在同一个区间：主武器在 200 左右，特殊武器在 336 到 576 之间，火箭筒是 800。有三处打破了这个规律：点射步枪 05 是 990，大约是同类的四倍；手枪和火箭筒是同一行复制了五次；狙击步枪过了 01 之后，反而越来越弱。",
      ),
    },
  },
  {
    kind: "sbh-progression",
    title: "Thirty Levels and the Grind",
    intro: pair(
      "Week 4 taught the level curve and rarity side by side, with a warning: a 10% drop chance doesn’t mean the item shows up on the tenth try. Our sheet turns the curve into EXP and the grind into hours.",
      "第 4 周把等级曲线和稀有度放在一起讲，还特别提醒：10% 的掉率，不代表第十次一定会掉。我们的数据表把等级曲线变成经验值，也把“刷”变成了小时。",
    ),
    levels: {
      title: "EXP needed to reach each level",
      max: 1300000,
      exp: [800, 1500, 2200, 3000, 4000, 5200, 6600, 8000, 10000, 12500, 16000, 20000, 25000, 32000, 40000, 50000, 62000, 75000, 90000, 108000, 130000, 155000, 187000, 222000, 260000, 310000, 400000, 550000, 800000, 1300000],
      gridlines: [250000, 500000, 750000, 1000000, 1250000],
      labels: [10, 20, 25, 28, 30],
      short: { 10: "12.5k", 20: "108k", 25: "260k", 28: "550k", 30: "1.3M" },
      wallFrom: 27,
      brackets: [
        { from: 1, to: 20, value: "11.7%", en: "of all EXP buys levels 1–20", zh: "的总经验值换来 1–20 级" },
        { from: 27, to: 30, value: "62.4%", en: "goes on levels 27–30", zh: "花在 27–30 级" },
      ],
      levelKey: "Level",
      spKey: "Skill points gained",
      note: pair(
        "Every level also gives one attribute point. Skill points come two at a time and five on every fifth level, 78 by level 30. The sheet never says how much EXP a hunt pays, so these bars can’t yet be turned into hours.",
        "每升一级还会得到一点属性点。技能点每级两点，每五级五点，到 30 级一共 78 点。数据表没有写一次狩猎给多少经验值，所以这些柱子还无法换算成小时。",
      ),
    },
    chain: {
      title: "One rare item in the base game, worked out",
      steps: [
        { value: "25 min", en: "per hunt", zh: "每次狩猎" },
        { op: "÷", value: "70% × 10%", en: "success × drop chance", zh: "成功率 × 掉率" },
        { op: "=", value: "6 h", en: "per rare drop, rounded up", zh: "每个稀有掉落，向上取整" },
        { op: "× 2", value: "12 h", en: "per crafted item", zh: "每件制作物品" },
        { op: "× 8", value: "96 h", en: "every rare item from one monster", zh: "一只怪物的全部稀有物品" },
        { op: "× 20", value: "1,920 h", en: "every rare item in the base game", zh: "基础游戏的全部稀有物品" },
        { op: "× 50%", value: "960 h", en: "the half a typical player wants", zh: "普通玩家想要的那一半", result: true },
      ],
    },
    releases: {
      title: "Hours of rare items, by release",
      max: 2400,
      ticks: [0, 600, 1200, 1800, 2400],
      allLabel: "every rare item",
      wantLabel: "what a typical player wants",
      sheetLabel: "the sheet’s figure, where it differs",
      rows: [
        { name: "Base game", zh: "基础游戏", all: 1920, wanted: 960, monsters: "20 monsters" },
        { name: "Hard Planets", zh: "困难星球", all: 360, wanted: 252, sheet: 2280, sheetNote: "sheet: 2,280 h" },
        { name: "Monster Invasion", zh: "怪物入侵", all: 864, wanted: 345.6, monsters: "12 monsters" },
        { name: "Dungeon Bosses", zh: "地牢首领", all: 1680, wanted: 1428, monsters: "5 monsters" },
        { name: "Android Aliens Return", zh: "仿生外星人归来", all: 800, wanted: 320, monsters: "10 monsters" },
      ],
      note: pair(
        "The sheet’s Hard Planets row adds the base game’s 1,920 hours a second time, so its running total ends at 7,544. Counted once, year one holds 5,624 hours of rare items, 3,306 of them the kind a typical player wants. The base game’s 960 alone is 40 days without sleep, or about sixteen months at two hours a night.",
        "数据表里“困难星球”那一行，把基础游戏的 1,920 小时又加了一遍，所以累计总数停在 7,544。只算一次的话，第一年一共有 5,624 小时的稀有物品，其中普通玩家想要的是 3,306 小时。光是基础游戏的 960 小时，就等于不眠不休 40 天，或者每晚玩两小时、玩上大约十六个月。",
      ),
    },
  },
  {
    kind: "sbh-calendar",
    title: "Year One, Week by Week",
    intro: pair(
      "Week 5 opened with “design for the certainty of live ops”: events have to keep coming, so build their frameworks up front. Our year starts in April and resets every Thursday. A DLC lands on the first reset of each quarter, thirteen weeks apart, and Halloween gets the one event we designed in full.",
      "第 5 周的第一句是“为长线运营的必然性而设计”：活动必须源源不断，所以框架要提前搭好。我们的一年从四月开始，每周四重置。每个季度的第一次重置都会上线一个 DLC，间隔十三周；万圣节则拿到了我们唯一完整设计过的活动。",
    ),
    ranges: weekRanges,
    special: [
      { week: 14, type: "dlc", label: "Hard Planets DLC release" },
      { week: 27, type: "dlc", label: "Monster Invasion DLC release" },
      { week: 28, type: "event", label: "Headless Hunts begins on the Thursday reset" },
      { week: 29, type: "event", label: "Headless Hunts" },
      { week: 30, type: "event", label: "Headless Hunts" },
      { week: 31, type: "event", label: "Headless Hunts final boss kill weekend, Thursday to Sunday" },
      { week: 39, type: "holiday", label: "Christmas Eve and Christmas, marked with no event" },
      { week: 40, type: "dlc", label: "Dungeon Bosses DLC release" },
      { week: 53, type: "dlc", label: "Androids Strike Back DLC release, year two" },
    ],
    quarters: [
      { from: 1, to: 13, label: "Y1 Q1" },
      { from: 14, to: 26, label: "Y1 Q2" },
      { from: 27, to: 39, label: "Y1 Q3" },
      { from: 40, to: 52, label: "Y1 Q4" },
      { from: 53, to: 53, label: "Y2" },
    ],
    months: [
      { from: 1, span: 5, label: "Apr" }, { from: 6, span: 4, label: "May" }, { from: 10, span: 4, label: "Jun" },
      { from: 14, span: 5, label: "Jul" }, { from: 19, span: 4, label: "Aug" }, { from: 23, span: 5, label: "Sep" },
      { from: 28, span: 4, label: "Oct" }, { from: 32, span: 4, label: "Nov" }, { from: 36, span: 4, label: "Dec" },
      { from: 40, span: 5, label: "Jan" }, { from: 45, span: 4, label: "Feb" }, { from: 49, span: 4, label: "Mar" },
      { from: 53, span: 1, label: "Apr" },
    ],
    labels: [
      { week: 14, lane: "above", type: "dlc", text: "Hard Planets" },
      { week: 27, lane: "above", type: "dlc", text: "Monster Invasion" },
      { week: 40, lane: "above", type: "dlc", text: "Dungeon Bosses" },
      { week: 53, lane: "above", type: "dlc", text: "Androids Strike Back", align: "end" },
      { week: 28, span: 4, lane: "below", type: "event", text: "Headless Hunts · Oct 10 – Nov 3" },
      { week: 39, lane: "below", type: "holiday", text: "Christmas", align: "end" },
    ],
    legend: [
      { type: "dlc", label: "DLC release" },
      { type: "event", label: "Headless Hunts" },
      { type: "holiday", label: "Holiday, no event" },
      { type: "reset", label: "Weekly reset, every Thursday" },
    ],
    stripLabel: "Year one, 53 weeks",
    resetLabel: "Weekly reset on Thursday",
    tableLabel: "Every marked week",
    event: {
      key: "Event design",
      name: "Headless Hunts",
      items: [
        { title: "No crits", en: "The headless variants are immune to critical hits. For four weeks Critical Chance and Critical Damage stop paying, the two columns Agility, Stealth, Perception and Charm lean on.", zh: "无头变种对暴击免疫。整整四周，暴击率和暴击伤害不再起作用，而敏捷、潜行、感知和魅力正依赖这两列。" },
        { title: "Heads as trophies", en: "A kill can drop the monster’s head, to mount in your base or your house.", zh: "击杀有几率掉落怪物的头，可以挂在你的基地或家里。" },
        { title: "Clues", en: "Collect them all to learn who, or what, is behind the headless aliens. The event screen counts clues and trophy heads separately.", zh: "把线索集齐，就能知道是谁，或者是什么，在背后操纵这些无头外星生物。活动界面把线索和战利品头颅分开计数。" },
        { title: "Two sets of dates", en: "The sheet runs the event from Oct 10 to Nov 3; the banner in the prototype says Oct 23 to Nov 5. We never reconciled them.", zh: "数据表里活动是 10 月 10 日到 11 月 3 日；原型里的横幅写的是 10 月 23 日到 11 月 5 日。我们一直没有把两者对齐。" },
      ],
    },
  },
  {
    kind: "source-breakdown",
    source: "Slides · GDD · Pitch",
    title: "The Service Around the Hunt",
    lead: pair(
      "Game as Service is about what keeps players coming back after launch. Most of our answers were social; the rest were money and time.",
      "Game as Service 这门课关心的是：上线之后，是什么让玩家一次次回来。我们的答案大多是社交，剩下的是钱和时间。",
    ),
    blocks: [
      { title: "Guild halls", en: "Resources trade freely inside a guild and cost a Credit fee outside it. Members pour materials into a bigger hall, more seats and crafting stations, then decorate it together: a reason to log in for someone else.", zh: "公会内部可以自由交易资源，跨公会交易则要付 Credit 手续费。成员把材料投进更大的大厅、更多的席位和制作台，再一起装饰：这是为别人登录游戏的理由。" },
      { title: "Raids and faction wars", en: "Four-player dungeons and raids of eight or more, built around tank, damage and support. Two player factions fight over resource-rich planets and have to keep defending them. Raids refresh weekly, dungeons daily.", zh: "四人地牢和八人以上的团队副本，围绕坦克、输出和辅助来设计。两个玩家阵营争夺资源丰富的星球，还得一直守住它们。团队副本每周刷新，地牢每天刷新。" },
      { title: "The trading hub", en: "A Galactic Trading Hub with vendors, crafting stations, hunter-to-hunter trade and the hunt boards. High-level players can craft for new ones there, and rare gear is on show: the metagame, taught by looking.", zh: "银河交易中心里有商人、制作台、猎人之间的交易，以及悬赏板。高等级玩家可以在那里替新手制作装备，稀有装备也在那里被人看见：元游戏，看着就能学会。" },
      { title: "Teaching the chase", en: "A monster codex lists every drop and its odds, so a player can plan a farm. Leaderboards and group dungeons put the winning builds on display as the next target.", zh: "怪物图鉴列出每一种掉落和它的概率，玩家可以据此规划要刷什么。排行榜和组队地牢把最强的构筑展示出来，成为下一个追逐的目标。" },
      { title: "Money", en: "Free to play and cosmetic only, a rule the premium-currency screen states outright. Packs sell 500 ₿ for $4.99, 1,300 for $9.99 and 2,800 for $19.99, and the season pass costs 1,200, so the $9.99 pack is the smallest single purchase that covers it. Week 5 asked of every offer whether it was ethical; that pairing is the one I would put to the question first.", zh: "免费游玩、只卖外观，高级货币界面上把这条规则写得清清楚楚。礼包是 4.99 美元 500 ₿、9.99 美元 1,300、19.99 美元 2,800；赛季通行证要 1,200，所以 9.99 美元的礼包，是能单次买够的最小一档。第 5 周对每一种优惠都问过：这样设计合乎道德吗？如果要追问，我会先问这一组搭配。" },
      { title: "A team and a date", en: "The pitch staffs three designers, eight in tech, six in art and one in audio, with 70% on the game and its DLC and 30% on live ops, and cites Warframe’s 200 million a year as the free-to-play comparison. First playable April 2029, alpha December 2029, open beta September 2030, launch March 2031.", zh: "提案里配置了三名设计、八名技术、六名美术和一名音频，70% 的人力做本体和 DLC，30% 做长线运营，并以 Warframe 每年两亿的收入作为免费游戏的参照。2029 年 4 月出第一个可玩版本，2029 年 12 月 Alpha，2030 年 9 月公开测试，2031 年 3 月上线。" },
    ],
  },
  {
    kind: "system-grid",
    title: "What We Left Open",
    items: [
      ["NAMES", "One currency went by Credits, Bits and Bitcoin, and the premium one by Premium, Crystals and Gems. The twelfth stat is Speech on screen and Charm in the sheet, and the Android is a Robot in the sheet.", "一种货币叫过 Credits、Bits 和 Bitcoin，高级货币也叫过 Premium、Crystals 和 Gems。第十二项属性在界面上叫口才，在数据表里叫魅力；仿生人在数据表里叫 Robot。"],
      ["PLACEHOLDERS", "The pistols and rockets are five copies of one row. Every gun has a 30-round magazine and 50 for reload, stability and handling. The monster table names 3 of its 8 slots, and the ten planets outside Sol share one default climate.", "手枪和火箭筒是同一行复制了五次。每把枪都是 30 发弹匣，装填、稳定和操控都是 50。怪物表的 8 个位置只写了 3 个名字，太阳系以外的十颗星球共用同一套默认气候。"],
      ["ONE DOUBLE COUNT", "The Hard Planets row adds the base game a second time, which puts the running total 1,920 hours too high.", "“困难星球”那一行把基础游戏又加了一遍，让累计总数多出了 1,920 小时。"],
      ["NO BRIDGE", "Nothing says how much EXP a hunt pays, so the level curve and the grind can’t yet be read against each other.", "没有任何地方写一次狩猎给多少经验值，所以等级曲线和刷取时长，目前还无法对照着读。"],
      ["BALANCE", "Weighted S = 4 to C = 1, Hack carries 26 points of effect and Agility 6. Nothing scales Damage to Monsters, and Burst 05 deals 990 DPS in a class that otherwise tops out at 257.", "按 S 记 4、C 记 1 计算，骇入带来 26 点影响，敏捷只有 6。没有任何属性提升“对怪物伤害”，点射步枪 05 的每秒伤害是 990，而同类其他枪最高只有 257。"],
      ["HOLIDAYS", "The GDD promises Halloween, Christmas and New Year events. Only Halloween was designed; Christmas is a note on the calendar.", "GDD 承诺了万圣节、圣诞节和新年活动。真正设计出来的只有万圣节；圣诞节只是日历上的一个标记。"],
    ],
  },
  {
    kind: "source-breakdown",
    source: "Sources",
    title: "Paper Trail",
    lead: pair(
      "Everything on this page comes from these files. The numbers are re-derived by a script in the site’s reference folder, so any of them can be checked against the sheet.",
      "这一页的所有内容都来自下面这些文件。数字由网站 reference 文件夹里的脚本重新推导，每一个都能对照数据表核查。",
    ),
    blocks: [
      { title: "Course", en: "Game as Service, Spring 2026: the Week 1 deck (four projects, five learning outcomes, the eight-slide pitch), Week 4 (economy, attributes, level curve, rarity, metagame) and Week 5 (live ops, events, holidays, monetization, the GDD, the persona, the video).", zh: "2026 年春季 Game as Service：第 1 周的课件（四个项目、五个学习目标、八页提案），第 4 周（经济、属性、等级曲线、稀有度、元游戏），第 5 周（长线运营、活动、节日、商业化、GDD、用户画像、视频）。" },
      { title: "Decks", en: "MMORPG Slides (3/12), the Week 10 deck (3/27), Space Bounty Hunters_Pitch as PDF and PPTX (4/9), and the final Slides Space Bounty Hunters (4/16).", zh: "MMORPG Slides（3/12）、第 10 周的演示文稿（3/27）、Space Bounty Hunters_Pitch 的 PDF 与 PPTX（4/9），以及最终版 Slides Space Bounty Hunters（4/16）。" },
      { title: "Numbers", en: "Data Sheets Space Bounty Hunters, seven tabs, last edited 4/23, and my 3/18 download of it. The derivations live in reference/projects/space-bounty-hunter/sheet-derivations.py.", zh: "Data Sheets Space Bounty Hunters，七个分页，最后编辑于 4/23，以及我在 3/18 下载的那一份。推导脚本在 reference/projects/space-bounty-hunter/sheet-derivations.py。" },
      { title: "Design", en: "GDD Space Bounty Hunters (4/16 to 4/23) and our Figma file, page “Project 2: Space Bounty Hunters”: the screens, the player-journey flow chart and our sticky notes.", zh: "GDD Space Bounty Hunters（4/16 至 4/23），以及我们的 Figma 文件中“Project 2: Space Bounty Hunters”页面：界面、玩家旅程流程图和我们的便签。" },
      { title: "Playtest", en: "The ten Week 10 questions, the feedback slides, and Qualitative Playtest Summaries: five testers, seven questions each.", zh: "第 10 周的十个问题、反馈页，以及 Qualitative Playtest Summaries：五名测试者，每人七个问题。" },
      { title: "Recording and art", en: "SpaceBountyHunters.mov (4:34, uploaded 4/23) and my SpaceBountyHuntersDesign.ai with its SVG exports (3/18 to 3/19).", zh: "SpaceBountyHunters.mov（4 分 34 秒，4/23 上传），以及我的 SpaceBountyHuntersDesign.ai 和它导出的 SVG（3/18 至 3/19）。" },
    ],
  },
]

const summary = "A sci-fi FPS MMORPG for Game as Service: take a bounty, hunt the monster, carve it into gear, and keep the galaxy busy through a year of live ops."
const points = [
  "Game as Service, Spring 2026: weeks 7 to 14, with Kaine and Weiting.",
  "Design question: can the hunt itself be the progression, with builds deep enough to plan around?",
  "Current version: slides, a seven-tab data sheet, a GDD, a clickable Figma prototype and its 4:34 recording. It is a design, not a build.",
]
const access = "Designed with Kaine and Weiting for Game as Service, Spring 2026. The prototype link opens our Figma file at the title screen; the recording above plays the same flow."

export const sbhCaseStudies = {
  "/service-game-ui-2": {
    year: "2026 Spring",
    title: "Space Bounty Hunter",
    category: "MMORPG Design & UI Prototype",
    summary,
    heroImage: "assets/framer-live/service-game-ui-2026-b.png",
    heroAlt: "Space Bounty Hunter title screen: Year 4039, a tower rising over a planet under a ringed sky",
    points,
    sections: sbhSections,
    access,
    sourceLinks: [
      {
        label: "Open the Figma prototype ↗",
        href: "https://www.figma.com/proto/x2UXQnAzOO3RTxN8K6UFI7/Game-as-Sevice?page-id=841%3A964&node-id=1443-2754&starting-point-node-id=1443%3A2754&scaling=contain&content-scaling=fixed",
        external: true,
      },
    ],
  },
}

// Chinese for the hero summary, points and footer, which main.js renders through
// its copyTranslations table rather than as { en, zh } pairs.
export const sbhCopyTranslations = [
  [summary, "为 Game as Service 课程设计的科幻第一人称射击 MMORPG：接下悬赏，猎杀怪物，把它变成装备，再用一整年的长线运营让银河保持热闹。"],
  [points[0], "2026 年春季 Game as Service：第 7 到第 14 周，与 Kaine、Weiting 合作。"],
  [points[1], "设计问题：狩猎本身能不能就是成长，而且构筑深到值得提前规划？"],
  [points[2], "当前版本：演示文稿、七个分页的数据表、GDD、可点击的 Figma 原型，以及它的 4 分 34 秒录屏。这是一套设计，而不是做出来的游戏。"],
  [access, "2026 年春季与 Kaine、Weiting 为 Game as Service 课程设计。原型链接会从标题画面打开我们的 Figma 文件；上面的录屏播放的是同一条流程。"],
]
