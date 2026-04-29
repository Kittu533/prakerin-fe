describe("WF-ADMIN: Create Periode PKL (Tier 1)", () => {
  it("membuka modal create dari route /admin/periode-pkl/create lalu membuat periode", () => {
    const tahunAjaranId = "ta-2024-2025";
    const tahunAjaranLabel = "2024/2025";

    const namaPeriode = "PKL Ganjil 2024/2025";

    const created = {
      id_periode_pkl: "periode-created-1",
      nama_periode: namaPeriode,
      id_tahun_ajaran: tahunAjaranId,
      tanggal_mulai: "2024-07-01T00:00:00.000Z",
      tanggal_selesai: "2025-06-30T00:00:00.000Z",
      status: "draft",
      tahun_ajaran: { id_tahun_ajaran: tahunAjaranId, nama_tahun_ajaran: tahunAjaranLabel },
    };

    let periodeListCallCount = 0;
    cy.intercept("GET", "**/periode-pkl?*", (req) => {
      periodeListCallCount += 1;

      if (periodeListCallCount === 1) {
        req.alias = "periodeList";
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            message: "Success",
            data: [],
            meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
          },
        });
        return;
      }

      req.alias = "periodeListAfterCreate";
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: "Success",
          data: [created],
          meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      });
    });

    cy.intercept("GET", "**/tahun-ajaran?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_tahun_ajaran: tahunAjaranId,
            nama_tahun_ajaran: tahunAjaranLabel,
            tanggal_mulai: "2024-07-01T00:00:00.000Z",
            tanggal_selesai: "2025-06-30T00:00:00.000Z",
            status_aktif: true,
          },
        ],
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("tahunAjaranList");

    cy.intercept("POST", "**/periode-pkl", (req) => {
      expect(req.body).to.include({
        nama_periode: namaPeriode,
        id_tahun_ajaran: tahunAjaranId,
        status: "draft",
      });
      expect(req.body.tanggal_mulai).to.match(/T/);
      expect(req.body.tanggal_selesai).to.match(/T/);

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: "Periode PKL berhasil dibuat",
          data: created,
        },
      });
    }).as("createPeriode");

    cy.seedSession("admin");
    cy.visit("/admin/periode-pkl/create");
    cy.waitForHydration();
    cy.wait("@periodeList");

    cy.contains("h1", "Periode PKL").should("exist");
    cy.contains("h2", "Tambah Periode PKL").should("be.visible");
    cy.wait("@tahunAjaranList");

    cy.get('input[placeholder*="PKL Ganjil"]').clear().type(namaPeriode);

    cy.contains("Pilih tahun ajaran").click();
    cy.contains(tahunAjaranLabel).click();

    // tanggal inputs (mulai, selesai)
    cy.get('input[type="date"]').eq(0).clear().type("2024-07-01");
    cy.get('input[type="date"]').eq(1).clear().type("2025-06-30");

    cy.contains("button", "Buat Periode").click();
    cy.wait("@createPeriode").its("response.statusCode").should("eq", 200);
    cy.wait("@periodeListAfterCreate");

    cy.contains("Tidak ada periode PKL").should("not.exist");
    cy.contains(namaPeriode).should("be.visible");
  });
});
