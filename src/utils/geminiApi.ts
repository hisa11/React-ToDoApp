import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any = null

  initialize(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini APIキーが設定されていません')
    }
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
  }

  async correctText(text: string, context: string = 'タスク'): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini APIが初期化されていません')
    }

    const prompt = `以下の${context}のテキストを、より適切で読みやすい日本語に修正してください。
技術用語は適切に保持し、文法や表現を改善してください。
修正後のテキストのみを返してください（説明は不要です）。

元のテキスト: ${text}`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Gemini API エラー:', error)
      throw new Error('テキストの修正に失敗しました')
    }
  }

  async suggestTags(taskText: string, description: string): Promise<string[]> {
    if (!this.model) {
      throw new Error('Gemini APIが初期化されていません')
    }

    const prompt = `以下のタスクに適切なタグを3〜5個提案してください。
エンジニアリング、開発作業に関連するタグを優先してください。
タグはカンマ区切りで返してください（説明は不要です）。

タスク名: ${taskText}
説明: ${description || 'なし'}`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const tagsText = response.text().trim()
      return tagsText.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
    } catch (error) {
      console.error('Gemini API エラー:', error)
      return []
    }
  }

  async estimateTime(taskText: string, description: string): Promise<number> {
    if (!this.model) {
      throw new Error('Gemini APIが初期化されていません')
    }

    const prompt = `以下のエンジニアリングタスクの所要時間を分単位で見積もってください。
数値のみを返してください（単位や説明は不要です）。

タスク名: ${taskText}
説明: ${description || 'なし'}`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const timeText = response.text().trim()
      const time = parseInt(timeText.replace(/[^0-9]/g, ''))
      return isNaN(time) ? 60 : time
    } catch (error) {
      console.error('Gemini API エラー:', error)
      return 60 // デフォルト値
    }
  }

  async improveNotes(notes: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini APIが初期化されていません')
    }

    const prompt = `以下のメモを、より構造化された読みやすい形式に整理してください。
技術的な内容は保持し、必要に応じて箇条書きやセクション分けを使用してください。

元のメモ:
${notes}`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Gemini API エラー:', error)
      throw new Error('メモの改善に失敗しました')
    }
  }
}

export const geminiService = new GeminiService()
