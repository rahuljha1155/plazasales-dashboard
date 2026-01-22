# Caching Implementation

This document describes the caching system implemented for the analytics dashboard.

## Overview

The caching system uses an in-memory cache with TTL (Time To Live) support to reduce unnecessary API calls and improve performance.

## Features

- **In-memory caching**: Fast access to cached data
- **TTL support**: Automatic expiration of stale data
- **Cache keys**: Organized with namespaces (e.g., `analytics:`, `dashboard:`)
- **Helper functions**: Easy-to-use utilities for fetching with cache
- **Cache management**: Hooks and components for monitoring and clearing cache

## Usage

### Basic Usage with `fetchWithCache`

```typescript
import { fetchWithCache } from "@/lib/cache";
import { api } from "@/services/api";

// Fetch data with 5-minute cache
const data = await fetchWithCache(
  "analytics:brand:overview",
  async () => {
    const res = await api.get("/analytics/brand/overview");
    return res.data.data;
  },
  5 * 60 * 1000 // 5 minutes TTL
);
```

### Using the Cache Manager Directly

```typescript
import { cache } from "@/lib/cache";

// Set data
cache.set("my-key", { foo: "bar" }, 60000); // 1 minute TTL

// Get data
const data = cache.get("my-key");

// Clear specific key
cache.clear("my-key");

// Clear all cache
cache.clearAll();

// Check if key exists
const exists = cache.has("my-key");
```

### Using the `useCache` Hook

```typescript
import { useCache } from "@/hooks/useCache";

function MyComponent() {
  const { clearCache, clearAnalyticsCache, getCacheInfo } = useCache();

  const handleClear = () => {
    clearAnalyticsCache(); // Clear all analytics cache
  };

  const info = getCacheInfo();
  console.log(`Total cached items: ${info.totalKeys}`);
}
```

## Cache Keys Convention

Use namespaced keys for better organization:

- `analytics:brand:overview` - Brand overview data
- `analytics:brand:top-brands` - Top brands list
- `analytics:brand:{id}:performance` - Specific brand performance
- `analytics:category:top-categories` - Top categories list
- `analytics:category:{id}:performance` - Specific category performance
- `analytics:seo:overview` - SEO overview data
- `dashboard:all-stats` - Dashboard statistics
- `analytics:user:geo` - User geo data
- `analytics:user:geo:countries` - User countries data

## Default TTL Values

- **Analytics data**: 5 minutes (300,000 ms)
- **Dashboard stats**: 3 minutes (180,000 ms)
- **Performance data**: 5 minutes (300,000 ms)

## Cache Status Component

Use the `CacheStatus` component to monitor and manage cache:

```typescript
import CacheStatus from "@/components/CacheStatus";

function AdminPanel() {
  return (
    <div>
      <CacheStatus />
    </div>
  );
}
```

## Benefits

1. **Reduced API calls**: Cached data is served instantly without hitting the API
2. **Better performance**: Faster page loads and tab switches
3. **Lower server load**: Fewer requests to the backend
4. **Improved UX**: Instant data display when switching between tabs

## Cache Invalidation

Cache is automatically invalidated when:
- TTL expires
- User manually clears cache using CacheStatus component
- Application is refreshed (in-memory cache is cleared)

To manually invalidate cache in code:

```typescript
import { cache } from "@/lib/cache";

// Clear specific cache
cache.clear("analytics:brand:overview");

// Clear all cache
cache.clearAll();
```

## Implementation Details

### Components Updated

- `BrandAnalytics.tsx` - Brand overview and top brands
- `CategoryAnalytics.tsx` - Category analytics
- `SEOAnalytics.tsx` - SEO metrics
- `AllBrandsPerformance.tsx` - All brands performance
- `BrandPerformance.tsx` - Individual brand performance
- `CategoryPerformance.tsx` - Individual category performance
- `DashboardPage.tsx` - Dashboard statistics

### Files Created

- `src/lib/cache.ts` - Core cache manager and utilities
- `src/hooks/useCache.ts` - React hook for cache management
- `src/components/CacheStatus.tsx` - UI component for cache monitoring

## Future Enhancements

- Persistent cache using localStorage or IndexedDB
- Cache size limits and LRU eviction
- Cache warming strategies
- Per-user cache isolation
- Cache versioning for API changes
