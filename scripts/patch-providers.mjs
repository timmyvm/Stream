import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const filePath = resolve("node_modules/@p-stream/providers/lib/index.js");

let content = readFileSync(filePath, "utf8");
const original = content;

// 1. Remove Turnstile gates from fedapi and fedapidb
const turnstileBlock =
  /let turnstileToken;\s*try \{\s*turnstileToken = await getTurnstileToken\("[^"]+"\);\s*\} catch \(error\) \{\s*(?:alert\("[^"]*"\);\s*)?(?:console\.error\("[^"]*"\);\s*)?throw new NotFoundError\(`[^`]+`\);\s*\}/g;
content = content.replace(turnstileBlock, 'const turnstileToken = "";');

// 2. Patch getAddonStreams to use ctx.fetcher (direct, not proxied)
// Torrentio/Comet block Cloudflare IPs — must go direct from browser
content = content.replace(
  /addonResponse = await ctx\.proxiedFetcher\(\s*`\$\{addonUrl\}\/stream\/series/g,
  "addonResponse = await ctx.fetcher(`${addonUrl}/stream/series"
);
content = content.replace(
  /addonResponse = await ctx\.proxiedFetcher\(`\$\{addonUrl\}\/stream\/movie/g,
  "addonResponse = await ctx.fetcher(`${addonUrl}/stream/movie"
);

// 3. Patch parseStreamData to use ctx.fetcher (torrent-parse.pstream.mov also blocks CF IPs)
content = content.replace(
  /return ctx\.proxiedFetcher\("https:\/\/torrent-parse\.pstream\.mov"/g,
  'return ctx.fetcher("https://torrent-parse.pstream.mov"'
);

if (content !== original) {
  writeFileSync(filePath, content, "utf8");
  console.log("✓ Patched @p-stream/providers: removed Turnstile gates, debrid uses direct fetcher");
} else {
  console.log("✓ @p-stream/providers already patched");
}
