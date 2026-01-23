import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { toast } from "sonner";

import type { Member } from "@/types/team-member";
import { useCreateTeamMember, useUpdateTeamMember } from "@/hooks/useTeam";
import { ImageUploadField } from "../ui/ImageUploads";
import { postTeamSchema, type PostTeamData } from "@/schema/team";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/RichTextEditor";
import { Checkbox } from "../ui/checkbox";

interface MemberFormProps {
  member?: Member;
  onSuccess: () => void;
  onCancel: () => void;
}

// Country codes for the select dropdown
const COUNTRY_CODES = [
  { value: "+977", label: "+977 (Nepal)" },
  { value: "+1", label: "+1 (USA/Canada)" },
  { value: "+44", label: "+44 (UK)" },
  { value: "+91", label: "+91 (India)" },
  { value: "+86", label: "+86 (China)" },
  { value: "+81", label: "+81 (Japan)" },
  { value: "+82", label: "+82 (South Korea)" },
  { value: "+61", label: "+61 (Australia)" },
  { value: "+33", label: "+33 (France)" },
  { value: "+49", label: "+49 (Germany)" },
];

export function MemberForm({ member, onSuccess, onCancel }: MemberFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    member?.image || null
  );
  const [imageRemoved, setImageRemoved] = useState(false);

  const { mutate: updateMember, isPending: isUpdatePending } =
    useUpdateTeamMember(member?.id as string);

  const { mutate: addMember, isPending: isAddPending } = useCreateTeamMember();

  const form = useForm<PostTeamData>({
    resolver: zodResolver(postTeamSchema),
    defaultValues: {
      addToHome: member?.addToHome ? "true" : undefined,
      fullname: member?.fullname || "",
      designation: member?.designation || "",
      countryCode: member?.countryCode || "+977",
      phoneNumber: member?.phoneNumber || "",
      isLeader: member?.isLeader ? "true" : undefined,
      description: member?.description || "",
      facebook: member?.facebook || "",
      twitter: member?.twitter || "",
      linkedin: member?.linkedin || "",
      instagram: member?.instagram || "",
      image: undefined,
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        addToHome: member.addToHome ? "true" : undefined,
        fullname: member.fullname || "",
        designation: member.designation || "",
        countryCode: member.countryCode || "+977",
        phoneNumber: member.phoneNumber || "",
        isLeader: member.isLeader ? "true" : undefined,
        description: member.description?.text || "",
        facebook: member.facebook || "",
        twitter: member.twitter || "",
        linkedin: member.linkedin || "",
        instagram: member.instagram || "",
        image: undefined,
      });
      setImagePreview(member.image || null);
      setImageRemoved(false);
    } else {
      form.reset({
        addToHome: undefined,
        fullname: "",
        designation: "",
        countryCode: "+977",
        phoneNumber: "",
        isLeader: undefined,
        description: "",
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
        image: undefined,
      });
      setImagePreview(null);
      setImageRemoved(false);
    }
    setImage(null);
  }, [member, form]);

  const onSubmit = async (values: PostTeamData) => {
    try {
      const formData = new FormData();

      if (values.addToHome) {
        formData.append("addToHome", values.addToHome);
      }
      formData.append("fullname", values.fullname);
      formData.append("designation", values.designation);
      formData.append("countryCode", values.countryCode);
      formData.append("phoneNumber", values.phoneNumber);

      if (values.isLeader) {
        formData.append("isLeader", values.isLeader);
      }
      if (values.description) {
        formData.append("description", values.description);
      }

      // For edit mode: always send social media fields (even if empty) so backend knows to clear them
      if (member) {
        formData.append("facebook", values.facebook || "");
        formData.append("twitter", values.twitter || "");
        formData.append("linkedin", values.linkedin || "");
        formData.append("instagram", values.instagram || "");
      } else {
        // For create mode: only send if not empty
        if (values.facebook) formData.append("facebook", values.facebook);
        if (values.twitter) formData.append("twitter", values.twitter);
        if (values.linkedin) formData.append("linkedin", values.linkedin);
        if (values.instagram) formData.append("instagram", values.instagram);
      }

      if (image) {
        formData.append("image", image);
      } else if (member && imageRemoved) {
        formData.append("removeImage", "true");
      }

      if (member) {
        updateMember(formData, {
          onSuccess: () => {
            toast.success("Team member updated successfully");
            onSuccess();
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update team member");
          },
        });
      } else {
        addMember(formData, {
          onSuccess: () => {
            toast.success("Team member created successfully");
            onSuccess();
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create team member");
          },
        });
      }
    } catch (error) {
      toast.error(`Failed to ${member ? "update" : "create"} team member`);
    }
  };

  return (
    <div className="mt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, err => {
          const firstError = Object.values(err)[0];
          if (firstError) {
            const errorMsg =
              typeof firstError === "string"
                ? firstError
                : (firstError as { message?: string })?.message ?? "Form error";
            toast.error(errorMsg);
          }
        })} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-xl text-primary font-semibold ">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Designation <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Guide, CEO" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>


          {/* Profile Image Section */}
          <div className="space-y-4">
            <h3 className="text-xl text-primary font-semibold ">
              Profile Image
            </h3>

            <FormItem>
              <FormLabel>
                Image <span className="text-gray-500">(Optional)</span>
              </FormLabel>
              <FormControl>
                <ImageUploadField
                  previewUrl={imagePreview}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImage(file);
                      setImagePreview(URL.createObjectURL(file));
                      setImageRemoved(false);
                    } else {
                      // This handles the remove case
                      setImage(null);
                      setImagePreview(null);
                      if (member?.image) {
                        setImageRemoved(true);
                      }
                    }
                  }}
                  name="image"
                  label="Upload Team Member Image"
                />
              </FormControl>
            </FormItem>
          </div>



          {/* Add to Home Option */}
          <div className="space-y-4">
            <h3 className="text-xl text-primary font-semibold ">
              Display Options
            </h3>

            <div className="flex gap-10 items-center">
              <FormField
                control={form.control}
                name="addToHome"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "true"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "true" : undefined);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Add to Home Page
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isLeader"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "true"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "true" : undefined);
                          }}
                          className="h-4 w-4 rounded border-gray-300 "
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Is Leader
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>


          {/* Description Section - Only show if isLeader is true */}
          {form.watch("isLeader") === "true" && (
            <div className="space-y-4">
              <h3 className="text-xl text-primary font-semibold ">
                Leader Description
              </h3>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-gray-500">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <RichTextEditor
                        initialContent={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Enter detailed description for the leader..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl text-primary font-semibold ">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Country Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_CODES.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-xl text-primary font-semibold ">
              Social Media Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://facebook.com/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://twitter.com/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>







          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isAddPending || isUpdatePending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAddPending || isUpdatePending}
            >
              {isAddPending || isUpdatePending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {member ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{member ? "Update Member" : "Create Member"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
