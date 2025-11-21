# v2.1.0

## ⚠️ BREAKING CHANGES
- **Android:** Minimum supported version is now Android 7.0 (API 24). Drops support for Android 5.0, 5.1, and 6.0.
- **iOS:** Minimum supported version is now iOS 15.1. Drops support for iOS 13 and iOS 14.

## What's New for Users
- Improved app stability on the latest Android devices
- Better screen layout compatibility with modern phones (camera notches, edge displays)
- Fixed login issues where the app would get stuck after failed login attempts
- More visible error messages when login fails

## Technical Changes
- Upgraded to React Native 0.77 for Android 16KB page size support (required for future Android versions)
- Updated iOS deployment target to 15.1 for compatibility with latest dependencies
- Fixed Android safe area handling (status bar, navigation bar, camera cutouts) across all screens
- Fixed login form loading state bug that prevented retry after errors
- Improved login error message font size and layout

# v2.0.5
- Dynamic banner sizing based on screen size
- Loading screen quotes

# v2.0.4
- Updated iOS background mode for audio

# v2.0.3
- Download removal

# v2.0.2
- Splash screen font is now Glacial Indifference Bold. Bug with iOS font usage resolved.
- New style for bottom tabs and now playing card
- Now playing card no longer hides content on any screens

# v2.0.1
- Fixed app name "AmplifyAudiobooks" => "AMPlify Audiobooks"
- New font for in-app titles, "Glacial Indifference"
- Fixed font color on Account Registration screen
- Fixed padding of logo in top banner on Settings screen
- Fixed loading spinner for track 
- Fixed hidden progress bar on Now Playing preview card
- Added scroll-down to refresh to Home Screen
- Disable gesture-based navigation
- Change downloaded icon to checkmark


# v2.0
- Downloadable books
- New app icon