// Concept C: Clear Signal. White, precise and technological: one clear title per section, rounded controls,
// smooth motion that follows the visitor's scrolling, and a network "orbit" that re-centres on whatever is chosen.
import {
  esc, rel, statusChip, sourceLinks, figure, ext, EXT, joinButton, templateButton, eventPath, nodeIndex, nodeHref,
  contributionsFilter, templatePreview, templateLimitsLine, presentationGuide, downloads, submissionDemo, recordModel, IMAGES,
  HEAD_MOTION, motionSwitch, riseWords, riseH1, homeFigures, homeWhy, homeTakePart, homeClosing, homePeople, personImg, brandLogo, faviconLinks, contactWho,
} from "../lib.mjs";

const C = ""; // Concept C is the whole of its own site, so its pages sit at the site root
const P = (p = "") => C + p;
const evPlace = (e) => [e.place.city, e.place.country].filter((x, i, a) => x && a.indexOf(x) === i).join(", ");
const ARROW = `<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const LOGO = `<svg class="logo-m" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M8 24 16 8l8 16" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="8" r="4" fill="#002FA7"/><circle cx="8" cy="24" r="4" fill="currentColor"/><circle cx="24" cy="24" r="4" fill="currentColor"/></svg>`;

// ------------------------------------------------------------------ the transit diagram: two annual events since 2019
function transit(c, page) {
  const reg = [...c.regional].sort((a, b) => a.year - b.year);
  const sar = [...c.sarEvents].sort((a, b) => a.year - b.year);
  const first = reg[0].year, last = reg[reg.length - 1].year;
  const rowH = 46, top = 26, X1 = 78, X2 = 262;
  const y = (yr) => top + (yr - first) * rowH;
  const H = y(last) + 26;
  const confirmed = (list) => list.filter((e) => e.status === "held" || e.status === "announced");
  const lastReg = confirmed(reg).at(-1).year, lastSar = confirmed(sar).at(-1).year;
  const branchFrom = sar[0].year - 1;
  let i = 0;
  const station = (e, x) => {
    const tbc = !(e.status === "held" || e.status === "announced");
    const place = e.place.city === "Online" ? "Online" : e.place.city;
    return `<a class="t-st${tbc ? " t-st--tbc" : ""}" href="${rel(page, eventPath(C, e))}" aria-label="${esc(`${e.label}, ${evPlace(e)}${tbc ? ", details to be confirmed" : ""}`)}" style="--i:${i++}">
      <circle cx="${x}" cy="${y(e.year)}" r="8"/><text x="${x + 18}" y="${y(e.year) + 5}">${esc(place)}</text></a>`;
  };
  return `<svg class="transit" viewBox="0 0 420 ${H}" role="group" aria-labelledby="transit-cap">
  <g class="t-years" aria-hidden="true">${reg.map((e) => `<text x="${X1 - 22}" y="${y(e.year) + 5}">${e.year}</text>`).join("")}</g>
  <path class="t-line t-line--reg" d="M${X1} ${y(first)}V${y(lastReg)}" pathLength="1"/>
  <path class="t-line t-line--reg t-line--tbc" d="M${X1} ${y(lastReg)}V${y(last)}"/>
  <path class="t-line t-line--sar" d="M${X1} ${y(branchFrom)}C${X1} ${y(branchFrom) + rowH * 0.62} ${X2} ${y(sar[0].year) - rowH * 0.62} ${X2} ${y(sar[0].year)}V${y(lastSar)}" pathLength="1"/>
  <path class="t-line t-line--sar t-line--tbc" d="M${X2} ${y(lastSar)}V${y(sar.at(-1).year)}"/>
  ${reg.map((e) => station(e, X1)).join("")}
  ${sar.map((e) => station(e, X2)).join("")}
</svg>`;
}

// ------------------------------------------------------------------ page shell
const NAV = [["about/", "About"], ["network/", "Network"], ["programme/", "Programme"], ["publication/", "Publication"], ["archive/", "Archive"]];
function shell(c, page, { title, description, active, body, index }) {
  const D = c.deploy.sites;
  return `<!doctype html>
<html lang="en" class="concept-c">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} · APARN</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#ffffff">
${faviconLinks(page)}
<link rel="preload" href="${rel(page, "assets/fonts/roboto-normal-latin-3.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel(page, P("assets/c.css"))}">
${HEAD_MOTION}
<script>try { if (localStorage.getItem("aparn-invert") === "on") document.documentElement.classList.add("invert"); } catch (e) {}</script>
<script defer src="${rel(page, "assets/js/aparn.js")}"></script>
<script defer src="${rel(page, "assets/js/motion.js")}"></script>
<script defer src="${rel(page, "assets/js/c.js")}"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top" data-top>
  <div class="wrap top-in">
    <a class="logo" href="${rel(page, P(""))}">${brandLogo(page, { alt: "APARN home", sizes: "140px" })}</a>
    <nav class="nav" aria-label="Main" data-navbar>
      <ul>${NAV.map(([href, label]) => `<li><a href="${rel(page, P(href))}"${active === href ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}</ul>
      <span class="nav-bar" aria-hidden="true"></span>
    </nav>
    ${joinButton(c, "btn btn--join top-join")}
    <button class="menu-btn" type="button" data-nav-toggle aria-expanded="false" aria-controls="menu"><span>Menu</span><span class="menu-btn-i" aria-hidden="true"><i></i><i></i></span></button>
  </div>
  <div class="progress" aria-hidden="true"><span data-progress></span></div>
</header>
<div class="menu" id="menu" data-nav-overlay>
  <div class="wrap menu-in">
    <ul class="menu-list">${[["", "Home"], ...NAV].map(([href, label], n) => `<li style="--i:${n}"><a href="${rel(page, P(href))}"${active === href && href ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}</ul>
    <div class="menu-join" style="--i:6">${joinButton(c, "btn btn--join btn--lg")}<p>${esc(c.site.join.where)}</p></div>
    <button class="menu-close btn btn--ghost" type="button" data-nav-close>Close menu</button>
  </div>
</div>
<main id="main" tabindex="-1">
${riseH1(body)}
</main>
${index ? `<nav class="index" aria-label="Sections on this page" data-index>${index.map(([id, label]) => `<a href="#${id}"><span class="index-l">${esc(label)}</span><span class="index-d" aria-hidden="true"></span></a>`).join("")}</nav>` : ""}
<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-a"><a class="logo" href="${rel(page, P(""))}">${brandLogo(page, { alt: "APARN home", sizes: "140px" })}</a>
      <p>A Special Interest Group of the <a href="https://societyforartisticresearch.org/" rel="noopener" target="_blank">Society for Artistic Research${EXT}<span class="vh"> (opens in a new tab)</span></a>.</p>
      ${joinButton(c, "btn btn--join")}<p class="small">${esc(c.site.join.where)}</p>
      <button type="button" class="invert-btn" data-invert aria-pressed="false" title="Invert colours" hidden><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 2.6a7.4 7.4 0 0 1 0 14.8z" fill="currentColor"/></svg><span class="vh">Invert colours</span></button></div>
    <div><h2 class="foot-h">Contact</h2><p>${contactWho(c)}<br><a href="mailto:${esc(c.site.contact.general.email)}">${esc(c.site.contact.general.email)}</a></p><p><a href="${rel(page, P("about/#contact"))}">All contacts</a></p></div>
    <div><h2 class="foot-h">Elsewhere</h2><ul class="foot-list">
      <li>${ext("https://jar-online.net/en/channels/asia-pacific-artistic-research-network", "APARN in JAR")}</li>
      <li>${ext("https://societyforartisticresearch.org/sigs/asia-pacific-artistic-research-network", "APARN at SAR")}</li>
      <li>${ext("https://sar2027.eu/sk", "SAR 2027")}</li>
      <li>${ext(c.site.officialSite, "Current aparn.net")}</li></ul></div>
  </div>
</footer>
<a class="totop" href="#main" data-totop><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 16V4M5 9l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="vh">Back to top</span></a>
</body>
</html>`;
}

// ------------------------------------------------------------------ shared blocks
const phead = (title, lead = "", extra = "", back = "") => `<header class="phead"><div class="wrap">${back}<h1 class="h1">${title}</h1>${lead ? `<p class="lead" data-rise>${lead}</p>` : ""}${extra}</div></header>`;
const back = (page, href, label) => `<a class="back" href="${rel(page, P(href))}"><svg class="ico ico--back" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M16 10H5M9 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(label)}</a>`;
const sec = (id, heading, inner, { tint = false, lead = "", cls = "" } = {}) => `<section class="sec${tint ? " sec--tint" : ""}${cls ? ` ${cls}` : ""}"${id ? ` id="${id}"` : ""} aria-labelledby="h-${id || heading.length}"><div class="wrap">
  <h2 class="h2" id="h-${id || heading.length}" data-rise>${heading}</h2>${lead ? `<p class="lead" data-rise>${lead}</p>` : ""}
  ${inner}
</div></section>`;

function figures(c) {
  return `<dl class="figs">${c.site.evidence.map((x) => {
    const m = /^(\d+)(\D*)$/.exec(x.value);
    const v = m ? `<span aria-hidden="true" data-count="${m[1]}" data-suffix="${esc(m[2])}">${esc(x.value)}</span><span class="vh">${esc(x.value)}</span>` : esc(x.value);
    return `<div class="figs-i" data-rise><dt class="figs-v">${v}</dt><dd><span class="figs-l">${esc(x.label)}</span><span class="figs-d">${esc(x.date)}</span><span class="figs-n">${esc(x.note)}</span></dd></div>`;
  }).join("")}</dl>`;
}

// ------------------------------------------------------------------ the network orbit
const TYPE = { person: "Person", place: "Place", activity: "Activity", practice: "Practice", output: "Output" };
function orbit(c, page, { initial = "aparn2025", id = "orbit" } = {}) {
  const idx = nodeIndex(c);
  const attrs = (nid) => `data-select-button="${nid}" data-select-group="node" data-label="${esc(idx.nodes[nid].label)}" data-links="${idx.links[nid].join(" ")}" aria-pressed="false"`;
  const groups = [
    ["People", c.people.people.map((p) => p.id)],
    ["Places", c.network.places.map((p) => p.id)],
    ["Activities", [...c.events.events].sort((a, b) => a.year - b.year || (a.kind === "sar") - (b.kind === "sar")).map((e) => e.id)],
    ["Practices and outputs", [...c.network.practices.map((p) => p.id), ...c.network.outputs.map((o) => o.id)]],
  ];
  const all = groups.flatMap(([, ids]) => ids);
  const notes = c.network.linkNotes || {};
  const panel = (nid) => {
    const n = idx.nodes[nid];
    let meta = "", text = "", src = [], extra = "", photo = "";
    if (n.type === "person") { const p = c.personById[nid]; photo = personImg(page, p, { cls: "cpanel-photo", sizes: "112px" }); meta = `${p.roles.map(esc).join(" · ")}<br>${esc(p.institution)}`; text = p.bio; src = p.sources; }
    if (n.type === "place") { const p = c.placeById[nid]; meta = p.kinds.map((k) => `<span class="pill">${esc(c.network.placeKinds[k])}</span>`).join(" "); text = p.text; src = p.sources; }
    if (n.type === "activity") { const e = c.eventById[nid]; meta = `${statusChip(e.status, e.statusLabel)} ${esc(e.dates.display)} · ${esc(evPlace(e))}`; text = e.summary; src = e.sources; }
    if (n.type === "practice") { const t = c.practiceById[nid]; text = t.text; src = t.sources; }
    if (n.type === "output") { const o = c.outputById[nid]; meta = `<span class="pill">${esc(o.kind)}</span>`; text = o.text; src = o.sources; }
    const href = nodeHref(c, C, page, nid);
    if (href) extra = href.startsWith("http") ? ext(href, `Visit ${esc(n.label)}`, "btn btn--soft btn--sm") : `<a class="btn btn--soft btn--sm" href="${href}">${n.type === "person" ? "Full profile" : `Open ${esc(n.label)}`}</a>`;
    return `<article class="cpanel" data-select-panel="${nid}" data-select-group="node" aria-labelledby="cp-${nid}" tabindex="-1">
      <p class="cpanel-type"><span class="orb-dot orb-dot--${n.type}" aria-hidden="true"></span>${TYPE[n.type]}</p>
      ${photo}<h3 id="cp-${nid}" class="cpanel-h">${esc(n.label)}</h3>
      ${meta ? `<p class="cpanel-meta">${meta}</p>` : ""}<p class="cpanel-t">${esc(text)}</p>
      <h4 class="cpanel-rel">Connected to</h4>
      <ul class="hops">${idx.links[nid].map((r) => { const note = notes[`${nid}|${r}`] || notes[`${r}|${nid}`]; return `<li><button type="button" class="hop" ${attrs(r)}><span class="orb-dot orb-dot--${idx.nodes[r].type}" aria-hidden="true"></span>${esc(idx.nodes[r].label)}${note ? ` <span class="hop-note">(${esc(note)})</span>` : ""}</button></li>`; }).join("")}</ul>
      <div class="cpanel-go">${extra}</div>
      
    </article>`;
  };
  return `<div class="orbit" id="${id}" data-select="node" data-orbit data-select-initial="${initial}" data-select-focus>
  <div class="orbit-stage" data-orbit-stage>
    <svg class="orbit-lines" data-orbit-lines aria-hidden="true" focusable="false"></svg>
    ${all.map((nid) => `<button type="button" class="orb orb--${idx.nodes[nid].type}" ${attrs(nid)}><span class="orb-dot orb-dot--${idx.nodes[nid].type}" aria-hidden="true"></span><span class="orb-l">${esc(idx.nodes[nid].label)}</span></button>`).join("")}
  </div>
  <div class="orbit-side"><p class="vh" data-select-live="node" aria-live="polite"></p>${all.map(panel).join("\n")}</div>
  <details class="browse">
    <summary><span>Browse everything</span><span class="browse-n">${all.length}</span></summary>
    <div class="browse-in">${groups.map(([label, ids]) => `<div class="browse-g"><h3 class="browse-h">${label}</h3><ul class="chips">${ids.map((nid) => `<li><button type="button" class="chip chip--node" ${attrs(nid)}><span class="orb-dot orb-dot--${idx.nodes[nid].type}" aria-hidden="true"></span>${esc(idx.nodes[nid].label)}</button></li>`).join("")}</ul></div>`).join("")}</div>
  </details>
</div>`;
}

function benefits(c) {
  return `<ul class="why-list">${c.site.benefits.map((b) => `<li data-rise><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p><p class="proof">${esc(b.proof)}</p></li>`).join("")}</ul>`;
}
function ways(c, page) {
  const n27 = c.eventById.aparn2027, s27 = c.eventById.sar2027;
  const items = [
    ["programme/conference/", "APARN Conference", "Every year, a different host in the region opens its doors to artists, researchers and communities.", "Next: APARN2027, RMIT University Vietnam", statusChip(n27.status)],
    ["programme/gathering-at-sar/", "APARN Gathering at the SAR Conference", "Each year, members share short research updates of 5–10 minutes during the SAR Conference.", "Next: SAR 2027, Bratislava", statusChip(s27.status)],
    ["publication/", "APARN Annual Publication", "A year-end collection of members’ research in progress, using the same contribution.", "A proposal for review", statusChip("proposed")],
  ];
  return `<ul class="ways">${items.map(([href, h, p, next, chip]) => `<li data-rise><a class="way" href="${rel(page, P(href))}"><h3 class="way-h">${h}</h3><p>${p}</p><p class="way-next">${next} ${chip}</p><span class="way-go" aria-hidden="true">${ARROW}</span></a></li>`).join("")}</ul>`;
}
function flow(c, page) {
  return `<div class="flow" data-rise>
  <ol class="flow-steps">
    <li><span class="flow-n" aria-hidden="true">1</span><h3>Prepare one contribution</h3><p>About two pages, from the shared template.</p></li>
    <li><span class="flow-n" aria-hidden="true">2</span><h3>Share a 5–10-minute update at SAR</h3><p>Present it at the APARN Gathering at the SAR Conference.</p></li>
    <li><span class="flow-n" aria-hidden="true">3</span><h3>Opt in to the year-end collection</h3><p>The same contribution, if you choose.</p></li>
  </ol>
  <div class="flow-act">${templateButton(c, page, C, "btn btn--template btn--lg")}<p>${esc(c.template.dual)}</p><a class="btn btn--ghost btn--lg" href="${rel(page, P("contribute/"))}">Try the submission demo</a></div>
</div>`;
}
function joinCta(c, heading = "Join APARN", lead = "") {
  return `<div class="cta" data-rise><div><h2 class="cta-h">${esc(heading)}</h2><p>${esc(lead || c.site.join.benefit)}</p></div><div class="cta-act">${joinButton(c, "btn btn--join btn--lg")}<p class="small">${esc(c.site.join.where)}</p></div></div>`;
}
const pillList = (items) => `<ul class="plain">${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;

// ------------------------------------------------------------------ pages
function home(c) {
  const page = P("");
  const body = `
<section class="hero" id="top" aria-labelledby="h-hero"><div class="wrap hero-in">
  <div class="hero-t">
    <h1 class="hero-h" id="h-hero">${riseWords(c.site.messages.headlineC, { grad: ["connected"] })}</h1>
    <p class="hero-lede">${esc(c.site.messages.hero)}</p>
    <div class="hero-act">${joinButton(c, "btn btn--join btn--lg")}<a class="btn btn--soft btn--lg" href="#network">Explore ${ARROW}</a></div>
    <p class="note">${esc(c.site.join.where)}</p>
  </div>
  <figure class="hero-f">${transit(c, page)}
    <figcaption id="transit-cap"><span class="key key--reg">APARN Conference</span><span class="key key--sar">Gathering at SAR</span></figcaption>
  </figure>
</div></section>
${homeFigures(c, page, C)}
${homePeople(c, page, C)}
${homeWhy(c)}
${homeTakePart(c, page, C)}
${homeClosing(c)}`;
  const index = [["top", "Start"], ["network", "Across the network"], ["people", "People"], ["why", "Why join"], ["take-part", "Take part"], ["join", "Join"]];
  return { page, title: "Home", description: c.site.messages.lede, active: "", body, index };
}

function about(c) {
  const page = P("about/");
  const body = `
${phead("About APARN", esc(c.site.about.intro))}
${sec("sar", "Part of the Society for Artistic Research", `<div class="cols3">${[c.site.messages.sar, c.site.messages.jar, c.site.about.open].map((t) => `<p data-rise>${esc(t)}</p>`).join("")}</div><p>${ext("https://societyforartisticresearch.org/sigs/asia-pacific-artistic-research-network", "APARN on the SAR website", "btn btn--soft")}</p>`)}
${sec("aims", "What we are here to do", `<ol class="aims">${c.site.about.purposes.map((p) => `<li data-rise>${esc(p)}</li>`).join("")}</ol><p class="small">${esc(c.site.about.volunteer)}</p>`, { tint: true })}
${sec("history", "How it began", `<ol class="hist">${c.site.about.history.map((h) => `<li data-rise><span class="hist-d">${esc(h.date)}</span><p>${esc(h.text)}</p></li>`).join("")}</ol><p class="small">${esc(c.people.firstMeeting.text)}</p>`)}
${sec("people", "Director and convenors", `<div class="people">${c.people.people.map((p) => `<article class="person" id="${p.id}" data-rise>
  <div class="person-photo">${personImg(page, p, { sizes: "(min-width: 75em) 22vw, (min-width: 48em) 42vw, 90vw" })}</div>
  <h3 class="person-h">${esc(p.honorific)} ${esc(p.name)}</h3><p class="person-r">${p.roles.map((r) => `<span class="pill${/Director/.test(r) ? " pill--blue" : ""}">${esc(r)}</span>`).join(" ")}</p>
  <p class="person-i">${esc(p.institution)}, ${esc(p.country)}</p>
  <details class="more"><summary>About ${esc(p.name.split(" ")[0])}</summary><div class="more-in"><p>${esc(p.bio)}</p><ul class="plain">${p.activity.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div></details>
  ${p.email ? `<p><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>` : ""}</article>`).join("")}</div>
  <p class="small">Each conference also has its own organising team, listed in the <a href="${rel(page, P("archive/"))}">archive</a>.</p>`, { tint: true, lead: "The convenors look after the network between meetings." })}
${sec("contact", "Contact", `<p class="big-contact" data-rise><strong>${contactWho(c)}</strong><br><a href="mailto:${esc(c.site.contact.general.email)}">${esc(c.site.contact.general.email)}</a></p>${c.site.contact.note ? `<p class="small">${esc(c.site.contact.note)}</p>` : ""}${joinCta(c)}`, { lead: esc(c.site.contact.intro) })}`;
  return { page, title: "About", description: "About APARN, its Director and convenors.", active: "about/", body };
}

function network(c) {
  const page = P("network/");
  const kinds = Object.keys(c.network.placeKinds);
  const body = `
${phead("Across the network", "APARN connects researchers, artists and institutions across the Asia Pacific and beyond. Choose anyone or anything to see what it connects to.")}
<section class="sec sec--flush" aria-label="Network explorer"><div class="wrap">${orbit(c, page, { initial: "yogyakarta", id: "explore" })}</div></section>
${sec("figures", "The network in figures", figures(c), { tint: true, lead: esc(c.site.reachNote) })}
${sec("places", "Places, by what happened there", `<div class="places">${kinds.map((k) => {
    const list = c.network.places.filter((p) => p.kinds.includes(k));
    return `<div class="place-g" data-rise><h3>${esc(c.network.placeKinds[k])}</h3><ul class="chips chips--static">${list.map((p) => `<li><span class="chip chip--static">${esc(p.label)}${p.country && p.country !== p.label ? `, ${esc(p.country)}` : ""}</span></li>`).join("")}</ul></div>`;
  }).join("")}<div class="place-g" data-rise><h3>Member locations</h3><p>Not published. The Google Group is private; approved figures can be added here later.</p></div></div>`)}
${sec("research", "Research in conversation", contributionsFilter(c), { tint: true, lead: "Contributions from APARN conferences in APARN’s channel of the Journal for Artistic Research. Filter by conference or search by title and author." })}
<section class="sec"><div class="wrap">${joinCta(c)}</div></section>`;
  return { page, title: "Network", description: "Explore the people, places, activities and practices connected through APARN.", active: "network/", body };
}

function programme(c) {
  const page = P("programme/");
  const body = `
${phead("Take part", "Meet in the region each year, share your progress during the SAR Conference, and add your work to a year-end collection. One contribution can carry you through all three.")}
${sec("ways", "Three ways in", ways(c, page))}
${sec("flow", "One contribution, two uses", flow(c, page), { tint: true })}
${sec("coming", "Coming up", `<ul class="rows">
  <li data-rise><span class="rows-d">${esc(c.eventById.aparn2027.dates.display)}</span><span class="rows-t">APARN2027 at RMIT University Vietnam</span>${statusChip(c.eventById.aparn2027.status)}</li>
  <li data-rise><span class="rows-d">21–23 April 2027</span><span class="rows-t">SAR 2027, SAR’s 18th International Conference, Bratislava</span>${statusChip("upcoming", "SAR event")}</li>
  <li data-rise><span class="rows-d">During SAR 2027</span><span class="rows-t">APARN Gathering at SAR 2027</span>${statusChip(c.eventById.sar2027.status)}</li></ul>
  <p class="small">SAR 2027 has its own call and registration on ${ext("https://sar2027.eu/sk", "sar2027.eu")}, separate from the APARN gathering.</p>
  ${joinCta(c, "Hear about calls first", "Calls for papers, hosting invitations and gathering details reach members through the APARN Google Group.")}`)}`;
  return { page, title: "Programme", description: "APARN Conference, the APARN Gathering at the SAR Conference and the Annual Publication.", active: "programme/", body };
}

function conference(c) {
  const page = P("programme/conference/");
  const next = c.eventById.aparn2027;
  const body = `
${phead("APARN Conference", "Each year a different host opens its doors to artists, researchers, educators and communities from across the Asia Pacific, to share practices, test ideas and build friendships that last.", "", back(page, "programme/", "Programme"))}
${sec("next", "Next: APARN2027", `<div class="feature" data-rise><p class="feature-m">${statusChip(next.status)} RMIT University Vietnam</p><p>${esc(next.summary)}</p><p>City, dates, theme and call: to be announced.</p><div class="row-act">${joinButton(c, "btn btn--join")}<p class="small">${esc(c.site.join.where)} Calls are shared there first.</p></div></div>`)}
${sec("expect", "What to expect", `${pillList(["Papers, performances, creative interventions, workshops and video essays, usually 15–20 minutes each.", "Open to artistic researchers in the region and to those elsewhere with an interest in it.", "Publication in APARN’s channel of the Journal for Artistic Research; some hosts add partner journals.", "APARN2026 was free to attend. Travel bursaries were not available."].map(esc))}`, { tint: true })}
${sec("hosts", "Where it has been", `<ol class="rows rows--link">${c.regional.filter((e) => e.status === "held").map((e) => `<li data-rise><a href="${rel(page, eventPath(C, e))}"><span class="rows-d">${e.year}</span><span class="rows-t">${esc(e.title)}</span><span class="rows-p">${esc(evPlace(e))}</span>${ARROW}</a></li>`).join("")}</ol>`)}`;
  return { page, title: "APARN Conference", description: "The annual APARN Conference, hosted across the Asia Pacific.", active: "programme/", body };
}

function gathering(c) {
  const page = P("programme/gathering-at-sar/");
  const s25 = c.eventById.sar2025, s26 = c.eventById.sar2026, s27 = c.eventById.sar2027;
  const body = `
${phead("APARN Gathering at the SAR Conference", "Each year, during the Society for Artistic Research’s conference or forum, APARN members come together to share what they are working on, online, so members who cannot travel can join in.", `<div class="phead-act" data-rise>${templateButton(c, page, C, "btn btn--template btn--lg")}<p>${esc(c.template.dual)}</p></div>`, back(page, "programme/", "Programme"))}
${sec("next", "Next: SAR 2027 in Bratislava", `<div class="feature" data-rise><p class="feature-m">${statusChip(s27.status)} 21–23 April 2027 · Academy of Performing Arts, Bratislava</p><p>SAR’s 18th International Conference on Artistic Research, “Beyond the Familiar”, runs 21–23 April 2027. Join fellow members to share where your research is now. The APARN team will confirm the date, time and format of the gathering.</p><p class="small">SAR 2027 has its own call (closing 25 November 2026) and registration on ${ext("https://sar2027.eu/sk", "sar2027.eu")}. The APARN gathering is separate.</p></div>`)}
${sec("format", "5–10 minutes, your way", `<p data-rise>The proposed format gives each participant about 5–10 minutes to share current research and progress. Work in progress is welcome, and so are visual, performative and sound formats.</p>${presentationGuide(c)}<p class="small">The format and programme are subject to confirmation by APARN’s Director and organisers.</p>`, { tint: true })}
${sec("how", "How to take part", flow(c, page))}
${sec("recent", "Recent gatherings", `<ol class="rows rows--link">${[s25, s26].map((e) => `<li data-rise><a href="${rel(page, eventPath(C, e))}"><span class="rows-d">${e.year}</span><span class="rows-t">${esc(e.title)}</span><span class="rows-p">${esc(evPlace(e))}</span>${ARROW}</a></li>`).join("")}</ol>`, { tint: true })}`;
  return { page, title: "APARN Gathering at the SAR Conference", description: "Share your research progress with APARN members during the SAR Conference.", active: "programme/", body };
}

function publication(c) {
  const page = P("publication/");
  const a = c.publications.annual;
  const body = `
${phead("Publish with APARN", esc(c.site.messages.jar))}
${sec("annual", esc(a.title), `<div class="feature feature--blue" data-rise><p class="feature-m">${statusChip(a.status)} A proposal for review</p><p>${esc(a.lede)} ${esc(a.text)}</p><div class="phead-act">${templateButton(c, page, C, "btn btn--template btn--lg")}<p>${esc(c.template.dual)}</p></div></div>
  <ol class="steps">${a.steps.map((s, i) => `<li data-rise><span class="flow-n" aria-hidden="true">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ol>
  <div class="terms" data-rise>${pillList(a.terms.map(esc))}<p class="small">${esc(a.context)}</p><p class="small">Still to decide: ${a.toDecide.map(esc).join("; ")}.</p></div>`)}
${sec("now", "Where APARN research is published now", `<div class="pubs">${c.publications.existing.map((p) => `<article class="pub" data-rise><p class="pub-k">${esc(p.kind)}</p><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><ul class="pub-m">${p.meta.map((m) => `<li>${esc(m)}</li>`).join("")}</ul><p>${ext(p.url, "Visit", "btn btn--soft btn--sm")}</p></article>`).join("")}</div>`, { tint: true })}`;
  return { page, title: "Publication", description: "The APARN Annual Publication (proposed), the JAR channel and other routes to publish.", active: "publication/", body };
}

function template(c) {
  const page = P("template/");
  const t = c.template;
  const body = `
${phead(esc(t.buttonLabel), esc(t.dual), `<div data-rise>${downloads(c, page)}</div><p class="small" data-rise>${esc(t.versionShort)}. ${esc(templateLimitsLine(t))}</p>`, back(page, "publication/", "Publication"))}
<section class="sec sec--tint" aria-label="Template preview"><div class="wrap">${templatePreview(c)}</div></section>
${sec("complete", "How to complete it", `<ol class="aims">${t.instructions.map((x) => `<li data-rise>${esc(x)}</li>`).join("")}</ol><p><a class="btn btn--ghost btn--lg" href="${rel(page, P("contribute/"))}">Go to the submission demo ${ARROW}</a></p>`)}
<section class="sec sec--tint" aria-labelledby="h-guide"><div class="wrap"><h2 class="vh" id="h-guide">Presentation guide</h2>${presentationGuide(c, 2)}</div></section>`;
  return { page, title: t.buttonLabel, description: t.dual, active: "publication/", body };
}

function contribute(c) {
  const page = P("contribute/");
  const body = `
${phead("Share what you are working on", `${esc(c.site.messages.contributeLine)} Start with the template, then send it with a few details.`, `<div class="phead-act" data-rise>${templateButton(c, page, C, "btn btn--template btn--lg")}<p>${esc(c.template.dual)}</p></div>`, back(page, "publication/", "Publication"))}
<section class="sec"><div class="wrap">${submissionDemo(c, page, C)}</div></section>
${sec("record", "On a live site: one contribution record", `<p data-rise>A production version would keep a single editable record for each contribution. The same approved material serves the SAR presentation and the book, and revisions update that record rather than creating a new submission.</p><dl class="record">${recordModel().map(([k, v]) => `<div data-rise><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`, { tint: true })}`;
  return { page, title: "Contribute", description: "Send one research-progress contribution: a prototype demonstration.", active: "publication/", body };
}

function archive(c) {
  const page = P("archive/");
  const all = [...c.events.events].sort((a, b) => b.year - a.year || (a.kind === "sar") - (b.kind === "sar"));
  const body = `
${phead("Every gathering since 2019", "Conferences in the region and gatherings at the SAR Conference, newest first. Open any year for the programme, the people who organised it and where to find the work.")}
<section class="sec" aria-label="All gatherings"><div class="wrap">
  <div class="filter" data-filter data-unit-one="gathering" data-unit-many="gatherings">
    <div class="filter-buttons" role="group" aria-label="Show">
      <button type="button" class="chip" data-filter-value="all" aria-pressed="true">All</button>
      <button type="button" class="chip" data-filter-value="regional" aria-pressed="false">APARN Conference</button>
      <button type="button" class="chip" data-filter-value="sar" aria-pressed="false">Gatherings at SAR</button>
      <button type="button" class="chip" data-filter-value="open" aria-pressed="false">Coming up</button>
    </div>
    <p class="filter-count" data-filter-count aria-live="polite"></p>
    <ol class="tline">${all.map((e) => {
      const open = e.status !== "held" && e.status !== "announced";
      return `<li class="tline-i tline-i--${e.kind}${open ? " tline-i--open" : ""}" data-filter-item data-tags="${e.kind}${open ? " open" : ""}" data-rise>
      <span class="tline-dot" aria-hidden="true"></span>
      <div class="tline-c"><p class="tline-m"><span class="tline-y">${e.year}</span>${statusChip(e.status, e.statusLabel)}<span>${esc(e.dates.display)}</span><span>${esc(evPlace(e))}</span></p>
      <h2 class="tline-h"><a href="${rel(page, eventPath(C, e))}">${esc(e.title)}</a></h2><p>${esc(e.summary)}</p></div></li>`;
    }).join("")}</ol>
    <p class="filter-empty" data-filter-empty hidden>Nothing matches that filter yet.</p>
  </div>
</div></section>`;
  return { page, title: "Archive", description: "Every APARN conference and gathering since 2019.", active: "archive/", body };
}

function eventPage(c, e, prev, next) {
  const page = eventPath(C, e);
  const practice = e.theme ? c.practiceById[e.theme] : null;
  const imgs = (e.images || []).filter((id) => IMAGES[id]);
  const body = `
${phead(esc(e.title), esc(e.summary), `<p class="ev-m" data-rise><span class="pill pill--blue">${esc(e.label)}</span>${statusChip(e.status, e.statusLabel)}<span>${esc(e.dates.display)}</span><span>${esc(evPlace(e))}</span></p>`, back(page, "archive/", "Archive"))}
${sec("facts", "At a glance", `<dl class="facts">${[["Host", e.host], ["Format", e.format], ...(practice ? [["Practice", practice.label]] : []), ...(e.place.note ? [["Note", e.place.note]] : [])].map(([k, v]) => `<div data-rise><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>${e.highlights?.length ? `<h3 class="h3">Highlights</h3>${pillList(e.highlights.map(esc))}` : ""}`, { tint: true })}
${e.organisers?.length ? sec("organisers", "Event organisers", `<ul class="orgs">${e.organisers.map((o) => `<li data-rise><strong>${esc(o.name)}</strong><span>${esc(o.role)}</span>${o.contact ? `<a href="mailto:${esc(o.contact)}">${esc(o.contact)}</a>` : ""}</li>`).join("")}</ul><p class="small">Listed for this edition. The network’s convenors are on the <a href="${rel(page, P("about/"))}">About</a> page.</p>`) : ""}
${imgs.length ? `<section class="sec" aria-label="Images"><div class="wrap gallery">${imgs.map((id) => `<div data-rise>${figure(page, id, { sizes: "(min-width: 64em) 40vw, 100vw" })}</div>`).join("")}</div></section>` : ""}
${e.programme?.length ? sec("programme", "Programme", `<ol class="rows">${e.programme.map((p) => `<li data-rise><span class="rows-d">${esc(p.day)}</span><span class="rows-t">${esc(p.item)}</span></li>`).join("")}</ol>`, { tint: true }) : ""}
${e.archivedCall ? `<section class="sec"><div class="wrap"><details class="more more--call"><summary>Read the original call (archived, now closed)</summary><div class="more-in"><blockquote><p>${esc(e.archivedCall)}</p></blockquote></div></details></div></section>` : ""}
${e.links?.length ? sec("work", "Find the work", `<ul class="links">${e.links.map((l) => `<li>${ext(l.url, esc(l.label), "btn btn--soft")}</li>`).join("")}</ul>`) : ""}
<section class="sec sec--tight"><div class="wrap">${sourceLinks(c, e.sources)}
<nav class="pager" aria-label="More gatherings">
  ${prev ? `<a href="${rel(page, eventPath(C, prev))}"><svg class="ico ico--back" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M16 10H5M9 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span><span class="pager-k">Earlier</span>${esc(prev.label)}</span></a>` : "<span></span>"}
  ${next ? `<a class="pager-next" href="${rel(page, eventPath(C, next))}"><span><span class="pager-k">Later</span>${esc(next.label)}</span>${ARROW}</a>` : "<span></span>"}
</nav>
${e.status !== "held" ? joinCta(c, "Be the first to hear", "Dates, calls and details are shared through the APARN Google Group.") : ""}</div></section>`;
  return { page, title: e.label, description: e.summary, active: "archive/", body };
}

export function buildPages(c) {
  const list = [home(c), about(c), network(c), programme(c), conference(c), gathering(c), publication(c), template(c), contribute(c), archive(c)];
  const evs = [...c.events.events].sort((a, b) => a.year - b.year || (a.kind === "sar") - (b.kind === "sar"));
  evs.forEach((e, i) => list.push(eventPage(c, e, evs[i - 1], evs[i + 1])));
  return list.map((p) => ({ path: p.page, html: shell(c, p.page, p) }));
}
