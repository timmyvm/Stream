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

// 3. Replace parseStreamData with a client-side implementation.
// torrent-parse.pstream.mov has an invalid SSL cert and can't be reached from the browser.
// Torrentio stream titles contain quality/codec info we can parse locally.
// Title format examples:
//   "👤 25 💾 2.4 GB ⚙️ YTS\n1080p / AAC / x264"
//   "1080p\nBluRay REMUX | DDP 5.1 | x265"
//   "[4K] [HDR] [DV] Title\n👤 12 💾 50 GB"
const clientSideParser = `
async function parseStreamData(streams, ctx) {
  function parseTitle(title) {
    const t = (title || "").toLowerCase();
    // Resolution
    let resolution = "unknown";
    if (t.includes("2160p") || t.includes("4k") || t.includes("uhd")) resolution = "2160p";
    else if (t.includes("1080p") || t.includes("fhd")) resolution = "1080p";
    else if (t.includes("720p") || t.includes("hd")) resolution = "720p";
    else if (t.includes("480p")) resolution = "480p";
    else if (t.includes("360p")) resolution = "360p";
    // Container/codec
    let container = "mkv";
    if (t.includes("mp4") || t.includes("avc") || t.includes("x264") || t.includes("h264") || t.includes("h.264")) container = "mp4";
    // Audio
    let audio = "unknown";
    if (t.includes("aac")) audio = "aac";
    else if (t.includes("dts")) audio = "dts";
    else if (t.includes("dd") || t.includes("dolby") || t.includes("ac3") || t.includes("eac3") || t.includes("atmos")) audio = "dd";
    // Codec
    let codec = "h264";
    if (t.includes("x265") || t.includes("h265") || t.includes("h.265") || t.includes("hevc")) codec = "h265";
    return { resolution, container, audio, codec };
  }
  return streams.map((s) => {
    const parsed = parseTitle(s.title || s.name || "");
    return {
      ...s,
      resolution: parsed.resolution,
      container: parsed.container,
      audio: parsed.audio,
      codec: parsed.codec,
      complete: true,
    };
  });
}
`;

// Replace the async function parseStreamData(...) { return ctx.fetcher(...) } block
content = content.replace(
  /async function parseStreamData\(streams, ctx\) \{[\s\S]*?return ctx\.[a-zA-Z]+\("https:\/\/torrent-parse\.pstream\.mov"[\s\S]*?\}(?=\nasync function getCometStreams)/,
  clientSideParser
);

if (content !== original) {
  writeFileSync(filePath, content, "utf8");
  console.log("✓ Patched @p-stream/providers: Turnstile removed, debrid direct, parseStreamData client-side");
} else {
  console.log("✓ @p-stream/providers already patched");
}
