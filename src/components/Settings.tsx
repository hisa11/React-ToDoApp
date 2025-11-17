import { useState, useEffect } from 'react'
import type { AppSettings } from '../types'
import { geminiService } from '../utils/geminiApi'
import { p2pSync } from '../utils/p2pSync'
import { notificationService } from '../utils/notifications'

type SettingsProps = {
  onClose: () => void
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
}

const Settings = ({ onClose, settings: initialSettings, onSettingsChange }: SettingsProps) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings)

  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '')
  const [customPeerId, setCustomPeerId] = useState('')
  const [peerIdInput, setPeerIdInput] = useState('')
  const [myPeerId, setMyPeerId] = useState(settings.peerId || '')
  const [connectionStatus, setConnectionStatus] = useState('')

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    onSettingsChange(settings)
  }, [settings, onSettingsChange])

  const handleSaveApiKey = () => {
    try {
      geminiService.initialize(apiKey)
      setSettings({ ...settings, geminiApiKey: apiKey })
      alert('Gemini APIキーを保存しました')
    } catch (error) {
      alert('APIキーの保存に失敗しました: ' + (error as Error).message)
    }
  }

  const handleInitializeP2P = async () => {
    try {
      setConnectionStatus('初期化中...')
      // カスタムIDが入力されていればそれを使用、なければ自動生成
      const id = await p2pSync.initialize(customPeerId.trim() || settings.peerId)
      setMyPeerId(id)
      setSettings({ ...settings, peerId: id })
      setCustomPeerId('') // 入力欄をクリア
      setConnectionStatus('')
      alert('✅ P2P接続を初期化しました！\n\nあなたのPeer ID:\n' + id + '\n\nこのIDをチームメンバーに共有してください。')
    } catch (error) {
      const errorMsg = (error as Error).message
      setConnectionStatus('初期化失敗')
      alert('❌ P2P初期化に失敗しました\n\n' + errorMsg + '\n\n💡 ヒント:\n- カスタムIDは英数字とハイフンのみ使用可\n- 既に使用されているIDは使えません\n- インターネット接続を確認してください')
      console.error('P2P初期化エラー:', error)
    }
  }

  const handleConnectToPeer = async () => {
    if (!peerIdInput.trim()) {
      alert('接続先のPeer IDを入力してください')
      return
    }

    if (!myPeerId) {
      alert('先に「P2P接続を開始」ボタンで初期化してください')
      return
    }

    try {
      setConnectionStatus('接続中...')
      await p2pSync.connectToPeer(peerIdInput.trim())
      const connectedPeers = p2pSync.getConnectedPeers()
      setSettings({ ...settings, connectedPeers })
      setConnectionStatus('✅ 接続成功！')
      setPeerIdInput('')
      setTimeout(() => setConnectionStatus(''), 5000)
    } catch (error) {
      const errorMsg = (error as Error).message
      setConnectionStatus('❌ 接続失敗')
      alert('接続に失敗しました\n\n' + errorMsg + '\n\n💡 確認事項:\n- 相手のPeer IDが正しいか\n- 相手も「P2P接続を開始」しているか\n- お互いにインターネット接続があるか')
      console.error('接続エラー:', error)
      setTimeout(() => setConnectionStatus(''), 5000)
    }
  }

  const handleRequestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission()
    if (granted) {
      setSettings({ ...settings, notificationsEnabled: true })
      alert('通知の許可が得られました')
    } else {
      alert('通知の許可が得られませんでした')
    }
  }

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    setSettings({ ...settings, theme: newTheme })
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ 設定</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="settings-content">
          {/* Gemini API設定 */}
          <section className="settings-section">
            <h3>🤖 Gemini API設定</h3>
            <p className="settings-description">
              タスクのテキスト修正やタグ提案機能を使用するには、Google Gemini APIキーが必要です。
            </p>
            <div className="input-group">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Gemini APIキーを入力"
                className="settings-input"
              />
              <button onClick={handleSaveApiKey} className="btn-primary">
                保存
              </button>
            </div>
            {settings.geminiApiKey && (
              <p className="success-message">✓ APIキーが設定されています</p>
            )}
          </section>

          {/* P2P共有設定 */}
          <section className="settings-section">
            <h3>🔗 LAN内共有（P2P）設定</h3>
            <p className="settings-description">
              チームメンバーとリアルタイムでToDoを共有できます。
            </p>
            
            <div className="form-group">
              <label>カスタムPeer ID（オプション）</label>
              <p className="settings-description">
                空欄の場合、自動的にランダムなIDが生成されます
              </p>
              <input
                type="text"
                value={customPeerId}
                onChange={(e) => setCustomPeerId(e.target.value)}
                placeholder="例: my-unique-id（空欄でも可）"
                className="settings-input"
              />
            </div>

            <div className="input-group">
              <button onClick={handleInitializeP2P} className="btn-secondary">
                P2P接続を開始
              </button>
            </div>
            
            {myPeerId && (
              <div className="peer-info">
                <p><strong>あなたのPeer ID:</strong></p>
                <code className="peer-id">{myPeerId}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(myPeerId)}
                  className="btn-copy"
                >
                  📋 コピー
                </button>
              </div>
            )}

            <div className="form-group connection-group">
              <label>チームメンバーと接続</label>
              <div className="input-group">
                <input
                  type="text"
                  value={peerIdInput}
                  onChange={(e) => setPeerIdInput(e.target.value)}
                  placeholder="接続先のPeer IDを入力"
                  className="settings-input"
                />
                <button onClick={handleConnectToPeer} className="btn-primary">
                  接続
                </button>
              </div>
            </div>

            {connectionStatus && (
              <p className="status-message">{connectionStatus}</p>
            )}

            {settings.connectedPeers.length > 0 && (
              <div className="connected-peers">
                <p><strong>接続中:</strong></p>
                <ul>
                  {settings.connectedPeers.map((peerId) => (
                    <li key={peerId}>{peerId}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* 通知設定 */}
          <section className="settings-section">
            <h3>🔔 通知設定</h3>
            <div className="input-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                />
                通知を有効にする
              </label>
            </div>
            {!settings.notificationsEnabled && (
              <button onClick={handleRequestNotificationPermission} className="btn-secondary">
                通知の許可を要求
              </button>
            )}
          </section>

          {/* テーマ設定 */}
          <section className="settings-section">
            <h3>🎨 テーマ</h3>
            <div className="input-group">
              <button onClick={handleThemeToggle} className="btn-secondary">
                {settings.theme === 'light' ? '🌙 ダークモード' : '☀️ ライトモード'}に切り替え
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Settings
