# LocalGateway 启动与分发说明

## 当前状态

项目当前已经完成以下关键能力：

- 后端可编译、可运行
- SQLite 已切换为纯 Go 驱动，无需 CGO
- Admin 前端已嵌入 Go 二进制
- `/admin/*` 已支持 SPA fallback
- Portable 单目录形态已完成验证
- 可通过 `build/package.ps1` 一键打包

---

## 已验证接口

| 接口 | 方法 | 状态 |
|------|------|------|
| `/health` | GET | ✅ 200 |
| `/v1/models` | GET | ✅ 200 |
| `/admin/api/overview` | GET | ✅ 200 |
| `/admin/` | GET | ✅ 200 |
| `/admin/providers` | GET | ✅ 200 |

---

## 启动方式

### 开发模式

```powershell
cd D:\idea\localgateway
D:\Go\bin\go.exe run .\cmd\localgateway
```

### 编译后启动

```powershell
cd D:\idea\localgateway
D:\Go\bin\go.exe build -o localgateway.exe .\cmd\localgateway
.\localgateway.exe
```

### Portable 模式

```powershell
cd D:\idea\localgateway\build\portable\LocalGateway
.\localgateway.exe
```

访问地址：

```text
http://127.0.0.1:18743/admin
```

---

## 打包方式

```powershell
cd D:\idea\localgateway
powershell -File build\package.ps1
```

打包输出目录：

```text
build/portable/LocalGateway/
```

---

## Portable 目录结构

```text
LocalGateway/
├── localgateway.exe
├── config.yaml
├── data/
├── logs/
└── README.txt
```

---

## 配置加载优先级

1. `LG_CONFIG` 环境变量
2. 当前目录 `config.yaml`
3. `configs/config.example.yaml`

---

## 下一步建议

1. 接通真实 Provider 出站请求
2. 完成 SSE 流式转发
3. 打通 Bootstrap / Security / Release / Version / Build Checks 真实状态接口
4. 完成前后端真实联调
5. 生成最终 ZIP 分发包
