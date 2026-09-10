// To Be Chosen — the drawer case study.
// Sources: the Storytelling For Games final presentation (Figma Slides
// wSwsDkCUN6ki055dD6gZpG, read from the 12-page local PDF export), the POV Switch
// Chart embedded in the story summary, and fourteen Word documents across
// Fall25(T5)/Narrative Design and ~/Downloads. Character text is quoted from
// Red's own slides; the reference photographs on those slides are third-party
// casting references and are deliberately not republished here.

export const tbcSections = [
  {
    kind: "copy-grid",
    left: {
      title: "Brief",
      en: "A cheer squad places at the World Tour preliminaries and boards the bus home. The bus breaks down. The driver goes missing. The village that takes them in has done this before. To Be Chosen is a survival horror told through whichever girl is carrying the scene — and the horror is not that one of them turns on the others. It is that the world already decided something before they arrived.",
      zh: "啦啦隊在世界巡迴預賽中拿到名次，坐上回家的巴士。巴士拋錨，司機失蹤，而收留她們的村莊，這種事早已做過不止一次。《To Be Chosen》是一款生存恐怖遊戲，由當下承載該場戲的那個女孩來敘述——恐怖不在於她們之中有人背叛，而在於這個世界在她們抵達之前就已經做好了決定。",
    },
    right: {
      title: "My role",
      en: "Narrative Director on a team of four — with Jinqi Chang producing and Kris Kuerten and Bedi Ruan writing. I owned the perspective structure: who sees what, in which order, and what the player is left holding that no single character has.",
      zh: "四人團隊中的敘事總監——Jinqi Chang 擔任製作人，Kris Kuerten 與 Bedi Ruan 擔任編劇。我負責視角結構：誰看見什麼、以什麼順序看見，以及玩家最終握有的、任何單一角色都不具備的那份認知。",
    },
  },
  {
    kind: "callout",
    title: "The Structural Idea",
    en: "Every significant beat is played through one character's limited viewpoint, so each girl ends the story holding an incomplete account. The player is the only entity who sees all of them. That is the whole design: not a mystery the characters solve, but a picture only the person holding the controller can assemble.",
    zh: "每一個關鍵節點都透過某一個角色的受限視角來玩，因此每個女孩在故事結束時握有的都是不完整的說法。玩家是唯一看見全部的存在。這就是整個設計：它不是一樁由角色解開的謎，而是一幅只有握著手把的人才能拼起來的畫。",
  },
  {
    kind: "flow",
    title: "It Started as One Girl",
    steps: [
      ["SPRING 2025", "The first version is single-protagonist: Mia alone breaks into the town, alone finds out what the elders do to outsiders, alone goes back for Sarah.", "最初的版本是單主角：Mia 獨自闖入村莊、獨自查明長老們對外來者做了什麼、再獨自回去救 Sarah。"],
      ["THE PROBLEM", "One girl who sees everything is a mystery she solves for you. Nothing is withheld, so nothing has to be pieced together.", "一個看見一切的女孩，等於替你把謎解完了。沒有東西被保留，也就沒有東西需要拼湊。"],
      ["FALL 2025", "Rebuilt around five limited viewpoints. Each girl now ends the story with a partial account, and the assembly moves to the player.", "以五個受限視角重建。每個女孩最終握有的都是片面的說法，而拼合的工作交給了玩家。"],
      ["WHAT REMAINED", "My own revision pass found discovery still clustering on Mia. The old shape had not fully left the new one.", "我自己的修訂發現，「發現」仍然聚集在 Mia 身上。舊的形狀並沒有真正離開新的結構。"],
    ],
  },
  {
    kind: "image",
    image: "assets/tbc/pov-switch-chart.jpg",
    alt: "The To Be Chosen POV switch chart — a filmstrip timeline showing which character carries each scene",
    label: "POV SWITCH CHART / GAME TIME TIMELINE",
    caption: {
      en: "The chart I built to hold the structure. Five playable characters, each with a colour; every plot point names the POV and who else is present. Overlapping dots are scenes shared inside one viewpoint. The timeline runs Act 1 to Act 3, but a character's own narrative need not — it can flash back or forward inside their POV.",
      zh: "我為維持這個結構所做的圖表。五位可玩角色各有配色；每個情節點都標明由誰的視角進行、以及還有誰在場。重疊的圓點代表在同一視角內共享的場景。時間軸從第一幕走到第三幕，但角色自身的敘事不必如此——它可以在自己的視角內閃回或閃前。",
    },
  },
  {
    kind: "system-grid",
    title: "Who Carries the Scenes",
    items: [
      ["MIA THOMPSON", "Seventeen. The agile core of the squad, a teen cheerleader turned reluctant leader, trying to be seen as capable and enough.", "十七歲。隊上最靈巧的核心，從啦啦隊員被推成不情願的領袖，努力讓自己被看見為「有能力」且「足夠」。"],
      ["ALEXIS MONROE", "The other captain. Confident and proud where Mia is meticulous and emotional — the friction between them opens the story.", "另一位隊長。Mia 細膩而情緒化，她則自信而驕傲——兩人之間的摩擦揭開了整個故事。"],
      ["BRIANNA REYES", "The one who is too scared to go along, and therefore the one who is somewhere else when things happen.", "那個怕到不敢跟上的人——也因此，事情發生時她總在別的地方。"],
      ["JODIE SMITH", "Kept close to Mia and Coach Sarah through the middle of the story, which makes her the corroborating witness.", "故事中段一直待在 Mia 與 Sarah 身邊，因而成為那個可以彼此印證的目擊者。"],
      ["COACH SARAH", "The adult. She goes to check on the driver, meets the villagers first, and is the first to be missed.", "唯一的大人。她去查看司機的狀況、最先遇到村民，也是最先被發現失蹤的人。"],
    ],
  },
  {
    kind: "halftone",
    title: "Casting References",
    intro: {
      en: "Each character sheet carries a panel of faces I was writing towards before any art existed. The images run through the site\u2019s own halftone \u2014 the effect the catalogue applies to a card outside the selected category \u2014 so what survives is the silhouette and the weight. The credits are set in type rather than left inside the picture.",
      zh: "每一份角色設定都附有一組臉孔，那是在任何美術產出之前，我書寫時所朝向的樣子。圖像經由網站自身的半調處理\u2014\u2014也就是目錄對非當前分類卡片所套用的效果\u2014\u2014因此留下的是輪廓與份量。出處以文字排版標示，而不是留在圖片裡。",
    },
    plates: [
      {
        image: "assets/tbc/ref-mia.jpg",
        alt: "Halftoned casting reference for the protagonist",
        label: "PROTAGONIST / MIA THOMPSON",
        credits: ["Catherine Blades"],
        caption: {
          en: "Seventeen, and asked to lead people who did not elect her.",
          zh: "十七歲，卻被要求去領導一群並非選她出來的人。",
        },
      },
      {
        image: "assets/tbc/ref-malachi.jpg",
        alt: "Halftoned casting reference for the antagonist",
        label: "ANTAGONIST / ELDER MALACHI",
        credits: ["Judge Turpin \u2014 Sweeney Todd", "Sho Murakami \u2014 Life", "Saruman \u2014 The Lord of the Rings"],
        caption: {
          en: "Reads 60\u201370, has lived far past it. Once a scholar; the ritual is what he made of the search.",
          zh: "看上去六十到七十歲，實際遠不止。他曾是學者；那套儀式，是他把追尋做成的東西。",
        },
      },
    ],
    note: {
      en: "These are references I gathered while writing, not artwork for the game.",
      zh: "這些是我寫作期間蒐集的參考，並非遊戲的美術稿。",
    },
  },
  {
    kind: "flow",
    title: "Three Acts",
    steps: [
      ["ACT I — THE BUS", "A win, then an argument between the two captains. Coach Sarah settles it. Then the vehicle breaks down and the driver is gone.", "先是勝利，接著是兩位隊長的爭執。Sarah 出面平息。然後車子拋錨，司機不見了。"],
      ["ACT II — THE VILLAGE", "The girls settle in and start talking to villagers. Sarah radios about the disappearance. Alexis finds the tavern. Mia learns the village's history.", "女孩們安頓下來，開始與村民交談。Sarah 用無線電通報失蹤。Alexis 找到了酒館。Mia 得知了這座村莊的歷史。"],
      ["ACT III — THE CHOOSING", "Sarah does not come back. What each girl believes about that depends entirely on where she was standing.", "Sarah 沒有回來。每個女孩對此的認知，完全取決於她當時站在哪裡。"],
    ],
  },
  {
    kind: "plates",
    title: "The Presentation",
    intro: {
      en: "Twelve slides taken to the final review: the brief, the character sheets, the three acts and what I concluded. Hover a slide to lift it; click to read it.",
      zh: "帶去期末評審的十二頁：綱要、角色設定、三幕，以及我的結論。將游標移到任一頁可將它抬起，點擊即可閱讀。",
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
    kind: "text",
    title: "What the Revision Found",
    paragraphs: [
      {
        en: "I wrote a revision pass on my own document rather than defending it. What held up: a clean high concept, and an emotional spine that runs from team fracture to alliance without needing anyone to betray anyone. What did not: escalation leaned on late information dumps and on discovery being concentrated in the protagonist, which is exactly the thing a multi-POV structure is supposed to avoid.",
        zh: "我沒有替自己的文件辯護，而是為它寫了一份修訂。撐得住的部分：一個乾淨的高概念，以及一條從團隊破裂走向結盟、不需要任何人背叛任何人的情感主軸。撐不住的部分：張力升級太依賴後段的資訊傾倒，而且「發現」高度集中在主角身上——那恰恰是多視角結構本該避免的事。",
      },
      {
        en: "The sharper version of the problem: the theme was present in the story but not enforced by any mechanism. Player responsibility and uncertainty were the two things the premise promised, and neither was being produced by the structure — they were being described by it. The revision plan is about closing that gap, and it is the part of this project I would do differently first.",
        zh: "更尖銳的說法是：主題存在於故事裡，卻沒有被任何機制強制執行。玩家的責任感與不確定性，是這個前提承諾的兩件事，而結構並沒有生產它們——只是描述了它們。修訂計畫要處理的正是這道落差；如果重做，這也是我會最先改的地方。",
      },
    ],
  },
  {
    kind: "spec-table",
    title: "The Paper Trail",
    intro: {
      en: "The project exists mostly as documents. These are the ones that carry design decisions rather than restating the story.",
      zh: "這個專案主要以文件的形式存在。以下這些承載的是設計決策，而不是把故事再講一遍。",
    },
    head: ["Document", "What it holds", "Date"],
    rows: [
      ["Storytelling For Games — 1st graded assignment", "The original single-protagonist premise, before any of the perspective work.", "2025-02-25"],
      ["Graded assignment #1, with notes", "The same premise returned with commentary — including a question mark against the title.", "2025-03-10"],
      ["Graded assignment #2, with notes", "Full character sheets: personal goal, professional goal, emotional needs, strengths.", "2025-04-19"],
      ["Storytelling For Games — final presentation", "12 slides: story brief, protagonist, antagonist Elder Malachi, side characters, three acts, conclusions.", "Fall 2025"],
      ["Narrative Design Vision — 1st iteration", "The asymmetrical episodic premise stated for the first time.", "2025-12-12"],
      ["Narrative Design Vision — 2nd iteration", "The same premise with the POV chart bound into it.", "2025-12-19"],
      ["Story Summary", "Act-by-act prose, and the source of the POV chart above.", "2025-12-19"],
      ["3 Scenes", "The scene set the team pitched, plus the credits for who did what.", "2025-12-19"],
      ["Attack Revision Plan", "What worked against what did not, written as a plan rather than a defence.", "2025-12-19"],
      ["Story Summary + Vision, with reflection", "The originals preserved with revision commentary set against them in red.", "2025-12-19"],
    ],
    note: {
      en: "Five short scene recordings from October 2025 sit alongside these and have not been cut into anything yet.",
      zh: "另有五段 2025 年 10 月的短片場景錄影與這些文件並存，目前尚未剪輯成任何成品。",
    },
  },
]
