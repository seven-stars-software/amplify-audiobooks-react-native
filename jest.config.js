module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^caches/(.*)$': '<rootDir>/src/caches/$1',
    '^stores/(.*)$': '<rootDir>/src/stores/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^navigators/(.*)$': '<rootDir>/src/navigators/$1',
    '^styler/(.*)$': '<rootDir>/src/styler/$1',
    '^@env$': '<rootDir>/__mocks__/@env.js',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^APIClient$': '<rootDir>/src/APIClient',
    '^URLs$': '<rootDir>/src/URLs',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|react-native-paper|react-native-vector-icons|react-native-safe-area-context|react-native-screens|expo.*|@expo.*)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/ios/',
    '<rootDir>/android/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  fakeTimers: {
    enableGlobally: true,
  },
};
