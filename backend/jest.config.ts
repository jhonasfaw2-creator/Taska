import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      diagnostics: false,
      isolatedModules: true,
      tsconfig: 'tsconfig.test.json',
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/*.d.ts',
    '!src/docs/**',
    '!src/__tests__/**',
    '!src/prisma/client.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: '<rootDir>/coverage',
  verbose: true,
  maxWorkers: 1,
};

export default config;
