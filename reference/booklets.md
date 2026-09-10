# Booklets — Pitchfork Magazine and the Type 2 Specimen

Located and dated 2026-09-10. Both exist in many copies; the authoritative version of
each is named below. **Filename week numbers are not reliable** — a file called `Wk12`
is dated later than one called `Wk14`. Sort by modification time, never by name.

Also: `~/Downloads` holds Specimen booklets by **other students** (MichelleHeo, KatieKim,
Nick Rheem, MichellePark, Vy Huynh, Julia Rz, Jinghan Zhang). Those are classmates' work.
Red's own files always carry `Red_Wang` / `RedW` / `Type1..._RW`.

---

## 1. Pitchfork Magazine

Site route `/pitchfork`, shown as "Magazine Design", 12/9/2024. The files do not use the
word Pitchfork — everything is named `Type1_Final_Magazine_RW`, which is why a search for
"pitchfork" finds only website assets.

**20 pages.** Confirmed two ways: the print export is 1 single cover + 9 spreads + 1 single
back cover, and the page-by-page set runs 2–20 with page 1 absent.

| Role | File | Date | Notes |
|---|---|---|---|
| **Latest artifact** | `~/Desktop/ArtCenter/Type1/Type1_Final_Magazine_RW_Print_Page_01…11.jpg` | **2026-05-11 01:06** | 11 print sheets. Page 01 is 1275×1650 portrait (cover), 02–10 are landscape spreads up to 3400×2200, page 11 is 1292×1672 portrait (back). |
| Page-by-page singles | `~/Desktop/ArtCenter/ArtWorks/PitchforkMagazinePageByPage/2.png … 20.png` | 2025-11-05 | 19 files at 2551×3301 (letter @300 dpi). **Page 1 is missing** and **`2.png` is a 612×792 low-resolution outlier** — everything else is full quality. |
| Source document | `~/Downloads/Type1_Final_Magazine_RW.indd` | 2025-06-30 15:04 | 178 MB. Older than both exports, so the exports were produced from it without further edits. |

Website copies (`public/`, `dist/`, `docs/assets/framer-live/pitchfork.*`) are build output
derived from these — not sources, and they re-date on every build.

**Use for the site:** the 2026-05-11 print sheets are the most recent and the only complete
set. If single pages are wanted instead, the ArtWorks set is higher resolution but needs
page 1 supplied and page 2 re-exported.

---

## 2. Type 2 Specimen Booklet

Spring 2026, Type 2. Two bound pieces, not one: a **booklet** and a separate **insert**.

**Format:** 696 × 903 pt per page (≈ 9.7 × 12.5 in). The booklet is 16 single pages = 8
spreads. The insert is 2 pages = 1 spread.

| Role | File | Date | Pages |
|---|---|---|---|
| **Latest file of all** | `Spring26(T6)/Type2/Red Wang Wed Print/Red_Wang_Wk14_ SpecimenOnlyInsert_SP26.pdf` | **2026-04-25 07:46** | 2 (1 spread) — the insert alone |
| **Latest booklet, spreads** | `Spring26(T6)/Type2/Red_Wang_Wk14_ SpecimenFinal_Type2_SP26.indd.pdf` | **2026-04-22 16:23** | 8 spreads, 15.1 MB |
| Latest booklet, single pages | `Spring26(T6)/Type2/Red_Wang_Wk14_ SpecimenColorFixed_ype2_SP26.pdf` | 2026-04-22 01:28 | 16 singles, 7.4 MB (a byte-identical `copy.pdf` sits beside it) |
| Print package | `Spring26(T6)/Type2/Red Wang Wed Print/` | 2026-04-21 → 04-25 | Holds `Red_Wang_Wk12_ SpecimenColorFixedFinal_Type2_SP26.pdf` (8 spreads, 2026-04-22 14:55 — **despite the Wk12 name it is later than several Wk14 files**), the insert, and `Type 2_phases poster_SP23.pdf`. |
| Latest InDesign source | `Spring26(T6)/Type2/Red_Wang_Wk14_ SpecimenInsertFinal_Type2_SP26.indd` | 2026-04-23 11:33 | 75 MB — this is the **insert** document |
| Latest booklet InDesign source | `Spring26(T6)/Type2/Red_Wang_Wk14_ SpecimenBooklet_Type2_SP26 copy copy.indd` | 2026-04-21 15:24 | 40.5 MB — the booklet body |

46 of Red's Specimen files exist in total, including `[Recovered]` versions, `.ps`
intermediates, and chains like `copy copy copy`. Everything above supersedes them.

**Use for the site:** pair `SpecimenFinal_Type2_SP26.indd.pdf` (booklet, 8 spreads) with
`SpecimenOnlyInsert_SP26.pdf` (insert). Together they are the complete Wk14 deliverable
and they are the two newest meaningful artifacts.

---

## Where these belong on the site

`/pitchfork` is live and carries the magazine.

The Specimen **does** have a home — `/narrative-design-document` — but it is reached in a way
that hides it from any search of the projects array. `src/project-metadata-prelude.js`
monkey-patches `window.Map` so that, at the moment the project map is constructed, this route
is overridden to:

    pageTitle:    "Untitled Sans"
    displayTitle: "Type 2 Specimen Booklet"
    navHash:      "graphic"

So the array still reads `Narrative Design Document` while the card renders as
**Untitled Sans / Type 2 Specimen Booklet** under Graphic. The case-study entry agrees with
the override — `title: "Untitled Sans"`, `category: "Type Specimen / Editorial Layout"`.

**Untitled Sans is the typeface the specimen is about**, which the Type 2 folder confirms:
`Untitled Sans Cover Idea.ai` and `Untitled Sans+Under the Skin_Research_RedW.pdf`.

Two consequences worth knowing before editing anything here:

1. Grepping `main.js` for "Specimen" finds only the category string. The label lives in the
   prelude, not the data.
2. The route slug still says `narrative-design-document`, which belongs to a different piece
   of work (To Be Chosen). The current page copy states that separation itself — but the slug
   remains misleading, and renaming it is the honest fix whenever the routes are next touched.

Neither booklet's actual pages are on the site yet. `/pitchfork` and the Specimen page both
run on card imagery and prose; the 20 magazine pages and the 8 booklet spreads plus insert
listed above have never been published.
