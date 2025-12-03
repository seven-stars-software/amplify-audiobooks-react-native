#!/bin/bash
# Sync critical gitignored files from main repo to worktree
# Only runs if current directory is a worktree

set -e

# Get the directory where this script lives, then go to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root to ensure all relative paths work
cd "$PROJECT_ROOT"

# Check if this is actually a worktree by checking git rev-parse
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "✗ Not in a git repository"
  exit 1
fi

# Get the main worktree path (first entry in git worktree list)
MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')

# If we're in the main repo, no sync needed
if [ "$PROJECT_ROOT" = "$MAIN_REPO" ]; then
  echo "✓ In main repo - no sync needed"
  exit 0
fi

echo "📦 Syncing gitignored files from main repo to worktree..."

# Create directories if they don't exist
mkdir -p .claude
mkdir -p android/app

# Sync critical files (only if they exist in main repo)
SYNCED=0

# .env.development
if [ -f "$MAIN_REPO/.env.development" ]; then
  cp "$MAIN_REPO/.env.development" ./.env.development
  echo "  ✓ Synced .env.development"
  SYNCED=$((SYNCED + 1))
fi

# .claude/settings.local.json (merge with existing permissions)
if [ -f "$MAIN_REPO/.claude/settings.local.json" ]; then
  # Only copy if it doesn't exist yet (preserve worktree-specific settings)
  if [ ! -f "./.claude/settings.local.json" ]; then
    cp "$MAIN_REPO/.claude/settings.local.json" ./.claude/settings.local.json
    echo "  ✓ Synced .claude/settings.local.json"
    SYNCED=$((SYNCED + 1))
  else
    echo "  ⊘ Skipped .claude/settings.local.json (already exists)"
  fi
fi

# Android keystore properties
if [ -f "$MAIN_REPO/android/keystore.properties" ]; then
  mkdir -p android
  cp "$MAIN_REPO/android/keystore.properties" ./android/keystore.properties
  echo "  ✓ Synced android/keystore.properties"
  SYNCED=$((SYNCED + 1))
fi

# Android release keystore
if [ -f "$MAIN_REPO/android/app/amplify-audiobooks-release.jks" ]; then
  mkdir -p android/app
  cp "$MAIN_REPO/android/app/amplify-audiobooks-release.jks" ./android/app/amplify-audiobooks-release.jks
  echo "  ✓ Synced android/app/amplify-audiobooks-release.jks"
  SYNCED=$((SYNCED + 1))
fi

# Upload certificate (needed for releases)
if [ -f "$MAIN_REPO/android/app/upload_certificate.pem" ]; then
  mkdir -p android/app
  cp "$MAIN_REPO/android/app/upload_certificate.pem" ./android/app/upload_certificate.pem
  echo "  ✓ Synced android/app/upload_certificate.pem"
  SYNCED=$((SYNCED + 1))
fi

echo "✅ Sync complete! Synced $SYNCED file(s)"
