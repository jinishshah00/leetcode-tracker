import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const solutionsDir = path.join(ROOT, "solutions");

// map extensions to display language
const EXT_LANG = {
  ".py": "python",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".js": "javascript",
  ".ts": "typescript",
  ".java": "java",
  ".go": "go",
  ".rs": "rust",
  ".cs": "csharp",
  ".kt": "kotlin",
  ".rb": "ruby",
  ".php": "php",
  ".swift": "swift",
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

// Try to parse common LeetCode filename patterns, very forgiving:
//  - 0001-two-sum.py
//  - 1_two-sum.cpp
//  - two-sum.js
//  - 0001 Two Sum.py
function parseProblem(filePath) {
  const rel = path.relative(solutionsDir, filePath).replace(/\\/g, "/");
  const ext = path.extname(filePath).toLowerCase();
  const lang = EXT_LANG[ext] ?? (ext.replace(".", "") || "other");
  const base = path.basename(filePath, ext);

  // Normalize separators to hyphen
  const norm = base.trim().replace(/[\s_]+/g, "-").toLowerCase();

  // Try to extract numeric id if present (1 to 4 digits usually)
  let id = null;
  let slug = norm;

  // Patterns like "0001-two-sum", "1-two-sum", "001-two-sum"
  const m1 = norm.match(/^(\d{1,5})-+(.+)$/);
  if (m1) {
    id = m1[1].replace(/^0+/, "") || m1[1]; // keep "0" if all zeros
    slug = m1[2];
  }

  // Clean slug: keep letters, numbers and hyphens
  slug = slug.replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  // Make a human title
  const title = slug
    .split("-")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: id ?? "—",
    title: title || base,
    slug: slug || base.toLowerCase(),
    lang,
    path: rel,
    link: `https://leetcode.com/problems/${slug}/`,
  };
}

function buildTable(rows) {
  if (!rows.length) {
    return `> _No solutions found in \`solutions/\` yet._\n`;
  }
  const header = `| # | Problem | Language | Solution |\n|:-:|:--|:--:|:--|\n`;
  const body = rows
    .sort((a, b) => {
      // sort by numeric id when available, otherwise by title
      const ai = Number(a.id);
      const bi = Number(b.id);
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
