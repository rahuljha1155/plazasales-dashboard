import { useParams } from "react-router-dom";
import EntityAdsList from "./EntityAdsList";

export default function SubcategoryAdsPage() {
    const { subcategoryId } = useParams<{ subcategoryId: string }>();

    if (!subcategoryId) {
        return <div>Subcategory ID is required</div>;
    }

    return <EntityAdsList entityType="subcategory" entityId={subcategoryId} />;
}
