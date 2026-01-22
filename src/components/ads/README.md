# Advertisement Management System

A comprehensive ad management system with entity-specific routing for CATEGORY, SUBCATEGORY, BRAND, and PRODUCT entities.

## Features

- ✅ Create, Read, Update, Delete (CRUD) operations for ads
- ✅ Entity-specific ad management (Product, Brand, Category, Subcategory)
- ✅ Soft delete with recovery option (Sudo Admin only)
- ✅ Bulk operations (delete, recover, destroy)
- ✅ Image upload with preview
- ✅ Active/Inactive status toggle
- ✅ Date range scheduling
- ✅ Sort order management
- ✅ Impressions and clicks tracking

## Routes

### Main Ad Routes
- `/dashboard/ads` - List all advertisements
- `/dashboard/ads/create` - Create new advertisement
- `/dashboard/ads/edit/:id` - Edit advertisement
- `/dashboard/ads/view/:id` - View advertisement details
- `/dashboard/ads/deleted` - View deleted ads (Sudo Admin only)

### Entity-Specific Ad Routes
- `/dashboard/products/:productId/ads` - Product advertisements
- `/dashboard/brands/:brandId/ads` - Brand advertisements
- `/dashboard/categories/:categoryId/ads` - Category advertisements
- `/dashboard/subcategories/:subcategoryId/ads` - Subcategory advertisements

## API Endpoints

### Create Ad
```
POST /ads/create-ad
Content-Type: multipart/form-data

Body:
{
  title: string
  description: string
  targetUrl: string
  isActive: boolean
  sortOrder: number
  startAt: string (ISO datetime)
  endAt: string (ISO datetime)
  bannerUrls: File[] (images)
  
  // Entity IDs (send only one)
  productId?: string
  brandId?: string
  categoryId?: string
  subcategoryId?: string
}
```

### Get Ads by Entity
```
GET /ads/context-ads?productId=xxx
GET /ads/context-ads?brandId=xxx
GET /ads/context-ads?categoryId=xxx
GET /ads/context-ads?subcategoryId=xxx

Response:
{
  status: 200,
  data: IAd[],
  message: "FOUND"
}
```

### Get Ad by ID
```
GET /ads/get-ad/:id

Response:
{
  status: 200,
  data: {
    id: string
    title: string
    description: string
    bannerUrls: string[]
    targetUrl: string
    isActive: boolean
    startAt: string
    endAt: string
    sortOrder: number
    impressions: string
    clicks: string
    brand?: { id, name, slug, logoUrl }
    category?: { id, name, slug }
    subcategory?: { id, name, slug }
    product?: { id, name, slug }
  },
  message: "FOUND"
}
```

### Update Ad
```
PUT /ads/update-ad/:id
Content-Type: multipart/form-data

Body: Same as create
```

### Delete Ad (Soft Delete)
```
DELETE /ads/delete-ad/:id1,:id2,:id3

Response:
{
  status: 200,
  message: "Ad(s) deleted successfully"
}
```

### Get Deleted Ads (Sudo Admin)
```
GET /ads/deleted-ads?page=1&limit=10

Response:
{
  status: 200,
  data: {
    ads: IAd[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  },
  message: "FOUND"
}
```

### Recover Ads (Sudo Admin)
```
PUT /ads/recover-ads
Content-Type: application/json

Body:
{
  ids: ["id1", "id2", "id3"]
}
```

### Destroy Ads Permanently (Sudo Admin)
```
DELETE /ads/destroy-ad/:id1,:id2,:id3
```

## Components

### AdsList
Main listing page showing all advertisements with pagination, search, and bulk actions.

### AdsCreateModal
Form for creating new advertisements with image upload and entity selection.

### AdsEditModal
Form for editing existing advertisements with support for updating images.

### AdsViewPage
Detailed view of a single advertisement with all information and metrics.

### DeletedAdsList
Sudo Admin page for managing deleted ads (recover or permanently delete).

### EntityAdsList
Reusable component for displaying ads filtered by entity (Product, Brand, Category, Subcategory).

### Entity-Specific Pages
- ProductAdsPage
- BrandAdsPage
- CategoryAdsPage
- SubcategoryAdsPage

## Usage Examples

### Create Ad for a Product
```typescript
// Navigate to create page with productId
navigate(`/dashboard/ads/create?productId=${productId}`);

// Or from entity-specific page
navigate(`/dashboard/products/${productId}/ads`);
// Then click "Create Ad" button
```

### View Ads for a Brand
```typescript
navigate(`/dashboard/brands/${brandId}/ads`);
```

### Edit an Ad
```typescript
navigate(`/dashboard/ads/edit/${adId}`);
```

### View Ad Details
```typescript
navigate(`/dashboard/ads/view/${adId}`);
```

## Permissions

- **All Users**: Can view, create, edit, and soft delete ads
- **Sudo Admin Only**: Can view deleted ads, recover ads, and permanently delete ads

## Data Flow

1. **Create**: Form → FormData → API → Success → Redirect to list
2. **Edit**: Load ad → Populate form → Update → API → Success → Redirect
3. **Delete**: Select ads → Confirm → Soft delete → Refresh list
4. **Recover**: (Sudo Admin) Select deleted ads → Recover → Move to active list
5. **Destroy**: (Sudo Admin) Select deleted ads → Permanently delete → Remove from system

## Styling

All components use:
- Shadcn UI components (Card, Table, Button, etc.)
- Tailwind CSS for styling
- Consistent rounded-xs border radius
- Responsive design with grid layouts
- Loading skeletons for better UX

## Best Practices

1. Always validate entity IDs before creating ads
2. Use FormData for file uploads
3. Handle loading and error states
4. Invalidate queries after mutations
5. Show confirmation dialogs for destructive actions
6. Use toast notifications for user feedback
