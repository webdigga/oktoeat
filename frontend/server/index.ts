import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apply, serve } from '@photonjs/hono';
import type { Env } from '../functions/_shared/types';
import { runScheduledImport } from '../functions/_shared/import';
import {
  searchBusinesses,
  searchLocations,
  getBusinessBySlug,
  getLocationBySlug,
  getBusinessesByLocation,
  getBestBusinesses,
  getWorstBusinesses,
  getBusinessTypesInLocation,
  getTopLocations,
  getAllLocations,
  getAllBusinessTypes,
  getStats,
  getBusinessCount,
  getBusinessesForSitemap,
} from '../functions/_shared/db';

// Cache TTLs
const STATIC_CACHE_TTL = 60 * 60; // 1 hour for DB data
const SEARCH_CACHE_TTL = 5 * 60; // 5 minutes for search
const SITEMAP_CACHE_TTL = 24 * 60 * 60; // 24 hours for sitemaps

const DOMAIN = 'https://oktoeat.co.uk';
const SITEMAP_PAGE_SIZE = 50000;

function startServer() {
  const app = new Hono<{ Bindings: Env }>();

  // Global error handler
  app.onError((err, c) => {
    console.error('[ERROR]', {
      timestamp: new Date().toISOString(),
      method: c.req.method,
      url: c.req.url,
      error: err.message,
      stack: err.stack,
    });

    return c.json({ error: 'Internal server error' }, 500);
  });

  // Request logging middleware
  app.use('*', async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    const status = c.res.status;

    if (status >= 400 || duration > 1000) {
      console.log('[REQUEST]', {
        timestamp: new Date().toISOString(),
        method: c.req.method,
        url: c.req.url,
        status,
        duration: `${duration}ms`,
      });
    }
  });

  // CORS for API routes
  app.use('/api/*', cors());

  // Health check
  app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Search endpoint (businesses + locations)
  app.get('/api/search', async (c) => {
    const query = c.req.query('q')?.trim() || '';
    const limit = Math.min(parseInt(c.req.query('limit') || '10', 10), 20);

    if (!query || query.length < 2) {
      return c.json({ error: 'Query must be at least 2 characters' }, 400);
    }

    const [businesses, locations] = await Promise.all([
      searchBusinesses(c.env.DB, query, limit),
      searchLocations(c.env.DB, query, 5),
    ]);

    const results = [
      ...locations.map(loc => ({
        type: 'location' as const,
        slug: loc.slug,
        name: loc.name,
        subtitle: `${loc.businessCount.toLocaleString()} businesses`,
      })),
      ...businesses.map(biz => ({
        type: 'business' as const,
        slug: biz.slug,
        name: biz.name,
        subtitle: biz.town || biz.localAuthority || '',
        townSlug: biz.townSlug,
      })),
    ];

    return c.json({ results, total: results.length }, 200, {
      'Cache-Control': `public, max-age=${SEARCH_CACHE_TTL}, s-maxage=${SEARCH_CACHE_TTL}`,
    });
  });

  // Get business by slug
  app.get('/api/business/:slug', async (c) => {
    const slug = c.req.param('slug');
    const business = await getBusinessBySlug(c.env.DB, slug);

    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    return c.json(business, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get location by slug
  app.get('/api/area/:slug', async (c) => {
    const slug = c.req.param('slug');
    const location = await getLocationBySlug(c.env.DB, slug);

    if (!location) {
      return c.json({ error: 'Location not found' }, 404);
    }

    return c.json(location, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get businesses in a location
  app.get('/api/area/:slug/businesses', async (c) => {
    const slug = c.req.param('slug');
    const page = parseInt(c.req.query('page') || '1', 10);
    const type = c.req.query('type');

    const result = await getBusinessesByLocation(c.env.DB, slug, page, 50, type || undefined);

    return c.json(result, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get best businesses in a location
  app.get('/api/area/:slug/best', async (c) => {
    const slug = c.req.param('slug');
    const businesses = await getBestBusinesses(c.env.DB, slug, 100);

    return c.json({ businesses }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get worst businesses in a location
  app.get('/api/area/:slug/worst', async (c) => {
    const slug = c.req.param('slug');
    const businesses = await getWorstBusinesses(c.env.DB, slug, 100);

    return c.json({ businesses }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get business types in a location
  app.get('/api/area/:slug/types', async (c) => {
    const slug = c.req.param('slug');
    const types = await getBusinessTypesInLocation(c.env.DB, slug);

    return c.json({ types }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get all locations (for sitemap)
  app.get('/api/areas', async (c) => {
    const locations = await getAllLocations(c.env.DB);
    return c.json({ locations }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get top locations (for homepage)
  app.get('/api/areas/top', async (c) => {
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const locations = await getTopLocations(c.env.DB, limit);
    return c.json({ locations }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get all business types
  app.get('/api/types', async (c) => {
    const types = await getAllBusinessTypes(c.env.DB);
    return c.json({ types }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get stats for homepage
  app.get('/api/stats', async (c) => {
    const stats = await getStats(c.env.DB);
    return c.json(stats, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // === SITEMAPS ===

  // Index sitemap
  app.get('/sitemap.xml', async (c) => {
    const businessCount = await getBusinessCount(c.env.DB);
    const businessSitemapCount = Math.ceil(businessCount / SITEMAP_PAGE_SIZE);

    const sitemaps = [
      `${DOMAIN}/sitemap-static.xml`,
      `${DOMAIN}/sitemap-locations.xml`,
    ];

    for (let i = 1; i <= businessSitemapCount; i++) {
      sitemaps.push(`${DOMAIN}/sitemap-businesses-${i}.xml`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap><loc>${url}</loc></sitemap>`).join('\n')}
</sitemapindex>`;

    return c.text(xml, 200, {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, max-age=${SITEMAP_CACHE_TTL}, s-maxage=${SITEMAP_CACHE_TTL}`,
    });
  });

  // Static pages sitemap
  app.get('/sitemap-static.xml', (c) => {
    const pages = [
      { loc: DOMAIN, priority: '1.0', changefreq: 'daily' },
      { loc: `${DOMAIN}/about`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${DOMAIN}/privacy`, priority: '0.3', changefreq: 'monthly' },
      { loc: `${DOMAIN}/terms`, priority: '0.3', changefreq: 'monthly' },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return c.text(xml, 200, {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, max-age=${SITEMAP_CACHE_TTL}, s-maxage=${SITEMAP_CACHE_TTL}`,
    });
  });

  // Locations sitemap
  app.get('/sitemap-locations.xml', async (c) => {
    const locations = await getAllLocations(c.env.DB);

    const urls: string[] = [];

    for (const loc of locations) {
      // Main location page
      urls.push(`  <url>
    <loc>${DOMAIN}/area/${loc.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

      // Best page
      urls.push(`  <url>
    <loc>${DOMAIN}/area/${loc.slug}/best</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);

      // Worst page
      urls.push(`  <url>
    <loc>${DOMAIN}/area/${loc.slug}/worst</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return c.text(xml, 200, {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, max-age=${SITEMAP_CACHE_TTL}, s-maxage=${SITEMAP_CACHE_TTL}`,
    });
  });

  // Business sitemaps (paginated)
  app.get('/sitemap-businesses-:page.xml', async (c) => {
    const page = parseInt(c.req.param('page'), 10);

    if (isNaN(page) || page < 1) {
      return c.text('Invalid page number', 400);
    }

    const businesses = await getBusinessesForSitemap(c.env.DB, page, SITEMAP_PAGE_SIZE);

    if (businesses.length === 0) {
      return c.text('Sitemap not found', 404);
    }

    const urls = businesses.map(biz => `  <url>
    <loc>${DOMAIN}/business/${biz.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return c.text(xml, 200, {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, max-age=${SITEMAP_CACHE_TTL}, s-maxage=${SITEMAP_CACHE_TTL}`,
    });
  });

  // Manual import trigger (protected - requires secret header)
  app.post('/api/import', async (c) => {
    const authHeader = c.req.header('X-Import-Secret');
    const expectedSecret = (c.env as any).IMPORT_SECRET;

    // Require secret for manual imports (set in Cloudflare dashboard)
    if (!expectedSecret || authHeader !== expectedSecret) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Manual import triggered...');
    const result = await runScheduledImport(c.env.DB);

    return c.json(result, result.success ? 200 : 500);
  });

  // Install Vike middleware (handles all non-API routes)
  apply(app);

  return serve(app);
}

// Scheduled handler for Cloudflare Cron Triggers
export async function scheduled(
  _event: ScheduledEvent,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  console.log('Scheduled import triggered at:', new Date().toISOString());

  const result = await runScheduledImport(env.DB);

  if (result.success) {
    console.log(`Scheduled import completed: ${result.recordsProcessed} records`);
  } else {
    console.error('Scheduled import failed:', result.error);
  }
}

export default startServer();
