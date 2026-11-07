type Connection = EventTarget & { saveData?: boolean };

function mediaPreferences() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return {
    reducedMotion,
    connection,
    allowsAutoplay: () => !reducedMotion.matches && !connection?.saveData,
  };
}

function loadSources(video: HTMLVideoElement) {
  const sources = video.querySelectorAll<HTMLSourceElement>('source[data-src]');
  if (!sources.length || sources[0].hasAttribute('src')) return;
  sources.forEach(source => { source.src = source.dataset.src!; });
  video.load();
}

// CSS alone cannot stop a hidden video from downloading. Keep its sources inert
// until both the desktop breakpoint and the visitor's preferences allow it.
export function initHeroVideo(hero: HTMLElement) {
  const video = hero.querySelector<HTMLVideoElement>('.hero-bg-video');
  const image = hero.querySelector<HTMLImageElement>('.hero-mobile-image');
  if (!video || !image) return () => {};
  const desktop = window.matchMedia('(min-width: 641px)');
  const preferences = mediaPreferences();
  let inView = true;

  const sync = () => {
    if (!desktop.matches || !preferences.allowsAutoplay()) {
      video.pause();
      if (video.querySelector('source[src]')) {
        video.querySelectorAll('source').forEach(source => source.removeAttribute('src'));
        video.load(); // Cancel a previous desktop download after resizing to mobile.
      }
      return;
    }
    if (!inView || document.hidden || !image.complete) {
      video.pause();
      return;
    }
    loadSources(video);
    void video.play().catch(() => {}); // The image remains visible if autoplay is blocked.
  };
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        sync();
      })
    : undefined;
  observer?.observe(hero);
  desktop.addEventListener('change', sync);
  preferences.reducedMotion.addEventListener('change', sync);
  preferences.connection?.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  image.addEventListener('load', sync);
  image.addEventListener('error', sync);
  sync();
  return () => {
    observer?.disconnect();
    desktop.removeEventListener('change', sync);
    preferences.reducedMotion.removeEventListener('change', sync);
    preferences.connection?.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    image.removeEventListener('load', sync);
    image.removeEventListener('error', sync);
    video.pause();
  };
}

export function initJobsiteVideo(box: HTMLElement) {
  const video = box.querySelector<HTMLVideoElement>('[data-jobsite-video]');
  const toggle = box.querySelector<HTMLButtonElement>('[data-video-toggle]');
  if (!video || !toggle) return () => {};
  const preferences = mediaPreferences();
  const label = video.getAttribute('aria-label') || 'project footage';
  let nearViewport = false;
  let userPaused = false;
  let explicitPlayback = false;
  let pendingPlay = false;
  let playAttempt = 0;

  const updateButton = () => {
    const playing = !video.paused || pendingPlay;
    toggle.querySelector('.icon-play')?.toggleAttribute('hidden', playing);
    toggle.querySelector('.icon-pause')?.toggleAttribute('hidden', !playing);
    toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} video: ${label}`);
  };
  const pause = () => {
    playAttempt++;
    pendingPlay = false;
    video.pause();
    updateButton();
  };
  const play = () => {
    if (!video.paused || pendingPlay) return;
    loadSources(video);
    const attempt = ++playAttempt;
    pendingPlay = true;
    updateButton();
    void video.play().catch(() => {
      // Browser autoplay policies and interrupted play requests are expected.
    }).finally(() => {
      if (attempt !== playAttempt) return;
      pendingPlay = false;
      updateButton();
    });
  };
  const sync = () => {
    const inRange = nearViewport || (!('IntersectionObserver' in window) && explicitPlayback);
    if (inRange && !document.hidden && !userPaused &&
        (explicitPlayback || preferences.allowsAutoplay())) play();
    else pause();
  };
  const onPreferenceChange = () => {
    explicitPlayback = false;
    sync();
  };
  const onToggle = () => {
    if (!video.paused || pendingPlay) {
      userPaused = true;
      explicitPlayback = false;
      pause();
    } else {
      userPaused = false;
      explicitPlayback = true;
      play();
    }
  };
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        nearViewport = entries[0].isIntersecting;
        sync();
      }, { rootMargin: '200px 0px' })
    : undefined; // Without IntersectionObserver, the play button loads the clip.
  observer?.observe(video);
  toggle.addEventListener('click', onToggle);
  video.addEventListener('play', updateButton);
  video.addEventListener('pause', updateButton);
  preferences.reducedMotion.addEventListener('change', onPreferenceChange);
  preferences.connection?.addEventListener('change', onPreferenceChange);
  document.addEventListener('visibilitychange', sync);
  updateButton();
  return () => {
    observer?.disconnect();
    toggle.removeEventListener('click', onToggle);
    video.removeEventListener('play', updateButton);
    video.removeEventListener('pause', updateButton);
    preferences.reducedMotion.removeEventListener('change', onPreferenceChange);
    preferences.connection?.removeEventListener('change', onPreferenceChange);
    document.removeEventListener('visibilitychange', sync);
    pause();
  };
}
