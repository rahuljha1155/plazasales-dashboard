"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const formSchema = (isEditing: boolean) =>
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
  });

interface UserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSuccess: () => void;
}

export function UserSheet({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserSheetProps) {
  const { mutateAsync: createUser, isPending: isCreatePending } =
    useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdatePending } =
    useUpdateUser(user?.id || "");

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(!!user)),
    defaultValues: {
      email: user?.email || "",
      password: "",
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      phone: user?.phone || "",
      address: user?.address || "",
      gender: user?.gender || "MALE",
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
    });
    // eslint-disable-next-line
  }, [user, open]);

  const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
    if (user) {
      await updateUser(
        {
          firstname: values.firstname,
          lastname: values.lastname,
          phone: values.phone,
          address: values.address,
          gender: values.gender,
        },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            onSuccess();
            onOpenChange(false);
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
        },
        {
          onSuccess: () => {
            toast.success("User created successfully");
            onSuccess();
            onOpenChange(false);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-xl overflow-y-auto z-[9999]"
      >
        <SheetHeader>
          <SheetTitle>{user ? "Edit User" : "Add User"}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
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
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
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
                    <FormItem className="w-1/2">
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
                      <SelectContent className="z-[9999]">
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
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
      </SheetContent>
    </Sheet>
  );
}
