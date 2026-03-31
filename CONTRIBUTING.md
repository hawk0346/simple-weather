# Contributing

## GH_TOKEN セットアップ

PR レビュースクリプト (`scripts/pr-review.sh`) の利用に必要。

### 1. トークン発行

https://github.com/settings/tokens?type=beta で Fine-grained token を作成。

- **Repository access**: 「Only select repositories」で対象リポジトリを選択
- **Permissions**: Pull requests → **Read & Write**

### 2. WSL 側に登録

```bash
echo 'export GH_TOKEN="ghp_xxxx"' >> ~/.bashrc
source ~/.bashrc
```

登録後、VS Code で `Dev Containers: Rebuild Container` を実行。

### 3. トークン更新（期限切れ時）

スクリプト実行時に「GH_TOKEN の有効期限が切れています」と表示されたら:

1. 上記 URL で新しいトークンを発行
2. WSL ターミナルで:
   ```bash
   sed -i 's/^export GH_TOKEN=.*/export GH_TOKEN="新しいトークン"/' ~/.bashrc
   source ~/.bashrc
   ```
3. Dev Container を Rebuild
