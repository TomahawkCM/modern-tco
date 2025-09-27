const nextJest = require("next/jest");

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Handle module path mapping (similar to tsconfig.json paths)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Configure test patterns - only run Jest tests within src/
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)",
    "<rootDir>/src/**/*.(test|spec).(ts|tsx|js)",
  ],

  // Ignore patterns
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Conservative worker configuration to prevent child process exceptions
  maxWorkers: 1, // Use single worker to prevent multi-process issues
  workerIdleMemoryLimit: "2GB", // Generous memory limit
  detectLeaks: false, // Disable leak detection to prevent worker issues
  forceExit: true, // Force Jest to exit when tests complete
  bail: 1, // Stop on first test failure to prevent cascading issues
  
  // Enhanced process isolation for Next.js 15.5.2 compatibility  
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,
  
  // Additional stability settings
  detectOpenHandles: true, // Detect handles that prevent Jest from exiting

  // Collect coverage from
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/**/*.stories.{ts,tsx}"],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Clear mocks between tests
  clearMocks: true,

  // Reduce verbosity to prevent worker overload
  verbose: false,
  
  // Additional timeout and retry settings for stability
  testTimeout: 30000, // 30 second timeout per test
  maxConcurrency: 2, // Limit concurrent test suites
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
