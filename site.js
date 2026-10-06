/* Cairn scene-to-screen: real film chapters and a complete screenshot archive. */
(() => {
  const video = document.querySelector('#cairn-film');
  const filmStatus = document.querySelector('.film-status');
  const viewer = document.querySelector('.image-viewer');
  const cards = [...document.querySelectorAll('.gallery-item')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const sceneButtons = [...document.querySelectorAll('[data-scene]')];
  const image = document.querySelector('#viewer-image');
  const viewerStatus = document.querySelector('.viewer-status');
  const chapterLink = document.querySelector('.scene-gallery');
  let activeFilter = 'all';
  let viewerIndex = 0;
  let visible = cards.map((_, i) => i);
  let trigger;

  function filter(platform) {
    activeFilter = platform;
    visible = [];
    cards.forEach((card, index) => {
      const show = platform === 'all' || card.dataset.platform === platform;
      card.hidden = !show;
      if (show) visible.push(index);
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === platform)));
    document.querySelector('#gallery-count').textContent = `${visible.length} image${visible.length === 1 ? '' : 's'}`;
    window.ScrollCraft?.instances.forEach(instance => instance.layout());
  }

  function showImage(index) {
    viewerIndex = index;
    const card = cards[index];
    const source = card.querySelector('img');
    viewerStatus.textContent = 'Loading image…';
    viewerStatus.hidden = false;
    image.hidden = true;
    image.alt = source.alt;
    image.onload = () => { image.hidden = false; viewerStatus.hidden = true; };
    image.onerror = () => {
      viewerStatus.textContent = 'This image could not load. Use Open original to try again.';
      image.hidden = true;
    };
    image.src = card.querySelector('a').href;
    document.querySelector('#viewer-title').textContent = source.alt;
    document.querySelector('#viewer-original').href = image.src;
    const position = visible.indexOf(index);
    document.querySelector('#viewer-prev').disabled = position <= 0;
    document.querySelector('#viewer-next').disabled = position >= visible.length - 1;
  }

  if (typeof viewer.showModal === 'function') {
    cards.forEach((card, index) => card.querySelector('a').addEventListener('click', event => {
      event.preventDefault();
      trigger = event.currentTarget;
      showImage(index);
      viewer.showModal();
    }));
    document.querySelector('#viewer-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('close', () => trigger?.focus({preventScroll:true}));
    viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    function step(delta) {
      const next = visible[visible.indexOf(viewerIndex) + delta];
      if (next !== undefined) showImage(next);
    }
    document.querySelector('#viewer-prev').addEventListener('click', () => step(-1));
    document.querySelector('#viewer-next').addEventListener('click', () => step(1));
    viewer.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    });
  }
  filters.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter)));
  document.querySelector('.gallery-toolbar').hidden = false;
  document.querySelector('.film-scenes').hidden = false;

  sceneButtons.forEach(button => button.addEventListener('click', async () => {
    const platform = button.dataset.scene;
    const time = Number(button.dataset.time);
    filter(platform);
    sceneButtons.forEach(scene => scene.setAttribute('aria-pressed', String(scene === button)));
    chapterLink.textContent = `Explore ${platform === 'tv' ? 'Apple TV' : button.firstChild.textContent.trim()} screens ↗`;
    filmStatus.textContent = '';
    try {
      // Playback starts inside the click gesture; seek after the first frame is ready.
      await video.play();
      video.currentTime = time;
    } catch {
      filmStatus.textContent = 'Use the video’s play control to start this scene.';
    }
  }));
  video.addEventListener('error', () => {
    filmStatus.textContent = 'The film could not load. Open the video file below to try again.';
    const link = document.createElement('a');
    link.href = 'assets/media/cairn-film.mp4'; link.textContent = 'Open the film';
    filmStatus.append(' ', link);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });

  if (window.matchMedia('(max-width: 39.999rem)').matches) {
    document.querySelectorAll('[data-sc-parallax], [data-sc-reveal]').forEach(element => {
      element.removeAttribute('data-sc-parallax'); element.removeAttribute('data-sc-reveal');
    });
  }
  window.ScrollCraft?.mount(document.querySelector('[data-sc-root]'));
})();
