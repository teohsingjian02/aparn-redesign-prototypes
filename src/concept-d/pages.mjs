// Concept D: Monochrome. Classic, low-key and strong, like the opening of a film: the home page opens on black
// with the APARN mark and a sweep of light, then the curtain lifts on one large title. Every page opens on a black
// title area; reading happens on calm white pages with a strict black and grey hierarchy in Manrope (the typeface
// of aparn.net). Motion is slow and deliberate: a dial whose hand sweeps past every meeting since 2019, light that
// follows the pointer, hairlines that draw across, and content that rises in as you scroll.
import {
  esc, rel, statusChip, sourceLinks, figure, ext, joinButton, templateButton, eventPath, nodeIndex, nodePanel,
  contributionsFilter, templatePreview, templateLimitsLine, presentationGuide, downloads, submissionDemo, recordModel, IMAGES,
  HEAD_MOTION, riseWords, riseH1, countUp, homeFigures, homeWhy, homeTakePart, homeClosing, homePeople, personImg, brandLogo, faviconLinks, ARROW,
} from "../lib.mjs";

const C = ""; // Concept D is the whole of its own site, so its pages sit at the site root
const P = (p = "") => C + p;
const evPlace = (e) => [e.place.city, e.place.country].filter((x, i, a) => x && a.indexOf(x) === i).join(", ");
const BACK = `<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M16 10H5M9 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ------------------------------------------------------------------ the dial: every APARN Conference since 2019
// A hand sweeps around the dial; each meeting lights up as the hand passes it.
const SWEEP = 36; // seconds for one turn of the hand
function dial(c) {
  const reg = [...c.regional].sort((a, b) => a.year - b.year);
  const n = reg.length, step = 360 / n;
  const f = (v) => v.toFixed(1);
  const pt = (deg, r) => { const a = ((deg - 90) * Math.PI) / 180; return [500 + r * Math.cos(a), 500 + r * Math.sin(a)]; };
  const seg = (deg, r1, r2) => { const [x1, y1] = pt(deg, r1), [x2, y2] = pt(deg, r2); return `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`; };
  const near = (deg) => reg.some((_, k) => Math.abs((((k * step - deg) % 360) + 540) % 360 - 180) < 2.4);
  const minor = [];
  for (let i = 0; i < 72; i++) if (!near(i * 5)) minor.push(seg(i * 5, 452, 464));
  const major = reg.map((_, k) => seg(k * step, 430, 470)).join("");
  const place = (e) => (e.place.city === "Online" ? "Online" : e.place.city);
  const labels = reg.map((e, k) => {
    const [x, y] = pt(k * step, 384);
    return `<g class="dial-l${e.status === "tbc" ? " dial-l--tbc" : ""}" style="--k:${k}"><text class="dial-y" x="${f(x)}" y="${f(y + 2)}">${e.year}</text><text class="dial-p" x="${f(x)}" y="${f(y + 28)}">${esc(place(e))}</text></g>`;
  }).join("");
  const marks = reg.map((e, k) => {
    const [x, y] = pt(k * step, 470);
    return `<g class="dial-m${e.status === "tbc" ? " dial-m--tbc" : ""}" transform="translate(${f(x)} ${f(y)})" style="--dl:${((k * SWEEP) / n - SWEEP).toFixed(2)}s"><circle class="dial-halo" r="8"/><circle class="dial-dot" r="8"/></g>`;
  }).join("");
  const said = reg.map((e) => `${place(e)} ${e.year}${e.status === "tbc" ? " (details to be confirmed)" : ""}`).join(", ");
  const rest = (reg.map((e) => e.status).lastIndexOf("held") + 0.5) * step; // where the hand rests in a still picture: just past the latest meeting held
  return `<figure class="dial" style="--rest:${rest}deg">
  <span class="dial-trail" aria-hidden="true"></span>
  <svg class="dial-svg" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
    <defs><linearGradient id="dial-g" gradientUnits="userSpaceOnUse" x1="500" y1="540" x2="500" y2="60"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".95"/></linearGradient></defs>
    <g transform="rotate(-90 500 500)"><circle class="dial-c dial-c--1" cx="500" cy="500" r="470" pathLength="1"/><circle class="dial-c dial-c--2" cx="500" cy="500" r="326" pathLength="1"/><circle class="dial-c dial-c--3" cx="500" cy="500" r="196" pathLength="1"/></g>
    <path class="dial-ticks" d="${minor.join("")}"/><path class="dial-major" d="${major}"/>
    ${labels}
    ${marks}
    <g class="dial-hand"><line x1="500" y1="540" x2="500" y2="60"/><circle class="dial-tip" cx="500" cy="60" r="4"/><circle class="dial-pin" cx="500" cy="500" r="8"/></g>
  </svg>
  <figcaption class="vh">APARN has met every year since 2019: ${esc(said)}.</figcaption>
</figure>`;
}

// the opening titles (home page, when a visitor arrives from outside the site)
function intro(page) {
  return `<div class="intro" data-intro aria-hidden="true"><div class="intro-half intro-half--t"></div><div class="intro-half intro-half--b"></div>
  <div class="intro-mark"><div class="intro-logo"><img src="${rel(page, "assets/brand/logo-white-600.png")}" width="600" height="198" alt=""><span class="intro-glint"></span></div><span class="intro-line"></span></div></div>`;
}
const INTRO_HEAD = `<script>try { var r = document.referrer, b = location.href.split(/[?#]/)[0].replace(/index\\.html$/, ""); if (!r || r.indexOf(b) !== 0) document.documentElement.classList.add("opening"); } catch (e) {}</script>`;

// ------------------------------------------------------------------ page shell
const NAV = [["about/", "About"], ["network/", "Network"], ["programme/", "Programme"], ["publication/", "Publication"], ["archive/", "Archive"]];
function shell(c, page, { title, description, active, body, index }) {
  const home = page === "";
  return `<!doctype html>
<html lang="en" class="concept-d">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} · APARN</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0A0A0A">
${faviconLinks(page)}
<link rel="preload" href="${rel(page, "assets/fonts/manrope-normal-latin-1.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel(page, P("assets/d.css"))}">
${HEAD_MOTION}${home ? `\n${INTRO_HEAD}` : ""}
<script defer src="${rel(page, "assets/js/aparn.js")}"></script>
<script defer src="${rel(page, "assets/js/motion.js")}"></script>
<script defer src="${rel(page, "assets/js/d.js")}"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${home ? intro(page) : ""}
<header class="top dark" data-top>
  <div class="wrap top-in">
    <a class="logo" href="${rel(page, P(""))}">${brandLogo(page, { tone: "white", alt: "APARN home", sizes: "130px" })}</a>
    <nav class="nav" aria-label="Main" data-navbar>
      <ul>${NAV.map(([href, label]) => `<li><a href="${rel(page, P(href))}"${active === href ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}</ul>
      <span class="nav-bar" aria-hidden="true"></span>
    </nav>
    ${joinButton(c, "btn btn--join top-join")}
    <button class="menu-btn" type="button" data-nav-toggle aria-expanded="false" aria-controls="menu"><span>Menu</span><span class="menu-btn-i" aria-hidden="true"><i></i><i></i></span></button>
  </div>
  <div class="progress" aria-hidden="true"><span data-progress></span></div>
</header>
<div class="menu dark" id="menu" data-nav-overlay>
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
<footer class="foot dark">
  <div class="wrap foot-in">
    <div class="foot-a"><a class="logo" href="${rel(page, P(""))}">${brandLogo(page, { tone: "white", alt: "APARN home", sizes: "170px", lazy: true })}</a>
      <p>A Special Interest Group of the ${ext("https://societyforartisticresearch.org/", "Society for Artistic Research")}.</p>
      ${joinButton(c, "btn btn--join")}<p class="small">${esc(c.site.join.where)}</p></div>
    <div><h2 class="foot-h">Contact</h2><p>${esc(c.site.contact.general.name)}, ${esc(c.site.contact.general.role)}<br><a href="mailto:${esc(c.site.contact.general.email)}">${esc(c.site.contact.general.email)}</a></p><p><a href="${rel(page, P("about/#contact"))}">All contacts</a></p></div>
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
const phead = (title, lead = "", extra = "", back = "") => `<header class="phead dark"><div class="wrap">${back}<h1 class="h1">${title}</h1>${lead ? `<p class="lead" data-rise>${lead}</p>` : ""}${extra}</div></header>`;
const back = (page, href, label) => `<a class="back" href="${rel(page, P(href))}">${BACK}${esc(label)}</a>`;
const sec = (id, heading, inner, { tint = false, lead = "", cls = "" } = {}) => `<section class="sec${tint ? " sec--tint" : ""}${cls ? ` ${cls}` : ""}" id="${id}" aria-labelledby="h-${id}"><div class="wrap">
  <h2 class="h2" id="h-${id}" data-rise>${heading}</h2>${lead ? `<p class="lead" data-rise>${lead}</p>` : ""}
  ${inner}
</div></section>`;
const plain = (items) => `<ul class="plain">${items.map((x) => `<li data-rise>${x}</li>`).join("")}</ul>`;
function figures(c) {
  return `<dl class="figs">${c.site.evidence.map((x) => `<div class="figs-i" data-rise><dt class="figs-v">${countUp(x.value)}</dt><dd><span class="figs-l">${esc(x.label)}</span><span class="figs-d">${esc(x.date)}</span><span class="figs-n">${esc(x.note)}</span></dd></div>`).join("")}</dl>`;
}
const reg = (page, e, { status = false } = {}) => `<li class="reg" data-rise><a href="${rel(page, eventPath(C, e))}"><span class="reg-y">${e.year}</span><span class="reg-t">${esc(e.title)}${status ? `<span class="reg-k">${esc(e.kind === "sar" ? "Gathering at SAR" : "APARN Conference")}</span>` : ""}</span><span class="reg-p">${esc(evPlace(e))}</span>${status ? `<span class="reg-s">${statusChip(e.status, e.statusLabel)}</span>` : ""}<span class="reg-go" aria-hidden="true">${ARROW}</span></a></li>`;
function lines(c, page) {
  const n27 = c.eventById.aparn2027, s27 = c.eventById.sar2027;
  const items = [
    ["programme/conference/", "APARN Conference", "Every year, hosted somewhere new in the region.", statusChip(n27.status)],
    ["programme/gathering-at-sar/", "APARN Gathering at the SAR Conference", "Short research updates of 5–10 minutes during the SAR Conference.", statusChip(s27.status)],
    ["publication/", "APARN Annual Publication", "Members’ research in progress, collected at the end of the year.", statusChip("proposed")],
  ];
  return `<ul class="lines">${items.map(([href, h, p, chip]) => `<li data-rise><a href="${rel(page, P(href))}"><span class="lines-h">${h}</span><span class="lines-p">${p}</span><span class="lines-s">${chip}</span><span class="lines-go" aria-hidden="true">${ARROW}</span></a></li>`).join("")}</ul>`;
}
function flow(c, page) {
  return `<div class="flow" data-rise>
  <ol class="flow-steps"><li><span class="flow-n" aria-hidden="true">1</span>Prepare one contribution</li><li><span class="flow-n" aria-hidden="true">2</span>Share it in 5–10 minutes at SAR</li><li><span class="flow-n" aria-hidden="true">3</span>Add it to the year-end collection, if you choose</li></ol>
  <div class="flow-act">${templateButton(c, page, C, "btn btn--template btn--lg")}<p>${esc(c.template.dual)}</p><a class="btn btn--ghost btn--lg" href="${rel(page, P("contribute/"))}">Try the submission demo</a></div>
</div>`;
}
function joinCta(c, heading = "Join APARN", lead = "") {
  return `<div class="cta" data-rise><div><h2 class="cta-h">${esc(heading)}</h2><p>${esc(lead || c.site.join.benefit)}</p></div><div class="cta-act">${joinButton(c, "btn btn--join btn--lg")}<p class="small">${esc(c.site.join.where)}</p></div></div>`;
}
function explorer(c, page, initial = "yogyakarta") {
  const idx = nodeIndex(c);
  const tabs = [["place", "Places"], ["person", "People"], ["activity", "Activities"], ["practice", "Practices"], ["output", "Outputs"]];
  const order = {
    place: c.network.places.map((p) => p.id),
    person: c.people.people.map((p) => p.id),
    activity: [...c.events.events].sort((a, b) => a.year - b.year || (a.kind === "sar") - (b.kind === "sar")).map((e) => e.id),
    practice: c.network.practices.map((p) => p.id),
    output: c.network.outputs.map((o) => o.id),
  };
  const btn = (id) => `<button type="button" class="node" data-select-button="${id}" data-select-group="node" data-label="${esc(idx.nodes[id].label)}" data-links="${idx.links[id].join(" ")}" aria-pressed="false"><span class="node-l">${esc(idx.nodes[id].label)}</span><span class="node-s">${esc(idx.nodes[id].sub)}</span></button>`;
  return `<div class="explorer" data-select="node" data-select-initial="${initial}" data-select-focus>
  <div class="explorer-grid" data-select="tab" data-select-initial="place">
    <div class="explorer-index">
      <div class="tabs" role="group" aria-label="Show">${tabs.map(([t, l]) => `<button type="button" class="tab" data-select-button="${t}" data-select-group="tab" aria-pressed="false">${l}</button>`).join("")}</div>
      ${tabs.map(([t, l]) => `<div class="tab-panel" data-select-panel="${t}" data-select-group="tab"><h3 class="tab-panel-h">${l}</h3><div class="node-list" data-select-list>${order[t].map(btn).join("")}</div></div>`).join("")}
    </div>
    <div class="explorer-panels"><p class="vh" data-select-live="node" aria-live="polite"></p>${Object.keys(idx.nodes).map((id) => nodePanel(c, C, page, idx, id).replace('class="panel"', 'class="panel" data-select-group="node"')).join("\n")}</div>
  </div>
</div>`;
}

// ------------------------------------------------------------------ pages
function home(c) {
  const page = P("");
  const body = `
<section class="hero dark" id="top" aria-labelledby="h-hero"><div class="wrap hero-in">
  <div class="hero-t">
    <h1 class="hero-h" id="h-hero">${riseWords(c.site.messages.headlineD, { grad: ["Asia", "Pacific"] })}</h1>
    <p class="hero-lede">${esc(c.site.messages.hero)}</p>
    <div class="hero-act">${joinButton(c, "btn btn--join btn--lg")}<a class="btn btn--ghost btn--lg" href="#network">Explore ${ARROW}</a></div>
    <p class="note">${esc(c.site.join.where)}</p>
  </div>
  ${dial(c)}
</div><span class="cue" aria-hidden="true"></span></section>
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
${sec("sar", "Part of the Society for Artistic Research", `<div class="cols3">${[c.site.messages.sar, c.site.messages.jar, c.site.about.open].map((t) => `<p data-rise>${esc(t)}</p>`).join("")}</div><p data-rise>${ext("https://societyforartisticresearch.org/sigs/asia-pacific-artistic-research-network", "APARN on the SAR website", "btn btn--ghost")}</p>`)}
${sec("aims", "What we are here to do", `<ol class="aims">${c.site.about.purposes.map((p) => `<li data-rise>${esc(p)}</li>`).join("")}</ol><p class="small">${esc(c.site.about.volunteer)}</p>`, { tint: true })}
${sec("history", "How it began", `<ol class="hist">${c.site.about.history.map((h) => `<li data-rise><span class="hist-d">${esc(h.date)}</span><p>${esc(h.text)}</p></li>`).join("")}</ol><p class="small">${esc(c.people.firstMeeting.text)}</p>`)}
${sec("people", "Director and convenors", `<div class="people">${c.people.people.map((p, i) => `<article class="person" id="${p.id}" data-rise style="--i:${i}">
  <div class="person-photo">${personImg(page, p, { sizes: "(min-width: 75em) 22vw, (min-width: 48em) 42vw, 90vw" })}</div>
  <h3 class="person-h">${esc(p.honorific)} ${esc(p.name)}</h3><p class="person-r">${p.roles.map(esc).join(" · ")}</p>
  <p class="person-i">${esc(p.institution)}, ${esc(p.country)}</p>
  <details class="more"><summary>About ${esc(p.name.split(" ")[0])}</summary><div class="more-in"><p>${esc(p.bio)}</p><ul class="plain">${p.activity.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div></details>
  <p><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p></article>`).join("")}</div>
  <p class="small">Each conference also has its own organising team, listed in the <a href="${rel(page, P("archive/"))}">archive</a>.</p>`, { tint: true, lead: "The convenors look after the network between meetings." })}
${sec("contact", "Contact", `<p class="big-contact" data-rise><strong>${esc(c.site.contact.general.name)}</strong>, ${esc(c.site.contact.general.role)}<br><a href="mailto:${esc(c.site.contact.general.email)}">${esc(c.site.contact.general.email)}</a></p><p class="small">${esc(c.site.contact.note)}</p>${joinCta(c)}`, { lead: esc(c.site.contact.intro) })}`;
  return { page, title: "About", description: "About APARN, its Director and convenors.", active: "about/", body };
}

function network(c) {
  const page = P("network/");
  const kinds = Object.keys(c.network.placeKinds);
  const body = `
${phead("Across the network", "APARN connects researchers, artists and institutions across the Asia Pacific and beyond. Choose a place, a person, an activity, a practice or an output to see what it connects to.")}
<section class="sec" aria-label="Network explorer"><div class="wrap">${explorer(c, page)}</div></section>
${sec("figures", "The network in figures", figures(c), { tint: true, lead: esc(c.site.reachNote) })}
${sec("places", "Places, by what happened there", `<div class="places">${kinds.map((k) => {
    const list = c.network.places.filter((p) => p.kinds.includes(k));
    return `<div class="place-g" data-rise><h3>${esc(c.network.placeKinds[k])}</h3><p>${list.map((p) => esc(p.label + (p.country && p.country !== p.label ? `, ${p.country}` : ""))).join(" · ")}</p></div>`;
  }).join("")}<div class="place-g" data-rise><h3>Member locations</h3><p>Not published. The Google Group is private; approved figures can be added here later.</p></div></div>`)}
${sec("research", "Research in conversation", contributionsFilter(c), { tint: true, lead: "Contributions from APARN conferences in APARN’s channel of the Journal for Artistic Research. Filter by conference or search by title and author." })}
<section class="sec"><div class="wrap">${joinCta(c)}</div></section>`;
  return { page, title: "Network", description: "Explore the people, places, activities and practices connected through APARN.", active: "network/", body };
}

function programme(c) {
  const page = P("programme/");
  const body = `
${phead("Take part", "Meet in the region each year, share your progress during the SAR Conference, and add your work to a year-end collection. One contribution can carry you through all three.")}
${sec("ways", "Three ways in", lines(c, page))}
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
${sec("expect", "What to expect", plain(["Papers, performances, creative interventions, workshops and video essays, usually 15–20 minutes each.", "Open to artistic researchers in the region and to those elsewhere with an interest in it.", "Publication in APARN’s channel of the Journal for Artistic Research; some hosts add partner journals.", "APARN2026 was free to attend. Travel bursaries were not available."].map(esc)), { tint: true })}
${sec("hosts", "Where it has been", `<ol class="register">${c.regional.filter((e) => e.status === "held").map((e) => reg(page, e)).join("")}</ol>`)}`;
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
${sec("recent", "Recent gatherings", `<ol class="register">${[s25, s26].map((e) => reg(page, e)).join("")}</ol>`, { tint: true })}`;
  return { page, title: "APARN Gathering at the SAR Conference", description: "Share your research progress with APARN members during the SAR Conference.", active: "programme/", body };
}

function publication(c) {
  const page = P("publication/");
  const a = c.publications.annual;
  const body = `
${phead("Publish with APARN", esc(c.site.messages.jar))}
${sec("annual", esc(a.title), `<div class="feature" data-rise><p class="feature-m">${statusChip(a.status)} A proposal for review</p><p>${esc(a.lede)} ${esc(a.text)}</p><div class="phead-act">${templateButton(c, page, C, "btn btn--template btn--lg")}<p>${esc(c.template.dual)}</p></div></div>
  <ol class="steps">${a.steps.map((s, i) => `<li data-rise><span class="flow-n" aria-hidden="true">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ol>
  <div class="terms" data-rise>${plain(a.terms.map(esc))}<p class="small">${esc(a.context)}</p><p class="small">Still to decide: ${a.toDecide.map(esc).join("; ")}.</p></div>`)}
${sec("now", "Where APARN research is published now", `<div class="pubs">${c.publications.existing.map((p) => `<article class="pub" data-rise><p class="pub-k">${esc(p.kind)}</p><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><ul class="pub-m">${p.meta.map((m) => `<li>${esc(m)}</li>`).join("")}</ul><p>${ext(p.url, "Visit", "btn btn--ghost btn--sm")}</p></article>`).join("")}</div>`, { tint: true })}`;
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
  return { page, title: "Contribute", description: "Send one research-progress contribution: a demonstration.", active: "publication/", body };
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
    <ol class="register register--archive">${all.map((e) => {
      const open = e.status !== "held" && e.status !== "announced";
      return reg(page, e, { status: true }).replace('<li class="reg" data-rise>', `<li class="reg" data-filter-item data-tags="${e.kind}${open ? " open" : ""}" data-rise>`);
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
${phead(esc(e.title), esc(e.summary), `<p class="ev-m" data-rise><span class="pill">${esc(e.label)}</span>${statusChip(e.status, e.statusLabel)}<span>${esc(e.dates.display)}</span><span>${esc(evPlace(e))}</span></p>`, back(page, "archive/", "Archive"))}
${sec("facts", "At a glance", `<dl class="facts">${[["Host", e.host], ["Format", e.format], ...(practice ? [["Practice", practice.label]] : []), ...(e.place.note ? [["Note", e.place.note]] : [])].map(([k, v]) => `<div data-rise><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>${e.highlights?.length ? `<h3 class="h3">Highlights</h3>${plain(e.highlights.map(esc))}` : ""}`, { tint: true })}
${e.organisers?.length ? sec("organisers", "Event organisers", `<ul class="orgs">${e.organisers.map((o) => `<li data-rise><strong>${esc(o.name)}</strong><span>${esc(o.role)}</span>${o.contact ? `<a href="mailto:${esc(o.contact)}">${esc(o.contact)}</a>` : ""}</li>`).join("")}</ul><p class="small">Listed for this edition. The network’s convenors are on the <a href="${rel(page, P("about/"))}">About</a> page.</p>`) : ""}
${imgs.length ? `<section class="sec" aria-label="Images"><div class="wrap gallery">${imgs.map((id) => `<div data-rise>${figure(page, id, { sizes: "(min-width: 64em) 40vw, 100vw" })}</div>`).join("")}</div></section>` : ""}
${e.programme?.length ? sec("programme", "Programme", `<ol class="rows">${e.programme.map((p) => `<li data-rise><span class="rows-d">${esc(p.day)}</span><span class="rows-t">${esc(p.item)}</span></li>`).join("")}</ol>`, { tint: true }) : ""}
${e.archivedCall ? `<section class="sec"><div class="wrap"><details class="more more--call"><summary>Read the original call (archived, now closed)</summary><div class="more-in"><blockquote><p>${esc(e.archivedCall)}</p></blockquote></div></details></div></section>` : ""}
${e.links?.length ? sec("work", "Find the work", `<ul class="links">${e.links.map((l) => `<li>${ext(l.url, esc(l.label), "btn btn--ghost")}</li>`).join("")}</ul>`) : ""}
<section class="sec sec--tight"><div class="wrap">${sourceLinks(c, e.sources)}
<nav class="pager" aria-label="More gatherings">
  ${prev ? `<a href="${rel(page, eventPath(C, prev))}">${BACK}<span><span class="pager-k">Earlier</span>${esc(prev.label)}</span></a>` : "<span></span>"}
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
