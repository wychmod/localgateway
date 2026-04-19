# LocalGateway 启动与分发清单

## 当前状态

仓库已经完成高端 Admin 可操作工作台、Dashboard 中控首页、Analytics 分析台、Logs 问题定位台，以及便携分发结构骨架扩充，但当前机器没有可直接调用的 Go 环境，因此尚未完成真实编译与打包。

## 当前前端可操作范围

Admin 已具备这些交互原型：

- Provider 新增 / 选择 / 编辑 / 测试 / 模型发现
- Local Key 权限 / 预算 / 轮换 / 吊销动作入口
- Routing 规则编辑与路由模拟器
- Dashboard 中控操作区与告警流
- Analytics 趋势与分布分析台
- Logs 搜索、Fallback 筛选与详情面板
- Settings 系统配置与分发状态面板
- Quick Setup 工具接入说明

## 打包结构

已准备目录：

```text
packaging/
└── windows-portable/
    ├── SPEC.md
    └── README.txt

build/
└── embed/
    └── doc.go

release/
└── README.md
```

## 接入 Go 环境后建议执行

### 后端
```powershell
cd D:\idea\localgateway
go mod tidy
go run .\cmd\localgateway
```

### 前端
```powershell
cd D:\idea\localgateway\web\admin
npm install
npm run dev
```

## 目标分发方式

最终交付应为：

- `localgateway.zip`
- 解压后可直接运行 `localgateway.exe`
- 前端静态资源嵌入二进制
- 首次启动自动创建 `config.yaml`、`data/`、`logs/`
- 用户无需 Node / Go 环境即可日常使用

## 后续要补的关键动作

1. 编译并修正所有 Go 类型与依赖问题
2. 完成真实 Provider 调用与 SSE 流式转发
3. 将 Vite build 产物嵌入 Go
4. 实现首次启动初始化向导
5. 生成 Windows 可分发压缩包
