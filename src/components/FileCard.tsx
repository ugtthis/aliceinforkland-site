import { type Component, createSignal, createEffect, createMemo } from 'solid-js'

import type { Car } from '~/types/CarDataTypes'

import HighlightText from '~/components/ui/HighlightText'
import { cn } from '~/lib/utils'
import { useModelComparison } from '~/contexts/ModelComparisonContext'

import DownChevronSvg from '~/lib/icons/down-chevron.svg?raw'
import VideoCameraSvg from '~/lib/icons/video-camera.svg?raw'
import PlayVideoSvg from '~/lib/icons/play-video.svg?raw'
import CheckSvg from '~/lib/icons/checkmark.svg?raw'
import Checkmark2Svg from '~/lib/icons/checkmark-2.svg?raw'
import CloseXIcon from '~/lib/icons/close-x.png'
import { getACCDescription, getAutoResumeDescription } from '~/data/descriptions'

const RED_PNG_FILTER = "brightness(0) saturate(90%) invert(23%) sepia(89%) saturate(3520%) hue-rotate(352deg) brightness(85%) contrast(95%)"

type CardProps = {
  car: Car
  searchQuery: string
}

type ExpandableRowProps = {
  label: string
  value: string
  description: string
  class?: string
  icon?: string
  iconUrl?: string
  isExpanded: boolean
  onToggle: () => void
}

const ExpandableRow = (props: ExpandableRowProps) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = createSignal(false)
  let scrollRef: HTMLDivElement | undefined

  const resetScrollOnOpen = () => {
    if (props.isExpanded && scrollRef) {
      scrollRef.scrollTop = 0
      setIsScrolledToBottom(false)
    }
  }

  createEffect(resetScrollOnOpen)

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLDivElement
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1
    setIsScrolledToBottom(isAtBottom)
  }

  return (
    <div class={cn('border border-[#6a4d54] bg-[#21191d] text-[#eee2e5]', props.class)}>
      {/* Toggle header */}
      <div
        class={cn(
          'flex items-center justify-between px-4 py-4',
          'transition-colors duration-200 cursor-pointer hover:bg-[#2d2227]',
        )}
        onClick={props.onToggle}
      >
        <div class="text-sm font-medium text-[#eadde0]">{props.label}</div>
        <div class="flex items-center gap-3">
          {props.icon ? (
            <div class="w-5 h-5" innerHTML={props.icon} />
          ) : props.iconUrl ? (
            <div class="w-5 h-5 flex items-center justify-center">
              <img src={props.iconUrl} alt="" class="w-full h-full" style={{ filter: RED_PNG_FILTER }} />
            </div>
          ) : (
            <div class="text-sm font-semibold text-[#f1e7e9]">{props.value}</div>
          )}
          <div
            class={cn('h-2 w-2 transition-transform duration-200', props.isExpanded && 'rotate-180')}
            innerHTML={DownChevronSvg}
          />
        </div>
      </div>

      {/* Expandable description */}
      <div class={cn('overflow-hidden transition-all duration-300', props.isExpanded ? 'max-h-20' : 'max-h-0')}>
        <div class="relative">
          <div
            ref={scrollRef}
            class="h-row-height overflow-y-auto bg-[#2a2024] px-4 py-3 text-sm text-[#ddcfd3]"
            onScroll={handleScroll}
          >
            {props.description}
          </div>
          {/* Scroll gradient indicator */}
          <div class={cn(
            'absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/50 to-transparent opacity-0',
            'transition-opacity duration-200 pointer-events-none',
            isScrolledToBottom() ? 'opacity-0' : 'opacity-100',
          )} />
        </div>
      </div>
    </div>
  )
}

const Card: Component<CardProps> = (props) => {
  const [expandedRow, setExpandedRow] = createSignal<string | null>(null)
  const { selectedCars, toggleCarSelection } = useModelComparison()
  const sourceLabel = (props.car.source ?? '').trim()
  const yearList = createMemo(() => props.car.year_list.map(String))
  const carTitle = () => {
    const variant = (props.car.model_variant ?? '').trim()
    return variant.length > 0
      ? `${props.car.make} ${props.car.model} ${variant}`
      : `${props.car.make} ${props.car.model}`
  }

  // Memoize the selected state to avoid unnecessary reactive dependencies
  const isSelected = createMemo(() => selectedCars().includes(props.car.id))
  const isDisabled = createMemo(() => !isSelected() && selectedCars().length >= 6)

  const getResumeIcon = () => {
    if (props.car.auto_resume_available === true) return { icon: CheckSvg }
    if (props.car.auto_resume_available === false) return { iconUrl: CloseXIcon }
    return {}
  }

  const resumeRowProps = {
    label: "Resume from stop",
    value: "NA",
    ...getResumeIcon(),
    description: getAutoResumeDescription(props.car.auto_resume_available),
    class: "border-2 border-border-soft"
  }

  const accRowProps = {
    label: "ACC",
    value: props.car.acc || "Stock",
    description: getACCDescription(props.car.acc || "Stock"),
    class: "border-2 border-border-soft"
  }

  const toggleRow = (rowId: string) => {
    setExpandedRow(expandedRow() === rowId ? null : rowId)
  }

  const supportLabelClass = cn(
    'py-1 px-6 inline-block border border-[#6a4d54] border-b-0 text-center bg-[#2d2227] text-[#efe3e6]',
  )

  return (
    <>
      {/* Compare mode card */}
      <div class="card-compare-mode">
        <div class="flex w-full border border-[#6a4d54] bg-[#21191d] text-[#eee2e5] shadow-elev-1">
          {/* Checkbox */}
          <div class="flex items-center justify-center px-2 md:px-3">
            <label class="inline-block relative cursor-pointer select-none size-7">
              <input
                type="checkbox"
                checked={isSelected()}
                onChange={() => toggleCarSelection(props.car.id)}
                disabled={isDisabled()}
                autocomplete="off" // Firefox browser fix to prevent restoring form state on refresh
                class={cn(
                  'peer relative size-7 border-3 border-[#8a7076] appearance-none bg-[#171215]',
                  'checked:border-[#102f0c] checked:bg-[#2e5232] checked:shadow-elev-1',
                  'transition-colors cursor-pointer',
                  'hover:bg-[#2e5232] disabled:cursor-not-allowed disabled:opacity-40',
                )}
                aria-label={`Select ${carTitle()}`}
              />
              <div class="absolute inset-0 opacity-0 transition-opacity duration-75 pointer-events-none peer-checked:opacity-100">
                <div class="flex size-7 items-center justify-center text-[#65e063]" innerHTML={Checkmark2Svg} />
              </div>
            </label>
          </div>

          {/* Mobile wrapper - stacks vertically below 370px, horizontal at 370px+ */}
          <div class="flex flex-1 flex-col border-l border-r border-[#6a4d54] md:hidden min-[370px]:flex-row">
            {/* Year and Model - Mobile only */}
            <div class="flex flex-1 items-center border-b border-[#6a4d54] px-2 py-2.5 min-[370px]:border-b-0 min-[370px]:border-r">
              <h1 class="text-xs font-semibold leading-tight">
                <HighlightText text={props.car.years} query={props.searchQuery} yearList={yearList()} />
                {' '}
                <HighlightText text={carTitle()} query={props.searchQuery} />
              </h1>
            </div>

            {/* Support type - Mobile only */}
            <div
              class={cn(
                'flex w-full items-center justify-center px-2 py-1.5 text-center bg-[#2d2227] text-[#efe3e6]',
                'min-[370px]:w-[100px] min-[370px]:py-2.5',
              )}
            >
              <span class="text-xs font-semibold leading-tight uppercase">
                {sourceLabel}
              </span>
            </div>
          </div>

          {/* Year - Desktop only */}
          <div class="hidden items-center w-[110px] border-l border-r border-[#6a4d54] px-3 py-2.5 md:flex">
            <h2 class="text-base font-medium leading-tight">
              <HighlightText text={props.car.years} query={props.searchQuery} yearList={yearList()} />
            </h2>
          </div>

          {/* Model name - Desktop only */}
          <div class="hidden flex-1 items-center border-r border-[#6a4d54] px-3 py-2.5 md:flex">
            <h1 class="text-lg font-semibold">
              <HighlightText text={carTitle()} query={props.searchQuery} />
            </h1>
          </div>

          {/* Support type - Desktop only */}
          <div
            class={cn(
              'hidden items-center justify-center w-[160px] border-r border-[#6a4d54] px-3 py-2.5',
              'text-center bg-[#2d2227] text-[#efe3e6] md:flex',
            )}
          >
            <span class="text-sm font-semibold leading-tight uppercase whitespace-nowrap">
              {sourceLabel}
            </span>
          </div>

        </div>
      </div>

      {/* Regular card (grid mode) */}
      <div class="card-grid-mode">
        {/* Support label */}
      <div class={supportLabelClass}>
        <p class="uppercase text-[16px]">
          {sourceLabel}
        </p>
      </div>

      {/* Card body */}
      <div
        class={cn(
          'flex flex-col min-h-[180px] border border-[#6a4d54] bg-[#21191d] text-[#eee2e5]',
          'shadow-[0_14px_28px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.04)]',
        )}
      >
        <div class="flex-grow">
          {/* Year and Model */}
          <div class="flex border-b border-[#6a4d54]">
            <div class="flex items-center px-2 py-2.5 border-r border-[#6a4d54]">
              <h2 class="text-lg">
                <HighlightText text={props.car.years} query={props.searchQuery} yearList={yearList()} />
              </h2>
            </div>
            <div class="flex flex-1 items-center justify-between min-h-[60px] px-3 py-2.5">
              <h1 class="flex-1 pr-3 text-xl font-semibold">
                <HighlightText text={carTitle()} query={props.searchQuery} />
              </h1>
              <div class={cn('ml-2 flex-shrink-0', !props.car.video && 'invisible')}>
                <a
                  href={props.car.video || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={cn(
                    'group flex items-center bg-[#5c4a50] p-2 text-[#f1e7e9] transition-all duration-300 cursor-pointer',
                    'hover:bg-red-600 hover:shadow-xl',
                  )}
                >
                <div class="block h-5 w-5 transition-opacity duration-200 group-hover:hidden" innerHTML={VideoCameraSvg} />
                <div class="hidden h-5 w-5 transition-opacity duration-200 group-hover:block" innerHTML={PlayVideoSvg} />
                </a>
              </div>
            </div>
          </div>

          <div class="min-h-[60px] border-b border-[#6a4d54] px-2 py-2.5">
            <p class="font-sans text-sm text-[#e1d4d7]">
              <strong>ADAS Package:</strong> <HighlightText text={props.car.supported_package} query={props.searchQuery} />
            </p>
          </div>
          <div class="@container flex border-b border-[#6a4d54] p-3">
            <div class="flex flex-1 items-center min-w-0">
              <p class="leading-tight text-md">
                <strong>
                  Minimum<br/>
                  <span>Engage <span class="@max-xs:block">Speed</span></span>
                </strong>
              </p>
            </div>
            <div class="flex flex-col gap-2 flex-[1.618]">
              <div class="flex flex-1 flex-col justify-center border border-[#5f454c] bg-[#181316] px-2 py-1">
                <p class="text-sm">
                  <strong>ALC:</strong> {props.car.no_alc_below}
                </p>
                <p class="text-xs text-[#c9bbbf]">Automated Lane Centering</p>
              </div>
              <div class="flex flex-1 flex-col justify-center border border-[#5f454c] bg-[#181316] px-2 py-1">
                <p class="text-sm">
                  <strong>ACC:</strong> {props.car.no_acc_below}
                </p>
                <p class="text-xs text-[#c9bbbf]">Adaptive Cruise Control</p>
              </div>
            </div>
          </div>

          <div class="h-6" />
          {/* spacer for future drivetrain label */}
        </div>

        {/* Persistent border seam */}
        <div class="h-px bg-[#6a4d54]" />

        <input type="checkbox" id={`toggle-${props.car.id}`} class="hidden peer" />

        {/* Expanded Card Body */}
        <div
          class={cn(
            'max-h-0 overflow-hidden bg-surface-secondary transition-all duration-300',
            'peer-checked:max-h-card-height',
          )}
        >
          <div class="p-4">
            <div class="flex flex-col gap-2">
              {/* Row 1 */}
              <ExpandableRow
                {...resumeRowProps}
                isExpanded={expandedRow() === "resume"}
                onToggle={() => toggleRow("resume")}
              />

              {/* Row 2 */}
              <ExpandableRow
                {...accRowProps}
                isExpanded={expandedRow() === "acc"}
                onToggle={() => toggleRow("acc")}
              />
            </div>
          </div>
        </div>

        {/* Chevron button */}
        <label
          for={`toggle-${props.car.id}`}
          class={cn(
            'flex justify-center py-1 border-t border-transparent bg-[#2b2025] text-[#ddcfd3] cursor-pointer',
            'peer-checked:border-[#6a4d54] peer-checked:bg-surface-secondary peer-checked:[&>div]:rotate-180',
            'hover:bg-[#3a2a30] hover:text-[#f1e7e9] hover:duration-300 hover:shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]',
            'max-md:bg-[#3a2a30] max-md:text-[#f1e7e9] max-md:shadow-[inset_0_0_15px_rgba(0,0,0,0.6)]',
            'peer-checked:max-md:shadow-none',
          )}
        >
          <div class="h-5 w-5" innerHTML={DownChevronSvg} />
        </label>
      </div>
      </div>
    </>
  )
}

export default Card
