import { useState } from 'react'
import type { Todo, AttachedFile, ReminderSetting } from '../types'
import { geminiService } from '../utils/geminiApi'

type TodoFormProps = {
  todo?: Todo
  onSave: (todo: Todo) => void
  onCancel: () => void
}

const TodoForm = ({ todo, onSave, onCancel }: TodoFormProps) => {
  const [text, setText] = useState(todo?.text || '')
  const [description, setDescription] = useState(todo?.description || '')
  const [dueDate, setDueDate] = useState(todo?.dueDate || '')
  const [priority, setPriority] = useState(todo?.priority || 1)
  const [estimatedTime, setEstimatedTime] = useState(todo?.estimatedTime || 0)
  const [tags, setTags] = useState<string[]>(todo?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [libraries, setLibraries] = useState<string[]>(todo?.libraries || [])
  const [libInput, setLibInput] = useState('')
  const [relatedLinks, setRelatedLinks] = useState<string[]>(todo?.relatedLinks || [])
  const [linkInput, setLinkInput] = useState('')
  const [notes, setNotes] = useState(todo?.notes || '')
  const [progress, setProgress] = useState(todo?.progress || 0)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>(todo?.attachedFiles || [])
  const [reminders, setReminders] = useState<ReminderSetting[]>(todo?.reminders || [])
  const [newReminderDatetime, setNewReminderDatetime] = useState('')
  const [newReminderMessage, setNewReminderMessage] = useState('')
  const [isAiProcessing, setIsAiProcessing] = useState(false)

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const newFile: AttachedFile = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result as string,
          uploadedAt: Date.now(),
        }
        setAttachedFiles([...attachedFiles, newFile])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(attachedFiles.filter((f) => f.id !== fileId))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleAddLibrary = () => {
    if (libInput.trim() && !libraries.includes(libInput.trim())) {
      setLibraries([...libraries, libInput.trim()])
      setLibInput('')
    }
  }

  const handleRemoveLibrary = (lib: string) => {
    setLibraries(libraries.filter((l) => l !== lib))
  }

  const handleAddLink = () => {
    if (linkInput.trim() && !relatedLinks.includes(linkInput.trim())) {
      setRelatedLinks([...relatedLinks, linkInput.trim()])
      setLinkInput('')
    }
  }

  const handleRemoveLink = (link: string) => {
    setRelatedLinks(relatedLinks.filter((l) => l !== link))
  }

  const handleAiCorrectText = async () => {
    setIsAiProcessing(true)
    try {
      const correctedText = await geminiService.correctText(text, 'タスク名')
      setText(correctedText)
      alert('テキストを修正しました')
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleAiImproveNotes = async () => {
    setIsAiProcessing(true)
    try {
      const improved = await geminiService.improveNotes(notes)
      setNotes(improved)
      alert('ノートを改善しました')
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleAiSuggestTags = async () => {
    setIsAiProcessing(true)
    try {
      const suggestedTags = await geminiService.suggestTags(text, description)
      const newTags = [...new Set([...tags, ...suggestedTags])]
      setTags(newTags)
      alert(`${suggestedTags.length}個のタグを提案しました`)
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleAiEstimateTime = async () => {
    setIsAiProcessing(true)
    try {
      const estimated = await geminiService.estimateTime(text, description)
      setEstimatedTime(estimated)
      alert(`所要時間を${estimated}分と見積もりました`)
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() === '') {
      alert('タスク名を入力してください')
      return
    }

    const now = Date.now()
    const savedTodo: Todo = {
      id: todo?.id || now,
      text,
      description,
      dueDate,
      priority,
      estimatedTime: estimatedTime || undefined,
      tags,
      attachedFiles,
      relatedLinks,
      dependencies: todo?.dependencies || [],
      libraries,
      progress,
      reminders,
      notes,
      isCompleted: todo?.isCompleted || false,
      createdAt: todo?.createdAt || now,
      updatedAt: now,
    }

    onSave(savedTodo)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{todo ? 'タスクを編集' : '新しいタスク'}</h2>
          <button onClick={onCancel} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="todo-form">
          {/* タスク名 */}
          <div className="form-group">
            <label>タスク名 *</label>
            <div className="input-with-ai">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="タスク名を入力"
                required
              />
              <button
                type="button"
                onClick={handleAiCorrectText}
                disabled={isAiProcessing || !text}
                className="btn-ai"
                title="AI で修正"
              >
                🤖
              </button>
            </div>
          </div>

          {/* 説明 */}
          <div className="form-group">
            <label>説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="タスクの詳細説明"
              rows={3}
            />
          </div>

          {/* 期限と優先度 */}
          <div className="form-row">
            <div className="form-group">
              <label>期限</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>優先度 (1-5)</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                min={1}
                max={5}
              />
            </div>
          </div>

          {/* 所要時間と進捗 */}
          <div className="form-row">
            <div className="form-group">
              <label>所要時間（分）</label>
              <div className="input-with-ai">
                <input
                  type="number"
                  value={estimatedTime || ''}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  placeholder="0"
                  min={0}
                />
                <button
                  type="button"
                  onClick={handleAiEstimateTime}
                  disabled={isAiProcessing || !text}
                  className="btn-ai"
                  title="AI で見積もり"
                >
                  🤖
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>進捗 ({progress}%)</label>
              <input
                type="range"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>

          {/* タグ */}
          <div className="form-group">
            <label>タグ</label>
            <div className="input-with-ai">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="タグを追加"
              />
              <button type="button" onClick={handleAddTag} className="btn-secondary">
                追加
              </button>
              <button
                type="button"
                onClick={handleAiSuggestTags}
                disabled={isAiProcessing || !text}
                className="btn-ai"
                title="AI で提案"
              >
                🤖
              </button>
            </div>
            <div className="tags-container">
              {tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* 技術スタック */}
          <div className="form-group">
            <label>技術スタック・ライブラリ</label>
            <div className="input-with-buttons">
              <input
                type="text"
                value={libInput}
                onChange={(e) => setLibInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLibrary())}
                placeholder="例: React, TypeScript"
              />
              <button type="button" onClick={handleAddLibrary} className="btn-secondary">
                追加
              </button>
            </div>
            <div className="tags-container">
              {libraries.map((lib) => (
                <span key={lib} className="tech-tag">
                  {lib}
                  <button type="button" onClick={() => handleRemoveLibrary(lib)}>✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* 関連リンク */}
          <div className="form-group">
            <label>関連リンク</label>
            <div className="input-with-buttons">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                placeholder="https://..."
              />
              <button type="button" onClick={handleAddLink} className="btn-secondary">
                追加
              </button>
            </div>
            <ul className="links-list-form">
              {relatedLinks.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                  <button type="button" onClick={() => handleRemoveLink(link)}>✕</button>
                </li>
              ))}
            </ul>
          </div>

          {/* ファイル添付 */}
          <div className="form-group">
            <label>ファイル添付</label>
            <input
              type="file"
              onChange={handleFileAttach}
              multiple
              className="file-input"
            />
            <ul className="files-list-form">
              {attachedFiles.map((file) => (
                <li key={file.id}>
                  📎 {file.name} ({Math.round(file.size / 1024)}KB)
                  <button type="button" onClick={() => handleRemoveFile(file.id)}>✕</button>
                </li>
              ))}
            </ul>
          </div>

          {/* ノート */}
          <div className="form-group">
            <label>ノート</label>
            <div className="textarea-with-ai">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="詳細なメモや技術的な情報"
                rows={5}
              />
              <button
                type="button"
                onClick={handleAiImproveNotes}
                disabled={isAiProcessing || !notes}
                className="btn-ai"
                title="AI で改善"
              >
                🤖 改善
              </button>
            </div>
          </div>

          {/* リマインダー */}
          <div className="form-group">
            <label>リマインダー設定</label>
            <div className="reminders-list">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="reminder-item">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={(e) => {
                      setReminders(
                        reminders.map((r) =>
                          r.id === reminder.id ? { ...r, enabled: e.target.checked } : r
                        )
                      )
                    }}
                    aria-label="リマインダーを有効化"
                  />
                  <span className="reminder-datetime">
                    {new Date(reminder.datetime).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {reminder.message && (
                    <span className="reminder-message">「{reminder.message}」</span>
                  )}
                  {reminder.notified && <span className="reminder-notified">✓ 通知済み</span>}
                  <button
                    type="button"
                    onClick={() => setReminders(reminders.filter((r) => r.id !== reminder.id))}
                    className="btn-remove-reminder"
                    aria-label="リマインダーを削除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <div className="add-reminder">
              <label htmlFor="reminder-datetime">日時:</label>
              <input
                id="reminder-datetime"
                type="datetime-local"
                value={newReminderDatetime}
                onChange={(e) => setNewReminderDatetime(e.target.value)}
                aria-label="リマインダーの日時"
              />
              <label htmlFor="reminder-message">メッセージ (任意):</label>
              <input
                id="reminder-message"
                type="text"
                value={newReminderMessage}
                onChange={(e) => setNewReminderMessage(e.target.value)}
                placeholder="例: 会議の準備をする"
                aria-label="リマインダーのメッセージ"
              />
              <button
                type="button"
                onClick={() => {
                  if (newReminderDatetime) {
                    const newReminder: ReminderSetting = {
                      id: `reminder-${Date.now()}-${Math.random()}`,
                      enabled: true,
                      datetime: newReminderDatetime,
                      notified: false,
                      message: newReminderMessage || undefined,
                    }
                    setReminders([...reminders, newReminder])
                    setNewReminderDatetime('')
                    setNewReminderMessage('')
                  }
                }}
                className="btn-add-reminder"
                disabled={!newReminderDatetime}
              >
                ➕ リマインダー追加
              </button>
            </div>
          </div>

          {/* ボタン */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              キャンセル
            </button>
            <button type="submit" className="btn-save" disabled={isAiProcessing}>
              {todo ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TodoForm
