# LocalGateway Git Workflow

## 当前原则

- 仓库启用 Git 管控
- 仅在你明确要求时执行提交
- 不做自动 commit
- 源码、配置模板、文档、脚本进入版本控制
- 运行数据、日志、打包产物、临时文件不进入版本控制

## 推荐纳管范围

### 应纳入 Git

- `cmd/`
- `internal/`
- `configs/`
- `migrations/`
- `packaging/`
- `scripts/`
- `web/admin/src/`
- `web/admin/public/`
- `web/admin/package.json`
- `web/admin/package-lock.json`
- `web/admin/tsconfig.json`
- `web/admin/vite.config.ts`
- `go.mod`
- `go.sum`
- `README.md`
- `.gitignore`
- `build/package.ps1`
- `build/embed/doc.go`

### 不应纳入 Git

- `data/`
- `logs/`
- `build/portable/`
- `build/embed/admin/`
- `web/admin/dist/`
- `node_modules/`
- `*.exe`
- `*.log`
- `err.txt`
- `out.txt`

## 推荐提交节奏

- 一个明确功能块完成后提交一次
- README / 文档整理可单独成一个提交
- 打包脚本、分发结构、配置逻辑这类基础设施改动建议单独提交
- 大规模重构前先 `git status`

## 常用命令

```powershell
git status
git add .
git commit -m "feat: ..."
git log --oneline --decorate -n 10
```

## 当前建议提交分组

### 提交 1：core backend packaging
- SQLite 驱动切换到纯 Go
- 配置路径自动探测
- 前端 embed 接入
- SPA fallback 支持
- package.ps1 打包脚本

### 提交 2：admin pages
- Bootstrap / Bootstrap Success / Initialization Guard
- Security / Release / Version / Build Checks 页面
- AppShell / 路由 / store / 样式同步更新

### 提交 3：docs
- README 重构
- STARTUP 文档更新
- Git workflow 文档更新
