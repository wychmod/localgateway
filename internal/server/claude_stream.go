package server

import (
	"bufio"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"localgateway/internal/models"
	"localgateway/internal/routing"
)

func (r *Router) handleClaudeMessagesStream(w http.ResponseWriter, req *http.Request, payload claudeMessagesRequest, localKey *models.LocalKey, decision *routing.Decision) {
	trace := newRequestTrace(decision.Provider.Name, payload.Model, decision.Model, "claude_stream")
	startedAt := time.Now()

	responseBody, providerID, providerName, statusCode, fallbackTried, err := r.forwardClaudeStreamWithFallback(req, localKey, decision, payload)
	trace.Provider = providerName
	trace.FallbackTried = fallbackTried
	if err != nil {
		logRequestBestEffort(req.Context(), r.deps.DB, localKey.ID, providerID, "/v1/messages", req.Method, statusCode, time.Since(startedAt).Milliseconds(), err.Error(), trace)
		writeGatewayError(w, err)
		return
	}
	defer responseBody.Close()

	flusher, ok := w.(http.Flusher)
	if !ok {
		writeGatewayError(w, &gatewayError{HTTPStatus: http.StatusInternalServerError, Type: "gateway_error", Code: "streaming_not_supported", Message: "当前服务端不支持流式刷新", Retryable: false})
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Request-Trace-Id", trace.ID)
	w.WriteHeader(http.StatusOK)

	reader := bufio.NewReader(responseBody)
	for {
		line, readErr := reader.ReadBytes('\n')
		if len(line) > 0 {
			_, _ = w.Write(line)
			flusher.Flush()
		}
		if readErr != nil {
			break
		}
	}

	logRequestBestEffort(req.Context(), r.deps.DB, localKey.ID, providerID, "/v1/messages", req.Method, http.StatusOK, time.Since(startedAt).Milliseconds(), "", trace)
}

func (r *Router) forwardClaudeStreamWithFallback(req *http.Request, localKey *models.LocalKey, decision *routing.Decision, payload claudeMessagesRequest) (io.ReadCloser, string, string, int, []string, error) {
	client := newOpenAIClient(r.deps.Config.Proxy.StreamTimeout)
	attempts := []models.Provider{decision.Provider}
	fallbackTried := []string{}
	if len(decision.Fallback) > 0 {
		providers, err := r.deps.Providers.List(req.Context())
		if err == nil {
			for _, fallbackID := range decision.Fallback {
				for _, item := range providers {
					if strings.EqualFold(item.ID, fallbackID) || strings.EqualFold(item.Name, fallbackID) {
						attempts = append(attempts, item)
					}
				}
			}
		}
	}

	payload.Stream = true
	requestBytes, marshalErr := json.Marshal(payload)
	if marshalErr != nil {
		return nil, decision.Provider.ID, decision.Provider.Name, http.StatusInternalServerError, fallbackTried, &gatewayError{HTTPStatus: http.StatusInternalServerError, Type: "gateway_error", Code: "request_marshal_failed", Message: marshalErr.Error(), Provider: decision.Provider.Name, Retryable: false}
	}

	var lastErr error
	for index, attempt := range attempts {
		if err := ensureKeyAllowed(localKey, attempt, decision.Model); err != nil {
			lastErr = err
			continue
		}
		resp, err := client.ClaudeMessages(req.Context(), attempt, requestBytes)
		if err != nil {
			lastErr = err
			if index > 0 {
				fallbackTried = append(fallbackTried, attempt.Name)
			}
			continue
		}
		if resp.StatusCode >= 500 || resp.StatusCode == http.StatusTooManyRequests {
			body, _ := readBodyAndClose(resp.Body)
			lastErr = mapUpstreamError(resp.StatusCode, body, attempt.Name)
			if index > 0 {
				fallbackTried = append(fallbackTried, attempt.Name)
			}
			continue
		}
		if resp.StatusCode >= 400 {
			body, _ := readBodyAndClose(resp.Body)
			return nil, attempt.ID, attempt.Name, resp.StatusCode, fallbackTried, mapUpstreamError(resp.StatusCode, body, attempt.Name)
		}
		return resp.Body, attempt.ID, attempt.Name, http.StatusOK, fallbackTried, nil
	}

	if lastErr == nil {
		lastErr = &gatewayError{HTTPStatus: http.StatusBadGateway, Type: "provider_error", Code: "no_available_provider", Message: "没有可用的 Provider 完成 Claude 流式请求", Retryable: true}
	}
	return nil, decision.Provider.ID, decision.Provider.Name, http.StatusBadGateway, fallbackTried, lastErr
}
