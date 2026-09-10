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
      zh: "DAD 是一款關於「被幫助的一年」的生存遊戲。你在格子地圖上奔跑，朝追著你的帳單射出硬幣，並買下腳下的土地。父親會替你清掉你來不及處理的帳單——但他每幫一次就更憤怒一分，而這些幫助會記在一筆帳上，年底結算。",
    },
    right: {
      title: "Where it came from",
      en: "I wanted one resource to carry the whole thing, so money is the bullet, the rent, the health of the relationship, and the score. Spending it solves the problem in front of you and writes the next one.",
      zh: "我希望用單一資源撐起整部作品，所以金錢同時是子彈、是房租、是這段關係的健康度，也是分數。花掉它能解決眼前的問題，同時寫下下一個問題。",
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
      zh: "第一波：穿過格線、收集硬幣、守住地面，並為下個月送來的東西做準備。",
    },
  },
  {
    kind: "system-grid",
    title: "Three Numbers You Watch",
    items: [
      ["DRIVE", "Your health. Bills, their bullets, and DAD's curses all take it down.", "你的生命值。帳單、帳單的子彈與父親的咒罵都會扣減它。"],
      ["MONEY", "Your ammunition. Every shot costs a coin, so shooting and saving are the same decision.", "你的彈藥。每次射擊都要花掉一枚硬幣，因此開火與存錢是同一個決定。"],
      ["TIME", "One second is a day. You cannot pause it, and it is the only resource nobody can give you.", "一秒即一天。它無法暫停，也是唯一沒有人能給你的資源。"],
    ],
  },
  {
    kind: "spec-table",
    title: "What You Start With",
    intro: {
      en: "The diagram fixes the opening state, and the build keeps it. You begin with nothing to shoot and a full year in front of you.",
      zh: "圖表訂下了開局狀態，實作也保持一致：你手上沒有任何可以射出去的東西，面前是一整年。",
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
      en: "The build runs one in-game day per real second, thirty days to a month, twelve months to a run — the scale I drew in the Week 11 diagram, shipped unchanged. Each month spawns a wave of bills, and month ten is the birthday the whole run is counting towards.",
      zh: "遊戲以現實一秒對應遊戲一天、三十天一個月、十二個月一局運作——這正是我在第 11 週圖表中畫下的比例，原封不動地實作了。每個月生成一波帳單，而第十個月就是整局一直在倒數的那個生日。",
    },
  },
  {
    kind: "spec-table",
    title: "The Calendar",
    intro: {
      en: "Twelve months, one wave of bills each. Two of them are marked in the diagram, and the game is built to arrive at them.",
      zh: "十二個月，每個月一波帳單。圖表標出了其中兩個月份，而整個遊戲就是為了抵達它們而設計的。",
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
      zh: "圖表原本計畫把第二階段的月份加倍為六十秒，全局 450 秒。實作並未如此\u2014\u2014每個月都是三十秒，因此一局是六分鐘，最後一幕比我設計時來得更快。",
    },
  },
  {
    kind: "flow",
    title: "How a Run Moves",
    steps: [
      ["PREPARE", "“Prepare for the first wave!” — the board is quiet and you learn the ground.", "「Prepare for the first wave!」——棋盤安靜，你先熟悉地形。"],
      ["PHASE I", "“YOU + DAD VS. THE BILLS.” He is on your side, and you are counting waves.", "「YOU + DAD VS. THE BILLS」。他站在你這邊，你數著波次。"],
      ["TRANSITION", "“THINGS ARE CHANGING.” Five seconds of fade, and the tiles begin to turn.", "「THINGS ARE CHANGING」。五秒淡出，地塊開始翻面。"],
      ["PHASE II", "“YOU VS. DAD.” The boss health row appears, and the help becomes the fight.", "「YOU VS. DAD」。頭目血條出現，先前的幫助變成了這場戰鬥。"],
    ],
  },
  {
    kind: "callout",
    title: "Two Lines Carry the Whole Thing",
    en: "The HUD says “YOU + DAD VS. THE BILLS”, and later it says “YOU VS. DAD”. I never wrote the premise down anywhere else in the game; those two strings do it in eight words. Everything else I built — the loan meter, the tiles that flip, the anger bar — is there to make the second line land.",
    zh: "HUD 先寫「YOU + DAD VS. THE BILLS」，之後寫「YOU VS. DAD」。遊戲裡沒有任何其他地方陳述這個前提；這兩行字用八個詞說完，而其餘一切——貸款計量、會翻面的地塊、憤怒條——都是為了讓第二行成立。",
  },
  {
    kind: "spec-table",
    title: "Where Money Comes From",
    intro: {
      en: "I split income three ways because receiving money should not always mean the same thing. What you take decides which pressure comes back.",
      zh: "我把收入拆成三種，因為拿到錢不該永遠代表同一件事。你拿的是哪一種，決定了之後回來的是哪一種壓力。",
    },
    head: ["Source", "What you do", "What it costs later", "In the build"],
    rows: [
      ["Work", "Reach the briefcase and finish the task before the money lands.", "Nothing — but it costs the seconds you spent standing still.", "DADWorkPoint"],
      ["Allowance", "Walk over the coins DAD drops in his own territory.", "Nothing, if you pick them all up before the month ends.", "DADAllowanceSpawner"],
      ["Loan", "Shoot DAD when you are out of ammunition and take what he gives.", "It is tracked separately and comes back as boss health in Phase II.", "DADWallet · DADLoanRepaymentPoint"],
    ],
    note: {
      en: "Coins you leave on the floor when the month rolls over stop being allowance and become loan. I wanted forgetting to collect to cost exactly what borrowing costs, because that is how it works.",
      zh: "月份翻頁時仍留在地上的硬幣，會從零用錢變成貸款。忘了撿，等同於借了。",
    },
  },
  {
    kind: "spec-table",
    title: "Shooting Costs Money",
    intro: {
      en: "There is no separate ammunition. The gun spends the wallet, so every shot is a small purchase and running dry is a budgeting failure rather than a combat one.",
      zh: "遊戲沒有獨立的彈藥。槍花的是錢包裡的錢，所以每一發都是一筆小額支出，打光了是預算失誤，而不是戰鬥失誤。",
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
    zh: "父親會定時發射一連串咒罵，每一句命中都會扣掉 Drive。總共三句：「That\u2019s MY FUXKing Money.」「I Put FOOD on the table.」「Only BAD KIDS talk back.」我把傷害模型建立在它們之上，好讓第一階段裡最傷你的東西根本不是敵人\u2014\u2014而是被這樣說話。",
  },
  {
    kind: "flow",
    title: "What Happens When the Month Turns",
    steps: [
      ["COINS", "Any allowance still on the floor becomes loan, and the converted coins are cleared.", "任何仍留在地上的零用錢會轉為貸款，已轉換的硬幣隨即清除。"],
      ["BILLS", "Any bill you did not pay or kill that month goes straight to DAD.", "當月沒有付掉或擊殺的帳單，會直接跑到父親那裡。"],
      ["ANGER", "His anger is recalculated from the loans and the unpaid bills that reached him, then pushed to the HUD.", "依據貸款與抵達他那裡的未付帳單重算憤怒值，再送到 HUD 顯示。"],
      ["NEXT LIST", "The next month's bill list is prepared and spawned.", "準備並生成下個月的帳單清單。"],
    ],
  },
  {
    kind: "diagram",
    title: "How Angry He Gets",
    label: "DAD ANGER STATE",
    svg: angerDiagram,
    caption: {
      en: "Anger runs 0–100 through four bands and drifts back down half a point per in-game day. Every bill you let reach him and every loan you leave uncollected pushes it up. I built it this way so that Phase II would never read as a scripted twist — by the time it arrives, it is simply the sum of a year of small conveniences you chose to accept.",
      zh: "憤怒值在 0–100 之間分四段，並以每遊戲日 0.5 的速度自行回落。每一張讓他碰到的帳單、每一筆沒收走的貸款都會推高它——所以第二階段並不是預設的劇情轉折，而是一整年小小方便累積出來的總和。",
    },
  },
  {
    kind: "text",
    title: "How Phase II Is Built Out of Phase I",
    paragraphs: [
      {
        en: "When the eleventh month arrives, DAD reads two numbers off the year you just played: how much loan you still carry, and how much anger you accumulated. Those two values generate his health bars. A loan that was never repaid is finalised \u2014 it stops being money you owe and becomes a segment of the boss you have to shoot through.",
        zh: "第十一個月到來時，父親會從你剛玩完的這一年裡讀取兩個數字：你還背著多少貸款，以及你累積了多少憤怒。這兩個值生成他的血條。沒有還掉的貸款會被定案\u2014\u2014它不再是你欠的錢，而變成你必須打穿的一段頭目血量。",
      },
      {
        en: "At the same moment the map turns over. Every DAD-linked tile flips back to its original state, and only the ground you bought yourself is retained as beneficial. You can repay a loan at any point before that settlement; after it, the number is fixed and it is standing in front of you.",
        zh: "同一時刻地圖翻面。所有與父親連結的地塊回到原始狀態，只有你自己買下的土地保留為有利地形。在結算之前你隨時可以償還貸款；結算之後數字就定死了，而且正站在你面前。",
      },
      {
        en: "The diagram is explicit that the player should see this coming: subtitles run through Phase I showing DAD's impending state and the challenges it will bring. Getting blindsided is the one outcome the design was trying to avoid \u2014 and, as the playtests below show, the one it kept producing.",
        zh: "圖表明確要求玩家應該預見這件事：第一階段全程有字幕顯示父親即將進入的狀態與隨之而來的挑戰。「被打個措手不及」是設計最想避免的結果\u2014\u2014而下方的測試記錄顯示，它恰恰一再發生。",
      },
    ],
  },
  {
    kind: "spec-table",
    title: "The Bills",
    intro: {
      en: "I shipped four kinds of bill, and made each one a different enemy — different movement, different way of reaching you — so that a month of debt never feels like one repeated problem.",
      zh: "遊戲中實作了四種帳單，每一種都是有自己移動方式與接近手段的敵人。",
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
      zh: "稅是我最在意的一條規則：你這個月為了活下去花得越爽快，這筆花費為下個月買來的浪潮就越大。",
    },
  },
  {
    kind: "spec-table",
    title: "The Ground Is Not Neutral",
    intro: {
      en: "I gave every square four properties and had the HUD read them out as you stand on it — “HOME · FIRING ALLOWED · FAST GROUND”. I did not want territory to be decoration: where you stand should change what you are allowed to do.",
      zh: "每一格都帶有四項屬性，你站上去時 HUD 會直接讀出來——「HOME · FIRING ALLOWED · FAST GROUND」。領地不是裝飾，它決定你能做什麼。",
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
      zh: "進入第二階段時，與父親連結的地塊會反過來對你不利，只有你自己付錢買下的地面保有優勢。這就是整部作品的論點用地圖說出來：獨立，就是棋盤上你自己買下的那一塊。",
    },
  },
  {
    kind: "text",
    title: "What Playtesters Could Not Read",
    paragraphs: [
      {
        en: "The Week 11 board records what testers said, and most of it is about legibility rather than difficulty. They did not know when DAD entered his second phase, or when he had become the enemy. They could not tell what the different floor tiles did. They ran out of ammunition without noticing, and once the enemies piled up they said the board looked like a mess. One tester summed up the failure exactly: they knew they had to act constantly, but not which action to take.",
        zh: "第 11 週的板子記錄了測試者的說法，而多數意見都關於「看不看得懂」而不是「難不難」。他們不知道父親何時進入第二階段，也不知道他何時變成了敵人；分不清不同地塊的作用；彈藥見底卻沒察覺，敵人一多就說畫面像一團亂。有位測試者精準地總結了這個失敗：他們知道必須不停行動，卻不知道該做哪一個動作。",
      },
      {
        en: "One line went the other way. A tester said they loved paying bills with gold coins — the single moment where the metaphor and the mechanic were the same gesture. That is the part I am protecting while I fix the rest.",
        zh: "只有一句話是反方向的。一位測試者說他很喜歡用金幣付帳單的感覺——那是隱喻與機制合為同一個動作的唯一時刻。修其他部分的時候，我要保住的就是這裡。",
      },
    ],
  },
  {
    kind: "text",
    title: "The Diagram and the Build Disagree",
    paragraphs: [
      {
        en: "The Week 11 diagram names classes I never wrote — Player.cs, Work.cs, Rent.cs, WaterBill.cs. What shipped is seventy files under a DAD prefix with a different shape: DADWallet holds cash, allowance and loan as separate ledgers; DADMonthResolver and DADYearResolver do the settling; DADPhaseManager owns the turn. Rent survived only as an inactive panel still sitting in the scene.",
        zh: "第 11 週的圖表點名了一些我從未寫過的類別——Player.cs、Work.cs、Rent.cs、WaterBill.cs。真正實作出來的是七十個以 DAD 為前綴、結構不同的檔案：DADWallet 把現金、零用錢與貸款分成三本獨立帳；DADMonthResolver 與 DADYearResolver 負責結算；DADPhaseManager 掌管回合。Rent 只以一個仍留在場景裡、未啟用的面板形式倖存。",
      },
      {
        en: "The clock drifted too. The diagram sets a 450-second run by doubling Phase II months to sixty seconds; DADTimeSystem ships one uniform value with no phase awareness at all, so the finale runs at the same speed as January and the whole year is six minutes. I only found that by reading the two side by side.",
        zh: "時鐘也偏移了。圖表把第二階段的月份加倍為六十秒，全局 450 秒；而 DADTimeSystem 只有一個統一數值、完全沒有階段判斷，因此終章與一月同速，整年是六分鐘。這是我把兩者並排讀才發現的。",
      },
      {
        en: "I kept the old canvas objects in the scene rather than deleting them, and rebuilt them in Figma as editable components beside the shipped HUD. The runtime hides them through DADGameplayHUD.HideLegacyGraphics(); they are still there because the handmade version is the thing I am iterating away from, and I want to be able to see both.",
        zh: "我沒有刪掉舊的 canvas 物件，而是把它們留在場景裡，並在 Figma 中重建為可編輯元件，與正式 HUD 並列。執行時由 DADGameplayHUD.HideLegacyGraphics() 隱藏它們；之所以保留，是因為手工版正是我逐步離開的起點，而我希望能同時看見兩者。",
      },
    ],
  },
  {
    kind: "callout",
    title: "A Console for the Numbers",
    en: "Every value on this page is tuned through an editor window I built for the project — thirteen categories from Player and Weapon through Economy and Flow, reading and writing serialized fields by reflection with undo, prefab overrides and preset snapshots, without touching a line of game logic. It exists because a game about money needs its economy adjustable in the same session it is played.",
    zh: "這一頁上的每個數值，都透過我為本專案自建的編輯器視窗調整——從 Player、Weapon 到 Economy、Flow 共十三個分類，以反射讀寫序列化欄位，支援復原、prefab override 與預設快照，且不動任何一行遊戲邏輯。它之所以存在，是因為一款關於金錢的遊戲，必須能在同一次遊玩中即時調整它的經濟。",
  },
]
