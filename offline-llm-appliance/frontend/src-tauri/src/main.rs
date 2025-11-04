/**
 * main.rs
 * Purpose: Tauri application entry point with backend launch and IPC commands
 * Usage: Desktop app launcher for MONAD
 * Privacy: All operations local, no network access
 */

use std::{process::{Command, Stdio}, path::PathBuf};
use tauri::{Manager, Window, WindowEvent};

mod commands;

fn launch_backend(_app: &tauri::App) {
    
    // Try to find backend in bundled resources
    // Tauri v2: Resources are in app bundle's Resources folder
    let backend_dir = {
        // Check bundled location first (relative to app bundle)
        let exe_path = std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|p| p.to_path_buf()));
        
        if let Some(exe_dir) = exe_path {
            // App bundle structure: MONAD.app/Contents/MacOS/monad
            // Resources are at: MONAD.app/Contents/Resources/backend
            let bundled_backend = exe_dir
                .parent() // Contents
                .and_then(|p| p.parent()) // MONAD.app
                .map(|p| p.join("Contents/Resources/backend"));
            
            if let Some(ref bundled) = bundled_backend {
                if bundled.exists() {
                    println!("✅ Found bundled backend at: {:?}", bundled);
                    bundled.clone()
                } else {
                    println!("⚠️ Bundled backend not found at {:?}, trying dev path", bundled);
                    PathBuf::from("../../backend")
                }
            } else {
                PathBuf::from("../../backend")
            }
        } else {
            PathBuf::from("../../backend")
        }
    };

    println!("🧩 MONAD Diagnostic: Launching backend from {:?}", backend_dir);
    
    if let Err(e) = Command::new("python3")
        .arg("main.py")
        .current_dir(&backend_dir)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        eprintln!("❌ Failed to launch backend from {:?}: {}", backend_dir, e);
    } else {
        println!("✅ Backend launched successfully from {:?}", backend_dir);
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 🧩 MONAD Diagnostic: Check common paths for frontend assets
            let current_dir = std::env::current_dir().unwrap_or_default();
            let dev_paths = vec![
                PathBuf::from("../dist/index.html"),
                PathBuf::from("../frontend/dist/index.html"),
                current_dir.join("dist/index.html"),
                current_dir.join("../dist/index.html"),
            ];

            println!("🧩 MONAD Diagnostic: Current working directory: {:?}", current_dir);
            println!("🧩 MONAD Diagnostic: Checking frontend paths...");
            
            let mut found_path: Option<PathBuf> = None;
            for dev_path in &dev_paths {
                if dev_path.exists() {
                    println!("✅ MONAD Diagnostic: Found frontend at {:?}", dev_path);
                    found_path = Some(dev_path.clone());
                    break;
                } else {
                    println!("  ❌ Not found: {:?}", dev_path);
                }
            }

            // Ensure main window visible and focused
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.set_focus();
                // DevTools can be opened manually via Cmd+Option+I on macOS

                // If no frontend found, inject diagnostic HTML after a short delay
                if found_path.is_none() {
                    println!("⚠️ MONAD Diagnostic: Frontend not found in any expected location");
                    
                    let diagnostic_html = r#"
                        <!DOCTYPE html>
                        <html lang='en'>
                        <head>
                            <meta charset='utf-8'>
                            <title>MONAD Diagnostic</title>
                            <style>
                                body { 
                                    background-color: #0b0b0e; 
                                    color: #fff; 
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                                    padding: 40px; 
                                    margin: 0;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                }
                                .container { max-width: 800px; }
                                .warn { color: #ffb45a; }
                                code { 
                                    background-color: #1a1a1a; 
                                    padding: 0.2rem 0.4rem; 
                                    border-radius: 4px;
                                    font-family: 'Monaco', 'Menlo', monospace;
                                }
                                ul { line-height: 1.8; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h2>🧩 MONAD Diagnostic Mode</h2>
                                <p class="warn">⚠️ Frontend not found at expected path.</p>
                                <p>Checked path: <code>../dist/index.html</code></p>
                                <p>Please verify:</p>
                                <ul>
                                    <li><code>vite.config.ts</code> has <b>base: './'</b></li>
                                    <li><code>tauri.conf.json</code> has <b>frontendDist: '../dist'</b></li>
                                    <li>Run <code>npm run build</code> before <code>npm run tauri:build</code></li>
                                    <li>Check that <code>dist/index.html</code> exists in <code>frontend/dist/</code></li>
                                </ul>
                                <p>Check the terminal logs for detailed diagnostic information.</p>
                            </div>
                        </body>
                        </html>
                    "#;

                    // Inject diagnostic page after webview initializes
                    let win_clone = win.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(500));
                        let _ = win_clone.eval(&format!(r#"
                            if (!document.body || document.body.innerHTML.trim() === '') {{
                                document.body.innerHTML = `{}`;
                            }}
                        "#, diagnostic_html));
                    });
                } else if let Some(ref path) = found_path {
                    println!("✅ MONAD Diagnostic: Frontend will be loaded from {:?}", path);
                }
            }

            // Launch the Python backend (use resource resolver)
            launch_backend(app);
            Ok(())
        })
        // Register IPC commands (Tauri v2 syntax)
        .invoke_handler(tauri::generate_handler![
            commands::ensure_chat_folder,
            commands::write_secure_file,
            commands::read_secure_file,
            commands::export_pdf,
            commands::export_rtf,
        ])
        // 👇 Correct closure signature for Tauri v2:
        .on_window_event(|window: &Window, event: &WindowEvent| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                window.hide().unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running MONAD");
}