package server

import (
	"fmt"
	"net/http"
	apihandler "github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/api/handler"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/config"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/postgres"
)

type HTTPServer struct {
	server *http.Server
	port   string
}

func NewHTTPServer(
	cfg *config.Config,
) *HTTPServer {

	mux := http.NewServeMux()

	// PostgreSQL connection
	db, err := postgres.NewConnection(cfg)
	if err != nil {
		panic(err)
	}

	// Prediction repository
	predictionRepo := postgres.NewFraudPredictionRepository(db)

	// Prediction handler
	predictionHandler := apihandler.NewPredictionHandler(
		predictionRepo,
	)

	dashboardHandler := apihandler.NewDashboardHandler(
	predictionRepo,
	)

	mux.HandleFunc(
	"/health",
	apihandler.HealthHandler,
	)

	mux.HandleFunc(
		"/api/predictions",
		predictionHandler.GetAllPredictions,
	)

	mux.HandleFunc(
	"/api/dashboard/summary",
	dashboardHandler.GetSummary,
	)


	return &HTTPServer{
		server: &http.Server{
			Addr:    ":" + cfg.HTTPPort,
			Handler: mux,
		},
		port: cfg.HTTPPort,
	}
}
func (h *HTTPServer) Start() error {

	fmt.Printf(
		"🚀 REST API listening on port %s\n",
		h.port,
	)

	return h.server.ListenAndServe()
}

func (h *HTTPServer) Stop() error {
	return h.server.Close()
}