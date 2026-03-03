#!/bin/bash
# 个人邮局一键部署脚本
# 用法：./deploy.sh ["提交说明"]

set -e

SERVER="root@143.14.120.22"
REMOTE_DIR="/www/wwwroot/two.edu.kg"
REACT_DIR="/Users/two/Documents/代码/ppo-react"
COMMIT_MSG="${1:-update: $(date '+%Y-%m-%d %H:%M')}"

echo "════════════════════════════════════"
echo "  个人邮局 · 一键发布"
echo "════════════════════════════════════"

# ── 第一步：构建 ──────────────────────────
echo ""
echo "🔨 [1/3] 构建 React 项目..."
cd "$REACT_DIR"

# 确保 arm64 和 x64 两个 native 包都存在（Claude Code 用 x64，终端用 arm64）
ROLLUP_VER=$(node -e "console.log(require('./node_modules/rollup/package.json').version)" 2>/dev/null || echo "")
for ARCH in rollup-darwin-arm64 rollup-darwin-x64; do
  if [ ! -d "node_modules/@rollup/$ARCH" ] && [ -n "$ROLLUP_VER" ]; then
    echo "  → 修复 @rollup/$ARCH..."
    npm pack @rollup/$ARCH@$ROLLUP_VER --pack-destination /tmp/ --silent 2>/dev/null
    mkdir -p "node_modules/@rollup/$ARCH"
    tar -xzf "/tmp/rollup-$ARCH-$ROLLUP_VER.tgz" -C "node_modules/@rollup/$ARCH" --strip-components=1 2>/dev/null || true
  fi
done

npm run build
echo "✅ 构建完成"

# ── 第二步：提交到 GitHub ─────────────────
echo ""
echo "📦 [2/3] 同步到 GitHub..."

# 确保在 react-app 分支
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$BRANCH" != "react-app" ]; then
  git checkout -B react-app 2>/dev/null || git checkout react-app
fi

git add -A
# 检查是否有变更
if git diff --cached --quiet; then
  echo "  → 没有新的变更，跳过提交"
else
  git commit -m "$COMMIT_MSG"
  git push -u origin react-app
  echo "✅ 已推送到 GitHub (react-app 分支)"
fi

# ── 第三步：部署到服务器 ──────────────────
echo ""
echo "🚀 [3/3] 部署到服务器..."

# 上传 dist 文件（不上传 PHP 后端，保留服务器上的）
scp -r "$REACT_DIR/../Personal Post Office/dist/." "$SERVER:$REMOTE_DIR/"

# 配置 Nginx 并重载
ssh "$SERVER" bash << 'ENDSSH'
# 写入 Nginx 配置（支持 React Router history 模式）
cat > /www/server/panel/vhost/nginx/two.edu.kg.conf << 'NGINX'
server {
    listen 80;
    server_name two.edu.kg;
    root /www/wwwroot/two.edu.kg;
    index index.html;
    charset utf-8;

    # PHP API 接口
    location ~ ^/api/.*\.php$ {
        fastcgi_pass unix:/tmp/php-cgi-82.sock;
        fastcgi_index index.php;
        include fastcgi.conf;
    }

    # React Router - 所有路由返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

nginx -t && nginx -s reload
ENDSSH

echo ""
echo "════════════════════════════════════"
echo "🎉 部署完成！"
echo "   http://two.edu.kg"
echo "════════════════════════════════════"
