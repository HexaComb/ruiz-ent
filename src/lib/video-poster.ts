// A real responsive image avoids eager native video-poster requests. Its URLs
// only become discoverable near the viewport, including horizontally clipped slides.
export function initVideoPoster(image: HTMLImageElement) {
  const video = image.parentElement?.querySelector('video');
  if (!video) return () => {};
  let disposed = false;
  let frame: number | undefined;
  let animationFrame: number | undefined;
  const onImageLoad = () => {
    if (disposed || !video.controls || !image.naturalWidth || !image.currentSrc) return;
    // Reuse the responsive candidate already fetched by the image. Native
    // posters paint beneath the browser controls, including before playback
    // and after errors; a positioned overlay would cover those controls.
    video.poster = image.currentSrc;
    image.hidden = true;
  };
  image.addEventListener('load', onImageLoad);
  if (image.complete) onImageLoad();
  const load = () => {
    if (image.hasAttribute('src')) return;
    // Set sizes/srcset before src so the browser selects just one candidate.
    image.srcset = image.dataset.srcset || '';
    image.src = image.dataset.src!;
  };
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      load();
      observer?.disconnect();
    }
  }, { rootMargin: '200px 0px' }) : undefined;
  if (observer) observer.observe(image);
  else { image.loading = 'lazy'; load(); }

  const reveal = () => {
    frame = undefined;
    animationFrame = undefined;
    if (!disposed && video.readyState >= 2) image.hidden = true;
  };
  const onReady = () => {
    if (image.hidden || frame !== undefined || animationFrame !== undefined) return;
    if ('requestVideoFrameCallback' in video) {
      frame = video.requestVideoFrameCallback(reveal);
    } else {
      // loadeddata means a decoded frame exists. Give the fallback browser a
      // paint opportunity before uncovering it, never on the earlier play event.
      animationFrame = requestAnimationFrame(() => { animationFrame = requestAnimationFrame(reveal); });
    }
  };
  const onReset = () => {
    if (frame !== undefined) video.cancelVideoFrameCallback(frame);
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    frame = undefined;
    animationFrame = undefined;
    image.hidden = Boolean(video.controls && video.poster);
    load();
  };
  video.addEventListener('loadeddata', onReady);
  video.addEventListener('playing', onReady);
  video.addEventListener('error', onReset);
  video.addEventListener('emptied', onReset);
  if (video.readyState >= 2) onReady();
  return () => {
    disposed = true;
    observer?.disconnect();
    if (frame !== undefined) video.cancelVideoFrameCallback(frame);
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    image.removeEventListener('load', onImageLoad);
    video.removeEventListener('loadeddata', onReady);
    video.removeEventListener('playing', onReady);
    video.removeEventListener('error', onReset);
    video.removeEventListener('emptied', onReset);
  };
}
