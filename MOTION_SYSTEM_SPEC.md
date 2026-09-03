# ReDInAStrikE Motion System Contract

## 1. One binary surface, many motions

Every paper / ink effect must operate on the same logical binary surface. The final Floyd image is not a separate high-resolution solve. It is the canonical bit field used by static display, viewport reveal, hover return, resize reconcile, and any future binary motion.

The canonical surface is identified by:

- source image
- dither mode and tone parameters
- integer logical columns and rows
- object-fit and object-position

CSS width, CSS height, scroll position, header size, DPR, and viewport breakpoint are presentation geometry. They are not part of the binary solve signature unless they actually change the media aspect ratio or the configured logical grid.

## 2. Resolution rule

For generated binary modes, the final dither canvas backing store is exactly `cols × rows`.

One logical dither cell = one backing-store pixel. Motion canvases must use the same `cols × rows`. Do not create an additional `cssWidth × DPR` bitmap for the same bit field.

The canvas can be scaled by CSS to the current card bounds. `image-rendering: pixelated` is presentation only; the underlying bit positions do not move when the header changes card width.

The logical grid is derived from the declared media aspect ratio first, not from transient measured width during header animation. A normal scroll-driven resize therefore scales the same bit field and does not trigger a new Floyd solve.

A new binary solve is allowed only when at least one of these changes:

1. source image
2. dither mode or tone parameters
3. logical columns / rows
4. object-fit / object-position
5. media aspect ratio

## 3. Motion ownership

Only one motion system may visually own a card at a time. Priority:

1. category / active-color transition
2. hover-return handoff
3. binary resize reconcile
4. viewport reveal / boundary breath
5. static binary surface

A higher-priority owner hides lower-priority overlays. Handoff must expose the next owner only after both owners refer to the same canonical bit field.

For hover return specifically, the target owner is the current viewport composite, not the static binary surface. If a card is inside the top or bottom boundary field, the handoff must preserve that clipped state continuously. The full static card must never appear as an intermediate frame.

## 4. Shared binary motion language

Binary motion uses paper and ink only. Changed cells transition; unchanged cells stay fixed.

Shared defaults live in `binary-surface-core.js`:

- binary reconcile duration: 420 ms
- softness: 0.095
- deterministic seed family: 41
- cluster size: 3 cells
- cluster mix: 0.16
- smoothstep progress curve

Resize and hover-return read the canonical old/new bit placement and perturb only cells whose bit changed. They must never temporarily reveal a separate full-resolution raster between states.

## 5. Category transition timing

The visual dissolve must remain active through the catalog DOM handoff. The Fine Signal exit duration is aligned with the catalog structural exit budget, with no uncovered structural frame. Entry keeps the longer resolve/settle envelope so the new catalog can finish layout and priority rendering under the transition.

Expensive binary source sampling and diffusion maps are cached by source/grid/config so rebuilding category DOM does not require a fresh image sample and Floyd solve for every card.

## 6. Header-driven layout and breakpoints

The header is allowed to drive content bounding continuously. The horizontal content-width proxy follows the visual logo at fine increments instead of the previous coarse width bucket. The vertical header-height proxy remains under `performance-prelude.js` ownership so its synthetic geometry cache stays internally consistent; that vertical proxy does not define the binary media grid.

Continuous card-width changes must not wake the binary solver. During scroll, the existing logical surface simply scales with the card. `ResizeObserver` only schedules a binary render when the logical columns or rows actually change.

This rule is identical on desktop, tablet, phone, portrait, and landscape breakpoints. A breakpoint that changes column count but keeps the media aspect ratio keeps the same binary field. A breakpoint that intentionally changes the media aspect ratio produces a new integer grid and uses the binary resize reconcile motion.

## 7. Performance rules

- Never include CSS width/height in a binary render or reveal signature.
- Never rerun Floyd just because a card changed CSS size with the same aspect ratio.
- Reuse cached source luminance and diffusion maps across category DOM rebuilds.
- Keep visible priority work to one expensive first-time card per frame.
- Offscreen work stays in idle slices.
- Do not create a resize-snow state when old and new bit fields are identical.
- Motion overlays use logical-resolution canvases, not DPR-sized canvases.
- Hover return captures the visible `static + boundary` composite before hover, then hands off directly to the current `static + boundary` composite after hover.

## 8. Debug invariants

For any filtered card in generated binary mode:

- `dither-preview-canvas.width === data-dither-columns`
- `dither-preview-canvas.height === data-dither-rows`
- `data-dither-surface-version === "1"`
- motion overlays use the same columns and rows
- scrolling without an aspect-ratio change must increase `skippedCssResize`, not `logicalResizeRenders`, in `window.__RED_DITHER_PUBLIC_RUNTIME__.perf`
- an edge-card hover return must never expose the static canvas without its current boundary field

If a visible pop occurs, first check whether a handoff exposed two canvases with different backing dimensions, different render signatures, or different viewport-boundary ownership. Do not hide that mismatch with opacity; fix ownership or grid identity.

## 9. Responsive preview contract

- Above 980px in landscape, the catalog uses paired columns. The expanded row may pin below the header and hide its paired sibling.
- At 980px and below, or in portrait, cards stay in one ordered column. The expanded row stays in document flow and never removes its sibling.
- At 700px and below, preview media and copy stack. Above 700px they retain their two-panel composition, independently of the catalog column count.
- Every expanded card owns two 1px paper/ink rules at its own top and bottom edges. They span the same viewport width as the card, not the containing two-card row. Do not calculate their reach using the desktop content gutter.
- Rules inherit the card's existing 420ms clip-path expansion/retraction. They do not run a second reveal, use the boundary dissolve, or require a scroll listener.
- Normal sibling dividers cannot add padding or a second rule inside an expanded card. Collapsed cards keep their normal content-width dividers.
- The header still occludes content that has genuinely scrolled behind it. A screenshot assertion must place the tested rule inside the visible viewport before testing its pixels.

## 10. Responsive type and content contract

- Homepage and all project-detail shells share the 980px tablet and 700px phone content bounds. Detail interiors respond to their actual container width, including changes driven by the header.
- Preview headings use the serif family, zero tracking, and the shared 48/42/34px scale selected by the copy container (above 440px, up to 440px, up to 320px). Narrower viewport alone must not make the same available copy width use a larger heading.
- Preview title and metadata stack in the same reading order at every breakpoint. Metadata and the project-entry command use the mono subtitle role; summary text uses the serif body role. Both retain the shared font-size-plus-2px leading.
- Generic, derived, and case-study detail templates consume the same title, subtitle, section-heading, and body size roles. Long titles wrap within their grid track instead of being clipped or expanding it.
- Container-query selectors must match the specificity of the rules they override. A declared single-column query that loses to a base two-column selector is a regression.
- Reduced-motion and touch layouts retain the same rules, hierarchy, and card order; only their interaction/motion behavior changes.

Run `npm run audit:responsive -- http://127.0.0.1:5173` with a local preview running. The audit uses Playwright and pngjs (local packages or the bundled Codex runtime), covers breakpoint edges and both orientations, samples painted full-bleed rules, checks typography/content bounds, and regresses category snow, hover, scroll, and reduced-motion touch behavior. Screenshots and JSON results are written to the system temporary directory under `red-responsive-audit` (override with `AUDIT_OUTPUT_DIR`).

## 11. Event-flow performance contract

- Scroll advances the boundary field but never rescans the catalog for ownership. Catalog mutations, explicit motion handoffs, and settled resize events own synchronization.
- Scroll-settle work uses one live deadline timer. Additional scroll events extend the deadline without replacing the timer on every event.
- Catalog-only scroll work exits before allocating timers on project-detail routes or the unfiltered homepage.
- Detached-target cleanup runs only after DOM removal or footer insertion. Runtime canvas and typewriter leaf mutations must not schedule a global observer sweep.
- Intersection observers remain responsible for bringing newly visible dither cards into the priority queue; this must not be replaced by scroll-time DOM scans.

Run `npm run audit:event-performance -- http://127.0.0.1:5173` to exercise continuous scroll at phone, tablet, and desktop widths, verify bounded scan/timer counts, check leaf-mutation cleanup behavior, and ensure detail-page scrolling does not wake catalog work.

## 12. Pointer compatibility contract

- The 14px square cursor is enabled when any attached input supports hover and fine pointing. This includes desktop mouse input, Windows hybrid devices, and an iPad with a compatible mouse or trackpad.
- Touch-only devices retain native behavior and never hide the system pointer or mount the WebGL canvas.
- Pointer capability changes are observed at runtime so attaching a mouse after page load does not require a refresh.
- The WebGL shader paints the source square; `mix-blend-mode: difference` performs compositor-level inversion over HTML, images, and canvases. If WebGL is unavailable, the white canvas background preserves the same square and difference blend.

Run `npm run audit:cursor -- http://127.0.0.1:5173` to validate square geometry, pointer alignment, inversion over black and white surfaces, and touch-only fallback in Chromium, Firefox, and WebKit.
