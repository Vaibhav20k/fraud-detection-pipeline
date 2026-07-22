import json
from pathlib import Path
from typing import Dict, List, Optional


class ModelRegistry:
    """
    Handles all interactions with the model registry.

    No other part of the application should read registry.json directly.
    """

    def __init__(self, registry_path: str = "models/registry.json"):
        self.registry_path = Path(registry_path)

        if not self.registry_path.exists():
            raise FileNotFoundError(
                f"Registry file not found: {self.registry_path}"
            )

        self._load()

    def _load(self):
        with open(self.registry_path, "r", encoding="utf-8") as f:
            self.registry = json.load(f)

    def _save(self):
        with open(self.registry_path, "w", encoding="utf-8") as f:
            json.dump(self.registry, f, indent=4)

    # --------------------------------------------------
    # Read Operations
    # --------------------------------------------------

    def list_models(self) -> List[Dict]:
        return self.registry.get("models", [])

    def get_active_model_id(self) -> str:
        return self.registry["active_model"]

    def get_active_model(self) -> Dict:

        active = self.get_active_model_id()

        for model in self.list_models():
            if model["model_id"] == active:
                return model

        raise ValueError(f"Active model '{active}' not found.")

    def get_model(self, model_id: str) -> Optional[Dict]:

        for model in self.list_models():
            if model["model_id"] == model_id:
                return model

        return None

    # --------------------------------------------------
    # Write Operations
    # --------------------------------------------------

    def activate_model(self, model_id: str):

        model = self.get_model(model_id)

        if model is None:
            raise ValueError(f"Model '{model_id}' not found.")

        for m in self.registry["models"]:
            if m["model_id"] == model_id:
                m["status"] = "ACTIVE"
            else:
                m["status"] = "ARCHIVED"

        self.registry["active_model"] = model_id

        self._save()

    def register_model(self, model_info: Dict):

        if self.get_model(model_info["model_id"]):
            raise ValueError("Model already exists.")

        self.registry["models"].append(model_info)

        self._save()

    def remove_model(self, model_id: str):

        active = self.get_active_model_id()

        if model_id == active:
            raise ValueError("Cannot remove active model.")

        self.registry["models"] = [
            model
            for model in self.registry["models"]
            if model["model_id"] != model_id
        ]

        self._save()