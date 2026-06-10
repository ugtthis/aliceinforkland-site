import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense, Show } from 'solid-js'
import { isServer } from 'solid-js/web'
import { FilterProvider } from '~/contexts/FilterContext'
import { ModelComparisonProvider } from '~/contexts/ModelComparisonContext'
import DataSourceInfoModal from '~/components/DataSourceInfoModal'
import { dataSourceModalState, closeDataSourceModal } from '~/contexts/DataSourceModalContext'
import '~/app.css'

export default function App() {
  return (
    <Router
      root={(props) => (
        <FilterProvider>
          <ModelComparisonProvider>
            <Suspense>{props.children}</Suspense>

            <Show when={!isServer}>
              <DataSourceInfoModal
                open={dataSourceModalState.isOpen()}
                onOpenChange={(open) => !open && closeDataSourceModal()}
                initialDataSource={dataSourceModalState.dataSource()}
              />
            </Show>
          </ModelComparisonProvider>
        </FilterProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
