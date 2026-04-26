package main

import (
	"bytes"
	"context"
	"io"
	"mime"
	"net/http"
	"path"
	"strings"

	"github.com/getlantern/systray"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"

	adminembed "localgateway/build/embed"
)

type spaProxy struct {
	router     http.Handler
	assets     http.FileSystem
	diskAssets http.FileSystem
	ready      bool
}

func newSPAProxy() *spaProxy {
	adminAssets := adminembed.AdminFS()
	return &spaProxy{assets: adminAssets, diskAssets: http.Dir("build/embed/admin")}
}

func (p *spaProxy) setRouter(router http.Handler) {
	p.router = router
	p.ready = true
}

func (p *spaProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if strings.HasPrefix(path, "/admin/api/") || strings.HasPrefix(path, "/api/") || strings.HasPrefix(path, "/auth/") {
		if !p.ready || p.router == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte(`{"error":"server not ready"}`))
			return
		}
		p.router.ServeHTTP(w, r)
		return
	}

	cleanPath := normalizeAssetPath(path)
	if cleanPath == "" || cleanPath == "." {
		p.serveEmbeddedFile(w, r, "index.html")
		return
	}

	if file, err := p.openAsset(cleanPath); err == nil {
		info, statErr := file.Stat()
		_ = file.Close()
		if statErr == nil && !info.IsDir() {
			p.serveEmbeddedFile(w, r, cleanPath)
			return
		}
		p.serveEmbeddedFile(w, r, "index.html")
		return
	}

	// Only application routes should fall back to index.html.
	// Missing static assets must remain 404 instead of returning HTML.
	if isStaticAssetRequest(cleanPath) {
		http.NotFound(w, r)
		return
	}

	p.serveEmbeddedFile(w, r, "index.html")
}

func (p *spaProxy) serveEmbeddedFile(w http.ResponseWriter, r *http.Request, assetPath string) {
	file, err := p.openAsset(assetPath)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil || info.IsDir() {
		http.NotFound(w, r)
		return
	}

	data, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "failed to read asset", http.StatusInternalServerError)
		return
	}

	contentType := mime.TypeByExtension(path.Ext(assetPath))
	if contentType == "" {
		contentType = http.DetectContentType(data)
	}
	w.Header().Set("Content-Type", contentType)
	http.ServeContent(w, r, info.Name(), info.ModTime(), bytes.NewReader(data))
}

func (p *spaProxy) openAsset(assetPath string) (http.File, error) {
	if file, err := p.assets.Open(assetPath); err == nil {
		return file, nil
	}
	return p.diskAssets.Open(assetPath)
}

func normalizeAssetPath(requestPath string) string {
	cleanPath := strings.TrimPrefix(requestPath, "/")
	cleanPath = strings.TrimPrefix(cleanPath, "admin/")
	cleanPath = path.Clean("/" + cleanPath)
	return strings.TrimPrefix(cleanPath, "/")
}

func isStaticAssetRequest(path string) bool {
	lastSegment := path
	if idx := strings.LastIndex(path, "/"); idx >= 0 {
		lastSegment = path[idx+1:]
	}
	return strings.Contains(lastSegment, ".")
}

func buildDesktopMenu(app *DesktopApp) *menu.Menu {
	appMenu := menu.NewMenu()

	fileMenu := appMenu.AddSubmenu("应用")
	fileMenu.AddText("显示主窗口", nil, func(_ *menu.CallbackData) { app.ShowMainWindow() })
	fileMenu.AddText("隐藏到托盘", nil, func(_ *menu.CallbackData) { app.HideToTray() })
	fileMenu.AddText("打开管理后台", nil, func(_ *menu.CallbackData) { app.OpenAdminInBrowser() })
	fileMenu.AddText("发送测试通知", nil, func(_ *menu.CallbackData) { app.SendNativeNotice("灵枢", "桌面通知链路正常") })
	fileMenu.AddSeparator()
	fileMenu.AddText("退出", nil, func(_ *menu.CallbackData) { app.CloseWindow() })

	windowMenu := appMenu.AddSubmenu("窗口")
	windowMenu.AddText("最小化", nil, func(_ *menu.CallbackData) { app.MinimiseWindow() })
	windowMenu.AddText("最大化 / 还原", nil, func(_ *menu.CallbackData) { app.ToggleMaximiseWindow() })
	windowMenu.AddText("恢复上次页面", nil, func(_ *menu.CallbackData) {
		wailsruntime.EventsEmit(app.ctx, "desktop:restore-route", app.RestoreLastRoute())
	})

	helpMenu := appMenu.AddSubmenu("帮助")
	helpMenu.AddText("运行桌面自检", nil, func(_ *menu.CallbackData) {
		wailsruntime.EventsEmit(app.ctx, "desktop:self-check", app.RunSelfCheck())
	})
	helpMenu.AddText("查看版本信息", nil, func(_ *menu.CallbackData) {
		wailsruntime.EventsEmit(app.ctx, "desktop:menu-version", app.GetDesktopStatus())
	})

	return appMenu
}

func runDesktopTray(app *DesktopApp) {
	systray.SetDoubleClickHandler(func() {
		app.ShowMainWindow()
	})
	systray.Register(func() {
		systray.SetTitle("灵枢")
		systray.SetTooltip("灵枢桌面版")
		if len(trayIcon) > 0 {
			systray.SetIcon(trayIcon)
		}

		showItem := systray.AddMenuItem("显示主窗口", "恢复并显示窗口")
		hideItem := systray.AddMenuItem("隐藏到托盘", "隐藏主窗口")
		openItem := systray.AddMenuItem("打开管理后台", "在浏览器中打开后台")
		systray.AddSeparator()
		quitItem := systray.AddMenuItem("退出程序", "关闭灵枢")

		go func() {
			for {
				select {
				case <-showItem.ClickedCh:
					app.ShowMainWindow()
				case <-hideItem.ClickedCh:
					app.HideToTray()
				case <-openItem.ClickedCh:
					app.OpenAdminInBrowser()
				case <-quitItem.ClickedCh:
					app.CloseWindow()
					return
				}
			}
		}()
	}, func() {})
}

func main() {
	desktopApp := NewDesktopApp()
	proxy := newSPAProxy()
	runDesktopTray(desktopApp)

	err := wails.Run(&options.App{
		Title:            "灵枢",
		Width:            desktopApp.State.Width,
		Height:           desktopApp.State.Height,
		MinWidth:         960,
		MinHeight:        640,
		Frameless:        true,
		DisableResize:    false,
		Fullscreen:       false,
		StartHidden:      false,
		BackgroundColour: &options.RGBA{R: 10, G: 14, B: 23, A: 1},
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
				Title:   "灵枢",
				Message: "本地模型网关桌面版",
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
			wailsruntime.EventsEmit(ctx, "desktop:restore-route", desktopApp.RestoreLastRoute())
		},
		OnBeforeClose: func(ctx context.Context) bool {
			if desktopApp.IsQuitting() {
				return false
			}
			desktopApp.HideToTray()
			return true
		},
		OnShutdown: func(ctx context.Context) {
			systray.Quit()
			desktopApp.Shutdown(ctx)
		},
		Bind: []interface{}{desktopApp},
	})

	if err != nil {
		panic(err)
	}
}
