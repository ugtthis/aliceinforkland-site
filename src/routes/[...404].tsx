import { onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import RightArrowSvg from '~/lib/icons/right-arrow.svg?raw'

export default function NotFound() {
  const navigate = useNavigate()

  onMount(() => {
    window.plausible?.('404')
  })

  return (
    <div class="min-h-screen bg-[#090506]">
      <header class="py-4 border-black md:py-6 gradient-dark-red border-b-[3px] shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
        <div class="px-4 mx-auto md:px-6 max-w-[2200px]">
          <nav class="flex items-center text-sm font-medium text-white">
            <button onClick={() => navigate('/')} class="flex gap-1.5 items-center transition-colors hover:text-[#f1c7cf] hover:cursor-pointer">
              <div class="flex-shrink-0 w-3 h-3 rotate-180" innerHTML={RightArrowSvg} />
              <span>Home</span>
            </button>
          </nav>
        </div>
      </header>

      <main
        class="flex justify-center items-center p-8 min-h-[calc(100vh-80px)]
        bg-[radial-gradient(ellipse_100%_42%_at_50%_0%,rgba(90,20,24,0.24)_0%,transparent_72%),
        linear-gradient(180deg,#12080a_0%,#090506_58%,#050303_100%)]"
      >
        <div class="max-w-2xl text-center">
          <h1 class="mb-4 text-4xl font-bold text-[#f7edf0] md:text-5xl">404 - Page Not Found</h1>
          <p class="mb-8 text-lg text-[#cbb9be]">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <button
            onClick={() => navigate('/')}
            class="inline-block py-3 px-8 text-white border-2 border-black transition-colors hover:cursor-pointer bg-[#5a1418] hover:bg-[#74212a]"
          >
            Go Back Home
          </button>
        </div>
      </main>
    </div>
  )
}
