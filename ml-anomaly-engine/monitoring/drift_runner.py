from __future__ import annotations

import json

from .drift_detector import detect_drift
from .live_stats import collect_live_statistics


def run_drift_detection():

    live_statistics = collect_live_statistics()

    report = detect_drift(
        live_statistics,
    )

    return report


def main():

    report = run_drift_detection()

    print(
        json.dumps(
            report,
            indent=4,
        )
    )


if __name__ == "__main__":
    main()