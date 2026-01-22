import { useParams, useNavigate } from "react-router-dom";
import CreateSeoMetadata from "../CreateSeoMetadata";
import { useEffect } from "react";

export default function BrandSeoCreate() {
    const { entityId } = useParams<{ entityId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        navigate(`/dashboard/seo-metadata/create?entityId=${entityId}&entityType=BRAND`, { replace: true });
    }, [entityId, navigate]);

    return <CreateSeoMetadata />;
}
