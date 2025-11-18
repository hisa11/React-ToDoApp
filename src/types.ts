export type Todo = {
  id: number
  text: string
  isCompleted: boolean
  dueDate: string
  description: string
  priority: number
  // 新機能用フィールド
  estimatedTime?: number // 所要時間（分単位）
  tags: string[] // タグ
  attachedFiles: AttachedFile[] // 添付ファイル
  relatedLinks: string[] // 関連リンク
  dependencies: number[] // 依存するタスクのID
  libraries: string[] // 使用ライブラリ・技術スタック
  progress: number // 進捗状況（0-100%）
  reminders: ReminderSetting[] // 複数のリマインダー設定
  notes: string // ノート（詳細なメモ）
  createdAt: number // 作成日時
  updatedAt: number // 更新日時
  workspaceId?: string // ワークスペースID（個人用はundefined）
}

export type AttachedFile = {
  id: string
  name: string
  size: number
  type: string
  data: string // Base64エンコードされたファイルデータ
  uploadedAt: number
}

export type ReminderSetting = {
  id: string
  enabled: boolean
  datetime: string // ISO 8601形式の日時（例: "2025-11-17T15:30"）
  notified: boolean // 通知済みかどうか
  message?: string // カスタムメッセージ
}

export type Workspace = {
  id: string // ワークスペースID（Peer IDと同じ）
  name: string
  createdAt: number
  members: string[] // 接続中のメンバーのPeer ID
}

export type AppSettings = {
  geminiApiKey?: string
  peerId?: string // 自分のPeer ID
  connectedPeers: string[] // 接続中のPeer ID
  theme: 'light' | 'dark'
  notificationsEnabled: boolean
  currentWorkspace?: string // 現在アクティブなワークスペースID
  workspaces: Workspace[] // ワークスペース一覧
}

export type SyncMessage = {
  type: 'sync' | 'update' | 'delete' | 'request' | 'workspace-sync'
  todos?: Todo[]
  todoId?: number
  timestamp: number
  workspaceId?: string
}