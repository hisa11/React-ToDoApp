import { useState } from 'react'
import type { Todo } from '../types'

type TodoItemProps = {
  todo: Todo
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
  onEdit: (todo: Todo) => void
}

const TodoItem = ({ todo, onToggleComplete, onDelete, onEdit }: TodoItemProps) => {
  const [expanded, setExpanded] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = todo.dueDate && todo.dueDate < today && !todo.isCompleted

  const getPriorityClass = (priority: number) => {
    if (priority >= 5) return 'priority-p5'
    if (priority >= 4) return 'priority-p4'
    if (priority >= 3) return 'priority-p3'
    if (priority >= 2) return 'priority-p2'
    return 'priority-p1'
  }

  const formatTime = (minutes?: number) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  return (
    <li className={`todo-item ${isOverdue ? 'overdue' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className="todo-main">
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => onToggleComplete(todo.id)}
          className="todo-checkbox"
        />

        <div className="todo-content" onClick={() => setExpanded(!expanded)}>
          <div className="todo-header">
            <span className={`todo-text ${todo.isCompleted ? 'completed' : ''}`}>
              {todo.text}
            </span>
            {todo.progress > 0 && todo.progress < 100 && (
              <span className="progress-badge">{todo.progress}%</span>
            )}
          </div>

          <div className="todo-meta">
            {todo.dueDate && (
              <span className="meta-item">
                📅 {todo.dueDate}
              </span>
            )}
            {todo.priority > 1 && (
              <span 
                className={`meta-item priority-badge ${getPriorityClass(todo.priority)}`}
              >
                P{todo.priority}
              </span>
            )}
            {todo.estimatedTime && (
              <span className="meta-item">
                ⏱️ {formatTime(todo.estimatedTime)}
              </span>
            )}
            {todo.tags.length > 0 && (
              <span className="meta-item">
                🏷️ {todo.tags.slice(0, 2).join(', ')}
                {todo.tags.length > 2 && ` +${todo.tags.length - 2}`}
              </span>
            )}
          </div>
        </div>

        <div className="todo-actions">
          <button onClick={() => setExpanded(!expanded)} className="btn-icon" title="詳細">
            {expanded ? '▲' : '▼'}
          </button>
          <button onClick={() => onEdit(todo)} className="btn-icon" title="編集">
            ✏️
          </button>
          <button onClick={() => onDelete(todo.id)} className="btn-icon btn-delete" title="削除">
            🗑️
          </button>
        </div>
      </div>

      {expanded && (
        <div className="todo-details">
          {todo.description && (
            <div className="detail-section">
              <strong>説明:</strong>
              <p>{todo.description}</p>
            </div>
          )}

          {todo.notes && (
            <div className="detail-section">
              <strong>ノート:</strong>
              <p className="notes">{todo.notes}</p>
            </div>
          )}

          {todo.libraries.length > 0 && (
            <div className="detail-section">
              <strong>技術スタック:</strong>
              <div className="tech-stack">
                {todo.libraries.map((lib, idx) => (
                  <span key={idx} className="tech-badge">{lib}</span>
                ))}
              </div>
            </div>
          )}

          {todo.relatedLinks.length > 0 && (
            <div className="detail-section">
              <strong>関連リンク:</strong>
              <ul className="links-list">
                {todo.relatedLinks.map((link, idx) => (
                  <li key={idx}>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      🔗 {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {todo.attachedFiles && todo.attachedFiles.length > 0 && (
            <div className="detail-section">
              <strong>添付ファイル:</strong>
              <div className="file-list">
                {todo.attachedFiles.map((file, index) => (
                  <a
                    key={index}
                    href={file.data}
                    download={file.name}
                    className="file-attachment"
                  >
                    📎 {file.name} ({(file.size / 1024).toFixed(1)}KB)
                  </a>
                ))}
              </div>
            </div>
          )}

          {todo.dependencies.length > 0 && (
            <div className="detail-section">
              <strong>依存タスク:</strong>
              <p>タスクID: {todo.dependencies.join(', ')}</p>
            </div>
          )}

          {todo.progress > 0 && (
            <div className="detail-section">
              <strong>進捗:</strong>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${todo.progress}%` }}
                />
              </div>
              <span className="progress-text">{todo.progress}%</span>
            </div>
          )}

          {todo.reminders && todo.reminders.length > 0 && (
            <div className="detail-section">
              <strong>リマインダー:</strong>
              <div className="reminders-display">
                {todo.reminders.map((reminder) => (
                  <div key={reminder.id} className="reminder-display-item">
                    <span className={`reminder-status ${reminder.notified ? 'notified' : reminder.enabled ? 'active' : 'disabled'}`}>
                      {reminder.notified ? '✓' : reminder.enabled ? '🔔' : '🔕'}
                    </span>
                    <span className="reminder-time">
                      {new Date(reminder.datetime).toLocaleString('ja-JP', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {reminder.message && <span className="reminder-msg">「{reminder.message}」</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export default TodoItem