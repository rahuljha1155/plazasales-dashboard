import { useState } from "react";
import { Send, X, Mail, User } from "lucide-react";
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
import { useCreateContactReply } from "@/hooks/useReply";
import type { IContact } from "@/types/Icontact";

interface ReplyDialogProps {
    contact: IContact;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReplyDialog({ contact, open, onOpenChange }: ReplyDialogProps) {
    const [message, setMessage] = useState("");
    const { mutateAsync: sendReply, isPending } = useCreateContactReply();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        try {
            await sendReply({
                message: message.trim(),
                contactId: contact.id,
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
                        Reply to Contact
                    </DialogTitle>
                    <DialogDescription>
                        Send a reply to {contact.fullname}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Contact Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Recipient:</span>
                            <span className="text-sm text-gray-900">{contact.fullname}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Email:</span>
                            <span className="text-sm text-gray-900">{contact.email}</span>
                        </div>
                        {contact.purpose && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Purpose:</span>
                                <span className="text-sm text-gray-900">{contact.purpose}</span>
                            </div>
                        )}
                    </div>

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
