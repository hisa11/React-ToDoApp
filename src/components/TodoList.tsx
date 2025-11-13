import React from 'react'
import TodoItem from './TodoItem' // ★ 1. TodoItem を import
import { Todo } from '../types'


// TodoList が受け取る Props の型
type TodoListProps = {
  todos: Todo[]
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
}

const TodoList = ({ todos, onToggleComplete, onDelete }: TodoListProps) => {
  return (
    <ul>
      {/* ★ 2. todos 配列を .map() でループする */}
      {todos.map((todo) => (
        
        // ★ 3. <li> の代わりに <TodoItem /> を呼び出す
        //      TodoItem が必要とする Props (key, todo, onToggleComplete, onDelete) を渡す
        <TodoItem 
          key={todo.id}
          todo={todo} 
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />

      ))}
    </ul>
  )
}

export default TodoList