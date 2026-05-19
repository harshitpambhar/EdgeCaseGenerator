import json
from pathlib import Path
from typing import Any


def read_json(path: Path) -> Any:
    with Path(path).open("r", encoding="utf-8") as file_handle:
        return json.load(file_handle)


def write_json(path: Path, data: Any) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file_handle:
        json.dump(data, file_handle, indent=2, ensure_ascii=False)
