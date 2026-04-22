import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const replacements = [
  {
    file: "node_modules/@vue/devtools-shared/dist/index.js",
    from: 'var isBrowser = typeof navigator !== "undefined";',
    to: 'var isBrowser = typeof window !== "undefined" && typeof document !== "undefined";',
  },
  {
    file: "node_modules/@vue/devtools-shared/dist/index.cjs",
    from: 'var isBrowser = typeof navigator !== "undefined";',
    to: 'var isBrowser = typeof window !== "undefined" && typeof document !== "undefined";',
  },
];

for (const replacement of replacements) {
  const filePath = resolve(process.cwd(), replacement.file);
  const source = await readFile(filePath, "utf8");

  if (source.includes(replacement.to)) {
    continue;
  }

  if (!source.includes(replacement.from)) {
    throw new Error(`Patch target not found in ${replacement.file}`);
  }

  await writeFile(filePath, source.replace(replacement.from, replacement.to), "utf8");
}
