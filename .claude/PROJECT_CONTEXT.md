# AmplifyAudiobooks Project Context

**Last Updated:** 2025-11-25
**Current Version:** 2.2.0 (in release process)

---

## 🚨 UNCLOSED LOOPS & IN-PROGRESS WORK

### Active Blockers
- **Android Release (HIGH PRIORITY):** Waiting for Google Play Console to approve upload key reset request
  - Timeline: 2-48 hours from 2025-11-25 afternoon
  - Once approved: Build AAB with `./gradlew bundleRelease` and upload to Play Console
  - Keystore: `android/app/amplify-audiobooks-release.jks`
  - Certificate: `android/app/upload_certificate.pem` (submitted to Google by Becky)

- **iOS Release Testing:** Waiting for TestFlight beta tester feedback from Pro Audio Voices team
  - Build already distributed to App Store Connect
  - Version 2.2.0 live in TestFlight
  - Jerrilee Geist testing

### Ready to Merge
- **Branch `refactor/atomic-design-compliance`:** Complete Atomic Design refactoring
  - 10 components reorganized (atoms → molecules → organisms)
  - 21 files updated with corrected imports
  - Comprehensive `docs/ATOMIC_DESIGN.md` documentation added
  - All tests passing, ready for PR when convenient

### Known Technical Debt
- **BookStore.tsx (373 lines):** Too complex, needs decomposition
  - Should split into: useBookData, useDownloadManager, useNetworkAwareness hooks
  - Tracked in architectural review

- **Error Handling Inconsistency:** Multiple patterns across codebase
  - ErrorContext blocks entire app
  - PlaybackContext navigates to error screen
  - APIClient just throws
  - Need unified strategy

- **useEffect Cleanup Pattern (Issue #8):** Missing cleanup in several components
  - Need systematic review and fixes

- **Type Safety Gaps:** Several `any` types need proper typing
  - PlaybackContext.playBook() returns `any`
  - UserContext.wpUser is `any`

---

## 📱 Project Overview

### What It Is
React Native audiobook application for AMPlify Audiobooks (Pro Audio Voices). Provides book discovery, library management, offline downloads, and audio playback with resume functionality.

### Tech Stack
- **Framework:** React Native 0.77.3, Expo 52.0.27
- **Language:** TypeScript 5.6.3
- **Navigation:** React Navigation 6.x (stack + bottom tabs)
- **UI:** React Native Paper 5.14.5 (Material Design 3)
- **Audio:** react-native-track-player 4.1.2
- **Storage:** AsyncStorage, expo-file-system 18.0.12
- **Network:** @react-native-community/netinfo 11.4.1
- **Platforms:** iOS 15.1+, Android API 24+ (7.0)

### Repository
- **Location:** `~/Projects/amplify/amplify-react-native/AmplifyAudiobooks`
- **Main Branch:** `main`
- **Remote:** github.com:seven-stars-software/amplify-audiobooks-react-native

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

### Data Flow

**Book Loading:**
```
APIClient.getHomeBooks()
  ↓
BookStore.loadFromAPI()
  ↓
prepBooks() (merge library + featured + newReleases + onSale)
  ↓
augmentBookWithDownloadStatuses() (check file system)
  ↓
AsyncStorage.setItem() (cache locally)
  ↓
State update
  ↓
Components re-render via useBookStore()
```

**Audio Playback:**
```
PlayBookButton.onPress()
  ↓
PlaybackContext.playBook(book, tracks)
  ↓
playerTrackFromTrack() (check if downloaded, use local or remote URI)
  ↓
TrackPlayer.reset() + add() + play()
  ↓
useTrackPlayerEvents (progress tracking)
  ↓
setCheckpoint() (save position to AsyncStorage)
```

**Downloads:**
```
DownloadButton.onPress()
  ↓
BookStore.downloadAudioFiles(isbn)
  ↓
FileSystem.makeDirectoryAsync() (ensure dirs exist)
  ↓
Promise.all(tracks.map(FileSystem.downloadAsync))
  ↓
setTrackDownloadStatus(DOWNLOADING → DOWNLOADED/FAILED)
  ↓
saveToStorage() (persist status)
```

### Network Awareness
- `useNetworkStatus()` hook returns `NetworkStatus` enum
- Three states: ONLINE, OFFLINE, UNKNOWN
- Dev settings override available (`simulateOffline` flag)
- BookStore reacts to network changes (auto-refetch when coming online)
- Offline modals shown when attempting play/download without network

---

## 🎯 Key Decisions & Conventions

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

### File Organization
- Use absolute imports via Babel module resolver: `components/atoms/Button`
- Never commit: `.env`, keystores (`.jks`, `.keystore`), certificates (`.pem`)
- Keep sensitive credentials in `keystore.properties` (gitignored)

### Communication Style
- **No emojis** unless user explicitly requests
- **Concise responses** for CLI display
- **Professional tone** with objective technical accuracy
- **No excessive praise** - focus on facts and problem-solving

---

## 👥 Client & Team

### Client Company: Pro Audio Voices

**Company Owner:**
- **Becky Geist** - Google Play Console account owner, decision maker
  - Non-technical, needs step-by-step instructions
  - Comfortable sharing credentials with developer

**Project Team:**
- **Emily Busbee** - Project Manager, main contact
  - Coordinates releases and feature requests

- **Jerrilee Geist** - Main app tester
  - TestFlight beta tester
  - Tests new releases before production

- **Marcus Mulenga** - Customer Support
  - Provides field feedback from customers
  - Reports bugs and UX issues from real-world usage

**Developer Relationship:**
- Friends with owner, close working relationship
- Communication primarily via WhatsApp
- Years of collaboration, trusted partnership

### Credential Sharing
- Client comfortable sharing credentials (Google Play, AWS, WordPress)
- **Preferred method:** 1Password shared vault (both use 1Password)
- **Alternative:** OneTimeSecret.com for one-off sharing
- **Never use:** Plain email, SMS, Slack DMs

### Permissions
- **Google Play Console:** Developer account has most permissions
- **Account owner actions required for:** Upload key resets, account-level settings
  - Becky (owner) must initiate these requests

---

## 📋 Version History & Release Process

### Current Release: v2.2.0 (In Progress)

**Status:**
- ✅ Code complete & merged (PR #7)
- ✅ Tagged `v2.2.0` on main branch
- ✅ iOS build uploaded to App Store Connect & TestFlight
- ⏳ Android blocked on Google Play upload key reset approval
- 📝 CHANGELOG.md updated

**Features (v2.2.0):**
- Fixed offline playback and download functionality
- Clear feedback when attempting to play/download while offline
- Real-time download progress indicators
- Improved error handling for playback issues
- Network connectivity detection with offline simulation mode

**Known Issues This Release:**
- No download progress percentage (just downloading/downloaded binary state)
- No download cancellation
- Per-track download UI misleading (can only download whole books)
- See Issue #9 for future improvements

### Previous Release: v2.1.0 (Feb 27, 2024)

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

## 🐛 Known Issues

### High Priority
1. **BookStore Complexity (373 lines)**
   - Doing too much: API calls, file system, downloads, state management
   - Needs decomposition into smaller hooks/services
   - See comprehensive architecture review for details

2. **Error Handling Inconsistency**
   - ErrorContext: Blocks entire app with error screen
   - PlaybackContext: Navigates to PlaybackProblemScreen
   - APIClient: Just throws errors
   - No unified error strategy
   - Proposed: Error boundaries by type (API, PLAYBACK, APP)

3. **Type Safety Gaps**
   - `PlaybackContext.playBook()` returns `any`
   - `UserContext.wpUser` is `{ [key: string]: any }`
   - Need proper return types and interfaces

### Medium Priority
4. **useEffect Cleanup Pattern (Issue #8)**
   - Many components don't clean up subscriptions
   - Could cause memory leaks
   - Need systematic review

5. **Request Deduplication**
   - Multiple components can trigger same API call simultaneously
   - No caching or request deduplication
   - Could improve with request map

6. **No App Resume Handling**
   - Data doesn't refresh when app returns from background
   - Should listen to AppState and reload

7. **Download Progress Not Persisted**
   - If app crashes during download, progress lost
   - Should track partial downloads in storage

8. **No Retry Mechanism**
   - Failed operations (downloads, API calls) don't auto-retry
   - User must manually retry

### Low Priority
9. **UserContext Not Persisted**
   - User profile data only in memory
   - Lost on app restart
   - Should persist to AsyncStorage like AuthContext

10. **Component Memoization**
    - Few components use React.memo
    - Could improve performance for expensive renders

11. **useCallbackState Hook Complexity**
    - Custom hook mimics class componentDidUpdate
    - Could simplify with standard useEffect patterns

---

## 🎫 Open Issues & Tasks

### GitHub Issues
- **#8:** useEffect cleanup pattern needed across codebase (medium priority, tech-debt)
- **#9:** Download management improvements (progress indication, cancellation, book-level UI) (enhancement, ux)
- **#10:** Automate release cycle with Fastlane (enhancement)

### Untracked Technical Debt
- BookStore decomposition (see architecture review)
- Error handling standardization
- Type safety improvements (eliminate `any` types)
- Request deduplication
- Component memoization

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

---

## 🔄 Recent Session History

### 2025-11-25: v2.2.0 Release Day & Atomic Design Refactoring

**Morning: PR Review & Merge**
- Reviewed and addressed PR #7 issues
- Fixed PlaybackProblemScreen null check (issue #7)
- Confirmed download FAILED status persistence (issue #6 was false alarm)
- Merged PR #7 to main

**Midday: Release Prep**
- Tagged v2.2.0
- Updated version numbers in all build files
- Bumped app.json to 2.2.0

**Afternoon: Platform Releases**
- iOS: Built, archived, uploaded to App Store Connect ✅
- iOS: Distributed to TestFlight for beta testing (Jerrilee testing) ✅
- Android: Hit keystore crisis 🚨
  - Original keystore lost in March 2024 rebuild
  - Discovered Google Play App Signing enabled (good!)
  - Generated new keystore: `amplify-audiobooks-release.jks`
  - Extracted certificate: `upload_certificate.pem`
  - Becky (account owner) submitted upload key reset request to Google Play
  - Status: Waiting 2-48 hours for approval ⏳

**Evening: Architecture Work**
- Comprehensive architecture review
- Discovered Atomic Design compliance issues (~40% misclassified components)
- Created `refactor/atomic-design-compliance` branch
- Reorganized 10 components (atoms → molecules → organisms)
- Created `src/components/organisms/` directory
- Updated 21 files with corrected imports
- Wrote comprehensive `docs/ATOMIC_DESIGN.md` documentation
- Branch ready to merge when convenient

**Infrastructure**
- Configured Android signing with keystore.properties
- Added `*.jks`, `*.pem` to .gitignore
- Updated release process documentation
- Created issue #10 for Fastlane automation
- Created `.claude/PROJECT_CONTEXT.md` for session continuity

### Key Learnings from This Session
1. **Always back up keystores** - Losing them blocks releases
2. **Google Play App Signing is a lifesaver** - Can recover from lost keystores
3. **Account owner permissions matter** - Only owners can reset upload keys
4. **Atomic Design needs discipline** - Easy to misclassify components as they grow
5. **File-based memory helps Claude** - PROJECT_CONTEXT.md maintains continuity

---

## 💡 Tips for Working with Claude Code

### Starting a New Session
1. Say: "Read `.claude/PROJECT_CONTEXT.md` to get up to speed"
2. I'll understand project context immediately
3. Reference specific sections as needed: "Check unclosed loops"

### When to Update This File
- Major decisions made
- Architecture changes
- New blockers or blockers resolved
- Releases completed
- Important context discovered
- Client team changes

### What Not to Worry About
- Keeping it perfect - good enough is fine
- Updating after every tiny change
- Over-documenting obvious things

---

## 🎯 Next Steps (When You Return)

### Immediate
1. **Check email for Google Play upload key reset approval**
   - Usually 2-48 hours from Nov 25 afternoon
   - Check Play Console App Signing page

2. **Check with Jerrilee/Emily for TestFlight beta feedback**
   - Fix any critical issues before production release
   - Marcus might also report customer-facing issues

### Once Google Approves Upload Key
1. Build Android AAB:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
2. Upload `android/app/build/outputs/bundle/release/app-release.aab` to Play Console
3. Submit for review
4. Both platforms in review! 🎉

### Consider Merging
- `refactor/atomic-design-compliance` branch ready whenever convenient
- All tests passing, comprehensive documentation included

### Future Enhancements
- Review issue #9 for download management improvements (Marcus might have customer feedback)
- Consider BookStore refactoring (break into smaller hooks)
- Set up Fastlane for automated releases (issue #10)
