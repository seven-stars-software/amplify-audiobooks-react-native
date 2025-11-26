# Atomic Design Methodology

This document explains the Atomic Design component organization used in this React Native application.

## What is Atomic Design?

Atomic Design is a methodology for creating design systems with five distinct levels of components, from simplest to most complex:

1. **Atoms** - Basic building blocks
2. **Molecules** - Simple groups of atoms
3. **Organisms** - Complex, feature-complete components
4. **Templates** - Page-level layouts (not used in this app)
5. **Pages** - Full pages with real content (represented by our Screens)

## Our Component Structure

```
src/components/
├── atoms/           # Basic UI primitives
├── molecules/       # Simple compositions
└── organisms/       # Complex feature components
```

---

## Atoms

**Definition:** The smallest, most basic UI components. Pure presentational components with no business logic.

**Rules:**
- ❌ No context usage (PlaybackContext, BookStore, ErrorContext, etc.)
- ❌ No navigation
- ❌ Minimal or no state management
- ✅ Single responsibility
- ✅ Highly reusable
- ✅ Can use theme/styling hooks (useTheme, useStyles)

**Current Atoms:**
- `RemoveDownloadsDialog.tsx` - Simple confirmation dialog
- `DiscoverBookTile.tsx` - Basic tile display
- `JumpButton.tsx` (actually JumpIcon) - Icon with transforms
- `AutoHeightImage.tsx` - Image with proportional height calculation
- `CatalogLinkListItem.tsx` - External link button
- `SplashLogo.tsx` - Splash screen logo
- `FancyBG.tsx` - Background image component
- `BookCard.tsx` - Book display card (borderline - uses navigation)

**Example Atom:**
```typescript
// Good Atom - Pure presentational
const RemoveDownloadsDialog = ({ visible, onDismiss, onConfirm }) => (
  <Dialog visible={visible} onDismiss={onDismiss}>
    <Dialog.Title>Remove Downloads?</Dialog.Title>
    <Dialog.Actions>
      <Button onPress={onDismiss}>Cancel</Button>
      <Button onPress={onConfirm}>Remove</Button>
    </Dialog.Actions>
  </Dialog>
);
```

---

## Molecules

**Definition:** Simple compositions of atoms. May have basic state and simple logic, but focused on a single interaction pattern.

**Rules:**
- ✅ Compose atoms and other simple UI elements
- ✅ Can use navigation (navigate, goBack)
- ✅ Can use one context for styling/layout (LayoutContext, theme)
- ✅ Simple, focused state management
- ❌ No complex business logic
- ❌ No multiple context dependencies for data
- ❌ No API calls or async operations

**Current Molecules:**
- `BookList.tsx` - FlatList of book cards with refresh
- `BooksSideScroll.tsx` - Horizontal scrolling book list
- `TrackItem.tsx` - Single track display
- `Banner.tsx` - Header banner layout
- `BookTracks.tsx` - List of tracks (borderline organism)
- `BookTile.tsx` - Book tile with navigation (moved from atoms)
- `IconNavButton.tsx` - Navigation button (moved from atoms)
- `MainScreenContainer.tsx` - Screen wrapper with banner (moved from atoms)

**Example Molecule:**
```typescript
// Good Molecule - Composes atoms, simple state
const BooksSideScroll = ({ books, onBookPress }) => {
  return (
    <FlatList
      horizontal
      data={books}
      renderItem={({ item }) => (
        <BookTile book={item} onPress={() => onBookPress(item)} />
      )}
    />
  );
};
```

---

## Organisms

**Definition:** Complex, feature-complete components with business logic, multiple context dependencies, and sophisticated state management.

**Rules:**
- ✅ Multiple context dependencies (PlaybackContext, BookStore, etc.)
- ✅ Complex business logic
- ✅ API calls and async operations
- ✅ Sophisticated state management (multiple useState, useEffect hooks)
- ✅ Feature-specific functionality
- ✅ Can be 100+ lines of code
- ✅ Compose molecules and atoms

**Current Organisms:**
- `PlayBookButton.tsx` - Playback control with state sync (moved from atoms)
- `DownloadButton.tsx` - Download management with dialog (moved from atoms)
- `TopBanner.tsx` - Banner with layout measurement (moved from atoms)
- `LoginForm.tsx` - Complete authentication form (moved from molecules)
- `RegisterForm.tsx` - Complete registration form (moved from molecules)
- `NowPlayingCard.tsx` - Playback card with controls (moved from molecules)
- `CoreTabBar.tsx` - Custom tab navigation bar (moved from molecules)

**Example Organism:**
```typescript
// Good Organism - Complex feature with multiple contexts
const PlayBookButton = ({ book, size, isOffline, onOfflinePlayAttempt }) => {
  // Multiple contexts
  const { nowPlaying, playBook } = useContext(PlaybackContext);
  const { books, loading } = useBookStore();
  const navigation = useNavigation();

  // Complex state
  const [buttonColor, setButtonColor] = useState(theme.colors.primary);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [playOnLoad, setPlayOnLoad] = useState(false);

  // Business logic
  const togglePlay = async () => {
    if (isOffline && !allTracksDownloaded) {
      onOfflinePlayAttempt();
      return;
    }
    // ... complex playback logic
  };

  // Multiple useEffect hooks
  useEffect(() => { /* track player state sync */ }, []);
  useEffect(() => { /* loading state management */ }, [loading]);

  return (
    <Pressable onPress={togglePlay}>
      {/* Complex rendering logic */}
    </Pressable>
  );
};
```

---

## Migration Summary

### Components Moved from Atoms to Organisms:
1. **PlayBookButton.tsx** - 102 lines, uses PlaybackContext + BookStore + Navigation
2. **DownloadButton.tsx** - 89 lines, uses BookStore, manages download flow
3. **TopBanner.tsx** - 90 lines, uses LayoutContext, complex measurement logic

### Components Moved from Molecules to Organisms:
1. **LoginForm.tsx** - 239 lines, uses AuthContext + UserContext + ErrorContext
2. **RegisterForm.tsx** - 231 lines, uses AuthContext + UserContext + ErrorContext
3. **NowPlayingCard.tsx** - 157 lines, uses PlaybackContext + custom hooks
4. **CoreTabBar.tsx** - 162 lines, complex navigation orchestration

### Components Moved from Atoms to Molecules:
1. **BookTile.tsx** - Uses navigation
2. **IconNavButton.tsx** - Uses navigation with conditional logic
3. **MainScreenContainer.tsx** - Composes TopBanner, uses LayoutContext

---

## Decision Tree: Where Does My Component Go?

```
START: I have a new component to add

Does it use ANY context for data (not just theme)?
├─ NO → Continue
└─ YES → Does it use multiple contexts?
    ├─ NO → MOLECULE (or ORGANISM if complex)
    └─ YES → ORGANISM

Does it have business logic (API calls, complex state, async operations)?
├─ NO → Continue
└─ YES → ORGANISM

Does it compose other components?
├─ NO → ATOM
└─ YES → Does it have state or navigation?
    ├─ NO → ATOM (or MOLECULE if composition is complex)
    └─ YES → MOLECULE

Is it a pure presentational UI element?
└─ YES → ATOM
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: "Atoms" with Business Logic
```typescript
// BAD - This is NOT an atom
const PlayButton = ({ book }) => {
  const { playBook } = useContext(PlaybackContext); // Context usage
  const { books } = useBookStore(); // Another context

  const handlePlay = async () => {
    await playBook(book); // Business logic
  };

  return <Button onPress={handlePlay} />;
};
```

**Fix:** Move to organisms/ directory

### ❌ Mistake 2: "Molecules" with Multiple Contexts
```typescript
// BAD - This is NOT a molecule
const BookForm = () => {
  const { user } = useContext(UserContext);
  const { books } = useBookStore();
  const { handleError } = useContext(ErrorContext);
  // ... complex form logic
};
```

**Fix:** Move to organisms/ directory

### ❌ Mistake 3: Atoms with Navigation
```typescript
// BAD - Atoms shouldn't navigate
const BookCard = ({ book }) => {
  const navigation = useNavigation();
  return (
    <Pressable onPress={() => navigation.navigate('Book', { book })}>
      {/* ... */}
    </Pressable>
  );
};
```

**Fix:** Move to molecules/ directory or pass navigation as callback prop

---

## Best Practices

### 1. Keep Atoms Pure
```typescript
// GOOD - Accept callbacks as props
const BookCard = ({ book, onPress }) => (
  <Pressable onPress={() => onPress(book)}>
    <Image source={{ uri: book.image }} />
    <Text>{book.title}</Text>
  </Pressable>
);
```

### 2. Limit Molecule Complexity
```typescript
// GOOD - Simple composition
const BookList = ({ books, onBookPress }) => (
  <FlatList
    data={books}
    renderItem={({ item }) => <BookCard book={item} onPress={onBookPress} />}
  />
);
```

### 3. Embrace Organism Complexity
```typescript
// GOOD - Organism handles feature complexity
const LoginForm = () => {
  // Multiple contexts OK
  const { setAuthSeal } = useContext(AuthContext);
  const { setUser } = useContext(UserContext);
  const { handleError } = useContext(ErrorContext);

  // Complex state OK
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Business logic OK
  const handleLogin = async () => {
    try {
      const response = await APIClient.login(username, password);
      setAuthSeal(response.seal);
      setUser(response.user);
    } catch (error) {
      handleError(error);
    }
  };

  return (/* complex form UI */);
};
```

---

## Future Refactoring Opportunities

While the component organization now follows Atomic Design principles, some organisms could be further broken down:

### PlayBookButton.tsx
Could extract:
- `usePlaybackState` hook for state management
- `PlaybackIcon` atom for icon rendering
- `LoadingOverlay` atom for loading indicator

### DownloadButton.tsx
Could extract:
- `useDownloadState` hook for download status
- `DownloadIcon` atom for icon states
- `DownloadProgress` molecule for progress display

### LoginForm.tsx & RegisterForm.tsx
Could extract:
- `useAuthForm` hook for form state and validation
- `FormInput` molecule for text input with validation
- `PasswordInput` molecule for password field with toggle

These refactorings can be done incrementally as the codebase grows.

---

## Resources

- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/chapter-2/)
- [React Component Patterns](https://www.patterns.dev/posts/react-component-patterns)

---

**Last Updated:** 2025-11-25
**Refactoring Branch:** `refactor/atomic-design-compliance`
