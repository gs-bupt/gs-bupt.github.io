(() => {
  'use strict';

  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const quoteEl = document.getElementById('quote');
  const igniteButton = document.getElementById('igniteButton');
  const fullscreenButton = document.getElementById('fullscreenButton');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const messages = [
    '有些光，不必喧闹，也足够照亮彼此。',
    '隔着一条星河，心跳依然清晰。',
    '我把心事标进星图，等你抬头认领。'
  ];
  let messageIndex = 0;
  let lit = false;

  /* ---------- viewport ---------- */
  let W = 0, H = 0, DPR = 1, CX = 0, CY = 0, R = 0, bg = null;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W / 2;
    CY = H * 0.52;
    R = Math.min(W, H) * 0.42;
    bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * 0.75);
    bg.addColorStop(0, lit ? '#181026' : '#100c1c');
    bg.addColorStop(0.55, '#0a0916');
    bg.addColorStop(1, '#05040c');
    seedStars();
  }

  /* ---------- glow sprites (pre-rendered, fast additive draws) ---------- */
  const PALETTE = ['#ff6f9c', '#ff8f7a', '#ffd27a', '#ffffff', '#c86bd9'];
  const sprites = PALETTE.map(makeSprite);

  function makeSprite(color) {
    const s = document.createElement('canvas');
    s.width = s.height = 64;
    const g = s.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, color);
    grad.addColorStop(0.35, color + 'aa');
    grad.addColorStop(1, color + '00');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return s;
  }

  /* ---------- 3D heart point cloud ---------- */
  const HEART_N = 2600;
  const heart = [];

  function heartSurface(t) {
    return {
      x: (16 * Math.sin(t) ** 3) / 17,
      y: (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17
    };
  }

  for (let i = 0; i < HEART_N; i++) {
    const t = Math.random() * Math.PI * 2;
    const p = heartSurface(t);
    // Half the points hug the shell so the silhouette reads solid; the rest fill the volume.
    const s = i % 2 === 0 ? 0.86 + Math.random() * 0.14 : Math.cbrt(Math.random());
    const round = Math.sqrt(Math.max(0, 1 - s * s)); // rounded depth profile
    heart.push({
      x: p.x * s + (Math.random() - 0.5) * 0.02,
      y: p.y * s + (Math.random() - 0.5) * 0.02,
      z: (Math.random() * 2 - 1) * round * 0.6,
      c: pickColor(),
      tw: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.4,
      sz: 0.7 + Math.random() * 0.9
    });
  }

  function pickColor() {
    const r = Math.random();
    if (r < 0.55) return 0;   // rose
    if (r < 0.72) return 1;   // coral
    if (r < 0.86) return 2;   // gold
    if (r < 0.96) return 3;   // white
    return 4;                 // violet
  }

  /* ---------- background stars ---------- */
  let stars = [];
  function seedStars() {
    const n = Math.min(220, Math.round((W * H) / 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.4 + Math.random() * 1.2,
      ph: Math.random() * Math.PI * 2,
      sp: 0.4 + Math.random() * 1.2
    }));
  }

  /* ---------- bursts ---------- */
  const bursts = [];
  function burst(x, y) {
    for (let i = 0; i < 130 && bursts.length < 600; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 1 + Math.random() * 5;
      bursts.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 1,
        life: 1,
        c: pickColor()
      });
    }
  }

  /* ---------- rotation / tilt ---------- */
  let rotY = -0.4;
  let tiltX = 0, tiltY = 0, wantX = 0, wantY = 0;
  const autoSpeed = reduced ? 0 : 0.004;

  window.addEventListener('pointermove', (e) => {
    wantY = (e.clientX / W - 0.5) * 0.7;
    wantX = (e.clientY / H - 0.5) * -0.4;
  });

  canvas.addEventListener('pointerdown', (e) => {
    burst(e.clientX, e.clientY);
    messageIndex = (messageIndex + 1) % messages.length;
    quoteEl.textContent = messages[messageIndex];
  });

  /* ---------- render loop ---------- */
  const FOV = 3.1;

  function frame(now) {
    const t = now / 1000;
    rotY += autoSpeed;
    tiltX += (wantX - tiltX) * 0.06;
    tiltY += (wantY - tiltY) * 0.06;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // stars (soft additive twinkle)
    ctx.globalCompositeOperation = 'lighter';
    const starA = lit ? 0.9 : 0.6;
    for (const st of stars) {
      const a = reduced ? starA * 0.6 : starA * (0.35 + 0.65 * Math.abs(Math.sin(t * st.sp + st.ph)));
      ctx.globalAlpha = a;
      const d = st.r * 6;
      ctx.drawImage(sprites[3], st.x - d / 2, st.y - d / 2, d, d);
    }

    // rotate + project heart
    const ry = rotY + tiltY, rx = -0.16 + tiltX;
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cx = Math.cos(rx), sx = Math.sin(rx);
    const glow = lit ? 1.18 : 1;

    // ambient halo behind the heart so it reads as a glowing body
    const halo = R * (lit ? 3.1 : 2.6);
    ctx.globalAlpha = lit ? 0.26 : 0.16;
    ctx.drawImage(sprites[0], CX - halo / 2, CY - halo / 2, halo, halo);

    for (const p of heart) {
      const x1 = p.x * cy + p.z * sy;
      const z1 = -p.x * sy + p.z * cy;
      const y1 = p.y * cx - z1 * sx;
      const z2 = p.y * sx + z1 * cx;

      const scale = FOV / (FOV + z2);
      const px = CX + x1 * R * scale;
      const py = CY - y1 * R * scale;
      const near = (1.25 - z2) / 2.25;               // 0..1 depth brightness
      const twk = reduced ? 1 : 0.8 + 0.35 * Math.sin(t * p.sp + p.tw);
      const d = (4.2 * p.sz * scale * glow) * (0.5 + near) * twk;

      ctx.globalAlpha = Math.min(1, 0.35 + near * 0.8);
      ctx.drawImage(sprites[p.c], px - d / 2, py - d / 2, d, d);
    }

    // bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.05;
      b.vx *= 0.985;
      b.life -= 0.016;
      if (b.life <= 0) { bursts.splice(i, 1); continue; }
      const d = 10 * b.life;
      ctx.globalAlpha = b.life;
      ctx.drawImage(sprites[b.c], b.x - d / 2, b.y - d / 2, d, d);
    }

    requestAnimationFrame(frame);
  }

  /* ---------- controls ---------- */
  igniteButton.addEventListener('click', () => {
    lit = !lit;
    igniteButton.textContent = lit ? '收起星河' : '点亮星河';
    resize(); // rebuild background glow for the new state
    messageIndex = (messageIndex + 1) % messages.length;
    quoteEl.textContent = messages[messageIndex];
  });

  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) {
      fullscreenButton.textContent = '浏览器不支持全屏';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreenButton.textContent = document.fullscreenElement ? '退出全屏' : '全屏沉浸';
  });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
