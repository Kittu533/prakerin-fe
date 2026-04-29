describe("WF-GURU: Create Kunjungan (Tier 1)", () => {
  it("membuat kunjungan monitoring lalu redirect ke list kunjungan", () => {
    const tanggal = "2026-04-23";
    const hasil = "Observasi singkat kondisi siswa dan lingkungan kerja.";

    cy.intercept("POST", "**/monitoring", (req) => {
      expect(req.body).to.include({
        id_penempatan: "penempatan-aktif-1",
        tanggal_monitoring: tanggal,
      });
      expect(req.body.hasil_monitoring).to.contain("[Kondisi: baik]");
      expect(req.body.hasil_monitoring).to.contain(hasil);

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: "Kunjungan berhasil disimpan",
          data: {
            id_monitoring: "mon-1",
            id_penempatan: "penempatan-aktif-1",
            tanggal_monitoring: `${tanggal}T00:00:00.000Z`,
            hasil_monitoring: req.body.hasil_monitoring,
          },
        },
      });
    }).as("createMonitoring");

    cy.seedSession("guru");
    cy.visit("/guru/kunjungan/create");
    cy.waitForHydration();
    cy.wait("@guruPenempatan");

    cy.contains("h1", "Input Kunjungan").should("be.visible");

    // Select siswa (USelectMenu)
    cy.contains("Pilih siswa yang dikunjungi").click();
    cy.contains("Ahmad Fauzan").click();

    cy.get('input[type="date"]').clear().type(tanggal);
    cy.get('textarea[placeholder*="Tuliskan hasil observasi"]')
      .clear()
      .type(hasil);

    cy.contains("Sangat Baik").should("be.visible");
    cy.contains("span", /^Baik$/).click();

    cy.contains("button", "Simpan Kunjungan")
      .should("be.visible")
      .and("not.be.disabled")
      .click();

    cy.wait("@createMonitoring").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "/guru/kunjungan");
  });
});
