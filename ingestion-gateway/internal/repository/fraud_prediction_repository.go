package repository

import "context"

type FraudPrediction struct {
	TransactionID string

	UserID string

	FraudProbability float64

	Prediction bool

	Decision string

	Threshold float64

	ModelVersion string

	RiskFlags []string
}

type FraudPredictionRepository interface {
	SavePrediction(
		ctx context.Context,
		prediction FraudPrediction,
	) error
}