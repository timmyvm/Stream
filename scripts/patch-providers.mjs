import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const filePath = resolve(
  "node_modules/@p-stream/providers/lib/index.js",
);

let content = readFileSync(filePath, "utf8");
let changed = false;

const turnstileBlock =
  /let turnstileToken;\s*try \{\s*turnstileToken = await getTurnstileToken\("[^"]+"\);\s*\} catch \(error\) \{\s*(?:alert\("[^"]*"\);\s*)?(?:console\.error\("[^"]*"\);\s*)?throw new NotFoundError\(`[^`]+`\);\s*\}/g;

const patched = content.replace(turnstileBlock, 'const turnstileToken = "";');

if (patched !== content) {
  changed = true;
  content = patched;
}

if (changed) {
  writeFileSync(filePath, content, "utf8");
  console.log("✓ Patched @p-stream/providers: removed Turnstile gates");
} else {
  console.log("✓ @p-stream/providers already patched");
}
