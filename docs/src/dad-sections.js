// DAD — the drawer case study.
// Sources: the Week 11 system diagram (Figma xmD79sBtEvt0lfst75cMDz 447:58), the
// DAD UI Recreation board (0tCbAiVUlrPId3RWd9LRif 1914:8) which transcribes the
// serialized objects in Assets/Scenes/DAD.unity, and the shipped project itself
// (70 DAD*.cs scripts). Numbers here are the tuned values in the build, not
// intentions — where the diagram and the build disagree, the build wins and the
// difference is stated.

const ink = "var(--case-ink)"
const accent = "color-mix(in srgb, var(--case-accent, var(--case-ink)) 55%, transparent)"
const accentSoft = "color-mix(in srgb, var(--case-accent, var(--case-ink)) 28%, transparent)"

const angerDiagram = `
<svg viewBox="0 0 520 150" role="img" aria-label="DAD's anger runs zero to one hundred through four named bands and decays half a point per day">
  <g font-family="var(--type-subtitle-font)" font-size="9" letter-spacing="0.06em" fill="${ink}">
    <rect x="20" y="52" width="120" height="30" fill="none" stroke="${ink}" stroke-width="0.7"/>
    <rect x="140" y="52" width="120" height="30" fill="${accentSoft}" stroke="${ink}" stroke-width="0.7"/>
    <rect x="260" y="52" width="120" height="30" fill="${accent}" stroke="${ink}" stroke-width="0.7"/>
    <rect x="380" y="52" width="120" height="30" fill="${accent}" stroke="${ink}" stroke-width="0.7"/>
    <text x="80" y="71" text-anchor="middle">CALM</text>
    <text x="200" y="71" text-anchor="middle">AGITATED</text>
    <text x="320" y="71" text-anchor="middle">ANGRY</text>
    <text x="440" y="71" text-anchor="middle">FURIOUS</text>
    <text x="20" y="44">0</text><text x="140" y="44">25</text><text x="260" y="44">50</text>
    <text x="380" y="44">75</text><text x="500" y="44" text-anchor="end">100</text>
    <path d="M20 96 L500 96" stroke="${ink}" stroke-width="0.7"/>
    <text x="20" y="118">UNPAID BILLS AND UNCOLLECTED LOANS PUSH IT UP</text>
    <text x="20" y="132">IT FALLS 0.5 PER IN-GAME DAY ON ITS OWN</text>
  </g>
</svg>`

const clockDiagram = `
<svg viewBox="0 0 520 132" role="img" aria-label="One real second is one in-game day; thirty seconds is a month and twelve months is the whole run">
  <g font-family="var(--type-subtitle-font)" font-size="9" letter-spacing="0.06em" fill="${ink}">
    ${Array.from({ length: 12 }, (_, i) =>
      `<rect x="${20 + i * 40}" y="40" width="40" height="26" fill="${i === 10 || i === 11 ? accent : "none"}" stroke="${ink}" stroke-width="0.7"/>` +
      `<text x="${40 + i * 40}" y="57" text-anchor="middle" font-size="8">${i + 1}</text>`,
    ).join("")}
    <text x="20" y="32">EACH BLOCK — ONE MONTH — 30 SECONDS — ONE WAVE OF BILLS</text>
    <text x="20" y="88">1 SECOND = 1 DAY   ·   30 DAYS = 1 MONTH   ·   12 MONTHS = ONE RUN (6 MIN)</text>
    <text x="20" y="104">MONTH 10 — YOUR BIRTHDAY. MONTHS 11–12 — PHASE II.</text>
    <text x="20" y="120">THE CLOCK NEVER STOPS FOR A DECISION.</text>
  </g>
</svg>`

export const dadSections = [
  {
    kind: "copy-grid",
    left: {
      title: "Brief",
      en: "DAD is a survival game about a year of being helped. You run a grid, shoot coins at the bills chasing you, and buy the ground under your feet. Your father clears bills you cannot reach — and every time he does, he gets angrier, and the help goes on a tab you settle at the end of the year.",
      zh: "DAD 是一款关于「被帮助的一年」的生存游戏。你在格子地图上奔跑，朝追着你的帐单射出硬币，并买下脚下的土地。父亲会替你清掉你来不及处理的帐单——但他每帮一次就更愤怒一分，而这些帮助会记在一笔帐上，年底结算。",
    },
    right: {
      title: "Where it came from",
      en: "I wanted one resource to carry the whole thing, so money is the bullet, the rent, the health of the relationship, and the score. Spending it solves the problem in front of you and writes the next one.",
      zh: "我希望用单一资源撑起整部作品，所以金钱同时是子弹、是房租、是这段关系的健康度，也是分数。花掉它能解决眼前的问题，同时写下下一个问题。",
    },
  },
  {
    kind: "video",
    video: "assets/videos/dad-wave-teaser.mp4",
    poster: "assets/case-study/dad-gameplay.png",
    alt: "DAD first wave gameplay recording",
    label: "GAMEPLAY VIDEO / DADGOTMONEY.MOV / FULL RECORDING 0:08",
    caption: {
      en: "The first wave, uncut: cross the grid, collect coins, hold ground, and get ready for what the next month sends.",
      zh: "第一波：穿过格线、收集硬币、守住地面，并为下个月送来的东西做准备。",
    },
  },
  {
    kind: "system-grid",
    title: "Three Numbers You Watch",
    items: [
      ["DRIVE", "Your health. Bills, their bullets, and DAD's curses all take it down.", "你的生命值。帐单、帐单的子弹与父亲的咒骂都会扣减它。"],
      ["MONEY", "Your ammunition. Every shot costs a coin, so shooting and saving are the same decision.", "你的弹药。每次射击都要花掉一枚硬币，因此开火与存钱是同一个决定。"],
      ["TIME", "One second is a day. You cannot pause it, and it is the only resource nobody can give you.", "一秒即一天。它无法暂停，也是唯一没有人能给你的资源。"],
    ],
  },
  {
    kind: "spec-table",
    title: "What You Start With",
    intro: {
      en: "The diagram fixes the opening state, and the build keeps it. You begin with nothing to shoot and a full year in front of you.",
      zh: "图表订下了开局状态，实作也保持一致：你手上没有任何可以射出去的东西，面前是一整年。",
    },
    head: ["Value", "At start", "What moves it"],
    rows: [
      ["Money — AMMO", "0", "Work tasks, allowance coins on DAD's ground, loans shot out of DAD."],
      ["Drive — HP", "100", "Bill contact, bill bullets, and DAD's curses."],
      ["Time", "1 year", "Nothing. It only runs down."],
      ["DAD's anger", "0", "Bills that reach him, loans you never collect. Decays 0.5 a day."],
    ],
  },
  {
    kind: "diagram",
    title: "A Year in Six Minutes",
    label: "TIME SYSTEM",
    svg: clockDiagram,
    caption: {
      en: "The build runs one in-game day per real second, thirty days to a month, twelve months to a run — the scale I drew in my system diagram, shipped unchanged. Each month spawns a wave of bills, and month ten is the birthday the whole run is counting towards.",
      zh: "游戏以现实一秒对应游戏一天、三十天一个月、十二个月一局运作——这正是我在第 11 周图表中画下的比例，原封不动地实作了。每个月生成一波帐单，而第十个月就是整局一直在倒数的那个生日。",
    },
  },
  {
    kind: "spec-table",
    title: "The Calendar",
    intro: {
      en: "Twelve months, one wave of bills each. Two of them are marked in the diagram, and the game is built to arrive at them.",
      zh: "十二个月，每个月一波帐单。图表标出了其中两个月份，而整个游戏就是为了抵达它们而设计的。",
    },
    head: ["Month", "What it is", "In the diagram"],
    rows: [
      ["January", "Current wave. The month you learn on.", "Spawn this Month's Bill_Enemy List_January"],
      ["February \u2192 September", "Eight ordinary months. Bills, work, allowance, settle, repeat.", "Enemy List for the Month"],
      ["October \u2014 10th wave", "Your birthday. The run has been counting towards it since the first second.", "Birthday_October"],
      ["November \u2014 11th wave", "Adulthood. Phase II opens.", "Adulthood_Phase II_November"],
      ["December \u2014 12th wave", "The last month, and the boss fight.", "Adulthood_Phase II_December"],
    ],
    note: {
      en: "The diagram planned to double Phase II months to sixty seconds each, for a 450-second run. The build never did \u2014 every month is thirty seconds, so a run is six minutes and the last act arrives faster than I designed it to.",
      zh: "图表原本计划把第二阶段的月份加倍为六十秒，全局 450 秒。实作并未如此\u2014\u2014每个月都是三十秒，因此一局是六分钟，最后一幕比我设计时来得更快。",
    },
  },
  {
    kind: "flow",
    title: "How a Run Moves",
    steps: [
      ["PREPARE", "“Prepare for the first wave!” — the board is quiet and you learn the ground.", "「Prepare for the first wave!」——棋盘安静，你先熟悉地形。"],
      ["PHASE I", "“YOU + DAD VS. THE BILLS.” He is on your side, and you are counting waves.", "「YOU + DAD VS. THE BILLS」。他站在你这边，你数着波次。"],
      ["TRANSITION", "“THINGS ARE CHANGING.” Five seconds of fade, and the tiles begin to turn.", "「THINGS ARE CHANGING」。五秒淡出，地块开始翻面。"],
      ["PHASE II", "“YOU VS. DAD.” The boss health row appears, and the help becomes the fight.", "「YOU VS. DAD」。头目血条出现，先前的帮助变成了这场战斗。"],
    ],
  },
  {
    kind: "callout",
    kicker: "Storytelling",
    title: "Two Lines Carry the Whole Thing",
    en: "The HUD says “YOU + DAD VS. THE BILLS”, and later it says “YOU VS. DAD”. I never wrote the premise down anywhere else in the game; those two strings do it in eight words. Everything else I built — the loan meter, the tiles that flip, the anger bar — is there to make the second line land.",
    zh: "HUD 先写「YOU + DAD VS. THE BILLS」，之后写「YOU VS. DAD」。游戏里没有任何其他地方陈述这个前提；这两行字用八个词说完，而其余一切——贷款计量、会翻面的地块、愤怒条——都是为了让第二行成立。",
  },
  {
    kind: "spec-table",
    kicker: "Design intent",
    title: "Where Money Comes From",
    intro: {
      en: "I split income three ways because receiving money should not always mean the same thing. What you take decides which pressure comes back.",
      zh: "我把收入拆成三种，因为拿到钱不该永远代表同一件事。你拿的是哪一种，决定了之后回来的是哪一种压力。",
    },
    head: ["Source", "What you do", "What it costs later", "Why it is there"],
    rows: [
      ["Work", "Reach the briefcase and finish the task before the money lands.", "Nothing — but it costs the seconds you spent standing still.", "So earning money feels like giving up time."],
      ["Allowance", "Walk over the coins DAD drops in his own territory.", "Nothing, if you pick them all up before the month ends.", "So help arrives whether you asked for it or not."],
      ["Loan", "Shoot DAD when you are out of ammunition and take what he gives.", "It is tracked separately and comes back as boss health in Phase II.", "So borrowing is easy in the moment and expensive in December."],
    ],
    note: {
      en: "Coins you leave on the floor when the month rolls over stop being allowance and become loan. I wanted forgetting to collect to cost exactly what borrowing costs, because that is how it works.",
      zh: "月份翻页时仍留在地上的硬币，会从零用钱变成贷款。忘了捡，等同于借了。",
    },
  },
  {
    kind: "spec-table",
    title: "Shooting Costs Money",
    intro: {
      en: "There is no separate ammunition. The gun spends the wallet, so every shot is a small purchase and running dry is a budgeting failure rather than a combat one.",
      zh: "游戏没有独立的弹药。枪花的是钱包里的钱，所以每一发都是一笔小额支出，打光了是预算失误，而不是战斗失误。",
    },
    head: ["Rule", "Value", "Why"],
    rows: [
      ["Fire rate", "One shot every 0.5 s", "Fast enough to feel like a weapon, slow enough that you notice the spend."],
      ["Cost per shot", "1 gold", "The simplest possible exchange rate between violence and money."],
      ["Ammunition priority", "Your own money first", "Shooting anything ordinary drains the account you earned."],
      ["Shooting DAD", "Allowance first", "Money he gave you is what you fire back at him \u2014 and it is not counted against you later."],
      ["Work interval", "A task every 5 s", "Income is a QTE you must stand still for while the month keeps running."],
      ["Allowance drop", "A coin every 5 s on his ground", "Help arrives on its own, whether or not you asked."],
    ],
  },
  {
    kind: "callout",
    title: "What He Actually Says",
    en: "DAD fires a barrage of profanity on a timer, and each line that lands takes Drive off you. There are three: \u201cThat\u2019s MY FUXKing Money.\u201d \u201cI Put FOOD on the table.\u201d \u201cOnly BAD KIDS talk back.\u201d I wrote the damage model around them so the thing that hurts you most in Phase I is not an enemy at all \u2014 it is being spoken to.",
    zh: "父亲会定时发射一连串咒骂，每一句命中都会扣掉 Drive。总共三句：「That\u2019s MY FUXKing Money.」「I Put FOOD on the table.」「Only BAD KIDS talk back.」我把伤害模型建立在它们之上，好让第一阶段里最伤你的东西根本不是敌人\u2014\u2014而是被这样说话。",
  },
  {
    kind: "flow",
    title: "What Happens When the Month Turns",
    steps: [
      ["COINS", "Any allowance still on the floor becomes loan, and the converted coins are cleared.", "任何仍留在地上的零用钱会转为贷款，已转换的硬币随即清除。"],
      ["BILLS", "Any bill you did not pay or kill that month goes straight to DAD.", "当月没有付掉或击杀的帐单，会直接跑到父亲那里。"],
      ["ANGER", "His anger is recalculated from the loans and the unpaid bills that reached him, then pushed to the HUD.", "依据贷款与抵达他那里的未付帐单重算愤怒值，再送到 HUD 显示。"],
      ["NEXT LIST", "The next month's bill list is prepared and spawned.", "准备并生成下个月的帐单清单。"],
    ],
  },
  {
    kind: "diagram",
    title: "How Angry He Gets",
    label: "DAD ANGER STATE",
    svg: angerDiagram,
    caption: {
      en: "Anger runs 0–100 through four bands and drifts back down half a point per in-game day. Every bill you let reach him and every loan you leave uncollected pushes it up. I built it this way so that Phase II would never read as a scripted twist — by the time it arrives, it is simply the sum of a year of small conveniences you chose to accept.",
      zh: "愤怒值在 0–100 之间分四段，并以每游戏日 0.5 的速度自行回落。每一张让他碰到的帐单、每一笔没收走的贷款都会推高它——所以第二阶段并不是预设的剧情转折，而是一整年小小方便累积出来的总和。",
    },
  },
  {
    kind: "text",
    kicker: "Narrative design",
    title: "How Phase II Is Built Out of Phase I",
    paragraphs: [
      {
        en: "When the eleventh month arrives, DAD reads two numbers off the year you just played: how much loan you still carry, and how much anger you accumulated. Those two values generate his health bars. A loan that was never repaid is finalised \u2014 it stops being money you owe and becomes a segment of the boss you have to shoot through.",
        zh: "第十一个月到来时，父亲会从你刚玩完的这一年里读取两个数字：你还背着多少贷款，以及你累积了多少愤怒。这两个值生成他的血条。没有还掉的贷款会被定案\u2014\u2014它不再是你欠的钱，而变成你必须打穿的一段头目血量。",
      },
      {
        en: "At the same moment the map turns over. Every DAD-linked tile flips back to its original state, and only the ground you bought yourself is retained as beneficial. You can repay a loan at any point before that settlement; after it, the number is fixed and it is standing in front of you.",
        zh: "同一时刻地图翻面。所有与父亲连结的地块回到原始状态，只有你自己买下的土地保留为有利地形。在结算之前你随时可以偿还贷款；结算之后数字就定死了，而且正站在你面前。",
      },
      {
        en: "The diagram is explicit that the player should see this coming: subtitles run through Phase I showing DAD's impending state and the challenges it will bring. Getting blindsided is the one outcome the design was trying to avoid \u2014 and, as the playtests below show, the one it kept producing.",
        zh: "图表明确要求玩家应该预见这件事：第一阶段全程有字幕显示父亲即将进入的状态与随之而来的挑战。「被打个措手不及」是设计最想避免的结果\u2014\u2014而下方的测试记录显示，它恰恰一再发生。",
      },
    ],
  },
  {
    kind: "spec-table",
    title: "The Bills",
    intro: {
      en: "I shipped four kinds of bill, and made each one a different enemy — different movement, different way of reaching you — so that a month of debt never feels like one repeated problem.",
      zh: "游戏中实作了四种帐单，每一种都是有自己移动方式与接近手段的敌人。",
    },
    head: ["Bill", "Reads as", "Behaviour in play"],
    rows: [
      ["Power", "The one that keeps arriving", "Ordinary foot soldiers with fixed health and speed. They just walk at you."],
      ["Water", "The one that comes in waves", "Fires projectiles along a fixed direction; you shoot them apart before they land."],
      ["Subscription", "The one you forgot you had", "Recurs on its own schedule whether or not you dealt with the last one."],
      ["Tax", "The one your own spending creates", "The number and type spawned scale with how much money you have spent."],
    ],
    note: {
      en: "Tax is the rule I care most about: the more freely you spend to survive this month, the bigger the wave that spending buys you next month.",
      zh: "税是我最在意的一条规则：你这个月为了活下去花得越爽快，这笔花费为下个月买来的浪潮就越大。",
    },
  },
  {
    kind: "spec-table",
    title: "The Ground Is Not Neutral",
    intro: {
      en: "I gave every square four properties and had the HUD read them out as you stand on it — “HOME · FIRING ALLOWED · FAST GROUND”. I did not want territory to be decoration: where you stand should change what you are allowed to do.",
      zh: "每一格都带有四项属性，你站上去时 HUD 会直接读出来——「HOME · FIRING ALLOWED · FAST GROUND」。领地不是装饰，它决定你能做什么。",
    },
    head: ["Tile", "What it is", "Move speed", "Can shoot", "Spawns bills"],
    rows: [
      ["Home", "DAD's ground — the nine tiles you start inside.", "Fast", "Yes", "No"],
      ["My Place", "Ground you bought. It stays yours through the phase change.", "Fast", "Yes", "No"],
      ["Society", "The open board where work and bills happen.", "Normal", "Yes", "Yes"],
      ["Outside", "Beyond the grid — where work comes from.", "Normal", "Varies", "Yes"],
      ["Border", "The seam between them.", "Slow", "Varies", "Yes"],
    ],
    note: {
      en: "When Phase II starts I flip the DAD-linked tiles against you, and only the ground you paid for keeps its advantage. That is the argument of the whole game drawn as a map: independence is the part of the board you bought yourself.",
      zh: "进入第二阶段时，与父亲连结的地块会反过来对你不利，只有你自己付钱买下的地面保有优势。这就是整部作品的论点用地图说出来：独立，就是棋盘上你自己买下的那一块。",
    },
  },
  {
    kind: "text",
    kicker: "Playtest",
    title: "What Playtesters Could Not Read",
    paragraphs: [
      {
        en: "My playtest board records what testers said, and most of it is about legibility rather than difficulty. They did not know when DAD entered his second phase, or when he had become the enemy. They could not tell what the different floor tiles did. They ran out of ammunition without noticing, and once the enemies piled up they said the board looked like a mess. One tester summed up the failure exactly: they knew they had to act constantly, but not which action to take.",
        zh: "我的试玩记录板记下了测试者说的话，其中大部分关于“看不看得懂”，而不是难度。他们不知道 DAD 什么时候进入第二阶段，也不知道他什么时候变成了敌人；分不清不同地块有什么作用；子弹用光了也没察觉；敌人一多，他们就说画面乱成一团。有一位测试者把问题说得很准：他们知道自己必须一直行动，却不知道该做哪一个动作。",
      },
      {
        en: "One line went the other way. A tester said they loved paying bills with gold coins — the single moment where the metaphor and the mechanic were the same gesture. That is the part I am protecting while I fix the rest.",
        zh: "只有一句话是反方向的。一位测试者说他很喜欢用金币付帐单的感觉——那是隐喻与机制合为同一个动作的唯一时刻。修其他部分的时候，我要保住的就是这里。",
      },
    ],
  },
  {
    kind: "text",
    kicker: "Iteration",
    title: "Where the Build Drifted From the Plan",
    paragraphs: [
      {
        en: "My system diagram planned one set of pieces, and the game I shipped grew a different shape. The biggest change is one players never see directly: the money you earn, the money he gives you and the money you borrow are kept as three separate accounts, because each comes back at you differently at the end of the month and at the end of the year.",
        zh: "我的系统图规划的是一套结构，最后做出来的游戏长成了另一种样子。最大的改变玩家不会直接看到：你赚的钱、他给你的钱和你借的钱被记成三本不同的账，因为它们会在月底和年底以不同的方式找上你。",
      },
      {
        en: "The clock drifted too. The diagram gives the last act more room, doubling Phase II months to sixty seconds for a 450-second run; the build runs every month at thirty, so the finale moves as fast as January and the fight you spent a year building towards is over sooner than it should be. I only found that by reading the two side by side.",
        zh: "时钟也偏离了计划。系统图给最后一幕留了更多空间：第二阶段每个月加倍到六十秒，一局共 450 秒；而现在的版本每个月都是三十秒，于是结局和一月跑得一样快，你花一整年铺垫的那场对决结束得比它应有的更早。我是把两者并排对照时才发现这一点的。",
      },
      {
        en: "I kept the first, handmade HUD in the scene instead of deleting it, and rebuilt it in Figma as editable components beside the one players see now. It stays hidden in play; I keep it because the handmade version is the thing I am iterating away from, and I want to be able to see both.",
        zh: "我没有删掉最早那版手工做的 HUD，而是把它留在场景里，并在 Figma 中把它重建成可编辑的组件，放在玩家现在看到的界面旁边。游戏里它是隐藏的；我留着它，是因为那个手工版本正是我在迭代中要离开的东西，而我希望两者都看得见。",
      },
    ],
  },
  {
    kind: "callout",
    title: "Tuning It While Playing",
    en: "I tune every value on this page in the same session I play it, through an editor window I built with thirteen categories, from Player and Weapon through Economy and Flow. A game about money only feels fair once its economy has been felt at the controls, so I made changing a number as quick as noticing it was wrong.",
    zh: "这一页上的每个数值，我都是在试玩的同一轮里调整的，用的是我为这个项目做的一个编辑器窗口，从 Player、Weapon 一直到 Economy、Flow，共十三类。一个关于钱的游戏，只有在手上真正感受过它的经济，才知道公不公平，所以我让“改一个数”和“发现它不对”一样快。",
  },
]
