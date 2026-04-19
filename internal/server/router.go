package server

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog"

	"localgateway/internal/admin"
	"localgateway/internal/auth"
	"localgateway/internal/config"
	"localgateway/internal/provider"
	"localgateway/internal/routing"
	"localgateway/internal/settings"
	"localgateway/internal/usage"
)

type Dependencies struct {
	Config    config.Config
	Logger    zerolog.Logger
	Providers *provider.Service
	Keys      *auth.Service
	Routing   *routing.Service
	Usage     *usage.Service
	Settings  *settings.Service
	Admin     *admin.Service
}

type Router struct {
	mux  chi.Router
	deps Dependencies
}

func NewRouter(deps Dependencies) *Router {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   deps.Config.Security.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Api-Key", "anthropic-version"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	router := &Router{mux: r, deps: deps}
	router.mount()
	return router
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	r.mux.ServeHTTP(w, req)
}

func (r *Router) mount() {
	r.mux.Get("/health", r.handleHealth)
	r.mux.Get("/v1/models", r.handleModels)
	r.mux.Post("/v1/chat/completions", r.handleChatCompletions)
	r.mux.Post("/v1/messages", r.handleClaudeMessages)

	r.mux.Route("/admin/api", func(adminRouter chi.Router) {
		adminRouter.Get("/overview", r.handleAdminOverview)

		adminRouter.Get("/providers", r.handleProviders)
		adminRouter.Post("/providers", r.handleCreateProvider)
		adminRouter.Put("/providers/{id}", r.handleUpdateProvider)
		adminRouter.Delete("/providers/{id}", r.handleDeleteProvider)
		adminRouter.Post("/providers/{id}/test", r.handleTestProvider)
		adminRouter.Post("/providers/{id}/discover-models", r.handleDiscoverModels)
		adminRouter.Post("/providers/reorder", r.handleReorderProviders)

		adminRouter.Get("/keys", r.handleKeys)
		adminRouter.Post("/keys", r.handleCreateKey)
		adminRouter.Put("/keys/{id}", r.handleUpdateKey)
		adminRouter.Post("/keys/{id}/revoke", r.handleRevokeKey)
		adminRouter.Post("/keys/{id}/rotate", r.handleRotateKey)
		adminRouter.Post("/keys/{id}/extend", r.handleExtendKey)

		adminRouter.Get("/routing", r.handleRoutingRules)
		adminRouter.Post("/routing", r.handleCreateRoutingRule)
		adminRouter.Put("/routing/{id}", r.handleUpdateRoutingRule)
		adminRouter.Delete("/routing/{id}", r.handleDeleteRoutingRule)
		adminRouter.Post("/routing/test", r.handleRoutingTest)
		adminRouter.Get("/aliases", r.handleModelAliases)
		adminRouter.Put("/aliases", r.handleUpsertModelAlias)

		adminRouter.Get("/settings", r.handleGetSettings)
		adminRouter.Put("/settings", r.handleSaveSettings)
		adminRouter.Post("/settings/backup", r.handleBackupSettings)
		adminRouter.Get("/distribution", r.handleDistributionPlan)
	})
}

func (r *Router) handleHealth(w http.ResponseWriter, req *http.Request) {
	respondJSON(w, http.StatusOK, map[string]any{
		"status": "ok",
		"time":   time.Now().UTC(),
	})
}

func respondJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
