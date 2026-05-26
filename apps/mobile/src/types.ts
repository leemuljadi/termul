export type WorkspaceSurface = 'terminal' | 'editor' | 'browser'

export type Project = {
  id: string
  name: string
  path: string
  branch: string
  status: 'clean' | 'dirty'
  accent: string
  terminalCount: number
  lastCommand: string
}

export type WorkspacePane = {
  id: string
  title: string
  surface: WorkspaceSurface
  detail: string
  meta: string
}

export type ActivityItem = {
  id: string
  title: string
  description: string
  time: string
}
