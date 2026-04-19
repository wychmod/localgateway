package admin

import (
	"context"

	"localgateway/internal/auth"
	"localgateway/internal/provider"
	"localgateway/internal/routing"
	"localgateway/internal/settings"
	"localgateway/internal/usage"
)

type Overview struct {
	Providers int                    `json:"providers"`
	Keys      int                    `json:"keys"`
	Usage     usage.Summary          `json:"usage"`
	Settings  settings.AppSettings   `json:"settings"`
	Rules     int                    `json:"rules"`
}

type Service struct {
	providers *provider.Service
	keys      *auth.Service
	usage     *usage.Service
	routing   *routing.Service
	settings  *settings.Service
}

func NewService(providers *provider.Service, keys *auth.Service, usage *usage.Service, routingService *routing.Service, settingsService *settings.Service) *Service {
	return &Service{
		providers: providers,
		keys:      keys,
		usage:     usage,
		routing:   routingService,
		settings:  settingsService,
	}
}

func (s *Service) Overview(ctx context.Context) (Overview, error) {
	providers, err := s.providers.List(ctx)
	if err != nil {
		return Overview{}, err
	}
	keys, err := s.keys.List(ctx)
	if err != nil {
		return Overview{}, err
	}
	usageSummary, err := s.usage.Summary(ctx)
	if err != nil {
		return Overview{}, err
	}
	rules, err := s.routing.ListRules(ctx)
	if err != nil {
		return Overview{}, err
	}
	appSettings, err := s.settings.Get(ctx)
	if err != nil {
		return Overview{}, err
	}
	return Overview{
		Providers: len(providers),
		Keys:      len(keys),
		Usage:     usageSummary,
		Settings:  appSettings,
		Rules:     len(rules),
	}, nil
}
