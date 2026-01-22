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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react/dist/iconify.js";

interface TechnologyOverview {
  total: number;
  withBanners: number;
  withCover: number;
  deleted: number;
}

interface RecentTechnology {
  id: string;
  createdAt: string;
  title: string;
  coverImage: string;
}

export default function TechnologyAnalytics() {
  const [overview, setOverview] = useState<TechnologyOverview>({
    total: 0,
    withBanners: 0,
    withCover: 0,
    deleted: 0,
  });
  const [recentTech, setRecentTech] = useState<RecentTechnology[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewData, recentTechData] = await Promise.all([
          fetchWithCache(
            "analytics:technology:overview",
            async () => {
              const res = await api.get("/analytics/technology/overview");
              return res.data.data;
            },
            5 * 60 * 1000 // 5 minutes cache
          ),
          fetchWithCache(
            "analytics:technology:recent",
            async () => {
              const res = await api.get("/analytics/technology/recent");
              return res.data.data.records;
            },
            5 * 60 * 1000 // 5 minutes cache
          ),
        ]);

        setOverview(overviewData);
        setRecentTech(recentTechData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const overviewData = [
    { name: "Total", value: overview.total, fill: "#BF092F" },
    { name: "With Banners", value: overview.withBanners, fill: "#132440" },
    { name: "With Cover", value: overview.withCover, fill: "#16476A" },
    { name: "Deleted", value: overview.deleted, fill: "#3B9797" },
  ];

  const completenessData = [
    { 
      category: "Completeness",
      withBanners: (overview.withBanners / overview.total) * 100 || 0,
      withCover: (overview.withCover / overview.total) * 100 || 0,
    },
  ];

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
        <Link to={"/dashboard/technology"}>
          <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
            <div className="flex flex-col">
              <div className="flex justify-between space-x-8">
                <div className="w-full">
                  <div className="uppercase text-sm text-zinc-700 font-semibold">
                    Total Technologies
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex space-x-2 w-full justify-between items-center">
                      <div className="text-2xl text-green-500 font-semibold">
                        {overview.total} <span className="text-base">Items</span>
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

        <Link to={"/dashboard/technology"}>
          <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
            <div className="flex flex-col">
              <div className="flex justify-between space-x-8">
                <div className="w-full">
                  <div className="uppercase text-sm text-zinc-700 font-semibold">
                    With Banners
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex space-x-2 w-full justify-between items-center">
                      <div className="text-2xl text-blue-500 font-semibold">
                        {overview.withBanners === overview.total ? "100%" : ((overview.withBanners / overview.total) * 100).toFixed(2) + "%"}
                      </div>
                      <div className="flex gap-2 items-center text-blue-800 bg-blue-200 rounded-xs px-4 p-1">
                        <Icon icon={"mdi:image-area"} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to={"/dashboard/technology"}>
          <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
            <div className="flex flex-col">
              <div className="flex justify-between space-x-8">
                <div className="w-full">
                  <div className="uppercase text-sm text-zinc-700 font-semibold">
                    With Cover Images
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex space-x-2 w-full justify-between items-center">
                      <div className="text-2xl text-purple-500 font-semibold">
                        {overview.withCover === overview.total ? "100%" : ((overview.withCover / overview.total) * 100).toFixed(2) + "%"}
                      </div>
                      <div className="flex gap-2 items-center text-purple-800 bg-purple-200 rounded-xs px-4 p-1">
                        <Icon icon={"mdi:image"} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to={"/dashboard/technology"}>
          <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
            <div className="flex flex-col">
              <div className="flex justify-between space-x-8">
                <div className="w-full">
                  <div className="uppercase text-sm text-zinc-700 font-semibold">
                    Deleted Items
                  </div>
                  <div className="mt-3 w-full">
                    <div className="flex space-x-2 w-full justify-between items-center">
                      <div className="text-2xl text-red-500 font-semibold">
                        {overview.deleted}
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
        {/* Pie Chart - Technology Overview */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader className="gap-0">
            <CardTitle className="text-xl font-semibold">Technology Overview Distribution</CardTitle>
            <CardDescription>Visual breakdown of technology statistics</CardDescription>
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

        {/* Bar Chart - Technology Stats */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Technology Statistics Comparison</CardTitle>
            <CardDescription>Compare different technology metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData}>
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
        {/* Completeness Bar Chart */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Content Completeness</CardTitle>
            <CardDescription>Percentage of items with media assets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completenessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="withBanners" fill="#132440" name="With Banners %" radius={[8, 8, 0, 0]} />
                <Bar dataKey="withCover" fill="#16476A" name="With Cover %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Tech Timeline */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Technologies</CardTitle>
            <CardDescription>Latest technology entries timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {recentTech.map((tech, index) => (
                <div 
                  key={tech.id} 
                  className="flex items-center gap-4 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {tech.coverImage ? (
                      <img 
                        src={tech.coverImage} 
                        alt={tech.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon icon="mdi:image-off" className="text-gray-400 text-2xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{tech.title}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(tech.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

  
    </div>
  );
}
