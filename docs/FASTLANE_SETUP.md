# Fastlane Setup Guide

This guide covers how to use Fastlane for automated releases of AmplifyAudiobooks to both iOS App Store and Google Play Store.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Credentials Setup](#credentials-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **macOS** (required for iOS builds)
- **Xcode** 15+ (for iOS builds)
- **Android Studio** or Android SDK (for Android builds)
- **Ruby** 2.6.10+ (already installed via CocoaPods)
- **Node.js** 18+ (already required for React Native)
- **Bundler** (Ruby gem manager)

### Accounts
- **Google Play Console** account with app already created
- **Apple Developer** account with app already created in App Store Connect

## Installation

Fastlane is already added to the `Gemfile`. To install or update:

```bash
bundle install
```

This will install Fastlane and all dependencies to `vendor/bundle`.

## Configuration

### Android Configuration

#### 1. Keystore Setup
The Android release signing is already configured in `android/keystore.properties` (gitignored).

Ensure this file exists with:
```properties
storeFile=app/amplify-audiobooks-release.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=upload
keyPassword=YOUR_KEY_PASSWORD
```

#### 2. Google Play Service Account (for automated upload)
To enable automated uploads to Google Play Console:

1. Go to [Google Play Console](https://play.google.com/console/)
2. Navigate to **Settings → API access**
3. Create a new service account or use existing
4. Download the JSON key file
5. Save as `google-play-key.json` in the project root (gitignored)
6. Grant the service account permissions in Play Console:
   - Release Manager (or Admin)

#### 3. Environment Variables
Create a `.env` file in the project root (gitignored):

```bash
# Android
ANDROID_KEYSTORE_FILE=android/app/amplify-audiobooks-release.jks
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_ALIAS=upload
ANDROID_KEY_PASSWORD=your_key_password
GOOGLE_PLAY_JSON_KEY=google-play-key.json
```

### iOS Configuration

#### 1. Apple ID Setup
You'll need:
- Apple ID with access to App Store Connect
- App-specific password (recommended) OR
- App Store Connect API Key (more secure, recommended for CI/CD)

#### 2. Certificate and Provisioning Profiles
Fastlane can manage these automatically, or you can use existing profiles from Xcode.

For manual setup:
1. Open project in Xcode
2. Ensure signing is configured under **Signing & Capabilities**
3. Fastlane will use these certificates

For automatic management (fastlane match):
```bash
bundle exec fastlane match init
```

#### 3. Environment Variables
Add to your `.env` file:

```bash
# iOS
FASTLANE_USER=your-apple-id@example.com
FASTLANE_PASSWORD=your-app-specific-password
# OR use App Store Connect API Key
APP_STORE_CONNECT_API_KEY_ID=ABC123
APP_STORE_CONNECT_API_ISSUER_ID=xyz-123-abc
APP_STORE_CONNECT_API_KEY_FILEPATH=./AuthKey_ABC123.p8
```

## Usage

### Quick Start: Complete Release

To release a new version to both platforms:

```bash
# Using npm scripts (recommended)
npm run release -- version:2.3.0 build:8

# Or directly with fastlane
bundle exec fastlane release version:2.3.0 build:8
```

This will:
1. ✅ Bump version in all files (package.json, app.json, build.gradle, iOS project)
2. ⏸️  Pause for you to update CHANGELOG.md
3. ✅ Create git commit and tag (v2.3.0)
4. ✅ Build Android AAB
5. ✅ Build iOS IPA
6. ℹ️  Show next steps for upload

### Individual Commands

#### Version Management

**Bump version across all platforms:**
```bash
npm run release:version -- version:2.3.0 build:8

# Or with fastlane directly:
bundle exec fastlane bump_version version:2.3.0 build:8
```

This updates:
- `package.json` → `"version": "2.3.0"`
- `app.json` → `"expo.version": "2.3.0"`
- `android/app/build.gradle` → `versionCode 8` and `versionName "2.3.0"`
- `ios/AmplifyAudiobooks.xcodeproj/project.pbxproj` → Marketing Version and Build Number

**Create git tag:**
```bash
bundle exec fastlane tag_version version:2.3.0
```

#### Android

**Build release AAB:**
```bash
npm run release:build-android

# Or:
bundle exec fastlane android build
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

**Upload to Play Console (Internal Testing):**
```bash
npm run release:deploy-android

# Or:
bundle exec fastlane android deploy
```

**Upload existing AAB:**
```bash
bundle exec fastlane android upload
```

#### iOS

**Build release IPA:**
```bash
npm run release:build-ios

# Or:
bundle exec fastlane ios build
```

Output: `./build/AmplifyAudiobooks.ipa`

**Upload to App Store Connect:**
```bash
npm run release:deploy-ios

# Or:
bundle exec fastlane ios deploy
```

**Upload existing IPA:**
```bash
bundle exec fastlane ios upload
```

## Credentials Setup

### Storing Credentials Securely

**Option 1: Environment Variables (Local Development)**
Create `.env` file in project root with all credentials (see Configuration section above).

**Option 2: System Environment Variables**
Add to your shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
export ANDROID_KEYSTORE_PASSWORD="your_password"
export ANDROID_KEY_PASSWORD="your_password"
export FASTLANE_USER="your@email.com"
export FASTLANE_PASSWORD="app-specific-password"
```

**Option 3: 1Password or Other Password Manager**
- Store credentials in secure vault
- Use 1Password CLI to inject at runtime:
```bash
eval $(op signin)
bundle exec fastlane android deploy
```

**For Team Collaboration:**
- Use 1Password shared vault for credential sharing
- Never commit `.env`, `google-play-key.json`, or `AuthKey_*.p8` files
- All sensitive files are already in `.gitignore`

## Release Process Workflow

### Step-by-Step Release

1. **Ensure clean working directory:**
   ```bash
   git status
   ```

2. **Run release command:**
   ```bash
   npm run release -- version:2.3.0 build:8
   ```

3. **When prompted, update CHANGELOG.md:**
   - Add release notes for v2.3.0
   - Save and press Enter to continue

4. **Push changes to remote:**
   ```bash
   git push && git push --tags
   ```

5. **Deploy to stores:**
   ```bash
   # Deploy both platforms
   npm run release:deploy-android
   npm run release:deploy-ios

   # Or just upload pre-built binaries
   bundle exec fastlane android upload
   bundle exec fastlane ios upload
   ```

6. **Submit for review in consoles:**
   - Google Play Console: Review release in Internal Testing, promote to Production
   - App Store Connect: Submit for review manually

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backward compatible)
- **PATCH** (0.0.X): Bug fixes

**Build numbers** must increment for each release:
- v2.2.0 build 7 → v2.3.0 build 8

## Troubleshooting

### Android Issues

**Error: Keystore not found**
- Ensure `android/keystore.properties` exists and points to correct keystore file
- Verify keystore file is in `android/app/` directory

**Error: Failed to upload to Play Console**
- Check `google-play-key.json` has correct permissions
- Verify service account has "Release Manager" role in Play Console
- Ensure the app exists in Play Console

**Error: Invalid signing configuration**
- Run `(cd android && ./gradlew clean)` and try again
- Verify passwords in `keystore.properties` are correct

### iOS Issues

**Error: No signing identity found**
- Open project in Xcode and ensure signing is configured
- Run `bundle exec fastlane match` to set up certificate management

**Error: Authentication failed**
- Verify Apple ID credentials in `.env`
- Generate app-specific password at [appleid.apple.com](https://appleid.apple.com)
- For 2FA: use App Store Connect API Key instead

**Error: Provisioning profile doesn't match**
- Open Xcode, go to Signing & Capabilities
- Click "Download Manual Profiles"
- Or use `bundle exec fastlane match` for automatic management

### General Issues

**Command not found: fastlane**
- Ensure you're using `bundle exec fastlane` (not just `fastlane`)
- Run `bundle install` to install dependencies

**Git errors when tagging**
- Ensure working directory is clean: `git status`
- If tag exists, delete it: `git tag -d v2.3.0`

**Version mismatch after bump**
- Check all files were updated correctly
- iOS: Sometimes needs manual Xcode update (Product → Clean Build Folder)

## Advanced Usage

### Custom Lanes

You can add custom lanes to `fastlane/Fastfile`:

```ruby
lane :beta do
  # Your custom beta release workflow
  bump_version(version: "2.3.0-beta.1", build: "8")
  android_build
  ios_build
end
```

Run with:
```bash
bundle exec fastlane beta
```

### CI/CD Integration

To integrate with GitHub Actions, GitLab CI, or other CI/CD systems:

1. Store credentials as CI secrets
2. Install dependencies in CI:
   ```bash
   bundle install
   ```
3. Run fastlane commands in CI pipeline
4. Example GitHub Actions workflow: see `docs/ci-cd-examples/` (to be added)

## Resources

- [Fastlane Documentation](https://docs.fastlane.tools/)
- [Fastlane for Android](https://docs.fastlane.tools/getting-started/android/setup/)
- [Fastlane for iOS](https://docs.fastlane.tools/getting-started/ios/setup/)
- [App Store Connect API](https://developer.apple.com/app-store-connect/api/)
- [Google Play Developer API](https://developers.google.com/android-publisher)

## Getting Help

For project-specific issues:
- Check this documentation
- Review `fastlane/Fastfile` for available lanes
- Ask in project communication channels

For Fastlane issues:
- [Fastlane GitHub Issues](https://github.com/fastlane/fastlane/issues)
- [Fastlane Community](https://github.com/fastlane/fastlane/discussions)
