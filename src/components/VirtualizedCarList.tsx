import { createWindowVirtualizer } from '@tanstack/solid-virtual'
import { For, createMemo, createSignal, onMount, type Component } from 'solid-js'

import FileCard from '~/components/FileCard'
import type { Car } from '~/types/CarDataTypes'
import createMediaQuery from '~/utils/createMediaQuery'
import { cn } from '~/lib/utils'

type VirtualizedCarListProps = {
  cars: Car[]
  searchQuery: string
  isCompareMode: boolean
}

const MD_QUERY = '(min-width: 768px)'
const LG_QUERY = '(min-width: 1024px)'

// Rough first-paint guesses only. Real row heights come from measureRow();
// the rendered DOM is the source of truth, so these don't need to match CSS.
const ESTIMATED_GRID_ROW_HEIGHT = 386
const ESTIMATED_COMPARE_ROW_HEIGHT = 58

const GRID_GAP_PX = 24
const COMPARE_GAP_PX = 8
const OVERSCAN_ROW_COUNT = 6

const chunkRows = (cars: Car[], columns: number) => {
  const rows: Car[][] = []
  for (let i = 0; i < cars.length; i += columns) {
    rows.push(cars.slice(i, i + columns))
  }
  return rows
}

const VirtualizedCarList: Component<VirtualizedCarListProps> = (props) => {
  const isMedium = createMediaQuery(MD_QUERY)
  const isLarge = createMediaQuery(LG_QUERY)
  // Window virtualizer measurements are browser-only; stay false through SSR and
  // the first hydrated render, then flip on mount so the markup can't mismatch.
  const [isMounted, setIsMounted] = createSignal(false)

  const columns = createMemo(() => {
    if (props.isCompareMode) return 1
    if (isLarge()) return 3
    if (isMedium()) return 2
    return 1
  })

  const rows = createMemo(() => chunkRows(props.cars, columns()))
  const gap = createMemo(() =>
    props.isCompareMode ? COMPARE_GAP_PX : GRID_GAP_PX,
  )

  const virtualizer = createWindowVirtualizer<HTMLDivElement>({
    get count() {
      return rows().length
    },
    estimateSize: () =>
      props.isCompareMode ? ESTIMATED_COMPARE_ROW_HEIGHT : ESTIMATED_GRID_ROW_HEIGHT,
    useAnimationFrameWithResizeObserver: true,
    overscan: OVERSCAN_ROW_COUNT,
  })

  onMount(() => {
    setIsMounted(true)
  })

  // Report each row's real rendered height to the virtualizer. Deferred a microtask
  // because Solid sets data-index (which measureElement reads to identify the row)
  // only after this ref runs.
  const measureRow = (element: HTMLDivElement) => {
    queueMicrotask(() => virtualizer.measureElement(element))
  }

  return (
    <div
      class={cn(
        'relative mt-8',
        props.isCompareMode && 'compare-mode-active',
      )}
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      {isMounted() && (
        <For each={virtualizer.getVirtualItems()}>
          {(virtualRow) => {
            const carsInRow = () => rows()[virtualRow.index]

            return (
              <div
                ref={measureRow}
                data-index={virtualRow.index}
                class="absolute top-0 left-0 grid w-full"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  // Rows are separate positioned elements, so inter-row spacing
                  // can't use grid row-gap; padding-bottom handles it and folds
                  // into the measured row height (margin wouldn't be measured).
                  'column-gap': `${gap()}px`,
                  'padding-bottom': `${gap()}px`,
                  // Derived from the same columns() that chunks the rows, so the
                  // grid can never render more/fewer tracks than there are cards.
                  'grid-template-columns': `repeat(${columns()}, minmax(0, 1fr))`,
                }}
              >
                <For each={carsInRow()}>
                  {(car) => (
                    <div class="vehicle-card">
                      <FileCard car={car} searchQuery={props.searchQuery} />
                    </div>
                  )}
                </For>
              </div>
            )
          }}
        </For>
      )}
    </div>
  )
}

export default VirtualizedCarList
