import React, { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Loader, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSearchParams } from "react-router-dom";
import { useSearchPackage } from "@/hooks/useSearchPackage";
import Breadcumb from "@/components/dashboard/Breadcumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Link, useParams } from "react-router-dom";
import { useDeletePackage, useUpdatePackage } from "@/hooks/usePackage";
import PackageCreate from "../subcategory/createSubcategory.tsx";
import { TableShimmer } from "@/components/table-shimmer.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RichTextEditor from "@/components/RichTextEditor";
import slugify from "react-slugify";
import { api } from "@/services/api";

import { PackageViewModal } from "../subcategory/subcategoryView.tsx";
import { DataTable } from "../ui/data-table.tsx";

// Form schema with all fields
const formSchema = z.object({
  subCategoryId: z.string().min(1, "Sub-category is required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  overview: z.string().min(1, "Overview is required"),
  coverImage: z
    .any()
    .refine((file) => {
      if (typeof file === "string") return true; // Allow string URLs for existing images
      return file instanceof FileList && file.length > 0;
    }, "Cover image is required")
    .refine((file) => {
      if (typeof file === "string") return true; // Skip size check for existing images
      if (!(file instanceof FileList)) return false;
      const fileObj = file[0];
      if (!fileObj) return false;
      // Check file type
      return ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
        fileObj.type
      );
    }, "Only .jpg, .jpeg, .png and .webp formats are supported"),
  elevation: z.coerce
    .number()
    .min(0, "Elevation cannot be negative")
    .optional(),
  distance: z.coerce.number().min(0, "Distance cannot be negative").optional(),
  routeMap: z.any(),
  addToHome: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  slug: z.string().regex(/^([a-z0-9-]+)$/i, "Invalid slug format"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  activity: z.string().optional(),
  groupSize: z.string().optional(),
  vehicle: z.string().optional(),
  difficulty: z.string().optional(),
  accommodation: z.string().optional(),
  meal: z.string().optional(),
});

export default function PackageSearchPage() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const searchQuery = searchParams.get("query") || "";

  // Use the search query to fetch packages
  const { data: packages, isLoading } = useSearchPackage(searchQuery, {
    page: page,
    limit: limit,
  });

  // If we're in edit mode, show the edit form
  if (editingPackageId) {
    return (
      <EditPackagePage
        packageId={editingPackageId}
        subcategoryId={params.id as string}
        onCancel={() => setEditingPackageId(null)}
      />
    );
  } else if (showCreateModal) {
    return <PackageCreate onClose={() => setShowCreateModal(false)} brand={params.id as string} />;
  }

  // Otherwise show the list view
  return (
    <PackageListView
      query={searchQuery}
      onShowCreate={() => setShowCreateModal(true)}
      onEditPackage={(id) => setEditingPackageId(id)}
    />
  );
}

function PackageListView({
  query,
  onEditPackage,
  onShowCreate,
}: {
  onEditPackage: (id: string) => void;
  query: string;
  onShowCreate: () => void;
}) {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const {
    data: response,
    isLoading,
    refetch,
  } = useSearchPackage(query, {
    page: pagination.page,
    limit: pagination.limit,
  });

  const collection = response?.data || [];
  const [deletingId, setDeletingId] = useState<string>();
  const [viewingPackage, setViewingPackage] = useState<any | null>(null);

  const { mutateAsync: deletePackages, isPending: isDeleting } =
    useDeletePackage();

  const deletePackage = async (id: string) => {
    setDeletingId(id);

    try {
      await deletePackages(id);
      toast.success("Item deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "sortOrder",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          S.N.
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("sortOrder")}</div>,
    },
    {
      accessorKey: "coverImage",
      header: "Cover Image",
      cell: ({ row }) => {
        return (
          <>
            <>
              <Avatar className="bg-gray-100 rounded-sm h-8 w-8 object-scale-down ">
                <AvatarImage
                  src={row.original?.coverImage}
                  alt="subcategory-image"
                />
                <AvatarFallback className="bg-gray-100 rounded-sm h-8 w-8 object-scale-down text-foreground/65 ">
                  NA
                </AvatarFallback>
              </Avatar>
            </>
          </>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },

    {
      accessorKey: "duration",
      header: "Days",
      cell: ({ row }) => <div>{row.getValue("duration")}</div>,
    },

    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const isCurrentlyDeleting = deletingId === item.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                {isCurrentlyDeleting && isDeleting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-[50vh] overflow-y-auto rounded-[2px] border bg-popover p-1 shadow-md"
              sideOffset={8}
              alignOffset={4}
              collisionPadding={24}
              avoidCollisions={true}
              sticky="always"
            >
              <DropdownMenuLabel className=" bg-popover py-2 px-2 font-medium">
                Actions
              </DropdownMenuLabel>
              <div className="p-1">
                <Button variant="ghost" onClick={() => setViewingPackage(item)}>
                  View package
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onEditPackage(item.id)}
                >
                  Edit Package
                </Button>

                <Link
                  to={{
                    pathname: `/dashboard/gallery/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none w-full items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 border-b border-b-zinc-200 "
                >
                  <img
                    src={"/icons/packages/gallery.webp"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Gallery
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/attraction/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none w-full items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 border-b border-b-zinc-200 "
                >
                  <img
                    src={"/icons/packages/attractions.webp"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Trip attractions
                </Link>

                <Link
                  to={{
                    pathname: `/dashboard/inclusion/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className=" flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 border-y border-b-zinc-200 "
                >
                  <img
                    src={"/icons/packages/costincludes.webp"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Cost includes
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/exclusion/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 border-b border-b-zinc-200 "
                >
                  <img
                    src={"/icons/packages/costexcludes.webp"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Cost excludes
                </Link>

                <Link
                  to={{
                    pathname: `/dashboard/dateandpricing/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className=" flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 border-b border-b-zinc-200 "
                >
                  <img
                    src={"/icons/packages/fixed.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Date and Price
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/pax/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className=" flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 border-b border-b-zinc-200 "
                >
                  <img
                    src={"/icons/packages/group.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Pax
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/Itinerary/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 border-b border-b-zinc-200 "
                >
                  <img
                    src={"/icons/packages/travel.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Iternaries
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/faq/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className=" flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 border-b border-b-zinc-200 "
                >
                  <img
                    src={"/icons/packages/faq.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Faq
                </Link>

                <Link
                  to={{
                    pathname: `/dashboard/requirements/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 "
                >
                  <img
                    src={"/icons/packages/requirement.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Requirements
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/package-info/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 "
                >
                  <img
                    src={"/icons/packages/packageinfo.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Essential Info
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/video-review/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 "
                >
                  <img
                    src={"/icons/packages/videoreview.png"}
                    alt="video-review-icon"
                    width={15}
                    height={15}
                  />
                  Video Review
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/season-info/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 "
                >
                  <img
                    src={"/icons/packages/season.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Season Info
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/why-love/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 "
                >
                  <img
                    src={"/icons/packages/whylove.png"}
                    alt="why-love-icon"
                    width={15}
                    height={15}
                  />
                  Why Love This
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/important-notice/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 "
                >
                  <img
                    src={"/icons/packages/notice.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Important Notice
                </Link>
                <Link
                  to={{
                    pathname: `/dashboard/insurance/${item._id}`,
                    search: `?category=${item?.categoryId.name}&subcategory=${item?.subCategoryId?.name}&package=${item?.name}`,
                  }}
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 "
                >
                  <img
                    src={"/icons/packages/insurance.png"}
                    alt="subcategory-image"
                    width={15}
                    height={15}
                  />
                  Insurance
                </Link>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <span className=" flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500/90 gap-2 group">
                    <span className=" bg-red-600/10 group-hover:bg-red-600/20 p-1 rounded-full">
                      <Icon
                        icon="ic:baseline-delete"
                        width="16"
                        height="16"
                        className="text-red-500"
                      />
                    </span>{" "}
                    Delete Item
                  </span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your data and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className=" bg-red-500/90 hover:bg-red-500"
                      onClick={() => deletePackage(item._id)}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const links = [
    { to: "/dashboard", label: "Search" },

    {
      to: "dashboard/category/",
      label: query,
    },
  ];

  if (isLoading) {
    return <TableShimmer />;
  }

  return (
    <div className="w-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Breadcumb links={links} />
      </div>

      <DataTable
        data={collection || []}
        columns={columns}
        filterColumn="name"
        filterPlaceholder="Search packages..."
        pagination={{
          itemsPerPage: pagination.limit,
          currentPage: response?.pagination?.currentPage || 1,
          totalItems: response?.pagination?.total || 0,
          totalPages: response?.pagination?.totalPages || 1,
          onPageChange: (page) => {
            setPagination((prev) => ({
              ...prev,
              page: page + 1, // Convert back to 1-based for API
            }));
          },
          onItemsPerPageChange: (itemsPerPage) => {
            setPagination({
              page: 1, // Reset to first page when changing items per page
              limit: itemsPerPage,
            });
          },
          showItemsPerPage: true,
          showPageInput: true,
          showPageInfo: true,
        }}
      />

      <PackageViewModal
        isOpen={!!viewingPackage}
        onClose={() => setViewingPackage(null)}
        packageData={viewingPackage}
      />
    </div>
  );
}

function EditPackagePage({
  packageId,
  subcategoryId,
  onCancel,
}: {
  packageId: string;
  subcategoryId: string;
  onCancel: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [routeMapFile, setRouteMapFile] = useState<File | null>(null);
  const [previewCoverImage, setPreviewCoverImage] = useState<string>("");
  const [previewRouteMap, setPreviewRouteMap] = useState<string>("");

  const { mutateAsync: updatePackage } = useUpdatePackage(packageId);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subCategoryId: subcategoryId || "",
      name: "",
      overview: "",
      elevation: 0,
      distance: 0,
      slug: "",
      location: "",
      duration: "",
      addToHome: false,
      sortOrder: 0,
      isPopular: false,
      activity: "",
      groupSize: "",
      vehicle: "",
      difficulty: "",
      accommodation: "",
      meal: "",
    },
  });

  // Generate slug from name
  useEffect(() => {
    const name = form.watch("name");
    if (name) {
      form.setValue("slug", slugify(name));
    }
  }, [form.watch("name")]);

  // File upload handlers
  const handleFileUpload = (
    file: File,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileUpload(
      file as File,
      setCoverImageFile as React.Dispatch<React.SetStateAction<File | null>>,
      setPreviewCoverImage
    );
  };

  const handleRouteMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileUpload(
      file as File,
      setRouteMapFile as React.Dispatch<React.SetStateAction<File | null>>,
      setPreviewRouteMap
    );
  };

  // Form submission
  const onSubmit = async (values: any) => {
    setIsCreating(true);
    try {
      const formData = new FormData();

      // Add all form values to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle array fields
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          }
          // Handle file fields (they will be added separately)
          else if (key === "coverImage" || key === "routeMap") {
            // Skip, will be handled separately
          }
          // Handle boolean values
          else if (typeof value === "boolean") {
            formData.append(key, value ? "true" : "false");
          }
          // Handle other fields
          else {
            formData.append(key, String(value));
          }
        }
      });

      // Add files
      if (coverImageFile) formData.append("coverImage", coverImageFile);
      if (routeMapFile) formData.append("routeMap", routeMapFile);

      await updatePackage(formData, {
        onSuccess: () => {
          toast.success("Package updated successfully");
          onCancel();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update package");
        },
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update package");
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form and state
  const resetForm = () => {
    form.reset();
    setCoverImageFile(null);
    setRouteMapFile(null);
    setPreviewCoverImage("");
    setPreviewRouteMap("");
    onCancel();
  };

  // Component for file upload UI
  const FileUploadField = ({ preview, handleUpload, id, label }: any) => (
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-sm p-4">
      {preview ? (
        <img
          src={preview}
          alt={`${label} preview`}
          className="h-48 w-full object-cover rounded-[2px] mb-2"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-48 w-full">
          <span className="text-sm text-muted-foreground mb-2">
            Click to upload or drag and drop
          </span>
        </div>
      )}
      <Input type="file" onChange={handleUpload} className="hidden" id={id} />
      <Button
        type="button"
        variant="outline"
        className="mt-2"
        onClick={() => document.getElementById(id)?.click()}
      >
        Upload {label}
      </Button>
    </div>
  );

  const fetchPackage = async () => {
    try {
      const { data } = await api.get(`/package/${packageId}`);
      const packageData = data.data;

      const subCategoryIdValue =
        typeof packageData.subCategoryId === "object"
          ? packageData.subCategoryId?._id
          : subcategoryId;
      // Set form values
      form.reset({
        ...packageData,
        subCategoryId: subCategoryIdValue,
        elevation: Number(packageData.elevation) || 0,
        distance: Number(packageData.distance) || 0,
      });

      // Set image previews
      if (packageData.coverImage) {
        setPreviewCoverImage(packageData.coverImage);
      }
      if (packageData.routeMap) {
        setPreviewRouteMap(packageData.routeMap);
      }
    } catch (error) {
      toast.error("Failed to load package data");
    }
  };

  useEffect(() => {
    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  return (
    <div className="w-full flex flex-col">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Packages
        </Button>

        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          Edit Package
        </h2>
        <p className="text-muted-foreground">Update package details below</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-muted/70 p-4 rounded-[2px]">
            <h3 className="font-medium mb-4">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Everest Base Camp Trek"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Set Order</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Cover Image */}
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image *</FormLabel>
                <FormControl>
                  <FileUploadField
                    preview={previewCoverImage}
                    handleUpload={handleCoverImageUpload}
                    id="coverImage"
                    label="Image"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addToHome"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Add to home</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>is Popular</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Overview */}
          <FormField
            control={form.control}
            name="overview"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overview *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    initialContent={field.value || ""}
                    onChange={(content) => field.onChange(content)}
                    placeholder="Write package overview..."
                    className="h-64 pb-8"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Route Map */}
          <FormField
            control={form.control}
            name="routeMap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Route Map *</FormLabel>
                <FormControl>
                  <FileUploadField
                    preview={previewRouteMap}
                    handleUpload={handleRouteMapUpload}
                    id="routeMap"
                    label="Route Map"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Additional Information */}
          <div className="bg-muted/70 p-4 rounded-[2px]">
            <h3 className="font-medium mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="elevation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elevation (meters)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 5364"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (kilometers)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 130"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Trekking, Hiking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groupSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2-12 people" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Private Vehicle, Flight"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Moderate, Challenging"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accommodation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Hotel, Tea House, Camping"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Breakfast, Full Board"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4  bg-background z-10 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Package"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
