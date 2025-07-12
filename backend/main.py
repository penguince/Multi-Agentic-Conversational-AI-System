from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging

from database import connect_to_mongo, close_mongo_connection
from crm.routes import router as crm_router

import os
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up CRM System...")
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down CRM System...")
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="CRM User Data Capture System",
    description="A lightweight CRM system for capturing and managing user data from conversational exchanges",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],  # Use FRONTEND_URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include CRM routes
app.include_router(crm_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CRM System"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "CRM User Data Capture System",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )