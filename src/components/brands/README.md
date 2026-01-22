# Brand Components

Professional and clean brand management system with modern UI.

## Structure

```
brands/
├── BrandList.tsx           # Main list with stats dashboard
├── BrandFormView.tsx       # Form wrapper with navigation
├── BrandTableColumns.tsx   # Enhanced table columns
├── BrandDetailModal.tsx    # Brand detail view modal
├── CreateBrandSheet.tsx    # Brand form with validation
├── types.ts                # TypeScript type definitions
├── index.ts                # Barrel exports
└── README.md               # This file
```

## Components

### BrandList
Main dashboard component featuring:
- **Stats Cards**: Total brands, active brands, authorized distributors
- **Professional Table**: Enhanced data table with improved styling
- **State Management**: Centralized state for forms and modals
- **Data Fetching**: Loading states and error handling
- **Responsive Design**: Mobile-friendly layout

### BrandDetailModal
Beautiful modal for viewing brand details:
- Complete brand information display
- Image galleries (banners, indoor/outdoor)
- Certificate viewing
- Status badges and metadata
- Responsive layout

### BrandFormView
Wrapper component providing:
- Breadcrumb navigation
- Exit button with icon
- Consistent layout for create/edit modes
- Clean header design

### BrandTableColumns
Enhanced table columns with:
- **Professional Styling**: Rounded borders, shadows, better spacing
- **Logo Display**: Contained images with borders
- **Color Preview**: Visual color swatches with hex codes
- **Status Indicators**: Authorized distributor badges
- **Action Buttons**: Hover effects and tooltips
- **Improved Delete Dialog**: Better UX with icons and descriptions

### CreateBrandSheet
Complete brand form featuring:
- Form validation using Zod
- Multiple image uploads (logo, banners, indoor/outdoor)
- Color picker with automatic palette extraction
- Rich text editor for descriptions
- Authorization certificate upload
- Conditional fields based on distributor status

## UI Improvements

### Design System
- **Color Palette**: Professional gradients and consistent colors
- **Typography**: Clear hierarchy with proper font weights
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle elevation for depth
- **Borders**: Rounded corners throughout
- **Icons**: Solar icon set for consistency

### Interactive Elements
- Hover effects on all buttons
- Smooth transitions
- Loading states
- Tooltips on action buttons
- Professional alert dialogs

### Responsive Features
- Mobile-friendly stats cards
- Flexible table layout
- Adaptive modal sizing
- Touch-friendly buttons

## Usage

```tsx
import { BrandList } from "@/components/brands";

function BrandsPage() {
  return <BrandList />;
}
```

## Features

✅ Clean, organized code structure
✅ Professional UI design
✅ Responsive layout
✅ Type-safe with TypeScript
✅ Accessible components
✅ Loading and error states
✅ Smooth animations
✅ Comprehensive brand details
✅ Easy to maintain and extend

## Types

All types are centralized in `types.ts` and extend from the main `IBrand` interface for consistency.
