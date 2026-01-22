import { useEffect, useState } from "react";
import { fetchRecentUserAnalytics, type UserAnalyticsRecord } from "@/services/analytics";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Globe, Monitor, MapPin } from "lucide-react";

function UserAnalytics() {
    const [records, setRecords] = useState<UserAnalyticsRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetchRecentUserAnalytics();
                if (response?.data?.data?.records) {
                    setRecords(response.data.data.records);
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch analytics");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-sm text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent User Activity</h2>

            <div className="grid gap-4">
                {records.map((record) => (
                    <div
                        key={record.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">
                                        {record.country}
                                        {record.city && `, ${record.city}`}
                                        {record.region && ` (${record.region})`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Monitor className="h-4 w-4" />
                                    <span>{record.os} • {record.browser}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    <span>{record.ip}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-primary">
                                    {formatDistanceToNow(parseISO(record.createdAt), {
                                        addSuffix: true,
                                    })}
                                </p>
                                {record.userId && (
                                    <p className="text-xs text-green-600 mt-1">Authenticated</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserAnalytics;
