describe("WF-ADMIN: Tier 1 Smoke", () => {
  function stubAdminTier1Endpoints() {
    cy.intercept("GET", "**/periode-pkl?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_periode_pkl: "periode-1",
            nama_periode: "PKL Genap 2026",
            id_tahun_ajaran: "ta-1",
            tanggal_mulai: "2026-01-10",
            tanggal_selesai: "2026-06-10",
            status: "aktif",
            tahun_ajaran: { id_tahun_ajaran: "ta-1", nama_tahun_ajaran: "2025/2026" },
            _count: { penempatan: 1 },
            durasi_bulan: 6,
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("adminPeriodeList");

    cy.intercept("GET", "**/penempatan?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_penempatan: "penempatan-1",
            siswa_id: "siswa-1",
            perusahaan_id: "dudi-1",
            guru_pembimbing_id: "guru-1",
            tahun_ajaran_id: "ta-1",
            tanggal_mulai: "2026-01-10",
            tanggal_selesai: "2026-06-10",
            status_penempatan: "aktif",
            nomor_surat_pengantar: "SK-001/PKL/2026",
          },
        ],
        pagination: { page: 1, limit: 1000, total: 1, totalPages: 1 },
      },
    }).as("adminPlacementList");

    cy.intercept("GET", "**/siswa?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_siswa: "siswa-1",
            nis: "2601001",
            nama_siswa: "Ahmad Fauzan",
            id_kelas: "kelas-1",
            kelas: { id_kelas: "kelas-1", nama_kelas: "XII RPL 1", kode_tingkat: "XII" },
          },
        ],
        meta: { page: 1, limit: 1000, total: 1, totalPages: 1 },
      },
    }).as("adminSiswaOptions");

    cy.intercept("GET", "**/perusahaan?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_perusahaan: "dudi-1",
            nama_perusahaan: "PT Astra Digital",
            alamat: "Wonogiri",
            bidang_usaha: "IT & Software",
            status_kerjasama: true,
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("adminCompanyOptions");

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
            status_aktif: true,
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
        page: 1,
        limit: 100,
        total: 1,
      },
    }).as("adminGuruOptions");

    cy.intercept("GET", "**/tahun-ajaran*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_tahun_ajaran: "ta-1",
            nama_tahun_ajaran: "2025/2026",
            status_aktif: true,
          },
        ],
      },
    }).as("adminTahunAjaranOptions");

    cy.intercept("GET", "**/monitoring/stats?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: { total: 1, aktif: 1, selesai: 0, baik: 1, perhatian: 0, kritis: 0 },
      },
    }).as("adminMonitoringStats");

    cy.intercept("GET", "**/monitoring/siswa?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_penempatan: "penempatan-1",
            siswa: "Ahmad Fauzan",
            kelas: "XII RPL 1",
            jurusan: "RPL",
            perusahaan: "PT Astra Digital",
            bidang_usaha: "IT & Software",
            persentase_hadir: 92,
            total_logbook: 10,
            target_logbook: 12,
            persentase_logbook: 83,
            total_kunjungan: 1,
            status_monitoring: "baik",
            status_penempatan: "aktif",
          },
        ],
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("adminMonitoringList");

    cy.intercept("GET", "**/pengajuan?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_pengajuan: "pengajuan-1",
            id_siswa: "siswa-1",
            id_perusahaan: "dudi-1",
            id_tahun_ajaran: "ta-1",
            tanggal_pengajuan: "2026-04-23",
            status_pengajuan: "menunggu",
            siswa: { id_siswa: "siswa-1", nama_siswa: "Ahmad Fauzan", nis: "2601001", kelas: { nama_kelas: "XII RPL 1" } },
            perusahaan: { id_perusahaan: "dudi-1", nama_perusahaan: "PT Astra Digital" },
          },
        ],
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("adminPengajuanList");
  }

  it("membuka halaman Periode PKL", () => {
    stubAdminTier1Endpoints();
    cy.seedSession("admin");
    cy.visit("/admin/periode-pkl");
    cy.contains("h1", "Periode PKL").should("be.visible");
  });

  it("membuka halaman Penempatan PKL", () => {
    stubAdminTier1Endpoints();
    cy.seedSession("admin");
    cy.visit("/admin/placement");
    cy.contains("h1", "Penempatan PKL").should("be.visible");
  });

  it("membuka halaman Monitoring PKL", () => {
    stubAdminTier1Endpoints();
    cy.seedSession("admin");
    cy.visit("/admin/monitoring");
    cy.contains("h1", "Monitoring PKL").should("be.visible");
  });

  it("membuka halaman Verifikasi Pengajuan", () => {
    stubAdminTier1Endpoints();
    cy.seedSession("admin");
    cy.visit("/admin/verification");
    cy.contains("h1", "Verifikasi Pengajuan").should("be.visible");
  });
});

