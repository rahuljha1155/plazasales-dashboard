# Brand Routes Documentation

## Overview
The brand management system has been refactored into separate route components for better organization and maintainability.

## Routes

### 1. Brand List
- **Route**: `/dashboard/brands`
- **Component**: `BrandListPage`
- **Purpose**: Display all brands in a table with sorting, filtering, and bulk actions
- **Breadcrumb**: Home > Brands

### 2. Create Brand
- **Route**: `/dashboard/brands/create`
- **Component**: `BrandCreatePage`
- **Purpose**: Create a new brand
- **Breadcrumb**: Home > Brands > Create Brand

### 3. Edit Brand
- **Route**: `/dashboard/brands/edit/:slug`
- **Component**: `BrandEditPage`
- **Purpose**: Edit an existing brand by slug
- **Breadcrumb**: Home > Brands > {Brand Name}

### 4. View Brand
- **Route**: `/dashboard/brands/view/:slug`
- **Component**: `BrandViewPage`
- **Purpose**: View brand details by slug
- **Breadcrumb**: Home > Brands > {Brand Name}

### 5. Deleted Brands
- **Route**: `/dashboard/deleted-brands`
- **Component**: `DeletedBrandList`
- **Purpose**: View and restore deleted brands (SUDOADMIN only)
- **Breadcrumb**: Home > Brands > Deleted Brands

## Navigation Flow

```
Brands List
    ├── Click "New Brand" → Create Brand Page
    ├── Click "Edit" on row → Edit Brand Page
    ├── Click "View" on row → View Brand Page
    ├── Click row → Navigate to Categories (/dashboard/category/:slug)
    └── Click "View Deleted" → Deleted Brands List
```

## Component Structure

```
src/components/brands/
├── BrandListPage.tsx       # Main list view with table
├── BrandCreatePage.tsx     # Create form wrapper
├── BrandEditPage.tsx       # Edit form wrapper
├── BrandViewPage.tsx       # Detail view wrapper
├── BrandFormView.tsx       # Shared form component
├── BrandDetailView.tsx     # Shared detail component
├── BrandTableColumns.tsx   # Table column definitions
├── SortableBrandRow.tsx    # Drag-and-drop row component
└── DeletedBrandList.tsx    # Deleted brands list
```

## Key Features

- **Separate Routes**: Each action (list, create, edit, view) has its own route
- **Breadcrumbs**: Each page has contextual breadcrumbs for navigation
- **Slug-based URLs**: Edit and view routes use brand slugs for SEO-friendly URLs
- **Shared Components**: Form and detail views are reusable across routes
- **Consistent Navigation**: All pages can navigate back to the main list

## Migration Notes

The old `BrandList.tsx` component handled all views (list, create, edit, view) in a single component with state management. This has been split into separate route components for:
- Better code organization
- Clearer URL structure
- Improved navigation and bookmarking
- Easier maintenance and testing
