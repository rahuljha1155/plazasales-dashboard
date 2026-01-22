import { Suspense, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/dashboard/Breadcumb";

import { TableShimmer } from "@/components/table-shimmer";
import { useGetHomeTestimonials } from "@/hooks/useHomeTestimonial";
import type { HomeTestimonialType } from "@/types/HomeTestimonialType";
import { TestimonialForm } from "@/components/home-testimonial/Item-Sheet";
import { TestimonialTable } from "@/components/home-testimonial/Item-Table";
import { Icon } from "@iconify/react/dist/iconify.js";

const links = [{ label: "Home Testimonials", isActive: true }];
export default function HomeTestimonialPage() {
  const { data: testimonials, isLoading, refetch } = useGetHomeTestimonials();
  const [isAdding, setIsAdding] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<HomeTestimonialType | null>(
    null
  );

  return (
    <div className="container mx-auto py-2">
      {isAdding ? (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl text-primary font-bold">
              Add Home Testimonial
            </h1>
            <Button
              onClick={() => setIsAdding(false)}
              variant="outline"
              className="text-red-500 flex items-center gap-2 cursor-pointer"
            >
              <Icon icon="solar:exit-bold-duotone" width="24" height="24" />
              Exit
            </Button>
          </div>
          <TestimonialForm
            onSuccess={() => {
              refetch();
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      ) : itemToEdit ? (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Edit Home Testimonial</h1>
          </div>
          <TestimonialForm
            testimonial={itemToEdit}
            onSuccess={() => {
              refetch();
              setItemToEdit(null);
            }}
            onCancel={() => setItemToEdit(null)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <Breadcrumb links={links} />
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Home Testimonial
            </Button>
          </div>

          <Suspense fallback={<TableShimmer />}>
            <TestimonialTable
              testimonials={testimonials || []}
              isLoading={isLoading}
              onEdit={setItemToEdit}
              onRefetch={refetch}
            />
          </Suspense>
        </>
      )}
    </div>
  );
}
