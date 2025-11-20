# Supabase セットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト設定から以下の情報を取得：
   - Project URL
   - Anon/Public Key

## 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下を記載：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`.env.local.example` を参考にしてください。

## 3. Google OAuth設定

### Supabase側の設定

1. Supabaseダッシュボードで `Authentication` → `Providers` を開く
2. `Google` プロバイダーを有効化
3. Google Cloud Consoleで取得した以下の情報を入力：
   - Client ID
   - Client Secret

### Google Cloud Console側の設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. `APIとサービス` → `認証情報` を開く
4. `認証情報を作成` → `OAuthクライアントID` を選択
5. アプリケーションの種類: `ウェブアプリケーション` を選択
6. 承認済みのリダイレクトURIに以下を追加：
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   （your-project-refはSupabaseプロジェクトの参照IDに置き換える）
7. 作成後、Client IDとClient Secretをコピー
8. Supabaseのプロバイダー設定に貼り付け

## 4. 開発サーバーの起動

```bash
npm run dev
```

## 5. ログイン機能の確認

1. ブラウザで `http://localhost:3000/login` にアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントでログイン
4. ログイン後、トップページにリダイレクトされます

## トラブルシューティング

### リダイレクトURIのエラー

- Google Cloud ConsoleのリダイレクトURIが正しく設定されているか確認
- Supabaseのプロジェクト参照IDが正しいか確認

### 環境変数が読み込まれない

- `.env.local` ファイルがプロジェクトルートにあるか確認
- 開発サーバーを再起動

### ログイン後にリダイレクトされない

- `app/auth/callback/route.ts` が正しく配置されているか確認
- ブラウザのコンソールでエラーを確認





