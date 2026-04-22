package requestlog

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"gorm.io/gorm"

	"localgateway/internal/models"
)

type Service struct {
	db *gorm.DB
}

type Item struct {
	ID           string                 `json:"id"`
	LocalKeyID   string                 `json:"local_key_id"`
	ProviderID   string                 `json:"provider_id"`
	Path         string                 `json:"path"`
	Method       string                 `json:"method"`
	StatusCode   int                    `json:"status_code"`
	LatencyMS    int64                  `json:"latency_ms"`
	ErrorMessage string                 `json:"error_message"`
	Metadata     map[string]any         `json:"metadata"`
	CreatedAt    time.Time              `json:"created_at"`
	StatusLabel  string                 `json:"status_label"`
	Detail       string                 `json:"detail"`
	TraceID      string                 `json:"trace_id"`
	FallbackUsed bool                   `json:"fallback_used"`
	FallbackTried []string              `json:"fallback_tried"`
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) List(ctx context.Context, query string, onlyFallback bool, limit int) ([]Item, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	var rows []models.RequestLog
	tx := s.db.WithContext(ctx).Order("created_at desc").Limit(limit)
	if query != "" {
		like := "%" + strings.ToLower(query) + "%"
		tx = tx.Where("lower(path) LIKE ? OR lower(method) LIKE ? OR lower(error_message) LIKE ? OR lower(metadata_json) LIKE ?", like, like, like, like)
	}
	if err := tx.Find(&rows).Error; err != nil {
		return nil, err
	}

	items := make([]Item, 0, len(rows))
	for _, row := range rows {
		metadata := map[string]any{}
		_ = json.Unmarshal([]byte(row.MetadataJSON), &metadata)
		fallbackTried := toStringSlice(metadata["fallbackTried"])
		fallbackUsed := len(fallbackTried) > 0
		if onlyFallback && !fallbackUsed {
			continue
		}
		traceID, _ := metadata["id"].(string)
		provider, _ := metadata["provider"].(string)
		if provider == "" {
			provider = row.ProviderID
		}
		statusLabel := "成功"
		detail := "请求执行完成"
		if row.ErrorMessage != "" {
			statusLabel = "失败"
			detail = row.ErrorMessage
		}
		if fallbackUsed {
			statusLabel = "已切换备用"
			detail = "主链路失败后已尝试备用 Provider：" + strings.Join(fallbackTried, "、")
		}
		items = append(items, Item{ID: row.ID, LocalKeyID: row.LocalKeyID, ProviderID: provider, Path: row.Path, Method: row.Method, StatusCode: row.StatusCode, LatencyMS: row.LatencyMS, ErrorMessage: row.ErrorMessage, Metadata: metadata, CreatedAt: row.CreatedAt, StatusLabel: statusLabel, Detail: detail, TraceID: traceID, FallbackUsed: fallbackUsed, FallbackTried: fallbackTried})
	}

	return items, nil
}

func toStringSlice(value any) []string {
	if value == nil {
		return nil
	}
	items, ok := value.([]any)
	if !ok {
		return nil
	}
	result := make([]string, 0, len(items))
	for _, item := range items {
		if str, ok := item.(string); ok {
			result = append(result, str)
		}
	}
	return result
}
