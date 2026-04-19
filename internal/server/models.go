package server

import (
	"fmt"
	"net/http"
	"time"
)

type modelsResponse struct {
	Object string       `json:"object"`
	Data   []modelEntry `json:"data"`
}

type modelEntry struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	OwnedBy string `json:"owned_by"`
}

func (r *Router) handleModels(w http.ResponseWriter, req *http.Request) {
	providers, err := r.deps.Providers.List(req.Context())
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	entries := []modelEntry{}
	for _, p := range providers {
		entries = append(entries, modelEntry{ID: fmt.Sprintf("%s-default", p.Type), Object: "model", Created: time.Now().Unix(), OwnedBy: p.Name})
	}

	respondJSON(w, http.StatusOK, modelsResponse{Object: "list", Data: entries})
}
