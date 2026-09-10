// Butter Beatdown 2: No Churning Back — the drawer case study.
// Sources: the 13-page final presentation (Canva DAG7pWgtJyI, read from the local
// PDF export), the fabrication board (Figma AltControl 368:2 "FInalProject"), and
// the Unity project + git history at Fall25(T5)/Alt Controller/FinalAssignment.
// Authorship of the two controller generations confirmed by Red, 2026-09-10.

const ink = "var(--case-ink)"
const accent = "color-mix(in srgb, var(--case-accent, var(--case-ink)) 55%, transparent)"
const accentSoft = "color-mix(in srgb, var(--case-accent, var(--case-ink)) 26%, transparent)"

const churnDiagram = `
<svg viewBox="0 0 520 260" role="img" aria-label="The controller in section: waist-high barrel, handle cut at fifteen degrees, contacts in the lid and on both sides">
  <g font-family="var(--type-subtitle-font)" font-size="9" letter-spacing="0.06em" fill="${ink}">
    <path d="M170 96 L350 96 L336 236 L184 236 Z" fill="${accentSoft}" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>
    <ellipse cx="260" cy="96" rx="90" ry="14" fill="none" stroke="${ink}" stroke-width="1.1"/>
    <rect x="252" y="18" width="16" height="80" fill="${accent}" stroke="${ink}" stroke-width="1"/>
    <line x1="252" y1="34" x2="268" y2="26" stroke="${ink}" stroke-width="0.9"/>
    <text x="286" y="26">HANDLE STICK — BLADE SET 15°</text>
    <text x="286" y="40">CUT LEAVES A CAVITY FOR WIRING</text>
    <circle cx="260" cy="96" r="5" fill="${ink}"/>
    <text x="286" y="100">BOTTOM CONTACT — THE CHURN STROKE</text>
    <rect x="164" y="150" width="12" height="34" fill="${accent}" stroke="${ink}" stroke-width="1"/>
    <rect x="344" y="150" width="12" height="34" fill="${accent}" stroke="${ink}" stroke-width="1"/>
    <text x="20" y="146">SIDE PAD</text><text x="368" y="146">SIDE PAD</text>
    <text x="20" y="172">BANG HERE</text><text x="368" y="172">TO UNJAM</text>
    <line x1="120" y1="96" x2="120" y2="236" stroke="${ink}" stroke-width="0.8" stroke-dasharray="3 3"/>
    <text x="20" y="200">WAIST</text><text x="20" y="214">HEIGHT</text>
    <text x="20" y="252">STAND UPRIGHT · GRIP THE HANDLES · BEND SLIGHTLY TO CHURN</text>
  </g>
</svg>`

export const butterSections = [
  {
    kind: "copy-grid",
    left: {
      title: "Brief",
      en: "In the dusty fields of Dairyville a centuries-old tournament reawakens to find its new champion. You stand over a butter churn, take the rod in both hands, and churn to the beat. Churn too fast and the churn jams — then you bang the rod against the sides of the barrel to free it and keep going.",
      zh: "在 Dairyville 塵土飛揚的田野上，一場延續數百年的錦標賽再度甦醒，要選出新的冠軍。你站在攪乳桶前，雙手握住攪桿，跟著節拍攪動。攪得太快，桶就會卡住——這時你要用攪桿敲擊桶身兩側把它弄開，再繼續。",
    },
    right: {
      title: "My part",
      en: "Andrew built the first controller out of a laundry basket and wrote the game. I designed and built the second generation — the wooden barrel this page is about — and the physical computing inside it.",
      zh: "Andrew 用洗衣籃做出了第一代控制器，並負責遊戲程式。我設計並製作了第二代——也就是這一頁談的木桶——以及它內部的實體運算。",
    },
  },
  {
    kind: "system-grid",
    title: "The Loop, in Three Verbs",
    items: [
      ["CHURN", "Work the rod up and down in time with the beat. The meter fills while you stay on rhythm.", "跟著節拍上下推動攪桿。只要維持節奏，計量條就會累積。"],
      ["JAM", "Rush it and the churn seizes. The meter stops, and so do you.", "操之過急，桶就會卡死。計量條停止，你也停下。"],
      ["BANG", "Strike the rod against the side of the barrel to break the jam and resume.", "用攪桿敲擊桶身側面，解除卡死並恢復攪動。"],
    ],
  },
  {
    kind: "flow",
    title: "Two Generations of Controller",
    steps: [
      ["V1 — ANDREW", "A laundry basket with a rod through it. Enough to prove the churning motion was worth building a game around.", "一個中間插著攪桿的洗衣籃。足以證明「攪動」這個動作值得為它做一款遊戲。"],
      ["THE PROBLEM", "A basket does not feel like a churn. The gap between the object in your hands and the thing on screen was the whole design problem.", "但籃子摸起來不像攪乳桶。手中之物與螢幕之物的落差，正是整個設計問題所在。"],
      ["V2 — RED", "A wooden barrel built to the size and weight of a real churn, with the circuitry hidden inside the handle.", "一個依照真實攪乳桶尺寸與重量製作的木桶，線路藏在手柄內部。"],
    ],
  },
  {
    kind: "image",
    image: "assets/case-study/butter-controller-blue.jpg",
    alt: "The finished PlayerBlue controller — a faceted wooden barrel with rivet bands, nameplate and directional arrows",
    label: "V2 / PLAYERBLUE",
    caption: {
      en: "The second-generation controller finished: a faceted barrel with rivet bands, the nameplate and directional arrows on the lid, and the wiring running up through the handle rod.",
      zh: "完成後的第二代控制器：多面桶身、鉚釘帶、桶蓋上的銘牌與方向箭頭，線路沿著攪桿向上穿出。",
    },
  },
  {
    kind: "diagram",
    title: "The Controller in Section",
    label: "CONTROLLER DESIGN",
    svg: churnDiagram,
    caption: {
      en: "I sized it to the waist so a player stands upright, grips both handles, and has to bend slightly to churn — the posture does most of the work of making it feel like labour. The handle stick is cut on a table saw with the blade set to 15°, which opens a cavity for the wiring and keeps the contact stable while the rod is being gripped and shoved.",
      zh: "我把高度定在腰部，讓玩家站直、雙手握把，並且必須略微彎身才能攪動——光是這個姿勢，就完成了「這是勞動」的大半說服力。攪桿以台鋸斜切 15 度，藉此讓出走線空間，並在攪桿被握住、推壓時維持接點穩定。",
    },
  },
  {
    kind: "spec-table",
    title: "Tools and Procedures",
    intro: {
      en: "Four steps, and each one is a decision about how the object should feel rather than how it should look.",
      zh: "四個步驟，而每一步都是關於「這個物件應該有什麼手感」的決定，而不是關於它該長什麼樣。",
    },
    head: ["Step", "What I did", "Why"],
    rows: [
      ["Measurement", "Fixed the controller at waist height.", "So a player stands upright, grips the handles, and bends slightly — the churning motion has to cost something."],
      ["Material", "Tested 1/8-inch MDF against 1/4-inch MDF.", "1/8 inch is the maximum the Laser Lab can cut. Anything thicker needs other methods, so the choice sets the whole fabrication route."],
      ["Integration", "Routed the edges, then sanded.", "The lid and the barrel body have to align exactly, or the churn binds where it should not."],
      ["Optimisation", "Rotated the table saw blade to 15° to cut the handle stick.", "The angled cut opens internal space for the circuitry and gives a more stable connection when the player grips it."],
      ["Finish", "Laser-cut the logo font and directional symbols, then spray painted.", "The directional symbols are the only instruction the player gets on the object itself."],
    ],
  },
  {
    kind: "image",
    image: "assets/case-study/butter-laser-sheet.jpg",
    alt: "A laser-cut MDF sheet holding both logo lockups, the player nameplates and the directional arrow symbols, spray painted",
    label: "LASER CUT / SPRAY PAINT",
    caption: {
      en: "Both logo lockups, the PlayerRed and PlayerBlue nameplates and every directional arrow, cut from one sheet and painted before being freed from it. The arrows are the only instruction the object gives you.",
      zh: "兩組 logo、PlayerRed 與 PlayerBlue 銘牌，以及所有方向箭頭，都從同一張板材上切出、上色後才取下。那些箭頭是這個物件給你的唯一說明。",
    },
  },
  {
    kind: "spec-table",
    title: "What Each Contact Sends",
    intro: {
      en: "Three contacts per controller, two controllers, six keys. The game reads nothing else.",
      zh: "每個控制器三個接點，兩個控制器共六個按鍵。遊戲不讀取其他任何輸入。",
    },
    head: ["Contact", "Player 1", "Player 2", "Action"],
    rows: [
      ["Bottom of the barrel", "S", "Down Arrow", "The churn stroke. This is the one that keeps the meter filling."],
      ["Left side pad", "A", "Left Arrow", "Strike left to break a jam."],
      ["Right side pad", "D", "Right Arrow", "Strike right to break a jam."],
    ],
    note: {
      en: "The circuit diagram on the fabrication board labels both bottom contacts “Down Arrow”. That is right for player 2 and wrong for player 1, whose bottom contact sends S in the shipped code. The drawing was made once and reused for the second panel without relabelling.",
      zh: "製作板上的電路圖把兩個底部接點都標成「Down Arrow」。這對玩家 2 是正確的，對玩家 1 則是錯的——在實作程式中，玩家 1 的底部接點送出的是 S。那張圖畫過一次後被複製到第二個面板，卻沒有改標籤。",
    },
  },
  {
    kind: "spec-table",
    title: "What Testing Broke, and What I Changed",
    intro: {
      en: "Players found the churning funny and the loop simple enough to hold. Three things went wrong, and four changes came out of them.",
      zh: "玩家覺得攪動的動作很好笑，循環也簡單到能撐住。但有三件事出了問題，並由此產生四項修改。",
    },
    head: ["What went wrong", "What I changed", "Retested?"],
    rows: [
      ["Exceptionally loud — wood slamming on wood every time a jam was cleared.", "Padded the end of the churning stick.", "No"],
      ["Players wanted more agency, and did not understand how to unstick the churn.", "Expanded the side touchpads so side-strikes register more readily.", "No"],
      ["Wire hookups broke during testing.", "Rebuilt the wiring to survive rowdier play.", "No"],
      ["Meter response did not match what hands were doing.", "Retuned fill rates and timing against the controller inputs.", "No"],
    ],
    note: {
      en: "None of the four were put back in front of players. The presentation records the changes, not their effect, and I would rather say that here than let a list of fixes imply a result it never measured.",
      zh: "這四項修改都沒有再次交到玩家手上驗證。簡報記錄的是「改了什麼」，而不是「改得有沒有用」；與其讓一串修正清單暗示一個從未被量測過的結果，我寧可在這裡把話說明白。",
    },
  },
  {
    kind: "image",
    image: "assets/case-study/butter-controller-red.jpg",
    alt: "The PlayerRed controller, the second of the matched pair",
    label: "V2 / PLAYERRED",
    caption: {
      en: "The second of the pair. Two identical builds in opposing colours is what makes the local competition legible before anyone reads a screen.",
      zh: "成對中的第二台。兩台構造相同、顏色相對的控制器，讓本地對戰在任何人看螢幕之前就已經一目了然。",
    },
  },
  {
    kind: "callout",
    title: "What My Teammate Wrote",
    en: "Andrew's own line in the final presentation: “Collaboration went smoothly with Red doing an incredible job taking the lead on revising the controller.” I am quoting it as what he wrote, not as evidence that the collaboration worked — the term reviewer made exactly that distinction, and he was right to. What the record does support is the handover itself: his basket, my barrel.",
    zh: "Andrew 在期末簡報中的原話：「Collaboration went smoothly with Red doing an incredible job taking the lead on revising the controller.」我引用它，是把它當作「他寫下的話」，而不是「協作有效的證據」——期末評審正是做了這個區分，而他是對的。這份記錄真正能支撐的，是那次交接本身：他的籃子，我的木桶。",
  },
  {
    kind: "text",
    title: "What the Repository Says, and What It Cannot",
    paragraphs: [
      {
        en: "The git history holds five commits between 2 and 10 December 2025, all of them Andrew's. Mine are not there and were never going to be — my work was a barrel, a table saw and a soldering iron. A code repository is simply the wrong instrument for measuring half of this project, and it is worth saying so rather than letting an empty commit log stand as a verdict.",
        zh: "Git 歷史裡有五個提交，時間在 2025 年 12 月 2 日至 10 日之間，全部出自 Andrew。我的提交不在其中，而且本來也不會在——我的工作是一個木桶、一台台鋸和一支烙鐵。程式碼倉庫本來就不是衡量這個專案另一半的正確儀器；與其讓一份空白的提交紀錄充當判決，不如把這件事講清楚。",
      },
      {
        en: "One thing the project files do show plainly: the versus scene exists but is not in the build. SampleScene 1.unity holds 75 objects including a second churn, against 39 in the single-player scene — and the build settings enable only the single-player one. The two-controller competition the presentation is built around is finished work sitting outside the shipping configuration.",
        zh: "專案檔案倒是明白顯示了一件事：對戰場景存在，但不在建置設定裡。SampleScene 1.unity 有 75 個物件、包含第二個攪乳桶，相較之下單人場景只有 39 個——而建置設定只啟用了單人那一個。簡報整份圍繞的雙控制器對戰，其實是一份完成了、卻被留在出貨設定之外的工作。",
      },
    ],
  },
]
