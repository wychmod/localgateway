package app

import (
	"os"

	"github.com/rs/zerolog"
	"gorm.io/gorm"

	"localgateway/internal/admin"
	"localgateway/internal/auth"
	"localgateway/internal/config"
	"localgateway/internal/provider"
	"localgateway/internal/routing"
	"localgateway/internal/server"
	"localgateway/internal/settings"
	"localgateway/internal/storage"
	"localgateway/internal/usage"
)

type Application struct {
	Config         config.Config
	Router         *server.Router
	Logger         zerolog.Logger
	DB             *gorm.DB
	Providers      *provider.Service
	Keys           *auth.Service
	Routing        *routing.Service
	Usage          *usage.Service
	Settings       *settings.Service
	Admin          *admin.Service
}

func New() (*Application, error) {
	// Resolve config path: explicit LG_CONFIG env var > config.yaml in cwd > default example
	cfgPath := os.Getenv("LG_CONFIG")
	if cfgPath == "" {
		if _, err := os.Stat("config.yaml"); err == nil {
			cfgPath = "config.yaml"
		} else {
			cfgPath = "configs/config.example.yaml"
		}
	}

	cfg, err := config.Load(cfgPath)
	if err != nil {
		return nil, err
	}

	logger := zerolog.New(os.Stdout).With().Timestamp().Str("service", "localgateway").Logger()

	db, err := storage.OpenDatabase(cfg.Database)
	if err != nil {
		return nil, err
	}

	providerService := provider.NewService(db)
	keyService := auth.NewService(db)
	usageService := usage.NewService(db)
	routingService := routing.NewService(db, providerService, cfg.Routing.DefaultStrategy)
	settingsService := settings.NewService(db)
	adminService := admin.NewService(providerService, keyService, usageService, routingService, settingsService)

	router := server.NewRouter(server.Dependencies{
		Config:    cfg,
		Logger:    logger,
		Providers: providerService,
		Keys:      keyService,
		Routing:   routingService,
		Usage:     usageService,
		Settings:  settingsService,
		Admin:     adminService,
	})

	return &Application{
		Config:    cfg,
		Router:    router,
		Logger:    logger,
		DB:        db,
		Providers: providerService,
		Keys:      keyService,
		Routing:   routingService,
		Usage:     usageService,
		Settings:  settingsService,
		Admin:     adminService,
	}, nil
}
