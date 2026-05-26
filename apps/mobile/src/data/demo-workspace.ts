import type { ActivityItem, Project, WorkspacePane } from '../types'

export const projects: Project[] = [
  {
    id: 'termul',
    name: 'Termul Manager',
    path: '~/Desktop/Project/termul',
    branch: 'chore/migrate-to-bun',
    status: 'dirty',
    accent: '#39B59F',
    terminalCount: 3,
    lastCommand: 'bun run typecheck'
  },
  {
    id: 'docs',
    name: 'Docs Workspace',
    path: '~/Desktop/Project/termul/docs',
    branch: 'dev',
    status: 'clean',
    accent: '#5B7CFA',
    terminalCount: 1,
    lastCommand: 'bun run lint'
  },
  {
    id: 'mobile',
    name: 'Mobile Prototype',
    path: '~/Desktop/Project/termul/apps/mobile',
    branch: 'dev',
    status: 'clean',
    accent: '#F3A712',
    terminalCount: 2,
    lastCommand: 'expo start'
  }
]

export const workspacePanes: WorkspacePane[] = [
  {
    id: 'terminal-main',
    title: 'Terminal',
    surface: 'terminal',
    detail: 'Interactive command queue for mobile companion sessions',
    meta: 'zsh - 3 panes'
  },
  {
    id: 'editor-notes',
    title: 'Editor',
    surface: 'editor',
    detail: 'README.md, project-context.md, and migration notes',
    meta: '3 open files'
  },
  {
    id: 'browser-review',
    title: 'Browser',
    surface: 'browser',
    detail: 'Review tab with annotation export checklist',
    meta: '2 captures'
  }
]

export const activity: ActivityItem[] = [
  {
    id: 'snapshot',
    title: 'Snapshot saved',
    description: 'Workspace layout and active project state captured.',
    time: '2m ago'
  },
  {
    id: 'command',
    title: 'Command completed',
    description: 'bun run typecheck finished for Termul Manager.',
    time: '9m ago'
  },
  {
    id: 'annotation',
    title: 'Annotation exported',
    description: 'Browser notes packaged with severity and intent labels.',
    time: '18m ago'
  }
]
