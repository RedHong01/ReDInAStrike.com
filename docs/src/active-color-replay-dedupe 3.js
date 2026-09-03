let lastConfigEventAt = -Infinity

window.addEventListener("red:active-color-config", () => {
  lastConfigEventAt = performance.now()
})

function installReplayGuard() {
  const api = window.__RED_ACTIVE_COLOR_SNOW__
  if (!api || api.__replayGuardInstalled || typeof api.replay !== "function") return false

  const replay = api.replay.bind(api)
  api.replay = (...args) => {
    // active-color-snow already replays synchronously for red:active-color-config.
    // Ignore the Hub's second replay call in the same frame, while preserving the
    // explicit Replay button and later programmatic calls.
    if (performance.now() - lastConfigEventAt < 34) return false
    return replay(...args)
  }
  Object.defineProperty(api, "__replayGuardInstalled", {
    value: true,
    configurable: true,
  })
  return true
}

if (!installReplayGuard()) {
  queueMicrotask(installReplayGuard)
  requestAnimationFrame(installReplayGuard)
}
