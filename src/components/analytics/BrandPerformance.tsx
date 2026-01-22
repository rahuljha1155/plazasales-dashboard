import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { fetchWithCache } from "@/lib/cache";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, Eye, Calendar, PieChart as PieIcon } from "lucide-react";
import { format } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

interface BrandPerformanceData {
  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
    themeColor: string;
  };
  totals: {
    totalProducts: number;
    publishedProducts: number;
    popularProducts: number;
  };
  latestProducts: Array<{
    id: string;
    createdAt: string;
    name: string;
    slug: string;
    model: string;
    price: string;
    isPublished: boolean;
    isPopular: boolean;
  }>;
}

interface BrandPerformanceProps {
  brandId: string;
}

export default function BrandPerformance({ brandId }: BrandPerformanceProps) {
  const [data, setData] = useState<BrandPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        const performanceData = await fetchWithCache(
          `analytics:brand:${brandId}:performance`,
          async () => {
            const res = await api.get(`/analytics/brand/${brandId}/performance`);
            return res.data.data;
          },
          5 * 60 * 1000 // 5 minutes cache
        );
        setData(performanceData);
      } catch (err) {
        setError("Failed to load brand performance data");
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBrandPerformance();
    }
  }, [brandId]);

  if (loading) {
    return (
      <Card className="bg-muted/50 rounded-2xl">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-muted/50 rounded-2xl">
        <CardContent className="pt-6">
          <p className="text-center text-red-500">{error || "No data available"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/50 rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          {data.brand.logoUrl && (
            <img
              src={data.brand.logoUrl}
              alt={data.brand.name}
              className="w-16 h-16 object-contain rounded-lg bg-white p-2"
            />
          )}
          <div>
            <CardTitle className="text-2xl font-bold">{data.brand.name}</CardTitle>
            <CardDescription>Performance Overview</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="grid gap-4 md:grid-cols-2">
          {/* Status Distribution Pie Chart */}
          <Card className="bg-white rounded-xl  border-zinc-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Publication Status
              </CardTitle>
              <CardDescription>Published vs Draft products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Published", value: data.totals.publishedProducts },
                        { name: "Draft", value: Math.max(0, data.totals.totalProducts - data.totals.publishedProducts) },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" /> {/* green-500 */}
                      <Cell fill="#e2e8f0" /> {/* slate-200 */}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <p className="text-2xl font-bold text-green-600">
                  {data.totals.totalProducts > 0
                    ? ((data.totals.publishedProducts / data.totals.totalProducts) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Published Ratio</p>
              </div>
            </CardContent>
          </Card>

          {/* Popularity Distribution Pie Chart */}
          <Card className="bg-white rounded-xl  border-zinc-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Product Popularity
              </CardTitle>
              <CardDescription>Popular vs Regular products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Popular", value: data.totals.popularProducts },
                        { name: "Regular", value: Math.max(0, data.totals.totalProducts - data.totals.popularProducts) },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#2563eb" /> {/* blue-600 */}
                      <Cell fill="#e2e8f0" /> {/* slate-200 */}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <p className="text-2xl font-bold text-blue-600">
                  {data.totals.totalProducts > 0
                    ? ((data.totals.popularProducts / data.totals.totalProducts) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Popular Ratio</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Latest Products</h3>
          <div className="space-y-3">
            {data.latestProducts.map((product) => (
              <Card key={product.id} className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{product.name}</h4>
                        <div className="flex gap-2">
                          {product.isPublished && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 py-0.5! border-green-200">
                              Published
                            </Badge>
                          )}
                          {product.isPopular && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 py-0.5! border-blue-200">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Model:</span> {product.model}
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> ${product.price}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(product.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                        <div>
                          <span className="font-medium">Slug:</span> {product.slug}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
