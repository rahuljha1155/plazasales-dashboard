import { useState } from "react";
import { Send, X, Mail, User, Briefcase } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCreateApplicationReply } from "@/hooks/useReply";
import type { IApplication } from "@/types/IApplication";

interface ApplicationReplyDialogProps {
    application: IApplication;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicationReplyDialog({ application, open, onOpenChange }: ApplicationReplyDialogProps) {
    const [message, setMessage] = useState("");
    const { mutateAsync: sendReply, isPending } = useCreateApplicationReply();

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: { color: "bg-yellow-500", label: "Pending" },
            REVIEWED: { color: "bg-blue-500", label: "Reviewed" },
            ACCEPTED: { color: "bg-green-500", label: "Accepted" },
            REJECTED: { color: "bg-red-500", label: "Rejected" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

        return (
            <Badge className={`${config.color} text-white hover:${config.color}`}>
                {config.label}
            </Badge>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        try {
            await sendReply({
                message: message.trim(),
                jobApplicationId: application.id,
            });
            setMessage("");
            onOpenChange(false);
        } catch (error) {
            // Error is handled by the hook
        }
    };

    const handleClose = () => {
        if (!isPending) {
            setMessage("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Mail className="h-5 w-5 text-primary" />
                        Reply to Application
                    </DialogTitle>
                    <DialogDescription>
                        Send a reply to {application.name}'s application
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Application Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Applicant:</span>
                                <span className="text-sm text-gray-900">{application.name}</span>
                            </div>
                            {getStatusBadge(application.status)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Email:</span>
                            <span className="text-sm text-gray-900">{application.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Position:</span>
                            <span className="text-sm text-gray-900">{application.position}</span>
                        </div>
                    </div>

                    {/* Previous Replies */}
                    {application.replies && application.replies.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Previous Replies ({application.replies.length})</Label>
                            <div className="max-h-32 overflow-y-auto space-y-2">
                                {application.replies.slice(-2).map((reply) => (
                                    <div key={reply.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                                        <p className="text-gray-700">{reply.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(reply.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message Input */}
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">
                            Your Message
                        </Label>
                        <Textarea
                            id="message"
                            placeholder="Type your reply message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[200px] resize-none"
                            disabled={isPending}
                            required
                        />
                        <p className="text-xs text-gray-500">
                            {message.length} characters
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isPending}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !message.trim()}
                            className="gap-2 bg-primary hover:bg-primary"
                        >
                            <Send className="h-4 w-4" />
                            {isPending ? "Sending..." : "Send Reply"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
