# Fintech Transaction & Anomaly Detection Pipeline

A production-grade event-driven system for real-time transaction processing with ML-powered fraud detection.

## Quick Start

```bash
docker-compose up -d
docker-compose ps
```

## Architecture

```
┌─────────────┐
│   Client    │ (Transaction Request)
└──────┬──────┘
       │ gRPC + Protobuf
       ↓
┌──────────────────────────────────────────────┐
│ INGESTION LAYER (Go)                         │
│ - Rate Limiting (Redis Sliding Window)       │
│ - Idempotency (Redis State Machine)          │
│ - Connection Pooling (PostgreSQL + Redis)    │
└──────┬───────────────────────────────────────┘
       │ Partitioned by user_id
       ↓
┌──────────────────────────────────────────────┐
│ STREAMING VALIDATION LAYER (Kafka)           │
│ - Schema Validation (Great Expectations)     │
│ - Dead Letter Queue (DLQ)                    │
└──────┬───────────────────────────────────────┘
       │
       ├─→ s < 0.7 (Normal) → PostgreSQL [50ms latency]
       │
       ├─→ s ≥ 0.9 (Fraud) → Security Queue [BLOCK]
       │
       └─→ 0.7 ≤ s < 0.9 (Marginal) ↓
           ┌──────────────────────────────────┐
           │ AI DECISION LAYER (LLaMA + pgvector)
           │ - Contextual Anomaly Analysis    │
           │ - False Positive Reduction       │
           └──────┬───────────────────────────┘
                  │
                  └─→ Final Decision [ALLOW/BLOCK]
```

## Project Status

- [ ] Week 1-2: Database schema and Protobuf
- [ ] Week 3-4: Rate limiting and idempotency
- [ ] Week 5-6: Kafka and data validation
- [ ] Week 7-8: ML anomaly detection
- [ ] Week 9-10: LLM integration
- [ ] Week 11-12: Observability

## Tech Stack

- **Ingestion:** Go, gRPC, Protocol Buffers
- **Streaming:** Apache Kafka, Great Expectations
- **ML:** Scikit-Learn, Isolation Forest, LLaMA
- **Database:** PostgreSQL, Redis, pgvector
- **Observability:** Prometheus, Grafana

## Performance Targets

- Ingestion: 5,000+ req/sec
- Latency: <5ms p99
- False Positive Reduction: 68% → <20%
- Uptime: 99.99%
