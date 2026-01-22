import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, User, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fetchLoginStats, type LoginStatsData } from "@/services/trackLoign";


function Notification() {
  const [loginData, setLoginData] = useState<LoginStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  };

  const fetchLogin = async () => {
    try {
      setLoading(true);
      const response = await fetchLoginStats();
      if (response?.data) {
        setLoginData(response?.data?.records);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch login statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogin();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !loginData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40 text-destructive">
          {error || "Failed to load login statistics"}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Login Activity</CardTitle>
        <CardDescription>
          Overview of recent login attempts and statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-x-6 flex flex-col md:flex-row justify-between">
        {/* Summary Cards */}
        <div className="flex flex-col w-full gap-2">
          <div className="p-4 bg-gradient-to-b from-white/50 to-white/80 rounded-sm overflow-hidden border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{loginData.total}</p>
          </div>
          <div className=" p-4 bg-gradient-to-b from-white/50 to-white/80 rounded-sm overflow-hidden border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Success
              </p>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">
              {loginData.success}
            </p>
          </div>
          <div className=" p-4 bg-gradient-to-b from-white/50 to-white/80 rounded-sm overflow-hidden border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Failed
              </p>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive">
              {loginData.failed}
            </p>
          </div>
        </div>

        <div className="w-full p-6 bg-gradient-to-b from-white/30 to-white/50 rounded-sm overflow-hidden border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Activity
            </h3>
          </div>

          <ScrollArea className="h-[320px]">
            <div className="space-y-2 mb-44">
              {loginData.recent.length > 0 ? (
                loginData.recent.map((login) => (
                  <div
                    key={login._id}
                    className={`flex items-start gap-4 p-4 rounded-sm transition bg-gradient-to-b from-white/50 to-white/80 border 
                  ${login.status === "success"
                        ? "border-gray-200"
                        : "border-red-400 bg-red-50"
                      }`}
                  >
                    <div className="mt-1">
                      {login.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start bg-gradient-to-b from-white/50 to-white/80">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {login.email}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {getBrowserInfo(login.userAgent)} · {login.ip}
                          </p>
                        </div>
                        <p className="text-xs text-primary whitespace-nowrap">
                          {formatDistanceToNow(parseISO(login.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Clock className="h-6 w-6 mb-2" />
                  <p className="text-sm">No recent login activity</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default Notification;
