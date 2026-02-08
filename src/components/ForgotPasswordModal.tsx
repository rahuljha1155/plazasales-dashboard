import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { api2 } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Icon } from "@iconify/react/dist/iconify.js";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ForgotPasswordModal({
  open,
  onOpenChange,
}: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsLoading(true);
      const res = await api2.post("/auth/forgot-password", values);
      
      // Check if the response indicates success
      if (res.data.status === 200 || res.status === 200) {
        // Check if the message indicates an error (like "user not found")
        const message = res.data.message || "";
        const isError = message.toLowerCase().includes("not found") || 
                       message.toLowerCase().includes("does not exist") ||
                       message.toLowerCase().includes("invalid");
        
        if (isError) {
          toast.error(message, {
            description: "Please check the email address and try again.",
            position: "bottom-right",
            duration: 5000,
          });
        } else {
          toast.success(message || "Password reset link sent to your email", {
            description: "Please check your inbox and follow the instructions to reset your password.",
            position: "bottom-right",
            duration: 8000,
          });
          form.reset();
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send reset link";
      toast.error(errorMessage, {
        description: "If the issue persists, contact support for assistance.",
        position: "bottom-right",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#D42327]"
              >
                {isLoading && <Loader size={16} className="animate-spin mr-2" />}
                Send Reset Link
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
