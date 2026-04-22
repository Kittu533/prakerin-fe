import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));

const targets = [
  "app/composables/api/use-surat-kesiswaan.ts",
  "app/composables/pages/tata-usaha/use-surat-kesiswaan-page.ts",
  "app/pages/tata-usaha/surat-keluar/index.vue",
  "app/pages/tata-usaha/surat-masuk/index.vue",
  "app/pages/admin/mitra/mou/index.vue",
  "app/composables/api/use-partner.ts",
  "app/composables/api/use-internship.ts",
  "app/composables/api/use-siswa.ts",
];


const legacyAliasPatterns = [
  /\bfile_docx\b/,
  /\bfile_pdf\b/,
  /\bdocx_url\b/,
  /\bpdf_url\b/,
  /\burl_docx\b/,
  /\burl_pdf\b/,
  /\bgenerated_docx\b/,
  /\bgenerated_pdf\b/,
];

test("frontend canonical file contract has no legacy alias probing", async () => {
  for (const relativePath of targets) {
    const absolutePath = path.join(rootDir, relativePath);
    const content = await fs.readFile(absolutePath, "utf8");

    for (const pattern of legacyAliasPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `Legacy alias ${pattern} still found in ${relativePath}`,
      );
    }
  }
});
