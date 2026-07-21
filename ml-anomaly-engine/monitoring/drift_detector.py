from __future__ import annotations

import json
from typing import Dict

from config.settings import (
    DRIFT_THRESHOLD,
    REGISTRY_PATH,
)


def load_training_stats() -> Dict[str, float]:

    with open(REGISTRY_PATH, "r") as file:
        registry = json.load(file)

    active_model = registry["active_model"]

    return registry["models"][active_model]["training_stats"]


def percentage_drift(
    training_value: float,
    live_value: float,
) -> float:

    if training_value == 0:
        return 0.0

    return abs(
        live_value - training_value
    ) / training_value


def detect_drift(
    live_stats: Dict[str, float],
    threshold: float = DRIFT_THRESHOLD,
) -> Dict:
    """
    Compare live production statistics with the
    training statistics of the active model.

    Returns a drift report for each monitored metric.
    """

    training = load_training_stats()

    report = {}

    drift_detected = False

    for feature in training:

        training_value = training[feature]

        live_value = live_stats.get(feature)

        if live_value is None:
            continue

        drift = percentage_drift(
            training_value,
            live_value,
        )

        report[feature] = {
            "training": training_value,
            "live": live_value,
            "drift": round(
                drift,
                4,
            ),
            "status": (
                "DRIFT"
                if drift >= threshold
                else "OK"
            ),
        }

        if drift >= threshold:
            drift_detected = True

    return {
        "drift_detected": drift_detected,
        "threshold": threshold,
        "features": report,
    }