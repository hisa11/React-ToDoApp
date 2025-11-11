import React from 'react'

// 1. TodoList が受け取る Props (情報) の「型」を定義
type TodoListProps = {
  // ここに、App から渡される Props の中身を定義していきます
}

// 2. TodoList コンポーネント本体
//    (props: TodoListProps) で、App から情報を受け取ります
const TodoList = (props: TodoListProps) => {
  return (
    <ul>
      {/* ここに App.tsx から map の中身を移動してくる予定 */}
      <li>（これはテストです）</li>
    </ul>
  )
}

export default TodoList