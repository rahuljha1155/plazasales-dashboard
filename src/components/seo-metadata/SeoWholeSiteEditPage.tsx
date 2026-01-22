import { useParams, useNavigate } from "react-router-dom";
import { UpdateWholeSiteSeoMetadata } from "./UpdateSeoMetadata";
import Breadcrumb from "@/components/dashboard/Breadcumb";

export default function SeoWholeSiteEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/dashboard/seo-metadata");
    };

    const handleCancel = () => {
        navigate("/dashboard/seo-metadata");
    };

    if (!id) {
        return (
            <div className="p-6">
                <p className="text-red-500">Invalid SEO ID</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb
                links={[
                    {
                        label: "SEO Metadata",
                        isActive: false,
                        href: "/dashboard/seo-metadata",
                        handleClick: () => navigate("/dashboard/seo-metadata"),
                    },
                    {
                        label: "Edit Whole Site SEO",
                        isActive: true,
                    },
                ]}
            />
            <UpdateWholeSiteSeoMetadata seoId={id} onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
    );
}
