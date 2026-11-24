// Publishes each built site to its own GitHub Pages repository (branch main, folder / (root)), for every site in
// content/deploy.json (A, B, C and D):
//   dist/aparn-prototypeA  ->  github.com/<owner>/aparn-prototypeA  ->  https://<owner>.github.io/aparn-prototypeA/
//   ...and the same for B, C and D.
// Run `npm run build` first. Uses your normal git login (for example Git Credential Manager) and never prints credentials.
//   npm run deploy
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync, cpSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const deploy = JSON.parse(readFileSync(join(ROOT, "content", "deploy.json"), "utf8"));
const git = (cwd, ...args) => execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, GCM_INTERACTIVE: process.env.GCM_INTERACTIVE || "auto" } }).toString().trim();

for (const key of Object.keys(deploy.sites)) {
  const site = deploy.sites[key];
  const src = join(ROOT, "dist", site.repo);
  if (!existsSync(join(src, "index.html"))) throw new Error(`Build first: ${src} is missing.`);
  const remote = `https://github.com/${deploy.owner}/${site.repo}.git`;
  const work = mkdtempSync(join(tmpdir(), `${site.repo}-`));
  try {
    try { git(work, "clone", "--depth", "1", remote, "."); } catch { git(work, "init"); git(work, "remote", "add", "origin", remote); }
    for (const name of readdirSync(work)) if (name !== ".git") rmSync(join(work, name), { recursive: true, force: true });
    cpSync(src, work, { recursive: true });
    git(work, "add", "-A");
    if (!git(work, "status", "--porcelain")) { console.log(`${site.repo}: already up to date`); continue; }
    git(work, "commit", "-m", `Deploy ${site.name}, built ${new Date().toISOString().slice(0, 10)}`);
    git(work, "push", "origin", "HEAD:main");
    console.log(`${site.repo}: published to ${remote} (live at ${site.url} once GitHub Pages has built it)`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
