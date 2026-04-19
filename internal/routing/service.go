package routing

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"localgateway/internal/models"
	"localgateway/internal/provider"
)

type Decision struct {
	Strategy string          `json:"strategy"`
	Provider models.Provider `json:"provider"`
	Model    string          `json:"model"`
	Fallback []string        `json:"fallback"`
}

type RuleInput struct {
	ModelPattern string   `json:"model_pattern"`
	Strategy     string   `json:"strategy"`
	ProviderChain []string `json:"provider_chain"`
	FallbackChain []string `json:"fallback_chain"`
	Enabled      bool     `json:"enabled"`
}

type AliasInput struct {
	Alias        string   `json:"alias"`
	Target       string   `json:"target"`
	FallbackChain []string `json:"fallback_chain"`
}

type TestInput struct {
	Model     string `json:"model"`
	LocalKey  string `json:"local_key"`
	Format    string `json:"format"`
	Streaming bool   `json:"streaming"`
}

type TestResult struct {
	ResolvedModel string   `json:"resolved_model"`
	ProviderID    string   `json:"provider_id"`
	Strategy      string   `json:"strategy"`
	FallbackChain []string `json:"fallback_chain"`
	EstimatedCost string   `json:"estimated_cost"`
	EstimatedTTFT string   `json:"estimated_ttft"`
}

type Service struct {
	db        *gorm.DB
	providers *provider.Service
	strategy  string
}

func NewService(db *gorm.DB, providers *provider.Service, strategy string) *Service {
	return &Service{db: db, providers: providers, strategy: strategy}
}

func (s *Service) ListRules(ctx context.Context) ([]models.RoutingRule, error) {
	var rules []models.RoutingRule
	if err := s.db.WithContext(ctx).Order("created_at asc").Find(&rules).Error; err != nil {
		return nil, err
	}
	return rules, nil
}

func (s *Service) CreateRule(ctx context.Context, input RuleInput) (models.RoutingRule, error) {
	rule := models.RoutingRule{
		ID:            "route_" + uuid.NewString(),
		ModelPattern:  input.ModelPattern,
		Strategy:      input.Strategy,
		ProviderChain: toJSON(input.ProviderChain),
		FallbackChain: toJSON(input.FallbackChain),
		Enabled:       input.Enabled,
	}
	if err := s.db.WithContext(ctx).Create(&rule).Error; err != nil {
		return models.RoutingRule{}, err
	}
	return rule, nil
}

func (s *Service) UpdateRule(ctx context.Context, id string, input RuleInput) (models.RoutingRule, error) {
	var rule models.RoutingRule
	if err := s.db.WithContext(ctx).Where("id = ?", id).First(&rule).Error; err != nil {
		return models.RoutingRule{}, err
	}
	rule.ModelPattern = input.ModelPattern
	rule.Strategy = input.Strategy
	rule.ProviderChain = toJSON(input.ProviderChain)
	rule.FallbackChain = toJSON(input.FallbackChain)
	rule.Enabled = input.Enabled
	if err := s.db.WithContext(ctx).Save(&rule).Error; err != nil {
		return models.RoutingRule{}, err
	}
	return rule, nil
}

func (s *Service) DeleteRule(ctx context.Context, id string) error {
	return s.db.WithContext(ctx).Delete(&models.RoutingRule{}, "id = ?", id).Error
}

func (s *Service) ListAliases(ctx context.Context) ([]models.ModelAlias, error) {
	var aliases []models.ModelAlias
	if err := s.db.WithContext(ctx).Order("created_at asc").Find(&aliases).Error; err != nil {
		return nil, err
	}
	return aliases, nil
}

func (s *Service) UpsertAlias(ctx context.Context, input AliasInput) (models.ModelAlias, error) {
	var alias models.ModelAlias
	result := s.db.WithContext(ctx).Where("alias = ?", input.Alias).First(&alias)
	if result.Error != nil {
		alias = models.ModelAlias{ID: "alias_" + uuid.NewString(), Alias: input.Alias}
	}
	alias.Target = input.Target
	alias.FallbackChain = toJSON(input.FallbackChain)
	if err := s.db.WithContext(ctx).Save(&alias).Error; err != nil {
		return models.ModelAlias{}, err
	}
	return alias, nil
}

func (s *Service) Decide(ctx context.Context, model string) (*Decision, error) {
	resolved := s.resolveAlias(ctx, model)
	selected, err := s.providers.ResolveByModel(ctx, resolved)
	if err != nil {
		return nil, err
	}
	return &Decision{
		Strategy: s.strategy,
		Provider: *selected,
		Model:    resolved,
		Fallback: []string{"azure-backup", "openrouter-fallback"},
	}, nil
}

func (s *Service) Simulate(ctx context.Context, input TestInput) (TestResult, error) {
	decision, err := s.Decide(ctx, input.Model)
	if err != nil {
		return TestResult{}, err
	}
	return TestResult{
		ResolvedModel: decision.Model,
		ProviderID:    decision.Provider.ID,
		Strategy:      decision.Strategy,
		FallbackChain: decision.Fallback,
		EstimatedCost: "$0.012 - $0.024",
		EstimatedTTFT: "180ms - 260ms",
	}, nil
}

func (s *Service) resolveAlias(ctx context.Context, model string) string {
	var aliases []models.ModelAlias
	if err := s.db.WithContext(ctx).Find(&aliases).Error; err != nil {
		return model
	}
	for _, alias := range aliases {
		if strings.EqualFold(alias.Alias, model) {
			return alias.Target
		}
	}
	return model
}

func toJSON(values []string) string {
	if len(values) == 0 {
		return "[]"
	}
	data, _ := json.Marshal(values)
	return string(data)
}
