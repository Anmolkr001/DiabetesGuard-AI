"""
DiabetesGuard AI — Backend & Inference Integration Tests
==========================================================
Phase 16: API and Machine Learning Pipeline Verification
Uses httpx.AsyncClient with ASGITransport for seamless, non-blocking ASGI testing.
"""

import sys
from pathlib import Path
import pytest
import httpx

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_health_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "models_loaded" in data


@pytest.mark.anyio
async def test_model_metrics_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/model/metrics")
        assert response.status_code == 200
        metrics = response.json()
        assert len(metrics) == 3
        track_codes = [m["track_code"] for m in metrics]
        assert "pima_clinical" in track_codes
        assert "cdc_lifestyle" in track_codes
        assert "uci_symptoms" in track_codes


@pytest.mark.anyio
async def test_model_information_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/model/information")
        assert response.status_code == 200
        info = response.json()
        assert "critical_distinction" in info


@pytest.mark.anyio
async def test_pima_clinical_prediction():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "pregnancies": 2,
            "glucose": 145.0,
            "blood_pressure": 80.0,
            "skin_thickness": 28.0,
            "insulin": 130.0,
            "bmi": 32.5,
            "diabetes_pedigree": 0.45,
            "age": 42
        }
        response = await client.post("/api/assessment/pima", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "calibrated_probability" in data
        assert 0.0 <= data["calibrated_probability"] <= 1.0
        assert "risk_category" in data
        assert "disclaimer" in data
        assert data["track_code"] == "pima_clinical"
        assert data.get("top_contributing_factors") is not None


@pytest.mark.anyio
async def test_cdc_lifestyle_prediction():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "high_bp": 1,
            "high_chol": 1,
            "chol_check": 1,
            "bmi": 31.0,
            "smoker": 0,
            "stroke": 0,
            "heart_disease": 0,
            "phys_activity": 1,
            "fruits": 1,
            "veggies": 1,
            "heavy_alcohol": 0,
            "any_healthcare": 1,
            "no_doc_cost": 0,
            "gen_hlth": 3,
            "ment_hlth": 0,
            "phys_hlth": 2,
            "diff_walk": 0,
            "sex": 1,
            "age_bracket": 9,
            "education": 5,
            "income": 6
        }
        response = await client.post("/api/assessment/cdc", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert 0.0 <= data["calibrated_probability"] <= 1.0
        assert data["track_code"] == "cdc_lifestyle"


@pytest.mark.anyio
async def test_uci_symptom_prediction():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "age": 45,
            "gender": 1,
            "polyuria": 1,
            "polydipsia": 1,
            "sudden_weight_loss": 1,
            "weakness": 1,
            "polyphagia": 0,
            "genital_thrush": 0,
            "visual_blurring": 0,
            "itching": 1,
            "irritability": 0,
            "delayed_healing": 1,
            "partial_paresis": 0,
            "muscle_stiffness": 0,
            "alopecia": 0,
            "obesity": 1
        }
        response = await client.post("/api/assessment/uci", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert 0.0 <= data["calibrated_probability"] <= 1.0
        assert data["track_code"] == "uci_symptoms"
        assert data["calibrated_probability"] > 0.5


@pytest.mark.anyio
async def test_history_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/assessment/history")
        assert response.status_code == 200
        history = response.json()
        assert isinstance(history, list)
        assert len(history) >= 3
