import rawDataSourceContent from './data-source-descriptions.json'

type DataSourceResource = {
  label: string
  url: string
}

export type DataSourceContent = {
  summary: string
  resources: DataSourceResource[]
}

export const DATA_SOURCE_CONTENT = rawDataSourceContent as Record<string, DataSourceContent>
