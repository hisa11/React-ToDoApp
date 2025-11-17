import TodoItem from './TodoItem'
import type { Todo } from '../types'

type TodoListProps = {
  todos: Todo[]
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
  onEdit: (todo: Todo) => void
}

const TodoList = ({ todos, onToggleComplete, onDelete, onEdit }: TodoListProps) => {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem 
          key={todo.id}
          todo={todo} 
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}

export default TodoList