import { useGetAdAnalytics } from "@/services/ads";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MousePointerClick, Eye, Activity } from "lucide-react";
import { format } from "date-fns";

interface AdAnalyticsModalProps {
    adId: string;
    adTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AdAnalyticsModal({
    adId,
    adTitle,
    open,
    onOpenChange,
}: AdAnalyticsModalProps) {
    const { data, isLoading } = useGetAdAnalytics(adId);

    const analytics = data?.data;

    const getIndicatorColor = (indicator?: string) => {
        switch (indicator) {
            case "high":
                return "rounded-sm p-0 m-0 bg-transparent text-green-500";
            case "medium":
                return "rounded-sm p-0 m-0 bg-transparent text-yellow-500";
            case "low":
                return "rounded-sm p-0 m-0 bg-transparent text-red-500";
            default:
                return "rounded-sm p-0 m-0 bg-transparent text-gray-500";
        }
    };

    const getIndicatorLabel = (indicator?: string) => {
        switch (indicator) {
            case "high":
                return "High Performance";
            case "medium":
                return "Medium Performance";
            case "low":
                return "Low Performance";
            default:
                return "Unknown";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Ad Analytics</DialogTitle>
                    <DialogDescription>{adTitle}</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
                        ))}
                    </div>
                ) : analytics ? (
                    <div className="mt-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Badge className={getIndicatorColor(analytics.indicator)}>
                                    {getIndicatorLabel(analytics.indicator)}
                                </Badge>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 mt-4 md:grid-cols-3 gap-2">
                            <Card className="bg-muted/80  ">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0  pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Impressions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-0 mb-0 ">
                                    <div className="text-2xl font-bold">
                                        {analytics.impressions.toLocaleString()}
                                    </div>

                                </CardContent>
                            </Card>

                            <Card className="bg-muted/80 ">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Clicks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {analytics.clicks.toLocaleString()}
                                    </div>

                                </CardContent>
                            </Card>

                            <Card className="bg-muted/80 ">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        CTR
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {(analytics.ctr * 100).toFixed(2)}%
                                    </div>

                                </CardContent>
                            </Card>
                        </div>

                        <Card className="gap-0">
                            <CardHeader className="pb-1 px-0">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Performance Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 px-0 mt-0 pt-0">
                                <div className="flex justify-start gap-3 text-sm">
                                    <span className="text-muted-foreground">Engagement Rate:</span>
                                    <span className="font-medium">
                                        {analytics.clicks > 0
                                            ? `${((analytics.clicks / analytics.impressions) * 100).toFixed(2)}%`
                                            : "0%"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No analytics data available
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
