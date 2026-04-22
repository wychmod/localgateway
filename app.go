package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"runtime"
	"strings"
	"time"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"

	"localgateway/internal/app"
)

const desktopVersion = "2.1.0"

type DesktopApp struct {
	ctx         context.Context
	Application *app.Application
	Server      *http.Server
}

type DesktopStatus struct {
	Version       string `json:"version"`
	Platform      string `json:"platform"`
	ServerAddr    string `json:"serverAddr"`
	AdminURL      string `json:"adminUrl"`
	WindowTitle   string `json:"windowTitle"`
	DesktopMode   bool   `json:"desktopMode"`
	Notifications bool   `json:"notifications"`
	CustomChrome  bool   `json:"customChrome"`
}

func NewDesktopApp() *DesktopApp {
	return &DesktopApp{}
}

func (d *DesktopApp) Startup(ctx context.Context) {
	d.ctx = ctx

	application, err := app.New()
	if err != nil {
		panic(fmt.Sprintf("failed to create application: %v", err))
	}
	d.Application = application

	d.Server = &http.Server{
		Addr:         fmt.Sprintf("%s:%d", application.Config.Server.Host, application.Config.Server.Port),
		Handler:      application.Router,
		ReadTimeout:  time.Duration(application.Config.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(application.Config.Server.WriteTimeout) * time.Second,
		IdleTimeout:  time.Duration(application.Config.Server.IdleTimeout) * time.Second,
	}

	go func() {
		application.Logger.Info().Str("addr", d.Server.Addr).Msg("http server started")
		if err := d.Server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			application.Logger.Fatal().Err(err).Msg("server failed")
		}
	}()

	go func() {
		if err := waitForDesktopServer(d.Server.Addr, 10*time.Second); err == nil {
			wailsruntime.EventsEmit(d.ctx, "desktop:server-ready", d.GetDesktopStatus())
		}
	}()
}

func (d *DesktopApp) Shutdown(ctx context.Context) {
	if d.Server != nil {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := d.Server.Shutdown(shutdownCtx); err != nil {
			d.Application.Logger.Error().Err(err).Msg("graceful shutdown failed")
		}
	}
}

func (d *DesktopApp) GetVersion() string {
	return desktopVersion
}

func (d *DesktopApp) GetDesktopStatus() DesktopStatus {
	status := DesktopStatus{
		Version:       desktopVersion,
		Platform:      runtime.GOOS,
		WindowTitle:   "LocalGateway",
		DesktopMode:   true,
		Notifications: true,
		CustomChrome:  true,
	}

	if d.Application != nil && d.Server != nil {
		status.ServerAddr = d.Server.Addr
		status.AdminURL = buildDesktopAdminURL(d.Application.Config.Server.Host, d.Application.Config.Server.Port, d.Application.Config.Server.AdminPath)
	}

	return status
}

func (d *DesktopApp) MinimiseWindow() {
	wailsruntime.WindowMinimise(d.ctx)
}

func (d *DesktopApp) ToggleMaximiseWindow() {
	wailsruntime.WindowToggleMaximise(d.ctx)
}

func (d *DesktopApp) CloseWindow() {
	wailsruntime.Quit(d.ctx)
}

func (d *DesktopApp) OpenAdminInBrowser() {
	status := d.GetDesktopStatus()
	if status.AdminURL != "" {
		wailsruntime.BrowserOpenURL(d.ctx, status.AdminURL)
	}
}

func (d *DesktopApp) SendNativeNotice(title string, message string) {
	if title == "" {
		title = "LocalGateway"
	}
	if message == "" {
		message = "桌面通知"
	}

	wailsruntime.EventsEmit(d.ctx, "desktop:notice", map[string]string{
		"title":   title,
		"message": message,
	})
	_, _ = wailsruntime.MessageDialog(d.ctx, wailsruntime.MessageDialogOptions{
		Type:    wailsruntime.InfoDialog,
		Title:   title,
		Message: message,
	})
}

func waitForDesktopServer(addr string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		conn, err := net.DialTimeout("tcp", addr, 500*time.Millisecond)
		if err == nil {
			_ = conn.Close()
			return nil
		}
		time.Sleep(250 * time.Millisecond)
	}

	return fmt.Errorf("server %s did not become reachable within %s", addr, timeout)
}

func buildDesktopAdminURL(host string, port int, adminPath string) string {
	hostname := host
	if host == "0.0.0.0" || host == "" {
		hostname = "127.0.0.1"
	}

	path := adminPath
	if path == "" {
		path = "/admin"
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	return fmt.Sprintf("http://%s:%d%s", hostname, port, path)
}
