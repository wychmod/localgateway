# LocalGateway Git Workflow

## 当前约定

- 仓库已启用 Git 管控
- 当前由我在你明确要求时执行提交
- 不启用自动 commit，避免把半成品改动直接写进历史

## 推荐提交节奏

- 一个明显功能块完成后提交一次
- 大改动前先看状态
- 分发与运行目录不纳入版本控制：`data/`、`logs/`、发布包产物

## 常用命令

```powershell
git status
git add .
git commit -m "feat: ..."
git log --oneline --decorate -n 10
```
