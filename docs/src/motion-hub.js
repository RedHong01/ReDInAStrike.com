import "./scroll-magnet.js?v=20260901-motionpipe2"

let corePromise = null

export function activateMotionHub() {
  if (!corePromise) corePromise = import("./motion-hub-core.js")
  return corePromise.then((module) => module.activateMotionHub())
}
