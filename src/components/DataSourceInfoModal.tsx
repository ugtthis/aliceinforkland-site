import {
  type Component,
  Show,
  createSignal,
  createEffect,
  on,
  For,
  createMemo,
} from 'solid-js'
import * as Drawer from 'corvu/drawer'
import * as Dialog from 'corvu/dialog'
import createMediaQuery from '~/utils/createMediaQuery'
import { BREAKPOINTS } from '~/utils/breakpoints'
import {
  DATA_SOURCE_CONTENT,
  type DataSourceContent,
} from '~/data/dataSourceDescriptions'
import { carData } from '~/data/cars'
import type { Car } from '~/types/CarDataTypes'
import { cn } from '~/lib/utils'
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
].sort()

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
  const isDesktop = createMediaQuery(BREAKPOINTS.desktop)
  const [openedAsDesktop, setOpenedAsDesktop] = createSignal<boolean | null>(null)
  const [selectedIndex, setSelectedIndex] = createSignal(0)
  const [isExpanded, setIsExpanded] = createSignal(false)

  const [scrollContainer, setScrollContainer] = createSignal<HTMLDivElement>()
  const buttonRefs: Map<number, HTMLButtonElement> = new Map()

  createEffect(() => {
    if (props.open) {
      if (openedAsDesktop() === null) {
        setOpenedAsDesktop(isDesktop())
      }
      if (props.initialDataSource) {
        const index = DATA_SOURCE_ORDER.indexOf(props.initialDataSource)
        if (index !== -1) {
          setSelectedIndex(index)
        }
      }
    } else {
      setOpenedAsDesktop(null)
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

  createEffect(() => {
    if (props.open && openedAsDesktop() !== null && openedAsDesktop() !== isDesktop()) {
      props.onOpenChange(false)
    }
  })

  const shouldUseDesktop = () => openedAsDesktop() ?? isDesktop()
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

  const MobileDrawer = () => (
    <Drawer.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
      breakPoints={[0.95]}
      side="bottom"
    >
      {(drawerProps) => (
        <Drawer.Portal>
          <Drawer.Overlay
            class={cn(
              'fixed inset-0 z-40 bg-black/50',
              'data-[transitioning]:transition-all data-[transitioning]:duration-300',
            )}
            style={{
              'background-color': `rgb(0 0 0 / ${0.5 * drawerProps.openPercentage})`,
            }}
          />
          <Drawer.Content
            class={cn(
              'mobile-drawer-viewport-safe fixed inset-x-0 bottom-0 z-50 flex flex-col',
              'rounded-t-4xl bg-surface text-white shadow-[0_-6px_20px_rgba(0,0,0,0.6)]',
              'data-[transitioning]:transition-transform data-[transitioning]:duration-300',
              'data-[transitioning]:ease-[cubic-bezier(0.32,0.72,0,1)]',
            )}
          >
            {/* Mobile header with drawer handle */}
            <div class="bg-[#3a1519] rounded-t-4xl">
              {/* Drawer handle */}
              <div class="flex justify-center pt-4 pb-3">
                <div class="w-12 h-1.5 rounded-full bg-[#8a7076]" />
              </div>

              {/* Header */}
              <div class="flex justify-between items-center px-4 pb-4 border-b border-black">
                <Drawer.Label class="text-xl font-bold text-white">
                  Data Sources:
                </Drawer.Label>
                <Drawer.Close
                  class={cn(
                    'flex items-center justify-center size-8',
                    'bg-surface-secondary border border-white/20',
                    'text-lg font-bold text-white transition-colors cursor-pointer',
                    'hover:bg-[#3a2b2f]',
                  )}
                >
                  ×
                </Drawer.Close>
              </div>
            </div>

            <div class="flex flex-col flex-1 min-h-0">
              <ModalContent />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      )}
    </Drawer.Root>
  )

  const DesktopDialog = () => (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          class={cn(
            'fixed inset-0 z-40 bg-black/50',
            'data-[opening]:animate-in data-[opening]:fade-in-0',
            'data-[closing]:animate-out data-[closing]:fade-out-0',
          )}
        />
        <Dialog.Content
          class={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl',
            '-translate-x-1/2 -translate-y-1/2',
            'border-4 border-black bg-surface text-white',
            'max-h-[min(85vh,700px)] flex flex-col',
            'shadow-[0_6px_20px_rgba(0,0,0,0.6)]',
            'data-[opening]:animate-in data-[opening]:fade-in-0',
            'data-[opening]:zoom-in-95 data-[opening]:slide-in-from-top-2',
            'data-[closing]:animate-out data-[closing]:fade-out-0',
            'data-[closing]:zoom-out-95 data-[closing]:slide-out-to-top-2',
          )}
        >
          {/* Desktop header */}
          <div class="flex flex-shrink-0 items-center justify-between border-b border-black bg-[#3a1519] p-4">
            <Dialog.Label class="text-xl font-bold text-white">
              Data Sources:
            </Dialog.Label>
            <Dialog.Close
              class={cn(
                'flex items-center justify-center size-8',
                'bg-surface-secondary border border-white/20',
                'text-lg font-bold text-white transition-colors cursor-pointer',
                'hover:bg-[#3a2b2f]',
              )}
            >
              ×
            </Dialog.Close>
          </div>

          <div class="flex flex-col flex-1 min-h-0">
            <ModalContent />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

  return (
    <Show when={shouldUseDesktop()} fallback={<MobileDrawer />}>
      <DesktopDialog />
    </Show>
  )
}

export default DataSourceInfoModal

