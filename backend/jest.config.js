module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  passWithNoTests: true,
  globals: {
    'ts-jest': {
      tsconfig: { strict: false }
    }
  }
};
