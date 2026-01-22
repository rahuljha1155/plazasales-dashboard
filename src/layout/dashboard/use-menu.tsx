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

  // Determine avatar image based on user role
  const getAvatarImage = () => {
    if (user?.role === UserRole.SUDOADMIN || user?.role === UserRole.ADMIN) {
      return "/logo/admin.png";
    }
    return user?.profilePicture || "/avatar/avatar2.png";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9  rounded-full cursor-pointer border border-transparent hover:border-orange-500"
        >
          <img
            src={getAvatarImage()}
            alt="User Avatar"
            className="h-full w-full rounded-full object-cover"
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
