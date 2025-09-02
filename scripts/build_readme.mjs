import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const solutionsDir = path.join(ROOT, "solutions");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function parseProblem(filePath) {
  // Example filenames from leetcode-sync often look like:
  // 0001-two-sum.py or 0123-best-time-to-buy-and-sell-stock-iii.cpp
  const rel = path.relative(solutionsDir, filePath);
  const lang = rel.split(path.sep)[0];
  const base = path.basename(filePath);
  const m = base.match(/^(\d+)-(.+)\.[^.]+$/);
  if (!m) return null;
  const id = m[1];
  const slug = m[2];
  const title = slug.split("-").map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
  return {
    id,
    title,
    slug,
    lang,
    path: rel.replace(/\\/g, "/"),
    link: `https://leetcode.com/problems/${slug}/`,
  };
}

function buildTable(rows) {
  const header = `| # | Problem | Language | Solution |\n|:-:|:--|:--:|:--|\n`;
  const body = rows
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(r => `| ${r.id} | [${r.title}](${r.link}) | ${r.lang} | [view](${encodeURI(r.path)}) |`)
    .join("\n");
  return header + body + "\n";
}

function updateReadme(table) {
  const readmePath = path.join(ROOT, "README.md");
  let md = fs.readFileSync(readmePath, "utf8");
  md = md.replace(
    /<!-- AUTO-TABLE-START -->([\s\S]*?)<!-- AUTO-TABLE-END -->/,
    `<!-- AUTO-TABLE-START -->\n${table}<!-- AUTO-TABLE-END -->`
  );
  fs.writeFileSync(readmePath, md);
}

const files = fs.existsSync(solutionsDir) ? walk(solutionsDir) : [];
const problems = files
  .filter(f => /\.\w+$/.test(f))         // only files
  .map(parseProblem)
  .filter(Boolean);

updateReadme(buildTable(problems));
console.log(`✅ Generated table for ${problems.length} solutions.`);
