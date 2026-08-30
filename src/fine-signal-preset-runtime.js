const FINE_SIGNAL_CONFIG = Object.freeze({
  version: 1,
  activeColorEnabled: true,
  activeColorDurationMs: 660,
  activeColorExitDurationMs: 350,
  activeColorDelayMs: 10,
  activeColorStaggerMs: 26,
  activeColorSettleMs: 110,
  activeColorCurve: 1.4,
  activeColorSeed: 41,
  activeColorCellPx: 3,
  activeColorPaletteLevels: 28,
  activeColorNeighborRadius: 1,
  activeColorNeighborMix: 0.46,
  activeColorSaturation: 1.08,
  activeColorNoiseDensity: 0.55,
  activeColorFlicker: 0.62,
  activeColorPaperRatio: 0.5,
  activeColorClusterSize: 3,
  activeColorClusterMix: 0.16,
})

function applyFineSignal() {
  const config = { ...FINE_SIGNAL_CONFIG }
  window.__RED_ACTIVE_COLOR_CONFIG__ = config
  window.dispatchEvent(new CustomEvent("red:active-color-config", { detail: config }))
  window.dispatchEvent(new CustomEvent("red:active-color-preset", {
    detail: { id: "fine-signal", label: "Fine Signal", config },
  }))
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(applyFineSignal), { once: true })
} else {
  requestAnimationFrame(applyFineSignal)
}

window.__RED_FINE_SIGNAL_PRESET__ = {
  id: "fine-signal",
  config: FINE_SIGNAL_CONFIG,
  apply: applyFineSignal,
}
