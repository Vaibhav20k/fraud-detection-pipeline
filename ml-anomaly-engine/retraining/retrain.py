from pathlib import Path

from training.train import train_model
from services.model_registry import ModelRegistry


class RetrainingPipeline:

    def __init__(self):

        self.registry = ModelRegistry(
            Path("models/registry.json")
        )

    def retrain(self):

        print("=" * 60)
        print("Starting Retraining Pipeline")
        print("=" * 60)

        model_info = train_model()

        self.registry.register_model(model_info)

        print("Retraining Complete")

        return model_info