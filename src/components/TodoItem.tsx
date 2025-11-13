import React from 'react'
import { Todo } from '../types' // 型を import

type TodoItemProps = {
  todo: Todo
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
}

const TodoItem = ({ todo, onToggleComplete, onDelete }: TodoItemProps) => {

  // --- ★ ここから追加 ---
  
  // 1. 「今日の日付」を 'YYYY-MM-DD' 形式の文字列で取得
  //    (toISOString() は '2025-11-13T04:46:18.000Z' のような文字列を返すので、
  //     'T' で分割して日付部分だけを取り出します)
  const today = new Date().toISOString().split('T')[0];

  // 2. 期限切れかどうかを判断する
  //    (todo.dueDate が存在し、かつ今日より過去である)
  const isOverdue = todo.dueDate && todo.dueDate < today;

  // --- ★ ここまで追加 ---

  return (
    // 3. <li> タグに className を追加
    //    もし isOverdue が true なら 'overdue' クラスを、そうでなければ空('')を適用
    <li className={isOverdue ? 'overdue' : ''}> 
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={() => onToggleComplete(todo.id)}
      />
      <span style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>
        {todo.text}
        {todo.dueDate && ` (期限: ${todo.dueDate})`}
      </span>
      <button onClick={() => onDelete(todo.id)}>
        削除
      </button>
    </li>
  )
}

export default TodoItem