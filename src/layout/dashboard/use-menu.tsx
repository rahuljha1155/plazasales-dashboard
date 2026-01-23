"use client";

import { Link } from "react-router-dom";
import { Loader, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/store/userStore";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { UserRole } from "@/components/LoginPage";

interface UserMenuProps {
  isLogingOut: boolean;
  handleLogout: () => Promise<void>;
}
export default function UserMenu({ isLogingOut, handleLogout }: UserMenuProps) {
  const { logout: clearData } = useUserStore();
  const [user, setUser] = useState<any>({});
  const { user: storeUser } = useUserStore.getState().getInfo();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!storeUser?.id && !storeUser?._id) return;

      const userId = storeUser.id || storeUser._id;
      setIsLoading(true);

      try {
        const response = await api.get(`/admin/get-users/${userId}`);
        if (response.data?.status === 200 && response.data?.data) {
          setUser(response.data.data);
          useUserStore.getState().saveInfo({ user: response.data.data });
        }
      } catch (error: any) {
        toast.error("Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [storeUser?.id, storeUser?._id]);

  // Determine avatar image based on user role and profile picture
  const getAvatarImage = () => {
    // Check both profile and profilePicture fields from backend
    const profileImage = user?.profilePicture || user?.profile;
    
    // If user has uploaded a profile picture, use it (regardless of role)
    if (profileImage) {
      // If it's already a full URL (starts with http), return as is
      if (profileImage.startsWith('http')) {
        return profileImage;
      }
      
      // If it's a relative path starting with /, return as is (public folder)
      if (profileImage.startsWith('/')) {
        return profileImage;
      }
      
      // Otherwise, it's likely a backend path, construct full URL
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://app.plazasales.com.np/api/v1/';
      const baseUrl = backendUrl.replace(/\/api\/v1\/?$/, '');
      return `${baseUrl}/${profileImage}`;
    }
    
    // Fallback: If no profile picture, show role-based default icons
    if (user?.role === UserRole.SUDOADMIN) {
      return "/logo/admin.png"; // SUDOADMIN default icon
    }
    
    if (user?.role === UserRole.ADMIN) {
      return "/avatar/admin2.png"; // ADMIN default icon (different from SUDOADMIN)
    }
    
    // Final fallback for regular users
    return "/avatar/avatar2.png";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9  rounded-full cursor-pointer border border-transparent hover:border-orange-500 overflow-hidden"
        >
          <img
            src={getAvatarImage()}
            alt="User Avatar"
            className="h-full w-full rounded-full object-contain"
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/avatar/avatar2.png";
            }}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Link to="/dashboard/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="hover:text-white focus:text-white hover:bg-red-500 focus:bg-red-600 cursor-pointer"
          disabled={isLogingOut}
          onClick={() => {
            clearData();
            handleLogout();
          }}
        >
          {isLogingOut ? <Loader size={14} className="mr-2 animate-spin" /> : (<Icon icon={"material-symbols-light:logout-rounded"} className="mr-2 size-5 " />)}
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
