import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ComposedChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree, Package, Layers, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";

const COLORS = ["#BF092F", "#132440", "#16476A", "#3B9797"];

interface TopCategory {
  id: string;
  title: string;
  slug: string;
  brand: string;
  subcategoryCount: number;
  productCount: number;
}

export default function CategoryAnalytics() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const handleViewPerformance = (categoryId: string) => {
    navigate(`/dashboard/analytics/category/${categoryId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await fetchWithCache(
          "analytics:category:top-categories",
          async () => {
            const res = await api.get("/analytics/category/top-categories");
            return res.data.data.categories;
          },
          5 * 60 * 1000 // 5 minutes cache
        );
        setCategories(categoriesData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalSubcategories = categories.reduce((acc, cat) => acc + cat.subcategoryCount, 0);
  const totalProducts = categories.reduce((acc, cat) => acc + cat.productCount, 0);

  // Group by brand for pie chart
  const brandDistribution = categories.reduce((acc: any[], cat) => {
    const existing = acc.find((item) => item.name === cat.brand);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: cat.brand, value: 1 });
    }
    return acc;
  }, []);

  const categoryMetrics = categories.map((cat) => ({
    name: cat.title.length > 15 ? cat.title.substring(0, 15) + "..." : cat.title,
    fullName: cat.title,
    subcategories: cat.subcategoryCount,
    products: cat.productCount,
    brand: cat.brand,
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
      {/* Stats Cards - Unified with BrandAnalytics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent p-6 rounded-md">
          <div className="flex flex-col">
            <div className="flex justify-between space-x-8">
              <div className="w-full">
                <div className="uppercase text-sm text-zinc-700 font-semibold">Total Categories</div>
                <div className="mt-3 w-full">
                  <div className="flex space-x-2 w-full justify-between items-center">
                    <div className="text-2xl text-green-500 font-semibold">
                      {categories.length} <span className="text-base">Categories</span>
                    </div>
                    <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                      <Icon icon={"streamline:graph-arrow-increase"} />
                      100%
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
                <div className="uppercase text-sm text-zinc-700 font-semibold">Total Subcategories</div>
                <div className="mt-3 w-full">
                  <div className="flex space-x-2 w-full justify-between items-center">
                    <div className="text-2xl text-green-500 font-semibold">
                      {totalSubcategories} <span className="text-base">Subcategories</span>
                    </div>
                    <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                      <Icon icon={"streamline:graph-arrow-increase"} />
                      {/* Optionally add an icon here */}
                      {categories.length > 0 ? ((totalSubcategories / categories.length) * 100).toFixed(2) : 0}%
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
                <div className="uppercase text-sm text-zinc-700 font-semibold">Total Products</div>
                <div className="mt-3 w-full">
                  <div className="flex space-x-2 w-full justify-between items-center">
                    <div className="text-2xl text-green-500 font-semibold">
                      {totalProducts} <span className="text-base">Products</span>
                    </div>
                    <div className="flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                      <Icon icon={"streamline:graph-arrow-increase"} />
                      {/* Optionally add an icon here */}
                      {categories.length > 0 ? ((totalProducts / categories.length) * 100).toFixed(2) : 0}%
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
        {/* Categories by Brand - Pie Chart */}
        <Card className="bg-muted/50 rounded-2xl">
          <CardHeader className="gap-0">
            <CardTitle className="text-xl font-semibold">Categories Distribution by Brand</CardTitle>
            <CardDescription className="">Number of categories per brand</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={brandDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {brandDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subcategories & Products - Composed Chart */}
        <Card className="bg-muted/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Category Metrics Comparison</CardTitle>
            <CardDescription>Subcategories vs Products per category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={categoryMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-semibold">{payload[0].payload.fullName}</p>
                        <p className="text-sm text-purple-600">Subcategories: {payload[0].value}</p>
                        <p className="text-sm text-pink-600">Products: {payload[1]?.value}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend />
                <Bar dataKey="subcategories" fill="#C39BD3" name="Subcategories" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="products" stroke="#FF6B6B" strokeWidth={2} name="Products" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Products per Category - Bar Chart */}
        <Card className="bg-muted/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Products per Category</CardTitle>
            <CardDescription>Product distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-semibold">{payload[0].payload.fullName}</p>
                        <p className="text-sm text-pink-600">Products: {payload[0].value}</p>
                        <p className="text-sm text-gray-600">Brand: {payload[0].payload.brand}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend />
                <Bar dataKey="products" fill="#FF6B6B" name="Products" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Area Chart - Combined Metrics */}
        <Card className="bg-muted/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Category Growth Trend</CardTitle>
            <CardDescription>Cumulative view of metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={categoryMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="subcategories" stackId="1" stroke="#132440" fill="#132440" fillOpacity={0.6} name="Subcategories" />
                <Area type="monotone" dataKey="products" stackId="1" stroke="#16476A" fill="#16476A" fillOpacity={0.6} name="Products" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="bg-muted/50 rounded-2xl">
        <CardHeader>
          <CardTitle>All Categories Details</CardTitle>
          <CardDescription>Complete list of categories with metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Brand</th>
                  <th className="px-6 py-3 text-center">Subcategories</th>
                  <th className="px-6 py-3 text-center">Products</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors cursor-pointer`}
                    onClick={() => handleViewPerformance(category.id)}
                  >
                    <td className="px-6 py-4 font-medium">{category.title}</td>
                    <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs">
                        {category.brand}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs">
                        {category.subcategoryCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs">
                        {category.productCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPerformance(category.id);
                        }}
                        className="flex  items-center gap-2 hover:underline hover:text-primary hover:bg-transparent"
                      >
                        <Icon icon={"streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow"} />
                        Performance
                      </Button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
