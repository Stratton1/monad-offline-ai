#!/bin/bash
# MONAD Project Cleanup Script
# Removes redundant files and directories to reduce project size

echo "🧹 MONAD Project Cleanup Script"
echo "================================"
echo ""

# Function to safely remove directory
safe_remove() {
    if [ -d "$1" ]; then
        echo "🗑️  Removing: $1"
        rm -rf "$1"
        echo "✅ Removed: $1"
    else
        echo "⚠️  Not found: $1"
    fi
}

# Function to safely remove file
safe_remove_file() {
    if [ -f "$1" ]; then
        echo "🗑️  Removing: $1"
        rm "$1"
        echo "✅ Removed: $1"
    else
        echo "⚠️  Not found: $1"
    fi
}

echo "📁 Starting cleanup process..."
echo ""

# 1. Remove old desktop directory (superseded by frontend/src-tauri)
echo "1️⃣ Removing old desktop directory..."
safe_remove "offline-llm-appliance/desktop"

# 2. Remove build artifacts
echo ""
echo "2️⃣ Removing build artifacts..."
safe_remove "offline-llm-appliance/frontend/dist"
safe_remove "offline-llm-appliance/frontend/src-tauri/target"

# 3. Remove node modules (can be reinstalled)
echo ""
echo "3️⃣ Removing node modules..."
safe_remove "offline-llm-appliance/frontend/node_modules"

# 4. Remove Python cache
echo ""
echo "4️⃣ Removing Python cache..."
safe_remove "offline-llm-appliance/backend/__pycache__"
safe_remove "offline-llm-appliance/backend/routes/__pycache__"

# 5. Remove virtual environment (can be recreated)
echo ""
echo "5️⃣ Removing Python virtual environment..."
safe_remove "offline-llm-appliance/backend/venv"

# 6. Remove temporary files
echo ""
echo "6️⃣ Removing temporary files..."
safe_remove_file "offline-llm-appliance/backend/backend.log"
safe_remove_file "offline-llm-appliance/backend/commit_message.txt"
safe_remove_file "offline-llm-appliance/backend/download_phi3.py"

# 7. Remove duplicate investment document
echo ""
echo "7️⃣ Removing duplicate investment document..."
safe_remove_file "INVESTMENT DOCS/MONAD_Executive_Summary.docx"

echo ""
echo "🎉 Cleanup complete!"
echo ""
echo "📊 Estimated space saved: ~660MB"
echo ""
echo "🔄 To restore dependencies:"
echo "   Frontend: cd offline-llm-appliance/frontend && npm install"
echo "   Backend:  cd offline-llm-appliance/backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
echo ""
echo "✅ Project is now clean and ready for production!"
