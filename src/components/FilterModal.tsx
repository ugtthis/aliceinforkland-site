import {
  type Component,
  Show,
  createSignal,
  onMount,
  onCleanup,
} from 'solid-js'
import { isServer } from 'solid-js/web'
import CustomDropdown from '~/components/ui/CustomDropdown'
import ResponsiveModal from '~/components/ui/ResponsiveModal'
import { useFilter, type SortField } from '~/contexts/FilterContext'
import type { Car } from '~/types/CarDataTypes'
import { carData } from '~/data/cars'

import { cn, sortAlphabetically } from '~/lib/utils'
import sortOrderIcon from '~/lib/icons/sort-order-icon.svg?url'
import rotateLeftIcon from '~/lib/icons/rotate-left.svg?url'
import downChevronIcon from '~/lib/icons/down-chevron.svg?url'
import rightArrowIcon from '~/lib/icons/right-arrow.svg?url'

type FilterModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PINNED_SOURCE = 'WIP'

const FilterModal: Component<FilterModalProps> = (props) => {
  const {
    filters,
    setFilters,
    clearAllFilters,
    sortConfig,
    setSortConfig,
    resultCount,
    hasActiveFilters,
  } = useFilter()

  // Get unique values for dropdowns
  const typedCarData = carData as Car[]
  const sources = [
    PINNED_SOURCE,
    ...[...new Set(typedCarData.map((car) => car.source))]
      .filter((source) => source !== PINNED_SOURCE)
      .sort(sortAlphabetically),
  ]
  const makes = [...new Set(typedCarData.map((car) => car.make))].sort(sortAlphabetically)
  const years: string[] = [
    ...new Set(typedCarData.flatMap((car) => car.year_list.map(String))),
  ].sort()

  const [openSort, setOpenSort] = createSignal(false)

  let sortRef: HTMLDivElement | undefined

  const handleSortClickOutside = (e: MouseEvent) => {
    if (openSort() && sortRef && !sortRef.contains(e.target as Node)) {
      setOpenSort(false)
    }
  }

  onMount(() => {
    if (!isServer) {
      document.addEventListener('mousedown', handleSortClickOutside)
    }
  })

  onCleanup(() => {
    if (!isServer) {
      document.removeEventListener('mousedown', handleSortClickOutside)
    }
  })

  const getResultsColor = (count: number) => {
    if (count === 0) return '#FF5733' // Red
    if (count <= 5) return '#E6A500' // Yellow
    return '#00CC33' // Green
  }

  const sortOptions: { label: string; value: SortField }[] = [
    { label: 'Make', value: 'make' },
    { label: 'Year', value: 'years' },
    { label: 'Source', value: 'source' },
  ]
  const updateSourceFilter = (value: string) => {
    if (value) {
      window.plausible?.('Source Filter Selected', {
        props: {
          source: value,
        },
      })
    }

    setFilters((prev) => ({ ...prev, source: value }))
  }

  const ModalContent = () => (
    <>
      {/* Scrollable content area */}
      <div class="flex-1 overflow-y-auto px-6 pt-4 pb-11 text-white">
        {/* Sort Section */}
        <div class="mb-6">
          <h2 class="mb-4 text-lg font-semibold">SORT BY:</h2>
          <div class="flex gap-2">
            <div class="relative w-2/3" ref={sortRef}>
              <button
                type="button"
                onClick={() => setOpenSort(!openSort())}
                class={cn(
                  'flex h-[56px] w-full items-center justify-between border border-[#4a3439] bg-[#0f0b0c]',
                  'p-4 text-left text-white transition-colors cursor-pointer hover:bg-[#24191c]',
                )}
              >
                <span>
                  {sortOptions.find((opt) => opt.value === sortConfig().field)
                    ?.label || 'Make'}
                </span>
                <img
                  src={downChevronIcon}
                  alt=""
                  width="24"
                  height="24"
                  class={cn('opacity-60 invert transition-transform', openSort() && 'rotate-180')}
                />
              </button>

              <Show when={openSort()}>
                <div class="w-full border border-t-0 border-[#4a3439] bg-[#0f0b0c] text-white">
                  <div class="max-h-[200px] overflow-y-auto">
                    {sortOptions.map((option) => (
                      <button
                        class={cn(
                          'h-[40px] w-full px-4 text-left cursor-pointer hover:bg-[#24191c]',
                          sortConfig().field === option.value && 'bg-[#2b2023]',
                        )}
                        onClick={() => {
                          setSortConfig((prev) => ({
                            ...prev,
                            field: option.value,
                          }))
                          setOpenSort(false)
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Show>
            </div>
            <button
              onClick={() =>
                setSortConfig((prev) => ({
                  ...prev,
                  order: prev.order === 'ASC' ? 'DESC' : 'ASC',
                }))
              }
              class={cn(
                'flex h-[56px] w-1/3 items-center justify-center self-start border border-[#4a3439] bg-[#0f0b0c]',
                'p-4 transition-colors cursor-pointer hover:bg-[#24191c]',
              )}
              aria-label={`Toggle sort order: currently ${sortConfig().order === 'ASC' ? 'Ascending' : 'Descending'}`}
            >
              <img
                src={sortOrderIcon}
                alt=""
                width="32"
                height="28"
                class={cn('invert', sortConfig().order === 'DESC' && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div class="my-4 h-[1px] w-full bg-white/10" />

        {/* Filter Section */}
        <div>
          <h2 class="mb-4 text-lg font-semibold">FILTER BY:</h2>
          <div class="space-y-4">
            <CustomDropdown
              label="Source"
              options={sources}
              value={filters().source}
              onChange={updateSourceFilter}
            />

            <CustomDropdown
              label="Not in Upstream"
              options={['Yes', 'No']}
              value={filters().notInUpstream}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, notInUpstream: value }))
              }
            />

            <CustomDropdown
              label="Has User Video"
              options={['Yes', 'No']}
              value={filters().hasUserVideo}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, hasUserVideo: value }))
              }
            />

            <CustomDropdown
              label="Has User Install Video"
              options={['Yes', 'No']}
              value={filters().hasSetupVideo}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, hasSetupVideo: value }))
              }
            />

            <CustomDropdown
              label="Make"
              options={makes}
              value={filters().make}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, make: value }))
              }
            />

            <CustomDropdown
              label="Year"
              options={years}
              value={filters().year}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, year: value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer section */}
      <div class="flex-shrink-0 p-6 border-t border-white/10 bg-surface text-white shadow-[0_-6px_16px_rgba(0,0,0,0.2)]">
        <div
          class="p-3 mb-4 font-semibold text-center bg-[#2d2227]"
          style={{ color: getResultsColor(resultCount() || 0) }}
        >
          {resultCount() || 0} RESULT{(resultCount() || 0) !== 1 ? 'S' : ''}
        </div>
        <div class="flex gap-2">
          <button
            onClick={() => hasActiveFilters() && clearAllFilters()}
            disabled={!hasActiveFilters()}
            class={cn(
              'flex flex-1 items-center justify-center gap-2 border border-[#4a3439] bg-[#0f0b0c]',
              'p-3 font-medium transition-colors cursor-pointer hover:bg-[#24191c]',
              !hasActiveFilters() && 'cursor-not-allowed opacity-50 hover:bg-[#0f0b0c]',
            )}
          >
            <img
              src={rotateLeftIcon}
              alt=""
              width="24"
              height="24"
              class="opacity-90 invert"
              aria-hidden="true"
            />
            <span>RESET</span>
          </button>
          <button
            onClick={() => props.onOpenChange(false)}
            class="relative flex flex-1 items-center justify-center gap-2 border-4 border-black p-3 font-medium transition-colors cursor-pointer"
            style={{
              color: '#ffffff',
              'background-color': `color-mix(in srgb, ${getResultsColor(resultCount() || 0)} 35%, #12090b 65%)`
            }}
          >
            <span class="font-bold">VIEW</span>
            <img
              src={rightArrowIcon}
              width="24"
              height="24"
              class="invert"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </>
  )
  return (
    <ResponsiveModal
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Filter & Sort"
      description="Configure filters and sorting options"
    >
      <ModalContent />
    </ResponsiveModal>
  )
}

export default FilterModal
