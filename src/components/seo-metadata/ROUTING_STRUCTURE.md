# SEO Metadata Routing Structure

## Overview
The SEO metadata management has been refactored into separate pages with proper routing and breadcrumbs.

## Routes

### Main List Page
- **Route**: `/dashboard/seo-metadata`
- **Component**: `SeoListPage`
- **Features**:
  - View all SEO metadata entries
  - Search and filter by title
  - Bulk delete functionality
  - Navigate to view, edit, or delete entries
  - Access to deleted SEO entries (SUDOADMIN only)
  - Create new whole site SEO

### View Details Page
- **Route**: `/dashboard/seo-metadata/view/:id`
- **Component**: `SeoViewPage`
- **Features**:
  - View complete SEO metadata details
  - Display OpenGraph, Twitter, Robots, JSON-LD information
  - Show images and files
  - Back navigation to list

### Edit Page
- **Route**: `/dashboard/seo-metadata/edit/:id`
- **Component**: `SeoEditPage`
- **Features**:
  - Edit existing SEO metadata
  - Form validation
  - Cancel and success navigation
  - Breadcrumb navigation

### Whole Site SEO Edit Page
- **Route**: `/dashboard/seo-metadata/whole-site/edit/:id`
- **Component**: `SeoWholeSiteEditPage`
- **Features**:
  - Edit whole site SEO metadata
  - Specialized form for site-wide SEO
  - Cancel and success navigation
  - Breadcrumb navigation

### Create Page
- **Route**: `/dashboard/seo-metadata/create`
- **Component**: `CreateSeoMetadata`
- **Features**: Create new SEO metadata entry

### Create Whole Site SEO
- **Route**: `/dashboard/seo-metadata/create/whole-site`
- **Component**: `ALLSITESEO`
- **Features**: Create site-wide SEO metadata

### Deleted SEO List
- **Route**: `/dashboard/deleted-seo`
- **Component**: `DeletedSeo`
- **Features**: View and manage deleted SEO entries (SUDOADMIN only)

## Breadcrumb Structure

### List Page
```
SEO Metadata
```

### View Page
```
SEO Metadata > View Details
```

### Edit Page
```
SEO Metadata > Edit
```

### Whole Site Edit Page
```
SEO Metadata > Edit Whole Site SEO
```

## Navigation Flow

1. **From List to View**: Click on any row or "View Details" action
2. **From List to Edit**: Click "Edit" action button
3. **From List to Whole Site Edit**: Click "Edit" on a whole site SEO entry
4. **From View/Edit back to List**: Click back button or breadcrumb
5. **After successful edit**: Automatically redirects to list page

## State Management

All pages use proper URL parameters (`:id`) instead of local state, making:
- Direct URL access possible
- Browser back/forward navigation work correctly
- Bookmarking specific pages possible
- Sharing links to specific SEO entries easy

## Components Used

- `SeoListPage`: Main list with DataTable
- `SeoEditPage`: Wrapper for UpdateSeoMetadata
- `SeoViewPage`: Wrapper for SeoDetailView
- `SeoWholeSiteEditPage`: Wrapper for UpdateWholeSiteSeoMetadata
- `UpdateSeoMetadata`: Form component for editing
- `SeoDetailView`: Display component for viewing details
- `createSeoColumns`: Table column definitions with actions
