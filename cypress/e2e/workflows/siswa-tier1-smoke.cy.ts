describe("WF-SISWA: Tier 1 Smoke", () => {
  function stubSiswaTier1Endpoints() {
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
            perusahaan: {
              id_perusahaan: "dudi-1",
              nama_perusahaan: "PT Astra Digital",
              latitude: -7.8105,
              longitude: 110.9137,
            },
          },
        ],
      },
    }).as("siswaPenempatanActive");

    cy.intercept("GET", "**/absensi?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_absensi: "abs-1",
            id_penempatan: "penempatan-aktif-1",
            tanggal: "2026-04-22T00:00:00.000Z",
            waktu_masuk: "2026-04-22T07:15:00.000Z",
            waktu_keluar: "2026-04-22T16:30:00.000Z",
            status_absensi: "hadir",
          },
        ],
      },
    }).as("siswaAbsensiList");

    cy.intercept("GET", "**/logbook?*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_logbook: "log-1",
            id_penempatan: "penempatan-aktif-1",
            tanggal: "2026-04-22T00:00:00.000Z",
            judul_kegiatan: "Belajar API",
            isi_kegiatan: "Mengerjakan integrasi endpoint dan testing dasar.",
            status_persetujuan: "menunggu",
          },
        ],
      },
    }).as("siswaLogbookList");
  }

  it("membuka halaman Absensi PKL", () => {
    stubSiswaTier1Endpoints();
    cy.seedSession("siswa");
    cy.visit("/siswa/absensi", {
      onBeforeLoad(win) {
        // Stabilkan flow geolocation untuk headless runner
        if (win.navigator?.geolocation?.getCurrentPosition) {
          // @ts-expect-error - Cypress test stub
          win.navigator.geolocation.getCurrentPosition = (success: any) => {
            success({ coords: { latitude: -7.8105, longitude: 110.9137 } });
          };
        }
      },
    });
    cy.contains("h1", "Absensi PKL").should("be.visible");
  });

  it("membuka halaman Logbook Harian", () => {
    stubSiswaTier1Endpoints();
    cy.seedSession("siswa");
    cy.visit("/siswa/logbook");
    cy.contains("h1", "Logbook Harian").should("be.visible");
  });
});

