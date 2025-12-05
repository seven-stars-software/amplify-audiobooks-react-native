import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterForm from '../../src/components/organisms/RegisterForm';
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

describe('RegisterForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global as any).mockNavigate.mockClear();
    });

    describe('rendering', () => {
        it('renders username, email, and password inputs', () => {
            const { Wrapper } = createWrapper();
            const { getByPlaceholderText } = render(<RegisterForm />, { wrapper: Wrapper });

            expect(getByPlaceholderText('Username')).toBeTruthy();
            expect(getByPlaceholderText('Email')).toBeTruthy();
            expect(getByPlaceholderText('Password')).toBeTruthy();
        });

        it('renders register button', () => {
            const { Wrapper } = createWrapper();
            const { getByText } = render(<RegisterForm />, { wrapper: Wrapper });

            expect(getByText('Register')).toBeTruthy();
        });

        it('renders login link', () => {
            const { Wrapper } = createWrapper();
            const { getByText } = render(<RegisterForm />, { wrapper: Wrapper });

            expect(getByText('Login')).toBeTruthy();
        });

        it('does not show error message initially', () => {
            const { Wrapper } = createWrapper();
            const { queryByText } = render(<RegisterForm />, { wrapper: Wrapper });

            expect(queryByText('Registration Failed')).toBeNull();
        });
    });

    describe('registration flow', () => {
        it('calls APIClient.register with credentials on submit', async () => {
            const { Wrapper } = createWrapper();
            mockAPIClient.register.mockResolvedValueOnce({
                success: true,
                seal: 'test-seal-123',
                wpUser: { id: 1, name: 'New User' },
            });

            const { getByPlaceholderText, getByText } = render(<RegisterForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'newuser');
            fireEvent.changeText(getByPlaceholderText('Email'), 'newuser@example.com');
            fireEvent.changeText(getByPlaceholderText('Password'), 'securepassword');
            fireEvent.press(getByText('Register'));

            await waitFor(() => {
                expect(mockAPIClient.register).toHaveBeenCalledWith({
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: 'securepassword',
                });
            });
        });

        it('sets auth seal on successful registration', async () => {
            const { Wrapper, setAuthSeal } = createWrapper();
            mockAPIClient.register.mockResolvedValueOnce({
                success: true,
                seal: 'new-user-seal',
                wpUser: { id: 1, name: 'New User' },
            });

            const { getByPlaceholderText, getByText } = render(<RegisterForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'newuser');
            fireEvent.changeText(getByPlaceholderText('Email'), 'newuser@example.com');
            fireEvent.changeText(getByPlaceholderText('Password'), 'securepassword');
            fireEvent.press(getByText('Register'));

            await waitFor(() => {
                expect(setAuthSeal).toHaveBeenCalledWith('new-user-seal');
            });
        });

        it('sets user data on successful registration', async () => {
            const { Wrapper, setUser } = createWrapper();
            const mockWpUser = { id: 1, name: 'New User' };
            mockAPIClient.register.mockResolvedValueOnce({
                success: true,
                seal: 'new-user-seal',
                wpUser: mockWpUser,
            });

            const { getByPlaceholderText, getByText } = render(<RegisterForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'newuser');
            fireEvent.changeText(getByPlaceholderText('Email'), 'newuser@example.com');
            fireEvent.changeText(getByPlaceholderText('Password'), 'securepassword');
            fireEvent.press(getByText('Register'));

            await waitFor(() => {
                expect(setUser).toHaveBeenCalled();
            });
        });

        it('shows error message on failed registration', async () => {
            const { Wrapper } = createWrapper();
            mockAPIClient.register.mockResolvedValueOnce({
                success: false,
                message: 'Username already exists',
            });

            const { getByPlaceholderText, getByText, findByText } = render(
                <RegisterForm />,
                { wrapper: Wrapper }
            );

            fireEvent.changeText(getByPlaceholderText('Username'), 'existinguser');
            fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
            fireEvent.changeText(getByPlaceholderText('Password'), 'password');
            fireEvent.press(getByText('Register'));

            expect(await findByText('Registration Failed')).toBeTruthy();
            expect(await findByText('Username already exists')).toBeTruthy();
        });

        it('handles thrown errors gracefully', async () => {
            const { Wrapper, handleThrown } = createWrapper();
            const testError = new Error('Network error');
            mockAPIClient.register.mockRejectedValueOnce(testError);

            const { getByPlaceholderText, getByText } = render(<RegisterForm />, { wrapper: Wrapper });

            fireEvent.changeText(getByPlaceholderText('Username'), 'newuser');
            fireEvent.changeText(getByPlaceholderText('Email'), 'newuser@example.com');
            fireEvent.changeText(getByPlaceholderText('Password'), 'password');
            fireEvent.press(getByText('Register'));

            await waitFor(() => {
                expect(handleThrown).toHaveBeenCalledWith(testError);
            });
        });
    });

    describe('navigation', () => {
        it('navigates to Core when already logged in', async () => {
            const { Wrapper } = createWrapper('existing-seal');
            render(<RegisterForm />, { wrapper: Wrapper });

            await waitFor(() => {
                expect((global as any).mockNavigate).toHaveBeenCalledWith('Core');
            });
        });

        it('navigates to Login when login link is pressed', () => {
            const { Wrapper } = createWrapper();
            const { getByText } = render(<RegisterForm />, { wrapper: Wrapper });

            fireEvent.press(getByText('Login'));

            expect((global as any).mockNavigate).toHaveBeenCalledWith('Login');
        });
    });

    describe('password visibility', () => {
        it('password input is secure by default', () => {
            const { Wrapper } = createWrapper();
            const { getByPlaceholderText } = render(<RegisterForm />, { wrapper: Wrapper });

            const passwordInput = getByPlaceholderText('Password');
            expect(passwordInput.props.secureTextEntry).toBe(true);
        });

        it('toggles password visibility when icon is pressed', () => {
            const { Wrapper } = createWrapper();
            const { getByPlaceholderText, UNSAFE_getAllByType } = render(<RegisterForm />, { wrapper: Wrapper });

            const passwordInput = getByPlaceholderText('Password');
            expect(passwordInput.props.secureTextEntry).toBe(true);

            // Find the Pressable containing the visibility icon
            const { Pressable } = require('react-native');
            const pressables = UNSAFE_getAllByType(Pressable);
            const visibilityToggle = pressables[pressables.length - 1];
            fireEvent.press(visibilityToggle);

            expect(passwordInput.props.secureTextEntry).toBe(false);
        });
    });
});
