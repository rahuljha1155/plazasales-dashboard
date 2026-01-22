import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Award, FileCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";

interface BrandOverview {
  totalBrands: number;
  authorizedBrands: number;
  withCertificates: number;
}

interface TopBrand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  popularCount: number;
}

export default function BrandAnalytics() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<BrandOverview>({
    totalBrands: 0,
    authorizedBrands: 0,
    withCertificates: 0,
  });
  const [topBrands, setTopBrands] = useState<TopBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewData, topBrandsData] = await Promise.all([
          fetchWithCache(
            "analytics:brand:overview",
            async () => {
              const res = await api.get("/analytics/brand/overview");
              return res.data.data;
            },
            5 * 60 * 1000 // 5 minutes cache
          ),
          fetchWithCache(
            "analytics:brand:top-brands",
            async () => {
              const res = await api.get("/analytics/brand/top-brands");
              return res.data.data.brands;
            },
            5 * 60 * 1000 // 5 minutes cache
          ),
        ]);

        setOverview(overviewData);
        setTopBrands(topBrandsData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const overviewData = [
    { name: "Total Brands", value: overview.totalBrands, fill: "#BF092F", href: "/dashboard/brands" },
    { name: "Authorized", value: overview.authorizedBrands, fill: "#132440", href: "/dashboard/brands" },
    { name: "With Certificates", value: overview.withCertificates, fill: "#16476A", href: "/dashboard/brands" },
  ];

  const radarData = topBrands.map((brand) => ({
    brand: brand.name,
    products: brand.productCount,
    popular: brand.popularCount,
  }));

  const handleViewPerformance = (brandId: string) => {
    navigate(`/dashboard/analytics/brand/${brandId}`);
  };

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

      <div className="grid gap-4 md:grid-cols-3">
        <Link to={"/dashboard/brands"}>
          <div className="  bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent   p-6 rounded-md">
            <div className="">
              <div className="flex flex-col">
                <div className="flex justify-between space-x-8 ">
                  <div className="w-full">
                    <div className="uppercase text-sm text-zinc-700 font-semibold">
                      Total Brands
                    </div>
                    <div className="mt-3 w-full">
                      <div className="flex space-x-2 w-full justify-between  items-center">
                        <div className="text-2xl text-green-500 font-semibold">
                          {overview.totalBrands} <span className="text-base">Brands</span>
                        </div>
                        <div className=" flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                          <Icon icon={"streamline:graph-arrow-increase"} /> 100%
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to={"/dashboard/brands"}>
          <div className="  bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent  p-6 rounded-md">
            <div className="">
              <div className="flex flex-col">
                <div className="flex justify-between space-x-8 ">
                  <div className="w-full">
                    <div className="uppercase text-sm text-zinc-700 font-semibold">
                      Authorized Brands
                    </div>
                    <div className="mt-3 w-full">
                      <div className="flex space-x-2 w-full justify-between  items-center">
                        <div className="text-2xl text-green-500 font-semibold">
                          {overview.authorizedBrands == overview.totalBrands ? "100%" : ((overview.authorizedBrands / overview.totalBrands) * 100).toFixed(2) + "%"}
                        </div>
                        <div className=" flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                          <Icon icon={"streamline:graph-arrow-increase"} /> 100%
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link to={"/dashboard/brands"}>
          <div className="  bg-muted/80 hover:bg-muted hover:border-zinc-200 border border-transparent  p-6 rounded-md">
            <div className="">
              <div className="flex flex-col">
                <div className="flex justify-between space-x-8 ">
                  <div className="w-full">
                    <div className="uppercase text-sm text-zinc-700 font-semibold">
                      Certified Brands
                    </div>
                    <div className="mt-3 w-full">
                      <div className="flex space-x-2 w-full justify-between  items-center">
                        <div className="text-2xl text-green-500 font-semibold">
                          {overview.withCertificates == overview.totalBrands ? "100%" : ((overview.withCertificates / overview.totalBrands) * 100).toFixed(2) + "%"}
                        </div>
                        <div className=" flex gap-2 items-center text-green-800 bg-green-200 rounded-xs px-4 p-1">
                          <Icon icon={"streamline:graph-arrow-increase"} /> 100%
                        </div>
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
        <Card className="bg-muted/50 rounded-xl ">
          <CardHeader className="gap-0">
            <CardTitle className="text-xl font-semibold">Brand Overview Distribution</CardTitle>
            <CardDescription className="">Visual breakdown of brand statistics</CardDescription>
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
                  fill="#D42327"
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

        {/* Bar Chart - Brand Stats */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Brand Statistics Comparison</CardTitle>
            <CardDescription>Compare different brand metrics</CardDescription>
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
        {/* Top Brands Bar Chart */}
        <Card className="bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Top Brands by Products</CardTitle>
            <CardDescription>Brands ranked by product count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBrands} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="productCount" fill="#132440" name="Products" radius={[0, 8, 8, 0]} />
                <Bar dataKey="popularCount" fill="#16476A" name="Popular" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className=" bg-muted/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Brand Performance Radar</CardTitle>
            <CardDescription>Multi-dimensional brand analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="brand" />
                <PolarRadiusAxis />
                <Radar name="Products" dataKey="products" stroke="#16476A" fill="#16476A" fillOpacity={0.6} />
                <Radar name="Popular" dataKey="popular" stroke="#3B9797" fill="#3B9797" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Brands Table with Performance Details */}
      <Card className="bg-muted/50 rounded-xl">
        <CardHeader>
          <CardTitle className="font-medium">All Brands Details</CardTitle>
          <CardDescription>Complete list of brands with metrics and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-100">
                <tr className="border">
                  <th className="px-6 py-3 ">Brand Name</th>
                  <th className="px-6 py-3 ">Slug</th>
                  <th className="px-6 py-3  text-center">Product Count</th>
                  <th className="px-6 py-3  text-center">Popular Count</th>
                  <th className="px-6 py-3  text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topBrands.map((brand, index) => (
                  <tr
                    key={brand.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 border transition-colors cursor-pointer`}
                    onClick={() => handleViewPerformance(brand.id)}
                  >
                    <td className="px-6 py-2 font-medium">{brand.name}</td>
                    <td className="px-6 py-2 text-gray-500">{brand.slug}</td>
                    <td className="px-6 py-2 text-center">
                      <span className="px-2 py-1 rounded-full text-xs">
                        {brand.productCount}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <span className="px-2 py-1 rounded-full text-xs">
                        {brand.popularCount}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-right  flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPerformance(brand.id);
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
    </div >
  );
}
