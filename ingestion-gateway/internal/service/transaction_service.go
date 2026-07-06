package service

import (
	"context"

	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/repository"
	pb "github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/proto"
)

type TransactionService struct {
	repository repository.TransactionRepository
}

func NewTransactionService(
	repo repository.TransactionRepository,
) *TransactionService {

	return &TransactionService{
		repository: repo,
	}
}

func (s *TransactionService) SubmitTransaction(
	ctx context.Context,
	req *pb.TransactionRequest,
) (*pb.TransactionResponse, error) {

	transactionID, err := s.repository.SaveTransaction(ctx, req)
	if err != nil {
		return nil, err
	}

	return &pb.TransactionResponse{
		TransactionId: transactionID,
		Status:        "RECEIVED",
		Message:       "Transaction stored successfully.",
	}, nil
}
