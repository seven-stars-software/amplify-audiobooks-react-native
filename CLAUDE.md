# AmplifyAudiobooks — React Native App

**Current Version:** 2.2.0
**Repository:** seven-stars-software/amplify-audiobooks-react-native
**Project Root:** `/Users/verinaut/Projects/amplify/amplify-react-native/AmplifyAudiobooks`

For project-wide rules (working directory, gh CLI workaround, security, conventions), see the parent `../../CLAUDE.md`.

## Active Work

### Blockers
- **iOS Release Testing:** v2.2.0 in TestFlight, awaiting beta feedback from PAV team

### In Review
- **PR #12 - Fastlane Automation (Issue #10):** Release automation for iOS and Android
  - Branch: `feature/fastlane-automation`
  - Deployment to stores not yet tested (planned for next patch version)

### Ready to Merge
- **Branch `refactor/atomic-design-compliance`:** Atomic Design refactoring (10 components reorganized, 21 files updated, tests passing)

### Technical Debt
- **BookStore.tsx (373 lines):** Split into useBookData, useDownloadManager, useNetworkAwareness hooks
- **Error handling inconsistency:** ErrorContext blocks app, PlaybackContext navigates, APIClient throws — need unified strategy
- **useEffect cleanup (Issue #8):** Missing cleanup in several components
- **Type safety:** Several `any` types need proper typing
- Follow-up issues: #15 (AuthContext null check), #16 (AuthContext error handling), #17 (PlaybackContext memory leak), #18 (ErrorContext recovery)

## Git Worktrees

A SessionStart hook (`.claude/sync-worktree-files.sh`) auto-syncs gitignored files from main repo to worktrees: `.env.development`, `android/keystore.properties`, keystore, and upload certificate. Run manually if needed.

## Detailed Reference

- **`.claude/PROJECT_CONTEXT.md`** — Architecture deep-dive, context provider nesting, release process, Android signing history
- **`docs/ATOMIC_DESIGN.md`** — Component organization guidelines
- **`docs/development.md`** — Setup and development guide
