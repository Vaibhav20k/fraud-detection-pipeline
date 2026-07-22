package handler

import (
	"context"

	pb "github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/proto"

	"github.com/Vaibhav20k/fintech-pipeline/ingestion-gateway/internal/service"
)

type TransactionHandler struct {
	pb.UnimplementedTransactionServiceServer

	service *service.TransactionService
}

func NewTransactionHandler(
	service *service.TransactionService,
) *TransactionHandler {

	return &TransactionHandler{
		service: service,
	}
}

func (h *TransactionHandler) SubmitTransaction(
	ctx context.Context,
	req *pb.TransactionRequest,
) (*pb.TransactionResponse, error) {

	return h.service.SubmitTransaction(
		ctx,
		"",
		req,
	)
}
