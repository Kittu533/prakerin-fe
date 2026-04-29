describe("WF-ADMIN: Master Smoke", () => {
  function stubAdminMasterEndpoints() {
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
            jenis_kelamin: "L",
            email: "ahmad.fauzan@example.test",
            no_hp: "081234567890",
            id_kelas: "kelas-1",
            kelas: {
              id_kelas: "kelas-1",
              nama_kelas: "XII RPL 1",
              kode_tingkat: "XII",
            },
          },
        ],
        meta: { page: 1, limit: 1000, total: 1, totalPages: 1 },
      },
    }).as("adminListSiswa");

    cy.intercept("GET", "**/kelas?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_kelas: "kelas-1",
            nama_kelas: "XII RPL 1",
            kode_tingkat: "XII",
            id_jurusan: "jur-1",
            id_tahun_ajaran: "ta-1",
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      },
    }).as("adminListKelas");

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
            jenis_kelamin: "L",
            status_aktif: true,
          },
        ],
        meta: { page: 1, limit: 1000, total: 1, totalPages: 1 },
        page: 1,
        limit: 1000,
        total: 1,
      },
    }).as("adminListGuru");

    cy.intercept("POST", "**/guru/sync-accounts", {
      statusCode: 200,
      body: { success: true, message: "Success", data: { processed: 0 } },
    }).as("adminSyncGuruAccounts");

    cy.intercept("GET", "**/perusahaan/stats?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: {
          total: 1,
          bidang: [{ label: "IT & Software", count: 1 }],
          provinsi: [{ label: "Jawa Tengah", count: 1 }],
          kota: [{ label: "Wonogiri", count: 1 }],
        },
      },
    }).as("adminPerusahaanStats");

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
            kabupaten_kota: "Wonogiri",
            provinsi: "Jawa Tengah",
            bidang_usaha: "IT & Software",
            kapasitas_siswa: 10,
            status_kerjasama: true,
            tahun_mulai_kerjasama: 2024,
            no_hp: "081234567890",
            email: "hr@astra-digital.example.test",
          },
        ],
        meta: { page: 1, limit: 1000, total: 1, totalPages: 1 },
      },
    }).as("adminListPerusahaan");
  }

  it("membuka Master Siswa", () => {
    stubAdminMasterEndpoints();
    cy.seedSession("admin");

    cy.visit("/admin/master/students");
    cy.contains("h1", "Data Siswa").should("be.visible");
  });

  it("membuka Master Guru", () => {
    stubAdminMasterEndpoints();
    cy.seedSession("admin");

    cy.visit("/admin/master/teachers");
    cy.contains("h1", "Guru Pembimbing").should("be.visible");
  });

  it("membuka Master Perusahaan", () => {
    stubAdminMasterEndpoints();
    cy.seedSession("admin");

    cy.visit("/admin/master/companies");
    cy.contains("h1", "Master Perusahaan").should("be.visible");
  });
});
