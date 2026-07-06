import { createContext, useContext, type ParentProps } from 'solid-js'
import { createSignal, type Accessor, type Setter, createMemo } from 'solid-js'
import type { Car } from '~/types/CarDataTypes'
import { normalize, sortAlphabetically } from '~/lib/utils'
import { carData } from '~/data/cars'

type SearchableCar = Car & {
  searchText: string
}

export type SortOrder = 'ASC' | 'DESC'

function buildSearchText(car: Car): string {
  return [
    car.name,
    car.make,
    car.model,
    car.source,
    car.supported_package,
    car.acc,
    car.no_acc_below,
    car.no_alc_below,
    car.years,
    ...car.year_list.map(String),
  ].join(' ')
}

function matchesQuery(car: SearchableCar, query: string): boolean {
  const words = normalize(query).trim().split(/\s+/)
  return words.every(word => car.searchText.includes(word))
}

function getRelevanceScore(car: Car, normalizedQuery: string): number {
  const make = normalize(car.make)
  const model = normalize(car.model)

  if (make.startsWith(normalizedQuery)) return 4
  if (make.includes(normalizedQuery)) return 3
  if (model.startsWith(normalizedQuery)) return 2
  if (model.includes(normalizedQuery)) return 1
  return 0
}

function compareNumbers(a: number, b: number): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function getYearRangeSortValues(car: Pick<Car, 'year_list'>): { startYear: number; endYear: number } {
  return {
    startYear: car.year_list[0] ?? 0,
    endYear: car.year_list.at(-1) ?? 0,
  }
}

export function compareCarsByYearRange(
  a: Pick<Car, 'years' | 'year_list'>,
  b: Pick<Car, 'years' | 'year_list'>,
  order: SortOrder,
): number {
  const aYearMissing = a.years.trim().toUpperCase() === 'N/A' || a.year_list.length === 0
  const bYearMissing = b.years.trim().toUpperCase() === 'N/A' || b.year_list.length === 0

  // Keep unknown year values at the end for both ASC and DESC sorts.
  if (aYearMissing !== bYearMissing) {
    return aYearMissing ? 1 : -1
  }

  const aYears = getYearRangeSortValues(a)
  const bYears = getYearRangeSortValues(b)

  return order === 'ASC'
    ? compareNumbers(aYears.startYear, bYears.startYear) ||
        compareNumbers(aYears.endYear, bYears.endYear)
    : compareNumbers(bYears.endYear, aYears.endYear) ||
        compareNumbers(bYears.startYear, aYears.startYear)
}

export type FilterState = {
  source: string
  make: string
  year: string
  hasUserVideo: string
  hasSetupVideo: string
  notInUpstream: string
}

export const filterLabels = {
  year: 'Year',
  make: 'Make',
  source: 'Source',
  hasUserVideo: 'Has Video',
  hasSetupVideo: 'Has Install Video',
  notInUpstream: 'Not in Upstream',
} as const

export type SortField = 'make' | 'source' | 'years'

export type SortConfig = {
  field: SortField
  order: SortOrder
}

type FilterContextValue = {
  filters: Accessor<FilterState>
  setFilters: Setter<FilterState>
  removeFilter: (key: keyof FilterState) => void
  clearAllFilters: () => void
  searchQuery: Accessor<string>
  setSearchQuery: Setter<string>
  sortConfig: Accessor<SortConfig>
  setSortConfig: Setter<SortConfig>
  filteredResults: Accessor<SearchableCar[]>
  resultCount: Accessor<number>
  hasActiveFilters: Accessor<boolean>
}

const FilterContext = createContext<FilterContextValue>()

export const FilterProvider = (props: ParentProps) => {
  const [filters, setFilters] = createSignal<FilterState>({
    source: '',
    make: '',
    year: '',
    hasUserVideo: '',
    hasSetupVideo: '',
    notInUpstream: '',
  })

  const [searchQuery, setSearchQuery] = createSignal('')

  const [sortConfig, setSortConfig] = createSignal<SortConfig>({
    field: 'years',
    order: 'ASC',
  })

  const searchableCars: SearchableCar[] = (carData as Car[]).map(car => ({
    ...car,
    searchText: normalize(buildSearchText(car))
  }))

  const filteredResults = createMemo(() => {
    let result = [...searchableCars]
    const currentFilters = filters()
    if (currentFilters.source) {
      result = result.filter(
        (car) => car.source === currentFilters.source,
      )
    }
    if (currentFilters.make) {
      result = result.filter((car) => car.make === currentFilters.make)
    }
    if (currentFilters.year) {
      result = result.filter((car) =>
        car.year_list.map(String).includes(currentFilters.year),
      )
    }
    if (currentFilters.hasUserVideo) {
      if (currentFilters.hasUserVideo === 'Yes') {
        result = result.filter((car) => car.video !== null && car.video !== '')
      } else if (currentFilters.hasUserVideo === 'No') {
        result = result.filter((car) => car.video === null || car.video === '')
      }
    }
    if (currentFilters.hasSetupVideo) {
      if (currentFilters.hasSetupVideo === 'Yes') {
        result = result.filter((car) => car.setup_video !== null && car.setup_video !== '')
      } else if (currentFilters.hasSetupVideo === 'No') {
        result = result.filter((car) => car.setup_video === null || car.setup_video === '')
      }
    }
    if (currentFilters.notInUpstream) {
      if (currentFilters.notInUpstream === 'Yes') {
        result = result.filter((car) => car.years_not_in_upstream.length > 0)
      } else if (currentFilters.notInUpstream === 'No') {
        result = result.filter((car) => car.years_not_in_upstream.length === 0)
      }
    }
    const query = searchQuery().trim()
    if (query) {
      result = result.filter((car) => matchesQuery(car, query))
    }

    const sort = sortConfig()
    result.sort((a, b) => {
      if (query) {
        const normalizedQuery = normalize(query)
        const scoreA = getRelevanceScore(a, normalizedQuery)
        const scoreB = getRelevanceScore(b, normalizedQuery)
        if (scoreA !== scoreB) return scoreB - scoreA
      }
      const field: SortField = sort.field
      let sortResult: number

      if (field === 'years') {
        sortResult = compareCarsByYearRange(a, b, sort.order)
      } else {
        const aVal: string | number = a[field]
        const bVal: string | number = b[field]

        sortResult = typeof aVal === 'string' && typeof bVal === 'string'
          ? sortAlphabetically(aVal, bVal)
          : aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      }

      return sort.order === 'ASC' ? sortResult : -sortResult
    })

    return result
  })

  const resultCount = createMemo(() => filteredResults().length)

  const hasActiveFilters = createMemo(() => {
    const currentFilters = filters()
    return (
      Object.values(currentFilters).some((value) => value !== '') ||
      searchQuery().trim().length > 0
    )
  })

  const removeFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: '',
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      source: '',
      make: '',
      year: '',
      hasUserVideo: '',
      hasSetupVideo: '',
      notInUpstream: '',
    })
    setSearchQuery('')
  }

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        removeFilter,
        clearAllFilters,
        searchQuery,
        setSearchQuery,
        sortConfig,
        setSortConfig,
        filteredResults,
        resultCount,
        hasActiveFilters,
      }}
    >
      {props.children}
    </FilterContext.Provider>
  )
}

export const useFilter = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider')
  }
  return context
}
