import { useParams, useNavigate } from "react-router-dom";
import { useGetProductById } from "@/hooks/useProduct";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProductDownloads() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: productData, isLoading: productLoading } = useGetProductById(
    id || ""
  );

  const product = productData?.product;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/products")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle>Product Downloads</CardTitle>
                <CardDescription>
                  {product?.name || "Loading..."}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Downloads management will be implemented next.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
