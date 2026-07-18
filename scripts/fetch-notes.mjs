// Downloads the official Central Bank of Trinidad and Tobago polymer note
// images (front faces) into public/assets/money/ at build time, so the
// binary assets don't need to live in the deploy payload. Skips files that
// already exist.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "assets", "money");
mkdirSync(dir, { recursive: true });

const BASE = "https://www.central-bank.org.tt/wp-content/uploads/2024/09";

for (const d of [1, 5, 10, 20, 100]) {
  const file = join(dir, `tt-${d}-dollar-note.png`);
  if (existsSync(file)) continue;
  const url = `${BASE}/Trinidad-and-Tobago-${d}-dollar.png`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`fetched tt-${d}-dollar-note.png`);
}
