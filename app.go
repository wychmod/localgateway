package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"localgateway/internal/app"
)

// DesktopApp 是 Wails 桌面应用的主结构体，封装了原有的 Go HTTP 后端。
type DesktopApp struct {
	ctx         context.Context
	Application *app.Application
	Server      *http.Server
}

// NewDesktopApp 创建一个新的桌面应用实例。
func NewDesktopApp() *DesktopApp {
	return &DesktopApp{}
}

// Startup 在 Wails 应用启动时调用，负责初始化原有后端并启动 HTTP 服务。
func (d *DesktopApp) Startup(ctx context.Context) {
	d.ctx = ctx

	application, err := app.New()
	if err != nil {
		panic(fmt.Sprintf("failed to create application: %v", err))
	}
	d.Application = application

	// 同时启动 HTTP server，保持外部浏览器访问的兼容性
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
}

// Shutdown 在 Wails 应用关闭时调用，负责优雅关闭 HTTP 服务。
func (d *DesktopApp) Shutdown(ctx context.Context) {
	if d.Server != nil {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := d.Server.Shutdown(shutdownCtx); err != nil {
			d.Application.Logger.Error().Err(err).Msg("graceful shutdown failed")
		}
	}
}

// GetVersion 暴露给前端调用的示例方法，返回应用版本号。
func (d *DesktopApp) GetVersion() string {
	return "2.0.0"
}
