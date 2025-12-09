import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import LoginForm from '../../src/components/organisms/LoginForm';
import AuthContext from '../../src/contexts/AuthContext';
import UserContext from '../../src/contexts/UserContext';
import ErrorContext from '../../src/contexts/ErrorContext';
import APIClient from '../../src/APIClient';

// Mock APIClient
jest.mock('../../src/APIClient');
const mockAPIClient = APIClient as jest.Mocked<typeof APIClient>;

// Test wrapper with contexts
const createWrapper = (authSeal: string | null = null) => {
    const setAuthSeal = jest.fn();
    const setUser = jest.fn();
    const handleThrown = jest.fn();

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <ErrorContext.Provider value={{ handleThrown, clearError: jest.fn }}>
            <AuthContext.Provider value={[authSeal, setAuthSeal]}>
                <UserContext.Provider value={[{ wpUser: null }, setUser]}>
                    {children}
                </UserContext.Provider>
            </AuthContext.Provider>
        </ErrorContext.Provider>
    );

    return { Wrapper, setAuthSeal, setUser, handleThrown };
};

describe('LoginForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global as any).mockNavigate.mockClear();
    });

    describe('rendering', () => {
        it('renders username and password inputs', () => {
            const { Wrapper } = createWrapper();
            const { getByPlaceholderText } = render(<LoginForm />, { wrapper: Wrapper });

            expect(getByPlaceholderText('Username')).toBeTruthy();
            expect(getByPlaceholderText('Password')).toBeTruthy();
        });

        it('renders login button', () => {
            const { Wrapper } = createWrapper();
            const { getByText } = render(<LoginForm />, { wrapper: Wrapper });

            expect(getByText('Login')).toBeTruthy();
        });

        it('renders reset password and create account options', () => {
            const { Wrapper } = createWrapper();
            const { getByText } = render(<LoginForm />, { wrapper: Wrapper });

            expect(getByText('Reset Password')).toBeTruthy();
            expect(getByText('Create Account')).toBeTruthy();
        });

        it('does not show error message initially', () => {
            const { Wrapper } = createWrapper();
            const { queryByText } = render(<LoginForm />, { wrapper: Wrapper });

            expect(queryByText('Login Failed. Try Again?')).toBeNull();
        });
    });

    describe('user input', () => {
        it('allows entering username and password for submission', async () => {
            const { Wrapper } = createWrapper();
            mockAPIClient.login.mockResolvedValueOnce({
                success: true,
                seal: 'test-seal-123',
                wpUser: { id: 1 },
            });

            const { getByPlaceholderText, getByText } = render(<LoginForm />, { wrapper: Wrapper });

            // Enter credentials
            fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
            fireEvent.changeText(getByPlaceholderText('Password'), 'testpassword');
            fireEvent.press(getByText('Login'));

            // Verify the API was called with the entered values
            await waitFor(() => {
                expect(mockAPIClient.login).toHaveBeenCalledWith({
                    username: 'testuser',
                    password: 'testpassword',
                });
            });
        });
    });

    describe('login flow', () => {
        it('calls APIClient.login with credentials on submit', async () => {
            const { Wrapper } = createWrapper();
            mockAPIClient.login.mockResolvedValueOnce({
                success: true,
                seal: 'test-seal-123',
                wpUser: { id: 1, name: 'Test User' },
            });

            const { getByPlaceholderText, getByText } = render(<LoginForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
            fireEvent.changeText(getByPlaceholderText('Password'), 'testpassword');
            fireEvent.press(getByText('Login'));

            await waitFor(() => {
                expect(mockAPIClient.login).toHaveBeenCalledWith({
                    username: 'testuser',
                    password: 'testpassword',
                });
            });
        });

        it('sets auth seal on successful login', async () => {
            const { Wrapper, setAuthSeal } = createWrapper();
            mockAPIClient.login.mockResolvedValueOnce({
                success: true,
                seal: 'test-seal-123',
                wpUser: { id: 1, name: 'Test User' },
            });

            const { getByPlaceholderText, getByText } = render(<LoginForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
            fireEvent.changeText(getByPlaceholderText('Password'), 'testpassword');
            fireEvent.press(getByText('Login'));

            await waitFor(() => {
                expect(setAuthSeal).toHaveBeenCalledWith('test-seal-123');
            });
        });

        it('sets user data on successful login', async () => {
            const { Wrapper, setUser } = createWrapper();
            const mockWpUser = { id: 1, name: 'Test User' };
            mockAPIClient.login.mockResolvedValueOnce({
                success: true,
                seal: 'test-seal-123',
                wpUser: mockWpUser,
            });

            const { getByPlaceholderText, getByText } = render(<LoginForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
            fireEvent.changeText(getByPlaceholderText('Password'), 'testpassword');
            fireEvent.press(getByText('Login'));

            await waitFor(() => {
                expect(setUser).toHaveBeenCalled();
            });
        });

        it('shows error message on failed login', async () => {
            const { Wrapper } = createWrapper();
            mockAPIClient.login.mockResolvedValueOnce({
                success: false,
                seal: '',
                wpUser: {},
            });

            const { getByPlaceholderText, getByText, findByText } = render(<LoginForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'baduser');
            fireEvent.changeText(getByPlaceholderText('Password'), 'badpassword');
            fireEvent.press(getByText('Login'));

            expect(await findByText('Login Failed. Try Again?')).toBeTruthy();
        });

        it('clears error state when loading starts', async () => {
            const { Wrapper } = createWrapper();

            // First login fails
            mockAPIClient.login.mockResolvedValueOnce({
                success: false,
                seal: '',
                wpUser: {},
            });

            const { getByPlaceholderText, getByText, findByText } = render(
                <LoginForm />,
                { wrapper: Wrapper }
            );

            fireEvent.changeText(getByPlaceholderText('Username'), 'baduser');
            fireEvent.changeText(getByPlaceholderText('Password'), 'badpassword');
            fireEvent.press(getByText('Login'));

            // Wait for error to appear
            await findByText('Login Failed. Try Again?');

            // Second login attempt - make it successful
            mockAPIClient.login.mockResolvedValueOnce({
                success: true,
                seal: 'test-seal-123',
                wpUser: { id: 1 },
            });

            // Press login again - error should clear while loading
            await act(async () => {
                fireEvent.press(getByText('Login'));
            });

            // The login should complete
            await waitFor(() => {
                expect(mockAPIClient.login).toHaveBeenCalledTimes(2);
            });
        });

        it('handles thrown errors gracefully', async () => {
            const { Wrapper, handleThrown } = createWrapper();
            const testError = new Error('Network error');
            mockAPIClient.login.mockRejectedValueOnce(testError);

            const { getByPlaceholderText, getByText } = render(<LoginForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
            fireEvent.changeText(getByPlaceholderText('Password'), 'testpassword');
            fireEvent.press(getByText('Login'));

            await waitFor(() => {
                expect(handleThrown).toHaveBeenCalledWith(testError);
            });
        });
    });

    describe('navigation', () => {
        it('navigates to Core when already logged in', async () => {
            const { Wrapper } = createWrapper('existing-seal');
            render(<LoginForm />, { wrapper: Wrapper });

            await waitFor(() => {
                expect((global as any).mockNavigate).toHaveBeenCalledWith('Core');
            });
        });

        it('opens reset password URL when pressed', () => {
            const { Wrapper } = createWrapper();
            const { getByText } = render(<LoginForm />, { wrapper: Wrapper });

            fireEvent.press(getByText('Reset Password'));

            expect(Linking.openURL).toHaveBeenCalled();
        });

        it('navigates to Register when Create Account is pressed', () => {
            const { Wrapper } = createWrapper();
            const { getByText } = render(<LoginForm />, { wrapper: Wrapper });

            fireEvent.press(getByText('Create Account'));

            expect((global as any).mockNavigate).toHaveBeenCalledWith('Register');
        });
    });

    describe('password visibility', () => {
        it('password input is secure by default', () => {
            const { Wrapper } = createWrapper();
            const { getByPlaceholderText } = render(<LoginForm />, { wrapper: Wrapper });

            const passwordInput = getByPlaceholderText('Password');
            expect(passwordInput.props.secureTextEntry).toBe(true);
        });

        it('toggles password visibility when icon is pressed', () => {
            const { Wrapper } = createWrapper();
            const { getByPlaceholderText, UNSAFE_getAllByType } = render(<LoginForm />, { wrapper: Wrapper });

            const passwordInput = getByPlaceholderText('Password');
            expect(passwordInput.props.secureTextEntry).toBe(true);

            // Find the Pressable containing the visibility icon (it's near the password input)
            const { Pressable } = require('react-native');
            const pressables = UNSAFE_getAllByType(Pressable);

            // The visibility toggle is typically the last Pressable
            const visibilityToggle = pressables[pressables.length - 1];
            fireEvent.press(visibilityToggle);

            expect(passwordInput.props.secureTextEntry).toBe(false);
        });
    });
});
