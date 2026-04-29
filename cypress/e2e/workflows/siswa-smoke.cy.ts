describe("WF-SISWA: Smoke", () => {
  function stubSiswaWorkflowEndpoints() {
    cy.intercept("GET", "**/tahun-ajaran/active", {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: {
          id_tahun_ajaran: "ta-1",
          nama_tahun_ajaran: "2025/2026",
          status_aktif: true,
        },
      },
    }).as("siswaTahunAjaranActive");

    cy.intercept("GET", "**/penempatan?siswa_id=*&status_penempatan=aktif&limit=1", {
      statusCode: 200,
      body: { success: true, message: "Success", data: [] },
    }).as("siswaPenempatanQuery");

    cy.intercept("GET", "**/pengajuan/me", {
      statusCode: 200,
      body: { success: true, message: "Success", data: null },
    }).as("siswaPengajuanMe");

    cy.intercept("GET", "**/perusahaan?*status_kerjasama=true*", {
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
            kapasitas_siswa: 10,
            siswa_diterima: 2,
            status_kerjasama: true,
          },
        ],
      },
    }).as("siswaMitraCompanies");
  }

  it("membuka halaman Status PKL", () => {
    stubSiswaWorkflowEndpoints();
    cy.seedSession("siswa");

    cy.visit("/siswa/internship");
    cy.wait("@siswaTahunAjaranActive");
    cy.wait("@siswaPengajuanMe");
    cy.wait("@siswaMitraCompanies");
    cy.contains("h1", "Status PKL").should("be.visible");
  });
});

