package postgres

import (
	"context"

	pb "github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/proto"
)

type TransactionRepository struct {
}

func NewTransactionRepository() *TransactionRepository {
	return &TransactionRepository{}
}

func (r *TransactionRepository) SaveTransaction(
	ctx context.Context,
	transaction *pb.TransactionRequest,
) (string, error) {

	// TODO:
	// Insert transaction into PostgreSQL

	return "txn-demo-001", nil
}
