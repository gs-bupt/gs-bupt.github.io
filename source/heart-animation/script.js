(() => {
  const root = document.documentElement;
  const stage = document.querySelector('#heartStage');
  const heartButton = document.querySelector('#heartButton');
  const igniteButton = document.querySelector('#igniteButton');
  const fullscreenButton = document.querySelector('#fullscreenButton');
  const quote = document.querySelector('#quote');
  const heartSlices = document.querySelectorAll('.heart-slice');
  const messages = [
    '有些光，不必喧闹，也足够照亮彼此。',
    '让每一次靠近，都有清晰而安静的方向。',
    '不需要漫天星点，心意本身就足够明亮。'
  ];
  let messageIndex = 0;
  let lit = false;

  function setLighting() {
    lit = !lit;
    stage.classList.toggle('is-lit', lit);
    igniteButton.textContent = lit ? '收起光影' : '切换光影';
    messageIndex = (messageIndex + 1) % messages.length;
    quote.textContent = messages[messageIndex];
  }

  stage.addEventListener('pointermove', (event) => {
    const bounds = stage.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 14;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * -10;
    root.style.setProperty('--tilt-x', `${x.toFixed(2)}deg`);
    root.style.setProperty('--tilt-y', `${y.toFixed(2)}deg`);
  });

  stage.addEventListener('pointerleave', () => {
    root.style.setProperty('--tilt-x', '0deg');
    root.style.setProperty('--tilt-y', '0deg');
  });

  heartButton.addEventListener('click', setLighting);
  igniteButton.addEventListener('click', setLighting);
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

  if (!heartSlices.length) console.warn('3D heart slices are unavailable');
})();
