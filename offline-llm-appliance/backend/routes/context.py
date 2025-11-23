"""
File: context.py
Purpose: Handle file uploads and context management for MONAD
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Create data directory if it doesn't exist
DATA_DIR = "/Users/joseph/OfflineLLM/offline-llm-appliance/data"
CONTEXT_DIR = os.path.join(DATA_DIR, "context")

os.makedirs(CONTEXT_DIR, exist_ok=True)

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
        # Validate file type
        allowed_types = [".pdf", ".docx", ".txt"]
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {file_ext} not supported. Allowed: {allowed_types}"
            )
        
        # Generate unique context ID
        context_id = str(uuid.uuid4())
        
        # Save file
        file_path = os.path.join(CONTEXT_DIR, f"{context_id}{file_ext}")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Extract text based on file type
        text_content = ""
        if file_ext == ".txt":
            text_content = content.decode("utf-8")
        elif file_ext == ".pdf":
            # For now, just return a placeholder for PDF
            text_content = f"[PDF content from {file.filename} - {len(content)} bytes]"
        elif file_ext == ".docx":
            # For now, just return a placeholder for DOCX
            text_content = f"[DOCX content from {file.filename} - {len(content)} bytes]"
        
        # Store context metadata
        context_metadata = {
            "context_id": context_id,
            "filename": file.filename,
            "file_type": file_ext,
            "file_size": len(content),
            "text_preview": text_content[:500] + "..." if len(text_content) > 500 else text_content,
            "uploaded_at": "2025-10-26T04:00:00Z"  # In real implementation, use datetime.now().isoformat()
        }
        
        logger.info(f"Context file uploaded: {file.filename} -> {context_id}")
        
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
        
        if os.path.exists(CONTEXT_DIR):
            for filename in os.listdir(CONTEXT_DIR):
                file_path = os.path.join(CONTEXT_DIR, filename)
                if os.path.isfile(file_path):
                    file_size = os.path.getsize(file_path)
                    context_files.append({
                        "filename": filename,
                        "file_size": file_size,
                        "uploaded_at": "2025-10-26T04:00:00Z"  # In real implementation, use file modification time
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
        if os.path.exists(CONTEXT_DIR):
            for filename in os.listdir(CONTEXT_DIR):
                if filename.startswith(context_id):
                    file_path = os.path.join(CONTEXT_DIR, filename)
                    os.remove(file_path)
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
