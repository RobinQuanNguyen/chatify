// Jest configuration for general tests (Arcjet will be disabled in this mode)
export default {
  testEnvironment: "node",
  clearMocks: true,
  testMatch: ["**/src/tests/*.test.js"],
};