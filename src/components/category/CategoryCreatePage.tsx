import { useParams, useNavigate } from "react-router-dom";
import Breadcumb from "@/components/dashboard/Breadcumb";
import { CategoryForm } from "./CategoryForm";

export default function CategoryCreatePage() {
  const params = useParams();
  const navigate = useNavigate();
  const brandId = params.id;

  const handleSuccess = () => {
    navigate(`/dashboard/category/${params.id}`);
  };

  const handleCancel = () => {
    navigate(`/dashboard/category/${params.id}`);
  };

  return (
    <div className="w-full space-y-6">
      <Breadcumb
        links={[
          { label: "Packages" },
          { label: "Categories" },
          { label: "Create", isActive: true },
        ]}
      />
      <CategoryForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
