const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'source', 'heart-animation', 'script.js');
const pagePath = path.join(__dirname, '..', 'source', 'heart-animation', 'index.html');
const script = fs.readFileSync(scriptPath, 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');
const failures = [];

function expect(source, pattern, message) {
  if (!pattern.test(source)) failures.push(message);
}

// The page is a realtime Canvas 3D particle experience.
expect(page, /<canvas/i, 'the page must render through a <canvas> element');
expect(script, /requestAnimationFrame/, 'the page must drive animation with requestAnimationFrame');

// Accessibility: the experience must calm down for reduced-motion users.
expect(script, /prefers-reduced-motion/, 'the animation must respect prefers-reduced-motion');

// Performance guards: cap pixel ratio and transient particle counts.
expect(script, /Math\.min\(window\.devicePixelRatio/, 'devicePixelRatio must be capped for performance');
expect(script, /bursts\.length < \d+/, 'transient burst particles must be capped');

// Interaction contract: pointer tilt and click bursts.
expect(script, /pointermove/, 'pointer movement must tilt the scene');
expect(script, /pointerdown/, 'clicking must spawn a particle burst');

if (failures.length) {
  console.error(`FAIL: heart animation design contract\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('PASS: heart animation matches its realtime 3D design contract');
