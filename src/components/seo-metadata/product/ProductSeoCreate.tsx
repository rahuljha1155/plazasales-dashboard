import { useParams, useNavigate } from "react-router-dom";
import CreateSeoMetadata from "../CreateSeoMetadata";
import { useEffect } from "react";

export default function ProductSeoCreate() {
    const { entityId } = useParams<{ entityId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to the generic create with query params
        navigate(`/dashboard/seo-metadata/create?entityId=${entityId}&entityType=PRODUCT`, { replace: true });
    }, [entityId, navigate]);

    return <CreateSeoMetadata />;
}
