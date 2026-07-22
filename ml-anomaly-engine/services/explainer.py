class FraudExplainer:

    @staticmethod
    def generate_reason_codes(transaction: dict):

        reasons = []

        # High transaction amount
        if transaction["amount"] > 50000:
            reasons.append("HIGH_TRANSACTION_AMOUNT")

        # High transaction velocity
        if transaction["velocity_score"] > 0.8:
            reasons.append("HIGH_TRANSACTION_VELOCITY")

        # Spending significantly different from user's history
        if transaction["spending_deviation_score"] > 0.8:
            reasons.append("UNUSUAL_SPENDING_PATTERN")

        # First ever transaction
        if transaction["is_first_transaction"] == 1:
            reasons.append("FIRST_TRANSACTION")

        # New receiver
        if transaction["is_new_receiver"] == 1:
            reasons.append("NEW_RECEIVER")

        # New bank
        if transaction["is_new_bank"] == 1:
            reasons.append("NEW_BANK")

        # Cross-bank transfer
        if transaction["is_cross_bank_transfer"] == 1:
            reasons.append("CROSS_BANK_TRANSFER")

        # Cross-currency transfer
        if transaction["is_cross_currency_transfer"] == 1:
            reasons.append("CROSS_CURRENCY_TRANSFER")

        # New payment format
        if transaction["is_new_payment_format"] == 1:
            reasons.append("NEW_PAYMENT_FORMAT")

        # Late-night transaction
        if transaction["hour"] >= 0 and transaction["hour"] <= 5:
            reasons.append("ODD_TRANSACTION_HOUR")

        if not reasons:
            reasons.append("NO_SIGNIFICANT_RISK_SIGNALS")

        return reasons