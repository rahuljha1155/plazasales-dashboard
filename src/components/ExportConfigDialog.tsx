import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { api2 } from "@/services/api";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ExportConfigDialogProps {
    isOpen: boolean;
    onClose: () => void;
    resource: "product" | "inquiry";
    exportFormat: "excel" | "pdf";
    title?: string;
}

const PRODUCT_FIELDS = [
    { label: "Name", value: "name" },
    { label: "Slug", value: "slug" },
    { label: "Brand", value: "brand" },
    { label: "Category", value: "category" },
    { label: "Technology", value: "technology" },
    { label: "Popular", value: "isPopular" },
    { label: "Published", value: "isPublished" },
];

const INQUIRY_FIELDS = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Message", value: "message" },
    { label: "Product", value: "product" },
    { label: "Created At", value: "createdAt" },
];

export function ExportConfigDialog({
    isOpen,
    onClose,
    resource,
    exportFormat,
    title = "Export Data",
}: ExportConfigDialogProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    const availableFields = resource === "product" ? PRODUCT_FIELDS : INQUIRY_FIELDS;

    // Set default fields when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFields(availableFields.map(f => f.value));
        }
    }, [isOpen, resource]);

    // Fetch preview data whenever page or limit changes
    useEffect(() => {
        if (isOpen) {
            fetchPreview();
        }
    }, [isOpen, page, limit]);

    const fetchPreview = async () => {
        setIsPreviewLoading(true);
        try {
            let endpoint = "";
            if (resource === "product") {
                endpoint = "/product/get-all-products";
            } else if (resource === "inquiry") {
                endpoint = "/inquiry/get-all-inquiries";
            }

            const res = await api2.get(endpoint, {
                params: { page, limit },
            });

            // Adjust based on typical API structure
            const data = res.data?.data?.[resource === "product" ? "products" : "inquiries"] || [];
            setPreviewData(data);
        } catch (error) {
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const endpoint = `/${resource}/export/${exportFormat}`;
            const res = await api2.get(endpoint, {
                params: {
                    page,
                    limit,
                    fields: selectedFields.join(',')
                },
                responseType: "blob",
            });

            const blob = new Blob([res.data], {
                type:
                    exportFormat === "excel"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "application/pdf",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${resource}_export_${new Date().toISOString().split("T")[0]}.${exportFormat === "excel" ? "xlsx" : "pdf"
                }`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`${exportFormat.toUpperCase()} exported successfully`);
            onClose();
        } catch (error) {
            toast.error(`Failed to export ${exportFormat.toUpperCase()}`);
        } finally {
            setIsExporting(false);
        }
    };

    const toggleField = (fieldValue: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldValue)
                ? prev.filter(f => f !== fieldValue)
                : [...prev, fieldValue]
        );
    };

    const getFieldValue = (item: any, fieldValue: string) => {
        switch (fieldValue) {
            case "brand":
                return item.brand?.name || "N/A";
            case "category":
                return item.subcategory?.name || "N/A";
            case "product":
                return item.product?.name || "N/A";
            case "technology":
                return item?.product?.technology || "N/A";
            case "createdAt":
                return item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A";
            case "isPopular":
            case "isPublished":
                return item[fieldValue] ? "Yes" : "No";
            default:
                return item[fieldValue] || "N/A";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-zinc-200/50 shadow-2xl glassmorphism">
                <div className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-8 pb-4 flex-none">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <div className="p-2 rounded-xl bg-zinc-100 shadow-inner">
                                {exportFormat === "excel" ? (
                                    <Icon icon={"vscode-icons:file-type-excel"} className="h-6 w-6" />
                                ) : (
                                    <Icon icon={"material-icon-theme:folder-pdf"} className="h-6 w-6" />
                                )}
                            </div>
                            {title}
                            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase border border-primary/20">
                                {exportFormat}
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
                        <div className="grid grid-cols-2 max-w-2xl gap-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="page">Page</Label>
                                <Input
                                    id="page"
                                    type="number"
                                    min={1}
                                    value={page}
                                    onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="limit">Limit</Label>
                                <Input
                                    id="limit"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={limit}
                                    onChange={(e) => setLimit(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>

                        <div className="py-2">
                            <Label className="mb-3 block text-sm font-semibold text-zinc-900">Selected Fields</Label>
                            <div className="flex flex-wrap gap-5 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                                {availableFields.map(field => (
                                    <div key={field.value} className="flex items-center space-x-2 ">
                                        <Checkbox
                                            id={field.value}
                                            checked={selectedFields.includes(field.value)}
                                            onCheckedChange={() => toggleField(field.value)}
                                        />
                                        <Label
                                            htmlFor={field.value}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {field.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-hidden border border-zinc-200/60  bg-white/50 backdrop-blur-sm mt-6 mb-4">
                            {isPreviewLoading ? (
                                <div className="flex h-[300px] items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <Table className="relative">
                                        <TableHeader className="bg-zinc-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-zinc-200/60">
                                            <TableRow className="hover:bg-transparent border-none">
                                                {resource === "product" && (
                                                    <TableHead className="w-[80px] font-bold text-zinc-900">Preview</TableHead>
                                                )}
                                                {availableFields
                                                    .filter(f => selectedFields.includes(f.value))
                                                    .map(field => (
                                                        <TableHead key={field.value} className="font-bold text-zinc-900 uppercase text-[11px] tracking-wider whitespace-nowrap px-4 py-4">
                                                            {field.label}
                                                        </TableHead>
                                                    ))
                                                }
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewData.length > 0 ? (
                                                previewData.map((item, idx) => (
                                                    <TableRow key={item.id || idx} className="group hover:bg-zinc-50/50 transition-colors duration-200 border-zinc-100">
                                                        {resource === "product" && (
                                                            <TableCell className="p-3">
                                                                <div className="relative h-12 w-12 rounded-lg overflow-hidden shadow-sm border border-zinc-200 group-hover:shadow-md transition-shadow duration-200 bg-white">
                                                                    <img
                                                                        src={item.coverImage || "/placeholder.png"}
                                                                        alt=""
                                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                        {availableFields
                                                            .filter(f => selectedFields.includes(f.value))
                                                            .map(field => (
                                                                <TableCell key={field.value} className={`px-4 py-4 text-sm text-zinc-600 ${field.value === 'name' ? 'font-semibold text-zinc-900' : ''}`}>
                                                                    {getFieldValue(item, field.value)}
                                                                </TableCell>
                                                            ))
                                                        }
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={selectedFields.length + (resource === "product" ? 1 : 0)}
                                                        className="h-24 text-center text-muted-foreground"
                                                    >
                                                        No data found for the selected page and limit.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-4 border-t border-zinc-100 bg-zinc-50/30 flex-none">
                        <Button variant="outline" onClick={onClose} disabled={isExporting} className="rounded-lg px-6">
                            Cancel
                        </Button>
                        <Button onClick={handleExport} disabled={isExporting || previewData.length === 0} className="rounded-lg px-6 shadow-lg shadow-primary/20">
                            {isExporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                "Download Export"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
