const fs = require('node:fs');
const path = require('node:path');

const postsDir = path.join(process.cwd(), 'source', '_posts');
const failures = [];
let postCount = 0;
let imageCount = 0;

function walkMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

function report(filePath, message) {
  failures.push(`${path.relative(process.cwd(), filePath)}: ${message}`);
}

for (const filePath of walkMarkdownFiles(postsDir)) {
  postCount += 1;
  const relativeName = path.relative(postsDir, filePath);
  if (!/^\d{4}-\d{2}-\d{2}-.+\.md$/u.test(path.basename(filePath))) {
    report(filePath, 'filename must follow YYYY-MM-DD-title.md');
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const frontMatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!frontMatter) {
    report(filePath, 'missing YAML front matter');
  } else {
    for (const field of ['title', 'date']) {
      const fieldPattern = new RegExp(`^${field}:\\s*\\S`, 'mu');
      if (!fieldPattern.test(frontMatter[1])) report(filePath, `missing ${field}`);
    }

    const excerptMatch = frontMatter[1].match(/^excerpt:\s*(.+)$/mu);
    if (excerptMatch && excerptMatch[1].trim() === '摘要') {
      report(filePath, 'excerpt is still the scaffold placeholder "摘要"; write a real summary');
    }
  }

  const imagePattern = /!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))/gu;
  for (const match of content.matchAll(imagePattern)) {
    imageCount += 1;
    const reference = (match[1] || match[2]).split(/[?#]/u)[0];
    if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/iu.test(reference)) continue;

    let decodedReference = reference;
    try {
      decodedReference = decodeURIComponent(reference);
    } catch {
      report(filePath, `image reference is not URL-decodable: ${reference}`);
      continue;
    }

    const assetPath = decodedReference.startsWith('/')
      ? path.join(process.cwd(), 'source', decodedReference.slice(1))
      : path.resolve(path.dirname(filePath), decodedReference);
    if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
      report(filePath, `missing local image: ${reference}`);
    }
  }

  if (relativeName.includes(path.sep)) {
    report(filePath, 'post files must be directly under source/_posts');
  }
}

console.log(`Checked ${postCount} posts and ${imageCount} local image references.`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log('PASS: front matter, filenames, and local image references');
