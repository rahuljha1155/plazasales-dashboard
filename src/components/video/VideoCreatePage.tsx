import { VideoForm } from "./VideoForm";

interface VideoCreatePageProps {
    productId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function VideoCreatePage({ productId, onSuccess, onCancel }: VideoCreatePageProps) {
    return (
        <div className="w-full space-y-6">
            <VideoForm
                mode="create"
                productId={productId}
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        </div>
    );
}
