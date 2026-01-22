import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

interface BreadcrumbItemType {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface ReusableBreadcrumbProps {
  items: BreadcrumbItemType[];
}

export function ReusableBreadcrumb({ items }: ReusableBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {item.isCurrentPage ? (
                <BreadcrumbPage className="font-bold text-2xl">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    className="text-orange-600 hover:text-primary"
                    to={item.href || "#"}
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {index < items.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
