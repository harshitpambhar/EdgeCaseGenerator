import json
import importlib
import importlib.util
import sys
from pathlib import Path

from parsers.python_parser import parse_python_file


def load_generate_edge_cases():
    ml_service_gen_path = Path(__file__).resolve().parent.parent / "ml-service" / "edge_case_engine" / "generator.py"
    
    if not ml_service_gen_path.exists():
        # Return a no-op function if ml-service not available
        return lambda x: []
    
    spec = importlib.util.spec_from_file_location(
        "_ml_service_edge_case_gen", ml_service_gen_path
    )
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module.generate_edge_cases
    
    return lambda x: []


def main() -> None:
    generate_edge_cases = load_generate_edge_cases()
    base_dir = Path(__file__).resolve().parent
    repo_root = base_dir.parent
    sample_file = base_dir / "sample_code" / "sample.py"
    output_dir = base_dir / "output"
    ml_output_dir = repo_root / "ml-service" / "output"
    output_dir.mkdir(parents=True, exist_ok=True)
    ml_output_dir.mkdir(parents=True, exist_ok=True)

    parsed_data = parse_python_file(str(sample_file))
    parsed_data["source_file"] = sample_file.relative_to(base_dir).as_posix()

    edge_case_data = {
        "source_file": parsed_data["source_file"],
        "functions": [],
    }
    for function_data in parsed_data.get("functions", []):
        conditions = function_data.get("conditions", [])
        edge_case_data["functions"].append(
            {
                "name": function_data.get("name"),
                "edge_cases": {
                    condition: generate_edge_cases(condition)
                    for condition in conditions
                },
            }
        )

    output_file = output_dir / "parsed_output.json"
    edge_output_file = ml_output_dir / "edge_cases.json"
    output_file.write_text(json.dumps(parsed_data, indent=2), encoding="utf-8")
    edge_output_file.write_text(json.dumps(edge_case_data, indent=2), encoding="utf-8")

    print(f"Parsed {parsed_data['function_count']} functions from {sample_file.name}")
    print(f"JSON output written to {output_file}")
    print(f"Edge cases written to {edge_output_file}")


if __name__ == "__main__":
    main()
