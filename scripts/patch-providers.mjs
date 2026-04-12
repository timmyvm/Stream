import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const filePath = resolve("node_modules/@p-stream/providers/lib/index.js");

let content = readFileSync(filePath, "utf8");
let original = content;

// 1. Remove Turnstile gates from fedapi and fedapidb
const turnstileBlock =
  /let turnstileToken;\s*try \{\s*turnstileToken = await getTurnstileToken\("[^"]+"\);\s*\} catch \(error\) \{\s*(?:alert\("[^"]*"\);\s*)?(?:console\.error\("[^"]*"\);\s*)?throw new NotFoundError\(`[^`]+`\);\s*\}/g;
content = content.replace(turnstileBlock, 'const turnstileToken = "";');

// 2. Patch debrid scraper to use direct fetcher (bypasses proxy)
// getAddonStreams uses ctx.proxiedFetcher which routes through Cloudflare worker
// Real-Debrid/Torrentio block Cloudflare IPs — swap to ctx.fetcher
content = content.replace(
  /addonResponse = await ctx\.proxiedFetcher\(\s*`\$\{addonUrl\}\/stream\/series/g,
  "addonResponse = await ctx.fetcher(`${addonUrl}/stream/series"
);
content = content.replace(
  /addonResponse = await ctx\.proxiedFetcher\(`\$\{addonUrl\}\/stream\/movie/g,
  "addonResponse = await ctx.fetcher(`${addonUrl}/stream/movie"
);

if (content !== original) {
  writeFileSync(filePath, content, "utf8");
  console.log("✓ Patched @p-stream/providers: removed Turnstile gates, debrid uses direct fetcher");
} else {
  console.log("✓ @p-stream/providers already patched");
}
