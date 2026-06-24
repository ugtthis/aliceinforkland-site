export type WipDetails = {
  key: string
  branch_name: string
  branch_url: string
  branch_desc: string
  wiki_url: string
  discord_url: string
  discord_name: string
  extra_resource_url: string | null
  important_notes: string[] | null
}

export type Car = {
  id: string
  name: string
  source: string
  source_url: string
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
  auto_resume_available: boolean
  video: string | null
  setup_video: string | null
  years_not_in_upstream: number[]
  footnotes?: Record<string, Array<string | number>>
  wip_details?: WipDetails
}
