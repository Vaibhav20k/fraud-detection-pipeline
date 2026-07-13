package server

import (
	"fmt"
	"net/http"

	apihandler "github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/api/handler"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/config"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/postgres"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/kafka"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/service"
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
	// Transaction repository
	transactionRepo := postgres.NewTransactionRepository(db)

	// Baseline repositories
	baselineRepo := postgres.NewBaselineRepository(db)
	historyRepo := postgres.NewHistoryRepository(db)

	// Baseline updater
	baselineUpdater := service.NewBaselineUpdater(
		historyRepo,
		baselineRepo,
	)

	// Kafka producer
	producer, err := kafka.NewProducer(
		cfg.KafkaBrokers,
		cfg.KafkaTopic,
	)
	if err != nil {
		panic(err)
	}

	// Transaction service
	transactionService := service.NewTransactionService(
		transactionRepo,
		producer,
		baselineUpdater,
	)

	// REST transaction handler
	transactionHandler := apihandler.NewTransactionHandler(
		transactionService,
	)

	// Prediction repository
	predictionRepo := postgres.NewFraudPredictionRepository(db)

	// Prediction handler
	predictionHandler := apihandler.NewPredictionHandler(
		predictionRepo,
	)

	// Dashboard handler
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

	mux.HandleFunc(
    	"/api/dashboard/trend",
    	dashboardHandler.GetTrend,
	)
	mux.HandleFunc(
		"/api/transactions",
		transactionHandler.SubmitTransaction,
	)


	// Wrap mux with CORS middleware
	handler := corsMiddleware(mux)

	return &HTTPServer{
		server: &http.Server{
			Addr:    ":" + cfg.HTTPPort,
			Handler: handler,
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

// --------------------
// CORS Middleware
// --------------------

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}