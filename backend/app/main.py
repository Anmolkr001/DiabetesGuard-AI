"""
DiabetesGuard AI — FastAPI Application Entry Point
===================================================
Phase 12: Backend Application Setup
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database.session import Base, engine
from backend.app.routes.api import router as api_router
from backend.app.diacare.routes import router as diacare_router

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DiabetesGuard AI — Backend Screening & Analytics API",
    description=(
        "Production-ready, research-grade FastAPI backend for the DiabetesGuard AI screening platform. "
        "Provides multi-track diabetes risk screening, calibrated probabilities, and local SHAP explanations."
    ),
    version="1.0.0"
)

# Enable CORS for Frontend React integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: restricted to frontend host
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix="/api")
app.include_router(diacare_router, prefix="/api/diacare")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DiabetesGuard AI Backend API",
        "database": "connected",
        "models_loaded": {
            "pima_clinical": "Stacking Ensemble (Calibrated) + SHAP",
            "cdc_lifestyle": "XGBoost (Calibrated)",
            "uci_symptoms": "Random Forest (Calibrated)"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

