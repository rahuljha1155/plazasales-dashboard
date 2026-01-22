import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { BrandFormView } from "./BrandFormView";
import { useGetBrands } from "@/services/brand";
import { TableShimmer } from "@/components/table-shimmer";

export default function BrandEditPage() {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const { data, isLoading } = useGetBrands();

    const brand = data?.data.brands.find((b) => b.slug === slug);

    const breadcrumbLinks = [
        {
            label: "Brands",
            isActive: false,
            href: "/dashboard/brands",
            handleClick: () => navigate("/dashboard/brands")
        },
        {
            label: brand?.name || "Edit Brand",
            isActive: true,
            handleClick: () => { }
        },
    ];

    const handleSuccess = () => {
        navigate("/dashboard/brands");
    };

    const handleCancel = () => {
        navigate("/dashboard/brands");
    };

    if (isLoading) {
        return <TableShimmer />;
    }

    if (!brand) {
        return (
            <div className="w-full space-y-6">
                <div className="flex justify-between items-center pb-4">
                    <Breadcrumb links={breadcrumbLinks} />
                </div>
                <div className="text-center py-10">
                    <p className="text-gray-500">Brand not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center pb-4">
                <Breadcrumb links={breadcrumbLinks} />
            </div>
            <BrandFormView
                mode="edit"
                brandId={brand.id}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
