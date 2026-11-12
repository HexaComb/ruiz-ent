// Only fixed labels leave the page. Never send form values, link URLs or text.
import { serviceNavigationTarget } from './service-navigation.ts';
type EventName = 'navigation_click' | 'cta_click' | 'phone_click' | 'email_click' | 'generate_lead' | 'estimate_form_start' | 'estimate_form_error';
type FormContext = { serviceCity?: string; projectType?: string; errorType?: string };
const approvedCities = new Set(['kingsburg', 'fresno', 'madera', 'visalia', 'fowler', 'hanford']);
const projectCategories = new Map([
  ['Concrete Flatwork & Finishes', 'concrete'],
  ['Block or Retaining Wall', 'block_wall'],
  ['Architectural Stone & Brick Work', 'stone_brick'],
  ['Concrete Pump Service', 'concrete_pumping'],
  ['Drain and Gutter or Concrete Removal', 'drain_removal'],
  ['General Engineering or Public Works', 'general_engineering'],
  ['Other or Custom Project', 'other']
]);
const targets = new Set(['hero', 'our-services', 'engineering-public-works', 'our-work', 'our-story', 'our-process', 'reviews', 'faq', 'quote-builder']);
export function trackEvent(name: EventName, target: string, area: string, form?: FormContext) {
  const analytics = window as Window & { gtag?: (...args: unknown[]) => void };
  // Form context comes only from static city-page markup and fixed radio choices.
  // Never forward the visitor's typed address, name, email, phone or message.
  const safeForm = form && (name === 'generate_lead' || name === 'estimate_form_start' || name === 'estimate_form_error')
    ? {
        service_city: approvedCities.has(form.serviceCity || '') ? form.serviceCity : 'unspecified',
        project_category: projectCategories.get(form.projectType || '') || 'other',
        ...(name === 'estimate_form_error' ? { error_category: form.errorType === 'server_rejected' || form.errorType === 'network_or_parse' ? form.errorType : 'other' } : {})
      }
    : {};
  try {
    // Inherit the sanitized campaign page_location from the shared GA4 config.
    analytics.gtag?.('event', name, { target, area, ...safeForm, page_referrer: '', page_title: 'Ruiz Family Enterprises' });
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
      const serviceTarget = serviceNavigationTarget(url.pathname);
      if (serviceTarget) return trackEvent('navigation_click', serviceTarget, area);
      if (url.pathname === '/' && !url.hash) trackEvent('navigation_click', 'home', area);
    } else if (element.id === 'submitBtn') {
      trackEvent('cta_click', 'estimate_submit_button', 'contact');
    } else if (element.getAttribute('aria-controls') === 'mobileDrawer') {
      trackEvent('cta_click', 'mobile_menu', 'header');
    }
  });
}
