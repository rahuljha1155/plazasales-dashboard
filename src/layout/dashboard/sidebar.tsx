import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUnseenCount } from "@/hooks/useUnseenCount";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useGetAllInquiries } from "@/services/inquiry";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { get } from "http";
import { useGetAllContacts } from "@/hooks/useContact";

interface SidebarProps {
  pathname: string;
  collapsed: boolean;
}

export default function Sidebar({ pathname, collapsed }: SidebarProps) {
  const { data: unseenInquiries, isLoading: isEnquiryLoading } = useGetAllInquiries();
  const { data: contactData, isLoading } = useGetAllContacts(1, 10, "");

  const role = localStorage.getItem("role") || "admin"; // Default to admin if role is not set

  const { getInfo } = useUserStore()


  const menus = [
    {
      href: "/dashboard",
      icon: "hugeicons:dashboard-square-01",
      label: "Dashboard",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/brands",
      icon: "clarity:shopping-bag-line",
      label: "Brands",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/technology",
      icon: "solar:cpu-bolt-linear",
      label: "Technology",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/team-members",
      icon: "solar:users-group-rounded-linear",
      label: "Our Team",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/career",
      icon: "ph:suitcase-simple-light",
      label: "Career",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/bookings",
      icon: "hugeicons:message-multiple-02",
      label: `Inquiries`,

      extraClasses: "text-muted-foreground hover:text-foreground",
      stats: unseenInquiries?.data?.inquiries?.filter(inquiry => !inquiry.isHandled).length || 0
    },
    {
      href: "/dashboard/blogs",
      icon: "streamline-ultimate:pen-write",
      label: "Blogs",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    // {
    //   href: "/dashboard/reviews",
    //   icon: "solar:star-ring-linear",
    //   label: "Reviews",
    //   extraClasses: "text-muted-foreground hover:text-foreground",
    // },
    {
      href: "/dashboard/useful-info",
      icon: "bi:question-square",
      label: "FAQ's",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/ads",
      icon: "bi:badge-ad",
      label: "Advertisements",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    // {
    //   href: "/dashboard/page-content",
    //   icon: "ion:rocket-outline",
    //   label: "SEO Plans",
    //   extraClasses: "text-muted-foreground hover:text-foreground",
    // },
    {
      href: "/dashboard/user-management",
      icon: "teenyicons:user-circle-outline",
      label: "User Management",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/newsletter",
      icon: "heroicons:newspaper",
      label: "Newsletter",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    ...(getInfo().user?.role === UserRole.SUDOADMIN ? [{
      href: "/dashboard/seo-metadata",
      icon: "iconoir:search",
      label: "SEO Optimization",
      extraClasses: "text-muted-foreground hover:text-foreground",
    }] : []),
    {
      href: "/dashboard/home-gallery",
      icon: "solar:gallery-bold",
      label: "Home Gallery",
      extraClasses: "text-muted-foreground hover:text-foreground",
    },
    {
      href: "/dashboard/inbox",
      icon: "streamline-plump:contact-phonebook",
      label: `Inbox`,
      extraClasses: "text-muted-foreground hover:text-foreground",
      stats: contactData?.data?.contacts?.filter(inquiry => !inquiry.isView).length || 0

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
    <div
      className={cn(
        "fixed h-screen  border-r  border-gray-200  transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 items-center border-b px-4 transition-all duration-300",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src={
                collapsed
                  ? "/logos/favicon.ico"
                  : "/logos/letter-logo.png"
              }
              alt="Real Himalaya logo"
              className={cn(
                " ",
                collapsed ? "w-10 h-auto" : "w-36 h-auto"
              )}
            />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-1 px-2 h-[100vh] flex flex-col justify-between">
          <nav className="space-y-1">
            {menus.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between  rounded-[2px] relative  px-3 py-1.5 text-sm transition-colors duration-200 group sidebar-font",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-zinc-900 hover:bg-primary/10 hover:text-primary",
                    collapsed && "justify-center px-2",
                    !collapsed && "  gap-3"
                  )}
                >
                  <div className="flex  items-center">
                    <Icon icon={item.icon} className="w-5 h-5 transition-transform text-primary duration-200 group-hover:scale-110" />
                    {!collapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                  </div>

                  {item?.stats && item.stats > 0 ? (
                    <div className="w-full border-[0.1px] border-dashed border-primary/40"></div>
                  ) : null}

                  {item?.stats && item.stats >= 0 ? (
                    <span className={`size-5 ${collapsed && "absolute right-0 -top-0"} text-[10px] flex justify-center items-center border rounded-full shrink-0 ${item.stats > 0 ? "bg-primary text-white" : "bg-zinc-300 text-white"}`}>{item.stats}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="text-xs flex items-center justify-center gap-2 border-t pt-2">
            {!collapsed ? (
              <span className="text-zinc-500">Design & Developed by</span>
            ) : null}
            <a href="https://webxnep.com/" target="_blank">
              <img src="/logo/webx-logo.jpg" alt="WebX Logo" className="h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
