import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { User, Mail, Shield, Calendar, UserCheck, Phone, MapPin, CheckCircle } from "lucide-react";
import type { User as UserType } from "@/hooks/useAdmin";
import { Icon } from "@iconify/react/dist/iconify.js";
import Breadcrumb from "../dashboard/Breadcumb";

interface UserViewPageProps {
  user: UserType;
  onBack: () => void;
  onEdit: () => void;
}

export function UserViewPage({ user, onBack, onEdit }: UserViewPageProps) {
  return (
    <div className=" mx-auto ">
      <Breadcrumb links={[
        {
          label: "Users",
          href: "/dashboard/user-management",
          handleClick: onBack
        },
        {
          label: "View User",
          href: "#",
        },
      ]} />


      <div className="max-w-7xl mt-4">
        <div className="bg-muted/50 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">
                {user.firstname} {user.middlename ? user.middlename + " " : ""}{user.lastname}
              </h3>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
            <span className={`${user.role.toLowerCase() === "admin" ? "bg-green-500 text-white px-4 py-0.5" : "bg-blue-500 text-white px-4 py-0.5"} capitalize`}>
              {user.role}
            </span>
          </div>
          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm">
                <span className="font-medium">Email:</span> {user.email}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">
                <span className="font-medium">Phone:</span> {user.phone}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">
                <span className="font-medium">Address:</span> {user.address}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">
                <span className="font-medium">Gender:</span> {user.gender}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">
                <span className="font-medium">Role:</span> {user.role}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm flex gap-4 items-center">
                <span className="font-medium">Verified:</span>{" "}
                <Icon icon={"garden:check-badge-fill-12"} className={`text-xl ${user.isVerified ? "text-green-500" : "text-zinc-400"}`} />
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">
                <span className="font-medium">Created:</span>{" "}
                {format(new Date(user.createdAt), "PPP")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">
                <span className="font-medium">Updated:</span>{" "}
                {format(new Date(user.updatedAt), "PPP")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
