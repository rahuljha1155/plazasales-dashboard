import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { fetchWithCache } from "@/lib/cache";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, Eye, Calendar, Layers, PieChart as PieIcon } from "lucide-react";
import { format } from "date-fns";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";

interface CategoryPerformanceData {
    category: {
        id: string;
        title: string;
        slug: string;
        brand: {
            id: string;
            name: string;
            slug: string;
        };
        subcategoryCount: number;
    };
    totals: {
        products: number;
        published: number;
        popular: number;
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
    subcategoryBreakdown: Array<{
        id: string;
        title: string;
        productCount: number;
        popularCount: number;
        publishedCount: number;
    }>;
}

interface CategoryPerformanceProps {
    categoryId: string;
}

export default function CategoryPerformance({ categoryId }: CategoryPerformanceProps) {
    const [data, setData] = useState<CategoryPerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryPerformance = async () => {
            try {
                setLoading(true);
                setError(null);
                const performanceData = await fetchWithCache(
                    `analytics:category:${categoryId}:performance`,
                    async () => {
                        const res = await api.get(`/analytics/category/${categoryId}/performance`);
                        return res.data.data;
                    },
                    5 * 60 * 1000 // 5 minutes cache
                );
                setData(performanceData);
            } catch (err) {
                setError("Failed to load category performance data");
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategoryPerformance();
        }
    }, [categoryId]);

    if (loading) {
        return (
            <Card className="bg-muted/50 rounded-2xl">
                <CardHeader className="">
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
        <Card className="bg-muted/50 rounded-2xl ">
            <CardHeader className="">
                <div className="flex items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold">{data.category.title}</CardTitle>
                        <CardDescription>
                            Brand: <span className="font-semibold text-orange-600">{data.category.brand.name}</span> •
                            {data.category.subcategoryCount} Subcategories
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Charts Row */}
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
                                                { name: "Published", value: data.totals.published },
                                                { name: "Draft", value: Math.max(0, data.totals.products - data.totals.published) },
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
                                    {data.totals.products > 0
                                        ? ((data.totals.published / data.totals.products) * 100).toFixed(0)
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
                                                { name: "Popular", value: data.totals.popular },
                                                { name: "Regular", value: Math.max(0, data.totals.products - data.totals.popular) },
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
                                    {data.totals.products > 0
                                        ? ((data.totals.popular / data.totals.products) * 100).toFixed(0)
                                        : 0}%
                                </p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Popular Ratio</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subcategory Breakdown */}
                {data.subcategoryBreakdown && data.subcategoryBreakdown.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Subcategory Breakdown
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2">
                            {data.subcategoryBreakdown.map((subcategory) => (
                                <Card key={subcategory.id} className="bg-white">
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold mb-3">{subcategory.title}</h4>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="w-fit">
                                                <p className="text-muted-foreground text-xs font-semibold ">Products</p>
                                                <p className="text-lg font-bold text-center text-orange-600">{subcategory.productCount}</p>
                                            </div>
                                            <div className="w-fit">
                                                <p className="text-muted-foreground text-xs font-semibold">Published</p>
                                                <p className="text-lg font-bold text-center text-green-600">{subcategory.publishedCount}</p>
                                            </div>
                                            <div className="w-fit">
                                                <p className="text-muted-foreground text-xs font-semibold">Popular</p>
                                                <p className="text-lg text-center font-bold text-blue-600">{subcategory.popularCount}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Latest Products */}
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
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            Published
                                                        </Badge>
                                                    )}
                                                    {product.isPopular && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            Popular
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid gap-2 text-sm text-muted-foreground">
                                                <div>
                                                    <span className="font-medium">Model:</span> {product.model}
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
