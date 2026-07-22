import json
import joblib
import pandas as pd

from pathlib import Path

from monitoring.drift_monitor import DriftMonitor
from services.model_registry import ModelRegistry
from services.feature_validator import FeatureValidator
from services.explainer import FraudExplainer
from services.prediction_logger import PredictionLogger

# ==========================================================
# Project Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

registry = ModelRegistry(
    BASE_DIR / "models" / "registry.json"
)

MODEL_INFO = registry.get_active_model()

MODEL_DIR = BASE_DIR / MODEL_INFO["path"]

print("=" * 60)
print("Loading ML Artifacts...")
print("=" * 60)

# ==========================================================
# Load Model Artifacts
# ==========================================================

MODEL = joblib.load(
    MODEL_DIR / MODEL_INFO["artifacts"]["model"]
)

ENCODER = joblib.load(
    MODEL_DIR / MODEL_INFO["artifacts"]["encoder"]
)

with open(
    MODEL_DIR / MODEL_INFO["artifacts"]["metadata"],
    "r",
) as f:
    METADATA = json.load(f)

THRESHOLD = METADATA["threshold"]
MODEL_VERSION = MODEL_INFO["version"]
DRIFT_MONITOR = DriftMonitor()

print(f"Model Loaded : {MODEL_INFO['model_id']}")
print(f"Version      : {MODEL_VERSION}")
print(f"Threshold    : {THRESHOLD}")

# ==========================================================
# Payment Channel Mapping
# ==========================================================

PAYMENT_CHANNEL_MAPPING = {
    "CARD": "Credit Card",
    "NET_BANKING": "Wire",
    "UPI": "ACH",
    "WALLET": "Cash",
}

# ==========================================================
# Prediction
# ==========================================================

def predict(transaction: dict):

    # Validate incoming transaction
    FeatureValidator.validate(transaction)

    DRIFT_MONITOR.update(transaction)

    reason_codes = FraudExplainer.generate_reason_codes(transaction)

    dataframe = pd.DataFrame([transaction])

    dataframe["payment_channel"] = (
        dataframe["payment_channel"]
        .map(PAYMENT_CHANNEL_MAPPING)
        .fillna(dataframe["payment_channel"])
    )

    dataframe["payment_channel"] = ENCODER.transform(
        dataframe["payment_channel"]
    )

    probability = MODEL.predict_proba(
        dataframe
    )[0][1]

    prediction = probability >= THRESHOLD

    confidence = max(
        probability,
        1 - probability,
    )

    response = {
        "fraud_probability": round(
            float(probability),
            4,
        ),
        "confidence": round(
            float(confidence),
            4,
        ),
        "prediction": bool(prediction),
        "threshold": THRESHOLD,
        "model_version": MODEL_VERSION,
        "reason_codes": reason_codes,
    }

    PredictionLogger.log(
        transaction,
        response,
    )

    return response