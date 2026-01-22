import { VideoForm } from "./VideoForm";
import type { Video } from "@/hooks/useVideo";

interface VideoEditPageProps {
    video: Video;
    productId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function VideoEditPage({ video, productId, onSuccess, onCancel }: VideoEditPageProps) {
    return (
        <div className="w-full space-y-6">
            <VideoForm
                mode="edit"
                video={video}
                productId={productId}
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        </div>
    );
}
