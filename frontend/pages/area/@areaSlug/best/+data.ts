import type { PageContextServer } from 'vike/types';
import type { BestWorstPageData } from '../../../../functions/_shared/types';
import { getLocationBySlug, getBestBusinesses } from '../../../../functions/_shared/db';
import { render } from 'vike/abort';

export async function data(pageContext: PageContextServer): Promise<BestWorstPageData> {
  const { areaSlug } = pageContext.routeParams as { areaSlug: string };
  const env = pageContext.env as { DB: D1Database };

  const location = await getLocationBySlug(env.DB, areaSlug);

  if (!location) {
    throw render(404, 'Location not found');
  }

  const businesses = await getBestBusinesses(env.DB, areaSlug, 100);

  return {
    location,
    businesses,
    type: 'best',
    totalCount: businesses.length,
  };
}
