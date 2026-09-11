// Assets Hub and Build and Shoot, rebuilt from the course decks, the Figma
// prototype, the two Build n Shoot GDDs and the questionnaire definitions.
// Sources and their locations: reference/projects/{assets-hub,build-and-shoot}/.
// Chinese is written in Simplified: flow and system-grid print it unconverted.

const pair = (en, zh) => ({ en, zh })

const figmaPrototype = "https://www.figma.com/proto/HEpE6DzXmVK9AkYB8LDVuP/IxD1-Final-Project-Red?node-id=704-1008&starting-point-node-id=704%3A1008"

// Resolved from this module's own URL so the link survives the /ReDInAStrike.com/
// project path on GitHub Pages as well as the local dev server.
const bnsGddHref = new URL("../bns_gdd/", import.meta.url).href

export const rebuiltCaseStudies = {
  "/assethub": {
    year: "2024",
    title: "Assets Hub",
    category: "Interaction Design / IxD 101",
    summary: pair(
      "Images, videos, 3D models and documents pile up across devices and cloud drives, and finding one usually means remembering where I put it. Assets Hub is a search window for all of them: type a word or a tag, choose where to look, and see where a file lives before opening it.",
      "图片、视频、3D 模型和文档散落在不同的设备和云盘里，想找一个文件，往往得先想起自己把它放在了哪里。Assets Hub 是一个能搜遍这些文件的搜索窗口：输入一个词或一个标签，选好在哪里找，打开之前就能看到文件在哪。",
    ),
    heroImage: null,
    heroAlt: "Assets Hub search window",
    points: [
      "My solo final for Interaction 1 (IxD 101), the half of the course that followed our group project, My Fridge.",
      "A macOS search window for creative files: images, video, 3D and documents, on this computer or in the cloud.",
      "97 Figma frames: the search bar in every state, type tags, a scope switch, sorting, action and escape keys, a file inspector and a settings window.",
      "The sample data is real: my own GDF2 spreadsheets and photos, with the sizes and dates they actually had.",
    ],
    sections: [
      {
        kind: "copy-grid",
        left: {
          title: "The friction",
          en: "My files were never lost, just scattered. A playtest sheet sat in Numbers on iCloud, photos in Downloads, presentations somewhere else. Every search started with remembering which app or drive had won that day.",
          zh: "我的文件从来没丢，只是太分散：试玩反馈表在 iCloud 的 Numbers 里，照片在下载文件夹，演示文稿又在别处。每次搜索都得先回想，那天到底存进了哪个应用、哪个盘。",
        },
        right: {
          title: "The promise",
          en: "One window, one query. It should show the file and its context together — where it lives, what it is, how big it is, when it was made and last opened — so I can decide before I open anything.",
          zh: "一个窗口，一次搜索。它要把文件和它的来龙去脉一起给我：存在哪、是什么、有多大、什么时候创建、上次什么时候打开，让我在打开之前就能判断是不是要找的那个。",
        },
      },
      {
        kind: "flow",
        title: "The brief, week by week",
        steps: [
          ["WEEKS 8–9", "Three ideas, one kept; user interviews and a competitive analysis", "三个构思留下一个，接着做用户访谈和竞品分析"],
          ["WEEK 10", "A how-might-we, the key features, a scenario and a user flow", "确定 HMW、核心功能、使用情境和用户流程"],
          ["WEEKS 11–12", "Wireframes, then a clickable prototype with its own design system", "先画线框，再做带有自己设计系统的可点击原型"],
          ["WEEKS 13–14", "Testing outside class, then the poster, slides, process book and a video", "找课外的人测试，然后是海报、演示、过程手册和一段视频"],
        ],
      },
      {
        kind: "spec-table",
        title: "What I borrowed, and what I changed",
        intro: pair(
          "My competitive analysis ended up on the Figma file's Wireframe page as reference shots: Raycast's file search and clipboard history, and Apple Photos. The layout started from them; the changes are where Assets Hub became its own tool.",
          "竞品分析最后留在 Figma 文件的 Wireframe 页上，是几张参考截图：Raycast 的文件搜索和剪贴板历史，还有 Apple 的照片应用。布局从它们出发，改动的地方才是 Assets Hub 自己的东西。",
        ),
        head: ["Reference", "What I kept", "What Assets Hub changes"],
        rows: [
          ["Raycast · Search Files", "Recent files on the left, a metadata panel on the right, and a scope switch for This Mac or the user folder", "The same split, with creator and tags in the details and a syncing state for files still arriving from the cloud"],
          ["Raycast · Clipboard History", "Type to filter, one list, and a detail pane that shows where an entry came from", "The same filtering works on files and pictures instead of copied text; unlimited history moves behind sign-in"],
          ["Apple Photos", "Pictures browsed as a grid", "Picture results open as a gallery inside the search window, without switching apps"],
        ],
      },
      {
        kind: "system-grid",
        title: "How a search is built",
        items: [
          ["DESCRIBE", "Type what you remember — cats, fashion — and pictures come back as a gallery.", "输入记得的词，比如猫、时装，图片结果会直接以图库呈现。"],
          ["TAG", "Tags narrow by kind: Pic, doc, Nub for Numbers, or a project tag like GDF. They stack.", "标签按类型缩小范围：Pic、doc、代表 Numbers 的 Nub，或者 GDF 这样的项目标签，而且可以叠加。"],
          ["SCOPE", "A scope switch sets where to look, starting from This computer; cloud files show a syncing state.", "范围开关决定在哪里找，默认是这台电脑；云端文件会显示同步状态。"],
          ["SORT", "A sorting bar reorders whatever the search returned.", "排序栏可以重新排列搜索返回的结果。"],
          ["INSPECT", "Selecting a file opens its details: name, location, type, size, created, modified, last opened, creator and tags.", "选中一个文件会打开详情：名称、位置、类型、大小、创建时间、修改时间、上次打开、创建者和标签。"],
          ["ACT", "Keys under the results show history, expand or copy the selection; Control, Option and Command shortcuts sit alongside, and Esc steps back.", "结果下方的按键可以查看历史、放大或复制选中的文件，旁边配有 Control、Option 和 Command 快捷键，Esc 返回上一步。"],
        ],
      },
      {
        kind: "case-gallery",
        title: "Four states of the prototype",
        items: [
          {
            image: "assets/case-study/assets-hub/search.png",
            label: "01 / At rest",
            alt: "Assets Hub search bar resting on the macOS desktop",
            caption: pair("It starts as a single search line over the desktop, the way Spotlight does.", "它一开始只是桌面上的一行搜索框，和 Spotlight 一样。"),
          },
          {
            image: "assets/case-study/assets-hub/gallery.png",
            label: "02 / Gallery",
            alt: "Assets Hub picture results laid out as a gallery",
            caption: pair("Picture results open as a gallery in the same window, with history, expand and copy underneath.", "图片结果直接在同一个窗口里以图库展开，下方是历史、放大和复制。"),
          },
          {
            image: "assets/case-study/assets-hub/inspector.png",
            label: "03 / Inspect",
            alt: "Assets Hub GDF tag search with the file details panel",
            caption: pair("A GDF tag lists my recent course files, and the details show where one lives before I open it.", "输入 GDF 标签会列出最近的课程文件，打开之前，详情就告诉我它存在哪里。"),
          },
          {
            image: "assets/case-study/assets-hub/settings.png",
            label: "04 / Settings",
            alt: "Assets Hub settings window with sign-in and features",
            caption: pair("Settings hold sign-in and what it unlocks: cloud sync, unlimited history, deleted-file search and a developer API.", "设置里是登录，以及登录后解锁的功能：云同步、无限历史、已删除文件搜索和开发者 API。"),
          },
        ],
      },
      {
        kind: "spec-table",
        title: "Real files as sample data",
        intro: pair(
          "I filled the prototype with my own files from that year: a playtest-response sheet and a games list from GDF2, and a photo from Downloads. Every value in the details panel is one a real file had.",
          "原型里的样例数据都是我那一年真实的文件：GDF2 课上的试玩反馈表、一份游戏清单，还有下载文件夹里的一张照片。详情面板里的每一个数值，都是真实文件当时的样子。",
        ),
        head: ["File", "Where", "Type", "Size", "Created", "Modified"],
        rows: [
          ["GDF--Resource Management Game Playtest Feedback (Responses)", "iCloud Drive / Numbers", "Spreadsheet", "779 KB", "Apr 16, 2024, 11:23 AM", "Aug 14, 2024, 3:38 PM"],
          ["GDF--Games", "iCloud Drive / Numbers", "Spreadsheet", "711 KB", "Aug 6, 2024, 1:08 PM", "Aug 6, 2024, 1:08 PM"],
          ["IMG_8218.JPG", "User / Downloads", "JPEG image", "962 KB", "Apr 20, 2024, 7:32 AM", "Aug 6, 2024, 1:11 PM"],
        ],
        note: pair("The same fields tile the background of the project poster.", "项目海报的背景，也是用这些字段铺满的。"),
      },
      {
        kind: "callout",
        title: "What stayed on paper",
        en: "Cloud sync, the AI features and the developer API exist only as rows in the settings window. The prototype shows how finding a file should feel; there is no index behind it yet.",
        zh: "云同步、AI 功能和开发者 API 目前都只是设置窗口里的几行字。这个原型展示的是找文件应该是什么感觉，背后还没有真正的索引。",
      },
    ],
    access: "Solo project for Interaction 1 (IxD 101) at ArtCenter. The clickable prototype is in Figma.",
    sourceLinks: [{ label: "Open the Figma prototype ↗", href: figmaPrototype, external: true }],
    currentVersion: "A Figma prototype: the search, tag, scope, details and settings states are designed and linked, and nothing behind them is built.",
  },
  "/analog-game": {
    year: "2024 Fall",
    title: "Build and Shoot",
    category: "Analog Game / Rules and Systems",
    summary: pair(
      "A turn-based duel for two to four mages on a floating 15 × 15 island. Walking paints your territory, territory pays for blocks and ammo, and the blocks become the cover everyone shoots around. Over four versions I added an inventory, then AI guards, then rewrote the guards so players could follow them.",
      "两到四名法师在一座 15 × 15 的浮空岛上进行的回合制对战。走过的格子会变成你的领地，领地可以换来方块和弹药，而方块又会变成大家互相射击时的掩体。四个版本里，我先加入了负重物品栏，再加入 AI 守卫，最后重写守卫规则，让玩家能跟得上。",
    ),
    heroImage: null,
    heroAlt: "Build n Shoot cover art",
    points: [
      { label: "Iteration", en: "Version two’s players found the difficulty right; version four’s found the turn too heavy, because learning the guards up front asked too much.", zh: "第二版的玩家觉得难度刚好；第四版的玩家觉得回合太重，因为一开始就要学会守卫的规则，要求太多了。" },
      { label: "My role", en: "Designed, written and playtested by me across four iterations in one term.", zh: "由我设计、撰写并组织试玩，一个学期内完成四次迭代。" },
    ],
    sections: [
      {
        kind: "copy-grid",
        left: {
          title: "The hook",
          en: "Moving is how you earn. Every square you walk through takes one of your territory marks, and territory is what you spend on blocks, items and guards, so the route you take decides where the cover will be later.",
          zh: "移动就是赚取。你走过的每一格都会放下一枚领地标记，而领地正是用来换方块、道具和守卫的。所以你走的路线，决定了之后掩体会出现在哪里。",
        },
        right: {
          title: "The pressure",
          en: "Every action costs a card, and a hand holds only ten weights of cards and items. Building, shooting and carrying compete for the same space, and anything over the limit has to go.",
          zh: "每个行动都要花一张卡，而手里最多只能拿十个负重单位的卡牌和道具。建造、射击和携带争的是同一块空间，超出上限的就得丢掉。",
        },
      },
      {
        kind: "flow",
        title: "Four versions in one term",
        steps: [
          ["1ST · NOV 2024", "Move, mark, settle, build, shoot: territory pays out ammo and blocks, and everyone starts with 10 HP", "移动、标记、结算、建造、射击：领地换来弹药和方块，每人开局 10 点生命"],
          ["2ND", "An inventory counted in weight, ten to a hand, with every item and action card rewritten around it", "按负重计算的物品栏，每人上限十个单位，所有道具和行动卡都围绕它重写"],
          ["3RD", "AI guards bought with territory and placed on the board, acting on their own after every turn", "用领地买来、放在棋盘上的 AI 守卫，每个回合结束后自行行动"],
          ["4TH · DEC 2024", "Guard behaviour rewritten as clear situations; each player now starts with 4 HP", "守卫行为改写成清楚的情境规则；每名玩家改为 4 点生命开局"],
        ],
      },
      {
        kind: "callout",
        title: "Why the dice stayed",
        en: "I put a D6 into movement in the first version to add some chance, because every other resource in the game came from fixed rules. By the fourth version the same roll also sets how far a shot travels.",
        zh: "第一版里我让一颗 D6 决定移动距离，是想加一点随机性，因为游戏里其他资源都按固定规则产生。到了第四版，同一颗骰子也决定子弹能飞多远。",
      },
      {
        kind: "copy-grid",
        left: {
          title: "Playtest · version two",
          en: "The difficulty landed about where I wanted it, so I left the other values alone, carried them into the next version and kept testing them.",
          zh: "难度基本落在我想要的位置，所以我没有动其他数值，把它们原样带进下一版，继续测试。",
        },
        right: {
          title: "Playtest · version four",
          en: "Most players understood the basics: how to move, how to shoot, how to build cover. But the turn had grown heavy. So many progression rules arrived before the first move that some players lost patience or forgot a step, and kept asking the GM how to place and move the AI units.",
          zh: "大部分玩家都能看懂基础规则：怎么移动、怎么射击、怎么建造掩体。但回合变得臃肿了：开局之前就要学太多 progression 方面的规则，有些玩家因此失去耐心，或者忘了某个步骤，只好反复向 GM 确认 AI 单位该怎么放、怎么走。",
        },
      },
      {
        kind: "spec-table",
        title: "What the questionnaire asked",
        intro: pair(
          "I used the same questionnaire for the second and the fourth versions. It also asked which earlier versions a player had seen, how many board games they had played and which genre they played most.",
          "第二版和第四版用的是同一份问卷。问卷还会问玩家之前玩过哪几个版本、玩过多少款桌游，以及最常玩哪一类。",
        ),
        head: ["Topic", "Question", "Answer"],
        rows: [
          ["Goal", "Did you understand your goal at the start?", "Yes / No, then why"],
          ["Enjoyment", "Did you find the game enjoyable overall?", "1 Boring → 5 Entertaining"],
          ["Systems", "Which system was hardest to understand?", "Movement and territory · Combat · Inventory and items · Building"],
          ["Shooting", "How hard was it to shoot and damage another player? Was eliminating players easy?", "1 Very easy → 5 Very difficult · Yes / No"],
          ["Length", "How did the total play time feel?", "1 Short → 5 Long, then why"],
          ["Building", "How hard was it to build and shape the map you wanted?", "1 Very easy → 5 Very difficult"],
          ["Pick-ups", "How much did collecting pick-ups and using items matter?", "1 Willing to collect more → 5 Doesn't matter"],
          ["Items", "Which items did you like or dislike, and which felt too scarce or too common?", "Action · Resource · Ammo · HP · Dirty Bomb · Move Boost"],
          ["Replay", "Would you play again?", "Yes / No"],
        ],
      },
      {
        kind: "spec-table",
        title: "The Systems I Built Into the Board",
        intro: pair(
          "I built four systems into the board, each for a feeling I wanted at the table, and wrote the rules so a new group could play from the page alone.",
          "我在棋盘里放进了四个系统，每一个都对应我希望玩家在桌边感受到的一种体验；规则也写得让一群新玩家只看文字就能开始。",
        ),
        head: ["System", "What I wanted players to feel", "How the game does it"],
        rows: [
          ["Guards with minds of their own", "The board fights back even on turns when no player is moving", "Attack guards run seven states and defense and support guards six, from idle and patrol to flee and restore; level blocks add height and stop shots"],
          ["An economy on the board", "Spending is a visible choice that everyone at the table can read", "Territory marks spent through a purchase matrix, and a trading system between players"],
          ["Progression you can see", "Getting stronger shows on the table, not in a hidden number", "Territory turns into purchases, attack guards level up from 1 to 3, and every mark sits on the board where everyone can see it"],
          ["A rulebook to play from", "A new group can start without me standing there explaining", "The 28-page fourth-iteration GDD, rebuilt in the Build n Shoot GDD drawer"],
        ],
      },
    ],
    access: "Designed, written and playtested by me, Fall 2024.",
    sourceLinks: [{ label: "Read the full rules in the Build n Shoot GDD →", href: bnsGddHref }],
    currentVersion: "The fourth iteration. Its components, turn, purchase matrix and guard behaviour are laid out in the Build n Shoot GDD drawer.",
  },
}
