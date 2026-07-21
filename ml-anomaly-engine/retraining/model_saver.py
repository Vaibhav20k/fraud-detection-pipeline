from __future__ import annotations

from datetime import datetime

import joblib

from config.settings import (
    MODELS_DIR,
    MODEL_FILE_EXTENSION,
)


def save_model(model) -> str:

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    model_name = f"fraud_model_{timestamp}"

    model_path = (
        MODELS_DIR
        / f"{model_name}{MODEL_FILE_EXTENSION}"
    )

    joblib.dump(
        model,
        model_path,
    )

    return model_name