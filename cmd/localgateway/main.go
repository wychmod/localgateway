package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
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

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		application.Logger.Error().Err(err).Msg("graceful shutdown failed")
	}
}
