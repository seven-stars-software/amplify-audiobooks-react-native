# Fastlane Configuration

This directory contains Fastlane configuration for automated releases of AmplifyAudiobooks.

## Quick Start

```bash
# Complete release workflow (version bump, build, tag)
npm run release -- version:2.3.0 build:8

# Or individual commands:
npm run release:version -- version:2.3.0 build:8
npm run release:build-android
npm run release:build-ios
npm run release:deploy-android
npm run release:deploy-ios
```

## Files

- **Fastfile** - Main configuration with all lanes (tasks)
- **Appfile** - App identifiers and configuration
- **.gitignore** - Prevents committing sensitive files

## Available Lanes

### Shared
- `bump_version` - Update version across all platform files
- `tag_version` - Create git commit and tag

### Android
- `android build` - Build release AAB
- `android deploy` - Build and upload to Play Console
- `android upload` - Upload existing AAB

### iOS
- `ios build` - Build release IPA
- `ios deploy` - Build and upload to App Store Connect
- `ios upload` - Upload existing IPA

### Full Release
- `release` - Complete workflow for both platforms

## Documentation

See `docs/FASTLANE_SETUP.md` for detailed setup instructions, configuration, and troubleshooting.

## Prerequisites

1. Install dependencies: `bundle install`
2. Configure credentials in `.env.development`
3. Set up Google Play service account (for Android uploads)
4. Set up Apple ID or App Store Connect API key (for iOS uploads)

## Security

**Never commit:**
- `.env.development` (already gitignored)
- `android/google-play-key.json`
- `AuthKey_*.p8`
- Keystore files (`*.jks`, `*.keystore`)

All sensitive files are protected in `.gitignore`.
