const fs = require('node:fs');
const path = require('node:path');

const articlePath = path.join(
  process.cwd(),
  'public',
  '2023',
  '09',
  '18',
  '知识蒸馏开山之作论文精读',
  'index.html'
);

if (!fs.existsSync(articlePath)) {
  console.error(`Math rendering check failed: missing ${articlePath}`);
  process.exit(1);
}

const html = fs.readFileSync(articlePath, 'utf8');
const checks = [
  ['KaTeX stylesheet is loaded', /katex(?:\.min)?\.css/.test(html)],
  ['display and inline formulas are rendered', /class=["']katex/.test(html)],
  ['raw display-math delimiters are absent', !html.includes('$$')],
  ['raw inline LaTeX is absent', !html.includes('$\\frac')]
];

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${name}`);
}

if (failures.length > 0) {
  process.exit(1);
}
