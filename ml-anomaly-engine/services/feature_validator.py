import json

from pathlib import Path

from services.model_registry import ModelRegistry


BASE_DIR = Path(__file__).resolve().parent.parent

registry = ModelRegistry(
    BASE_DIR / "models" / "registry.json"
)


class FeatureValidationError(Exception):
    pass


class FeatureValidator:

    @staticmethod
    def _load_validation_rules():

        model = registry.get_active_model()

        metadata_path = (
            BASE_DIR
            / model["path"]
            / model["artifacts"]["metadata"]
        )

        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        return metadata["validation"]

    @staticmethod
    def validate(transaction: dict):

        rules = FeatureValidator._load_validation_rules()

        FeatureValidator.validate_amount(transaction, rules)

        FeatureValidator.validate_payment_channel(transaction, rules)

        return transaction

    @staticmethod
    def validate_amount(transaction, rules):

        amount = transaction["amount"]

        if amount < rules["min_amount"]:
            raise FeatureValidationError(
                f"Transaction amount must be at least {rules['min_amount']}."
            )

        if amount > rules["max_amount"]:
            raise FeatureValidationError(
                f"Transaction amount exceeds maximum allowed value of {rules['max_amount']}."
            )

    @staticmethod
    def validate_payment_channel(transaction, rules):

        channel = transaction["payment_channel"]

        if channel not in rules["allowed_payment_channels"]:
            raise FeatureValidationError(
                f"Unsupported payment channel '{channel}'."
            )