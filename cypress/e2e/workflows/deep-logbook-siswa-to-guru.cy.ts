describe("DEEP-003: Siswa create logbook -> Guru verifikasi logbook", () => {
  it("siswa membuat logbook lalu guru menyetujui logbook", () => {
    const judul = "Belajar verifikasi logbook";
    const deskripsi =
      "Menguji alur deep: siswa submit logbook, guru melihat dan menyetujui.";

    // =========================
    // Part 1: Siswa create logbook
    // =========================
    cy.intercept(
      "GET",
      /\/penempatan\?.*siswa_id=.*(&|$).*aktif.*(&|$).*/i,
      {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_penempatan: "penempatan-aktif-1",
            id_siswa: "siswa-debug-1",
            status_penempatan: "aktif",
          },
        ],
      },
      },
    ).as("siswaPenempatanActive");

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
            jam_mulai: "08:00",
            jam_selesai: "16:00",
            judul_kegiatan: judul,
            isi_kegiatan: deskripsi,
            status_persetujuan: "menunggu",
            catatan_pembimbing: "",
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
            jam_mulai: "08:00",
            jam_selesai: "16:00",
            judul_kegiatan: judul,
            isi_kegiatan: deskripsi,
            status_persetujuan: "menunggu",
            catatan_pembimbing: "",
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("siswaLogbookList");

    cy.seedSession("siswa");
    cy.visit("/siswa/logbook/create");
    cy.waitForHydration();
    cy.wait("@siswaPenempatanActive");

    cy.contains("h1", "Tulis Logbook").should("be.visible");
    cy.get('textarea[placeholder*="Contoh"]').clear().type(judul);
    cy.get('textarea[placeholder*="Jelaskan detail"]').clear().type(deskripsi);
    cy.contains("button", "Simpan Logbook").click();
    cy.wait("@createLogbook").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "/siswa/logbook");

    // =========================
    // Part 2: Guru verifikasi logbook
    // =========================
    cy.intercept("GET", "**/logbook?*id_penempatan=penempatan-aktif-1*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_logbook: "log-created-1",
            id_penempatan: "penempatan-aktif-1",
            tanggal: "2026-04-23T00:00:00.000Z",
            jam_mulai: "08:00",
            jam_selesai: "16:00",
            judul_kegiatan: judul,
            isi_kegiatan: deskripsi,
            status_persetujuan: "menunggu",
            catatan_pembimbing: "",
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("guruLogbookList");

    cy.intercept("POST", "**/logbook/log-created-1/review", (req) => {
      expect(req.body).to.include({ status_persetujuan: "disetujui" });
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: "Logbook disetujui",
          data: {
            id_logbook: "log-created-1",
            status_persetujuan: "disetujui",
          },
        },
      });
    }).as("approveLogbook");

    cy.seedSession("guru");
    cy.visit("/guru/verifikasi-logbook");
    cy.waitForHydration();
    cy.wait("@guruPenempatan");

    cy.contains("h1", "Verifikasi Logbook").should("be.visible");
    cy.contains("p", "Klik untuk melihat logbook siswa").should("be.visible");

    cy.contains("div", "Ahmad Fauzan").click();
    cy.wait("@guruLogbookList");

    cy.contains("h1", "Logbook Ahmad Fauzan").should("be.visible");

    // approve pending item
    cy.contains("td", judul)
      .parents("tr")
      .within(() => {
        cy.get("button").first().click();
      });
    cy.wait("@approveLogbook").its("response.statusCode").should("eq", 200);

    cy.contains("Logbook disetujui").should("be.visible");
    cy.contains("td", judul)
      .parents("tr")
      .within(() => {
        cy.contains("Disetujui").should("be.visible");
      });
  });
});
