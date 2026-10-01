# Performance optimization — 2026-09-21

Baseline: `3fd16b580723d6272c35e85464c82e0ebb8ac43d`, with the original source and HTML saved separately before editing. Measurements below are local-browser results, not production network or field-user measurements.

## Measured changes

| Area | Before | After | Scope |
| --- | ---: | ---: | --- |
| Homepage requested JS + CSS | 1,641,665 bytes | 1,080,604 bytes | 34.2% fewer uncompressed response bytes |
| Homepage JS + CSS requests | 62 | 25 | 37 fewer requests |
| 10 selected images | 10,269,846 bytes | 6,281,714 bytes | 3,988,132 bytes saved; original dimensions and browser-decoded pixels preserved |
| First Graphic switch: pixel-grid construction | 65.6 ms | 18.7 ms | Median of three alternating before/after runs; about 71% less setup work |
| First Graphic switch: total script work | 533.0 ms | 509.4 ms | Same runs; about 4% lower, not a claim of a 71% faster overall animation |
| Cancelled callbacks retained after 5,000 cancellations | 5,000 | 0 | Cancellation order and next-frame execution also verified |

The 40-canvas isolated setup probe measured 100.4 ms → 14.6 ms in the final pass. A synthetic 3,200-target nested text fixture selected exactly the same elements and measured 648 ms → 209 ms including module loading; this is supporting evidence, not a real-page timing claim.

## Implementation

- Production builds combine styles in their original order, bundle modules with shared chunks, minify JS/CSS, and name outputs by content. Function names remain intact because the existing scheduler uses callback names to suspend the footer. UTF-8 text, lazy editor modules, relative module URLs, fonts, and the Figma capture loader's sibling path are preserved. Development source stays readable and is copied alongside the production bundles.
- Reveal motion reuses five image-independent fields for cards with identical grid dimensions and motion settings. Image darkness and threshold values remain specific to each image. An LRU limit of 12 field configurations bounds additional retention. The same random functions and floating-point operations produce the fields; animation timings, density, resolution, and effects are unchanged.
- Text animation finds nested candidates with a descendant selector instead of comparing every text block against every other block. Existing blocks retain their early return and the same innermost text blocks own the animation.
- The render kernel removes cancelled tasks from its task registry immediately. Cancelling a sibling already included in the current frame still prevents its execution.
- Ten PNGs receive lossless WebP candidates; original images remain the fallback and lightbox source. One embedded-profile PNG was skipped. Four additional candidates were rejected after real browsers exposed gamma or transparent-edge differences despite raw decoder equality. They remain in their original formats.

## Verification

- Chromium screenshot comparison: homepage, expanded card, and settled detail drawer at 430, 940, and 1280 px — all 9 comparisons have **zero different pixels**. Reduced motion was used for these deterministic captures. Only third-party iframe interiors were masked; their source, configuration, and surrounding geometry were compared separately.
- Full-document content comparison: all 20 entry routes in both Chromium and WebKit preserve text, headings, image fallback paths and alt text, links, iframe sources and permissions, and catalog count. Embedded applications were isolated for this content-only check.
- Normal-motion interaction smoke checks in Chromium and WebKit: category switching, Floyd mode, card expansion, drawer open/close, rapid A/B switching, scroll, and reduced-motion behavior — 6 viewport/motion combinations pass. These establish working interactions, not exact equality of every intermediate frame.
- Existing category raster oracle: 24 exit + 8 enter cases, 3,002,880 RGBA bytes compared exactly.
- Existing boundary raster oracle: 90 cases; 9,820,800 RGBA bytes plus the same number of canvas readback bytes compared exactly.
- Original versus new reveal field checksums match across 45 configurations covering three grid shapes, five directions, and different seeds, thresholds, and clustering parameters.
- Every accepted image matches browser-decoded RGBA byte for byte in Chromium and WebKit.
- DAD, Slow’em Down, and Curtain initialize, enter fullscreen, fit desktop/mobile bounds, and unload when their drawers close — all 6 existing playable checks pass.
- The generated site works from a subdirectory, including project entry and the dynamically loaded Shift+D editor and its stylesheet.
- `dist` and `docs` match across 431 files. Authored source mirrors match. All 22 local assets directly referenced by the entry HTML exist and are nonempty. Build produces 20 routes; whitespace checks pass.

## Existing test failures

Two older regression scripts fail identically on the saved baseline and the optimized site:

- `audit-preview-handoff.mjs`: `430: dark preview keeps white rule` expects a white pseudo-element, but reads transparent.
- `audit-drawer-switch.mjs`: `chromium-1280-10-to-12: wheel removed reverse motion`.

These failures were reproduced rather than suppressed or relabeled as passes. The current screenshots and interaction checks above cover the retained behavior, but do not settle whether these old assertions are stale or identify existing motion defects. No visual behavior was changed to satisfy them.

## Delivery and evidence

Changes are local and built into both `dist` and `docs`; nothing has been pushed or published. Preview: http://127.0.0.1:4174/.

JSON results in this folder preserve resource measurements, timing runs, content checks, image parity, interaction smoke checks, callback cleanup, text-target parity, and Unity initialization/unload results. `reference/lossless-image-verification.json` records dimensions, byte counts, and decoded-pixel hashes for the accepted image variants.
