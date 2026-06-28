import { useSearchParams, useNavigate } from '@solidjs/router'
import { createMemo, For, Show, createSignal, onMount, onCleanup, createEffect } from 'solid-js'
import type { Car } from '~/types/CarDataTypes'
import { cn, hasObjectEntries, slugify } from '~/lib/utils'
import { carData } from '~/data/cars'
import { useModelComparison } from '~/contexts/ModelComparisonContext'
import { openDataSourceModal } from '~/contexts/DataSourceModalContext'
import { SPECS_BY_CATEGORY } from '~/data/specs'
import UpArrowSvg from '~/lib/icons/up-arrow.svg?raw'
import RightArrowSvg from '~/lib/icons/right-arrow.svg?raw'
import RotateLeftSvg from '~/lib/icons/rotate-left.svg?raw'
import ZoomOutSvg from '~/lib/icons/zoom-out.svg?raw'
import VideoCameraSvg from '~/lib/icons/video-camera.svg?raw'
import PlayVideoSvg from '~/lib/icons/play-video.svg?raw'

const MIN_CARS_FOR_COMPARISON = 2

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setIsCompareMode } = useModelComparison()

  const navigateToCompareMode = () => {
    setIsCompareMode(true)
    navigate('/')
  }

  type CellPosition = {
    columnIndex: number
    specKey: string
  }

  const [highlight, setHighlight] = createSignal<{
    hovered: CellPosition | null
    selected: CellPosition | null
  }>({ hovered: null, selected: null })

  const [showStickyHeader, setShowStickyHeader] = createSignal(false)
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = createSignal(false)
  const [isZoomedOut, setIsZoomedOut] = createSignal(false)
  let selectedCarCardsRef: HTMLDivElement | undefined
  let tableContainerRef: HTMLDivElement | undefined
  let tableContentRef: HTMLDivElement | undefined

  const HIGHLIGHT_STYLES = {
    card: {
      selected: 'ring-4 ring-[#c76a78] shadow-lg shadow-[#c76a78]/45',
      hovered: 'ring-4 ring-[#a3a3a3] shadow-[0_0_22px_rgba(163,163,163,0.42)]',
      default: 'shadow-elev-1',
    },
    cell: {
      selected: 'bg-[#c76a78]/20 text-[#f7e7eb] font-semibold outline outline-[3px] outline-[#c76a78] shadow-xl',
      columnSelected: 'bg-[#6f5a63]/28 text-[#eee4e7]',
      columnHovered: 'bg-[#9a9a9a]/26',
    },
    row: {
      selected: 'bg-[#c76a78]/14',
      hovered: 'bg-[#4a4a4a]/30',
      stripeEven: 'bg-[#1b1517]',
      stripeOdd: 'bg-[#120e10]',
    },
    label: {
      selected: 'text-[#f1c7cf]',
    },
  } as const

  const selectedCars = createMemo(() => {
    const carsParam = searchParams.cars
    if (!carsParam) return []

    const carsString = Array.isArray(carsParam) ? carsParam[0] : carsParam
    const carSlugs = carsString.split(',').slice(0, 6)
    const typedCarData = carData as Car[]

    return carSlugs
      .map(slug => typedCarData.find(car => slugify(car.id) === slug))
      .filter(Boolean) as Car[]
  })

  const removeCar = (carId: string) => {
    const remaining = selectedCars().filter(car => car.id !== carId)

    if (remaining.length < MIN_CARS_FOR_COMPARISON) {
      navigateToCompareMode()
    } else {
      const newParams = remaining.map(car => slugify(car.id)).join(',')
      setSearchParams({ cars: newParams })
    }

    setHighlight({ hovered: null, selected: null })
  }

  const handleCellClick = (columnIndex: number, specKey: string) => {
    const isAlreadySelected = isCellSelected(columnIndex, specKey)

    if (isAlreadySelected) {
      setHighlight(prev => ({ ...prev, selected: null }))
    } else {
      setHighlight(prev => ({ ...prev, selected: { columnIndex, specKey } }))
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const DESKTOP_BREAKPOINT = 768
  const SCROLL_THRESHOLD = 5

  const detectHorizontalScroll = () => {
    if (!tableContainerRef) return

    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT
    if (!isDesktop) {
      setHasHorizontalOverflow(false)
      return
    }

    const hasOverflow = tableContainerRef.scrollWidth > tableContainerRef.clientWidth + SCROLL_THRESHOLD
    setHasHorizontalOverflow(hasOverflow)
  }

  const TABLE_UI_SCALE_CONFIG = {
    DESKTOP_PADDING: 48,    // Decreasing this leads to cutting off the right side of table UI
    SCALE_BUFFER: 0.99,
    SAFETY_MARGIN: 8,       // Extra pixels for scrollbars, borders, etc
  } as const

  const calcScaleToFit = (contentWidth: number, availableWidth: number): number => {
    const usableWidth = availableWidth - TABLE_UI_SCALE_CONFIG.DESKTOP_PADDING - TABLE_UI_SCALE_CONFIG.SAFETY_MARGIN

    const rawScale = usableWidth / contentWidth
    const scaleWithBuffer = rawScale * TABLE_UI_SCALE_CONFIG.SCALE_BUFFER

    return Math.min(scaleWithBuffer, 1)
  }

  const applyTableUIScale = (scale: number) => {
    if (!tableContentRef || !tableContainerRef) return

    const originalHeight = tableContentRef.getBoundingClientRect().height

    tableContentRef.style.transform = `scale(${scale})`
    tableContentRef.style.transformOrigin = 'top left'

    // Adjust container height to match scaled content - prevents empty space below
    const scaledHeight = originalHeight * scale
    tableContainerRef.style.height = `${scaledHeight}px`

    // Scaled content creates overflow
    tableContainerRef.style.overflow = 'hidden'
  }

  const resetTableUIScale = () => {
    if (!tableContentRef || !tableContainerRef) return

    tableContentRef.style.transform = 'none'
    tableContentRef.style.transformOrigin = ''
    tableContainerRef.style.height = ''
    tableContainerRef.style.overflow = ''
  }

  const toggleTableUIScale = () => {
    if (isZoomedOut()) {
      resetTableUIScale()
      setIsZoomedOut(false)
      return
    }

    if (!tableContainerRef || !tableContentRef) return

    const tableWidth = tableContainerRef.scrollWidth
    const viewportWidth = window.innerWidth
    const scaleLevel = calcScaleToFit(tableWidth, viewportWidth)

    applyTableUIScale(scaleLevel)
    setIsZoomedOut(true)
  }

  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const shouldPreserveSelection = target.closest('[data-column-value], [data-spec-label], [data-preserve-selection]')

      if (!shouldPreserveSelection && highlight().selected !== null) {
        setHighlight(prev => ({ ...prev, selected: null }))
      }
    }

    const handleWindowResize = () => {
      detectHorizontalScroll()
      if (isZoomedOut()) {
        resetTableUIScale()
        setIsZoomedOut(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', handleWindowResize)

    let resizeObserver: ResizeObserver | undefined
    if (tableContainerRef) {
      // Defer to next frame so state updates don't re-trigger this observer
      // within the same resize cycle (avoids "ResizeObserver loop" warning).
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => detectHorizontalScroll())
      })
      resizeObserver.observe(tableContainerRef)

      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        setTimeout(() => tableContainerRef?.scrollTo({ left: 280, behavior: 'smooth' }), 300)
      }
    }

    onCleanup(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('resize', handleWindowResize)
      resizeObserver?.disconnect()
      resetTableUIScale()
    })
  })

  createEffect(() => {
    const isSelected = highlight().selected !== null

    const checkStickyHeader = () => {
      if (selectedCarCardsRef) {
        const rect = selectedCarCardsRef.getBoundingClientRect()
        setShowStickyHeader(rect.bottom < 80 && isSelected)
      }
    }

    const handleScroll = () => checkStickyHeader()

    window.addEventListener('scroll', handleScroll)
    checkStickyHeader()

    onCleanup(() => window.removeEventListener('scroll', handleScroll))
  })

  const updateCellHover = (columnIndex: number, specKey: string) => {
    setHighlight(prev => ({ ...prev, hovered: { columnIndex, specKey } }))
  }

  const clearCellHover = () => {
    setHighlight(prev => ({ ...prev, hovered: null }))
  }

  const isColumnSelected = (col: number) => highlight().selected?.columnIndex === col
  const isColumnHovered = (col: number) => highlight().hovered?.columnIndex === col
  const isRowSelected = (key: string) => highlight().selected?.specKey === key
  const isRowHovered = (key: string) => highlight().hovered?.specKey === key
  const isCellSelected = (col: number, key: string) =>
    highlight().selected?.columnIndex === col && highlight().selected?.specKey === key

  const getCardHighlightClass = (columnIndex: number) => {
    if (isColumnSelected(columnIndex)) return HIGHLIGHT_STYLES.card.selected
    if (isColumnHovered(columnIndex)) return HIGHLIGHT_STYLES.card.hovered
    return HIGHLIGHT_STYLES.card.default
  }

  const getRowBackgroundClass = (specKey: string, rowIndex: number) => {
    if (isRowSelected(specKey)) return HIGHLIGHT_STYLES.row.selected
    if (isRowHovered(specKey)) return HIGHLIGHT_STYLES.row.hovered
    return rowIndex % 2 === 0 ? HIGHLIGHT_STYLES.row.stripeEven : HIGHLIGHT_STYLES.row.stripeOdd
  }

  const getLabelHighlightClass = (specKey: string) => {
    if (isRowSelected(specKey)) return HIGHLIGHT_STYLES.label.selected
    return ''
  }

  const getCellHighlightClass = (columnIndex: number, specKey: string) => {
    if (isCellSelected(columnIndex, specKey)) return HIGHLIGHT_STYLES.cell.selected
    if (isColumnSelected(columnIndex)) return HIGHLIGHT_STYLES.cell.columnSelected

    const cellHovered = highlight().hovered
    const rowHoveredOrCellHovered = (cellHovered?.specKey === specKey)

    if (!rowHoveredOrCellHovered && isColumnHovered(columnIndex)) {
      return HIGHLIGHT_STYLES.cell.columnHovered
    }

    return ''
  }

  const renderSpecValueContent = (displayValue: string, specKey: string) => {
    const isVideoSpec = specKey === 'video' || specKey === 'setup_video'
    const isUrl = /^https?:\/\//i.test(displayValue)

    if (isVideoSpec && isUrl) {
      return (
        <a
          href={displayValue}
          target="_blank"
          rel="noopener noreferrer"
          title="Open video"
          aria-label="Open video"
          class={cn(
            'group flex items-center bg-[#5c4a50] p-2 text-[#f1e7e9] transition-all duration-300',
            'cursor-pointer hover:bg-red-600 hover:shadow-xl',
          )}
        >
          <div class="block h-5 w-5 transition-opacity duration-200 group-hover:hidden" innerHTML={VideoCameraSvg} />
          <div class="hidden h-5 w-5 transition-opacity duration-200 group-hover:block" innerHTML={PlayVideoSvg} />
        </a>
      )
    }

    return <span class="leading-snug">{displayValue}</span>
  }

  return (
    <div class="min-h-screen text-[#e7dadd]">
      {/* Header */}
      <header class="py-4 border-b-[3px] border-black gradient-dark-red shadow-[0_6px_20px_rgba(0,0,0,0.6)] md:py-6">
        <div class="px-4 mx-auto md:px-6 max-w-[2200px]">
          <nav class="flex items-center text-sm font-medium text-white">
            <button
              onClick={navigateToCompareMode}
              class="flex items-center gap-1.5 transition-colors cursor-pointer hover:text-gray-200"
            >
              <div class="flex-shrink-0 w-3 h-3 rotate-180" innerHTML={RightArrowSvg} />
              <span>Car List</span>
            </button>
          </nav>
        </div>
      </header>

      <Show when={selectedCars().length < MIN_CARS_FOR_COMPARISON} fallback={
        <main class="p-4 mx-auto md:p-6 max-w-[2200px]">
          {/* Sticky Selected Car Header */}
          <Show when={showStickyHeader() && highlight().selected !== null}>
            <div
              data-preserve-selection
              onClick={scrollToTop}
              class={cn(
                'fixed top-0 right-0 left-0 z-40 py-3 md:py-4',
                'gradient-dark-red shadow-[0_6px_20px_rgba(0,0,0,0.6)] cursor-pointer',
              )}
            >
              <div class="flex justify-between items-center px-4 mx-auto md:px-6 max-w-[2200px]">
                <div class="flex gap-3 items-center">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      openDataSourceModal(selectedCars()[highlight().selected!.columnIndex].source)
                    }}
                    class={cn(
                      'py-1.5 px-3 border-4 border-white/80 bg-[#2d2227] text-[#efe3e6]',
                      'transition-colors cursor-pointer hover:bg-[#3a2a30]',
                    )}
                  >
                    <span class="text-xs font-bold uppercase md:text-sm">
                      {selectedCars()[highlight().selected!.columnIndex].source}
                    </span>
                  </button>
                  <div class="text-white">
                    <span class="text-sm font-semibold md:text-lg">
                      {selectedCars()[highlight().selected!.columnIndex].name}
                    </span>
                  </div>
                </div>
                <div class="w-5 h-5 text-white bouncy-arrow" innerHTML={UpArrowSvg} />
              </div>
            </div>
          </Show>

          {/* Compare Specs Header with Zoom Button */}
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold md:text-2xl">Compare Specs</h2>
            <Show when={hasHorizontalOverflow() || isZoomedOut()}>
              <button
                onClick={toggleTableUIScale}
                class={cn(
                  'flex items-center gap-2.5 py-2 px-4 w-fit text-sm font-medium border-2 border-black',
                  'cursor-pointer shadow-md/30 inset-shadow-[0_1px_2px_rgba(0,0,0,0.5)] hover:opacity-80',
                  isZoomedOut()
                    ? 'border-3 border-[#4a3439] bg-gradient-to-b from-[#24191c] to-[#0f0b0c] text-white'
                    : 'border-3 border-[#5c4247] bg-gradient-to-b from-[#5a1418] to-[#2d0c10] text-[#f3e8ea]',
                )}
                title={isZoomedOut() ? 'Reset zoom' : 'Zoom out to view full table'}
              >
                <div class="flex-shrink-0 w-5 h-5" innerHTML={isZoomedOut() ? RotateLeftSvg : ZoomOutSvg} />
                <span>{isZoomedOut() ? 'Reset Zoom' : 'Fit to Screen'}</span>
              </button>
            </Show>
          </div>

          {/* Combined scrollable container for cards and table */}
          <div ref={tableContainerRef} class="overflow-x-auto">
            <div ref={tableContentRef} class="min-w-full">
              {/* Car Cards - Aligned with columns */}
              <div
                ref={selectedCarCardsRef}
                class="grid items-stretch pt-9 pb-2 mb-2 w-full min-w-fit md:pt-16"
                style={{
                  "grid-template-columns": `280px repeat(${selectedCars().length}, minmax(220px, 1fr))`,
                  "gap": "0 0"
                }}
              >
                {/* Empty spacer for label column */}
                <div />

                {/* Car cards aligned with value columns */}
                <For each={selectedCars()}>
                  {(car, columnIndex) => (
                    <div class="flex relative flex-col px-4 w-full h-full">
                        {/* Data Source Badge */}
                        <button
                          type="button"
                          onClick={() => openDataSourceModal(car.source)}
                          class={cn(
                            'relative z-10 block w-fit border-2 border-[#3d2b2f] border-b-0 py-0.5 px-2',
                            'bg-[#2d2227] text-center text-[#efe3e6]',
                            'transition-colors cursor-pointer hover:bg-[#3a2a30]',
                          )}
                        >
                          <p class="text-xs font-bold uppercase">{car.source}</p>
                        </button>

                        {/* Card */}
                        <div
                          class={cn(
                            'relative flex w-full flex-1 flex-col border-2 border-[#3d2b2f] bg-surface transition-all duration-200',
                            getCardHighlightClass(columnIndex()),
                          )}
                        >
                          {/* Car Info */}
                          <div class="flex flex-col flex-grow p-2 border-b border-black">
                            <h3 class="text-sm font-bold leading-tight">{car.make}</h3>
                            <p class="text-xs font-semibold leading-tight text-white/75">{car.model}</p>
                            <p class="mt-0.5 text-xs text-white/55">{car.years}</p>
                          </div>

                          {/* Action Buttons */}
                          <div class="flex">
                            <button
                              onClick={() => removeCar(car.id)}
                              class={cn(
                                'flex flex-1 items-center justify-center py-1.5 bg-[#A07878] text-sm font-medium text-white',
                                'transition-colors cursor-pointer hover:bg-[#8B6B6B]',
                              )}
                              title="Remove from comparison"
                            >
                              <span class="text-base">×</span>
                            </button>
                          </div>
                        </div>
                    </div>
                  )}
                </For>
              </div>

              {/* Comparison Table */}
              <div
                class="min-w-fit w-full bg-surface border-2 border-[#3d2b2f] shadow-elev-1"
                onMouseLeave={clearCellHover}
              >
              {/* Render specs grouped by category */}
              <For each={SPECS_BY_CATEGORY}>
                {(group) => (
                  <>
                    {/* Category Header */}
                    <div
                      class="grid w-full border-b-2 bg-stone-950 min-w-fit"
                      style={{
                        "grid-template-columns": `280px repeat(${selectedCars().length}, minmax(220px, 1fr))`,
                        "gap": "0 0"
                      }}
                    >
                      <div class="py-2 pr-3 pl-4">
                        <h2 class="text-sm font-bold text-white uppercase md:text-base">
                          {group.category}
                        </h2>
                      </div>
                      <For each={selectedCars()}>
                        {() => <div />}
                      </For>
                    </div>

                    {/* Spec Rows for this category */}
                    <For each={group.specs}>
                      {(spec, index) => (
                        <div
                          class={`grid min-h-[60px] w-full min-w-fit ${getRowBackgroundClass(spec.key, index())}`}
                          style={{
                            "grid-template-columns": `280px repeat(${selectedCars().length}, minmax(220px, 1fr))`,
                            "gap": "0 0"
                          }}
                        >
                          {/* Spec Label */}
                          <div
                            data-spec-label
                            class={cn(
                              'flex items-center py-3 pl-4 pr-3 font-medium border-r border-white/10 text-white/85',
                              getLabelHighlightClass(spec.key),
                            )}
                          >
                            <span class="break-words">{spec.label}</span>
                          </div>

                          {/* Spec Values */}
                          <For each={selectedCars()}>
                            {(car, columnIndex) => {
                              const value = car[spec.key]
                              const isObject = hasObjectEntries(value)

                              const getDisplayValue = () => {
                                if (value != null && typeof value === 'object') return 'N/A'
                                return value?.toString() ?? 'N/A'
                              }

                              return (
                                <div
                                  data-column-value
                                  class={cn(
                                    'flex py-3 px-4 text-sm cursor-pointer',
                                    isObject ? 'items-start' : 'items-center',
                                    getCellHighlightClass(columnIndex(), spec.key),
                                  )}
                                  onMouseEnter={() => updateCellHover(columnIndex(), spec.key)}
                                  onClick={() => handleCellClick(columnIndex(), spec.key)}
                                  style={{ "word-break": "normal", "overflow-wrap": "break-word" }}
                                >
                                  <Show
                                    when={isObject}
                                    fallback={(() => {
                                      const displayValue = getDisplayValue()
                                      return renderSpecValueContent(displayValue, spec.key)
                                    })()}
                                  >
                                    <div class="text-sm leading-relaxed">
                                      <For each={Object.entries(value as Record<string, unknown>)}>
                                        {([key, val]) => (
                                          <div>
                                            <span class="font-bold">{key}:</span> {String(val)}
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                  </Show>
                                </div>
                              )
                            }}
                          </For>
                        </div>
                      )}
                    </For>
                  </>
                )}
              </For>
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div class="mt-4 text-center">
            <p class="text-sm text-white/55">
              Hover or click any spec to highlight its row and column
            </p>
          </div>
        </main>
      }>
        <div class="flex justify-center items-center p-8 min-h-[400px]">
          <div class="text-center">
            <h2 class="mb-4 text-xl font-bold">
              {selectedCars().length === 0 ? 'No cars selected' : `Need at least ${MIN_CARS_FOR_COMPARISON} cars to compare`}
            </h2>
            <p class="mb-6 text-white/65">
              {selectedCars().length === 0
                ? 'Select cars from the list to compare them'
                : 'Add more cars to start comparing'}
            </p>
            <button
              onClick={navigateToCompareMode}
              class={cn(
                'inline-block border-2 border-black bg-accent py-2 px-6 text-white',
                'transition-colors cursor-pointer hover:bg-[#727272]',
              )}
            >
              Go Back to Car List
            </button>
          </div>
        </div>
      </Show>
    </div>
  )
}
