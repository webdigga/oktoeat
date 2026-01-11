/**
 * CSV Import functions for scheduled worker
 *
 * This module handles the weekly automatic import of FSA data.
 * It's designed to run within Cloudflare Workers limits.
 */

const CSV_URL = 'https://safhrsprodstorage.blob.core.windows.net/opendatafileblobstorage/FHRS_All_en-GB.csv';
const BATCH_SIZE = 100;

/**
 * Convert a string to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a unique business slug
 */
function generateBusinessSlug(name: string, town: string | null, postcode: string | null): string {
  const parts = [name];
  if (town) parts.push(town);
  if (postcode) {
    const postcodePrefix = postcode.split(' ')[0];
    if (postcodePrefix) parts.push(postcodePrefix);
  }
  return slugify(parts.join(' '));
}

/**
 * Check if a string looks like a UK postcode
 */
function looksLikePostcode(text: string): boolean {
  const postcodePattern = /^[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}$/i;
  return postcodePattern.test(text.trim());
}

/**
 * Check if a string looks like a county name
 */
function looksLikeCounty(text: string): boolean {
  const counties = [
    'bedfordshire', 'berkshire', 'buckinghamshire', 'cambridgeshire',
    'cheshire', 'cornwall', 'cumbria', 'derbyshire', 'devon', 'dorset',
    'durham', 'essex', 'gloucestershire', 'hampshire', 'herefordshire',
    'hertfordshire', 'kent', 'lancashire', 'leicestershire', 'lincolnshire',
    'norfolk', 'northamptonshire', 'northumberland', 'nottinghamshire',
    'oxfordshire', 'shropshire', 'somerset', 'staffordshire', 'suffolk',
    'surrey', 'sussex', 'warwickshire', 'wiltshire', 'worcestershire',
    'yorkshire',
  ];
  return counties.includes(text.toLowerCase().trim());
}

/**
 * Extract town/city from FSA address fields
 */
function extractTown(
  line1: string | null,
  line2: string | null,
  line3: string | null,
  line4: string | null
): string | null {
  if (line4 && line4.trim().length > 1) {
    const town = line4.trim();
    if (!looksLikePostcode(town) && !looksLikeCounty(town)) {
      return town;
    }
  }

  if (line3 && line3.trim().length > 1) {
    const town = line3.trim();
    if (!looksLikePostcode(town) && !looksLikeCounty(town)) {
      return town;
    }
  }

  if (line2 && line2.trim().length > 1) {
    const town = line2.trim();
    if (!looksLikePostcode(town) && !looksLikeCounty(town)) {
      return town;
    }
  }

  return null;
}

/**
 * Parse rating value to integer or null
 */
function parseRating(value: string): number | null {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0 || num > 5) {
    return null;
  }
  return num;
}

/**
 * Parse CSV line (handles quoted fields)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Escape SQL string
 */
function escapeSql(s: string): string {
  return s.replace(/'/g, "''");
}

/**
 * Run the scheduled import
 *
 * Note: Due to Workers CPU time limits, this performs a streaming import
 * that processes records in batches. For very large datasets, you may need
 * to use the local import script instead.
 */
export async function runScheduledImport(db: D1Database): Promise<{ success: boolean; recordsProcessed: number; error?: string }> {
  console.log('Starting scheduled import from FSA...');

  try {
    // Download CSV
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n');

    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log(`Found ${headers.length} columns, ${lines.length - 1} data rows`);

    // Track stats
    let recordsProcessed = 0;
    const locationStats = new Map<string, { name: string; count: number; totalRating: number; ratedCount: number }>();
    const typeStats = new Map<string, { name: string; count: number }>();

    // Process in batches
    let batch: D1PreparedStatement[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = parseCSVLine(line);
      const record: Record<string, string> = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });

      // Extract fields
      const fhrsId = record['FHRSID'] || '';
      const businessName = record['BusinessName'] || '';

      if (!fhrsId || !businessName) continue;

      const businessType = record['BusinessType'] || '';
      const addressLine1 = record['AddressLine1'] || '';
      const addressLine2 = record['AddressLine2'] || '';
      const addressLine3 = record['AddressLine3'] || '';
      const addressLine4 = record['AddressLine4'] || '';
      const postcode = record['PostCode'] || '';
      const ratingValue = record['RatingValue'] || '';
      const ratingKey = record['RatingKey'] || '';
      const ratingDate = record['RatingDate'] || '';
      const localAuthority = record['LocalAuthorityName'] || '';
      const longitude = record['Longitude'] || '';
      const latitude = record['Latitude'] || '';

      // Derived fields
      const town = extractTown(addressLine1, addressLine2, addressLine3, addressLine4);
      const townSlug = town ? slugify(town) : null;
      const slug = generateBusinessSlug(businessName, town, postcode);
      const businessTypeSlug = businessType ? slugify(businessType) : null;
      const rating = parseRating(ratingValue);

      // Track location stats
      if (townSlug && town) {
        const existing = locationStats.get(townSlug);
        if (existing) {
          existing.count++;
          if (rating !== null) {
            existing.totalRating += rating;
            existing.ratedCount++;
          }
        } else {
          locationStats.set(townSlug, {
            name: town,
            count: 1,
            totalRating: rating ?? 0,
            ratedCount: rating !== null ? 1 : 0,
          });
        }
      }

      // Track type stats
      if (businessTypeSlug && businessType) {
        const existing = typeStats.get(businessTypeSlug);
        if (existing) {
          existing.count++;
        } else {
          typeStats.set(businessTypeSlug, { name: businessType, count: 1 });
        }
      }

      // Add to batch
      batch.push(
        db.prepare(`
          INSERT OR REPLACE INTO businesses (
            fhrs_id, name, slug, address_line1, address_line2, address_line3, address_line4,
            postcode, latitude, longitude, rating, rating_key, rating_date,
            business_type, business_type_slug, local_authority, town, town_slug, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          fhrsId,
          businessName,
          slug,
          addressLine1 || null,
          addressLine2 || null,
          addressLine3 || null,
          addressLine4 || null,
          postcode || null,
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null,
          rating,
          ratingKey || null,
          ratingDate || null,
          businessType || null,
          businessTypeSlug,
          localAuthority || null,
          town,
          townSlug
        )
      );

      recordsProcessed++;

      // Execute batch
      if (batch.length >= BATCH_SIZE) {
        await db.batch(batch);
        batch = [];
      }
    }

    // Execute remaining businesses
    if (batch.length > 0) {
      await db.batch(batch);
    }

    console.log(`Processed ${recordsProcessed} business records`);

    // Update locations
    console.log(`Updating ${locationStats.size} locations...`);
    const locationBatch: D1PreparedStatement[] = [];

    for (const [slug, data] of locationStats) {
      const avgRating = data.ratedCount > 0 ? data.totalRating / data.ratedCount : null;
      locationBatch.push(
        db.prepare(`
          INSERT OR REPLACE INTO locations (name, slug, business_count, avg_rating, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `).bind(data.name, slug, data.count, avgRating)
      );

      if (locationBatch.length >= BATCH_SIZE) {
        await db.batch(locationBatch);
        locationBatch.length = 0;
      }
    }

    if (locationBatch.length > 0) {
      await db.batch(locationBatch);
    }

    // Update business types
    console.log(`Updating ${typeStats.size} business types...`);
    const typeBatch: D1PreparedStatement[] = [];

    for (const [slug, data] of typeStats) {
      typeBatch.push(
        db.prepare(`
          INSERT OR REPLACE INTO business_types (name, slug, business_count)
          VALUES (?, ?, ?)
        `).bind(data.name, slug, data.count)
      );

      if (typeBatch.length >= BATCH_SIZE) {
        await db.batch(typeBatch);
        typeBatch.length = 0;
      }
    }

    if (typeBatch.length > 0) {
      await db.batch(typeBatch);
    }

    // Update metadata
    await db.prepare(`
      INSERT OR REPLACE INTO import_metadata (id, last_import_at, records_imported, source_url)
      VALUES (1, datetime('now'), ?, ?)
    `).bind(recordsProcessed, CSV_URL).run();

    console.log('Import complete!');

    return { success: true, recordsProcessed };
  } catch (error: any) {
    console.error('Import failed:', error);
    return { success: false, recordsProcessed: 0, error: error.message };
  }
}
