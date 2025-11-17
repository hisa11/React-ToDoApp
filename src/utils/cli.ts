import type { Todo, AppSettings } from '../types'
import { geminiService } from './geminiApi'
import { p2pSync } from './p2pSync'

export class TodoCLI {
  private getTodosFunc: () => Todo[]
  private setTodos: (todos: Todo[]) => void
  private getSettings: () => AppSettings
  private setSettings: (settings: AppSettings) => void

  constructor(
    getTodos: () => Todo[],
    setTodos: (todos: Todo[]) => void,
    getSettings: () => AppSettings,
    setSettings: (settings: AppSettings) => void
  ) {
    this.getTodosFunc = getTodos
    this.setTodos = setTodos
    this.getSettings = getSettings
    this.setSettings = setSettings
  }

  // タスク一覧表示
  ls(options: string[] = []) {
    const todos = this.getTodosFunc()
    
    if (todos.length === 0) {
      return
    }

    const showAll = options.includes('-a') || options.includes('--all')
    const showDetails = options.includes('-l') || options.includes('--long')
    
    todos.forEach((todo) => {
      const status = todo.isCompleted ? 'x' : ' '
      const priority = `P${todo.priority}`
      
      if (showDetails) {
        // -l: 詳細表示（ls -l風）
        const date = todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '----/--/--'
        const prog = `${todo.progress}%`.padStart(4)
        console.log(`[${status}] ${priority} ${prog} ${date} ${todo.id.toString().padStart(13)} ${todo.text}`)
        if (todo.description) {
          console.log(`    ${todo.description}`)
        }
        if (todo.tags.length > 0) {
          console.log(`    tags: ${todo.tags.join(', ')}`)
        }
      } else if (showAll) {
        // -a: 基本情報表示
        const date = todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '----/--/--'
        console.log(`[${status}] ${priority} ${date} ${todo.id.toString().padStart(13)} ${todo.text}`)
      } else {
        // デフォルト: タスク名のみ
        console.log(todo.text)
      }
    })
  }

  // タスク詳細表示
  show(id: number) {
    const todo = this.getTodosFunc().find(t => t.id === id)
    
    if (!todo) {
      console.error(`todo: no such task: ${id}`)
      return
    }

    console.log(`Task: ${todo.text}`)
    console.log(`ID:       ${todo.id}`)
    console.log(`Status:   ${todo.isCompleted ? 'completed' : 'active'}`)
    console.log(`Priority: P${todo.priority}`)
    console.log(`Due:      ${todo.dueDate || 'none'}`)
    console.log(`Progress: ${todo.progress}%`)
    
    if (todo.description) {
      console.log(`\nDescription:\n  ${todo.description}`)
    }
    
    if (todo.estimatedTime) {
      console.log(`Estimate: ${todo.estimatedTime}min`)
    }
    
    if (todo.tags.length > 0) {
      console.log(`Tags:     ${todo.tags.join(', ')}`)
    }
    
    if (todo.libraries.length > 0) {
      console.log(`Libs:     ${todo.libraries.join(', ')}`)
    }
    
    if (todo.relatedLinks.length > 0) {
      console.log(`\nLinks:`)
      todo.relatedLinks.forEach(link => console.log(`  ${link}`))
    }
    
    if (todo.reminders && todo.reminders.length > 0) {
      console.log(`\nReminders:`)
      todo.reminders.forEach(r => {
        const status = r.notified ? 'sent' : r.enabled ? 'on' : 'off'
        console.log(`  [${status}] ${new Date(r.datetime).toLocaleString('ja-JP')} ${r.message || ''}`)
      })
    }
    
    if (todo.notes) {
      console.log(`\nNotes:\n${todo.notes}`)
    }
  }

  // タスク追加
  add(text: string, options: Partial<Todo> = {}) {
    if (!text) {
      console.error('usage: todo.add(text, options)')
      console.log('example: todo.add("Buy milk", { priority: 3, dueDate: "2025-12-31" })')
      return
    }

    const todos = this.getTodosFunc()
    const newTodo: Todo = {
      id: Date.now(),
      text,
      isCompleted: false,
      dueDate: options.dueDate || '',
      description: options.description || '',
      priority: options.priority || 1,
      estimatedTime: options.estimatedTime || 0,
      tags: options.tags || [],
      attachedFiles: [],
      relatedLinks: options.relatedLinks || [],
      dependencies: [],
      libraries: options.libraries || [],
      progress: 0,
      reminders: [],
      notes: options.notes || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.setTodos([...todos, newTodo])
    console.log(`added: ${newTodo.text} (id: ${newTodo.id})`)
  }

  // タスク削除
  rm(id: number) {
    const todos = this.getTodosFunc()
    const todo = todos.find(t => t.id === id)
    
    if (!todo) {
      console.error(`todo: no such task: ${id}`)
      return
    }

    this.setTodos(todos.filter(t => t.id !== id))
    console.log(`removed: ${todo.text}`)
  }

  // タスク完了切り替え
  toggle(id: number) {
    const todos = this.getTodosFunc()
    const todo = todos.find(t => t.id === id)
    
    if (!todo) {
      console.error(`todo: no such task: ${id}`)
      return
    }

    const updated = todos.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted, updatedAt: Date.now() } : t
    )
    
    this.setTodos(updated)
    const newStatus = todo.isCompleted ? 'active' : 'completed'
    console.log(`${todo.text}: marked as ${newStatus}`)
  }

  // タスク更新
  update(id: number, updates: Partial<Todo>) {
    const todos = this.getTodosFunc()
    const todo = todos.find(t => t.id === id)
    
    if (!todo) {
      console.error(`todo: no such task: ${id}`)
      return
    }

    const updated = todos.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    )
    
    this.setTodos(updated)
    console.log(`updated: ${todo.text}`)
  }

  // Gemini API設定
  setGeminiApiKey(apiKey: string) {
    if (!apiKey) {
      console.error('usage: todo.setGeminiApiKey(key)')
      return
    }

    const settings = this.getSettings()
    this.setSettings({ ...settings, geminiApiKey: apiKey })
    
    try {
      geminiService.initialize(apiKey)
      console.log('gemini: api key configured')
    } catch (error) {
      console.error('gemini: initialization failed:', error)
    }
  }

  // P2P接続
  async connectP2P(peerId?: string) {
    const settings = this.getSettings()
    
    try {
      await p2pSync.initialize(settings.peerId)
      const myId = p2pSync['peer']?.id || 'unknown'
      console.log(`p2p: listening on ${myId}`)
      
      if (peerId) {
        await p2pSync.connectToPeer(peerId)
        console.log(`p2p: connected to ${peerId}`)
      }
    } catch (error) {
      console.error('p2p: connection failed:', error)
    }
  }

  // P2P接続解除
  disconnectP2P(peerId?: string) {
    if (peerId) {
      console.log(`p2p: disconnect from specific peer not implemented`)
    } else {
      p2pSync['peer']?.disconnect()
      p2pSync['peer']?.destroy()
      console.log('p2p: disconnected')
    }
  }

  // 統計情報
  stats() {
    const todos = this.getTodosFunc()
    const completed = todos.filter(t => t.isCompleted).length
    const active = todos.length - completed
    const overdue = todos.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()).length
    
    const byPriority = [5, 4, 3, 2, 1].map(p => ({
      priority: p,
      count: todos.filter(t => t.priority === p && !t.isCompleted).length
    }))

    console.log(`Total:     ${todos.length} tasks`)
    console.log(`Active:    ${active}`)
    console.log(`Completed: ${completed}`)
    console.log(`Overdue:   ${overdue}`)
    console.log(`Progress:  ${todos.length > 0 ? Math.round(completed / todos.length * 100) : 0}%`)
    console.log(`\nBy Priority:`)
    byPriority.forEach(({ priority, count }) => {
      if (count > 0) {
        console.log(`  P${priority}: ${count}`)
      }
    })
  }

  // フィルター
  filter(condition: string) {
    const todos = this.getTodosFunc()
    let filtered: Todo[] = []

    switch (condition) {
      case 'completed':
        filtered = todos.filter(t => t.isCompleted)
        break
      case 'active':
        filtered = todos.filter(t => !t.isCompleted)
        break
      case 'overdue':
        filtered = todos.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date())
        break
      case 'urgent':
        filtered = todos.filter(t => !t.isCompleted && t.priority >= 4)
        break
      default:
        console.error(`filter: unknown condition: ${condition}`)
        console.log('available: completed, active, overdue, urgent')
        return
    }

    if (filtered.length === 0) {
      return
    }

    filtered.forEach((todo) => {
      const status = todo.isCompleted ? 'x' : ' '
      console.log(`[${status}] P${todo.priority} ${todo.id.toString().padStart(13)} ${todo.text}`)
    })
  }

  // タグで検索
  findByTag(tag: string) {
    const todos = this.getTodosFunc()
    const filtered = todos.filter(t => t.tags.includes(tag))
    
    if (filtered.length === 0) {
      return
    }

    filtered.forEach((todo) => {
      const status = todo.isCompleted ? 'x' : ' '
      console.log(`[${status}] ${todo.id.toString().padStart(13)} ${todo.text}`)
    })
  }

  // ヘルプ
  help() {
    console.log(`
Todo CLI v1.0.0

USAGE:
  todo.COMMAND [OPTIONS]

TASK MANAGEMENT:
  ls [OPTIONS]           list all tasks
    -a, --all            show priority and due date
    -l, --long           show detailed information
  show ID                show task details
  add TEXT [OPTIONS]     add new task
  rm ID                  remove task
  toggle ID              toggle task completion
  update ID DATA         update task properties

SEARCH & FILTER:
  filter CONDITION       filter tasks (completed|active|overdue|urgent)
  findByTag TAG          find tasks by tag
  stats                  show statistics

SETTINGS:
  setGeminiApiKey KEY    configure Gemini API
  connectP2P [PEER_ID]   start P2P connection
  disconnectP2P          disconnect P2P

DATA:
  export                 export tasks as JSON
  import DATA            import tasks from JSON

OTHER:
  help                   show this help
  version                show version info

EXAMPLES:
  todo.ls(['-a'])
  todo.add("Buy milk", { priority: 3, dueDate: "2025-12-31" })
  todo.update(123, { priority: 5 })
  todo.filter("urgent")
    `)
  }

  // バージョン情報
  version() {
    console.log('Todo CLI v1.0.0')
    console.log('Built with React + TypeScript + Vite')
  }

  // エクスポート（JSON形式）
  export() {
    const todos = this.getTodosFunc()
    const json = JSON.stringify(todos, null, 2)
    console.log(json)
    console.log('\n# To copy: copy(JSON.stringify(todo.getTodos()))')
  }

  // インポート
  import(jsonData: string | Todo[]) {
    try {
      const todos = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      
      if (!Array.isArray(todos)) {
        throw new Error('array required')
      }

      this.setTodos(todos)
      console.log(`imported: ${todos.length} tasks`)
    } catch (error) {
      console.error('import: failed:', error)
    }
  }

  // 内部アクセス用（デバッグ）
  getTodos(): Todo[] {
    return this.getTodosFunc()
  }
}
