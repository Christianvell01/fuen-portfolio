(() => {
  const sourceVideos = window.portfolioVideos || [];
  const order = [6, 10, 1, 7, 11, 0, 8, 12, 2, 9, 13, 3, 14, 4, 5];
  const videos = order.map((index) => sourceVideos[index]).filter(Boolean);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const gallery = document.querySelector('#gallery');
  const empty = document.querySelector('#empty');
  const player = document.querySelector('#player');
  const frame = document.querySelector('#video-frame');
  const revealObserver = reduceMotion
    ? null
    : new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      );

  document.documentElement.classList.add('js-enhanced');

  function buildAmbientUI() {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.append(document.createElement('span'));

    const ambient = document.createElement('div');
    ambient.className = 'ambient-layer';
    ambient.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 5; index += 1) ambient.append(document.createElement('i'));

    const cursor = document.createElement('div');
    cursor.className = 'cursor-ring';
    cursor.setAttribute('aria-hidden', 'true');
    const cursorLabel = document.createElement('span');
    cursorLabel.textContent = 'PLAY';
    cursor.append(cursorLabel);

    document.body.prepend(progress, ambient);
    document.body.append(cursor);
    return { progress: progress.firstElementChild, cursor };
  }

  const ambientUI = buildAmbientUI();

  function registerReveals(scope = document) {
    const selectors = [
      'section > .kicker',
      '.section-heading',
      '.featured-intro > *',
      '.showcase',
      '.services-grid article',
      '.contact-card > *',
      '.video-card',
    ];
    scope.querySelectorAll(selectors.join(',')).forEach((element, index) => {
      if (element.dataset.revealReady) return;
      element.dataset.revealReady = 'true';
      element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
      if (reduceMotion) element.classList.add('is-revealed');
      else revealObserver.observe(element);
    });
  }

  function enableSurfaceInteraction(element, maxX = 3, maxY = 2) {
    if (!finePointer || reduceMotion || element.dataset.surfaceReady) return;
    element.dataset.surfaceReady = 'true';
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * maxX * 2;
      const rotateX = (0.5 - y / rect.height) * maxY * 2;
      element.style.setProperty('--card-x', `${x}px`);
      element.style.setProperty('--card-y', `${y}px`);
      element.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
      element.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
    });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
    });
  }

  function enhanceCards(scope = document) {
    scope.querySelectorAll('.video-card, .services-grid article, .featured-card').forEach((element) => {
      enableSurfaceInteraction(element);
    });
    scope.querySelectorAll('.video-card button, .featured-card').forEach((element) => {
      element.dataset.cursorPlay = 'true';
    });
  }

  function openVideo(video) {
    document.querySelector('#player-title').textContent = video.title;
    frame.src = `https://drive.google.com/file/d/${encodeURIComponent(video.driveId)}/preview`;
    document.querySelector('#drive-link').href = `https://drive.google.com/file/d/${encodeURIComponent(video.driveId)}/view`;
    player.showModal();
  }

  function createVideoCard(video, index) {
    const card = document.createElement('article');
    card.className = 'video-card';
    card.style.setProperty('--card-index', index);

    const button = document.createElement('button');
    button.setAttribute('aria-label', `Play ${video.title}`);
    const image = document.createElement('img');
    image.src = video.thumbnail || `https://drive.google.com/thumbnail?id=${encodeURIComponent(video.driveId)}&sz=w1200`;
    image.alt = video.title;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.hidden = true;
    });

    const overlay = document.createElement('span');
    overlay.className = 'card-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    const play = document.createElement('span');
    play.className = 'play';
    play.textContent = '▷';
    play.setAttribute('aria-hidden', 'true');
    button.append(image, overlay, play);

    if (video.duration) {
      const time = document.createElement('span');
      time.className = 'video-duration';
      time.textContent = video.duration;
      button.append(time);
    }

    button.addEventListener('click', () => openVideo(video));
    const title = document.createElement('h3');
    title.textContent = video.title;
    const label = document.createElement('p');
    label.textContent = video.category;
    card.append(button, title, label);
    return card;
  }

  function renderNow(category) {
    gallery.replaceChildren();
    const selected = videos.filter((video) => category === 'All work' || video.category === category);
    empty.hidden = selected.length > 0;
    document.querySelector('#category-label').textContent = category === 'All work' ? 'THE COLLECTION' : category.toUpperCase();
    document.querySelector('#empty-title').textContent = category === 'All work' ? 'The work belongs here.' : category;
    document.querySelector('#empty-text').textContent =
      category === 'All work'
        ? 'Videos are being added to this portfolio.'
        : 'Videos in this category will appear here once the collection is reviewed.';
    selected.forEach((video, index) => gallery.append(createVideoCard(video, index)));
    enhanceCards(gallery);
    registerReveals(gallery);
  }

  let filterTimer = 0;
  function render(category, animate = false) {
    window.clearTimeout(filterTimer);
    if (!animate || reduceMotion || !gallery.children.length) {
      renderNow(category);
      return;
    }
    gallery.classList.add('is-filtering-out');
    filterTimer = window.setTimeout(() => {
      renderNow(category);
      gallery.classList.remove('is-filtering-out');
      gallery.classList.add('is-filtering-in');
      requestAnimationFrame(() => requestAnimationFrame(() => gallery.classList.remove('is-filtering-in')));
    }, 170);
  }

  document.querySelectorAll('[data-category]').forEach((button) => {
    const count = videos.filter((video) => button.dataset.category === 'All work' || video.category === button.dataset.category).length;
    button.textContent += ` · ${count}`;
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-category]').forEach((other) => {
        const active = button === other;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      render(button.dataset.category, true);
    });
  });

  document.querySelector('#close-player').addEventListener('click', () => player.close());
  player.addEventListener('close', () => {
    frame.src = 'about:blank';
  });
  player.addEventListener('click', (event) => {
    if (event.target !== player) return;
    const rect = player.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) player.close();
  });

  const featuredVideos = [sourceVideos[6], sourceVideos[0], sourceVideos[10]].filter(Boolean);
  let featuredIndex = 0;
  const featuredPicker = document.querySelector('#featured-picker');

  featuredVideos.forEach((video, index) => {
    const button = document.createElement('button');
    button.setAttribute('aria-label', `Feature ${video.title}`);
    const image = document.createElement('img');
    image.src = video.thumbnail;
    image.alt = '';
    button.append(image);
    button.addEventListener('click', () => setFeatured(index));
    featuredPicker.append(button);
  });

  function setFeatured(index) {
    featuredIndex = (index + featuredVideos.length) % featuredVideos.length;
    const video = featuredVideos[featuredIndex];
    const image = document.querySelector('#featured-image');
    image.classList.add('is-changing');
    window.setTimeout(() => {
      image.src = video.thumbnail;
      image.alt = video.title;
      image.classList.remove('is-changing');
    }, reduceMotion ? 0 : 130);
    document.querySelector('#featured-title').textContent = video.title;
    document.querySelector('#featured-category').textContent = video.category;
    document.querySelector('#featured-count').textContent = `0${featuredIndex + 1} / 0${featuredVideos.length}`;
    document.querySelector('#featured-card').setAttribute('aria-label', `Play ${video.title}`);
    [...featuredPicker.children].forEach((button, itemIndex) => button.setAttribute('aria-pressed', String(itemIndex === featuredIndex)));
  }

  document.querySelector('#featured-prev').addEventListener('click', () => setFeatured(featuredIndex - 1));
  document.querySelector('#featured-next').addEventListener('click', () => setFeatured(featuredIndex + 1));
  document.querySelector('#featured-card').addEventListener('click', () => openVideo(featuredVideos[featuredIndex]));

  const aboutDialog = document.querySelector('#about-dialog');
  document.querySelector('#more-about').addEventListener('click', () => aboutDialog.showModal());
  document.querySelector('#close-about').addEventListener('click', () => aboutDialog.close());
  document.querySelector('#about-work').addEventListener('click', () => {
    aboutDialog.close();
    window.location.hash = 'work';
  });

  function setupPageProgress() {
    let scheduled = false;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      ambientUI.progress.style.transform = `scaleX(${ratio})`;
      document.querySelector('header').classList.toggle('is-scrolled', window.scrollY > 18);
      scheduled = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(update);
      },
      { passive: true },
    );
    update();
  }

  function setupActiveNavigation() {
    const sections = [...document.querySelectorAll('main > section[id]')];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        document.querySelectorAll('header nav a').forEach((link) => {
          const active = link.getAttribute('href') === `#${visible.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        document.querySelector('.hire-button').classList.toggle('is-active', visible.target.id === 'contact');
      },
      { rootMargin: '-30% 0px -58% 0px', threshold: [0, 0.1, 0.25] },
    );
    sections.forEach((section) => observer.observe(section));
  }

  function setupMagneticButtons() {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll('.button.primary, .hire-button').forEach((button) => {
      button.classList.add('is-magnetic');
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
        button.style.setProperty('--mag-x', `${x.toFixed(1)}px`);
        button.style.setProperty('--mag-y', `${y.toFixed(1)}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      });
    });
  }

  function setupPointerAtmosphere() {
    const light = document.querySelector('.cursor-light');
    if (!finePointer || reduceMotion || !light) return;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let cursorX = targetX;
    let cursorY = targetY;
    let active = false;

    document.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      active = true;
      light.classList.add('is-visible');
      ambientUI.cursor.classList.add('is-visible');

      const profile = document.querySelector('.profile-portrait');
      if (profile) {
        const rect = profile.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth));
        const y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / window.innerHeight));
        profile.style.setProperty('--portrait-x', `${(x * 7).toFixed(2)}px`);
        profile.style.setProperty('--portrait-y', `${(y * 5).toFixed(2)}px`);
      }
    });

    document.addEventListener('pointerleave', () => {
      active = false;
      light.classList.remove('is-visible');
      ambientUI.cursor.classList.remove('is-visible');
    });

    document.addEventListener('pointerover', (event) => {
      const interactive = event.target.closest('a, button, .video-card, .services-grid article');
      ambientUI.cursor.classList.toggle('is-hovering', Boolean(interactive));
      ambientUI.cursor.classList.toggle('is-playing', Boolean(event.target.closest('[data-cursor-play]')));
    });
    document.addEventListener('pointerout', (event) => {
      if (event.relatedTarget && event.relatedTarget.closest?.('a, button, .video-card, .services-grid article')) return;
      ambientUI.cursor.classList.remove('is-hovering', 'is-playing');
    });

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      cursorX += (targetX - cursorX) * 0.2;
      cursorY += (targetY - cursorY) * 0.2;
      light.style.transform = `translate3d(${currentX - 360}px, ${currentY - 360}px, 0)`;
      ambientUI.cursor.style.transform = `translate3d(${cursorX - 18}px, ${cursorY - 18}px, 0)`;
      if (!active) ambientUI.cursor.classList.remove('is-hovering', 'is-playing');
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  render('All work');
  setFeatured(0);
  registerReveals();
  enhanceCards();
  setupPageProgress();
  setupActiveNavigation();
  setupMagneticButtons();
  setupPointerAtmosphere();
})();
