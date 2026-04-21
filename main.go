package main

import (
	"context"
	"embed"
	"net/http"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:web/admin/dist
var assets embed.FS

// spaProxy 是 Wails AssetServer 的自定义处理器，负责：
//   1. 将 /api/* 和 /auth/* 请求透传给 Go HTTP Router
//   2. 为前端 SPA 提供静态资源服务，并支持客户端路由回退到 index.html
type spaProxy struct {
	router http.Handler
	static http.Handler
	ready  bool
}

func newSPAProxy() *spaProxy {
	return &spaProxy{
		static: http.FileServer(http.FS(assets)),
	}
}

func (p *spaProxy) setRouter(router http.Handler) {
	p.router = router
	p.ready = true
}

func (p *spaProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	// 后端 API / 认证路由透传
	if strings.HasPrefix(path, "/api/") || strings.HasPrefix(path, "/auth/") {
		if !p.ready || p.router == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"error":"server not ready"}`))
			return
		}
		p.router.ServeHTTP(w, r)
		return
	}

	// 静态资源：尝试直接服务；若文件不存在则回退到 index.html（SPA 行为）
	cleanPath := strings.TrimPrefix(path, "/")
	if cleanPath == "" {
		cleanPath = "index.html"
	}

	_, err := assets.Open(cleanPath)
	if err != nil {
		// 文件不存在 → SPA fallback
		r.URL.Path = "/"
	}

	p.static.ServeHTTP(w, r)
}

func main() {
	desktopApp := NewDesktopApp()
	proxy := newSPAProxy()

	err := wails.Run(&options.App{
		Title:     "LocalGateway",
		Width:     1280,
		Height:    800,
		MinWidth:  800,
		MinHeight: 600,
		BackgroundColour: &options.RGBA{R: 15, G: 23, B: 42, A: 1},
		AssetServer: &assetserver.Options{
			Handler: proxy,
		},
		OnStartup: func(ctx context.Context) {
			desktopApp.Startup(ctx)
			// 等应用初始化完成后，把 router 注入给 proxy
			if desktopApp.Application != nil && desktopApp.Application.Router != nil {
				proxy.setRouter(desktopApp.Application.Router)
			}
		},
		OnShutdown: desktopApp.Shutdown,
		Bind: []interface{}{
			desktopApp,
		},
	})

	if err != nil {
		panic(err)
	}
}
