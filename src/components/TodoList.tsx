import React from 'react'

// 1. App.tsx から Todo 型をコピー (import する方がベターだが、一旦コピーでOK)
type Todo = {
  id: number
  text: string
  isCompleted: boolean
  dueDate: string
}

// 2. TodoList が受け取る Props (情報) の「型」を定義
type TodoListProps = {
  todos: Todo[] // 「todos」という名前で Todo の配列を受け取る
  onToggleComplete: (id: number) => void // (id) を受け取り、何も返さない(void)関数
  onDelete: (id: number) => void // (id) を受け取り、何も返さない(void)関数
}

// 3. TodoList コンポーネント本体
//    props を分割代入で { todos, onToggleComplete, onDelete } として受け取る
const TodoList = ({ todos, onToggleComplete, onDelete }: TodoListProps) => {
  return (
    <ul>
      {/* 4. App.tsx から .map() の中身をここに持ってくる */}
      {todos.map((todo) => (
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
      ))}
    </ul>
  )
}

export default TodoList