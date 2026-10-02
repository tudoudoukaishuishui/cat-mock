import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDir = process.argv[2] ?? "/workspace/public";
const outFile = process.argv[3] ?? join(publicDir, "super-cat-standalone.html");
let html = readFileSync(join(publicDir, "super-cat.html"), "utf8");

const text = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "");
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

// Next emits one rule per weight for the same variable woff2; merge them so each file is embedded once.
const weightsByFile = new Map();
for (const block of html.match(/@font-face\{[^}]*\}/g) ?? []) {
  const file = block.match(/url\(fonts\/([^)]+)\)/)?.[1];
  const weight = Number(block.match(/font-weight:(\d+)/)?.[1]);
  if (!file || !weight) continue;
  const weights = weightsByFile.get(file) ?? [];
  weights.push(weight);
  weightsByFile.set(file, weights);
}
const emitted = new Set();
html = html.replace(/@font-face\{[^}]*\}/g, (block) => {
  const file = block.match(/url\(fonts\/([^)]+)\)/)?.[1];
  if (!file || !weightsByFile.has(file)) return block;
  if (emitted.has(file)) return "";
  emitted.add(file);
  const weights = weightsByFile.get(file);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  return block.replace(/font-weight:\d+/, `font-weight:${min === max ? min : `${min} ${max}`}`);
});

let kept = 0;
let dropped = 0;
html = html.replace(/@font-face\{[^}]*\}/g, (block) => {
  const range = block.match(/unicode-range:([^;}]+)/);
  if (range && !covers(range[1])) {
    dropped++;
    return "";
  }
  kept++;
  return block.replace(/url\(fonts\/([^)]+)\)/g, (_, name) => {
    const data = readFileSync(join(publicDir, "fonts", name)).toString("base64");
    return `url(data:font/woff2;base64,${data})`;
  });
});

const imageCache = new Map();
html = html.replace(/src="images\/([\w.-]+\.(?:jpg|jpeg|png|webp))"/g, (_, name) => {
  if (!imageCache.has(name)) {
    const type = name.endsWith(".png") ? "png" : name.endsWith(".webp") ? "webp" : "jpeg";
    imageCache.set(name, `data:image/${type};base64,${readFileSync(join(publicDir, "images", name)).toString("base64")}`);
  }
  return `data-cat-img="${name}"`;
});

// Each picture is stored once; templates only carry its name so 32 pages do not repeat the bytes.
const imageScript = `<script>
    const catImages = ${JSON.stringify(Object.fromEntries(imageCache))};
    function fillImages(root) {
      root.querySelectorAll("img[data-cat-img]").forEach((img) => {
        img.src = catImages[img.dataset.catImg];
      });
    }
  </script>
  `;
const navStart = html.lastIndexOf("<script>");
html = html.slice(0, navStart) + imageScript + html.slice(navStart);
html = html.replace(
  "view.innerHTML = node.innerHTML;",
  "view.innerHTML = node.innerHTML;\n      fillImages(view);",
);
if (!html.includes("fillImages(view);")) throw new Error("navigation script changed; image fill hook not found");

writeFileSync(outFile, html);
console.log(JSON.stringify({ outFile, fontsKept: kept, fontsDropped: dropped, images: imageCache.size, bytes: Buffer.byteLength(html) }));
