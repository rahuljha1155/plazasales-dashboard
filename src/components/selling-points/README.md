# Selling Points Feature

This module manages brand selling points - key features or benefits that highlight what makes each brand special.

## Files Structure

```
selling-points/
├── BrandSellingPointsPage.tsx    # Main page for managing selling points per brand
├── SellingPointCreatePage.tsx    # Create page (full page, not sheet)
├── SellingPointEditPage.tsx      # Edit page (full page, not sheet)
├── SellingPointList.tsx           # General list view (all selling points)
├── SellingPointForm.tsx           # Reusable form component
├── SellingPointCreateSheet.tsx    # Create modal/sheet (legacy)
├── SellingPointEditSheet.tsx      # Edit modal/sheet (legacy)
├── SellingPointViewModal.tsx      # View details modal
├── index.ts                       # Exports
└── README.md                      # This file
```

## Features

- ✅ Create selling points with icon upload
- ✅ List all selling points with pagination & search
- ✅ Filter by brand
- ✅ View single selling point details
- ✅ Update selling point (including icon replacement)
- ✅ Soft delete (single or bulk)
- ✅ View deleted records
- ✅ Recover deleted records
- ✅ Permanently destroy records
- ✅ Sort order management

## API Endpoints

### Create
- **POST** `/brand-selling-point/create-brand-selling-point`
- Auth required + verified
- Accepts multipart/form-data with icon

### Read
- **GET** `/brand-selling-point/get-all-brand-selling-points`
  - Query params: `page`, `limit`, `search`, `brandId`
- **GET** `/brand-selling-point/get-brand-selling-point/:id`
- **GET** `/brand-selling-point/get-brand-selling-points/brand/:identifier`
  - Fetch by brand UUID or slug

### Update
- **PUT** `/brand-selling-point/update-brand-selling-point/:id`
- Auth required + verified
- Accepts multipart/form-data

### Delete
- **DELETE** `/brand-selling-point/delete-brand-selling-point/:id`
- Auth required + verified
- Supports comma-separated IDs for bulk delete

### Soft Delete Management
- **GET** `/brand-selling-point/deleted-brand-selling-points`
- **PUT** `/brand-selling-point/recover-brand-selling-points`
  - Body: `{ "ids": ["uuid1", "uuid2"] }`
- **DELETE** `/brand-selling-point/destroy-brand-selling-points/:id`
  - Permanently deletes and removes uploaded icons

## Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| brandId | uuid | ✔ | Must point to existing non-deleted brand |
| icon | string/file | ✔ | URL or multipart uploaded image |
| title | string | ✔ | Unique per brand among non-deleted records |
| subtitle | string | ✔ | Supporting text shown under title |
| sortOrder | number | ✖ | Scoped per brand; defaults to next slot |

## Usage

### In Brand List Page
The selling points feature is integrated into the brands table with:
- Quick action button in the table
- Dropdown menu option

### Accessing Selling Points
1. Navigate to `/dashboard/brands`
2. Click "Selling Points" button in Quick Actions column
3. Or select "Manage Selling Points" from the actions dropdown

### Creating a Selling Point
1. Click "Add Selling Point" button
2. Select brand (auto-selected if coming from brand page)
3. Upload icon image
4. Enter title and subtitle
5. Optionally set sort order
6. Submit

### Managing Selling Points
- View: Click eye icon or select from dropdown
- Edit: Click edit icon or select from dropdown
- Delete: Click delete icon (soft delete)
- Recover: Access deleted records page (sudo admin only)

## Integration Points

### Routes
- `/dashboard/brands/:brandId/selling-points` - Brand-specific selling points page
- `/dashboard/brands/:brandId/selling-points/create` - Create new selling point page
- `/dashboard/brands/:brandId/selling-points/edit/:id` - Edit selling point page

### Components Used
- `@/components/ui/button`
- `@/components/ui/input`
- `@/components/ui/table`
- `@/components/ui/sheet`
- `@/components/ui/dialog`
- `@/components/ui/dropdown-menu`
- `@/components/dashboard/Breadcumb`
- `@/components/table-shimmer`

### Hooks
- `useGetSellingPointsByBrand` - Fetch selling points for a brand
- `useCreateSellingPoint` - Create new selling point
- `useUpdateSellingPoint` - Update existing selling point
- `useDeleteSellingPoint` - Soft delete selling point
- `useGetBrands` - Fetch brands for dropdown

## Notes

- Icons are uploaded as multipart/form-data
- Title must be unique per brand
- Sort order is scoped per brand
- Soft delete allows recovery
- Permanent delete removes uploaded files from storage
