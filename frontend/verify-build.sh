#!/bin/bash
# MONAD Build Verification Script
# Version: 1.0.0
# Date: 2025-01-27

set -e

BUILD_DIR="src-tauri/target/release/bundle"
CHECKSUMS_FILE="../../CHECKSUMS.txt"
VERIFICATION_REPORT="../../BUILD_VERIFICATION_REPORT.md"

echo "=== MONAD Build Verification ==="
echo "Version: 1.0.0"
echo "Date: $(date +%Y-%m-%d\ %H:%M:%S)"
echo ""

# Check if build outputs exist
echo "Checking for build outputs..."
echo ""

# macOS (actual filenames from Tauri build)
MACOS_DMG="${BUILD_DIR}/dmg"/MONAD_*.dmg
MACOS_APP="${BUILD_DIR}/macos/MONAD.app"

# Windows (if built)
WINDOWS_MSI="${BUILD_DIR}/msi"/MONAD_*.msi

# Linux (if built)
LINUX_DEB="${BUILD_DIR}/deb"/MONAD_*.deb

# Generate checksums
echo "=== Generating SHA256 Checksums ==="
echo ""

> "${CHECKSUMS_FILE}"
echo "# MONAD v1.0.0 - SHA256 Checksums" >> "${CHECKSUMS_FILE}"
echo "# Generated: $(date +%Y-%m-%d\ %H:%M:%S)" >> "${CHECKSUMS_FILE}"
echo "" >> "${CHECKSUMS_FILE}"

# Find macOS DMG (actual filename pattern)
MACOS_DMG_FILE=$(find "${BUILD_DIR}/dmg" -name "MONAD_*.dmg" -type f 2>/dev/null | head -1)
if [ -n "${MACOS_DMG_FILE}" ] && [ -f "${MACOS_DMG_FILE}" ]; then
    CHECKSUM=$(shasum -a 256 "${MACOS_DMG_FILE}" | cut -d' ' -f1)
    SIZE=$(du -h "${MACOS_DMG_FILE}" | cut -f1)
    echo "✅ macOS DMG: ${MACOS_DMG_FILE}"
    echo "   Size: ${SIZE}"
    echo "   SHA256: ${CHECKSUM}"
    echo "macOS DMG: ${CHECKSUM}  $(basename ${MACOS_DMG_FILE})" >> "${CHECKSUMS_FILE}"
    echo ""
fi

if [ -d "${MACOS_APP}" ]; then
    CHECKSUM=$(find "${MACOS_APP}" -type f -exec shasum -a 256 {} \; | shasum -a 256 | cut -d' ' -f1)
    SIZE=$(du -sh "${MACOS_APP}" | cut -f1)
    echo "✅ macOS App: ${MACOS_APP}"
    echo "   Size: ${SIZE}"
    echo "   SHA256: ${CHECKSUM}"
    echo "macOS App: ${CHECKSUM}  $(basename ${MACOS_APP})" >> "${CHECKSUMS_FILE}"
    echo ""
fi

# Find Windows MSI (if built)
WINDOWS_MSI_FILE=$(find "${BUILD_DIR}/msi" -name "MONAD_*.msi" -type f 2>/dev/null | head -1)
if [ -n "${WINDOWS_MSI_FILE}" ] && [ -f "${WINDOWS_MSI_FILE}" ]; then
    CHECKSUM=$(shasum -a 256 "${WINDOWS_MSI_FILE}" | cut -d' ' -f1)
    SIZE=$(du -h "${WINDOWS_MSI_FILE}" | cut -f1)
    echo "✅ Windows MSI: ${WINDOWS_MSI_FILE}"
    echo "   Size: ${SIZE}"
    echo "   SHA256: ${CHECKSUM}"
    echo "Windows MSI: ${CHECKSUM}  $(basename ${WINDOWS_MSI_FILE})" >> "${CHECKSUMS_FILE}"
    echo ""
fi

# Find Linux DEB (if built)
LINUX_DEB_FILE=$(find "${BUILD_DIR}/deb" -name "MONAD_*.deb" -type f 2>/dev/null | head -1)
if [ -n "${LINUX_DEB_FILE}" ] && [ -f "${LINUX_DEB_FILE}" ]; then
    CHECKSUM=$(shasum -a 256 "${LINUX_DEB_FILE}" | cut -d' ' -f1)
    SIZE=$(du -h "${LINUX_DEB_FILE}" | cut -f1)
    echo "✅ Linux DEB: ${LINUX_DEB_FILE}"
    echo "   Size: ${SIZE}"
    echo "   SHA256: ${CHECKSUM}"
    echo "Linux DEB: ${CHECKSUM}  $(basename ${LINUX_DEB_FILE})" >> "${CHECKSUMS_FILE}"
    echo ""
fi

# File verification
echo "=== File Verification ==="
echo ""

if [ -n "${MACOS_DMG_FILE}" ] && [ -f "${MACOS_DMG_FILE}" ]; then
    echo "macOS DMG:"
    file "${MACOS_DMG_FILE}"
    echo ""
fi

if [ -d "${MACOS_APP}" ]; then
    echo "macOS App:"
    file "${MACOS_APP}"
    echo ""
fi

if [ -n "${WINDOWS_MSI_FILE}" ] && [ -f "${WINDOWS_MSI_FILE}" ]; then
    echo "Windows MSI:"
    file "${WINDOWS_MSI_FILE}"
    echo ""
fi

if [ -n "${LINUX_DEB_FILE}" ] && [ -f "${LINUX_DEB_FILE}" ]; then
    echo "Linux DEB:"
    file "${LINUX_DEB_FILE}"
    echo ""
fi

# Code signing verification (macOS)
echo "=== Code Signing Verification (macOS) ==="
echo ""

if [ -d "${MACOS_APP}" ]; then
    if codesign -dv "${MACOS_APP}" 2>&1 | grep -q "valid on disk"; then
        echo "✅ macOS App is signed"
        codesign -dv "${MACOS_APP}" 2>&1 | grep -E "(Authority|Identifier|TeamIdentifier)"
    else
        echo "⚠️  macOS App is not signed"
    fi
    echo ""
fi

# Summary
echo "=== Build Verification Summary ==="
echo ""

BUILD_COUNT=0
if [ -n "${MACOS_DMG_FILE}" ] && [ -f "${MACOS_DMG_FILE}" ]; then ((BUILD_COUNT++)); fi
if [ -d "${MACOS_APP}" ]; then ((BUILD_COUNT++)); fi
if [ -n "${WINDOWS_MSI_FILE}" ] && [ -f "${WINDOWS_MSI_FILE}" ]; then ((BUILD_COUNT++)); fi
if [ -n "${LINUX_DEB_FILE}" ] && [ -f "${LINUX_DEB_FILE}" ]; then ((BUILD_COUNT++)); fi

echo "Builds found: ${BUILD_COUNT} (macOS DMG/App, Windows MSI, Linux DEB)"
echo "Checksums saved to: ${CHECKSUMS_FILE}"
echo ""

if [ ${BUILD_COUNT} -eq 3 ]; then
    echo "✅ All platform builds completed successfully"
elif [ ${BUILD_COUNT} -gt 0 ]; then
    echo "⚠️  Partial build: ${BUILD_COUNT}/3 platforms"
else
    echo "❌ No builds found. Run 'npm run tauri:build' first."
fi

