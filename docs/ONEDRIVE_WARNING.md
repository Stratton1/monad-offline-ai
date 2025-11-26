# ⚠️ OneDrive / Cloud Sync Directory Warning

**Last Updated:** 2025-11-26  
**Severity:** HIGH - May cause backend failures

---

## 🚨 Problem Summary

Running MONAD from a cloud-synced directory (OneDrive, iCloud Drive, Google Drive, Dropbox) can cause:

1. **Backend spawn failures** - File locking prevents process creation
2. **Python venv corruption** - Sync conflicts break virtual environments  
3. **Model load crashes** - Large files (8GB Phi-3) timeout during sync
4. **Slow performance** - Continuous sync overhead
5. **Intermittent errors** - Race conditions from file system changes

---

## 🔍 How to Detect

### Check Your Project Location

```bash
pwd
```

**⚠️ Warning Signs:**
- Path contains: `OneDrive`, `iCloud`, `Google Drive`, `Dropbox`
- Example: `/Users/Joe/Library/CloudStorage/OneDrive-JBSSurveying/...`

### Tauri Logs

When launching MONAD, check terminal for:

```
⚠️  WARNING: Backend is in a cloud sync directory!
⚠️  This may cause file locking and spawn failures.
⚠️  Recommended: Move project to local disk
```

---

## 🛠️ Solution: Relocate Project

### Step 1: Choose a Local Directory

**Recommended Locations:**
- `~/Developer/monad-offline-ai` (macOS/Linux)
- `~/Projects/monad-offline-ai`
- `C:\Dev\monad-offline-ai` (Windows)

**Avoid:**
- `~/OneDrive/...`
- `~/Library/CloudStorage/...`
- `~/iCloudDrive/...`
- `~/Google Drive/...`

### Step 2: Move the Project

```bash
# Stop any running processes first
pkill -f "monad"
pkill -f "python.*main.py"

# Create local directory
mkdir -p ~/Developer

# Move project (preserves .git history)
mv "/Users/Joe/Library/CloudStorage/OneDrive-JBSSurveying/.../monad-offline-ai" ~/Developer/

# Navigate to new location
cd ~/Developer/monad-offline-ai
```

### Step 3: Rebuild Virtual Environment

The Python venv must be recreated in the new location:

```bash
cd backend

# Remove old venv
rm -rf venv

# Create fresh venv
python3 -m venv venv

# Activate and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Verify Model Location

Models are stored in OS app data (safe from sync):

```bash
# macOS
ls -lh ~/Library/Application\ Support/ai.monad.offline/models/

# Expected: phi-3-medium-128k-instruct-q4_k_m.gguf (8GB)
```

If model is missing, re-download:

```bash
cd backend
./download_model.sh
```

### Step 5: Test the Fix

```bash
# Start backend manually
cd backend
source venv/bin/activate
python main.py

# In another terminal, check health
curl http://localhost:5005/api/health/simple

# Should return: {"status":"ok","message":"MONAD backend is running",...}
```

### Step 6: Launch Tauri Dev

```bash
cd frontend
npm run tauri dev
```

**Expected:**
- ✅ No OneDrive warnings in logs
- ✅ Backend spawns successfully
- ✅ Model loads without timeout
- ✅ App opens normally

---

## 🔧 Why Cloud Sync Breaks MONAD

### 1. File Locking During venv Activation

**Problem:**
- OneDrive locks files during sync
- `venv/bin/activate` script becomes inaccessible
- Python subprocess spawn fails with "Permission denied"

**Manifestation:**
```
❌ Failed to launch backend: Os { code: 13, kind: PermissionDenied, message: "Permission denied" }
```

### 2. Binary Corruption in venv

**Problem:**
- Cloud sync doesn't handle symlinks well
- Python executables in `venv/bin/` get corrupted
- Interpreter fails with `bad interpreter` or segfaults

**Manifestation:**
```
/bin/sh: venv/bin/python: bad interpreter: No such file or directory
```

### 3. Model File Access Timeout

**Problem:**
- Phi-3 Medium is 8GB
- llama.cpp needs exclusive file access
- OneDrive holds lock during upload
- Model load times out after 30-60s

**Manifestation:**
```
❌ Failed to initialize LLM: FileNotFoundError or Timeout
⚠️  Phi-3 Medium may still be loading. Check terminal/logs.
```

### 4. Race Conditions on Config Files

**Problem:**
- Backend writes `config.json`, `auth_data.json`
- OneDrive syncs mid-write
- Tauri reads partially synced file
- JSON parse errors

**Manifestation:**
```
SyntaxError: Unexpected end of JSON input
```

---

## 🚀 Alternative: Keep in OneDrive with Manual Backend

If you **must** keep the project in OneDrive:

### Option A: Run Backend Manually

```bash
# Terminal 1: Start backend from OneDrive location
cd backend
source venv/bin/activate
python main.py

# Terminal 2: Start Tauri (frontend only)
cd frontend
npm run tauri dev -- --no-backend-spawn
```

**⚠️ Note:** Tauri currently doesn't have `--no-backend-spawn` flag. You'll need to:
1. Start backend manually first
2. Tauri will detect port 5005 is in use and skip spawn

### Option B: Exclude venv from Sync

**OneDrive Settings:**
1. Right-click `backend/venv` folder
2. "Free up space" or "Always keep on this device"
3. Add to OneDrive exclude list

**This is NOT reliable** - OneDrive may still interfere.

---

## ✅ Verification Checklist

After relocating, verify:

- [ ] Project path does NOT contain `OneDrive`, `iCloud`, `Google Drive`
- [ ] `pwd` shows local directory (e.g., `~/Developer/monad-offline-ai`)
- [ ] `backend/venv` rebuilt successfully
- [ ] Backend starts without spawn errors
- [ ] No OneDrive warnings in Tauri logs
- [ ] Model loads within 2 minutes
- [ ] App opens and chat works
- [ ] No file permission errors

---

## 📊 Performance Comparison

| Metric | OneDrive Location | Local Disk |
|--------|-------------------|------------|
| Backend Spawn | ❌ Often fails | ✅ Reliable |
| Model Load Time | 🐢 3-5 minutes | ✅ 30-60 seconds |
| venv Activation | ❌ Intermittent | ✅ Always works |
| File Operations | 🐢 Slow + locks | ✅ Fast |
| Tauri Launch | ❌ 50% success | ✅ 100% success |

---

## 🆘 Still Having Issues?

### Reset Everything

```bash
# 1. Move project to local disk (if not done)
mv ~/OneDrive/.../monad-offline-ai ~/Developer/

# 2. Clean all state
cd ~/Developer/monad-offline-ai
git clean -fdx  # WARNING: Removes all untracked files!

# 3. Rebuild backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Rebuild frontend
cd ../frontend
npm install

# 5. Re-download model (if needed)
cd ../backend
./download_model.sh

# 6. Test
cd ../frontend
npm run tauri dev
```

### Manual Verification

```bash
# Test venv
cd backend
source venv/bin/activate
python --version  # Should NOT error

# Test backend
python main.py &
sleep 10
curl http://localhost:5005/api/health/simple
pkill -f "python.*main.py"

# Test Tauri build
cd ../frontend
npm run build
npm run tauri build  # Should produce .app/.dmg
```

---

## 📚 Related Documentation

- **Build Readiness Report:** `docs/BUILD_READINESS_REPORT.md`
- **Project Structure:** `docs/PROJECT_STRUCTURE.md`
- **Troubleshooting:** `README.md` (see "Common Issues" section)

---

## 🔗 External Resources

- [OneDrive Sync Issues with Dev Tools](https://stackoverflow.com/questions/tagged/onedrive+python)
- [Best Practices for Development Environments](https://12factor.net/dependencies)
- [Python venv in Cloud Sync Folders (Reddit)](https://www.reddit.com/r/Python/search?q=venv+onedrive)

---

**Bottom Line:** MONAD works best on local disk. Move your project out of OneDrive for a reliable experience.

