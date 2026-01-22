import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import type { ICareer } from "@/types/ICareer";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ViewCareerProps {
  career: ICareer;
}

export function ViewCareer({ career }: ViewCareerProps) {
  const getJobTypeLabel = (jobType?: string) => {
    if (!jobType) return "N/A";

    const labels: Record<string, string> = {
      "FULL_TIME": "Full Time",
      "full-time": "Full Time",
      "PART_TIME": "Part Time",
      "part-time": "Part Time",
      "CONTRACT": "Contract",
      "contract": "Contract",
      "INTERNSHIP": "Internship",
      "internship": "Internship",
      "REMOTE": "Remote",
      "remote": "Remote",
    };

    return labels[jobType] || jobType;
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-muted/80 rounded-lg  p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{career.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Job ID: {career.id}</p>
          </div>
          <span
            className={
              career.isOpen
                ? "text-green-500"
                : " text-red-500 hover:bg-red-600"
            }
          >
            {career.isOpen ? (
              <span className="flex gap-2 items-center  rounded-sm px-2">
                <Icon icon={"garden:check-badge-fill-12"} className="size-4 mr-1" />
                Open
              </span>
            ) : (
              <span className="flex gap-2 items-center  rounded-sm px-2">                <XCircle className="size-4 mr-1" />
                Closed
              </span>
            )}
          </span>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <InfoCard
            icon={<Building2 className="h-5 w-5 text-primary" />}
            label="Department"
            value={career.department || "Not specified"}
          />
          <InfoCard
            icon={<MapPin className="h-5 w-5 text-primary" />}
            label="Location"
            value={career.location || "Not specified"}
          />
          <InfoCard
            icon={<Briefcase className="h-5 w-5 text-primary" />}
            label="Job Type"
            value={getJobTypeLabel(career.jobType)}
          />
          <InfoCard
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            label="Salary Range"
            value={career.salaryRange || "Not specified"}
          />
        </div>
      </div>

      {/* Description Section */}
      {career.description && (
        <div className="bg-muted/80  rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Job Description</h2>
          <div className="">


            {(
              <div className="space-y-4">
                {career.description?.overview && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: career.description.overview }}></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requirements Section */}
      {career.requirements && (
        <div className="bg-muted/80 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Description</h2>
          <div className="space-y-2" dangerouslySetInnerHTML={{ __html: career.requirements }}>

          </div>
        </div>
      )}

      {/* Metadata Section */}
      <div className="bg-muted/80 rounded-lg  p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon={<Calendar className="h-5 w-5 text-primary" />}
            label="Posted On"
            value={format(new Date(career.createdAt), "MMM dd, yyyy")}
          />
          <InfoCard
            icon={<Calendar className="h-5 w-5 text-primary" />}
            label="Last Updated"
            value={format(new Date(career.updatedAt), "MMM dd, yyyy")}
          />
        </div>
      </div>
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
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </h4>
    <p className={`text-base font-medium text-gray-900 break-words ${className}`}>
      {value}
    </p>
  </div>
);
