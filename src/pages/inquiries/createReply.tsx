import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableShimmer } from "@/components/table-shimmer";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import RichTextEditor from "@/components/RichTextEditor";
import { useGetInquiryById } from "@/services/inquiry";
import { useCreateReply } from "@/services/inquiry";
import { format } from "date-fns";

export default function CreateReply() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, isError } = useGetInquiryById(id || "");
  const { mutate: createReply, isPending: isCreating } = useCreateReply();

  const [message, setMessage] = useState("");

  if (isLoading) return <PageLoader />;
  if (isError || !response?.inquiry) return <PageError />;

  const inquiry = response.inquiry;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !id) {
      return;
    }

    createReply(
      {
        message: message,
        inquiryId: id,
      },
      {
        onSuccess: () => {
          navigate(`/dashboard/inquiries/${id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen  ">
      <div className="max-w-5xl  space-y-6">
        <Breadcrumb
          links={[
            { label: "Inquiries", isActive: false, href: "/dashboard/bookings" },
            { label: "Create Reply", isActive: true },
          ]}
        />


        <div className="border rounded-xl overflow-hidden">
          {/* Inquiry Summary Card */}
          <div className="bg-white rounded-lg   border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Replying to Inquiry
            </h2>
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">From:</span>
                  <p className="font-medium text-gray-900">{inquiry.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-medium text-gray-900">{inquiry.email}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Client Message:</span>
                <p className="mt-1 ">
                  {inquiry.message}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Received At:</span>
                <p className="text-gray-700">
                  {inquiry.createdAt
                    ? format(new Date(inquiry.createdAt), "MMMM dd, yyyy 'at' hh:mm a")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg   border-gray-200">
            <div className="p-6 py-3 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Your Reply
                </h2>
                <RichTextEditor
                  initialContent={message}
                  onChange={setMessage}
                  placeholder="Type your reply here..."
                  className="min-h-[400px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/dashboard/inquiries/${id}`)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !message.trim()}
                  className="bg-primary hover:bg-primary text-white gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
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

const PageError = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-red-600 text-2xl font-bold mb-2">Error</h2>
      <p className="text-gray-600">
        Failed to load inquiry details. Please try again later.
      </p>
    </div>
  </div>
);
