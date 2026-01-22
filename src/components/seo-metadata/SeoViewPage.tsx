import { useParams, useNavigate } from "react-router-dom";
import { SeoDetailView } from "./SeoDetailView";
import Breadcrumb from "@/components/dashboard/Breadcumb";

export default function SeoViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const handleBack = () => {
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
                        label: "View Details",
                        isActive: true,
                    },
                ]}
            />
            <SeoDetailView seoId={id} onBack={handleBack} />
        </div>
    );
}
