import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { fetchWithCache } from "@/lib/cache";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react/dist/iconify.js";

interface AdsOverview {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  deleted: number;
  impressions: number;
  clicks: number;
}

interface RecentAd {
  id: string;
  createdAt: string;
  title: string;
  isActive: boolean;
  startAt: string;
  endAt: string;
  impressions: string;
  clicks: string;
}

export default function AdsAnalytics() {
  const [overview, setOverview] = useState<AdsOverview>({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    deleted: 0,
    impressions: 0,
    clicks: 0,
  });
  const [recentAds, setRecentAds] = useState<RecentAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewData, recentAdsData] = await Promise.all([
          fetchWithCache(
            "analytics:ads:overview",
            async () => {
              const res = await api.get("/analytics/ads/overview");
              return res.data.data;
            },
            5 * 60 * 1000 // 5 minutes cache
          ),
          fetchWithCache(
            "analytics:ads:recent",
            async () => {
              const res = await api.get("/analytics/ads/recent");
              return res.data.data.records;
            },
            5 * 60 * 1000 // 5 minutes cache
          ),
        ]);

        setOverview(overviewData);
        setRecentAds(recentAdsData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const overviewData = [
    { name: "Total", value: overview.total, fill: "#BF092F" },
    { name: "Active", value: overview.active, fill: "#132440" },
    { name: "Scheduled", value: overview.scheduled, fill: "#16476A" },
    { name: "Expired", value: overview.expired, fill: "#3B9797" },
  ];

  const performanceData = [
    { name: "Impressions", value: overview.impressions, fill: "#132440" },
    { name: "Clicks", value: overview.clicks, fill: "#BF092F" },
  ];

  const ctr = overview.impressions > 0 
    ? ((overview.clicks / overview.impressions) * 100).toFixed(2) 
    : "0.00";

  const recentAdsChartData = recentAds.map((ad) => ({
    name: ad.title.length > 20 ? ad.title.substring(0, 20) + "..." : ad.title,
    impressions: parseInt(ad.impressions),
    clicks: parseInt(ad.clicks),
    ctr: parseInt(ad.impressions) > 0 
      ? ((parseInt(ad.clicks) / parseInt(ad.impressions)) * 100).toFixed(2) 
      : 0,
  }));

  if (loading) {
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
        <Link to={"/dashboard/ads"}>
          <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
            <div className="flex flex-col">
              <div className="flex justify-between space-x-8">
                <div className="w-full">
                  <div className="uppercase text-sm text-zinc-700 font-semibold">
                    Total Ads
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex space-x-2 w-full justify-between items-center">
                      <div className="text-2xl text-green-500 font-semibold">
                        {overview.total} <span className="text-base">Ads</span>
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

        <Link to={"/dashboard/ads"}>
          <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
            <div className="flex flex-col">
              <div className="flex justify-between space-x-8">
                <div className="w-full">
                  <div className="uppercase text-sm text-zinc-700 font-semibold">
                    Active Ads
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex space-x-2 w-full justify-between items-center">
                      <div className="text-2xl text-blue-500 font-semibold">
                        {overview.active}
                      </div>
                      <div className="flex gap-2 items-center text-blue-800 bg-blue-200 rounded-xs px-4 p-1">
                        <Icon icon={"mdi:check-circle"} /> Live
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to={"/dashboard/ads"}>
          <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
            <div className="flex flex-col">
              <div className="flex justify-between space-x-8">
                <div className="w-full">
                  <div className="uppercase text-sm text-zinc-700 font-semibold">
                    Total Impressions
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex space-x-2 w-full justify-between items-center">
                      <div className="text-2xl text-purple-500 font-semibold">
                        {overview.impressions.toLocaleString()}
                      </div>
                      <div className="flex gap-2 items-center text-purple-800 bg-purple-200 rounded-xs px-4 p-1">
                        <Icon icon={"mdi:eye"} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to={"/dashboard/ads"}>
          <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
            <div className="flex flex-col">
              <div className="flex justify-between space-x-8">
                <div className="w-full">
                  <div className="uppercase text-sm text-zinc-700 font-semibold">
                    Click Rate (CTR)
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex space-x-2 w-full justify-between items-center">
                      <div className="text-2xl text-orange-500 font-semibold">
                        {ctr}%
                      </div>
                      <div className="flex gap-2 items-center text-orange-800 bg-orange-200 rounded-xs px-4 p-1">
                        <Icon icon={"mdi:cursor-pointer"} />
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
        {/* Pie Chart - Ad Status Distribution */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader className="gap-0">
            <CardTitle className="text-xl font-semibold">Ad Status Distribution</CardTitle>
            <CardDescription>Visual breakdown of ad status</CardDescription>
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

        {/* Bar Chart - Performance Metrics */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Performance Metrics</CardTitle>
            <CardDescription>Impressions vs Clicks comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#132440" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Ads Performance */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Ads Performance</CardTitle>
            <CardDescription>Impressions and clicks by ad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentAdsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="impressions" fill="#132440" name="Impressions" radius={[8, 8, 0, 0]} />
                <Bar dataKey="clicks" fill="#BF092F" name="Clicks" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Area Chart - CTR by Ad */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Click-Through Rate</CardTitle>
            <CardDescription>CTR percentage by recent ads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={recentAdsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="ctr" stroke="#16476A" fill="#16476A" name="CTR %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ads Table */}
      <Card className="bg-muted/50 rounded-xl">
        <CardHeader>
          <CardTitle className="font-medium">Recent Ads Details</CardTitle>
          <CardDescription>Complete list of recent ads with performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-100">
                <tr className="border">
                  <th className="px-6 py-3">Ad Title</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Impressions</th>
                  <th className="px-6 py-3 text-center">Clicks</th>
                  <th className="px-6 py-3 text-center">CTR</th>
                  <th className="px-6 py-3 text-center">Start Date</th>
                  <th className="px-6 py-3 text-center">End Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAds.map((ad, index) => {
                  const adCtr = parseInt(ad.impressions) > 0 
                    ? ((parseInt(ad.clicks) / parseInt(ad.impressions)) * 100).toFixed(2) 
                    : "0.00";
                  
                  return (
                    <tr
                      key={ad.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 border transition-colors`}
                    >
                      <td className="px-6 py-2 font-medium">{ad.title}</td>
                      <td className="px-6 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ad.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-center">{ad.impressions}</td>
                      <td className="px-6 py-2 text-center">{ad.clicks}</td>
                      <td className="px-6 py-2 text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {adCtr}%
                        </span>
                      </td>
                      <td className="px-6 py-2 text-center text-gray-500">
                        {new Date(ad.startAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-2 text-center text-gray-500">
                        {new Date(ad.endAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
