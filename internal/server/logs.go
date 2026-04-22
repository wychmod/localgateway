package server

import (
	"net/http"
	"strconv"
)

func (r *Router) handleAdminLogs(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query().Get("query")
	onlyFallback := req.URL.Query().Get("only_fallback") == "true"
	limit := 50
	if raw := req.URL.Query().Get("limit"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			limit = parsed
		}
	}

	logs, err := r.deps.RequestLogs.List(req.Context(), query, onlyFallback, limit)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"data": logs})
}
