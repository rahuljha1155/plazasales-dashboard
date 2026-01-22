import { useParams, useNavigate, href } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Edit, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { IAd } from "@/types/IAds";
import Breadcrumb from "../dashboard/Breadcumb";

export default function AdsViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["getAd", id],
        queryFn: async () => {
            const res = await api2.get<{ status: number; data: IAd; message: string }>(
                `/ads/get-ad/${id}`
            );
            return res.data;
        },
        enabled: !!id,
    });

    const ad = data?.data;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-32" />
                <Card>
                    <CardHeader>
                        <div className="h-6 bg-gray-200 animate-pulse rounded w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Ad not found</p>
                <Button onClick={() => navigate(-1)} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Breadcrumb links={[{ label: "Advertisement", href: "/dashboard/ads" }, { label: ad?.title, href: "/dashboard/ads" }, { label: "View All", href: "#", isActive: true }]} />

                <Button className="rounded-sm!" onClick={() => navigate(`/dashboard/ads/edit/${ad.id}`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Ad
                </Button>
            </div>

            <Card className="bg-muted/80 p-6 py-0 rounded-md">
                <CardHeader className="px-0">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <CardTitle>{ad.title}</CardTitle>
                            <CardDescription>Advertisement Details</CardDescription>
                        </div>
                        <span className={`px-4 py-1 rounded-sm text-white uppercase ${ad.isActive ? "bg-green-500" : "bg-gray-500"}`}>
                            {ad.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 px-0">
                    {/* Banner Images */}
                    {ad.bannerUrls && ad.bannerUrls.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Banner Images</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {ad.bannerUrls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Banner ${index + 1}`}
                                        className="w-full h-48 object-contain border p-2  "
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-gray-700">{ad.description}</p>
                    </div>

                    {/* Target URL */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Target URL</h3>
                        <a
                            href={ad.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                            {ad.targetUrl}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Start Date</h3>
                            <p className="text-gray-700">
                                {ad.startAt ? format(new Date(ad.startAt), "PPP p") : "-"}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">End Date</h3>
                            <p className="text-gray-700">
                                {ad.endAt ? format(new Date(ad.endAt), "PPP p") : "-"}
                            </p>
                        </div>
                    </div>

                    {/* Entity Information */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Associated Entity</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {ad.brand && (
                                <div>
                                    <p className="text-sm text-gray-500">Brand</p>
                                    <p className="font-medium">{ad.brand.name}</p>
                                </div>
                            )}
                            {ad.category && (
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium">{ad.category.name}</p>
                                </div>
                            )}
                            {ad.subcategory && (
                                <div>
                                    <p className="text-sm text-gray-500">Subcategory</p>
                                    <p className="font-medium">{ad.subcategory.name}</p>
                                </div>
                            )}
                            {ad.product && (
                                <div>
                                    <p className="text-sm text-gray-500">Product</p>
                                    <p className="font-medium">{ad.product.name}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 bg-white p-6 rounded-lg">
                            <h3 className="font-bold">Sort Order</h3>
                            <p className="text-gray-700">{ad.sortOrder}</p>
                        </div>
                        <div className="space-y-2 bg-white p-6 rounded-lg">
                            <h3 className="font-bold">Impressions</h3>
                            <p className="text-gray-700">{ad.impressions || 0}</p>
                        </div>
                        <div className="space-y-2 bg-white p-6 rounded-lg">
                            <h3 className="font-bold">Clicks</h3>
                            <p className="text-gray-700">{ad.clicks || 0}</p>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
