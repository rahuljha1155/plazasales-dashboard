import { useGetSubcategoriesByCategoryId } from "@/services/category";
import { 
  useCreateSubCategory, 
  useUpdateSubCategory, 
  useDeleteSubCategory,
  useGetSubcategoryById 
} from "@/services/subcategory";

/**
 * Example component showing how to use the subcategory API endpoints
 */
export function SubcategoryByCategoryExample() {
  const categoryId = "2d9c6f9b-114a-4021-990a-04edef64e124";
  
  // 1. Fetch subcategories by category ID
  const { data, isLoading, error } = useGetSubcategoriesByCategoryId(
    categoryId,
    1,  // page
    10  // limit
  );

  // 2. Create subcategory
  const { mutateAsync: createSubcategory } = useCreateSubCategory();
  
  const handleCreate = async () => {
    const formData = new FormData();
    formData.append("title", "New Subcategory");
    formData.append("slug", "new-subcategory");
    formData.append("categoryId", categoryId);
    // formData.append("coverImage", file); // Add file if needed
    
    await createSubcategory(formData as any);
  };

  // 3. Update subcategory
  const subcategoryId = "some-subcategory-id";
  const { mutateAsync: updateSubcategory } = useUpdateSubCategory(subcategoryId);
  
  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("title", "Updated Subcategory");
    
    await updateSubcategory(formData);
  };

  // 4. Delete subcategory
  const { mutateAsync: deleteSubcategory } = useDeleteSubCategory();
  
  const handleDelete = async (id: string) => {
    await deleteSubcategory(id);
  };

  // 5. Get single subcategory by ID
  const { data: subcategoryData } = useGetSubcategoryById(subcategoryId);

  if (isLoading) {
    return <div>Loading subcategories...</div>;
  }

  if (error) {
    return <div>Error loading subcategories: {error.message}</div>;
  }

  return (
    <div>
      <h2>Subcategories for Category: {categoryId}</h2>
      <p>Total: {data?.data.total}</p>
      <p>Page: {data?.data.page} of {data?.data.totalPages}</p>
      
      <ul>
        {data?.data.subCategories.map((subcategory) => (
          <li key={subcategory.id}>
            {subcategory.title} ({subcategory.slug})
            <button onClick={() => handleDelete(subcategory.id)}>Delete</button>
          </li>
        ))}
      </ul>
      
      <button onClick={handleCreate}>Create New Subcategory</button>
    </div>
  );
}
