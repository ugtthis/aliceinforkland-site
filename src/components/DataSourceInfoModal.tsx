import {
  type Component,
  Show,
  createSignal,
  createEffect,
  on,
  For,
  createMemo,
} from 'solid-js'
import {
  DATA_SOURCE_CONTENT,
  type DataSourceContent,
} from '~/data/dataSourceDescriptions'
import { carData } from '~/data/cars'
import type { Car } from '~/types/CarDataTypes'
import ResponsiveModal from '~/components/ui/ResponsiveModal'
import { cn, sortAlphabetically } from '~/lib/utils'
import LinkIcon from '~/lib/icons/link-new-window.svg?raw'
import ChevronIcon from '~/lib/icons/down-chevron.svg?raw'

type DataSourceInfoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDataSource?: string
}

const DATA_SOURCE_ORDER = [
  ...new Set([
    ...Object.keys(DATA_SOURCE_CONTENT),
    ...(carData as Car[]).map((car) => car.source).filter(Boolean),
  ]),
].sort(sortAlphabetically)

const ExternalLinkButton: Component<{ label: string; url: string }> = (props) => (
  <a
    href={props.url}
    target="_blank"
    rel="noopener noreferrer"
    class={cn(
      'inline-flex items-center gap-4 px-4 py-2',
      'border-2 border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/20',
      'text-sm transition-all',
    )}
  >
    {props.label}
    <span class="w-4 h-4" innerHTML={LinkIcon} />
  </a>
)

const ExpandableDescription: Component<{
  content: DataSourceContent
  isExpanded: boolean
  onToggle: () => void
}> = (props) => {
  let descriptionRef: HTMLParagraphElement | undefined
  const [summaryOverflows, setSummaryOverflows] = createSignal(true)
  const summaryText = () => props.content.summary.trim()

  const updateSummaryOverflow = () => {
    if (!descriptionRef || props.isExpanded) return
    setSummaryOverflows(descriptionRef.scrollHeight > descriptionRef.clientHeight)
  }

  createEffect(
    on(
      () => [summaryText(), props.isExpanded],
      () => requestAnimationFrame(updateSummaryOverflow),
    ),
  )

  const shouldShowReadMore = () => props.isExpanded || summaryOverflows()

  return (
    <div>
      <p
        ref={descriptionRef}
        class={cn(props.isExpanded ? 'line-clamp-none' : 'line-clamp-3')}
      >
        {summaryText()}
      </p>

      <Show when={shouldShowReadMore()}>
        <button
          onClick={props.onToggle}
          class={cn(
            'text-sm font-semibold text-white/80 underline cursor-pointer hover:text-white',
            props.isExpanded ? 'mt-6' : 'mt-4',
          )}
        >
          {props.isExpanded ? 'Show less' : 'Read more'}
        </button>
      </Show>
    </div>
  )
}

const DataSourceTab: Component<{
  dataSource: string
  isSelected: boolean
  onClick: () => void
  buttonRef?: (el: HTMLButtonElement) => void
}> = (props) => (
  <button
    ref={props.buttonRef}
    onClick={props.onClick}
    class={cn(
      'flex flex-shrink-0 items-center whitespace-nowrap border-4',
      'bg-[#2d2227] py-3 text-[#efe3e6] uppercase tracking-wide',
      'transition-all duration-300 cursor-pointer',
      props.isSelected
        ? 'px-4 text-sm font-bold border-black shadow-md/60'
        : 'px-4 text-sm border-transparent opacity-70 hover:opacity-90',
    )}
  >
    {props.dataSource}
  </button>
)

const DataSourceInfoModal: Component<DataSourceInfoModalProps> = (props) => {
  const [selectedIndex, setSelectedIndex] = createSignal(0)
  const [isExpanded, setIsExpanded] = createSignal(false)

  const [scrollContainer, setScrollContainer] = createSignal<HTMLDivElement>()
  const buttonRefs: Map<number, HTMLButtonElement> = new Map()

  createEffect(() => {
    if (props.open) {
      if (props.initialDataSource) {
        const index = DATA_SOURCE_ORDER.indexOf(props.initialDataSource)
        if (index !== -1) {
          setSelectedIndex(index)
        }
      }
    }
  })

  createEffect(() => {
    selectedIndex()
    setIsExpanded(false)
  })

  const scrollButtonToCenter = (container: HTMLDivElement, button: HTMLButtonElement) => {
    const containerRect = container.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    const halfContainerWidth = containerRect.width / 2
    const halfButtonWidth = buttonRect.width / 2
    const buttonOffsetFromContainerLeft = buttonRect.left - containerRect.left
    const targetScrollLeft = container.scrollLeft + buttonOffsetFromContainerLeft -
      halfContainerWidth + halfButtonWidth

    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })
  }

  createEffect(() => {
    if (!props.open) return

    const index = selectedIndex()
    const container = scrollContainer()
    const selectedButton = buttonRefs.get(index)

    if (!selectedButton || !container) return

    requestAnimationFrame(() => scrollButtonToCenter(container, selectedButton))
  })

  const selectedDataSource = createMemo(() => DATA_SOURCE_ORDER[selectedIndex()] ?? DATA_SOURCE_ORDER[0])
  const selectedContent = createMemo(() => DATA_SOURCE_CONTENT[selectedDataSource()])

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % DATA_SOURCE_ORDER.length)
  }

  const handleBack = () => {
    setSelectedIndex((prev) => (prev === 0 ? DATA_SOURCE_ORDER.length - 1 : prev - 1))
  }

  const ModalContent = () => (
    <>
      <div class="flex-1 overflow-y-auto px-6 pt-6 pb-6">
        <div class="relative mb-1">
          {/* Data source badge */}
          <div class="w-full border-4 border-b-0 border-black bg-[#2d2227] px-4 py-2 text-[#efe3e6] md:px-9">
            <span class="text-xl font-bold uppercase">
              {selectedDataSource()}
            </span>
          </div>

          {/* Main Content Card */}
          <div class="h-[290px] overflow-y-auto border-4 border-black bg-[#3a3a3a] text-white shadow-lg">
            <div class="p-4 text-sm leading-relaxed md:px-8 md:py-4 md:text-md">
              <Show when={selectedContent()} fallback={<p>N/A</p>}>
                {(content) => (
                  <>
                    <ExpandableDescription
                      content={content()}
                      isExpanded={isExpanded()}
                      onToggle={() => setIsExpanded(!isExpanded())}
                    />

                    <div class="pt-4 mt-6 border-t border-white/20">
                      <div class="flex flex-wrap gap-3">
                        <For each={content().resources}>
                          {(resource) => (
                            <ExternalLinkButton label={resource.label} url={resource.url} />
                          )}
                        </For>
                      </div>
                    </div>
                  </>
                )}
              </Show>
            </div>
          </div>
        </div>

        {/* Data source tabs */}
        <div ref={setScrollContainer} class="mb-6 overflow-x-auto scrollbar-hide scroll-smooth">
          <div class="flex items-center gap-3 py-2 pl-[5%]">
            <For each={DATA_SOURCE_ORDER}>
              {(dataSource, index) => (
                <DataSourceTab
                  dataSource={dataSource}
                  isSelected={selectedIndex() === index()}
                  onClick={() => setSelectedIndex(index())}
                  buttonRef={(el) => buttonRefs.set(index(), el)}
                />
              )}
            </For>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div class="flex gap-4">
          <button
            onClick={handleBack}
            class={cn(
              'flex flex-1 items-center justify-center p-4 text-lg font-medium',
              'border-8 border-black bg-[#1E1E1E] text-white',
              'transition-colors cursor-pointer hover:bg-[#3a3a3a]',
            )}
          >
            <span class="w-6 h-6 rotate-90" innerHTML={ChevronIcon} />
          </button>
          <button
            onClick={handleNext}
            class={cn(
              'flex flex-1 items-center justify-center p-4 text-sm font-medium md:text-lg',
              'border-8 border-black bg-[#1E1E1E] text-white',
              'transition-colors cursor-pointer hover:bg-[#3a3a3a]',
            )}
          >
            <span class="w-6 h-6 -rotate-90" innerHTML={ChevronIcon} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <ResponsiveModal
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Data Sources:"
      description="Data source references and related links"
      desktopMaxHeight="700px"
    >
      <ModalContent />
    </ResponsiveModal>
  )
}

export default DataSourceInfoModal

