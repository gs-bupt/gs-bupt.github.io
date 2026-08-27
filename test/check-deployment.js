const siteUrl = process.env.SITE_URL;

if (!siteUrl) {
  console.error('Deployment smoke test failed: SITE_URL is not set');
  process.exit(1);
}

// The article URLs below are intentional canaries: the smoke test pins stable,
// long-lived pages so a broken deployment is caught regardless of which posts
// are published later. Do not rename or delete these posts without updating
// this script.
const formulaSlug = encodeURIComponent('知识蒸馏开山之作论文精读');
const checks = [
  { name: 'home page', path: '/', contains: /<title[\s>]/iu },
  { name: 'Skill article', path: '/2026/08/27/codex-skills/', contains: /Codex Skill/iu },
  { name: 'formula article', path: `/2023/09/18/${formulaSlug}/`, contains: /katex/iu }
];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchWithFallback(url) {
  const urls = [url];
  if (url.startsWith('https://')) urls.push(`http://${url.slice('https://'.length)}`);

  let lastError;
  for (const candidate of urls) {
    try {
      const response = await fetch(candidate, { redirect: 'follow' });
      return { candidate, response };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function checkPage(check) {
  const url = new URL(check.path, siteUrl).toString();
  let lastFailure;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { candidate, response } = await fetchWithFallback(url);
      const body = await response.text();
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      if (!check.contains.test(body)) throw new Error('expected content was not found');
      console.log(`PASS: ${check.name} (${candidate})`);
      return;
    } catch (error) {
      lastFailure = error;
      if (attempt < 3) await delay(5000);
    }
  }
  throw new Error(`${check.name}: ${lastFailure.message}`);
}

(async () => {
  for (const check of checks) await checkPage(check);
})().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
