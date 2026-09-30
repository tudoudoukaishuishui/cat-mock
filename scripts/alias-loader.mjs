import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = new URL("../src/", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
  const base = fileURLToPath(new URL(specifier.slice(2), root));
  const candidates = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`];
  const file = candidates.find((candidate) => existsSync(candidate));
  if (!file) return nextResolve(specifier, context);
  return nextResolve(pathToFileURL(file).href, context);
}
