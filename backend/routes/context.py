"""
File: context.py
Purpose: Handle file uploads and context management for MONAD
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
from typing import Dict, Any
from pathlib import Path
from datetime import datetime
import logging
from paths import get_data_dir, ensure_app_dirs

logger = logging.getLogger(__name__)

router = APIRouter()

ensure_app_dirs()
# Create data directory if it doesn't exist (OS-specific app data dir by default)
DATA_ROOT = Path(os.getenv("DATA_DIR", get_data_dir())).resolve()
CONTEXT_DIR = DATA_ROOT / "context"

CONTEXT_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_context_file(file: UploadFile = File(...)):
    """
    Upload a context file (PDF, DOCX, TXT) for processing
    
    Args:
        file: The uploaded file
        
    Returns:
        JSON response with context ID and summary
    """
    try:
        # Validate filename (no traversal)
        if "/" in file.filename or "\\" in file.filename or ".." in file.filename:
            raise HTTPException(status_code=400, detail="Invalid filename")

        # Validate file type and size
        allowed_types = [".pdf", ".docx", ".txt"]
        allowed_mime = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not supported. Allowed: {allowed_types}"
            )
        if file.content_type and file.content_type not in allowed_mime:
            raise HTTPException(status_code=400, detail="Unsupported content type")
        max_bytes = int(os.getenv("MAX_CONTEXT_FILE_MB", "10")) * 1024 * 1024
        
        # Generate unique context ID
        context_id = str(uuid.uuid4())
        
        # Save file locally (never leaves device)
        file_path = CONTEXT_DIR / f"{context_id}{file_ext}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            if len(content) > max_bytes:
                raise HTTPException(status_code=413, detail="File too large")
            buffer.write(content)
        
        # Extract text based on file type
        text_content = ""
        if file_ext == ".txt":
            text_content = content.decode("utf-8")
        elif file_ext in {".pdf", ".docx"}:
            # Placeholder until full parsing is added; avoid misleading text
            text_content = ""
        
        # Store context metadata
        context_metadata = {
            "context_id": context_id,
            "filename": file.filename,
            "file_type": file_ext,
            "file_size": len(content),
            "text_preview": text_content[:500] + "..." if len(text_content) > 500 else text_content,
            "uploaded_at": datetime.utcnow().isoformat() + "Z",
        }
        
        logger.info("Context file uploaded (size=%s bytes)", len(content))
        
        return JSONResponse(content={
            "success": True,
            "context_id": context_id,
            "summary": f"File '{file.filename}' imported successfully",
            "metadata": context_metadata
        })
        
    except Exception as e:
        logger.error(f"Error uploading context file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/list")
async def list_context_files():
    """
    List all uploaded context files
    
    Returns:
        JSON response with list of context files
    """
    try:
        context_files = []
        
        if CONTEXT_DIR.exists():
            for filename in os.listdir(CONTEXT_DIR):
                file_path = CONTEXT_DIR / filename
                if file_path.is_file():
                    stat = file_path.stat()
                    context_files.append({
                        "filename": filename,
                        "file_size": stat.st_size,
                        "uploaded_at": datetime.utcfromtimestamp(stat.st_mtime).isoformat() + "Z"
                    })
        
        return JSONResponse(content={
            "success": True,
            "files": context_files,
            "count": len(context_files)
        })
        
    except Exception as e:
        logger.error(f"Error listing context files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

@router.delete("/{context_id}")
async def delete_context_file(context_id: str):
    """
    Delete a context file
    
    Args:
        context_id: The context ID to delete
        
    Returns:
        JSON response confirming deletion
    """
    try:
        # Find file with this context ID
        deleted = False
        if CONTEXT_DIR.exists():
            for filename in os.listdir(CONTEXT_DIR):
                if filename.startswith(context_id):
                    file_path = CONTEXT_DIR / filename
                    file_path.unlink(missing_ok=True)
                    deleted = True
                    break
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Context file not found")
        
        logger.info(f"Context file deleted: {context_id}")
        
        return JSONResponse(content={
            "success": True,
            "message": f"Context file {context_id} deleted successfully"
        })
        
    except Exception as e:
        logger.error(f"Error deleting context file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")
