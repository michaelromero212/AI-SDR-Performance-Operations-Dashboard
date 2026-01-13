"""
AI SDR Performance Operations Platform - FastAPI Main Application
"""
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from .routers import leads, campaigns, analytics
from .database import init_database
from .services.llm_service import llm_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI SDR Performance Operations Platform",
    description="Production-grade AI SDR operations with governance, QA, and monitoring",
    version="1.0.0"
)

# CORS middleware
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8050").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(leads.router)
app.include_router(campaigns.router)
app.include_router(analytics.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    logger.info("🚀 Starting AI SDR Operations Platform...")
    try:
        init_database()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    
    # Check LLM service
    health = llm_service.health_check()
    if health['enabled']:
        logger.info(f"✅ LLM Service ready: {health['model']}")
    else:
        logger.warning("⚠️  LLM Service disabled - configure HF_API_TOKEN in .env")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("👋 Shutting down AI SDR Operations Platform...")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI SDR Performance Operations Platform",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    llm_health = llm_service.health_check()
    
    return {
        "status": "healthy",
        "database": "connected",
        "llm_service": llm_health
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
