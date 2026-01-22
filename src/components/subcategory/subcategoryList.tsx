import React, { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, ArrowRightIcon, Loader, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { useNavigate } from "react-router-dom";

import Breadcumb from "@/components/dashboard/Breadcumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Link, useParams } from "react-router-dom";
import {
  useDeletePackage,
  useUpdatePackage,
} from "@/hooks/usePackage.ts";
import PackageCreate from "./createSubcategory.tsx";
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
import { PackageViewModal } from "./subcategoryView.tsx";
import { DataTable } from "../ui/data-table.tsx";
import { useGetCategoryBySlug } from "@/services/category.ts";

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
  note: z.string().optional(),
  groupSize: z.string().optional(),
  vehicle: z.string().optional(),
  difficulty: z.string().optional(),
  accommodation: z.string().optional(),
  meal: z.string().optional(),
});

export default function PackageListPage() {
  const params = useParams();
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      params={params}
      onShowCreate={() => setShowCreateModal(true)}
      subcategoryId={params.id as string}
      categoryId={params.cid as string}
      onEditPackage={(id) => setEditingPackageId(id)}
    />
  );
}

function PackageListView({
  subcategoryId,
  categoryId,
  onEditPackage,
  onShowCreate,
  params
}: {
  subcategoryId: string;
  onEditPackage: (id: string) => void;
  categoryId: string;
  onShowCreate: () => void;
  params: any;
}) {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: categoryData, isLoading } = useGetCategoryBySlug(params.id as string);
  const [deletingId, setDeletingId] = useState<string>();
  const [viewingPackage, setViewingPackage] = useState<any | null>(null);

  const { mutateAsync: deletePackages, isPending: isDeleting } =
    useDeletePackage();

  const deletePackage = async (id: string) => {
    setDeletingId(id);

    try {
      await deletePackages(id);
      toast.success("Item deleted successfully");
      // Optionally refetch or update local state
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingId(undefined);
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
          className="ml-2"
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
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "coverImage",
      header: "Cover Image",
      cell: ({ row }) => {
        return (
          <>
            {subcategoryId === "collection_56tziod8za" ? (
              <></>
            ) : (
              <>
                <Avatar className="bg-gray-100  h-8 w-8 object-scale-down ">
                  <AvatarImage
                    src={row.original.coverImage}
                    alt="subcategory-image"
                  />
                  <AvatarFallback className="bg-gray-100  h-8 w-8 object-scale-down text-foreground/65 ">
                    NA
                  </AvatarFallback>
                </Avatar>
              </>
            )}
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
          className="px-0"
        >
          Name
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex gap-2 items-center cursor-pointer">
          <div className="font-semibold text-blue-600 hover:underline">{row.original.title}</div>
        </div>
      ),
    },

    {
      accessorKey: "View Content",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          View Content

        </Button>
      ),
      cell: ({ row }) => <Link
        to={`/dashboard/category/${params.id}/subcategory/${row.original.slug}/products/${row.original.slug}`}
      >
        <Button variant="outline" className="rounded-sm cursor-pointer h-6 text-xs">
          View Contents <ArrowRightIcon size={16} className="ml-1" />
        </Button>
      </Link>,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const isCurrentlyDeleting = deletingId === item.id;
        return (
          <div onClick={(e) => e.stopPropagation()}>
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
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setViewingPackage(item)}>
                  <Icon icon="solar:eye-bold" className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditPackage(item.id)}>
                  <Icon icon="solar:pen-bold" className="w-4 h-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>

                {isSudoAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(
                          `/dashboard/seo-metadata/create?entityType=SUBCATEGORY&entityId=${item.id}`
                        )
                      }
                    >
                      <Search className="h-4 w-4 mr-2" />
                      SEO Optimization
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/dashboard/subcategories/${item.id}/ads`)
                  }
                >
                  <Icon icon="solar:widget-5-bold" className="h-4 w-4 mr-2" />
                  Manage Ads
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-sm">
                      <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                      Delete Item
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                          <Icon
                            icon="solar:danger-bold"
                            className="text-red-600"
                            width="24"
                          />
                        </div>
                        <div>
                          <AlertDialogTitle className="text-lg">
                            Delete Item
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.title}
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        This action cannot be undone. This will permanently delete the
                        item and all associated data from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600 rounded-lg"
                        onClick={() => deletePackage(item.id)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                        Delete Item
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const links = [
    { to: "/dashboard/brands", label: "Brands" },
    {
      to: `/dashboard/category/${params.id}`,
      label: categoryData?.category?.brand?.name || "Product Type",
    },
    {
      to: `/dashboard/category/${params.id}/subcategory/${subcategoryId}`,
      label: categoryData?.category?.title || "Subcategories",
      isActive: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="border rounded-md">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Breadcumb links={links} />
        <Button onClick={() => onShowCreate()} type="button">
          Add Subcategory
        </Button>
      </div>


      <DataTable
        data={categoryData?.category?.subCategories || []}
        columns={columns.filter(col => col.id !== "View Content" && (col as any).accessorKey !== "View Content")}
        onRowClick={(row) => navigate(`/dashboard/category/${params.id}/subcategory/${row.slug}/products/${row.slug}`)}
        pagination={{
          totalItems: categoryData?.category?.subCategories?.length || 0,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: limit,
          onPageChange: (newPage) => setPage(newPage),
          onItemsPerPageChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          },
        }}
        filterColumn="title"
        filterPlaceholder="Search subcategories..."
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
      note: "",
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
                <FormLabel>Route Map  <span className="text-primary">(Aspect Ratio 16/9) 1920 × 1080 px</span></FormLabel>
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

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NOTE</FormLabel>
                <FormControl>
                  <RichTextEditor
                    initialContent={field.value || ""}
                    onChange={(content) => field.onChange(content)}
                    placeholder="Write package note..."
                    className="h-64 pb-8"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
