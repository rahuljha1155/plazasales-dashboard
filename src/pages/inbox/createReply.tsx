import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableShimmer } from "@/components/table-shimmer";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import RichTextEditor from "@/components/RichTextEditor";
import { useGetContactById } from "@/hooks/useContact";
import { useCreateContactReply } from "@/hooks/useReply";
import { format } from "date-fns";

export default function CreateContactReply() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: response, isLoading, isError } = useGetContactById(id || "");
    const { mutateAsync: createReply, isPending: isCreating } = useCreateContactReply();

    const [message, setMessage] = useState("");

    if (isLoading) return <PageLoader />;
    if (isError || !response?.contact) return <PageError />;

    const contact = response.contact;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || !id) {
            return;
        }

        try {
            await createReply({
                message: message,
                contactId: id,
            });
            navigate(`/dashboard/inbox/${id}`);
        } catch (error) {
            // Error is handled by the hook
        }
    };

    return (
        <div className="min-h-screen  ">
            <div className="max-w-5xl  space-y-6">
                <Breadcrumb
                    links={[
                        { label: "Inbox", isActive: false, href: `/dashboard/inbox` },
                        { label: "Create Reply", isActive: true },
                    ]}
                />


                <div className="border rounded-xl overflow-hidden">
                    {/* Contact Summary Card */}
                    <div className="bg-white rounded-lg   border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">
                            Replying to Contact
                        </h2>
                        <div className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">From:</span>
                                    <p className="font-medium text-gray-900">{contact.fullname}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Email:</span>
                                    <p className="font-medium text-gray-900">{contact.email}</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Phone:</span>
                                    <p className="font-medium text-gray-900">{contact.phoneNo}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Purpose:</span>
                                    <p className="font-medium text-gray-900">{contact.purpose || "N/A"}</p>
                                </div>
                            </div>
                            {contact.organization && (
                                <div>
                                    <span className="text-sm text-gray-500">Organization:</span>
                                    <p className="font-medium text-gray-900">{contact.organization}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-sm text-gray-500">Client Message:</span>
                                <p className="mt-1 text-gray-700  bg-muted/80 p-4 rounded-sm">
                                    {contact.message}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Received At:</span>
                                <p className="text-gray-700">
                                    {contact.createdAt
                                        ? format(new Date(contact.createdAt), "MMMM dd, yyyy 'at' hh:mm a")
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
                                    onClick={() => navigate(`/dashboard/inbox/${id}`)}
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
                Failed to load contact details. Please try again later.
            </p>
        </div>
    </div>
);
