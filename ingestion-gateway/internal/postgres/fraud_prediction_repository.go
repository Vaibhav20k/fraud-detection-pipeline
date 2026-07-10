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

func (r *FraudPredictionRepository) GetAllPredictions(
	ctx context.Context,
) ([]repository.FraudPrediction, error) {

	rows, err := r.db.QueryContext(
		ctx,
		`
		SELECT
			transaction_id,
			user_id,
			fraud_probability,
			prediction,
			decision,
			threshold,
			model_version
		FROM fraud_predictions
		ORDER BY created_at DESC
		`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var predictions []repository.FraudPrediction

	for rows.Next() {

		var p repository.FraudPrediction

		err := rows.Scan(
			&p.TransactionID,
			&p.UserID,
			&p.FraudProbability,
			&p.Prediction,
			&p.Decision,
			&p.Threshold,
			&p.ModelVersion,
		)
		if err != nil {
			return nil, err
		}

		predictions = append(predictions, p)
	}

	return predictions, rows.Err()
}

func (r *FraudPredictionRepository) GetDashboardSummary(
	ctx context.Context,
	) (repository.DashboardSummary, error) {

	var summary repository.DashboardSummary

	err := r.db.QueryRowContext(
		ctx,
		`
		SELECT
			COUNT(*) AS total_transactions,
			COUNT(*) FILTER (WHERE prediction = true) AS fraudulent,
			COUNT(*) FILTER (WHERE decision = 'REVIEW') AS review,
			COUNT(*) FILTER (WHERE decision = 'ALLOW') AS allowed,
			COALESCE(
				ROUND(
					(COUNT(*) FILTER (WHERE prediction = true)::numeric * 100.0)
					/
					NULLIF(COUNT(*), 0),
					2
				),
				0
			) AS fraud_rate
		FROM fraud_predictions
		`,
	).Scan(
		&summary.TotalTransactions,
		&summary.Fraudulent,
		&summary.Review,
		&summary.Allowed,
		&summary.FraudRate,
	)

	return summary, err
	}


func (r *FraudPredictionRepository) GetPredictionByTransactionID(
	ctx context.Context,
	transactionID string,
) (repository.FraudPrediction, error) {

	var prediction repository.FraudPrediction

	err := r.db.QueryRowContext(
		ctx,
		`
		SELECT
			transaction_id,
			user_id,
			fraud_probability,
			prediction,
			decision,
			threshold,
			model_version,
			risk_flags
		FROM fraud_predictions
		WHERE transaction_id = $1
		`,
		transactionID,
	).Scan(
		&prediction.TransactionID,
		&prediction.UserID,
		&prediction.FraudProbability,
		&prediction.Prediction,
		&prediction.Decision,
		&prediction.Threshold,
		&prediction.ModelVersion,
		&prediction.RiskFlags,
	)

	return prediction, err
}

