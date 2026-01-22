"use client";

import { Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcumb from "@/components/dashboard/Breadcumb";
import { useGetContactById } from "@/hooks/useContact";
import { ViewContact } from "./ViewContact";
import { Link } from "react-router-dom";

interface ContactDetailsViewProps {
    contactId: string;
    onBack: () => void;
}

export function ContactDetailsView({ contactId, onBack }: ContactDetailsViewProps) {
    const { data, isLoading, isError } = useGetContactById(contactId);
    const contact = data?.contact;

    const links = [
        {
            to: "/dashboard/inbox",
            label: "Inbox",
            isActive: false,
            href: "/dashboard/inbox/"
        },
        {
            to: "#",
            label: "Contact Details",
            isActive: true,
        },
    ];

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <div className="flex items-center justify-between">
                    <Breadcumb links={links} />
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className=" bg-muted/80">
                    <div className=" rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between ">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    </div>

                    <div className=" rounded-lg shadow-sm border border-gray-200 p-6">
                        <Skeleton className="h-6 w-40 mb-4" />
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !contact) {
        return (
            <div className="w-full">
                <Breadcumb links={links} />
                <div className="flex items-center justify-center h-64">
                    <p className="text-zinc-500">Contact not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <Breadcumb links={links} />
                <div className="flex items-center gap-2">
                    <Link to={`/dashboard/inbox/${contactId}/reply`}>
                        <Button
                            className="flex items-center gap-2 bg-primary hover:bg-primary"
                        >
                            <Reply className="h-4 w-4" />
                            Send Reply
                        </Button>
                    </Link>
                </div>
            </div>
            <ViewContact contact={contact} />
        </div>
    );
}
