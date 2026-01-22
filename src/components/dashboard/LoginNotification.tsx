import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Shield, MapPin, Monitor, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fetchLoginStats, } from "@/services/trackLoign";
import { Icon } from "@iconify/react/dist/iconify.js";

function LoginNotification() {
    const [loginData, setLoginData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchLogin = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const response = await fetchLoginStats();
            if (response?.data) {
                setLoginData(response.data.records as any);
                setError(null);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error: any) {
            setError(error.message || "Failed to fetch login statistics");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        try {
            return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
        } catch {
            return dateString;
        }
    };

    useEffect(() => {
        fetchLogin();

        // Refresh data every 5 minutes
        const interval = setInterval(fetchLogin, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);



    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full bg-zinc-50 hover:bg-zinc-100 border  cursor-pointer  hover:border-orange-500 transition-all duration-200"
                >
                    <Shield className="h-5 w-5 text-zinc-400 hover:text-primary transition-colors" />
                    {loginData && loginData.length > 0 && (
                        <Badge className="absolute -top-1 -right-1 size-6 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white animate-pulse hover:bg-primary border-2 border-white">
                            {loginData.length > 9 ? "9+" : loginData.length}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[420px]" align="end">
                <div className="p-4 border-b ">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                Login Activity
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Recent visitor sessions
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fetchLogin(true)}
                            disabled={isRefreshing}
                            className="h-8 w-8 rounded-full hover:bg-white"
                        >
                            <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
                        <p className="text-sm text-gray-500">Loading activity...</p>
                    </div>
                ) : error || !loginData ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-2">
                        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-sm font-medium text-red-600">Failed to load data</p>
                        <p className="text-xs text-gray-500">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchLogin()}
                            className="mt-2"
                        >
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="h-[380px]">
                            <div className="p-2">
                                {loginData && loginData.length > 0 ? (
                                    <div className="space-y-1">
                                        {loginData.slice(0, 10).map((login, index) => (
                                            <DropdownMenuItem
                                                key={login?._id}
                                                className="flex items-center gap-3 p-3  cursor-pointer transition-all hover:bg-muted "
                                            >
                                                <div className="mt-1 h-10 w-10 xl:size-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                    <Icon icon={"noto:desktop-computer"} className="h-5 w-5 text-zinc-500" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <div className="space-y-1 flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {login?.country || "Unknown Country"}
                                                            </p>

                                                            {login?.browser && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-[10px]  py-0 h-5">
                                                                        {login.browser}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <p className="text-xs font-medium text-zinc-800 whitespace-nowrap">
                                                                {formatTimeAgo(login?.createdAt)}
                                                            </p>

                                                        </div>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                                        <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                            <Clock className="h-8 w-8 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">No recent activity</p>
                                        <p className="text-xs text-gray-400 mt-1">Visitor sessions will appear here</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>


                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default LoginNotification;
