type SpecDefinition = {
  label: string
  key: string
  category: string
}

export const SPECS: SpecDefinition[] = [
  { label: 'Supported Package', key: 'package', category: 'Compatibility Info' },
  { label: 'ACC', key: 'longitudinal', category: 'Compatibility Info' },
  { label: 'No ACC below', key: 'min_enable_speed', category: 'Compatibility Info' },
  { label: 'No ALC below', key: 'min_steer_speed', category: 'Compatibility Info' },
  { label: 'Video', key: 'video', category: 'Compatibility Info' },
  { label: 'Setup Video', key: 'setup_video', category: 'Compatibility Info' },
]

export const SPECS_BY_CATEGORY = SPECS.reduce((acc, spec) => {
  let group = acc.find(g => g.category === spec.category)
  if (!group) {
    group = { category: spec.category, specs: [] }
    acc.push(group)
  }
  group.specs.push(spec)
  return acc
}, [] as Array<{ category: string; specs: SpecDefinition[] }>)

