export type Car = {
  id: string
  name: string
  source: string
  make: string
  model: string
  model_variant?: string | null
  years: string
  year_list: number[]
  supported_package: string
  acc: string
  no_acc_below: string
  no_alc_below: string
  auto_resume_available: boolean
  video: string | null
  setup_video: string | null
  footnotes?: Record<string, Array<string | number>>
}
