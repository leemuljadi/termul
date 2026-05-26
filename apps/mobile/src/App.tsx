import { StatusBar } from 'expo-status-bar'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import {
  Circle,
  Clock,
  FileText,
  Folder,
  GitBranch,
  Globe,
  Plus,
  Search,
  Send,
  Settings,
  Terminal
} from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { activity, projects, workspacePanes } from './data/demo-workspace'
import type { Project, WorkspacePane, WorkspaceSurface } from './types'

type AppTab = 'workspace' | 'activity' | 'settings'

type CommandLogEntry = {
  id: string
  line: string
}

const surfaceIcons: Record<WorkspaceSurface, typeof Terminal> = {
  terminal: Terminal,
  editor: FileText,
  browser: Globe
}

const quickCommands = ['bun run lint', 'bun run typecheck', 'bun run test']

export default function App(): React.JSX.Element {
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id ?? '')
  const [activeTab, setActiveTab] = useState<AppTab>('workspace')
  const [commandDraft, setCommandDraft] = useState('')
  const [commandLog, setCommandLog] = useState<CommandLogEntry[]>([
    { id: 'initial-typecheck', line: '$ bun run typecheck' },
    { id: 'initial-watch', line: 'Watching shared contracts and renderer types...' },
    { id: 'initial-ready', line: 'Ready for the next mobile command.' }
  ])

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId]
  )

  const runCommand = (command: string): void => {
    const nextCommand = command.trim()
    if (!nextCommand) return
    const commandId = Date.now().toString(36)

    setCommandLog((currentLog) => [
      ...currentLog.slice(-5),
      { id: `${commandId}-command`, line: `$ ${nextCommand}` },
      { id: `${commandId}-queued`, line: `Queued for ${activeProject.name}` }
    ])
    setCommandDraft('')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Termul Mobile</Text>
            <Text numberOfLines={1} style={styles.title}>
              {activeProject.name}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton accessibilityLabel="Search workspaces" icon={Search} />
            <IconButton accessibilityLabel="Add workspace" icon={Plus} />
          </View>
        </View>

        <View style={styles.tabBar}>
          <TabButton
            active={activeTab === 'workspace'}
            label="Workspace"
            onPress={() => setActiveTab('workspace')}
          />
          <TabButton
            active={activeTab === 'activity'}
            label="Activity"
            onPress={() => setActiveTab('activity')}
          />
          <TabButton
            active={activeTab === 'settings'}
            label="Settings"
            onPress={() => setActiveTab('settings')}
          />
        </View>

        {activeTab === 'workspace' && (
          <WorkspaceScreen
            activeProject={activeProject}
            activeProjectId={activeProjectId}
            commandDraft={commandDraft}
            commandLog={commandLog}
            onCommandDraftChange={setCommandDraft}
            onProjectPress={setActiveProjectId}
            onRunCommand={runCommand}
          />
        )}

        {activeTab === 'activity' && <ActivityScreen />}

        {activeTab === 'settings' && <SettingsScreen activeProject={activeProject} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function WorkspaceScreen({
  activeProject,
  activeProjectId,
  commandDraft,
  commandLog,
  onCommandDraftChange,
  onProjectPress,
  onRunCommand
}: {
  activeProject: Project
  activeProjectId: string
  commandDraft: string
  commandLog: CommandLogEntry[]
  onCommandDraftChange: (value: string) => void
  onProjectPress: (projectId: string) => void
  onRunCommand: (command: string) => void
}): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Projects</Text>
        <Text style={styles.sectionMeta}>{projects.length} workspaces</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroller}>
        {projects.map((project) => (
          <ProjectCard
            active={project.id === activeProjectId}
            key={project.id}
            onPress={() => onProjectPress(project.id)}
            project={project}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Workspace</Text>
        <Text style={styles.sectionMeta}>{activeProject.branch}</Text>
      </View>

      {workspacePanes.map((pane) => (
        <PaneCard key={pane.id} pane={pane} />
      ))}

      <View style={styles.terminalCard}>
        <View style={styles.terminalHeader}>
          <View style={styles.terminalTitleRow}>
            <Terminal color="#9BE7D7" size={18} />
            <Text style={styles.terminalTitle}>Command Queue</Text>
          </View>
          <Text style={styles.terminalMeta}>{activeProject.terminalCount} sessions</Text>
        </View>

        <View style={styles.commandLog}>
          {commandLog.map((entry) => (
            <Text key={entry.id} style={styles.commandLine}>
              {entry.line}
            </Text>
          ))}
        </View>

        <View style={styles.quickCommandRow}>
          {quickCommands.map((command) => (
            <Pressable
              key={command}
              onPress={() => onRunCommand(command)}
              style={styles.quickCommandButton}
            >
              <Text style={styles.quickCommandText}>{command.replace('bun run ', '')}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.commandComposer}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onCommandDraftChange}
            onSubmitEditing={() => onRunCommand(commandDraft)}
            placeholder="Run command"
            placeholderTextColor="#6F7A87"
            returnKeyType="send"
            style={styles.commandInput}
            value={commandDraft}
          />
          <Pressable
            accessibilityLabel="Send command"
            onPress={() => onRunCommand(commandDraft)}
            style={styles.sendButton}
          >
            <Send color="#08110F" size={18} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

function ProjectCard({
  active,
  onPress,
  project
}: {
  active: boolean
  onPress: () => void
  project: Project
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={[styles.projectCard, active && styles.projectCardActive]}>
      <View style={[styles.projectAccent, { backgroundColor: project.accent }]} />
      <View style={styles.projectTitleRow}>
        <Folder color="#DDE5E1" size={18} />
        <Text numberOfLines={1} style={styles.projectName}>
          {project.name}
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.projectPath}>
        {project.path}
      </Text>
      <View style={styles.projectFooter}>
        <View style={styles.gitRow}>
          <GitBranch color="#95A19B" size={14} />
          <Text numberOfLines={1} style={styles.gitText}>
            {project.branch}
          </Text>
        </View>
        <View style={[styles.statusPill, project.status === 'dirty' && styles.statusPillDirty]}>
          <Text style={styles.statusText}>{project.status}</Text>
        </View>
      </View>
    </Pressable>
  )
}

function PaneCard({ pane }: { pane: WorkspacePane }): React.JSX.Element {
  const SurfaceIcon = surfaceIcons[pane.surface]

  return (
    <View style={styles.paneCard}>
      <View style={styles.paneIcon}>
        <SurfaceIcon color="#0F1715" size={19} />
      </View>
      <View style={styles.paneBody}>
        <View style={styles.paneTitleRow}>
          <Text style={styles.paneTitle}>{pane.title}</Text>
          <Text style={styles.paneMeta}>{pane.meta}</Text>
        </View>
        <Text style={styles.paneDetail}>{pane.detail}</Text>
      </View>
    </View>
  )
}

function ActivityScreen(): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <Text style={styles.sectionMeta}>Synced locally</Text>
      </View>

      {activity.map((item) => (
        <View key={item.id} style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Clock color="#9BE7D7" size={17} />
          </View>
          <View style={styles.activityBody}>
            <View style={styles.activityTitleRow}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
            <Text style={styles.activityDescription}>{item.description}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

function SettingsScreen({ activeProject }: { activeProject: Project }): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Text style={styles.sectionMeta}>{activeProject.name}</Text>
      </View>

      <SettingRow
        detail="Prepare remote terminal pairing for mobile sessions."
        enabled
        title="Remote bridge"
      />
      <SettingRow
        detail="Keep workspace snapshots available while offline."
        enabled
        title="Offline snapshots"
      />
      <SettingRow
        detail="Show file, browser, and command activity in one feed."
        enabled={false}
        title="Unified activity"
      />
    </ScrollView>
  )
}

function SettingRow({
  detail,
  enabled,
  title
}: {
  detail: string
  enabled: boolean
  title: string
}): React.JSX.Element {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Settings color="#C9D5CF" size={18} />
      </View>
      <View style={styles.settingBody}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDetail}>{detail}</Text>
      </View>
      <View style={[styles.toggle, enabled && styles.toggleEnabled]}>
        <Circle
          color={enabled ? '#08110F' : '#7D8882'}
          fill={enabled ? '#08110F' : 'transparent'}
          size={14}
        />
      </View>
    </View>
  )
}

function TabButton({
  active,
  label,
  onPress
}: {
  active: boolean
  label: string
  onPress: () => void
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  )
}

function IconButton({
  accessibilityLabel,
  icon: Icon
}: {
  accessibilityLabel: string
  icon: typeof Search
}): React.JSX.Element {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} style={styles.iconButton}>
      <Icon color="#DCE6E1" size={19} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#07100E',
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12
  },
  eyebrow: {
    color: '#8CA39A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase'
  },
  title: {
    color: '#F1F7F4',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0,
    maxWidth: 240
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#12201C',
    borderColor: '#22332E',
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  tabBar: {
    backgroundColor: '#101B18',
    borderColor: '#1E2D28',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 4
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 8
  },
  tabButtonActive: {
    backgroundColor: '#D8F8EF'
  },
  tabButtonText: {
    color: '#A4B1AC',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0
  },
  tabButtonTextActive: {
    color: '#07100E'
  },
  content: {
    paddingBottom: 34,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sectionTitle: {
    color: '#F1F7F4',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0
  },
  sectionMeta: {
    color: '#8CA39A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0
  },
  projectScroller: {
    marginHorizontal: -20,
    marginBottom: 22,
    paddingLeft: 20
  },
  projectCard: {
    backgroundColor: '#111B18',
    borderColor: '#1E2D28',
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    minHeight: 154,
    overflow: 'hidden',
    padding: 14,
    width: 238
  },
  projectCardActive: {
    borderColor: '#9BE7D7'
  },
  projectAccent: {
    borderRadius: 999,
    height: 4,
    marginBottom: 14,
    width: 48
  },
  projectTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  projectName: {
    color: '#F1F7F4',
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0
  },
  projectPath: {
    color: '#88958F',
    fontSize: 12,
    letterSpacing: 0,
    marginTop: 8
  },
  projectFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  gitRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    marginRight: 8
  },
  gitText: {
    color: '#95A19B',
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0
  },
  statusPill: {
    backgroundColor: '#172A24',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusPillDirty: {
    backgroundColor: '#43351D'
  },
  statusText: {
    color: '#D9E6E0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0
  },
  paneCard: {
    alignItems: 'center',
    backgroundColor: '#101B18',
    borderColor: '#1E2D28',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    minHeight: 82,
    padding: 12
  },
  paneIcon: {
    alignItems: 'center',
    backgroundColor: '#C9F4EA',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  paneBody: {
    flex: 1
  },
  paneTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  paneTitle: {
    color: '#F1F7F4',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0
  },
  paneMeta: {
    color: '#8CA39A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0
  },
  paneDetail: {
    color: '#A4B1AC',
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 17,
    marginTop: 5
  },
  terminalCard: {
    backgroundColor: '#0B1412',
    borderColor: '#20332D',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 14
  },
  terminalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  terminalTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  terminalTitle: {
    color: '#F1F7F4',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0
  },
  terminalMeta: {
    color: '#8CA39A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0
  },
  commandLog: {
    backgroundColor: '#050908',
    borderColor: '#18231F',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    minHeight: 126,
    padding: 12
  },
  commandLine: {
    color: '#B9CAC3',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 18
  },
  quickCommandRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  quickCommandButton: {
    backgroundColor: '#12201C',
    borderColor: '#243B34',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  quickCommandText: {
    color: '#D9E6E0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center'
  },
  commandComposer: {
    alignItems: 'center',
    backgroundColor: '#101B18',
    borderColor: '#22332E',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 6
  },
  commandInput: {
    color: '#F1F7F4',
    flex: 1,
    fontSize: 14,
    letterSpacing: 0,
    minHeight: 38,
    paddingHorizontal: 10
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#9BE7D7',
    borderRadius: 7,
    height: 38,
    justifyContent: 'center',
    width: 42
  },
  activityCard: {
    backgroundColor: '#101B18',
    borderColor: '#1E2D28',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 12
  },
  activityIcon: {
    alignItems: 'center',
    backgroundColor: '#172A24',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38
  },
  activityBody: {
    flex: 1
  },
  activityTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  activityTitle: {
    color: '#F1F7F4',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0
  },
  activityTime: {
    color: '#8CA39A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0
  },
  activityDescription: {
    color: '#A4B1AC',
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 17,
    marginTop: 5
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: '#101B18',
    borderColor: '#1E2D28',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    minHeight: 78,
    padding: 12
  },
  settingIcon: {
    alignItems: 'center',
    backgroundColor: '#172A24',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38
  },
  settingBody: {
    flex: 1
  },
  settingTitle: {
    color: '#F1F7F4',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0
  },
  settingDetail: {
    color: '#A4B1AC',
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 17,
    marginTop: 4
  },
  toggle: {
    alignItems: 'center',
    backgroundColor: '#17211E',
    borderColor: '#31423C',
    borderRadius: 999,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 44
  },
  toggleEnabled: {
    backgroundColor: '#9BE7D7',
    borderColor: '#9BE7D7'
  }
})
