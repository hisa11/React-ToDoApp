import Peer from 'peerjs'
import type { DataConnection } from 'peerjs'
import type { Todo, SyncMessage } from '../types'

export class P2PSync {
  private peer: Peer | null = null
  private connections: Map<string, DataConnection> = new Map()
  private onTodosUpdate: ((todos: Todo[]) => void) | null = null

  initialize(peerId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // PeerJSの公式クラウドサーバーを使用（より安定）
        const options = {
          debug: 2, // デバッグレベル（開発時のみ）
        }
        
        // カスタムIDがある場合は使用、ない場合は自動生成
        this.peer = peerId ? new Peer(peerId, options) : new Peer(options)

        this.peer.on('open', (id) => {
          console.log('✅ P2P接続成功! Peer ID:', id)
          resolve(id)
        })

        this.peer.on('error', (error) => {
          console.error('❌ Peer error:', error)
          let errorMessage = 'P2P接続エラーが発生しました'
          
          // エラータイプに応じたメッセージ
          if (error.type === 'unavailable-id') {
            errorMessage = 'このIDは既に使用されています。別のIDを試してください'
          } else if (error.type === 'peer-unavailable') {
            errorMessage = '接続先のPeerが見つかりません'
          } else if (error.type === 'network') {
            errorMessage = 'ネットワークエラー。インターネット接続を確認してください'
          } else if (error.type === 'server-error') {
            errorMessage = 'サーバーエラー。しばらく待ってから再試行してください'
          } else {
            errorMessage = `${error.type}: ${error.message}`
          }
          
          reject(new Error(errorMessage))
        })

        this.peer.on('connection', (conn) => {
          console.log('🔗 新しい接続:', conn.peer)
          this.setupConnection(conn)
        })

        this.peer.on('disconnected', () => {
          console.warn('⚠️ サーバーから切断されました。再接続を試みます...')
          // 自動再接続
          if (this.peer && !this.peer.destroyed) {
            this.peer.reconnect()
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  connectToPeer(remotePeerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error('Peerが初期化されていません。先に「P2P接続を開始」してください'))
        return
      }

      if (!this.peer.id) {
        reject(new Error('Peer IDが取得できていません。再度初期化してください'))
        return
      }

      console.log('🔗 接続を試みています:', remotePeerId)
      const conn = this.peer.connect(remotePeerId, {
        reliable: true, // 信頼性の高い接続を使用
      })
      
      conn.on('open', () => {
        console.log('✅ 接続成功:', remotePeerId)
        this.setupConnection(conn)
        resolve()
      })

      conn.on('error', (error) => {
        console.error('❌ 接続エラー:', error)
        reject(new Error(`接続に失敗しました: ${error.message || '不明なエラー'}`))
      })

      // タイムアウト処理（30秒）
      setTimeout(() => {
        if (!conn.open) {
          conn.close()
          reject(new Error('接続タイムアウト: 相手が応答しません'))
        }
      }, 30000)
    })
  }

  private setupConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn)
    console.log('📝 接続を設定:', conn.peer)

    conn.on('data', (data) => {
      console.log('📨 データ受信:', data)
      this.handleIncomingMessage(data as SyncMessage)
    })

    conn.on('close', () => {
      console.log('🔌 接続が切断されました:', conn.peer)
      this.connections.delete(conn.peer)
    })

    conn.on('error', (error) => {
      console.error('⚠️ 接続エラー:', conn.peer, error)
      this.connections.delete(conn.peer)
    })
  }

  private handleIncomingMessage(message: SyncMessage) {
    if (!this.onTodosUpdate) return

    switch (message.type) {
      case 'sync':
        if (message.todos) {
          // 受信したToDosをマージ
          this.onTodosUpdate(message.todos)
        }
        break
      case 'update':
        // 個別のToDo更新処理
        if (message.todos && message.todos.length > 0) {
          this.onTodosUpdate(message.todos)
        }
        break
      case 'request':
        // ToDoリストの要求があった場合、現在のリストを送信
        this.broadcastTodos([])
        break
    }
  }

  broadcastTodos(todos: Todo[]) {
    const message: SyncMessage = {
      type: 'sync',
      todos,
      timestamp: Date.now(),
    }

    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message)
      }
    })
  }

  setTodosUpdateHandler(handler: (todos: Todo[]) => void) {
    this.onTodosUpdate = handler
  }

  disconnect() {
    this.connections.forEach((conn) => {
      conn.close()
    })
    this.connections.clear()

    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
  }

  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys())
  }

  isConnected(): boolean {
    return this.connections.size > 0
  }
}

export const p2pSync = new P2PSync()
