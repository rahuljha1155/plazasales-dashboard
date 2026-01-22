import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, User, MessageSquare, FileText, Eye } from "lucide-react";
import type { Contact } from "@/types/contact";

interface ContactViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactData: Contact | null;
}

export function ContactViewModal({
  isOpen,
  onClose,
  contactData,
}: ContactViewModalProps) {
  if (!contactData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Contact Message
            </DialogTitle>
            <Badge
              variant="secondary"
              className={
                contactData.seen
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              <Eye className="h-3 w-3 mr-1" />
              {contactData.seen ? "Read" : "Unread"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-muted/50 p-4 rounded-sm space-y-3">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Name:</span> {contactData.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Email:</span>{" "}
                  <a
                    href={`mailto:${contactData.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contactData.email}
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Subject:</span>{" "}
                  {contactData.subject}
                </span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Message</h3>
            <div className="bg-gray-50 p-4 rounded-sm border-l-4 border-blue-500">
              <p className="text-sm whitespace-pre-wrap">
                {contactData.message}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <a
              href={`mailto:${contactData.email}?subject=Re: ${contactData.subject}`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-[2px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Mail className="h-4 w-4 mr-2" />
              Reply via Email
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
