/**
 * main.rs
 * Purpose: Tauri application entry point with backend launch and IPC commands
 * Usage: Desktop app launcher for MONAD
 * Privacy: All operations local, no network access
 */

use std::{process::{Command, Stdio}, path::PathBuf};
use tauri::{Manager, Window, WindowEvent};

mod commands;

fn launch_backend(app: &tauri::App) {
    use std::time::Duration;
    
    // Try to find backend in bundled resources
    // Tauri v2: Resources are in app bundle's Resources folder
    let candidates = {
        let mut paths = Vec::new();
        
        // 1. Check bundled location using Tauri resource_dir API
        // This will be Contents/Resources/backend in the app bundle
        if let Ok(resource_dir) = app.path().resource_dir() {
            let bundled_backend = resource_dir.join("backend");
            paths.push(bundled_backend);
            // Tauri converts ../ to _up_/, so check for _up_/_up_/backend path
            let bundled_backend_alt = resource_dir.join("_up_/_up_/backend");
            paths.push(bundled_backend_alt);
        }
        
        // 2. Fallback: Check bundled location (Resources folder) via path manipulation
        if let Some(exe_path) = std::env::current_exe().ok() {
            if let Some(exe_dir) = exe_path.parent() {
                // App bundle structure: MONAD.app/Contents/MacOS/monad
                // Resources are at: MONAD.app/Contents/Resources/backend
                if let Some(bundle) = exe_dir.parent().and_then(|p| p.parent()) {
                    let bundled_backend = bundle.join("Contents/Resources/backend");
                    paths.push(bundled_backend);
                    // Tauri converts ../ to _up_/, so check for _up_/_up_/backend path
                    let bundled_backend_alt = bundle.join("Contents/Resources/_up_/_up_/backend");
                    paths.push(bundled_backend_alt);
                }
            }
        }
        
        // 3. Check dev path (relative to src-tauri)
        paths.push(PathBuf::from("../../backend"));
        
        // 4. Check current working directory
        if let Ok(cwd) = std::env::current_dir() {
            paths.push(cwd.join("backend"));
            paths.push(cwd.join("../backend"));
        }
        
        paths
    };
    
    println!("🧩 BOOT_DIAG: Checking backend candidates...");
    for (i, candidate) in candidates.iter().enumerate() {
        println!("  [{}] Checking: {:?}", i + 1, candidate);
        if candidate.exists() {
            let main_py = candidate.join("main.py");
            if main_py.exists() {
                println!("✅ RESOLVED_BACKEND_PATH={:?}", candidate);
                
                // Retry logic with exponential backoff
                let mut last_error = None;
                for attempt in 1..=3 {
                    match Command::new("python3")
                        .arg("main.py")
                        .current_dir(candidate)
                        .stdout(Stdio::null())
                        .stderr(Stdio::null())
                        .spawn()
                    {
                        Ok(_) => {
                            println!("✅ SPAWN_OK attempt={} path={:?}", attempt, candidate);
                            return;
                        }
                        Err(e) => {
                            last_error = Some(e);
                            if attempt < 3 {
                                let delay_ms = 500 * attempt;
                                println!("⚠️ Backend spawn failed (attempt {}/3), retrying in {}ms...", attempt, delay_ms);
                                std::thread::sleep(Duration::from_millis(delay_ms as u64));
                            }
                        }
                    }
                }
                
                if let Some(e) = last_error {
                    eprintln!("❌ SPAWN_FAILED after 3 attempts: path={:?} error={}", candidate, e);
                }
                return;
            } else {
                println!("  ⚠️ main.py not found at {:?}", main_py);
            }
        } else {
            println!("  ❌ Path does not exist: {:?}", candidate);
        }
    }
    
    eprintln!("❌ BACKEND_NOT_FOUND: No valid backend path found in {} candidates", candidates.len());
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 🧩 BOOT_DIAG: Enhanced frontend asset resolution
            let current_dir = std::env::current_dir().unwrap_or_default();
            let exe_path = std::env::current_exe().ok();
            
            println!("BOOT_DIAG: cwd={:?}", current_dir);
            if let Some(ref exe) = exe_path {
                println!("BOOT_DIAG: exe={:?}", exe);
            }
            
            // Check bundled location first (for packaged app)
            let bundled_paths = if let Some(ref exe) = exe_path {
                let exe_dir = exe.parent();
                if let Some(dir) = exe_dir {
                    // MONAD.app/Contents/MacOS/monad -> MONAD.app/Contents/Resources/dist/index.html
                    let app_bundle = dir.parent().and_then(|p| p.parent());
                    if let Some(bundle) = app_bundle {
                        vec![
                            bundle.join("Contents/Resources/dist/index.html"),
                            bundle.join("Contents/dist/index.html"),
                        ]
                    } else {
                        vec![]
                    }
                } else {
                    vec![]
                }
            } else {
                vec![]
            };
            
            // Check dev paths (for development)
            let dev_paths = vec![
                PathBuf::from("../dist/index.html"),
                PathBuf::from("../frontend/dist/index.html"),
                current_dir.join("dist/index.html"),
                current_dir.join("../dist/index.html"),
            ];
            
            let all_paths: Vec<PathBuf> = bundled_paths.into_iter()
                .chain(dev_paths.into_iter())
                .collect();
            
            println!("BOOT_DIAG: searched_paths={:?}", all_paths);
            
            let mut found_path: Option<PathBuf> = None;
            for dev_path in &all_paths {
                if dev_path.exists() {
                    println!("✅ BOOT_DIAG: found=true path={:?}", dev_path);
                    found_path = Some(dev_path.clone());
                    break;
                } else {
                    println!("  ❌ BOOT_DIAG: not_found={:?}", dev_path);
                }
            }

            // Ensure main window visible and focused
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.set_focus();
                // DevTools can be opened manually via Cmd+Option+I on macOS

                // If no frontend found, inject diagnostic HTML after a short delay
                if found_path.is_none() {
                    println!("⚠️ BOOT_DIAG: FALLBACK_DIAG_SHOWN - Frontend not found in any expected location");
                    
                    let paths_str = all_paths.iter()
                        .map(|p| format!("  • {:?}", p))
                        .collect::<Vec<_>>()
                        .join("\n");
                    
                    let csp_summary = "default-src 'self' tauri: asset: blob: data:; script-src includes 'wasm-unsafe-eval'";
                    
                    let diagnostic_html_final = format!(r#"
                        <!DOCTYPE html>
                        <html lang='en'>
                        <head>
                            <meta charset='utf-8'>
                            <title>MONAD Diagnostic</title>
                            <style>
                                body {{ 
                                    background-color: #0b0b0e; 
                                    color: #fff; 
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                                    padding: 40px; 
                                    margin: 0;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                }}
                                .container {{ max-width: 800px; }}
                                .warn {{ color: #ffb45a; }}
                                code {{ 
                                    background-color: #1a1a1a; 
                                    padding: 0.2rem 0.4rem; 
                                    border-radius: 4px;
                                    font-family: 'Monaco', 'Menlo', monospace;
                                }}
                                ul {{ line-height: 1.8; }}
                                .paths {{ 
                                    background-color: #1a1a1a; 
                                    padding: 1rem; 
                                    border-radius: 4px; 
                                    font-family: monospace; 
                                    font-size: 0.9rem;
                                    margin: 1rem 0;
                                }}
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h2>🧩 MONAD Diagnostic Mode</h2>
                                <p class="warn">⚠️ Frontend not found at expected path.</p>
                                <p><strong>CSP Summary:</strong> {}</p>
                                <p><strong>Searched paths:</strong></p>
                                <div class="paths">{}</div>
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
                    "#, csp_summary, paths_str);

                    // Inject diagnostic page after webview initializes
                    let win_clone = win.clone();
                    let diag_html = diagnostic_html_final.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(500));
                        let _ = win_clone.eval(&format!(r#"
                            if (!document.body || document.body.innerHTML.trim() === '') {{
                                document.body.innerHTML = `{}`;
                            }}
                        "#, diag_html));
                    });
                } else if let Some(ref path) = found_path {
                    println!("✅ BOOT_DIAG: INDEX_OK path={:?}", path);
                    if let Some(parent) = path.parent() {
                        println!("✅ BOOT_DIAG: index_src={:?}", parent);
                    }
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