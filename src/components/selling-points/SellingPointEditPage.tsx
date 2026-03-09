import { useNavigate, useParams } from "react-router-dom";
import { useUpdateSellingPoint, useGetSellingPointById } from "@/hooks/useSellingPoint";
import { useGetBrands } from "@/services/brand";
import { SellingPointForm } from "./SellingPointForm";
import type { SellingPointFormData } from "@/schema/sellingPoint";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { TableShimmer } from "@/components/table-shimmer";

export function SellingPointEditPage() {
  const navigate = useNavigate();
  const { id, brandId } = useParams<{ id: string; brandId?: string }>();

  const { data: sellingPointData, isLoading: isLoadingPoint } = useGetSellingPointById(id || "");
  const updatePoint = useUpdateSellingPoint(id || "");
  const { data: brandsData } = useGetBrands();

  const brands = brandsData?.data?.brands || [];
  // API returns brandSellingPoint at root level, not nested under data
  const sellingPoint = sellingPointData?.brandSellingPoint;

  const handleSubmit = async (data: SellingPointFormData) => {
    await updatePoint.mutateAsync(data);
    if (brandId) {
      navigate(`/dashboard/brands/${brandId}/selling-points`);
    } else if (sellingPoint?.brandId) {
      navigate(`/dashboard/brands/${sellingPoint.brandId}/selling-points`);
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
    ...(sellingPoint?.brand
      ? [
          {
            label: sellingPoint.brand.name,
            href: `/dashboard/brands/${sellingPoint.brandId}/selling-points`,
            handleClick: () =>
              navigate(`/dashboard/brands/${sellingPoint.brandId}/selling-points`),
          },
        ]
      : []),
    {
      label: "Edit Selling Point",
      isActive: true,
      handleClick: () => {},
    },
  ];

  if (isLoadingPoint) {
    return <TableShimmer />;
  }

  if (!sellingPoint) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Selling point not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb links={breadcrumbLinks} />

      <div className="bg-white rounded-lg border p-6">
        <SellingPointForm
          onSubmit={handleSubmit}
          isLoading={updatePoint.isPending}
          defaultValues={{
            ...sellingPoint,
            brandId: sellingPoint.brand?.id || sellingPoint.brandId,
          }}
          brands={brands}
        />
      </div>
    </div>
  );
}
