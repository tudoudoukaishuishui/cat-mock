import puppeteer from "puppeteer-core";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const outDir = "/workspace/out";
const publicDir = "/workspace/public";
const origin = "http://127.0.0.1:8765/cat-mock";

function walk(dir, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === "_next" || name === "fonts") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "404" || name === "_not-found") continue;
      walk(full, found);
    } else if (name === "index.html") found.push(full);
  }
  return found;
}

function routeOf(file) {
  const rel = relative(outDir, file).replaceAll("\\", "/");
  const route = `/${rel.replace(/\/?index\.html$/, "")}`;
  return route === "/" ? "/" : route.replace(/\/$/, "");
}

const routes = walk(outDir).map(routeOf);

const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const pages = [];
for (const route of routes) {
  const url = `${origin}${route === "/" ? "/" : `${route}/`}`;
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => !document.body.innerText.includes("正在读取"), { timeout: 15000 }).catch(() => {});
  const data = await page.evaluate(() => ({
    htmlClass: document.documentElement.className,
    bodyClass: document.body.className,
    html: document.body.innerHTML,
  }));
  pages.push({ route, ...data });
  console.log(route, data.html.includes("正在读取") ? "still-loading" : "ready");
}
await browser.close();

const css = readdirSync(join(outDir, "_next/static/chunks"))
  .filter((name) => name.endsWith(".css"))
  .sort()
  .map((name) => readFileSync(join(outDir, "_next/static/chunks", name), "utf8"))
  .join("\n");
const usedFonts = new Set();
const inlinedCss = css.replace(/url\((['"]?)\.\.\/media\/([^'")]+)\1\)/g, (_match, quote, file) => {
  usedFonts.add(file);
  return `url(${quote}fonts/${file}${quote})`;
});
mkdirSync(join(publicDir, "fonts"), { recursive: true });
for (const file of usedFonts) {
  copyFileSync(join(outDir, "_next/static/media", file), join(publicDir, "fonts", file));
}

function rewrite(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/g, "")
    .replaceAll("/cat-mock/images/", "images/")
    .replaceAll('href="/cat-mock/', 'href="#/')
    .replaceAll('href="/', 'href="#/');
}

const ready = pages.map((item) => ({ ...item, html: rewrite(item.html) }));
const home = ready.find((item) => item.route === "/");
const templates = ready
  .map(
    (item) =>
      `<template data-route="${item.route}" data-html-class="${item.htmlClass.replaceAll('"', "&quot;")}" data-body-class="${item.bodyClass.replaceAll('"', "&quot;")}">${item.html}</template>`,
  )
  .join("\n");

const shell = `<!DOCTYPE html>
<html lang="zh-CN" class="${home.htmlClass}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>超级猫咪</title>
  <style>
    ${inlinedCss}
    #view { display: contents; }
  </style>
</head>
<body class="${home.bodyClass}">
  <div id="view">${home.html}</div>
  ${templates}
  <script>
    const view = document.getElementById("view");
    const templates = new Map([...document.querySelectorAll("template[data-route]")].map((node) => [node.dataset.route, node]));
    function normalize(href) {
      if (!href || /^(https?:|mailto:|tel:)/.test(href)) return null;
      let path = href.startsWith("#") ? href.slice(1) : href;
      path = path.split("#")[0].split("?")[0].replace(/^\\/cat-mock/, "");
      if (!path.startsWith("/")) path = "/" + path;
      if (path.length > 1) path = path.replace(/\\/$/, "");
      return templates.has(path) ? path : null;
    }
    function show(path) {
      const node = templates.get(path);
      if (!node) return;
      view.innerHTML = node.innerHTML;
      document.documentElement.className = node.dataset.htmlClass || "";
      document.body.className = node.dataset.bodyClass || "";
      window.scrollTo(0, 0);
    }
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const path = normalize(link.getAttribute("href"));
      if (!path) return;
      event.preventDefault();
      history.pushState(null, "", "#" + path);
      show(path);
    });
    window.addEventListener("popstate", () => {
      show(normalize(location.hash.slice(1) || "/") || "/");
    });
    show(normalize(location.hash.slice(1) || "/") || "/");
  </script>
</body>
</html>
`;

writeFileSync(join(publicDir, "super-cat.html"), shell);
console.log(`pages ${ready.length}, html ${(shell.length / 1024 / 1024).toFixed(2)} MB`);
