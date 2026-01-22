import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api2 } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const passwordRequirements = {
  minLength: 6,
  regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/,
  message:
    "Password must be at least 6 characters long and include at least one letter, one number, and one special character.",
};

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(passwordRequirements.minLength, { message: passwordRequirements.message })
      .regex(passwordRequirements.regex, { message: passwordRequirements.message }),
    confirmPassword: z
      .string()
      .min(passwordRequirements.minLength, { message: passwordRequirements.message })
      .regex(passwordRequirements.regex, { message: passwordRequirements.message }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = searchParams.get("resetToken");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate("/login");
    }
  }, [token, navigate]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    try {
      setIsLoading(true);
      const res = await api2.patch("/auth/reset-password", {
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (res.data.status === 200) {
        toast.success(res.data.message || "Password reset successfully");
        form.reset();
        navigate("/login");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-4"
        >
          <Card className="w-full border border-border rounded-sm">
            <CardHeader className="text-center pt-6">
              <div className="flex justify-center p-4">
                <img
                  src="/logos/letter-logo.png"
                  alt="Company Logo"
                  width={800}
                  height={84}
                  className="w-52 h-auto"
                />
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Enter your new password to reset your account
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 px-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      New Password <span className="text-yellow-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                          className="pr-10 bg-white mt-1 h-8"
                        />
                        <div className="absolute -translate-y-1/2 top-1/2 right-3 flex items-center cursor-pointer text-muted-foreground">
                          {showPassword ? (
                            <EyeOff
                              size={18}
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <Eye
                              size={18}
                              onClick={() => setShowPassword(true)}
                            />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm Password <span className="text-yellow-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                          className="pr-10 bg-white mt-1 h-8"
                        />
                        <div className="absolute -translate-y-1/2 top-1/2 right-3 flex items-center cursor-pointer text-muted-foreground">
                          {showConfirmPassword ? (
                            <EyeOff
                              size={18}
                              onClick={() => setShowConfirmPassword(false)}
                            />
                          ) : (
                            <Eye
                              size={18}
                              onClick={() => setShowConfirmPassword(true)}
                            />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={isLoading}
                type="submit"
                className="bg-[#D42327]"
              >
                {isLoading && <Loader size={16} className="animate-spin mr-2" />}
                Reset Password
              </Button>

              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
