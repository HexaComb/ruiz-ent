// Only fixed labels leave the page. Never send form values, link URLs or text.
type EventName = 'navigation_click' | 'cta_click' | 'phone_click' | 'email_click' | 'generate_lead';
const targets = new Set(['hero', 'our-services', 'engineering-public-works', 'our-work', 'our-story', 'our-process', 'reviews', 'faq', 'quote-builder']);
export function trackEvent(name: EventName, target: string, area: string) {
  const analytics = window as Window & { gtag?: (...args: unknown[]) => void };
  try {
    // Inherit the sanitized campaign page_location from the shared GA4 config.
    analytics.gtag?.('event', name, { target, area, page_referrer: '', page_title: 'Ruiz Family Enterprises' });
  } catch { /* Analytics must never interrupt navigation or a successful inquiry. */ }
}
export function registerClicks() {
  document.addEventListener('click', event => {
    const element = event.target instanceof Element ? event.target.closest('a, button') : null;
    if (!element) return;
    const area = element.closest('.floating-call-button') ? 'floating_call' : element.closest('header') ? 'header' : element.closest('footer') ? 'footer' : element.closest('#quote-builder') ? 'contact' : 'content';
    if (element instanceof HTMLAnchorElement) {
      const href = element.getAttribute('href') || '';
      if (href.startsWith('tel:')) return trackEvent('phone_click', 'business_phone', area);
      if (href.startsWith('mailto:')) return trackEvent('email_click', 'business_email', area);
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      const target = url.hash.slice(1);
      if (targets.has(target)) return trackEvent(target === 'quote-builder' ? 'cta_click' : 'navigation_click', target, area);
      if (url.pathname === '/' && !url.hash) trackEvent('navigation_click', 'home', area);
    } else if (element.id === 'submitBtn') {
      trackEvent('cta_click', 'estimate_submit_button', 'contact');
    } else if (element.getAttribute('aria-controls') === 'mobileDrawer') {
      trackEvent('cta_click', 'mobile_menu', 'header');
    }
  });
}
