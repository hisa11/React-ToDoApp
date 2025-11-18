import { useState } from 'react'
import type { AppSettings, Workspace } from '../types'
import { p2pSync } from '../utils/p2pSync'

type WorkspaceManagerProps = {
  settings: AppSettings
  setSettings: (settings: AppSettings) => void
  onWorkspaceChange: (workspaceId: string | null) => void
}

export default function WorkspaceManager({ settings, setSettings, onWorkspaceChange }: WorkspaceManagerProps) {
  const [workspaceName, setWorkspaceName] = useState('')
  const [connectPeerId, setConnectPeerId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      setError('ワークスペース名を入力してください')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      // P2P初期化（まだの場合）
      let peerId = settings.peerId
      if (!peerId || !p2pSync.getPeerId()) {
        peerId = await p2pSync.initialize()
        setSettings({
          ...settings,
          peerId,
        })
      }

      // ワークスペース作成
      const workspace: Workspace = {
        id: peerId!, // 自分のPeer IDをワークスペースIDとして使用
        name: workspaceName,
        createdAt: Date.now(),
        members: [peerId!],
      }

      setSettings({
        ...settings,
        workspaces: [...(settings.workspaces || []), workspace],
        currentWorkspace: workspace.id,
      })

      p2pSync.setCurrentWorkspace(workspace.id)
      onWorkspaceChange(workspace.id)
      setWorkspaceName('')
      alert(`✅ ワークスペース「${workspaceName}」を作成しました\nワークスペースID: ${workspace.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました')
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinWorkspace = async () => {
    if (!connectPeerId.trim()) {
      setError('接続先のワークスペースIDを入力してください')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      // P2P初期化（まだの場合）
      let peerId = settings.peerId
      if (!peerId || !p2pSync.getPeerId()) {
        peerId = await p2pSync.initialize()
        setSettings({
          ...settings,
          peerId,
        })
      }

      // ワークスペースに接続
      await p2pSync.connectToPeer(connectPeerId, connectPeerId)

      // ワークスペース情報を保存
      const workspace: Workspace = {
        id: connectPeerId,
        name: `Workspace ${connectPeerId.substring(0, 8)}`,
        createdAt: Date.now(),
        members: [peerId!, connectPeerId],
      }

      const existingWorkspace = settings.workspaces?.find((w) => w.id === connectPeerId)
      if (!existingWorkspace) {
        setSettings({
          ...settings,
          workspaces: [...(settings.workspaces || []), workspace],
          currentWorkspace: workspace.id,
          connectedPeers: [...settings.connectedPeers, connectPeerId],
        })
      } else {
        setSettings({
          ...settings,
          currentWorkspace: workspace.id,
          connectedPeers: [...settings.connectedPeers, connectPeerId],
        })
      }

      p2pSync.setCurrentWorkspace(connectPeerId)
      onWorkspaceChange(connectPeerId)
      setConnectPeerId('')
      alert(`✅ ワークスペースに参加しました: ${connectPeerId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '接続に失敗しました')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSwitchWorkspace = (workspaceId: string | null) => {
    setSettings({
      ...settings,
      currentWorkspace: workspaceId || undefined,
    })
    p2pSync.setCurrentWorkspace(workspaceId)
    onWorkspaceChange(workspaceId)
  }

  const handleLeaveWorkspace = (workspaceId: string) => {
    if (!confirm('このワークスペースから退出しますか？')) {
      return
    }

    const updatedWorkspaces = settings.workspaces?.filter((w) => w.id !== workspaceId) || []
    const newCurrentWorkspace = settings.currentWorkspace === workspaceId ? null : settings.currentWorkspace

    setSettings({
      ...settings,
      workspaces: updatedWorkspaces,
      currentWorkspace: newCurrentWorkspace || undefined,
      connectedPeers: settings.connectedPeers.filter((p) => p !== workspaceId),
    })

    if (settings.currentWorkspace === workspaceId) {
      p2pSync.setCurrentWorkspace(null)
      onWorkspaceChange(null)
    }
  }

  const currentWorkspace = settings.workspaces?.find((w) => w.id === settings.currentWorkspace)

  return (
    <div className="workspace-manager">
      <h3>🏢 ワークスペース管理</h3>

      <div className="current-workspace">
        <p>
          <strong>現在:</strong>{' '}
          {currentWorkspace ? (
            <>
              {currentWorkspace.name} <span className="workspace-id">({currentWorkspace.id.substring(0, 8)}...)</span>
            </>
          ) : (
            '個人用'
          )}
        </p>
      </div>

      <div className="workspace-list">
        <h4>ワークスペース一覧</h4>
        <div className="workspace-items">
          <div
            className={`workspace-item ${!settings.currentWorkspace ? 'active' : ''}`}
            onClick={() => handleSwitchWorkspace(null)}
          >
            <span>📝 個人用</span>
          </div>
          {settings.workspaces?.map((workspace) => (
            <div
              key={workspace.id}
              className={`workspace-item ${settings.currentWorkspace === workspace.id ? 'active' : ''}`}
            >
              <span onClick={() => handleSwitchWorkspace(workspace.id)}>
                🏢 {workspace.name}
              </span>
              <button className="btn-leave" onClick={() => handleLeaveWorkspace(workspace.id)}>
                退出
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="workspace-create">
        <h4>新規ワークスペース作成</h4>
        <input
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder="ワークスペース名"
          disabled={isCreating}
        />
        <button onClick={handleCreateWorkspace} disabled={isCreating || !workspaceName.trim()}>
          {isCreating ? '作成中...' : '作成'}
        </button>
      </div>

      <div className="workspace-join">
        <h4>ワークスペースに参加</h4>
        <input
          type="text"
          value={connectPeerId}
          onChange={(e) => setConnectPeerId(e.target.value)}
          placeholder="ワークスペースID"
          disabled={isCreating}
        />
        <button onClick={handleJoinWorkspace} disabled={isCreating || !connectPeerId.trim()}>
          {isCreating ? '接続中...' : '参加'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  )
}
