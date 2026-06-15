import bluepilotData from './bluepilot.json'
import frogpilotData from './frogpilot.json'
import openpilotData from './openpilot.json'
import sunnypilotData from './sunnypilot.json'
import type { Car } from '~/types/CarDataTypes'

type CatalogInput = {
  _metadata?: {
    source?: string
    url: string
  }
  footnote_definitions?: Record<string, string>
  cars?: CarRecord[]
}

type CarRecord = {
  name: string
  make: string
  model: string
  model_variant?: string | null
  model_variant_list: string[]
  years: string
  year_list: number[]
  hardware_needed: string
  supported_package: string
  supported_package_list: string[]
  acc: string
  no_acc_below: string
  no_alc_below: string
  auto_resume_available?: boolean
  video?: string | null
  setup_video?: string | null
  years_not_in_upstream?: number[]
  footnotes?: Record<string, Array<string | number>>
}

const catalogInputs: CatalogInput[] = [
  bluepilotData as CatalogInput,
  frogpilotData as CatalogInput,
  openpilotData as CatalogInput,
  sunnypilotData as CatalogInput,
]

const getCatalogSource = (catalog: CatalogInput): string => {
  const source = catalog._metadata?.source?.trim()
  if (!source) {
    throw new Error('Catalog is missing required _metadata.source')
  }
  return source
}

const getCatalogUrl = (catalog: CatalogInput): string => {
  const url = catalog._metadata?.url.trim()
  if (!url) {
    throw new Error('Catalog is missing required _metadata.url')
  }
  return url
}

const buildCarRecord = (car: CarRecord, source: string, sourceUrl: string): Car => ({
  ...car,
  id: `${car.name}-${source}`,
  name: car.name,
  years: car.years,
  year_list: car.year_list,
  model_variant: car.model_variant ?? null,
  model_variant_list: car.model_variant_list,
  supported_package_list: car.supported_package_list,
  auto_resume_available: car.auto_resume_available ?? false,
  years_not_in_upstream: car.years_not_in_upstream ?? [],
  source,
  source_url: sourceUrl,
  video: car.video ?? null,
  setup_video: car.setup_video ?? null,
})

const buildCarCatalog = (catalogs: CatalogInput[]): Car[] =>
  catalogs.flatMap((catalog) => {
    const source = getCatalogSource(catalog)
    const sourceUrl = getCatalogUrl(catalog)
    return (catalog.cars ?? []).map((car) => buildCarRecord(car, source, sourceUrl))
  })

export const footnoteDefinitionsBySource: Record<string, Record<string, string>> =
  Object.fromEntries(
    catalogInputs.map((catalog) => [
      getCatalogSource(catalog),
      catalog.footnote_definitions ?? {},
    ]),
  )

export const carData: Car[] = buildCarCatalog(catalogInputs)
