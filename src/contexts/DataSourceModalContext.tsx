import { createSignal } from 'solid-js'

const [isOpen, setIsOpen] = createSignal(false)
const [dataSource, setDataSource] = createSignal<string | undefined>(undefined)

export const openDataSourceModal = (value: string) => {
  setDataSource(value)
  setIsOpen(true)
}

export const closeDataSourceModal = () => {
  setIsOpen(false)
  setDataSource(undefined)
}

export const dataSourceModalState = {
  isOpen,
  dataSource,
}

