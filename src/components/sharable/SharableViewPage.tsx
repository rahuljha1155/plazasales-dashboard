import { ArrowLeft, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ISharable {
    id: string;
    productId?: string;
    kind: string;
    title: string;
    fileType: string;
    isActive: boolean;
    sortOrder: number;
    extra: string;
    mediaAsset: {
        id: string;
        fileUrl: string;
        type: string;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface SharableViewPageProps {
    sharable: ISharable;
    onBack: () => void;
}

export default function SharableViewPage({ sharable, onBack }: SharableViewPageProps) {

    return (
        <div className="space-y-6">
            <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Sharable Details</span>
                        <Badge variant={sharable.isActive ? "default" : "secondary"}>
                            {sharable.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Media Asset */}
                    {sharable.mediaAsset?.fileUrl && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700">Media Asset</h3>
                            <div className="w-full max-w-md rounded-lg border overflow-hidden">
                                <img
                                    src={sharable.mediaAsset.fileUrl}
                                    alt={sharable.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Title</h3>
                        <p className="text-base">{sharable.title}</p>
                    </div>

                    {/* Kind */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Kind</h3>
                        <p className="text-base">{sharable.kind}</p>
                    </div>

                    {/* File Type */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">File Type</h3>
                        <p className="text-base">{sharable.fileType}</p>
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Sort Order</h3>
                        <p className="text-base">{sharable.sortOrder}</p>
                    </div>

                    {/* Extra Information */}
                    {sharable.extra && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700">Extra Information</h3>
                            <p className="text-base whitespace-pre-wrap">{sharable.extra}</p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="pt-4 border-t space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700">Metadata</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {sharable.productId && (
                                <div>
                                    <span className="text-gray-600">Product ID:</span>
                                    <p className="font-medium">{sharable.productId}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-600">Sharable ID:</span>
                                <p className="font-medium">{sharable.id}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Created:</span>
                                <p className="font-medium">
                                    {new Date(sharable.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-600">Updated:</span>
                                <p className="font-medium">
                                    {new Date(sharable.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
