import {
  type Component,
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
} from 'solid-js'

import { footnoteDefinitionsBySource } from '~/data/cars'
import { DATA_SOURCE_CONTENT } from '~/data/dataSourceDescriptions'
import { getACCDescription, getAutoResumeDescription } from '~/data/featureDescriptions'
import type { Car } from '~/types/CarDataTypes'
import { sanitizeTrustedFootnoteHtml } from '~/utils/sanitizeTrustedFootnoteHtml'
import ResponsiveModal from '~/components/ui/ResponsiveModal'
import { cn } from '~/lib/utils'

import Checkmark2Svg from '~/lib/icons/checkmark-2.svg?raw'
import BranchNodesSvg from '~/lib/icons/branch-nodes.svg?raw'
import CloseXIcon from '~/lib/icons/close-x.png'
import DownChevronSvg from '~/lib/icons/down-chevron.svg?raw'
import GithubMarkSvg from '~/lib/icons/github-mark.svg?raw'
import LinkIcon from '~/lib/icons/link-new-window.svg?raw'

type VehicleDetailsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  car?: Car
}

type VehicleResource = {
  title: string
  description: string
  url: string
}

const RED_PNG_FILTER = 'brightness(0) saturate(90%) invert(23%) sepia(89%) saturate(3520%) hue-rotate(352deg) brightness(85%) contrast(95%)'
const WIP_DATA_SOURCE_BASE_URL = 'https://github.com/ugtthis/opendbc-community-data/tree/main/data/wip'

const getWipMakeTomlUrl = (make: string | null | undefined): string => {
  const normalizedMake = (make ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalizedMake
    ? `${WIP_DATA_SOURCE_BASE_URL}/${normalizedMake}.toml`
    : WIP_DATA_SOURCE_BASE_URL
}

const carTitle = (car: Car) => {
  const variant = (car.model_variant ?? '').trim()
  return variant.length > 0
    ? `${car.make} ${car.model} ${variant}`
    : `${car.make} ${car.model}`
}

// Reusable static info tile with optional description.
const DetailTile: Component<{
  label: string
  value: string
  description?: string
  class?: string
}> = (props) => (
  <section class={cn('border-2 border-[#5c4247] bg-[#21191d] text-[#eee2e5]', props.class)}>
    <div class="border-b border-[#6a4d54] bg-[#2d2227] px-3 py-2">
      <h3 class="min-w-0 text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">{props.label}</h3>
    </div>
    <div class="px-3 py-3">
      <p class="text-base font-semibold leading-tight text-[#f1e7e9]">{props.value}</p>
      <Show when={props.description}>
        <p class="mt-3 text-sm leading-relaxed text-[#ddcfd3]">{props.description}</p>
      </Show>
    </div>
  </section>
)

// WIP branch details tile with optional external link.
const WipBranchTile: Component<{
  branchName: string
  branchDescription: string
  branchUrl: string
  class?: string
}> = (props) => {
  const isBranchNameUnavailable = () => props.branchName.trim().toUpperCase() === 'N/A'
  const isBranchDescriptionUnavailable = () => props.branchDescription.trim().toUpperCase() === 'N/A'
  const shouldShowSingleUnavailableValue = () =>
    isBranchNameUnavailable() && isBranchDescriptionUnavailable()
  const hasBranchUrl = () => {
    const url = props.branchUrl.trim()
    return url.length > 0 && url.toUpperCase() !== 'N/A'
  }

  return (
    <section class={cn('border-2 border-[#5c4247] bg-[#21191d] text-[#eee2e5]', props.class)}>
      <div class="border-b border-[#6a4d54] bg-[#2d2227] px-3 py-2">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">WIP branch</h3>
      </div>
      <div class={cn(
        'grid items-stretch',
        hasBranchUrl() ? 'grid-cols-[minmax(0,4fr)_72px]' : 'grid-cols-1',
      )}>
        <div class="min-w-0 space-y-1.5 px-3 py-3">
          <Show
            when={!shouldShowSingleUnavailableValue()}
            fallback={<p class="text-lg font-bold leading-tight text-[#f1e7e9]">N/A</p>}
          >
            <div class="space-y-1.5">
              <div class="flex min-w-0 items-center gap-2 text-[#f1e7e9]">
                <span class="h-4 w-4 shrink-0" aria-hidden="true" innerHTML={BranchNodesSvg} />
                <p class="truncate text-lg font-bold uppercase tracking-wide">{props.branchName}</p>
              </div>
              <p class="break-words text-sm leading-relaxed text-[#cbbdc1]">{props.branchDescription}</p>
            </div>
          </Show>
        </div>
        <Show when={hasBranchUrl()}>
          <a
            href={props.branchUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open branch ${props.branchName} on GitHub`}
            aria-label={`Open branch ${props.branchName} on GitHub`}
            class={cn(
              'group h-full w-full self-stretch flex items-center justify-center border-l border-[#8b6d75] bg-[#33272b]',
              'text-[#f5eaed] transition-colors hover:bg-[#3f2f35] cursor-pointer',
            )}
          >
            <span class="h-4 w-4 shrink-0 text-[#efe3e6]" innerHTML={LinkIcon} />
          </a>
        </Show>
      </div>
    </section>
  )
}

// Simple upstream availability status tile.
const UpstreamStatusTile: Component<{ yearsNotInUpstream: number[] }> = (props) => {
  const isAvailable = () => props.yearsNotInUpstream.length === 0

  return (
    <section class="border-2 border-[#5c4247] bg-[#21191d] text-[#eee2e5]">
      <div class="border-b border-[#6a4d54] bg-[#2d2227] px-3 py-2">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">Available in upstream</h3>
      </div>
      <div class="px-3 py-3">
        <p class="text-base font-semibold leading-tight text-[#f1e7e9]">
          {isAvailable() ? 'Yes' : 'No'}
        </p>
      </div>
    </section>
  )
}

// Card-style external resource link.
const ResourceCard: Component<{ resource: VehicleResource }> = (props) => {
  const isGithubResource = () =>
    props.resource.title.toLowerCase().includes('github') ||
    props.resource.url.toLowerCase().includes('github.com')
  const displayTitle = () =>
    isGithubResource() && props.resource.title.trim().toLowerCase() === 'github'
      ? 'Github repo'
      : props.resource.title

  return (
    <a
      href={props.resource.url}
      target="_blank"
      rel="noopener noreferrer"
      class={cn(
        'group block border border-[#5c4247] bg-[#21191d] p-3 text-[#eee2e5]',
        'transition-colors hover:bg-[#2a2024] cursor-pointer',
      )}
    >
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0 flex flex-1 items-center gap-2">
          <Show when={isGithubResource()}>
            <span class="h-4 w-4 shrink-0 text-[#f1e7e9]" aria-hidden="true" innerHTML={GithubMarkSvg} />
          </Show>
          <div class="truncate text-sm font-semibold leading-tight text-[#f1e7e9]">
            {displayTitle()}
          </div>
        </div>

        <span class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#efe3e6]" innerHTML={LinkIcon} />
      </div>
    </a>
  )
}

// Expandable resources section containing resource cards.
const ResourceSection: Component<{
  resources: VehicleResource[]
  isExpanded: boolean
  onToggle: () => void
}> = (props) => (
  <Show when={props.resources.length > 0}>
    <section class="border-2 border-[#5c4247] bg-[#181416] text-[#eee2e5] md:col-span-2">
      <button
        type="button"
        onClick={props.onToggle}
        class={cn(
          'flex w-full items-center justify-between border-b border-[#6a4d54] bg-[#2d2227] px-3 py-3 text-left',
          'transition-colors duration-200 cursor-pointer hover:bg-[#3a2a30]',
        )}
        aria-expanded={props.isExpanded}
      >
        <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">Resources</h3>
        <span
          class={cn('h-2 w-2', props.isExpanded && 'rotate-180')}
          innerHTML={DownChevronSvg}
        />
      </button>
      <Show when={props.isExpanded}>
        <div class="grid gap-2.5 p-2.5 min-[520px]:grid-cols-2">
          <For each={props.resources}>
            {(resource) => <ResourceCard resource={resource} />}
          </For>
        </div>
      </Show>
    </section>
  </Show>
)

// Generic expandable detail tile with label/value and description.
const ExpandableDetailTile: Component<{
  label: string
  value: string
  description: string
  isExpanded: boolean
  onToggle: () => void
}> = (props) => (
  <section class="border-2 border-[#5c4247] bg-[#21191d] text-[#eee2e5] md:col-span-2">
    <button
      type="button"
      onClick={props.onToggle}
      class={cn(
        'flex w-full items-center justify-between border-b border-[#6a4d54] bg-[#2d2227] px-3 py-3 text-left',
        'transition-colors duration-200 cursor-pointer hover:bg-[#3a2a30]',
      )}
      aria-expanded={props.isExpanded}
    >
      <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">{props.label}</h3>
      <span class="flex items-center gap-3">
        <span class="text-sm font-semibold text-[#f1e7e9]">{props.value}</span>
        <span
          class={cn('h-2 w-2', props.isExpanded && 'rotate-180')}
          innerHTML={DownChevronSvg}
        />
      </span>
    </button>
    <Show when={props.isExpanded}>
      <p class="bg-[#2a2024] px-3 py-3 text-sm leading-relaxed text-[#ddcfd3]">
        {props.description}
      </p>
    </Show>
  </section>
)

// Expandable data source tile with summary and source link.
const DataSourceTile: Component<{
  value: string
  summary: string
  sourceUrl: string
  isExpanded: boolean
  onToggle: () => void
}> = (props) => (
  <section class="border-2 border-[#5c4247] bg-[#21191d] text-[#eee2e5] md:col-span-2">
    <button
      type="button"
      onClick={props.onToggle}
      class={cn(
        'flex w-full items-center justify-between border-b border-[#6a4d54] bg-[#2d2227] px-3 py-3 text-left',
        'transition-colors duration-200 cursor-pointer hover:bg-[#3a2a30]',
      )}
      aria-expanded={props.isExpanded}
    >
      <h3 class="min-w-0 flex-1 pr-2 text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">
        Data source
      </h3>
      <span class="flex shrink-0 items-center justify-end gap-2">
        <span class="whitespace-nowrap text-right text-sm font-semibold leading-tight text-[#f1e7e9]">
          {props.value.toUpperCase()}
        </span>
        <span
          class={cn('h-2 w-2 shrink-0', props.isExpanded && 'rotate-180')}
          innerHTML={DownChevronSvg}
        />
      </span>
    </button>
    <Show when={props.isExpanded}>
      <div class="bg-[#2a2024] px-3 py-3 text-sm leading-relaxed text-[#ddcfd3]">
        <p class="break-words">{props.summary}</p>
        <Show when={props.sourceUrl}>
          <a
            href={props.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            class={cn(
              'mt-3 flex items-center justify-between gap-3 border border-[#5c4247] bg-[#21191d] px-3 py-2.5',
              'text-[#eee2e5] transition-colors hover:bg-[#2a2024] cursor-pointer',
            )}
          >
            <span class="min-w-0 break-words text-sm font-semibold leading-tight text-[#f1e7e9]">
              View Original Data Source
            </span>
            <span class="h-3.5 w-3.5 shrink-0 text-[#efe3e6]" innerHTML={LinkIcon} />
          </a>
        </Show>
      </div>
    </Show>
  </section>
)

// Expandable compatible hardware tile with buy links.
const CompatibleHardwareTile: Component<{
  value: string
  isExpanded: boolean
  onToggle: () => void
}> = (props) => {
  const isHardwareUnavailable = () => props.value.trim().toLowerCase() === 'n/a'
  const isBuyUsedDisabled = () => isHardwareUnavailable()
  const isBuyNewDisabled = () => isHardwareUnavailable() || props.value.trim().toLowerCase() === 'comma 3x'

  return (
    <section class="border-2 border-[#5c4247] bg-[#181416] text-[#eee2e5] md:col-span-2">
    <button
      type="button"
      onClick={props.onToggle}
      class={cn(
        'flex w-full items-center justify-between border-b border-[#6a4d54] bg-[#2d2227] px-3 py-3 text-left',
        'transition-colors duration-200 cursor-pointer hover:bg-[#3a2a30]',
      )}
      aria-expanded={props.isExpanded}
    >
      <h3 class="min-w-0 flex-1 pr-2 text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">Compatible hardware</h3>
      <span class="flex min-w-0 max-w-[34%] items-center justify-end gap-2">
        <span class="min-w-0 break-words text-right text-sm font-semibold leading-tight text-[#f1e7e9]">
          {props.value}
        </span>
        <span
          class={cn('h-2 w-2 shrink-0', props.isExpanded && 'rotate-180')}
          innerHTML={DownChevronSvg}
        />
      </span>
    </button>
    <Show when={props.isExpanded}>
      <div class="px-3 py-3 text-sm leading-relaxed text-[#ddcfd3]">
        <div class="grid items-stretch gap-2 min-[420px]:grid-cols-2">
          <Show
            when={!isBuyUsedDisabled()}
            fallback={(
              <span
                class={cn(
                  'flex h-full items-center justify-between gap-3 border border-[#4e4448] bg-[#181316] px-3 py-3',
                  'cursor-not-allowed opacity-60',
                )}
                aria-disabled="true"
              >
                <span class="min-w-0 whitespace-normal break-words text-sm font-semibold leading-tight text-[#9f9498]">
                  Buy used on Discord
                </span>
                <span class="h-3.5 w-3.5 shrink-0 text-[#8a7d81]" innerHTML={LinkIcon} />
              </span>
            )}
          >
            <a
              href="https://discord.com/channels/469524606043160576/532179801474203649"
              target="_blank"
              rel="noopener noreferrer"
              class={cn(
                'group flex h-full items-center justify-between gap-3 border border-[#5c4247] bg-[#21191d] px-3 py-3',
                'text-[#eee2e5] transition-colors hover:bg-[#2a2024] cursor-pointer',
              )}
            >
              <span class="min-w-0 whitespace-normal break-words text-sm font-semibold leading-tight text-[#f1e7e9]">
                Buy used on Discord
              </span>
              <span class="h-3.5 w-3.5 shrink-0 text-[#efe3e6]" innerHTML={LinkIcon} />
            </a>
          </Show>
          <Show
            when={!isBuyNewDisabled()}
            fallback={(
              <span
                class={cn(
                  'flex h-full items-center justify-between gap-3 border border-[#4e4448] bg-[#181316] px-3 py-3',
                  'cursor-not-allowed opacity-60',
                )}
                aria-disabled="true"
              >
                <span class="min-w-0 whitespace-normal break-words text-sm font-semibold leading-tight text-[#9f9498]">
                  Buy New
                </span>
                <span class="h-3.5 w-3.5 shrink-0 text-[#8a7d81]" innerHTML={LinkIcon} />
              </span>
            )}
          >
            <a
              href="https://comma.ai/shop/comma-four"
              target="_blank"
              rel="noopener noreferrer"
              class={cn(
                'group flex h-full items-center justify-between gap-3 border border-[#5c4247] bg-[#21191d] px-3 py-3',
                'text-[#eee2e5] transition-colors hover:bg-[#2a2024] cursor-pointer',
              )}
            >
              <span class="min-w-0 whitespace-normal break-words text-sm font-semibold leading-tight text-[#f1e7e9]">
                Buy New
              </span>
              <span class="h-3.5 w-3.5 shrink-0 text-[#efe3e6]" innerHTML={LinkIcon} />
            </a>
          </Show>
        </div>
      </div>
    </Show>
  </section>
)
}

// Expandable resume-from-stop capability tile.
const ResumeTile: Component<{
  car: Car
  isExpanded: boolean
  onToggle: () => void
}> = (props) => (
  <section class="border-2 border-[#5c4247] bg-[#21191d] text-[#eee2e5] md:col-span-2">
    <button
      type="button"
      onClick={props.onToggle}
      class={cn(
        'flex w-full items-center justify-between border-b border-[#6a4d54] bg-[#2d2227] px-3 py-3 text-left',
        'transition-colors duration-200 cursor-pointer hover:bg-[#3a2a30]',
      )}
      aria-expanded={props.isExpanded}
    >
      <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">Resume from stop</h3>
      <span class="flex items-center gap-3">
        <Show
          when={props.car.auto_resume_available}
          fallback={(
            <span class="flex h-5 w-5 shrink-0 items-center justify-center">
              <img src={CloseXIcon} alt="No" class="h-full w-full" style={{ filter: RED_PNG_FILTER }} />
            </span>
          )}
        >
          <span class="flex h-5 w-5 shrink-0 items-center justify-center text-[#65e063]" innerHTML={Checkmark2Svg} />
        </Show>
        <span
          class={cn('flex h-2 w-2 shrink-0 items-center justify-center', props.isExpanded && 'rotate-180')}
          innerHTML={DownChevronSvg}
        />
      </span>
    </button>
    <Show when={props.isExpanded}>
      <div class="bg-[#2a2024] px-3 py-3">
        <p class="text-sm leading-relaxed text-[#ddcfd3]">
          {getAutoResumeDescription(props.car.auto_resume_available)}
        </p>
      </div>
    </Show>
  </section>
)

// Optional video links tile for user/setup videos.
const VideoLinksTile: Component<{ car: Car }> = (props) => {
  const hasAnyVideo = createMemo(() => Boolean(props.car.video || props.car.setup_video))

  return (
    <Show when={hasAnyVideo()}>
      <section class="border-2 border-[#5c4247] bg-[#181416] text-[#eee2e5] md:col-span-2">
        <div class="border-b border-[#6a4d54] bg-[#2d2227] px-3 py-3">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">Videos</h3>
        </div>
        <div class="grid gap-2.5 p-2.5 min-[520px]:grid-cols-2">
          <Show
            when={props.car.video}
            fallback={(
              <span
                class={cn(
                  'flex items-center justify-between gap-3 border border-[#4e4448] bg-[#181316] p-3',
                  'cursor-not-allowed opacity-60',
                )}
                aria-disabled="true"
              >
                <span class="min-w-0 truncate text-sm font-semibold leading-tight text-[#9f9498]">
                  User video
                </span>
                <span class="h-3.5 w-3.5 shrink-0 text-[#8a7d81]" innerHTML={LinkIcon} />
              </span>
            )}
          >
            <ResourceCard
              resource={{
                title: 'User video',
                description: 'Watch a user-submitted video for this supported vehicle.',
                url: props.car.video!,
              }}
            />
          </Show>

          <Show
            when={props.car.setup_video}
            fallback={(
              <span
                class={cn(
                  'flex items-center justify-between gap-3 border border-[#4e4448] bg-[#181316] p-3',
                  'cursor-not-allowed opacity-60',
                )}
                aria-disabled="true"
              >
                <span class="min-w-0 truncate text-sm font-semibold leading-tight text-[#9f9498]">
                  Setup video
                </span>
                <span class="h-3.5 w-3.5 shrink-0 text-[#8a7d81]" innerHTML={LinkIcon} />
              </span>
            )}
          >
            <ResourceCard
              resource={{
                title: 'Setup video',
                description: 'Open setup or install guidance for this vehicle.',
                url: props.car.setup_video!,
              }}
            />
          </Show>
        </div>
      </section>
    </Show>
  )
}

// Main vehicle details modal (desktop dialog + mobile drawer).
const VehicleDetailsModal: Component<VehicleDetailsModalProps> = (props) => {
  const [expandedDetails, setExpandedDetails] = createSignal<Set<string>>(new Set(['source']))

  createEffect(() => {
    if (!props.open) {
      setExpandedDetails(new Set(['source']))
    }
  })
  const sourceLabel = createMemo(() => (props.car?.source ?? '').trim())
  const dataSourceSummary = createMemo(() =>
    DATA_SOURCE_CONTENT[sourceLabel()]?.summary ?? 'No data source summary available.',
  )
  const dataSourceUrl = createMemo(() => {
    const car = props.car
    if (!car) return ''

    if (sourceLabel().toLowerCase() === 'wip') {
      return getWipMakeTomlUrl(car.make)
    }

    const explicitSourceUrl = car.source_url?.trim()
    if (explicitSourceUrl) return explicitSourceUrl

    return ''
  })
  const accValue = createMemo(() => props.car?.acc || 'Stock')
  const modalYear = createMemo(() => (props.car?.years ?? '').trim())
  const modalTitle = createMemo(() => (props.car ? carTitle(props.car) : 'Vehicle Details'))
  const importantNotes = createMemo<string[]>(() => {
    const car = props.car
    if (!car) return []

    const wipNotes = (car.wip_details?.important_notes ?? [])
      .map((note) => note.trim())
      .filter((note) => note.length > 0)
    if (wipNotes.length > 0) return wipNotes

    const footnoteDefinitions = footnoteDefinitionsBySource[(car.source ?? '').trim()] ?? {}
    const footnoteEntries = Object.values(car.footnotes ?? {})
    const seen = new Set<string>()
    const resolvedNotes: string[] = []

    for (const entries of footnoteEntries) {
      for (const entry of entries) {
        const key = String(entry).trim()
        if (!key || seen.has(key)) continue
        seen.add(key)

        const resolved = footnoteDefinitions[key]?.trim()
        if (resolved) resolvedNotes.push(resolved)
      }
    }

    return resolvedNotes
  })
  const hasAdditionalResource = createMemo(
    () => (props.car?.wip_details?.extra_resource_url ?? '').trim().length > 0,
  )
  const resources = createMemo<VehicleResource[]>(() => {
    const car = props.car
    if (!car) return []
    const currentSource = sourceLabel().toLowerCase()

    const dataSourceResources = (DATA_SOURCE_CONTENT[sourceLabel()]?.resources ?? [])
      .filter((resource) => resource.url.trim().length > 0)
      .map((resource) => ({
        title: resource.label,
        description: `Open ${resource.label} for ${sourceLabel()}.`,
        url: resource.url,
      }))

    const wipResources = car.wip_details
      ? [
          car.wip_details.wiki_url && {
            title: 'Vehicle wiki',
            description: 'Reference notes and implementation details from the vehicle wiki.',
            url: car.wip_details.wiki_url,
          },
          car.wip_details.discord_url && {
            title: 'Discord channel',
            description: 'Open the related Discord thread for community testing updates.',
            url: car.wip_details.discord_url,
          },
        ].filter((resource): resource is VehicleResource => Boolean(resource))
      : []

    if (currentSource !== 'wip' && dataSourceResources.length > 0) {
      return dataSourceResources
    }

    const carResources = [
      ...wipResources,
    ].filter((resource): resource is VehicleResource => Boolean(resource))

    if (carResources.length > 0) return carResources
    if (dataSourceResources.length > 0) return dataSourceResources

    return [
      {
        title: 'Compatibility guide',
        description: 'Placeholder resource for previewing the bento link layout.',
        url: 'https://example.com/compatibility-guide',
      },
      {
        title: 'Install notes',
        description: 'Placeholder setup resource for mobile and desktop layout testing.',
        url: 'https://example.com/install-notes',
      },
      {
        title: 'Community discussion',
        description: 'Placeholder community resource to test wrapping with multiple cards.',
        url: 'https://example.com/community-discussion',
      },
    ]
  })
  const isDetailExpanded = (detailId: string) => expandedDetails().has(detailId)
  const toggleDetail = (detailId: string) => {
    setExpandedDetails((previous) => {
      const next = new Set(previous)
      if (next.has(detailId)) {
        next.delete(detailId)
      } else {
        next.add(detailId)
      }
      return next
    })
  }

  const ModalContent = () => (
    <Show when={props.car}>
      {(car) => (
        <div class="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-6 pb-6 text-white">
          <div class="mb-5">
            <div class="bg-[#181416]">
              <div class="grid gap-3 md:grid-cols-2 [&>*]:min-w-0">
                <DataSourceTile
                  value={sourceLabel() || 'N/A'}
                  summary={dataSourceSummary()}
                  sourceUrl={dataSourceUrl()}
                  isExpanded={isDetailExpanded('source')}
                  onToggle={() => toggleDetail('source')}
                />

                <Show when={importantNotes().length > 0 || hasAdditionalResource()}>
                  <section class="border-2 border-[#5c4247] bg-[#21191d] text-[#eee2e5] md:col-span-2">
                    <div class="border-b border-[#6a4d54] bg-[#2d2227] px-3 py-2">
                      <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">
                        Important notes
                      </h3>
                    </div>
                    <div class="space-y-3 px-3 py-3">
                      <Show when={importantNotes().length > 0}>
                        <ul class="list-disc space-y-2 pl-5 break-words text-sm leading-relaxed text-[#ddcfd3] [&_a]:break-words [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-[#f1e7e9]">
                          <For each={importantNotes()}>
                            {(note) => <li innerHTML={sanitizeTrustedFootnoteHtml(note)} />}
                          </For>
                        </ul>
                      </Show>
                      <Show when={hasAdditionalResource()}>
                        <a
                          href={car().wip_details?.extra_resource_url ?? ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          class={cn(
                            'group flex items-center justify-between gap-3 border border-[#5c4247] bg-[#21191d] px-3 py-2.5',
                            'text-[#eee2e5] transition-colors hover:bg-[#2a2024] cursor-pointer',
                          )}
                        >
                          <span class="min-w-0 truncate text-sm font-semibold leading-tight text-[#f1e7e9]">
                            Additional resource
                          </span>
                          <span class="h-3.5 w-3.5 shrink-0 text-[#efe3e6]" innerHTML={LinkIcon} />
                        </a>
                      </Show>
                    </div>
                  </section>
                </Show>

                <ResourceSection
                  resources={resources()}
                  isExpanded={isDetailExpanded('resources')}
                  onToggle={() => toggleDetail('resources')}
                />

                <Show when={car().wip_details}>
                  {(wipDetails) => (
                    <WipBranchTile
                      branchName={wipDetails().branch_name || 'N/A'}
                      branchDescription={wipDetails().branch_desc || 'No branch notes provided.'}
                      branchUrl={wipDetails().branch_url}
                      class="md:col-span-2"
                    />
                  )}
                </Show>

                <CompatibleHardwareTile
                  value={car().hardware_needed || 'N/A'}
                  isExpanded={isDetailExpanded('hardware')}
                  onToggle={() => toggleDetail('hardware')}
                />

                <section class="border-2 border-[#5c4247] bg-[#21191d] text-[#eee2e5] md:col-span-2">
                  <div class="border-b border-[#6a4d54] bg-[#2d2227] px-3 py-2">
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-[#c9bbbf]">
                      Minimum engage speed
                    </h3>
                  </div>
                  <div class="grid gap-2 p-3 min-[420px]:grid-cols-2">
                    <div class="border border-[#5f454c] bg-[#181316] px-3 py-2">
                      <p class="text-base font-semibold text-[#f1e7e9]">ALC: {car().no_alc_below}</p>
                      <p class="mt-1 text-xs text-[#c9bbbf]">Automated Lane Centering</p>
                    </div>
                    <div class="border border-[#5f454c] bg-[#181316] px-3 py-2">
                      <p class="text-base font-semibold text-[#f1e7e9]">ACC: {car().no_acc_below}</p>
                      <p class="mt-1 text-xs text-[#c9bbbf]">Adaptive Cruise Control</p>
                    </div>
                  </div>
                </section>

                <DetailTile label="ADAS package" value={car().supported_package || 'N/A'} />
                <UpstreamStatusTile yearsNotInUpstream={car().years_not_in_upstream} />

                <ExpandableDetailTile
                  label="ACC"
                  value={accValue()}
                  description={getACCDescription(accValue())}
                  isExpanded={isDetailExpanded('acc')}
                  onToggle={() => toggleDetail('acc')}
                />

                <ResumeTile
                  car={car()}
                  isExpanded={isDetailExpanded('resume')}
                  onToggle={() => toggleDetail('resume')}
                />

                <VideoLinksTile car={car()} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Show>
  )

  return (
    <ResponsiveModal
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={modalTitle()}
      subtitle={modalYear()}
      description="Detailed vehicle support information"
      desktopMaxHeight="850px"
    >
      <ModalContent />
    </ResponsiveModal>
  )
}

export default VehicleDetailsModal
