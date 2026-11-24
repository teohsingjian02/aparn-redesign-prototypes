// Shared helpers and content partials for both prototypes.
// Pages are rendered to static HTML at build time from content/*.json, so every URL works on GitHub Pages
// (direct links and refresh) and the main content is readable without JavaScript.
import { readFileSync } from "node:fs";

export function loadContent(root) {
  const read = (n) => JSON.parse(readFileSync(new URL(`content/${n}.json`, root), "utf8"));
  const c = {
    site: read("site"), people: read("people"), events: read("events"), network: read("network"),
    contributions: read("contributions"), publications: read("publications"), template: read("template"), sources: read("sources"), deploy: read("deploy"),
  };
  c.eventById = Object.fromEntries(c.events.events.map((e) => [e.id, e]));
  c.personById = Object.fromEntries(c.people.people.map((p) => [p.id, p]));
  c.sourceById = Object.fromEntries(c.sources.sources.map((s) => [s.id, s]));
  c.placeById = Object.fromEntries(c.network.places.map((p) => [p.id, p]));
  c.practiceById = Object.fromEntries(c.network.practices.map((p) => [p.id, p]));
  c.outputById = Object.fromEntries(c.network.outputs.map((p) => [p.id, p]));
  c.regional = c.events.events.filter((e) => e.kind === "regional");
  c.sarEvents = c.events.events.filter((e) => e.kind === "sar");
  return c;
}

export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Relative URL from a page (a site-relative folder such as "about/", or "" for the home page) to a site-relative target.
export function rel(page, target) {
  const depth = page.split("/").filter(Boolean).length;
  return "../".repeat(depth) + target || "./";
}

export const STATUS = {
  held: "Held", upcoming: "Upcoming", tbc: "Details to be confirmed", tba: "Details to be announced",
  proposed: "Proposed", announced: "Announced", planned: "Planned", established: "Established",
};
export const statusChip = (status, label) => `<span class="status status--${esc(status)}">${esc(label || STATUS[status] || status)}</span>`;

export function sourceLinks(c, ids, { prefix = "Source" } = {}) {
  const list = (ids || []).map((id) => c.sourceById[id]).filter(Boolean);
  if (!list.length) return "";
  const items = list.map((s) => (s.url ? `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a>` : `${esc(s.title)}`));
  return `<p class="source">${prefix}${list.length > 1 ? "s" : ""}: ${items.join("; ")}</p>`;
}

// ------------------------------------------------------------------ images (reused from aparn.net; credits in content/sources.json)
export const IMAGES = {
  eshraghi: { base: "eshraghi-reculnaissance-2020", widths: [720, 1200, 2000], w: 2000, h: 1334,
    alt: "Neon words glow across a dark wall in Léuli Eshrāghi’s installation re(cul)naissance.",
    caption: "Léuli Eshrāghi, re(cul)naissance, 2020. Installation view, 22nd Biennale of Sydney, Cockatoo Island. Commissioned by the Biennale of Sydney.",
    credit: "Courtesy the artist. Photograph: Jessica Maurer." },
  raqs: { base: "raqs-media-collective", widths: [800, 1400], w: 1400, h: 933,
    alt: "The three members of Raqs Media Collective stand outside a large building.", caption: "Raqs Media Collective opened APARN2020.", credit: "Photographer to be confirmed." },
  "victoria-hunt": { base: "victoria-hunt", widths: [720, 1200], w: 1200, h: 803,
    alt: "Two people look closely at fern fronds in a dim wooden interior.", caption: "From Victoria Hunt’s presentation at APARN2020.", credit: "Photographer to be confirmed." },
  "leuli-portrait": { base: "leuli-eshraghi-portrait", widths: [560, 900], w: 900, h: 1350,
    alt: "Portrait of Léuli Eshrāghi wearing a long beaded necklace.", caption: "Dr Léuli Eshrāghi spoke at APARN2020 and convened its First Peoples Research Forum.", credit: "Photo by Rhett Hammerton." },
  "lisa-hilli": { base: "lisa-hilli", widths: [600, 1000], w: 1000, h: 666,
    alt: "Portrait of Lisa Hilli against a leafy patterned background.", caption: "Lisa Hilli spoke at APARN2020.", credit: "Photo by Atong Atem." },
  "yuki-kihara": { base: "yuki-kihara", widths: [720, 1200], w: 1200, h: 829,
    alt: "Portrait of Yuki Kihara in front of carved wood and greenery.", caption: "Yuki Kihara spoke at APARN2020.", credit: "Photo by Evotia Tamua." },
  "natalie-king": { base: "natalie-king", widths: [560, 900], w: 900, h: 900,
    alt: "Portrait of Natalie King in a floral dress against a pink background.", caption: "Professor Natalie King spoke at APARN2020.", credit: "Photo by Giulia McGauran." },
  aparn2021: { base: "aparn2021-leaves", widths: [720, 1200], w: 1200, h: 674,
    alt: "Fresh green leaves and fern fronds with clusters of red berries.", caption: "Image from the APARN2021 page.", credit: "Credit to be confirmed." },
};

export function img(page, id, { sizes = "100vw", cls = "", eager = false, alt } = {}) {
  const m = IMAGES[id];
  const srcset = m.widths.map((w) => `${rel(page, `assets/img/${m.base}-${w}.webp`)} ${w}w`).join(", ");
  const mid = m.widths[Math.min(1, m.widths.length - 1)];
  return `<img class="${cls}" src="${rel(page, `assets/img/${m.base}-${mid}.webp`)}" srcset="${srcset}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt ?? m.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
export function figure(page, id, opts = {}) {
  const m = IMAGES[id];
  return `<figure class="${opts.figCls || "fig"}">${img(page, id, opts)}<figcaption><span class="cap">${esc(m.caption)}</span> <span class="credit">${esc(m.credit)}</span></figcaption></figure>`;
}

// ------------------------------------------------------------------ links and small shared pieces
export const EXT = `<span class="ext-mark" aria-hidden="true">↗</span>`;
export const ext = (url, text, cls = "") => `<a class="${cls}" href="${esc(url)}" rel="noopener" target="_blank">${text}${EXT}<span class="vh"> (opens in a new tab)</span></a>`;

export function joinButton(c, cls = "btn btn--join", { note = false } = {}) {
  const j = c.site.join;
  return `<a class="${cls}" href="${esc(j.url)}" rel="noopener" target="_blank" data-join>${esc(j.label)}<span class="vh"> (opens Google Groups in a new tab)</span></a>` +
    (note ? `<p class="join-where">${esc(j.where)}</p>` : "");
}

export function templateButton(c, page, concept, cls = "btn btn--template") {
  return `<a class="${cls}" href="${rel(page, `${concept}template/`)}" data-template-link>${esc(c.template.buttonLabel)}</a>`;
}

// `concept` is the path prefix of a concept inside its site: "" when the concept is the whole site.
export function eventPath(concept, e) { return `${concept}archive/${e.id}/`; }

export function dateRange(e) { return e.dates.display; }

export function nodeIndex(c) {
  // All explorer nodes with their type, label and relations (both directions).
  const nodes = {};
  for (const p of c.people.people) nodes[p.id] = { id: p.id, type: "person", label: p.name, sub: p.institution };
  for (const p of c.network.places) nodes[p.id] = { id: p.id, type: "place", label: p.label, sub: [p.country, p.kinds.map((k) => c.network.placeKinds[k]).join(" · ")].filter(Boolean).join(" · ") };
  for (const e of c.events.events) nodes[e.id] = { id: e.id, type: "activity", label: e.label, sub: e.title };
  for (const t of c.network.practices) nodes[t.id] = { id: t.id, type: "practice", label: t.label, sub: t.text };
  for (const o of c.network.outputs) nodes[o.id] = { id: o.id, type: "output", label: o.label, sub: o.kind };
  const links = Object.fromEntries(Object.keys(nodes).map((k) => [k, new Set()]));
  for (const [a, b] of c.network.links) {
    if (!nodes[a] || !nodes[b]) throw new Error(`network link to unknown node: ${a} – ${b}`);
    links[a].add(b); links[b].add(a);
  }
  return { nodes, links: Object.fromEntries(Object.entries(links).map(([k, v]) => [k, [...v]])) };
}

export function nodeHref(c, concept, page, id) {
  if (c.eventById[id]) return rel(page, eventPath(concept, c.eventById[id]));
  if (c.personById[id]) return rel(page, `${concept}about/#${id}`);
  if (c.outputById[id]?.url) return c.outputById[id].url;
  return null;
}

// The detail panel shown in both explorers when a node is selected (same content, concept CSS differs).
export function nodePanel(c, concept, page, idx, id, tag = "article") {
  const n = idx.nodes[id];
  const typeName = { person: "Person", place: "Place", activity: "Activity", practice: "Practice", output: "Output" }[n.type];
  let body = "", srcIds = [];
  if (n.type === "person") { const p = c.personById[id]; body = `<p class="panel-roles">${p.roles.map(esc).join(" · ")}</p><p>${esc(p.bio)}</p>`; srcIds = p.sources; }
  if (n.type === "place") { const p = c.placeById[id]; body = `<p class="panel-kinds">${p.kinds.map((k) => `<span class="kind kind--${k}">${esc(c.network.placeKinds[k])}</span>`).join(" ")}</p><p>${esc(p.text)}</p>`; srcIds = p.sources; }
  if (n.type === "activity") { const e = c.eventById[id]; body = `<p class="panel-meta">${statusChip(e.status, e.statusLabel)} <span>${esc(e.dates.display)}</span> <span>${esc([e.place.city, e.place.country].filter((x, i, a) => x && a.indexOf(x) === i).join(", "))}</span></p><p>${esc(e.summary)}</p>`; srcIds = e.sources; }
  if (n.type === "practice") { const t = c.practiceById[id]; body = `<p>${esc(t.text)}</p>`; srcIds = t.sources; }
  if (n.type === "output") { const o = c.outputById[id]; body = `<p class="panel-meta"><span>${esc(o.kind)}</span></p><p>${esc(o.text)}</p>`; srcIds = o.sources; }
  const groups = { person: [], place: [], activity: [], practice: [], output: [] };
  for (const r of idx.links[id]) groups[idx.nodes[r].type].push(r);
  const groupNames = { person: "People", place: "Places", activity: "Activities", practice: "Practices", output: "Outputs" };
  const notes = c.network.linkNotes || {};
  const rel_ = Object.entries(groups).filter(([, v]) => v.length).map(([t, ids]) => `<div class="panel-group"><h4>${groupNames[t]}</h4><ul>${ids.map((r) => {
    const href = nodeHref(c, concept, page, r);
    const note = notes[`${id}|${r}`] || notes[`${r}|${id}`];
    const label = esc(idx.nodes[r].label) + (note ? ` <span class="panel-note">(${esc(note)})</span>` : "");
    const isExt = href && href.startsWith("http");
    return `<li>${href ? (isExt ? ext(href, label) : `<a href="${href}">${label}</a>`) : label}</li>`;
  }).join("")}</ul></div>`).join("");
  return `<${tag} class="panel" data-select-panel="${esc(id)}" aria-labelledby="panel-${esc(id)}-h" tabindex="-1">
  <p class="panel-type">${typeName}</p><h3 id="panel-${esc(id)}-h">${esc(n.label)}</h3>${body}
  <div class="panel-related"><h4 class="vh">Connected to</h4>${rel_ || "<p>No documented connections yet.</p>"}</div>
  ${sourceLinks(c, srcIds)}</${tag}>`;
}

// ------------------------------------------------------------------ research contributions (JAR channel) with filters
export function contributionsFilter(c, { idPrefix = "jar", compact = false, limit = null } = {}) {
  const { editions, kinds, items } = c.contributions;
  const list = limit ? items.slice(0, limit) : items;
  const buttons = [["all", "All"], ...Object.keys(editions).map((k) => [k, k === "jar-regional" ? "From JAR" : k.replace("aparn", "APARN")])];
  return `<div class="filter" data-filter>
  <div class="filter-controls">
    <div class="filter-buttons" role="group" aria-label="Show contributions from">
      ${buttons.map(([v, l], i) => `<button type="button" class="chip" data-filter-value="${v}" aria-pressed="${i === 0}">${esc(l)}</button>`).join("")}
    </div>
    <label class="filter-search"><span>Search titles and authors</span><input type="search" data-filter-search placeholder="e.g. voice, clay, Matsunami" autocomplete="off"></label>
  </div>
  <p class="filter-count" data-filter-count aria-live="polite">${list.length} pieces</p>
  <ul class="contribs${compact ? " contribs--compact" : ""}">
  ${list.map((it) => `<li class="contrib" data-filter-item data-tags="${esc(it.edition)}" data-text="${esc((it.title + " " + it.authors).toLowerCase())}">
    <a href="${esc(it.url)}" rel="noopener" target="_blank"><span class="contrib-edition">${esc(editions[it.edition])}</span><span class="contrib-title">${esc(it.title)}</span><span class="contrib-authors">${esc(it.authors || "APARN2025 conference team")}</span><span class="contrib-kind">${esc(kinds[it.kind])}${EXT}</span><span class="vh"> (opens the Journal for Artistic Research in a new tab)</span></a></li>`).join("\n  ")}
  </ul>
  <div class="filter-empty" data-filter-empty hidden><p><strong>No pieces match that.</strong> Try another word, or <button type="button" class="linkish" data-filter-reset>show all pieces</button>.</p></div>
  ${sourceLinks(c, ["jar-channel"], { prefix: "List from" })}
</div>`;
}

// ------------------------------------------------------------------ the shared template preview (mirrors the DOCX)
export const templateLimitsLine = (t) => `Aim for ${t.limits.pages.toLowerCase()}: ${t.limits.words} and ${t.limits.images.toLowerCase()} (draft limits, still under review).`;
export function templatePreview(c) {
  const t = c.template;
  return `<article class="tpl-doc" aria-labelledby="tpl-h">
  <header class="tpl-head"><p class="tpl-kicker">${esc(t.versionShort)}</p><h2 id="tpl-h">${esc(t.title)}</h2><p class="tpl-sub">${esc(t.subtitle)}.</p></header>
  <div class="tpl-intro"><p>${esc(t.intro)}</p><p>${esc(templateLimitsLine(t))} Please leave out email addresses: your contact details go in the submission form.</p></div>
  <ol class="tpl-sections">
  ${t.sections.map((s) => `<li class="tpl-section"><h3><span class="tpl-n">${s.n}</span> ${esc(s.title)}</h3>
    <p class="tpl-guidance">${s.words ? `<span class="tpl-words">${esc(s.words)}</span> ` : ""}${esc(s.guidance)}</p>
    ${s.fields ? `<ul class="tpl-fields">${s.fields.map((f) => `<li>${esc(f)}: <span class="tpl-blank" aria-hidden="true"></span></li>`).join("")}</ul>` : `<p class="tpl-placeholder">${esc(s.placeholder || "")}</p>`}</li>`).join("\n  ")}
  </ol>
</article>`;
}

export function presentationGuide(c, headingLevel = 3) {
  const p = c.template.presentation;
  const h = `h${headingLevel}`;
  return `<div class="guide"><${h}>${esc(p.title)}</${h}><p>${esc(p.intro)}</p>
  <table class="guide-table"><caption class="vh">Suggested timing for a 5- or 10-minute update</caption>
  <thead><tr><th scope="col">Part</th><th scope="col">From your contribution</th><th scope="col">5-minute update</th><th scope="col">10-minute update</th></tr></thead>
  <tbody>${p.parts.map((x, i) => `<tr><th scope="row"><span class="guide-n">${i + 1}</span> ${esc(x.title)}</th><td>${esc(x.from)}</td><td>${esc(x.five)}</td><td>${esc(x.ten)}</td></tr>`).join("")}</tbody></table>
  <p class="guide-note">${esc(p.note)}</p></div>`;
}

export function downloads(c, page, cls = "downloads") {
  const f = c.template.files;
  return `<div class="${cls}">
  <a class="btn btn--download" href="${rel(page, `downloads/${f.docx}`)}" download>Download template (DOCX, editable)</a>
  <a class="btn btn--ghost" href="${rel(page, `downloads/${f.pdf}`)}">Reading copy (PDF)</a>
</div>`;
}

// ------------------------------------------------------------------ the shared submission demonstration
export function submissionDemo(c, page, concept) {
  const t = c.template;
  return `<section class="demo" data-submit-demo aria-labelledby="demo-h">
  <h2 id="demo-h" class="demo-title">Send your contribution</h2>
  <p class="demo-banner" role="note"><strong>Prototype demo:</strong> nothing is uploaded or submitted.</p>
  <ol class="demo-steps">
    <li data-step-indicator="1" aria-current="step"><span>1</span> Download template</li>
    <li data-step-indicator="2"><span>2</span> Prepare contribution</li>
    <li data-step-indicator="3"><span>3</span> Add submission details</li>
    <li data-step-indicator="4"><span>4</span> Review</li>
  </ol>
  <noscript><p class="demo-noscript">This demonstration needs JavaScript. Everything else on the page works without it.</p></noscript>
  <form class="demo-form" novalidate data-demo-form>
    <fieldset data-step="1" class="demo-step">
      <legend>Step 1 of 4: Download the template</legend>
      <p>${esc(t.dual)}</p>
      ${downloads(c, page)}
      <p class="demo-hint">Already have your contribution ready? Skip ahead.</p>
      <div class="demo-nav"><button type="button" class="btn btn--primary" data-go="2">Next: prepare your contribution</button></div>
    </fieldset>
    <fieldset data-step="2" class="demo-step" hidden>
      <legend>Step 2 of 4: Prepare your contribution</legend>
      <p>Fill in the eight sections: about two pages, 400–600 words and one or two images (draft limits for review). You will use this same file for your 5–10-minute update and, if you choose, the year-end collection.</p>
      <ul class="demo-checklist">${t.instructions.slice(1, 5).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <div class="demo-nav"><button type="button" class="btn btn--ghost" data-go="1">Back</button><button type="button" class="btn btn--primary" data-go="3">Next: add submission details</button></div>
    </fieldset>
    <fieldset data-step="3" class="demo-step" hidden>
      <legend>Step 3 of 4: Add submission details</legend>
      <div class="demo-errors" data-error-summary tabindex="-1" hidden><h3>Please check these details</h3><ul></ul></div>
      <p class="demo-required">All fields are required unless marked optional.</p>
      <div class="field"><label for="f-name">Corresponding contributor’s name</label><input id="f-name" name="name" autocomplete="name" required><p class="field-error" id="f-name-err" hidden></p></div>
      <div class="field"><label for="f-email">Email</label><p class="field-hint" id="f-email-hint">For the organisers only. It is never published.</p><input id="f-email" name="email" type="email" autocomplete="email" aria-describedby="f-email-hint" required><p class="field-error" id="f-email-err" hidden></p></div>
      <fieldset class="field field--choice" data-group="status"><legend>Affiliation</legend>
        <label><input type="radio" name="status" value="affiliated" checked> Affiliated with an institution</label>
        <div class="field field--inner" data-affiliation-field><label for="f-aff">Institution</label><input id="f-aff" name="affiliation" autocomplete="organization"><p class="field-error" id="f-aff-err" hidden></p></div>
        <label><input type="radio" name="status" value="independent"> Independent practitioner</label>
      </fieldset>
      <div class="field"><label for="f-country">Country or region of your research</label><input id="f-country" name="country" autocomplete="off"><p class="field-error" id="f-country-err" hidden></p></div>
      <div class="field"><label for="f-title">Contribution title</label><input id="f-title" name="title"><p class="field-error" id="f-title-err" hidden></p></div>
      <div class="field"><label for="f-file">Your completed template</label><p class="field-hint" id="f-file-hint">DOCX, PDF or ODT, up to 10 MB. In this demo the file stays on your device.</p><input id="f-file" name="file" type="file" accept=".docx,.pdf,.odt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.oasis.opendocument.text" aria-describedby="f-file-hint"><p class="field-error" id="f-file-err" hidden></p></div>
      <fieldset class="field field--choice" data-group="length"><legend>Preferred presentation length</legend><p class="field-hint">Subject to the programme.</p>
        <label><input type="radio" name="length" value="5 minutes"> 5 minutes</label>
        <label><input type="radio" name="length" value="10 minutes"> 10 minutes</label>
        <p class="field-error" id="f-length-err" hidden></p>
      </fieldset>
      <div class="field"><label for="f-access">Accessibility or technical requirements <span class="optional">(optional)</span></label><textarea id="f-access" name="access" rows="3"></textarea></div>
      <div class="field field--pub">
        <label class="check"><input type="checkbox" name="publication" id="f-pub"> I would like this submission to be considered for APARN’s annual publication.</label>
        <p class="field-hint">The same contribution can be prepared for the year-end collection. Editors may contact you about revisions, formatting and final approval. Selection does not guarantee acceptance or transfer copyright.</p>
      </div>
      <div class="demo-nav"><button type="button" class="btn btn--ghost" data-go="2">Back</button><button type="submit" class="btn btn--primary">Review your submission</button></div>
    </fieldset>
    <section data-step="4" class="demo-step demo-review" hidden aria-labelledby="review-h" tabindex="-1">
      <h3 id="review-h">Step 4 of 4: Review</h3>
      <p class="demo-banner" role="note"><strong>Prototype demo:</strong> nothing is uploaded or submitted.</p>
      <dl class="review-list" data-review></dl>
      <div class="demo-nav"><button type="button" class="btn btn--ghost" data-go="3">Edit details</button><button type="button" class="btn btn--primary" data-finish>Finish demo</button></div>
      <div class="demo-done" data-done hidden tabindex="-1">
        <h4>Demo complete</h4>
        <p>Nothing was uploaded or sent, and your entries have not been stored. On a live site this would create one contribution record. You would use that same record for your SAR update and, if you opted in, the year-end collection.</p>
        <button type="button" class="btn btn--ghost" data-reset>Start again</button>
      </div>
    </section>
  </form>
  <p class="demo-privacy">Your entries stay in this browser tab only. They are not saved and they disappear when you leave or reload the page.</p>
</section>`;
}

export function recordModel() {
  return [
    ["Contribution", "One record per research-progress contribution, with a version number. Corrections and new progress create a new version of the same record."],
    ["Public content", "Title, authors, affiliations or independent status, country or region, the completed template and images. No email addresses."],
    ["Private contact", "Corresponding contributor’s name and email, for the organisers only."],
    ["Presentation", "Preferred length (5 or 10 minutes), programme status (received, scheduled, presented) and any access or technical needs."],
    ["Publication", "Opt-in preference, recorded on its own; editorial status (not requested, in review, revisions requested, approved)."],
    ["Permissions", "Image permissions, consent to record the talk and consent to show contact details, each asked for and recorded separately."],
  ];
}

export function assertNoEmDash(html, where) {
  const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
  if (text.includes("\u2014")) throw new Error(`em dash found in ${where}: …${text.slice(Math.max(0, text.indexOf("\u2014") - 60), text.indexOf("\u2014") + 20)}…`);
}
