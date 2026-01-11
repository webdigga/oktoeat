import type { PageContextServer } from 'vike/types';
import type { LocationPageData } from '../../../functions/_shared/types';
import {
  getLocationBySlug,
  getBusinessesByLocation,
  getBusinessTypesInLocation,
} from '../../../functions/_shared/db';
import { render } from 'vike/abort';

export async function data(pageContext: PageContextServer): Promise<LocationPageData> {
  const { areaSlug } = pageContext.routeParams as { areaSlug: string };
  const env = pageContext.env as { DB: D1Database };

  // Get page from URL query params
  const url = new URL(pageContext.urlOriginal, 'http://localhost');
  const page = parseInt(url.searchParams.get('page') || '1', 10);

  const location = await getLocationBySlug(env.DB, areaSlug);

  if (!location) {
    throw render(404, 'Location not found');
  }

  const [businessesResult, businessTypes] = await Promise.all([
    getBusinessesByLocation(env.DB, areaSlug, page, 50),
    getBusinessTypesInLocation(env.DB, areaSlug),
  ]);

  return {
    location,
    businesses: businessesResult.items,
    businessTypes,
    totalPages: businessesResult.totalPages,
    currentPage: page,
  };
}
