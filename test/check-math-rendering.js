const fs = require('node:fs');
const path = require('node:path');

const postsDir = path.join(process.cwd(), 'source', '_posts');
const publicDir = path.join(process.cwd(), 'public');
const failures = [];
const mathPosts = [];

function walkMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

for (const filePath of walkMarkdownFiles(postsDir)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontMatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!frontMatter || !/^math:\s*true\s*$/mu.test(frontMatter[1])) continue;

  const titleMatch = frontMatter[1].match(/^title:\s*(.+)$/mu);
  const dateMatch = frontMatter[1].match(/^date:\s*(\d{4})-(\d{2})-(\d{2})/mu);
  if (!titleMatch || !dateMatch) {
    failures.push(`${path.relative(process.cwd(), filePath)}: math post is missing title or date`);
    continue;
  }

  // Mirrors the `:year/:month/:day/:title/` permalink: Hexo slugifies the title
  // (filename_case is 0, whitespace becomes dashes).
  const title = titleMatch[1].trim().replace(/^['"]|['"]$/gu, '').replace(/\s+/gu, '-');
  const [, year, month, day] = dateMatch;
  mathPosts.push({
    label: path.relative(process.cwd(), filePath),
    articlePath: path.join(publicDir, year, month, day, title, 'index.html')
  });
}

if (mathPosts.length === 0) {
  console.log('No posts with `math: true` found; nothing to verify.');
  process.exit(0);
}

for (const { label, articlePath } of mathPosts) {
  if (!fs.existsSync(articlePath)) {
    failures.push(`${label}: missing generated page ${path.relative(process.cwd(), articlePath)}`);
    continue;
  }

  const html = fs.readFileSync(articlePath, 'utf8');
  const checks = [
    ['KaTeX stylesheet is loaded', /katex(?:\.min)?\.css/.test(html)],
    ['display and inline formulas are rendered', /class=["']katex/.test(html)],
    ['raw display-math delimiters are absent', !html.includes('$$')],
    ['raw inline LaTeX is absent', !html.includes('$\\frac')]
  ];
  for (const [name, passed] of checks) {
    console.log(`${passed ? 'PASS' : 'FAIL'}: ${label} - ${name}`);
    if (!passed) failures.push(`${label}: ${name}`);
  }
}

console.log(`Checked KaTeX rendering for ${mathPosts.length} math post(s).`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log('PASS: all math posts render formulas with KaTeX');
