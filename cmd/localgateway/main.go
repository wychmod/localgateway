package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"time"

	"localgateway/internal/app"
)

func main() {
	application, err := app.New()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to create application: %v\n", err)
		os.Exit(1)
	}

	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", application.Config.Server.Host, application.Config.Server.Port),
		Handler:      application.Router,
		ReadTimeout:  time.Duration(application.Config.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(application.Config.Server.WriteTimeout) * time.Second,
		IdleTimeout:  time.Duration(application.Config.Server.IdleTimeout) * time.Second,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			application.Logger.Fatal().Err(err).Msg("server failed")
		}
	}()

	application.Logger.Info().Str("addr", server.Addr).Msg("localgateway started")

	if application.Config.Server.AutoOpenAdmin {
		go func() {
			if err := waitForServer(server.Addr, 10*time.Second); err != nil {
				application.Logger.Warn().Err(err).Msg("admin page auto-open skipped because server was not reachable in time")
				return
			}

			adminURL := buildAdminURL(application.Config.Server.Host, application.Config.Server.Port, application.Config.Server.AdminPath)
			if err := openAdminPage(adminURL, application.Config.Server.PreferBrowser); err != nil {
				application.Logger.Warn().Err(err).Str("url", adminURL).Msg("failed to auto-open admin page")
			}
		}()
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		application.Logger.Error().Err(err).Msg("graceful shutdown failed")
	}
}

func waitForServer(addr string, timeout time.Duration) error {
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

func buildAdminURL(host string, port int, adminPath string) string {
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

func openAdminPage(rawURL string, preferBrowser string) error {
	if runtime.GOOS != "windows" {
		return openWithDefaultBrowser(rawURL)
	}

	browser := strings.ToLower(strings.TrimSpace(preferBrowser))
	if browser == "" || browser == "chrome" {
		if err := openWithChrome(rawURL); err == nil {
			return nil
		}
	}

	return openWithDefaultBrowser(rawURL)
}

func openWithChrome(rawURL string) error {
	chromePaths := []string{
		filepath.Join(os.Getenv("ProgramFiles"), "Google", "Chrome", "Application", "chrome.exe"),
		filepath.Join(os.Getenv("ProgramFiles(x86)"), "Google", "Chrome", "Application", "chrome.exe"),
		filepath.Join(os.Getenv("LocalAppData"), "Google", "Chrome", "Application", "chrome.exe"),
	}

	for _, chromePath := range chromePaths {
		if chromePath == "" {
			continue
		}
		if _, err := os.Stat(chromePath); err == nil {
			return exec.Command(chromePath, rawURL).Start()
		}
	}

	if chromeCmd, err := exec.LookPath("chrome"); err == nil {
		return exec.Command(chromeCmd, rawURL).Start()
	}

	return fmt.Errorf("chrome executable not found")
}

func openWithDefaultBrowser(rawURL string) error {
	if runtime.GOOS == "windows" {
		return exec.Command("rundll32", "url.dll,FileProtocolHandler", rawURL).Start()
	}

	return fmt.Errorf("default browser open is not implemented for this platform")
}
