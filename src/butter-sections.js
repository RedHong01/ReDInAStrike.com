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
      zh: "在 Dairyville 尘土飞扬的田野上，一场延续数百年的锦标赛再度甦醒，要选出新的冠军。你站在搅乳桶前，双手握住搅杆，跟着节拍搅动。搅得太快，桶就会卡住——这时你要用搅杆敲击桶身两侧把它弄开，再继续。",
    },
    right: {
      title: "My part",
      en: "Andrew built the first controller out of a laundry basket and wrote the game. I designed and built the second generation — the wooden barrel this page is about — and the physical computing inside it.",
      zh: "Andrew 用洗衣篮做出了第一代控制器，并负责游戏程式。我设计并制作了第二代——也就是这一页谈的木桶——以及它内部的实体运算。",
    },
  },
  {
    kind: "system-grid",
    title: "The Loop, in Three Verbs",
    items: [
      ["CHURN", "Work the rod up and down in time with the beat. The meter fills while you stay on rhythm.", "跟着节拍上下推动搅杆。只要维持节奏，计量条就会累积。"],
      ["JAM", "Rush it and the churn seizes. The meter stops, and so do you.", "操之过急，桶就会卡死。计量条停止，你也停下。"],
      ["BANG", "Strike the rod against the side of the barrel to break the jam and resume.", "用搅杆敲击桶身侧面，解除卡死并恢复搅动。"],
    ],
  },
  {
    kind: "flow",
    title: "Two Generations of Controller",
    steps: [
      ["V1 — ANDREW", "A laundry basket with a rod through it. Enough to prove the churning motion was worth building a game around.", "一个中间插着搅杆的洗衣篮。足以证明「搅动」这个动作值得为它做一款游戏。"],
      ["THE PROBLEM", "A basket does not feel like a churn. The gap between the object in your hands and the thing on screen was the whole design problem.", "但篮子摸起来不像搅乳桶。手中之物与荧幕之物的落差，正是整个设计问题所在。"],
      ["V2 — RED", "A wooden barrel built to the size and weight of a real churn, with the circuitry hidden inside the handle.", "一个依照真实搅乳桶尺寸与重量制作的木桶，线路藏在手柄内部。"],
    ],
  },
  {
    kind: "image",
    image: "assets/case-study/butter-controller-blue.jpg",
    alt: "The finished PlayerBlue controller — a faceted wooden barrel with rivet bands, nameplate and directional arrows",
    label: "V2 / PLAYERBLUE",
    caption: {
      en: "The second-generation controller finished: a faceted barrel with rivet bands, the nameplate and directional arrows on the lid, and the wiring running up through the handle rod.",
      zh: "完成后的第二代控制器：多面桶身、铆钉带、桶盖上的铭牌与方向箭头，线路沿着搅杆向上穿出。",
    },
  },
  {
    kind: "diagram",
    title: "The Controller in Section",
    label: "CONTROLLER DESIGN",
    svg: churnDiagram,
    caption: {
      en: "I sized it to the waist so a player stands upright, grips both handles, and has to bend slightly to churn — the posture does most of the work of making it feel like labour. The handle stick is cut on a table saw with the blade set to 15°, which opens a cavity for the wiring and keeps the contact stable while the rod is being gripped and shoved.",
      zh: "我把高度定在腰部，让玩家站直、双手握把，并且必须略微弯身才能搅动——光是这个姿势，就完成了「这是劳动」的大半说服力。搅杆以台锯斜切 15 度，借此让出走线空间，并在搅杆被握住、推压时维持接点稳定。",
    },
  },
  {
    kind: "spec-table",
    title: "Tools and Procedures",
    intro: {
      en: "Four steps, and each one is a decision about how the object should feel rather than how it should look.",
      zh: "四个步骤，而每一步都是关于「这个物件应该有什么手感」的决定，而不是关于它该长什么样。",
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
      zh: "两组 logo、PlayerRed 与 PlayerBlue 铭牌，以及所有方向箭头，都从同一张板材上切出、上色后才取下。那些箭头是这个物件给你的唯一说明。",
    },
  },
  {
    kind: "spec-table",
    title: "What Each Contact Sends",
    intro: {
      en: "Three contacts per controller, two controllers, six keys. The game reads nothing else.",
      zh: "每个控制器三个接点，两个控制器共六个按键。游戏不读取其他任何输入。",
    },
    head: ["Contact", "Player 1", "Player 2", "Action"],
    rows: [
      ["Bottom of the barrel", "S", "Down Arrow", "The churn stroke. This is the one that keeps the meter filling."],
      ["Left side pad", "A", "Left Arrow", "Strike left to break a jam."],
      ["Right side pad", "D", "Right Arrow", "Strike right to break a jam."],
    ],
    note: {
      en: "The circuit diagram on the fabrication board labels both bottom contacts “Down Arrow”. That is right for player 2 and wrong for player 1, whose bottom contact sends S in the shipped code. The drawing was made once and reused for the second panel without relabelling.",
      zh: "制作板上的电路图把两个底部接点都标成「Down Arrow」。这对玩家 2 是正确的，对玩家 1 则是错的——在实作程式中，玩家 1 的底部接点送出的是 S。那张图画过一次后被复制到第二个面板，却没有改标签。",
    },
  },
  {
    kind: "spec-table",
    title: "What Testing Broke, and What I Changed",
    intro: {
      en: "Players found the churning funny and the loop simple enough to hold. Three things went wrong, and four changes came out of them.",
      zh: "玩家觉得搅动的动作很好笑，循环也简单到能撑住。但有三件事出了问题，并由此产生四项修改。",
    },
    head: ["What went wrong", "What I changed", "Retested?"],
    rows: [
      ["Exceptionally loud — wood slamming on wood every time a jam was cleared.", "Padded the end of the churning stick.", "No"],
      ["Players wanted more agency, and did not understand how to unstick the churn.", "Expanded the side touchpads so side-strikes register more readily.", "No"],
      ["Wire hookups broke during testing.", "Rebuilt the wiring to survive rowdier play.", "No"],
      ["Meter response did not match what hands were doing.", "Retuned fill rates and timing against the controller inputs.", "No"],
    ],
    note: {
      en: "None of the four has been back in front of players yet. The first thing I would test is the jam: whether players now work out on their own how to free the churn, because that is where they got stuck.",
      zh: "这四项修改都还没有再交到玩家手上。我最先要测的是卡住的那一刻：玩家现在能不能自己想到怎么把搅乳桶敲开，因为他们正是在那里卡住的。",
    },
  },
  {
    kind: "image",
    image: "assets/case-study/butter-controller-red.jpg",
    alt: "The PlayerRed controller, the second of the matched pair",
    label: "V2 / PLAYERRED",
    caption: {
      en: "The second of the pair. Two identical builds in opposing colours is what makes the local competition legible before anyone reads a screen.",
      zh: "成对中的第二台。两台构造相同、颜色相对的控制器，让本地对战在任何人看荧幕之前就已经一目了然。",
    },
  },
  {
    kind: "callout",
    title: "Working With Andrew",
    en: "Andrew built the first controller and wrote the game; I took the lead on the second controller, and we split the work the way the object splits — his code, my barrel. When testing turned up the noise, the broken wiring and the jam nobody could clear, the fixes on the barrel side were mine. In his words from our final presentation: “Collaboration went smoothly with Red doing an incredible job taking the lead on revising the controller.”",
    zh: "Andrew 做了第一代控制器，也写了游戏；第二代控制器由我主导，我们按照这个物件本身的结构分工——他负责代码，我负责木桶。测试暴露出噪音太大、线路断开、没人知道怎么把卡住的桶敲开这些问题时，木桶这一侧的修改都是我做的。用他在我们期末展示里的原话：“Collaboration went smoothly with Red doing an incredible job taking the lead on revising the controller.”",
  },
  {
    kind: "text",
    title: "What Is Built, and What Is Waiting",
    paragraphs: [
      {
        en: "Our work split cleanly between the screen and the object. Andrew's five commits in early December are the game; my half is the barrel in your hands, built with a table saw and a soldering iron. In a controller game, the half players meet first is the object.",
        zh: "我们的分工在屏幕和实物之间划得很清楚。Andrew 在十二月初的五次提交就是游戏本身；我的那一半，是你握在手里的木桶，用台锯和烙铁做出来。在控制器游戏里，玩家最先接触到的，正是实物那一半。",
      },
      {
        en: "The versus mode is built but not yet in the playable build: the scene with a second churn sits in the project while the build ships the single-player scene. The two matched controllers were made for that head-to-head, so switching it on is the next step for the game.",
        zh: "对战模式已经做好，但还没有进入可玩版本：带第二个搅乳桶的场景在项目里，而目前打包的是单人场景。两台成对的控制器本来就是为这场正面对决而做的，所以把它打开，就是这个游戏的下一步。",
      },
    ],
  },
]
