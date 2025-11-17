import { useState, useEffect } from 'react'
import './App.css'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'
import Settings from './components/Settings'
import type { Todo, AppSettings } from './types'
import { geminiService } from './utils/geminiApi'
import { p2pSync } from './utils/p2pSync'
import { notificationService } from './utils/notifications'
import { TodoCLI } from './utils/cli'

function App() {
  // localStorage から設定を読み込む
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      const parsed = JSON.parse(saved)
      // テーマを適用
      document.documentElement.setAttribute('data-theme', parsed.theme || 'dark')
      return parsed
    }
    document.documentElement.setAttribute('data-theme', 'dark')
    return {
      theme: 'dark',
      notificationsEnabled: true,
      connectedPeers: []
    }
  })

  // localStorage から初期データを読み込む
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      return JSON.parse(savedTodos)
    }
    return []
  })

  const [showSettings, setShowSettings] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt')

  // todos state が変更されたら localStorage に保存する
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
    
    // P2P同期
    if (p2pSync.isConnected()) {
      p2pSync.broadcastTodos(todos)
    }
  }, [todos])

  // 設定が変更されたら localStorage に保存する
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }, [settings])

  // アプリ初期化
  useEffect(() => {
    // Gemini API初期化
    if (settings.geminiApiKey) {
      try {
        geminiService.initialize(settings.geminiApiKey)
      } catch (error) {
        console.error('Gemini API初期化エラー:', error)
      }
    }

    // 通知許可リクエスト
    if (settings.notificationsEnabled) {
      notificationService.requestPermission()
    }

    // P2P同期ハンドラー設定
    p2pSync.setTodosUpdateHandler((receivedTodos) => {
      setTodos((currentTodos) => {
        // 受信したToDosと現在のToDosをマージ（より新しいものを優先）
        const merged = [...currentTodos]
        receivedTodos.forEach((receivedTodo) => {
          const existingIndex = merged.findIndex((t) => t.id === receivedTodo.id)
          if (existingIndex >= 0) {
            // 既存のToDoがある場合、更新日時が新しい方を採用
            if (receivedTodo.updatedAt > merged[existingIndex].updatedAt) {
              merged[existingIndex] = receivedTodo
            }
          } else {
            // 新しいToDoを追加
            merged.push(receivedTodo)
          }
        })
        return merged
      })
    })

    // リマインダーチェック（1分ごと）
    const reminderInterval = setInterval(() => {
      if (settings.notificationsEnabled) {
        notificationService.checkReminders(todos, setTodos)
      }
    }, 60000)

    return () => {
      clearInterval(reminderInterval)
    }
  }, [settings, todos])

  // CLI をグローバルに公開
  useEffect(() => {
    const cli = new TodoCLI(
      () => todos,
      setTodos,
      () => settings,
      setSettings
    )
    
    window.todo = cli
    
    console.log(`
🚀 ToDo CLI が利用可能になりました！
コンソールで "todo.help()" を実行してヘルプを表示
    `)
    
    return () => {
      delete window.todo
    }
  }, [todos, settings])

  // タスク保存処理
  const handleSaveTodo = (todo: Todo) => {
    if (editingTodo) {
      // 更新
      setTodos(todos.map((t) => (t.id === todo.id ? todo : t)))
    } else {
      // 新規追加
      setTodos([...todos, todo])
    }
    setShowForm(false)
    setEditingTodo(null)
  }

  // タスク削除処理
  const handleDelete = (idToDelete: number) => {
    if (confirm('このタスクを削除しますか？')) {
      setTodos(todos.filter((todo) => todo.id !== idToDelete))
    }
  }

  // タスク完了・未完了トグル処理
  const handleToggleComplete = (idToToggle: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === idToToggle) {
          return { ...todo, isCompleted: !todo.isCompleted, updatedAt: Date.now() }
        }
        return todo
      })
    )
  }

  // タスク編集
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setShowForm(true)
  }

  // フィルタリングとソート
  const getFilteredAndSortedTodos = () => {
    let filtered = todos

    // フィルター適用
    if (filter === 'active') {
      filtered = filtered.filter((t) => !t.isCompleted)
    } else if (filter === 'completed') {
      filtered = filtered.filter((t) => t.isCompleted)
    }

    // 検索適用
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.text.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          t.libraries.some((lib) => lib.toLowerCase().includes(query))
      )
    }

    // ソート適用
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      } else if (sortBy === 'priority') {
        return b.priority - a.priority
      } else {
        return b.createdAt - a.createdAt
      }
    })

    return sorted
  }

  const filteredTodos = getFilteredAndSortedTodos()

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚀 Engineer's ToDo</h1>
        <div className="header-actions">
          <button onClick={() => setShowSettings(true)} className="btn-icon" title="設定">
            ⚙️
          </button>
          {p2pSync.isConnected() && (
            <span className="sync-indicator" title="P2P接続中">
              🔗 {p2pSync.getConnectedPeers().length}
            </span>
          )}
        </div>
      </header>

      <div className="main-content">
        <div className="toolbar">
          <button
            onClick={() => {
              setEditingTodo(null)
              setShowForm(true)
            }}
            className="btn-primary btn-add"
          >
            ➕ 新しいタスク
          </button>

          <div className="search-bar">
            <label htmlFor="search-input" className="visually-hidden">タスクを検索</label>
            <input
              id="search-input"
              name="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 検索..."
              className="search-input"
              aria-label="タスクを検索"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              すべて ({todos.length})
            </button>
            <button
              className={filter === 'active' ? 'active' : ''}
              onClick={() => setFilter('active')}
            >
              未完了 ({todos.filter((t) => !t.isCompleted).length})
            </button>
            <button
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => setFilter('completed')}
            >
              完了 ({todos.filter((t) => t.isCompleted).length})
            </button>
          </div>

          <div className="sort-selector">
            <label htmlFor="sort-select">並び替え:</label>
            <select 
              id="sort-select"
              name="sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="タスクの並び替え"
            >
              <option value="createdAt">作成日</option>
              <option value="dueDate">期限</option>
              <option value="priority">優先度</option>
            </select>
          </div>
        </div>

        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchQuery
                ? '検索結果がありません'
                : filter === 'completed'
                ? '完了したタスクはありません'
                : 'タスクを追加してください'}
            </p>
          </div>
        ) : (
          <TodoList
            todos={filteredTodos}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      {showForm && (
        <TodoForm
          todo={editingTodo || undefined}
          onSave={handleSaveTodo}
          onCancel={() => {
            setShowForm(false)
            setEditingTodo(null)
          }}
        />
      )}

      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)} 
          settings={settings}
          onSettingsChange={setSettings}
        />
      )}
    </div>
  )
}

export default App