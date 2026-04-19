package server

import (
	"net/http"
	"time"
)

type claudeMessagesRequest struct {
	Model     string `json:"model"`
	MaxTokens int    `json:"max_tokens"`
	System    string `json:"system"`
}

func (r *Router) handleClaudeMessages(w http.ResponseWriter, req *http.Request) {
	var payload claudeMessagesRequest
	if err := decodeJSON(req, &payload); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]any{
		"id": "msg_demo",
		"type": "message",
		"role": "assistant",
		"model": payload.Model,
		"content": []map[string]any{{
			"type": "text",
			"text": "Claude 兼容入口已预留完成，待 Go 运行环境接入后会接入真实的格式转换与流式转发。",
		}},
		"stop_reason": "end_turn",
		"usage": map[string]any{
			"input_tokens": 220,
			"output_tokens": 128,
		},
		"created_at": time.Now().UTC(),
	})
}
