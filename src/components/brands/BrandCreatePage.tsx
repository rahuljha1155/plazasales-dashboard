import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { BrandFormView } from "./BrandFormView";

export default function BrandCreatePage() {
    const navigate = useNavigate();

    const breadcrumbLinks = [
        {
            label: "Brands",
            isActive: false,
            href: "/dashboard/brands",
            handleClick: () => navigate("/dashboard/brands")
        },
        {
            label: "Create Brand",
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

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center pb-4">
                <Breadcrumb links={breadcrumbLinks} />
            </div>
            <BrandFormView
                mode="create"
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
