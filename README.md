# LocalGateway

本地 AI API 网关管理工具，目标是把多 Provider 聚合、路由分发、成本统计和高端管理后台做成一个可下载、解压、直接使用的本地产品。

## 当前定位

当前仓库已进入“一步到位”重构阶段，核心方向已经收口为：

- 前端完成绝大多数日常操作
- 后端提供完整 Admin API
- 支持单目录分发（download-and-run）
- Admin 采用高端 SaaS 控制台风格，而不是普通后台模板
- 首次启动、登录安全、版本状态、构建检查与发布状态都要在 Admin 中可见、可操作、可理解

## 已完成

### 后端骨架
- Go 模块结构与启动入口
- 配置加载与 SQLite 初始化
- Provider 管理服务：新增、编辑、删除、重排、测试连接、模型发现
- Local Key 管理服务：新增、编辑、吊销、轮换、续期
- Routing 服务：规则 CRUD、模型别名、路由模拟测试
- Settings 服务：系统设置保存、备份占位、分发方案输出
- 新增 Bootstrap / Security / Release 模块占位服务
- Admin API 路由骨架已扩展为前端全操作模式

### 前端后台
- React + Vite 管理后台骨架
- 亮 / 暗 / 系统主题
- 高质感视觉样式：玻璃态、渐变、层次阴影、精致面板
- Dashboard 升级为中控首页：快速操作、告警流、分发状态、实时请求流
- Providers / Keys / Routing / Settings / Quick Setup 页面升级为可操作工作台
- Analytics 升级为可切换分析工作台
- Logs 升级为检索 + 详情问题定位台
- Bootstrap 页面：首次启动向导与初始化状态
- Bootstrap Success 页面：首次启动完成页
- Initialization Guard：未初始化拦截
- Security 页面：登录与安全入口
- Release 页面：portable 分发进度与发布待办清单
- Version 页面：版本信息与当前产品状态
- Build Checks 页面：构建检查项页

### Packaging / Distribution
- 新增 `packaging/windows-portable/` 目录
- 新增便携分发规范 `SPEC.md`
- 新增 portable 包内说明 `README.txt`
- 新增 `build/embed/` 占位，准备后续将 Admin 前端嵌入 Go 二进制
- 新增 `release/` 目录用于未来发布包

## 当前未完成

受限于当前机器缺少可直接调用的 Go 环境，以下内容尚未执行真实联调：

- `go mod tidy`
- 后端真实编译与运行验证
- 真实 Provider 出站请求
- SSE 流式转发
- Bootstrap / Login / Release / Version / Build Checks 状态接口的真实联调
- Admin 前端 build 产物嵌入 Go 二进制
- 真正的单文件打包产物生成

## 产品分发目标

最终目标是生成这样的可分发目录：

```text
localgateway/
├── localgateway.exe
├── config.yaml
├── data/
│   └── localgateway.db
└── logs/
```

用户下载 zip 后：
1. 解压
2. 运行 `localgateway.exe`
3. 浏览器打开 `http://127.0.0.1:9090/admin`
4. 先经过初始化向导与管理员安全设置
5. 再在前端完成 Provider、Key、Routing、Settings 等配置

## 当前优先继续项

当 Go 环境可用后，建议优先继续：

1. 编译修正与依赖安装
2. 真实 Bootstrap / Security / Release / Version / Build Checks API 联调
3. 真实 Provider 转发与 SSE 适配
4. 前端构建与内嵌
5. 生成 Windows 可分发包

## 快速查看重点文件

### 前端入口链路
- `web/admin/src/App.tsx`
- `web/admin/src/layouts/AppShell.tsx`
- `web/admin/src/components/InitializationGuard.tsx`

### 新增页面
- `web/admin/src/pages/BootstrapPage.tsx`
- `web/admin/src/pages/BootstrapSuccessPage.tsx`
- `web/admin/src/pages/SecurityPage.tsx`
- `web/admin/src/pages/ReleaseStatusPage.tsx`
- `web/admin/src/pages/VersionInfoPage.tsx`
- `web/admin/src/pages/BuildChecksPage.tsx`

### 分发
- `packaging/windows-portable/SPEC.md`
- `packaging/windows-portable/README.txt`
- `build/embed/doc.go`
- `release/README.md`
