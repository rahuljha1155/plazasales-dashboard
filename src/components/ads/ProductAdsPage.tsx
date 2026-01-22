import { useParams } from "react-router-dom";
import EntityAdsList from "./EntityAdsList";

export default function ProductAdsPage() {
    const { productId } = useParams<{ productId: string }>();

    if (!productId) {
        return <div>Product ID is required</div>;
    }

    return <EntityAdsList entityType="product" entityId={productId} />;
}
