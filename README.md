# 🚀 Engineer's ToDo App

エンジニア向けの高機能ToDoアプリケーション。フロントエンド、バックエンド、ロボットエンジニアに最適化された、プロジェクト管理と生産性向上のためのツールです。

## ✨ 主な機能

### 📋 基本機能
- タスクの作成、編集、削除、完了管理
- 優先度設定（P1～P5）
- 期限設定とリマインダー
- 進捗状況トラッキング（0-100%）
- 詳細な説明とメモ機能

### 🏷️ エンジニア向け機能
- **技術スタック管理**: 使用ライブラリ・フレームワークのタグ付け
- **タスク依存関係**: タスク間の依存関係を設定
- **所要時間見積もり**: タスクの工数管理
- **関連リンク**: GitHub、ドキュメント、APIリファレンスへのリンク
- **ファイル添付**: 設計書、スクリーンショット等の添付

### 🤖 AI機能（Gemini API）
- タスク名・説明の自動修正
- タグの自動提案
- 所要時間の自動見積もり
- メモの構造化・改善

### 🔗 LAN内共有（P2P）
- WebRTC（PeerJS）を使用したリアルタイム同期
- サーバー不要のP2P通信
- チームメンバーとToDoを共有

### 🔔 通知・リマインダー
- ブラウザ通知機能
- 期限前の自動リマインダー
- カスタマイズ可能な通知タイミング

### 🎨 UI/UX
- ダークモード / ライトモード対応
- レスポンシブデザイン
- 高速な検索・フィルタリング
- ドラッグ&ドロップファイル添付

## 🚀 クイックスタート
[https://hisa11.github.io/React-ToDoApp/](https://hisa11.github.io/React-ToDoApp/)からアクセスすることができます

## 🔧 設定

### Gemini API設定

1. アプリの設定画面（⚙️）を開く
2. [Google AI Studio](https://makersuite.google.com/app/apikey)でAPIキーを取得
3. APIキーを設定画面に入力して保存

### P2P共有 & ワークスペース設定

#### ワークスペースの作成（新規チーム）

1. ヘッダーの「🏢」ボタンをクリック
2. 「新規ワークスペース作成」にワークスペース名を入力
3. 「作成」ボタンをクリック
4. 表示されたワークスペースIDをチームメンバーに共有

#### ワークスペースへの参加（既存チーム）

1. ヘッダーの「🏢」ボタンをクリック
2. 「ワークスペースに参加」にワークスペースIDを入力
3. 「参加」ボタンをクリック
4. 自動的にタスクが同期されます

#### ワークスペースの切り替え

- ワークスペース一覧から任意のワークスペースをクリック
- 「📝 個人用」をクリックすると個人モードに戻ります
- **重要**: 個人用ToDoとワークスペースToDoは完全に分離されています

## 📱 使い方

### タスクの作成

1. 「➕ 新しいタスク」ボタンをクリック
2. タスク情報を入力:
   - タスク名（必須）
   - 説明、期限、優先度
   - 所要時間、タグ、技術スタック
   - 関連リンク、ファイル添付
   - 詳細メモ

### AI機能の活用

- 🤖ボタンでAIによる自動修正・提案
- タスク名の文法チェックと改善
- 技術的なタグの自動提案
- 所要時間の見積もり
- メモの構造化

### フィルタリング・検索

- **フィルター**: すべて / 未完了 / 完了
- **検索**: タスク名、説明、タグ、ライブラリで検索
- **ソート**: 作成日 / 期限 / 優先度

## 🛠️ 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite
- **P2P通信**: PeerJS
- **AI**: Google Generative AI (Gemini)
- **通知**: Web Notifications API
- **ストレージ**: localStorage
- **CLI**: ブラウザコンソールコマンドインターフェース

## 💻 CLI コマンドリファレンス

ブラウザのコンソールで `todo` オブジェクトを使用してアプリを操作できます。

### 📋 タスク管理コマンド

#### タスク一覧表示
```javascript
todo.ls()              // シンプルな一覧
todo.ls(['-a'])        // 優先度と期限も表示
todo.ls(['-l'])        // 詳細情報も表示
```

#### タスク詳細表示
```javascript
todo.show(123)         // ID 123 のタスク詳細を表示
```

#### タスク追加
```javascript
// シンプルな追加
todo.add("新しいタスク")

// オプション付き追加
todo.add("バグ修正", {
  priority: 4,
  dueDate: "2025-12-31",
  description: "本番環境のバグ修正",
  tags: ["bug", "urgent"],
  libraries: ["React", "TypeScript"],
  estimatedTime: 120,
  notes: "詳細な調査が必要"
})
```

#### タスク削除
```javascript
todo.rm(123)           // ID 123 のタスクを削除
```

#### タスク完了トグル
```javascript
todo.toggle(123)       // ID 123 のタスクの完了状態を切り替え
```

#### タスク更新
```javascript
// 優先度変更
todo.update(123, { priority: 5 })

// 複数項目を更新
todo.update(123, {
  text: "新しいタイトル",
  priority: 5,
  progress: 75
})
```

### 🔍 フィルター & 検索コマンド

#### フィルター
```javascript
todo.filter('completed')  // 完了タスクのみ
todo.filter('active')     // 未完了タスクのみ
todo.filter('overdue')    // 期限超過タスクのみ
todo.filter('urgent')     // 緊急タスク(P4-P5)のみ
```

#### タグで検索
```javascript
todo.findByTag('React')   // "React" タグのタスクを検索
todo.findByTag('bug')     // "bug" タグのタスクを検索
```

#### 統計情報
```javascript
todo.stats()              // タスク統計を表示
```

### ⚙️ 設定コマンド

#### Gemini API設定
```javascript
todo.setGeminiApiKey('YOUR_API_KEY_HERE')
```

#### P2P接続
```javascript
// P2P初期化（自分のPeer IDを取得）
todo.connectP2P()

// 特定のPeerに接続
todo.connectP2P('peer-id-here')

// P2P切断
todo.disconnectP2P()
```

### 📊 データ管理コマンド

#### エクスポート
```javascript
todo.export()             // JSON形式でタスクをコンソールに出力

// クリップボードにコピー
copy(JSON.stringify(todo.getTodos()))
```

#### インポート
```javascript
// JSON文字列からインポート
todo.import('[{"id":1,"text":"タスク1",...}]')

// 配列からインポート
todo.import([{id:1, text:"タスク1", ...}])
```

### ℹ️ ヘルプ & 情報

```javascript
todo.help()               // コマンド一覧を表示
todo.version()            // バージョン情報を表示
```

### 💡 使用例

```javascript
// 1. 緊急タスクを追加
todo.add("本番サーバーダウン対応", {
  priority: 5,
  dueDate: "2025-11-17T18:00",
  tags: ["urgent", "production"],
  estimatedTime: 180
})

// 2. 未完了の緊急タスクを確認
todo.filter('urgent')

// 3. タスクIDを確認して完了マーク
todo.toggle(1234567890)

// 4. 統計を確認
todo.stats()

// 5. Reactタグのタスクを一覧
todo.findByTag('React')

// 6. すべてのタスクを詳細表示
todo.ls(['-l'])
```

### 🎯 便利なワンライナー

```javascript
// 期限が今日のタスクを表示
todo.getTodos().filter(t => 
  t.dueDate?.startsWith(new Date().toISOString().split('T')[0])
)

// 優先度でソート
todo.getTodos().sort((a,b) => b.priority - a.priority)

// 進捗率が50%未満のタスク
todo.getTodos().filter(t => t.progress < 50)

// 完了率を計算
const todos = todo.getTodos()
console.log(`完了率: ${(todos.filter(t=>t.isCompleted).length/todos.length*100).toFixed(1)}%`)
```

## 📁 プロジェクト構造

```
src/
├── components/
│   ├── TodoItem.tsx      # タスクアイテム
│   ├── TodoList.tsx      # タスクリスト
│   ├── TodoForm.tsx      # タスク編集フォーム
│   └── Settings.tsx      # 設定画面
├── utils/
│   ├── geminiApi.ts      # Gemini API統合
│   ├── p2pSync.ts        # P2P同期
│   └── notifications.ts  # 通知管理
├── types.ts              # 型定義
├── App.tsx               # メインアプリ
└── App.css               # スタイル
```

## 🎯 対象ユーザー

- **フロントエンドエンジニア**: React、Vue、Angularプロジェクトの管理
- **バックエンドエンジニア**: API開発、データベース設計タスクの管理
- **ロボットエンジニア**: ハードウェア・ソフトウェア統合プロジェクトの管理
- **技術リード**: チーム全体のタスク管理と進捗追跡

## 🔐 プライバシー

- すべてのデータはブラウザのlocalStorageに保存
- Gemini APIキーはローカルに保存（外部送信なし）
- P2P通信は暗号化されたWebRTC接続を使用
- サーバーを介さないため、データは完全にプライベート

## 📝 ライセンス

MIT License

## 🤝 貢献

プルリクエスト歓迎！バグ報告や機能リクエストはIssueでお願いします。

---

Made with ❤️ for Engineers
