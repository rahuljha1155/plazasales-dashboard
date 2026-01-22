import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { TableShimmer } from "@/components/table-shimmer";
import type { ICareer } from "@/types/ICareer";
import { CareerForm } from "@/components/career/CareerForm";
import { CareerTable } from "@/components/career/CareerTable";
import { ViewCareer } from "@/components/career/ViewCareer";
import { useCareers, useCareer } from "@/services/career";
import Breadcrumb from "@/components/dashboard/Breadcumb";


const PAGINATION_KEY = "careerTablePagination";

export default function CareerListPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  // Load pagination from localStorage if available
  const getInitialPagination = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PAGINATION_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
        }
      }
    }
    return { page: 1, limit: 10 };
  };
  const [pagination, setPagination] = useState(getInitialPagination);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PAGINATION_KEY, JSON.stringify(pagination));
    }
  }, [pagination]);

  const { data: careersData, isLoading, refetch } = useCareers(pagination);
  const [isAdding, setIsAdding] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ICareer | null>(null);
  const [itemToView, setItemToView] = useState<ICareer | null>(null);

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  // Fetch full career details when viewing
  const { data: viewCareerData, isLoading: isLoadingView } = useCareer(
    itemToView?.id || "",
    !!itemToView
  );

  const careers = careersData?.data?.careers || [];

  return (
    <div className="container mx-auto py-2">
      {isAdding ? (
        <div>
          <div className="flex justify-between items-center pb-4">
            <Breadcrumb
              links={[
                { label: "Career", isActive: false, handleClick: () => setIsAdding(false) },
                { label: "Add New", isActive: true },
              ]}
            />
          </div>
          <CareerForm
            onSuccess={() => {
              refetch();
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      ) : itemToView ? (
        <div>
          <div className="flex justify-between items-center pb-4">
            <Breadcrumb
              links={[
                { label: itemToView?.title || "Career", isActive: false, handleClick: () => setItemToView(null) },
                { label: "View Details", isActive: true },
              ]}
            />
          </div>

          {isLoadingView ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-[300px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          ) : viewCareerData?.career ? (
            <ViewCareer career={viewCareerData.career} />
          ) : (
            <div className="text-center text-gray-500">Career not found</div>
          )}
        </div>
      ) : itemToEdit ? (
        <div>
          <div className="flex justify-between items-center pb-4">
            <Breadcrumb
              links={[
                { label: itemToEdit?.title || "Career", isActive: false, handleClick: () => setItemToEdit(null) },
                { label: "Edit Details", isActive: true },
              ]}
            />
          </div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl text-primary font-bold">Edit Career</h1>
            <Button
              onClick={() => setItemToEdit(null)}
              variant="outline"
              className="text-red-500 flex items-center gap-2 cursor-pointer"
            >
              <Icon icon="solar:exit-bold-duotone" width="24" height="24" />
              Exit
            </Button>
          </div>
          <CareerForm
            career={itemToEdit}
            onSuccess={() => {
              refetch();
              setItemToEdit(null);
            }}
            onCancel={() => setItemToEdit(null)}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center pb-4">
            <Breadcrumb
              links={[
                { label: "Career", isActive: false },
                { label: "View All", isActive: true },
              ]}
            />
          </div>
          <Suspense fallback={<TableShimmer />}>
            <CareerTable
              careers={careers}
              isLoading={isLoading}
              onEdit={setItemToEdit}
              onView={setItemToView}
              elements={
                <div className="flex gap-2">
                  {isSudoAdmin && (
                    <Button
                      variant="destructive"
                      onClick={() => navigate("/dashboard/deleted-careers")}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                      View Deleted
                    </Button>
                  )}
                  <Button
                    className="rounded-sm hover:shadow-md transition-shadow"
                    onClick={() => setIsAdding(true)}
                  >
                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                    New Career
                  </Button>
                </div>
              }
              pagination={{
                currentPage: careersData?.page || 1,
                totalPages: careersData?.totalPages || 1,
                totalItems: careersData?.total || 0,
                itemsPerPage: pagination.limit,
                onPageChange: (page) => {
                  setPagination((prev: { page: number; limit: number }) => {
                    const newState = { ...prev, page };
                    if (typeof window !== "undefined") {
                      localStorage.setItem(PAGINATION_KEY, JSON.stringify(newState));
                    }
                    return newState;
                  });
                },
                onItemsPerPageChange: (limit) => {
                  const newState = { page: 1, limit };
                  setPagination(newState);
                  if (typeof window !== "undefined") {
                    localStorage.setItem(PAGINATION_KEY, JSON.stringify(newState));
                  }
                },

              }}

            />
          </Suspense>
        </>
      )}
    </div>
  );
}
