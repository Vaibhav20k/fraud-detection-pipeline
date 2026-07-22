from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from monitoring.model_monitor import ModelMonitor

from inference.schemas import (
    PredictionRequest,
    PredictionResponse,

    ModelListResponse,
    ModelInfoResponse,
    MonitoringResponse,

    ActivateModelRequest,
    RegisterModelRequest,

    OperationResponse,
)
from inference.predictor import DRIFT_MONITOR

from inference.predictor import predict

from services.feature_validator import FeatureValidationError
from services.model_registry import ModelRegistry
from services.model_manager import ModelManager


# ==========================================================
# Project Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================================================
# Model Services
# ==========================================================

registry = ModelRegistry(
    BASE_DIR / "models" / "registry.json"
)

model_manager = ModelManager(BASE_DIR)


# ==========================================================
# FastAPI App
# ==========================================================

app = FastAPI(
    title="Fraud Detection API",
    description="Real-Time Fraud Detection using XGBoost",
    version="1.0.0",
)


# ==========================================================
# Health Check
# ==========================================================

@app.get("/health")
def health():

    active_model = registry.get_active_model()

    return {
        "status": "healthy",
        "model_loaded": True,
        "model_version": active_model["version"],
        "active_model": active_model["model_id"],
    }

# ==========================================================
# Monitoring
# ==========================================================

@app.get(
    "/monitoring",
    response_model=MonitoringResponse,
)
def monitoring():

    return MonitoringResponse(
        **ModelMonitor.get_statistics()
    )
# ==========================================================
# Root
# ==========================================================

@app.get("/")
def root():

    active_model = registry.get_active_model()

    return {
        "message": "Fraud Detection API",
        "version": active_model["version"],
        "active_model": active_model["model_id"],
    }

# ==========================================================
# List All Registered Models
# ==========================================================

@app.get(
    "/models",
    response_model=ModelListResponse,
)
def list_models():

    models = registry.list_models()

    active = registry.get_active_model()

    return ModelListResponse(
        active_model=active["model_id"],
        models=[
            ModelInfoResponse(**model)
            for model in models
        ],
    )

# ==========================================================
# Activate Model
# ==========================================================

@app.post(
    "/models/activate",
    response_model=OperationResponse,
)
def activate_model(request: ActivateModelRequest):

    model = registry.get_model(request.model_id)

    if model is None:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"Model '{request.model_id}' not found."
            },
        )

    try:
        model_manager.switch_model(request.model_id)

        return OperationResponse(
            success=True,
            message=f"Active model changed to '{request.model_id}'."
        )

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e)
            },
        )


# ==========================================================
# Register New Model
# ==========================================================

@app.post(
    "/models/register",
    response_model=OperationResponse,
)
def register_model(request: RegisterModelRequest):

    if registry.get_model(request.model_id):

        return JSONResponse(
            status_code=409,
            content={
                "success": False,
                "message": f"Model '{request.model_id}' already exists."
            },
        )

    model_data = request.model_dump()

    model_data["status"] = "INACTIVE"

    from datetime import datetime

    today = datetime.now().strftime("%Y-%m-%d")

    model_data["created_at"] = today
    model_data["updated_at"] = today

    registry.register_model(model_data)

    return OperationResponse(
        success=True,
        message=f"Model '{request.model_id}' registered successfully."
    )


# ==========================================================
# Prediction Endpoint
# ==========================================================

@app.post(
    "/predict",
    response_model=PredictionResponse,
)
def make_prediction(request: PredictionRequest):

    payload = request.model_dump()

    print("\n========== Incoming Payload ==========")
    print(payload)
    print("=====================================\n")

    try:

        result = predict(payload)

        return PredictionResponse(**result)

    except FeatureValidationError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:

        print("\n========== Prediction Error ==========")

        import traceback
        traceback.print_exc()

        print("======================================\n")

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            },
        )

# ==========================================================
# Get Active Model
# ==========================================================

@app.get(
    "/models/active",
    response_model=ModelInfoResponse,
)
def get_active_model():

    active_model = registry.get_active_model()

    return ModelInfoResponse(
        **active_model
    )

# ==========================================================
# Get Model By ID
# ==========================================================

@app.get(
    "/models/{model_id}",
    response_model=ModelInfoResponse,
)
def get_model(model_id: str):

    model = registry.get_model(model_id)

    if model is None:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"Model '{model_id}' not found."
            },
        )

    return ModelInfoResponse(**model)

@app.get("/drift")
def get_drift_statistics():
    from inference.predictor import METADATA

    return DRIFT_MONITOR.detect_drift(METADATA)