#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# MONAD Dev Reset Verification Script
# Run this AFTER clicking the reset button to verify the reset worked
# ═══════════════════════════════════════════════════════════════════════

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     MONAD Dev Reset - Post-Reset Verification Script          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

APP_DATA_DIR=~/Library/Application\ Support/ai.monad.offline

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  CHECKING APP DATA DIRECTORY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "$APP_DATA_DIR" ]; then
    echo "✓ App data directory exists: $APP_DATA_DIR"
    echo ""
    echo "Contents:"
    ls -la "$APP_DATA_DIR"
    echo ""
    
    # Check if data directory is empty (or has models only)
    DATA_DIR="$APP_DATA_DIR/data"
    if [ -d "$DATA_DIR" ]; then
        DATA_COUNT=$(find "$DATA_DIR" -type f 2>/dev/null | wc -l)
        if [ "$DATA_COUNT" -eq 0 ]; then
            echo "✅ Data directory is empty (reset successful)"
        else
            echo "⚠️  Data directory contains $DATA_COUNT file(s)"
            echo "   This may indicate incomplete reset"
        fi
    else
        echo "✅ Data directory doesn't exist (reset successful)"
    fi
else
    echo "❌ App data directory not found!"
    echo "   Expected: $APP_DATA_DIR"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  CHECKING BACKEND STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if curl -s http://localhost:5005/api/health/simple > /dev/null 2>&1; then
    echo "✅ Backend is running and responding"
    BACKEND_STATUS=$(curl -s http://localhost:5005/api/health/simple)
    echo "   $BACKEND_STATUS"
else
    echo "⚠️  Backend is not responding on port 5005"
    echo "   This is expected if you closed the Tauri app"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  CHECKING TAURI PROCESS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MONAD_PROCESS=$(ps aux | grep -i "monad" | grep -v grep | grep -v "verify_reset")
if [ -n "$MONAD_PROCESS" ]; then
    echo "✅ MONAD Tauri process is running:"
    echo "$MONAD_PROCESS" | head -3
else
    echo "⚠️  No MONAD Tauri process found"
    echo "   App may have closed after reset"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  VERIFICATION CHECKLIST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please manually verify the following in the MONAD app:"
echo ""
echo "  [ ] Setup wizard appeared after reset"
echo "  [ ] No previous user settings loaded"
echo "  [ ] localStorage is empty (check DevTools)"
echo "  [ ] No saved chats visible"
echo "  [ ] App is back to first-run state"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  VERIFY LOCALSTORAGE (MANUAL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "In the MONAD app DevTools console, run:"
echo ""
echo "  Object.keys(localStorage).filter(k => k.startsWith('monad_'))"
echo ""
echo "Expected result: []  (empty array)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  MODEL FILES STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MODELS_DIR="$APP_DATA_DIR/models"
if [ -d "$MODELS_DIR" ]; then
    MODEL_COUNT=$(find "$MODELS_DIR" -name "*.gguf" 2>/dev/null | wc -l)
    if [ "$MODEL_COUNT" -gt 0 ]; then
        echo "⚠️  Note: $MODEL_COUNT model file(s) were DELETED by reset:"
        find "$MODELS_DIR" -name "*.gguf" -ls 2>/dev/null
        echo ""
        echo "   You may need to re-download Phi-3 Medium (8GB):"
        echo "   cd backend && ./download_model.sh"
    else
        echo "⚠️  No model files found"
        echo "   You will need to download Phi-3 Medium:"
        echo "   cd backend && ./download_model.sh"
    fi
else
    echo "⚠️  Models directory doesn't exist"
    echo "   You will need to download Phi-3 Medium:"
    echo "   cd backend && ./download_model.sh"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all checks pass, the dev reset functionality is working correctly!"
echo ""

