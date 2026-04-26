import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const adminRoot = dirname(scriptDir);
const distDir = join(adminRoot, "dist");

let projectRoot = adminRoot;
while (projectRoot !== dirname(projectRoot)) {
  if (existsSync(join(projectRoot, "build", "embed", "doc.go"))) {
    break;
  }
  projectRoot = dirname(projectRoot);
}

const embedDir = join(projectRoot, "build", "embed", "admin");

if (!existsSync(distDir)) {
  throw new Error(`frontend dist not found: ${distDir}`);
}
if (!existsSync(join(projectRoot, "build", "embed", "doc.go"))) {
  throw new Error("repository root with build/embed/doc.go was not found");
}

rmSync(embedDir, { recursive: true, force: true });
mkdirSync(embedDir, { recursive: true });
cpSync(distDir, embedDir, { recursive: true });
console.log(`Synced frontend assets to ${embedDir}`);
