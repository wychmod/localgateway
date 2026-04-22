# LocalGateway

<p align="center">
  <img alt="Go" src="https://img.shields.io/badge/Go-1.22%2B-00ADD8?style=for-the-badge&logo=go&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-Pure%20Go-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img alt="Platform" src="https://img.shields.io/badge/Platform-Windows%20Portable-4B5563?style=for-the-badge" />
</p>

<p align="center">
  <strong>一个面向本地部署场景的 AI API 网关与管理平台。</strong>
</p>

<p align="center">
  聚合多 Provider、统一 OpenAI 风格入口、提供高质感 Admin 控制台，支持单目录分发，解压即可运行。
</p>

<p align="center">
  <a href="#为什么是-localgateway">为什么是 LocalGateway</a> ·
  <a href="#亮点速览">亮点速览</a> ·
  <a href="#核心能力">核心能力</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#如何使用">如何使用</a> ·
  <a href="#系统架构">系统架构</a> ·
  <a href="#开发指南">开发指南</a> ·
  <a href="#faq">FAQ</a>
</p>

---

## 为什么是 LocalGateway

很多本地 AI 工具都有同一个问题：

- 接口分散，Provider 各有各的地址与鉴权方式
- 配置零碎，要么全靠环境变量，要么全靠手工改文件
- 管理体验粗糙，日常维护像是在和一堆脚本掰手腕
- 分发复杂，用户常常还没跑起来，热情已经先被依赖环境磨掉一半

**LocalGateway** 想解决的，就是这类“能用，但不好用”的工程现实。

它把本地网关、配置管理、Provider 管理、模型路由和可视化后台收敛到一个项目里，目标不是做一个“开发者才能驾驭”的半成品，而是做成一个：

> **可以下载、可以解压、可以直接运行、也可以长期维护的本地 AI 网关产品。**

一句话概括：

**LocalGateway = 本地 AI 能力的统一入口 + 可视化控制台 + 便携式交付体验。**

---

## 亮点速览

- **统一入口**：将多 Provider 能力收敛到一个本地网关层
- **控制台优先**：尽量把日常配置、检查、管理动作都放进 Admin
- **Windows 友好**：偏向本地、便携、低依赖的使用体验
- **纯 Go SQLite**：无需 CGO，更适合可分发场景
- **嵌入式前端**：Admin 构建后可直接嵌入二进制交付
- **产品感导向**：不是脚本集合，而是朝真正可交付工具打磨

---

## 项目定位

LocalGateway 适合以下场景：

- 想在本地统一管理多个 AI Provider
- 想暴露一致的 API 地址给上层应用或内部工具
- 想通过 Web 后台完成配置，而不是频繁改配置文件
- 想把整个系统做成便携包，交给团队成员或最终用户直接使用
- 想在 Windows 环境里尽量减少额外依赖，降低部署门槛

它强调三件事：

1. **统一入口**：把多 Provider 能力整理到同一个网关层。
2. **前端优先**：尽量让所有日常操作都能在 Admin 中完成。
3. **便携交付**：通过 Go + 嵌入式前端实现单目录运行，少折腾环境，多解决问题。

---

## 核心能力

### 1. 统一 AI API 网关
- 提供统一的网关访问入口
- 面向 OpenAI 风格接口进行兼容设计
- 支持多 Provider 聚合接入的扩展方向
- 支持模型发现、模型别名、路由分发等能力演进

### 2. 高质感 Admin 控制台
- 基于 React + Vite + TypeScript 构建
- 提供 Dashboard、Providers、Keys、Routing、Settings、Logs、Analytics 等页面
- 已补齐 Bootstrap、Security、Release、Version、Build Checks 等产品化页面
- 前端视觉方向不是“能看就行”，而是偏向真正可交付的桌面级 SaaS 体验

### 3. 便携式分发
- Admin 前端资源内嵌到 Go 二进制
- 可组合为单目录便携包
- 用户无需单独安装 Node.js 或 Go，即可日常运行
- 更适合内部分发、私有部署、离线环境或半离线环境使用

### 4. 纯 Go SQLite 方案
- 使用 `glebarez/sqlite`
- 无需 CGO
- 无需额外 C 编译环境
- 对 Windows 分发更友好，减少环境不一致带来的麻烦

### 5. SPA 与嵌入式前端支持
- `/admin/` 可直接访问
- `/admin/*` 支持 SPA fallback
- 前端构建产物可以嵌入后端并随二进制一起交付

---

## 当前进度

> 当前仓库已经具备“本地网关 + 管理后台 + 便携分发形态”的基础骨架，正在从可运行逐步推进到可联调、可发布、可长期维护。

### 已完成

#### 后端
- [x] Go 项目骨架与启动入口
- [x] 配置加载与自动路径探测
- [x] SQLite 数据持久化能力
- [x] Provider 管理服务骨架
- [x] Local Key 管理服务骨架
- [x] Routing 规则与模型别名服务骨架
- [x] Settings 保存与分发信息输出
- [x] Admin API 路由扩展
- [x] Admin 前端嵌入二进制
- [x] Portable 单目录形态验证

#### 前端
- [x] Admin 控制台基础框架
- [x] Dashboard 中控页
- [x] Providers / Keys / Routing / Settings 页面
- [x] Analytics / Logs 页面
- [x] Bootstrap 初始化页
- [x] Bootstrap Success 完成页
- [x] Initialization Guard 未初始化拦截
- [x] Security 页面
- [x] Release 页面
- [x] Version 页面
- [x] Build Checks 页面

### 仍在推进
- [ ] 真实 Provider 出站调用
- [ ] SSE 流式转发
- [ ] Bootstrap / Security / Release / Version / Build Checks 真实状态接口联调
- [ ] 前后端真实数据联调
- [ ] ZIP 分发包输出与发布流程固化

---

## 快速开始

### 默认访问地址

启动成功后，默认可访问：

- Admin 控制台：`http://127.0.0.1:18743/admin`
- 健康检查：`http://127.0.0.1:18743/health`
- 模型列表：`http://127.0.0.1:18743/v1/models`

### 方式一：开发模式启动

适合联调与日常开发。

```powershell
cd D:\idea\localgateway
D:\Go\bin\go.exe run .\cmd\localgateway
```

### 方式二：编译后启动

```powershell
cd D:\idea\localgateway
D:\Go\bin\go.exe build -o localgateway.exe .\cmd\localgateway
.\localgateway.exe
```

### 方式三：便携目录直接启动

```powershell
cd D:\idea\localgateway\build\portable\LocalGateway
.\localgateway.exe
```

这一种最接近最终用户的真实使用方式。

默认情况下，程序启动成功后会自动打开：

- `http://127.0.0.1:18743/admin`

在 Windows 下会优先尝试使用 **Chrome** 打开管理页面；如果本机未安装 Chrome，则会回退到系统默认浏览器。

同时，正式打包出来的 `.exe` 会以更接近桌面产品的方式运行：

- 启动时不弹出控制台黑窗口
- 常驻系统托盘
- 可通过托盘菜单再次打开管理后台
- 可通过托盘菜单主动退出程序

如果你需要保留命令行窗口用于开发调试，可以继续使用：

```powershell
go run .\cmd\localgateway
```



### 方式四：Wails 桌面版启动

如果你希望直接以桌面应用窗口运行，而不是打开浏览器，可以使用 Wails 桌面版：

```powershell
cd D:\idea\localgateway
wails dev
```

或者直接构建桌面版：

```powershell
cd D:\idea\localgateway
.\build\desktop.ps1
```

构建完成后输出：

- Windows：`build\bin\LocalGateway.exe`
- macOS：通过 GitHub Actions 构建 `LocalGateway.app`

桌面版当前已经具备：

- 无边框窗口与自定义标题栏
- 毛玻璃 / 半透明背景（Windows Mica、macOS translucent）
- 系统菜单
- `Ctrl/⌘ + Shift + L` 快捷打开日志页
- 原生通知链路
- 高峰值信息通过 Wails bindings 直接获取（如版本、桌面状态）

---

## 双版本说明

当前仓库同时维护两种运行模式：

| 模式 | 入口 | 特点 |
|------|------|------|
| 浏览器版 | `cmd/localgateway/main.go` | 托盘常驻、自动开浏览器、适合便携分发 |
| 桌面版 | 根目录 `main.go` + `app.go` | Wails 独立窗口、双端打包、支持桌面级交互 |

两者共用：

- 同一套 `internal/` Go 后端服务
- 同一套 `web/admin/` React 前端代码
- 同一份配置与数据库逻辑

因此后续功能开发基本只需要维护一套业务代码，桌面能力按需叠加即可。

---

## 桌面版构建说明

### 本地 Windows

```powershell
.\build\desktop.ps1
```

### GitHub Actions 双端构建

仓库已经提供：

- `.github/workflows/build-desktop.yml`

当推送 `v*` tag 时，会自动：

- 在 Windows runner 构建 `LocalGateway.exe`
- 在 macOS runner 构建 `LocalGateway.app`

---

## Wails 桌面增强能力

当前桌面版除了把页面装进窗口里，还额外补齐了几类真正有产品感的桌面特性：

### 1. 自定义窗口边框与标题栏
- 无边框窗口（Frameless）
- 自定义标题栏按钮：最小化 / 最大化 / 关闭
- 玻璃质感与毛玻璃风格背景
- 保持和现有高端暗色 UI 一致的视觉语言

### 2. 系统菜单、托盘与快捷键
- 系统菜单可直接打开管理后台、发送测试通知、退出应用
- 托盘菜单与桌面窗口动作已统一：显示主窗口 / 隐藏到托盘 / 打开后台 / 退出程序
- 关闭窗口默认改为“隐藏到托盘”，更符合桌面常驻工具习惯
- 前端已支持 `Ctrl/⌘ + Shift + L` 快捷打开日志页
- 后续可以继续扩展更多全局快捷键或窗口命令

### 3. 原生通知与窗口状态恢复
- 桌面版支持通过 Wails runtime 派发桌面通知事件
- 前端可以触发原生通知能力，用于保存成功、启动完成、告警提示等场景
- 已支持记录并恢复窗口状态：窗口大小、是否最大化、最后停留页面
- 启动后会自动尝试恢复上次页面位置，减少每次重进的重复操作

### 4. Wails Bindings 渐进替换 HTTP
- 当前已把版本号、桌面状态、运行摘要、基础配置摘要、自检能力切到 Wails bindings
- 这种方式比绕一圈 HTTP 更轻，适合窗口状态、系统信息、桌面命令等场景
- 后续可以继续把更多“桌面特有能力”走 bindings，把业务 API 继续保留 HTTP


这个分层方式比较稳：

- **业务数据接口**：继续走 HTTP Router，方便浏览器版和桌面版共用
- **桌面能力接口**：走 Wails bindings，减少多余网络层并提升桌面交互体验

### 5. 发布前检查器
- 桌面版已内置真正的发布前检查器，不再只是运行态提示
- 当前可检查：Provider 配置、本地数据库可写性、管理后台资源、监听端口可达性、打包资源完整性
- 构建检查页会直接展示结构化检查结果、详细原因和警告项
- 适合在正式打包前快速确认“这次产物是否具备发布条件”

### 1. 启动服务
先按上面的任意方式启动程序。

启动后，建议先访问：

- `http://127.0.0.1:18743/admin`

如果是第一次运行，通常会先进入初始化或引导相关流程页面。

### 2. 打开 Admin 控制台
在 Admin 中，你可以逐步完成以下管理动作：

- 查看系统概览与运行状态
- 管理 Provider 信息
- 管理本地密钥或访问凭证
- 维护模型别名与路由策略
- 检查安全、版本、构建与发布状态
- 进入设置页调整系统行为

### 3. 通过网关访问模型
当前项目已经提供统一的模型列表与基础 API 入口能力，适合作为上层应用的本地中转层或统一入口层。

典型调用思路是：

1. 上层应用请求 LocalGateway 暴露的统一地址
2. LocalGateway 根据配置与路由策略处理请求
3. 再由后端进一步决定模型映射、Provider 分发与后续转发逻辑

### 4. 修改配置
配置加载优先级如下：

1. `LG_CONFIG` 环境变量指定的配置文件
2. 当前工作目录下的 `config.yaml`
3. 默认配置：`configs/config.example.yaml`

一个最小配置示例如下：

```yaml
server:
  host: "127.0.0.1"
  port: 18743
  admin_path: "/admin"
```

你可以通过配置文件控制：

- 服务监听地址与端口
- Admin 访问路径
- 管理认证信息
- 数据库存储位置
- 路由策略与 fallback 机制

---

## 系统架构

```text
┌──────────────────────────────────────────────────────────────┐
│                        Client / Upstream                    │
│      CLI / App / Script / Internal Tool / AI Workflow       │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                        LocalGateway                          │
│                                                              │
│  ┌────────────────────┐   ┌──────────────────────────────┐   │
│  │   Admin Console    │   │        HTTP Gateway          │   │
│  │ React + Vite SPA   │   │  OpenAI-style API entrance   │   │
│  └─────────┬──────────┘   └──────────────┬───────────────┘   │
│            │                             │                   │
│            ▼                             ▼                   │
│  ┌────────────────────┐   ┌──────────────────────────────┐   │
│  │ Config / Settings  │   │ Routing / Alias / Provider   │   │
│  │ Bootstrap / Guard  │   │ Selection / Forwarding Flow  │   │
│  └─────────┬──────────┘   └──────────────┬───────────────┘   │
│            │                             │                   │
│            └──────────────┬──────────────┘                   │
│                           ▼                                  │
│              ┌───────────────────────────┐                   │
│              │  SQLite / Local Storage   │                   │
│              └───────────────────────────┘                   │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
                   External AI Providers / Model APIs
```

### 架构理解

- **最上层**：你的应用、脚本、工作流或其他内部工具
- **中间层**：LocalGateway 负责统一入口、配置管理、路由与分发
- **控制面**：Admin 控制台负责把复杂配置可视化
- **数据面**：SQLite 承担本地状态、配置与持久化存储
- **出口层**：后续真实接通多个外部 Provider

这套结构的价值在于：**把“调用模型”与“管理系统”分层，把“开发视角”与“使用视角”分开。**

---

## 打包与分发

### 一键打包
在项目根目录执行：

```powershell
powershell -File build\package.ps1
```

脚本会完成以下事情：

1. 构建 Admin 前端
2. 将前端产物复制到嵌入目录
3. 编译 Go 后端二进制
4. 组装便携目录结构

### 打包输出目录

```text
build/portable/LocalGateway/
```

### 目标分发形态

```text
LocalGateway/
├── localgateway.exe
├── config.yaml
├── data/
├── logs/
└── README.txt
```

### 推荐分发方式

1. 执行打包脚本生成便携目录
2. 将 `build/portable/LocalGateway/` 整体压缩为 zip
3. 分发给最终用户
4. 用户解压后直接运行 `localgateway.exe`

这种方式的好处很直接：**交付物完整、结构清晰、环境干净、上手门槛低。**

---

## 已验证接口

以下接口已完成基础启动验证：

| 路径 | 方法 | 结果 |
|------|------|------|
| `/health` | GET | 200 ✅ |
| `/v1/models` | GET | 200 ✅ |
| `/admin/api/overview` | GET | 200 ✅ |
| `/admin/` | GET | 200 ✅ |
| `/admin/providers` | GET | 200 ✅（SPA fallback） |

---

## 适合谁使用

如果你正在做这些事，这个项目会很顺手：

- 想给内部 AI 能力做一个稳定统一的网关层
- 想把复杂配置收敛到一个可视化后台
- 想减少“这个环境少了个依赖、那个机器又跑不起来”的部署事故
- 想把产品做成真正可交付的 Windows 本地工具，而不是一堆散落脚本
- 想为上层产品准备一个本地优先、可控、可扩展的 AI 接入中间层

---

## 开发指南

### 后端技术栈
- Go 1.22+
- Chi Router
- Viper
- GORM
- glebarez/sqlite
- Zerolog

### 前端技术栈
- React 18
- Vite
- TypeScript
- Zustand
- Recharts
- Framer Motion
- Lucide React

### 前端本地开发

```powershell
cd D:\idea\localgateway\web\admin
npm install
npm run dev
```

### 前端构建

```powershell
cd D:\idea\localgateway\web\admin
npm run build
```

### 后端本地开发

```powershell
cd D:\idea\localgateway
D:\Go\bin\go.exe run .\cmd\localgateway
```

### 推荐开发节奏

1. 先在前端完成页面与交互骨架
2. 再在后端补齐对应 API 与状态接口
3. 本地验证 `/admin/*` 与 `/admin/api/*` 路由行为
4. 最后走一遍便携打包流程，确认交付形态不被破坏

这套顺序比较稳，不容易把“开发可运行”和“分发可运行”做成两套世界。

---

## 项目结构

```text
localgateway/
├── cmd/
│   └── localgateway/           # 程序启动入口
├── internal/
│   ├── admin/                  # Admin 聚合服务
│   ├── app/                    # 应用初始化与依赖装配
│   ├── auth/                   # Local Key 与鉴权逻辑
│   ├── bootstrap/              # 首次启动引导相关服务
│   ├── config/                 # 配置加载与类型定义
│   ├── models/                 # 数据模型
│   ├── provider/               # Provider 管理
│   ├── release/                # 发布信息相关服务
│   ├── routing/                # 路由策略与模型别名
│   ├── security/               # 安全相关服务
│   ├── server/                 # HTTP 路由与接口处理
│   ├── settings/               # 系统设置
│   ├── storage/                # 数据库初始化
│   └── usage/                  # 使用统计
├── configs/                    # 配置模板
├── build/
│   ├── embed/                  # 前端嵌入资源
│   ├── portable/               # portable 组装产物
│   └── package.ps1             # 一键打包脚本
├── packaging/                  # 分发规范文档
├── scripts/                    # 启动与流程说明
└── web/admin/                  # React + Vite 管理后台
```

---

## Git 管控建议

### 建议纳入版本管理
- 所有 Go 源码与模块文件
- 所有前端源码与锁文件
- 配置模板、打包脚本、说明文档
- Admin 页面源码、初始化页、安全页、版本页、发布页等产品化页面
- 发布规范、启动说明、工程约定文档

### 建议继续忽略
- 本地数据库 `data/`
- 运行日志 `logs/`
- 本地编译产物 `*.exe`
- `build/portable/` 分发目录
- `build/embed/admin/` 生成的嵌入前端文件
- `web/admin/dist/` 构建目录
- `node_modules/`

一句话原则：**源码、配置模板、脚本、锁文件要进 Git；运行产物、缓存、日志、打包结果不要进 Git。**

---

## 路线图

### 近期
- [ ] 真实 Provider 出站调用
- [ ] OpenAI / Claude 风格流式转发
- [ ] Bootstrap / Security / Release / Version / Build Checks 真实接口联调
- [ ] 前后端真实数据联通

### 中期
- [ ] ZIP 发布包自动生成
- [ ] 初始化流程真实写盘与升级策略
- [ ] 日志、统计、状态检查能力补全
- [ ] 分发体验与版本信息完善

### 长期
- [ ] 多 Provider 策略增强
- [ ] 更完整的模型治理与别名系统
- [ ] 更成熟的发布、升级、诊断工具链
- [ ] 面向实际团队协作场景的本地 AI 基础设施能力

---

## FAQ

### Q1：这是一个命令行工具，还是一个带后台的本地产品？
更准确地说，它是一个**带 Web Admin 的本地 AI 网关产品**。命令行只是启动方式，真正的长期使用体验应该主要发生在 Admin 控制台里。

### Q2：是否必须安装 Go 和 Node.js 才能使用？
**开发时需要，最终用户使用便携包时不需要。** 这也是项目做嵌入式前端与 portable 分发的核心原因之一。

### Q3：为什么选择纯 Go SQLite？
因为它对 Windows 分发更友好，不需要额外的 CGO 或本地 C 编译环境。说白了，就是少踩坑，少让用户被环境问题教育。

### Q4：它现在更偏“完成品”还是“产品骨架”？
目前更接近**高完成度的产品骨架**：结构、后台、分发方向、页面体系都已具备，真实 Provider 转发与部分状态接口还在继续补齐。

### Q5：这个项目最适合怎么演进？
比较稳的路线是：

1. 补真实接口与转发链路
2. 打通前后端状态联调
3. 固化打包与版本发布流程
4. 再逐步增强 Provider 治理、诊断与升级能力

---

## License

当前仓库暂未单独声明 License。

如果后续准备开源，建议补充：

- `LICENSE`
- 仓库主页与 Issue 说明
- 版本发布说明
- 安装与升级策略
- 截图、架构图与演示材料

这样整个项目会更像一个完整产品，而不是只存在于开发机里的工程样品。

