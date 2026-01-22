import { Suspense, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { TableShimmer } from "@/components/table-shimmer";
import { ItemTable } from "@/components/faqpage/Item-Table";
import { FAQForm } from "./faq-form";
import { useGetFAQs, useDeleteBulkFAQs } from "@/hooks/useFaqs";
import type { IFAQ } from "@/types/IFaq";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { Icon } from "@iconify/react/dist/iconify.js";
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
import { toast } from "sonner";
import DeletedFaqList from "./DeletedFaqList";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";

export default function FAQPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: faqData, isLoading, refetch } = useGetFAQs();
  const { mutateAsync: deleteBulkFAQs, isPending: isBulkDeleting } = useDeleteBulkFAQs();

  const [isAdding, setIsAdding] = useState(false);
  const [faqToEdit, setFaqToEdit] = useState<IFAQ | null>(null);
  const [faqToView, setFaqToView] = useState<IFAQ | null>(null);
  const [selectedRows, setSelectedRows] = useState<IFAQ[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const { user } = useUserStore();
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map((row) => row.id);
      await deleteBulkFAQs(ids);
      toast.success(`${ids.length} FAQ(s) deleted successfully`);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete FAQs");
    }
  };

  return (
    <div className="container mx-auto ">

      {isAdding ? (
        <div className="">
          <div className="flex items-center justify-between mb-6">

            <Button onClick={() => setIsAdding(false)} variant="outline" className="gap-2">
              <ArrowLeft className="size-4" /> Back to List
            </Button>
          </div>
          <FAQForm
            onSuccess={() => {
              refetch();
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      ) : showDeleted ? (
        <DeletedFaqList onBack={() => setShowDeleted(false)} />
      ) : faqToView ? (
        <div className="">
          <Breadcrumb
            links={[
              { label: "FAQ", isActive: false, handleClick: () => setFaqToView(null) },
              { label: faqToView?.title || "Title", isActive: false, handleClick: () => setFaqToView(null) },
              { label: "View", isActive: true },
            ]}
          />
          <div className="p-4 mt-6 rounded-lg bg-muted/80  space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Title</h3>
              <p className="text-gray-700">{faqToView.title}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: faqToView.description.content || "" }} />
            </div>
          </div>
        </div>
      ) : faqToEdit ? (
        <div className="">
          <Breadcrumb
            links={[
              { label: "FAQ", isActive: false },
              { label: faqToEdit?.title || "Title", isActive: false, handleClick: () => setFaqToEdit(null) },
              { label: "Edit", isActive: true },
            ]}
          />
          <FAQForm
            faq={faqToEdit}
            onSuccess={() => {
              refetch();
              setFaqToEdit(null);
            }}
            onCancel={() => setFaqToEdit(null)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">

            <div className="flex justify-between w-full items-center">
              <div className="">
                <Breadcrumb
                  links={[
                    { label: "FAQ", isActive: false },
                    { label: "View All", isActive: true },
                  ]}
                />
              </div>
            </div>
          </div>

          <Suspense fallback={<TableShimmer />}>
            <ItemTable
              pkgs={faqData?.data?.faqs || []}
              isLoading={isLoading}
              onRefetch={refetch}
              onView={setFaqToView}
              element={
                <div className="flex gap-2">
                  {selectedRows.length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowBulkDeleteDialog(true)}
                    >
                      <Icon
                        icon="solar:trash-bin-minimalistic-bold"
                        className="mr-2"
                        width="20"
                      />
                      delete ({selectedRows.length})
                    </Button>
                  )}
                  {isSudoAdmin && (
                    <Button
                      onClick={() => setShowDeleted(true)}
                      variant="destructive"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                      Deleted FAQs
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="rounded-sm hover:shadow-md transition-shadow"
                  >
                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                    New FAQ
                  </Button>
                </div>
              }
              onEdit={setFaqToEdit}
              onRowSelectionChange={(rows: IFAQ[]) => setSelectedRows(rows)}
              pagination={{
                currentPage: page,
                itemsPerPage: limit,
                totalItems: faqData?.data?.total || 0,
                totalPages: faqData?.data?.totalPages || 1,
                onPageChange: handlePageChange,
              }}
            />
          </Suspense>
        </>
      )}

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete FAQs?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected FAQ(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isBulkDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
