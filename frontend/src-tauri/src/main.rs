/**
 * main.rs
 * Purpose: Tauri application entry point with backend launch and IPC commands
 * Usage: Desktop app launcher for MONAD
 * Privacy: All operations local, no network access
 */

use std::{process::{Command, Stdio}, path::PathBuf, sync::Once, net::TcpStream, time::Duration};
use std::io::{Read, Write};
use tauri::{Manager, Window, WindowEvent};

mod commands;

static BACKEND_LAUNCH: Once = Once::new();
fn resolve_backend_dir() -> PathBuf {
    // Prefer bundled locations first (macOS .app and Windows/Linux resources/)
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let macos_bundle = exe_dir.join("../Resources/backend");
            if macos_bundle.exists() {
                println!("✅ Found bundled backend at {:?}", macos_bundle);
                return macos_bundle;
            }

            let resources_dir = exe_dir.join("../resources/backend");
            if resources_dir.exists() {
                println!("✅ Found bundled backend at {:?}", resources_dir);
                return resources_dir;
            }
        }
    }

    // Dev fallbacks: prefer ../../backend (repo root), then ../backend if someone nested differently
    let dev_candidates = [
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../backend"),
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../backend"),
    ];

    for candidate in dev_candidates {
        if candidate.exists() {
            println!("✅ Using dev backend path {:?}", candidate);
            return candidate;
        } else {
            println!("  ❌ Dev backend not found at {:?}", candidate);
        }
    }

    let fallback = PathBuf::from("../../backend");
    println!("⚠️ Bundled backend not found, falling back to {:?}", fallback);
    fallback
}

fn launch_backend(_app: &tauri::App) {
    let backend_dir = resolve_backend_dir();
    println!("🧩 MONAD Diagnostic: Launching backend from {:?}", backend_dir);
    
    BACKEND_LAUNCH.call_once(|| {
        // Skip launch if port already responding (backend running)
        if TcpStream::connect_timeout(&"127.0.0.1:5005".parse().unwrap(), Duration::from_millis(200)).is_ok() {
            println!("ℹ️ Backend already running on port 5005, skipping spawn");
            return;
        }

        if !backend_dir.exists() {
            eprintln!("❌ Backend directory not found at {:?}. Backend will not start.", backend_dir);
            return;
        }

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
            poll_backend_health();
        }
    });
}

fn poll_backend_health() {
    std::thread::spawn(|| {
        for _ in 0..10 {
            if let Ok(mut stream) = TcpStream::connect("127.0.0.1:5005") {
                let _ = stream.write_all(b"GET /api/health/simple HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
                let mut buf = [0u8; 64];
                if let Ok(read) = stream.read(&mut buf) {
                    if read > 0 && buf.starts_with(b"HTTP/1.1 200") {
                        println!("✅ Backend health confirmed");
                        return;
                    }
                }
            }
            std::thread::sleep(Duration::from_millis(500));
        }
        println!("❌ Local backend failed to start. Check your model path and try again.");
    });
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
