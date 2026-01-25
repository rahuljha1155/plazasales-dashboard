import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "../ui/dropdown-menu";
import { Pencil, Trash2, Eye, Image as ImageIcon, Video, Download, Search, MoreVertical, Share2 } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { ColumnDef } from "@tanstack/react-table";
import type { IProduct } from "@/types/IProduct";
import { useSelectedDataStore } from "@/store/selectedStore";
import { useToggleProductPublished, useToggleProductPopular } from "@/services/product";

interface CreateProductsColumnsParams {
  navigate: (path: string) => void;
  params: {
    brandSlug?: string;
    categorySlug?: string;
    subcategorySlug?: string;
    [key: string]: any;
  };
  setDeleteId: (id: string) => void;
  isSudoAdmin: boolean;
}

export const createProductsColumns = ({
  navigate,
  params,
  setDeleteId,
  isSudoAdmin,
}: CreateProductsColumnsParams): ColumnDef<IProduct>[] => [
    {
      id: "select",
      header: ({ table }: { table: import('@tanstack/react-table').Table<any> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className={window.location.pathname.includes("/products/search") ? "mx-2 " : " "}
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
      header: "S.N.",
      cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
      accessorKey: "coverImage",
      header: "Image",
      cell: ({ row }) => row.original.coverImage ? (
        <img src={row.original.coverImage} alt={row.original.name} className="w-12 h-12 object-cover rounded" />
      ) : (
        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
          No image
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => row.original.model,
    },
    {
      accessorKey: "productType",
      header: "Product Type",
      cell: ({ row }) => row.original.productType,
    },
    {
      accessorKey: "brand.name",
      header: "Brand",
      cell: ({ row }) => row.original.brand?.name,
    },
    {
      accessorKey: "isPublished",
      header: "Published",
      cell: ({ row }) => {
        const product = row.original;
        const { mutate: togglePublished, isPending } = useToggleProductPublished();

        return (
          <Switch
            checked={product.isPublished}
            onCheckedChange={(checked) => {
              togglePublished({
                productId: product.id,
                isPublished: checked,
              });
            }}
            disabled={isPending}
          />
        );
      },
    },
    {
      accessorKey: "isPopular",
      header: "Popular",
      cell: ({ row }) => {
        const product = row.original;
        const { mutate: togglePopular, isPending } = useToggleProductPopular();

        return (
          <Switch
            checked={product.isPopular}
            onCheckedChange={(checked) => {
              togglePopular({
                productId: product.id,
                isPopular: checked,
              });
            }}
            disabled={isPending}
          />
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        const { setSelectedProduct } = useSelectedDataStore()
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" >
                <MoreVertical className="w-4 rotate-90 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSelectedProduct(product); navigate(`/dashboard/category/${params?.cid}/subcategory/${params?.id}/products/${params?.pid}/view/${product.id}`) }}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedProduct(product); navigate(`/dashboard/category/${params?.cid}/subcategory/${params?.id}/products/${params?.pid}/edit/${product.id}`) }}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSelectedProduct(product); navigate(`/dashboard/products/gallery/${product.id}`) }}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Gallery
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedProduct(product); navigate(`/dashboard/products/video/${product.id}`) }}>
                <Video className="w-4 h-4 mr-2" />
                Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedProduct(product); navigate(`/dashboard/products/downloads/${product.id}`) }}>
                <Download className="w-4 h-4 mr-2" />
                Downloads
              </DropdownMenuItem>
              {isSudoAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSelectedProduct(product); navigate(`/dashboard/products/${product.id}/seo?entityType=PRODUCT`) }}>
                    <Search className="w-4 h-4 mr-2" />
                    SEO Optimization
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSelectedProduct(product); navigate(`/dashboard/products/${product.id}/ads`) }}>
                <Icon icon="solar:widget-5-bold" className="w-4 h-4 mr-2" />
                Manage Ads
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSelectedProduct(product); setDeleteId(product.id) }} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
