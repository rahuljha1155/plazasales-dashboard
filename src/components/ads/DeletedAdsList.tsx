import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDeletedAds } from "@/hooks/useAds";
import { Button } from "@/components/ui/button";
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
import { Icon } from "@iconify/react/dist/iconify.js";
import Breadcrumb from "../dashboard/Breadcumb";
import { DataTable } from "@/components/ui/data-table";
import { createDeletedAdsColumns } from "./DeletedAdsTableColumns";

export default function DeletedAdsList() {
    const [searchParams, setSearchParams] = useSearchParams();

    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    const [page, setPage] = useState(pageFromUrl);
    const [limit] = useState(10);
    const [actionIds, setActionIds] = useState<string[]>([]);
    const [actionType, setActionType] = useState<"recover" | "destroy" | null>(null);
    const [selectedAds, setSelectedAds] = useState<string[]>([]);

    const {
        ads,
        total,
        totalPages,
        isLoading,
        recoverAds,
        destroyAds,
        isRecovering,
        isDestroying,
        invalidateDeletedAds,
    } = useDeletedAds(page, limit);

    useEffect(() => {
        const urlPage = parseInt(searchParams.get("page") || "1", 10);
        if (urlPage !== page) {
            setPage(urlPage);
        }
    }, [searchParams]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams({ page: newPage.toString() });
    };

    const handleAction = async () => {
        if (actionIds.length === 0 || !actionType) return;

        try {
            if (actionType === "recover") {
                await recoverAds(actionIds.join(","));
            } else if (actionType === "destroy") {
                await destroyAds(actionIds.join(","));
            }
            setActionIds([]);
            setActionType(null);
            setSelectedAds([]);
            invalidateDeletedAds();
        } catch (error) {
        }
    };

    const handleBulkAction = (type: "recover" | "destroy") => {
        if (selectedAds.length > 0) {
            setActionIds(selectedAds);
            setActionType(type);
        }
    };

    const columns = createDeletedAdsColumns({
        onRecover: (ids) => {
            setActionIds(ids);
            setActionType("recover");
        },
        onDestroy: (id) => {
            setActionIds([id]);
            setActionType("destroy");
        },
        isRecoverPending: isRecovering,
        isDestroyPending: isDestroying,
        selectedIds: selectedAds,
        onSelectionChange: setSelectedAds,
    });

    return (
        <div className="space-y-6">

            <Breadcrumb links={[
                {
                    label: "Ads",
                    href: "/dashboard/ads",
                },
                {
                    label: "Deleted Ads",
                    href: "#",
                    isActive: true
                },
            ]} />

            <div className="bg-white ">
                <DataTable
                    columns={columns}
                    data={ads || []}
                    filterColumn="title"
                    filterPlaceholder="Search ads..."
                    pagination={{
                        itemsPerPage: limit,
                        currentPage: page,
                        totalItems: total,
                        totalPages: totalPages,
                        onPageChange: handlePageChange,
                        showItemsPerPage: false,
                        showPageInput: true,
                        showPageInfo: true,
                    }}
                    elements={
                        <div className="flex gap-2">
                            {selectedAds.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleBulkAction("recover")}
                                        className="rounded-sm border-green-500 text-green-600 hover:bg-green-50"
                                        disabled={isRecovering}
                                    >
                                        <Icon icon="solar:restart-bold" className="mr-2" width="16" />
                                        Recover Selected ({selectedAds.length})
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleBulkAction("destroy")}
                                        className="rounded-sm"
                                        disabled={isDestroying}
                                    >
                                        <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                                        delete ({selectedAds.length})
                                    </Button>
                                </>
                            )}
                        </div>
                    }
                />
            </div>

            <AlertDialog
                open={actionIds.length > 0 && actionType !== null}
                onOpenChange={() => {
                    setActionIds([]);
                    setActionType(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionType === "recover" ? "Recover Ads?" : "delete Permanently?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionType === "recover"
                                ? `This will restore ${actionIds.length} ad(s) to the active list.`
                                : `This action cannot be undone. This will permanently delete ${actionIds.length} ad(s).`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAction}
                            className={
                                actionType === "recover"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-red-500 hover:bg-red-600"
                            }
                            disabled={isRecovering || isDestroying}
                        >
                            {isRecovering || isDestroying
                                ? "Processing..."
                                : actionType === "recover"
                                    ? "Recover"
                                    : "Delete Permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
