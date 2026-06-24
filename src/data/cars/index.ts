import bluepilotData from './bluepilot.json'
import frogpilotData from './frogpilot.json'
import openpilotData from './openpilot.json'
import starpilotData from './starpilot.json'
import sunnypilotData from './sunnypilot.json'
import wipData from './wip.json'
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
  key?: string
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
  branch_name?: string
  branch_url?: string
  branch_desc?: string
  wiki_url?: string
  discord_url?: string
  discord_name?: string
  extra_resource_url?: string | null
  important_notes?: string[] | null
}

const catalogInputs: CatalogInput[] = [
  bluepilotData as CatalogInput,
  frogpilotData as CatalogInput,
  openpilotData as CatalogInput,
  starpilotData as CatalogInput,
  sunnypilotData as CatalogInput,
  wipData as CatalogInput,
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

const buildCarRecord = (car: CarRecord, source: string, sourceUrl: string): Car => {
  const wip_details = source === 'wip'
    ? {
        key: car.key!,
        branch_name: car.branch_name!,
        branch_url: car.branch_url!,
        branch_desc: car.branch_desc!,
        wiki_url: car.wiki_url!,
        discord_url: car.discord_url!,
        discord_name: car.discord_name!,
        extra_resource_url: car.extra_resource_url ?? null,
        important_notes: car.important_notes ?? null,
      }
    : undefined

  return {
    id: `${car.name}-${source}`,
    name: car.name,
    make: car.make,
    model: car.model,
    model_variant: car.model_variant ?? null,
    model_variant_list: car.model_variant_list,
    years: car.years,
    year_list: car.year_list,
    hardware_needed: car.hardware_needed,
    supported_package: car.supported_package,
    supported_package_list: car.supported_package_list,
    acc: car.acc,
    no_acc_below: car.no_acc_below,
    no_alc_below: car.no_alc_below,
    auto_resume_available: car.auto_resume_available ?? false,
    video: car.video ?? null,
    setup_video: car.setup_video ?? null,
    years_not_in_upstream: car.years_not_in_upstream ?? [],
    footnotes: car.footnotes,
    source,
    source_url: sourceUrl,
    ...(wip_details ? { wip_details } : {}),
  }
}

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
