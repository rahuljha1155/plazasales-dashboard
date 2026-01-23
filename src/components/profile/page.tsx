import { useUserStore } from "@/store/userStore";
import { Shield, User, Calendar, Clock, Phone, MapPin, Users, Key } from "lucide-react";
import moment from "moment";
import UpdateProfileCredentialSheet from "./(components)/UpdateProfileCredentialSheet";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { UserRole } from "@/components/LoginPage";

export default function ProfileStatsCard() {
  const { user: storeUser } = useUserStore.getState().getInfo();
  const [user, setUser] = useState<any>(storeUser);
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


  if (!user) return null;

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

  const image = getAvatarImage();
  const fullName = user.name || `${user.firstname || ""} ${user.middlename ? user.middlename + " " : ""}${user.lastname || ""}`.trim() || "Anonymous User";

  if (isLoading) {
    return (
      <div className="min-h-screen  p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-r from-primary to-primary/80 rounded-2xl" />

          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative size-32 rounded-full shadow-xl ring-4 ring-white bg-white overflow-hidden">
              <img
                src={image}
                alt="User Avatar"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to default avatar if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/avatar/avatar2.png";
                }}
              />
            </div>
            <div className="pt-2">
              <h1 className="text-3xl font-bold  capitalize">
                {fullName}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {user.email || "No email provided"}
              </p>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <UpdateProfileCredentialSheet user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />
            {/* Change Password Option */}
            <div className="inline-block">
              <details className="relative">
                <summary title="change password" className="btn size-10 border flex justify-center items-center btn-outline btn-sm  rounded-full text-white hover:bg-white hover:text-black gap-1 cursor-pointer">
                  <Key className="w-4 h-4" />
                </summary>
                <div className="absolute right-0 mt-2 z-10 bg-white border rounded-lg shadow-lg p-4 w-80">
                  <ChangePasswordDialog onSuccess={() => { }} />
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-20 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Verification Status */}
            <div className="bg-muted/50 p-6 rounded-xl  border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-lg ${user.isVerified ? "bg-emerald-100" : "bg-amber-100"}`}>
                  <Shield className={`w-5 h-5 ${user.isVerified ? "text-emerald-600" : "text-amber-600"}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="text-sm font-semibold ">
                    {user.isVerified ? "Verified" : "Pending"}
                  </p>
                </div>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.isVerified
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
                }`}>
                {user.isVerified ? "✓ Account Verified" : "⏳ Verification Pending"}
              </div>
            </div>

            {/* Role */}
            <div className="bg-muted/50 p-6 rounded-xl  border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-orange-100">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                  <p className="text-sm font-semibold  capitalize">
                    {user.role || "Standard User"}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                Access Level
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-muted/50 p-6 rounded-xl  border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                  <p className="text-sm font-semibold ">
                    {moment(user.updatedAt).format("MMM YYYY")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated {moment(user.updatedAt).fromNow()}</span>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-muted/50 p-6 rounded-xl  border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold  mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-4 items-center py-1 border-b border-gray-100">
                <span className="text-sm text-gray-600">Email Address</span>
                <span className="text-sm font-medium ">{user.email}</span>
              </div>
              <div className="flex gap-4 items-center py-1 border-b border-gray-100">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="text-sm font-medium  capitalize">{user.role || "Standard"}</span>
              </div>
              <div className="flex gap-4 items-center py-1 border-b border-gray-100">
                <span className="text-sm text-gray-600">Verification Status</span>
                <span className="text-sm font-medium ">
                  {user.isVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
              <div className="flex gap-4 items-center py-1 border-b border-gray-100">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium ">
                  {moment(user.updatedAt).format("MMM DD, YYYY")}
                </span>
              </div>
              {user.phone && (
                <div className="flex gap-4 items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Phone
                  </span>
                  <span className="text-sm font-medium ">{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className="flex gap-4 items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Address
                  </span>
                  <span className="text-sm font-medium ">{user.address}</span>
                </div>
              )}
              {user.gender && (
                <div className="flex gap-4 items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Gender
                  </span>
                  <span className="text-sm font-medium  capitalize">{user.gender.toLowerCase()}</span>
                </div>
              )}
              <div className="flex gap-4 items-center py-1 border-b border-gray-100">
                <span className="text-sm text-gray-600">Account Created</span>
                <span className="text-sm font-medium ">
                  {moment(user.createdAt).format("MMM DD, YYYY")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
