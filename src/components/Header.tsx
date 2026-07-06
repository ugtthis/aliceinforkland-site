import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'

import SearchGlassSvg from '~/lib/icons/search-glass.svg?raw'
import WarningRedSwirlIcon from '~/lib/icons/warning-red-swirl-button.png'
import ShineBorder from '~/components/ui/ShineBorder'
import WarningModal from '~/components/WarningModal'
import { useFilter } from '~/contexts/FilterContext'
import { cn } from '~/lib/utils'

const Header: Component = () => {
  const [isWarningOpen, setIsWarningOpen] = createSignal(false)
  const { searchQuery, setSearchQuery } = useFilter()
  const openWarningModal = () => {
    window.plausible?.('Warning Button Click')
    setIsWarningOpen(true)
  }

  return (
    <>
      <header
        role="banner"
        class={cn(
          'flex flex-col items-center gap-4 py-6 border-b-[3px] border-black',
          'shadow-[0_6px_20px_rgba(0,0,0,0.6)] gradient-dark-red md:py-8',
        )}
      >
        <img
          src="/logo.png"
          alt="Alice in Forkland"
          width={782}
          height={127}
          class="h-auto w-[300px]"
          loading="eager"
        />
        <div class="flex w-full justify-center px-14 max-[410px]:px-8">
          <div class="flex max-w-full items-center gap-2 md:gap-3.5">
            <div class="min-w-0">
              <ShineBorder>
                <input
                  type="text"
                  placeholder="Search vehicles"
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                  maxLength={45}
                  class={cn(
                    'h-12 w-[400px] max-w-full border border-[#6a4d54] bg-[#171215] pl-12 pr-6 text-[#f1e7e9]',
                    'font-sans text-xs placeholder:text-[#5e5353] outline-none sm:text-sm md:text-base',
                  )}
                />
                <span class="absolute inset-y-0 left-0 grid w-12 place-items-center text-gray-500" aria-hidden="true">
                  <div class="w-5 h-5 text-accent" innerHTML={SearchGlassSvg} />
                </span>
              </ShineBorder>
            </div>

            <button
              type="button"
              onClick={openWarningModal}
              aria-label="Open warning information"
              class="group size-14 shrink-0 cursor-pointer"
            >
              <img
                src={WarningRedSwirlIcon}
                alt=""
                width={100}
                height={100}
                class="block size-full animate-warning-spin group-hover:[animation-play-state:running] motion-reduce:animate-none"
              />
            </button>
          </div>
        </div>
      </header>

      <WarningModal open={isWarningOpen()} onOpenChange={setIsWarningOpen} />
    </>
  )
}

export default Header
