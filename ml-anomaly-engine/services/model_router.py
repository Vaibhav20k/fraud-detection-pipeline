import random

from services.model_registry import ModelRegistry


class ModelRouter:
    """
    Selects a model based on the configured traffic split.
    """

    def __init__(self):
        self.registry = ModelRegistry()

    def select_model(self) -> str:
        """
        Returns the selected model_id based on traffic_split.
        """

        registry = self.registry.load_registry()

        traffic_split = registry.get("traffic_split", {})

        if not traffic_split:
            return registry["active_model"]

        models = list(traffic_split.keys())
        weights = list(traffic_split.values())

        return random.choices(
            population=models,
            weights=weights,
            k=1
        )[0]