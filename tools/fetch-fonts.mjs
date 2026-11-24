// Downloads the open-licence (SIL OFL) web fonts used by the two concepts from Google Fonts and writes a local
// @font-face stylesheet, so the demos make no third-party font requests. Only the latin and latin-ext subsets are kept.
// Usage: node tools/fetch-fonts.mjs [family ...]
import { writeFileSync, mkdirSync } from "node:fs";
const OUT = new URL("../static/fonts/", import.meta.url);
mkdirSync(OUT, { recursive: true });
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const FAMILIES = {
  "newsreader": "family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700",
  "work-sans": "family=Work+Sans:wght@400..700",
  "archivo": "family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900",
  "roboto": "family=Roboto:ital,wght@0,300..700;1,300..700",
};
const only = process.argv.slice(2); // optional: fetch only the named families
for (const [name, q] of Object.entries(FAMILIES)) {
  if (only.length && !only.includes(name)) continue;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${q}&display=swap`, { headers: { "User-Agent": UA } })).text();
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*{[^}]+})/g)].filter((m) => m[1] === "latin" || m[1] === "latin-ext");
  let out = `/* ${name}: SIL Open Font License 1.1, via Google Fonts; subsets latin + latin-ext */\n`;
  let n = 0;
  for (const [, subset, block] of blocks) {
    const url = block.match(/url\((https:[^)]+)\)/)[1];
    const style = (block.match(/font-style:\s*(\w+)/) || [, "normal"])[1];
    const file = `${name}-${style}-${subset}-${n++}.woff2`;
    const buf = Buffer.from(await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer());
    writeFileSync(new URL(file, OUT), buf);
    out += block.replace(url, file) + "\n";
  }
  writeFileSync(new URL(`${name}.css`, OUT), out);
  console.log(name, n, "files");
}
