import { createContext, useContext, type ParentProps } from 'solid-js'
import { createSignal, type Accessor } from 'solid-js'

type ModelComparisonContextValue = {
  isCompareMode: Accessor<boolean>
  setIsCompareMode: (value: boolean) => void
  selectedCars: Accessor<string[]>
  toggleCarSelection: (carId: string) => void
  clearSelectedCars: () => void
}

const ModelComparisonContext = createContext<ModelComparisonContextValue>()

export const ModelComparisonProvider = (props: ParentProps) => {
  const [isInCompareMode, setIsInCompareMode] = createSignal(false)
  const [selectedCars, setSelectedCars] = createSignal<string[]>([])

  const setIsCompareMode = (enabled: boolean) => {
    setIsInCompareMode(enabled)
  }

  const toggleCarSelection = (carId: string) => {
    setSelectedCars((prev) => {
      if (prev.includes(carId)) {
        return prev.filter((id) => id !== carId)
      } else if (prev.length < 6) {
        return [...prev, carId]
      }
      return prev
    })
  }

  const clearSelectedCars = () => {
    setSelectedCars([])
  }

  return (
    <ModelComparisonContext.Provider
      value={{
        isCompareMode: isInCompareMode,
        setIsCompareMode,
        selectedCars,
        toggleCarSelection,
        clearSelectedCars,
      }}
    >
      {props.children}
    </ModelComparisonContext.Provider>
  )
}

export const useModelComparison = () => {
  const context = useContext(ModelComparisonContext)
  if (!context) {
    throw new Error('useModelComparison must be used within a ModelComparisonProvider')
  }
  return context
}

