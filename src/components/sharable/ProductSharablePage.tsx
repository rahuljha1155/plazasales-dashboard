import { useParams } from "react-router-dom";
import SharableList from "./SharableList";

export default function ProductSharablePage() {
    const { productId } = useParams<{ productId: string }>();

    if (!productId) {
        return <div>Product ID is required</div>;
    }

    return <SharableList entityType="product" entityId={productId} />;
}