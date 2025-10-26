// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, State};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use reqwest;
use serde_json::json;
use log::{info, error, warn};

// Backend process state
struct BackendState {
    process: Arc<Mutex<Option<std::process::Child>>>,
    is_running: Arc<Mutex<bool>>,
}

impl BackendState {
    fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            is_running: Arc::new(Mutex::new(false)),
        }
    }
}

// Commands
#[tauri::command]
async fn start_backend(state: State<'_, BackendState>) -> Result<String, String> {
    let mut is_running = state.is_running.lock().unwrap();
    
    if *is_running {
        return Ok("Backend is already running".to_string());
    }

    info!("Starting backend process...");
    
    // Start the FastAPI backend
    let backend_path = std::env::current_dir()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join("backend");
    
    let mut process = Command::new("python3")
        .arg("main.py")
        .current_dir(&backend_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start backend: {}", e))?;

    // Store the process
    {
        let mut process_guard = state.process.lock().unwrap();
        *process_guard = Some(process);
    }
    
    *is_running = true;
    
    // Wait a moment for the backend to start
    thread::sleep(Duration::from_secs(3));
    
    // Check if backend is responding
    match check_backend_health().await {
        Ok(_) => {
            info!("Backend started successfully");
            Ok("Backend started successfully".to_string())
        }
        Err(e) => {
            warn!("Backend started but health check failed: {}", e);
            Ok("Backend started but may not be fully ready".to_string())
        }
    }
}

#[tauri::command]
async fn stop_backend(state: State<'_, BackendState>) -> Result<String, String> {
    let mut is_running = state.is_running.lock().unwrap();
    
    if !*is_running {
        return Ok("Backend is not running".to_string());
    }

    info!("Stopping backend process...");
    
    // Kill the backend process
    {
        let mut process_guard = state.process.lock().unwrap();
        if let Some(mut process) = process_guard.take() {
            let _ = process.kill();
            let _ = process.wait();
        }
    }
    
    *is_running = false;
    
    info!("Backend stopped successfully");
    Ok("Backend stopped successfully".to_string())
}

#[tauri::command]
async fn check_backend_status() -> Result<serde_json::Value, String> {
    match check_backend_health().await {
        Ok(health_data) => Ok(health_data),
        Err(e) => Ok(json!({
            "status": "error",
            "message": e,
            "connected": false
        }))
    }
}

#[tauri::command]
async fn restart_backend(state: State<'_, BackendState>) -> Result<String, String> {
    info!("Restarting backend...");
    
    // Stop first
    let _ = stop_backend(state.clone()).await;
    
    // Wait a moment
    thread::sleep(Duration::from_secs(2));
    
    // Start again
    start_backend(state).await
}

async fn check_backend_health() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    match client
        .get("http://localhost:8000/api/health/simple")
        .timeout(Duration::from_secs(5))
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                let health_data: serde_json::Value = response.json().await
                    .map_err(|e| format!("Failed to parse health response: {}", e))?;
                
                Ok(json!({
                    "status": "healthy",
                    "connected": true,
                    "data": health_data
                }))
            } else {
                Err(format!("Backend returned status: {}", response.status()))
            }
        }
        Err(e) => Err(format!("Backend connection failed: {}", e))
    }
}

fn main() {
    // Initialize logger
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();

    info!("Starting MONAD desktop application...");

    let backend_state = BackendState::new();

    tauri::Builder::default()
        .manage(backend_state)
        .invoke_handler(tauri::generate_handler![
            start_backend,
            stop_backend,
            check_backend_status,
            restart_backend
        ])
        .setup(|app| {
            info!("Setting up MONAD application...");
            
            // Auto-start backend on app launch
            let app_handle = app.handle();
            let backend_state = app_handle.state::<BackendState>();
            
            // Start backend in a separate thread
            thread::spawn(move || {
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
                    // Wait a moment for the app to fully initialize
                    thread::sleep(Duration::from_secs(2));
                    
                    match start_backend(backend_state.inner()).await {
                        Ok(msg) => info!("Auto-start backend: {}", msg),
                        Err(e) => error!("Auto-start backend failed: {}", e),
                    }
                });
            });
            
            Ok(())
        })
        .on_window_event(|event| {
            match event.event() {
                tauri::WindowEvent::CloseRequested { .. } => {
                    info!("Application closing, cleaning up...");
                    // Backend will be cleaned up automatically when the process exits
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
