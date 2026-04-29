import "./commands";

// Nuxt/Vite dev sometimes throws a transient dynamic import fetch error in Cypress runner
// even though the page continues to render. Ignore only this specific flake.
Cypress.on("uncaught:exception", (err) => {
  if (err?.message?.includes("ResizeObserver loop completed with undelivered notifications")) {
    return false;
  }

  if (
    err?.message?.includes("Failed to fetch dynamically imported module") &&
    err?.message?.includes("/_nuxt/@fs/")
  ) {
    return false;
  }
});
