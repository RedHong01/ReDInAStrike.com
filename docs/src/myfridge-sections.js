// MyFridge — the drawer case study.
// Sources: Group 4's shared Drive folder for Interaction 1 (IxD 101), Spring 2024
// — HW1 problem statements (doc and slides), "Group 4 Share Docs" (interview
// questions and Allen's two interviews), Red's "Findings Slides", the process-book
// pages (persona, competitor analysis, Mika's wireframes, Kaiyi's interviews, screens
// by flow) — and the original board images the old Framer page still serves
// (interviews, insights, HMW, persona, CozZo, user flow, Red's wireframes, screens).
// Participants are named on the old board; here they are identified by role only.
// Chinese is written in Simplified — see tbc-sections.js for why.

export const myfridgeSections = [
  {
    kind: "copy-grid",
    left: {
      title: "Brief",
      en: "MyFridge is a fridge app for people in their first job who live alone and keep throwing food away. It starts from the receipt, not a shopping list: what you bought comes in from a scan or from the store account you sign in with, the app tracks what is in the fridge and the freezer, warns you before something goes off, and at the end of the week tells you what the waste cost.",
      zh: "MyFridge 是一款冰箱应用，服务刚开始工作、独自生活、却总在丢食物的人。它从收据开始，而不是从购物清单开始：你买了什么，由扫描或你登录的商店账户带进来；应用记录冷藏与冷冻里有什么，在食物变质前提醒你，并在每周结束时告诉你浪费花了多少钱。",
    },
    right: {
      title: "My role",
      en: "Group 4 in Interaction 1 (IxD 101), Spring 2024 — Kaiyi, Mika, Allen and me. I put together the findings: who we talked to, the five insights, and the How Might We they narrowed into. I also drew one of the two sets of wireframes; Mika drew the other.",
      zh: "2024 年春季 Interaction 1（IxD 101）的第四组——Kaiyi、Mika、Allen 和我。我负责整理研究发现：我们访谈了谁、五条洞察，以及它们收窄出来的 How Might We。两套线框图中有一套是我画的，另一套出自 Mika。",
    },
  },
  {
    kind: "callout",
    title: "The List Nobody Keeps",
    en: "The design’s central idea is an absence: there is no shopping list anywhere in it. Almost nobody we talked to keeps one, and one of them called writing it stressful. Food comes in from the receipt or the store account instead, and you only type in what the scan missed.",
    zh: "这个设计的核心，是一个缺席：整个应用里没有任何购物清单。我们访谈的人几乎都不写清单，其中一位还说写清单会带来压力。食物改由收据或商店账户带进来，只有扫描漏掉的部分才需要手动输入。",
  },
  {
    kind: "system-grid",
    title: "Three Problems, One Picked",
    items: [
      ["PS1 — THE FRESHMAN", "A student just out of the college entrance exam, who spent so long studying that he has lost the habit of making friends — and slowly stops leaving his dorm.", "一个刚考完高考、步入大学的新生，长期埋头苦读让他失去了交朋友的习惯——渐渐地，他不再走出宿舍。"],
      ["PS2 — THE FRIDGE / CHOSEN", "Someone living alone for the first time keeps finding fresh food past its shelf life, because nobody ever showed her how much food a week actually is. It wastes money and food.", "第一次独自生活的人，总发现冰箱里的新鲜食物过了保质期，因为从来没有人教过她，一周到底需要多少食物。这既浪费钱，也浪费食物。"],
      ["PS3 — THE ROUTE", "A wheelchair user is sent down walking and cycling routes that construction or blocked pavements make impassable, because the map has no accessible route.", "一位依靠轮椅出行的人，被地图导向步行或骑行路线，而施工或被占用的人行道让这些路线无法通行——因为地图没有无障碍路线。"],
    ],
  },
  {
    kind: "spec-table",
    title: "The Problem, in Five Ws",
    intro: {
      en: "The first assignment asked each group for three problem statements and the five Ws behind each, before anyone was allowed to think about solutions. These are the answers for the one we kept.",
      zh: "第一份作业要求每组写出三个问题陈述，以及每个问题背后的五个 W——在任何人被允许思考解决方案之前。以下是我们留下的那一个的答案。",
    },
    head: ["Question", "Answer"],
    rows: [
      ["Who", "Young people who have just graduated and started work."],
      ["What", "Too much fresh food goes into the fridge at once, and there is no way to eat it all before it spoils."],
      ["Where", "The fridge in a young person’s own home."],
      ["When", "In a cycle — starting about a week after a big trip to the grocery store."],
      ["Why", "Most recent graduates have never lived alone, so they lack kitchen experience: they don’t know how long each ingredient keeps, and they don’t plan their shopping over time."],
    ],
  },
  {
    kind: "system-grid",
    title: "What They Told Us",
    items: [
      ["DIRECTOR’S ASSISTANT", "Buys on mood; memorises only the must-haves and decides the rest in the aisle. “When I’m stressed at work and don’t feel like cooking, I’ll order takeout instead.”", "凭心情买东西；只记住非买不可的，其余的在货架前临时决定。“工作压力大、不想做饭的时候，我就改叫外卖。”"],
      ["SCHOOL COUNSELLOR", "Cooks when in the mood and buys ingredients on a whim; lists only now and then. “60% of my food is instant food or meal-prepped the day before, because I have little time to eat between classes.”", "想做饭时才做，一时兴起就买一堆食材；偶尔才写清单。“我吃的东西有六成是速食，或是前一天备好的餐，因为课与课之间几乎没时间吃饭。”"],
      ["STOCK BROKER", "Bought vegetables, milk and meat to start eating healthily, got busy, lived on takeout, and came back to find all of it off. “A notification system would be really helpful … a week before and another 2 days before.”", "为了开始健康饮食买了蔬菜、牛奶和肉，接着忙起来靠外卖度日，回来发现全都坏了。“要是有提醒系统就太好了……提前一周，再提前两天。”"],
      ["INTERACTION DESIGNER", "Keeps a shopping list and finds it easy — and still found expired yogurt at the back of the fridge by eating it. “When I’m really preoccupied with work, I tend to forget or just don’t really care about when my food is going to go bad.”", "会写购物清单，也觉得不难——却还是在冰箱深处吃到一盒过期的酸奶，才发现它过期了。“工作一忙起来，我就会忘记，或者根本不在乎食物什么时候会坏。”"],
      ["PRODUCT DESIGNER, 26", "Orders in when tired or ill, and skips shopping altogether when busy. “Although cooking can be enjoyable, it requires a lot of effort from planning to preparation.”", "累了或生病时才叫外卖，一忙就干脆不去买菜。“做饭虽然可以很享受，但从规划到准备都要花很多力气。”"],
      ["PRODUCT DESIGNER, 27", "Writes a list only after forgetting the same things several times. “Making a list can sometimes feel stressful for me.” What would help: “remind me of food items that are about to expire. That would be enough for me.”", "只有在同样的东西忘了好几次之后才写清单。“写清单有时会让我觉得有压力。”至于什么会有帮助：“提醒我哪些食物快过期了。这样就够了。”"],
    ],
  },
  {
    kind: "spec-table",
    title: "Five Insights, and What Answers Them",
    intro: {
      en: "The board lists the insights; it never lines them up against the app. This table is mine, made by reading the finished screens against the research — which is also how you see the two insights the design leaves alone.",
      zh: "白板列出了洞察，却从未把它们和应用对照起来。这张表是我做的：拿完成的画面去对照研究——也正因为这样，才看得出设计刻意没有处理的那两条洞察。",
    },
    head: ["#", "Insight", "What in the app answers it"],
    rows: [
      ["01", "They know they waste food but don’t pay it much attention — or recognise the harm.", "The waste report: the week’s waste in dollars, by category, against last week, with a history of what went off."],
      ["02", "Most don’t cook for themselves; they eat at the cafeteria or order in.", "Nothing tries to make them cook. The cook-recommendation screens were dropped; the app manages what is bought, not what is made."],
      ["03", "Energy first, taste second, whether it is healthy last.", "Only the food detail touches health, with nutrition per 100 g. Nothing else leans on it."],
      ["04", "No plan for storage, mostly because nobody knows how long things keep.", "Every item carries its days to expiry from the moment it is scanned; the fridge view filters fresh against nearly expired; home counts down in days and hours."],
      ["05", "No shopping lists — and being made to write one takes the motivation away.", "There is no list anywhere. Food comes in from the receipt or the store account, and is typed in only where the scan missed it."],
    ],
  },
  {
    kind: "copy-grid",
    left: {
      title: "How Might We — Before",
      en: "How might we design a product or app that helps juniors who have just left school and entered the workplace — through fridge organisation tips, tracking of raw ingredients and leftovers, regular reminders of shelf life, customised storage plans, meal plans and shopping plans?",
      zh: "我们要如何设计一个产品或应用，帮助刚离开学校、进入职场的新人——透过冰箱整理建议、食材与剩菜追踪、保质期的定期提醒、定制化的储存计划、餐食计划与购物计划？",
    },
    right: {
      title: "How Might We — After",
      en: "How might we design a product or app that reduces food waste in the home of a young single person who is starting out and under a lot of work pressure — by means of regular shelf-life reminders, customised storage plans, meal plans and shopping plans? The user got narrower and the pressure got named; organisation tips and leftovers tracking dropped out.",
      zh: "我们要如何设计一个产品或应用，减少一位刚出社会、独自生活、承受大量工作压力的年轻人家中的食物浪费——透过保质期的定期提醒、定制化的储存计划、餐食计划与购物计划？使用者变得更具体，压力被点了名；整理建议和剩菜追踪则被拿掉了。",
    },
  },
  {
    kind: "persona",
    title: "Jimmy, After the Interviews",
    intro: {
      en: "The persona existed before we talked to anyone. The interviews didn’t change who Jimmy is — they changed what he doesn’t know. His first line was about being too busy; the final one adds that he has no idea what the waste actually harms.",
      zh: "这个人物角色在我们访谈任何人之前就存在了。访谈没有改变 Jimmy 是谁——而是改变了他不知道的事。他最初那句话在说自己太忙；最后那句多了一件事：他完全不知道这些浪费到底伤害了什么。",
    },
    tag: "PERSONA / AFTER THE INTERVIEWS",
    name: "Jimmy S.",
    bio: {
      en: "Just graduated, working a nine-to-five that always runs over, and left with little to no time to cook.",
      zh: "刚毕业，做着一份总是加班的朝九晚五工作，几乎没有时间做饭。",
    },
    quote: {
      en: "“For me, there is a lot of pressure from work that keeps me from focusing too much on my day-to-day life. I had no idea how much food was going to waste in my house each month. At the same time, I don’t know what the harm and negative effects of all this food waste are.”",
      zh: "“对我来说，工作压力很大，让我没办法太关注日常生活。我完全不知道家里每个月浪费了多少食物。同时，我也不知道这些浪费到底有什么危害和负面影响。”",
    },
    before: {
      label: "Before the interviews",
      en: "“I have to focus on my job. I had no idea how much food was going to waste in my house each month; it bothers me, both dealing with the wasted food and the money I was wasting.”",
      zh: "“我得专心工作。我完全不知道家里每个月浪费了多少食物；这让我很困扰，既要处理那些坏掉的食物，也心疼浪费掉的钱。”",
    },
    columns: [
      { label: "Situation and context", items: ["Unaware of the harm the food he wastes does", "Just graduated, living alone for the first time", "Lives by himself", "Does not have much time to cook", "Works nine to five, usually with overtime"] },
      { label: "Goals and motivations", items: ["A quick, efficient answer to daily meals", "Enjoying flavourful food, not just taking in nutrients", "A more economical way of living and eating", "A healthier diet"] },
      { label: "Fears and frustrations", items: ["A dirty fridge is a health hazard", "Falling back on takeout under heavy pressure", "Guilt from spending twice because nothing was planned", "No life skill, cooking included, that satisfies his appetite", "Slowly forgetting what is still in the fridge in the middle of a busy life"] },
      { label: "Tasks and tactics", items: ["Learning to plan a daily diet", "Knowing how long different foods keep", "Seeing at a glance whether food is spoiling or expiring", "Recognising the harm of wasting food"] },
    ],
  },
  {
    kind: "spec-table",
    title: "CozZo, the App Already Doing This",
    intro: {
      en: "The competitor analysis looked at one app: CozZo, a fridge, pantry and recipe manager with shopping and meal planners, built to avoid waste by tracking what you have and when it expires. We listed its strengths.",
      zh: "竞品分析只看了一个应用：CozZo——一个结合购物与餐食规划的冰箱、储藏室与食谱管理工具，透过追踪你有什么、何时过期来避免浪费。我们列出了它的优点。",
    },
    head: ["Strength", "What we noted"],
    rows: [
      ["Comprehensive", "Shopping lists, food inventory and meal planning in one app."],
      ["Personalised", "Shopping lists that users create and customise."],
      ["Expiry tracking", "Tracks each item’s expiry date to cut waste."],
      ["Sync", "Data synchronised across phones and smartwatches."],
      ["Social", "Shopping lists shareable through messaging apps."],
    ],
    note: {
      en: "Looking at it now, the analysis stops at strengths. It never says where MyFridge would be different — and CozZo’s own store listing already shows a receipt feature, which makes that question sharper, not smaller.",
      zh: "现在回头看，这份分析只停在优点。它从没说明 MyFridge 会在哪里不同——而 CozZo 自己的商店页面上就已经展示了收据功能，这让这个问题变得更尖锐，而不是更小。",
    },
  },
  {
    kind: "flow-lanes",
    title: "The Flow",
    intro: {
      en: "The user flow from the board, set as type. Five lanes, left to right: getting in, adding food, the fridge, a single item, and what has gone off. Where a branch leaves its lane, it says where it goes.",
      zh: "把白板上的使用者流程排成文字。五条泳道由左至右：进入应用、加入食物、冰箱、单一品项，以及已经坏掉的东西。分支离开所在泳道时，会写明它去往哪里。",
    },
    lanes: [
      {
        step: "LOG IN",
        name: "Getting in",
        nodes: [
          { type: "start", text: "Entry" },
          { type: "page", text: "Loading page" },
          { type: "page", text: "Log-in page" },
          { type: "decision", text: "Existing account?", branches: [{ key: "Y", to: "Scan page, step 1" }, { key: "N", to: "Link another account?" }] },
          { type: "decision", text: "Link another account?", branches: [{ key: "Y", to: "Google / Whole Foods → my fridge, step 2" }, { key: "N", to: "Registration → scan page, step 1" }] },
        ],
      },
      {
        step: "STEP 1",
        name: "Adding food",
        nodes: [
          { type: "page", text: "Scan page" },
          { type: "action", text: "Scan" },
          { type: "decision", text: "What was scanned?", branches: [{ key: "→", to: "A food item → my fridge, step 2" }, { key: "→", to: "A receipt → my fridge, step 2" }] },
        ],
      },
      {
        step: "STEP 2",
        name: "My fridge",
        nodes: [
          { type: "page", text: "My refrigerator page" },
          { type: "action", text: "Find" },
          { type: "page", text: "Items menu" },
          { type: "decision", text: "Find something to cook?", branches: [{ key: "Y", to: "Browse the sections" }, { key: "N", to: "More information" }] },
          { type: "action", text: "Browse" },
          { type: "page", text: "Refrigerated section" },
          { type: "page", text: "Freezer section" },
          { type: "page", text: "Wasted section" },
          { type: "decision", text: "Know more about the waste?", branches: [{ key: "Y", to: "Expiring and wasted, step 4" }, { key: "→", to: "More cooking suggestions" }] },
          { type: "end", text: "Found — end" },
        ],
      },
      {
        step: "STEP 3",
        name: "One item",
        nodes: [
          { type: "action", text: "Swipe" },
          { type: "page", text: "Refrigerator management page" },
          { type: "action", text: "Find" },
          { type: "page", text: "Detail information" },
          { type: "decision", text: "Found what you need?", branches: [{ key: "Y", to: "End" }, { key: "N", to: "Update the usage status" }] },
          { type: "page", text: "Check button" },
          { type: "decision", text: "Checked?", branches: [{ key: "✓", to: "Consumed" }, { key: "—", to: "Not yet consumed" }] },
        ],
      },
      {
        step: "STEP 4",
        name: "Expiring and wasted",
        nodes: [
          { type: "action", text: "Swipe" },
          { type: "page", text: "Expiring food page" },
          { type: "action", text: "Browse" },
          { type: "page", text: "Expired and to-be-cleared list" },
          { type: "page", text: "Expired item details: days expired, and how far it has contaminated the fridge" },
          { type: "page", text: "Waste report: weekly, monthly and yearly statistics" },
        ],
      },
    ],
    note: {
      en: "Transcribed from the board. Obvious typos are corrected — “funded” for found, “freezed” for freezer, “slid” for swipe — and nothing else is changed.",
      zh: "据白板转录。明显的错字已更正——把 found 写成 funded、freezer 写成 freezed、swipe 写成 slid——其余未作更动。",
    },
  },
  {
    kind: "image",
    image: "assets/myfridge/wireframes-red.png",
    alt: "Red’s hand-drawn MyFridge wireframes: sort and search, cook recommendations, food sections, swipe navigation and status marks",
    label: "WIREFRAMES / RED",
    caption: {
      en: "My set of hand-drawn wireframes. The final screens carry some of the same ideas: the three status marks — red for expired, amber for nearly, green for fine — appear as the Fresh and Nearly-expired filters; the 4 °C and freezer panels as the two section views; the sort button as sorting by date added, expiry and price. The cook-recommendation screens, in my set and in Mika’s, did not make it.",
      zh: "我手绘的那一套线框图。最终画面里保留了其中一些想法：三种状态标记——红色代表过期、黄色代表快过期、绿色代表没问题——化为“新鲜”与“即将过期”的筛选；4°C 冷藏与冷冻两块面板，成了两个分区视图；排序按钮成了按加入时间、到期日与价格排序。我和 Mika 的两套里都有的烹饪推荐画面，则没有留到最后。",
    },
  },
  {
    kind: "screens",
    title: "The Screens",
    intro: {
      en: "The final screens, grouped by where they sit in the flow.",
      zh: "最终画面，依照它们在流程中的位置分组。",
    },
    columns: 7,
    groups: [
      { label: "LAUNCH", screens: [{ image: "assets/myfridge/screens/01-launch.png", name: "Launch" }] },
      {
        label: "SIGN UP",
        screens: [
          { image: "assets/myfridge/screens/02-get-started.png", name: "Get started" },
          { image: "assets/myfridge/screens/03-create-account.png", name: "Create account" },
          { image: "assets/myfridge/screens/04-log-in.png", name: "Log in" },
        ],
      },
      {
        label: "HOME",
        screens: [
          { image: "assets/myfridge/screens/05-home-briefing.png", name: "Sustainability briefing" },
          { image: "assets/myfridge/screens/06-home-warning.png", name: "Expiration warning" },
          { image: "assets/myfridge/screens/07-expiring-week.png", name: "Expiring this week" },
        ],
      },
      {
        label: "FRIDGE",
        screens: [
          { image: "assets/myfridge/screens/08-fridge-section.png", name: "Fridge section" },
          { image: "assets/myfridge/screens/09-food-detail.png", name: "Food detail" },
        ],
      },
      {
        label: "WASTE",
        screens: [
          { image: "assets/myfridge/screens/10-waste-report.png", name: "Weekly breakdown" },
          { image: "assets/myfridge/screens/11-waste-history.png", name: "Waste history" },
          { image: "assets/myfridge/screens/12-waste-summary.png", name: "Waste summary" },
          { image: "assets/myfridge/screens/13-waste-strawberry.png", name: "Details — strawberry" },
          { image: "assets/myfridge/screens/14-waste-broccoli.png", name: "Details — broccoli" },
        ],
      },
    ],
  },
  {
    kind: "text",
    title: "What the Record Doesn’t Show",
    paragraphs: [
      {
        en: "There is no usability test in the files, so nothing here claims the app reduced anyone’s waste; the home screen’s “$157, down 15%” is a mock-up figure, not a result. Seven interviews were enough to change the persona, not to count as a sample.",
        zh: "文件里没有可用性测试的记录，所以这里不声称这个应用减少了任何人的浪费；首页上的“157 美元、下降 15%”是示意数字，不是成果。七场访谈足以改变人物角色，却不足以称为样本。",
      },
      {
        en: "The food photographs in the screens are AI-generated. The original board said so — for learning and concept visualisation only — and it still applies here.",
        zh: "画面里的食物照片由 AI 生成。原白板上已经注明——仅供学习与概念视觉之用——这一点在这里依然适用。",
      },
    ],
  },
  {
    kind: "spec-table",
    title: "The Paper Trail",
    intro: {
      en: "Everything on this page comes from these, most of them in the group’s shared folder.",
      zh: "这一页的所有内容都出自以下文件，其中大多数在小组的共享文件夹里。",
    },
    head: ["Document", "What it holds", "Date"],
    rows: [
      ["HW1: (group) Problem Statements", "The brief, and our three candidate problems in Chinese and English.", "2024-01-18"],
      ["hw1: Problem Statements — slides", "The three statements with their five Ws, as presented by Kaiyi, Mika and me.", "2024-01-25"],
      ["Group 4 Share Docs", "Everyone’s draft interview questions, the final nine, and Allen’s two interviews in full.", "2024-01-25"],
      ["Findings Slides", "The How Might We before and after, the participants and the five insights. Mine.", "2024-02-01"],
      ["Process book pages", "Problem statement, the persona before and after, the competitor analysis, Mika’s wireframes, Kaiyi’s two interviews, and the screens by flow.", "2024-03-14"],
      ["Final screens", "Twenty exported screens.", "2024-03-14"],
      ["Prototype recordings", "Four screen recordings, among them a walkthrough of the receipt scan.", "2024-03-13"],
      ["Figma board — Interaction G4", "The source board: interviews, insights, How Might We, persona, competitor, user flow, both wireframe sets and the screens.", "Spring 2024"],
    ],
  },
]
