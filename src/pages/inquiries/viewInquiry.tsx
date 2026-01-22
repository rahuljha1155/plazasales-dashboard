import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, User, Reply, Phone, MapPin, Package, Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableShimmer } from "@/components/table-shimmer";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useGetInquiryById, useUpdateInquiry } from "@/services/inquiry";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function ViewInquiry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useGetInquiryById(id || "");
  const { mutate: updateInquiry, isPending: isUpdating } = useUpdateInquiry(id || "");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    status: "",
  });

  if (isLoading) return <PageLoader />;
  if (isError) return (
    <div className="">
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );

  const inquiry = response?.inquiry;

  const toggleEditMode = () => {
    if (!isEditMode) {
      setFormData({
        subject: "",
        message: inquiry?.message || "",
        status: inquiry?.isHandled ? "resolved" : "pending",
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: any = {};
    if (formData.subject) updateData.subject = formData.subject;
    if (formData.message) updateData.message = formData.message;
    if (formData.status) updateData.status = formData.status;

    updateInquiry(updateData, {
      onSuccess: () => {
        setIsEditMode(false);
      },
    });
  };



  return (
    <div className="min-h-screen ">
      <div className="mx-auto space-y-8 ">
        <Breadcrumb
          links={[
            { label: "Inquiries", isActive: false, href: "/dashboard/inquiries" },
            { label: "View Inquiry", isActive: true },
          ]}
        />

        <div className="">
          <div className="flex mt-8 items-center justify-between p-4 bg-muted rounded-md rounded-b-none border-gray-200 ">

          <div className=""></div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(`/dashboard/inquiries/${id}/reply`)}
              className="bg-primary hover:bg-primary text-white gap-2"
            >
              <Reply className="h-4 w-4" />
              Reply Mail
            </Button>

              <Badge className={` py-1.5 flex gap-2 items-center  rounded-full ${inquiry?.isHandled ? "bg-green-500 text-white" : "bg-zinc-200 text-zinc-800"}`}>
              {inquiry?.isHandled && <Icon icon={"garden:check-badge-fill-12"} />}
              {inquiry?.isHandled ? "Replied" : "UnHandled"}
            </Badge>
          </div>
        </div>

        {isEditMode && (
          <div className="b border-l-4 border-l-blue-500">
              <div className=" pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">Update Inquiry</h2>
            </div>

            <form onSubmit={handleUpdateSubmit} className="px-8 py-8 space-y-8">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                  Subject (Optional)
                </Label>
                <Input
                  id="subject"
                  placeholder="Enter inquiry subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Enter inquiry message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={8}
                  className="resize-none border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                >
                  {isUpdating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Inquiry
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleEditMode}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-muted/80">
            <div className="px-8 pb-10 space-y-12">
            {/* User Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                User Information
              </h2>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                <InfoCard
                  icon={<User className="h-4 w-4 text-gray-400" />}
                  label="Name"
                  value={inquiry?.name || "Not provided"}
                />
                <InfoCard
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  label="Email"
                  value={inquiry?.email || "Not provided"}
                />
                <InfoCard
                  icon={<Phone className="h-4 w-4 text-gray-400" />}
                  label="Phone"
                  value={inquiry?.phone || "Not provided"}
                />
                <InfoCard
                  icon={<MapPin className="h-4 w-4 text-gray-400" />}
                  label="Address"
                  value={inquiry?.address || "Not provided"}
                />
              </div>
            </section>

            {inquiry?.product && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  Product Information
                </h2>
                <InfoCard
                  icon={<Package className="h-4 w-4 text-gray-400" />}
                  label="Product"
                  value={inquiry.product.name || "Not provided"}
                />
              </section>
            )}

            {/* Brand Information */}
            {inquiry?.brand && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  Brand Information
                </h2>
                <div className="flex items-start gap-6">

                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 flex-1">
                    <InfoCard
                      icon={<Building2 className="h-4 w-4 text-gray-400" />}
                      label="Brand Name"
                      value={inquiry.brand.name || "Not provided"}
                    />
                    {(inquiry.brand as any).usp && (
                      <InfoCard
                        label="USP"
                        value={(inquiry.brand as any).usp}
                      />
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Message Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Message
              </h2>
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                {inquiry?.message}
              </p>
            </section>

            {/* Replies Section */}
            {inquiry?.replies && inquiry.replies.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  Replies ({inquiry.replies.length})
                </h2>
                <div className="space-y-6">
                  {inquiry.replies.map((reply: any, index: number) => (
                    <div
                      key={reply.id}
                      className="pl-6 border-l-2 border-blue-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600">
                          Reply #{index + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(reply.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                        </span>
                      </div>
                      <div
                        className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: reply.message }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Metadata Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Additional Information
              </h2>
              <div className="grid md:grid-cols-3 gap-x-12 gap-y-6">
                <InfoCard
                  label="Inquiry ID"
                  value={inquiry?.id as string}
                  className="text-xs font-mono"
                />
                <InfoCard
                  label="Created At"
                  value={
                    inquiry?.createdAt
                      ? format(new Date(inquiry.createdAt), "MMM dd, yyyy")
                      : "N/A"
                  }
                />
                <InfoCard
                  label="Last Updated"
                  value={
                    inquiry?.updatedAt
                      ? format(new Date(inquiry.updatedAt), "MMM dd, yyyy")
                      : "N/A"
                  }
                />
              </div>
            </section>
          </div>
        </div>
        </div>


      </div>
    </div>
  );
}

// Sub-components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <TableShimmer />
  </div>
);

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
  <div className="flex items-start gap-3">
    {icon && <div className="mt-0.5">{icon}</div>}
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </div>
      <div className={`text-base text-gray-900 break-words ${className}`}>
        {value}
      </div>
    </div>
  </div>
);
