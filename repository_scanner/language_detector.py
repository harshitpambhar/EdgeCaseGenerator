"""
Language detection by file extension.
Add new languages here — nothing else needs to change.
"""

EXTENSION_MAP: dict[str, str] = {
    ".py":   "python",
    ".js":   "javascript",
    ".jsx":  "javascript",
    ".ts":   "typescript",
    ".tsx":  "typescript",
    ".java": "java",
    ".cpp":  "cpp",
    ".cc":   "cpp",
    ".cxx":  "cpp",
    ".c":    "c",
    ".h":    "c",
    ".hpp":  "cpp",
    ".go":   "go",
    ".rb":   "ruby",
    ".rs":   "rust",
    ".kt":   "kotlin",
    ".cs":   "csharp",
    ".php":  "php",
}


def detect_language(file_path: str) -> str | None:
    from pathlib import Path
    suffix = Path(file_path).suffix.lower()
    return EXTENSION_MAP.get(suffix)
