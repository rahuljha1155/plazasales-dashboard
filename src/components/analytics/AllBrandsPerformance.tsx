import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { fetchWithCache } from "@/lib/cache";
import BrandPerformance from "./BrandPerformance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function AllBrandsPerformance() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const brandsData = await fetchWithCache(
          "analytics:brand:top-brands",
          async () => {
            const res = await api.get("/analytics/brand/top-brands");
            return res.data.data.brands;
          },
          5 * 60 * 1000 // 5 minutes cache
        );
        setBrands(brandsData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">All Brands Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed performance metrics for all brands including products, published status, and popularity.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {brands.map((brand) => (
          <BrandPerformance key={brand.id} brandId={brand.id} />
        ))}
      </div>
    </div>
  );
}
