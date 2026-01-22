import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Info, Calendar, CheckCircle, XCircle } from "lucide-react";
import type { IFAQ } from "@/types/IFaq";

interface FAQViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    faqData: IFAQ | null;
}

export function FAQViewModal({
    isOpen,
    onClose,
    faqData,
}: FAQViewModalProps) {
    if (!faqData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Info className="h-6 w-6" />
                        {faqData.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={faqData.isActive ? "default" : "secondary"} className="flex items-center gap-1">
                            {faqData.isActive ? (
                                <>
                                    <CheckCircle className="h-3 w-3" />
                                    Active
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3 w-3" />
                                    Inactive
                                </>
                            )}
                        </Badge>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Description</h3>
                            <div
                                className="prose prose-sm max-w-none dark:prose-invert border rounded-lg p-4 bg-muted/30"
                                dangerouslySetInnerHTML={{ __html: faqData?.description?.content || "<p>No content available</p>" }}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Metadata */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">FAQ Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">Created:</span>{" "}
                                    {format(new Date(faqData.createdAt), "PPP 'at' pp")}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">Updated:</span>{" "}
                                    {format(new Date(faqData.updatedAt), "PPP 'at' pp")}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">Sort Order:</span>{" "}
                                    {faqData.sortOrder}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    <span className="font-medium">FAQ ID:</span>{" "}
                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{faqData.id}</code>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Keep backward compatibility
export { FAQViewModal as UsefulInfoViewModal };