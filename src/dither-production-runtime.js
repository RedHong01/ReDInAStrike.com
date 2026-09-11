// Heavy production-only dither interaction graph.
// Loaded by dither-lab.js only after the user shows filter intent (or during
// post-load idle warmup), keeping the homepage critical path focused on layout.
import { destroyPublicDitherRuntime } from "./dither-public-scheduler.js?v=20260905-perf1"

// Preserve the established initialization order: the Fine Signal preset must
// exist before the active-color listeners are registered. Boundary breath is
// ready before hover-return can hand ownership back to it.
import "./fine-signal-preset-runtime.js?v=20260905-perf1"
import "./active-color-snow.js?v=20260905-perf1"
import "./boundary-breath-runtime-impl.js?v=20260908-perf2"
import "./hover-binary-return.js?v=20260905-perf1"
import "./active-color-replay-dedupe.js?v=20260905-perf1"
import "./active-color-transition-bridge.js?v=20260905-perf1"
import "./binary-pixel-handoff.js?v=20260905-perf1"

export { destroyPublicDitherRuntime }
