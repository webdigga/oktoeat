import type { PageContextServer } from 'vike/types';
import type { BusinessPageData } from '../../../functions/_shared/types';
import { getBusinessBySlug, getNearbyBusinesses } from '../../../functions/_shared/db';
import { render } from 'vike/abort';

export async function data(pageContext: PageContextServer): Promise<BusinessPageData> {
  const { slug } = pageContext.routeParams as { slug: string };
  const env = pageContext.env as { DB: D1Database };

  const business = await getBusinessBySlug(env.DB, slug);

  if (!business) {
    throw render(404, 'Business not found');
  }

  const nearbyBusinesses = business.townSlug
    ? await getNearbyBusinesses(env.DB, business.id, business.townSlug, 6)
    : [];

  return {
    business,
    nearbyBusinesses,
  };
}
