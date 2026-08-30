import "./scroll-magnet.js?v=20260829-magnet1"

let corePromise = null

export function activateMotionHub() {
  if (!corePromise) corePromise = import("./motion-hub-core.js")
  return corePromise.then((module) => module.activateMotionHub())
}
