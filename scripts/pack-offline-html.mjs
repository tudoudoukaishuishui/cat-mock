import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const outDir = join(root, "out");
const publicDir = join(root, "public");
const bundlePath = "/tmp/offline-app.js";

const built = spawnSync(
  join(root, "node_modules", ".bin", "esbuild"),
  [
    join(root, "src/offline/main.tsx"),
    "--bundle",
    "--format=iife",
    "--platform=browser",
    "--target=es2020",
    `--outfile=${bundlePath}`,
    `--alias:next/link=${join(root, "src/offline/shims/link.tsx")}`,
    `--alias:next/image=${join(root, "src/offline/shims/image.tsx")}`,
    `--alias:next/navigation=${join(root, "src/offline/shims/navigation.ts")}`,
    `--alias:@=${join(root, "src")}`,
    "--jsx=automatic",
    "--define:process.env.NODE_ENV=\"production\"",
    "--define:process.env.NEXT_PUBLIC_BASE_PATH=\"\"",
    "--minify",
    "--charset=utf8",
  ],
  { stdio: "inherit" },
);
if (built.status !== 0) process.exit(built.status ?? 1);

const js = readFileSync(bundlePath, "utf8");
let css = "";
for (const name of readdirSync(join(outDir, "_next/static/chunks"))) {
  if (name.endsWith(".css")) css += readFileSync(join(outDir, "_next/static/chunks", name), "utf8");
}
const mediaDir = join(outDir, "_next/static/media");

const text = js + css;
const codepoints = new Set();
for (const ch of text) codepoints.add(ch.codePointAt(0));
function covers(range) {
  return range.split(",").some((part) => {
    const value = part.trim().replace(/^U\+/i, "");
    if (value.includes("?")) {
      const lo = parseInt(value.replace(/\?/g, "0"), 16);
      const hi = parseInt(value.replace(/\?/g, "F"), 16);
      for (const cp of codepoints) if (cp >= lo && cp <= hi) return true;
      return false;
    }
    const [a, b] = value.split("-");
    const lo = parseInt(a, 16);
    const hi = b ? parseInt(b, 16) : lo;
    for (const cp of codepoints) if (cp >= lo && cp <= hi) return true;
    return false;
  });
}

const weightsByFile = new Map();
for (const block of css.match(/@font-face\{[^}]*\}/g) ?? []) {
  const file = block.match(/url\(\.\.\/media\/([^)]+)\)/)?.[1];
  const weight = Number(block.match(/font-weight:(\d+)/)?.[1]);
  if (!file || !weight) continue;
  const weights = weightsByFile.get(file) ?? [];
  weights.push(weight);
  weightsByFile.set(file, weights);
}
const emitted = new Set();
let kept = 0;
let dropped = 0;
css = css.replace(/@font-face\{[^}]*\}/g, (block) => {
  const file = block.match(/url\(\.\.\/media\/([^)]+)\)/)?.[1];
  if (!file || !weightsByFile.has(file)) return block;
  if (emitted.has(file)) return "";
  emitted.add(file);
  const weights = weightsByFile.get(file);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  return block.replace(/font-weight:\d+/, `font-weight:${min === max ? min : `${min} ${max}`}`);
});
const fontData = new Map();
css = css.replace(/@font-face\{[^}]*\}/g, (block) => {
  const range = block.match(/unicode-range:([^;}]+)/);
  if (range && !covers(range[1])) {
    dropped++;
    return "";
  }
  kept++;
  return block.replace(/url\(\.\.\/media\/([^)]+)\)/g, (_, name) => {
    if (!fontData.has(name)) fontData.set(name, readFileSync(join(mediaDir, name)).toString("base64"));
    return `url(data:font/woff2;base64,${fontData.get(name)})`;
  });
});

const images = {};
for (const name of readdirSync(join(publicDir, "images"))) {
  if (!/\.(jpg|jpeg|png|webp)$/.test(name)) continue;
  const type = name.endsWith(".png") ? "png" : name.endsWith(".webp") ? "webp" : "jpeg";
  images[`/images/${name}`] = `data:image/${type};base64,${readFileSync(join(publicDir, "images", name)).toString("base64")}`;
}

const indexHtml = readFileSync(join(outDir, "index.html"), "utf8");
const fontClass = indexHtml.match(/class="([^"]*noto_[^"]*)"/)?.[1] ?? "";

const html = `<!DOCTYPE html>
<html lang="zh-CN" class="${fontClass}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>超级猫咪</title>
  <style>${css}</style>
  <script>
    window.__CAT_IMAGES = ${JSON.stringify(images)};
    (function () {
      var map = window.__CAT_IMAGES;
      var desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
      Object.defineProperty(HTMLImageElement.prototype, "src", {
        configurable: true,
        enumerable: true,
        get: function () { return desc.get.call(this); },
        set: function (value) { desc.set.call(this, map[value] || value); }
      });
    })();
  </script>
</head>
<body class="flex min-h-full flex-col">
  <div id="root" class="flex min-h-full w-full flex-1 flex-col"></div>
  <script>${js}</script>
</body>
</html>
`;

const outFile = join(publicDir, "super-cat-standalone.html");
writeFileSync(outFile, html);
console.log(JSON.stringify({ outFile, fontsKept: kept, fontsDropped: dropped, images: Object.keys(images).length, bytes: Buffer.byteLength(html) }));
