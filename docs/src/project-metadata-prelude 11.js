(() => {
  const PROJECT_OVERRIDES = {
    "/narrative-design-document": {
      pageTitle: "Untitled Sans",
      displayTitle: "Type 2 Specimen Booklet",
      navHash: "graphic",
    },
  }

  const NativeMap = window.Map

  class ProjectMetadataMap extends NativeMap {
    constructor(iterable) {
      if (iterable == null) {
        super()
        return
      }

      const entries = Array.from(iterable)
      let matched = false

      for (const entry of entries) {
        if (!Array.isArray(entry) || entry.length < 2) continue
        const override = PROJECT_OVERRIDES[entry[0]]
        const project = entry[1]
        if (!override || !project || typeof project !== "object") continue

        Object.assign(project, override)
        matched = true
      }

      super(entries)

      if (matched && window.Map === ProjectMetadataMap) {
        window.Map = NativeMap
      }
    }
  }

  window.Map = ProjectMetadataMap
})()
