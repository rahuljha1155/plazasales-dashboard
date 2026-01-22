import React, { useState } from "react";
import { useGetCategoryByBrand } from "@/services/category";
import { useGetSubcategoriesByCategoryId } from "@/services/subcategory";

/**
 * Example component demonstrating how to use the updated category and subcategory hooks
 */
export function CategoryAndSubcategoryExample() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const brandId = "b4bd5e80-8518-4474-b74f-f1d3371a1ad5"; // Example brand ID
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch categories by brand ID with pagination
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoryByBrand(brandId, page, limit);

  // Fetch subcategories by category ID with pagination
  const {
    data: subcategoriesData,
    isLoading: subcategoriesLoading,
    error: subcategoriesError,
  } = useGetSubcategoriesByCategoryId(selectedCategoryId, page, limit);

  if (categoriesLoading) return <div>Loading categories...</div>;
  if (categoriesError) return <div>Error loading categories</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Categories by Brand</h2>

      {/* Display categories */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">
          Categories (Total: {categoriesData?.data?.total || 0})
        </h3>
        <div className="grid gap-4">
          {categoriesData?.data?.categories?.map((category) => (
            <div
              key={category.id}
              className="border p-4 rounded cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedCategoryId(category.id)}
            >
              <div className="flex items-center gap-4">
                {category.coverImage && (
                  <img
                    src={category.coverImage}
                    alt={category.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-semibold">{category.title}</h4>
                  <p className="text-sm text-gray-600">{category.slug}</p>
                  {category.brand && (
                    <p className="text-xs text-gray-500">
                      Brand: {category.brand.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {categoriesData?.data?.totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (categoriesData?.data?.totalPages || 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Display subcategories when a category is selected */}
      {selectedCategoryId && (
        <div>
          <h3 className="text-xl font-semibold mb-2">
            Subcategories (Total: {subcategoriesData?.data?.total || 0})
          </h3>
          {subcategoriesLoading ? (
            <div>Loading subcategories...</div>
          ) : subcategoriesError ? (
            <div>Error loading subcategories</div>
          ) : (
            <div className="grid gap-4">
              {subcategoriesData?.data?.subCategories?.map((subcategory) => (
                <div key={subcategory.id} className="border p-4 rounded">
                  <div className="flex items-center gap-4">
                    {subcategory.coverImage && (
                      <img
                        src={subcategory.coverImage}
                        alt={subcategory.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">{subcategory.title}</h4>
                      <p className="text-sm text-gray-600">{subcategory.slug}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * API Response Structure Examples:
 * 
 * GET /category/get-brand-categories/{brandId}
 * Response: {
 *   status: 200,
 *   data: {
 *     categories: [
 *       {
 *         id: string,
 *         createdAt: string,
 *         sortOrder: number,
 *         title: string,
 *         slug: string,
 *         coverImage: string,
 *         brand: {
 *           id: string,
 *           name: string,
 *           logoUrl: string
 *         },
 *         seoMetadata: null,
 *         subCategories: []
 *       }
 *     ],
 *     total: number,
 *     page: number,
 *     limit: number,
 *     totalPages: number
 *   }
 * }
 * 
 * GET /subcategory/get-category-subcategories/{categoryId}
 * Response: {
 *   status: 200,
 *   data: {
 *     subCategories: [],
 *     total: number,
 *     page: number,
 *     limit: number,
 *     totalPages: number
 *   }
 * }
 */
