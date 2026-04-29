describe("auth landing smoke batch", () => {
  it("dashboard admin bisa dibuka dari session admin", () => {
    cy.seedSession("admin");
    cy.visit("/admin");
    cy.contains("Admin Humas").should("be.visible");
  });

  it("dashboard tata usaha bisa dibuka dari session tata usaha", () => {
    cy.seedSession("tata_usaha");
    cy.visit("/tata-usaha");
    cy.contains("Tata Usaha").should("be.visible");
  });

  it("dashboard guru bisa dibuka dari session guru", () => {
    cy.seedSession("guru");
    cy.visit("/guru");
    cy.contains("Dashboard Guru Aktif").should("be.visible");
  });

  it("dashboard siswa bisa dibuka dari session siswa", () => {
    cy.seedSession("siswa");
    cy.visit("/siswa");
    cy.contains("Halo,").should("be.visible");
  });
});
