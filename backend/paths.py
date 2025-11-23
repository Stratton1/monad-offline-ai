"""
File: paths.py
Purpose: Centralized app data/model directory resolution per OS.
Privacy: All paths are local-only; no remote locations are used.
"""

import os
import platform
from pathlib import Path

APP_ID = "ai.monad.offline"


def get_app_data_dir() -> Path:
    """Resolve OS-specific application data directory."""
    system = platform.system()
    if system == "Darwin":
        return Path.home() / "Library" / "Application Support" / APP_ID
    if system == "Windows":
        base = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
        return base / APP_ID
    # Linux and others
    return Path.home() / ".local" / "share" / APP_ID


def get_data_dir() -> Path:
    """Directory for app data (context uploads, saves)."""
    return get_app_data_dir() / "data"


def get_models_dir() -> Path:
    """Directory for local models."""
    return get_app_data_dir() / "models"


def ensure_app_dirs() -> None:
    """Create required directories if they do not exist."""
    for path in [get_app_data_dir(), get_data_dir(), get_models_dir()]:
        path.mkdir(parents=True, exist_ok=True)
