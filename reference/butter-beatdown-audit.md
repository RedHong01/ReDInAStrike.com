# Butter Beatdown 2: No Churning Back — audit and reconstruct plan

Date: 2026-09-10. Continues the audit Codex began; every claim below is re-verified
against the file named beside it. Butter Beatdown has **no route on the site today**.

Team: Red Wang and Andrew Villasenor. Fall 2025, Alternative Controllers final project.

---

## 1. Sources, and what each one can actually prove

| Source | Location | Proves | Cannot prove |
|---|---|---|---|
| Final Presentation, 13 pages | `~/Downloads/Butter Beatdown 2 No Churning Back…pdf` (85 MB, 111 images) — same document as Canva `DAG7pWgtJyI` | The team's own account: premise, loop, fabrication steps, the three problems and four fixes, the role split | That the fixes worked. Nothing here is a retest. |
| Fabrication board | Figma AltControl `0tCbAiVUlrPId3RWd9LRif`, page `368:2` "FInalProject" (22242 × 8677) | Research references, the laundry-basket prototype, hinge/hardware trials, wood process photos, two circuit diagrams, logo lockups | Dates. The board carries no timestamps. |
| Unity project | `Fall25(T5)/Alt Controller/FinalAssignment/Butter_Beatdown2/` | What the game reads and how it scores; 9 scripts, 2 scenes | Red's contribution — see §4 |
| Git history | same folder, `.git` | 5 commits, 2025-12-02 → 2025-12-10 | — |
| Term review recording | `~/Downloads/Red Wang  - 6th Term Review - 04082026.mp4`, Butter section ≈ 26:21–31:17 | The reviewer's spoken response | — |
| Logo art | `Fall25(T5)/Alt Controller/ButterBeatDown.ai` (0.8 MB) | The identity work | — |
| `IMG_0572.mov` | `~/Downloads/` — 10.9 s, 480×854 vertical, silent, 2026-02-13 | One short clip of something | Unverified subject. Dated two months after the project. |

---

## 2. Verified findings

**The premise, in the team's own words** (presentation p3):
> "In the dusty fields of Dairyville a centuries-old tournament reawakens to find its new champion."
Players stand over a churn, grab the rod, and churn rhythmically to a beat. Churn too fast and
the churn jams — then you bang the rod against the controller's sides to free it. Comparables
named: Mario Party, and 1-2 Switch!'s Soda Shake and Milking games.

**The fabrication record** (p6–p9) is the strongest material and it is specific:
- Waist-level sizing so a player stands upright, grips the handles, and bends slightly to churn.
- Two material tests: 1/8-inch MDF (the maximum the Laser Lab can cut) against 1/4-inch MDF, which needed other methods.
- Router-trimmed edges to align lid and barrel, then sanded.
- Table saw blade rotated **15 degrees** to cut the handle stick — creating internal space for circuitry and a more stable contact when gripped.
- Laser cutting for the logo font and directional symbols, then spray paint.

**Three problems, four fixes** (p10–p11) — this is a real iteration record:

| Problem reported | Fix made |
|---|---|
| Exceptionally loud — wood slamming on wood | Padding at the end of the churning stick |
| Players wanted more agency; confused about how to unstick the churn | Expanded the side touchpads so side-touching felt more responsive |
| Wire hookups broke during testing | Wire setup adjusted for rowdier play |
| — | Meter fill rates and timing retuned to match controller inputs |

**What the code actually reads:** `KeyCode.S / A / D` for one player, `KeyCode.DownArrow /
LeftArrow / RightArrow` for the other, plus two `KeyCode.Space`. Nine scripts: `ButterChurn`,
`BarFill`, `TimerScript`, `StartingCountdownScript`, `EndstateManager`, `RandSelectStart`,
`RandVictory`, `RiseScript`, `vsScoreUI`.

---

## 3. Three discrepancies — all confirmed by coordinate or file check

**a. The circuit diagram mislabels player 1's third contact.**
Both bottom contacts on the two-panel diagram are labelled "Down Arrow" — verified at
`(2004, 2936)` and `(3292, 2936)` in `368:2`. But the panel at x≈2944–3758 is the **A Key / D
Key** player, whose third input in code is `KeyCode.S`. The diagram is correct for player 2 and
wrong for player 1.

**b. The two-player scene is not in the build.**
`SampleScene 1.unity` is **not** an iCloud conflict copy — it is the versus scene: 75 GameObjects
against 39, containing `Churn #2` and `VS` references. `EditorBuildSettings.asset` enables only
`Assets/Scenes/SampleScene.unity`, the single-player scene. The whole "two controllers, compete
locally" pitch on p3 is not in the shipped build configuration.

**c. The development agenda is shared with DAD.**
The "Dad Game Development Agenda" board carries both projects. Red has confirmed this is
deliberate, not a mislabel — so tasks on it (lumber purchase, controller assembly) can be read as
Butter work, but each row still needs its own date and completion check before use.

---

## 4. The evidence problem, stated plainly

All five git commits are by `avillasenor2002`. Red has none. That is consistent with the role
split the presentation states — Red on controller design and physical computing, Andrew on game
programming and system design — but it means **the code repository cannot evidence Red's
contribution at all.**

The reviewer said as much in the term review: the fabrication record and handoff diagrams are
valuable, but they do not demonstrate team collaboration performance.

**Confirmed by Red, 2026-09-10:** the laundry-basket controller is **Andrew's**. The
second-generation controller — the wooden barrel — is **Red's**. This is the fact that gives
Andrew's sentence its meaning: "taking the lead on revising the controller" describes a specific
handover, from Andrew's v1 to Red's v2, not a vague share of the work. The page should be built
around that handover, because it is the one claim here that two independent sources agree on.

Two things do carry weight and should be used carefully:
- Andrew's written statement (p12): *"Collaboration went smoothly with Red doing an incredible job taking the lead on revising the controller."* This is a teammate's attribution — quotable **as** attribution, not as proof of outcome.
- The fabrication record itself, which is unambiguously the physical work.

**The page should therefore be a controller-design case study, not a collaboration story.**

---

## 5. Reconstruct plan

New route needed — Butter Beatdown has no card today. Proposed `/butter-beatdown`, nav `game`,
Fall 2025. Sections in the drawer's existing vocabulary (see `drawer-inner-page-rules`):

| # | Kind | Content |
|---|---|---|
| 1 | `copy-grid` | Dairyville premise + what the churn actually asks of your body |
| 2 | `system-grid` | The loop in three: CHURN to the beat / JAM if you rush / BANG the sides to free it |
| 3 | `diagram` (SVG) | The controller in section: waist height, handle at 15°, internal cavity, side pads |
| 4 | `spec-table` | Tools and procedures — the four presentation steps with their real measurements |
| 5 | `symbol-key` | Materials and hardware: 1/8" MDF, 1/4" MDF, hinges, latches, sponge contacts, wire |
| 6 | `matrix` or `spec-table` | Input map: contact → key, both players, **with the diagram error shown and corrected** |
| 7 | `spec-table` | Three problems → four fixes, with a fourth column saying plainly that none were retested |
| 8 | `callout` | Andrew's attribution quote, credited to him |
| 9 | `text` | What the build actually ships: single-player scene enabled, versus scene present but not in build settings |
| 10 | `flow` or `copy-grid` | **The handover: Andrew's laundry basket (v1) → Red's wooden barrel (v2)** — the spine of the page |

Media to use: the Figma fabrication photos (hinges, wood process, whiteboard controller diagram),
the circuit diagram redrawn as SVG in the site's ink/rule language rather than embedded as an
image, and `ButterBeatDown.ai` for the identity.

---

## 6. Blocked or needing Red

- **Video — not retrievable from anything on this machine.** Verified 2026-09-10: the PDF export contains zero video objects (`/Movie`, `/RichMedia`, `/Screen`, `/EmbeddedFile` all absent) — Canva rasterises video to stills on export. No `IMG_0554` / `IMG_0578` anywhere on disk; the Photos library holds no `.mov` originals locally. The clips exist only inside Canva design `DAG7pWgtJyI`. The p4/p5 "SIDE BY SIDE VIDEO" is the one the page most needs. `IMG_0572.mov` (10.9 s, vertical, silent, 2026-02-13) is the only Butter-adjacent clip on disk and its subject is unconfirmed.
- **Which panel is which player.** The correction in §3a assumes the A/D player is player 1. Worth one sentence from Red to fix the labels correctly rather than by inference.
- **Term review audio.** The Butter section at 26:21–31:17 has not been transcribed; the reviewer's exact wording would sharpen §4.
