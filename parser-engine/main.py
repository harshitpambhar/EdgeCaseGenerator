import json
from pathlib import Path

from parsers.python_parser import parse_python_file


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    sample_file = base_dir / "sample_code" / "sample.py"
    output_dir = base_dir / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    parsed_data = parse_python_file(str(sample_file))
    parsed_data["source_file"] = sample_file.relative_to(base_dir).as_posix()
    output_file = output_dir / "parsed_output.json"
    output_file.write_text(json.dumps(parsed_data, indent=2), encoding="utf-8")

    print(f"Parsed {parsed_data['function_count']} functions from {sample_file.name}")
    print(f"JSON output written to {output_file}")


if __name__ == "__main__":
    main()
