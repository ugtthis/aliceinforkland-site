import { describe, expect, test } from 'bun:test'
import { compareCarsByYearRange, type SortOrder } from './FilterContext'
import type { Car } from '~/types/CarDataTypes'

type YearSortCar = Pick<Car, 'name' | 'years' | 'year_list'>

const car = (name: string, years: string, yearList: number[]): YearSortCar => ({
  name,
  years,
  year_list: yearList,
})

const sortByYearRange = (cars: YearSortCar[], order: SortOrder) =>
  [...cars].sort((a, b) => compareCarsByYearRange(a, b, order)).map((item) => item.name)

describe('compareCarsByYearRange', () => {
  test('sorts ascending by oldest start year, then earliest end year', () => {
    const cars = [
      car('2025', '2025', [2025]),
      car('2024-25', '2024-25', [2024, 2025]),
      car('2020-25', '2020-25', [2020, 2021, 2022, 2023, 2024, 2025]),
      car('2024', '2024', [2024]),
      car('N/A', 'N/A', []),
    ]

    expect(sortByYearRange(cars, 'ASC')).toEqual([
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

    expect(sortByYearRange(cars, 'DESC')).toEqual([
      '2025',
      '2024-25',
      '2020-25',
      '2024',
      'N/A',
    ])
  })

})
