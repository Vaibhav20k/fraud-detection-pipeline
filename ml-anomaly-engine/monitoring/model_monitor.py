from pathlib import Path
import json


BASE_DIR = Path(__file__).resolve().parent.parent

LOG_FILE = (
    BASE_DIR
    / "logs"
    / "predictions.jsonl"
)


class ModelMonitor:

    @staticmethod
    def get_statistics():

        if not LOG_FILE.exists():

            return {
                "total_predictions": 0,
                "fraud_predictions": 0,
                "average_confidence": 0,
                "average_probability": 0,
            }

        total = 0
        fraud = 0

        confidence_sum = 0
        probability_sum = 0

        with open(LOG_FILE) as f:

            for line in f:

                record = json.loads(line)

                prediction = record["prediction"]

                total += 1

                confidence_sum += prediction["confidence"]

                probability_sum += prediction["fraud_probability"]

                if prediction["prediction"]:
                    fraud += 1

        return {

            "total_predictions": total,

            "fraud_predictions": fraud,

            "fraud_rate": (
                round(fraud / total, 4)
                if total
                else 0
            ),

            "average_confidence": (
                round(confidence_sum / total, 4)
                if total
                else 0
            ),

            "average_probability": (
                round(probability_sum / total, 4)
                if total
                else 0
            ),
        }