import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
} from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { IMember } from "@/types/ITeammember";

interface MemberViewScreenProps {
  memberData: IMember;
  onBack: () => void;
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
    <div className=" overflow-hidden ">
      <button
        // onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between "
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
        </div>

      </button>
      {isOpen && (
        <div className="px-4">
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
    <div className="flex items-start gap-3 py-2">

      <div className="flex-1">
        <span className="text-sm font-medium text-gray-600">{label}:</span>
        <p className="text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export function MemberViewScreen({ memberData, onBack }: MemberViewScreenProps) {
  const hasSocialMedia = memberData.facebook || memberData.twitter || memberData.linkedin || memberData.instagram;

  return (
    <div className="container mx-auto">

      {/* Toggle Sections */}
      <div className="space-y-4 bg-muted/80 rounded-xl pb-6">
        {/* Profile Image Section */}
        {memberData.image && (
          <ToggleSection
            title="Profile Image"
            icon={<User className="h-5 w-5" />}
            defaultOpen={true}
          >
            <div className="flex ">
              <div className="relative overflow-hidden border max-w-md">
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
            {memberData.isLeader && (
              <div className="flex items-start gap-3 py-2">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-600">Leader Status:</span>
                  <p className="text-gray-900 mt-0.5">
                    <Badge className="bg-orange-600">Leader</Badge>
                  </p>
                </div>
              </div>
            )}
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
              <div className="flex items-start gap-4 ">
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

        {/* Leader Description */}
        {memberData.isLeader && memberData.description && (
          <ToggleSection
            title="Leader Description"
            icon={<Icon icon="mdi:text-box-outline" className="h-5 w-5" />}
            defaultOpen={true}
          >
            <div
              className="prose max-w-none text-gray-900"
              dangerouslySetInnerHTML={{ __html: memberData.description.text }}
            />
          </ToggleSection>
        )}

        {/* Social Media Links */}
        {hasSocialMedia && (
          <ToggleSection
            title="Social Media Profiles"
            icon={<Icon icon="mdi:share-variant" className="h-5 w-5" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 w-full max-w-sm gap-3">
              {memberData.facebook && (
                <a
                  href={memberData.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex  items-center justify-start  gap-3 p-3 border hover:bg-gray-50 group"
                >
                  <Icon icon="mdi:facebook" className="h-6 w-6 text-gray-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Facebook</p>
                    <p className="text-xs text-gray-600 group-hover:underline">View Profile</p>
                  </div>
                </a>
              )}
              {memberData.twitter && (
                <a
                  href={memberData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border hover:bg-gray-50 group"
                >
                  <Icon icon="mdi:twitter" className="h-6 w-6 text-gray-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Twitter</p>
                    <p className="text-xs text-gray-600 group-hover:underline">View Profile</p>
                  </div>
                </a>
              )}
              {memberData.linkedin && (
                <a
                  href={memberData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border hover:bg-gray-50 group"
                >
                  <Icon icon="mdi:linkedin" className="h-6 w-6 text-gray-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">LinkedIn</p>
                    <p className="text-xs text-gray-600 group-hover:underline">View Profile</p>
                  </div>
                </a>
              )}
              {memberData.instagram && (
                <a
                  href={memberData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border hover:bg-gray-50 group"
                >
                  <Icon icon="mdi:instagram" className="h-6 w-6 text-gray-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Instagram</p>
                    <p className="text-xs text-gray-600 group-hover:underline">View Profile</p>
                  </div>
                </a>
              )}
            </div>
            {!hasSocialMedia && (
              <p className="text-gray-500 italic">No social media links available</p>
            )}
          </ToggleSection>
        )}


      </div>
    </div>
  );
}
