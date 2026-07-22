import json
import joblib

from pathlib import Path

from services.model_registry import ModelRegistry


class ModelManager:

    def __init__(self, base_dir: Path):

        self.base_dir = Path(base_dir)

        self.registry = ModelRegistry(
            self.base_dir / "models" / "registry.json"
        )

        self.loaded_models = {}

    def load_model(self, model_id: str):

        if model_id in self.loaded_models:
            return self.loaded_models[model_id]

        model_info = self.registry.get_model(model_id)

        if model_info is None:
            raise ValueError(f"Model '{model_id}' not found.")

        model_dir = self.base_dir / model_info["path"]

        artifacts = model_info["artifacts"]

        model = joblib.load(
            model_dir / artifacts["model"]
        )

        encoder = joblib.load(
            model_dir / artifacts["encoder"]
        )

        with open(
            model_dir / artifacts["metadata"],
            "r",
            encoding="utf-8"
        ) as f:
            metadata = json.load(f)

        loaded = {
            "model": model,
            "encoder": encoder,
            "metadata": metadata,
            "info": model_info,
        }

        self.loaded_models[model_id] = loaded

        return loaded
    def get_active_model(self):

        active = self.registry.get_active_model_id()

        return self.load_model(active)

    def switch_model(self, model_id: str):

        self.registry.activate_model(model_id)

        return self.get_active_model()

    def list_loaded_models(self):

        return list(self.loaded_models.keys())

    def unload_model(self, model_id: str):

        if model_id in self.loaded_models:
            del self.loaded_models[model_id]