import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandPerformance from "./BrandPerformance";

export default function BrandPerformancePage() {
    const { brandId } = useParams<{ brandId: string }>();
    const navigate = useNavigate();

    if (!brandId) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-red-500">Brand ID is required</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto  space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard/analytics")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Analytics
                </Button>
            </div>

            <BrandPerformance brandId={brandId} />
        </div>
    );
}
