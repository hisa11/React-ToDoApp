import React from 'react'

// 1. Todo 型を App.tsx からコピー (ここも本当は別ファイルが良い)
type Todo = {
  id: number
  text: string
  isCompleted: boolean
  dueDate: string
}

// 2. TodoItem が受け取る Props の型を定義
type TodoItemProps = {
  todo: Todo // 1件分の Todo オブジェクト
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
}

// 3. TodoItem コンポーネント本体
//    props を分割代入で受け取る
const TodoItem = ({ todo, onToggleComplete, onDelete }: TodoItemProps) => {
  return (
    // 4. TodoList.tsx から <li> の中身をここに持ってくる
    <li key={todo.id}>
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={() => onToggleComplete(todo.id)} // Props で受け取った関数を呼ぶ
      />
      <span style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>
        {todo.text}
        {todo.dueDate && ` (期限: ${todo.dueDate})`}
      </span>
      <button onClick={() => onDelete(todo.id)}> {/* Props で受け取った関数を呼ぶ */}
        削除
      </button>
    </li>
  )
}

export default TodoItem