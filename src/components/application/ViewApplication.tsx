import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  Building2,
  MapPin,
  DollarSign
} from "lucide-react";
import type { IApplication } from "@/types/IApplication";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ViewApplicationProps {
  application: IApplication;
}

export function ViewApplication({ application }: ViewApplicationProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-500", label: "Pending", icon: "solar:clock-circle-bold" },
      REVIEWED: { color: "bg-blue-500", label: "Reviewed", icon: "solar:eye-bold" },
      ACCEPTED: { color: "bg-green-500", label: "Accepted", icon: "solar:check-circle-bold" },
      REJECTED: { color: "bg-red-500", label: "Rejected", icon: "solar:close-circle-bold" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge className={`${config.color} text-white hover:${config.color}`}>
        <Icon icon={config.icon} className="mr-1" width="14" />
        {config.label}
      </Badge>
    );
  };

  const getJobTypeLabel = (jobType?: string) => {
    if (!jobType) return "N/A";

    const labels: Record<string, string> = {
      "FULL_TIME": "Full Time",
      "PART_TIME": "Part Time",
      "CONTRACT": "Contract",
      "INTERNSHIP": "Internship",
      "REMOTE": "Remote",
    };

    return labels[jobType] || jobType;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-muted/80 rounded-lg  border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{application.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Application ID: {application.id}</p>
          </div>
          {getStatusBadge(application.status)}
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <InfoCard
            icon={<Mail className="h-5 w-5 text-primary" />}
            label="Email"
            value={application.email}
          />
          <InfoCard
            icon={<Phone className="h-5 w-5 text-primary" />}
            label="Phone"
            value={application.phone}
          />
          <InfoCard
            icon={<Briefcase className="h-5 w-5 text-primary" />}
            label="Position Applied"
            value={application.position}
          />
          <InfoCard
            icon={<Calendar className="h-5 w-5 text-primary" />}
            label="Applied On"
            value={format(new Date(application.createdAt), "MMM dd, yyyy")}
          />
        </div>

        {/* Documents */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text font-semibold text-gray-700 mb-3">Documents</h3>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => window.open(application.resumeUrl, "_blank")}
              className="flex items-center bg-green-500 text-white gap-2"
            >
              <FileText className="h-4 w-4" />
              View Resume
            </Button>
            {application.coverLetterUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(application.coverLetterUrl, "_blank")}
                className="flex items-center bg-amber-500 text-white gap-2"
              >
                <FileText className="h-4 w-4" />
                View Cover Letter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Career Details */}
      {application.career && (
        <div className="bg-muted/80 rounded-lg  border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Job Details</h2>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{application.career.title}</h3>
            <p className="text-sm text-gray-500">Job ID: {application.career.id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard
              icon={<Building2 className="h-5 w-5 text-primary" />}
              label="Department"
              value={application.career.department || "Not specified"}
            />
            <InfoCard
              icon={<MapPin className="h-5 w-5 text-primary" />}
              label="Location"
              value={application.career.location || "Not specified"}
            />
            <InfoCard
              icon={<Briefcase className="h-5 w-5 text-primary" />}
              label="Job Type"
              value={getJobTypeLabel(application.career.jobType)}
            />
            <InfoCard
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              label="Salary Range"
              value={application.career.salaryRange || "Not specified"}
            />
          </div>


          {/* Job Description */}
          {application.career.description && (
            <div className="mt-8">
              <h4 className="text font-semibold text-gray-800 mb-2">Job Description</h4>
              <div className="">
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: application.career.description.overview }}
                />
              </div>
            </div>
          )}

          {/* Requirements */}
          {application.career.requirements && (
            <div className="mt-4">
              <h4 className=" font-semibold text-gray-800 mb-2">Requirements</h4>
              <div className="">
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: application.career.requirements }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Replies Section */}
      {application.replies && application.replies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Replies</h2>
          <div className="space-y-4">
            {application.replies.map((reply) => (
              <div key={reply.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">{reply.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(reply.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Info Card Component
const InfoCard = ({
  icon,
  label,
  value,
  className = "",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) => (
  <div className="  hover:bg-gray-100 transition-colors">
    {/* {icon && <div className="mb-2">{icon}</div>} */}
    <h4 className="text-xs font-semibold text-gray-800 underline uppercase tracking-wider mb-1">
      {label}
    </h4>
    <p className={`text-base font-medium text-gray-900 break-words ${className}`}>
      {value}
    </p>
  </div>
);
