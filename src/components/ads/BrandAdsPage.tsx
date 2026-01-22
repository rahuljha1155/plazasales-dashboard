import { useParams } from "react-router-dom";
import EntityAdsList from "./EntityAdsList";

export default function BrandAdsPage() {
    const { brandId } = useParams<{ brandId: string }>();

    if (!brandId) {
        return <div>Brand ID is required</div>;
    }

    return <EntityAdsList entityType="brand" entityId={brandId} />;
}
