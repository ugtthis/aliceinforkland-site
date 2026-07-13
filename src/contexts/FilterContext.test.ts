import { describe, expect, test } from 'bun:test'
import {
  compareCarsForSort,
  type SortField,
  type SortOrder,
} from './FilterContext'
import type { Car } from '~/types/CarDataTypes'

type SortableCar = Pick<Car, 'name' | SortField | 'year_list'>

const car = (name: string, years: string, yearList: number[]): SortableCar => ({
  name,
  make: name,
  source: name,
  years,
  year_list: yearList,
})

const sortCars = (cars: SortableCar[], field: SortField, order: SortOrder) =>
  [...cars]
    .sort((a, b) => compareCarsForSort(a, b, { field, order }))
    .map((item) => item.name)

describe('compareCarsForSort', () => {
  test('sorts ascending by oldest start year, then earliest end year', () => {
    const cars = [
      car('2025', '2025', [2025]),
      car('2024-25', '2024-25', [2024, 2025]),
      car('2020-25', '2020-25', [2020, 2021, 2022, 2023, 2024, 2025]),
      car('2024', '2024', [2024]),
      car('N/A', 'N/A', []),
    ]

    expect(sortCars(cars, 'years', 'ASC')).toEqual([
      '2020-25',
      '2024',
      '2024-25',
      '2025',
      'N/A',
    ])
  })

  test('sorts descending by newest end year, then latest start year', () => {
    const cars = [
      car('2020-25', '2020-25', [2020, 2021, 2022, 2023, 2024, 2025]),
      car('2024', '2024', [2024]),
      car('N/A', 'N/A', []),
      car('2024-25', '2024-25', [2024, 2025]),
      car('2025', '2025', [2025]),
    ]

    expect(sortCars(cars, 'years', 'DESC')).toEqual([
      '2025',
      '2024-25',
      '2020-25',
      '2024',
      'N/A',
    ])
  })

  test('applies descending order once for other fields', () => {
    const cars = [
      car('Alpha', '2024', [2024]),
      car('Charlie', '2025', [2025]),
      car('Bravo', '2023', [2023]),
    ]

    expect(sortCars(cars, 'make', 'DESC')).toEqual(['Charlie', 'Bravo', 'Alpha'])
  })
})
