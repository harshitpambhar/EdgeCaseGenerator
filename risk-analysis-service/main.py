from pathlib import Path

from analyzer import analyze_functions
from utils import read_json, write_json


def run_risk_analysis() -> None:
    service_root = Path(__file__).resolve().parent
    repo_root = service_root.parent
    input_path = repo_root / "parser-engine" / "output" / "parsed_output.json"
    output_path = service_root / "output" / "risk_scores.json"

    parsed_data = read_json(input_path)
    functions = (
        parsed_data.get("functions", []) if isinstance(parsed_data, dict) else []
    )
    results = analyze_functions(functions)
    write_json(output_path, results)


if __name__ == "__main__":
    run_risk_analysis()
