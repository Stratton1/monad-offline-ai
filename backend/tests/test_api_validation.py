import io
from fastapi.testclient import TestClient
import main
from dependencies import set_llm_runner


client = TestClient(main.app)


def test_generate_validation_rejects_empty_prompt():
    resp = client.post("/api/generate", json={"prompt": ""})
    assert resp.status_code == 422


def test_generate_clamps_max_tokens(monkeypatch):
    class DummyRunner:
        is_initialized = True
        async def generate_response(self, prompt, max_tokens=None, **kwargs):
            return {"response": "ok", "metadata": {"max_tokens": max_tokens}}
        def get_status(self):
            return {"initialized": True}
    set_llm_runner(DummyRunner())
    resp = client.post("/api/generate", json={"prompt": "hi", "max_tokens": 999999})
    assert resp.status_code == 200
    assert resp.json()["response"] == "ok"


def test_context_upload_rejects_bad_filetype():
    files = {"file": ("malware.exe", b"bad", "application/octet-stream")}
    resp = client.post("/api/context/upload", files=files)
    assert resp.status_code == 400


def test_context_upload_rejects_oversize(monkeypatch):
    # patch size limit low
    monkeypatch.setenv("MAX_CONTEXT_FILE_MB", "0")
    files = {"file": ("big.txt", b"a" * 2048, "text/plain")}
    resp = client.post("/api/context/upload", files=files)
    assert resp.status_code == 413
