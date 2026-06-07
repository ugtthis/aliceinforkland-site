import { For } from 'solid-js'
import FileCard from '~/components/FileCard'
import FilterChips from '~/components/FilterChips'
import Header from '~/components/Header'
import CompareFooter from '~/components/CompareFooter'
import { useFilter } from '~/contexts/FilterContext'
import { useModelComparison } from '~/contexts/ModelComparisonContext'

import metadata from '~/data/metadata.json'
import GridSvg from '~/lib/icons/grid.svg?raw'
import ListSvg from '~/lib/icons/list.svg?raw'
import { cn } from '~/lib/utils'

export default function Home() {
  const { filteredResults, resultCount, searchQuery } = useFilter()
  const { isCompareMode, setIsCompareMode } = useModelComparison()

  return (
    <>
      <Header />
      <main class="mx-auto max-w-7xl px-4 pt-4 pb-16 text-[#e7dadd]">
        <div class="flex items-center justify-between mb-1.5">
          <div class="text-md text-white/70 md:text-lg">
            {resultCount()} of {metadata.length} cars
          </div>

          <div class="flex border-5 border-[#2a1d20] bg-[#0b0708] shadow-sm">
            <button
              type="button"
              onClick={() => setIsCompareMode(false)}
              class={cn(
                'flex items-center justify-center p-2 transition-colors cursor-pointer',
                !isCompareMode()
                  ? 'bg-[#242424] text-white border-2 border-[#b84a57] shadow-md/70'
                  : 'bg-[#34282b] text-white/55 hover:bg-[#4a393d] hover:text-white/80'
              )}
              aria-label="Grid view"
            >
              <div class="h-6 w-6" innerHTML={GridSvg} />
            </button>
            <button
              type="button"
              onClick={() => setIsCompareMode(true)}
              class={cn(
                'flex items-center justify-center p-2 transition-colors cursor-pointer',
                isCompareMode()
                  ? 'bg-[#242424] text-white border-2 border-[#b84a57] shadow-md/70'
                  : 'bg-[#34282b] text-white/55 hover:bg-[#4a393d] hover:text-white/80'
              )}
              aria-label="List view"
            >
              <div class="h-6 w-6" innerHTML={ListSvg} />
            </button>
          </div>
        </div>
        <FilterChips />

        <div
          class={cn(
            'grid grid-cols-1 mt-8',
            isCompareMode()
              ? 'gap-2 compare-mode-active'
              : 'gap-6 md:grid-cols-2 lg:grid-cols-3',
          )}
        >
          <For each={filteredResults()}>
            {(vehicle) => (
              <div class="vehicle-card" data-car-id={vehicle.name}>
                <FileCard car={vehicle} searchQuery={searchQuery()} />
              </div>
            )}
          </For>
        </div>
      </main>
      {isCompareMode() && <CompareFooter />}
    </>
  )
}
