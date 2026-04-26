package server

import (
	"net/http"
	"strconv"

	"localgateway/internal/requestlog"
)

func (r *Router) handleAdminLogs(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query().Get("query")
	onlyFallback := req.URL.Query().Get("only_fallback") == "true"
	provider := req.URL.Query().Get("provider")
	apiFormat := req.URL.Query().Get("api_format")
	status := req.URL.Query().Get("status")
	limit := 50
	if raw := req.URL.Query().Get("limit"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			limit = parsed
		}
	}

	logs, err := r.deps.RequestLogs.ListWithQuery(req.Context(), requestlog.Query{
		Text:         query,
		OnlyFallback: onlyFallback,
		Provider:     provider,
		APIFormat:    apiFormat,
		Status:       status,
		Limit:        limit,
	})
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	stats, _ := r.deps.RequestLogs.Stats(req.Context())
	respondJSON(w, http.StatusOK, map[string]any{"data": logs, "stats": stats})
}

