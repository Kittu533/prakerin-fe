describe("auth role guard batch", () => {
  it("tata usaha tidak boleh mengakses halaman admin", () => {
    cy.seedSession("tata_usaha");
    cy.visit("/admin");
    cy.url().should("include", "/tata-usaha");
  });

  it("admin tidak boleh mengakses halaman tata usaha", () => {
    cy.seedSession("admin");
    cy.visit("/tata-usaha");
    cy.url().should("include", "/admin");
  });

  it("siswa tidak boleh mengakses halaman guru", () => {
    cy.seedSession("siswa");
    cy.visit("/guru");
    cy.url().should("include", "/siswa");
  });

  it("guru tidak boleh mengakses halaman admin", () => {
    cy.seedSession("guru");
    cy.visit("/admin");
    cy.url().should("include", "/guru");
  });
});
