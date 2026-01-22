import { Suspense, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableShimmer } from "@/components/table-shimmer";
import { ItemTable } from "@/components/homefaq/Item-Table";
import { ItemForm } from "./item-form"; // New form component
import { useGetHomefaqs } from "@/hooks/homefaq";
import type { homefaq } from "@/types/homefaq";

export default function Homefaq() {
  const { data: pkge, isLoading, refetch } = useGetHomefaqs();
  const [isAdding, setIsAdding] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<homefaq | null>(null);

  return (
    <div className="container mx-auto py-2">
      {isAdding ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Add Homefaq</h1>
            <Button onClick={() => setIsAdding(false)} variant="outline">
              Back to List
            </Button>
          </div>
          <ItemForm
            onSuccess={() => {
              refetch();
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      ) : itemToEdit ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Homefaq</h1>
            <Button onClick={() => setItemToEdit(null)} variant="outline">
              Back to List
            </Button>
          </div>
          <ItemForm
            item={itemToEdit}
            onSuccess={() => {
              refetch();
              setItemToEdit(null);
            }}
            onCancel={() => setItemToEdit(null)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Homefaq</h1>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Homefaq
            </Button>
          </div>

          <Suspense fallback={<TableShimmer />}>
            <ItemTable
              pkgs={pkge || []}
              isLoading={isLoading}
              onEdit={setItemToEdit}
            />
          </Suspense>
        </>
      )}
    </div>
  );
}
