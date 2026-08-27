(() => {
  const canvas = document.querySelector('#starfield');
  const context = canvas.getContext('2d');
  const body = document.body;
  const heartButton = document.querySelector('#heartButton');
  const igniteButton = document.querySelector('#igniteButton');
  const fullscreenButton = document.querySelector('#fullscreenButton');
  const quote = document.querySelector('#quote');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const messages = [
    '每一次心跳，都值得被整个宇宙听见。',
    '光穿过漫长夜色，只为落在你的眼眸。',
    '愿所有奔赴，都有温柔而热烈的回响。',
    '把这一瞬的心动，写进一整片星河。'
  ];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let motes = [];
  let bursts = [];
  let pointer = { x: 0, y: 0 };
  let ignited = false;
  let messageIndex = 0;

  const random = (min, max) => min + Math.random() * (max - min);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const starCount = Math.min(190, Math.max(80, Math.round(width * height / 10500)));
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      size: random(.35, 1.7), phase: Math.random() * Math.PI * 2,
      speed: random(.0004, .002), hue: Math.random() > .7 ? random(285, 330) : random(190, 250)
    }));
    motes = Array.from({ length: Math.round(starCount * .52) }, () => makeMote());
  }

  function makeMote(center = false) {
    const angle = Math.random() * Math.PI * 2;
    const radius = center ? random(25, 170) : random(0, Math.max(width, height) * .65);
    return {
      x: center ? width / 2 + Math.cos(angle) * radius : Math.random() * width,
      y: center ? height / 2 + Math.sin(angle) * radius : Math.random() * height,
      vx: random(-.16, .16), vy: random(-.24, .08), size: random(.7, 2.2),
      alpha: random(.13, .62), hue: Math.random() > .5 ? random(305, 340) : random(200, 260), life: random(90, 240)
    };
  }

  function drawHeart(x, y, size, alpha, hue) {
    context.save();
    context.translate(x, y);
    context.scale(size / 32, size / 32);
    context.beginPath();
    for (let step = 0; step <= 60; step += 1) {
      const t = (step / 60) * Math.PI * 2;
      const px = 16 * Math.sin(t) ** 3;
      const py = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      if (step === 0) context.moveTo(px, py); else context.lineTo(px, py);
    }
    context.closePath();
    context.fillStyle = `hsla(${hue}, 100%, 75%, ${alpha})`;
    context.shadowBlur = 12;
    context.shadowColor = `hsla(${hue}, 100%, 65%, ${alpha})`;
    context.fill();
    context.restore();
  }

  function burst(x, y, amount = 90) {
    for (let index = 0; index < amount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = random(1.1, ignited ? 7.5 : 4.8);
      bursts.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: random(1.5, 8.5), alpha: 1, hue: Math.random() > .4 ? random(315, 350) : random(185, 275),
        decay: random(.009, .025), heart: Math.random() > .64
      });
    }
  }

  function paint(time) {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    stars.forEach((star) => {
      const pulse = .32 + (Math.sin(time * star.speed + star.phase) + 1) * .34;
      context.beginPath();
      context.fillStyle = `hsla(${star.hue}, 90%, 86%, ${pulse})`;
      context.arc(star.x, star.y, star.size * (1 + pulse), 0, Math.PI * 2);
      context.fill();
    });
    motes.forEach((mote, index) => {
      mote.x += mote.vx * (ignited ? 2 : 1);
      mote.y += mote.vy * (ignited ? 2 : 1);
      mote.life -= 1;
      if (mote.life <= 0 || mote.y < -15 || mote.x < -15 || mote.x > width + 15) motes[index] = makeMote(true);
      context.beginPath();
      context.fillStyle = `hsla(${mote.hue}, 100%, 76%, ${mote.alpha})`;
      context.shadowBlur = 10;
      context.shadowColor = `hsl(${mote.hue}, 100%, 70%)`;
      context.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
      context.fill();
    });
    bursts = bursts.filter((particle) => particle.alpha > .025);
    bursts.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= .975;
      particle.vy = particle.vy * .975 + .018;
      particle.alpha -= particle.decay;
      if (particle.heart) drawHeart(particle.x, particle.y, particle.size * 3, particle.alpha, particle.hue);
      else {
        context.beginPath();
        context.fillStyle = `hsla(${particle.hue}, 100%, 75%, ${particle.alpha})`;
        context.shadowBlur = 16;
        context.shadowColor = `hsl(${particle.hue}, 100%, 70%)`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
    });
    context.globalCompositeOperation = 'source-over';
    requestAnimationFrame(paint);
  }

  function setQuote() {
    messageIndex = (messageIndex + 1) % messages.length;
    quote.style.opacity = '0';
    quote.style.transform = 'translateY(6px)';
    window.setTimeout(() => {
      quote.textContent = messages[messageIndex];
      quote.style.opacity = '1';
      quote.style.transform = 'translateY(0)';
    }, 180);
  }

  function release(x = width / 2, y = height / 2) {
    burst(x, y, ignited ? 145 : 95);
    setQuote();
    heartButton.animate([
      { transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: .26 }, { transform: 'scale(.95)', offset: .55 }, { transform: 'scale(1)' }
    ], { duration: 680, easing: 'cubic-bezier(.2,.85,.25,1)' });
  }

  heartButton.addEventListener('click', () => release());
  igniteButton.addEventListener('click', () => {
    ignited = !ignited;
    body.classList.toggle('ignited', ignited);
    igniteButton.innerHTML = ignited ? '<span>✦</span> 收拢光芒' : '<span>✦</span> 点亮星河';
    release();
  });
  window.addEventListener('pointermove', (event) => {
    pointer = { x: event.clientX - width / 2, y: event.clientY - height / 2 };
    body.style.setProperty('--pointer-x', `${pointer.x}px`);
    body.style.setProperty('--pointer-y', `${pointer.y}px`);
  }, { passive: true });
  window.addEventListener('click', (event) => {
    if (event.target.closest('button, a')) return;
    burst(event.clientX, event.clientY, 25);
  });
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) { fullscreenButton.textContent = '浏览器不支持全屏'; }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreenButton.innerHTML = document.fullscreenElement ? '<span>⛶</span> 退出全屏' : '<span>⛶</span> 全屏沉浸';
  });
  window.addEventListener('resize', resize, { passive: true });
  resize();
  if (!reducedMotion) requestAnimationFrame(paint);
  else paint(0);
  window.setTimeout(() => release(), 550);
})();
