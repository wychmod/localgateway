package server

import (
	"net/http"
	"time"

	"localgateway/internal/usage"
)

type chatCompletionRequest struct {
	Model    string `json:"model"`
	Stream   bool   `json:"stream"`
	Messages []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
}

func (r *Router) handleChatCompletions(w http.ResponseWriter, req *http.Request) {
	var payload chatCompletionRequest
	if err := decodeJSON(req, &payload); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	decision, err := r.deps.Routing.Decide(req.Context(), payload.Model)
	if err != nil {
		respondJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}

	_ = r.deps.Usage.Record(req.Context(), usage.RecordInput{
		ProviderID:     decision.Provider.ID,
		ModelRequested: payload.Model,
		ModelActual:    decision.Model,
		APIFormat:      "openai",
		InputTokens:    int64(len(payload.Messages) * 120),
		OutputTokens:   360,
		TotalCostUSD:   0.0125,
		LatencyMS:      180,
		Success:        true,
	})

	respondJSON(w, http.StatusOK, map[string]any{
		"id":      "chatcmpl-demo",
		"object":  "chat.completion",
		"created": time.Now().Unix(),
		"model":   payload.Model,
		"choices": []map[string]any{{
			"index": 0,
			"message": map[string]any{
				"role":    "assistant",
				"content": "LocalGateway 网关骨架已接入，当前为高保真模拟响应，待 Go 环境补齐后可替换为真实 Provider 转发。",
			},
			"finish_reason": "stop",
		}},
		"usage": map[string]any{
			"prompt_tokens":     len(payload.Messages) * 120,
			"completion_tokens": 360,
			"total_tokens":      len(payload.Messages)*120 + 360,
		},
		"meta": map[string]any{
			"provider": decision.Provider.Name,
			"strategy": decision.Strategy,
		},
	})
}
