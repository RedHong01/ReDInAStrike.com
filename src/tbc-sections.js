// To Be Chosen — the drawer case study.
// Sources: the Storytelling For Games final presentation (Figma Slides
// wSwsDkCUN6ki055dD6gZpG, read from the 12-page local PDF export, including the
// casting photographs embedded in it); the POV Switch Chart; the Narrative Design
// Vision Document (2nd iteration), Story Summary and Attack Revision Plan in
// Google Drive "My Drive/Narrative Design"; and the Sprint 3 barks spreadsheet
// (Team 2). Character text is quoted from Red's own slides. The casting
// photographs are third-party references, shown only through the site's
// halftone at Red's request and credited where the deck credits them.
// Chinese is written in Simplified: the page renders zh-Hans, and the site's
// Traditional-to-Simplified table does not cover every character used here.

export const tbcSections = [
  {
    kind: "copy-grid",
    left: {
      title: "Brief",
      en: "A cheer squad — the Pink Stars — places at the World Tour preliminaries, one point short of winning, and boards the bus home. The bus breaks down. The driver goes missing. The village that takes them in has done this before. To Be Chosen is a survival horror told through whichever girl is carrying the scene — and the horror is not that one of them turns on the others. It is that the world already decided something before they arrived.",
      zh: "啦啦队 Pink Stars 在世界巡回预赛中拿到名次——离冠军只差一分——然后坐上回家的巴士。巴士抛锚，司机失踪，而收留她们的村庄，这种事早已做过不止一次。《To Be Chosen》是一款生存恐怖游戏，由当下承载该场戏的那个女孩来叙述——恐怖不在于她们之中有人背叛，而在于这个世界在她们抵达之前就已经做好了决定。",
    },
    right: {
      title: "My role",
      en: "Narrative Director on a team of four — with Jinqi Chang producing and Kris Kuerten and Bedi Ruan writing. I owned the perspective structure: who sees what, in which order, and what the player is left holding that no single character has.",
      zh: "四人团队中的叙事总监——Jinqi Chang 担任制作人，Kris Kuerten 与 Bedi Ruan 担任编剧。我负责视角结构：谁看见什么、以什么顺序看见，以及玩家最终握有的、任何单一角色都不具备的那份认知。",
    },
  },
  {
    kind: "callout",
    title: "The Structural Idea",
    en: "Every significant beat is played through one character's limited viewpoint, so each girl ends the story holding an incomplete account. The player is the only entity who sees all of them. That is the whole design: not a mystery the characters solve, but a picture only the person holding the controller can assemble.",
    zh: "每一个关键节点都透过某一个角色的受限视角来玩，因此每个女孩在故事结束时握有的都是不完整的说法。玩家是唯一看见全部的存在。这就是整个设计：它不是一桩由角色解开的谜，而是一幅只有握着手把的人才能拼起来的画。",
  },
  {
    kind: "flow",
    title: "It Started as One Girl",
    steps: [
      ["SPRING 2025", "The first version is single-protagonist: Mia alone breaks into the town, alone finds out what the elders do to outsiders, alone goes back for Sarah.", "最初的版本是单主角：Mia 独自闯入村庄、独自查明长老们对外来者做了什么、再独自回去救 Sarah。"],
      ["THE PROBLEM", "One girl who sees everything is a mystery she solves for you. Nothing is withheld, so nothing has to be pieced together.", "一个看见一切的女孩，等于替你把谜解完了。没有东西被保留，也就没有东西需要拼凑。"],
      ["FALL 2025", "Rebuilt around five limited viewpoints. Each girl now ends the story with a partial account, and the assembly moves to the player.", "以五个受限视角重建。每个女孩最终握有的都是片面的说法，而拼合的工作交给了玩家。"],
      ["WHAT REMAINED", "My own revision pass found discovery still clustering on Mia. The old shape had not fully left the new one.", "我自己的修订发现，「发现」仍然聚集在 Mia 身上。旧的形状并没有真正离开新的结构。"],
    ],
  },
  {
    kind: "acts",
    title: "The Story the Revision Kept",
    intro: {
      en: "The revision changed who sees what, not what happens. My attack plan puts it in one line — preserve the plot beats, restructure the information flow — and rules out touching the premise, the two leads, or the cheerleading payoff in Act III. These are the twenty beats that survived, from the story summary.",
      zh: "修订改变的是谁看见什么，而不是发生了什么。我的修订计划用一句话说清楚：保留情节节点，重构信息的流动——并且明确不动前提、不动两位主角，也不动第三幕的啦啦队高潮。以下是留存下来的二十个节点，出自故事大纲。",
    },
    acts: [
      {
        label: "ACT I",
        name: "The Bus",
        span: 3,
        beats: [
          { n: 1, en: "They place, one point short of winning. On the bus home, Mia and Alexis argue over leadership and whose fault the point was.", zh: "她们拿到名次，离冠军只差一分。回程的巴士上，Mia 与 Alexis 为领导权、也为那一分该算谁的而争执。" },
          { n: 2, en: "Coach Sarah calms them down. The cracks stay.", zh: "Sarah 教练让她们冷静下来，裂痕却留着。" },
          { n: 3, en: "A storm kills the power, and the bus is stranded overnight in a mountain village buried in fog.", zh: "暴风雨让巴士断电，她们被困在一座浓雾笼罩的山村里过夜。" },
          { n: 4, en: "The villagers are kind. Elder Theo offers hot food and beds, and Alexis leads the squad into accepting.", zh: "村民很亲切。Theo 长老端上热食、备好床铺，Alexis 带着全队接受了这份款待。" },
          { n: 5, en: "At dawn Sarah is gone, her bed untouched. Mia finds proof she was taken, not lost.", zh: "天亮时 Sarah 不见了，床铺没有被睡过的痕迹。Mia 找到了证据：她不是走失，而是被带走的。" },
        ],
        quote: { en: "“We don’t always win, but we rise together.”", zh: "“我们不一定每次都赢，但我们一起站起来。”", who: "Coach Sarah" },
      },
      {
        label: "ACT II",
        name: "The Village",
        span: 6,
        split: true,
        beats: [
          { n: 6, en: "The squad decides Sarah went for help and brushes Mia off. She is on her own.", zh: "全队认定 Sarah 是去求救了，没有理会 Mia。她只剩自己一个人。" },
          { n: 7, en: "Mia follows clues past chalk-marked doors to a forbidden cellar: ritual markings, bones, a victim’s journal.", zh: "Mia 循着线索、经过一扇扇画着粉笔符号的门，找到一间禁地地窖：仪式记号、骸骨，还有一本受害者的日记。" },
          { n: 8, en: "In Sarah’s abandoned bag, a ledger lists Sarah for tonight’s sacrifice.", zh: "在 Sarah 留下的包里，一本名册把她列为今晚的祭品。" },
          { n: 9, en: "Mia accuses Alexis of blind trust. The squad splits; only Jodie quietly stays with her.", zh: "Mia 指责 Alexis 盲目信任。队伍就此分裂，只有 Jodie 默默站在她这边。" },
          { n: 10, en: "Mia goes into the underground sanctuary alone.", zh: "Mia 独自潜入地下圣所。" },
          { n: 11, en: "Masked elders catch her trying to free Sarah. Alexis, who followed her, is caught too.", zh: "她在试图救出 Sarah 时被戴面具的长老们抓住。一路尾随的 Alexis 也一起被抓。" },
          { n: 12, en: "Malachi praises Mia’s spirit and names her the perfect vessel — the next sacrifice.", zh: "Malachi 赞赏 Mia 的意志，称她为完美的容器——下一个祭品。" },
          { n: 13, en: "Chained together, the two captains finally talk. Mia doubts herself more than anyone; Alexis has always been afraid of being outdone.", zh: "被锁在一起的两位队长终于开口。Mia 比任何人都怀疑自己；Alexis 则一直害怕被人比下去。" },
          { n: 14, en: "Brianna and Jodie, guilty and suspicious of Theo, crawl through a shaft, knock out a guard and free them.", zh: "心怀愧疚、又对 Theo 起疑的 Brianna 与 Jodie 爬过通风管，打晕守卫，救出了她们。" },
          { n: 15, en: "The four regroup with no weapons — only stunts, timing and trust.", zh: "四人重新集结。她们没有武器，只有特技、时机与信任。" },
        ],
      },
      {
        label: "ACT III",
        name: "The Ritual",
        span: 3,
        beats: [
          { n: 16, en: "Midnight. The village gathers; Sarah lies bound at the centre of the altar.", zh: "午夜。村民聚集，Sarah 被绑在祭坛中央。" },
          { n: 17, en: "Disguised in a robe, Mia drops from the rafters and cuts Sarah free while the squad draws the guards off.", zh: "披着长袍乔装的 Mia 从屋梁上落下，割断 Sarah 的绳索，队友们则把守卫引开。" },
          { n: 18, en: "Alexis sends a torch down the aisle with her baton. Malachi meets Mia with sorrow, not anger.", zh: "Alexis 用指挥棒把火把打落在走道上。Malachi 迎向 Mia，脸上不是愤怒，而是悲伤。" },
          { n: 19, en: "Away from the altar his power thins — it was the belief as much as the ritual. The squad lands the move it missed at the competition, and Mia shatters the relic.", zh: "一离开祭坛，他的力量便开始消退——支撑它的除了仪式，还有信仰。她们完成了比赛时没能做出的高难度动作，Mia 击碎了圣物。" },
          { n: 20, en: "The elders begin to age, the altar collapses, and at sunrise Mia drives them home.", zh: "长老们开始衰老，祭坛崩塌。日出时分，Mia 开车载着大家回家。" },
        ],
        quote: { en: "“You think your trust will save you.” — “No. I know it has saved me.”", zh: "“你以为你的信任会救你。”——“不，我知道它已经救了我。”", who: "Malachi / Mia" },
      },
    ],
    note: {
      en: "The summary was written for the single-protagonist version, so most of these beats are Mia’s. The chart below is what Act I becomes once the same beats are divided between five viewpoints.",
      zh: "这份大纲写于单主角版本，所以多数节点都属于 Mia。下面的图表，就是同样的节点分给五个视角之后，第一幕变成的样子。",
    },
  },
  {
    kind: "image",
    image: "assets/tbc/pov-switch-chart.jpg",
    alt: "The To Be Chosen POV switch chart — a filmstrip timeline showing which character carries each scene",
    label: "POV SWITCH CHART / GAME TIME TIMELINE",
    caption: {
      en: "The chart I built to hold the structure, drawn for Act I — from the argument on the bus to the morning the squad decides to wait for Sarah. Five playable characters, each with a colour; every plot point names the POV and who else is present, and overlapping dots are scenes shared inside one viewpoint. Game time runs left to right, but a character’s own narrative need not — it can flash back or forward inside her POV.",
      zh: "我为维持这个结构所做的图表，画的是第一幕——从巴士上的争吵，到全队决定原地等 Sarah 回来的那个早晨。五位可玩角色各有配色；每个情节点都标明由谁的视角进行、以及还有谁在场，重叠的圆点代表在同一视角内共享的场景。游戏时间由左向右推进，但角色自身的叙事不必如此——它可以在自己的视角内闪回或闪前。",
    },
  },
  {
    kind: "pov-lanes",
    title: "Act I, Re-cut by Viewpoint",
    intro: {
      en: "The chart, set as type so it can be read. One row per plot point, one lane per playable character, in the chart’s own colours. The shape to look for is the middle: once the squad settles into the village it splits into two threads — Alexis and Brianna in one, Mia, Jodie and Sarah in the other — and neither thread sees the other’s night. Brianna’s choice at the end of hers is exactly that: whether to tell.",
      zh: "把图表排成文字，好让它能被读。每一行是一个情节点，每一条泳道是一位可玩角色，沿用图表原本的配色。值得看的形状在中段：全队在村子里安顿下来之后，便分成两条线——一条是 Alexis 和 Brianna，另一条是 Mia、Jodie 和 Sarah——而两条线都看不见对方的那一夜。Brianna 在她那条线尽头的选择，正是这件事：要不要说出来。",
    },
    lanes: [
      { key: "mia", name: "Mia", color: "#cb5180" },
      { key: "alexis", name: "Alexis", color: "#c6bc52" },
      { key: "brianna", name: "Brianna", color: "#5594c7" },
      { key: "jodie", name: "Jodie", color: "#7eb843" },
      { key: "sarah", name: "Sarah", color: "#9e60c2" },
    ],
    beats: [
      { scene: "SC 1–2", pov: "mia", present: ["alexis", "brianna", "jodie", "sarah"], with: "+ side characters", en: "The squad argues all the way until the driver goes missing.", zh: "全队一路争吵，直到司机失踪。" },
      { scene: "SC 3", pov: "mia", present: ["alexis", "brianna", "jodie"], en: "The bus is down. Mia has everyone inspect the damage; Alexis notices faint lights moving in the forest.", zh: "巴士抛锚了。Mia 让大家检查损坏情况；Alexis 注意到远处森林里有微弱的光在移动。" },
      { scene: "SC 3–4", pov: "sarah", with: "alone", en: "Sarah goes to check on the driver and finds road signs by the breakdown — and villagers who heard about the accident and came to look. She rejoins the team afterwards.", zh: "Sarah 下车查看司机，在抛锚处附近发现了路标——还有听说出事、赶来查看的村民。之后她回到队伍。" },
      { scene: "SC 4", pov: "alexis", present: ["mia", "brianna", "jodie", "sarah"], with: "+ side characters", en: "With Sarah back, the girls settle into the village, meet the villagers and learn their way around.", zh: "Sarah 回来后，女孩们在村子里安顿下来，与村民攀谈，逐渐熟悉环境。" },
      { scene: "SC 4–5", pov: "alexis", present: ["brianna"], en: "Alexis wants some fun. At last she doesn’t have to sit in a bus seat.", zh: "Alexis 想找点乐子——终于不用再坐在巴士座位上了。" },
      { scene: "SC 4–5", pov: "mia", present: ["jodie", "sarah"], en: "Mia and Sarah learn the village’s history from the locals, and that it has long been a rest stop for backpackers passing through.", zh: "Mia 和 Sarah 从村民那里得知村子的历史，也得知这里一直是长途背包客的歇脚处。" },
      { scene: "SC 4–5", pov: "alexis", present: ["brianna"], en: "Alexis finds a local tavern and wants Brianna to come; Brianna is too scared to go.", zh: "Alexis 找到一家当地酒馆，想拉 Brianna 一起去；Brianna 太害怕，不敢去。" },
      { scene: "SC 4–5", pov: "mia", present: ["jodie"], exit: "sarah", en: "Sarah leaves to radio the villagers about the driver’s disappearance, while Mia and Jodie set off to find repair tools.", zh: "Sarah 离开队伍，去用无线电向村民通报司机失踪的事；Mia 和 Jodie 则出发去找修车工具。" },
      {
        scene: "SC 4–5",
        pov: "brianna",
        present: ["alexis"],
        en: "Brianna drags Alexis home just before she leaves for a “bonfire party” with a stranger.",
        zh: "就在 Alexis 要跟一个陌生人去参加“营火派对”之前，Brianna 把她拉回了住处。",
        choice: { en: "Brianna can decide whether to tell Mia and the others what the two of them did tonight.", zh: "Brianna 可以决定，要不要把她们两人今晚做过的事告诉 Mia 和其他人。" },
      },
      { scene: "SC 5", pov: "alexis", present: ["brianna"], en: "Hungover, Alexis says Sarah will come back and they should stay put and wait. She doesn’t feel like looking for her.", zh: "宿醉未醒的 Alexis 说 Sarah 会回来的，大家应该原地等。她不想出去找人。" },
    ],
    note: {
      en: "Transcribed from the chart. Where it repeats a beat under two nodes it is listed once, and Sarah’s exit sits on the beat that says where she went.",
      zh: "据图表转录。图表中同一节点重复出现在两处的，只列一次；Sarah 的离队标在交代她去向的那一个节点上。",
    },
  },
  {
    kind: "system-grid",
    title: "Who Carries the Scenes",
    items: [
      ["MIA THOMPSON", "Seventeen. The agile core of the squad, a teen cheerleader turned reluctant leader, trying to be seen as capable and enough.", "十七岁。队上最灵巧的核心，从啦啦队员被推成不情愿的领袖，努力让自己被看见为「有能力」且「足够」。"],
      ["ALEXIS MONROE", "The other captain. Confident and proud where Mia is meticulous and emotional — the friction between them opens the story.", "另一位队长。Mia 细腻而情绪化，她则自信而骄傲——两人之间的摩擦揭开了整个故事。"],
      ["BRIANNA REYES", "The one who is too scared to go along, and therefore the one who is somewhere else when things happen.", "那个怕到不敢跟上的人——也因此，事情发生时她总在别的地方。"],
      ["JODIE SMITH", "Kept close to Mia and Coach Sarah through the middle of the story, which makes her the corroborating witness.", "故事中段一直待在 Mia 与 Sarah 身边，因而成为那个可以彼此印证的目击者。"],
      ["COACH SARAH", "The adult. She goes to check on the driver, meets the villagers first, and is the first to be missed.", "唯一的大人。她去查看司机的状况、最先遇到村民，也是最先被发现失踪的人。"],
    ],
  },
  {
    kind: "halftone",
    title: "The Cast, and Who I Was Writing Towards",
    intro: {
      en: "Every character sheet in the deck carries a panel of faces I was writing towards before any art existed. The photographs are the originals out of the presentation, run through the site’s own halftone — the effect the catalogue applies to a card that falls outside the selected category — so what survives is the silhouette and the weight. Where the deck named a source I have set it in type; where it did not, I have left it unattributed rather than invent one.",
      zh: "简报里每一份角色设定都附有一组脸孔，那是在任何美术产出之前，我书写时所朝向的样子。这些照片取自简报中的原图，经由网站自身的半调处理——也就是目录对非当前分类卡片所套用的效果——因此留下的是轮廓与份量。简报有注明出处的，我以文字排版标出；没有注明的，我宁可留白，也不替它编一个。",
    },
    cast: [
      {
        span: 7,
        name: "Mia Thompson",
        role: "PROTAGONIST / PLAYABLE",
        copy: {
          en: "Seventeen. The agile core of a west-coast cheer squad, pushed into leading people who did not elect her. Everything she does is bent on being seen as capable, and as enough. She is also the reason the first version of this story did not work: when one girl sees everything, the player has nothing left to assemble.",
          zh: "十七岁。西岸高中啦啦队里最灵巧的核心，被推去领导一群并非选她出来的人。她所做的一切，都在争取被看见为「有能力」与「足够」。她同时也是这个故事第一版失败的原因——当一个女孩看见了一切，玩家就没有东西需要拼凑了。",
        },
        credits: ["Catherine Blades"],
        plates: [
          { image: "assets/tbc/cast/mia-a.jpg", alt: "Competition-floor cheerleader reference for Mia Thompson" },
          { image: "assets/tbc/cast/mia-b.jpg", alt: "Sideline cheerleader reference for Mia Thompson" },
          { image: "assets/tbc/cast/mia-c.jpg", alt: "Candid reference photograph for Mia Thompson" },
        ],
      },
      {
        span: 5,
        name: "Elder Malachi",
        role: "ANTAGONIST",
        copy: {
          en: "Reads sixty to seventy and has lived a long way past it. Once a young scholar after truth and control; the ritual is what he made of the search. What I wanted from the references was the absence of anger — he is never furious with Mia, he is convinced by her, and calls her a perfect vessel as though it were a compliment.",
          zh: "看上去六十到七十岁，实际远远不止。他曾是个追求真理与控制的年轻学者；那套仪式，是他把追寻做成的东西。我要从参考里取的，是「没有怒气」——他从不对 Mia 动怒，他被她说服，并且把「完美的容器」当成一句称赞说出口。",
        },
        credits: ["Judge Turpin — Sweeney Todd", "Sho Murakami — Life", "Saruman — The Lord of the Rings"],
        plates: [
          { image: "assets/tbc/cast/malachi-a.jpg", alt: "Judge Turpin reference for Elder Malachi" },
          { image: "assets/tbc/cast/malachi-b.jpg", alt: "Sho Murakami reference for Elder Malachi" },
          { image: "assets/tbc/cast/malachi-c.jpg", alt: "Saruman reference for Elder Malachi" },
        ],
      },
      {
        span: 4,
        name: "Alexis Monroe",
        role: "PROTAGONIST / PLAYABLE",
        copy: {
          en: "The other captain: confident and composed where Mia is meticulous and emotional. Her pride is the friction that opens the story, and it does not break under argument — it breaks in the dark, tied to Mia, when she admits she has always been afraid of being outdone.",
          zh: "另一位队长：Mia 细腻而情绪化，她则自信而沉稳。她的骄傲是揭开整个故事的摩擦，而它并不因争吵而松动——它松动于黑暗里，当她与 Mia 被绑在一起，承认自己一直害怕被人比下去的时候。",
        },
        plates: [
          { image: "assets/tbc/cast/alexis-a.jpg", alt: "Composed portrait reference for Alexis Monroe" },
          { image: "assets/tbc/cast/alexis-b.jpg", alt: "High-school portrait reference for Alexis Monroe" },
        ],
      },
      {
        span: 4,
        name: "Jodie Smith",
        role: "PROTAGONIST / PLAYABLE",
        copy: {
          en: "Mia’s best friend since elementary and the squad’s quiet moral anchor. She reads the doubt before anyone says it out loud, and she is the one who answers back when Alexis starts. In the barks she is also the one who falls asleep on the bus.",
          zh: "从小学就是 Mia 的挚友，也是队上安静的道德锚点。她在任何人开口之前就读出了那份怀疑，也是 Alexis 一开口就会顶回去的人。在对白里，她同时是那个在车上睡着的人。",
        },
        plates: [
          { image: "assets/tbc/cast/jodie-a.jpg", alt: "Hallway reference photograph for Jodie Smith" },
          { image: "assets/tbc/cast/jodie-b.jpg", alt: "Night-lit reference photograph for Jodie Smith" },
        ],
      },
      {
        span: 4,
        name: "Brianna Reyes",
        role: "PROTAGONIST / PLAYABLE",
        copy: {
          en: "Alexis’s loyal best friend, and the one too frightened to go along — which is exactly why she is somewhere else when things happen, and why her account is the one with the hole in it. Guilt is what eventually sends her into the ventilation shaft.",
          zh: "Alexis 忠实的挚友，也是那个怕到不敢跟上的人——正因如此，事情发生时她总在别的地方，她的说法也就是有缺口的那一份。最后把她送进通风管的，是愧疚。",
        },
        plates: [
          { image: "assets/tbc/cast/brianna-a.jpg", alt: "Close reference portrait for Brianna Reyes" },
        ],
      },
      {
        span: 5,
        name: "Coach Sarah",
        role: "PROTAGONIST / PLAYABLE",
        copy: {
          en: "The only adult on the bus. She goes to check on the driver, meets the villagers first, and is the first to be missed — which makes hers the first viewpoint the player loses.",
          zh: "车上唯一的大人。她去查看司机的状况、最先遇到村民，也是最先被发现失踪的人——因此她的视角，是玩家最先失去的那一个。",
        },
        plates: [
          { image: "assets/tbc/cast/sarah-a.jpg", alt: "Studio reference portrait for Coach Sarah" },
          { image: "assets/tbc/cast/sarah-b.jpg", alt: "Courtside reference photograph for Coach Sarah" },
          { image: "assets/tbc/cast/sarah-c.jpg", alt: "Sideline reference photograph for Coach Sarah" },
        ],
      },
      {
        span: 7,
        name: "Elder Theo",
        role: "ANTAGONIST",
        copy: {
          en: "The kind man who offers the squad hot food and a bed, and the reason Alexis argues for staying put. He is loyal to Malachi and has no idea what he is loyal to — he reads the ritual as sacred legacy and admires the prophet, while quietly hoping to replace him. He is the character the horror needs most: the one whose warmth is real.",
          zh: "那位端上热食与床铺的好心人，也是 Alexis 主张留下的理由。他忠于 Malachi，却完全不知道自己忠于的是什么——他把仪式读成神圣的传承，敬慕那位先知，同时悄悄希望取代他。他是这个恐怖故事最需要的角色：那个温暖是真的的人。",
        },
        plates: [
          { image: "assets/tbc/cast/theo-a.jpg", alt: "Interior reference photograph for Elder Theo" },
          { image: "assets/tbc/cast/theo-b.jpg", alt: "Formal-wear reference photograph for Elder Theo" },
        ],
      },
    ],
    note: {
      en: "These are casting references gathered while writing, not artwork for the game. Driver Bob and teammate Lucy speak in the dialogue sprint but were never given a sheet.",
      zh: "这些是我写作期间搜集的选角参考，并非游戏的美术稿。司机 Bob 与队友 Lucy 在对白冲刺里有台词，但从未拿到一份角色设定。",
    },
  },
  {
    kind: "mechanisms",
    title: "How the Game Tells It",
    intro: {
      en: "The vision document’s thesis is that the horror comes from the world and never from the girls. They bicker, tease and blow up at each other, but none of it is malice, so the weight of the dread falls on the environment and on how they react to it. The document names one primary mechanism and four supporting ones, budgets how much of play each should occupy, and gives every one a worked example in two acts.",
      zh: "愿景文件的论点是：恐怖来自世界，而不是来自女孩们。她们斗嘴、互相取笑、彼此发火，但其中没有恶意——所以恐惧的重量落在环境上，落在她们如何回应环境上。文件列出一个主要机制与四个辅助机制，规划每一个在游戏中所占的比重，并为每一个都在两幕里各写了一个实例。",
    },
    items: [
      {
        role: "PRIMARY",
        name: "Multi-POV Perspective",
        share: 100,
        shareLabel: "THROUGHOUT",
        principle: {
          en: "Control passes between the girls as the plot moves, and not in timeline order. Each viewpoint is a fragment unfolding somewhere else at the same time; groups form and dissolve, and sometimes a single character is a viewpoint on her own. The model is Until Dawn.",
          zh: "操控权随剧情在女孩之间转移，而且不按时间顺序。每个视角都是同一时间在别处展开的碎片；小组聚了又散，有时一个角色独自就是一个视角。参照对象是《Until Dawn》。",
        },
        examples: [
          { label: "ACT I — AFTER THE BUS ACCIDENT", en: "Sarah investigates the missing driver while Alexis holds the bus together, and both timelines run at once. They are split on purpose: Sarah’s investigation is what leads the squad to the village, and the elders watching her do it sets up her capture.", zh: "Sarah 调查失踪的司机，Alexis 则稳住巴士上的局面，两条时间线同时推进。拆开是刻意的：Sarah 的调查把全队带向村子，而长老们看着她调查，为她之后被抓埋下伏笔。" },
          { label: "ACT II — UNDERGROUND AND SURFACE", en: "Brianna and Jodie crawl the ventilation ducts while Mia works out the ritual below. They have to stay silent and move rarely, and the route matters: take the wrong duct and they drop into a different room from the one they were aiming for.", zh: "Brianna 与 Jodie 在通风管里爬行，Mia 则在地下摸清仪式的逻辑。她们必须保持安静、尽量少动，而且路线很关键：选错管道，落下去的就会是另一个房间，而不是她们要去的地方。" },
        ],
      },
      {
        role: "SUPPORTING",
        name: "Environmental Storytelling",
        share: 30,
        shareLabel: "30%",
        principle: {
          en: "The main carrier of the horror, built as the opposite of the girls: constant, cold, mechanical, hostile. I wrote it as the deep sea — pressure, depth, structures you can’t make sense of — with the characters struggling on the surface. Fear comes from reading the space, not from anything anyone says.",
          zh: "恐怖的主要载体，刻意与女孩们相反：恒定、冰冷、机械、充满敌意。我把它写成深海——压力、深度、无法理解的结构——而角色们在水面上挣扎求生。恐惧来自读懂空间，而不是来自任何人说的话。",
        },
        examples: [
          { label: "ACT I — THE VILLAGE INN", en: "An inn that looks abandoned. Teacups with half-drunk stains and lip marks. Every month on the calendar crossed out except tonight. The player understands at once that the threat follows a pattern, not chance.", zh: "一间看似废弃的旅店。茶杯里留着喝了一半的茶渍和唇印。日历上每个月都被划掉，只剩今晚是空白。玩家立刻明白：威胁遵循的是规律，不是偶然。" },
          { label: "ACT II — THE BASEMENT ALTAR", en: "The corridor narrows and the ceiling comes down. Restraints lie on the floor, each with a locked finger slot and a viewing window. The place shows what it is: not a sanctuary, but a prison designed for prey.", zh: "走廊越来越窄，天花板越压越低。地上散落着束具，每一个都有上锁的指槽和观察窗。这个空间终于显露本来面目：它不是圣所，而是一座为猎物设计的监牢。" },
        ],
      },
      {
        role: "SUPPORTING",
        name: "NPC Dialogue",
        share: 30,
        shareLabel: "30% †",
        principle: {
          en: "Micro-friction, then resilience, then alliance. The girls run on old grudges, hidden rivalries and teasing, but faced with a threat this large they choose each other. Their lines carry emotional manoeuvring under pressure, not backstory.",
          zh: "从细小摩擦，到韧性，再到结盟。女孩们之间有旧怨、暗中的较劲和互相取笑，但面对如此巨大的威胁，她们选择了彼此。她们的台词承载的是压力下的情绪角力，而不是背景故事。",
        },
        examples: [
          { label: "ACT I — THE BUS CONFRONTATION", en: "Mia and Alexis’s fight over leadership comes from recognition, insecurity, pride and bias that were simmering long before tonight. The ritual only exploits the rift; it doesn’t create it.", zh: "Mia 与 Alexis 的领导权之争，来自认可、不安、骄傲与偏见——这些早在今晚之前就已积压。仪式只是利用了这道裂缝，并没有制造它。" },
          { label: "ACT II — THE VENTILATION DUCT", en: "Wedged in the dark, Brianna and Jodie bicker about who is taking up the room, and between the jabs tacitly concede Mia might be right — until one of them hears someone below.", zh: "挤在黑暗里的 Brianna 与 Jodie 为谁占了太多地方拌嘴，在你来我往之间默认了 Mia 也许是对的——直到其中一人听见下面有人。" },
        ],
      },
      {
        role: "SUPPORTING",
        name: "Narrative Relics",
        share: 15,
        shareLabel: "15%",
        principle: {
          en: "Victim notes, logs and ledgers. Every text in the world was left by someone the ritual took; the system itself has no voice, and the world only speaks where a life ran out. They are fossil records of failure — the player learns the rules through loss, not exposition.",
          zh: "受害者的笔记、记录与账册。世界里的每一段文字，都出自被仪式带走的人；这套系统本身没有声音，世界只在生命耗尽之处开口。它们是失败的化石记录——玩家透过失去来学习规则，而不是透过由上而下的讲解。",
        },
        examples: [
          { label: "ACT I — THE LIBRARY", en: "Mia finds the diary of a sacrifice from fourteen years ago. Outsiders disappear on a cycle. The town is not malfunctioning; it is working exactly as designed.", zh: "Mia 找到十四年前一名祭品留下的日记。外来者的失踪是周期性的。这座小镇并没有出错——它正完全按照设计运转。" },
          { label: "ACT II — THE COACH’S BAG", en: "Sarah’s bag holds a ledger listing tonight’s sacrifices by name, in order. It isn’t world-building. It’s a countdown.", zh: "Sarah 的包里有一本名册，按顺序列出今晚祭品的名字。那不是世界观，那是倒数。" },
        ],
      },
      {
        role: "SUPPORTING",
        name: "Micro-Cutscenes",
        share: 15,
        shareLabel: "15%",
        principle: {
          en: "Three to six seconds each, a slow reveal in the manner of Until Dawn — layered tension, never spectacle. They are emotional peaks, not interruptions, and each is triggered inside one viewpoint so it stays intimate instead of omniscient.",
          zh: "每段三到六秒，是《Until Dawn》式的缓慢揭示——层层堆叠的张力，绝不是奇观。它们是情绪的顶点，而不是打断；每一段都在单一视角内触发，所以保持私密，而不是全知。",
        },
        examples: [
          { label: "ACT II — THE PRISONER", en: "The camera glides from Mia’s eyes to the Elder’s mask, whose scarred surface still carries blurred traces of past sacrifices.", zh: "镜头从 Mia 的眼睛缓缓滑向长老的面具，布满伤痕的表面上，仍残留着过往祭品模糊的痕迹。" },
          { label: "ACT III — THE RELIC", en: "As Mia shatters it, the runes burst like wet ink on glass. The frame holds for a beat, then control comes back.", zh: "Mia 击碎圣物的瞬间，符文像湿墨泼在玻璃上一样炸开。画面停住一拍，随后操控权回到玩家手上。" },
        ],
      },
    ],
    coda: {
      en: "Every mechanism pays the player in survival: the space teaches the threat’s logic, the dialogue calibrates how the girls will react, the relics expose the pattern. The phrase from that document I still stand by is that narrative here is weaponised cognition.",
      zh: "每一种机制都以“生存”回报玩家：空间教会威胁的逻辑，对话校准女孩们会如何反应，遗物揭露规律。那份文件里我至今仍然认同的一句话是：在这里，叙事就是被武器化的认知。",
    },
    note: {
      en: "† Shares are the vision document’s own. Its table lists “Environmental Storytelling” twice; by the document’s section order the second row belongs to NPC dialogue, which is how it is labelled here. Multi-POV is not a share — it is always on.",
      zh: "† 比重沿用愿景文件原本的数字。文件中的表格把“环境叙事”列了两次；按文件本身的章节顺序，第二行应属于 NPC 对话，此处即如此标示。多视角不算比重——它始终开启。",
    },
  },
  {
    kind: "text",
    title: "What the Revision Found",
    paragraphs: [
      {
        en: "I wrote a revision pass on my own document rather than defending it. What held up: a clean high concept, and an emotional spine that runs from team fracture to alliance without needing anyone to betray anyone. What did not: escalation leaned on late information dumps and on discovery being concentrated in the protagonist, which is exactly the thing a multi-POV structure is supposed to avoid.",
        zh: "我没有替自己的文件辩护，而是为它写了一份修订。撑得住的部分：一个干净的高概念，以及一条从团队破裂走向结盟、不需要任何人背叛任何人的情感主轴。撑不住的部分：张力升级太依赖后段的资讯倾倒，而且「发现」高度集中在主角身上——那恰恰是多视角结构本该避免的事。",
      },
      {
        en: "The sharper version of the problem: the theme was present in the story but not enforced by any mechanism. Player responsibility and uncertainty were the two things the premise promised, and neither was being produced by the structure — they were being described by it. The revision plan is about closing that gap, and it is the part of this project I would do differently first.",
        zh: "更尖锐的说法是：主题存在于故事里，却没有被任何机制强制执行。玩家的责任感与不确定性，是这个前提承诺的两件事，而结构并没有生产它们——只是描述了它们。修订计画要处理的正是这道落差；如果重做，这也是我会最先改的地方。",
      },
      {
        en: "The third problem was the arc. Mia and Alexis only reconcile once they are captured, which makes it cooperation forced by a crisis rather than an understanding reached over the journey. I wanted the turn to feel inevitable, so the revision asks for small shifts early — and for at least some of the girls to know part of how the ritual works, and how to break it, well before the end of Act III.",
        zh: "第三个问题是角色弧线。Mia 与 Alexis 直到被抓之后才和解，这让和解变成了危机逼出来的合作，而不是一路上逐渐达成的理解。我希望转折显得必然，所以修订要求在前段就埋下细微的变化——也要求至少有几个女孩，早在第三幕结束之前，就已经知道仪式的一部分运作方式，以及如何破坏它。",
      },
    ],
  },
  {
    kind: "spec-table",
    title: "The Revision Plan",
    intro: {
      en: "The goal, in the plan’s own words: convert the narrative from protagonist-delivered mystery into player-assembled truth. These are the moves it commits to.",
      zh: "用计划本身的话来说，目标是：把叙事从“由主角交付的谜题”转为“由玩家拼合的真相”。以下是它承诺的具体做法。",
    },
    head: ["Area", "Move"],
    rows: [
      ["POV structure", "Split the story into threads — one per girl — each holding partial information and facing its own danger."],
      ["", "Build convergence points where every thread catches up, so no viewpoint runs too far ahead of or behind the others."],
      ["", "Switch viewpoint at emotional tipping points, so a switch is a turn in the story rather than a camera move."],
      ["Environment", "Plant patterned anomalies early that imply the logistics behind the ritual: calendars, staged hospitality, measured restraints, numbered relic storage."],
      ["", "Make at least one Act I clue foreshadow the relic dependency that the Act III climax turns on."],
      ["Micro-cutscenes", "Trigger them only at moments of recognition, never as omniscient reveals."],
      ["", "Keep them to three to six seconds — punctuation, not interruption."],
    ],
    note: {
      en: "And what it will not do: change the core premise, the protagonist and antagonist roles, or the Act III cheerleading payoff — or make betrayal the engine of the horror. The world stays the antagonist.",
      zh: "以及它不会做的事：不改变核心前提、不改变主角与反派的角色，也不动第三幕的啦啦队高潮——更不会让背叛成为恐怖的引擎。世界始终是那个反派。",
    },
  },
  {
    kind: "system-grid",
    title: "What the Sprints Changed",
    items: [
      ["CAMERA → TRIGGER", "Reading our first drafts aloud, we found that much of the meaning in our scenes was carried by camera language — framing, pans, emphasis — none of which survives implementation. Writing the dialogue, I had to translate those non-verbal beats into something the other writers could build on.", "把初稿读出来之后，我们发现场景里很多意义是由镜头语言承载的——构图、摇镜、强调——而这些在实作中都留不下来。负责写对白的我，必须把这些非语言的节点，转译成其他编剧真正能接着写的东西。"],
      ["ACTION IN THE LINE", "Once each line carried the player’s action beside it — walking to an object, checking on someone, triggering an interaction — the lines stopped reading like a screenplay and started reading like gameplay feedback. It also showed me which beats in my own summary were still film logic rather than moments a game can trigger.", "当每一句台词旁边都写上玩家的动作——走向某个物件、查看某人的状态、触发一次互动——台词就不再像剧本，而开始像游戏的回馈。这也让我看清，自己的大纲里有哪些节点仍是电影的逻辑，而不是游戏能够触发的时刻。"],
      ["READ EACH OTHER", "Drafting alone let character voices drift and broke the transitions between neighbouring lines. Cross-reading fixed it — and it matters most once the story is split across five viewpoints written by different people.", "各自闭门写作，会让角色的声音跑掉，也会让相邻台词之间的衔接断裂。互相阅读修正了这一点——而当故事被拆成五个视角、由不同的人来写时，这一点最为重要。"],
    ],
  },
  {
    kind: "spec-table",
    title: "How a Line Got Fixed",
    intro: {
      en: "Sprint 3 was a barks pass on the three scenes before the bus breaks down — the check-ins, the radio that won’t work, and the argument that ends with the driver gone. Every line was written to an asset ID, a trigger and a 160-character ceiling, then run through first take → team note → edit → note → final. The notes are the useful part. Almost none of them are about wording; they are about what a character does and does not yet know at that moment in the scene.",
      zh: "第三次冲刺是一轮环境台词，写的是巴士抛锚之前的三场戏——逐一问候、那台修不好的收音机，以及以司机失踪收场的那场争吵。每一句都对应一个素材编号、一个触发条件，以及 160 字符的上限，然后走“初稿 → 组内意见 → 修订 → 意见 → 定稿”。有价值的是那些意见。它们几乎都不在谈用词，而在谈这个角色在那一刻做了什么、又还不知道什么。",
    },
    head: ["Asset ID", "First take", "The note", "Final"],
    rows: [
      [
        "SC1_CoachSarah_001",
        "I'm sure they're pretty down because of the loss so maybe you can cheer them up?",
        "Sarah is worried about their state after the drive, not about the defeat. She is still waiting for the right moment to raise that.",
        "I'm sure they're pretty bored, maybe you can see how they're doing?",
      ],
      [
        "SC1_Mia_004",
        "Can Alexis and her friends take this more seriously? It's crazy how she's acting like nothing's happened after that loss…",
        "Mia has not brought the loss up yet. It was her call to attempt the hard move, so she is mostly blaming herself and displacing the rest onto Alexis.",
        "Hey Jodie. It's crazy how care-free Alexis and her friends are. How do you feel?",
      ],
      [
        "SC1_Mia_008",
        "Hey Serah, seems like everyone is feeling a bit angsty.",
        "Mia refers to Sarah as Coach.",
        "Hey Coach, seems like everyone is feeling a bit angsty.",
      ],
      [
        "SC2_Alexis_005",
        "Quit fucking with the music, Mia. You just had to go and break it.",
        "Sarah has already pulled her up on language this scene. She reins it in and settles for sarcasm.",
        "Quit messing with the music, Mia. You just had to go and break it.",
      ],
      [
        "SC2_Lucy_002",
        "Seems like you enjoy ruining everything you touch.",
        "The group talks about Mia in the third person on purpose, to keep her outside it.",
        "She seems to enjoy ruining everything she touches.",
      ],
      [
        "SC3_Brianna_002",
        "Hey, the match is already over. We don't need to keep fighting about it.",
        "Brianna should be far more hesitant. She hates watching this and does not believe Mia will answer back.",
        "Um… c-can we not start fighting again? The match is… it's already over, right?",
      ],
      [
        "SC1_DriverBob_001",
        "Just so you know girls, we're in for a long ride, so quit your complaining.",
        "Bob can be warmer than this.",
        "Just so you know girls, we're in for a long ride, make sure you get comfortable!",
      ],
    ],
    note: {
      en: "The sheet also caught the period: the story sits around 2000, so a note against Alexis's selfie line and another against a phone playing video both flagged hardware that did not exist yet. Driver Bob and teammate Lucy exist only here — they carry lines but never got a character sheet.",
      zh: "这份表也抓到了年代：故事设定在 2000 年前后，因此 Alexis 自拍的那句、以及用手机播影片的那句，各被标注了一则「当时还没有这种东西」。司机 Bob 与队友 Lucy 只存在于此——他们有台词，却从未拿到角色设定。",
    },
  },
  {
    kind: "plates",
    title: "The Presentation",
    intro: {
      en: "Twelve slides from our final presentation: the story brief, the character sheets, the three acts and what I concluded. Hover a slide to lift it; click to read it.",
      zh: "我们最终展示的十二页：故事简介、角色设定、三幕，以及我的结论。将光标移到任一页可将它抬起，点击即可阅读。",
    },
    plates: [
      { image: "assets/tbc/slide-01.jpg", span: 5, offset: "0px", rotate: -0.5, alt: "Storytelling For Games final presentation, slide 1", label: "SLIDE 01" },
      { image: "assets/tbc/slide-02.jpg", span: 4, offset: "46px", rotate: 0, alt: "Storytelling For Games final presentation, slide 2", label: "SLIDE 02" },
      { image: "assets/tbc/slide-03.jpg", span: 3, offset: "14px", rotate: 0.5, alt: "Storytelling For Games final presentation, slide 3", label: "SLIDE 03" },
      { image: "assets/tbc/slide-04.jpg", span: 3, offset: "62px", rotate: 0, alt: "Storytelling For Games final presentation, slide 4", label: "SLIDE 04" },
      { image: "assets/tbc/slide-05.jpg", span: 5, offset: "22px", rotate: -0.4, alt: "Storytelling For Games final presentation, slide 5", label: "SLIDE 05" },
      { image: "assets/tbc/slide-06.jpg", span: 4, offset: "38px", rotate: 0, alt: "Storytelling For Games final presentation, slide 6", label: "SLIDE 06" },
      { image: "assets/tbc/slide-07.jpg", span: 4, offset: "10px", rotate: 0.5, alt: "Storytelling For Games final presentation, slide 7", label: "SLIDE 07" },
      { image: "assets/tbc/slide-08.jpg", span: 3, offset: "54px", rotate: 0, alt: "Storytelling For Games final presentation, slide 8", label: "SLIDE 08" },
      { image: "assets/tbc/slide-09.jpg", span: 5, offset: "26px", rotate: -0.5, alt: "Storytelling For Games final presentation, slide 9", label: "SLIDE 09" },
      { image: "assets/tbc/slide-10.jpg", span: 4, offset: "44px", rotate: 0, alt: "Storytelling For Games final presentation, slide 10", label: "SLIDE 10" },
      { image: "assets/tbc/slide-11.jpg", span: 5, offset: "18px", rotate: 0.4, alt: "Storytelling For Games final presentation, slide 11", label: "SLIDE 11" },
      { image: "assets/tbc/slide-12.jpg", span: 3, offset: "58px", rotate: 0, alt: "Storytelling For Games final presentation, slide 12", label: "SLIDE 12" }
    ],
  },
  {
    kind: "spec-table",
    title: "The Paper Trail",
    intro: {
      en: "The project exists mostly as documents. These are the ones that carry design decisions rather than restating the story.",
      zh: "这个专案主要以文件的形式存在。以下这些承载的是设计决策，而不是把故事再讲一遍。",
    },
    head: ["Document", "What it holds", "Date"],
    rows: [
      ["Premise draft — first version", "The original single-protagonist premise, before any of the perspective work.", "2025-02-25"],
      ["Premise draft, with feedback", "The same premise returned with commentary — including a question mark against the title.", "2025-03-10"],
      ["Character sheets, with feedback", "Full character sheets: personal goal, professional goal, emotional needs, strengths.", "2025-04-19"],
      ["Final presentation", "12 slides: story brief, protagonist, antagonist Elder Malachi, side characters, three acts, conclusions.", "Fall 2025"],
      ["Narrative Design Vision — 1st iteration", "The asymmetrical episodic premise stated for the first time.", "2025-12-12"],
      ["Narrative Design Vision — 2nd iteration", "The same premise with the POV chart bound into it.", "2025-12-19"],
      ["Story Summary", "Act-by-act prose, and the source of the POV chart above.", "2025-12-19"],
      ["3 Scenes", "The scene set the team pitched, plus the credits for who did what.", "2025-12-19"],
      ["Attack Revision Plan", "What worked against what did not, written as a plan rather than a defence.", "2025-12-19"],
      ["Sprint 3 barks spreadsheet — Team 2", "Roughly 90 lines across three bus scenes, each carried through two rounds of team notes to a final check.", "2025-12-09"],
      ["Story Summary + Vision, with reflection", "The originals preserved with revision commentary set against them in red.", "2025-12-19"],
    ],
    note: {
      en: "Five short scene recordings from October 2025 sit alongside these and have not been cut into anything yet.",
      zh: "另有五段 2025 年 10 月的短片场景录影与这些文件并存，目前尚未剪辑成任何成品。",
    },
  },
]
