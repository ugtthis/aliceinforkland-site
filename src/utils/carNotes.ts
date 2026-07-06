import { footnoteDefinitionsBySource } from '~/data/cars'
import type { Car } from '~/types/CarDataTypes'

type CarNotesInput = Pick<Car, 'footnotes' | 'source' | 'wip_details'>

const cleanNotes = (notes: string[] | null | undefined): string[] =>
  (notes ?? []).map((note) => note.trim()).filter((note) => note.length > 0)

export function getResolvedFootnoteNotes(car: Pick<Car, 'footnotes' | 'source'>): string[] {
  const footnoteDefinitions = footnoteDefinitionsBySource[(car.source ?? '').trim()] ?? {}
  const seen = new Set<string>()
  const resolvedNotes: string[] = []

  for (const entries of Object.values(car.footnotes ?? {})) {
    for (const entry of entries) {
      const key = String(entry).trim()
      if (!key || seen.has(key)) continue
      seen.add(key)

      const resolved = footnoteDefinitions[key]?.trim()
      if (resolved) resolvedNotes.push(resolved)
    }
  }

  return resolvedNotes
}

export function getImportantNotes(car: CarNotesInput): string[] {
  const wipNotes = cleanNotes(car.wip_details?.important_notes)
  return wipNotes.length > 0 ? wipNotes : getResolvedFootnoteNotes(car)
}
