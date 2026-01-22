import { useGetNewsletterAnalytics, useGetRecentSubscribers } from "@/services/newsletter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
} from "recharts";
import { Link } from "react-router-dom";

export default function NewsletterAnalytics() {
    const { data: analytics, isLoading } = useGetNewsletterAnalytics();
    const { data: recent } = useGetRecentSubscribers();

    const total = analytics?.data?.total || 0;
    const active = analytics?.data?.active || 0;
    const unsubscribed = analytics?.data?.unsubscribed || 0;
    const deleted = analytics?.data?.deleted || 0;

    const overviewData = [
        { name: "Total", value: total, fill: "#BF092F" },
        { name: "Active", value: active, fill: "#132440" },
        { name: "Unsubscribed", value: unsubscribed, fill: "#16476A" },
        { name: "Deleted", value: deleted, fill: "#3B9797" },
    ];

    const subscriberData = [
        { name: "Active", value: active, fill: "#132440" },
        { name: "Inactive", value: unsubscribed + deleted, fill: "#16476A" },
    ];

    const activeRate = total > 0 ? ((active / total) * 100).toFixed(2) : "0.00";
    const unsubscribeRate = total > 0 ? ((unsubscribed / total) * 100).toFixed(2) : "0.00";

    // Recent subscribers timeline data
    const recentSubscribersData = (recent?.data?.records || []).slice(0, 10).reverse().map((sub, index) => ({
        date: new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: index + 1,
    }));

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="">
                        <CardHeader className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <Link to={"/dashboard/newsletter"}>
                    <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
                        <div className="flex flex-col">
                            <div className="flex justify-between space-x-8">
                                <div className="w-full">
                                    <div className="uppercase text-sm text-zinc-700 font-semibold">
                                        Total Subscribers
                                    </div>
                                    <div className="mt-3 w-full">
                                        <div className="flex space-x-2 w-full justify-between items-center">
                                            <div className="text-2xl text-green-500 font-semibold">
                                                {total} <span className="text-base">Users</span>
                                            </div>
                                            <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                                                <Icon icon={"streamline:graph-arrow-increase"} /> 100%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to={"/dashboard/newsletter"}>
                    <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
                        <div className="flex flex-col">
                            <div className="flex justify-between space-x-8">
                                <div className="w-full">
                                    <div className="uppercase text-sm text-zinc-700 font-semibold">
                                        Active Subscribers
                                    </div>
                                    <div className="mt-3 w-full">
                                        <div className="flex space-x-2 w-full justify-between items-center">
                                            <div className="text-2xl text-green-500 font-semibold">
                                                {activeRate}%
                                            </div>
                                            <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                                                <Icon icon={"mdi:check-circle"} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to={"/dashboard/newsletter"}>
                    <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
                        <div className="flex flex-col">
                            <div className="flex justify-between space-x-8">
                                <div className="w-full">
                                    <div className="uppercase text-sm text-zinc-700 font-semibold">
                                        Unsubscribe Rate
                                    </div>
                                    <div className="mt-3 w-full">
                                        <div className="flex space-x-2 w-full justify-between items-center">
                                            <div className="text-2xl text-orange-500 font-semibold">
                                                {unsubscribeRate}%
                                            </div>
                                            <div className="flex gap-2 items-center text-orange-800 bg-orange-200 rounded-xs px-4 p-1">
                                                <Icon icon={"mdi:account-remove"} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to={"/dashboard/newsletter"}>
                    <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
                        <div className="flex flex-col">
                            <div className="flex justify-between space-x-8">
                                <div className="w-full">
                                    <div className="uppercase text-sm text-zinc-700 font-semibold">
                                        Deleted
                                    </div>
                                    <div className="mt-3 w-full">
                                        <div className="flex space-x-2 w-full justify-between items-center">
                                            <div className="text-2xl text-red-500 font-semibold">
                                                {deleted}
                                            </div>
                                            <div className="flex gap-2 items-center text-red-800 bg-red-200 rounded-xs px-4 p-1">
                                                <Icon icon={"mdi:delete"} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Pie Chart */}
                <Card className="bg-muted/50 rounded-xl">
                    <CardHeader className="gap-0">
                        <CardTitle className="text-xl font-semibold">Subscriber Overview Distribution</CardTitle>
                        <CardDescription>Visual breakdown of subscriber statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={overviewData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {overviewData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Bar Chart - Subscriber Stats */}
                <Card className="bg-muted/50 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Subscriber Statistics Comparison</CardTitle>
                        <CardDescription>Compare different subscriber metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={overviewData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#BF092F" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Active vs Inactive */}
                <Card className="bg-muted/50 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Active vs Inactive Subscribers</CardTitle>
                        <CardDescription>Distribution of subscriber engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={subscriberData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {subscriberData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Growth Timeline */}
                <Card className="bg-muted/50 rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Recent Subscriber Growth</CardTitle>
                        <CardDescription>Timeline of new subscriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={recentSubscribersData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="count" stroke="#132440" fill="#132440" name="Cumulative Subscribers" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Subscribers Table */}
            <Card className="bg-muted/50 rounded-xl">
                <CardHeader>
                    <CardTitle className="font-medium">Recent Subscribers Details</CardTitle>
                    <CardDescription>Complete list of recent newsletter subscribers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-100">
                                <tr className="border">
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3 text-center">Subscribe Date</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent?.data?.records?.map((subscriber, index) => (
                                    <tr
                                        key={subscriber.id}
                                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 border transition-colors`}
                                    >
                                        <td className="px-6 py-2 font-medium">{subscriber.email}</td>
                                        <td className="px-6 py-2">{subscriber.name || "N/A"}</td>
                                        <td className="px-6 py-2 text-center text-gray-500">
                                            {new Date(subscriber.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-2 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                Subscribed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!recent?.data?.records?.length && (
                                    <tr className="bg-white">
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No recent subscribers
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
