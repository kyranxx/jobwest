import europeMapPaths from "./europe-map-paths.json"

export type EuropeMapFeature = {
  code: string
  kind: "context" | "eu" | "market"
  name: string
  path: string
}

export const EUROPE_MAP_VIEW_BOX = "0 0 720 520"

export const europeMapFeatures = europeMapPaths as EuropeMapFeature[]
