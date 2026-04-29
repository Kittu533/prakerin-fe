describe("WF-SISWA: Create Logbook (Tier 1)", () => {
  function stubPenempatanAktif() {
    cy.intercept("GET", "**/penempatan?siswa_id=*&status_penempatan=aktif&limit=1", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_penempatan: "penempatan-aktif-1",
            id_siswa: "siswa-debug-1",
            id_perusahaan: "dudi-1",
            id_guru: "guru-1",
            id_tahun_ajaran: "ta-1",
            tanggal_mulai: "2026-01-10",
            tanggal_selesai: "2026-06-10",
            status_penempatan: "aktif",
          },
        ],
      },
    }).as("siswaPenempatanActive");
  }

  it("membuat logbook harian lalu redirect ke list logbook", () => {
    stubPenempatanAktif();

    const judul = "Belajar automation testing";
    const deskripsi =
      "Membuat test create logbook yang stabil dengan Cypress dan stub API.";

    cy.intercept("POST", "**/logbook", (req) => {
      expect(req.body).to.include({
        id_penempatan: "penempatan-aktif-1",
        judul_kegiatan: judul,
        isi_kegiatan: deskripsi,
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: "Logbook berhasil disimpan",
          data: {
            id_logbook: "log-created-1",
            id_penempatan: "penempatan-aktif-1",
            tanggal: "2026-04-23T00:00:00.000Z",
            judul_kegiatan: judul,
            isi_kegiatan: deskripsi,
            status_persetujuan: "menunggu",
          },
        },
      });
    }).as("createLogbook");

    cy.intercept("GET", "**/logbook?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_logbook: "log-created-1",
            id_penempatan: "penempatan-aktif-1",
            tanggal: "2026-04-23T00:00:00.000Z",
            judul_kegiatan: judul,
            isi_kegiatan: deskripsi,
            status_persetujuan: "menunggu",
          },
        ],
      },
    }).as("siswaLogbookList");

    cy.seedSession("siswa");
    cy.visit("/siswa/logbook/create");
    cy.waitForHydration();

    cy.contains("h1", "Tulis Logbook").should("be.visible");
    cy.get('textarea[placeholder*="Contoh"]').clear().type(judul);
    cy.get('textarea[placeholder*="Jelaskan detail"]').clear().type(deskripsi);

    cy.contains("button", "Simpan Logbook").click();
    cy.wait("@createLogbook").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/siswa/logbook");
    cy.contains("h1", "Logbook Harian").should("be.visible");
  });
});
