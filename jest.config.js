module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/testing/setup-tests.ts'],
  testMatch: ['<rootDir>/src/__tests__/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/index.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Добавляем последовательное выполнение тестов для избежания конфликтов в базе данных
  maxWorkers: 1,
  testTimeout: 30000,
};
