// Fixed, public route labels only. Never derive analytics labels from arbitrary URLs.
const serviceRoutes = new Map([
  ['/services/', { target: 'services', hasEstimateForm: false }],
  ['/services/concrete/', { target: 'service_concrete', hasEstimateForm: true }],
  ['/services/masonry/', { target: 'service_masonry', hasEstimateForm: true }],
  ['/services/general-engineering/', { target: 'service_general_engineering', hasEstimateForm: true }]
]);

const normalizedPath = (pathname: string) => pathname.endsWith('/') ? pathname : pathname + '/';

export function serviceNavigationTarget(pathname: string) {
  return serviceRoutes.get(normalizedPath(pathname))?.target;
}

export function estimateHref(pathname: string) {
  const hasEstimateForm = pathname === '/' || serviceRoutes.get(normalizedPath(pathname))?.hasEstimateForm;
  // A local anchor preserves the selected service, an unfinished form and campaign parameters.
  return hasEstimateForm ? '#quote-builder' : '/#quote-builder';
}
