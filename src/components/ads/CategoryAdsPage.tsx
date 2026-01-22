import { useParams } from "react-router-dom";
import EntityAdsList from "./EntityAdsList";

export default function CategoryAdsPage() {
    const { categoryId } = useParams<{ categoryId: string }>();

    if (!categoryId) {
        return <div>Category ID is required</div>;
    }

    return <EntityAdsList entityType="category" entityId={categoryId} />;
}
