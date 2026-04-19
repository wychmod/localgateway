package server

import (
	"net/http"
)

func (r *Router) handleAdminOverview(w http.ResponseWriter, req *http.Request) {
	overview, err := r.deps.Admin.Overview(req.Context())
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]any{"data": overview})
}
