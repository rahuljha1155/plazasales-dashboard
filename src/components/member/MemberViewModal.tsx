import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  User,
  Phone,
  Calendar,
  Hash,
  Home,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { IMember } from "@/types/ITeammember";

interface MemberViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberData: IMember | null;
}

interface ToggleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ToggleSection({ title, icon, children, defaultOpen = true }: ToggleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white hover:from-orange-100 hover:to-orange-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-orange-600">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-orange-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-orange-600" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2 group">
      {icon && (
        <div className="text-gray-400 group-hover:text-primary transition-colors mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-600">{label}:</span>
        <p className="text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function MemberViewModal({
  isOpen,
  onClose,
  memberData,
}: MemberViewModalProps) {
  if (!memberData) return null;

  const hasSocialMedia = memberData.facebook || memberData.twitter || memberData.linkedin || memberData.instagram;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto [&>button]:top-4 [&>button]:right-4 [&>button]:z-10 [&>button]:bg-white [&>button]:hover:bg-gray-100">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {memberData.image && (
                <div className="relative rounded-full overflow-hidden h-20 w-20 ring-4 ring-orange-100">
                  <img
                    src={memberData.image}
                    alt={memberData.fullname}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <DialogTitle className="text-3xl font-bold text-gray-900">
                  {memberData.fullname}
                </DialogTitle>
                <p className="text-orange-600 font-medium mt-1">
                  {memberData.designation}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {memberData.addToHome && (
                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 text-sm">
                  <Home className="size-3 mr-1.5" />
                  Featured on Home
                </Badge>
              )}
              <Badge variant="outline" className="px-3 py-1.5 text-sm border-orange-300 text-orange-700">
                <ArrowUpDown className="size-3 mr-1.5" />
                Order: {memberData.sortOrder}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Image Section */}
          {memberData.image && (
            <ToggleSection
              title="Profile Image"
              icon={<User className="h-5 w-5" />}
              defaultOpen={true}
            >
              <div className="flex justify-center">
                <div className="relative rounded-lg overflow-hidden border-4 border-orange-100 shadow-lg max-w-md">
                  <img
                    src={memberData.image}
                    alt={memberData.fullname}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </ToggleSection>
          )}

          {/* Basic Information */}
          <ToggleSection
            title="Basic Information"
            icon={<User className="h-5 w-5" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                label="Full Name"
                value={memberData.fullname}
                icon={<User className="h-4 w-4" />}
              />
              <InfoRow
                label="Designation"
                value={memberData.designation}
                icon={<Icon icon="mdi:briefcase" className="h-4 w-4" />}
              />
              <InfoRow
                label="Member ID"
                value={memberData.id}
                icon={<Hash className="h-4 w-4" />}
              />
              <InfoRow
                label="Sort Order"
                value={memberData.sortOrder}
                icon={<ArrowUpDown className="h-4 w-4" />}
              />
            </div>
          </ToggleSection>

          {/* Contact Information */}
          <ToggleSection
            title="Contact Details"
            icon={<Phone className="h-5 w-5" />}
            defaultOpen={true}
          >
            <div className="space-y-3">
              {memberData.phoneNumber ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {memberData.countryCode} {memberData.phoneNumber}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No phone number available</p>
              )}
            </div>
          </ToggleSection>

          {/* Social Media Links */}
          {hasSocialMedia && (
            <ToggleSection
              title="Social Media Profiles"
              icon={<Icon icon="mdi:share-variant" className="h-5 w-5" />}
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {memberData.facebook && (
                  <a
                    href={memberData.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <Icon icon="mdi:facebook" className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Facebook</p>
                      <p className="text-xs text-blue-600 group-hover:underline">View Profile</p>
                    </div>
                  </a>
                )}
                {memberData.twitter && (
                  <a
                    href={memberData.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors group"
                  >
                    <Icon icon="mdi:twitter" className="h-6 w-6 text-sky-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Twitter</p>
                      <p className="text-xs text-sky-600 group-hover:underline">View Profile</p>
                    </div>
                  </a>
                )}
                {memberData.linkedin && (
                  <a
                    href={memberData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <Icon icon="mdi:linkedin" className="h-6 w-6 text-blue-700" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                      <p className="text-xs text-blue-700 group-hover:underline">View Profile</p>
                    </div>
                  </a>
                )}
                {memberData.instagram && (
                  <a
                    href={memberData.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group"
                  >
                    <Icon icon="mdi:instagram" className="h-6 w-6 text-pink-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Instagram</p>
                      <p className="text-xs text-pink-600 group-hover:underline">View Profile</p>
                    </div>
                  </a>
                )}
              </div>
              {!hasSocialMedia && (
                <p className="text-gray-500 italic">No social media links available</p>
              )}
            </ToggleSection>
          )}

          {/* Timestamp Information */}
          <ToggleSection
            title="Record Information"
            icon={<Calendar className="h-5 w-5" />}
            defaultOpen={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-gray-600">Created At</p>
                </div>
                <p className="text-gray-900 font-semibold">
                  {format(new Date(memberData.createdAt), "PPpp")}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-gray-600">Updated At</p>
                </div>
                <p className="text-gray-900 font-semibold">
                  {format(new Date(memberData.updatedAt), "PPpp")}
                </p>
              </div>
            </div>
          </ToggleSection>
        </div>
      </DialogContent>
    </Dialog>
  );
}
