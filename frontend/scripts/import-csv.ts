/**
 * FSA Food Hygiene Rating Data Import Script
 *
 * Downloads the bulk CSV from FSA and imports into D1 database.
 * Run with: npx tsx scripts/import-csv.ts
 *
 * Prerequisites:
 * 1. Create D1 database: wrangler d1 create oktoeat-db
 * 2. Update wrangler.jsonc with the database_id
 * 3. Run schema: npm run db:init
 * 4. Run this script
 */

import { execSync } from 'child_process';
import { createReadStream, createWriteStream, existsSync, unlinkSync } from 'fs';
import { pipeline } from 'stream/promises';
import { createInterface } from 'readline';

const CSV_URL = 'https://safhrsprodstorage.blob.core.windows.net/opendatafileblobstorage/FHRS_All_en-GB.csv';
const CSV_FILE = '/tmp/fhrs_data.csv';
const BATCH_SIZE = 500;

interface FHRSRecord {
  FHRSID: string;
  BusinessName: string;
  BusinessType: string;
  AddressLine1: string;
  AddressLine2: string;
  AddressLine3: string;
  AddressLine4: string;
  PostCode: string;
  RatingValue: string;
  RatingKey: string;
  RatingDate: string;
  LocalAuthorityName: string;
  Longitude: string;
  Latitude: string;
}

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
    'yorkshire', 'east sussex', 'west sussex', 'north yorkshire',
    'south yorkshire', 'west yorkshire', 'east yorkshire',
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
  // Try AddressLine4 first (usually the town for addresses with 4 lines)
  if (line4 && line4.trim().length > 1) {
    const town = line4.trim();
    if (!looksLikePostcode(town) && !looksLikeCounty(town)) {
      return town;
    }
  }

  // Try AddressLine3
  if (line3 && line3.trim().length > 1) {
    const town = line3.trim();
    if (!looksLikePostcode(town) && !looksLikeCounty(town)) {
      return town;
    }
  }

  // Try AddressLine2 as fallback
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
    return null; // Awaiting, Exempt, Pass, etc.
  }
  return num;
}

/**
 * Download the CSV file
 */
async function downloadCSV(): Promise<void> {
  console.log('Downloading CSV from FSA...');
  console.log(`URL: ${CSV_URL}`);

  const response = await fetch(CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.statusText}`);
  }

  const fileStream = createWriteStream(CSV_FILE);
  // @ts-ignore - Node.js fetch body is a ReadableStream
  await pipeline(response.body as any, fileStream);

  console.log('Download complete!');
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
 * Process and import the CSV
 */
async function importCSV(useRemote: boolean): Promise<void> {
  console.log(`Importing CSV to D1 (${useRemote ? 'remote' : 'local'})...`);

  const fileStream = createReadStream(CSV_FILE, { encoding: 'utf-8' });
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers: string[] = [];
  let batch: string[] = [];
  let totalRecords = 0;
  let lineNum = 0;
  const locationCounts = new Map<string, { name: string; count: number; totalRating: number; ratedCount: number }>();
  const typeCounts = new Map<string, { name: string; count: number }>();

  for await (const line of rl) {
    lineNum++;

    // Skip empty lines
    if (!line.trim()) continue;

    // First line is headers
    if (lineNum === 1) {
      headers = parseCSVLine(line);
      console.log(`Found ${headers.length} columns`);
      continue;
    }

    const values = parseCSVLine(line);
    const record: Record<string, string> = {};

    headers.forEach((header, i) => {
      record[header] = values[i] || '';
    });

    // Extract fields
    const fhrsId = record['FHRSID'] || '';
    const businessName = record['BusinessName'] || '';
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

    // Skip records without essential data
    if (!fhrsId || !businessName) {
      continue;
    }

    // Extract town
    const town = extractTown(addressLine1, addressLine2, addressLine3, addressLine4);
    const townSlug = town ? slugify(town) : null;

    // Generate business slug
    const slug = generateBusinessSlug(businessName, town, postcode);

    // Business type
    const businessTypeSlug = businessType ? slugify(businessType) : null;

    // Rating
    const rating = parseRating(ratingValue);

    // Track location stats
    if (townSlug && town) {
      const existing = locationCounts.get(townSlug);
      if (existing) {
        existing.count++;
        if (rating !== null) {
          existing.totalRating += rating;
          existing.ratedCount++;
        }
      } else {
        locationCounts.set(townSlug, {
          name: town,
          count: 1,
          totalRating: rating ?? 0,
          ratedCount: rating !== null ? 1 : 0,
        });
      }
    }

    // Track business type stats
    if (businessTypeSlug && businessType) {
      const existing = typeCounts.get(businessTypeSlug);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(businessTypeSlug, { name: businessType, count: 1 });
      }
    }

    // Build INSERT statement
    const escapeSql = (s: string) => s.replace(/'/g, "''");

    const insertSql = `INSERT OR REPLACE INTO businesses (
      fhrs_id, name, slug, address_line1, address_line2, address_line3, address_line4,
      postcode, latitude, longitude, rating, rating_key, rating_date,
      business_type, business_type_slug, local_authority, town, town_slug, updated_at
    ) VALUES (
      '${escapeSql(fhrsId)}',
      '${escapeSql(businessName)}',
      '${escapeSql(slug)}',
      ${addressLine1 ? `'${escapeSql(addressLine1)}'` : 'NULL'},
      ${addressLine2 ? `'${escapeSql(addressLine2)}'` : 'NULL'},
      ${addressLine3 ? `'${escapeSql(addressLine3)}'` : 'NULL'},
      ${addressLine4 ? `'${escapeSql(addressLine4)}'` : 'NULL'},
      ${postcode ? `'${escapeSql(postcode)}'` : 'NULL'},
      ${latitude ? latitude : 'NULL'},
      ${longitude ? longitude : 'NULL'},
      ${rating !== null ? rating : 'NULL'},
      ${ratingKey ? `'${escapeSql(ratingKey)}'` : 'NULL'},
      ${ratingDate ? `'${escapeSql(ratingDate)}'` : 'NULL'},
      ${businessType ? `'${escapeSql(businessType)}'` : 'NULL'},
      ${businessTypeSlug ? `'${escapeSql(businessTypeSlug)}'` : 'NULL'},
      ${localAuthority ? `'${escapeSql(localAuthority)}'` : 'NULL'},
      ${town ? `'${escapeSql(town)}'` : 'NULL'},
      ${townSlug ? `'${escapeSql(townSlug)}'` : 'NULL'},
      datetime('now')
    );`;

    batch.push(insertSql);
    totalRecords++;

    // Execute batch
    if (batch.length >= BATCH_SIZE) {
      await executeBatch(batch, useRemote);
      console.log(`Processed ${totalRecords} records...`);
      batch = [];
    }
  }

  // Execute remaining batch
  if (batch.length > 0) {
    await executeBatch(batch, useRemote);
  }

  console.log(`\nTotal records imported: ${totalRecords}`);

  // Import locations
  console.log(`\nImporting ${locationCounts.size} locations...`);
  const locationBatch: string[] = [];

  for (const [slug, data] of locationCounts) {
    const avgRating = data.ratedCount > 0 ? data.totalRating / data.ratedCount : null;
    const escapeSql = (s: string) => s.replace(/'/g, "''");

    locationBatch.push(`INSERT OR REPLACE INTO locations (name, slug, business_count, avg_rating, updated_at)
      VALUES ('${escapeSql(data.name)}', '${escapeSql(slug)}', ${data.count}, ${avgRating !== null ? avgRating.toFixed(2) : 'NULL'}, datetime('now'));`);

    if (locationBatch.length >= BATCH_SIZE) {
      await executeBatch(locationBatch, useRemote);
      locationBatch.length = 0;
    }
  }

  if (locationBatch.length > 0) {
    await executeBatch(locationBatch, useRemote);
  }

  // Import business types
  console.log(`\nImporting ${typeCounts.size} business types...`);
  const typeBatch: string[] = [];

  for (const [slug, data] of typeCounts) {
    const escapeSql = (s: string) => s.replace(/'/g, "''");

    typeBatch.push(`INSERT OR REPLACE INTO business_types (name, slug, business_count)
      VALUES ('${escapeSql(data.name)}', '${escapeSql(slug)}', ${data.count});`);

    if (typeBatch.length >= BATCH_SIZE) {
      await executeBatch(typeBatch, useRemote);
      typeBatch.length = 0;
    }
  }

  if (typeBatch.length > 0) {
    await executeBatch(typeBatch, useRemote);
  }

  // Update import metadata
  const metaSql = `INSERT OR REPLACE INTO import_metadata (id, last_import_at, records_imported, source_url)
    VALUES (1, datetime('now'), ${totalRecords}, '${CSV_URL}');`;
  await executeBatch([metaSql], useRemote);

  console.log('\nImport complete!');
}

/**
 * Execute a batch of SQL statements via wrangler
 */
async function executeBatch(statements: string[], useRemote: boolean): Promise<void> {
  const sql = statements.join('\n');
  const tempFile = `/tmp/batch_${Date.now()}.sql`;

  // Write SQL to temp file
  const { writeFileSync } = await import('fs');
  writeFileSync(tempFile, sql);

  // Get the frontend directory (where wrangler is installed)
  const scriptDir = new URL('.', import.meta.url).pathname;
  const frontendDir = scriptDir.replace('/scripts/', '');

  try {
    const remoteFlag = useRemote ? '--remote' : '--local';
    execSync(`npx wrangler d1 execute oktoeat-db ${remoteFlag} --file="${tempFile}"`, {
      cwd: frontendDir,
      stdio: 'pipe',
    });
  } catch (error: any) {
    console.error('Batch execution failed:', error.message);
    // Continue with next batch
  } finally {
    // Clean up temp file
    try {
      unlinkSync(tempFile);
    } catch {}
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const useRemote = args.includes('--remote');
  const skipDownload = args.includes('--skip-download');

  console.log('='.repeat(60));
  console.log('FSA Food Hygiene Rating Data Import');
  console.log('='.repeat(60));
  console.log(`Target: ${useRemote ? 'REMOTE' : 'LOCAL'} D1 database`);
  console.log('');

  if (!skipDownload) {
    await downloadCSV();
  } else {
    console.log('Skipping download, using existing CSV...');
    if (!existsSync(CSV_FILE)) {
      throw new Error(`CSV file not found: ${CSV_FILE}`);
    }
  }

  await importCSV(useRemote);

  // Clean up
  if (existsSync(CSV_FILE)) {
    unlinkSync(CSV_FILE);
  }
}

main().catch((error) => {
  console.error('Import failed:', error);
  process.exit(1);
});
