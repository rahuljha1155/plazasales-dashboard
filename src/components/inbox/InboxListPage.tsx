"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
} from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
import { useDeleteContact, useGetAllContacts, useDeleteBulkContacts } from "@/hooks/useContact";
import { DataTable } from "@/components/ui/data-table";
import { TableShimmer } from "@/components/table-shimmer";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Icon } from "@iconify/react/dist/iconify.js";
import Breadcrumb from "../dashboard/Breadcumb";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "../LoginPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InboxListPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [deletingId, setDeletingId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem("inboxActiveTab");
    return saved || "contacts";
  });
  const [page, setPage] = useState<number>(() => {
    const saved = localStorage.getItem("inboxPage");
    return saved ? Number(saved) : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = localStorage.getItem("inboxPageSize");
    return saved ? Number(saved) : 10;
  });
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { mutateAsync: deleteBulkContacts, isPending: isBulkDeleting } = useDeleteBulkContacts();

  useEffect(() => {
    localStorage.setItem("inboxActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("inboxPage", String(page));
  }, [page]);
  useEffect(() => {
    localStorage.setItem("inboxPageSize", String(pageSize));
  }, [pageSize]);

  // Fetch paginated contacts (server-side pagination)
  const { data: contactData, isLoading } = useGetAllContacts(page, pageSize, "");
  const { mutateAsync: deleteContact, isPending: isDeleting } = useDeleteContact();

  // Filter contacts based on active tab
  const filteredContacts = contactData && (contactData as any).data?.contacts
    ? (contactData as any).data.contacts.filter((contact: any) => {
      if (activeTab === "demo-request") {
        return contact.purpose?.toLowerCase().includes("demo");
      }
      return !contact.purpose?.toLowerCase().includes("demo");
    })
    : [];

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map(row => row.id);
      await deleteBulkContacts(ids);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
    } catch (error: any) {
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteContact(id);
    } catch (error: any) {
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="ml-3"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="ml-3"
        />
      ),
    },
    {
      header: "S.N.",
      cell: ({ row }) => <div>{Number.parseInt(row.id) + 1}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex px- items-center gap-2">
            <span className=" text-gray-900">{contact.fullname}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <Link to={`mailto:${contact.email}`} className="text-sm hover:text-primary hover:underline">
            {contact.email}
          </Link>
        );
      },
    },
    {
      accessorKey: "goal",
      header: "Purpose",
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <span className="inline-flex items-center  py-1 rounded-full   max-w-[200px] truncate">
            {contact.purpose || "N/A"}
          </span>
        );
      }
    },

    {
      accessorKey: "createdAt",
      header: "Received Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="flex flex-col">
            <span className="text-sm  ">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-xs ">
              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex items-center gap-1 justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-blue-50 transition-colors"
                    onClick={async () => {
                      navigate(`/dashboard/inbox/${contact.id}`); // Navigate to details page
                    }}
                  >
                    <Icon
                      icon="mynaui:eye"
                      width="18"
                      height="18"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-orange-50 transition-colors"
                    onClick={() => {
                      navigate(`/dashboard/inbox/${contact.id}/reply`);
                    }}
                  >
                    <Icon
                      icon="material-symbols:reply"
                      width="18"
                      height="18"
                      className="text-gray-500 hover:text-orange-600 transition-colors"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send reply</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      setDeletingId(contact.id);
                    }}
                  >
                    <Icon
                      icon="ic:baseline-delete"
                      width="18"
                      height="18"
                      className="text-gray-500 hover:text-red-600 transition-colors"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete contact</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];


  // Pagination props for DataTable
  const contactsData = contactData && (contactData as any).data ? (contactData as any).data : { contacts: [], total: 0, totalPages: 1 };
  const pagination = {
    currentPage: page,
    totalPages: contactsData.totalPages || 1,
    totalItems: filteredContacts.length || 0,
    itemsPerPage: pageSize,
    onPageChange: (p: number) => setPage(p),
    onItemsPerPageChange: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    showItemsPerPage: true,
    showPageInput: true,
    showPageInfo: true,
  };


  if (isLoading) {
    return <TableShimmer />;
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center pb-4">
        <Breadcrumb links={[
          { label: "Inbox", isActive: false, handleClick: () => navigate("/dashboard/inbox") },
          { label: "View All", isActive: true },
        ]} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="contacts">
            Contacts ({contactsData.contacts?.filter((c: any) => !c.purpose?.toLowerCase().includes("demo")).length || 0})
          </TabsTrigger>
          <TabsTrigger value="demo-request">
            Demo Requests ({contactsData.contacts?.filter((c: any) => c.purpose?.toLowerCase().includes("demo")).length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            columns={columns}
            data={filteredContacts || []}
            onRowClick={(row) => navigate(`/dashboard/inbox/${row.id}`)}
            filterColumn={"name"}
            filterPlaceholder="Search by name, email, or purpose..."
            pagination={pagination}
            onRowSelectionChange={(rows: any) => setSelectedRows(rows)}
            getRowClassName={(contact) => contact.isView === false ? "bg-zinc-100 font-bold border-b border-zinc-200" : ""}
            elements={<div className="flex gap-2">
              {selectedRows.length > 0 && (
                <Button
                  variant="destructive"
                  className="rounded-sm hover:shadow-md text-red-500! border-red-500! hover:text-white! hover:bg-red-500! transition-shadow"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                  delete ({selectedRows.length})
                </Button>
              )}
              {user?.role === UserRole.SUDOADMIN && (<Button
                variant="outline"
                className="rounded-sm hover:shadow-md text-red-500! border-red-500! hover:text-white! hover:bg-red-500! transition-shadow"
                onClick={() => navigate("/dashboard/deleted-contacts")}
              >
                <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                Deleted Contacts
              </Button>)}
            </div>}
          />
        </TabsContent>
      </Tabs>
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId("")} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer hover:bg-orange-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => handleDelete(deletingId)}
              className="text-red-100 hover:bg-red-500 cursor-pointer bg-red-500"
            >
              {isDeleting ? "Confirming..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Items?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected item(s)? This action cannot be undone.
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
