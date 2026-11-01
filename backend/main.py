from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging

from app.core.config import settings
from app.database.session import init_db
from app.services.llm_service import llm_service

# Import all API routers
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.cases import router as cases_router
from app.routes.statements import router as statements_router
from app.routes.reconstruction import router as reconstruction_router
from app.routes.claims import router as claims_router
from app.routes.evidence import router as evidence_router
from app.routes.verification import router as verification_router
from app.routes.contradictions import router as contradictions_router
from app.routes.timeline import router as timeline_router
from app.routes.investigations import router as investigations_router
from app.routes.reports import router as reports_router
from app.routes.voice import router as voice_router
from app.routes.nexus import router as nexus_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("fragment_first.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables
    logger.info("Initializing database tables...")
    init_db()
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER} (Demo Mode: {llm_service.is_demo_mode()})")
    yield
    # Shutdown logic if any
    logger.info("Shutting down Fragment First Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered Legal Communication Assistance and Evidence Investigation Platform. "
                "Converts fragmented victim statements into trauma-informed coherent narratives, "
                "extracts atomic factual claims, corroborates evidence, detects contradictions, "
                "and generates timeline and forensic investigation reports.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = settings.FRONTEND_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_origin_regex=r"https?://localhost(:\d+)?|https?://127\.0\.0\.1(:\d+)?" if origins == ["*"] or "*" not in origins else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred.",
            "error_type": exc.__class__.__name__
        }
    )


# Root & Health Check Endpoints
@app.get("/", tags=["System"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "demo_mode": llm_service.is_demo_mode(),
        "documentation": "/docs",
        "ethical_framework": "Trauma-informed legal communication; no deception scoring; preserved original statements."
    }


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "llm_provider": settings.LLM_PROVIDER,
        "demo_mode": llm_service.is_demo_mode()
    }


# Include API Routers with /api prefix
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(cases_router, prefix=settings.API_V1_STR)
app.include_router(statements_router, prefix=settings.API_V1_STR)
app.include_router(reconstruction_router, prefix=settings.API_V1_STR)
app.include_router(claims_router, prefix=settings.API_V1_STR)
app.include_router(evidence_router, prefix=settings.API_V1_STR)
app.include_router(verification_router, prefix=settings.API_V1_STR)
app.include_router(contradictions_router, prefix=settings.API_V1_STR)
app.include_router(timeline_router, prefix=settings.API_V1_STR)
app.include_router(investigations_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(voice_router, prefix=settings.API_V1_STR)
app.include_router(nexus_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
