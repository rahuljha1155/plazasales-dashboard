import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchLoginStats } from "@/services/trackLoign";

interface LoginData {
    total: number;
    success: number;
    failed: number;
    recent: Array<{
        _id: string;
        email: string;
        status: "success" | "failed";
        timestamp: string;
        userAgent: string;
        ip: string;
    }>;
}

interface LoginNotificationBellProps {
    onClick?: () => void;
    showFailedOnly?: boolean;
}

function LoginNotificationBell({ onClick, showFailedOnly = true }: LoginNotificationBellProps) {
    const [loginData, setLoginData] = useState<LoginData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchLogin = async () => {
        try {
            setLoading(true);
            const response = await fetchLoginStats();
            if (response?.data?.records) {
                setLoginData(response.data.records);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogin();

        // Refresh data every 2 minutes for real-time monitoring
        const interval = setInterval(fetchLogin, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate recent failed attempts (last 24 hours)
    const recentFailedCount = loginData?.recent?.filter(
        (login) => login.status === "failed" &&
            new Date(login.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length || 0;

    // Calculate recent activity count (all logins in last hour)
    const recentActivityCount = loginData?.recent?.filter(
        (login) => new Date(login.timestamp).getTime() > Date.now() - 60 * 60 * 1000
    ).length || 0;

    const notificationCount = showFailedOnly ? recentFailedCount : recentActivityCount;
    const hasFailedAttempts = recentFailedCount > 0;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={`relative rounded-full bg-zinc-50 hover:bg-zinc-50 cursor-pointer border hover:border-orange-500 ${hasFailedAttempts ? 'border-red-200 bg-red-50 hover:bg-red-100' : ''
                }`}
            title={`Login Activity: ${hasFailedAttempts ? `${recentFailedCount} failed attempts` : 'All systems secure'}`}
        >
            {hasFailedAttempts ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
                <Shield className="h-5 w-5 text-green-500" />
            )}

            {notificationCount > 0 && (
                <Badge className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs ${hasFailedAttempts
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                    }`}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
            )}
        </Button>
    );
}

export default LoginNotificationBell;
