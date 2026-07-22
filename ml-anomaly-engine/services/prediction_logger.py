from pathlib import Path
from datetime import datetime
import json


BASE_DIR = Path(__file__).resolve().parent.parent

LOG_DIR = BASE_DIR / "logs"

LOG_DIR.mkdir(exist_ok=True)

LOG_FILE = LOG_DIR / "predictions.jsonl"


class PredictionLogger:

    @staticmethod
    def log(transaction: dict, prediction: dict):

        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "transaction": transaction,
            "prediction": prediction,
        }

        with open(LOG_FILE, "a") as f:
            f.write(json.dumps(record))
            f.write("\n")