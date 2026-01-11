import type { PageContextServer } from 'vike/types';
import type { HomePageData } from '../../functions/_shared/types';
import { getTopLocations, getStats } from '../../functions/_shared/db';

export async function data(pageContext: PageContextServer): Promise<HomePageData> {
  const env = pageContext.env as { DB: D1Database };

  const [topLocations, stats] = await Promise.all([
    getTopLocations(env.DB, 20),
    getStats(env.DB),
  ]);

  return {
    topLocations,
    totalBusinesses: stats.totalBusinesses,
    totalLocations: stats.totalLocations,
  };
}
