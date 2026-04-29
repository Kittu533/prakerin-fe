describe("WF-GURU: Tier 1 Smoke", () => {
  it("membuka halaman Absensi Siswa Bimbingan", () => {
    cy.seedSession("guru");
    cy.visit("/guru/absensi");
    cy.contains("h1", "Absensi Siswa Bimbingan").should("be.visible");
  });

  it("membuka halaman Verifikasi Logbook", () => {
    cy.seedSession("guru");
    cy.visit("/guru/verifikasi-logbook");
    cy.contains("h1", "Verifikasi Logbook").should("be.visible");
  });

  it("membuka halaman Riwayat Kunjungan", () => {
    cy.seedSession("guru");
    cy.visit("/guru/kunjungan");
    cy.contains("h1", "Riwayat Kunjungan").should("be.visible");
  });
});

