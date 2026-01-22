import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader, Settings, User, Upload, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import { api } from "@/services/api";

const formSchema = z.object({
  firstname: z.string().min(2, "First name must be at least 2 characters").max(50),
  middlename: z.string().max(50).optional(),
  lastname: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters").max(20),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  address: z.string().min(3, "Address must be at least 3 characters").max(200),
  isVerified: z.boolean(),
  profile: z.any().optional(),
});

interface UpdateProfileCredentialSheetProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
}

export default function UpdateProfileCredentialSheet({ user, onUpdate }: UpdateProfileCredentialSheetProps) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: user?.firstname || "",
      middlename: user?.middlename || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      phone: user?.phone || "",
      gender: user?.gender || "MALE",
      address: user?.address || "",
      isVerified: user?.isVerified || false,
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        firstname: user.firstname || "",
        middlename: user.middlename || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "MALE",
        address: user.address || "",
        isVerified: user.isVerified || false,
      });
      setProfilePreview(user.profile || null);
    }
  }, [user, isOpen, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("profile", file);
    }
  };

  const removeprofile = () => {
    setProfilePreview(null);
    form.setValue("profile", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const userId = user?.id || user?._id;
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("firstname", values.firstname);
      formData.append("lastname", values.lastname);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("gender", values.gender);
      formData.append("address", values.address);
      formData.append("isVerified", String(values.isVerified));

      if (values.middlename) {
        formData.append("middlename", values.middlename);
      }

      if (values.profile) {
        formData.append("profile", values.profile);
      }

      const response = await api.put(
        `/admin/update-users/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        toast.success("Profile updated successfully!");

        // Fetch updated user data
        const userResponse = await api.get(`/admin/get-users/${userId}`);
        if (userResponse.data?.status === 200 && userResponse.data?.data) {
          const updatedUser = userResponse.data.data;
          useUserStore.getState().saveInfo({ user: updatedUser });
          onUpdate(updatedUser);
        }

        setIsOpen(false);
        setProfilePreview(null);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="gap-2 size-10 rounded-full flex hover:text-black cursor-pointer justify-center items-center bg-transparent  text-white hover:bg-gray-100 shadow-sm border border-gray-200">
          <Settings size={16} className="size-4!" />
        </button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-xl z-[999] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Update Profile
          </SheetTitle>
          <SheetDescription>
            Update your profile information and profile picture.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="space-y-3">
              <FormLabel>Profile Picture</FormLabel>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {profilePreview ? (
                    <div className="relative">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-orange-100"
                      />
                      <button
                        type="button"
                        onClick={removeprofile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label htmlFor="profile-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} className="mr-2" />
                      {profilePreview ? "Change Picture" : "Upload Picture"}
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500">
                    JPG, PNG or GIF (max. 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <Input placeholder="John" {...field} className="h-11" />
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
                    <Input placeholder="Doe" {...field} className="h-11" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="middlename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name (Optional)</FormLabel>
                  <Input placeholder="Middle name" {...field} className="h-11" />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    placeholder="your.email@example.com"
                    {...field}
                    className="h-11"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    placeholder="+977 9812345678"
                    {...field}
                    className="h-11"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender Field */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
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

            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <Input
                    placeholder="Kathmandu, Nepal"
                    {...field}
                    className="h-11"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Verification Toggle */}
            <FormField
              control={form.control}
              name="isVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Verification Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Toggle to verify or unverify this account
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                disabled={isUpdating}
                className="flex-1 h-11"
                type="submit"
              >
                {isUpdating ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <User size={16} className="mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
