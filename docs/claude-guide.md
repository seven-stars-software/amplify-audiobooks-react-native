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

## GitHub CLI (`gh`) Bug - Projects (classic) Deprecation

**CRITICAL BUG:** Many `gh` commands fail with exit code 1 due to a known bug in the GitHub CLI.

### The Problem

Commands like `gh pr edit`, `gh pr view`, and `gh issue view` fail with this error:

```
GraphQL: Projects (classic) is being deprecated in favor of the new Projects
experience, see:
https://github.blog/changelog/2024-05-23-sunset-notice-projects-classic/.
(repository.pullRequest.projectCards)
Exit code: 1
```

**This is NOT a warning - it's a fatal error that breaks the command.**

### Why This Happens

- GitHub deprecated "Projects (classic)" on May 23, 2024
- The `gh` CLI hardcodes `projectCards` queries in all PR/issue operations
- When the deprecated field is queried, GitHub returns an error
- `gh` treats this as a fatal error (exit code 1) instead of ignoring it
- **This happens even when you're not using any project-related flags**

### Affected Commands

- `gh pr edit` - [Issue #11983](https://github.com/cli/cli/issues/11983)
- `gh pr view` - Fails when displaying PR details
- `gh issue view` - [Issue #11992](https://github.com/cli/cli/issues/11992)
- Any command that queries PR/issue details

**Status:** All upstream issues are still open (as of November 2024). No fix released yet.

### Workarounds

#### For PR/Issue Edits (Adding Labels, etc.)

Use `gh api` instead of `gh pr edit` or `gh issue edit`:

```bash
# ❌ BROKEN - will fail with exit code 1
gh pr edit 7 --add-label "enhancement"

# ✅ WORKS - use GitHub API directly
gh api repos/seven-stars-software/amplify-audiobooks-react-native/issues/7/labels \
  --method POST \
  --input - <<< '{"labels":["enhancement","offline-mode"]}'
```

**Note:** PRs and issues share the same numbering and `/issues/` endpoint in the GitHub API.

#### For Viewing PR/Issue Details

Use `--json` with specific fields to avoid deprecated queries:

```bash
# ❌ BROKEN - queries deprecated projectCards field
gh pr view 7

# ✅ WORKS - specify only needed fields
gh pr view 7 --json number,title,state,body,labels,author,createdAt

# ✅ WORKS - for diffs, no JSON needed
gh pr diff 7
```

#### Common Field Combinations

```bash
# List PRs/issues
gh pr list --json number,title,state,labels,author
gh issue list --json number,title,state,labels,author

# View PR/issue details
gh pr view NUMBER --json number,title,body,state,labels,author,createdAt,updatedAt
gh issue view NUMBER --json number,title,body,state,labels,author,createdAt,updatedAt
```

### Quick Reference

```bash
# Adding labels to PR #7
gh api repos/seven-stars-software/amplify-audiobooks-react-native/issues/7/labels \
  --method POST \
  --input - <<< '{"labels":["bug","critical"]}'

# Removing a label from PR #7
gh api repos/seven-stars-software/amplify-audiobooks-react-native/issues/7/labels/bug \
  --method DELETE

# Viewing PR without triggering bug
gh pr view 7 --json number,title,state,body,labels
```

### Upstream Issues

Track the bug fixes here:
- [gh pr edit fails with Projects deprecation error (#11983)](https://github.com/cli/cli/issues/11983)
- [gh issue view fails with GraphQL deprecation warning (#11992)](https://github.com/cli/cli/issues/11992)
- [CLI reports error when adding PR to project (#11986)](https://github.com/cli/cli/issues/11986)
