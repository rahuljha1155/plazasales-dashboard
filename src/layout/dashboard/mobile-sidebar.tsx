import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUnseenCount } from "@/hooks/useUnseenCount";

interface MobileSidebarProps {
  pathname: string;
}

export default function MobileSidebar({ pathname }: MobileSidebarProps) {
  const { data: unseenCounts, isLoading } = useUnseenCount();
  const role = localStorage.getItem("role") || "admin"; // Default to admin if role is not set
  const menus = [
    {
      href: "/dashboard",
      icon: "/icons/bar-chart.png",
      label: "Dashboard",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/category",
      icon: "/icons/activities.png",
      label: "Packages",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/team-members",
      icon: "/icons/group.png",
      label: "Our Team",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/career",
      icon: "/icons/document.png",
      label: "Certificate",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/bookings",
      icon: "/icons/sidebar/booking.png",
      label: `Bookings ${(unseenCounts?.bookingCount || 0) + (unseenCounts?.customBookingCount || 0) > 0
        ? `(${(unseenCounts?.bookingCount || 0) + (unseenCounts?.customBookingCount || 0)})`
        : ""
        }`,
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/blogs",
      icon: "/icons/sidebar/blog.png",
      label: "Blogs",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/useful-info",
      icon: "/icons/sidebar/info.png",
      label: "Useful Info",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/blog-gallery",
      icon: "/icons/gallery.png",
      label: "Blog Gallery",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/page-content",
      icon: "/icons/rocket.png",
      label: "SEO",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/homefaq",
      icon: "solar:medal-star-bold-duotone",
      label: "Homefaq",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/home-gallery",
      icon: "solar:gallery-minimalistic-bold",
      label: "Home Gallery",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/home-testimonial",
      icon: "fa-solid:grin-stars",
      label: "Home Testimonials",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/user-management",
      icon: "/avatar/user.png",
      label: "User Management",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/reviews",
      icon: "/icons/packages/reviews.png",
      label: "Reviews",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/inbox",
      icon: "/icons/sidebar/inbox.png",
      label: `Inbox ${unseenCounts?.inboxCount > 0 ? `(${unseenCounts?.inboxCount})` : 0
        }`,
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
  ].filter((menu) => {
    if (role === "admin") return true;
    if (role === "editor") {
      return ![
        "/dashboard/inbox",
        "/dashboard/bookings",
        "/dashboard/user-management",
      ].includes(menu.href);
    }
    if (role === "user") {
      return ![
        "/dashboard/inbox",
        "/dashboard/bookings",
        "/dashboard/user-management",
      ].includes(menu.href);
    }
    return false;
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          {menus.map(
            (
              item: {
                href: string;
                icon: string;
                label: string;
                extraClasses: string;
              },
              index: number
            ) => (
              <Link
                key={index}
                to={item.href}
                className={`${pathname === item.href
                  ? "bg-muted text-primary transition-all hover:text-primary"
                  : "text-muted-foreground transition-all hover:text-primary"
                  } 
              flex items-center gap-3 px-3 py-2 rounded-sm`}
              >
                <img
                  src={item.icon || "/placeholder.svg"}
                  alt="icon"
                  width={20}
                  height={20}
                />
                {item.label}
              </Link>
            )
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
