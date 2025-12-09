import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import SplashScreen from '../../src/screens/SplashScreen';
import AuthContext from '../../src/contexts/AuthContext';
import { WelcomeStatus } from '../../src/hooks/useWelcome';

// Mock the services
jest.mock('../../src/services', () => ({
    SetupService: jest.fn(() => Promise.resolve(true)),
}));

// Mock useWelcome hook
const mockWelcomeStatus = { current: WelcomeStatus.complete };
jest.mock('../../src/hooks/useWelcome', () => ({
    __esModule: true,
    default: () => ({ welcomeStatus: mockWelcomeStatus.current }),
    WelcomeStatus: {
        incomplete: 'incomplete',
        complete: 'complete',
    },
}));

// Mock SplashLogo component
jest.mock('../../src/components/atoms/SplashLogo', () => 'SplashLogo');

// Mock image require
jest.mock('@assets/images/fancy-bg.png', () => 1);

const mockNavigate = jest.fn();

const createWrapper = (authSeal: string | null = null) => {
    const setAuthSeal = jest.fn();

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={[authSeal, setAuthSeal]}>
            {children}
        </AuthContext.Provider>
    );

    return { Wrapper, setAuthSeal };
};

const createNavigation = () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
});

describe('SplashScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockWelcomeStatus.current = WelcomeStatus.complete;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('rendering', () => {
        it('renders the splash logo', () => {
            const { Wrapper } = createWrapper();
            const { UNSAFE_getByType } = render(
                <SplashScreen navigation={createNavigation() as any} route={{} as any} />,
                { wrapper: Wrapper }
            );

            // Check SplashLogo is rendered
            expect(UNSAFE_getByType('SplashLogo' as any)).toBeTruthy();
        });

        it('displays a quip message', () => {
            const { Wrapper } = createWrapper();
            const { queryByText } = render(
                <SplashScreen navigation={createNavigation() as any} route={{} as any} />,
                { wrapper: Wrapper }
            );

            // Check that at least one quip is displayed
            const quips = [
                "Thanks for AMPlify-ing an author's impact!",
                'Fetching your audiobooks off the shelf!',
                'Thanks for using The Equitable Audiobook Platform!',
                "Every listen helps to AMPlify an author's impact!",
                'Feeding Starving Authors',
                'Adopt a starving author today!',
                'No Authors = No Audiobooks!',
                'Audiobooks: When reading is just too hard',
                'Bury Me with an Audiobook',
            ];

            // At least one quip should be visible
            const foundQuip = quips.some(quip =>
                queryByText(quip) !== null ||
                queryByText(quip, { exact: false }) !== null
            );
            expect(foundQuip).toBe(true);
        });
    });

    describe('navigation based on state', () => {
        it('navigates to Welcome when welcome is incomplete', async () => {
            mockWelcomeStatus.current = WelcomeStatus.incomplete;
            const { Wrapper } = createWrapper();
            const navigation = createNavigation();

            render(
                <SplashScreen navigation={navigation as any} route={{} as any} />,
                { wrapper: Wrapper }
            );

            // Advance past initial timeout
            await act(async () => {
                jest.advanceTimersByTime(2000);
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('Welcome');
            });
        });

        it('navigates to Login when not logged in and welcome is complete', async () => {
            mockWelcomeStatus.current = WelcomeStatus.complete;
            const { Wrapper } = createWrapper(null); // not logged in
            const navigation = createNavigation();

            render(
                <SplashScreen navigation={navigation as any} route={{} as any} />,
                { wrapper: Wrapper }
            );

            // Advance past initial timeout
            await act(async () => {
                jest.advanceTimersByTime(2000);
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('Login');
            });
        });

        it('navigates to Core when logged in and welcome is complete', async () => {
            mockWelcomeStatus.current = WelcomeStatus.complete;
            const { Wrapper } = createWrapper('existing-seal'); // logged in
            const navigation = createNavigation();

            render(
                <SplashScreen navigation={navigation as any} route={{} as any} />,
                { wrapper: Wrapper }
            );

            // Advance past initial timeout
            await act(async () => {
                jest.advanceTimersByTime(2000);
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('Core');
            });
        });
    });

    describe('loading behavior', () => {
        it('waits for SetupService before navigating', async () => {
            const SetupService = require('../../src/services').SetupService;
            let resolveSetup: (value: boolean) => void;
            SetupService.mockImplementationOnce(() =>
                new Promise((resolve) => {
                    resolveSetup = resolve;
                })
            );

            const { Wrapper } = createWrapper('existing-seal');
            const navigation = createNavigation();

            render(
                <SplashScreen navigation={navigation as any} route={{} as any} />,
                { wrapper: Wrapper }
            );

            // Advance timer but SetupService hasn't resolved yet
            await act(async () => {
                jest.advanceTimersByTime(2000);
            });

            // Should not have navigated yet
            expect(mockNavigate).not.toHaveBeenCalled();

            // Now resolve SetupService
            await act(async () => {
                resolveSetup!(true);
            });

            // Advance timer again for next check
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('Core');
            });
        });

        it('retries checking readiness if not ready on first timeout', async () => {
            const SetupService = require('../../src/services').SetupService;
            let resolveSetup: (value: boolean) => void;
            SetupService.mockImplementationOnce(() =>
                new Promise((resolve) => {
                    resolveSetup = resolve;
                })
            );

            const { Wrapper } = createWrapper('existing-seal');
            const navigation = createNavigation();

            render(
                <SplashScreen navigation={navigation as any} route={{} as any} />,
                { wrapper: Wrapper }
            );

            // First timeout at 2000ms - not ready
            await act(async () => {
                jest.advanceTimersByTime(2000);
            });
            expect(mockNavigate).not.toHaveBeenCalled();

            // Resolve SetupService
            await act(async () => {
                resolveSetup!(true);
            });

            // Second timeout at 1000ms - now ready
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('Core');
            });
        });
    });
});
