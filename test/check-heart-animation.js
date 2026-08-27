const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'source', 'heart-animation', 'script.js');
const pagePath = path.join(__dirname, '..', 'source', 'heart-animation', 'index.html');
const script = fs.readFileSync(scriptPath, 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');
const failures = [];

function expect(pattern, message) {
  if (!pattern.test(script)) failures.push(message);
}

if (/<canvas/i.test(page)) failures.push('the page must not use a Canvas render loop');
if (/requestAnimationFrame|setInterval/.test(script)) failures.push('the page must not schedule continuous JavaScript animation');
if (/particles|motes|bursts|starfield/i.test(script)) failures.push('the page must not maintain particle collections');
expect(/--tilt-x/, 'pointer interaction must only update CSS 3D tilt variables');
expect(/heart-slice/, 'the page must use layered vector slices for the 3D heart');

if (failures.length) {
  console.error(`FAIL: heart animation performance budget\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('PASS: heart animation stays within its rendering performance budget');
