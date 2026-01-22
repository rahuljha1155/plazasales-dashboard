import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { User, Mail, Shield, Calendar, UserCheck, Phone, MapPin, CheckCircle } from "lucide-react";
import type { User as UserType } from "@/hooks/useAdmin";

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserType | null;
}

export function UserViewModal({
  isOpen,
  onClose,
  userData,
}: UserViewModalProps) {
  if (!userData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-muted/50 p-4 rounded-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {userData.firstname} {userData.middlename ? userData.middlename + " " : ""}{userData.lastname}
                </h3>
                <p className="text-muted-foreground">{userData.email}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {userData.role}
              </Badge>
            </div>
            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Email:</span> {userData.email}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Phone:</span> {userData.phone}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Address:</span> {userData.address}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Gender:</span> {userData.gender}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Role:</span> {userData.role}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Verified:</span>{" "}
                  <Badge variant={userData.isVerified ? "default" : "destructive"}>
                    {userData.isVerified ? "Yes" : "No"}
                  </Badge>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Created:</span>{" "}
                  {format(new Date(userData.createdAt), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Updated:</span>{" "}
                  {format(new Date(userData.updatedAt), "PPP")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
