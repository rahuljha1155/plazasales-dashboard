# Category Forms - Usage Guide

This guide demonstrates how to use the Category forms (Create, Edit, and View) in your React components.

## Components Available

1. **CategoryForm** - Create and Edit form for categories
2. **CategoryViewModal** - View-only modal for category details

## Installation

The forms are already created in:
- `/src/components/category/CategoryForm.tsx`
- `/src/components/category/CategoryViewModal.tsx`

## Basic Usage Example

```tsx
import React, { useState } from "react";
import { CategoryForm } from "@/components/category/CategoryForm";
import { CategoryViewModal } from "@/components/category/CategoryViewModal";
import { Button } from "@/components/ui/button";

export default function CategoryManagement() {
  const [mode, setMode] = useState<"view" | "create" | "edit" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const handleSuccess = () => {
    // Handle success (e.g., refetch data, close form)
    setMode(null);
    setSelectedCategory(null);
    // You might want to refetch your category list here
  };

  const handleCancel = () => {
    setMode(null);
    setSelectedCategory(null);
  };

  // Example: Create new category
  if (mode === "create") {
    return (
      <CategoryForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Example: Edit existing category
  if (mode === "edit" && selectedCategory) {
    return (
      <CategoryForm
        mode="edit"
        category={selectedCategory}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Example: View category details
  return (
    <div>
      <Button onClick={() => setMode("create")}>Create Category</Button>
      
      <CategoryViewModal
        isOpen={mode === "view"}
        onClose={() => setMode(null)}
        category={selectedCategory}
      />
    </div>
  );
}
```

## Integration with Data Table

Here's how to integrate with a data table for listing categories:

```tsx
import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CategoryForm } from "@/components/category/CategoryForm";
import { CategoryViewModal } from "@/components/category/CategoryViewModal";
import { useGetAllCategories, useDeleteCategory } from "@/services/category";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CategoryListPage() {
  const [mode, setMode] = useState<"view" | "create" | "edit" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const { data: categoriesData, isLoading, refetch } = useGetAllCategories();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const handleSuccess = () => {
    setMode(null);
    setSelectedCategory(null);
    refetch(); // Refresh the list after create/update
  };

  const handleDelete = (categoryId: string) => {
    deleteCategory(categoryId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("slug")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <span
                className="flex cursor-default select-none items-center px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => {
                  setSelectedCategory(category);
                  setMode("view");
                }}
              >
                View
              </span>
              <span
                className="flex cursor-default select-none items-center px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => {
                  setSelectedCategory(category);
                  setMode("edit");
                }}
              >
                Edit
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <span className="flex cursor-default select-none items-center px-2 py-1.5 text-sm text-red-500/90 hover:bg-accent">
                    Delete
                  </span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the category.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500/90 hover:bg-red-500"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Show create/edit form
  if (mode === "create") {
    return (
      <CategoryForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={() => setMode(null)}
      />
    );
  }

  if (mode === "edit" && selectedCategory) {
    return (
      <CategoryForm
        mode="edit"
        category={selectedCategory}
        onSuccess={handleSuccess}
        onCancel={() => setMode(null)}
      />
    );
  }

  // Show list view
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setMode("create")}>Create Category</Button>
      </div>

      <DataTable
        columns={columns}
        data={categoriesData?.categories || []}
        filterColumn="title"
        filterPlaceholder="Search categories..."
      />

      <CategoryViewModal
        isOpen={mode === "view"}
        onClose={() => {
          setMode(null);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
}
```

## Props Documentation

### CategoryForm Props

```typescript
interface CategoryFormProps {
  category?: any;           // Category data for edit mode (optional)
  onSuccess: () => void;    // Callback when form submission succeeds
  onCancel: () => void;     // Callback when user cancels
  mode: "create" | "edit";  // Form mode
}
```

### CategoryViewModal Props

```typescript
interface CategoryViewModalProps {
  isOpen: boolean;         // Controls modal visibility
  onClose: () => void;     // Callback when modal closes
  category: {              // Category data to display
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    brandId: string;
    brandName?: string;
    sortOrder?: number;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
}
```

## Features

### CategoryForm
- ✅ Auto-generates slug from title
- ✅ Brand selection dropdown
- ✅ Cover image upload with preview
- ✅ Image validation (max 5MB, JPEG/PNG/WebP only)
- ✅ Form validation using Zod schema
- ✅ Loading states during submission
- ✅ Error handling with toast notifications
- ✅ Supports both create and edit modes

### CategoryViewModal
- ✅ Displays cover image
- ✅ Shows all category metadata
- ✅ Formatted date display
- ✅ Status badges (Active/Deleted)
- ✅ Responsive design

## Schema Validation

The form uses the schema defined in `/src/schema/category.ts`:

```typescript
export const categoryFormSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  
  slug: z.string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  
  brandId: z.string()
    .uuid("Brand ID must be a valid UUID"),
  
  coverImage: z.instanceof(File)
    .refine((file) => file.size > 0, "Cover image is required")
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) => 
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type), 
      "Only JPEG, PNG, and WebP images are allowed"
    )
});
```

## Customization

You can customize the forms by:

1. **Styling**: Modify the component's className props
2. **Validation**: Update the schema in `/src/schema/category.ts`
3. **Additional Fields**: Add more FormField components in the form
4. **API Integration**: The forms use the services from `/src/services/category.ts`

## Notes

- Forms automatically handle FormData creation for file uploads
- Slug is auto-generated and read-only for better UX
- Image previews are created using object URLs (memory efficient)
- All toast notifications are positioned at bottom-right
- The forms integrate with react-hook-form and Zod for validation
