import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const solutionsDir = path.join(ROOT, "solutions");

// Known language folders and extensions
const LANG_DIRS = new Set([
  "cpp","java","javascript","typescript","python","go","rust","csharp","kotlin","ruby","php","swift"
]);
const EXT_LANG = {
  ".py":"python", ".cpp":"cpp", ".cc":"cpp", ".cxx":"cpp",
  ".js":"javascript", ".ts":"typescript", ".java":"java",
  ".go":"go", ".rs":"rust", ".cs":"csharp", ".kt":"kotlin",
  ".rb":"ruby", ".php":"php", ".swift":"swift"
};

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// Build a title from a slug like "two-sum" → "Two Sum"
const titleize = slug => slug.split("-").filter(Boolean)
  .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

function parseProblem(filePath) {
  const rel = path.relative(solutionsDir, filePath).replace(/\\/g, "/");
  const parts = rel.split("/");
  const ext = path.extname(filePath).toLowerCase();

  // Language: prefer top-level language folder if present, else by extension
  let lang = LANG_DIRS.has(parts[0]?.toLowerCase())
    ? parts[0].toLowerCase()
    : (EXT_LANG[ext] ?? (ext.replace(".", "") || "other"));

  // Find a segment like "0001-two-sum" anywhere in the path
  const segRegex = /^(\d{1,5})[-_\s]+(.+)$/;
  let id = null, slug = null;
  for (const seg of parts) {
    const m = seg.toLowerCase().match(segRegex);
    if (m) { id = m[1].replace(/^0+/, "") || m[1]; slug = m[2]; break; }
  }

  // If not found in directories, try the filename itself
  if (!slug) {
    const base = path.basename(filePath, ext).trim().replace(/[\s_]+/g, "-").toLowerCase();
    const m2 = base.match(/^(\d{1,5})-+(.+)$/);
    if (m2) { id = m2[1].replace(/^0+/, "") || m2[1]; slug = m2[2]; }
    else { slug = base; id = "—"; }
  }

  // Sanitize slug
  slug = slug.replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const title = titleize(slug);

  return {
    id,
    title: title || path.basename(filePath),
    slug,
    lang,
    path: rel,
    link: `https://leetcode.com/problems/${slug}/`,
  };
}

function buildTable(rows) {
  if (!rows.length) return `> _No solutions found in \`solutions/\` yet._\n`;
  const header = `| # | Problem | Language | Solution |\n|:-:|:--|:--:|:--|\n`;
  const body = rows
    .sort((a, b) => {
      const ai = Number(a.id), bi = Number(b.id);
      if (!Number.isNaN(ai) && !Number.isNaN(bi)) return ai - bi;
      if (!Number.isNaN(ai)) return -1;
      if (!Number.isNaN(bi)) return 1;
      return a.title.localeCompare(b.title);
    })
    .map(r => `| ${r.id} | [${r.title}](${r.link}) | ${r.lang} | [view](${encodeURI(r.path)}) |`)
    .join("\n");
  return header + body + "\n";
}

function updateReadme(table) {
  const readmePath = path.join(ROOT, "README.md");
  let md = fs.readFileSync(readmePath, "utf8");
  if (!/<!-- AUTO-TABLE-START -->/.test(md)) {
    md += `\n\n## Problems\n<!-- AUTO-TABLE-START -->\n<!-- AUTO-TABLE-END -->\n`;
  }
  md = md.replace(
    /<!-- AUTO-TABLE-START -->([\s\S]*?)<!-- AUTO-TABLE-END -->/,
    `<!-- AUTO-TABLE-START -->\n${table}<!-- AUTO-TABLE-END -->`
  );
  fs.writeFileSync(readmePath, md);
}

const files = walk(solutionsDir).filter(p => EXT_LANG[path.extname(p).toLowerCase()]);
const rows = files.map(parseProblem);
updateReadme(buildTable(rows));
console.log(`✅ README updated with ${rows.length} solution(s).`);
