# Site audit — the cards that had not been audited

Date: 2026-09-10. Same method as the To Be Chosen and MyFridge rebuilds and the Butter
Beatdown audit: read what each drawer actually renders (measured in the drawer, not the
standalone URL), then go to every source — local folders, Unity projects, Figma, the old
Framer site, Google Drive — and check the page against them. **Nothing on the site has been
changed by this audit.**

Already audited or rebuilt before this pass, and not repeated here: Build n Shoot GDD
(`/bns_gdd`), DAD, Slow'em Down, Butter Beatdown, Pitchfork, the Specimen booklet, To Be
Chosen, MyFridge.

---

## 0. At a glance

| Card | Route | What it actually is | Page today | Worst problem | Priority |
|---|---|---|---|---|---|
| Curtain | `/curtain` | Networked two-player room-building horror game, Spring 2026 → ongoing | 420 words + playable build | Describes a small spatial study; the game has grown far past it. Wrong start date. A sentence about Build and Shoot in its footer | **High** |
| Shroom Pot Showdown | `/shroom-pot-showdown` | Alt Control 2 team game, mushroom (yoga ball) vs chopsticks | 855 words, 2 videos | Says the yoga-ball controller "still needs a test" — 21 playtest responses already test it | **High** |
| The Mystery of Instrument | `/service-game-ui` | Mobile music-puzzle service game, team of three | 185 words, no media | Generic template copy; team uncredited; 14-minute recording and a full GDD unused | **High** |
| Space Bounty Hunter | `/service-game-ui-2` | Sci-fi FPS MMORPG, team of three | 170 words, no media | Same pattern as above | **High** |
| Assets Hub | `/assethub` + `/uiux-prototype` | IxD 1 final project, Spring 2024, solo — a Spotlight-style asset search app | 241 words, identical on both cards | Two cards, one project; wrong term and category; Figma prototype and video unused | **High** |
| SushiGo | `/alt-controller-2025-b` | Alt Controller cooking game, Fall 2025 → Vision Pro, Spring 2026 | 587 words, 1 image | Team uncredited; three Figma UI pages and a playtest video unused | Medium |
| Build and Shoot | `/analog-game` | GDF3 Movement Game, Fall 2024 | 611 words, 0 media | Repeats the `/bns_gdd` card; says a playtest is still needed while two survey rounds exist | Medium |
| Super99 | `/alt-controller-2025-a` | GD4 data game, Fall 2025, solo | 470 words, 0 media | Pitch PDF, design docs and a system diagram unused; no recording anywhere | Medium |
| Squirrel Samurai | `/alt-controller-2025-c` | Two-player pedal controller game, Fall 2025 | 206 words, 1 image | 2-minute two-player recording sits unused; team unknown | Medium |
| Serial Deminer | `/serialdeminer` | Game jam submission, Oct 2024 — the voice benchmark | 939 words, 19 images, 3 videos | Teammates never named; itch link is on another account | Low |

---

## 1. Problems that sit in every drawer

1. **The footer claims evidence that isn't there.** Every case study ends with *"Current version: Built from the current project files, recorded gameplay, and editable design sources. Open tests are labeled where they occur."* — including MyFridge, To Be Chosen and both service-game UIs, none of which has a gameplay recording on the page. It is boilerplate from `caseStudyDetailMarkup()`.
2. **The template hero is the voice Red called out as not human.** Eight of these ten heroes run *"Player action: … Design question: … Current version: … still needed / still open / next test"*. It reads as an evidence ledger, not a person talking. Serial Deminer, the page Red likes, has none of it.
3. **Team projects presented as solo work.** No team is named on Curtain, Shroom Pot, The Mystery of Instrument, Space Bounty Hunter, SushiGo or Squirrel Samurai. The files name teams for four of them (below).
4. **"Still needed" claims that the files contradict.** Shroom Pot's untested yoga ball (21 responses exist), Build and Shoot's missing playtest (two survey rounds exist). These are the most damaging lines on the site: they undersell finished work.
5. **Dates and categories carried over from old cards.** Curtain's "12/9/2024–Present" belonged to a card that used to live at `/bns_gdd`. Assets Hub is dated 12/9/2024 on both cards; the old page says Spring 2024.
6. **Duplicate cards.** `/uiux-prototype` renders the Assets Hub case word for word. `/analog-game` and `/bns_gdd` both describe Build n Shoot's rules.
7. **Unused recordings: more than 22 minutes.** The Mystery of Instrument (13:57), Space Bounty Hunter (4:34), Squirrel Samurai (1:57), three Shroom Pot gyro clips, two Shroom Pot screen recordings, and SushiGo's playtest video.

---

## 2. Curtain — `/curtain`

**What it is.** A networked two-player game (Photon Fusion; the project ships a LAN sync
dashboard and an iPad-only display mode) about building a house room by room while
something outside asks to be let in: *"我好冷，可以让我进来吗？"* — "I'm so cold, may I come in?"
Started in Innovative Game Design, Spring 2026 (first commit 2026-03-26), still in
development (last commit 2026-09-09, builds archived 2026-07). Git: 79 commits by Red, 6 by
`doraphobia`. The project folder is named `Duo＿Curtain`.

**The page today.** 420 words, five sections, the playable WebGL build. It calls Curtain *"a
compact spatial prototype built around a grid, units, doors"* and says *"a full player
walkthrough is still open"*. The footer says *"Build and Shoot keeps its own rules case, and
its design document has a page of its own"* — a leftover from when this card lived at
`/bns_gdd`. The date, 12/9/2024–Present, comes from that old card; nothing in the files
predates March 2026.

| Source | Location | Gives |
|---|---|---|
| Unity project | `Spring26(T6)/Innovative Game Deisgn/Duo＿Curtain/curtain` | The build, and the rules as implemented |
| `FusionDesignStatus.md` | `…/Assets/Fusion/` (Chinese) | Confirmed rules, separated from temporary implementation — the single best design source |
| `GameplayDashboard.md`, `RED_SCENE_NOTICE.md` | `…/Assets/Curtain/Docs/`, `…/Assets/Scenes/` | The tuning model: enemy, vision, door, footprint, sanity, economy, accessibility settings |
| Figma "Curtains" | AltControl `0tCbAiVUlrPId3RWd9LRif`, page `963:1231` (92 text nodes) | Bilingual design notes: window states, light through blinds, monster spawns keyed to footprints, day/night branching, cursor reach vs arm reach, house backstory research |
| Key art | `~/Desktop/ArtCenter/Curtain/CurtainGame.pdf` | Floor plan of fused rooms ("2X5 UNIT", "5X5 UNIT"), yellow doors, footprints, the invitation line |
| `Curtain.ai` | `Summer26(T6.5)/SD 1/` | Later artwork, Summer 2026 |
| Git history | the project `.git` | A real development timeline, March → September 2026 |

**Rules the files confirm** (from `FusionDesignStatus.md`, marked "已确认并落地"):
- Rooms are bought in a shop (two clicks to confirm) and placed in Management Mode (Enter toggles it; the player freezes).
- Blocks that overlap or share an orthogonal edge fuse into one room. Diagonal contact does not.
- A door appears only at the moment of fusion, and only where the shared edge is exactly three cells long: the middle cell is the doorway, the two sides are wall.
- Doors open by clicking or by walking into them; the hinge is the wall end farther from where you hit.
- Day runs DayTop → DayBottom → BeforeNight → Night, and the phase drives the background.

The window and curtain economy is written up in the same file under *"旧窗户/阳光/金钱管线现状"* —
the **older** pipeline, still in the project but not marked as final: scrolling a curtain open
earns money by daylight (in DayTop the right window +2 per second, others +1; in DayBottom the
left window +2; nothing at BeforeNight or Night), and an open window is how an enemy sees the
player.

**Missing.** No recording of the game being played; the credit for the second contributor;
anything about what the visitor is.

**Plan.** Rebuild around the systems, with the invitation as the frame: the door rule as a
diagram (three cells → a door, anything else → an open seam); the curtain economy as a table
of phase × window side (labelled as the older pipeline unless Red says it is final); day and night, and what an open window costs you; management mode vs
player mode; the Figma design notes set as type; a development timeline from git; the build
kept. Fix the date to Spring 2026 → present and delete the Build and Shoot footer line.
**Needs Red:** who `doraphobia` is, and a screen recording of one full day-night cycle (or
permission to capture one from the WebGL build).

---

## 3. Shroom Pot Showdown — `/shroom-pot-showdown`

**What it is.** Alt Control 2 (Spring 2026), Team C. Two players share a pot: one is a mushroom
steered with a yoga ball, the other a pair of giant gyro chopsticks trying to catch and eat
it. The team's Drive folder is `Alt2_Mushroom`; teammates appear only as account names
(`xzhang28`, `diodoranz`, `jason7ymll`).

**The page today.** 855 words, six sections, two full recordings. The hero and the "Next
Test" section say *"the proposed yoga-ball mapping still needs a follow-up test."*

**That is wrong.** The Shroom Pot Showdown 4.0 playtest (Google Form, responses 2026-04-05 →
04-22) has **21 responses**, and "Mushroom Yoga Ball" is one of the controllers being rated:

| Question | Result |
|---|---|
| Which controller did you enjoy more? | Yoga ball **10** · chopsticks 5 · both 4 · no answer 2 |
| Did the controller respond as expected? | Sometimes **12** · mostly 5 · rarely 3 · always 1 |
| Hardest part | Controlling the mushroom **12** · the chopsticks 4 · avoiding chopsticks 3 · boiling zones 2 |
| How fun? | Fun 12 · very fun 6 · neutral 3 |

The open answers point the same way — *"I wish the chopsticks could just be moved like real
chopsticks, rather than tilting it"*; one tester describes the ball spinning the mushroom in
place when they meant to go forward, and asks for the jump to be built into the ball instead
of a separate button. A 3.0 round (March 2026) also exists.

| Source | Location | Gives |
|---|---|---|
| Playtest 4.0 + responses | Drive form `1mYrCPF3…` / sheet `1vKeqfs2…` | 21 responses, above |
| Playtest 3.0 + responses | Drive form `1L3rfCVo…` / sheet `1ZLGN2Sj…` | An earlier round — the before |
| Team Figma | `174btXmgZagM2UU2Ud7TXz`: GDD, purchase list, weeks 4–13 (10 pages) | Weekly progression, never used on the page |
| LABO page | AltControl `1158:140` | Red's own board |
| Recordings | `Spring26(T6)/Alt Control 2/` | 3 gyro clips (18–24 s) and 2 screen recordings (28 s, 38 s) unused |
| Budget, 3D | `budgeALT2Team3Mushroom`; opening-scene renders `.png/.blend/.fbx` | Build cost; the cutscene art |

**Plan.** Replace "Next Test" with **What 21 Players Said** (the table above, drawn as bars);
turn the ten weekly Figma pages into a timeline; show the two controllers side by side; add
the unused gyro clips as the iteration record; name the team. **Needs Red:** teammates' names
and who built which controller.

---

## 4. The Mystery of Instrument — `/service-game-ui`

**What it is.** Game as Service, Spring 2026. Team: **Red, Duo, Jinqi** (the deck is titled
*"The Mystery of Instrument (Red, Duo, Jinqi)"*). A mobile music-puzzle service game: you
inherit your late father's mechanical instrument and restore it — rhythm levels, a 3D puzzle
mode where you rotate and zoom the device to find sheet-music fragments, an inventory of
instruments with four attributes, a gacha ("Pool of Inspiration"), orchestras, and a
Chinese New Year live-ops event with its own currency. Art direction: Mechanical Gothic,
Victorian.

**The page today.** 185 words, two sections, no media. *"A service-game interface prototype.
The case study focuses on how a player reads a task and acts through the interface."* None of
the game is described, and the team isn't named.

| Source | Location | Gives |
|---|---|---|
| GDD | Google Doc `1AZ2O7fP…` (Jinqi's) | Identity, pillars, the full economy (coins, windup keys, energy, gears, components — each with source and sink), every screen, analytics plan, roadmap, live ops |
| Pitch deck, two versions | Drive `NEW…pdf` (2026-03-11), `OLD…pdf` (2026-01-29) | The pitch as presented, and how it changed |
| Recording | `Spring26(T6)/Game as Service/The Mystery of Instrument.mov` — **13:57**, 455 MB; also in Drive | The prototype walkthrough |
| UI source | same folder: `TheMystery of Instrument.ai`, `Drum.png`, `viola.png`, `1x/ 2x/ 3x/ SVG/` exports | Red's UI and instrument art — evidence of Red's role |

**Plan.** Premise and pillars; the economy as a source/sink table (the GDD already has the
numbers); the screen set from Red's exports, grouped by system; the full recording (encoded
for web, with chapter marks — it is 14 minutes); live ops as one short section; credits.
**Needs Red:** confirm the role split (the local files suggest UI and instrument art).

---

## 5. Space Bounty Hunter — `/service-game-ui-2`

**What it is.** Game as Service, Spring 2026. Team: **Kaine, Red, Weiting** (the Drive folder
is *"Space Bounty Hunters (Weiting, Red, Kaine)"*). A sci-fi FPS MMORPG for console and PC
built on hunt-based progression: take a bounty, hunt, harvest planetary materials, refine
them, craft better gear. Five species, six backgrounds, a Bitcoin economy.

**The page today.** 170 words, two sections, no media — *"a service-game interface prototype
about reading a bounty task"*. Team unnamed.

| Source | Location | Gives |
|---|---|---|
| GDD | Google Doc `1cZgFOZw…` | Identity, pillars, economy tables (Bitcoin sources and sinks; 7 raw → 11 refined materials), species and backgrounds with stat modifiers, roadmap |
| Pitch | Drive `Space Bounty Hunters_Pitch.pdf` (Red's, 14 MB) and `.pptx` | The pitch |
| Final deliverables folder | Drive `15sysr0N…` | Slides, data sheets, the recording |
| Playtest feedback, prototype link | Drive (shortcuts in the team folder) | Test results; the Figma prototype |
| Recording | `~/Downloads/SpaceBountyHunters.mov` — **4:34**, 131 MB (not archived into ArtCenter) | The core-loop prototype |

**Plan.** Premise; the hunt loop; the materials chain (raw → refined) as a diagram; species ×
background as a table; the prototype recording in full; credits. **Needs Red:** role split
(the GDD lists "core-loop Figma prototype" as a deliverable — likely Red's), and access to the
playtest-feedback file.

---

## 6. Assets Hub — `/assethub` and `/uiux-prototype`

**What it is.** Red's **IxD 1 final project, Spring 2024** (the old page: *"RED WANG — IXD 1
FINAL PROJECT — 24Spring"*), solo. A macOS app in the shape of Spotlight for creative files:
one search bar that syncs local and cloud locations, search by describing a file, tag
searches, a scoop filter, a sorting bar, keyboard actions, and a settings screen.

**The page today.** Two cards, identical content, 241 words, no media. Both dated 12/9/2024;
one says "Production Design", the other "UI/UX Prototype". The old page and the Figma file
say Spring 2024 and Interaction.

| Source | Location | Gives |
|---|---|---|
| Figma prototype | `HEpE6DzXmVK9AkYB8LDVuP` "IxD1-Final-Project-Red", page `57:142` (97 frames), start node `704:1008`; page `0:1` Wireframe | Every state: search bar syncing / cloud / expanded / "describe", tag searches (Fashion, Cats, GDF), scoop filter, sorting bar, action and escape keys, settings (4559 px tall), login, light/dark, four Mac mockups |
| Demo video | YouTube `PjBUK45MWJs` (autoplayed on the old home page) | The prototype in motion |
| Old page | `redinastrike.framer.website/assethub` — one 3282 × 4922 original | The presented board |

**Plan.** Keep one card. Rebuild: the problem (assets scattered across devices and clouds);
the search model as a small diagram (describe → tag → filter → sort); the key states exported
from Figma as a screen grid; the video; the settings system. Correct term and category.
**Needs Red:** which card to keep, or whether `/uiux-prototype` was meant to be a different
project.

---

## 7. SushiGo — `/alt-controller-2025-b`

**What it is.** A cooking game played through a sequence of hand gestures — knife, cut, rice,
plate, deliver. Alternative Controller, Fall 2025 (with Leap Motion) → Alt Control 2, Spring
2026 (Vision Pro). The Fall 2025 playtest files are titled *"Susan_Conred_Red"*.

**The page today.** 587 words, six sections, one image, no video, no team.

| Source | Location | Gives |
|---|---|---|
| Figma | AltControl `176:77` SushiGo; `1801:8` Current Unity UI; `1818:8` UI Inventory; `1820:22` Typography Review | The design and a complete UI inventory — the last three pages unused |
| Playtest video | Drive `Susan_Conred_Red_Sushi_Go Playtest Side-by-Side.mp4` (14.5 MB) | Players and screen together |
| Playtest form folder | Drive `1Qy6Y1xb…` | Not readable with the connected account |
| Unity | `Spring26(T6)/Alt Control 2/SushiGo` (+ `_VisionPro`, two duplicates, 248 GB) | The build |

**Plan.** Name the team; the gesture sequence as a flow; the UI inventory from Figma; the
playtest video; Leap Motion → Vision Pro as the iteration. **Needs Red:** team roles, the
canonical Unity root, access to the playtest form.

---

## 8. Build and Shoot — `/analog-game`

**What it is.** The GDF3 Movement Game, Fall 2024 — the board game whose design document is
the `/bns_gdd` card. Second-iteration GDD pages were exported 2024-11-02
(`~/Desktop/ArtCenter/Website/MovementGame_2ndIteration_GDDRW_Draft/`); `/bns_gdd` is built
from the fourth iteration.

**The page today.** 611 words, seven sections of rules that `/bns_gdd` now presents in full,
and *"a matched playtest recording is still needed before I describe a final result."* Two
survey rounds exist: `GDF3 Build N Shoot Survey` and `GDF3 Build N Shoot Survey（3rd）` in
Red's personal Drive.

**Plan.** Give the two cards different jobs instead of the same rules twice: `/analog-game`
becomes the game and its playtests (iterations 1 → 4, what the surveys said, what changed),
`/bns_gdd` stays the document. Or merge them into one. **Needs Red:** merge or split; export
the two survey response sets (the connector can't reach the personal Drive).

---

## 9. Super99 — `/alt-controller-2025-a`

**What it is.** The GD4 data game, Fall 2025, solo: a cashier and stock clerk who turns
customer requests into shelf decisions, with a physical barcode scanner as the planned input.

**The page today.** 470 words, four sections, no media; *"I still need to match them to the
playable build and scanner recording."*

| Source | Location | Gives |
|---|---|---|
| Pitch PDF | `GD4_DataGame_RW/Assets/Game Development 4_DataGame_Pitch_RedWang.pdf` | The pitch as presented |
| Design docs | `README.md`, `docs/CrossPlatformDevelopmentGuide.md`, `Assets/Scirpt/Documentation/GameStructure.md`, `CustomerPrefabStructure.md`, `StructureComparison.md` | How the game is built |
| Figma | GD4 `67:113` pitch (used); **`6:19` Week 2 system diagram (unused)** | The system diagram |
| Scanner tech | `Vuforia Barcode Sample`, `Fall25(T5)/scanner.html` | The input line, never on the page |

**Missing.** No recording and no build found anywhere. **Plan.** Rebuild the system diagram
natively from `6:19`; product data → shelf mapping; the scanner line. **Needs Red:** a
recording from the Unity project, or confirmation that none exists.

---

## 10. Squirrel Samurai — `/alt-controller-2025-c`

**What it is.** A two-player body-input game with floor pedals for directional attack and
defence, Fall 2025 (Unity project `Fall25(T5)/Game Develepment 4/AltControl3`).

**The page today.** 206 words, three sections, one image. The recording
`~/Desktop/ArtCenter/SquirelSameri.mp4` (**1:57**, two players) is unused. No Figma page and no
Drive files found.

**Plan.** Put the full recording on the page and rebuild the three sections from what it
shows plus the Unity scripts. **Needs Red:** team and role.

---

## 11. Serial Deminer — `/serialdeminer` (benchmark)

939 words, seven sections, 19 images, three videos — the page the others should sound like.
Small things: teammates are mentioned (*"with my teammates"*) but never named; the itch.io
link (`drcharless-scp.itch.io`) is on another account; section headings end in colons
("Target Audience:").

---

## 12. Decisions only Red can make

1. **Build and Shoot:** merge `/analog-game` into `/bns_gdd`, or split them (game and playtests vs. document)?
2. **Assets Hub:** delete `/uiux-prototype`, or tell me what it was meant to be.
3. **Credits and roles** for Curtain (`doraphobia`?), Shroom Pot, The Mystery of Instrument, Space Bounty Hunter, SushiGo, Squirrel Samurai.
4. **Exports** only Red can do: the two Build N Shoot survey response sets; access to the SushiGo playtest form; Space Bounty Hunter's playtest feedback.
5. **Recordings:** a Curtain day-night walkthrough and a Super99 run — or permission to capture Curtain from the WebGL build myself.
6. **Site-wide:** drop or rewrite the "Current version" footer, and retire the "Player action / Design question / Current version" hero template as each page is rebuilt.
