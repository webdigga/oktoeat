// Database row types
export interface BusinessRow {
  id: number;
  fhrs_id: string;
  name: string;
  slug: string;
  address_line1: string | null;
  address_line2: string | null;
  address_line3: string | null;
  address_line4: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  rating_key: string | null;
  rating_date: string | null;
  business_type: string | null;
  business_type_slug: string | null;
  local_authority: string | null;
  town: string | null;
  town_slug: string | null;
  updated_at: string;
}

export interface LocationRow {
  id: number;
  name: string;
  slug: string;
  business_count: number;
  avg_rating: number | null;
  updated_at: string;
}

export interface BusinessTypeRow {
  id: number;
  name: string;
  slug: string;
  business_count: number;
}

// API response types
export interface Business {
  id: number;
  fhrsId: string;
  name: string;
  slug: string;
  address: string;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  ratingKey: string | null;
  ratingDate: string | null;
  businessType: string | null;
  businessTypeSlug: string | null;
  localAuthority: string | null;
  town: string | null;
  townSlug: string | null;
}

export interface Location {
  name: string;
  slug: string;
  businessCount: number;
  avgRating: number | null;
}

export interface BusinessType {
  name: string;
  slug: string;
  businessCount: number;
}

// Search types
export interface SearchResult {
  type: 'business' | 'location';
  slug: string;
  name: string;
  subtitle: string;
  townSlug?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

// Page data types
export interface HomePageData {
  topLocations: Location[];
  totalBusinesses: number;
  totalLocations: number;
}

export interface BusinessPageData {
  business: Business;
  nearbyBusinesses: Business[];
}

export interface LocationPageData {
  location: Location;
  businesses: Business[];
  businessTypes: BusinessType[];
  totalPages: number;
  currentPage: number;
}

export interface BestWorstPageData {
  location: Location;
  businesses: Business[];
  type: 'best' | 'worst';
  totalCount: number;
}

export interface TypePageData {
  location: Location;
  businessType: BusinessType;
  businesses: Business[];
  totalPages: number;
  currentPage: number;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Cloudflare bindings
export interface Env {
  DB: D1Database;
}
