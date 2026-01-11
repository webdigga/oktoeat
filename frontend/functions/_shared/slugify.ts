/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique business slug from name and location
 */
export function generateBusinessSlug(name: string, town: string | null, postcode: string | null): string {
  const parts = [name];

  if (town) {
    parts.push(town);
  }

  // Add postcode prefix for uniqueness (e.g., "M1" from "M1 4BD")
  if (postcode) {
    const postcodePrefix = postcode.split(' ')[0];
    if (postcodePrefix) {
      parts.push(postcodePrefix);
    }
  }

  return slugify(parts.join(' '));
}

/**
 * Extract town/city from FSA address fields
 * The town is typically in AddressLine3 or AddressLine4
 */
export function extractTown(
  addressLine1: string | null,
  addressLine2: string | null,
  addressLine3: string | null,
  addressLine4: string | null,
  postcode: string | null
): string | null {
  // FSA data usually has town in AddressLine3 or AddressLine4
  // AddressLine4 is often the most reliable for town/city

  // Try AddressLine4 first (usually the town for addresses with 4 lines)
  if (addressLine4 && addressLine4.trim().length > 1) {
    const town = addressLine4.trim();
    // Skip if it looks like a postcode or county
    if (!looksLikePostcode(town) && !looksLikeCounty(town)) {
      return town;
    }
  }

  // Try AddressLine3
  if (addressLine3 && addressLine3.trim().length > 1) {
    const town = addressLine3.trim();
    if (!looksLikePostcode(town) && !looksLikeCounty(town)) {
      return town;
    }
  }

  // Try AddressLine2 as fallback
  if (addressLine2 && addressLine2.trim().length > 1) {
    const town = addressLine2.trim();
    if (!looksLikePostcode(town) && !looksLikeCounty(town)) {
      return town;
    }
  }

  return null;
}

/**
 * Check if a string looks like a UK postcode
 */
function looksLikePostcode(text: string): boolean {
  // UK postcode pattern: 1-2 letters, 1-2 numbers, optional space, number, 2 letters
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
 * Normalize business type from FSA data
 */
export function normalizeBusinessType(type: string | null): { name: string; slug: string } | null {
  if (!type || type.trim() === '') {
    return null;
  }

  const name = type.trim();
  const slug = slugify(name);

  return { name, slug };
}
