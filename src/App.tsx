import { useState, useEffect } from 'react'
import './App.css'
import TodoList from './components/TodoList'


// ToDoタスク1つ分の「型」
type Todo = {
  id: number
  text: string
  isCompleted: boolean
  dueDate: string
}

function App() {
  const [inputValue, setInputValue] = useState('')
  const [dueDate, setDueDate] = useState('')

  // localStorage から初期データを読み込む
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      return JSON.parse(savedTodos)
    } else {
      return []
    }
  })

  // todos state が変更されたら localStorage に保存する
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // タスク追加処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() === '') {
      return
    }
    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      isCompleted: false,
      dueDate: dueDate,
    }
    setTodos([...todos, newTodo])
    setInputValue('')
    setDueDate('')
  }

  // タスク削除処理
  const handleDelete = (idToDelete: number) => {
    const newTodos = todos.filter((todo) => todo.id !== idToDelete)
    setTodos(newTodos)
  }

  // タスク完了・未完了トグル処理
  const handleToggleComplete = (idToToggle: number) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === idToToggle) {
        return { ...todo, isCompleted: !todo.isCompleted }
      }
      return todo
    })
    setTodos(newTodos)
  }

  // ここからが画面の表示 (JSX)
  return (
    <div>
      <h1>ToDo アプリ</h1>

      {/* タスク追加フォーム */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit">追加</button>
      </form>
      
      {/* 未完了のタスクリスト */}
      <h2>未完了のタスク</h2>
      <TodoList>
      </TodoList>

      {/* 完了済みのタスクリスト */}
      <h2>完了済みのタスク</h2>
      <ul>
        {todos
          .filter((todo) => todo.isCompleted) // isCompleted が true のもの
          .map((todo) => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.isCompleted}
                onChange={() => handleToggleComplete(todo.id)}
              />
              <span style={{ textDecoration: 'line-through' }}>
                {todo.text}
                {todo.dueDate && ` (期限: ${todo.dueDate})`}
              </span>
              <button onClick={() => handleDelete(todo.id)}>
                削除
              </button>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default App