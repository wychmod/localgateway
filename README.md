# 灵枢（Lingshu）

<p align="center">
  <img alt="Go" src="https://img.shields.io/badge/Go-1.22%2B-00ADD8?style=for-the-badge&logo=go&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-Pure%20Go-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img alt="Platform" src="https://img.shields.io/badge/Platform-Windows%20Portable-4B5563?style=for-the-badge" />
</p>

<p align="center">
  <strong>一个面向本地部署场景的多模型网关与管理平台。</strong>
</p>

<p align="center">
  聚合多模型厂商、统一 OpenAI 风格入口、提供高质感 Admin 控制台，支持单目录分发，解压即可运行。
</p>

<p align="center">
  <a href="#为什么是灵枢">为什么是灵枢</a> ·
  <a href="#亮点速览">亮点速览</a> ·
  <a href="#核心能力">核心能力</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#双版本说明">双版本说明</a> ·
  <a href="#桌面版构建说明">桌面版构建说明</a>
</p>

---

## 为什么是灵枢

很多本地 AI 工具都有同一个问题：

- 接口分散，Provider 各有各的地址与鉴权方式
- 配置零碎，要么全靠环境变量，要么全靠手工改文件
- 管理体验粗糙，日常维护像是在和一堆脚本掰手腕
- 分发复杂，用户常常还没跑起来，热情已经先被依赖环境磨掉一半

**灵枢** 想解决的，就是这类“能用，但不好用”的工程现实。

它把本地网关、配置管理、Provider 管理、模型路由和可视化后台收敛到一个项目里，目标不是做一个“开发者才能驾驭”的半成品，而是做成一个：

> **可以下载、可以解压、可以直接运行、也可以长期维护的本地模型网关产品。**

一句话概括：

**灵枢 = 本地多模型能力的统一入口 + 可视化控制台 + 便携式交付体验。**

---

## 亮点速览

- **统一入口**：将多 Provider 能力收敛到一个本地网关层
- **控制台优先**：尽量把日常配置、检查、管理动作都放进 Admin
- **Windows 友好**：偏向本地、便携、低依赖的使用体验
- **纯 Go SQLite**：无需 CGO，更适合可分发场景
- **嵌入式前端**：Admin 构建后可直接嵌入二进制交付
- **产品感导向**：不是脚本集合，而是朝真正可交付工具打磨

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
- 前端视觉方向偏向真正可交付的桌面级 SaaS 体验

### 3. 便携式分发
- Admin 前端资源内嵌到 Go 二进制
- 可组合为单目录便携包
- 用户无需单独安装 Node.js 或 Go，即可日常运行
- 更适合内部分发、私有部署、离线环境或半离线环境使用

---

## 快速开始

### 默认访问地址

启动成功后，默认可访问：

- Admin 控制台：`http://127.0.0.1:18743/admin`
- 健康检查：`http://127.0.0.1:18743/health`
- 模型列表：`http://127.0.0.1:18743/v1/models`

### 方式一：开发模式启动

```powershell
cd D:\idea\localgateway
D:\Go\bin\go.exe run .\cmd\localgateway
```

### 方式二：编译后启动

```powershell
cd D:\idea\localgateway
D:\Go\bin\go.exe build -o lingshu.exe .\cmd\localgateway
.\lingshu.exe
```

### 方式三：便携目录直接启动

```powershell
cd D:\idea\localgateway\build\portable\Lingshu
.\lingshu.exe
```

默认情况下，程序启动成功后会自动打开：

- `http://127.0.0.1:18743/admin`

在 Windows 下会优先尝试使用 Chrome 打开管理页面；如果本机未安装 Chrome，则会回退到系统默认浏览器。

同时，正式打包出来的 `.exe` 会以更接近桌面产品的方式运行：

- 启动时不弹出控制台黑窗口
- 常驻系统托盘
- 可通过托盘菜单再次打开管理后台
- 可通过托盘菜单主动退出程序

### 方式四：Wails 桌面版启动

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

- Windows：`build\bin\Lingshu.exe`
- macOS：通过 GitHub Actions 构建 `Lingshu.app`

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

---

## 桌面版构建说明

### 本地 Windows

```powershell
.\build\desktop.ps1
```

### GitHub Actions 双端构建

当推送 `v*` tag 时，会自动：

- 在 Windows runner 构建 `Lingshu.exe`
- 在 macOS runner 构建 `Lingshu.app`

---

## 当前品牌与工程名说明

为了避免一次性改坏 Go module、import 路径和历史脚本，当前仓库采用 **“产品名 / 工程名分层”** 策略：

- **产品名**：灵枢（Lingshu）
- **产物名**：`lingshu.exe`、`lingshu.zip`、`Lingshu.app`
- **工程目录 / Go module / import 路径**：暂时仍保留 `localgateway`

这意味着：

- 用户看到的是灵枢品牌
- 下载到的是 lingshu 产物
- 代码内部仍可平稳沿用现有工程结构

后续如果需要，我可以继续帮你做第二阶段：

1. 把 README 其余章节全部彻底替换为灵枢品牌语气
2. 继续把 CI、脚本、发布目录名全量改到 `Lingshu`
3. 最后评估是否要连 Go module 名也一起迁移
