import { useState } from "react";
import { useCache } from "@/hooks/useCache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trash2, Database } from "lucide-react";

export default function CacheStatus() {
    const { clearCache, clearAnalyticsCache, clearDashboardCache, getCacheInfo } = useCache();
    const [cacheInfo, setCacheInfo] = useState(getCacheInfo());

    const refreshInfo = () => {
        setCacheInfo(getCacheInfo());
    };

    const handleClearAll = () => {
        clearCache();
        refreshInfo();
    };

    const handleClearAnalytics = () => {
        clearAnalyticsCache();
        refreshInfo();
    };

    const handleClearDashboard = () => {
        clearDashboardCache();
        refreshInfo();
    };

    return (
        <Card className="bg-muted/50 rounded-2xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Cache Status
                        </CardTitle>
                        <CardDescription>Monitor and manage cached data</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={refreshInfo}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Cached Items</p>
                        <p className="text-2xl font-bold text-orange-600">{cacheInfo.totalKeys}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Analytics Cache</p>
                        <p className="text-2xl font-bold text-blue-600">{cacheInfo.analyticsKeys.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Dashboard Cache</p>
                        <p className="text-2xl font-bold text-green-600">{cacheInfo.dashboardKeys.length}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Cached Keys</h4>
                    <div className="flex flex-wrap gap-2">
                        {cacheInfo.keys.length > 0 ? (
                            cacheInfo.keys.map((key) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                    {key}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No cached data</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={cacheInfo.totalKeys === 0}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Cache
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAnalytics}
                        disabled={cacheInfo.analyticsKeys.length === 0}
                    >
                        Clear Analytics
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearDashboard}
                        disabled={cacheInfo.dashboardKeys.length === 0}
                    >
                        Clear Dashboard
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
