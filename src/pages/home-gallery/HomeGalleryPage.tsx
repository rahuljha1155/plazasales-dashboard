import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "@/components/ui/data-table";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createGalleryColumns } from "@/components/home-gallery/HomeGalleryTableColumns";
import { createDeletedGalleryColumns } from "@/components/home-gallery/DeletedGalleryTableColumns";
import type { HomeGalleryType } from "@/types/homegalleryType";
import { useNavigate } from "react-router-dom";
import {
  getHomeGalleries,
  deleteHomeGallery,
  deleteBulkHomeGalleries,
  destroyHomeGallery,
  getDeletedHomeGalleries,
  recoverHomeGalleries,
} from "@/services/homeGallery";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { cache, fetchWithCache } from "@/lib/cache";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaginationState {
  page: number;
  limit: number;
}

export default function HomeGalleryPage() {

  const { user } = useUserStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  const [deletedPagination, setDeletedPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  const [data, setData] = useState<HomeGalleryType[]>([]);
  const [deletedData, setDeletedData] = useState<HomeGalleryType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [deletedTotalPages, setDeletedTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletedTotal, setDeletedTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isDestroyPending, setIsDestroyPending] = useState(false);
  const [isRecoverPending, setIsRecoverPending] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedActiveRows, setSelectedActiveRows] = useState<HomeGalleryType[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const [showBulkDestroyDialog, setShowBulkDestroyDialog] = useState(false);

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      const cacheKey = `home-galleries-page-${pagination.page}-limit-${pagination.limit}`;

      const response = await fetchWithCache(
        cacheKey,
        () => getHomeGalleries({
          page: pagination.page,
          limit: pagination.limit,
        }),
        5 * 60 * 1000 // 5 minutes TTL
      );

      setData(response.data.galleries);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load galleries");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeletedGalleries = async () => {
    try {
      setIsLoading(true);
      const cacheKey = `deleted-home-galleries-page-${deletedPagination.page}-limit-${deletedPagination.limit}`;

      const response = await fetchWithCache(
        cacheKey,
        () => getDeletedHomeGalleries({
          page: deletedPagination.page,
          limit: deletedPagination.limit,
        }),
        5 * 60 * 1000
      );

      setDeletedData(response.data.galleries);
      setDeletedTotalPages(response.data.totalPages);
      setDeletedTotal(response.data.total);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load deleted galleries"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === true) {
      fetchGalleries();
    } else {
      fetchDeletedGalleries();
    }
  }, [pagination, deletedPagination, activeTab]);

  const handleDelete = async (id: string) => {
    try {
      setIsDeletePending(true);
      await deleteHomeGallery(id);
      toast.success("Gallery deleted successfully");
      cache.keys().forEach((key) => {
        if (key.startsWith("home-galleries-") || key.startsWith("deleted-home-galleries-")) {
          cache.clear(key);
        }
      });
      await fetchGalleries();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsDeletePending(false);
    }
  };

  const handleDestroy = async (id: string) => {
    try {
      setIsDestroyPending(true);
      await destroyHomeGallery(id);
      toast.success("Gallery permanently destroyed");
      cache.keys().forEach((key) => {
        if (key.startsWith("deleted-home-galleries-")) {
          cache.clear(key);
        }
      });
      await fetchDeletedGalleries();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsDestroyPending(false);
    }
  };

  const handleEdit = (gallery: HomeGalleryType) => {
    navigate(`/dashboard/home-gallery/edit/${gallery.id}`);
  };

  const handleView = (gallery: HomeGalleryType) => {
    navigate(`/dashboard/home-gallery/view/${gallery.id}`);
  };


  // Listen for custom event to refetch
  useEffect(() => {
    const refetchHandler = () => {
      // Clear all cache entries
      cache.keys().forEach((key) => {
        if (key.startsWith("home-galleries-") || key.startsWith("deleted-home-galleries-")) {
          cache.clear(key);
        }
      });

      // Refetch based on active tab
      if (activeTab === true) {
        fetchGalleries();
      } else {
        fetchDeletedGalleries();
      }
    };
    window.addEventListener("homeGallery:refetch", refetchHandler);
    return () => window.removeEventListener("homeGallery:refetch", refetchHandler);
  }, [activeTab, pagination, deletedPagination]);

  const handleRecover = async (id: string) => {
    try {
      setIsRecoverPending(true);
      await recoverHomeGalleries([id]);
      toast.success("Gallery recovered successfully");
      // Clear cache for both active and deleted galleries
      cache.keys().forEach((key) => {
        if (key.startsWith("home-galleries-") || key.startsWith("deleted-home-galleries-")) {
          cache.clear(key);
        }
      });
      await fetchDeletedGalleries();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to recover gallery");
    } finally {
      setIsRecoverPending(false);
    }
  };

  const handleRecoverSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select galleries to recover");
      return;
    }

    try {
      setIsRecoverPending(true);
      await recoverHomeGalleries(selectedRows);
      toast.success(`${selectedRows.length} gallery(ies) recovered successfully`);
      setSelectedRows([]);
      // Clear cache for both active and deleted galleries
      cache.keys().forEach((key) => {
        if (key.startsWith("home-galleries-") || key.startsWith("deleted-home-galleries-")) {
          cache.clear(key);
        }
      });
      await fetchDeletedGalleries();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to recover galleries");
    } finally {
      setIsRecoverPending(false);
    }
  };

  const handleDestroySelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select galleries to delete permanently");
      return;
    }

    try {
      setIsDestroyPending(true);
      // Assuming destroyHomeGallery can handle comma specific IDs similar to deleteBulkHomeGalleries logic
      // If the API expect single ID calls loop, but based on pattern it likely supports bulk string or needed update.
      // Based on previous patterns in this project, passing comma separated string works.
      await destroyHomeGallery(selectedRows.join(","));

      toast.success(`${selectedRows.length} gallery(ies) permanently destroyed`);
      setShowBulkDestroyDialog(false);
      setSelectedRows([]);
      // Clear cache for deleted galleries
      cache.keys().forEach((key) => {
        if (key.startsWith("deleted-home-galleries-")) {
          cache.clear(key);
        }
      });
      await fetchDeletedGalleries();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to destroy galleries");
    } finally {
      setIsDestroyPending(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = selectedActiveRows.map((row) => row.id);
      await deleteBulkHomeGalleries(ids);
      toast.success(`${ids.length} gallery(ies) deleted successfully`);
      setShowBulkDeleteDialog(false);
      setSelectedActiveRows([]);
      // Clear cache for all gallery pages
      cache.keys().forEach((key) => {
        if (key.startsWith("home-galleries-") || key.startsWith("deleted-home-galleries-")) {
          cache.clear(key);
        }
      });
      await fetchGalleries();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete galleries");
    }
  };

  const breadcrumbLinks = activeTab
    ? [
      {
        label: "Home Gallery",
        isActive: true,
      },
    ]
    : [
      {
        label: "Home Gallery",
        href: "#",
        handleClick: () => setActiveTab(true),
      },
      {
        label: "Deleted Galleries",
        isActive: true,
      },
    ];

  const activeColumns = createGalleryColumns({
    onEdit: handleEdit,
    onView: handleView,
    onDelete: handleDelete,
    isDeletePending,
  });

  const deletedColumns = createDeletedGalleryColumns({
    onView: handleView,
    onDestroy: handleDestroy,
    onRecover: handleRecover,
    isDestroyPending,
    isRecoverPending,
    selectedIds: selectedRows,
    onSelectionChange: setSelectedRows,
  });

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  if (isLoading && data.length === 0 && deletedData.length === 0) {
    return (
      <div className="">
        <TableShimmer />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <Breadcrumb links={breadcrumbLinks} />
      </div>



      {activeTab && (<DataTable
        columns={activeColumns as any}
        data={data}
        onRowSelectionChange={(rows: HomeGalleryType[]) => setSelectedActiveRows(rows)}
        filterColumn="centerImage"
        filterPlaceholder="Search galleries..."
        pagination={{
          itemsPerPage: pagination.limit,
          currentPage: pagination.page,
          totalItems: total,
          totalPages: totalPages,
          onPageChange: (page) => {
            setPagination((prev) => ({ ...prev, page }));
          },
          onItemsPerPageChange: (itemsPerPage) => {
            setPagination({ page: 1, limit: itemsPerPage });
          },
          showItemsPerPage: true,
          showPageInput: true,
          showPageInfo: true,
        }}
        elements={
          <div className="flex gap-2">
            {selectedActiveRows.length > 0 && (
              <Button
                variant="destructive"
                className="rounded-sm hover:shadow-md transition-shadow"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Icon
                  icon="solar:trash-bin-minimalistic-bold"
                  className="mr-2"
                  width="20"
                />
                delete ({selectedActiveRows.length})
              </Button>
            )}
            {user?.role === UserRole.SUDOADMIN && (<Button
              variant="destructive"
              onClick={() => setActiveTab(!activeTab)}
            >
              <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
              View Deleted
            </Button>)}
            <Button
              className="rounded-sm hover:shadow-md transition-shadow"
              onClick={() => navigate("/dashboard/home-gallery/create")}
            >
              <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
              New Gallery
            </Button>
          </div>
        }
      />)}

      {isSudoAdmin && !activeTab && (
        <>
          <DataTable
            columns={deletedColumns as any}
            data={deletedData}
            filterColumn="centerImage"
            filterPlaceholder="Search deleted galleries..."
            pagination={{
              itemsPerPage: deletedPagination.limit,
              currentPage: deletedPagination.page,
              totalItems: deletedTotal,
              totalPages: deletedTotalPages,
              onPageChange: (page) => { setDeletedPagination((prev) => ({ ...prev, page })); },
              onItemsPerPageChange: (itemsPerPage) => {
                setDeletedPagination({ page: 1, limit: itemsPerPage });
              },
              showItemsPerPage: true,
              showPageInput: true,
              showPageInfo: true,
            }}
            elements={
              <div className="flex gap-2">

                {selectedRows.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleRecoverSelected}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    disabled={isRecoverPending}
                  >
                    {isRecoverPending ? (
                      <Icon icon="svg-spinners:90-ring-with-bg" className="mr-2" width="20" />
                    ) : (
                      <Icon icon="solar:restart-bold" className="mr-2" width="20" />
                    )}
                    Recover Selected ({selectedRows.length})
                  </Button>
                )}
                {selectedRows.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkDestroyDialog(true)}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    disabled={isDestroyPending}
                  >
                    {isDestroyPending ? (
                      <Icon icon="svg-spinners:90-ring-with-bg" className="mr-2" width="20" />
                    ) : (
                      <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                    )}
                    delete ({selectedRows.length})
                  </Button>
                )}
              </div>
            }
          />
        </>
      )}

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Galleries?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedActiveRows.length} selected gallery(ies)? This action will move them to trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeletePending}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeletePending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDestroyDialog} onOpenChange={setShowBulkDestroyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete Galleries?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedRows.length} selected gallery(ies)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDestroySelected}
              disabled={isDestroyPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDestroyPending ? "Deleting..." : "Delete Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
