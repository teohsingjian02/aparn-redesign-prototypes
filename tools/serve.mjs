// A small static server for dist/ that behaves like GitHub Pages for project sites:
//   http://127.0.0.1:8137/aparn-prototypeA/   and   http://127.0.0.1:8137/aparn-prototypeB/
// Folders serve index.html, folder URLs without a trailing slash redirect, and unknown paths get the site's 404.html.
//   node tools/serve.mjs [port]
import { createServer } from "node:http";
import { existsSync, statSync, readFileSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf", ".md": "text/markdown; charset=utf-8",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".json": "application/json", ".txt": "text/plain; charset=utf-8",
};

export function serve(port = 8137) {
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let path;
    try { path = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end(); return; }
    const file = normalize(join(DIST, path));
    if (!file.startsWith(DIST.replace(/[\\/]$/, ""))) { res.writeHead(403).end(); return; }
    const send = (f, status = 200) => { res.writeHead(status, { "content-type": TYPES[extname(f)] || "application/octet-stream", "cache-control": "no-store" }); res.end(req.method === "HEAD" ? undefined : readFileSync(f)); };
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!path.endsWith("/")) { res.writeHead(301, { location: `${path}/${url.search}` }).end(); return; }
      if (existsSync(join(file, "index.html"))) return send(join(file, "index.html"));
    } else if (existsSync(file)) return send(file);
    const site = path.split("/").filter(Boolean)[0];
    const notFound = site && join(DIST, site, "404.html");
    if (notFound && existsSync(notFound)) return send(notFound, 404);
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.argv[2]) || 8137;
  serve(port).then(() => console.log(`serving dist/ at http://127.0.0.1:${port}/aparn-prototypeA/ and /aparn-prototypeB/`));
}
