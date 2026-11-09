import { serviceAreas } from '../data/service-areas.ts';
export const siteUrl = 'https://ruizfamilyhardscapes.biz';
export const organizationId = `${siteUrl}/#organization`;
export const organizationSchema = {
  '@type': 'Organization', '@id': organizationId,
  name: 'Ruiz Family Enterprises Inc', url: `${siteUrl}/`,
  telephone: '+15592441922', email: 'ruizfamilyent@gmail.com',
  areaServed: serviceAreas.map(area => ({ '@type': 'City', name: `${area.name}, California` })),
  sameAs: ['https://www.instagram.com/ruiz_family_ent/']
};
export function canonicalPath(pathname: string) {
  return pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`;
}
export function serializeSchema(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
