import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SelectedDataState {
    selectedBrand: any;
    selectedCategory: any;
    selectedSubcategory: any;
    selectedProduct: any;
    setSelectedBrand: (brand: any) => void;
    setSelectedCategory: (category: any) => void;
    setSelectedSubcategory: (subcategory: any) => void;
    setSelectedProduct: (product: any) => void;
    clearSelectedData: () => void;
    selectedProductCategory: any;
    setSelectedProductCategory: (category: any) => void;
}

export const useSelectedDataStore = create<SelectedDataState>()(
    persist(
        (set) => ({
            selectedBrand: null,
            selectedCategory: null,
            selectedSubcategory: null,
            selectedProduct: null,
            setSelectedBrand: (brand) => set({ selectedBrand: brand }),
            setSelectedCategory: (category) => set({ selectedCategory: category }),
            setSelectedSubcategory: (subcategory) => set({ selectedSubcategory: subcategory }),
            setSelectedProduct: (product) => set({ selectedProduct: product }),
            clearSelectedData: () => set({
                selectedBrand: null,
                selectedCategory: null,
                selectedSubcategory: null,
                selectedProduct: null,
            }),
            selectedProductCategory: null,
            setSelectedProductCategory: (category) => set({ selectedProductCategory: category }),
        }),
        {
            name: "selected-data-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);