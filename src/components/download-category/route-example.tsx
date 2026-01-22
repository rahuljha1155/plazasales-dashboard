// Example route configuration for Download Management System
// Add these routes to your application's router

import { DownloadCategoryList } from "@/components/download-category";
import { CategoryContents } from "@/components/download-category";

// If using React Router v6:
const downloadRoutes = [
  {
    path: "/download-categories",
    element: <DownloadCategoryList />,
  },
  {
    path: "/download-category/:categoryId/contents",
    element: <CategoryContents />,
  },
];

// Or if adding to existing router:
export const routes = [
  // ... other routes
  {
    path: "/downloads",
    children: [
      {
        index: true,
        element: <DownloadCategoryList />,
      },
      {
        path: "category/:categoryId/contents",
        element: <CategoryContents />,
      },
    ],
  },
];

// Example with Layout wrapper:
export const protectedRoutes = [
  {
    path: "/",
    element: <div>MainLayout</div>, // Your layout component - replace with actual MainLayout
    children: [
      // ... other routes
      {
        path: "downloads",
        children: [
          {
            index: true,
            element: <DownloadCategoryList />,
          },
          {
            path: "category/:categoryId/contents",
            element: <CategoryContents />,
          },
        ],
      },
    ],
  },
];

// Example navigation links for sidebar/menu:
const navigationLinks = [
  // ... other links
  {
    name: "Download Categories",
    href: "/download-categories",
    icon: "FolderOpen", // Use your preferred icon
  },
];

// Example with product-specific downloads:
// If you want to show downloads for a specific product:
export const productRoutes = [
  {
    path: "/products/:productId",
    element: <div>ProductLayout</div>, // Replace with actual ProductLayout
    children: [
      // ... other product tabs
      {
        path: "downloads",
        element: <DownloadCategoryList />, // Will use productId from params if needed
      },
    ],
  },
];
