import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableShimmer } from "@/components/table-shimmer";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import RichTextEditor from "@/components/RichTextEditor";
import { useApplication } from "@/services/application";
import { useCreateApplicationReply } from "@/hooks/useReply";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function CreateCareerReply() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: response, isLoading, isError } = useApplication(id || "");
    const { mutateAsync: createReply, isPending: isCreating } = useCreateApplicationReply();

    const [message, setMessage] = useState("");

    if (isLoading) return <PageLoader />;
    if (isError || !response?.data) return <PageError />;

    const application = response.data;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
            REVIEWED: { color: "bg-blue-100 text-blue-800", label: "Reviewed" },
            ACCEPTED: { color: "bg-green-100 text-green-800", label: "Accepted" },
            REJECTED: { color: "bg-red-100 text-red-800", label: "Rejected" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

        return (
            <Badge className={`${config.color} text-white text-sm  py-1 hover:${config.color}`}>
                {config.label}
            </Badge>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || !id) {
            return;
        }

        try {
            await createReply({
                message: message,
                jobApplicationId: id,
            });
            navigate(-1);
        } catch (error) {
            // Error is handled by the hook
        }
    };

    return (
        <div className="min-h-screen  ">
            <div className="max-w-5xl  space-y-6">
                <Breadcrumb
                    links={[
                        { label: "Applications", isActive: false, href: "/dashboard/career" },
                        { label: application.position, isActive: false, href: `/dashboard/applications?id=${application?.career?.id}&position=${application.position}&page=1&limit=10` },
                        { label: "Create Reply", isActive: true },
                    ]}
                />



                <div className="border rounded-xl overflow-hidden">
                    {/* Application Summary Card */}
                    <div className="bg-white rounded-lg   border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">
                            Replying to Application
                        </h2>
                        <div className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">From:</span>
                                    <p className="font-medium text-gray-900">{application.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Email:</span>
                                    <p className="font-medium text-gray-900">{application.email}</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Phone:</span>
                                    <p className="font-medium text-gray-900">{application.phone}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Position:</span>
                                    <p className="font-medium text-gray-900">{application.position}</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <div className="mt-1 rounded-sm!">
                                        {getStatusBadge(application.status)}

                                    </div>
                                </div>
                                {application.career && (
                                    <div>
                                        <span className="text-sm text-gray-500">Department:</span>
                                        <p className="font-medium text-gray-900">{application.career.department}</p>
                                    </div>
                                )}
                            </div>
                            {application.career && (
                                <div>
                                    <span className="text-sm text-gray-500">Job Details:</span>
                                    <div className="mt-1 bg-muted/80 p-4 rounded-sm space-y-2">
                                        <p className="font-medium text-gray-900">{application.career.title}</p>
                                        <div className="flex gap-4 text-sm text-gray-600">
                                            <span>📍 {application.career.location}</span>
                                            <span>💼 {application.career.jobType.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div>
                                <span className="text-sm text-gray-500">Received At:</span>
                                <p className="text-gray-700">
                                    {application.createdAt
                                        ? format(new Date(application.createdAt), "MMMM dd, yyyy 'at' hh:mm a")
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
                                    onClick={() => navigate(-1)}
                                    disabled={isCreating}
                                >
                                    Back
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
                Failed to load application details. Please try again later.
            </p>
        </div>
    </div>
);
