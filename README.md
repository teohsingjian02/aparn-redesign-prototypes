# APARN website redesign: two prototypes

Two working prototypes for a new website for the Asia Pacific Artistic Research Network (APARN), prepared for
Dr Roopesh Sitharan, Director of APARN. Both use the same checked content and the same functions, so they can be
compared fairly. They differ in art direction and in how you move through them.

| | Live prototype | Built site repository |
|---|---|---|
| Concept A: Editorial Gallery | https://teohsingjian02.github.io/aparn-prototypeA/ | https://github.com/teohsingjian02/aparn-prototypeA |
| Concept B: Living Network | https://teohsingjian02.github.io/aparn-prototypeB/ | https://github.com/teohsingjian02/aparn-prototypeB |

This repository holds the source: content, code, the shared template, screenshots and documents. The two site
repositories only receive the built output. Each site also has a `compare/` page (the comparison and the proposal
summary) and a `sources/` page (sources, credits and open questions).

These are proposal demos, not the official APARN website. https://aparn.net is unchanged, and every page asks search
engines not to index it.

## What is here

| Path | What it holds |
|---|---|
| `content/` | All text and data, as JSON. Edit these to update the sites (see below). |
| `src/lib.mjs` | Shared building blocks: join button, template button, network explorer panels, filters, template preview, submission demo |
| `src/concept-a/` | Concept A page templates (`pages.mjs`) and stylesheet (`a.css`) |
| `src/concept-b/` | Concept B page templates (`pages.mjs`) and stylesheet (`b.css`) |
| `src/shared/aparn.js` | The small script both sites share: menus, explorers, filters, timeline, connection board, demo. No libraries, no tracking, nothing stored |
| `src/build.mjs` | Builds both sites into `dist/` and checks them |
| `static/` | Fonts, optimised images and the template downloads (DOCX and PDF) |
| `tools/` | Template generator, Word PDF export, local server, browser tests, screenshots, deploy |
| `screenshots/` | Desktop, tablet and phone screenshots of both concepts, plus a greyscale comparison |
| `COMPARISON.md` | The two concepts compared: art direction, user experience, strengths and trade-offs |
| `PROPOSAL.md` | The short proposal summary for Dr Roopesh |
| `SOURCES.md` | The source and content inventory: sources, dates, image credits, items to confirm, page list |

## Set up

You need Node.js 22 or later. Google Chrome is needed for the tests and screenshots, and Microsoft Word only for
exporting the template's PDF copy.

```
npm install
```

The only dependency is `docx`, used to generate the template. The sites themselves use no frameworks or libraries.

## Build, preview and test

```
npm run build        # writes dist/aparn-prototypeA and dist/aparn-prototypeB, then checks them
npm run serve        # http://127.0.0.1:8137/aparn-prototypeA/ and /aparn-prototypeB/
npm test             # every page at 360, 768 and 1440 px, plus menus, explorers, filters and the demo
npm run shots        # the tests, then fresh screenshots in screenshots/
npm run test:live    # the same tests against the published sites
```

`npm run build` stops with a list of problems if any link or anchor is broken, the noindex tag is missing, the Join
APARN or Template for Annual Publication buttons are missing from their required places, the demo notice or the
publication checkbox text has changed, or any page contains an em dash. Run `npm run build` again after
`npm run shots` so the compare pages pick up the new screenshots.

## The shared template

`content/template.json` defines the template: its eight sections, the draft limits (about two pages, 400–600 words,
one or two images) and the presentation guide. The same file drives the DOCX, the PDF and the web preview.

```
npm run template                                            # static/downloads/...docx (Roboto, embedded)
powershell -ExecutionPolicy Bypass -File tools/word_export.ps1   # opens it in Word and exports the PDF
npm run build
```

The limits are labelled as draft recommendations for review. To change them, edit `limits` in
`content/template.json`, regenerate, and rebuild.

## Deploy

Each concept is its own GitHub Pages site, published from the `main` branch, folder `/ (root)`, of its repository.

```
npm run build
npm run deploy       # pushes dist/aparn-prototypeA and dist/aparn-prototypeB to their repositories
```

`tools/deploy.mjs` uses your normal git login (Git Credential Manager on Windows) and never prints credentials.
GitHub Pages usually publishes within a minute or two. Then run `npm run test:live`.

First-time setup for a new owner or repository name:

1. Change `owner`, the repository names, `base` and `url` in `content/deploy.json`.
2. Create two empty public repositories with those names on GitHub.
3. Run `npm run build` and `npm run deploy`.
4. In each repository: Settings, Pages, Build and deployment, Source: Deploy from a branch, Branch: `main`, `/ (root)`.

Every address works as a direct link and on refresh, because every page is a real `index.html` file. Unknown
addresses show the site's own `404.html`.

## Updating content

Edit the JSON in `content/`, then build and deploy. Common tasks:

| To | Edit |
|---|---|
| Change the Join APARN link or the words around it | `site.json`, `join` |
| Update a dated figure (members, presentations, countries) | `site.json`, `evidence`: change the value, the date and the note together |
| Announce details of APARN2027 | `events.json`, the `aparn2027` entry: dates, place, host, status (`tbc` to `upcoming`), links |
| Confirm the APARN Gathering at SAR 2027 | `events.json`, `sar2027`: status, date, format |
| Add a new year | `events.json`: copy an entry, give it a new `id`, then link it in `network.json` (`links`) |
| Add or update a person | `people.json`; their place and activities go in `network.json` |
| Add pieces from the JAR channel | `contributions.json`, `items` |
| Change the annual publication proposal | `publications.json`, `annual` |
| Change the comparison or proposal text | `handover.json` |

Keep the house rules: every fact points to a source id in `sources.json`; future events carry a status such as
"Details to be confirmed" until they are confirmed; conference participation is never presented as membership; and no
em dashes (the build checks this).

## Sources

`SOURCES.md` and each site's `sources/` page list every source with its date, every reused image with its credit and
permission status, the design references (studied for ideas only, not copied) and the items still to confirm. All
facts were checked on 24 November 2026.

## Before a production launch

1. Choose a direction: Concept A, Concept B, or a combination.
2. Confirm the open items in `SOURCES.md`, especially the Director title and start date on aparn.net and SAR's page,
   APARN2027 details, whether and how the 2027 SAR gathering runs, and the publication's editors, publisher, schedule
   and licence.
3. Confirm permission for every reused image with the artists and photographers.
4. Approve the template limits and wording.
5. Decide which contact addresses to publish (a shared APARN address may suit better than personal emails).
6. Decide where the site lives (aparn.net or a subdomain) and who maintains the content.
7. Remove the prototype banner and the noindex tags, and add a privacy notice.
8. Set up a real submission service (below).

## How real submissions could work later

The demo checks entries and shows an honest review screen, but nothing leaves the browser. GitHub Pages cannot receive
files, so a live version needs a separate service. Whatever is chosen should keep one editable record per
contribution:

- **Public content:** title, authors, affiliation or independent status, country or region, the completed template and images.
- **Private contact:** the corresponding contributor's name and email, for the organisers only.
- **Presentation:** preferred length (5 or 10 minutes) and status (received, scheduled, presented).
- **Publication:** the opt-in preference, recorded on its own, and an editorial status (not requested, in review, revisions requested, approved).
- **Permissions:** image permissions, consent to record the talk and consent to show contact details, each asked separately.
- **Versions:** corrections and new progress update the same record with a new version number.

The simplest route is a Google Form with a file upload, saving to a sheet in APARN's Google Drive, which fits the
existing Google Group. A form service or a small serverless function with private file storage would give more control
over editing the same record. Either way: limit uploads to DOCX, PDF or ODT up to 10 MB, store files privately, send a
confirmation email, and publish nothing without the contributor's approval.
