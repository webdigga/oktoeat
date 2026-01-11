import type {
  BusinessRow,
  LocationRow,
  BusinessTypeRow,
  Business,
  Location,
  BusinessType,
  PaginatedResponse
} from './types';

/**
 * Transform database row to API response format
 */
export function transformBusiness(row: BusinessRow): Business {
  const addressParts = [
    row.address_line1,
    row.address_line2,
    row.address_line3,
    row.address_line4,
  ].filter(Boolean);

  return {
    id: row.id,
    fhrsId: row.fhrs_id,
    name: row.name,
    slug: row.slug,
    address: addressParts.join(', '),
    postcode: row.postcode,
    latitude: row.latitude,
    longitude: row.longitude,
    rating: row.rating,
    ratingKey: row.rating_key,
    ratingDate: row.rating_date,
    businessType: row.business_type,
    businessTypeSlug: row.business_type_slug,
    localAuthority: row.local_authority,
    town: row.town,
    townSlug: row.town_slug,
  };
}

export function transformLocation(row: LocationRow): Location {
  return {
    name: row.name,
    slug: row.slug,
    businessCount: row.business_count,
    avgRating: row.avg_rating,
  };
}

export function transformBusinessType(row: BusinessTypeRow): BusinessType {
  return {
    name: row.name,
    slug: row.slug,
    businessCount: row.business_count,
  };
}

/**
 * Get a single business by slug
 */
export async function getBusinessBySlug(db: D1Database, slug: string): Promise<Business | null> {
  const row = await db
    .prepare('SELECT * FROM businesses WHERE slug = ?')
    .bind(slug)
    .first<BusinessRow>();

  return row ? transformBusiness(row) : null;
}

/**
 * Get a location by slug
 */
export async function getLocationBySlug(db: D1Database, slug: string): Promise<Location | null> {
  const row = await db
    .prepare('SELECT * FROM locations WHERE slug = ?')
    .bind(slug)
    .first<LocationRow>();

  return row ? transformLocation(row) : null;
}

/**
 * Get businesses in a location with pagination
 */
export async function getBusinessesByLocation(
  db: D1Database,
  townSlug: string,
  page: number = 1,
  pageSize: number = 50,
  typeSlug?: string
): Promise<PaginatedResponse<Business>> {
  const offset = (page - 1) * pageSize;

  let query = 'SELECT * FROM businesses WHERE town_slug = ?';
  let countQuery = 'SELECT COUNT(*) as count FROM businesses WHERE town_slug = ?';
  const params: (string | number)[] = [townSlug];

  if (typeSlug) {
    query += ' AND business_type_slug = ?';
    countQuery += ' AND business_type_slug = ?';
    params.push(typeSlug);
  }

  query += ' ORDER BY rating DESC NULLS LAST, name ASC LIMIT ? OFFSET ?';

  const [rows, countResult] = await Promise.all([
    db.prepare(query).bind(...params, pageSize, offset).all<BusinessRow>(),
    db.prepare(countQuery).bind(...params).first<{ count: number }>(),
  ]);

  const total = countResult?.count || 0;

  return {
    items: rows.results.map(transformBusiness),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get best-rated businesses in a location
 */
export async function getBestBusinesses(
  db: D1Database,
  townSlug: string,
  limit: number = 50
): Promise<Business[]> {
  const rows = await db
    .prepare(`
      SELECT * FROM businesses
      WHERE town_slug = ? AND rating >= 4
      ORDER BY rating DESC, rating_date DESC
      LIMIT ?
    `)
    .bind(townSlug, limit)
    .all<BusinessRow>();

  return rows.results.map(transformBusiness);
}

/**
 * Get worst-rated businesses in a location
 */
export async function getWorstBusinesses(
  db: D1Database,
  townSlug: string,
  limit: number = 50
): Promise<Business[]> {
  const rows = await db
    .prepare(`
      SELECT * FROM businesses
      WHERE town_slug = ? AND rating IS NOT NULL AND rating <= 2
      ORDER BY rating ASC, rating_date DESC
      LIMIT ?
    `)
    .bind(townSlug, limit)
    .all<BusinessRow>();

  return rows.results.map(transformBusiness);
}

/**
 * Get nearby businesses (same town, different from given business)
 */
export async function getNearbyBusinesses(
  db: D1Database,
  businessId: number,
  townSlug: string,
  limit: number = 6
): Promise<Business[]> {
  const rows = await db
    .prepare(`
      SELECT * FROM businesses
      WHERE town_slug = ? AND id != ?
      ORDER BY rating DESC NULLS LAST
      LIMIT ?
    `)
    .bind(townSlug, businessId, limit)
    .all<BusinessRow>();

  return rows.results.map(transformBusiness);
}

/**
 * Get business types available in a location
 */
export async function getBusinessTypesInLocation(
  db: D1Database,
  townSlug: string
): Promise<BusinessType[]> {
  const rows = await db
    .prepare(`
      SELECT business_type as name, business_type_slug as slug, COUNT(*) as business_count
      FROM businesses
      WHERE town_slug = ? AND business_type IS NOT NULL
      GROUP BY business_type, business_type_slug
      ORDER BY business_count DESC
    `)
    .bind(townSlug)
    .all<BusinessTypeRow>();

  return rows.results.map(transformBusinessType);
}

/**
 * Get top locations by business count
 */
export async function getTopLocations(db: D1Database, limit: number = 20): Promise<Location[]> {
  const rows = await db
    .prepare('SELECT * FROM locations ORDER BY business_count DESC LIMIT ?')
    .bind(limit)
    .all<LocationRow>();

  return rows.results.map(transformLocation);
}

/**
 * Get all locations (for sitemaps)
 */
export async function getAllLocations(db: D1Database): Promise<Location[]> {
  const rows = await db
    .prepare('SELECT * FROM locations ORDER BY name ASC')
    .all<LocationRow>();

  return rows.results.map(transformLocation);
}

/**
 * Get all business types
 */
export async function getAllBusinessTypes(db: D1Database): Promise<BusinessType[]> {
  const rows = await db
    .prepare('SELECT * FROM business_types ORDER BY business_count DESC')
    .all<BusinessTypeRow>();

  return rows.results.map(transformBusinessType);
}

/**
 * Search businesses by name
 */
export async function searchBusinesses(
  db: D1Database,
  query: string,
  limit: number = 10
): Promise<Business[]> {
  const searchTerm = `%${query}%`;

  const rows = await db
    .prepare(`
      SELECT * FROM businesses
      WHERE name LIKE ?
      ORDER BY
        CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
        rating DESC NULLS LAST
      LIMIT ?
    `)
    .bind(searchTerm, `${query}%`, limit)
    .all<BusinessRow>();

  return rows.results.map(transformBusiness);
}

/**
 * Search locations by name
 */
export async function searchLocations(
  db: D1Database,
  query: string,
  limit: number = 5
): Promise<Location[]> {
  const searchTerm = `%${query}%`;

  const rows = await db
    .prepare(`
      SELECT * FROM locations
      WHERE name LIKE ?
      ORDER BY
        CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
        business_count DESC
      LIMIT ?
    `)
    .bind(searchTerm, `${query}%`, limit)
    .all<LocationRow>();

  return rows.results.map(transformLocation);
}

/**
 * Get total counts for homepage stats
 */
export async function getStats(db: D1Database): Promise<{ totalBusinesses: number; totalLocations: number }> {
  const [businessCount, locationCount] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM businesses').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM locations').first<{ count: number }>(),
  ]);

  return {
    totalBusinesses: businessCount?.count || 0,
    totalLocations: locationCount?.count || 0,
  };
}

/**
 * Get business count for sitemaps
 */
export async function getBusinessCount(db: D1Database): Promise<number> {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM businesses')
    .first<{ count: number }>();

  return result?.count || 0;
}

/**
 * Get businesses for sitemap (paginated)
 */
export async function getBusinessesForSitemap(
  db: D1Database,
  page: number,
  pageSize: number = 50000
): Promise<{ slug: string; townSlug: string | null }[]> {
  const offset = (page - 1) * pageSize;

  const rows = await db
    .prepare('SELECT slug, town_slug FROM businesses ORDER BY id LIMIT ? OFFSET ?')
    .bind(pageSize, offset)
    .all<{ slug: string; town_slug: string | null }>();

  return rows.results.map(r => ({ slug: r.slug, townSlug: r.town_slug }));
}
