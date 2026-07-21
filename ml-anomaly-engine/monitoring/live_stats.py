from __future__ import annotations

from typing import Dict

from config.database import get_connection


def collect_live_statistics() -> Dict[str, float]:

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT

            AVG(t.amount),

            AVG(fp.fraud_probability),

            AVG(fp.confidence),

            AVG(
                CASE
                    WHEN fp.prediction = TRUE
                    THEN 1
                    ELSE 0
                END
            )

        FROM fraud_predictions fp

        INNER JOIN transactions t
            ON fp.transaction_id = t.transaction_id;
        """
    )

    result = cursor.fetchone()

    cursor.close()
    connection.close()

    if result is None or all(value is None for value in result):
        raise RuntimeError(
            "No production statistics available. The fraud_predictions table is empty."
        )

    return {
        "mean_amount": float(result[0]),
        "mean_fraud_probability": float(result[1]),
        "mean_confidence": float(result[2]),
        "fraud_rate": float(result[3]),
    }