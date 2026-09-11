// Shroom Pot Showdown — the drawer case study.
// Sources: the team's GDD and controller/visual study (Figma 174btXmgZagM2UU2Ud7TXz),
// the two playtest surveys in Drive — "Shroom Pot Showdown3.0 (Responses)",
// 18 responses on 2026-03-22, and "Shroom Pot Showdown4.0 (Responses)", 21
// responses 2026-04-05 → 04-22 — and the team repository's history between them
// (Spring26(T6)/Alt Control 2/Git/AltControl2_TeamC_MushroomGame). Every count
// below was tallied from the response sheets by reference/shroom-playtest-tally.py.
// Chinese is written in Simplified — see tbc-sections.js for why.

export const shroomSections = [
  {
    kind: "copy-grid",
    left: {
      title: "Two Players / Two Reads",
      en: "The mushroom leans and bounces to survive. The chopstick player tries to catch it. Countdown, lives, hunger, and a shared pot turn a simple physical setup into a chase.",
      zh: "蘑菇玩家通过倾斜与弹跳求生；筷子玩家则试图捕捉它。倒数、生命、饥饿与共享的锅，把简单的实体装置变成一场追逃。",
    },
    right: {
      title: "Player Experience",
      en: "The fun should come from reading the other player — when to dodge, commit to a catch, or change direction. If either controller needs constant correction, that attention leaves the chase.",
      zh: "游戏的乐趣应该来自读懂对手：什么时候闪避、什么时候抓取，以及什么时候改变方向。如果任一控制器需要持续修正，玩家的注意力就会离开追逃本身。",
    },
  },
  {
    kind: "video",
    video: "assets/videos/shroom-pot-result.mp4",
    poster: "assets/case-study/shroom-gameplay.png",
    alt: "Shroom Pot Showdown gameplay recording",
    label: "GAMEPLAY VIDEO / CURRENT POT CHASE / FULL RECORDING 0:42",
    caption: {
      en: "The full recording of the chase: both roles share the pot while the countdown, lives, and hunger states change around them.",
      zh: "追逃过程的完整录像：两个角色共享同一口锅，倒数、生命与饥饿状态在周围持续变化。",
    },
  },
  {
    kind: "video",
    video: "assets/videos/shroom-pot-two-player.mp4",
    poster: "assets/case-study/shroom-gameplay.png",
    alt: "Shroom Pot Showdown two-player controller recording",
    label: "GAMEPLAY VIDEO / GYROCONTROL V2 TOGETHER / FULL RECORDING 0:29",
    caption: {
      en: "This recording shows both players’ physical inputs beside the shared game view, making it possible to compare a body movement with the response on screen.",
      zh: "这段录像同时拍到两位玩家的身体输入与共享游戏画面，可以直接对照身体动作和屏幕上的回应。",
    },
  },
  {
    kind: "text",
    title: "Design Problem",
    paragraphs: [
      {
        en: "My playtest notes describe the mushroom movement as unstable, overly sensitive, and difficult to aim. Players spent time correcting the controller instead of dodging or predicting the chopsticks.",
        zh: "我的测试笔记形容蘑菇移动不稳定、过度敏感，也很难瞄准。玩家花时间修正控制器，而不是闪避筷子或预判下一次夹取。",
      },
      {
        en: "The March playtest put a finer point on it. In that build, leaning the yoga ball rotated the mushroom’s view rather than moving it: leaning forward tipped the view instead of carrying the mushroom anywhere. The team rewrote the mapping so that leaning forward moves the mushroom forward — the day before the April playtest, which is the version 19 of April’s 21 players tried. Both rounds are below.",
        zh: "三月的测试把问题说得更具体。那一版里，倾斜瑜伽球转动的是蘑菇的视角，而不是让它移动：向前倾只会让视角俯仰，蘑菇却哪里也去不了。团队把映射重写成向前倾就向前走——就在四月测试的前一天完成，四月 21 位玩家中有 19 位玩到的正是这一版。两轮结果都在下面。",
      },
    ],
  },
  {
    kind: "copy-grid",
    left: {
      title: "My Responsibility",
      en: "I owned the mushroom controller's physical base and gyro setup. I built the base on a half yoga ball, prepared the port for the gyro, helped connect the two screens and Arduinos for the playtest, and supplied the 3D mushroom assets.",
      zh: "我负责蘑菇控制器的实体底座与陀螺仪设置。我把底座装在半个瑜伽球上，准备陀螺仪接口，协助连接测试用的两台屏幕和 Arduino，并提交了蘑菇的 3D 资产。",
    },
    right: {
      title: "A Team Problem",
      en: "The controller was only one part of the problem. The team also had to make the tutorial, chopstick feedback, sound, story beats, wiring, and physical setup readable at the same time. My work had to stay connected to those shared player-facing questions.",
      zh: "控制器只是问题的一部分。团队还要同时让教程、筷子反馈、声音、故事节奏、线路和现场装置都变得易懂。我的工作必须持续回应这些共同面对玩家的问题。",
    },
  },
  {
    kind: "image",
    image: "assets/case-study/shroom-playtest-setup.jpg",
    alt: "Shroom Pot Showdown playtest setup with the physical controller, two screens, and the game tutorial",
    label: "TEAM C / PLAYTEST SETUP / 19 APRIL 2026",
    caption: {
      en: "A team playtest setup: the physical controller in front of the game screens, with the tutorial running for the next player. Every setting we tested was built so a stranger could walk up and play without us explaining it.",
      zh: "团队测试现场：实体控制器摆在游戏屏幕前，教程正为下一位玩家播放。我们测试的每一个现场，都是为了让陌生人走过来就能玩，不需要我们在旁边解释。",
    },
  },
  {
    kind: "evidence-table",
    title: "How Feedback Became a Shared Build",
    intro: {
      en: "The collaboration was a chain of small decisions rather than one handoff. I kept my physical work tied to the same player questions the rest of the team was solving.",
      zh: "这次协作不是一次交接，而是一连串小决定。我把实体制作持续连接到团队其他成员正在解决的同一组玩家问题。",
    },
    rows: [
      ["04/02 · Shared priority", { en: "J Andarza's Discord checklist named the next playtest priorities: clearer chopstick UI, a tutorial, a storyboard, sound, a readable 90° hand turn, and stronger goals, pacing, and risk/reward. It gave the team one shared problem list before anyone split the work.", zh: "J Andarza 在 Discord 列出了下一次测试前的共同优先事项：更清楚的筷子 UI、教程、storyboard、声音、可读的 90° 手部转向，以及更明确的目标、节奏和风险回报。团队先有了共同问题清单，再拆分工作。" }],
      ["04/10–04/15 · My work package", { en: "I built the mushroom base on a half yoga ball, prepared the gyro opening, and helped set up two screens and the Arduinos at 242. That work mattered only when another teammate could test the movement and report what was still unclear.", zh: "我把蘑菇底座装在半个瑜伽球上，准备陀螺仪开口，并协助在 242 教室连接两台屏幕和 Arduino。它只有在队友能够实际测试移动并反馈哪里仍然不清楚时才真正有用。" }],
      ["04/15 · Player-facing feedback", { en: "Jason reported four connected problems after testing: the chopstick and button wires tangled, tutorial pages moved too quickly, the mushroom turn was unclear, and missing voice-over could reduce player focus. The team treated these as design and production problems together.", zh: "测试后 Jason 报告了四个相互关联的问题：筷子和按钮的线缆会缠绕、教程页面翻得太快、蘑菇转向不清楚，以及缺少 voice-over 可能降低玩家注意力。团队把它们同时当作设计和制作问题处理。" }],
      ["04/18 · Debug loop", { en: "In WeChat, DUO reported that the settlement text was still overlapping. 软隽辰 suggested disabling four cubes in the pot and table to isolate the movement issue, then asked for the result after the next push. The exchange records report → isolate → test → report back, including the conflict that remained.", zh: "在微信里，DUO 报告结算页面文字仍然重叠。软隽辰建议先禁用锅和桌子里的四个 cube 来隔离 movement 问题，再让对方在下一次 push 后回报结果。这段记录了报告 → 隔离 → 测试 → 回报，也保留了仍然存在的 conflict。" }],
      ["04/21 · Story and timing decision", { en: "Jason argued that the story could not simply be cut because each storyboard page needed a corresponding line. 软隽辰 pointed out that a three-frame animation lasting nine seconds was too slow, and Julia supplied a shorter five-beat script. The shared decision kept the story beats while reducing the time each tutorial moment occupied.", zh: "Jason 认为故事不能直接删掉，因为每一页 storyboard 都需要对应的文字。软隽辰指出三帧动画播放九秒太慢，Julia 随后提供了更短的五段脚本。团队保留了故事节点，同时减少每个教程时刻占用的时间。" }],
      ["Where it landed", { en: "This chain ran through April, between the three sessions the charts below compare with March. Problems went into the chat, teammates answered them, and the next session was how we checked.", zh: "这条链贯穿整个四月，穿插在下面图表里和三月对照的三次试玩之间：问题发到群里，队友接手回应，再用下一次试玩来检验。" }],
    ],
  },
  {
    kind: "copy-grid",
    left: {
      title: "What I Changed About My Role",
      en: "I used to describe physical-computing work as a handoff: document my circuit and let the team continue. This sprint made the limitation visible. A base, a gyro port, or a cable layout is not finished when it exists; it is finished when another teammate can test it, describe the player-facing result, and use that observation to make the next decision.",
      zh: "过去我常把实体运算工作描述成交接：记录电路，然后让团队继续。这次冲刺让我看见了这个局限。底座、陀螺仪接口或线路布局不是“做出来”就结束，而是要让队友能够测试、描述玩家看到的结果，并把观察带回下一次决定。",
    },
    right: {
      title: "What I Would Test Next",
      en: "Next I would run the same short task before and after each change — steering forward, reading the tutorial, catching with the chopsticks — so the team could see which fix actually made the chase easier to read.",
      zh: "下一步，我会在每次修改前后让玩家做同一个短任务——向前控制蘑菇、读懂教程、用筷子夹取——这样团队就能看出，究竟是哪一处修改让这场追逐更容易看懂。",
    },
  },
  {
    kind: "survey",
    title: "Two Rounds of Playtests",
    intro: {
      en: "The team ran the same survey after each round: 18 players on one afternoon in March, 21 across three sessions in April. Most questions were asked both times, so the rounds can be read against each other. They were not the same players, and these are small groups — the bars show what each room said, not a measured effect.",
      zh: "团队在每一轮测试后都发了同一份问卷：三月一个下午的 18 位玩家，四月三场测试共 21 位玩家。大部分题目两次都有问，所以两轮可以对照着读。两轮不是同一批玩家，人数也不多——这些长条呈现的是每一轮现场的说法，而不是经过测量的效果。",
    },
    rounds: [
      { key: "mar", label: "March", short: "Mar", date: "22 March 2026", n: 18 },
      { key: "apr", label: "April", short: "Apr", date: "5–22 April 2026", n: 21 },
    ],
    figures: [
      { value: "39", label: { en: "survey responses: 18 on 22 March, 21 between 5 and 22 April", zh: "份问卷回答：3 月 22 日 18 份，4 月 5 日至 22 日 21 份" } },
      { value: "7/18 → 10/19", label: { en: "enjoyed the mushroom yoga ball more than the chopsticks", zh: "更喜欢蘑菇瑜伽球，而不是筷子" } },
      { value: "7/18 → 12/21", label: { en: "named steering the mushroom the hardest part of the game", zh: "认为控制蘑菇是游戏中最难的部分" } },
      { value: "8/18 → 6/21", label: { en: "said the controller always or mostly did what they expected", zh: "表示控制器总是或大多如预期般回应" } },
    ],
    likert: [
      {
        en: "How easy was it to understand how to use the controller?",
        zh: "理解控制器的用法有多容易？",
        scale: ["Very easy", "Easy", "Neutral", "Difficult", "Very difficult"],
        poles: [2, 1, 0, -1, -2],
        counts: { mar: [5, 5, 6, 1, 1], apr: [1, 7, 8, 5, 0] },
      },
      {
        en: "Did the controller respond to your movements as expected?",
        zh: "控制器是否如你预期地回应你的动作？",
        scale: ["Always", "Mostly", "Sometimes", "Rarely"],
        poles: [2, 1, 0, -1],
        counts: { mar: [0, 8, 8, 2], apr: [1, 5, 12, 3] },
      },
      {
        en: "How stable did the movement feel with the mushroom controller?",
        zh: "使用蘑菇控制器时，移动感觉有多稳定？",
        scale: ["Very stable", "Mostly stable", "Neutral", "Slightly unstable", "Very unstable"],
        poles: [2, 1, 0, -1, -2],
        counts: { mar: [1, 5, 8, 3, 1], apr: [4, 5, 7, 4, 1] },
      },
      {
        en: "Was it clear when the chopsticks grabbed or released an ingredient?",
        zh: "筷子夹住或放开食材时，是否清楚？",
        scale: ["Very clear", "Mostly clear", "Slightly clear", "Not clear at all"],
        poles: [2, 1, -1, -2],
        counts: { mar: [5, 8, 2, 2], apr: [5, 8, 3, 3] },
        blank: { mar: 1, apr: 2 },
      },
      {
        en: "Were you able to understand how the game works overall?",
        zh: "你是否理解整个游戏如何运作？",
        scale: ["Yes", "Mostly", "Not really"],
        poles: [2, 1, -1],
        counts: { mar: [13, 4, 1], apr: [13, 7, 1] },
      },
    ],
    dumbbells: [
      {
        en: "Which controller did you enjoy more?",
        zh: "你更喜欢哪一个控制器？",
        base: { mar: 18, apr: 19 },
        blank: { mar: 0, apr: 2 },
        items: [
          { label: "Mushroom yoga ball", zh: "蘑菇瑜伽球", mar: 7, apr: 10 },
          { label: "Giant chopsticks", zh: "巨型筷子", mar: 5, apr: 5 },
          { label: "Both equally", zh: "两个都喜欢", mar: 6, apr: 4 },
        ],
        note: { en: "Share of those who answered: all 18 in March, 19 of 21 in April.", zh: "以作答人数计算：三月 18 人全数作答，四月 21 人中有 19 人作答。" },
      },
      {
        en: "Which part of the game felt the most challenging?",
        zh: "游戏中哪个部分最有挑战？",
        base: { mar: 18, apr: 21 },
        items: [
          { label: "Controlling the mushroom", zh: "控制蘑菇", mar: 7, apr: 12 },
          { label: "Working the chopsticks", zh: "操作筷子", mar: 2, apr: 4 },
          { label: "Avoiding the chopsticks", zh: "躲开筷子", mar: 3, apr: 3 },
          { label: "The boiling zones", zh: "沸腾区域", mar: 2, apr: 2 },
          { label: "Understanding the game", zh: "理解游戏", mar: 2, apr: 0 },
          { label: "Other or no answer", zh: "其他或未作答", mar: 2, apr: 0 },
        ],
        note: { en: "One March answer named both the boiling zones and the chopsticks; it is counted under “other”.", zh: "三月有一份回答同时写了沸腾区域和筷子，归入“其他”。" },
      },
    ],
    quotes: {
      mar: [
        { en: "“I instinctively wanted to move forward by tilting it.”", zh: "“我直觉地想靠倾斜让它往前走。”" },
        { en: "“mushroom keeps spinning”", zh: "“蘑菇一直在转圈”" },
        { en: "“Rather than turning the camera, it’d be better if the yoga ball only moved the mushroom, with a fixed overhead camera.”", zh: "“与其转动镜头，不如让瑜伽球只负责移动蘑菇，镜头固定在上方。”" },
        { en: "“Probably try to use some other sensors to actually track the chopsticks’ position instead of tilt.”", zh: "“也许可以用别的传感器去追踪筷子的实际位置，而不是靠倾斜。”" },
        { en: "“There should be more of an indication for the boiling meter as I had no idea that was a mechanic.”", zh: "“沸腾计量表应该更明显一点，我完全不知道那是一个机制。”" },
      ],
      apr: [
        { en: "“The mushroom direction control felt a bit clumsy, especially the turning.”", zh: "“蘑菇的方向控制有点笨拙，尤其是转向。”" },
        { en: "“I wish the chopsticks could just be moved like real chopsticks, rather than tilting it to move it.”", zh: "“真希望筷子能像真的筷子一样移动，而不是靠倾斜来移动。”" },
        { en: "One tester, writing in Chinese: players often meant to move forward and the mushroom spun in place; the separate jump button felt odd and should be built into the ball; the short, twitchy jump broke the flow.", zh: "一位测试者写道：“经常有玩家明明想向前移动但是蘑菇原地旋转”；那个单独的跳跃键怪怪的，“不如把跳跃整合到瑜伽球上”；距离很短的抽动式跳跃破坏了操作流畅性。" },
        { en: "“I think this team is the most ambitious when it comes to making interesting controllers, but I’d definitely appreciate more responsive mushroom direction controls.”", zh: "“我觉得这个团队在做有趣的控制器这件事上最有野心，但我确实希望蘑菇的方向控制能更灵敏。”" },
      ],
    },
    extraTables: [
      {
        en: "How fun was the gameplay?",
        head: ["Answer", "March (18)", "April (21)"],
        rows: [["Very fun", "6", "6"], ["Fun", "8", "12"], ["Neutral", "2", "3"], ["Slightly fun", "2", "0"]],
      },
      {
        en: "The tutorial — asked once in March, once per controller in April",
        head: ["Answer", "March", "April, mushroom", "April, chopsticks"],
        rows: [
          ["Very clear", "8", "—", "—"],
          ["Mostly clear", "8", "—", "—"],
          ["Somewhat confusing", "2", "—", "—"],
          ["Clear and short", "—", "10", "8"],
          ["Clear but long / long but clear", "—", "7", "8"],
          ["Written answer", "—", "4", "3"],
          ["No answer", "—", "0", "2"],
        ],
      },
    ],
    note: {
      en: "Counts from the team’s two response sheets, Shroom Pot Showdown 3.0 and 4.0. Of April’s 21 responses, 2 were collected on 5 April, before the movement rewrite, and 19 on 15 and 22 April.",
      zh: "数字出自团队的两份回应表：Shroom Pot Showdown 3.0 与 4.0。四月的 21 份回答中，2 份收集于 4 月 5 日、移动方式改写之前，另外 19 份收集于 4 月 15 日和 22 日。",
    },
  },
  {
    kind: "spec-table",
    title: "What Changed Between the Rounds",
    intro: {
      en: "The team repository shows what went into the build between the two surveys, and March’s answers show why.",
      zh: "团队的代码仓库记录了两次问卷之间放进版本里的改动，而三月的回答说明了原因。",
    },
    head: ["Date", "Change", "What March said"],
    rows: [
      ["2 April", "Two tutorials, one per controller; the game waits until both players have finished theirs.", "Two players found the tutorial “somewhat confusing”; one never realised the boiling meter was a mechanic."],
      ["5 April", "I reworked the controller calibration overlay and added switching between P1 and P2.", "Only 8 of 18 said the controller mostly did what they expected; others asked for longer cables and more responsive gyro input."],
      ["14 April", "Leaning the ball forward now moves the mushroom forward. Before, the lean rotated the view.", "“I instinctively wanted to move forward by tilting it.” — “mushroom keeps spinning”"],
      ["15 April", "I added full-screen across multiple monitors for the playtest day.", "—"],
    ],
    note: {
      en: "April’s answers read both ways. The ball became the favourite controller, and more players named steering the mushroom as the hardest part — leaning now both moves and turns the mushroom, and players could not always tell which one they were asking for.",
      zh: "四月的回答两面都有。瑜伽球成了最受欢迎的控制器，同时更多玩家认为控制蘑菇是最难的部分——现在向前倾既会让蘑菇前进、也会让它转向，玩家不一定分得清自己在下哪一个指令。",
    },
  },
  {
    kind: "source-breakdown",
    title: "One Pot, Two Kinds of Pressure",
    source: "FIGMA / GAME DESIGN DOCUMENT / 102:487",
    lead: {
      en: "In the original GDD, both players share a countdown but manage different pressures. The mushroom protects its lives and avoids the pot’s heat. The chopstick player manages hunger while trying to catch, hold, and eat. The values below describe that design version; they are not a balance result from the current build.",
      zh: "原始 GDD 让两位玩家共享倒数，却面对不同的压力。蘑菇保护生命并躲避锅中的热度；筷子玩家则一边维持饥饿值，一边尝试捕捉、握住并吃掉食物。以下数值属于这一版设计，并不代表目前的版本已完成平衡测试。",
    },
    blocks: [
      {
        title: "Mushroom / Player 1",
        en: "The mushroom starts with three lives. Being caught and eaten removes one life. Staying in the boiling water raises Cook Level; the lower area raises it faster, the upper area raises it more slowly, and leaving the water stops it. When Cook Level reaches its limit, the mushroom loses a life.",
        zh: "蘑菇从三条生命开始。被筷子抓住并吃掉会失去一条生命。留在沸水里会增加 Cook Level；下层增加较快，上层增加较慢，离开水面则停止增加。Cook Level 到达上限时，蘑菇会失去一条生命。",
      },
      {
        title: "Chopsticks / Player 2",
        en: "The chopsticks move on two axes. Bringing the tips together triggers a catch. Holding a caught item for two seconds eats it; releasing earlier lets it fall back into the pot. Eating raises hunger by 20%, while hunger drains when the player is not eating.",
        zh: "筷子可以在两个轴向上移动。两支筷子尖端碰到一起时会触发捕捉。抓住物件后维持两秒会吃掉它，提早放开则会让物件掉回锅里。吃东西会增加 20% 饥饿值，没有进食时饥饿值会下降。",
      },
      {
        title: "Pressure States",
        en: "Below 20% hunger, the chopsticks player enters an illusion state such as ghosting, chromatic aberration, camera shake, or lost control. Above 80%, the player becomes too full and cannot move or catch for five seconds. The pressure is shared, but the decision is asymmetric.",
        zh: "饥饿值低于 20% 时，筷子玩家会进入幻觉状态，例如残影、色差、镜头晃动或失去控制。高于 80% 时，玩家会过饱，五秒内不能移动或捕捉。两位玩家共享同一个压力，但决策是不对称的。",
      },
      {
        title: "Pot and Food",
        en: "Every five seconds, one area of the water boils and pushes submerged food upward. Vegetables take longer to chew, tofu takes a medium time, and meat is quicker. This gives the chopsticks player changing targets while the mushroom reads where the pressure is about to move.",
        zh: "每五秒，锅里会有一个区域开始沸腾，把水下的食物往上推。蔬菜需要较长的咀嚼时间，豆腐是中等时间，肉类较快。这让筷子玩家持续面对变动的目标，也让蘑菇需要预判压力即将移向哪里。",
      },
    ],
  },
  {
    kind: "source-breakdown",
    title: "Physical Input and Visual Language",
    source: "FIGMA / CONTROLLER + VISUAL STUDY / 731:34 · 731:52 · 436:2485 · 436:2590",
    lead: {
      en: "The controller proposal maps one physical cause to one visible game response. The yoga-ball sensor reads tilt for turning and acceleration for jumping. The chopsticks sensor maps gyro X/Y to movement, while a button detects the tips coming together and separates catch from the two-second eat action.",
      zh: "控制器提案把一个身体动作对应到一个可见的游戏反应。瑜伽球里的传感器用倾斜控制转向，用加速度触发跳跃。筷子控制器把陀螺仪 X/Y 对应到移动，再用按钮区分筷子碰合时的捕捉与两秒后的进食。",
    },
    blocks: [
      {
        title: "Mushroom Input",
        en: "Lean left or right to turn. Bounce to jump in the current facing direction. The proposed parts are a gyroscope, accelerometer, mini module board, and Arduino board. Since 14 April, leaning forward and back also moves the mushroom forward and back.",
        zh: "向左或向右倾斜来转向，弹跳来朝目前面向的方向跳跃。提案使用陀螺仪、加速度计、小型模块板与 Arduino 主板。从 4 月 14 日起，向前或向后倾斜也会让蘑菇前进或后退。",
      },
      {
        title: "Chopsticks Input",
        en: "Tilt the giant chopsticks to move through gyro X and Y. Press the enlarged button once to catch. Hold it for two seconds to eat. The contact surface is enlarged so the catch action does not depend on a tiny switch.",
        zh: "倾斜巨型筷子，通过陀螺仪 X/Y 移动。按一下加大的按钮来捕捉，按住两秒来进食。按钮增加了接触面积，让捕捉不依赖一个难以按中的小开关。",
      },
      {
        title: "Visual and UI Direction",
        en: "The visual study calls for minimal lines, cute flat shapes, paper or fabric-like texture, warm medium-saturation colors, large color blocks, and ingredients with distinct faces. The GDD compares Fredoka and Baloo; the selected direction is Baloo 2 for the game UI.",
        zh: "视觉研究提出简约线条、可爱的扁平形状、纸张或布料质感、中饱和的暖色、大色块，以及有明确表情的食材。GDD 比较了 Fredoka 与 Baloo，游戏 UI 最后选择 Baloo 2。",
      },
    ],
  },
  {
    kind: "flow",
    title: "Intent → March → Change → April",
    steps: [
      ["INTENT", "Make body movement part of the chase", "让身体动作成为追逃的一部分"],
      ["MARCH · 18 PLAYERS", "Leaning the ball tipped the view; it did not move the mushroom", "倾斜瑜伽球只转动视角，并不让蘑菇前进"],
      ["CHANGE", "Lean forward to move; two tutorials; calibration", "向前倾即前进；两套教学；控制器校准"],
      ["APRIL · 21 PLAYERS", "The ball became the favourite; steering became the hardest part", "瑜伽球成了最受欢迎的控制器；转向成了最难的部分"],
    ],
  },
  {
    kind: "callout",
    title: "What April Left Open",
    en: "Steering is the open problem, and April says where it lives: moving and turning now share one ball, and players cannot always tell which one they are asking for — the mushroom spins in place when they mean to go forward. The jump belongs on the ball rather than on a separate button, and the chopsticks need a control closer to how chopsticks actually move. The tutorial is right in content and wrong in pace: too fast for some, and one page turned before a player had finished reading it.",
    zh: "转向是尚未解决的问题，而四月的回答指出了它在哪里：移动和转向现在共用一颗球，玩家不一定分得清自己在下哪一个指令——明明想往前走，蘑菇却在原地打转。跳跃应该整合到球上，而不是另设一个按键；筷子需要一种更接近真实用法的控制方式。教学的内容是对的，节奏却不对：有人觉得太快，还有一页在玩家读完之前就自己翻过去了。",
  },
]
