// Browser tests for both prototypes in headless Chrome (via the DevTools protocol), plus the screenshots.
//   node tools/test-site.mjs            test the local build in dist/ (starts tools/serve.mjs)
//   node tools/test-site.mjs --shots    also save screenshots to screenshots/
//   node tools/test-site.mjs --live     test the published GitHub Pages sites instead
// Every page is loaded at 360, 768 and 1440 pixels wide. Then the menus, explorers, filters, timeline,
// connection board and submission demo are exercised with clicks and keys.
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "./cdp.mjs";
import { serve } from "./serve.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const deploy = JSON.parse(readFileSync(join(ROOT, "content", "deploy.json"), "utf8"));
const template = JSON.parse(readFileSync(join(ROOT, "content", "template.json"), "utf8"));
const LIVE = process.argv.includes("--live");
const SHOTS = process.argv.includes("--shots");
const QUICK = process.argv.includes("--quick");
const PORT = 8137;
const OUT = join(ROOT, "screenshots");
const DOCX = join(ROOT, "static", "downloads", template.files.docx);
const SITES = ["a", "b"].map((key) => ({ key, ...deploy.sites[key], root: LIVE ? deploy.sites[key].url : `http://127.0.0.1:${PORT}${deploy.sites[key].base}` }));
const VIEWS = [
  { name: "mobile", width: 360, height: 780, mobile: true },
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "desktop", width: 1440, height: 900, mobile: false },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];
let passed = 0;
function check(ok, what) { if (ok) passed++; else { failures.push(what); console.log(`  FAIL ${what}`); } }

// every page of a built site, as site-relative paths ("", "about/", ...)
function pagesOf(site) {
  const dir = join(ROOT, "dist", site.repo);
  const walk = (d) => readdirSync(d).flatMap((n) => { const f = join(d, n); return statSync(f).isDirectory() ? walk(f) : [f]; });
  return walk(dir).filter((f) => f.endsWith(`${sep}index.html`)).map((f) => relative(dir, f).split(sep).slice(0, -1).join("/")).map((p) => (p ? `${p}/` : "")).sort();
}

async function openPage(browser, view, opts = {}) {
  const p = await browser.page({ width: view.width, height: view.height, mobile: view.mobile, dpr: opts.dpr || 1, reducedMotion: opts.reducedMotion ?? true });
  p.$ = (expr) => p.eval(expr);
  p.click = (sel) => p.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) throw new Error("missing " + ${JSON.stringify(sel)}); e.click(); return true; })()`);
  p.visible = (sel) => p.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false; const r = e.getBoundingClientRect(); return !!(e.offsetParent || getComputedStyle(e).position === "fixed") && r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; })()`);
  p.ready = () => p.eval(`document.fonts.ready.then(() => true)`);
  return p;
}

const PAGE_AUDIT = `(() => {
  const de = document.documentElement;
  const over = de.scrollWidth - window.innerWidth;
  const culprits = [];
  if (over > 1) for (const el of document.querySelectorAll("body *")) { const b = el.getBoundingClientRect(); if (b.right > window.innerWidth + 1 && b.width > 0 && getComputedStyle(el).position !== "fixed") { culprits.push(el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).join(".") : "") + " right=" + Math.round(b.right)); if (culprits.length > 5) break; } }
  const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
  const dupIds = ids.filter((x, i) => ids.indexOf(x) !== i);
  const unnamed = [...document.querySelectorAll("a[href], button")].filter((e) => !(e.textContent.trim() || e.getAttribute("aria-label") || e.querySelector("img[alt]:not([alt=''])"))).map((e) => e.outerHTML.slice(0, 80));
  const unlabelled = [...document.querySelectorAll("input:not([type=hidden]), textarea, select")].filter((e) => !(e.closest("label") || (e.id && document.querySelector("label[for='" + e.id + "']")) || e.getAttribute("aria-label"))).map((e) => e.name || e.id);
  const noAlt = [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src);
  const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc);
  return { over, culprits, dupIds, unnamed, unlabelled, noAlt, broken, h1: document.querySelectorAll("h1").length, noindex: !!document.querySelector('meta[name=robots][content*=noindex]'), motion: de.classList.contains("motion") };
})()`;

// ------------------------------------------------------------------ 1. every page at three widths
async function auditPages(browser, site) {
  const pages = pagesOf(site);
  console.log(`\n${site.name}: ${pages.length} pages x ${VIEWS.length} widths`);
  for (const view of VIEWS) {
    const p = await openPage(browser, view);
    for (const path of QUICK ? pages.slice(0, 4) : pages) {
      const url = site.root + path;
      await p.goto(url, 250);
      await p.ready();
      const r = await p.$(PAGE_AUDIT);
      const where = `${site.key.toUpperCase()} ${view.width}px /${path}`;
      check(r.over <= 1, `${where}: no sideways scroll (overflow ${r.over}px ${r.culprits.join(", ")})`);
      check(r.dupIds.length === 0, `${where}: duplicate ids ${r.dupIds.join(", ")}`);
      check(r.unnamed.length === 0, `${where}: links or buttons without a name ${r.unnamed.join(" ")}`);
      check(r.unlabelled.length === 0, `${where}: unlabelled fields ${r.unlabelled.join(", ")}`);
      check(r.noAlt.length === 0 && r.broken.length === 0, `${where}: images (missing alt ${r.noAlt.length}, broken ${r.broken.join(", ")})`);
      check(r.h1 === 1, `${where}: one h1 (found ${r.h1})`);
      check(r.noindex, `${where}: noindex`);
      check(!r.motion, `${where}: reduced motion respected`);
    }
    check(p.consoleErrors.length === 0, `${site.key.toUpperCase()} ${view.width}px: no console errors (${p.consoleErrors.slice(0, 3).join(" | ")})`);
    await p.close();
  }
}

// ------------------------------------------------------------------ 2. behaviour
async function demoFlow(p, where) {
  check(await p.$(`!document.querySelector('[data-step="1"]').hidden && document.querySelector('[data-step="2"]').hidden && document.querySelector('[data-step="4"]').hidden`), `${where}: demo starts at step 1`);
  check(await p.$(`document.getElementById("f-pub").checked === false`), `${where}: publication checkbox unchecked by default`);
  check(await p.$(`document.querySelector(".demo > .demo-banner").textContent.trim() === "Prototype demo: nothing is uploaded or submitted."`), `${where}: notice shown before entry`);
  await p.click('[data-step="1"] [data-go="2"]');
  check(await p.$(`!document.querySelector('[data-step="2"]').hidden && document.querySelector('[data-step-indicator="2"]').getAttribute("aria-current") === "step"`), `${where}: step 2`);
  await p.click('[data-step="2"] [data-go="3"]');
  check(await p.$(`!document.querySelector('[data-step="3"]').hidden`), `${where}: step 3`);
  await p.$(`document.querySelector("[data-demo-form]").requestSubmit()`);
  await sleep(100);
  const errs = await p.$(`(() => { const s = document.querySelector("[data-error-summary]"); return { shown: !s.hidden, n: s.querySelectorAll("li").length, focused: document.activeElement === s, invalid: document.querySelectorAll('[aria-invalid="true"]').length }; })()`);
  check(errs.shown && errs.n === 7 && errs.focused && errs.invalid === 6, `${where}: empty form shows 7 errors, focused summary (${JSON.stringify(errs)})`);
  await p.$(`(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }; set("f-name", "Test Contributor"); set("f-email", "not-an-email"); set("f-aff", "Example University"); set("f-country", "Malaysia"); set("f-title", "Listening to rivers"); document.querySelector('input[name="length"][value="10 minutes"]').click(); return true; })()`);
  await p.setFiles("#f-file", [DOCX]);
  await p.$(`document.querySelector("[data-demo-form]").requestSubmit()`);
  await sleep(100);
  check(await p.$(`(() => { const s = document.querySelector("[data-error-summary]"); return !s.hidden && s.querySelectorAll("li").length === 1 && document.getElementById("f-email-err").textContent.includes("name@example.org"); })()`), `${where}: a bad email is caught on its own`);
  await p.$(`(() => { const e = document.getElementById("f-email"); e.value = "test@example.org"; return true; })()`);
  await p.$(`document.querySelector("[data-demo-form]").requestSubmit()`);
  await sleep(150);
  const rev = await p.$(`(() => { const r = document.querySelector('[data-step="4"]'); const dl = r.querySelector("[data-review]").textContent; return { shown: !r.hidden, notice: r.querySelector(".demo-banner").textContent.trim(), name: dl.includes("Test Contributor"), file: dl.includes(${JSON.stringify(template.files.docx)}), pub: dl.includes("Not requested"), len: dl.includes("10 minutes") }; })()`);
  check(rev.shown && rev.name && rev.file && rev.pub && rev.len, `${where}: review shows the entries (${JSON.stringify(rev)})`);
  check(rev.notice === "Prototype demo: nothing is uploaded or submitted.", `${where}: notice shown on review`);
  await p.click('[data-step="4"] [data-go="3"]');
  check(await p.$(`document.getElementById("f-name").value === "Test Contributor"`), `${where}: editing keeps the entries`);
  await p.click("#f-pub");
  await p.$(`document.querySelector("[data-demo-form]").requestSubmit()`);
  await sleep(150);
  check(await p.$(`document.querySelector("[data-review]").textContent.includes("Yes, please consider this contribution")`), `${where}: opting in shows on review`);
  await p.click("[data-finish]");
  check(await p.$(`(() => { const d = document.querySelector("[data-done]"); return !d.hidden && document.activeElement === d; })()`), `${where}: finish shows an honest end state`);
  check(await p.$(`localStorage.length === 0 && sessionStorage.length === 0 && document.cookie === ""`), `${where}: nothing stored in the browser`);
  await p.click("[data-reset]");
  check(await p.$(`!document.querySelector('[data-step="1"]').hidden && document.getElementById("f-name").value === "" && !document.getElementById("f-pub").checked && document.getElementById("f-file").files.length === 0`), `${where}: start again clears everything`);
}

async function filterFlow(p, where) {
  if (!(await p.$(`!!document.querySelector("[data-filter-search]")`))) { check(false, `${where}: research filter present`); return; }
  const count = () => p.$(`document.querySelector("[data-filter-search]").closest("[data-filter]").querySelector("[data-filter-count]").textContent.trim()`);
  check((await count()) === "28 pieces", `${where}: 28 pieces listed`);
  await p.click('[data-filter-value="aparn2024"]');
  check((await count()) === "6 pieces", `${where}: filter APARN2024 shows 6 (${await count()})`);
  await p.$(`(() => { const s = document.querySelector("[data-filter-search]"); s.value = "zzqx"; s.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`);
  check(await p.$(`!document.querySelector("[data-filter-search]").closest("[data-filter]").querySelector("[data-filter-empty]").hidden`), `${where}: empty state shown`);
  await p.click("[data-filter-reset]");
  check((await count()) === "28 pieces", `${where}: reset shows all 28 again`);
}

async function behaviour(browser, site) {
  console.log(`\n${site.name}: behaviour`);
  const desk = await openPage(browser, VIEWS[2]);
  const phone = await openPage(browser, VIEWS[0]);
  const K = site.key.toUpperCase();

  // keyboard: skip link first, then visible focus on the next stops
  await desk.goto(site.root, 300);
  await desk.key("Tab", "Tab", 9);
  check(await desk.$(`document.activeElement.classList.contains("skip") && document.activeElement.getBoundingClientRect().top >= 0`), `${K}: the skip link is the first tab stop and becomes visible`);
  const outlines = [];
  for (let i = 0; i < 6; i++) { await desk.key("Tab", "Tab", 9); outlines.push(await desk.$(`(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2; })()`)); }
  check(outlines.every(Boolean), `${K}: keyboard focus is visible on the first stops (${outlines.join(",")})`);
  check(await desk.$(`[...document.querySelectorAll("header a[data-join]")].some((a) => a.offsetParent && a.href === "https://groups.google.com/g/ap-arn" && a.target === "_blank")`), `${K}: Join APARN visible in the desktop header`);

  if (site.key === "a") {
    // phone menu
    await phone.goto(site.root, 300);
    check(await phone.visible(".menu-toggle") && !(await phone.visible("#site-menu")), `A 360px: menu button shown, menu closed`);
    await phone.click(".menu-toggle");
    check(await phone.visible("#site-menu") && await phone.visible(".menu-join a[data-join]"), `A 360px: menu opens with Join APARN inside`);
    await phone.key("Escape", "Escape", 27);
    check(!(await phone.visible("#site-menu")) && await phone.$(`document.activeElement.classList.contains("menu-toggle")`), `A 360px: Esc closes the menu and returns focus`);
    // network explorer
    await desk.goto(site.root + "network/", 300);
    check(await desk.$(`!document.querySelector('[data-select-panel="yogyakarta"]').hidden`), `A: explorer starts on Yogyakarta`);
    await desk.click('[data-select-group="tab"][data-select-button="activity"]');
    check(await desk.$(`!document.querySelector('[data-select-panel="activity"][data-select-group="tab"]').hidden`), `A: Activities tab opens`);
    await desk.click('[data-select-group="node"][data-select-button="aparn2024"]');
    const sel = await desk.$(`(() => ({ shown: !document.querySelector('[data-select-panel="aparn2024"]').hidden, others: document.querySelectorAll('[data-select-panel][data-select-group="node"]:not([hidden])').length, related: document.querySelectorAll(".is-related").length, live: document.querySelector('[data-select-live="node"]').textContent }))()`);
    check(sel.shown && sel.others === 1 && sel.related > 0 && sel.live.startsWith("Showing"), `A: choosing APARN2024 updates the panel and marks ${sel.related} connections`);
    await filterFlow(desk, "A network");
    // timeline
    await desk.goto(site.root + "archive/", 300);
    await desk.click('[data-select-group="year"][data-select-button="aparn2020"]');
    check(await desk.$(`!document.querySelector('[data-select-panel="aparn2020"]').hidden && document.querySelectorAll('[data-select-panel][data-select-group="year"]:not([hidden])').length === 1`), `A: timeline shows 2020`);
    await phone.goto(site.root + "network/", 300);
    await phone.click('[data-select-group="tab"][data-select-button="person"]');
    await phone.click('[data-select-group="node"][data-select-button="danny-butt"]');
    await sleep(200);
    check(await phone.$(`document.activeElement === document.querySelector('[data-select-panel="danny-butt"]')`), `A 360px: choosing a person moves focus to the story`);
  } else {
    // connection board
    await desk.goto(site.root, 500);
    const lines = () => desk.$(`(() => ({ paths: document.querySelectorAll("[data-board-lines] path").length, related: [...document.querySelectorAll(".board .is-related")].filter((b) => b.offsetParent).length }))()`);
    let l = await lines();
    check(await desk.$(`!document.querySelector('[data-select-panel="aparn2025"]').hidden`) && l.paths > 0 && l.paths === l.related, `B: board starts on APARN2025 with ${l.paths} drawn links`);
    await desk.click('[data-select-button="danny-butt"]');
    await sleep(150);
    l = await lines();
    check(await desk.$(`!document.querySelector('[data-select-panel="danny-butt"]').hidden`) && l.paths === l.related && l.related > 0, `B: choosing Danny Butt redraws ${l.paths} links`);
    await desk.click('[data-board-type="place"]');
    await sleep(150);
    const l2 = await lines();
    check(await desk.$(`document.querySelector('[data-board-col="place"]').hidden`) && l2.paths === l2.related, `B: hiding Places hides the column and its links (${l2.paths})`);
    await desk.click('[data-board-type="place"]');
    // strip
    const before = await desk.$(`document.querySelector("[data-strip-track]").scrollLeft`);
    await desk.click('[data-strip-move="1"]');
    await sleep(300);
    check((await desk.$(`document.querySelector("[data-strip-track]").scrollLeft`)) > before, `B: the strip scrolls forward`);
    // phone: index overlay and board
    await phone.goto(site.root, 400);
    check(!(await phone.$(`getComputedStyle(document.querySelector("[data-board-lines]")).display !== "none"`)), `B 360px: link lines hidden on phones`);
    check(await phone.visible(".bar a[data-join]"), `B 360px: Join APARN stays in the bar`);
    await phone.click(".bar-index");
    check(await phone.visible("#index-menu") && await phone.$(`document.documentElement.classList.contains("nav-open")`), `B 360px: index opens full screen`);
    for (let i = 0; i < 14; i++) await phone.key("Tab", "Tab", 9);
    check(await phone.$(`document.getElementById("index-menu").contains(document.activeElement)`), `B 360px: focus stays inside the open index`);
    await phone.key("Escape", "Escape", 27);
    check(!(await phone.visible("#index-menu")) && await phone.$(`document.activeElement.classList.contains("bar-index")`), `B 360px: Esc closes the index and returns focus`);
    await phone.click('[data-select-button="bangkok"]');
    await sleep(200);
    check(await phone.$(`document.activeElement === document.querySelector('[data-select-panel="bangkok"]')`), `B 360px: choosing a place moves focus to its story`);
    // archive filter
    await desk.goto(site.root + "archive/", 300);
    const arch = (v) => desk.$(`(() => { document.querySelector('[data-filter-value="${v}"]').click(); return document.querySelector("[data-filter-count]").textContent.trim(); })()`);
    check((await arch("open")) === "2 gatherings", `B: archive filter Coming up shows 2`);
    check((await arch("sar")) === "3 gatherings", `B: archive filter Gatherings at SAR shows 3`);
    check((await arch("all")) === "12 gatherings", `B: archive shows all 12`);
    await desk.goto(site.root + "network/", 300);
    await filterFlow(desk, "B network");
  }

  // shared: template downloads, demo, direct link and refresh, 404
  for (const f of [template.files.docx, template.files.pdf]) {
    const r = await fetch(site.root + "downloads/" + f, { method: "GET" });
    const size = (await r.arrayBuffer()).byteLength;
    check(r.ok && size > 10000, `${K}: downloads/${f} (${r.status}, ${Math.round(size / 1024)} KB)`);
  }
  await desk.goto(site.root + "contribute/", 300);
  await demoFlow(desk, `${K} desktop demo`);
  await phone.goto(site.root + "contribute/", 300);
  await demoFlow(phone, `${K} 360px demo`);
  await desk.goto(site.root + "archive/aparn2023/", 300);
  await desk.$(`location.reload(), true`);
  await sleep(900);
  check(await desk.$(`document.title.includes("2023") && !!document.querySelector("h1")`), `${K}: a deep link survives refresh`);
  const nf = await fetch(site.root + "no-such-page/");
  check(nf.status === 404 && (await nf.text()).includes("This page is not here"), `${K}: unknown pages get the 404 page (${nf.status})`);
  const other = SITES.find((s) => s.key !== site.key);
  check(await desk.$(`[...document.querySelectorAll("a")].some((a) => a.href === ${JSON.stringify(other.url)})`), `${K}: links to the other concept`);
  check(desk.consoleErrors.length === 0 && phone.consoleErrors.length === 0, `${K}: no console errors during interaction (${[...desk.consoleErrors, ...phone.consoleErrors].slice(0, 3).join(" | ")})`);
  await desk.close(); await phone.close();
}

// ------------------------------------------------------------------ 3. screenshots
async function eagerImages(p) {
  await p.$(`Promise.all([...document.images].map((i) => { i.loading = "eager"; return i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); }); })).then(() => true)`);
  await p.ready();
  await sleep(300);
}
async function screenshots(browser) {
  mkdirSync(OUT, { recursive: true });
  const shots = [];
  for (const site of SITES) {
    const k = site.key;
    const desk = await openPage(browser, VIEWS[2]);
    const tab = await openPage(browser, VIEWS[1]);
    const phone = await openPage(browser, VIEWS[0], { dpr: 2 });
    const phoneFull = await openPage(browser, VIEWS[0]);
    const take = async (p, path, name, full = false, prep) => { await p.goto(site.root + path, 400); if (prep) await prep(p); await eagerImages(p); await p.$(`window.scrollTo(0, 0), true`); await sleep(150); await p.shot(join(OUT, name), { full }); shots.push(name); };
    await take(desk, "", `${k}-home-desktop.jpg`);
    await take(desk, "", `${k}-home-desktop-full.jpg`, true);
    await take(tab, "", `${k}-home-tablet-full.jpg`, true);
    await take(phone, "", `${k}-home-mobile.jpg`);
    await take(phoneFull, "", `${k}-home-mobile-full.jpg`, true);
    await take(desk, "network/", `${k}-network-desktop.jpg`, false, async (p) => { await p.$(`(() => { const s = document.querySelector('[data-select="node"]'); s.scrollIntoView(); return true; })()`); });
    await take(desk, "programme/gathering-at-sar/", `${k}-gathering-at-sar-desktop-full.jpg`, true);
    await take(desk, "template/", `${k}-template-desktop-full.jpg`, true);
    await take(desk, "archive/", `${k}-archive-desktop.jpg`);
    await take(phone, "about/", `${k}-about-mobile.jpg`);
    // menu open on a phone
    await phone.goto(site.root, 300);
    await phone.click(k === "a" ? ".menu-toggle" : ".bar-index");
    await sleep(200);
    await phone.shot(join(OUT, `${k}-menu-mobile.jpg`)); shots.push(`${k}-menu-mobile.jpg`);
    // the demo's review step on a phone
    await phone.goto(site.root + "contribute/", 300);
    await phone.click('[data-step="1"] [data-go="2"]'); await phone.click('[data-step="2"] [data-go="3"]');
    await phone.$(`(() => { const set = (id, v) => { document.getElementById(id).value = v; }; set("f-name", "Test Contributor"); set("f-email", "test@example.org"); set("f-aff", "Example University"); set("f-country", "Malaysia"); set("f-title", "Listening to rivers"); document.querySelector('input[name="length"][value="5 minutes"]').click(); return true; })()`);
    await phone.setFiles("#f-file", [DOCX]);
    await phone.$(`document.querySelector("[data-demo-form]").requestSubmit(), true`);
    await sleep(400);
    await phone.$(`document.querySelector('[data-step="4"]').scrollIntoView(), true`);
    await sleep(200);
    await phone.shot(join(OUT, `${k}-demo-review-mobile.jpg`)); shots.push(`${k}-demo-review-mobile.jpg`);
    for (const p of [desk, tab, phone, phoneFull]) await p.close();
  }
  // the two home pages side by side in greyscale
  const g = await browser.page({ width: 1440, height: 450 });
  const b64 = (f) => readFileSync(join(OUT, f)).toString("base64");
  await g.goto("about:blank", 100);
  await g.eval(`(() => { document.body.style.margin = "0"; document.body.innerHTML = '<div style="display:flex;filter:grayscale(1)"><img style="width:720px;height:450px" src="data:image/jpeg;base64,${b64("a-home-desktop.jpg")}"><img style="width:720px;height:450px" src="data:image/jpeg;base64,${b64("b-home-desktop.jpg")}"></div>'; return Promise.all([...document.images].map((i) => i.decode())).then(() => true); })()`);
  await g.shot(join(OUT, "greyscale-home.jpg")); shots.push("greyscale-home.jpg");
  await g.close();
  console.log(`\nsaved ${shots.length} screenshots to screenshots/`);
}

// ------------------------------------------------------------------ run
const server = LIVE ? null : await serve(PORT);
const browser = await launch(9341);
try {
  for (const site of SITES) { await auditPages(browser, site); await behaviour(browser, site); }
  if (SHOTS) await screenshots(browser);
} finally {
  await browser.close();
  server?.close();
}
console.log(`\n${passed} checks passed, ${failures.length} failed${LIVE ? " (live sites)" : ""}`);
if (failures.length) { console.log(failures.map((f) => `- ${f}`).join("\n")); process.exit(1); }
