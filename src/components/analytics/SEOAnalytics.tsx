import { useEffect, useState } from "react";
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
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Globe, Link2 } from "lucide-react";

const COLORS = ["#BF092F", "#132440", "#16476A", "#3B9797"];

interface SEOOverview {
  totalRecords: number;
  optimized: number;
  indexable: number;
  canonicalSet: number;
  optimizationCoverage: number;
}

export default function SEOAnalytics() {
  const [overview, setOverview] = useState<SEOOverview>({
    totalRecords: 0,
    optimized: 0,
    indexable: 0,
    canonicalSet: 0,
    optimizationCoverage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const overviewData = await fetchWithCache(
          "analytics:seo:overview",
          async () => {
            const res = await api.get("/analytics/seo/overview");
            return res.data.data;
          },
          5 * 60 * 1000 // 5 minutes cache
        );
        setOverview(overviewData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pieData = [
    { name: "Optimized", value: overview.optimized, color: "#BF092F" },
    { name: "Not Optimized", value: overview.totalRecords - overview.optimized, color: "#132440" },
  ];

  const indexableData = [
    { name: "Indexable", value: overview.indexable, color: "#16476A" },
    { name: "Non-Indexable", value: overview.totalRecords - overview.indexable, color: "#3B9797" },
  ];

  const radialData = [
    {
      name: "Optimization",
      value: overview.optimizationCoverage,
      fill: "#BF092F",
    },
  ];

  const metricsComparison = [
    { name: "Total Records", value: overview.totalRecords },
    { name: "Optimized", value: overview.optimized },
    { name: "Indexable", value: overview.indexable },
    { name: "Canonical Set", value: overview.canonicalSet },
  ];

  const trendData = [
    { name: "Total", value: overview.totalRecords },
    { name: "Optimized", value: overview.optimized },
    { name: "Indexable", value: overview.indexable },
    { name: "Canonical", value: overview.canonicalSet },
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

  const optimizationPercentage = overview.totalRecords > 0
    ? ((overview.optimized / overview.totalRecords) * 100).toFixed(1)
    : "0";

  const indexablePercentage = overview.totalRecords > 0
    ? ((overview.indexable / overview.totalRecords) * 100).toFixed(1)
    : "0";

  const canonicalPercentage = overview.totalRecords > 0
    ? ((overview.canonicalSet / overview.totalRecords) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Stats Cards - Unified with BrandAnalytics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
          <div className="flex flex-col">
            <div className="flex justify-between space-x-8">
              <div className="w-full">
                <div className="uppercase text-sm text-zinc-700 font-semibold">Total Records</div>
                <div className="mt-3 w-full">
                  <div className="flex space-x-2 w-full justify-between items-center">
                    <div className="text-2xl text-green-500 font-semibold">
                      {overview.totalRecords} <span className="text-base">Records</span>
                    </div>
                    <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                      {/* Optionally add an icon here */} 100%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
          <div className="flex flex-col">
            <div className="flex justify-between space-x-8">
              <div className="w-full">
                <div className="uppercase text-sm text-zinc-700 font-semibold">Optimized</div>
                <div className="mt-3 w-full">
                  <div className="flex space-x-2 w-full justify-between items-center">
                    <div className="text-2xl text-green-500 font-semibold">
                      {overview.optimized} <span className="text-base">Optimized</span>
                    </div>
                    <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                      {optimizationPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
          <div className="flex flex-col">
            <div className="flex justify-between space-x-8">
              <div className="w-full">
                <div className="uppercase text-sm text-zinc-700 font-semibold">Indexable</div>
                <div className="mt-3 w-full">
                  <div className="flex space-x-2 w-full justify-between items-center">
                    <div className="text-2xl text-green-500 font-semibold">
                      {overview.indexable} <span className="text-base">Indexable</span>
                    </div>
                    <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                      {indexablePercentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
          <div className="flex flex-col">
            <div className="flex justify-between space-x-8">
              <div className="w-full">
                <div className="uppercase text-sm text-zinc-700 font-semibold">Canonical Set</div>
                <div className="mt-3 w-full">
                  <div className="flex space-x-2 w-full justify-between items-center">
                    <div className="text-2xl text-green-500 font-semibold">
                      {overview.canonicalSet} <span className="text-base">Canonical</span>
                    </div>
                    <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                      {canonicalPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Optimization Coverage - Radial */}
        <Card className="bg-muted/50 rounded-2xl">
          <CardHeader className="gap-0">
            <CardTitle className="text-xl font-semibold">SEO Optimization Coverage</CardTitle>
            <CardDescription className="">Overall optimization health score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                barSize={30}
                data={radialData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  label={{ position: "insideStart", fill: "#fff", fontSize: 20 }}
                  background
                  dataKey="value"
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold">
                  {overview.optimizationCoverage}%
                </text>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm text-gray-500">
                  Optimization
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Optimized vs Not Optimized - Pie Chart */}
        <Card className="bg-muted/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Optimization Status</CardTitle>
            <CardDescription>Distribution of optimized vs non-optimized pages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Indexable Status - Pie Chart */}
        <Card className="bg-muted/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Indexability Status</CardTitle>
            <CardDescription>Pages eligible for search engine indexing</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={indexableData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {indexableData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* All Metrics Comparison - Bar Chart */}
        <Card className="bg-muted/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">SEO Metrics Comparison</CardTitle>
            <CardDescription>Side-by-side comparison of all metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                  {metricsComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Line */}
      <Card className="bg-muted/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">SEO Metrics Trend</CardTitle>
          <CardDescription>Progressive view of SEO implementation</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


    </div>
  );
}
