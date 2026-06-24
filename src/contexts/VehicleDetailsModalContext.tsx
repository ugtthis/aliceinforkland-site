import { createSignal } from 'solid-js'

import type { Car } from '~/types/CarDataTypes'

const [isOpen, setIsOpen] = createSignal(false)
const [car, setCar] = createSignal<Car | undefined>(undefined)

export const openVehicleDetailsModal = (value: Car) => {
  setCar(value)
  setIsOpen(true)
}

export const closeVehicleDetailsModal = () => {
  setIsOpen(false)
}

export const vehicleDetailsModalState = {
  isOpen,
  car,
}
