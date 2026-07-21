package main

import (
	"log"

	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/config"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/handler/logger"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/server"
	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/metrics"
)

func main() {

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("configuration error: %v", err)
	}

	// Initialize Prometheus metrics
	metrics.Init()

	// Initialize logger
	appLogger := logger.New()

	appLogger.Println("Configuration loaded successfully")

	// Create servers
	grpcServer := server.New(cfg)
	httpServer := server.NewHTTPServer(cfg)

	// Start HTTP server
	go func() {
		appLogger.Printf(
			"Starting HTTP server on port %s",
			cfg.HTTPPort,
		)

		if err := httpServer.Start(); err != nil {
			appLogger.Fatalf(
				"HTTP Server failed: %v",
				err,
			)
		}
	}()

	// Start gRPC server
	appLogger.Printf(
		"Starting gRPC server on port %s",
		cfg.ServerPort,
	)

	if err := grpcServer.Start(); err != nil {
		appLogger.Fatalf(
			"gRPC Server failed: %v",
			err,
		)
	}
}