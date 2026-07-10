package handler

import (
	"encoding/json"
	"net/http"
)

type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}

func HealthHandler(
	w http.ResponseWriter,
	r *http.Request,
) {

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	response := HealthResponse{
		Status:  "healthy",
		Service: "fintech-fraud-api",
		Version: "v1",
	}

	_ = json.NewEncoder(w).Encode(response)
}