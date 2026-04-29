describe("WF-TU: Smoke", () => {
  function stubTataUsahaWorkflowEndpoints() {
    cy.intercept("GET", "**/disposisi?*", {
      statusCode: 200,
      body: { success: true, message: "Success", data: [], page: 1, limit: 10, total: 0 },
    }).as("tuDisposisiList");

    cy.intercept("GET", "**/surat-masuk?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id: "sm-1",
            nomor_agenda: "AGD-001",
            nomor_surat: "SM-001",
            tanggal_surat: "2026-04-23",
            tanggal_diterima: "2026-04-23",
            asal_surat: "Dinas Pendidikan",
            perihal: "Undangan koordinasi",
            klasifikasi_surat: "Undangan",
            sifat_surat: "Penting",
            ditujukan_kepada: "Kepala Sekolah",
            status: "terkonfirmasi",
            created_at: "2026-04-23",
            updated_at: "2026-04-23",
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      },
    }).as("tuSuratMasukList");

    cy.intercept("GET", "**/guru?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_guru: "guru-1",
            nip: "198501012010011001",
            nama_guru: "Budi Santoso",
            email: "budi.santoso@example.test",
            no_hp: "081234567890",
            jabatan: "Wakasek",
          },
        ],
        page: 1,
        limit: 100,
        total: 1,
      },
    }).as("tuGuruList");
  }

  it("membuka halaman Disposisi", () => {
    stubTataUsahaWorkflowEndpoints();
    cy.seedSession("tata_usaha");

    cy.visit("/tata-usaha/disposisi");
    cy.wait("@tuDisposisiList");
    cy.wait("@tuSuratMasukList");
    cy.wait("@tuGuruList");
    cy.title().should("contain", "Disposisi | Tata Usaha");
  });

  it("membuka halaman Surat Masuk", () => {
    stubTataUsahaWorkflowEndpoints();
    cy.seedSession("tata_usaha");

    cy.visit("/tata-usaha/surat-masuk");
    cy.wait("@tuSuratMasukList");
    cy.contains("h2", "Surat Masuk").should("be.visible");
  });
});
