import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectionState {
  selectedBrandId: string | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedProductId: string | null;
  
  setSelectedBrandId: (brandId: string | null) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  setSelectedSubcategoryId: (subcategoryId: string | null) => void;
  setSelectedProductId: (productId: string | null) => void;
  
  // Helper to set multiple values at once
  setSelection: (data: {
    brandId?: string | null;
    categoryId?: string | null;
    subcategoryId?: string | null;
    productId?: string | null;
  }) => void;
  
  // Clear all selections
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set) => ({
      selectedBrandId: null,
      selectedCategoryId: null,
      selectedSubcategoryId: null,
      selectedProductId: null,

      setSelectedBrandId: (brandId) => set({ selectedBrandId: brandId }),
      
      setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
      
      setSelectedSubcategoryId: (subcategoryId) => set({ selectedSubcategoryId: subcategoryId }),
      
      setSelectedProductId: (productId) => set({ selectedProductId: productId }),
      
      setSelection: (data) => set((state) => ({
        selectedBrandId: data.brandId !== undefined ? data.brandId : state.selectedBrandId,
        selectedCategoryId: data.categoryId !== undefined ? data.categoryId : state.selectedCategoryId,
        selectedSubcategoryId: data.subcategoryId !== undefined ? data.subcategoryId : state.selectedSubcategoryId,
        selectedProductId: data.productId !== undefined ? data.productId : state.selectedProductId,
      })),
      
      clearSelection: () => set({
        selectedBrandId: null,
        selectedCategoryId: null,
        selectedSubcategoryId: null,
        selectedProductId: null,
      }),
    }),
    {
      name: 'selection-storage',
    }
  )
);
