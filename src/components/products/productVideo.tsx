import React from "react";
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
import VideoList from "@/components/video/VideoList";
import Breadcrumb from "../dashboard/Breadcumb";
import { useSelectedDataStore } from "@/store/selectedStore";

export default function ProductVideo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore()

  const { data: productData, isLoading: productLoading } = useGetProductById(
    id || ""
  );

  const product = productData?.product;

  // Build breadcrumb links based on the URL structure
  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "Gallery", isActive: true },
  ];

  if (!id) {
    return (
      <div className="p-6">
        <Breadcrumb links={breadcrumbLinks} />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Product ID is required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb links={breadcrumbLinks} />
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
                <CardTitle>Product Videos</CardTitle>
                <CardDescription>
                  {product?.name || "Loading..."}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <VideoList productId={id} />
    </div>
  );
}
