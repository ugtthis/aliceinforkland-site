import bluepilotData from './bluepilot.json'
import frogpilotData from './frogpilot.json'
import openpilotData from './openpilot.json'
import sunnypilotData from './sunnypilot.json'
import type { Car } from '~/types/CarDataTypes'

type CatalogInput = {
  _metadata?: {
    source?: string
  }
  footnote_definitions?: Record<string, string>
  cars?: CarRecord[]
}

type CarRecord = {
  name: string
  make: string
  model: string
  model_variant?: string | null
  years?: string
  year_list?: number[]
  hardware_needed: string
  supported_package: string
  acc: string
  no_acc_below: string
  no_alc_below: string
  auto_resume_available?: boolean
  video?: string | null
  setup_video?: string | null
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

const buildCarRecord = (car: CarRecord, source: string): Car => ({
  ...car,
  id: `${car.name}-${source}`,
  name: car.name,
  years: car.years ?? 'N/A',
  year_list: car.year_list ?? [],
  model_variant: car.model_variant ?? null,
  auto_resume_available: car.auto_resume_available ?? false,
  source,
  video: car.video ?? null,
  setup_video: car.setup_video ?? null,
})

const buildCarCatalog = (catalogs: CatalogInput[]): Car[] =>
  catalogs.flatMap((catalog) => {
    const source = getCatalogSource(catalog)
    return (catalog.cars ?? []).map((car) => buildCarRecord(car, source))
  })

export const footnoteDefinitionsBySource: Record<string, Record<string, string>> =
  Object.fromEntries(
    catalogInputs.map((catalog) => [
      getCatalogSource(catalog),
      catalog.footnote_definitions ?? {},
    ]),
  )

export const carData: Car[] = buildCarCatalog(catalogInputs)
