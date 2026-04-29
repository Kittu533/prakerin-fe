import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3101",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    apiUrl: process.env.CYPRESS_API_URL || "http://localhost:3000/api",
    seededGuruIdentifier: "198501012010011001",
    seededGuruPassword: "guru123",
  },
  viewportWidth: 1440,
  viewportHeight: 900,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
});
