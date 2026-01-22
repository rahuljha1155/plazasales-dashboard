import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import type { HomeGalleryType } from "@/types/homegalleryType";
import Breadcrumb from "@/components/dashboard/Breadcumb";

const HomeGalleryView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState<HomeGalleryType | null>(null);

    const links = [
        { label: "Home-Gallery", href: "/dashboard/home-gallery" },
        { label: "View", isActive: true },
    ];

    useEffect(() => {
        const fetchImageData = async () => {
            try {
                setLoading(true);
                const allResponse = await api.get(`/home-gallery/get-home-gallery/${id}`);
                const images = allResponse.data.data;
                setCurrentImage(images);

            } catch (error) {
                toast.error("Failed to load image data");
                navigate("/dashboard/home-gallery");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchImageData();
        }
    }, [id, navigate]);

    if (loading) {
        return (
            <div
                className="space-y-4"
            >
                <Breadcrumb links={links} />

                <div
                    className="container w-full h-80 bg-muted animate-pulse mx-auto space-y-4"
                ></div>
            </div>
        );
    }

    if (!currentImage) {
        return null;
    }

    return (
        <div className="container mx-auto ">
            <div className="flex items-center justify-between mb-6">
                <Breadcrumb links={links} />
                <button onClick={() => navigate(`/dashboard/home-gallery/edit/${currentImage?.id}`)} className="bg-primary cursor-pointer rounded-full text-white px-4 py-1 text-lg">Edit Gallery</button>
            </div>

            <div className="bg-muted/80 p-6 rounded-sm">
                <h3 className="text-xl font-semibold">Center Image</h3>
                <div className="w-full  mt-4 rounded-lg overflow-hidden relative max-w-xl border">
                    <img src={currentImage?.centerImage} alt={"center image"} className="w-full h-full object-contain" />
                </div>

                <h3 className="text-xl font-semibold mt-8">Side Images</h3>

                <div className="grid grid-cols-4 gap-4 items-center">
                    {currentImage.sideImages.map((img, idx) => (
                        <div key={idx} className="w-full mt-4 rounded-lg overflow-hidden border">
                            <img src={img} alt={`side image ${idx + 1}`} className="w-full h-48 object-contain" />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default HomeGalleryView;
