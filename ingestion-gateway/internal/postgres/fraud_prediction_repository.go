package postgres

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/repository"
)

type FraudPredictionRepository struct {
	db *sql.DB
}

func NewFraudPredictionRepository(
	db *sql.DB,
) *FraudPredictionRepository {

	return &FraudPredictionRepository{
		db: db,
	}
}

func (r *FraudPredictionRepository) SavePrediction(
	ctx context.Context,
	prediction repository.FraudPrediction,
) error {

	riskFlagsJSON, err := json.Marshal(
		prediction.RiskFlags,
	)
	if err != nil {
		return err
	}

	_, err = r.db.ExecContext(
		ctx,
		`
		INSERT INTO fraud_predictions
		(
			transaction_id,
			user_id,
			fraud_probability,
			prediction,
			decision,
			threshold,
			model_version,
			risk_flags
		)
		VALUES
		(
			$1,$2,$3,$4,$5,$6,$7,$8
		)
		`,
		prediction.TransactionID,
		prediction.UserID,
		prediction.FraudProbability,
		prediction.Prediction,
		prediction.Decision,
		prediction.Threshold,
		prediction.ModelVersion,
		riskFlagsJSON,
	)

	return err
}