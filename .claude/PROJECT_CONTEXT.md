# AmplifyAudiobooks Project Context

**Last Updated:** 2025-12-02
**Current Version:** 2.2.0

**NOTE:** The primary startup file for Claude Code is `CLAUDE.md` at the project root. This file contains detailed reference information that supplements the critical rules and active work in CLAUDE.md.

**What's in CLAUDE.md (read on startup):**
- Critical rules (working directory, GitHub CLI workarounds)
- Active work and unclosed loops
- Quick project overview and conventions
- Team & security notes

**What's in this file (reference material):**
- Detailed architecture
- Full release process
- Android signing crisis history
- Complete component organization

---

## 🏗️ Architecture

### High-Level Pattern
Multi-context architecture using React Context API + custom hooks. No Redux/MobX.

### Context Providers (Nested Order)
```
ErrorContextProvider          ← Top-level error boundary
  ↓
AuthContextProvider           ← Authentication seal (AsyncStorage)
  ↓
SafeAreaProvider             ← React Native Safe Area
  ↓
LayoutContextProvider        ← UI layout state (banner height)
  ↓
BookStoreProvider            ← Main data store (books, downloads)
  ↓
UserContextProvider          ← User profile data (in-memory only)
  ↓
PlaybackContextProvider      ← Audio playback control
  ↓
PaperProvider                ← Material Design theme
  ↓
RootNavigator                ← Navigation root
```

### Key Contexts

**AuthContext** (15 lines)
- Manages authentication seal
- Persisted to AsyncStorage
- Type: `[AuthSeal | null, setAuthSeal, deleteAuthSeal]`

**BookStoreProvider** (373 lines) ⚠️ NEEDS REFACTORING
- Central data store for all books
- Handles API fetching, local caching, downloads
- Network-aware loading (ONLINE → API, OFFLINE → storage, UNKNOWN → optimistic)
- Race condition prevention with `useRef` guard
- Download status tracking per track
- File system management for offline audio

**PlaybackContext** (160 lines)
- Wraps react-native-track-player
- Manages playback queue (single book at a time)
- Checkpoint/resume functionality
- Offline file fallback
- Error propagation

**ErrorContext** (82 lines)
- Renders full-screen error UI
- Handles playback errors separately (navigates to PlaybackProblemScreen)
- Currently blocks app for non-playback errors (consider improvement)

### Component Organization (Atomic Design)

**Current Structure:**
```
src/components/
├── atoms/          # 8 components - Pure UI primitives
├── molecules/      # 8 components - Simple compositions
└── organisms/      # 7 components - Complex features (JUST ADDED on refactor branch)
```

**Key Components:**
- Organisms: PlayBookButton, DownloadButton, LoginForm, RegisterForm, NowPlayingCard, CoreTabBar, TopBanner
- Molecules: BookList, BooksSideScroll, TrackItem, MainScreenContainer
- Atoms: BookCard, RemoveDownloadsDialog, SplashLogo, etc.

See `docs/ATOMIC_DESIGN.md` for complete guidelines.

### Key Features
- **Network-aware loading:** ONLINE → API, OFFLINE → storage, UNKNOWN → optimistic with fallback
- **Offline playback:** Local file URIs when tracks downloaded, remote URIs otherwise
- **Download management:** Per-track status tracking, file system storage
- **Playback resumption:** Checkpoint positions saved to AsyncStorage

### Network Status
- `useNetworkStatus()` hook returns `NetworkStatus` enum (ONLINE, OFFLINE, UNKNOWN)
- Dev settings override: `simulateOffline` flag for testing
- BookStore auto-refetches when network becomes available

---


## 📋 Version History & Release Process

### v2.2.0 (Current - December 2025)

**Features:**
- Fixed offline playback and download functionality
- Clear feedback when attempting to play/download while offline
- Real-time download progress indicators
- Improved error handling for playback issues
- Network connectivity detection with offline simulation mode

**Known Issues:**
- No download progress percentage (just downloading/downloaded binary state)
- No download cancellation
- Per-track download UI misleading (can only download whole books)
- See Issue #9 for future improvements

### v2.1.0 (Feb 27, 2024)

**Breaking Changes:**
- Android: Minimum API 24 (Android 7.0+)
- iOS: Minimum iOS 15.1+

**Changes:**
- Upgraded to React Native 0.77 for Android 16KB page size support
- Fixed Android safe area handling
- Fixed login form error handling

### Release Process (Manual - to be automated)

**Current Process:**
1. Bump version in: package.json, android/build.gradle, iOS Xcode project, app.json
2. Update CHANGELOG.md
3. Commit and tag `vX.Y.Z`
4. Build iOS in Xcode → Archive → Upload to App Store Connect
5. Build Android: `cd android && ./gradlew bundleRelease`
6. Upload AAB to Google Play Console
7. Submit both for review

**Future (Issue #10):**
- Automate with Fastlane
- Single command release process
- See `docs/` for planning

---

## 🔐 Android Signing (CRITICAL CONTEXT)

### The Keystore Crisis (March 2024)
- **What happened:** Original keystore lost during app rebuild in March 2024
- **Impact:** Cannot update app without original keystore or Google approval
- **Root cause:** Didn't back up keystore before rebuilding project
- **Last successful upload:** Feb 27, 2024 (v1.5)

### Current Keystore Setup
- **File:** `android/app/amplify-audiobooks-release.jks`
- **Certificate:** `android/app/upload_certificate.pem` (submitted to Google by Becky)
- **Config:** `android/keystore.properties` (gitignored, credentials stored locally)
- **Status:** Waiting for Google Play upload key reset approval

**Google Play App Signing Status:**
- ✅ Enabled (good news - we can recover)
- App signing key: Managed by Google (SHA-1: `4D:D6:BF:8F:CF:21:A8:87:2D:11:3F:CF:F3:D9:26:0D:CB:25:CA:66`)
- Upload key: Needs reset (old SHA-1: `D0:9B:67:DE:2D:BB:07:82:00:10:88:7D:B6:A1:0F:A2:01:9C:D1:1A`)
- New upload key: `amplify-audiobooks-release.jks` (awaiting approval)

### Lesson Learned
**ALWAYS BACK UP KEYSTORES:**
- Store in 1Password
- Store in secure cloud storage
- Store on external drive
- Losing keystore = cannot update app without Google intervention

---

## 🎫 GitHub Issues

### Open Issues
- **#8:** useEffect cleanup pattern needed across codebase
- **#9:** Download management improvements (progress, cancellation, book-level UI)
- **#10:** Automate release cycle with Fastlane (PR #12 in review)

### Prioritized Technical Debt

**High Priority:**
- BookStore decomposition (373 lines, needs split into smaller hooks)
- Error handling standardization (inconsistent patterns across contexts)
- Type safety (eliminate `any` types in PlaybackContext, UserContext)

**Medium Priority:**
- Request deduplication for API calls
- App resume handling (refresh data when returning from background)
- Download progress persistence
- Retry mechanisms for failed operations

**Low Priority:**
- UserContext persistence to AsyncStorage
- Component memoization with React.memo
- Simplify useCallbackState hook

---

## 📚 Important Files & Directories

### Configuration
- `package.json` - Dependencies, version, scripts
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration
- `babel.config.js` - Babel with module resolver for absolute imports

### Core Source
- `src/App.tsx` - Root component with nested providers
- `src/APIClient.ts` - API wrapper for backend calls
- `src/URLs.ts` - Environment-aware URL configuration

### Key Contexts
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/stores/BookStore.tsx` - Main data store (373 lines ⚠️)
- `src/contexts/PlaybackContext.tsx` - Audio playback control

### Documentation
- `CHANGELOG.md` - Version history and release notes
- `docs/ATOMIC_DESIGN.md` - Component organization guidelines
- `docs/claude-guide.md` - Claude Code specific notes (GitHub CLI workarounds)
- `docs/development.md` - Setup and development guide

### Build & Deploy
- `android/app/build.gradle` - Android version and signing config
- `android/keystore.properties` - Android signing credentials (gitignored)
- `android/app/amplify-audiobooks-release.jks` - Release keystore (gitignored)
- `ios/AmplifyAudiobooks.xcworkspace` - iOS build workspace

