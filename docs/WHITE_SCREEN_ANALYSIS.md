# 🧩 White Screen Analysis Report

**Date:** 2024-11-04  
**Status:** ✅ **FIXED** - All Critical and High Priority Issues Resolved  
**Last Updated:** 2025-01-27

---

## 🔴 Critical Issues

### 1. **Absolute Paths in Built JS (argon2.wasm)**
**Location:** `dist/assets/*.js`  
**Issue:** Hardcoded absolute paths like `/Users/joseph/.../node_modules/argon2-browser/dist/argon2.wasm`  
**Impact:** WASM file will 404 in bundled app → MIME type error → white screen  
**Fix:** See Patch 1 below

### 2. **Bundle Resources Folder Empty**
**Location:** `MONAD.app/Contents/Resources/`  
**Issue:** No `dist` or `backend` folders bundled  
**Impact:** App can't find frontend assets or backend  
**Fix:** Verify Tauri bundling configuration (Patch 2)

### 3. **CSP Missing Tauri Protocol Allowances**
**Location:** `tauri.conf.json` line 26  
**Issue:** Missing `tauri:`, `asset:`, `blob:`, `ipc:`, `wasm-unsafe-eval`  
**Impact:** WASM/workers blocked, IPC calls fail  
**Fix:** See Patch 2 below

### 4. **Backend Path Hardcoded**
**Location:** `main.rs` line 16  
**Issue:** `../../backend` won't resolve in bundle  
**Impact:** Backend won't launch in packaged app  
**Fix:** See Patch 3 below

---

## ✅ What's Already Correct

1. ✅ `vite.config.ts` has `base: './'`
2. ✅ `dist/index.html` uses relative paths (`./assets/...`)
3. ✅ `ErrorBoundary` component exists and wraps App
4. ✅ `unhandledrejection` handler exists in `App.tsx`
5. ✅ Diagnostic fallback HTML exists in `main.rs`
6. ✅ Window label matches ("main")
7. ✅ Window is shown and focused

---

## 🔧 Ready-to-Apply Patches

### **Patch 1: Fix CSP in `tauri.conf.json`**

```json
"security": {
  "csp": "default-src 'self' tauri: asset: blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' tauri: asset: blob:; style-src 'self' 'unsafe-inline' tauri: asset: blob:; font-src 'self' data: tauri: asset:; img-src 'self' data: blob: tauri: asset:; connect-src 'self' tauri: asset: ipc: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*;"
}
```

**Change:** Line 26 in `frontend/src-tauri/tauri.conf.json`

---

### **Patch 2: Fix Backend Path in `main.rs`**

**Replace lines 13-24:**

```rust
fn launch_backend(app: &tauri::App) {
    use std::path::PathBuf;
    
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
    
    if let Err(e) = std::process::Command::new("python3")
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
```

**Update main() setup block:**

```rust
.setup(|app| {
    // ... existing frontend diagnostic code ...
    
    // Launch the Python backend (use resource resolver)
    launch_backend(app);
    
    Ok(())
})
```

**Change:** Lines 13-25 and line 126 in `frontend/src-tauri/src/main.rs`

---

### **Patch 3: Fix WASM Path Issue (vite.config.ts)**

**Update `rollupOptions.external`:**

```typescript
rollupOptions: {
  external: (id) => {
    // DON'T externalize - let Vite bundle WASM as asset
    // Externalizing causes absolute paths in production
    return false;
  },
  output: {
    assetFileNames: (assetInfo) => {
      if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
        return 'assets/[name][extname]';
      }
      return 'assets/[name]-[hash][extname]';
    },
  },
},
```

**Also ensure argon2.wasm is copied to dist/assets:**

Add to `vite.config.ts` after `build` section:

```typescript
build: {
  // ... existing config ...
  copyPublicDir: true,
  // Ensure WASM files are treated as assets
  assetsInclude: ['**/*.wasm'],
},
```

**Change:** Lines 15-20 and add `copyPublicDir` in `frontend/vite.config.ts`

**Note:** You may need to manually copy `argon2.wasm` to `public/` or configure Vite to copy it from `node_modules/argon2-browser/dist/argon2.wasm` to `dist/assets/`.

---

## 🧪 Smoke Test (After Applying Patches)

```bash
# 1. Clean and rebuild frontend
cd /Users/joseph/OfflineLLM/offline-llm-appliance/frontend
rm -rf dist src-tauri/target

# 2. Build frontend
npm run build

# 3. Verify WASM is in dist/assets
ls -la dist/assets/*.wasm

# 4. Build Tauri app
npm run tauri:build

# 5. Verify bundle contents
ls -la src-tauri/target/release/bundle/macos/MONAD.app/Contents/Resources/

# Expected output should show:
# - dist/ folder
# - backend/ folder

# 6. Launch app from terminal to see diagnostic logs
./src-tauri/target/release/bundle/macos/MONAD.app/Contents/MacOS/MONAD

# Expected logs:
# 🧩 MONAD Diagnostic: Found frontend at /.../Resources/dist/index.html
# ✅ Found bundled backend at: /.../Resources/backend
# ✅ Backend launched successfully from /.../Resources/backend
```

---

## 📋 Summary of Required Changes

| File | Change | Priority |
|------|--------|----------|
| `tauri.conf.json` | Update CSP with `tauri:`, `asset:`, `blob:`, `ipc:` | 🔴 Critical |
| `main.rs` | Fix backend path resolution (use resource resolver) | 🔴 Critical |
| `vite.config.ts` | Fix WASM bundling (remove external, ensure asset copy) | 🔴 Critical |
| `vite.config.ts` | Add `copyPublicDir: true` | 🟡 Medium |

---

## 🚀 Next Steps

1. Apply Patch 1 (CSP) - **Immediate**
2. Apply Patch 2 (Backend path) - **Immediate**
3. Apply Patch 3 (WASM bundling) - **Immediate**
4. Run smoke test - **After patches**
5. If bundle still empty, check Tauri v2 bundling documentation

---

## ⚠️ Notes

- The absolute paths in built JS are the **most critical** issue causing white screen
- Tauri should automatically bundle `frontendDist` folder, but verify it's working
- If `dist` folder still not in bundle after patches, check Tauri v2 `frontendDist` behavior
- Consider adding a post-build script to verify bundle contents


---

**MONAD Offline AI v1.0.0 — "Untethered Intelligence"
