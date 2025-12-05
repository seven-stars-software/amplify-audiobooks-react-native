import { renderHook, act } from '@testing-library/react-native';
import useCallbackState from '../../src/hooks/useCallbackState';

describe('useCallbackState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with the provided value', () => {
    const { result } = renderHook(() => useCallbackState('initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should initialize with a function', () => {
    const { result } = renderHook(() => useCallbackState(() => 'computed'));
    expect(result.current[0]).toBe('computed');
  });

  it('should update state when setState is called', () => {
    const { result } = renderHook(() => useCallbackState('initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
  });

  it('should call the callback after state update', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useCallbackState('initial'));

    act(() => {
      result.current[1]('updated', callback);
    });

    expect(callback).toHaveBeenCalledWith('updated');
  });

  it('should accept a function as the new state value', () => {
    const { result } = renderHook(() => useCallbackState(0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should call callback with the new value when using function update', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useCallbackState(5));

    act(() => {
      result.current[1]((prev) => prev * 2, callback);
    });

    expect(callback).toHaveBeenCalledWith(10);
  });

  it('should handle multiple state updates with callbacks', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { result } = renderHook(() => useCallbackState(0));

    act(() => {
      result.current[1](1, callback1);
    });

    expect(callback1).toHaveBeenCalledWith(1);

    act(() => {
      result.current[1](2, callback2);
    });

    expect(callback2).toHaveBeenCalledWith(2);
  });

  it('should work without a callback', () => {
    const { result } = renderHook(() => useCallbackState('test'));

    act(() => {
      result.current[1]('no callback');
    });

    expect(result.current[0]).toBe('no callback');
  });

  it('should handle object state', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useCallbackState({ count: 0, name: 'test' }));

    act(() => {
      result.current[1]({ count: 1, name: 'updated' }, callback);
    });

    expect(result.current[0]).toEqual({ count: 1, name: 'updated' });
    expect(callback).toHaveBeenCalledWith({ count: 1, name: 'updated' });
  });

  it('should handle array state', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useCallbackState<string[]>([]));

    act(() => {
      result.current[1](['item1', 'item2'], callback);
    });

    expect(result.current[0]).toEqual(['item1', 'item2']);
    expect(callback).toHaveBeenCalledWith(['item1', 'item2']);
  });

  it('should clear callback queue after execution', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useCallbackState('initial'));

    act(() => {
      result.current[1]('first', callback);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Trigger another update without callback
    act(() => {
      result.current[1]('second');
    });

    // Callback should not be called again
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
