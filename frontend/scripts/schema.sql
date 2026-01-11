-- OK to Eat - D1 Database Schema
-- Food Hygiene Ratings for UK Businesses

-- Main businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fhrs_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  address_line3 TEXT,
  address_line4 TEXT,
  postcode TEXT,
  latitude REAL,
  longitude REAL,
  rating INTEGER,  -- 0-5, NULL for awaiting/exempt
  rating_key TEXT, -- Original rating text (e.g., "5", "AwaitingInspection", "Exempt")
  rating_date TEXT,
  business_type TEXT,
  business_type_slug TEXT,
  local_authority TEXT,
  town TEXT,
  town_slug TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_fhrs_id ON businesses(fhrs_id);
CREATE INDEX IF NOT EXISTS idx_businesses_town_slug ON businesses(town_slug);
CREATE INDEX IF NOT EXISTS idx_businesses_type_slug ON businesses(business_type_slug);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating);
CREATE INDEX IF NOT EXISTS idx_businesses_town_type ON businesses(town_slug, business_type_slug);
CREATE INDEX IF NOT EXISTS idx_businesses_town_rating ON businesses(town_slug, rating DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_postcode ON businesses(postcode);

-- Locations lookup table (aggregated from businesses)
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  business_count INTEGER DEFAULT 0,
  avg_rating REAL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_business_count ON locations(business_count DESC);

-- Business types lookup table
CREATE TABLE IF NOT EXISTS business_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  business_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_business_types_slug ON business_types(slug);

-- Import metadata (track last import)
CREATE TABLE IF NOT EXISTS import_metadata (
  id INTEGER PRIMARY KEY,
  last_import_at TEXT,
  records_imported INTEGER,
  source_url TEXT
);
