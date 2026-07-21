from __future__ import annotations

import pandas as pd
from config.database import get_connection


def load_training_dataset() -> pd.DataFrame:

    connection = get_connection()

    query = """
    SELECT
        t.amount,
        t.payment_method,
        t.location,
        t.status,
        fp.prediction
    FROM transactions t
    INNER JOIN fraud_predictions fp
        ON t.transaction_id = fp.transaction_id;
    """

    dataframe = pd.read_sql_query(
        query,
        connection,
    )

    connection.close()

    if dataframe.empty:
        raise RuntimeError(
            "No labeled training data available."
        )

    return dataframe


if __name__ == "__main__":

    dataframe = load_training_dataset()

    print(dataframe.head())

    print(
        f"\nLoaded {len(dataframe)} training samples."
    )