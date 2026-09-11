// Rebuilt from the local course archive, exported Figma screens, and the two
// Drive form definitions. Every external claim has a matching source in
// reference/projects/{assets-hub,build-and-shoot}/README.md.

const pair = (en, zh) => ({ en, zh })

export const rebuiltCaseStudies = {
  "/assethub": {
    year: "2024 Spring",
    title: "Assets Hub",
    category: "Interaction Design / IxD 101",
    summary: pair("I wanted one calm place to find the pictures, clips, 3D files, and working documents scattered across my computer and cloud drives. Assets Hub turns that mess into a searchable desktop: filter by type, inspect the file, and keep moving.", "我想要一個安靜的地方，找回散落在電腦與雲端的圖片、影片、3D 檔案和工作文件。Assets Hub 把這些混亂變成可搜尋的桌面：按類型篩選、檢視檔案，然後繼續工作。"),
    heroImage: "assets/case-study/assets-hub/poster.jpg",
    heroAlt: "Assets Hub course poster",
    points: [
      "IxD 101 / Interaction 1 solo final, Spring 2024.",
      "The course brief ran from week 8 to week 14; final deliverables were due April 18, 2024.",
      "The prototype is a 97-frame Figma file including component states and templates, with four representative desktop views shown below.",
    ],
    sections: [
      { kind: "copy-grid", left: { title: "The friction", en: "My references lived in too many places. Searching meant remembering which drive, folder, app, or naming habit had won that day.", zh: "我的參考資料住在太多地方。搜尋時，得先想起它到底在哪個硬碟、資料夾、App，或哪種命名習慣裡。" }, right: { title: "The promise", en: "A single search surface should reveal context as well as the file: location, type, size, dates, tags, and a useful preview.", zh: "單一搜尋介面不只要顯示檔案，也要顯示它的脈絡：位置、類型、大小、日期、標籤，以及有用的預覽。" } },
      { kind: "flow", title: "The interaction I designed", steps: [["Search", "Type a name, tag, or file kind", "輸入名稱、標籤或檔案類型"], ["Narrow", "Switch between computer and cloud", "在電腦與雲端之間切換"], ["Inspect", "Read the file context in place", "在原地閱讀檔案資訊"], ["Act", "Open, copy, or organise the result", "開啟、複製或整理結果"]] },
      { kind: "case-gallery", title: "Four views from the prototype", intro: pair("These are exact exports from the editable Figma prototype. They show the interface states I designed; they are not screenshots of a finished file-management backend.", "以下是可編輯 Figma 原型的原尺寸匯出，展示我設計的介面狀態；它們不是已完成檔案管理後端的截圖。"), items: [
        { image: "assets/case-study/assets-hub/poster.jpg", label: "01 / Intent", alt: "Assets Hub project poster", caption: pair("The poster frames the problem as one search surface for scattered assets.", "海報把問題定義成：用一個搜尋介面找回散落的素材。") },
        { image: "assets/case-study/assets-hub/search.png", label: "02 / Search", alt: "Assets Hub collapsed search view", caption: pair("The compact search state leaves the desktop visible while the query gets started.", "收合的搜尋狀態保留桌面視野，再開始輸入查詢。") },
        { image: "assets/case-study/assets-hub/gallery.png", label: "03 / Browse", alt: "Assets Hub category gallery view", caption: pair("Type categories give a quick route into images, video, 3D, and documents.", "類型分類讓圖片、影片、3D 與文件有快速入口。") },
        { image: "assets/case-study/assets-hub/inspector.png", label: "04 / Inspect", alt: "Assets Hub file inspector view", caption: pair("The selected file keeps name, location, type, size, and dates together.", "選中的檔案把名稱、位置、類型、大小與日期放在一起。") },
      ] },
      { kind: "evidence-table", title: "What the prototype actually specifies", rows: [
        ["Source", pair("IxD 101 final project brief, Spring 2024; Figma file IxD1-Final-Project-Red.", "IxD 101 2024 春季期末專案簡報；Figma 檔案 IxD1-Final-Project-Red。")],
        ["States", pair("Search, category browse, selected-file inspector, settings, and login/pro feature concepts.", "搜尋、分類瀏覽、檔案檢視器、設定，以及登入／Pro 功能概念。")],
        ["Boundary", pair("The Figma file proposes cloud sync and search features; it does not prove a working sync service or user study result.", "Figma 提出雲端同步與搜尋功能，但不能證明同步服務已運作，也不能證明有使用者研究結果。")],
      ] },
      { kind: "reference-links", title: "Materials behind this reconstruction", items: [
        { label: "Open editable Figma prototype", href: "https://www.figma.com/proto/HEpE6DzXmVK9AkYB8LDVuP/IxD1-Final-Project-Red?node-id=704-1008&starting-point-node-id=704%3A1008", external: true, copy: pair("97 frames including states, components, and templates.", "包含狀態、元件與模板，共 97 個畫框。") },
        { label: "Read the local source manifest", href: "reference/projects/assets-hub/README.md", copy: pair("Course decks, poster, screen exports, and the rejected video reference are listed in the repository reference.", "課程簡報、海報、畫面匯出，以及排除的影片參考都列在倉庫 reference 中。") },
      ] },
    ],
    access: "The prototype and source inventory are linked below. The YouTube thumbnail previously attached to this card was 99% Gratuity, not an Assets Hub demo, so it has been removed from this reconstruction.",
    sourceLinks: [{ label: "Open Figma prototype ↗", href: "https://www.figma.com/proto/HEpE6DzXmVK9AkYB8LDVuP/IxD1-Final-Project-Red?node-id=704-1008&starting-point-node-id=704%3A1008", external: true }],
    currentVersion: pair("Reconstructed from the Spring 2024 brief and the editable Figma states. The project card now uses one canonical Assets Hub drawer; /uiux-prototype remains an alias.", "依據 2024 春季課程簡報與可編輯 Figma 狀態重建。專案卡現在只保留一個 Assets Hub 抽屜；/uiux-prototype 保留為別名。"),
  },
  "/analog-game": {
    year: "2024 Fall",
    title: "Build and Shoot",
    category: "Analog Game / Rules and Systems",
    summary: pair("Build and Shoot is a turn-based fight on a floating 15 × 15 island. Every move leaves a mark, every build changes cover, and the player is always choosing between getting somewhere, making somewhere safe, and taking the shot.", "Build and Shoot 是在漂浮 15 × 15 島嶼上的回合制戰鬥。每次移動都留下標記，每次建造都改變掩體；玩家一直在「前進、讓位置安全、或開槍」之間選擇。"),
    heroImage: "assets/case-study/build-and-shoot/iteration-2-cover.jpg",
    heroAlt: "Build and Shoot second iteration GDD cover",
    points: ["GDF3 Movement Game project, Fall 2024; the early export is titled Movement-Building Game and already names Build and Shoot on page 2.", "The fourth GDD revises inventory, then AI progression and situational behaviour.", "The fourth document includes a qualitative playtest synthesis; the two Drive questionnaire forms currently contain zero responses."],
    sections: [
      { kind: "copy-grid", left: { title: "The hook", en: "Movement is not only travel. It paints territory, changes shooting range, and creates the places where the next decision can happen.", zh: "移動不只是旅行。它會畫出領地、改變射程，也創造下一個決策可以發生的位置。" }, right: { title: "The pressure", en: "Inventory weight and finite actions make every useful object compete with movement, building, and a clean line of fire.", zh: "負重與有限行動讓每件有用物品，都必須和移動、建造，以及清楚的射擊線競爭。" } },
      { kind: "case-gallery", title: "From early pitch to test reflection", items: [
        { image: "assets/case-study/build-and-shoot/iteration-2-cover.jpg", label: "01 / Early GDD", alt: "Movement Building Game second iteration cover", caption: pair("The 15-page early export is labeled second iteration in the filename, while its footer still says first iteration.", "這份 15 頁早期匯出檔名標為第二版，但頁尾仍寫第一版。") },
        { image: "assets/case-study/build-and-shoot/iteration-2-loop.jpg", label: "02 / Rules", alt: "Build and Shoot early rules page", caption: pair("The early rules frame movement, building, and shooting as one turn-to-turn loop.", "早期規則把移動、建造與射擊放進同一個回合循環。") },
        { image: "assets/case-study/build-and-shoot/iteration-2-reflection.jpg", label: "03 / Designer reflection", alt: "Build and Shoot early designer reflection", caption: pair("The reflection names visible information, symmetric starts, and dice uncertainty as design concerns.", "反思指出可見資訊、對稱起點與骰子不確定性是設計關注。") },
        { image: "assets/case-study/build-and-shoot/iteration-4-playtest.png", label: "04 / Test synthesis", alt: "Build and Shoot fourth iteration playtest synthesis page", caption: pair("The fourth GDD's synthesis says the basic actions were understood, while the flow and AI rules asked too much memory.", "第四版 GDD 的總結指出基本動作大多能理解，但流程與 AI 規則要求記憶過多。") },
      ] },
      { kind: "flow", title: "One turn, read as a decision", steps: [["Move", "Mark orthogonal squares", "標記正交格子"], ["Build", "Change cover and territory", "改變掩體與領地"], ["Manage", "Spend weight and action cards", "管理負重與行動卡"], ["Shoot", "Use a line, range, and position", "利用射線、射程與位置"]] },
      { kind: "evidence-table", title: "What the test material says", rows: [
        ["Understood", pair("Most players understood the basic movement, shooting, and building actions.", "多數玩家理解基本的移動、射擊與建造。")],
        ["Friction", pair("The flow felt bloated; rules introduced upfront were easy to forget, and players repeatedly checked how to place or move AI.", "流程感到膨脹；一開始講解的規則容易忘記，玩家反覆確認 AI 如何放置與移動。")],
        ["Next implication", pair("Keep the first turn legible, teach AI rules at the moment they matter, and retest the shortened flow.", "讓第一回合保持易讀，在 AI 規則真正需要時才教，然後重新測試縮短後的流程。")],
        ["Survey status", pair("Two questionnaire forms were found in the personal Drive, one labeled 2nd iteration and one document labeled 3rd / content labeled 4th. Both show 0 responses and no linked response sheet.", "在個人 Drive 找到兩份問卷：一份標為第二版，另一份文件標為第三版／內容標為第四版。兩份目前都顯示 0 份回答，且沒有連結回覆表。")],
      ] },
      { kind: "reference-links", title: "Materials behind this reconstruction", items: [
        { label: "Read the local source manifest", href: "reference/projects/build-and-shoot/README.md", copy: pair("Iteration exports, fourth GDD text, course labs, and form IDs are listed in the repository reference.", "版本匯出、第四版 GDD 文字、課程實驗與表單 ID 都列在倉庫 reference 中。") },
        { label: "Open the readable fourth-iteration GDD", href: "/bns_gdd", copy: pair("The full rules document remains available as its own drawer, with live tables and diagrams.", "完整規則文件仍保留為獨立抽屜，使用可讀表格與圖表。") },
      ] },
    ],
    access: "The early GDD, fourth-iteration rules, and test synthesis are linked through the repository reference. A response dataset is not available to summarise.",
    sourceLinks: [{ label: "Open readable fourth-iteration GDD ↗", href: "/bns_gdd" }],
    currentVersion: pair("This drawer joins the early GDD, fourth-iteration changes, and qualitative test synthesis. It does not turn the empty questionnaire forms into invented charts.", "這個抽屜把早期 GDD、第四版變更與質性測試總結放在一起，也不會把空白問卷變成虛構圖表。"),
  },
}
