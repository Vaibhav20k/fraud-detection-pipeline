from __future__ import annotations

import json
from datetime import datetime

from config.settings import REGISTRY_PATH


def load_registry() -> dict:

    with open(REGISTRY_PATH, "r") as file:
        return json.load(file)


def save_registry(registry: dict) -> None:

    with open(REGISTRY_PATH, "w") as file:
        json.dump(
            registry,
            file,
            indent=4,
        )


def promote_model(
    model_name: str,
    metrics: dict,
    metadata: dict,
    training_stats: dict,
) -> bool:

    registry = load_registry()

    active_model = registry["active_model"]

    current_metrics = (
        registry["models"]
        .get(active_model, {})
        .get("evaluation", {})
    )

    current_f1 = current_metrics.get(
        "f1_score",
        0.0,
    )

    new_f1 = metrics["f1_score"]

    if new_f1 <= current_f1:

        print(
            "New model did not outperform current model."
        )

        return False

    registry["models"][model_name] = {
        "version": datetime.now().strftime(
            "%Y%m%d%H%M%S"
        ),
        "created_at": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
        "updated_at": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
        "algorithm": metadata["algorithm"],
        "dataset_size": metadata["dataset_size"],
        "feature_columns": metadata["feature_columns"],
        "hyperparameters": metadata["hyperparameters"],
        "training_stats": training_stats,
        "evaluation": metrics,
    }

    registry["active_model"] = model_name

    save_registry(registry)

    print(
        f"{model_name} promoted successfully."
    )

    return True