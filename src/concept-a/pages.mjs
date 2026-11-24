// Concept A: Editorial Gallery. A calm, guided journey in the manner of an exhibition catalogue:
// discover APARN, see its activity, meet the network, then find a way to take part.
import {
  esc, rel, statusChip, sourceLinks, img, figure, ext, EXT, joinButton, templateButton, eventPath, nodeIndex, nodePanel,
  contributionsFilter, templatePreview, templateLimitsLine, presentationGuide, downloads, submissionDemo, recordModel, IMAGES,
} from "../lib.mjs";

const C = ""; // Concept A is the whole of its own site, so its pages sit at the site root
const P = (p = "") => C + p;

// ------------------------------------------------------------------ original graphics: islands on a horizon line
function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
export function isles(seed, { w = 240, h = 40, cls = "isles" } = {}) {
  const r = rng(seed);
  const base = h * 0.72;
  let x = 6 + r() * 14, shapes = "";
  while (x < w - 18) {
    const iw = 6 + r() * 26, ih = 2 + r() * (h * 0.38);
    shapes += `<path d="M${x.toFixed(1)} ${base} Q ${(x + iw * (0.3 + r() * 0.4)).toFixed(1)} ${(base - ih * 2).toFixed(1)} ${(x + iw).toFixed(1)} ${base} Z"/>`;
    x += iw + 6 + r() * 28;
  }
  return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false"><line x1="0" y1="${base}" x2="${w}" y2="${base}"/>${shapes}</svg>`;
}
function plate(e, practice) {
  return `<div class="plate${e.status !== "held" ? " plate--open" : ""}" aria-hidden="true">
  <span class="plate-label">${esc(e.kind === "sar" ? "At SAR" : "APARN")}</span>
  <span class="plate-year">${esc(String(e.year))}</span>
  ${isles(e.year * 31 + (e.kind === "sar" ? 7 : 0))}
  <span class="plate-theme">${esc(practice ? practice.label : e.title)}</span>
  <span class="plate-place">${esc(e.place.city)}</span>
</div>`;
}

// ------------------------------------------------------------------ page shell
const NAV = [["about/", "About"], ["network/", "Network"], ["programme/", "Programme"], ["publication/", "Publication"], ["archive/", "Archive"]];
function shell(c, page, { title, description, active, body }) {
  const navItems = NAV.map(([href, label]) => `<li><a href="${rel(page, P(href))}"${active === href ? ' aria-current="page"' : ""}>${label}</a></li>`).join("");
  return `<!doctype html>
<html lang="en" class="concept-a">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} · APARN · Concept A prototype</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#F4EFE6">
<link rel="icon" href="${rel(page, P("assets/icon.svg"))}" type="image/svg+xml">
<link rel="preload" href="${rel(page, "assets/fonts/newsreader-normal-latin-3.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel(page, P("assets/a.css"))}">
<script>document.documentElement.classList.add("js")</script>
<script defer src="${rel(page, "assets/js/aparn.js")}"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="proto">${esc(c.site.prototypeLabel)}. <span class="proto-concept">Concept A: Editorial Gallery.</span> <a href="${rel(page, "compare/")}">Compare all three concepts</a></div>
<header class="masthead">
  <div class="masthead-inner">
    <a class="wordmark" href="${rel(page, P(""))}">${isles(2019, { w: 64, h: 22, cls: "wordmark-isles" })}<span class="wordmark-short">APARN</span><span class="wordmark-full">Asia Pacific Artistic Research Network</span></a>
    <nav class="site-nav" aria-label="Main">
      <button class="menu-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-menu">Menu</button>
      <div class="site-menu" id="site-menu">
        <ul>${navItems}</ul>
        <p class="menu-join">${joinButton(c, "btn btn--join")}<span class="menu-join-note">${esc(c.site.join.where)}</span></p>
      </div>
    </nav>
    ${joinButton(c, "btn btn--join masthead-join")}
  </div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="colophon">
  <div class="colophon-inner">
    <div class="colophon-lead">
      <p class="colophon-mark">APARN</p>
      <p>${esc(c.site.name)}: a Special Interest Group of the ${ext("https://societyforartisticresearch.org/", "Society for Artistic Research")}.</p>
      ${joinButton(c, "btn btn--join")}
      <p class="colophon-small">${esc(c.site.join.where)}</p>
    </div>
    <div>
      <h2 class="colophon-h">Contact</h2>
      <p>${esc(c.site.contact.general.name)}, ${esc(c.site.contact.general.role)}<br><a href="mailto:${esc(c.site.contact.general.email)}">${esc(c.site.contact.general.email)}</a></p>
      <p><a href="${rel(page, P("about/#contact"))}">All convenors and contacts</a></p>
    </div>
    <div>
      <h2 class="colophon-h">Elsewhere</h2>
      <ul class="colophon-list">
        <li>${ext("https://jar-online.net/en/channels/asia-pacific-artistic-research-network", "APARN in the Journal for Artistic Research")}</li>
        <li>${ext("https://societyforartisticresearch.org/sigs/asia-pacific-artistic-research-network", "APARN at SAR")}</li>
        <li>${ext("https://sar2027.eu/sk", "SAR 2027, Bratislava")}</li>
        <li>${ext(c.site.officialSite, "The current aparn.net")}</li>
      </ul>
    </div>
    <div>
      <h2 class="colophon-h">About this prototype</h2>
      <p class="colophon-small">A redesign proposal for discussion. Content checked ${esc(c.site.lastChecked)}. Proposals are marked as such.</p>
      <ul class="colophon-list">
        <li><a href="${rel(page, "sources/")}">Sources, credits and open questions</a></li>
        <li><a href="${esc(c.deploy.sites.b.url)}">See Concept B: Living Network</a></li>
        <li><a href="${esc(c.deploy.sites.c.url)}">See Concept C: Clear Signal</a></li>
      </ul>
    </div>
  </div>
</footer>
</body>
</html>`;
}

const sectionMark = () => ""; // numbered section markers were dropped: the headings carry the structure
const evPlace = (e) => [e.place.city, e.place.country].filter((x, i, a) => x && a.indexOf(x) === i).join(", ");

// ------------------------------------------------------------------ shared blocks for concept A
function joinBlock(c, page, { heading = "Join APARN", lead } = {}) {
  return `<section class="join-block" aria-labelledby="join-${heading.length}">
  <h2 id="join-${heading.length}" class="join-h">${esc(heading)}</h2>
  <p class="join-lead">${esc(lead || c.site.join.benefit)}</p>
  <div class="join-actions">${joinButton(c, "btn btn--join btn--large")}<p class="join-where">${esc(c.site.join.where)} ${esc(c.site.join.who)}</p></div>
</section>`;
}
function benefits(c) {
  return `<ol class="benefits">${c.site.benefits.map((b, i) => `<li class="benefit" data-reveal>
    <h3>${esc(b.title)}</h3>
    <p>${esc(b.text)}</p><p class="benefit-proof">${esc(b.proof)}</p></li>`).join("")}</ol>`;
}
function evidence(c, cls = "evidence") {
  return `<dl class="${cls}">${c.site.evidence.map((x) => `<div class="ev ev--${x.kind}" data-reveal><dt class="ev-v">${esc(x.value)}</dt><dd><span class="ev-l">${esc(x.label)}</span><span class="ev-d">${esc(x.date)}</span><span class="ev-n">${esc(x.note)}</span></dd></div>`).join("")}</dl>`;
}
function threeWays(c, page) {
  const conf = c.eventById.aparn2027, sar = c.eventById.sar2027;
  return `<ol class="ways">
  <li class="way" data-reveal><p class="way-k">Every year, in the region</p><h3>APARN Conference</h3>
    <p>A gathering hosted by a different institution each year, with papers, performances, workshops and conversation.</p>
    <p class="way-next"><span>Next</span> APARN2027, ${esc(conf.host.replace(" (details to be confirmed)", ""))} ${statusChip(conf.status)}</p>
    <a class="arrow" href="${rel(page, P("programme/conference/"))}">The conference</a></li>
  <li class="way" data-reveal><p class="way-k">Every year, at SAR</p><h3>APARN Gathering at the SAR Conference</h3>
    <p>Share where your research is now in a short update of 5–10 minutes, with members joining from across the network.</p>
    <p class="way-next"><span>Next</span> SAR 2027, Bratislava, 21–23 April 2027 ${statusChip(sar.status)}</p>
    <a class="arrow" href="${rel(page, P("programme/gathering-at-sar/"))}">The gathering</a></li>
  <li class="way" data-reveal><p class="way-k">At the end of each year</p><h3>APARN Annual Publication</h3>
    <p>A year-end collection of members’ research in progress, made from the same contribution you present.</p>
    <p class="way-next"><span>Status</span> ${statusChip("proposed")}</p>
    <a class="arrow" href="${rel(page, P("publication/"))}">The publication</a></li>
</ol>`;
}
function workflow(c, page, { heading = true } = {}) {
  return `<div class="flow">
  ${heading ? `<p class="flow-lead">${esc(c.site.messages.contributeLine)}</p>` : ""}
  <ol class="flow-steps">
    <li><span class="flow-n">1</span><strong>Prepare one contribution</strong><span>About two pages from the shared template.</span></li>
    <li><span class="flow-n">2</span><strong>Share a 5–10-minute update at SAR</strong><span>Present the same contribution at the APARN Gathering.</span></li>
    <li><span class="flow-n">3</span><strong>Opt in to the year-end collection</strong><span>If you choose, the same contribution is prepared for the book.</span></li>
  </ol>
  <div class="flow-actions">${templateButton(c, page, C, "btn btn--template btn--large")}<p class="flow-dual">${esc(c.template.dual)}</p>
  <a class="arrow" href="${rel(page, P("contribute/"))}">Try the submission demo</a></div>
</div>`;
}

// ------------------------------------------------------------------ pages
function home(c) {
  const page = P("");
  const idx = nodeIndex(c);
  const recent = c.contributions.items.filter((x) => x.edition === "aparn2026").slice(0, 4);
  const next27 = c.eventById.aparn2027, sar27 = c.eventById.sar2027;
  const body = `
<section class="opening">
  <div class="opening-text">
    <h1 class="opening-h">${esc(c.site.messages.headlineA)}</h1>
    <p class="opening-lede">${esc(c.site.messages.lede)}</p>
    <div class="opening-actions">${joinButton(c, "btn btn--join btn--large")}<a class="arrow" href="${rel(page, P("network/"))}">Explore the network</a></div>
    <p class="opening-where">${esc(c.site.join.where)}</p>
  </div>
  ${figure(page, "eshraghi", { sizes: "(min-width: 64em) 46vw, 100vw", eager: true, figCls: "opening-fig fig" })}
</section>
<aside class="next-ribbon" aria-label="Coming up">
  <p><span class="next-k">Next conference</span> <strong>APARN2027</strong> at RMIT University Vietnam. ${statusChip(next27.status)}</p>
  <p><span class="next-k">Next SAR Conference</span> <strong>SAR 2027</strong>, Bratislava, 21–23 April 2027. ${ext("https://sar2027.eu/sk", "sar2027.eu")}</p>
</aside>

<section class="sec sec--discover" aria-labelledby="h-discover">
  ${sectionMark("01", "Discover")}
  <div class="split">
    <h2 id="h-discover" class="h2">A network for people who make knowledge through art.</h2>
    <div class="split-body">
      <p class="lead">${esc(c.site.about.intro)}</p>
      <ol class="purposes">${c.site.about.purposes.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
      <div class="note-sar"><p class="note-sar-k">Part of SAR</p><p>${esc(c.site.messages.sar)}</p></div>
      <a class="arrow" href="${rel(page, P("about/"))}">About APARN, its Director and convenors</a>
    </div>
  </div>
</section>

<section class="sec sec--activity" aria-labelledby="h-activity">
  ${sectionMark("02", "Activity")}
  <h2 id="h-activity" class="h2">See what artistic research is making possible.</h2>
  <div class="activity">
    <article class="feature" data-reveal>
      ${plate(c.eventById.aparn2026, c.practiceById.authorship)}
      <div class="feature-body"><p class="feature-k">${statusChip("held")} 27–29 July 2026 · Singapore</p>
      <h3><a href="${rel(page, eventPath(C, c.eventById.aparn2026))}">Who Speaks? Authorship, Authority, and Authenticity</a></h3>
      <p>${esc(c.eventById.aparn2026.summary)}</p></div>
    </article>
    <article class="feature feature--quiet" data-reveal>
      <h3 class="feature-h">New in the JAR channel</h3>
      <p>Contributions from Singapore are already published in APARN’s channel of the Journal for Artistic Research.</p>
      <ul class="mini-list">${recent.map((it) => `<li><a href="${esc(it.url)}" rel="noopener" target="_blank"><span class="mini-title">${esc(it.title)}</span><span class="mini-by">${esc(it.authors)}</span></a></li>`).join("")}</ul>
      <a class="arrow" href="${rel(page, P("network/#research"))}">Browse all 28 pieces</a>
    </article>
  </div>
  <div class="stories">
    ${[["book", "From a 2020 conversation to a book"], ["residency", "Five weeks in Oslo on climate and coloniality"], ["chapalang", "Making do with technology, in Singapore"]].map(([id, h]) => {
      const o = c.outputById[id];
      return `<details class="story" data-reveal><summary><span class="story-k">${esc(o.kind)}</span><span class="story-h">${esc(h)}</span><span class="story-t">${esc(o.label)}</span></summary>
      <div class="story-body"><p>${esc(o.text)}</p>${o.url ? `<p>${ext(o.url, "Find out more")}</p>` : ""}${sourceLinks(c, o.sources)}</div></details>`;
    }).join("")}
  </div>
</section>

<section class="sec sec--network" aria-labelledby="h-network">
  ${sectionMark("03", "Network")}
  <h2 id="h-network" class="h2">Meet the people. See where the work happens.</h2>
  ${evidence(c)}
  <p class="reach-note">${esc(c.site.reachNote)}</p>
  <div class="travel" aria-labelledby="h-travel">
    <h3 id="h-travel" class="h3">The conference travels</h3>
    <ol class="travel-line">${c.regional.map((e) => `<li class="travel-stop travel-stop--${e.status}"><a href="${rel(page, eventPath(C, e))}"><span class="travel-year">${e.year}</span><span class="travel-place">${esc(e.place.city)}</span></a></li>`).join("")}</ol>
  </div>
  <div class="people-strip">
    <h3 class="h3">Director and convenors</h3>
    <ul class="people-list">${c.people.people.map((p) => `<li><a href="${rel(page, P(`about/#${p.id}`))}"><span class="people-name">${esc(p.name)}</span><span class="people-role">${esc(p.roles[0])}</span><span class="people-inst">${esc(p.institution)}</span></a></li>`).join("")}</ul>
  </div>
  <div class="why" aria-labelledby="h-why">
    <h3 id="h-why" class="h3">Why join APARN</h3>
    ${benefits(c)}
  </div>
  ${joinBlock(c, page, { heading: "Become part of the conversation" })}
</section>

<section class="sec sec--part" aria-labelledby="h-part">
  ${sectionMark("04", "Take part")}
  <h2 id="h-part" class="h2">${esc(c.site.messages.contribute)}</h2>
  ${threeWays(c, page)}
  ${workflow(c, page)}
</section>

<section class="closing" aria-labelledby="h-closing">
  ${isles(2027, { w: 480, h: 60, cls: "closing-isles" })}
  <h2 id="h-closing" class="closing-h">Join the conversation.</h2>
  <p>${esc(c.site.join.benefit)}</p>
  ${joinButton(c, "btn btn--join btn--large")}
  <p class="join-where">${esc(c.site.join.where)}</p>
</section>`;
  return { page, title: "Home", description: c.site.messages.lede, active: "", body };
}

function about(c) {
  const page = P("about/");
  const body = `
<header class="page-head">
  <p class="kicker">About</p>
  <h1 class="h1">About APARN</h1>
  <p class="lead">${esc(c.site.about.intro)}</p>
</header>
<section class="sec" aria-labelledby="h-sar">
  <div class="split">
    <h2 id="h-sar" class="h2">Part of the Society for Artistic Research</h2>
    <div class="split-body">
      <p>${esc(c.site.messages.sar)}</p>
      <p>${esc(c.site.messages.jar)}</p>
      <p>${esc(c.site.about.open)}</p>
      <p>${ext("https://societyforartisticresearch.org/sigs/asia-pacific-artistic-research-network", "APARN on the SAR website")}</p>
    </div>
  </div>
</section>
<section class="sec" aria-labelledby="h-purpose">
  <div class="split">
    <h2 id="h-purpose" class="h2">What we are here to do</h2>
    <div class="split-body"><ol class="purposes">${c.site.about.purposes.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
    <p class="small">${esc(c.site.about.purposesNote)}</p><p>${esc(c.site.about.volunteer)}</p></div>
  </div>
</section>
<section class="sec" aria-labelledby="h-history">
  <h2 id="h-history" class="h2">How APARN began</h2>
  <ol class="history">${c.site.about.history.map((h) => `<li data-reveal><span class="history-d">${esc(h.date)}</span><p>${esc(h.text)}</p></li>`).join("")}</ol>
  <p class="small">${esc(c.people.firstMeeting.text)}</p>
  ${sourceLinks(c, c.site.about.sources)}
</section>
<section class="sec" aria-labelledby="h-people">
  <h2 id="h-people" class="h2">Director and convenors</h2>
  <p class="lead-s">The convenors look after the network. Each annual conference also has its own organising team, listed in the <a href="${rel(page, P("archive/"))}">archive</a>.</p>
  <div class="people-cat">${c.people.people.map((p, i) => `<article class="person" id="${p.id}" data-reveal>
    <p class="person-n">${String(i + 1).padStart(2, "0")}</p>
    <div><h3 class="person-name">${esc(p.honorific)} ${esc(p.name)}</h3>
    <p class="person-roles">${p.roles.map(esc).join(" · ")}</p>
    <p class="person-inst">${esc(p.institution)}, ${esc(p.country)}</p>
    <p>${esc(p.bio)}</p>
    <details class="person-more"><summary>Work with APARN</summary><ul>${p.activity.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>${sourceLinks(c, p.sources)}</details>
    <p class="person-mail"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p></div></article>`).join("")}</div>
</section>
<section class="sec" id="contact" aria-labelledby="h-contact">
  <div class="split">
    <h2 id="h-contact" class="h2">Contact</h2>
    <div class="split-body"><p>${esc(c.site.contact.intro)}</p>
    <p class="contact-main"><strong>${esc(c.site.contact.general.name)}</strong>, ${esc(c.site.contact.general.role)}<br><a href="mailto:${esc(c.site.contact.general.email)}">${esc(c.site.contact.general.email)}</a></p>
    <p class="small">${esc(c.site.contact.note)}</p></div>
  </div>
</section>
${joinBlock(c, page)}`;
  return { page, title: "About", description: "About APARN, its Director and convenors.", active: "about/", body };
}

function network(c) {
  const page = P("network/");
  const idx = nodeIndex(c);
  const tabs = [["place", "Places"], ["person", "People"], ["practice", "Practices"], ["activity", "Activities"], ["output", "Outputs"]];
  const order = {
    place: c.network.places.map((p) => p.id),
    person: c.people.people.map((p) => p.id),
    practice: c.network.practices.map((p) => p.id),
    activity: c.events.events.map((e) => e.id),
    output: c.network.outputs.map((o) => o.id),
  };
  const btn = (id) => `<button type="button" class="node node--${idx.nodes[id].type}" data-select-button="${id}" data-select-group="node" data-label="${esc(idx.nodes[id].label)}" data-links="${idx.links[id].join(" ")}" aria-pressed="false"><span class="node-l">${esc(idx.nodes[id].label)}</span><span class="node-s">${esc(idx.nodes[id].sub)}</span></button>`;
  const body = `
<header class="page-head">
  <p class="kicker">Across the network</p>
  <h1 class="h1">Meet the people. Explore the work.</h1>
  <p class="lead">APARN connects researchers, artists and institutions across the Asia Pacific and beyond. Choose a place, a person, a practice, an activity or an output to see what it connects to.</p>
</header>
<section class="sec" aria-labelledby="h-evidence">
  <h2 id="h-evidence" class="vh">The network in numbers</h2>
  ${evidence(c)}
  <p class="reach-note">${esc(c.site.reachNote)}</p>
</section>
<section class="sec explorer-a" aria-labelledby="h-explore" data-select="node" data-select-initial="yogyakarta" data-select-focus>
  <h2 id="h-explore" class="h2">Explore the connections</h2>
  <div class="explorer-grid" data-select="tab" data-select-initial="place">
    <div class="explorer-index">
      <div class="tabs" role="group" aria-label="Show">${tabs.map(([t, l]) => `<button type="button" class="tab" data-select-button="${t}" data-select-group="tab" aria-pressed="false">${l}</button>`).join("")}</div>
      ${tabs.map(([t, l]) => `<div class="tab-panel" data-select-panel="${t}" data-select-group="tab"><h3 class="tab-panel-h">${l}</h3>
        ${t === "place" ? `<div class="kind-key">${Object.entries(c.network.placeKinds).map(([k, v]) => `<span class="kind kind--${k}">${esc(v)}</span>`).join("")}</div>` : ""}
        <div class="node-list" data-select-list>${order[t].map(btn).join("")}</div></div>`).join("")}
    </div>
    <div class="explorer-panels">
      <p class="vh" data-select-live="node" aria-live="polite"></p>
      ${Object.keys(idx.nodes).map((id) => nodePanel(c, C, page, idx, id).replace('class="panel"', 'class="panel" data-select-group="node"')).join("\n")}
    </div>
  </div>
</section>
<section class="sec" id="research" aria-labelledby="h-research">
  <h2 id="h-research" class="h2">Research in conversation</h2>
  <p class="lead-s">Contributions from APARN conferences, published in APARN’s channel of the Journal for Artistic Research. Filter by conference or search by title and author.</p>
  ${contributionsFilter(c)}
</section>
<section class="sec" aria-labelledby="h-why2">
  <h2 id="h-why2" class="h2">Why join APARN</h2>
  ${benefits(c)}
</section>
${joinBlock(c, page)}`;
  return { page, title: "Network", description: "People, places, practices and research connected through APARN.", active: "network/", body };
}

function programme(c) {
  const page = P("programme/");
  const body = `
<header class="page-head">
  <p class="kicker">Programme</p>
  <h1 class="h1">Three ways to take part</h1>
  <p class="lead">Meet in the region each year, share your progress during the SAR Conference, and add your work to a year-end collection. One contribution can carry you through all three.</p>
</header>
<section class="sec" aria-labelledby="h-ways"><h2 id="h-ways" class="vh">The three ways</h2>${threeWays(c, page)}</section>
<section class="sec" aria-labelledby="h-flow"><h2 id="h-flow" class="h2">One contribution, two uses</h2>${workflow(c, page)}</section>
<section class="sec" aria-labelledby="h-dates">
  <h2 id="h-dates" class="h2">Coming up</h2>
  <ul class="dates">
    <li><span class="dates-d">${esc(c.eventById.aparn2027.dates.display)}</span><span class="dates-t"><strong>APARN2027</strong>, RMIT University Vietnam</span>${statusChip(c.eventById.aparn2027.status)}</li>
    <li><span class="dates-d">21–23 April 2027</span><span class="dates-t"><strong>SAR 2027</strong>, Bratislava: SAR’s 18th International Conference on Artistic Research</span>${statusChip("upcoming", "SAR event")}</li>
    <li><span class="dates-d">During SAR 2027</span><span class="dates-t"><strong>APARN Gathering at SAR 2027</strong></span>${statusChip(c.eventById.sar2027.status)}</li>
  </ul>
  <p class="small">SAR 2027 has its own call and registration on ${ext("https://sar2027.eu/sk", "sar2027.eu")}. They are separate from the APARN gathering.</p>
</section>
${joinBlock(c, page, { heading: "Hear about calls first", lead: "Calls for papers, hosting invitations and gathering details reach members through the APARN Google Group." })}`;
  return { page, title: "Programme", description: "APARN Conference, APARN Gathering at the SAR Conference and the APARN Annual Publication.", active: "programme/", body };
}

function conference(c) {
  const page = P("programme/conference/");
  const next = c.eventById.aparn2027;
  const body = `
<header class="page-head">
  <p class="kicker"><a href="${rel(page, P("programme/"))}">Programme</a> · Every year, in the region</p>
  <h1 class="h1">APARN Conference</h1>
  <p class="lead">Each year a different host opens its doors to artists, researchers, educators and communities from across the Asia Pacific. Together we share practices, test ideas and build friendships that last beyond the conference.</p>
</header>
<section class="sec next-conf" aria-labelledby="h-next">
  ${plate(next, null)}
  <div>
    <p class="kicker">Next conference</p>
    <h2 id="h-next" class="h2">APARN2027 at RMIT University Vietnam</h2>
    <p>${esc(next.summary)}</p>
    <p>${statusChip(next.status)} City, dates, theme and call: to be announced.</p>
    ${joinButton(c, "btn btn--join")}
    <p class="join-where">${esc(c.site.join.where)} Calls are shared there first.</p>
  </div>
</section>
<section class="sec" aria-labelledby="h-expect">
  <div class="split"><h2 id="h-expect" class="h2">What to expect</h2>
  <div class="split-body"><ul class="ticks">
    <li>Papers, performances, creative interventions, workshops and video essays, usually 15–20 minutes each.</li>
    <li>Calls are open to artistic researchers based in the region and to those elsewhere with an interest in it.</li>
    <li>Presenters can publish in APARN’s channel of the Journal for Artistic Research, and some hosts offer partner journals too.</li>
    <li>APARN2026 was free to attend. Travel bursaries were not available.</li>
  </ul>${sourceLinks(c, ["aparn-2024", "aparn-2025", "aparn-2026"])}</div></div>
</section>
<section class="sec" aria-labelledby="h-hosts">
  <h2 id="h-hosts" class="h2">Where the conference has been</h2>
  <ol class="hosts">${c.regional.filter((e) => e.status === "held").map((e) => `<li data-reveal><a href="${rel(page, eventPath(C, e))}"><span class="hosts-y">${e.year}</span><span class="hosts-t">${esc(e.title)}</span><span class="hosts-p">${esc(evPlace(e))}</span><span class="hosts-h">${esc(e.host)}</span></a></li>`).join("")}</ol>
</section>`;
  return { page, title: "APARN Conference", description: "The annual APARN Conference, hosted across the Asia Pacific.", active: "programme/", body };
}

function gathering(c) {
  const page = P("programme/gathering-at-sar/");
  const s25 = c.eventById.sar2025, s26 = c.eventById.sar2026, s27 = c.eventById.sar2027;
  const body = `
<header class="page-head">
  <p class="kicker"><a href="${rel(page, P("programme/"))}">Programme</a> · Every year, at SAR</p>
  <h1 class="h1">APARN Gathering at the SAR Conference</h1>
  <p class="lead">Each year, during the Society for Artistic Research’s conference or forum, APARN members come together to share what they are working on. The gathering is online, so members who cannot travel can still join in.</p>
  <div class="head-actions">${templateButton(c, page, C, "btn btn--template btn--large")}<p class="flow-dual">${esc(c.template.dual)}</p></div>
</header>
<section class="sec next-conf" aria-labelledby="h-sar27">
  ${plate(s27, null)}
  <div><p class="kicker">Next</p><h2 id="h-sar27" class="h2">APARN Gathering at SAR 2027</h2>
  <p>SAR’s 18th International Conference on Artistic Research, “Beyond the Familiar”, takes place on 21–23 April 2027 at the Academy of Performing Arts in Bratislava. Join fellow members there to share where your research is now.</p>
  <p>${statusChip(s27.status)} The APARN team will confirm the date, time and format of the gathering.</p>
  <p class="small">SAR 2027 has its own call for contributions (closing 25 November 2026) and its own registration, both on ${ext("https://sar2027.eu/sk", "sar2027.eu")}. The APARN gathering is separate.</p></div>
</section>
<section class="sec" aria-labelledby="h-format">
  <div class="split"><h2 id="h-format" class="h2">A short update, in your own way</h2>
  <div class="split-body">
    <p>The proposed format gives each participant about <strong>5–10 minutes</strong> to share current research and progress. Work in progress is welcome: you do not need finished results. Visual, performative and sound formats are welcome within the time.</p>
    ${presentationGuide(c)}
    <p class="small">The proposed format and the programme are subject to confirmation by APARN’s Director and organisers.</p>
  </div></div>
</section>
<section class="sec" aria-labelledby="h-how">
  <h2 id="h-how" class="h2">How to take part</h2>
  ${workflow(c, page, { heading: false })}
</section>
<section class="sec" aria-labelledby="h-past">
  <h2 id="h-past" class="h2">Recent gatherings</h2>
  <ul class="gatherings">${[s25, s26].map((e) => `<li data-reveal><a href="${rel(page, eventPath(C, e))}"><span class="g-y">${e.year}</span><span class="g-t">${esc(e.title)}</span><span class="g-s">${esc(e.summary)}</span></a></li>`).join("")}</ul>
</section>`;
  return { page, title: "APARN Gathering at the SAR Conference", description: "Share your research progress with APARN members during the SAR Conference.", active: "programme/", body };
}

function publication(c) {
  const page = P("publication/");
  const a = c.publications.annual;
  const body = `
<header class="page-head">
  <p class="kicker">Publication</p>
  <h1 class="h1">Publish with APARN</h1>
  <p class="lead">${esc(c.site.messages.jar)}</p>
</header>
<section class="sec annual" aria-labelledby="h-annual">
  <div class="annual-head">
    <p class="kicker">${statusChip(a.status)} A proposal for review</p>
    <h2 id="h-annual" class="h2">${esc(a.title)}</h2>
    <p class="lead">${esc(a.lede)} ${esc(a.text)}</p>
    <div class="head-actions">${templateButton(c, page, C, "btn btn--template btn--large")}<p class="flow-dual">${esc(c.template.dual)}</p></div>
  </div>
  <ol class="annual-steps">${a.steps.map((s, i) => `<li data-reveal><span class="flow-n">${i + 1}</span><strong>${esc(s.title)}</strong><p>${esc(s.text)}</p></li>`).join("")}</ol>
  <div class="split">
    <h3 class="h3">Good to know</h3>
    <div class="split-body"><ul class="ticks">${a.terms.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    <p class="small">${esc(a.context)}</p>
    <p class="small"><strong>Still to decide:</strong> ${a.toDecide.map(esc).join("; ")}.</p></div>
  </div>
</section>
<section class="sec" aria-labelledby="h-existing">
  <h2 id="h-existing" class="h2">Where APARN research is published now</h2>
  <div class="pubs">${c.publications.existing.map((p) => `<article class="pub" data-reveal><p class="pub-k">${esc(p.kind)}</p><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>
    <ul class="pub-meta">${p.meta.map((m) => `<li>${esc(m)}</li>`).join("")}</ul><p>${ext(p.url, "Visit")}</p></article>`).join("")}</div>
</section>`;
  return { page, title: "Publication", description: "The APARN Annual Publication (proposed), the JAR channel and other routes to publish.", active: "publication/", body };
}

function template(c) {
  const page = P("template/");
  const t = c.template;
  const body = `
<header class="page-head">
  <p class="kicker"><a href="${rel(page, P("publication/"))}">Publication</a> · Shared template</p>
  <h1 class="h1">${esc(t.buttonLabel)}</h1>
  <p class="lead">${esc(t.dual)}</p>
  ${downloads(c, page)}
  <p class="small">${esc(t.versionShort)}. ${esc(templateLimitsLine(t))}</p>
</header>
<section class="sec tpl-wrap" aria-label="Template preview">
  <p class="kicker">Preview</p>
  ${templatePreview(c)}
</section>
<section class="sec" aria-labelledby="h-steps">
  <div class="split"><h2 id="h-steps" class="h2">How to complete it</h2>
  <div class="split-body"><ol class="steps-list">${t.instructions.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
  <a class="btn btn--primary" href="${rel(page, P("contribute/"))}">Go to the submission demo</a></div></div>
</section>
<section class="sec" aria-labelledby="h-talk"><h2 id="h-talk" class="vh">Presentation guide</h2>${presentationGuide(c, 2)}</section>`;
  return { page, title: t.buttonLabel, description: t.dual, active: "publication/", body };
}

function contribute(c) {
  const page = P("contribute/");
  const body = `
<header class="page-head">
  <p class="kicker"><a href="${rel(page, P("publication/"))}">Publication</a> · Contribute</p>
  <h1 class="h1">Share what you are working on</h1>
  <p class="lead">${esc(c.site.messages.contributeLine)} Start with the template, then send it with a few details.</p>
  <div class="head-actions">${templateButton(c, page, C, "btn btn--template")}<p class="flow-dual">${esc(c.template.dual)}</p></div>
</header>
<section class="sec">${submissionDemo(c, page, C)}</section>
<section class="sec" aria-labelledby="h-record">
  <div class="split"><h2 id="h-record" class="h2">On a live site: one contribution record</h2>
  <div class="split-body"><p>A production version would keep a single editable record for each contribution. The same approved material serves both the SAR presentation and the book, and revisions update that record rather than creating a new submission.</p>
  <dl class="record">${recordModel().map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div></div>
</section>`;
  return { page, title: "Contribute", description: "Send one research-progress contribution: a prototype demonstration.", active: "publication/", body };
}

function archive(c) {
  const page = P("archive/");
  const all = [...c.events.events].sort((a, b) => a.year - b.year || (a.kind === "sar") - (b.kind === "sar"));
  const body = `
<header class="page-head">
  <p class="kicker">Archive</p>
  <h1 class="h1">Every APARN gathering since 2019</h1>
  <p class="lead">From the first meeting in Yogyakarta to the conference in Singapore, and what comes next. Choose a year to see what happened, who organised it and where to find the work.</p>
</header>
<section class="sec timeline-a" aria-labelledby="h-tl" data-select="year" data-select-initial="aparn2026">
  <h2 id="h-tl" class="vh">Timeline</h2>
  <div class="filter" data-filter data-unit-one="gathering" data-unit-many="gatherings">
    <div class="filter-buttons" role="group" aria-label="Show">
      <button type="button" class="chip" data-filter-value="all" aria-pressed="true">All</button>
      <button type="button" class="chip" data-filter-value="regional" aria-pressed="false">APARN Conference</button>
      <button type="button" class="chip" data-filter-value="sar" aria-pressed="false">Gatherings at SAR</button>
    </div>
    <p class="filter-count" data-filter-count aria-live="polite"></p>
    <ol class="tl" data-select-list>${all.map((e) => `<li data-filter-item data-tags="${e.kind}"><button type="button" class="tl-stop tl-stop--${e.kind} tl-stop--${e.status}" data-select-button="${e.id}" data-select-group="year" aria-pressed="false"><span class="tl-y">${e.year}</span><span class="tl-l">${esc(e.kind === "sar" ? "At SAR" : e.place.city)}</span></button></li>`).join("")}</ol>
    <p class="filter-empty" data-filter-empty hidden>No gatherings match.</p>
  </div>
  <p class="vh" data-select-live="year" aria-live="polite"></p>
  <div class="tl-panels">${all.map((e) => `<article class="tl-panel" data-select-panel="${e.id}" data-select-group="year">
    ${plate(e, e.theme ? c.practiceById[e.theme] : null)}
    <div><p class="kicker">${statusChip(e.status, e.statusLabel)} ${esc(e.dates.display)} · ${esc(evPlace(e))}</p>
    <h3 class="h2">${esc(e.title)}</h3><p>${esc(e.summary)}</p>
    <a class="btn btn--primary" href="${rel(page, eventPath(C, e))}">Open ${esc(e.label)}</a></div></article>`).join("")}</div>
</section>`;
  return { page, title: "Archive", description: "Every APARN conference and gathering since 2019.", active: "archive/", body };
}

function eventPage(c, e, prev, next) {
  const page = eventPath(C, e);
  const practice = e.theme ? c.practiceById[e.theme] : null;
  const imgs = (e.images || []).filter((id) => IMAGES[id]);
  const body = `
<header class="page-head event-head">
  ${plate(e, practice)}
  <div>
    <p class="kicker"><a href="${rel(page, P("archive/"))}">Archive</a> · ${esc(e.kind === "sar" ? "APARN Gathering at SAR" : "APARN Conference")}</p>
    <h1 class="h1">${esc(e.title)}</h1>
    <p class="event-meta">${statusChip(e.status, e.statusLabel)} <span>${esc(e.dates.display)}</span> <span>${esc(evPlace(e))}</span></p>
    <p class="lead">${esc(e.summary)}</p>
  </div>
</header>
<section class="sec">
  <div class="split"><h2 class="h3">At a glance</h2>
  <div class="split-body"><dl class="facts">
    <div><dt>Label</dt><dd>${esc(e.label)}</dd></div>
    <div><dt>Host</dt><dd>${esc(e.host)}</dd></div>
    <div><dt>Format</dt><dd>${esc(e.format)}</dd></div>
    ${practice ? `<div><dt>Practice</dt><dd>${esc(practice.label)}</dd></div>` : ""}
    ${e.place.note ? `<div><dt>Note</dt><dd>${esc(e.place.note)}</dd></div>` : ""}
  </dl>
  ${e.highlights?.length ? `<h3 class="h4">Highlights</h3><ul class="ticks">${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
  ${e.organisers?.length ? `<h3 class="h4">Event organisers</h3><ul class="org">${e.organisers.map((o) => `<li><strong>${esc(o.name)}</strong>, ${esc(o.role)}${o.contact ? ` (<a href="mailto:${esc(o.contact)}">${esc(o.contact)}</a>)` : ""}</li>`).join("")}</ul><p class="small">Event organisers are listed for this edition. Network convenors are on the <a href="${rel(page, P("about/"))}">About</a> page.</p>` : ""}
  </div></div>
</section>
${imgs.length ? `<section class="sec gallery" aria-label="Images">${imgs.map((id) => figure(page, id, { sizes: "(min-width: 64em) 40vw, 100vw" })).join("")}</section>` : ""}
${e.programme?.length ? `<section class="sec" aria-labelledby="h-prog"><h2 id="h-prog" class="h2">Programme</h2><ol class="prog">${e.programme.map((p) => `<li><span class="prog-d">${esc(p.day)}</span><span>${esc(p.item)}</span></li>`).join("")}</ol></section>` : ""}
${e.archivedCall ? `<section class="sec"><details class="call"><summary>Read the original call (archived, now closed)</summary><blockquote><p>${esc(e.archivedCall)}</p></blockquote></details></section>` : ""}
${e.links?.length ? `<section class="sec" aria-labelledby="h-links"><h2 id="h-links" class="h3">Find the work</h2><ul class="links">${e.links.map((l) => `<li>${ext(l.url, esc(l.label))}</li>`).join("")}</ul></section>` : ""}
<section class="sec">${sourceLinks(c, e.sources)}</section>
<nav class="pager" aria-label="More gatherings">
  ${prev ? `<a class="pager-prev" href="${rel(page, eventPath(C, prev))}"><span>Earlier</span>${esc(prev.label)}</a>` : "<span></span>"}
  ${next ? `<a class="pager-next" href="${rel(page, eventPath(C, next))}"><span>Later</span>${esc(next.label)}</a>` : "<span></span>"}
</nav>
${e.status !== "held" ? joinBlock(c, page, { heading: "Be the first to hear", lead: "Dates, calls and details are shared through the APARN Google Group." }) : ""}`;
  return { page, title: e.label, description: e.summary, active: "archive/", body };
}

export function buildPages(c) {
  const list = [home(c), about(c), network(c), programme(c), conference(c), gathering(c), publication(c), template(c), contribute(c), archive(c)];
  const evs = [...c.events.events].sort((a, b) => a.year - b.year || (a.kind === "sar") - (b.kind === "sar"));
  evs.forEach((e, i) => list.push(eventPage(c, e, evs[i - 1], evs[i + 1])));
  return list.map((p) => ({ path: p.page, html: shell(c, p.page, p) }));
}
