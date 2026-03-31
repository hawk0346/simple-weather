#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# pr-review.sh — PR レビューコメント管理スクリプト
#
# Usage:
#   ./scripts/pr-review.sh status              PR の概要表示
#   ./scripts/pr-review.sh list                未解決コメント一覧
#   ./scripts/pr-review.sh list --all          全コメント一覧
#   ./scripts/pr-review.sh show <thread_id>    スレッド詳細表示
#   ./scripts/pr-review.sh reply <comment_id> "message"  返信
#   ./scripts/pr-review.sh resolve <thread_id> スレッドをリゾルブ
#   ./scripts/pr-review.sh unresolve <thread_id> リゾルブ解除
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# --- helpers ------------------------------------------------

die() { echo -e "${RED}Error: $*${RESET}" >&2; exit 1; }

require_gh() {
  command -v gh >/dev/null 2>&1 || die "gh CLI が見つかりません。devcontainer を再ビルドしてください。"

  local auth_output
  if ! auth_output=$(gh auth status 2>&1); then
    if echo "$auth_output" | grep -qi "token.*expired\|401\|bad credentials"; then
      die "GH_TOKEN の有効期限が切れています。GitHub で新しいトークンを発行し、WSL 側の ~/.bashrc を更新してください。
  1. https://github.com/settings/tokens?type=beta でトークンを再発行
  2. WSL ターミナルで: sed -i 's/^export GH_TOKEN=.*/export GH_TOKEN=\"新しいトークン\"/' ~/.bashrc && source ~/.bashrc
  3. Dev Container を Rebuild"
    else
      die "gh 未認証です。GH_TOKEN 環境変数を設定するか、gh auth login を実行してください。
  セットアップ手順は CLAUDE.md の「GH_TOKEN セットアップ」を参照してください。"
    fi
  fi
}

# 現在のブランチに紐づく PR 番号を取得
get_pr_number() {
  local pr_num
  pr_num=$(gh pr view --json number --jq '.number' 2>/dev/null) || die "現在のブランチに紐づく PR が見つかりません。"
  echo "$pr_num"
}

get_repo_nwo() {
  gh repo view --json nameWithOwner --jq '.nameWithOwner'
}

# --- status -------------------------------------------------

cmd_status() {
  local pr_num
  pr_num=$(get_pr_number)
  local nwo
  nwo=$(get_repo_nwo)
  local owner="${nwo%%/*}"
  local repo="${nwo##*/}"

  echo -e "${BOLD}=== PR #${pr_num} ステータス ===${RESET}"
  echo ""

  gh pr view "$pr_num" --json title,state,reviewDecision,statusCheckRollup,reviews,url \
    --template '{{.url}}
タイトル: {{.title}}
状態:     {{.state}}
レビュー: {{.reviewDecision}}
{{if .statusCheckRollup}}
チェック:
{{range .statusCheckRollup}}  {{if eq .status "COMPLETED"}}{{if eq .conclusion "SUCCESS"}}✅{{else}}❌{{end}}{{else}}⏳{{end}} {{.name}} ({{.conclusion}})
{{end}}{{end}}'

  echo ""

  # 未解決スレッド数
  local unresolved
  unresolved=$(gh api graphql -f query='
    query($pr: Int!, $owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pr) {
          reviewThreads(first: 100) {
            nodes { isResolved }
          }
        }
      }
    }' \
    -F pr="$pr_num" \
    -F owner="$owner" \
    -F repo="$repo" \
    --jq '[.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)] | length')

  echo -e "未解決コメント: ${YELLOW}${unresolved}${RESET} 件"
}

# --- list ---------------------------------------------------

cmd_list() {
  local show_all=false
  [[ "${1:-}" == "--all" ]] && show_all=true

  local pr_num
  pr_num=$(get_pr_number)
  local nwo
  nwo=$(get_repo_nwo)
  local owner="${nwo%%/*}"
  local repo="${nwo##*/}"

  echo -e "${BOLD}=== PR #${pr_num} レビューコメント ===${RESET}"
  echo ""

  local query='
    query($pr: Int!, $owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pr) {
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
              isOutdated
              path
              line
              comments(first: 5) {
                nodes {
                  id
                  author { login }
                  body
                  createdAt
                }
              }
            }
          }
        }
      }
    }'

  local result
  result=$(gh api graphql -f query="$query" \
    -F pr="$pr_num" \
    -F owner="$owner" \
    -F repo="$repo")

  echo "$result" | jq -r --arg show_all "$show_all" '
    .data.repository.pullRequest.reviewThreads.nodes[]
    | select($show_all == "true" or .isResolved == false)
    | . as $thread
    | .comments.nodes[0] as $first
    | [
        (if .isResolved then "  ✅ [RESOLVED]" else "  ❌ [OPEN]    " end),
        " Thread: \($thread.id)",
        " File:   \($thread.path // "N/A"):\($thread.line // "?")",
        " Author: \($first.author.login // "unknown")",
        " Date:   \($first.createdAt // "")",
        "",
        "  \($first.body // "" | split("\n") | join("\n  "))",
        (if ($thread.comments.nodes | length) > 1 then
          "  ... +\(($thread.comments.nodes | length) - 1) replies"
        else "" end),
        "",
        "  ─────────────────────────────────────────────"
      ]
    | join("\n")'
}

# --- show ---------------------------------------------------

cmd_show() {
  local thread_id="${1:-}"
  [[ -z "$thread_id" ]] && die "Usage: $0 show <thread_id>"

  local pr_num
  pr_num=$(get_pr_number)
  local nwo
  nwo=$(get_repo_nwo)
  local owner="${nwo%%/*}"
  local repo="${nwo##*/}"

  local query='
    query($pr: Int!, $owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pr) {
          reviewThreads(first: 100) {
            nodes {
              id
              isResolved
              path
              line
              diffSide
              comments(first: 50) {
                nodes {
                  id
                  author { login }
                  body
                  createdAt
                }
              }
            }
          }
        }
      }
    }'

  local result
  result=$(gh api graphql -f query="$query" \
    -F pr="$pr_num" \
    -F owner="$owner" \
    -F repo="$repo")

  echo "$result" | jq -r --arg tid "$thread_id" '
    .data.repository.pullRequest.reviewThreads.nodes[]
    | select(.id == $tid)
    | "=== Thread: \(.id) ===",
      "Status: \(if .isResolved then "✅ Resolved" else "❌ Open" end)",
      "File:   \(.path // "N/A"):\(.line // "?")",
      "",
      (.comments.nodes[] |
        "┌─ \(.author.login // "unknown") (\(.createdAt // ""))  [Comment ID: \(.id)]",
        "│",
        (.body // "" | split("\n")[] | "│  \(.)"),
        "│",
        "└────────────────────────────────"
      )'
}

# --- reply --------------------------------------------------

cmd_reply() {
  local comment_id="${1:-}"
  local body="${2:-}"
  [[ -z "$comment_id" || -z "$body" ]] && die "Usage: $0 reply <comment_id> \"message\""

  local pr_num
  pr_num=$(get_pr_number)

  # comment_id から REST API の数値 ID を判定
  # GraphQL の node_id の場合は REST 経由で返信する必要がある
  # gh api で PR レビューコメントへの返信を行う
  local nwo
  nwo=$(get_repo_nwo)

  # GraphQL node ID → REST numeric ID の変換
  local numeric_id
  if [[ "$comment_id" =~ ^[0-9]+$ ]]; then
    numeric_id="$comment_id"
  else
    # node_id から REST ID を取得
    numeric_id=$(gh api graphql -f query='query($id: ID!) { node(id: $id) { ... on PullRequestReviewComment { databaseId } } }' \
      -F id="$comment_id" \
      --jq '.data.node.databaseId') || die "コメント ID の変換に失敗しました: $comment_id"
  fi

  [[ -n "$numeric_id" && "$numeric_id" != "null" ]] || die "有効なコメント ID ではありません: $comment_id (スレッド ID ではなくコメント ID を指定してください)"

  gh api "repos/${nwo}/pulls/${pr_num}/comments/${numeric_id}/replies" \
    -f body="$body" \
    --jq '"✅ 返信しました (ID: \(.id))"'
}

# --- resolve / unresolve ------------------------------------

cmd_resolve() {
  local thread_id="${1:-}"
  [[ -z "$thread_id" ]] && die "Usage: $0 resolve <thread_id>"

  gh api graphql -f query='
    mutation($threadId: ID!) {
      resolveReviewThread(input: {threadId: $threadId}) {
        thread { isResolved }
      }
    }' -F threadId="$thread_id" \
    --jq 'if .data.resolveReviewThread.thread.isResolved then "✅ スレッドをリゾルブしました" else "❌ リゾルブに失敗しました" end'
}

cmd_unresolve() {
  local thread_id="${1:-}"
  [[ -z "$thread_id" ]] && die "Usage: $0 unresolve <thread_id>"

  gh api graphql -f query='
    mutation($threadId: ID!) {
      unresolveReviewThread(input: {threadId: $threadId}) {
        thread { isResolved }
      }
    }' -F threadId="$thread_id" \
    --jq 'if .data.unresolveReviewThread.thread.isResolved == false then "✅ リゾルブを解除しました" else "❌ 解除に失敗しました" end'
}

# --- usage --------------------------------------------------

cmd_usage() {
  cat <<EOF
PR レビューコメント管理ツール

Usage:
  $(basename "$0") <command> [args]

Commands:
  status                    PR の概要・チェック状態・未解決数を表示
  list [--all]              未解決のレビューコメント一覧（--all で全件）
  show <thread_id>          スレッドの全コメントを表示
  reply <comment_id> "msg"  コメントに返信
  resolve <thread_id>       スレッドをリゾルブ
  unresolve <thread_id>     リゾルブを解除

Tips:
  - thread_id / comment_id は list コマンドの出力からコピーできます
  - GH_TOKEN 環境変数を設定するか、gh auth login で認証してください
EOF
}

# --- main ---------------------------------------------------

main() {
  local cmd="${1:-}"
  shift || true

  case "$cmd" in
    help|--help|-h|"")  cmd_usage; return ;;
  esac

  require_gh

  case "$cmd" in
    status)    cmd_status "$@" ;;
    list)      cmd_list "$@" ;;
    show)      cmd_show "$@" ;;
    reply)     cmd_reply "$@" ;;
    resolve)   cmd_resolve "$@" ;;
    unresolve) cmd_unresolve "$@" ;;
    *)         die "Unknown command: $cmd\n$(cmd_usage)" ;;
  esac
}

main "$@"
