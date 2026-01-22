"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "../RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Send, X, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BookingReplyStatus, type BookingReplyData } from "@/types/booking";
import { Input } from "../ui/input";
import { api } from "@/services/api";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";

const replySchema = z.object({
  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(500, "Message cannot exceed 500 characters"),
  subject: z.string().optional(), // Optional field for subject
  status: z.nativeEnum(BookingReplyStatus, {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
});

type ReplyFormData = z.infer<typeof replySchema>;

const statusOptions = [
  {
    value: BookingReplyStatus.APPROVED,
    label: "Approved",
    description: "Accept the booking request",
    color: "text-green-600",
  },
  {
    value: BookingReplyStatus.DECLINED,
    label: "Declined",
    description: "Reject the booking request",
    color: "text-red-600",
  },
  {
    value: BookingReplyStatus.RESCHEDULED,
    label: "Rescheduled",
    description: "Request to reschedule the booking",
    color: "text-orange-600",
  },
  {
    value: BookingReplyStatus.PENDING,
    label: "Pending",
    description: "Keep the booking under review",
    color: "text-yellow-600",
  },
];

export default function CustomBookingReply() {
  const { id: bookingId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get status from URL parameters
  const statusFromUrl = searchParams.get("status") as BookingReplyStatus | null;
  const initialStatus =
    statusFromUrl && Object.values(BookingReplyStatus).includes(statusFromUrl)
      ? statusFromUrl
      : BookingReplyStatus.PENDING;

  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      message: "",
      status: initialStatus,
      subject: "", // Optional field if needed
    },
  });

  // Update form status when URL parameter changes
  useEffect(() => {
    if (
      statusFromUrl &&
      Object.values(BookingReplyStatus).includes(statusFromUrl)
    ) {
      form.setValue("status", statusFromUrl);
    }
  }, [statusFromUrl, form]);

  const handleSubmit = async (data: ReplyFormData) => {
    setIsLoading(true);
    try {
      //@ts-ignore
      const replyData: BookingReplyData = {
        bookingId: bookingId ?? "",
        message: data.message,
        //@ts-ignore
        status: data.status,
        subject: data.subject,
      };

      const response = await api.post("/custom-booking-reply", replyData);
      if (response.status === 200 || response.status === 201) {
        toast.success("Reply sent successfully");
      } else {
        toast.error("Failed to send reply. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send reply. Please try again.");
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  const selectedStatus = form.watch("status");
  const selectedStatusOption = statusOptions.find(
    (option) => option.value === selectedStatus
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Link to={"/dashboard/bookings"} className="flex items-center gap-2 mb-4">
        <ArrowLeft
          size={20}
          className="cursor-pointer "
          onClick={() => window.history.back()}
        />
        <h2 className="text-lg font-semibold">Back</h2>
      </Link>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Reply to Custom Booking
        </CardTitle>
        <CardDescription>
          Booking ID: <span className="font-mono text-sm">{bookingId}</span>
        </CardDescription>
        {statusFromUrl && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-sm">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:info-circle-bold"
                width="16"
                height="16"
                className="text-orange-600"
              />
              <span className="text-sm text-orange-800 font-medium">
                Status pre-selected from invoice:{" "}
                <span className="capitalize font-semibold">
                  {statusFromUrl}
                </span>
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className={`font-medium ${option.color}`}>
                              {option.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Preview */}
            {selectedStatusOption && (
              <div className="p-3 rounded-sm bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Selected Status:</span>
                  <span
                    className={`font-semibold ${selectedStatusOption.color}`}
                  >
                    {selectedStatusOption.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedStatusOption.description}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your subject" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Field */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reply Message *</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      initialContent={field.value || ""}
                      onChange={(content) => field.onChange(content)}
                      placeholder="Enter your reply message to the customer..."
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Minimum 10 characters required</span>
                    <span>{field.value.length}/500</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Reply...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
