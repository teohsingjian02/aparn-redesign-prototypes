// Builds the shared, editable contribution template (DOCX) from content/template.json.
//   npm run template        writes static/downloads/<files.docx>
// Then export the PDF reading copy with Word:  powershell -File tools/word_export.ps1
// The document is set in Roboto (SIL Open Font License 1.1). The font is embedded in the DOCX,
// so it shows correctly on computers that do not have Roboto installed.
const fs = require("node:fs");
const path = require("node:path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType,
  BorderStyle, Header, Footer, PageNumber, LevelFormat, TableLayoutType, PageBreak,
} = require(process.env.DOCX_PATH || "docx");

const root = path.join(__dirname, "..");
const t = JSON.parse(fs.readFileSync(path.join(root, "content", "template.json"), "utf8"));
const out = path.join(root, "static", "downloads", t.files.docx);
const font = (f) => fs.readFileSync(path.join(__dirname, "fonts", f));

const INK = "1A1A1A", GREY = "707070", RULE = "BDBDBD";
const PAGE_W = 11906, MARGIN = 1134, CONTENT_W = PAGE_W - 2 * MARGIN; // A4, 2 cm margins
const line = { style: BorderStyle.SINGLE, size: 4, color: RULE };
const borders = { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line };

const run = (text, o = {}) => new TextRun({ text, ...o });
const para = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], ...o });
const guidance = (text) => para([run(text)], { style: "Guidance" });
const placeholder = (text) => para([run(text)], { style: "Placeholder" });
const sentence = (s) => (/[.!?]$/.test(s) ? s : `${s}.`);
const limitsLine = `Aim for ${t.limits.pages.toLowerCase()}: ${t.limits.words} and ${t.limits.images.toLowerCase()} (draft limits, still under review).`;

function table(rows, widths, { headerRow = false } = {}) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    borders,
    rows: rows.map((r, i) => new TableRow({
      tableHeader: headerRow && i === 0,
      cantSplit: true,
      children: r.map((text, j) => new TableCell({
        width: { size: widths[j], type: WidthType.DXA },
        margins: { top: 90, bottom: 90, left: 110, right: 110 },
        children: [para([run(text, { bold: (headerRow && i === 0) || (!headerRow && j === 0 && text !== "") })], { spacing: { after: 0 } })],
      })),
    })),
  });
}

// ---------------------------------------------------------------- content
const body = [
  para([run(t.title)], { style: "Title" }),
  para([run(sentence(t.subtitle))], { spacing: { after: 200 } }),
  para([run(t.intro)]),
  para([run(`${limitsLine} Please leave out email addresses: your contact details go in the submission form. Save the file as Surname_ShortTitle.docx or .pdf.`)], { spacing: { after: 120 } }),
];
for (const s of t.sections) {
  body.push(para([run(`${s.n}. ${s.title}`)], { heading: HeadingLevel.HEADING_1 }));
  body.push(guidance(`${s.words ? `${s.words}. ` : ""}${sentence(s.guidance)}`));
  if (s.n === 2) {
    body.push(table(s.fields.map((f) => [f, ""]), [3500, CONTENT_W - 3500]));
  } else if (s.n === 7) {
    body.push(para([run("[Insert image 1]")], { style: "Placeholder", keepNext: true }));
    body.push(para([run("[Insert image 2, optional]")], { style: "Placeholder", keepNext: true }));
    body.push(table([["Image", "Caption", "Credit", "Permission confirmed (yes/no)"], ["1", "", "", ""], ["2 (optional)", "", "", ""]], [1500, 3200, 2900, CONTENT_W - 7600], { headerRow: true }));
  } else if (s.n === 8) {
    for (let i = 0; i < 3; i++) body.push(para([run(`[${s.placeholder}]`)], { style: "Placeholder", numbering: { reference: "refs", level: 0 } }));
  } else {
    body.push(placeholder(`[${s.placeholder}]`));
  }
}

// presentation guide on its own page
const p = t.presentation;
body.push(para([new PageBreak()]));
body.push(para([run(p.title)], { heading: HeadingLevel.HEADING_1 }));
body.push(para([run(p.intro)], { spacing: { after: 160 } }));
body.push(table([["Part", "From your contribution", "5-minute update", "10-minute update"], ...p.parts.map((x, i) => [`${i + 1}. ${x.title}`, x.from, x.five, x.ten])], [3000, 2300, 2169, CONTENT_W - 7469], { headerRow: true }));
body.push(para([run(p.note)], { spacing: { before: 140 } }));

// ---------------------------------------------------------------- document
const doc = new Document({
  creator: "APARN",
  title: t.title,
  subject: t.subtitle,
  description: t.versionShort,
  keywords: "APARN, artistic research, research progress, template",
  fonts: [{ name: "Roboto", data: font("Roboto-Regular.ttf"), bold: font("Roboto-Bold.ttf"), italic: font("Roboto-Italic.ttf") }],
  styles: {
    default: { document: { run: { font: "Roboto", size: 21, color: INK, language: { value: "en-GB" } }, paragraph: { spacing: { line: 276, after: 100 } } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Roboto", size: 40, bold: true, color: INK }, paragraph: { spacing: { after: 100 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Roboto", size: 24, bold: true, color: INK }, paragraph: { spacing: { before: 280, after: 40 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
      { id: "Guidance", name: "Guidance", basedOn: "Normal", next: "Placeholder", quickFormat: true, run: { color: GREY, size: 19 }, paragraph: { spacing: { after: 80 }, keepNext: true } },
      { id: "Placeholder", name: "Placeholder", basedOn: "Normal", next: "Normal", quickFormat: true, run: { color: GREY }, paragraph: { spacing: { after: 100 } } },
    ],
  },
  numbering: {
    config: [
      { reference: "refs", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START, style: { run: { font: "Roboto", color: GREY }, paragraph: { indent: { left: 400, hanging: 280 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN, header: 567, footer: 567 } } },
    headers: { default: new Header({ children: [para([run(t.versionShort, { font: "Roboto", size: 16, color: GREY })], { alignment: AlignmentType.RIGHT })] }) },
    footers: { default: new Footer({ children: [para([new TextRun({ font: "Roboto", size: 16, color: GREY, children: [PageNumber.CURRENT] })], { alignment: AlignmentType.CENTER })] }) },
    children: body,
  }],
});

if (JSON.stringify(t).includes("—")) throw new Error("template.json contains an em dash");
fs.mkdirSync(path.dirname(out), { recursive: true });
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log(`wrote ${path.relative(root, out)} (${Math.round(buf.length / 1024)} KB)`);
});
