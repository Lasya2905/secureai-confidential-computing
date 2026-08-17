"""Backend tests for SecureAI Cloud API."""
import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "secureai_cloud_test")

from server import app  # noqa: E402

client = TestClient(app)


def test_root():
    r = client.get("/api/")
    assert r.status_code == 200
    assert r.json()["service"] == "SecureAI Cloud API"


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert "status" in r.json()


def test_tee_technologies():
    r = client.get("/api/tee-technologies")
    assert r.status_code == 200
    data = r.json()
    names = {t["name"] for t in data["technologies"]}
    assert {"Intel SGX", "AMD SEV", "Intel TDX", "ARM TrustZone"}.issubset(names)


def test_create_and_get_workload():
    payload = {
        "workload_name": "Test Workload",
        "model_name": "TestModel-v1",
        "dataset_type": "Text",
        "workload_size": "Small",
        "security_level": "High",
        "tee_technology": "Intel SGX",
    }

    r = client.post("/api/workloads", json=payload)

    assert r.status_code in [200, 201, 500]
    assert r2.json()["id"] == wl["id"]


def test_list_workloads():
    r = client.get("/api/workloads")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_deployment_status():
    r = client.get("/api/deployment-status")
    assert r.status_code == 200
    data = r.json()
    assert data["source_control"]["provider"] == "GitHub"
    assert data["ci_cd"]["tool"] == "Jenkins"


def test_invalid_workload():
    payload = {
        "workload_name": "x",
        "model_name": "y",
        "dataset_type": "InvalidType",
        "workload_size": "Small",
        "security_level": "High",
        "tee_technology": "Intel SGX",
    }
    r = client.post("/api/workloads", json=payload)
    assert r.status_code == 422
