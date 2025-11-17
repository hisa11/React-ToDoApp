import type { Todo } from '../types'

export class NotificationService {
  private hasPermission = false

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('このブラウザは通知機能をサポートしていません')
      return false
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.hasPermission = permission === 'granted'
      return this.hasPermission
    }

    return false
  }

  showNotification(title: string, body: string, icon?: string) {
    if (!this.hasPermission) {
      console.log('通知の許可がありません')
      return
    }

    new Notification(title, {
      body,
      icon: icon || '/vite.svg',
      badge: '/vite.svg',
    })
  }

  checkReminders(todos: Todo[], onUpdate?: (todos: Todo[]) => void) {
    const now = Date.now()
    let updated = false
    const updatedTodos = [...todos]

    updatedTodos.forEach((todo) => {
      if (todo.isCompleted || !todo.reminders || todo.reminders.length === 0) {
        return
      }

      todo.reminders.forEach((reminder) => {
        if (!reminder.enabled || reminder.notified) {
          return
        }

        const reminderTime = new Date(reminder.datetime).getTime()

        // 通知時刻を過ぎていて、まだ通知していない場合
        if (now >= reminderTime) {
          const timeLeft = reminderTime - now
          const message = reminder.message || this.getDefaultReminderMessage(timeLeft)
          
          this.showNotification(
            `リマインダー: ${todo.text}`,
            message
          )

          // 通知済みフラグを設定
          reminder.notified = true
          updated = true
        }
      })
    })

    // 更新があれば呼び出し元に通知
    if (updated && onUpdate) {
      onUpdate(updatedTodos)
    }
  }

  private getDefaultReminderMessage(timeLeft: number): string {
    if (timeLeft <= 0) {
      return 'タスクの時間です！'
    }
    
    const hoursLeft = Math.floor(Math.abs(timeLeft) / (1000 * 60 * 60))
    const minutesLeft = Math.floor((Math.abs(timeLeft) % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hoursLeft > 0) {
      return `あと${hoursLeft}時間${minutesLeft}分です`
    } else if (minutesLeft > 0) {
      return `あと${minutesLeft}分です`
    } else {
      return 'まもなく時間です！'
    }
  }

  scheduleReminder(todo: Todo, onUpdate: (todo: Todo) => void) {
    if (!todo.reminders || todo.reminders.length === 0) {
      return
    }

    const now = Date.now()

    todo.reminders.forEach((reminder) => {
      if (!reminder.enabled || reminder.notified) {
        return
      }

      const reminderTime = new Date(reminder.datetime).getTime()

      if (reminderTime > now) {
        const delay = reminderTime - now
        
        // 24時間以内のリマインダーのみスケジュール（メモリ節約）
        if (delay < 24 * 60 * 60 * 1000) {
          setTimeout(() => {
            const timeLeft = reminderTime - Date.now()
            const message = reminder.message || this.getDefaultReminderMessage(timeLeft)
            
            this.showNotification(
              `リマインダー: ${todo.text}`,
              message
            )
            
            reminder.notified = true
            onUpdate(todo)
          }, delay)
        }
      }
    })
  }
}

export const notificationService = new NotificationService()
