// Concept B: Living Network. Exploration first, in the manner of a digital exhibition: pick a person, a place,
// an activity or a practice, see what lights up, then join, share and publish.
import {
  esc, rel, statusChip, sourceLinks, img, figure, ext, EXT, joinButton, templateButton, eventPath, nodeIndex, nodePanel,
  contributionsFilter, templatePreview, templateLimitsLine, presentationGuide, downloads, submissionDemo, recordModel, IMAGES,
} from "../lib.mjs";

const C = ""; // Concept B is the whole of its own site, so its pages sit at the site root
const P = (p = "") => C + p;
const evPlace = (e) => [e.place.city, e.place.country].filter((x, i, a) => x && a.indexOf(x) === i).join(", ");

// ------------------------------------------------------------------ original graphics: edition posters
const TONES = { 2019: "jade", 2020: "lacquer", 2021: "turmeric", 2022: "jade", 2023: "night", 2024: "lacquer", 2025: "turmeric", 2026: "jade", 2027: "paper" };
const SHAPES = ["circle", "half", "bars", "ring", "split"];
function poster(e, practice, { size = "" } = {}) {
  const tone = e.kind === "sar" ? "night" : (TONES[e.year] || "paper");
  const shape = SHAPES[(e.year + (e.kind === "sar" ? 2 : 0)) % SHAPES.length];
  return `<div class="poster-card tone-${tone} shape-${shape}${size ? ` poster-card--${size}` : ""}${e.status !== "held" ? " is-open" : ""}" aria-hidden="true">
  <span class="pc-shape"></span>
  <span class="pc-k">${esc(e.kind === "sar" ? "APARN at SAR" : "APARN Conference")}</span>
  <span class="pc-year">${e.year}</span>
  <span class="pc-theme">${esc(practice ? practice.label : e.title)}</span>
  <span class="pc-place">${esc(e.place.city)}</span>
</div>`;
}

// ------------------------------------------------------------------ page shell
const INDEX = [
  ["Explore", [["network/", "The network"], ["archive/", "Archive"], ["about/", "About APARN"]]],
  ["Take part", [["programme/", "Programme"], ["programme/conference/", "APARN Conference"], ["programme/gathering-at-sar/", "Gathering at the SAR Conference"]]],
  ["Publish", [["publication/", "Annual Publication"], ["template/", "Template for Annual Publication"], ["contribute/", "Send a contribution (demo)"]]],
];
function shell(c, page, { title, description, active, body }) {
  return `<!doctype html>
<html lang="en" class="concept-b">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} · APARN · Concept B prototype</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#121212">
<link rel="icon" href="${rel(page, P("assets/icon.svg"))}" type="image/svg+xml">
<link rel="preload" href="${rel(page, "assets/fonts/archivo-normal-latin-3.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel(page, P("assets/b.css"))}">
<script>document.documentElement.classList.add("js")</script>
<script defer src="${rel(page, "assets/js/aparn.js")}"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="proto">${esc(c.site.prototypeLabel)} / <strong>Concept B: Living Network</strong> / <a href="${rel(page, "compare/")}">Compare all three concepts</a></div>
<header class="bar">
  <a class="bar-mark" href="${rel(page, P(""))}"><span class="bar-aparn">APARN</span><span class="bar-full">Asia Pacific Artistic Research Network</span></a>
  <nav class="bar-quick" aria-label="Quick links">
    <a href="${rel(page, P("network/"))}"${active === "network/" ? ' aria-current="page"' : ""}>Explore</a>
    <a href="${rel(page, P("programme/"))}"${active === "programme/" ? ' aria-current="page"' : ""}>Take part</a>
    <a href="${rel(page, P("publication/"))}"${active === "publication/" ? ' aria-current="page"' : ""}>Publish</a>
  </nav>
  ${joinButton(c, "btn btn--join bar-join")}
  <button class="bar-index" type="button" data-nav-toggle aria-expanded="false" aria-controls="index-menu"><span class="bar-index-l">Index</span><span class="bar-index-i" aria-hidden="true"></span></button>
</header>
<div class="index-menu" id="index-menu" data-nav-overlay>
  <div class="index-inner">
    <p class="index-k mono">Index</p>
    <div class="index-cols">${INDEX.map(([h, items]) => `<div class="index-col"><h2 class="index-h">${h}</h2><ul>${items.map(([href, l]) => `<li><a href="${rel(page, P(href))}"${active === href ? ' aria-current="page"' : ""}>${esc(l)}</a></li>`).join("")}</ul></div>`).join("")}</div>
    <div class="index-join">${joinButton(c, "btn btn--join btn--xl")}<p>${esc(c.site.join.where)} ${esc(c.site.join.who)}</p></div>
    <button class="index-close" type="button" data-nav-close>Close index</button>
  </div>
</div>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="foot">
  <div class="foot-band">
    <p class="foot-big">APARN</p>
    <p class="foot-sub mono">Asia Pacific Artistic Research Network / a Special Interest Group of the Society for Artistic Research</p>
  </div>
  <div class="foot-grid">
    <div><h2 class="foot-h mono">Join</h2>${joinButton(c, "btn btn--join")}<p class="small">${esc(c.site.join.where)}</p></div>
    <div><h2 class="foot-h mono">Contact</h2><p>${esc(c.site.contact.general.name)}, ${esc(c.site.contact.general.role)}<br><a href="mailto:${esc(c.site.contact.general.email)}">${esc(c.site.contact.general.email)}</a></p><p><a href="${rel(page, P("about/#contact"))}">All contacts</a></p></div>
    <div><h2 class="foot-h mono">Elsewhere</h2><ul class="foot-list">
      <li>${ext("https://jar-online.net/en/channels/asia-pacific-artistic-research-network", "APARN in JAR")}</li>
      <li>${ext("https://societyforartisticresearch.org/sigs/asia-pacific-artistic-research-network", "APARN at SAR")}</li>
      <li>${ext("https://sar2027.eu/sk", "SAR 2027")}</li>
      <li>${ext(c.site.officialSite, "Current aparn.net")}</li></ul></div>
    <div><h2 class="foot-h mono">This prototype</h2><p class="small">A redesign proposal for discussion. Content checked ${esc(c.site.lastChecked)}.</p><ul class="foot-list">
      <li><a href="${rel(page, "sources/")}">Sources, credits and open questions</a></li><li><a href="${esc(c.deploy.sites.a.url)}">See Concept A: Editorial Gallery</a></li><li><a href="${esc(c.deploy.sites.c.url)}">See Concept C: Clear Signal</a></li></ul></div>
  </div>
</footer>
</body>
</html>`;
}

// ------------------------------------------------------------------ shared blocks for concept B
function board(c, page, { initial = "aparn2025", id = "explore", heading = "Explore the network" } = {}) {
  const idx = nodeIndex(c);
  const cols = [
    ["person", "People", c.people.people.map((p) => p.id)],
    ["place", "Places", c.network.places.map((p) => p.id)],
    ["activity", "Activities", [...c.events.events].sort((a, b) => a.year - b.year || (a.kind === "sar") - (b.kind === "sar")).map((e) => e.id)],
    ["practice", "Practices and outputs", [...c.network.practices.map((p) => p.id), ...c.network.outputs.map((o) => o.id)]],
  ];
  const btn = (nid) => {
    const n = idx.nodes[nid];
    const st = n.type === "activity" ? c.eventById[nid].status : "";
    return `<li><button type="button" class="nd nd--${n.type}${st && st !== "held" ? " nd--open" : ""}" data-select-button="${nid}" data-select-group="node" data-label="${esc(n.label)}" data-links="${idx.links[nid].join(" ")}" aria-pressed="false"><span class="nd-l">${esc(n.label)}</span>${n.type === "activity" ? `<span class="nd-s">${esc(evPlace(c.eventById[nid]))}</span>` : ""}</button></li>`;
  };
  return `<section class="board" id="${id}" aria-labelledby="h-${id}" data-select="node" data-board data-select-initial="${initial}" data-select-focus>
  <div class="board-head">
    <h2 id="h-${id}" class="disp">${esc(heading)}</h2>
    <p class="board-intro">Pick a person, a place, an activity or a practice. Everything it connects to lights up, and its story opens.</p>
    <div class="board-types" role="group" aria-label="Show or hide columns">${cols.map(([t, l]) => `<button type="button" class="chip" data-board-type="${t}" aria-pressed="true">${esc(l)}</button>`).join("")}</div>
  </div>
  <div class="board-body">
    <div class="board-grid" data-board-grid>
      <svg class="board-lines" data-board-lines aria-hidden="true" focusable="false"></svg>
      ${cols.map(([t, l, ids]) => `<div class="board-col board-col--${t}" data-board-col="${t}"><h3 class="board-col-h mono">${esc(l)}</h3><ul data-select-list>${ids.map(btn).join("")}</ul></div>`).join("")}
    </div>
    <div class="board-panel">
      <p class="vh" data-select-live="node" aria-live="polite"></p>
      ${Object.keys(idx.nodes).map((nid) => nodePanel(c, C, page, idx, nid).replace('class="panel"', 'class="panel" data-select-group="node"')).join("\n")}
    </div>
  </div>
  <p class="board-note mono">${esc(c.site.reachNote)}</p>
</section>`;
}
function numbers(c) {
  return `<section class="numbers" aria-labelledby="h-numbers"><h2 id="h-numbers" class="vh">APARN in numbers</h2>
  <dl class="nums">${c.site.evidence.map((x) => `<div class="num num--${x.kind}"><dt class="num-v">${esc(x.value)}</dt><dd><span class="num-l">${esc(x.label)}</span><span class="num-d mono">${esc(x.date)}</span><span class="num-n">${esc(x.note)}</span></dd></div>`).join("")}</dl></section>`;
}
function benefitTiles(c) {
  return `<ul class="tiles">${c.site.benefits.map((b, i) => `<li class="tile tile--${i % 5}"><h3 class="tile-h">${esc(b.title)}</h3><p>${esc(b.text)}</p><p class="tile-proof mono">${esc(b.proof)}</p></li>`).join("")}</ul>`;
}
function joinBand(c, { heading = "Join APARN", lead } = {}) {
  return `<section class="join-band" aria-labelledby="jb-${heading.length}"><h2 id="jb-${heading.length}" class="join-band-h">${esc(heading)}</h2>
  <div class="join-band-body"><p>${esc(lead || c.site.join.benefit)}</p>${joinButton(c, "btn btn--join btn--xl")}<p class="mono small">${esc(c.site.join.where)}</p></div></section>`;
}
function workflowB(c, page) {
  return `<div class="flowb">
  <ol class="flowb-steps">
    <li class="flowb-step"><span class="flowb-n">1</span><span class="flowb-t">Prepare one contribution</span><span class="flowb-s">About two pages, from the shared template.</span></li>
    <li class="flowb-step"><span class="flowb-n">2</span><span class="flowb-t">Share a 5–10-minute update at SAR</span><span class="flowb-s">Present it at the APARN Gathering.</span></li>
    <li class="flowb-step"><span class="flowb-n">3</span><span class="flowb-t">Opt in to the year-end collection</span><span class="flowb-s">The same contribution, if you choose.</span></li>
  </ol>
  <div class="flowb-actions">${templateButton(c, page, C, "btn btn--template btn--xl")}<p>${esc(c.template.dual)}</p><a class="btn btn--line" href="${rel(page, P("contribute/"))}">Try the submission demo</a></div>
</div>`;
}
function waysB(c, page) {
  const n27 = c.eventById.aparn2027, s27 = c.eventById.sar2027;
  return `<div class="ways-b">
  <a class="wayb wayb--conf" href="${rel(page, P("programme/conference/"))}"><span class="mono">Every year, in the region</span><span class="wayb-h">APARN Conference</span><span class="wayb-p">Hosted by a different institution each year.</span><span class="wayb-next">Next: APARN2027, RMIT University Vietnam ${statusChip(n27.status)}</span></a>
  <a class="wayb wayb--sar" href="${rel(page, P("programme/gathering-at-sar/"))}"><span class="mono">Every year, at SAR</span><span class="wayb-h">Gathering at the SAR Conference</span><span class="wayb-p">Short research updates of 5–10 minutes.</span><span class="wayb-next">Next: SAR 2027, Bratislava ${statusChip(s27.status)}</span></a>
  <a class="wayb wayb--pub" href="${rel(page, P("publication/"))}"><span class="mono">At the end of each year</span><span class="wayb-h">Annual Publication</span><span class="wayb-p">Members’ research in progress, collected.</span><span class="wayb-next">${statusChip("proposed")}</span></a>
</div>`;
}
const pageHead = (kicker, title, lead, extra = "") => `<header class="head"><p class="head-k mono">${kicker}</p><h1 class="head-h">${title}</h1>${lead ? `<p class="head-lede">${lead}</p>` : ""}${extra}</header>`;

// ------------------------------------------------------------------ pages
function home(c) {
  const page = P("");
  const strip = c.contributions.items.filter((x) => x.edition === "aparn2026");
  const n27 = c.eventById.aparn2027;
  const speakers = ["leuli-portrait", "yuki-kihara", "lisa-hilli", "natalie-king"];
  const body = `
<section class="opener">
  <div class="opener-type">
    <p class="opener-k">An artistic research network since 2019, and part of the Society for Artistic Research.</p>
    <h1 class="opener-h"><span>Meet the people.</span> <span>Explore the work.</span></h1>
    <p class="opener-lede">${esc(c.site.messages.lede)}</p>
    <div class="opener-actions">${joinButton(c, "btn btn--join btn--xl")}<a class="btn btn--line" href="#explore">Start exploring</a></div>
    <p class="mono small">${esc(c.site.join.where)}</p>
  </div>
  <div class="opener-art">
    <span class="opener-block" aria-hidden="true"></span>
    ${figure(page, "eshraghi", { sizes: "(min-width: 64em) 44vw, 100vw", eager: true, figCls: "opener-fig" })}
  </div>
  <div class="tickets" aria-label="Coming up">
    <p class="ticket ticket--next"><span class="mono">Next conference</span><strong>APARN2027 / RMIT University Vietnam</strong>${statusChip(n27.status)}</p>
    <p class="ticket"><span class="mono">Next SAR Conference</span><strong>SAR 2027 / Bratislava / 21–23 April 2027</strong>${ext("https://sar2027.eu/sk", "sar2027.eu")}</p>
  </div>
</section>
${board(c, page)}
<section class="strip" data-strip aria-labelledby="h-strip">
  <div class="strip-head"><p class="mono">Now showing</p><h2 id="h-strip" class="disp">Research from Singapore, 2026</h2>
  <p>Fourteen contributions from ADPRex × APARN 2026, already published in APARN’s channel of the Journal for Artistic Research.</p>
  <div class="strip-ctrl"><button type="button" class="strip-btn" data-strip-move="-1"><span class="vh">Scroll back</span><span aria-hidden="true">←</span></button><button type="button" class="strip-btn" data-strip-move="1"><span class="vh">Scroll forward</span><span aria-hidden="true">→</span></button></div></div>
  <ul class="strip-track" data-strip-track tabindex="0" aria-label="Contributions from 2026">${strip.map((it, i) => `<li class="card card--${i % 4}"><a href="${esc(it.url)}" rel="noopener" target="_blank"><span class="card-t">${esc(it.title)}</span><span class="card-a">${esc(it.authors)}</span><span class="card-x mono">Read in JAR${EXT}</span><span class="vh"> (opens the Journal for Artistic Research in a new tab)</span></a></li>`).join("")}</ul>
  <p class="strip-all"><a class="btn btn--line" href="${rel(page, P("network/#research"))}">All 28 pieces in the channel</a></p>
</section>
${numbers(c)}
<section class="voices" aria-labelledby="h-voices">
  <h2 id="h-voices" class="disp">The people</h2>
  <div class="voices-grid">
    <div class="voices-conv"><h3 class="mono">Director and convenors</h3>
    <ul class="conv">${c.people.people.map((p) => `<li><a href="${rel(page, P(`about/#${p.id}`))}"><span class="conv-n">${esc(p.name)}</span><span class="conv-r mono">${esc(p.roles[0])}</span><span class="conv-i">${esc(p.institution)}</span></a></li>`).join("")}</ul></div>
    <div class="voices-2020"><h3 class="mono">Voices from APARN2020</h3>
    <ul class="faces">${speakers.map((id) => `<li>${figure(page, id, { sizes: "(min-width: 64em) 18vw, 45vw", figCls: "face" })}</li>`).join("")}</ul></div>
  </div>
</section>
<section class="why-b" aria-labelledby="h-whyb">
  <h2 id="h-whyb" class="disp">Why join APARN</h2>
  ${benefitTiles(c)}
  <div class="why-b-join">${joinButton(c, "btn btn--join btn--xl")}<p>${esc(c.site.join.benefit)} ${esc(c.site.join.where)}</p></div>
</section>
<section class="part" aria-labelledby="h-partb">
  <p class="mono">Take part</p>
  <h2 id="h-partb" class="disp">${esc(c.site.messages.contribute)}</h2>
  <p class="part-line">${esc(c.site.messages.contributeLine)}</p>
  ${workflowB(c, page)}
  ${waysB(c, page)}
</section>
${joinBand(c)}`;
  return { page, title: "Home", description: c.site.messages.lede, active: "", body };
}

function about(c) {
  const page = P("about/");
  const body = `
${pageHead("About", "About APARN", esc(c.site.about.intro))}
<section class="band band--night" aria-labelledby="h-sarb">
  <h2 id="h-sarb" class="disp">Part of the Society for Artistic Research</h2>
  <div class="band-cols"><p>${esc(c.site.messages.sar)}</p><p>${esc(c.site.messages.jar)}</p><p>${esc(c.site.about.open)}</p></div>
  <p>${ext("https://societyforartisticresearch.org/sigs/asia-pacific-artistic-research-network", "APARN on the SAR website", "btn btn--line btn--light")}</p>
</section>
<section class="sec-b" aria-labelledby="h-aims">
  <h2 id="h-aims" class="disp">What we are here to do</h2>
  <ol class="aims">${c.site.about.purposes.map((p, i) => `<li><span class="aims-n">${i + 1}</span><span>${esc(p)}</span></li>`).join("")}</ol>
  <p class="small">${esc(c.site.about.volunteer)}</p>
</section>
<section class="sec-b" aria-labelledby="h-histb">
  <h2 id="h-histb" class="disp">How it began</h2>
  <ol class="hist-b">${c.site.about.history.map((h) => `<li><span class="hist-d">${esc(h.date)}</span><span class="hist-t">${esc(h.text)}</span></li>`).join("")}</ol>
  <p class="small">${esc(c.people.firstMeeting.text)}</p>
  ${sourceLinks(c, c.site.about.sources)}
</section>
<section class="sec-b" aria-labelledby="h-peopleb">
  <h2 id="h-peopleb" class="disp">Director and convenors</h2>
  <p class="small">The convenors look after the network. Each conference also has its own organising team, listed in the <a href="${rel(page, P("archive/"))}">archive</a>.</p>
  <div class="people-b">${c.people.people.map((p, i) => `<article class="pb pb--${i}" id="${p.id}"><p class="pb-country mono">${esc(p.country)}</p><h3 class="pb-name">${esc(p.honorific)} ${esc(p.name)}</h3><p class="pb-roles mono">${p.roles.map(esc).join(" / ")}</p><p class="pb-inst">${esc(p.institution)}</p><p>${esc(p.bio)}</p>
    <details class="pb-more"><summary>Work with APARN</summary><ul>${p.activity.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>${sourceLinks(c, p.sources)}</details>
    <p><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p></article>`).join("")}</div>
</section>
<section class="sec-b" id="contact" aria-labelledby="h-contactb">
  <h2 id="h-contactb" class="disp">Contact</h2>
  <p>${esc(c.site.contact.intro)}</p>
  <p class="contact-b"><strong>${esc(c.site.contact.general.name)}</strong>, ${esc(c.site.contact.general.role)} / <a href="mailto:${esc(c.site.contact.general.email)}">${esc(c.site.contact.general.email)}</a></p>
  <p class="small">${esc(c.site.contact.note)}</p>
</section>
${joinBand(c)}`;
  return { page, title: "About", description: "About APARN, its Director and convenors.", active: "about/", body };
}

function network(c) {
  const page = P("network/");
  const kinds = Object.keys(c.network.placeKinds);
  const body = `
${pageHead("The network", "Across the network", "APARN connects researchers, artists and institutions across the Asia Pacific and beyond. Explore how people, places, activities and practices connect.")}
${board(c, page, { initial: "yogyakarta", id: "explore-net", heading: "Choose anything" })}
<section class="sec-b" aria-labelledby="h-places">
  <h2 id="h-places" class="disp">Places, by what happened there</h2>
  <p class="small">${esc(c.site.reachNote)}</p>
  <div class="placegrid">${kinds.map((k) => {
    const list = c.network.places.filter((p) => p.kinds.includes(k));
    return `<div class="pg pg--${k}"><h3 class="pg-h mono">${esc(c.network.placeKinds[k])}</h3><ul>${list.map((p) => `<li><strong>${esc(p.label)}</strong>${p.country && p.country !== p.label ? `, ${esc(p.country)}` : ""}</li>`).join("")}</ul></div>`;
  }).join("")}
  <div class="pg pg--members"><h3 class="pg-h mono">Member locations</h3><p>Not published. The Google Group is private; approved figures can be added here later.</p></div></div>
</section>
${numbers(c)}
<section class="sec-b" id="research" aria-labelledby="h-researchb">
  <h2 id="h-researchb" class="disp">Research in conversation</h2>
  <p>Contributions from APARN conferences in APARN’s channel of the Journal for Artistic Research. Filter by conference or search by title and author.</p>
  ${contributionsFilter(c)}
</section>
<section class="why-b" aria-labelledby="h-whyb2"><h2 id="h-whyb2" class="disp">Why join APARN</h2>${benefitTiles(c)}</section>
${joinBand(c)}`;
  return { page, title: "Network", description: "Explore the people, places, activities and practices connected through APARN.", active: "network/", body };
}

function programme(c) {
  const page = P("programme/");
  const body = `
${pageHead("Take part", "Three ways in", "Meet in the region each year, share your progress during the SAR Conference, and add your work to a year-end collection. One contribution can carry you through all three.")}
<section class="sec-b" aria-label="The three ways">${waysB(c, page)}</section>
<section class="sec-b" aria-labelledby="h-flowb"><h2 id="h-flowb" class="disp">One contribution, two uses</h2>${workflowB(c, page)}</section>
<section class="band band--paper" aria-labelledby="h-up">
  <h2 id="h-up" class="disp">Coming up</h2>
  <ul class="upcoming">
    <li><span class="mono">${esc(c.eventById.aparn2027.dates.display)}</span><strong>APARN2027 / RMIT University Vietnam</strong>${statusChip(c.eventById.aparn2027.status)}</li>
    <li><span class="mono">21–23 April 2027</span><strong>SAR 2027 / Bratislava / SAR’s 18th International Conference</strong>${statusChip("upcoming", "SAR event")}</li>
    <li><span class="mono">During SAR 2027</span><strong>APARN Gathering at SAR 2027</strong>${statusChip(c.eventById.sar2027.status)}</li>
  </ul>
  <p class="small">SAR 2027 has its own call and registration on ${ext("https://sar2027.eu/sk", "sar2027.eu")}, separate from the APARN gathering.</p>
</section>
${joinBand(c, { heading: "Hear about calls first", lead: "Calls for papers, hosting invitations and gathering details reach members through the APARN Google Group." })}`;
  return { page, title: "Programme", description: "APARN Conference, the APARN Gathering at the SAR Conference and the Annual Publication.", active: "programme/", body };
}

function conference(c) {
  const page = P("programme/conference/");
  const next = c.eventById.aparn2027;
  const body = `
${pageHead(`<a href="${rel(page, P("programme/"))}">Take part</a> / every year, in the region`, "APARN Conference", "Each year a different host opens its doors to artists, researchers, educators and communities from across the Asia Pacific, to share practices, test ideas and build friendships that last.")}
<section class="next-b" aria-labelledby="h-nextb">
  ${poster(next, null, { size: "big" })}
  <div class="next-b-body"><p class="mono">Next conference</p><h2 id="h-nextb" class="disp">APARN2027 / RMIT University Vietnam</h2>
  <p>${esc(next.summary)}</p><p>${statusChip(next.status)} City, dates, theme and call: to be announced.</p>
  ${joinButton(c, "btn btn--join btn--xl")}<p class="mono small">${esc(c.site.join.where)} Calls are shared there first.</p></div>
</section>
<section class="sec-b" aria-labelledby="h-expectb"><h2 id="h-expectb" class="disp">What to expect</h2>
  <ul class="bullets-b">
    <li>Papers, performances, creative interventions, workshops and video essays, usually 15–20 minutes each.</li>
    <li>Open to artistic researchers in the region and to those elsewhere with an interest in it.</li>
    <li>Publication in APARN’s channel of the Journal for Artistic Research; some hosts add partner journals.</li>
    <li>APARN2026 was free to attend. Travel bursaries were not available.</li>
  </ul>${sourceLinks(c, ["aparn-2024", "aparn-2025", "aparn-2026"])}
</section>
<section class="sec-b" aria-labelledby="h-hostsb"><h2 id="h-hostsb" class="disp">Where it has been</h2>
  <ol class="rows">${c.regional.filter((e) => e.status === "held").map((e) => `<li class="row row--${TONES[e.year]}"><a href="${rel(page, eventPath(C, e))}"><span class="row-y">${e.year}</span><span class="row-t">${esc(e.title)}</span><span class="row-p mono">${esc(evPlace(e))}</span></a></li>`).join("")}</ol>
</section>`;
  return { page, title: "APARN Conference", description: "The annual APARN Conference, hosted across the Asia Pacific.", active: "programme/", body };
}

function gathering(c) {
  const page = P("programme/gathering-at-sar/");
  const s25 = c.eventById.sar2025, s26 = c.eventById.sar2026, s27 = c.eventById.sar2027;
  const body = `
${pageHead(`<a href="${rel(page, P("programme/"))}">Take part</a> / every year, at SAR`, "APARN Gathering at the SAR Conference", "Each year, during the Society for Artistic Research’s conference or forum, APARN members come together online to share what they are working on, so members who cannot travel can join in.", `<div class="head-actions">${templateButton(c, page, C, "btn btn--template btn--xl")}<p>${esc(c.template.dual)}</p></div>`)}
<section class="next-b" aria-labelledby="h-s27">
  ${poster(s27, null, { size: "big" })}
  <div class="next-b-body"><p class="mono">Next</p><h2 id="h-s27" class="disp">APARN Gathering at SAR 2027</h2>
  <p>SAR’s 18th International Conference on Artistic Research, “Beyond the Familiar”, runs 21–23 April 2027 at the Academy of Performing Arts in Bratislava. Join fellow members to share where your research is now.</p>
  <p>${statusChip(s27.status)} The APARN team will confirm the date, time and format.</p>
  <p class="small">SAR 2027 has its own call (closing 25 November 2026) and registration on ${ext("https://sar2027.eu/sk", "sar2027.eu")}. The APARN gathering is separate.</p></div>
</section>
<section class="sec-b" aria-labelledby="h-fmt"><h2 id="h-fmt" class="disp">5–10 minutes. Your way.</h2>
  <p>The proposed format gives each participant about 5–10 minutes to share current research and progress. Work in progress is welcome, and so are visual, performative and sound formats.</p>
  ${presentationGuide(c)}
  <p class="small">The format and programme are subject to confirmation by APARN’s Director and organisers.</p>
</section>
<section class="sec-b" aria-labelledby="h-howb"><h2 id="h-howb" class="disp">How to take part</h2>${workflowB(c, page)}</section>
<section class="sec-b" aria-labelledby="h-pastb"><h2 id="h-pastb" class="disp">Recent gatherings</h2>
  <ol class="rows">${[s25, s26].map((e) => `<li class="row row--night"><a href="${rel(page, eventPath(C, e))}"><span class="row-y">${e.year}</span><span class="row-t">${esc(e.title)}</span><span class="row-p mono">${esc(evPlace(e))}</span></a></li>`).join("")}</ol>
</section>`;
  return { page, title: "APARN Gathering at the SAR Conference", description: "Share your research progress with APARN members during the SAR Conference.", active: "programme/", body };
}

function publication(c) {
  const page = P("publication/");
  const a = c.publications.annual;
  const body = `
${pageHead("Publish", "Publish with APARN", esc(c.site.messages.jar))}
<section class="annual-b" aria-labelledby="h-annb">
  <div class="annual-b-head"><p class="mono">${statusChip(a.status)} A proposal for review</p><h2 id="h-annb" class="disp">${esc(a.title)}</h2>
  <p>${esc(a.lede)} ${esc(a.text)}</p><div class="head-actions">${templateButton(c, page, C, "btn btn--template btn--xl")}<p>${esc(c.template.dual)}</p></div></div>
  <ol class="annual-b-steps">${a.steps.map((s, i) => `<li><span class="flowb-n">${i + 1}</span><strong>${esc(s.title)}</strong><span>${esc(s.text)}</span></li>`).join("")}</ol>
  <div class="annual-b-terms"><h3 class="mono">Good to know</h3><ul>${a.terms.map((t) => `<li>${esc(t)}</li>`).join("")}</ul><p class="small">${esc(a.context)}</p><p class="small"><strong>Still to decide:</strong> ${a.toDecide.map(esc).join("; ")}.</p></div>
</section>
<section class="sec-b" aria-labelledby="h-nowb"><h2 id="h-nowb" class="disp">Where APARN research is published now</h2>
  <div class="pubs-b">${c.publications.existing.map((p, i) => `<article class="pubb pubb--${i % 4}"><p class="mono">${esc(p.kind)}</p><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><ul class="mono">${p.meta.map((m) => `<li>${esc(m)}</li>`).join("")}</ul><p>${ext(p.url, "Visit")}</p></article>`).join("")}</div>
</section>`;
  return { page, title: "Publication", description: "The APARN Annual Publication (proposed), the JAR channel and other routes to publish.", active: "publication/", body };
}

function template(c) {
  const page = P("template/");
  const t = c.template;
  const body = `
${pageHead(`<a href="${rel(page, P("publication/"))}">Publish</a> / shared template`, esc(t.buttonLabel), esc(t.dual), `${downloads(c, page)}<p class="small">${esc(t.versionShort)}. ${esc(templateLimitsLine(t))}</p>`)}
<section class="sec-b tpl-b" aria-label="Template preview">${templatePreview(c)}</section>
<section class="sec-b" aria-labelledby="h-stepsb"><h2 id="h-stepsb" class="disp">How to complete it</h2>
  <ol class="aims">${t.instructions.map((x, i) => `<li><span class="aims-n">${i + 1}</span><span>${esc(x)}</span></li>`).join("")}</ol>
  <p><a class="btn btn--line" href="${rel(page, P("contribute/"))}">Go to the submission demo</a></p></section>
<section class="sec-b" aria-labelledby="h-gb"><h2 id="h-gb" class="vh">Presentation guide</h2>${presentationGuide(c, 2)}</section>`;
  return { page, title: t.buttonLabel, description: t.dual, active: "publication/", body };
}

function contribute(c) {
  const page = P("contribute/");
  const body = `
${pageHead(`<a href="${rel(page, P("publication/"))}">Publish</a> / contribute`, "Share what you are working on", `${esc(c.site.messages.contributeLine)} Start with the template, then send it with a few details.`, `<div class="head-actions">${templateButton(c, page, C, "btn btn--template btn--xl")}<p>${esc(c.template.dual)}</p></div>`)}
<section class="sec-b">${submissionDemo(c, page, C)}</section>
<section class="band band--paper" aria-labelledby="h-recb"><h2 id="h-recb" class="disp">On a live site: one contribution record</h2>
  <p>A production version would keep a single editable record for each contribution. The same approved material serves the SAR presentation and the book, and revisions update that record rather than creating a new submission.</p>
  <dl class="record-b">${recordModel().map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
</section>`;
  return { page, title: "Contribute", description: "Send one research-progress contribution: a prototype demonstration.", active: "publication/", body };
}

function archive(c) {
  const page = P("archive/");
  const all = [...c.events.events].sort((a, b) => b.year - a.year || (a.kind === "sar") - (b.kind === "sar"));
  const body = `
${pageHead("Archive", "Every gathering since 2019", "Conferences in the region and gatherings at the SAR Conference, newest first. Open any year for the programme, the people who organised it and where to find the work.")}
<section class="sec-b" aria-label="All gatherings">
  <div class="filter" data-filter data-unit-one="gathering" data-unit-many="gatherings">
    <div class="filter-buttons" role="group" aria-label="Show">
      <button type="button" class="chip" data-filter-value="all" aria-pressed="true">All</button>
      <button type="button" class="chip" data-filter-value="regional" aria-pressed="false">APARN Conference</button>
      <button type="button" class="chip" data-filter-value="sar" aria-pressed="false">Gatherings at SAR</button>
      <button type="button" class="chip" data-filter-value="open" aria-pressed="false">Coming up</button>
    </div>
    <p class="filter-count mono" data-filter-count aria-live="polite"></p>
    <ol class="arch">${all.map((e) => `<li class="arch-row" data-filter-item data-tags="${e.kind}${e.status !== "held" && e.status !== "announced" ? " open" : ""}">
      ${poster(e, e.theme ? c.practiceById[e.theme] : null, { size: "small" })}
      <div class="arch-body"><p class="mono">${statusChip(e.status, e.statusLabel)} ${esc(e.dates.display)} / ${esc(evPlace(e))}</p>
      <h2 class="arch-h"><a href="${rel(page, eventPath(C, e))}">${esc(e.title)}</a></h2>
      <details class="arch-more"><summary>Quick look</summary><p>${esc(e.summary)}</p></details></div></li>`).join("")}</ol>
    <p class="filter-empty" data-filter-empty hidden>Nothing matches that filter yet.</p>
  </div>
</section>`;
  return { page, title: "Archive", description: "Every APARN conference and gathering since 2019.", active: "archive/", body };
}

function eventPage(c, e, prev, next) {
  const page = eventPath(C, e);
  const practice = e.theme ? c.practiceById[e.theme] : null;
  const imgs = (e.images || []).filter((id) => IMAGES[id]);
  const body = `
<header class="ev-head">
  ${poster(e, practice, { size: "big" })}
  <div class="ev-head-body">
    <p class="mono"><a href="${rel(page, P("archive/"))}">Archive</a> / ${esc(e.kind === "sar" ? "Gathering at SAR" : "APARN Conference")}</p>
    <h1 class="head-h">${esc(e.title)}</h1>
    <p class="mono">${statusChip(e.status, e.statusLabel)} ${esc(e.dates.display)} / ${esc(evPlace(e))}</p>
    <p class="head-lede">${esc(e.summary)}</p>
  </div>
</header>
<section class="sec-b facts-b">
  <dl class="factsb"><div><dt class="mono">Label</dt><dd>${esc(e.label)}</dd></div><div><dt class="mono">Host</dt><dd>${esc(e.host)}</dd></div><div><dt class="mono">Format</dt><dd>${esc(e.format)}</dd></div>${practice ? `<div><dt class="mono">Practice</dt><dd>${esc(practice.label)}</dd></div>` : ""}${e.place.note ? `<div><dt class="mono">Note</dt><dd>${esc(e.place.note)}</dd></div>` : ""}</dl>
  ${e.highlights?.length ? `<div><h2 class="disp disp--s">Highlights</h2><ul class="bullets-b">${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></div>` : ""}
</section>
${e.organisers?.length ? `<section class="sec-b"><h2 class="disp disp--s">Event organisers</h2><ul class="orgs-b">${e.organisers.map((o) => `<li><strong>${esc(o.name)}</strong><span class="mono">${esc(o.role)}</span>${o.contact ? `<a href="mailto:${esc(o.contact)}">${esc(o.contact)}</a>` : ""}</li>`).join("")}</ul><p class="small">Listed for this edition. The network’s convenors are on the <a href="${rel(page, P("about/"))}">About</a> page.</p></section>` : ""}
${imgs.length ? `<section class="sec-b gallery-b" aria-label="Images">${imgs.map((id) => figure(page, id, { sizes: "(min-width: 64em) 33vw, 100vw" })).join("")}</section>` : ""}
${e.programme?.length ? `<section class="sec-b"><h2 class="disp disp--s">Programme</h2><ol class="prog-b">${e.programme.map((p) => `<li><span class="mono">${esc(p.day)}</span><span>${esc(p.item)}</span></li>`).join("")}</ol></section>` : ""}
${e.archivedCall ? `<section class="sec-b"><details class="call-b"><summary>Read the original call (archived, now closed)</summary><blockquote><p>${esc(e.archivedCall)}</p></blockquote></details></section>` : ""}
${e.links?.length ? `<section class="sec-b"><h2 class="disp disp--s">Find the work</h2><ul class="links-b">${e.links.map((l) => `<li>${ext(l.url, esc(l.label))}</li>`).join("")}</ul></section>` : ""}
<section class="sec-b">${sourceLinks(c, e.sources)}</section>
<nav class="pager-b" aria-label="More gatherings">
  ${prev ? `<a href="${rel(page, eventPath(C, prev))}"><span class="mono">Earlier</span>${esc(prev.label)}</a>` : "<span></span>"}
  ${next ? `<a href="${rel(page, eventPath(C, next))}"><span class="mono">Later</span>${esc(next.label)}</a>` : "<span></span>"}
</nav>
${e.status !== "held" ? joinBand(c, { heading: "Be the first to hear", lead: "Dates, calls and details are shared through the APARN Google Group." }) : ""}`;
  return { page, title: e.label, description: e.summary, active: "archive/", body };
}

export function buildPages(c) {
  const list = [home(c), about(c), network(c), programme(c), conference(c), gathering(c), publication(c), template(c), contribute(c), archive(c)];
  const evs = [...c.events.events].sort((a, b) => a.year - b.year || (a.kind === "sar") - (b.kind === "sar"));
  evs.forEach((e, i) => list.push(eventPage(c, e, evs[i - 1], evs[i + 1])));
  return list.map((p) => ({ path: p.page, html: shell(c, p.page, p) }));
}
