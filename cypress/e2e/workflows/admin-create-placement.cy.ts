describe("WF-ADMIN: Create Penempatan (Tier 1)", () => {
  it("membuat penempatan minimum lalu redirect ke list penempatan", () => {
    const activePeriode = {
      id_periode_pkl: "periode-aktif-1",
      nama_periode: "PKL Genap 2024/2025",
      id_tahun_ajaran: "ta-2024-2025",
      tanggal_mulai: "2025-01-10T00:00:00.000Z",
      tanggal_selesai: "2025-07-10T00:00:00.000Z",
      status: "aktif",
      tahun_ajaran: { id_tahun_ajaran: "ta-2024-2025", nama_tahun_ajaran: "2024/2025" },
      durasi_bulan: 6,
    };

    const jurusan = { id_jurusan: "jur-1", nama_jurusan: "RPL" };
    const kelas = { id_kelas: "kelas-12-rpl-1", nama_kelas: "XII RPL 1", id_jurusan: jurusan.id_jurusan };
    const siswa = {
      id_siswa: "siswa-1",
      nama_siswa: "Ahmad Fauzan",
      nis: "2601001",
      kelas: { id_kelas: kelas.id_kelas, nama_kelas: kelas.nama_kelas, jurusan: { nama_jurusan: jurusan.nama_jurusan } },
    };
    const perusahaan = { id_perusahaan: "dudi-1", nama_perusahaan: "PT Astra Digital" };
    const guru = { id_guru: "guru-1", nama_guru: "Budi Santoso" };

    const createdPenempatan = {
      id_penempatan: "penempatan-created-1",
      siswa_id: siswa.id_siswa,
      perusahaan_id: perusahaan.id_perusahaan,
      guru_pembimbing_id: guru.id_guru,
      tahun_ajaran_id: activePeriode.id_tahun_ajaran,
      tanggal_mulai: "2025-01-10",
      tanggal_selesai: "2025-07-10",
      status_penempatan: "aktif",
      siswa,
      perusahaan,
      guru,
    };

    // initial fetch: penempatan list for validation (existingPenempatan)
    let penempatanGetCount = 0;
    cy.intercept("GET", "**/penempatan?*", (req) => {
      penempatanGetCount += 1;
      req.alias = penempatanGetCount === 1 ? "penempatanInitial" : "penempatanAfterCreate";
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: "Success",
          data: penempatanGetCount === 1 ? [] : [createdPenempatan],
          meta: { page: 1, limit: 1000, total: penempatanGetCount === 1 ? 0 : 1, totalPages: 1 },
        },
      });
    });

    cy.intercept("GET", "**/periode-pkl?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [activePeriode],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("periodeList");

    cy.intercept("GET", "**/jurusan?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [jurusan],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("jurusanList");

    cy.intercept("GET", "**/kelas?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [kelas],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("kelasList");

    cy.intercept("GET", "**/perusahaan?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [perusahaan],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("perusahaanList");

    cy.intercept("GET", "**/guru?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [guru],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("guruList");

    cy.intercept("GET", /\/siswa\?.*$/, (req) => {
      if (req.url.includes("eligibility_status=siap")) {
        // request dari halaman create (filter siap + kelas)
        expect(req.url).to.include(`id_kelas=${encodeURIComponent(kelas.id_kelas)}`);

        req.alias = "siswaList";
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            message: "Success",
            data: [siswa],
            meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
          },
        });
        return;
      }

      // request lain (misal halaman list placement)
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: "Success",
          data: [],
          meta: { page: 1, limit: 1000, total: 0, totalPages: 1 },
        },
      });
    });

    cy.intercept("POST", "**/penempatan", (req) => {
      expect(req.body).to.include({
        siswa_id: siswa.id_siswa,
        perusahaan_id: perusahaan.id_perusahaan,
        guru_pembimbing_id: guru.id_guru,
        id_periode_pkl: activePeriode.id_periode_pkl,
      });
      expect(req.body.tanggal_mulai).to.eq("2025-01-10");
      expect(req.body.tanggal_selesai).to.eq("2025-07-10");

      req.reply({
        statusCode: 200,
        body: { success: true, message: "Success", data: createdPenempatan },
      });
    }).as("createPenempatan");

    cy.seedSession("admin");
    cy.visit("/admin/placement/create");
    cy.waitForHydration();

    cy.wait("@jurusanList");
    cy.wait("@kelasList");
    cy.wait("@perusahaanList");
    cy.wait("@guruList");
    cy.wait("@penempatanInitial");
    cy.wait("@periodeList");

    cy.contains("h1", "Input Manual Penempatan PKL").should("be.visible");

    // Periode sudah auto pilih aktif
    cy.contains(activePeriode.nama_periode).should("be.visible");

    // pilih jurusan
    cy.contains("Pilih jurusan").click();
    cy.contains(jurusan.nama_jurusan).click();

    // pilih kelas
    cy.contains("Pilih kelas").click();
    cy.contains(kelas.nama_kelas).click();
    cy.wait("@siswaList");

    // pilih siswa dari list
    cy.contains(siswa.nama_siswa).click();
    cy.contains("Siswa Terpilih").should("be.visible");

    // pilih perusahaan
    cy.contains("Pilih perusahaan").click();
    cy.contains(perusahaan.nama_perusahaan).click();

    // pilih guru
    cy.contains("Pilih guru pembimbing").click();
    cy.contains(guru.nama_guru).click();

    // pastikan tombol aktif lalu submit
    cy.contains("button", "Simpan Penempatan")
      .should("be.visible")
      .and("not.be.disabled")
      .click();

    cy.wait("@createPenempatan").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/admin/placement");
    cy.wait("@penempatanAfterCreate");
  });
});
