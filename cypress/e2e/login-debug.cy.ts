function toBase64Url(value: Record<string, unknown>) {
  return Cypress.Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createDebugJwt() {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = toBase64Url({ alg: "HS256", typ: "JWT" });
  const payload = toBase64Url({
    id: "auth-user-guru-debug",
    identifier: Cypress.env("seededGuruIdentifier"),
    role: "guru",
    entity_id: "guru-debug-1",
    entity_type: "guru",
    iat: nowInSeconds,
    exp: nowInSeconds + 60 * 60,
  });

  return `${header}.${payload}.debug-signature`;
}

function formatConsoleArgs(args: unknown[]) {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return JSON.stringify({
          name: arg.name,
          message: arg.message,
          stack: arg.stack,
          statusCode: (arg as Error & { statusCode?: number }).statusCode,
          statusMessage: (arg as Error & { statusMessage?: string }).statusMessage,
        });
      }

      if (typeof arg === "string") {
        return arg;
      }

      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" | ");
}

describe("login smoke debug", () => {
  it("login sebagai guru lalu redirect ke dashboard guru", () => {
    const apiUrl = Cypress.env("apiUrl");
    const accessToken = createDebugJwt();
    const seededGuruIdentifier = Cypress.env("seededGuruIdentifier");
    const seededGuruPassword = Cypress.env("seededGuruPassword");

    cy.clearAllCookies();
    cy.clearAllLocalStorage();

    cy.intercept("POST", `${apiUrl}/auth/login`, (req) => {
      expect(req.body).to.deep.equal({
        identifier: seededGuruIdentifier,
        password: seededGuruPassword,
      });

      req.reply({
        statusCode: 200,
        body: {
          success: true,
          message: "Login berhasil",
          data: {
            accessToken,
            refreshToken: "refresh-debug-token",
            user: {
              id: 1,
              role: "guru",
              entity_id: 1,
              entity_type: "guru",
              identifier: seededGuruIdentifier,
              nama: "Budi Santoso",
            },
          },
        },
      });
    }).as("loginRequest");

    cy.intercept("GET", `${apiUrl}/guru/me`, {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: {
          id_guru: "guru-debug-1",
          nip: seededGuruIdentifier,
          nama_guru: "Budi Santoso",
          email: "budi.santoso@smkn2wonogiri.sch.id",
          no_hp: "081234567890",
          status_aktif: true,
        },
      },
    }).as("guruProfile");

    cy.intercept("GET", `${apiUrl}/penempatan/guru/me*`, {
      statusCode: 200,
      body: {
        success: true,
        message: "Success",
        data: [
          {
            id_penempatan: "penempatan-aktif-1",
            status_penempatan: "aktif",
            stats: { kehadiran: 92 },
            siswa: {
              id_siswa: "siswa-1",
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
              { tanggal: "2026-04-20", status_absensi: "hadir" },
              { tanggal: "2026-04-21", status_absensi: "hadir" },
              { tanggal: "2026-04-22", status_absensi: "tidak_hadir" },
            ],
          },
          {
            id_penempatan: "penempatan-aktif-2",
            status_penempatan: "aktif",
            stats: { kehadiran: 78 },
            siswa: {
              id_siswa: "siswa-2",
              nama_siswa: "Nabila Putri",
              nis: "2601002",
              kelas: {
                nama_kelas: "XII TKJ 2",
              },
            },
            perusahaan: {
              id_perusahaan: "dudi-2",
              nama_perusahaan: "CV Solusi Nusantara",
            },
            absensi: [
              { tanggal: "2026-04-20", status_absensi: "hadir" },
              { tanggal: "2026-04-21", status_absensi: "tidak_hadir" },
              { tanggal: "2026-04-22", status_absensi: "hadir" },
            ],
          },
        ],
      },
    }).as("siswaBimbingan");

    cy.visit("/login", {
      onBeforeLoad(win) {
        const bootErrors: Array<{ message: string; source: string }> = [];
        const apiRequests: Array<{ transport: string; method: string; url: string }> = [];
        const originalConsoleError = win.console.error.bind(win.console);
        const originalConsoleWarn = win.console.warn.bind(win.console);
        const originalXhrOpen = win.XMLHttpRequest.prototype.open;
        const originalFetch = win.fetch.bind(win);

        win.XMLHttpRequest.prototype.open = function (
          method: string,
          url: string | URL,
          ...rest: any[]
        ) {
          apiRequests.push({
            transport: "xhr",
            method,
            url: String(url),
          });

          return originalXhrOpen.call(this, method, url, ...rest);
        };

        win.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
          apiRequests.push({
            transport: "fetch",
            method: init?.method || "GET",
            url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
          });

          return originalFetch(input, init);
        }) as typeof win.fetch;

        win.addEventListener("error", (event) => {
          bootErrors.push({
            message: event.message,
            source: event.filename || "window:error",
          });
        });

        win.addEventListener("unhandledrejection", (event) => {
          const reason = event.reason;
          bootErrors.push({
            message: reason instanceof Error ? reason.message : String(reason),
            source: "unhandledrejection",
          });
        });

        win.console.error = (...args) => {
          bootErrors.push({
            message: formatConsoleArgs(args),
            source: "console:error",
          });
          originalConsoleError(...args);
        };

        win.console.warn = (...args) => {
          bootErrors.push({
            message: formatConsoleArgs(args),
            source: "console:warn",
          });
          originalConsoleWarn(...args);
        };

        (win as typeof win & { __bootErrors?: typeof bootErrors }).__bootErrors = bootErrors;
        (win as typeof win & { __apiRequests?: typeof apiRequests }).__apiRequests = apiRequests;
      },
    });

    cy.window().its("__bootErrors").then((errors) => {
      expect(errors, JSON.stringify(errors)).to.deep.equal([]);
    });

    cy.get("#identifier").should("be.visible").clear().type(seededGuruIdentifier);
    cy.get("#password").should("be.visible").and("have.attr", "type", "password");
    cy.contains("button", "Sign in").should("be.enabled");
    cy.get('button[type="button"]').click();
    cy.get("#password").should("have.attr", "type", "text");
    cy.get('button[type="button"]').click();
    cy.get("#password").should("have.attr", "type", "password").clear().type(seededGuruPassword, {
      log: false,
    });
    cy.contains("button", "Sign in").click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
    cy.wait("@guruProfile").its("response.statusCode").should("eq", 200);
    cy.window().its("__apiRequests").then((requests) => {
      expect(
        requests.some((request: { url: string }) => request.url.includes("/penempatan/guru/me")),
        JSON.stringify(requests),
      ).to.equal(true);
    });
    cy.window().its("__bootErrors").then((errors) => {
      expect(errors, JSON.stringify(errors)).to.deep.equal([]);
    });
    cy.wait("@siswaBimbingan").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/guru");
    cy.contains("Dashboard Guru Aktif").should("be.visible");
    cy.contains("Budi Santoso").should("be.visible");
    cy.contains("PT Astra Digital").should("be.visible");
    cy.contains("CV Solusi Nusantara").should("be.visible");
  });
});
