import { useCallback } from "react";
import { cache } from "@/lib/cache";

/**
 * Hook for managing cache operations
 */
export function useCache() {
    const clearCache = useCallback((key?: string) => {
        if (key) {
            cache.clear(key);
        } else {
            cache.clearAll();
        }
    }, []);

    const clearAnalyticsCache = useCallback(() => {
        const keys = cache.keys();
        const analyticsKeys = keys.filter((key) => key.startsWith("analytics:"));
        analyticsKeys.forEach((key) => cache.clear(key));
    }, []);

    const clearDashboardCache = useCallback(() => {
        const keys = cache.keys();
        const dashboardKeys = keys.filter((key) => key.startsWith("dashboard:"));
        dashboardKeys.forEach((key) => cache.clear(key));
    }, []);

    const getCacheInfo = useCallback(() => {
        const keys = cache.keys();
        return {
            totalKeys: keys.length,
            keys,
            analyticsKeys: keys.filter((k) => k.startsWith("analytics:")),
            dashboardKeys: keys.filter((k) => k.startsWith("dashboard:")),
        };
    }, []);

    return {
        clearCache,
        clearAnalyticsCache,
        clearDashboardCache,
        getCacheInfo,
    };
}
