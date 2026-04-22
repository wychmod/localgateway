package server

import (
	"bufio"
	"encoding/json"
	"net/http"
	"time"
)

func (r *Router) handleChatCompletionsStream(w http.ResponseWriter, req *http.Request, payload chatCompletionRequest) {
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

	trace := newRequestTrace(decision.Provider.Name, payload.Model, decision.Model, "openai_stream")
	client := newOpenAIClient(r.deps.Config.Proxy.StreamTimeout)
	startedAt := time.Now()
	resp, err := client.ChatCompletions(req.Context(), decision.Provider, requestBytes)
	if err != nil {
		logRequestBestEffort(req.Context(), r.deps.DB, localKey.ID, decision.Provider.ID, "/v1/chat/completions", req.Method, http.StatusBadGateway, time.Since(startedAt).Milliseconds(), err.Error(), trace)
		writeGatewayError(w, err)
		return
	}

	if resp.StatusCode >= 400 {
		responseBytes, readErr := readBodyAndClose(resp.Body)
		if readErr != nil {
			writeGatewayError(w, &gatewayError{HTTPStatus: http.StatusBadGateway, Type: "provider_error", Code: "upstream_read_failed", Message: readErr.Error(), Provider: decision.Provider.Name, Retryable: true})
			return
		}
		gwErr := mapUpstreamError(resp.StatusCode, responseBytes, decision.Provider.Name)
		logRequestBestEffort(req.Context(), r.deps.DB, localKey.ID, decision.Provider.ID, "/v1/chat/completions", req.Method, resp.StatusCode, time.Since(startedAt).Milliseconds(), gwErr.Error(), trace)
		writeGatewayError(w, gwErr)
		return
	}
	defer resp.Body.Close()

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

	reader := bufio.NewReader(resp.Body)
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

	logRequestBestEffort(req.Context(), r.deps.DB, localKey.ID, decision.Provider.ID, "/v1/chat/completions", req.Method, http.StatusOK, time.Since(startedAt).Milliseconds(), "", trace)
}
