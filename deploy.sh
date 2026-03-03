#!/bin/bash
# 个人邮局一键部署脚本
# 用法：./deploy.sh ["提交说明"]
# 原理：构建 → 把 dist 复制到 Personal Post Office 仓库 → push → 服务器 git pull

set -e

REACT_DIR="/Users/two/Documents/代码/ppo-react"
SITE_DIR="/Users/two/Documents/代码/Personal Post Office"
COMMIT_MSG="${1:-update: $(date '+%Y-%m-%d %H:%M')}"

echo "════════════════════════════════════"
echo "  个人邮局 · 一键发布"
echo "════════════════════════════════════"

# ── 第一步：构建 ──────────────────────────
echo ""
echo "🔨 [1/3] 构建 React 项目..."
cd "$REACT_DIR"

# 确保两种架构的 rollup native 包都存在
ROLLUP_VER=$(node -e "console.log(require('./node_modules/rollup/package.json').version)" 2>/dev/null || echo "")
if [ -n "$ROLLUP_VER" ]; then
  for ARCH in rollup-darwin-arm64 rollup-darwin-x64; do
    if [ ! -d "node_modules/@rollup/$ARCH" ]; then
      echo "  → 修复 @rollup/$ARCH..."
      npm pack @rollup/$ARCH@$ROLLUP_VER --pack-destination /tmp/ --silent 2>/dev/null || true
      mkdir -p "node_modules/@rollup/$ARCH"
      tar -xzf "/tmp/rollup-$ARCH-$ROLLUP_VER.tgz" -C "node_modules/@rollup/$ARCH" --strip-components=1 2>/dev/null || true
    fi
  done
fi

npm run build
echo "✅ 构建完成 → dist 已生成"

# ── 第二步：推送到 GitHub ──────────────────
echo ""
echo "📦 [2/3] 推送到 GitHub..."

# ppo-react 仓库推送源码（react-app 分支）
cd "$REACT_DIR"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "none")
[ "$BRANCH" != "react-app" ] && git checkout -B react-app
git add -A
if ! git diff --cached --quiet; then
  git commit -m "$COMMIT_MSG"
  git push -u origin react-app
  echo "  ✅ 源码已推送 (react-app 分支)"
else
  echo "  → 源码无变更"
fi

# Personal Post Office 仓库推送（含 dist，服务器从这里 pull）
cd "$SITE_DIR"
git add -A
if ! git diff --cached --quiet; then
  git commit -m "$COMMIT_MSG"
  git push origin main
  echo "  ✅ 站点已推送 (main 分支，含 dist)"
else
  echo "  → 站点无变更"
fi

# ── 第三步：提示服务器部署命令 ────────────
echo ""
echo "🚀 [3/3] 在服务器 SSH 中执行："
echo ""
echo "  cd /www/wwwroot/two.edu.kg && git pull origin main"
echo ""
echo "════════════════════════════════════"
echo "🎉 推送完成！去服务器执行上面那条命令"
echo "   站点：http://two.edu.kg"
echo "════════════════════════════════════"
