import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("vue devtools kit does not crash when localStorage lacks getItem", () => {
  const script = `
    globalThis.localStorage = {};
    import("@vue/devtools-kit")
      .then(() => {
        console.log("ok");
      })
      .catch((error) => {
        console.error(error && error.stack ? error.stack : String(error));
        process.exit(1);
      });
  `;

  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ok/);
});
