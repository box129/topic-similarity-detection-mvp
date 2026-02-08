"""
FastAPI microservice for SBERT (Sentence-BERT) embeddings.

This service provides endpoints for generating semantic embeddings using
the sentence-transformers library with the all-MiniLM-L6-v2 model.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
import logging
from typing import List
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SBERT Embedding Service",
    description="Microservice for generating semantic embeddings using Sentence-BERT",
    version="1.0.0"
)

# Configure CORS - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384

# Global model instance
model = None


def load_model():
    """Load the SBERT model on startup."""
    global model
    try:
        logger.info(f"Loading SBERT model: {MODEL_NAME}")
        model = SentenceTransformer(MODEL_NAME)
        logger.info(f"Model loaded successfully. Embedding dimension: {EMBEDDING_DIMENSION}")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise


# Pydantic models for request/response validation
class EmbedRequest(BaseModel):
    """Request model for embedding generation."""
    text: str = Field(..., min_length=1, description="Text to generate embedding for")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Machine learning is a subset of artificial intelligence"
            }
        }


class EmbedResponse(BaseModel):
    """Response model for embedding generation."""
    embedding: List[float] = Field(..., description="384-dimensional embedding vector")
    dimension: int = Field(..., description="Dimension of the embedding vector")

    class Config:
        json_schema_extra = {
            "example": {
                "embedding": [0.123, -0.456, 0.789],
                "dimension": 384
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str = Field(..., description="Service health status")
    model: str = Field(..., description="Name of the loaded SBERT model")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "model": "all-MiniLM-L6-v2"
            }
        }


@app.on_event("startup")
async def startup_event():
    """Load the model when the application starts."""
    load_model()


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns the service status and loaded model information.
    """
    try:
        if model is None:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Service unavailable."
            )
        
        logger.info("Health check requested")
        return HealthResponse(
            status="healthy",
            model=MODEL_NAME.split("/")[-1]  # Return just the model name
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )


@app.post("/embed", response_model=EmbedResponse, tags=["Embeddings"])
async def generate_embedding(request: EmbedRequest):
    """
    Generate semantic embedding for the provided text.
    
    Args:
        request: EmbedRequest containing the text to embed
        
    Returns:
        EmbedResponse containing the 384-dimensional embedding vector
        
    Raises:
        HTTPException: If model is not loaded or embedding generation fails
    """
    try:
        if model is None:
            logger.error("Embedding requested but model not loaded")
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Service unavailable."
            )
        
        # Validate input
        if not request.text or not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text cannot be empty or whitespace only"
            )
        
        logger.info(f"Generating embedding for text: '{request.text[:50]}...'")
        
        # Generate embedding
        embedding = model.encode(request.text, convert_to_tensor=False)
        
        # Convert numpy array to list of floats
        embedding_list = embedding.tolist()
        
        logger.info(f"Embedding generated successfully. Dimension: {len(embedding_list)}")
        
        return EmbedResponse(
            embedding=embedding_list,
            dimension=len(embedding_list)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate embedding: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate embedding: {str(e)}"
        )


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with service information.
    """
    return {
        "service": "SBERT Embedding Service",
        "version": "1.0.0",
        "model": MODEL_NAME,
        "embedding_dimension": EMBEDDING_DIMENSION,
        "endpoints": {
            "health": "/health",
            "embed": "/embed",
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
