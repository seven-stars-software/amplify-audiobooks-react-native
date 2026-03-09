# AmplifyAudiobooks — Architecture Reference

Detailed architecture and release reference. For active work and project rules, see `../CLAUDE.md` and `../../../CLAUDE.md`.

## Context Provider Nesting

```
ErrorContextProvider          <- Top-level error boundary
  AuthContextProvider         <- Authentication seal (AsyncStorage)
    SafeAreaProvider          <- React Native Safe Area
      LayoutContextProvider   <- UI layout state (banner height)
        BookStoreProvider     <- Main data store (books, downloads)
          UserContextProvider <- User profile data (in-memory only)
            PlaybackContextProvider <- Audio playback control
              PaperProvider   <- Material Design theme
                RootNavigator <- Navigation root
```

### Key Contexts

**AuthContext** (15 lines) — Manages authentication seal, persisted to AsyncStorage.

**BookStoreProvider** (373 lines) — Central data store. Handles API fetching, local caching, downloads. Network-aware loading (ONLINE -> API, OFFLINE -> storage, UNKNOWN -> optimistic). Race condition prevention with `useRef` guard. Needs decomposition.

**PlaybackContext** (160 lines) — Wraps react-native-track-player. Single-book queue, checkpoint/resume, offline file fallback, error propagation.

**ErrorContext** (82 lines) — Full-screen error UI. Handles playback errors separately (navigates to PlaybackProblemScreen). Currently blocks app for non-playback errors.

### Network Status
- `useNetworkStatus()` hook returns `NetworkStatus` enum (ONLINE, OFFLINE, UNKNOWN)
- Dev settings override: `simulateOffline` flag for testing
- BookStore auto-refetches when network becomes available

## Component Organization (Atomic Design)

```
src/components/
├── atoms/          # 8 components - Pure UI primitives
├── molecules/      # 8 components - Simple compositions
└── organisms/      # 7 components - Complex features
```

Key organisms: PlayBookButton, DownloadButton, LoginForm, RegisterForm, NowPlayingCard, CoreTabBar, TopBanner.

## Backend Architecture

Thin API gateway (Express.js) that proxies to WordPress/WooCommerce and AWS S3. Session tokens via @hapi/iron. See parent CLAUDE.md for structure diagram.

## Release Process

1. Bump version in: package.json, android/build.gradle, iOS Xcode project, app.json
2. Update CHANGELOG.md
3. Commit and tag `vX.Y.Z`
4. Build iOS in Xcode -> Archive -> Upload to App Store Connect
5. Build Android: `cd android && ./gradlew bundleRelease`
6. Upload AAB to Google Play Console
7. Submit both for review

Fastlane automation in progress (PR #12).

## Android Signing History

- **March 2024:** Original keystore lost during app rebuild. Cannot update without Google approval.
- New keystore: `android/app/amplify-audiobooks-release.jks`
- Upload certificate: `android/app/upload_certificate.pem` (submitted to Google by Becky)
- Google Play App Signing enabled (recovery possible)
- Status: Waiting for Google Play upload key reset approval

## Key Files

### Core Source
- `src/App.tsx` — Root component with nested providers
- `src/APIClient.ts` — API wrapper for backend calls
- `src/URLs.ts` — Environment-aware URL configuration
- `src/stores/BookStore.tsx` — Main data store (373 lines)

### Build & Deploy
- `android/app/build.gradle` — Android version and signing config
- `android/keystore.properties` — Android signing credentials (gitignored)
- `ios/AmplifyAudiobooks.xcworkspace` — iOS build workspace
