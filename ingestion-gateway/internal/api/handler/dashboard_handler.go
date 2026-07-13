package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/repository"
)

type DashboardHandler struct {
	repository repository.FraudPredictionRepository
}

func NewDashboardHandler(
	repository repository.FraudPredictionRepository,
) *DashboardHandler {

	return &DashboardHandler{
		repository: repository,
	}
}

func (h *DashboardHandler) GetSummary(
	w http.ResponseWriter,
	r *http.Request,
) {

	summary, err := h.repository.GetDashboardSummary(
		context.Background(),
	)

	if err != nil {

		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(summary)
}

func (h *DashboardHandler) GetTrend(
	w http.ResponseWriter,
	r *http.Request,
) {

	trend, err := h.repository.GetFraudTrend(
		context.Background(),
	)

	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(trend)
}