package usage

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"localgateway/internal/models"
)

type Service struct {
	db *gorm.DB
}

type RecordInput struct {
	LocalKeyID     string
	ProviderID     string
	ModelRequested string
	ModelActual    string
	APIFormat      string
	InputTokens    int64
	OutputTokens   int64
	TotalCostUSD   float64
	LatencyMS      int64
	Success        bool
}

type Summary struct {
	TotalRequests int64   `json:"total_requests"`
	SuccessRate   float64 `json:"success_rate"`
	TotalCostUSD  float64 `json:"total_cost_usd"`
	InputTokens   int64   `json:"input_tokens"`
	OutputTokens  int64   `json:"output_tokens"`
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) Record(ctx context.Context, input RecordInput) error {
	return s.db.WithContext(ctx).Create(&models.UsageRecord{
		ID:             "req_" + uuid.NewString(),
		LocalKeyID:     input.LocalKeyID,
		ProviderID:     input.ProviderID,
		ModelRequested: input.ModelRequested,
		ModelActual:    input.ModelActual,
		APIFormat:      input.APIFormat,
		InputTokens:    input.InputTokens,
		OutputTokens:   input.OutputTokens,
		TotalCostUSD:   input.TotalCostUSD,
		LatencyMS:      input.LatencyMS,
		Success:        input.Success,
		CreatedAt:      time.Now(),
	}).Error
}

func (s *Service) Summary(ctx context.Context) (Summary, error) {
	var records []models.UsageRecord
	if err := s.db.WithContext(ctx).Find(&records).Error; err != nil {
		return Summary{}, err
	}

	var summary Summary
	var success int64
	for _, item := range records {
		summary.TotalRequests++
		summary.TotalCostUSD += item.TotalCostUSD
		summary.InputTokens += item.InputTokens
		summary.OutputTokens += item.OutputTokens
		if item.Success {
			success++
		}
	}
	if summary.TotalRequests > 0 {
		summary.SuccessRate = float64(success) / float64(summary.TotalRequests)
	}
	return summary, nil
}
