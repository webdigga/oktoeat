import type { PageContextServer } from 'vike/types';
import type { TypePageData, BusinessType } from '../../../../functions/_shared/types';
import {
  getLocationBySlug,
  getBusinessesByLocation,
  getBusinessTypesInLocation,
} from '../../../../functions/_shared/db';
import { render } from 'vike/abort';

export async function data(pageContext: PageContextServer): Promise<TypePageData> {
  const { areaSlug, typeSlug } = pageContext.routeParams as { areaSlug: string; typeSlug: string };
  const env = pageContext.env as { DB: D1Database };

  // Exclude reserved routes
  if (typeSlug === 'best' || typeSlug === 'worst') {
    throw render(404, 'Page not found');
  }

  // Get page from URL query params
  const url = new URL(pageContext.urlOriginal, 'http://localhost');
  const page = parseInt(url.searchParams.get('page') || '1', 10);

  const location = await getLocationBySlug(env.DB, areaSlug);

  if (!location) {
    throw render(404, 'Location not found');
  }

  const [businessesResult, allTypes] = await Promise.all([
    getBusinessesByLocation(env.DB, areaSlug, page, 50, typeSlug),
    getBusinessTypesInLocation(env.DB, areaSlug),
  ]);

  // Find the specific business type
  const businessType = allTypes.find(t => t.slug === typeSlug);

  if (!businessType) {
    throw render(404, 'Business type not found');
  }

  return {
    location,
    businessType,
    businesses: businessesResult.items,
    totalPages: businessesResult.totalPages,
    currentPage: page,
  };
}
