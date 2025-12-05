import { renderHook } from '@testing-library/react-native';
import useStyles from '../../src/hooks/useStyles';

// Mock react-native-paper with jest.fn for useTheme
const mockUseTheme = jest.fn();
jest.mock('react-native-paper', () => ({
  ...jest.requireActual('react-native-paper'),
  useTheme: () => mockUseTheme(),
}));

describe('useStyles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default theme
    mockUseTheme.mockReturnValue({
      colors: {
        background: '#ffffff',
        primary: '#6200ee',
      },
    });
  });

  it('should return a styles object', () => {
    const { result } = renderHook(() => useStyles());

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should include BGColor style', () => {
    mockUseTheme.mockReturnValue({
      colors: {
        background: '#f5f5f5',
        primary: '#6200ee',
      },
    });

    const { result } = renderHook(() => useStyles());

    expect(result.current.BGColor).toBeDefined();
    expect(result.current.BGColor.backgroundColor).toBe('#f5f5f5');
  });

  it('should update styles when theme changes', () => {
    mockUseTheme.mockReturnValue({
      colors: {
        background: '#ffffff',
        primary: '#6200ee',
      },
    });

    const { result, rerender } = renderHook(() => useStyles());

    const initialBackgroundColor = result.current.BGColor.backgroundColor;
    expect(initialBackgroundColor).toBe('#ffffff');

    // Change theme
    mockUseTheme.mockReturnValue({
      colors: {
        background: '#121212',
        primary: '#bb86fc',
      },
    });

    rerender({});

    expect(result.current.BGColor.backgroundColor).toBe('#121212');
  });

  it('should have BGColor with backgroundColor property', () => {
    mockUseTheme.mockReturnValue({
      colors: {
        background: '#fafafa',
        primary: '#6200ee',
      },
    });

    const { result } = renderHook(() => useStyles());

    expect(result.current.BGColor).toHaveProperty('backgroundColor');
    expect(result.current.BGColor.backgroundColor).toBe('#fafafa');
  });
});
