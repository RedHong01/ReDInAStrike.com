// Instrument: GDD text and embedded diagrams, five-tab GAS_MysteryOfInstruments
// sheet (read 2026-09-11), and exact-seek frames from the complete 836.961125s MOV.
// The private audit retains source ranges and version differences. No playtest,
// individual authorship of the sheet, or engine implementation is inferred.
import { instrumentChapters, instrumentRewardRows, instrumentLevelRows } from "./instrument-source-data.js"

const pair = (en, zh) => ({ en, zh })
const frame = (name, label, alt) => ({ image: `assets/instrument/screens/${name}.png`, name: label, alt })
const screens = (title, intro, groups, columns = 3) => ({ kind: "sbh-screens", title, intro, groups, columns })

export const instrumentOpening = {
  kind: "copy-grid",
  left: {
    title: "A Mechanical Inheritance",
    ...pair(
      "A father leaves behind an ancient mechanical instrument and a request to learn how to play it. The player investigates its parts, discovers music, and develops a collection of instruments. The GDD calls it a retro music-puzzle adventure. Its three pillars — music as machinery, assembly and customization, and intricacy — connect the mystery to what the player does.",
      "父亲留下了一件古老的机械乐器，也留下了希望你学会演奏它的愿望。玩家调查它的部件、发现曲目，并逐步培养自己的乐器收藏。GDD把它定义为复古音乐解谜冒险。音乐即机械、组装与定制、精密复杂，是连接这个秘密与玩家行动的三项设计支柱。",
    ),
  },
  right: {
    title: "The Player I Am Following",
    ...pair(
      "My focus here is the path from a first song to the next upgrade. The intended audience in the GDD is 18–35, interested in rhythm games, puzzles and music-making, with room for both short sessions and deeper mastery. The immediate question is smaller: after I finish a song, what have I earned, and what can I do with it?",
      "我在这里围绕玩家从第一首曲目走向下一次升级的路径来呈现设计。GDD设定的受众是18–35岁、对节奏游戏、解谜和音乐创作感兴趣的人，希望兼顾短时游玩与深入掌握。玩家眼前的问题更具体：演奏完这一首，我得到了什么，又能用它做什么？",
    ),
  },
}

export const instrumentBody = [
  {
    kind: "source-breakdown", title: "The Questions Behind the Loop", source: "Design notes · check list",
    lead: pair("The spreadsheet begins with questions about rewards and access. These are the connections the screens need to make visible.", "表格从回报与解锁的问题开始。界面需要让玩家看见的，正是这些关系。"),
    blocks: [
      { title: "After a song", ...pair("“What do you get after playing a song?” The reward sheet separates performance and difficulty; the prototype follows a score with coins and a level-completion reward.", "“打一首歌之后会得到什么？”奖励表把表现与难度分开考虑；原型把分数连接到金币与关卡完成奖励。") },
      { title: "After a puzzle", ...pair("The notes give puzzles a purpose: earn the resource that unlocks levels. The GDD's loop names it Gears and makes music sheets the next destination.", "笔记给解谜设定了产出：获得解锁关卡的资源。GDD的循环图把它命名为齿轮，并让曲目成为下一步目标。") },
      { title: "A new instrument, or a new class?", ...pair("The checklist distinguishes acquiring an instrument through a draw from unlocking a family through the main progression. The level sheet then places those family milestones along twenty levels.", "清单区分了两件事：通过抽取获得一件乐器，通过主线解锁一个乐器家族。关卡表再把家族里程碑安排进二十关的进度里。") },
    ],
  },
  {
    kind: "flow", title: "From One Song to the Next",
    steps: [
      ["01 · Prepare", "Choose a level and equip an instrument", "选择关卡，配置演奏乐器"],
      ["02 · Play", "Read the notes, then tap or swipe", "读懂音符，跟随提示点击或滑动"],
      ["03 · Receive", "See the score, reward and completed level", "查看分数、奖励与关卡完成状态"],
      ["04 · Develop", "Turn an instrument into materials for an upgrade", "把乐器转化成材料，继续培养"],
    ],
  },
  screens("Preparing, Playing, Receiving", pair(
    "The first journey moves from a locked-and-unlocked map into an instrument slot, then explains the rhythm interface. At the end, the result and the level tree show two kinds of progress: performance in this song and access to what follows.",
    "第一段路径从关卡图的可进入与锁定状态，走向乐器配置，再解释节奏界面。结束时，结算与关卡树呈现两种进度：这一首的演奏表现，以及接下来可以进入的内容。",
  ), [
    { label: "Prepare · 准备", screens: [frame("level-selection","01:30 · Choose a level","Prototype level tree with available and locked nodes"),frame("instrument-set","01:50 · Equip an instrument","Instrument set showing an empty slot and locked slots")] },
    { label: "Learn · 学习", screens: [frame("tap-tutorial","02:30 · Tap at the line","Tutorial telling the player when to press as a note reaches the line")] },
    { label: "Receive · 得到结果", screens: [frame("score-result","03:35 · Read the result","B grade, score 835044 and a 250 reward in the recorded prototype"),frame("level-completed","03:55 · A completed level","Level Completed and one Windup Key on the level tree"),frame("draw-results","04:17 · New instruments","Five instrument results including two duplicate guitars")] },
  ]),
  {
    kind: "copy-grid",
    left: { title: "Giving a Duplicate a Use", ...pair("The walkthrough makes two duplicate guitars the next decision. A tutorial points them out, asks the player to choose one, and opens a confirmation before decomposition. The result is five components. From there, another instrument becomes the upgrade target. Acquisition leads to a choice, and that choice leads back to development.", "录屏把两把重复吉他变成了接下来的选择。教程先指出它们，再引导玩家选择一把，并在分解前确认。结果是五个材料，随后另一件乐器成为升级对象。获得物品之后还有选择，而这个选择重新连接到培养。") },
    right: { title: "Cost Before Commitment", ...pair("The important information sits on both sides of the action. Before decomposition: which guitar will be consumed? After it: what did I receive? Before upgrading: what does it cost, and which attribute changes? I use these states to explain the design through a player's decision rather than through a list of inventory features.", "重要的信息分布在行动前后。分解之前：会消耗哪一把吉他？分解之后：得到了什么？升级之前：要花多少，哪项属性会改变？我用这些状态解释玩家怎样作决定，让库存功能落到具体的行动里。") },
  },
  screens("One Guitar, Four States", pair("Select, confirm, receive, compare. These four frames preserve the consequence of each action.", "选择、确认、得到材料、比较升级。这四个画面保留了每次行动的后果。"), [
    {label:"Choose & confirm · 选择与确认",screens:[frame("guitar-selected","04:45 · Select the guitar","Selected Guitar Level 1 in the inventory"),frame("decompose-confirm","05:00 · Confirm decomposition","No and Yes confirmation for decomposing the selected guitar")]},
    {label:"Receive & develop · 材料与培养",screens:[frame("decompose-result","05:07 · Receive five components","Decomposition result showing five components"),frame("upgrade-preview","05:27 · Compare the upgrade","Upgrade cost of 200 coins and one component with Intensity increasing by one")]},
  ],4),
  {
    kind: "instrument-rules", title: "What Progression Is Made Of",
    intro: pair("The spreadsheet turns the reward questions into two structures: a performance-and-difficulty matrix, and a twenty-level path that opens instrument families. These are planning values. The recording uses a different economy draft, so I keep the two versions distinct.", "表格把回报问题落实为两种结构：演奏表现与难度的奖励矩阵，以及逐步开放乐器家族的二十关路线。这些是规划数值。录像采用了不同的经济草案，因此这里保留两者的区别。"),
    rewardRows: instrumentRewardRows, levelRows: instrumentLevelRows,
    note: pair("Source: Rhythem game ending score and Node_Unlock_Progression. Coin rewards are a per-result table; gear values are each level's total node cost, not a cumulative total. No session length or tested balance is inferred from these numbers.", "来源：Rhythem game ending score与Node_Unlock_Progression。金币按单次结果列出，齿轮为各关所有节点的总成本，不是累计成本。这些数值不能直接推导实际游玩时长或已经验证的平衡。"),
  },
  {
    kind: "copy-grid",
    left: {title:"Two Drafts of the Same Decision",...pair("In the spreadsheet, destroying an instrument returns coins, and upgrade cost grows with level squared. In the GDD's economy diagram and the recorded tutorial, decomposition instead produces components and upgrading spends both coins and components. The relationship survives — an unwanted instrument can support a wanted one — but the resource and price need one consistent specification.", "在表格里，分解乐器返还金币，升级成本随等级平方增长。GDD经济图和录像教程则把分解产物设为材料，让升级同时消耗金币与材料。共同的关系仍然成立：不需要的乐器可以帮助培养想要的乐器；但资源与价格需要统一到一份规则里。")},
    right: {title:"What Changes After an Upgrade?",...pair("The recorded comparison changes Intensity from 2 to 3 while Tone, Range and Intonation stay the same. The success message says that all attributes went up. That mismatch leaves a precise next question: can the player identify the benefit of the resource they just spent? The next revision should align the message and the values, then test that reading.", "录像中的比较只把Intensity从2提高到3，Tone、Range与Intonation保持不变，成功提示却说所有属性都提高了。这留下了一个具体问题：玩家能否指出刚才花费资源得到的好处？下一版应先统一文字与数值，再测试玩家能否读懂这一变化。")},
  },
  {
    kind:"spec-table",title:"An Upgrade the Player Can Read",
    intro:pair("The values shown at 05:27 and the completed state at 05:43. The intended benefit should be visible before and after spending.","05:27的比较数值与05:43的完成状态。预期的好处应在花费资源前后都清楚可见。"),
    head:["Attribute / 属性","Before / 升级前","After / 升级后","Change / 变化"],
    rows:[["Tone", "3","3","—"],["Range","4","4","—"],["Intensity","2","3","+1"],["Intonation","2","2","—"]],
    note:pair("Shown cost: 200 coins + 1 component. This is the recorded prototype state, not a resolved formula for every instrument or level.","画面中的成本：200金币＋1材料。这是录制原型的状态，不代表所有乐器与等级都已采用统一公式。"),
  },
  {
    kind: "copy-grid",
    left: { title: "A Collection That Holds a Story", ...pair("Albums group songs into main, side and event collections. The instrument detail then gives development a narrative destination: a Lost Memory, with another memory locked until Level 65. This links the inherited instrument's mystery to the player's collection and growth, rather than leaving the premise only on a title screen.", "专辑把曲目分为主线、支线与活动收藏。乐器详情又为培养设置了叙事目标：一段Lost Memory，以及要到65级才解锁的下一段记忆。这使继承乐器的秘密与收藏、成长联系起来，故事前提因此可以继续出现在玩家的行动中。") },
    right: { title: "Reasons to Return", ...pair("Friends and borrowing offer another way to reach an instrument; the orchestra groups players around roles, contributions and weekly goals. Weekly challenges change which instrument families benefit. The seasonal event gathers login rewards, a draw, levels and a minigame into one place. These are different reasons to return to the collection, each represented in the interface prototype.", "好友与借用提供另一条接触乐器的路径；乐团以职位、贡献与每周目标组织玩家；周常挑战改变受益的乐器家族；节庆活动把签到、抽取、关卡和小游戏集中起来。它们为玩家回到收藏提供不同理由，原型分别呈现了这些入口与状态。") },
  },
  screens("Beyond the First Song",pair("Each system adds a different kind of next step: discover a memory, use another instrument, take part in a group goal, or finish an event task.","每个系统提供不同的下一步：发现记忆、使用另一件乐器、参与共同目标，或完成活动任务。"),[
    {label:"Discover · 发现",screens:[frame("instrument-memory","07:35 · Lost Memory","Instrument memory page and a memory locked until Level 65")]},
    {label:"Play together · 一起参与",screens:[frame("borrowed-instrument","08:35 · Borrowed","Friend instrument detail marked Borrowed"),frame("orchestra-goals","09:35 · Shared goals","Orchestra dashboard with weekly missions and contribution progress")]},
    {label:"Return · 回到游戏",screens:[frame("weekly-challenge","11:00 · Instrument modifiers","Weekly challenge showing bonus and reduced instrument families"),frame("event-hub","12:45 · Event hub","Seasonal event hub for daily login, draw, levels and a minigame"),frame("minigame-result","13:12 · Event reward","Seasonal minigame result with score 200 and ten red envelopes")]},
  ]),
  {
    kind: "sbh-video", title: "The Prototype, Start to Finish",
    intro: pair("The complete 13:57 recording, uncut. It follows the interface from investigating the mechanical instrument to the first rhythm tutorial, rewards, development, collections, social features and a seasonal event. Start at 1:30 for the first preparation-to-upgrade journey; use the chapters to inspect an individual task.", "13分57秒完整录像，没有剪短。从调查机械乐器，到首次节奏教程、奖励、培养、收藏、社交与节庆活动。想跟完第一次准备到升级的路径，可以从1:30开始；也可以通过章节直接查看具体任务。"),
    video: "assets/videos/mystery-of-instrument.mp4", poster: "assets/instrument/screens/recording-poster.jpg",label:"Prototype recording · 13:57",chaptersLabel:"Chapters · 章节",
    caption:pair("The recording shows prototype screens, transitions and result states. It is not a playtest or proof of a fully implemented game economy. Chapter times point to readable states within the original recording.", "录像展示原型界面、转场与结果状态，不是玩家测试，也不代表完整游戏经济已经实现。章节时间定位到原片中可读的状态。"),
    chapters:instrumentChapters,
  },
]

export const instrumentClosing = {
  kind:"callout",title:"What I Would Test Next",
  ...pair("Next I would put the missing half of the loop in front of players: a solved puzzle producing gears, and those gears unlocking a music sheet. Then I would ask them to explain an upgrade’s cost and benefit without a prompt, because an upgrade only feels earned when the player can say what it bought.","下一步，我会把循环中还缺的那一半交给玩家：解开谜题得到齿轮，再用齿轮解锁乐谱。然后请他们在没有提示的情况下，说出一次升级的代价和收益，因为只有玩家说得出这次升级换来了什么，它才会让人觉得是自己挣来的。"),
}

const summary="Restore an inherited mechanical instrument: uncover its music, play its songs, and turn each reward into the next step of a growing collection."
const points=[
  {label:"Design goal",en:"Make the link between a player’s action, its reward and the next goal readable at every step.",zh:"让玩家在每一步都看得懂：自己的行动、得到的奖励，和下一个目标之间的关系。"},
  {label:"Iteration",en:"My first draft paid coins for destroying an instrument; the tutorial version breaks a duplicate into components, so a spare becomes a step forward.",zh:"我的第一版草稿里，销毁乐器会返还金币；教程版改成把重复的乐器分解成零件，多出来的一把也能变成往前的一步。"},
  {label:"My role",en:"Team of three with Duo and Jinqi: I designed the interface and drew the instruments.",zh:"与 Duo、Jinqi 三人合作：界面由我设计，乐器也由我绘制。"},
]
const access="Explore the complete prototype recording above, or read the design sheet behind its rewards, instrument development and level progression."
const currentVersion="Interface prototype and design documentation: the path from preparing a song to upgrading an instrument, recorded from start to finish."

// Extend the existing case object. Keep its hero, Task First block, section
// responsibilities and footer; only obsolete scope claims are corrected.
export function extendInstrumentCase(existing) {
  const task = existing.sections.find(s=>s.kind==="copy-grid" && s.left?.title==="Task First")
  const taskWithCurrentScope = {
    ...task,
    left: {...task.left,zh:"界面围绕一个任务来整理。玩家需要知道什么尚未完成、可以选什么，以及什么会确认完成。"},
    right: {title:"What the Recording Shows",...pair("The full recording follows one player path: choosing a level, collecting the reward, breaking down a duplicate instrument and reading the upgrade result. The walkthrough below follows that same path step by step, so each screen is read at the moment a player meets it.","完整录像跟随一条玩家路径：选关、领取奖励、分解一把重复的乐器，再读懂升级结果。下面的逐步讲解沿着同一条路径走，让每一个界面都在玩家遇到它的那一刻被读懂。")},
  }
  return {...existing,summary,points,access,currentVersion,sections:[instrumentOpening,taskWithCurrentScope,...instrumentBody,instrumentClosing,...existing.sections.filter(s=>s!==task && s.title!=="Next Evidence")],sourceLinks:[...(existing.sourceLinks||[]),{label:"Read the game design sheet ↗",href:"https://docs.google.com/spreadsheets/d/1K--ZlCT3OLAVaRNE2LKVdmWkp-8ALyc-6MnpsE7By2Q/edit?gid=0#gid=0",external:true}]}
}

export const instrumentCopyTranslations=[
  [summary,"修复继承而来的机械乐器：发现它的音乐，演奏曲目，再把每次回报转化为乐器收藏的下一步成长。"],
  [access,"可以观看上方的完整原型录像，或查看支撑奖励、乐器培养和关卡进度的设计表。"],
  [currentVersion,"界面原型与设计文档：从准备演奏到升级乐器的完整路径，从头到尾录了下来。"],
]
