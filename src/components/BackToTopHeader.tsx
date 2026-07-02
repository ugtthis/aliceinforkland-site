import { createSignal, onCleanup, onMount, type Component } from 'solid-js'

import UpArrowSvg from '~/lib/icons/up-arrow.svg?raw'
import { cn } from '~/lib/utils'

const SCROLL_TO_TOP_DURATION_MS = 700

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

const BackToTopHeader: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false)
  let animationFrameId: number | undefined

  onMount(() => {
    // Show once the user has scrolled past a full screen. Adapts to grid/list
    // and any card size, so there are no pixel thresholds to keep in sync.
    const handleScroll = () => setIsVisible(window.scrollY > window.innerHeight)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll)
      if (animationFrameId !== undefined) cancelAnimationFrame(animationFrameId)
    })
  })

  const scrollToTop = () => {
    const startScrollY = window.scrollY
    if (startScrollY <= 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0)
      return
    }

    // Drive the scroll frame-by-frame instead of `behavior: 'smooth'`: the window
    // virtualizer remeasures rows mid-scroll, which cancels native smooth scroll
    // and leaves it stranded partway up.
    const startTime = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / SCROLL_TO_TOP_DURATION_MS, 1)
      window.scrollTo(0, startScrollY * (1 - easeOutCubic(progress)))
      animationFrameId = progress < 1 ? requestAnimationFrame(step) : undefined
    }
    animationFrameId = requestAnimationFrame(step)
  }

  return (
    <div
      class={cn(
        'fixed top-0 right-0 left-0 z-50 border-b-[3px] border-black py-4 md:py-4.5',
        'gradient-dark-red shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-opacity duration-200 ease-out',
        isVisible() ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div class="mx-auto max-w-7xl px-4 md:px-6">
        <button
          type="button"
          onClick={scrollToTop}
          class="flex w-full cursor-pointer items-center justify-end text-white transition-colors hover:text-[#f1c7cf]"
        >
          <div class="h-6 w-6 flex-shrink-0 bouncy-arrow" innerHTML={UpArrowSvg} />
        </button>
      </div>

      {/* Animated shine border hugging the bottom edge. */}
      <div
        class={cn(
          'absolute inset-x-0 bottom-0 h-[10px] opacity-0 pointer-events-none back-to-top-shine-border',
          'shadow-[0_8px_10px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(0,0,0,0.4)]',
          'transition-opacity duration-[3000ms] ease-in-out',
          isVisible() && 'opacity-75',
        )}
      />
    </div>
  )
}

export default BackToTopHeader
