import os
from pathlib import Path
from paths import get_app_data_dir, get_data_dir, get_models_dir


def test_paths_resolve_under_app_id():
    root = get_app_data_dir()
    assert "ai.monad.offline" in str(root)
    assert get_data_dir().as_posix().startswith(root.as_posix())
    assert get_models_dir().as_posix().startswith(root.as_posix())


def test_env_override_model_path(monkeypatch):
    fake_path = "/tmp/fake_model.gguf"
    monkeypatch.setenv("MODEL_PATH", fake_path)
    from config import Config
    assert Config.MODEL_PATH.endswith("fake_model.gguf")
