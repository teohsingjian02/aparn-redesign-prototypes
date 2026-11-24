// Builds the four prototypes as independent static sites, each published to its own GitHub Pages repository:
//   dist/aparn-prototypeA/   Concept A: Editorial Gallery
//   dist/aparn-prototypeB/   Concept B: Living Network
//   dist/aparn-prototypeC/   Concept C: Clear Signal
//   dist/aparn-prototypeD/   Concept D: Monochrome
// It also writes COMPARISON.md, PROPOSAL.md and SOURCES.md from the content files, then checks every page:
// links and anchors resolve, the required wording is present, noindex is set, and there are no em dashes.
//   node src/build.mjs
import { mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent, esc, assertNoEmDash, STATUS } from "./lib.mjs";
import { buildPages as buildA } from "./concept-a/pages.mjs";
import { buildPages as buildB } from "./concept-b/pages.mjs";
import { buildPages as buildC } from "./concept-c/pages.mjs";
import { buildPages as buildD } from "./concept-d/pages.mjs";

const ROOT_URL = new URL("../", import.meta.url);
const ROOT = fileURLToPath(ROOT_URL);
const STATIC = join(ROOT, "static");
const DIST = join(ROOT, "dist");
const SHOTS = join(ROOT, "screenshots");
const c = loadContent(ROOT_URL);
const h = JSON.parse(readFileSync(join(ROOT, "content", "handover.json"), "utf8"));
const D = c.deploy;
const T = c.template;

const ICONS = {
  c: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#FFFFFF"/><path d="M17 46 32 18l15 28" fill="none" stroke="#0A0F1C" stroke-width="3"/><circle cx="32" cy="18" r="7" fill="#002FA7"/><circle cx="17" cy="46" r="6.5" fill="#0A0F1C"/><circle cx="47" cy="46" r="6.5" fill="#0A0F1C"/></svg>`,
  a: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#F4EFE6"/><circle cx="45" cy="21" r="6" fill="#A3341C"/><path d="M8 44h48" stroke="#1C1A17" stroke-width="2.5"/><path d="M12 44c3-9 10-9 13 0zM27 44c4-14 13-14 17 0zM46 44c2-6 7-6 9 0z" fill="#1C1A17"/></svg>`,
  b: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#121212"/><path d="M17 47 32 17l15 30" fill="none" stroke="#E9A920" stroke-width="3"/><circle cx="32" cy="17" r="7" fill="#E9A920"/><circle cx="17" cy="47" r="7" fill="#0F7B5F"/><circle cx="47" cy="47" r="7" fill="#C8361F"/></svg>`,
};
const SITES = [
  { key: "a", ...D.sites.a, other: D.sites.b, build: buildA, css: "src/concept-a/a.css", cssName: "a.css", fonts: ["newsreader", "work-sans"] },
  { key: "b", ...D.sites.b, other: D.sites.a, build: buildB, css: "src/concept-b/b.css", cssName: "b.css", fonts: ["archivo"] },
  { key: "c", ...D.sites.c, other: D.sites.a, build: buildC, css: "src/concept-c/c.css", cssName: "c.css", fonts: ["roboto"], js: "src/concept-c/c.js" },
  { key: "d", ...D.sites.d, other: D.sites.a, build: buildD, css: "src/concept-d/d.css", cssName: "d.css", fonts: ["manrope"], js: "src/concept-d/d.js" },
];
const SHOT_FILES = [...SITES.flatMap((s) => [`${s.key}-home-desktop.jpg`, `${s.key}-home-mobile.jpg`]), "greyscale-home.jpg"];
const COUNT = ["", "One", "Two", "Three", "Four", "Five", "Six"][SITES.length];
const count = COUNT.toLowerCase();
const GREY_H = Math.round(900 / SITES.length); // the greyscale strip: the home pages side by side, 1440 px wide in all

// ------------------------------------------------------------------ helpers
const files = (dir) => existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : [join(dir, d.name)])) : [];
const posix = (p) => p.split(sep).join("/");
function writeOut(base, path, text) { const f = join(base, path); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); }
function copyInto(base, path, from) { const f = join(base, path); mkdirSync(dirname(f), { recursive: true }); copyFileSync(from, f); }
function fontFaces(families) {
  return families.map((f) => readFileSync(join(STATIC, "fonts", `${f}.css`), "utf8")
    .replace(/url\(([^)]+)\)/g, (m, u) => `url(fonts/${u.replace(/['"]/g, "")})`)).join("\n");
}
const shotsAvailable = () => SHOT_FILES.every((f) => existsSync(join(SHOTS, f)));

// ------------------------------------------------------------------ neutral pages shared by both sites (compare, sources, 404)
const NEUTRAL_CSS = `:root{--ink:#161616;--muted:#555;--line:#d9d6cf;--bg:#fbfaf7;--a:#F4EFE6;--a-ink:#1C1A17;--a-acc:#A3341C;--b:#121212;--b-acc:#E9A920}
*,*::before,*::after{box-sizing:border-box}
html{background:var(--bg);color:var(--ink);-webkit-text-size-adjust:100%}
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:1rem;line-height:1.6;overflow-x:hidden}
a{color:inherit;text-underline-offset:.15em}
:focus-visible{outline:3px solid #1a5fb4;outline-offset:2px}
img{max-width:100%;height:auto;display:block}
.wrap{max-width:1180px;margin:0 auto;padding:0 16px}
@media(min-width:48em){.wrap{padding:0 32px}}
.skip{position:absolute;left:16px;top:-4rem;background:#fff;color:#000;padding:.5rem 1rem;z-index:9}
.skip:focus{top:.5rem}
.note{background:var(--ink);color:#fff;font-size:.82rem;padding:.55rem 0}
.note a{color:#fff}
.top{padding:2.4rem 0 1.8rem;border-bottom:1px solid var(--line)}
.k{font-size:.76rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 .6rem}
h1{font-size:clamp(2rem,4.6vw,3.1rem);line-height:1.08;margin:0 0 1rem;letter-spacing:-.01em}
h2{font-size:clamp(1.35rem,2.6vw,1.85rem);line-height:1.15;margin:0 0 1rem}
h3{font-size:1.1rem;line-height:1.25;margin:0 0 .4rem}
p{margin:0 0 .8rem}
.lead{font-size:1.15rem;max-width:46rem}
.sec{padding:2.4rem 0;border-bottom:1px solid var(--line)}
.concepts{display:grid;gap:1.2rem}
@media(min-width:64em){.concepts{grid-template-columns:repeat(2,minmax(0,1fr))}}
.concept{border:1px solid var(--line);display:grid;gap:.9rem;padding:1.3rem;align-content:start}
.concept p{margin:0}
.concept--a{background:var(--a);color:var(--a-ink);font-family:Georgia,"Times New Roman",serif}
.concept--b{background:var(--b);color:#fff}
.concept--b a{color:#fff}
.concept h2{margin:0;font-size:clamp(1.6rem,3vw,2.2rem)}
.concept--b h2{font-family:"Arial Narrow",Arial,sans-serif;font-stretch:condensed;text-transform:uppercase;letter-spacing:.01em}
.concept--c{background:#fff;color:#0A0F1C;border-color:#C9D1DE;border-radius:20px}
.concept--c h2{font-family:Roboto,system-ui,sans-serif;font-weight:500;letter-spacing:-.02em}
.concept--d{background:#0A0A0A;color:#F5F5F3;border-color:#0A0A0A;border-radius:20px}
.concept--d a{color:#F5F5F3}
.concept--d h2{font-family:Manrope,system-ui,sans-serif;font-weight:600;letter-spacing:-.03em}
.here{font-family:system-ui,sans-serif;font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.shots{display:grid;grid-template-columns:3fr 1fr;gap:.7rem;align-items:start}
.shots img{border:1px solid rgba(128,128,128,.45)}
.shots figcaption{font-family:system-ui,sans-serif;font-size:.74rem;opacity:.85;margin-top:.3rem}
.shots figure{margin:0}
.open{justify-self:start;font-family:system-ui,sans-serif;display:inline-block;font-weight:700;padding:.75rem 1.1rem;border:2px solid currentColor;text-decoration:none;min-height:44px}
.concept--a .open{background:var(--a-acc);border-color:var(--a-acc);color:#fff}
.concept--b .open{background:var(--b-acc);border-color:var(--b-acc);color:#121212}
.concept--c .open{background:#002FA7;border-color:#002FA7;color:#fff;border-radius:999px}
.concept--d .open{background:#F5F5F3;border-color:#F5F5F3;color:#0A0A0A;border-radius:999px}
.facts{font-family:system-ui,sans-serif;font-size:.92rem;display:grid;gap:.6rem;margin:0}
.facts dt{font-weight:700;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em}
.facts dd{margin:0}
table{border-collapse:collapse;width:100%;font-size:.95rem}
th,td{text-align:left;vertical-align:top;padding:.6rem .8rem .6rem 0;border-bottom:1px solid var(--line)}
thead th{font-size:.76rem;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid var(--ink)}
tbody th{width:20%}
@media(max-width:47.99em){table,thead,tbody,tr,th,td{display:block}thead{display:none}tbody tr{padding:.7rem 0;border-bottom:1px solid var(--line)}tbody th,td{border:0;padding:.15rem 0;width:auto}td::before{content:attr(data-label) ": ";font-weight:700}}
ul,ol{padding-left:1.25rem;margin:0}
li{margin:.35rem 0}
.cols{display:grid;gap:1.6rem}
@media(min-width:64em){.cols{grid-template-columns:repeat(2,minmax(0,1fr))}}
.grey figure{margin:0}
.grey img{border:1px solid var(--line)}
.grey figcaption{font-size:.85rem;color:var(--muted);margin-top:.4rem}
.cards{list-style:none;padding:0;display:grid;gap:.8rem}
@media(min-width:64em){.cards{grid-template-columns:1fr 1fr}}
.cards li{border:1px solid var(--line);background:#fff;padding:1rem;margin:0}
.cards p{margin:.3rem 0 0}
.meta{font-size:.85rem;color:var(--muted)}
.foot{padding:2rem 0 3rem;color:var(--muted);font-size:.9rem}
.btns{display:flex;flex-wrap:wrap;gap:.6rem;margin:.4rem 0 0}
.btn{display:inline-block;border:2px solid var(--ink);padding:.6rem .9rem;text-decoration:none;font-weight:700;min-height:44px}`;

function neutralPage({ site, depth, title, description, body }) {
  const up = "../".repeat(depth);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} · APARN redesign prototypes</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="${up}assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<style>${NEUTRAL_CSS}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="note"><div class="wrap">${esc(c.site.prototypeLabel)}. <a href="${up || "./"}">Back to ${esc(site.name)}</a></div></div>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="foot"><div class="wrap"><p>Prepared for discussion, November 2026. Content checked ${esc(c.site.lastChecked)}. The official APARN website is <a href="${esc(c.site.officialSite)}">aparn.net</a>.</p></div></footer>
</body>
</html>`;
}

function conceptCard(site, s, cc) {
  const self = site.key === s.key;
  const href = self ? "../" : s.url;
  const shots = shotsAvailable() ? `<div class="shots">
    <figure><img src="../assets/shots/${s.key}-home-desktop.jpg" width="1440" height="900" alt="${esc(s.name)} home page on a desktop screen." loading="lazy"><figcaption>Desktop, 1440 pixels</figcaption></figure>
    <figure><img src="../assets/shots/${s.key}-home-mobile.jpg" width="360" height="780" alt="${esc(s.name)} home page on a phone." loading="lazy"><figcaption>Phone, 360 pixels</figcaption></figure></div>` : "";
  return `<article class="concept concept--${s.key}" aria-labelledby="card-${s.key}">
  <p class="here">${self ? "You are viewing this concept" : "Another concept"}</p>
  <h2 id="card-${s.key}">${esc(s.name)}</h2>
  <p>${esc(cc.line)}</p>
  ${shots}
  <a class="open" href="${esc(href)}">Open ${esc(s.name.split(":")[0])}</a>
  <dl class="facts"><div><dt>Art direction</dt><dd>${esc(cc.direction)}</dd></div><div><dt>How it works</dt><dd>${esc(cc.ux)}</dd></div><div><dt>Address</dt><dd>${esc(s.url)}</dd></div></dl>
</article>`;
}

function comparePage(site) {
  const cc = Object.fromEntries(h.concepts.map((x) => [x.id, x]));
  const body = `
<header class="top"><div class="wrap"><p class="k">APARN website redesign</p><h1>${COUNT} prototypes for discussion</h1><p class="lead">${esc(h.intro)}</p><p class="meta">${esc(h.note)}</p></div></header>
<section class="sec" aria-label="The ${count} concepts"><div class="wrap"><div class="concepts">${SITES.map((s) => conceptCard(site, s, cc[s.key])).join("")}</div></div></section>
<section class="sec" aria-labelledby="h-side"><div class="wrap"><h2 id="h-side">Side by side</h2>
<table><thead><tr><th scope="col">Aspect</th>${SITES.map((s) => `<th scope="col">${esc(s.name)}</th>`).join("")}</tr></thead>
<tbody>${h.compare.map(([k, ...vals]) => `<tr><th scope="row">${esc(k)}</th>${vals.map((v, i) => `<td data-label="${esc(SITES[i].short)}">${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>
${shotsAvailable() ? `<section class="sec grey" aria-labelledby="h-grey"><div class="wrap"><h2 id="h-grey">The same pages in greyscale</h2><p>The ${count} directions stay distinct without colour: serif type on warm light pages (A), heavy condensed type on dark pages (B), open white space with rounded shapes (C), and black title areas over white pages ruled with hairlines (D).</p>
<figure><img src="../assets/shots/greyscale-home.jpg" width="1440" height="${GREY_H}" alt="The ${count} home pages side by side in greyscale, from left to right: ${SITES.map((s) => `Concept ${s.key.toUpperCase()}`).join(", ")}." loading="lazy"><figcaption>Home pages at desktop width, colour removed. From left to right: ${SITES.map((s) => `Concept ${s.key.toUpperCase()}`).join(", ")}.</figcaption></figure></div></section>` : ""}
<section class="sec" aria-labelledby="h-st"><div class="wrap"><h2 id="h-st">Strengths and trade-offs</h2><div class="cols">${h.concepts.map((x) => `<div><h3>${esc(D.sites[x.id].name)}</h3><p><strong>Strengths</strong></p><ul>${x.strengths.map((s) => `<li>${esc(s)}</li>`).join("")}</ul><p style="margin-top:.8rem"><strong>Trade-offs</strong></p><ul>${x.tradeoffs.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`).join("")}</div></div></section>
<section class="sec" aria-labelledby="h-shared"><div class="wrap"><h2 id="h-shared">What all ${count} share</h2><ul>${h.shared.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
<div class="btns"><a class="btn" href="../downloads/${esc(T.files.docx)}" download>Template (DOCX, editable)</a><a class="btn" href="../downloads/${esc(T.files.pdf)}">Template (PDF)</a></div></div></section>
<section class="sec" id="proposal" aria-labelledby="h-prop"><div class="wrap"><h2 id="h-prop">Proposal summary for ${esc(h.proposal.to)}</h2><p class="lead">${esc(h.proposal.summary)}</p>
<ol>${h.proposal.points.map((p) => `<li><strong>${esc(p.title)}.</strong> ${esc(p.text)}</li>`).join("")}</ol><p style="margin-top:1rem">${esc(h.proposal.ask)}</p></div></section>
<section class="sec" id="decisions" aria-labelledby="h-dec"><div class="wrap"><h2 id="h-dec">To confirm before launch</h2><ol>${c.sources.confirm.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
<p style="margin-top:1rem"><a href="../sources/">Sources, credits and open questions</a> · <a href="${esc(D.source.url)}">Source code and content on GitHub</a></p></div></section>`;
  return neutralPage({ site, depth: 1, title: "Compare the concepts", description: h.intro, body });
}

function sourcesPage(site) {
  const s = c.sources;
  const body = `
<header class="top"><div class="wrap"><p class="k">APARN redesign prototypes</p><h1>Sources, credits and open questions</h1><p class="lead">${esc(s._about)}</p></div></header>
<section class="sec" aria-labelledby="h-src"><div class="wrap"><h2 id="h-src">Sources</h2><p class="meta">All pages read on ${esc(s.accessed)}.</p>
<ul class="cards">${s.sources.map((x) => `<li id="src-${esc(x.id)}"><h3>${x.url ? `<a href="${esc(x.url)}" rel="noopener">${esc(x.title)}</a>` : esc(x.title)}</h3><p class="meta">${esc(x.date || "")}</p><p>${esc(x.used || "")}</p></li>`).join("")}</ul></div></section>
<section class="sec" aria-labelledby="h-img"><div class="wrap"><h2 id="h-img">Images and credits</h2><p>Every photograph comes from aparn.net and keeps its published credit. Permission to reuse each one must be confirmed before launch. All other graphics are original to these prototypes.</p>
<ul class="cards">${s.assets.map((x) => `<li><h3>${esc(x.title)}</h3><p>${esc(x.credit)}</p><p class="meta">Source: ${esc(c.sourceById[x.source]?.title || x.source)}. ${esc(x.permission)}</p></li>`).join("")}</ul>
<p class="meta" style="margin-top:1rem">Fonts: Newsreader and Work Sans (Concept A), Archivo (Concept B), Roboto (Concept C and the template) and Manrope (Concept D), served from this site. All are under the SIL Open Font License 1.1.</p></div></section>
<section class="sec" aria-labelledby="h-conf"><div class="wrap"><h2 id="h-conf">To confirm before launch</h2><ol>${s.confirm.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></div></section>
<section class="sec" aria-labelledby="h-ref"><div class="wrap"><h2 id="h-ref">Design references</h2><p>${esc(s.referencesNote)}</p>
<ul class="cards">${s.references.map((x) => `<li><h3><a href="${esc(x.url)}" rel="noopener">${esc(x.site)}</a></h3><p><strong>Observed:</strong> ${esc(x.observed)}</p><p><strong>Idea taken forward:</strong> ${esc(x.idea)}</p></li>`).join("")}</ul></div></section>
<section class="sec" aria-labelledby="h-status"><div class="wrap"><h2 id="h-status">Status labels used on the pages</h2><ul>${Object.entries(STATUS).map(([k, v]) => `<li><strong>${esc(v)}</strong>${c.site.status?.[k] ? `: ${esc(c.site.status[k])}` : ""}</li>`).join("")}</ul></div></section>`;
  return neutralPage({ site, depth: 1, title: "Sources and credits", description: "Sources, image credits, open questions and design references for the APARN redesign prototypes.", body });
}

function notFound(site) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Page not found · APARN</title><link rel="icon" href="${site.base}assets/brand/favicon-32.png" sizes="32x32" type="image/png"><style>${NEUTRAL_CSS}</style></head>
<body><main id="main" class="wrap" style="padding-top:3rem;padding-bottom:3rem"><h1>This page is not here</h1>
<p class="lead">The address may be mistyped, or the page may have moved.</p>
<div class="btns"><a class="btn" href="${site.base}">Go to the home page</a><a class="btn" href="${site.base}archive/">Browse the archive</a></div></main></body></html>`;
}

function siteReadme(site) {
  return `# APARN website redesign: ${site.name}

Live prototype: ${site.url}

This repository holds the built static site only. It is generated from the source repository
${D.source.url}. Edit the content and code there, then build and deploy (see its README).

This is a prototype for discussion, not the official APARN website (${c.site.officialSite}). Every page asks search engines not to index it.
`;
}

// ------------------------------------------------------------------ build each site
rmSync(DIST, { recursive: true, force: true });
const built = {};
for (const site of SITES) {
  const out = join(DIST, site.repo);
  const pages = site.build(c);
  for (const p of pages) writeOut(out, `${p.path}index.html`, p.html);
  writeOut(out, `assets/${site.cssName}`, `${fontFaces(site.fonts)}\n${readFileSync(join(ROOT, site.css), "utf8")}`);
  for (const f of readdirSync(join(STATIC, "brand"))) copyInto(out, `assets/brand/${f}`, join(STATIC, "brand", f));
  copyInto(out, "favicon.ico", join(STATIC, "brand", "favicon.ico"));
  writeOut(out, "assets/js/aparn.js", readFileSync(join(ROOT, "src", "shared", "aparn.js"), "utf8"));
  writeOut(out, "assets/js/motion.js", readFileSync(join(ROOT, "src", "shared", "motion.js"), "utf8"));
  if (site.js) writeOut(out, `assets/js/${site.key}.js`, readFileSync(join(ROOT, site.js), "utf8"));
  for (const f of readdirSync(join(STATIC, "fonts")).filter((n) => n.endsWith(".woff2") && site.fonts.some((fam) => n.startsWith(`${fam}-`)))) copyInto(out, `assets/fonts/${f}`, join(STATIC, "fonts", f));
  for (const f of readdirSync(join(STATIC, "img"))) copyInto(out, `assets/img/${f}`, join(STATIC, "img", f));
  for (const f of [T.files.docx, T.files.pdf]) {
    if (!existsSync(join(STATIC, "downloads", f))) throw new Error(`missing static/downloads/${f}: run npm run template and tools/word_export.ps1 first`);
    copyInto(out, `downloads/${f}`, join(STATIC, "downloads", f));
  }
  if (shotsAvailable()) for (const f of SHOT_FILES) copyInto(out, `assets/shots/${f}`, join(SHOTS, f));
  writeOut(out, "compare/index.html", comparePage(site));
  writeOut(out, "sources/index.html", sourcesPage(site));
  writeOut(out, "404.html", notFound(site));
  writeOut(out, ".nojekyll", "");
  writeOut(out, "README.md", siteReadme(site));
  built[site.key] = { site, out, pages };
}

// ------------------------------------------------------------------ handover documents (Markdown, repository root)
const mdEsc = (s) => String(s).replace(/\|/g, "\\|");
const live = SITES.map((s) => `- ${s.name}: ${s.url}`).join("\n");
writeFileSync(join(ROOT, "COMPARISON.md"), `# ${h.title}: comparison

${h.intro}

${live}

${h.concepts.map((x) => `## ${D.sites[x.id].name}

${x.line}

**Art direction.** ${x.direction}

**How it works.** ${x.ux}

**Strengths**

${x.strengths.map((s) => `- ${s}`).join("\n")}

**Trade-offs**

${x.tradeoffs.map((s) => `- ${s}`).join("\n")}
`).join("\n")}
## Side by side

| Aspect | ${SITES.map((s) => s.name).join(" | ")} |
|---|${SITES.map(() => "---").join("|")}|
${h.compare.map((r) => `| ${r.map(mdEsc).join(" | ")} |`).join("\n")}

## What all ${count} share

${h.shared.map((s) => `- ${s}`).join("\n")}

Screenshots are in [screenshots/](screenshots/). The ${count} home pages in greyscale are in [screenshots/greyscale-home.jpg](screenshots/greyscale-home.jpg).
`);

writeFileSync(join(ROOT, "PROPOSAL.md"), `# Proposal summary for ${h.proposal.to}

${h.proposal.summary}

${live}

## How the redesign answers the brief

${h.proposal.points.map((p, i) => `${i + 1}. **${p.title}.** ${p.text}`).join("\n")}

## Your decision

${h.proposal.ask}

## To confirm before launch

${c.sources.confirm.map((x, i) => `${i + 1}. ${x}`).join("\n")}

## Files

- Shared template (editable DOCX): [static/downloads/${T.files.docx}](static/downloads/${T.files.docx})
- PDF reading copy: [static/downloads/${T.files.pdf}](static/downloads/${T.files.pdf})
- Comparison: [COMPARISON.md](COMPARISON.md)
- Sources and content inventory: [SOURCES.md](SOURCES.md)
`);

const pageList = (key) => built[key].pages.map((p) => `| \`${p.path || "/"}\` | ${mdEsc((p.html.match(/<title>([^<]+)<\/title>/) || [])[1]?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'") || "")} |`).join("\n");
writeFileSync(join(ROOT, "SOURCES.md"), `# Source and content inventory

${c.sources._about} Accessed ${c.sources.accessed}.

## Sources

| Id | Source | Date | Used for |
|---|---|---|---|
${c.sources.sources.map((s) => `| ${s.id} | ${s.url ? `[${mdEsc(s.title)}](${s.url})` : mdEsc(s.title)} | ${mdEsc(s.date || "")} | ${mdEsc(s.used || "")} |`).join("\n")}

## Images, credits and permissions

| Image | Files | Credit | Source | Permission |
|---|---|---|---|---|
${c.sources.assets.map((a) => `| ${mdEsc(a.title)} | ${a.files.map((f) => `\`${f}\``).join(", ")} | ${mdEsc(a.credit)} | ${a.source} | ${mdEsc(a.permission)} |`).join("\n")}

All other graphics (Concept A's isles plates, Concept B's poster cards, Concept C's transit diagram and orbit, Concept D's meeting dial and opening titles, icons) are original to these prototypes. Fonts: Newsreader and Work Sans (Concept A), Archivo (Concept B), Roboto (Concept C and the template) and Manrope (Concept D), all SIL Open Font License 1.1, from Google Fonts, self-hosted.

## To confirm before launch

${c.sources.confirm.map((x, i) => `${i + 1}. ${x}`).join("\n")}

## Design references (ideas only)

${c.sources.referencesNote}

| Reference | Observed | Idea taken forward |
|---|---|---|
${c.sources.references.map((r) => `| [${mdEsc(r.site)}](${r.url}) | ${mdEsc(r.observed)} | ${mdEsc(r.idea)} |`).join("\n")}

## Content files

| File | What it holds |
|---|---|
| \`content/site.json\` | Name, join link and wording, key messages, About text, dated evidence, membership benefits, contact |
| \`content/people.json\` | The Director and convenors: roles, institutions, short biographies, emails, sources |
| \`content/events.json\` | Every APARN Conference and every APARN Gathering at the SAR Conference, with status, dates, place, host, programme, organisers and links |
| \`content/network.json\` | Places, practices, outputs and the documented connections used by the network explorers |
| \`content/contributions.json\` | The ${c.contributions.items.length} pieces in APARN's JAR channel, used by the research filter |
| \`content/publications.json\` | Existing publications and the proposed Annual Publication |
| \`content/template.json\` | The shared template: sections, draft limits, presentation guide; drives the DOCX, PDF and web preview |
| \`content/sources.json\` | This inventory: sources, image credits, open questions and design references |
| \`content/handover.json\` | The comparison and the proposal summary |
| \`content/deploy.json\` | The GitHub repositories and live addresses |

## Pages

${SITES.map((s) => `### ${s.name} (${s.url})

| Path | Title |
|---|---|
${pageList(s.key)}
`).join("\n")}
Each site also has \`compare/\` (the comparison and proposal summary), \`sources/\` (this inventory as a page), \`downloads/\` (the template) and a \`404.html\` page.
`);

// ------------------------------------------------------------------ checks
const problems = [];
const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) idCache.set(file, new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idCache.get(file);
}
const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const JOIN = /<a class="[^"]*btn--join[^"]*" href="https:\/\/groups\.google\.com\/g\/ap-arn" rel="noopener" target="_blank" data-join>Join APARN<span class="vh"> \(opens Google Groups in a new tab\)<\/span><\/a>/g;
const TPL = (href) => new RegExp(`<a class="[^"]*btn--template[^"]*" href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" data-template-link>Template for Annual Publication</a>`);
let pageCount = 0;

for (const { site, out, pages } of Object.values(built)) {
  for (const f of files(out)) {
    const rp = posix(relative(out, f));
    if (/\.(html|css|js|md|svg)$/.test(rp)) {
      const text = readFileSync(f, "utf8");
      try { rp.endsWith(".html") ? assertNoEmDash(text, `${site.repo}/${rp}`) : (text.includes("\u2014") && problems.push(`${site.repo}/${rp}: em dash`)); } catch (e) { problems.push(e.message); }
    }
    if (!rp.endsWith(".html")) continue;
    pageCount++;
    const html = readFileSync(f, "utf8");
    if (!html.includes('<meta name="robots" content="noindex, nofollow">')) problems.push(`${site.repo}/${rp}: missing noindex`);
    if (!/<html lang="en"/.test(html)) problems.push(`${site.repo}/${rp}: missing lang`);
    const urls = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]);
    for (const m of html.matchAll(/\ssrcset="([^"]*)"/g)) m[1].split(",").forEach((part) => urls.push(part.trim().split(/\s+/)[0]));
    for (const raw of urls) {
      const u = raw.replace(/&amp;/g, "&");
      if (!u) { problems.push(`${site.repo}/${rp}: empty link`); continue; }
      if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
      const resolved = u.startsWith("/") ? (u.startsWith(site.base) ? new URL(u.slice(site.base.length), "http://site/") : null) : new URL(u, `http://site/${rp}`);
      if (!resolved) { problems.push(`${site.repo}/${rp}: absolute link outside the site: ${u}`); continue; }
      let target = decodeURIComponent(resolved.pathname).slice(1);
      if (target === "" || target.endsWith("/")) target += "index.html";
      const file = join(out, target);
      if (!existsSync(file)) { problems.push(`${site.repo}/${rp}: broken link ${u}`); continue; }
      if (resolved.hash && target.endsWith(".html") && !idsOf(file).has(decodeURIComponent(resolved.hash.slice(1)))) problems.push(`${site.repo}/${rp}: missing anchor ${u}`);
    }
  }
  // required wording and placements on the concept pages
  const byPath = Object.fromEntries(pages.map((p) => [p.path, p.html]));
  for (const p of pages) {
    const head = p.html.split("<main")[0];
    const n = (head.match(JOIN) || []).length;
    if (n < 2) problems.push(`${site.repo}/${p.path}: Join APARN should be in the header and the menu (found ${n})`);
  }
  const home = byPath[""];
  const homeMain = home.split("<main")[1].split("</main>")[0];
  if ((homeMain.match(JOIN) || []).length < 3) problems.push(`${site.repo}: the home page needs Join APARN in the opening, after the network and in the closing invitation`);
  if (!strip(home).includes(c.site.join.where)) problems.push(`${site.repo}: the home page should say where joining happens`);
  for (const [path, href] of [["", "template/"], ["publication/", "../template/"], ["programme/gathering-at-sar/", "../../template/"], ["contribute/", "../template/"]]) {
    if (!TPL(href).test(byPath[path] || "")) problems.push(`${site.repo}/${path}: missing the Template for Annual Publication button`);
  }
  const contrib = byPath["contribute/"];
  const notice = (strip(contrib).match(/Prototype demo: nothing is uploaded or submitted\./g) || []).length;
  if (notice !== 2) problems.push(`${site.repo}/contribute/: the demo notice should appear twice (found ${notice})`);
  if (!contrib.includes('<label class="check"><input type="checkbox" name="publication" id="f-pub"> I would like this submission to be considered for APARN’s annual publication.</label>')) problems.push(`${site.repo}/contribute/: publication checkbox text or default state changed`);
  if (/name="publication"[^>]*checked/.test(contrib)) problems.push(`${site.repo}/contribute/: the publication checkbox must start unchecked`);
  const tpl = byPath["template/"];
  if (!tpl.includes(`href="../downloads/${T.files.docx}" download`) || !tpl.includes(`href="../downloads/${T.files.pdf}"`)) problems.push(`${site.repo}/template/: download links missing`);
  if (!strip(byPath["network/"]).includes("Across the network")) problems.push(`${site.repo}/network/: missing the Across the network heading`);
}
for (const md of ["README.md", "COMPARISON.md", "PROPOSAL.md", "SOURCES.md"]) {
  const f = join(ROOT, md);
  if (existsSync(f) && readFileSync(f, "utf8").includes("\u2014")) problems.push(`${md}: em dash`);
}
for (const f of files(join(ROOT, "content")).concat(files(join(ROOT, "src")))) {
  if (readFileSync(f, "utf8").includes("\u2014")) problems.push(`${posix(relative(ROOT, f))}: em dash in source`);
}

console.log(`built ${SITES.map((s) => `dist/${s.repo} (${built[s.key].pages.length} concept pages)`).join(" and ")}; checked ${pageCount} HTML files${shotsAvailable() ? "" : " (no screenshots yet)"}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("all checks passed");
