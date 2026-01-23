"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import RichTextEditor from "../RichTextEditor";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import type { Member } from "@/types/team-member";
import { useCreateTeamMember, useUpdateTeamMember } from "@/hooks/useTeam";
import type { ITeamMember } from "@/types/ITeammember";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  memberType: z.enum(["boardmember", "fieldhero"], {
    required_error: "Member type is required",
  }),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  addToHome: z.boolean().optional(),
});

interface MemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: ITeamMember;
  onSuccess: () => void;
}

export function MemberSheet({
  open,
  onOpenChange,
  member,
  onSuccess,
}: MemberSheetProps) {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [cvImage, setCvImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);


  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    member?.image || null
  );
  const [cvImagePreview, setCvImagePreview] = useState<string | null>(
    member?.cvImage || null
  );
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    member?.gallery || []
  );

  const { mutate: updateMember, isPending: isUpdatePending } =
    useUpdateTeamMember(member?._id as string);

  const { mutate: addMember, isPending: isAddPending } = useCreateTeamMember();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: member?.name || "",
      designation: member?.designation || "",
      memberType: (member?.memberType as "boardmember" | "fieldhero") || "boardmember",
      countryCode: member?.countryCode || "+1",
      phoneNumber: member?.phoneNumber || "",
      description: member?.description || "",
      facebook: member?.facebook || "",
      twitter: member?.twitter || "",
      linkedin: member?.linkedin || "",
      instagram: member?.instagram || "",
      addToHome: member?.addToHome ?? false,
    },
  });

  const onOpenChangeHandler = () => {
    onOpenChange(false);
    form.reset();
    setProfileImage(null);
    setCvImage(null);
    setGalleryImages([]);
    setProfileImagePreview(null);
    setCvImagePreview(null);
    setGalleryPreviews([]);
    form.reset();
  };

  useEffect(() => {
    if (!open) {
      onOpenChangeHandler();
    }
  }, [open, onOpenChange]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("designation", values.designation);
      formData.append("memberType", values.memberType);
      formData.append("countryCode", values.countryCode);
      formData.append("description", values.description);
      
      if (values.phoneNumber) {
        formData.append("phoneNumber", values.phoneNumber);
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

      if (typeof values.addToHome === "boolean") {
        formData.append("addToHome", String(values.addToHome));
      }

      if (profileImage) {
        formData.append("image", profileImage);
      }

      if (cvImage) {
        formData.append("cvImage", cvImage);
      }

      galleryImages.forEach((image) => {
        formData.append(`gallery`, image);
      });

      if (member) {
        updateMember(formData, {
          onSuccess: () => {
            toast(`Team member updated successfully`);
            onSuccess();
            onOpenChangeHandler();
          },
          onError: () => {
            toast(`Failed to update team member`);
          },
        });
      } else {
        addMember(formData, {
          onSuccess: () => {
            toast(`Team member created successfully`);
            onSuccess();
            onOpenChangeHandler();
          },
          onError: () => {
            toast(`Failed to create team member`);
          },
        });
      }
    } catch (error) {
      toast(`Failed to ${member ? "update" : "create"} team member`);
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setGalleryImages((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            <span className="text-xl text-primary font-bold">
              {member ? "Edit Team Member" : "Add Team Member"}
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Member name" {...field} />
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
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Member designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="boardmember">
                          Board Member
                        </SelectItem>
                        <SelectItem value="fieldhero">Field Hero</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormLabel>Country Code</FormLabel>
                      <FormControl>
                        <Input placeholder="+1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="w-2/3">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone number (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        initialContent={field.value || ""}
                        onChange={(content) => field.onChange(content)}
                        placeholder="Member description"
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="Facebook URL" {...field} />
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
                          <Input placeholder="Twitter URL" {...field} />
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
                          <Input placeholder="LinkedIn URL" {...field} />
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
                          <Input placeholder="Instagram URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setProfileImage(e.target.files?.[0] || null);
                        setProfileImagePreview(
                          e.target.files?.[0]
                            ? URL.createObjectURL(e.target.files[0])
                            : null
                        );
                      }}
                    />
                  </FormControl>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Recommended size: 400x400px
                  </p>
                </FormItem>
                {profileImagePreview && (
                  <div className="mt-2">
                    <img
                      src={profileImagePreview || "/placeholder.svg"}
                      alt="Profile preview"
                      className="w-24 h-24 object-cover rounded-full"
                    />
                  </div>
                )}
              </div>

              <div>
                <FormItem>
                  <FormLabel>CV Image (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setCvImage(e.target.files?.[0] || null);
                        setCvImagePreview(
                          e.target.files?.[0]
                            ? URL.createObjectURL(e.target.files[0])
                            : null
                        );
                      }}
                    />
                  </FormControl>
                </FormItem>
                {cvImagePreview && (
                  <div className="mt-2">
                    <img
                      src={cvImagePreview || "/placeholder.svg"}
                      alt="CV preview"
                      className="w-40 h-auto object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <FormItem>
                  <FormLabel>Gallery Images (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImageChange}
                    />
                  </FormControl>
                </FormItem>
                {galleryPreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Gallery preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-0 h-6 w-6 p-0"
                          onClick={() => removeGalleryImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormField
                control={form.control}
                name="addToHome"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Add to Home</FormLabel>
                    </div>
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
                  disabled={isAddPending || isUpdatePending}
                >
                  {member ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
