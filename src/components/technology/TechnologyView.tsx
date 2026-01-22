import { useParams, useNavigate } from "react-router-dom";
import { useGetTechnologyById } from "@/services/technology";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/dashboard/Breadcumb";

export default function TechnologyView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useGetTechnologyById(id || "");

    const technology = data?.technology;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!technology) {
        return (
            <div className="text-center py-12">-lg<p className="">Technology not found</p>
                <Button onClick={() => navigate("/dashboard/technology")} className="mt-4">
                    Back to List
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 ">
            <div className="flex justify-between items-center">
                <Breadcrumb
                    links={[
                        { label: "Technologies", isActive: false, href: "/dashboard/technology" },
                        { label: "View", isActive: true },
                    ]}
                />
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/dashboard/technology/edit/${technology.id}`)}
                    >
                        <Icon icon="solar:pen-linear" className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            <Card className="bg-muted/80 rounded-md">
                <CardHeader>
                    <CardTitle>{technology.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium  mb-2">Description</h3>
                        <div dangerouslySetInnerHTML={{ __html: technology.description }}></div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium  mb-2">Cover Image</h3>
                        <img
                            src={technology.coverImage}
                            alt={technology.title}
                            className="w-64 h-64 object-contain border rounded-lg"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium  mb-2">
                            Banner Images ({technology.bannerUrls?.length || 0})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {technology.bannerUrls?.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Banner ${index + 1}`}
                                    className="w-auto h-32 object-contain rounded-lg"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <h3 className="text-lg font-medium ">Created At</h3>
                            <p className="text-sm">{new Date(technology.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium ">Updated At</h3>
                            <p className="text-sm">{new Date(technology.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
