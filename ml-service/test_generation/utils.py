import json
from pathlib import Path
import re
from typing import Any


def sanitize_name(name: str) -> str:
    name = re.sub(r"[^0-9a-zA-Z_]+", "_", name)
    if name and name[0].isdigit():
        name = "f_" + name
    return name


def write_file(path: Path, content: str) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def save_json(path: Path, data: Any) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
