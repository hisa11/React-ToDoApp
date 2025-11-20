todo.getTodos().filter(t => 
# Engineer's ToDo App

現場のエンジニアが日々感じている「タスクが散らばって見通しが悪い」「技術的なメモを同じ場所で管理したい」といった悩みを解消するために作ったToDoアプリです。ブラウザだけで動作し、個人タスクから小さなチームのリアルタイム共有までを同じUIでカバーします。

<img width="1920" height="1200" alt="Image" src="https://github.com/user-attachments/assets/6c10968f-4610-4b44-8241-c47085cb3fa1" />

## クイックスタート

- 公開版: [https://hisa11.github.io/React-ToDoApp/](https://hisa11.github.io/React-ToDoApp/)
- 推奨ブラウザ: 最新の Chrome / Edge / Firefox / Safari

```
git clone https://github.com/hisa11/React-ToDoApp.git
cd React-ToDoApp
npm install
npm run dev
```

## 利用している主なライブラリ

| カテゴリ | ライブラリ | 用途 |
| --- | --- | --- |
| UI 基盤 | React 19 / React DOM | コンポーネントレンダリング |
| 言語 | TypeScript 5 | 型安全な開発 |
| ビルド | Vite 7 / @vitejs/plugin-react-swc | 高速な開発サーバーとビルド |
| AI | @google/generative-ai | Gemini API との連携 |
| P2P | PeerJS / socket.io | LAN内共有とリアルタイム同期 |
| API ランタイム | Express / cors | 最小限の同期エンドポイント |
| デプロイ | gh-pages | GitHub Pages へのデプロイ |

開発時は ESLint、TypeScript ESLint、@tailwindcss/vite などで品質とスタイルを整えています。

## 主な機能

### 基本機能
- タスクの作成・編集・削除・完了管理
- 優先度管理（P1～P5）と進捗率入力
- 期限とリマインダー設定
- タグ、技術スタック、関連リンク、添付ファイルの管理

### エンジニア向け拡張
- 技術スタックのタグ付けと検索
- タスク依存関係や所要時間のメモ欄
- CLI からの操作や JSON インポート/エクスポート

### AI アシスト（Gemini API）
- タスク名と説明文のリライト
- タグや所要時間の自動提案
- メモの構造化

### LAN 共有 (P2P)
- PeerJS を使った WebRTC 同期
- ワークスペース単位でのタスク共有
- サーバーレスで閉じたネットワーク内でも運用可能

### 通知・UX
- ブラウザ通知、締切リマインダー
- ライト/ダークテーマ切り替え
- モバイルでも使いやすいレイアウトとタッチ操作

## セットアップとコマンド

開発環境では Node.js 18 以降を想定しています。主要な npm スクリプトは以下の通りです。

```
npm run dev       # 開発サーバー
npm run build     # 本番ビルド
npm run preview   # ビルド成果物の簡易サーバー
npm run deploy    # GitHub Pages へデプロイ
```

## 設定ガイド

### Gemini API
1. 画面右上の設定ボタンを開く
2. [Google AI Studio](https://makersuite.google.com/app/apikey) で API キーを取得
3. 設定ダイアログにキーを貼り付けて保存

<img width="1920" height="1200" alt="Image" src="https://github.com/user-attachments/assets/dc930b2e-4329-4692-827d-b18e13edd6c8" />

### ワークスペースと P2P 共有

| 操作 | 手順 |
| --- | --- |
| 新規ワークスペース | ヘッダーのワークスペースボタン → 「新規作成」 → 名前を入力して作成 → 表示された ID を共有 |
| 参加 | 同じボタンから「参加」を選択し、共有された ID を入力 |
| 個人モードへ戻る | ワークスペース一覧で「個人用」を選択 |

個人用タスクとワークスペースタスクはデータが完全に分離されます。

## アプリの使い方

### タスク作成
1. 画面上部の「新しいタスク」ボタンを押す
2. タスク名を入力（必須）
3. 必要に応じて説明、期限、優先度、進捗率、タグ、技術スタック、関連リンク、ファイル、詳細メモを追加

### AI アシスト
- フォーム内の AI ボタンを押すと、現在の入力をもとに文章の提案や推敲が走ります
- タグや工数のヒントも返ってくるので、ラフな入力から整えたいときに便利です

### 検索とフィルタ
- フィルタ: すべて / 未完了 / 完了
- 並び替え: 作成日 / 期限 / 優先度
- 検索バー: タスク名、説明、タグ、技術スタックを横断検索

## CLI での操作

開発者向けにブラウザコンソールから `todo` オブジェクトを操作できます。以下は一部抜粋です。

```javascript
todo.ls(['-l'])        // 詳細付きで一覧
todo.add('新しいタスク', { priority: 4 })
todo.update(123, { progress: 80 })
todo.filter('overdue')
todo.export()          // JSON をコンソールに出力
todo.import('[{"id":1,"text":"Sample"}]')
todo.setGeminiApiKey('sk-xxxxx')
todo.connectP2P()
```

より詳しいコマンド例は `src/utils/cli.ts` とアプリ内ヘルプ (`todo.help()`) を参照してください。

## プロジェクト構造

```
src/
├── components/
│   ├── TodoItem.tsx
│   ├── TodoList.tsx
│   ├── TodoForm.tsx
│   ├── Settings.tsx
│   └── WorkspaceManager.tsx
├── utils/
│   ├── geminiApi.ts
│   ├── p2pSync.ts
│   ├── notifications.ts
│   └── cli.ts
├── App.tsx
├── App.css
└── main.tsx
```

## プライバシーとデータの扱い

- タスクデータはブラウザの localStorage に保存され、外部に送信されません
- Gemini API キーはローカル設定として保持し、アプリ外へは送信しません
- P2P 通信は暗号化された WebRTC 経由で、サーバーを介さず端末間でやり取りします

## 対象ユーザー

- 個人開発者: 小規模プロジェクトのタスク整理とメモ
- チームリーダー: ワークスペース機能を使った進捗共有
- ロボット/ハードウェアエンジニア: ソフト/ハード混在タスクの管理

## 開発メモ

2024/10/30 〜 2024/11/18 の約 45 時間で初期版を構築しました。今後も「現場の人が実際に助かること」を優先して改善していきます。
