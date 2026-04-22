package server

import (
	"encoding/json"
	"net/http"
	"time"
)

type claudeMessagesRequest struct {
	Model     string `json:"model"`
	MaxTokens int    `json:"max_tokens"`
	System    string `json:"system"`
	Messages  []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
}

func (r *Router) handleClaudeMessages(w http.ResponseWriter, req *http.Request) {
	var payload claudeMessagesRequest
	if err := decodeJSON(req, &payload); err != nil {
		writeGatewayError(w, &gatewayError{HTTPStatus: http.StatusBadRequest, Type: "request_error", Code: "invalid_json", Message: err.Error(), Retryable: false})
		return
	}
	if payload.Model == "" {
		writeGatewayError(w, &gatewayError{HTTPStatus: http.StatusBadRequest, Type: "request_error", Code: "model_required", Message: "model 不能为空", Retryable: false})
		return
	}

	localKey, err := validateLocalKey(req.Context(), r.deps.Keys, extractLocalKey(req))
	if err != nil {
		writeGatewayError(w, err)
		return
	}

	decision, err := r.deps.Routing.Decide(req.Context(), payload.Model)
	if err != nil {
		writeGatewayError(w, &gatewayError{HTTPStatus: http.StatusBadGateway, Type: "routing_error", Code: "route_decision_failed", Message: err.Error(), Retryable: true})
		return
	}
	if err := ensureKeyAllowed(localKey, decision.Provider, decision.Model); err != nil {
		writeGatewayError(w, err)
		return
	}

	requestBytes, err := json.Marshal(payload)
	if err != nil {
		writeGatewayError(w, &gatewayError{HTTPStatus: http.StatusInternalServerError, Type: "gateway_error", Code: "request_marshal_failed", Message: err.Error(), Provider: decision.Provider.Name, Retryable: false})
		return
	}

	trace := newRequestTrace(decision.Provider.Name, payload.Model, decision.Model, "claude")
	client := newOpenAIClient(r.deps.Config.Proxy.RequestTimeout)
	startedAt := time.Now()
	resp, err := client.ClaudeMessages(req.Context(), decision.Provider, requestBytes)
	if err != nil {
		writeGatewayError(w, err)
		logRequestBestEffort(req.Context(), r.deps.DB, localKey.ID, decision.Provider.ID, "/v1/messages", req.Method, http.StatusBadGateway, time.Since(startedAt).Milliseconds(), err.Error(), trace)
		return
	}

	responseBytes, err := readBodyAndClose(resp.Body)
	if err != nil {
		writeGatewayError(w, &gatewayError{HTTPStatus: http.StatusBadGateway, Type: "provider_error", Code: "upstream_read_failed", Message: err.Error(), Provider: decision.Provider.Name, Retryable: true})
		return
	}
	if resp.StatusCode >= 400 {
		gwErr := mapUpstreamError(resp.StatusCode, responseBytes, decision.Provider.Name)
		writeGatewayError(w, gwErr)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Request-Trace-Id", trace.ID)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(responseBytes)
}
