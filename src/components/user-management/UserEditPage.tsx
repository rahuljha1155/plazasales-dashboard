import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateUser, useUpdateUser } from "@/hooks/useAdmin";
import type { User } from "@/hooks/useAdmin";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import Breadcrumb from "../dashboard/Breadcumb";

const formSchema = (isEditing: boolean, showIsVerified: boolean) =>
  z.object({
    email: z.string().email("Email is required"),
    password: isEditing
      ? z.string().optional()
      : z.string().min(6, "Password must be at least 6 characters"),
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
      required_error: "Gender is required",
    }),
    ...(showIsVerified ? { isVerified: z.boolean() } : {}),
  });

interface UserEditPageProps {
  user?: User;
  onBack: () => void;
  onSuccess: () => void;
}

export function UserEditPage({ user, onBack, onSuccess }: UserEditPageProps) {
  const currentUser = useUserStore((s) => s.user);
  const showIsVerified = currentUser?.role === "ADMIN";
  const { mutateAsync: createUser, isPending: isCreatePending } =
    useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdatePending } =
    useUpdateUser(user?.id || "");
  const [showPassword, setShowPassword] = useState(false);


  const form = useForm<any>({
    resolver: zodResolver(formSchema(!!user, showIsVerified)),
    defaultValues: {
      email: user?.email || "",
      password: "",
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      phone: user?.phone || "",
      address: user?.address || "",
      gender: user?.gender || "MALE",
      ...(showIsVerified ? { isVerified: user?.isVerified ?? false } : {}),
    },
  });

  useEffect(() => {
    form.reset({
      email: user?.email || "",
      password: "",
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      phone: user?.phone || "",
      address: user?.address || "",
      gender: user?.gender || "MALE",
      ...(showIsVerified ? { isVerified: user?.isVerified ?? false } : {}),
    });
    // eslint-disable-next-line
  }, [user, showIsVerified]);

  const onSubmit = async (values: any) => {
    if (user) {
      await updateUser(
        {
          firstname: values.firstname,
          lastname: values.lastname,
          phone: values.phone,
          address: values.address,
          gender: values.gender,
          ...(showIsVerified ? { isVerified: values.isVerified } : {}),
        },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            onSuccess();
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || "Failed to update user"
            );
          },
        }
      );
    } else {
      createUser(
        {
          email: values.email,
          password: values.password!,
          firstname: values.firstname,
          lastname: values.lastname,
          phone: values.phone,
          address: values.address,
          gender: values.gender,
          ...(showIsVerified ? { isVerified: values.isVerified } : {}),
        },
        {
          onSuccess: () => {
            toast.success("User created successfully");
            onSuccess();
          },
          onError: (error: any) => {
            toast.error(
              error.response?.data?.message || "Failed to create user"
            );
          },
        }
      );
    }
  };

  return (
    <div className="container mx-auto ">

      {user ? (<Breadcrumb links={[
        {
          label: "Users",
          href: "/dashboard/user-management",
          handleClick: onBack
        },
        {
          label: "Edit User",
          href: "#",
        },
      ]} />) : (
        <Breadcrumb links={[
          {
            label: "Users",
            href: "/dashboard/user-management",
            handleClick: onBack
          },
          {
            label: "Add User",
            href: "#",
          },
        ]} />
      )}

      <div className="max-w-3xl border mt-4 p-6 rounded-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} disabled={!!user} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!user && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-zinc-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-zinc-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+977XXXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showIsVerified && (
              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex gap-2">
                    <FormLabel>Verified</FormLabel>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        className="mr-2 size-4 rounded-full"

                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatePending || isUpdatePending}
              >
                {user ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
