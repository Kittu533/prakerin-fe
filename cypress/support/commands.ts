/// <reference types="cypress" />

type TestRole = "admin" | "tata_usaha" | "guru" | "siswa";

type RoleConfig = {
  identifier: string;
  password: string;
  dashboardPath: string;
  entityId: string;
  entityType: TestRole;
  name: string;
};

const API_URL = Cypress.env("apiUrl") || "http://localhost:3000/api";

const roleConfigs: Record<TestRole, RoleConfig> = {
  admin: {
    identifier: "admin",
    password: "admin123",
    dashboardPath: "/admin",
    entityId: "ADMIN-SYSTEM-DEFAULT",
    entityType: "admin",
    name: "Admin Humas",
  },
  tata_usaha: {
    identifier: "199001012020121001",
    password: "tatausaha123",
    dashboardPath: "/tata-usaha",
    entityId: "TU-DEFAULT-1",
    entityType: "tata_usaha",
    name: "Tata Usaha",
  },
  guru: {
    identifier: Cypress.env("seededGuruIdentifier") || "198501012010011001",
    password: Cypress.env("seededGuruPassword") || "guru123",
    dashboardPath: "/guru",
    entityId: "guru-debug-1",
    entityType: "guru",
    name: "Budi Santoso",
  },
  siswa: {
    identifier: "2601001",
    password: "2601001",
    dashboardPath: "/siswa",
    entityId: "siswa-debug-1",
    entityType: "siswa",
    name: "Ahmad Fauzan",
  },
};

function toBase64Url(value: Record<string, unknown>) {
  return Cypress.Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createDebugJwt(role: TestRole) {
  const config = roleConfigs[role];
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = toBase64Url({ alg: "HS256", typ: "JWT" });
  const payload = toBase64Url({
    id: `auth-${role}-debug`,
    identifier: config.identifier,
    role,
    entity_id: config.entityId,
    entity_type: config.entityType,
    iat: nowInSeconds,
    exp: nowInSeconds + 60 * 60,
  });

  return `${header}.${payload}.debug-signature`;
}

function getProfile(role: TestRole) {
  const config = roleConfigs[role];

  return {
    id: config.entityId,
    entity_id: config.entityId,
    entity_type: config.entityType,
    identifier: config.identifier,
    role,
    name: config.name,
    email: `${role}@example.test`,
  };
}

function stubAdminDashboard() {
  cy.intercept("GET", "**/dashboard/stats", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        total_siswa: 120,
        total_pengajuan_pending: 8,
        total_penempatan_aktif: 57,
        total_penempatan_selesai: 40,
        total_perusahaan: 20,
        total_guru: 11,
        masalah_absensi: 0,
      },
    },
  }).as("adminStats");

  cy.intercept("GET", "**/dashboard/penempatan-per-jurusan", {
    statusCode: 200,
    body: {
      success: true,
      data: [
        { jurusan: "RPL", total: 20, persentase: 40 },
        { jurusan: "TKJ", total: 15, persentase: 30 },
        { jurusan: "AKL", total: 15, persentase: 30 },
      ],
    },
  }).as("adminPlacement");

  cy.intercept("GET", "**/dashboard/trend-pengajuan", {
    statusCode: 200,
    body: {
      success: true,
      data: [
        { bulan: "Jan", pengajuan: 4, diterima: 3 },
        { bulan: "Feb", pengajuan: 6, diterima: 5 },
        { bulan: "Mar", pengajuan: 5, diterima: 4 },
      ],
    },
  }).as("adminTrend");

  cy.intercept("GET", "**/dashboard/status-siswa", {
    statusCode: 200,
    body: {
      success: true,
      data: [
        { status: "Siap", total: 60 },
        { status: "Sedang PKL", total: 40 },
        { status: "Belum Siap", total: 20 },
      ],
    },
  }).as("adminStatusSiswa");

  cy.intercept("GET", "**/dashboard/recent-pengajuan*", {
    statusCode: 200,
    body: {
      success: true,
      data: [
        {
          id: 1,
          siswa: "Ahmad Fauzan",
          jurusan: "RPL",
          perusahaan: "PT Astra Digital",
          tanggal: "2026-04-23",
          status: "Menunggu",
        },
      ],
    },
  }).as("adminRecentPengajuan");
}

function stubTataUsahaDashboard() {
  cy.intercept("GET", "**/tu/dashboard/stats", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        statistik: {
          surat_masuk_hari_ini: 3,
          surat_keluar_hari_ini: 2,
          disposisi_belum_selesai: 1,
          surat_kesiswaan_bulan_ini: 4,
        },
        surat_masuk_terbaru: [
          {
            id: 1,
            nomor_agenda: "AGD-001",
            nomor_surat: "SM-001",
            tanggal_surat: "2026-04-23",
            asal_surat: "Dinas Pendidikan",
            perihal: "Undangan koordinasi",
            status: "terkonfirmasi",
          },
        ],
        disposisi_mendatang: [
          {
            id: 1,
            nomor_surat: "SM-001",
            perihal: "Undangan koordinasi",
            batas_waktu: "2026-04-25",
            prioritas: "tinggi",
            status: "baru",
          },
        ],
      },
    },
  }).as("tuDashboardStats");
}

function stubGuruDashboard() {
  cy.intercept("GET", "**/penempatan/guru/me*", {
    statusCode: 200,
    body: {
      success: true,
      data: [
        {
          id_penempatan: "penempatan-aktif-1",
          status_penempatan: "aktif",
          stats: { kehadiran: 92 },
          siswa: {
            id_siswa: "siswa-debug-1",
            nama_siswa: "Ahmad Fauzan",
            nis: "2601001",
            kelas: {
              nama_kelas: "XII RPL 1",
            },
          },
          perusahaan: {
            id_perusahaan: "dudi-1",
            nama_perusahaan: "PT Astra Digital",
          },
          absensi: [
            { tanggal: "2026-04-21", status_absensi: "hadir" },
            { tanggal: "2026-04-22", status_absensi: "hadir" },
          ],
          logbook: [
            { status_persetujuan: "disetujui" },
            { status_persetujuan: "menunggu" },
          ],
          monitoring: [{ tanggal_monitoring: "2026-04-22" }],
        },
      ],
    },
  }).as("guruPenempatan");
}

function stubSiswaDashboard() {
  cy.intercept("GET", "**/siswa/me", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        id_siswa: "siswa-debug-1",
        nama_siswa: "Ahmad Fauzan",
        nis: "2601001",
        kelas: {
          nama_kelas: "XII RPL 1",
        },
      },
    },
  }).as("siswaProfile");

  cy.intercept("GET", "**/penempatan/me", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        id_penempatan: "penempatan-aktif-1",
        tanggal_mulai: "2026-01-10",
        tanggal_selesai: "2026-06-10",
        perusahaan: {
          nama_perusahaan: "PT Astra Digital",
          alamat: "Wonogiri",
          mentor: [{ nama_mentor: "Raka Pratama" }],
        },
        guru: {
          nama_guru: "Budi Santoso",
          no_hp: "081234567890",
          email: "budi.santoso@example.test",
        },
        absensi: [
          { tanggal: "2026-04-21", status_absensi: "hadir", jam_masuk: "07:15" },
          { tanggal: "2026-04-22", status_absensi: "hadir", jam_masuk: "07:18" },
        ],
        logbook: [
          { status_persetujuan: "disetujui" },
          { status_persetujuan: "menunggu" },
        ],
      },
    },
  }).as("siswaPenempatan");
}

function setAuthCookies(role: TestRole) {
  const config = roleConfigs[role];
  const token = createDebugJwt(role);
  const profile = getProfile(role);
  const authUser = {
    id: config.entityId,
    identifier: config.identifier,
    nama: config.name,
    role,
  };

  cy.setCookie("token", token);
  cy.setCookie("profile", JSON.stringify(profile));
  cy.setCookie("auth_user", JSON.stringify(authUser));
  cy.window().then((win) => {
    win.localStorage.setItem("token", token);
    win.localStorage.setItem("profile", JSON.stringify(profile));
  });
}

Cypress.Commands.add("stubDashboard", (role: TestRole) => {
  if (role === "admin") {
    stubAdminDashboard();
    return;
  }

  if (role === "tata_usaha") {
    stubTataUsahaDashboard();
    return;
  }

  if (role === "guru") {
    stubGuruDashboard();
    return;
  }

  stubSiswaDashboard();
});

Cypress.Commands.add("seedSession", (role: TestRole) => {
  cy.stubDashboard(role);
  cy.visit("/");
  setAuthCookies(role);
});

Cypress.Commands.add("waitForHydration", () => {
  cy.get('html[data-hydrated="true"]').should("exist");
});

Cypress.Commands.add("loginAs", (role: TestRole) => {
  const config = roleConfigs[role];
  const token = createDebugJwt(role);
  const profile = getProfile(role);

  cy.stubDashboard(role);
  cy.intercept("POST", "**/auth/login", {
    statusCode: 200,
    body: {
      success: true,
      message: "Login berhasil",
      data: {
        accessToken: token,
        refreshToken: `refresh-${role}-debug`,
        user: profile,
      },
    },
  }).as(`login-${role}`);

  cy.visit("/login");
  cy.waitForHydration();
  cy.get("#identifier")
    .should("be.visible")
    .and("not.be.disabled")
    .clear()
    .type(config.identifier);
  cy.get("#password")
    .should("be.visible")
    .and("not.be.disabled")
    .clear()
    .type(config.password, { log: false });
  cy.get('button[type="submit"]').should("be.visible").and("not.be.disabled").click();
  cy.wait(`@login-${role}`).its("response.statusCode").should("eq", 200);
  cy.url().should("include", config.dashboardPath);
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: TestRole): Chainable<void>;
      seedSession(role: TestRole): Chainable<void>;
      stubDashboard(role: TestRole): Chainable<void>;
      waitForHydration(): Chainable<void>;
    }
  }
}

export {};
