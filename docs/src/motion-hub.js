let corePromise = null

export function activateMotionHub() {
  if (!corePromise) corePromise = import("./motion-hub-core.js?v=20260905-perf1")
  return corePromise.then((module) => module.activateMotionHub())
}
