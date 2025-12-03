# AmplifyAudiobooks - Claude Code Configuration

**Current Version:** 2.2.0
**Repository:** seven-stars-software/amplify-audiobooks-react-native
**Project Root:** `/Users/verinaut/Projects/amplify/amplify-react-native/AmplifyAudiobooks`

---

## 🚨 CRITICAL RULES - READ FIRST

These rules prevent common mistakes that waste time.

### Working Directory Management

**CRITICAL:** After running `cd`, your shell session stays in that directory. This causes subsequent commands to fail in confusing ways.

**Rules (in order of preference):**

1. **ALWAYS prefer absolute paths**
   - Most tools accept absolute paths and don't require directory changes
   - Example: `pytest /path/to/project/tests` NOT `cd tests && pytest .`

2. **Use subshells when a command MUST run from a specific directory**
   - Syntax: `(cd directory && command)`
   - The parentheses `()` create a subshell that automatically returns to the original directory
   - Example: `(cd ios && pod install)` NOT `cd ios && pod install`

3. **NEVER use standalone `cd` unless you have a specific reason**
   - If you do use `cd`, immediately chain the return: `cd dir && command && cd ..`
   - Better: use a subshell instead

**Quick Reference:**
```bash
# ✅ CORRECT - absolute path
pytest /Users/verinaut/Projects/amplify/amplify-react-native/AmplifyAudiobooks/tests

# ✅ CORRECT - subshell for commands requiring specific directory
(cd ios && pod install)

# ❌ WRONG - shell stays in ios/ after this
cd ios && pod install
```

### Git Worktrees & Gitignored Files

**AUTOMATIC SYNC CONFIGURED:** A SessionStart hook automatically syncs critical gitignored files from the main repo to worktrees.

**What gets synced:**
- `.env.development` (API URLs, Fastlane config)
- `android/keystore.properties` (signing credentials)
- `android/app/amplify-audiobooks-release.jks` (release keystore)
- `android/app/upload_certificate.pem` (upload certificate)

**How it works:**
- `.claude/sync-worktree-files.sh` runs on every Claude Code session start via SessionStart hook
- Only runs when in a worktree (detects via `git worktree list`)
- Skips if in main repo (no sync needed)
- Creates necessary directories automatically
- Script determines its own location and changes to project root (SessionStart hooks don't guarantee working directory)

**Manual sync:** Run `./.claude/sync-worktree-files.sh` anytime to re-sync files.

**Important notes about SessionStart hooks:**
- Hook output is added as context for Claude, NOT displayed to user
- Hooks run before session starts, but working directory is not guaranteed
- Scripts should use `BASH_SOURCE` to find their location and cd to project root
- Exit code 0 = success (output becomes available context)
- Non-zero exit codes only appear in verbose mode

**Note:** `.claude/settings.local.json` is NOT synced (worktree-specific permissions may differ). The committed `.claude/settings.json` provides PATH configuration for all sessions.

### GitHub CLI (`gh`) Bug - Projects (classic) Deprecation

**CRITICAL BUG:** Many `gh` commands fail with exit code 1 due to a known bug in the GitHub CLI.

Commands like `gh pr edit`, `gh pr view`, and `gh issue view` fail because the CLI queries deprecated `projectCards` fields.

**Workarounds:**

```bash
# ❌ BROKEN - will fail with exit code 1
gh pr edit 7 --add-label "enhancement"

# ✅ WORKS - use GitHub API directly
gh api repos/seven-stars-software/amplify-audiobooks-react-native/issues/7/labels \
  --method POST \
  --input - <<< '{"labels":["enhancement","offline-mode"]}'

# ✅ WORKS - specify only needed fields
gh pr view 7 --json number,title,state,body,labels,author,createdAt
```

---

## 🚨 ACTIVE WORK & UNCLOSED LOOPS

### Active Blockers
- **iOS Release Testing:** Waiting for TestFlight beta tester feedback from Pro Audio Voices team
  - Build already distributed to App Store Connect
  - Version 2.2.0 live in TestFlight

### In Review
- **PR #12 - Fastlane Automation (Issue #10):** Complete release automation for iOS and Android
  - Branch: `feature/fastlane-automation`
  - URL: https://github.com/seven-stars-software/amplify-audiobooks-react-native/pull/12
  - ✅ Fastlane installed and configured
  - ✅ Google Play service account created (`fastlane-release@amplifyaudiobooks-api.iam.gserviceaccount.com`)
  - ✅ App Store Connect API Key configured (Key ID: 6ZN29XPT4Z)
  - ✅ Bundle identifier consistency fixed (`com.sevenstar.amplify`)
  - ✅ Version bumping tested across all platforms
  - ✅ Android AAB build tested (41MB output)
  - ✅ iOS IPA build tested (21MB output)
  - ⏳ **Not yet tested:** Deployment to Play Console/App Store Connect (planned for next patch version)
  - Critical fix: Android signing now uses `keystore.properties` instead of failing ENV variables

### Ready to Merge
- **Branch `refactor/atomic-design-compliance`:** Complete Atomic Design refactoring
  - 10 components reorganized (atoms → molecules → organisms)
  - 21 files updated with corrected imports
  - Comprehensive `docs/ATOMIC_DESIGN.md` documentation added
  - All tests passing, ready for PR when convenient

### Known Technical Debt
- **BookStore.tsx (373 lines):** Too complex, needs decomposition
  - Should split into: useBookData, useDownloadManager, useNetworkAwareness hooks
- **Error Handling Inconsistency:** Multiple patterns across codebase
  - ErrorContext blocks entire app
  - PlaybackContext navigates to error screen
  - APIClient just throws
  - Need unified strategy
- **useEffect Cleanup Pattern (Issue #8):** Missing cleanup in several components
- **Type Safety Gaps:** Several `any` types need proper typing

---

## 📱 Quick Project Overview

### What It Is
React Native audiobook application for AMPlify Audiobooks (Pro Audio Voices). Provides book discovery, library management, offline downloads, and audio playback with resume functionality.

### Tech Stack
- **Framework:** React Native 0.77.3, Expo 52.0.27
- **Language:** TypeScript 5.6.3
- **Navigation:** React Navigation 6.x (stack + bottom tabs)
- **UI:** React Native Paper 5.14.5 (Material Design 3)
- **Audio:** react-native-track-player 4.1.2
- **Storage:** AsyncStorage, expo-file-system 18.0.12
- **Platforms:** iOS 15.1+, Android API 24+ (7.0)

### Code Conventions
- **Always use enums, never string literals** for status values
  - ✅ `DownloadStatus.DOWNLOADED`
  - ❌ `'downloaded'`
- **Atomic Design methodology** for component organization
- **Custom hooks** for complex logic extraction
- **Context over prop drilling** for cross-cutting concerns
- **Avoid over-engineering:** Only add what's needed, no premature abstraction

### Git Workflow
- **Main branch:** `main` (protected)
- **Feature branches:** `feature/` prefix
- **Refactor branches:** `refactor/` prefix
- **Commits:** Always include Claude Code footer:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

---

## 📚 Detailed Documentation

For comprehensive project information, see:

- **`.claude/PROJECT_CONTEXT.md`** - Full project context with architecture, team info, release process, Android signing details
- **`docs/work_journals/jcksncllwy/`** - Session-by-session work history
- **`docs/ATOMIC_DESIGN.md`** - Component organization guidelines
- **`docs/development.md`** - Setup and development guide
- **`CHANGELOG.md`** - Version history and release notes

---

## 🎯 Next Steps

### Immediate Priorities
1. **Review PR #12 (Fastlane Automation)**
   - Test deployment to app stores with next patch version

2. **Check for iOS TestFlight feedback**
   - iOS 2.2.0 currently in TestFlight
   - Address any critical issues before production

### Future Enhancements
- Merge `refactor/atomic-design-compliance` branch (ready when convenient)
- Review issue #9 for download management improvements
- Consider BookStore refactoring (break into smaller hooks)

---

## 👥 Client & Team

### Client Company: Pro Audio Voices

**Key Contacts:**
- **Becky Geist** - Owner, Google Play Console account owner
  - Non-technical, needs step-by-step instructions
  - Comfortable sharing credentials with developer
- **Emily Busbee** - Project Manager, main contact
- **Jerrilee Geist** - Android tester (cannot test iOS)
- **Marcus Mulenga** - Customer Support, field feedback

**Developer Relationship:**
- Friends with owner, close working relationship
- Communication primarily via WhatsApp
- Years of collaboration, trusted partnership

---

## 🔐 Security Notes

### Never Commit
- `.env` files
- Keystores (`.jks`, `.keystore`)
- Certificates (`.pem`)
- API keys (JSON files like `google-play-key.json`, `AuthKey_*.p8`)

### Credential Sharing
- **Preferred method:** 1Password shared vault
- **Alternative:** OneTimeSecret.com for one-off sharing
- **Never use:** Plain email, SMS, Slack DMs

### Android Signing (CRITICAL)
- **Keystore lost in March 2024** - Cannot update app without Google approval
- **Always back up keystores** in 1Password, cloud storage, and external drive
- Google Play App Signing enabled (can recover from lost keystores)
- Current keystore: `android/app/amplify-audiobooks-release.jks`
