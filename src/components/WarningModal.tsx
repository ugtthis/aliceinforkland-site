import { type Component, Show, createSignal } from 'solid-js'

import ResponsiveModal from '~/components/ui/ResponsiveModal'
import DownChevronSvg from '~/lib/icons/down-chevron.svg?raw'
import LinkIcon from '~/lib/icons/link-new-window.svg?raw'
import WarningTriangleSvg from '~/lib/icons/warning-triangle.svg?raw'
import { cn } from '~/lib/utils'

type WarningModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WarningModal: Component<WarningModalProps> = (props) => {
  const [isResourcesExpanded, setIsResourcesExpanded] = createSignal(false)

  return (
    <ResponsiveModal
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Forkland is NOT for everyone!"
      description="Safety and responsibility notice"
      desktopMaxHeight="700px"
    >
      <div class="flex min-h-[240px] flex-1 flex-col gap-5 p-6 text-[#efe3e6]">
        <div class="border-2 border-[#741b26] bg-[#160b0e] p-4 shadow-[4px_4px_0_rgba(0,0,0,0.55)]">
          <div class="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              class="size-7 shrink-0 text-[#ff6b7a]"
              innerHTML={WarningTriangleSvg}
            />
            <p class="text-xl font-bold uppercase tracking-[0.10em] text-[#ff6b7a]">
              WARNING
            </p>
          </div>
          <p class="mt-2 font-sans text-sm leading-6 text-[#f1e7e9]">
            This site contains experimental experiences that can be unstable. Information may be incomplete, outdated, or wrong.
            Verify details independently before relying on them. This site is not responsible for damage, injury, loss, misuse, or decisions
            made from this site's content. Use the information at your own risk. May your judgment be strong and your rollback plan stronger.
          </p>
        </div>

        <section class="border-2 border-[#5c4247] bg-[#181416] text-[#eee2e5]">
          <button
            type="button"
            onClick={() => setIsResourcesExpanded((expanded) => !expanded)}
            class={cn(
              'flex w-full items-center justify-between border-b border-[#6a4d54] bg-[#2d2227] px-3 py-3 text-left',
              'transition-colors duration-200 cursor-pointer hover:bg-[#3a2a30]',
            )}
            aria-expanded={isResourcesExpanded()}
          >
            <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">
              Resources
            </h3>
            <span
              class={cn('h-2 w-2', isResourcesExpanded() && 'rotate-180')}
              innerHTML={DownChevronSvg}
            />
          </button>

          <Show when={isResourcesExpanded()}>
            <div class="space-y-3 p-2.5 text-sm leading-6 text-[#c9bbbf]">
              <p>
                It is crucial to read and deeply understand the links below. If that seems like too much work, this site is not for you.
              </p>

              <div class="grid gap-2.5 min-[520px]:grid-cols-2">
                <a
                  href="https://docs.comma.ai/concepts/safety/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class={cn(
                    'block border border-[#5c4247] bg-[#21191d] p-3 text-[#eee2e5]',
                    'cursor-pointer transition-colors hover:bg-[#2a2024]',
                  )}
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0 truncate text-sm font-semibold leading-tight text-[#f1e7e9]">
                      safety.md
                    </div>
                    <span class="h-3.5 w-3.5 shrink-0 text-[#efe3e6]" innerHTML={LinkIcon} />
                  </div>
                </a>
                <a
                  href="http://www.catb.org/esr/faqs/smart-questions.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  class={cn(
                    'block border border-[#5c4247] bg-[#21191d] p-3 text-[#eee2e5]',
                    'cursor-pointer transition-colors hover:bg-[#2a2024]',
                  )}
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0 truncate text-sm font-semibold leading-tight text-[#f1e7e9]">
                      Read this
                    </div>
                    <span class="h-3.5 w-3.5 shrink-0 text-[#efe3e6]" innerHTML={LinkIcon} />
                  </div>
                </a>
              </div>
            </div>
          </Show>
        </section>
      </div>
    </ResponsiveModal>
  )
}

export default WarningModal
