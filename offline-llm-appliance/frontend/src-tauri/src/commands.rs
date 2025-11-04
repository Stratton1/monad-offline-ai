/**
 * commands.rs
 * Purpose: Tauri IPC commands for secure file operations and exports
 * Usage: Called from frontend to perform file operations securely
 * Privacy: All operations are local, no network access
 * Security: Atomic file writes, secure file handling
 */

use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportPayload {
    pub title: String,
    pub messages: Vec<serde_json::Value>,
    pub createdAt: u64,
}

/**
 * Ensure chat folder exists
 */
#[command]
pub fn ensure_chat_folder(path: String) -> Result<(), String> {
    let folder_path = Path::new(&path);
    
    // Create directory if it doesn't exist
    if !folder_path.exists() {
        fs::create_dir_all(folder_path)
            .map_err(|e| format!("Failed to create folder: {}", e))?;
    }
    
    Ok(())
}

/**
 * Write secure file (atomic write)
 */
#[command]
pub fn write_secure_file(path: String, data: String) -> Result<(), String> {
    let file_path = Path::new(&path);
    
    // Create parent directory if needed
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {}", e))?;
    }
    
    // Atomic write: write to temp file first, then rename
    let temp_path = file_path.with_extension("tmp");
    
    // Write to temp file
    fs::write(&temp_path, data.as_bytes())
        .map_err(|e| format!("Failed to write temp file: {}", e))?;
    
    // Sync to disk
    if let Ok(file) = fs::File::open(&temp_path) {
        file.sync_all()
            .map_err(|e| format!("Failed to sync file: {}", e))?;
    }
    
    // Atomic rename
    fs::rename(&temp_path, file_path)
        .map_err(|e| format!("Failed to rename temp file: {}", e))?;
    
    Ok(())
}

/**
 * Read secure file
 */
#[command]
pub fn read_secure_file(path: String) -> Result<String, String> {
    let file_path = Path::new(&path);
    
    if !file_path.exists() {
        return Err(format!("File not found: {}", path));
    }
    
    fs::read_to_string(file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

/**
 * Export to PDF (placeholder - will use pdf library)
 */
#[command]
pub fn export_pdf(payload: ExportPayload, filename: String) -> Result<(), String> {
    // For now, create a simple text-based PDF representation
    // In production, use a PDF library like printpdf or pdf
    
    let content = format!(
        "Title: {}\n\nCreated: {}\n\nMessages:\n\n{}",
        payload.title,
        payload.createdAt,
        payload.messages.iter()
            .map(|m| format!("{:?}", m))
            .collect::<Vec<_>>()
            .join("\n\n")
    );
    
    // Write as text file for now (PDF generation requires additional dependencies)
    // TODO: Implement proper PDF generation with pdf crate
    let text_file = filename.replace(".pdf", ".txt");
    fs::write(&text_file, content)
        .map_err(|e| format!("Failed to export PDF: {}", e))?;
    
    Ok(())
}

/**
 * Export to RTF (Rich Text Format)
 */
#[command]
pub fn export_rtf(payload: ExportPayload, filename: String) -> Result<(), String> {
    // RTF header
    let mut rtf = String::from("{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\n");
    rtf.push_str("\\f0\\fs24\n");
    
    // Title
    rtf.push_str(&format!("\\b {}\\b0\\par\\par\n", escape_rtf(&payload.title)));
    
    // Created date
    rtf.push_str(&format!("Created: {}\\par\\par\n", payload.createdAt));
    
    // Messages
    for msg in &payload.messages {
        if let Some(role) = msg.get("role").and_then(|r| r.as_str()) {
            if let Some(content) = msg.get("content").and_then(|c| c.as_str()) {
                let role_prefix = if role == "user" { "You" } else { "MONAD" };
                rtf.push_str(&format!("\\b {}:\\b0\\par\n", escape_rtf(role_prefix)));
                rtf.push_str(&format!("{}\\par\\par\n", escape_rtf(content)));
            }
        }
    }
    
    rtf.push_str("}");
    
    // Write file
    fs::write(&filename, rtf.as_bytes())
        .map_err(|e| format!("Failed to export RTF: {}", e))?;
    
    Ok(())
}

/**
 * Escape RTF special characters
 */
fn escape_rtf(text: &str) -> String {
    text
        .replace("\\", "\\\\")
        .replace("{", "\\{")
        .replace("}", "\\}")
        .replace("\n", "\\par ")
        .replace("\r", "")
}
