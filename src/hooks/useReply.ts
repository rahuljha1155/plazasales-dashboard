import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createContactReply,
    createApplicationReply,
    type ICreateContactReplyRequest,
    type ICreateApplicationReplyRequest
} from "@/services/reply";
import { toast } from "sonner";

export function useCreateContactReply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ICreateContactReplyRequest) => createContactReply(data),
        onSuccess: (data) => {
            toast.success(data.message || "Reply sent successfully");
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to send reply");
        },
    });
}

export function useCreateApplicationReply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ICreateApplicationReplyRequest) => createApplicationReply(data),
        onSuccess: (data) => {
            toast.success(data.message || "Reply sent successfully");
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            queryClient.invalidateQueries({ queryKey: ["application"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to send reply");
        },
    });
}
