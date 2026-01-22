import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    User,
    Phone,
    MapPin,
    Building2,
    Calendar,
    MessageSquare,
    Target
} from "lucide-react";
import type { IContact } from "@/types/Icontact";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ViewContactProps {
    contact: IContact;
}

export function ViewContact({ contact }: ViewContactProps) {
    return (
        <div className="bg-muted/80 p-8 rounded-2xl space-y-10 border border-zinc-200/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-200/60">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{contact.fullname}</h1>
                        <div className="flex items-center gap-2">
                            {contact.isView ? (
                                <Badge className="bg-emerald-500/10 py-0.5! text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1 rounded-full gap-1 font-semibold shadow-none">
                                    Viewed
                                </Badge>
                            ) : (
                                <Badge className="bg-primary/10 py-0.5! text-primary hover:bg-primary/20 border-primary/20 px-3 py-1 rounded-full gap-1 font-semibold shadow-none">
                                    Unread
                                </Badge>
                            )}
                        </div>
                    </div>
                    <p className="text-sm mt-2 font-medium text-zinc-500 flex items-center gap-2">
                        <span className="bg-zinc-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">ID</span>
                        {contact.id}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2  bg-white rounded-full border border-zinc-200 text-primary">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest leading-none mb-1">Received</span>
                            <span className="text-sm font-semibold text-zinc-900">{format(new Date(contact.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Contact Information */}
                <div className="lg:col-span-12 space-y-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Contact Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                        <DetailItem
                            label="Email Address"
                            value={contact.email}
                            icon={<Mail className="h-5 w-5" />}
                        />
                        <DetailItem
                            label="Phone Number"
                            value={contact.phoneNo || "Not provided"}
                            icon={<Phone className="h-5 w-5" />}
                        />
                        <DetailItem
                            label="Address"
                            value={contact.address || "Not provided"}
                            icon={<MapPin className="h-5 w-5" />}
                        />
                        <DetailItem
                            label="Organization"
                            value={contact.organization || "No Organization"}
                            icon={<Building2 className="h-5 w-5" />}
                        />
                        <DetailItem
                            label="Purpose"
                            value={contact.purpose || "Not specified"}
                            icon={<Target className="h-5 w-5" />}
                        />
                    </div>
                </div>

                {/* Message Content */}
                {contact.message && (
                    <div className="lg:col-span-12 space-y-6 pt-6 border-t border-zinc-200/60">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                                Message Body
                            </h2>
                        </div>
                        <div className="bg-white/60 p-8 rounded-2xl border border-zinc-200/50 relative">
                            <p className="text-zinc-700 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                                {contact.message}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline Section */}
            <div className="pt-8 border-t border-zinc-200/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <Icon icon="lucide:clock" className="w-3.5 h-3.5" />
                    Last Engagement Timeline
                </div>
                <div className="flex gap-4">
                    <div className="text-[11px] text-zinc-500 font-medium">
                        Updated {format(new Date(contact.updatedAt), "MMMM dd, yyyy 'at' hh:mm a")}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Refined Detail Item Component
const DetailItem = ({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) => (
    <div className="group flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            {label}
        </div>
        <p className="text-base font-semibold text-zinc-800 break-words pl-0 font-medium truncate" title={value}>
            {value}
        </p>
    </div>
);
