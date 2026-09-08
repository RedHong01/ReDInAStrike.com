/*
 * Compatibility module for pages cached before the seam controller moved into
 * main.js.  The old implementation installed a document-wide MutationObserver
 * plus scroll/resize observers and wrote the same progress variable as the
 * live controller, which created a read/write feedback loop.  Keeping this
 * module importable makes stale HTML harmless while guaranteeing one owner for
 * the drawer seam and sticky header state.
 */
export {}
