import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCreateSellingPoint } from "@/hooks/useSellingPoint";
import { useGetBrands, useGetBrandById } from "@/services/brand";
import { SellingPointForm } from "./SellingPointForm";
import type { SellingPointFormData } from "@/schema/sellingPoint";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { TableShimmer } from "@/components/table-shimmer";

export function SellingPointCreatePage() {
  const navigate = useNavigate();
  const { brandId } = useParams<{ brandId: string }>();
  const [searchParams] = useSearchParams();
  const defaultBrandId = brandId || searchParams.get("brandId") || undefined;

  const createPoint = useCreateSellingPoint();
  const { data: brandsData } = useGetBrands();
  const { data: brandData, isLoading: isBrandLoading } = useGetBrandById(defaultBrandId || "");

  const brands = brandsData?.data?.brands || [];
  const brand = brandData?.brand;

  const handleSubmit = async (data: SellingPointFormData) => {
    await createPoint.mutateAsync(data);
    if (defaultBrandId) {
      navigate(`/dashboard/brands/${defaultBrandId}/selling-points`);
    } else {
      navigate("/dashboard/brands");
    }
  };

  const breadcrumbLinks = [
    {
      label: "Brands",
      href: "/dashboard/brands",
      handleClick: () => navigate("/dashboard/brands"),
    },
    ...(brand
      ? [
          {
            label: brand.name,
            href: `/dashboard/brands/${defaultBrandId}/selling-points`,
            handleClick: () => navigate(`/dashboard/brands/${defaultBrandId}/selling-points`),
          },
        ]
      : []),
    {
      label: "Create Selling Point",
      isActive: true,
      handleClick: () => {},
    },
  ];

  if (isBrandLoading && defaultBrandId) {
    return <TableShimmer />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb links={breadcrumbLinks} />

      <div className="bg-white rounded-lg border p-6">
        <SellingPointForm
          onSubmit={handleSubmit}
          isLoading={createPoint.isPending}
          brands={brands}
          defaultBrandId={defaultBrandId}
        />
      </div>
    </div>
  );
}
