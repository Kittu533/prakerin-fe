describe("auth login batch", () => {
  it("login admin redirect ke dashboard admin", () => {
    cy.loginAs("admin");
    cy.url().should("include", "/admin");
    cy.contains("Admin Humas").should("be.visible");
  });

  it("login tata usaha redirect ke dashboard tata usaha", () => {
    cy.loginAs("tata_usaha");
    cy.url().should("include", "/tata-usaha");
    cy.contains("Tata Usaha").should("be.visible");
  });

  it("login guru redirect ke dashboard guru", () => {
    cy.loginAs("guru");
    cy.url().should("include", "/guru");
    cy.contains("Dashboard Guru Aktif").should("be.visible");
  });

  it("login siswa redirect ke dashboard siswa", () => {
    cy.loginAs("siswa");
    cy.url().should("include", "/siswa");
    cy.contains("Halo,").should("be.visible");
  });
});
