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

## 4. Shared binary motion language

Binary motion uses paper and ink only. Changed cells transition; unchanged cells stay fixed.

Shared defaults live in `binary-surface-core.js`:

- binary reconcile duration: 420 ms
- softness: 0.095
- deterministic seed family: 41
- cluster size: 3 cells
- cluster mix: 0.16
- smoothstep progress curve

Resize and hover-return should read the canonical old/new bit placement and perturb only cells whose bit changed. They must never temporarily reveal a separate full-resolution raster between states.

## 5. Category transition timing

The visual dissolve must remain active through the catalog DOM handoff. The Fine Signal exit duration is aligned with the catalog structural exit budget (430 ms), with no extra start delay. Entry keeps the longer resolve/settle envelope so the new catalog can finish layout and priority rendering under the transition.

Expensive binary sampling is cached by source/grid/config so rebuilding category DOM does not require a fresh image sample and Floyd solve for every card.

## 6. Header-driven layout and breakpoints

The header is allowed to drive content bounding continuously. The layout proxy follows the visual header at fine increments instead of the previous 4 px / 2 px buckets.

This continuous layout resize must not wake the binary solver. During scroll, the existing logical surface simply scales with the card. ResizeObserver only schedules a binary render when the logical grid itself changes.

This rule is identical on desktop, tablet, phone, portrait, and landscape breakpoints.

## 7. Performance rules

- Never include CSS width/height in a binary render or reveal signature.
- Never rerun Floyd just because a card changed CSS size with the same aspect ratio.
- Reuse cached source luminance and diffusion maps across category DOM rebuilds.
- Keep visible priority work to one expensive first-time card per frame.
- Offscreen work stays in idle slices.
- Do not create a resize-snow state when old and new bit fields are identical.
- Motion overlays use logical-resolution canvases, not DPR-sized canvases.

## 8. Debug invariants

For any filtered card in generated binary mode:

- `dither-preview-canvas.width === data-dither-columns`
- `dither-preview-canvas.height === data-dither-rows`
- `data-dither-surface-version === "1"`
- motion overlays use the same columns and rows
- scrolling without an aspect-ratio change must increase `skippedCssResize`, not `logicalResizeRenders`, in `window.__RED_DITHER_PUBLIC_RUNTIME__.perf`

If a visible pop occurs, first check whether a handoff exposed two canvases with different backing dimensions or different render signatures. Do not hide that mismatch with opacity; fix ownership or grid identity.
