describe("WF-GURU: Smoke", () => {
  it("membuka halaman Siswa Bimbingan", () => {
    cy.seedSession("guru");

    cy.visit("/guru/siswa-bimbingan");
    cy.wait("@guruPenempatan");
    cy.contains("h1", "Siswa Bimbingan").should("be.visible");
  });
});
