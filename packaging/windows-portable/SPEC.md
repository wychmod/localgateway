# Windows Portable Packaging Spec

## 目标

生成 `localgateway.zip`，用户下载后解压即可直接使用。

## 目标目录结构

```text
localgateway/
├── localgateway.exe
├── config.yaml
├── data/
│   └── localgateway.db
├── logs/
└── README.txt
```

## 开箱即用要求

1. 无需 Go / Node 环境
2. Admin 前端静态资源内嵌到二进制
3. 首次启动自动初始化：
   - `config.yaml`
   - `data/`
   - `logs/`
4. 默认监听 `127.0.0.1:9090`
5. 首次打开浏览器即进入 `/admin`

## 打包步骤（待 Go 环境可用后执行）

1. 构建 Admin 前端产物
2. 复制前端 build 到 `build/embed/admin`
3. 使用 Go embed 内嵌静态资源
4. 生成 `localgateway.exe`
5. 生成默认 `config.yaml`
6. 组装 portable 目录
7. 压缩为 `localgateway.zip`

## 待补实现

- 真实 embed 代码
- 首次启动初始化逻辑
- 版本号注入
- 压缩包生成脚本
