# Project-Specific Guidelines for Claude

**READ THIS BEFORE STARTING WORK.** These rules prevent common mistakes that waste time.

## Working Directory Management

**CRITICAL:** After running `cd`, your shell session stays in that directory. This causes subsequent commands to fail in confusing ways.

### Rules (in order of preference)

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

### Why This Matters

When you run `cd ios && pod install`, your shell stays in the `ios` directory. The next command you run (like `npx expo run:ios`) will execute from `ios/` instead of the project root, causing cryptic errors about missing files.

### Quick Reference

```bash
# ✅ CORRECT - absolute path
pytest /Users/verinaut/Projects/amplify/amplify-react-native/AmplifyAudiobooks/tests

# ✅ CORRECT - subshell for commands requiring specific directory
(cd ios && pod install)

# ❌ WRONG - shell stays in ios/ after this
cd ios && pod install

# ❌ WRONG - unnecessary directory change
cd tests && pytest .
```

### Project-Specific Examples

**Installing iOS dependencies:**
```bash
(cd ios && pod install)
```

**Running Expo commands (must run from project root):**
```bash
npx expo run:ios
```

**Running React Native commands (must run from project root):**
```bash
npx react-native run-android
```
