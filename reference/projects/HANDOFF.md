# 交接：Assets Hub 与 Build and Shoot 抽屉页

> 最后核对：2026-09-11 05:00 PDT（Claude，会话"Assets Hub 和 Build and Shoot 项目整理"）。
> 依据：Claude fork 会话记录、Codex 会话记录、`main` 当前代码（40f5cd0）。
> 下一个接手的 AI：先读「当前状态」和「怎么继续」，再动手。每次交接后更新本文件。

## 当前状态

两个抽屉页已经写进代码并推送。代码是 Codex 写的，Red 分两次提交（05886bc、8361f3a）。

但对照 Red 的规则，还不能算完成：

- 中文是繁体。
- Build and Shoot 用的是文档页截图。
- 访客能看到"问卷 0 回答"这类核查口吻。
- 资料清单链接在线上是 404。

## 时间线

| 时间 (PDT) | 谁 | 做了什么 |
|---|---|---|
| 09-11 00:00–00:22 | Claude "游戏嵌入恢复与内容审计 (fork)" | 只收集资料：IxD101 课程 PDF、海报、Figma 导出、GDD 第 2 / 4 版、两份问卷的题目。没写站点代码。两次 API safeguard 报错后中断。 |
| 00:29–04:43 | Codex | 资料搬进 `reference/projects/`，写 `src/rebuilt-case-studies.js` 并接入；删除重复卡片；以拥有者身份查了两次问卷，都是 0 responses；build 通过。 |
| 04:15 / 04:40 | Red | 提交 05886bc、8361f3a。 |
| 04:46–04:57 | Codex（另一任务） | typography 可读性，改的是 `src/styles.css` 和 `src/extra-sections.css`（提交为 40f5cd0）。 |
| 进行中 | Claude "游戏嵌入恢复与内容审计" | Space Bounty Hunter（`/service-game-ui-2`），同样会改 `src/main.js` 和 `src/extra-sections.*`。 |

## 已完成并核实

- `/assethub` 只剩一张卡片，日期 `Spring 2024`（`src/main.js:97`）。
- `/uiux-prototype` 卡片已删；路由别名保留（`src/main.js:222`、`:1242`）。
- `/assethub` 卡片不再用《99% Gratuity》缩略图。
- 内容接入方式：`Object.assign(caseStudyDetails, rebuiltCaseStudies)`（`src/main.js:777`）。
- 新增 section 类型：`case-gallery`、`evidence-table`、`reference-links`（`src/extra-section-renderers.js:421`）。
- 证据包：`assets-hub/`、`build-and-shoot/`、`source-hashes.sha256`。

## 未达标（按优先级）

1. **中文是繁体。**
   - 站点转换表 `toSimplifiedChinese`（`src/main.js:2746`）只有 297 字；`src/rebuilt-case-studies.js` 里有 245 个字不在表里。
   - 模拟站点输出：「我想要一个安靜的地方，找回散落在电腦与雲端的图片」。
   - `flow` 渲染器不经转换，直接输出 zh（`src/main.js:3954`，`lang="zh-Hant"`），所以流程步骤会是整句繁体。
   - 用词也是台湾习惯：檔案、資料夾、連結、回覆。
   - 修法：全部改写为简体和大陆用词。
2. **截图代替原生排版。**
   - Build and Shoot 画廊的 4 张图全是 GDD 文字页（1050×1400）。
   - 封面在 hero 和画廊 01 各出现一次。Assets Hub 的海报同样重复。
3. **访客能看到内部核查口吻。**
   - 出现在这些字段：`access`、`currentVersion`、`evidence-table` 的 "Survey status" 行、BnS `points` 第 3 条。
   - 内容都是 "0 responses / 不编造图表 / YouTube 缩略图已移除" 之类。
   - 修法：改成 Red 第一人称的作品叙述，以 Serial Deminer 页为基准。
4. **线上 404。** 两页的 "Read the local source manifest" 链接到 `reference/projects/*/README.md`，但 `docs/` 里没有 `reference/`。
5. **重复 header 信息。** hero points 写了 "IxD 101 / Interaction 1 solo final, Spring 2024."，而年份和类别 drawer header 已经显示。
6. **材料用得太浅。** Red 的原话是"课程 PPT 作纲领，Google Sheet 作材料背景"。以下内容只写进了 README，没上页面。
   - Assets Hub：
     - IxD101 第 8–14 周的流程：HMW → features → flow → wireframes → 可交互原型 + design system → 外部测试。
     - 4/18 的交付物：24×36 海报、slides、原型、process book、1–2 分钟配音视频。
     - 搜索模型：describe / tag / scoop filter / sort，以及 action keys / escape keys（Figma `881:4666`）。
     - Wireframe 页的文件类型图标系统（`0:1`）。
     - 原型里当样例的 GDF2 表格：文件名 / 位置 / 类型 / 大小 / 创建 / 修改。
   - Build and Shoot：
     - GDF3 课程框架：Lab 09 战斗、经济交易 lab、Lecture 11。
     - 版本演进：第 2 版加 inventory → 第 3 版加 AI → 第 4 版修订 AI（见 `build-and-shoot/extracted/iteration-4-layout.txt`）。
     - 问卷测了什么（题目结构）。
7. **同类错误还没修（不在本任务范围）：**
   - `/curtain` 卡片仍用《99% Gratuity》缩略图和 `12/9/2024-Present`（`src/main.js:105–107`）。
   - `framerProjectDetails["/assethub"].leadImage` 仍是那张图（`src/main.js:406`）。它已被覆盖，属于死数据。
8. `build-and-shoot/README.md` 里写的课程目录 `Fall25(T5)/Game Develepment 3/` 不存在。GDF3 讲义实际在 `~/Downloads/`。

## 事实更正（以后不要再写错）

- **"已有两轮问卷调查"没有被证实。**
  - 这句话出自之前的审计，是看到两个 `.gform` 文件后推断的，没看过回答。
  - 2026-09-11，Codex 以拥有者身份查了两次：两份表单都是 0 responses，也没有关联的回复表。
  - 学校账号的 Drive 里也搜不到。
- **但当年确实收过反馈。**
  - 第 4 版 GDD 第 25/28 页（"Playtest & Game Analysis"）链接了第二份表单，写着「从目前的survey反馈来看……大部分玩家反应都能够懂得基础的游戏规则」。
  - 原始回答后来不在表单里了。
  - 页面应该用这段总结，不该对访客说"0 回答"。
- **YouTube 视频不是演示。** `PjBUK45MWJs` 是 Alee films 的短片《99% Gratuity》，不是 Assets Hub 的演示视频。
- **Assets Hub 的完成时间未定。** 课程是 2024 春季，4/18 截止。但海报里当样例的 GDF2 文件创建于 2024-08-05 至 08-14，所以海报至少是 8 月以后才完成的。旧卡片上的 12/9/2024 不一定是错的，要请 Red 确认。
- **第 4 版的日期。**
  - 第二份问卷的文件名是"（3rd）"，内容标题是 "(4th Iteration)"，最后修改于 2024-12-11，说明第 4 版在 2024 年 12 月之前就有了。
  - `/bns_gdd` 卡片的日期 `2/18/2026` 是 PDF 的导出时间（Pages，2026-02-19 05:32 UTC），不一定是版本时间。
- **早期 15 页导出的版本号自相矛盾：** 文件名写 2nd Iteration，页脚写 1st Iteration，第 2 页已经写着 "Build n Shoot!!!"。

## 需要 Red 决定

1. 问卷的原始回答有没有别的出处（导出的 xlsx、纸质、别的账号）？如果没有，是否同意只用 GDD 里的质性总结，并把"0 回答"的说法从页面删掉？
2. Assets Hub 卡片的日期写课程学期（Spring 2024），还是实际完成时间？
3. `/bns_gdd` 的日期写 2024 年 12 月（版本时间），还是 2/18/2026（导出时间）？
4. `/analog-game` 和 `/bns_gdd` 要不要合并成一张卡？（审计遗留问题）
5. Assets Hub 卡片的 displayTitle 是 "Production Design"，和 IxD 项目对不上，要不要改？
6. `reference/projects/` 已经推送到**公开**的 GitHub 仓库，里面有 IxD101 / GDF3 课程讲义的全文提取，还有个人邮箱（在 `build-and-shoot/survey-recheck-2026-09-11.json` 和 `assets-hub/README.md` 里）。要不要撤下？

## 怎么继续（给下一个 AI）

1. **先跑 `git status --porcelain`。**
   - 这个 checkout 有好几个 agent 在并行改（Claude 和 Codex 都有）。
   - `src/main.js`、`src/styles.css`、`src/extra-sections.css` 最容易被覆盖。
2. **改动尽量只放在 `src/rebuilt-case-studies.js`。** 需要新的 section 类型，就加到 `src/extra-section-renderers.js`，不要往 `main.js` 里堆。
3. **中文一律写简体。** `flow` 和 `system-grid` 的 zh 不会经过转换。
4. **用原生 section 替换截图：**
   - 版本演进：`flow` 或 `spec-table`
   - 问卷结构：`question-list`
   - playtest 总结：`callout`
   - 搜索模型：`diagram` / `system-grid`
   - 文件类型：`matrix`
   - GDF2 样例语料：做成仿 inspector 的 `spec-table`
5. **删掉访客可见的核查口吻**，以及指向 `reference/` 的链接。需要链接的话换成 Figma 或其他公开链接。
6. **构建并验证：**
   - 构建命令：`/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node scripts/build.mjs`（会写 `dist/` 和 `docs/`）。
   - 在抽屉里验证，不要在独立 URL 上验证。
   - 画廊要填满整行 12 栏。
7. **不要 commit。** 由 Red 自己提交。
8. **公开仓库，别放隐私资料。** 不要往 `reference/` 放邮箱、个人表格或课程讲义全文。

## 资料在哪

- **证据包和提取文本：** `assets-hub/`、`build-and-shoot/`。各自的 README 里有"说法 → 来源"对照表。
- **课程原件：**
  - IxD101：`~/Desktop/ArtCenter/Spring24(T2)/IXD/`
  - GDF2：`~/Desktop/ArtCenter/Spring24(T2)/GDF2/`
- **Figma** `HEpE6DzXmVK9AkYB8LDVuP`（IxD1-Final-Project-Red）：
  - 原型入口 `704:1008`
  - Mac 展示图 `496:567`、`572:1227`、`487:424`、`841:2145`
  - 搜索详情 `881:4666`
  - 设置 `572:1880`
  - Wireframe 页 `0:1`
- **Build and Shoot：**
  - 早期导出：`~/Desktop/ArtCenter/Website/MovementGame_2ndIteration_GDDRW_Draft/`（15 张 jpeg）
  - 第 4 版：`~/Desktop/ArtCenter/Spring26(T6)/Alt Control 2/MovementGame_4thIteration_GDDRW_Draft.pdf`（28 页）
- **GDF3 讲义**（都在 `~/Downloads/`）：
  - `GDF3 11 Lecture Slides.pdf`
  - `GDF3 09 Lab_ Combat Game Instructions.pdf`
  - `GDF3 Lab_ Economic Trading Game.pdf`
  - `GDF 13 Final Project Game Design Document Template.pdf`
- **问卷 ID：** 见 `build-and-shoot/README.md`。
- **原始会话记录：**
  - Claude：`~/.claude/projects/-Users-redwang-Desktop-ArtCenter-ReDInAStrike-com/` 下的 `49e8907f-af67-469e-af54-da04b97ebd7e.jsonl` 和 `0cf4c004-3143-4f73-b623-02fe3e39ebdb.jsonl`
  - Codex：`~/.codex/sessions/2026/09/11/rollout-2026-09-11T00-29-09-01a08f5e-cb3f-7f20-80ec-4a5341b32748.jsonl`

---

# 第二轮：游戏项目的设计叙事（2026-09-11，Claude）

范围：14 个游戏项目。My Fridge、Assets Hub、Untitled Sans、Pitchfork 暂不纳入（Red 的决定）。

## 这一轮的标准（所有游戏页的文案都按这个写）

- 设计意图 → 迭代 → 结果；写清楚想达到什么、想法怎么演变、为什么这样决定。
- 讲游戏设计问题（玩家体验、清晰度、投入感、机制），不讲开发问题；每个问题要写"问题 / 为什么对玩家重要 / 怎么解决"。
- 叙事：玩家做什么、体验到什么、叙事结构怎样支撑这个体验。
- 合作：怎么和队友共事、怎么处理分歧、对团队的贡献（而不是文档交接）。
- 以玩家为中心：玩家是谁、应该感受到什么、设计怎样做到。
- 技术只作为服务玩家体验的手段出现。
- 删掉 "Week N"、"the brief asked / the course required / assignment" 这类措辞；设计迭代默认是 Red 做的，用第一人称写。
- 不虚构结果：没有做成的写成"学到了什么 / 下一步怎么测"，数据只用问卷和 GDD 里真实存在的。

## 做了什么

- **开场**：一句话介绍改成中英双语；要点改成带标签的答案（`{ label, en, zh }`，Iteration / My role / Design goal / Playtest），渲染在 `caseStudyDetailMarkup`（`src/main.js`）。
- **"Who It Is For" 版块**：每个游戏抽屉的第一个版块（在试玩构建之前）——体验目标 + 目标受众 + 定位图（独自↔社交 × 休闲↔硬核）。数据在各项目的 `audience` 字段；渲染器是 `extra-section-renderers.js` 的 `audience`；Serial Deminer 用 `serialDeminerAudience`（`main.js`）。
- **章节标签**：有 `kicker` 字段的章节在标题上方显示小标签（Design intent / Iteration / Design problem / Playtest / Team / Storytelling / Player flow / Narrative design）。注意是 `kicker`，不是 `tag`——My Fridge 和 SBH 自己用 `tag` 字段做别的事。
- **样式**：全部在新文件 `src/review-emphasis.css`（`index.html` 已链接）。单张图片不再被拉伸超过原图或超过 82% 屏高（修掉了 Shroom Pot 那张 720×1280 被放大到近 3 屏高的竖图）。
- **Slow'em Down 新材料**：Figma 第一关九格分镜（`public/assets/case-study/slow-em-down/storyboard-0*.jpg`）、两轮录像对比（round-1/round-2 截图 + `assets/videos/slow-em-down-round-2.mp4`）、"为什么是局部时间"（Figma Idea II 原文）、试玩流程规划表（标明哪些做了）。
- **Curtain**：按 `FusionDesignStatus.md` 的已确认规则重写；日期改为 3/26/2026-Present。**更正：Curtain 不是联网游戏**——项目里的 "Fusion" 是房间融合系统，不是 Photon。
- **日期**：Assets Hub 8/14/2024（海报里最晚的时间戳）；`/bns_gdd` 12/9/2024（旧卡片日期，第 4 版问卷 2024-12-11 前已存在）。
- 中文全部转成简体：工具是 macOS ICU 的 Hant-Hans（会正确保留"显著、著作、乾坤"）。

## 验收（2026-09-11 11:00，1440 和 600 宽，Playwright 无头打开抽屉）

- 14 个游戏抽屉：无 `[object Object]`、无横向溢出、无繁体残留、无课程措辞（"Week" 只剩 SBH 游戏内的"Year One, Week by Week"，属于游戏内容）。
- 13 张定位图：两种宽度下标签无重叠、无越界、不压目标区名字。
- 控制台报错都是原有的：Curtain 和 Slow'em Down 的 Unity WebGL 构建、SBH/Instrument 的 Figma 原型嵌入（403）。

## 还没做 / 需要 Red 决定

- SushiGo：把 Leap Motion 旧版和 Vision Pro 新版并排展示需要旧版素材；Drive 里的 `Susan_Conred_Red_Sushi_Go Playtest Side-by-Side.mp4` 有队友和玩家出镜，要 Red 同意才能放。
- 留白规则的原有例外：To Be Chosen 的 5 人网格、`/bns_gdd` 的 7 格网格、Butter Beatdown 的 3 步流程——都是内容本身的数量，没有硬凑。
- `reference/projects/assets-hub/figma/img8-430-550.png` 是 Red 本人照片图库的截图（有个人自拍），已在公开仓库里，建议撤下。
- 演讲稿在仓库外（私人文件），不要放进仓库。
