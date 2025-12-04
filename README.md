# AMPlify Audiobooks

A modern React Native audiobook player for iOS and Android, built for Pro Audio Voices. Features offline playback, seamless progress tracking, and a Material Design 3 interface.

<div align="center">
  <img src="docs/screenshots/home-screen.png" width="250" alt="Book Detail Screen" />
  <img src="docs/screenshots/library-grid.png" width="250" alt="Library Screen" />
  <img src="docs/screenshots/library-list.png" width="250" alt="Library List View" />
</div>

## Features

### Core Functionality
- **Offline Playback** - Download audiobooks for listening without an internet connection
- **Progress Tracking** - Automatically resume where you left off across devices
- **Smart Downloads** - Per-track download management with real-time status updates
- **Network Awareness** - Graceful offline mode with clear user feedback
- **Material Design 3** - Modern, accessible UI using React Native Paper

### Playback Features
- Background audio playback with lock screen controls
- Variable playback speed
- Skip forward/backward (15-second increments)
- Chapter navigation
- Sleep timer
- Progress scrubbing

### User Experience
- Pull-to-refresh book library sync
- Discover new releases from web catalog
- Search and browse by author, genre, narrator
- User authentication and account management
- Persistent now-playing card for quick access

## Tech Stack

- **Framework:** React Native 0.77.3 with Expo 52.0.27
- **Language:** TypeScript 5.6.3
- **Navigation:** React Navigation 6.x (Native Stack + Bottom Tabs)
- **UI Library:** React Native Paper 5.14.5 (Material Design 3)
- **Audio Engine:** react-native-track-player 4.1.2
- **State Management:** React Context API + Custom Hooks
- **Storage:** AsyncStorage + expo-file-system
- **Network Detection:** @react-native-community/netinfo

### Development Tools
- **Build Automation:** Fastlane (iOS + Android)
- **CI/CD:** Automated version bumping and deployment
- **Code Quality:** ESLint, Prettier, TypeScript strict mode
- **Testing:** Jest + React Test Renderer

## Architecture

### Component Organization
This project follows **Atomic Design** methodology for component organization:

```
src/components/
├── atoms/          # Basic UI primitives (buttons, cards, dialogs)
├── molecules/      # Simple compositions (lists, tiles, containers)
└── organisms/      # Complex features (forms, playback controls, tab bars)
```

See [docs/ATOMIC_DESIGN.md](docs/ATOMIC_DESIGN.md) for detailed guidelines.

### Project Structure

```
AmplifyAudiobooks/
├── src/
│   ├── components/       # UI components (atoms, molecules, organisms)
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── navigators/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── services/         # Business logic and API clients
│   ├── stores/           # State management (BookStore, etc.)
│   └── types/            # TypeScript type definitions
├── android/              # Android native code
├── ios/                  # iOS native code
├── docs/                 # Documentation
├── fastlane/             # Automated build and deployment
└── assets/               # Images, fonts, and other static resources
```

### State Management
- **PlaybackContext** - Global playback state and controls
- **AuthContext** - User authentication and session management
- **UserContext** - User profile and preferences
- **ErrorContext** - Global error handling
- **LayoutContext** - Dynamic layout measurements
- **BookStore** - Zustand-style store for book library and downloads

### Key Design Decisions
- **Context over Redux** - Simpler state management for this use case
- **Custom hooks for logic extraction** - Keep components focused and testable
- **Offline-first architecture** - Local-first data with background sync
- **Enums over string literals** - Type-safe status values throughout

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- **Xcode** 15.1+ (for iOS development, macOS only)
- **Android Studio** with Android SDK (for Android development)
- **CocoaPods** (for iOS dependencies)
- **Fastlane** (for automated builds)

See the [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) guide for detailed platform-specific instructions.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/seven-stars-software/amplify-audiobooks-react-native.git
   cd amplify-audiobooks-react-native
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.development.default .env.development
   ```

   Edit `.env.development` with your API endpoints and configuration.

### Running the App

#### Development Mode

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Start Metro bundler separately:**
```bash
npm start
```

#### Release Builds

This project uses Fastlane for automated builds. See [docs/FASTLANE_SETUP.md](docs/FASTLANE_SETUP.md) for complete instructions.

**Build iOS:**
```bash
npm run release:build-ios
```

**Build Android:**
```bash
npm run release:build-android
```

**Full release (version bump + build + deploy):**
```bash
npm run release
```

## Development

### Code Style

- **TypeScript strict mode** enabled
- **ESLint** for code quality
- **Prettier** for formatting
- Always use **enums** over string literals for status values
- Follow **Atomic Design** principles for component organization

### Git Workflow

- **Main branch:** `main` (protected, requires PR)
- **Feature branches:** `feature/feature-name`
- **Refactor branches:** `refactor/refactor-name`
- **Worktrees** recommended for parallel development

### Commit Messages

Include Claude Code attribution footer:

```
Your commit message here

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Deployment

### iOS (App Store)
- TestFlight beta testing configured
- App Store Connect API integration
- Automated IPA generation via Fastlane
- Current version: 2.2.0 (live in TestFlight)

### Android (Google Play)
- Google Play Console integration
- Automated AAB generation via Fastlane
- Google Play App Signing enabled
- Service account: `fastlane-release@amplifyaudiobooks-api.iam.gserviceaccount.com`

See [docs/FASTLANE_SETUP.md](docs/FASTLANE_SETUP.md) for detailed deployment workflows.

## Platform Support

- **iOS:** 15.1+
- **Android:** API 24+ (Android 7.0 Nougat)

## API Integration

This app integrates with the Pro Audio Voices audiobook API for:
- User authentication
- Book catalog and metadata
- Purchase verification
- Progress syncing
- Audio file URLs

API endpoints are configured via environment variables in `.env.development`.

## Known Issues & Limitations

- **Android Keystore Recovery:** Google Play App Signing is enabled to prevent keystore loss issues
- **Network Detection Edge Cases:** Brief connection interruptions may not trigger offline mode immediately
- **Large Downloads:** Multi-hour audiobooks may take significant time on slower connections

See [GitHub Issues](https://github.com/seven-stars-software/amplify-audiobooks-react-native/issues) for active bug reports and feature requests.

## Documentation

- **[Development Guide](docs/development.md)** - Detailed setup and development workflow
- **[Atomic Design](docs/ATOMIC_DESIGN.md)** - Component organization guidelines
- **[Fastlane Setup](docs/FASTLANE_SETUP.md)** - Build automation and deployment
- **[Changelog](CHANGELOG.md)** - Version history and release notes
- **[Project Context](.claude/PROJECT_CONTEXT.md)** - Complete project documentation for AI tools

## Contributing

This is a private commercial project. Future contractors should coordinate with the project maintainer before submitting changes.

## License

Proprietary - All rights reserved by Pro Audio Voices.

## Credits

**Developer:** Jackson Callaway
**Client:** Pro Audio Voices
**Design:** Material Design 3 by Google

---

Built with [React Native](https://reactnative.dev) • [Expo](https://expo.dev) • [React Native Paper](https://callstack.github.io/react-native-paper/)
