import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRightIcon, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSelectionStore } from "@/store/selectionStore";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Brand } from "./types";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { useSelectedDataStore } from "@/store/selectedStore";


interface BrandTableColumnsProps {
  onEdit: (brand: Brand) => void;
  onView: (brand: Brand) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
}

export const createBrandColumns = ({
  onEdit,
  onView,
  onDelete,
  isDeletePending,
}: BrandTableColumnsProps): ColumnDef<Brand>[] => [
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
      header: () => (
        <div className="text-start font-semibold text-gray-700">No.</div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-600">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "logoUrl",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Logo
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center px-2">
          <div className="h-12 w-14 rounded-sm    p-1.5  overflow-hidden">
            <img
              src={row.original.logoUrl || ""}
              alt={row.original.name}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold text-gray-700 hover:text-gray-900"
        >
          Brand Name
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="px-4 flex gap-2 items-center cursor-pointer">
          <div className="font-semibold ">{row.original.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "isAuthorizedDistributor",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold  text-gray-700 hover:text-gray-900"
        >
          Authorization
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex  items-center gap-3 px-4">
          {row.original.isAuthorizedDistributor ? (
            <span className="text-green-600 font-medium flex gap-2 items-center"><Icon icon={"garden:check-badge-fill-12"} /> Authorized</span>
          ) : (
            <span className="text-red-600 font-medium flex gap-2 items-center"><Icon icon={"mdi:cross-circle"} /> Unauthorized</span>
          )}
        </div>
      ),
    },
    {
      id: "contents",
      header: () => (
        <div className="font-semibold text-gray-700">Quick Actions</div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const { setSelectedBrand } = useSelectedDataStore()
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/dashboard/category/${row.original.slug}`}
              onClick={() => {
                setSelectedBrand(row.original);
              }}
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm text-neutral-500 hover:bg-primary hover:text-white cursor-pointer hover:border-primary transition-colors"
              >
                <Icon icon="solar:eye-bold" className="mr-1.5" width="16" />
                View Product Type
              </Button>
            </Link>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="font-semibold text-gray-700">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const brand = row.original;
        const navigate = useNavigate();
        const { user } = useUserStore();
        const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>


            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                >
                  <Icon
                    icon="solar:menu-dots-bold"
                    width="18"
                    height="18"
                    className="text-gray-500"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isSudoAdmin && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        useSelectionStore.getState().setSelection({
                          brandId: brand.id,
                          categoryId: null,
                          subcategoryId: null,
                        });
                        navigate(`/dashboard/brands/${brand.id}/seo`);
                      }}
                      className="flex gap-2 items-center"
                    >
                      <Icon icon="solar:magnifer-bold" className=" text-gray-500" width="16" />
                      SEO Optimization
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}


                <DropdownMenuItem
                  onClick={() => {
                    useSelectionStore.getState().setSelection({
                      brandId: brand.id,
                      categoryId: null,
                      subcategoryId: null,
                    });
                    navigate(`/dashboard/brands/${brand.id}/ads`);
                  }}
                  className="flex gap-2 items-center"
                >
                  <Icon icon="solar:widget-5-bold" className=" text-gray-500" width="16" />
                  Manage Ads
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onView(brand)}>
                  <Icon
                    icon="solar:eye-bold"
                    width="18"
                    height="18"
                    className="text-gray-500 hover:text-blue-600"
                  />

                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex gap-2 items-center" onClick={() => onEdit(brand)}>
                  <Icon
                    icon="solar:pen-bold"
                    width="18"
                    height="18"
                    className="text-gray-500 hover:text-orange-600"
                  />
                  Edit Details
                </DropdownMenuItem>


                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-sm">
                      <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                      Delete Brand
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
                            Delete Brand
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {brand.name}
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        This action cannot be undone. This will permanently delete the
                        brand and all associated data from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600 rounded-lg"
                        onClick={() => onDelete(brand.id)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                        Delete Brand
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
