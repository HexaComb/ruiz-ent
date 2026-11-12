// Fixed, public route labels only. Never derive analytics labels from arbitrary URLs.
const serviceRoutes = new Map([
  ['/services/', { target: 'services', hasEstimateForm: false }],
  ['/services/concrete/', { target: 'service_concrete', hasEstimateForm: true }],
  ['/services/masonry/', { target: 'service_masonry', hasEstimateForm: true }],
  ['/services/general-engineering/', { target: 'service_general_engineering', hasEstimateForm: true }]
]);

// These six approved service-area routes render their own estimate form.
// Keep this fixed allowlist aligned with service-areas.ts (covered by tests).
const cityRoutesWithForms = new Set([
  '/service-areas/kingsburg/', '/service-areas/fresno/', '/service-areas/madera/',
  '/service-areas/visalia/', '/service-areas/fowler/', '/service-areas/hanford/'
]);

const normalizedPath = (pathname: string) => pathname.endsWith('/') ? pathname : pathname + '/';

export function serviceNavigationTarget(pathname: string) {
  return serviceRoutes.get(normalizedPath(pathname))?.target;
}

export function estimateHref(pathname: string) {
  const route = normalizedPath(pathname);
  const hasEstimateForm = pathname === '/' || serviceRoutes.get(route)?.hasEstimateForm || cityRoutesWithForms.has(route);
  // A local anchor preserves the selected service/city, an unfinished form and campaign parameters.
  return hasEstimateForm ? '#quote-builder' : '/#quote-builder';
}
