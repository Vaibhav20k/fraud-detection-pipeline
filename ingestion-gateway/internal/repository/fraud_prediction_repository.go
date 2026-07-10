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


type DashboardSummary struct {
	TotalTransactions int     `json:"totalTransactions"`
	Fraudulent        int     `json:"fraudulent"`
	Review            int     `json:"review"`
	Allowed           int     `json:"allowed"`
	FraudRate         float64 `json:"fraudRate"`
	}


type FraudPredictionRepository interface {
	SavePrediction(
		ctx context.Context,
		prediction FraudPrediction,
	) error

	GetAllPredictions(
		ctx context.Context,
	) ([]FraudPrediction, error)

	GetDashboardSummary(
	ctx context.Context,
	) (DashboardSummary, error)

	GetPredictionByTransactionID(
	ctx context.Context,
	transactionID string,
	) (FraudPrediction, error)
}