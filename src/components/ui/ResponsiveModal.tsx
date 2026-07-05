import {
  type Component,
  type JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
} from 'solid-js'
import * as Drawer from 'corvu/drawer'
import * as Dialog from 'corvu/dialog'

import createMediaQuery from '~/utils/createMediaQuery'
import { BREAKPOINTS } from '~/utils/breakpoints'
import { cn } from '~/lib/utils'

type ResponsiveModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  subtitle?: string
  desktopMaxHeight?: string
  children: JSX.Element
}

const ResponsiveModal: Component<ResponsiveModalProps> = (props) => {
  const isDesktop = createMediaQuery(BREAKPOINTS.desktop)
  const [openedAsDesktop, setOpenedAsDesktop] = createSignal<boolean | null>(null)
  const desktopMaxHeight = createMemo(() => props.desktopMaxHeight ?? '850px')
  const hasSubtitle = createMemo(() => Boolean((props.subtitle ?? '').trim()))

  createEffect(() => {
    if (props.open) {
      if (openedAsDesktop() === null) {
        setOpenedAsDesktop(isDesktop())
      }
    } else {
      setOpenedAsDesktop(null)
    }
  })

  createEffect(() => {
    if (props.open && openedAsDesktop() !== null && openedAsDesktop() !== isDesktop()) {
      props.onOpenChange(false)
    }
  })

  const shouldUseDesktop = () => openedAsDesktop() ?? isDesktop()
  const CLOSE_BUTTON_CLASS = cn(
    'flex size-8 shrink-0 items-center justify-center',
    'bg-surface-secondary border border-white/20',
    'text-lg font-bold text-white transition-colors cursor-pointer',
    'hover:bg-[#3a2b2f]',
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
              'fixed inset-0 z-[60] bg-black/50',
              'data-[transitioning]:transition-all data-[transitioning]:duration-300',
            )}
            style={{
              'background-color': `rgb(0 0 0 / ${0.5 * drawerProps.openPercentage})`,
            }}
          />
          <Drawer.Content
            class={cn(
              'mobile-drawer-viewport-safe fixed inset-x-0 bottom-0 z-[70] flex flex-col',
              'rounded-t-4xl bg-surface text-white shadow-[0_-6px_20px_rgba(0,0,0,0.6)]',
              'data-[transitioning]:transition-transform data-[transitioning]:duration-300',
              'data-[transitioning]:ease-[cubic-bezier(0.32,0.72,0,1)]',
            )}
          >
            <div class="gradient-dark-red-soft rounded-t-4xl">
              <div class="flex justify-center pt-4 pb-3">
                <div class="w-12 h-1.5 rounded-full bg-[#8a7076]" />
              </div>

              <div class="flex items-center justify-between gap-4 border-b border-black pb-4 px-6">
                <Drawer.Label class="min-w-0 flex-1 text-white">
                  <Show when={hasSubtitle()}>
                    <span class="block text-lg font-semibold uppercase tracking-wide text-[#c9bbbf]">
                      {props.subtitle}
                    </span>
                  </Show>
                  <span class={cn(
                    'block break-words leading-tight text-base font-bold min-[420px]:text-lg',
                    hasSubtitle() && 'sm:text-xl',
                  )}>
                    {props.title}
                  </span>
                </Drawer.Label>
                <Drawer.Description class="sr-only">
                  {props.description}
                </Drawer.Description>
                <Drawer.Close class={CLOSE_BUTTON_CLASS}>×</Drawer.Close>
              </div>
            </div>

            <div class="flex flex-1 min-h-0 flex-col">
              {props.children}
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
            'fixed inset-0 z-[60] bg-black/50',
            'data-[opening]:animate-in data-[opening]:fade-in-0',
            'data-[closing]:animate-out data-[closing]:fade-out-0',
          )}
        />
        <Dialog.Content
          class={cn(
            'fixed left-1/2 top-1/2 z-[70] flex w-full max-w-2xl flex-col',
            '-translate-x-1/2 -translate-y-1/2',
            'border-4 border-black bg-surface text-white',
            'max-h-[85vh] shadow-[0_6px_20px_rgba(0,0,0,0.6)]',
            'data-[opening]:animate-in data-[opening]:fade-in-0',
            'data-[opening]:zoom-in-95 data-[opening]:slide-in-from-top-2',
            'data-[closing]:animate-out data-[closing]:fade-out-0',
            'data-[closing]:zoom-out-95 data-[closing]:slide-out-to-top-2',
          )}
          style={{
            'max-height': `min(85vh, ${desktopMaxHeight()})`,
          }}
        >
          <div class="gradient-dark-red-soft flex flex-shrink-0 items-center justify-between gap-4 border-b border-black py-4 px-6">
            <Dialog.Label class="min-w-0 flex-1 text-white">
              <Show when={hasSubtitle()}>
                <span class="block text-lg font-semibold uppercase tracking-wide text-[#c9bbbf]">
                  {props.subtitle}
                </span>
              </Show>
              <span class={cn(
                'block break-words leading-tight text-xl font-bold',
              )}>
                {props.title}
              </span>
            </Dialog.Label>
            <Dialog.Description class="sr-only">
              {props.description}
            </Dialog.Description>
            <Dialog.Close class={CLOSE_BUTTON_CLASS}>×</Dialog.Close>
          </div>

          <div class="flex flex-1 min-h-0 flex-col">
            {props.children}
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

export default ResponsiveModal
