package main

import (
	"context"
	"embed"
	"net/http"
	"strings"

	"github.com/wailsapp/wails/v2"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:web/admin/dist
var assets embed.FS

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
	if strings.HasPrefix(path, "/api/") || strings.HasPrefix(path, "/auth/") {
		if !p.ready || p.router == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte(`{"error":"server not ready"}`))
			return
		}
		p.router.ServeHTTP(w, r)
		return
	}

	cleanPath := strings.TrimPrefix(path, "/")
	if cleanPath == "" {
		cleanPath = "index.html"
	}

	_, err := assets.Open(cleanPath)
	if err != nil {
		r.URL.Path = "/"
	}

	p.static.ServeHTTP(w, r)
}

func buildDesktopMenu(app *DesktopApp) *menu.Menu {
	appMenu := menu.NewMenu()

	fileMenu := appMenu.AddSubmenu("应用")
	fileMenu.AddText("打开管理后台", nil, func(_ *menu.CallbackData) {
		app.OpenAdminInBrowser()
	})
	fileMenu.AddText("发送测试通知", nil, func(_ *menu.CallbackData) {
		app.SendNativeNotice("LocalGateway", "桌面通知链路正常")
	})
	fileMenu.AddSeparator()
	fileMenu.AddText("退出", nil, func(_ *menu.CallbackData) {
		app.CloseWindow()
	})

	windowMenu := appMenu.AddSubmenu("窗口")
	windowMenu.AddText("最小化", nil, func(_ *menu.CallbackData) {
		app.MinimiseWindow()
	})
	windowMenu.AddText("最大化 / 还原", nil, func(_ *menu.CallbackData) {
		app.ToggleMaximiseWindow()
	})

	helpMenu := appMenu.AddSubmenu("帮助")
	helpMenu.AddText("查看版本信息", nil, func(_ *menu.CallbackData) {
		wailsruntime.EventsEmit(app.ctx, "desktop:menu-version", app.GetDesktopStatus())
	})

	return appMenu
}

func main() {
	desktopApp := NewDesktopApp()
	proxy := newSPAProxy()

	err := wails.Run(&options.App{
		Title:             "LocalGateway",
		Width:             1360,
		Height:            860,
		MinWidth:          960,
		MinHeight:         640,
		Frameless:         true,
		DisableResize:     false,
		Fullscreen:        false,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 10, G: 14, B: 23, A: 1},
		AssetServer: &assetserver.Options{
			Handler: proxy,
		},
		Menu: buildDesktopMenu(desktopApp),
		Windows: &windows.Options{
			WebviewIsTransparent:              true,
			WindowIsTranslucent:               true,
			DisableWindowIcon:                 false,
			BackdropType:                      windows.Mica,
			DisablePinchZoom:                  true,
			EnableSwipeGestures:               false,
			Theme:                             windows.SystemDefault,
			ResizeDebounceMS:                  10,
			DisableFramelessWindowDecorations: false,
		},
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarHiddenInset(),
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   "LocalGateway",
				Message: "本地 AI API 网关桌面版",
			},
		},
		OnStartup: func(ctx context.Context) {
			desktopApp.Startup(ctx)
			if desktopApp.Application != nil && desktopApp.Application.Router != nil {
				proxy.setRouter(desktopApp.Application.Router)
			}
		},
		OnDomReady: func(ctx context.Context) {
			wailsruntime.EventsEmit(ctx, "desktop:dom-ready", desktopApp.GetDesktopStatus())
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
