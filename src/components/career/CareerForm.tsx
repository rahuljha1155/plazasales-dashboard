import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { ICareer } from "@/types/ICareer";
import { useCreateCareer, useUpdateCareer, useCareer } from "@/services/career";
import { jobPostingSchema } from "@/schema/career";
import RichTextEditor from "../RichTextEditor";
import { Icon } from "@iconify/react/dist/iconify.js";

interface CareerFormProps {
  career?: ICareer;
  onSuccess: () => void;
  onCancel: () => void;
}

type CareerFormData = z.infer<typeof jobPostingSchema>;

export function CareerForm({ career, onSuccess, onCancel }: CareerFormProps) {
  const { mutate: createCareer, isPending: isCreatePending } = useCreateCareer();
  const { mutate: updateCareer, isPending: isUpdatePending } = useUpdateCareer(
    career?.id as string
  );

  // Fetch full career details if editing
  const { data: careerData, isLoading: isLoadingCareer } = useCareer(
    career?.id || "",
    !!career
  );

  const form = useForm<CareerFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: "",
      slug: "",
      department: "",
      location: "",
      jobType: "FULL_TIME",
      description: {
        overview: "",
      },
      requirements: "",
      salaryRange: "",
      isOpen: true,
      openDate: "",
      expiryDate: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control as any,
    name: "description.responsibilities",
  });

  // Load career data from fetched details
  useEffect(() => {
    if (careerData?.career) {
      const fetchedCareer = careerData.career;

      // Parse the career data based on API response structure
      let overview = "";
      let responsibilities: string[] = [""];

      // Handle description object structure
      if (fetchedCareer.description && typeof fetchedCareer.description === 'object') {
        overview = (fetchedCareer.description as any).overview || "";
        responsibilities = (fetchedCareer.description as any).responsibilities || [""];
      } else if (typeof fetchedCareer.description === 'string') {
        overview = fetchedCareer.description;
      }

      form.reset({
        title: fetchedCareer.title || "",
        slug: fetchedCareer.slug || "",
        department: fetchedCareer.department || "",
        location: fetchedCareer.location || "",
        jobType: fetchedCareer.jobType as any,
        description: {
          overview,
          responsibilities: responsibilities.length > 0 ? responsibilities : [""],
        },
        requirements: fetchedCareer.requirements || "",
        salaryRange: fetchedCareer.salaryRange || "",
        isOpen: fetchedCareer.isOpen ?? true,
        openDate: fetchedCareer.openDate || "",
        expiryDate: fetchedCareer.expiryDate || "",
      });
    } else if (!career) {
      // Reset form for creating new career
      form.reset({
        title: "",
        slug: "",
        department: "",
        location: "",
        jobType: "FULL_TIME",
        description: {
          overview: "",
          responsibilities: [""],
        },
        requirements: "",
        salaryRange: "",
        isOpen: true,
        openDate: "",
        expiryDate: "",
      });
    }
  }, [careerData, career, form]);


  useEffect(() => {
    //change slug when title changes
    const subscription = form.watch((value, { name, type }) => {
      if (name === "title" && value?.title) {
        const slug = value.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        form.setValue("slug", slug);
      }
    });

    return () => subscription.unsubscribe();
  }, [fields, append]);

  const onSubmit = async (values: CareerFormData) => {
    try {
      // Transform the data to match API expectations
      const payload = {
        title: values.title,
        department: values.department,
        location: values.location,
        jobType: values.jobType,
        description: {
          overview: values.description.overview,
          responsibilities: values.description.responsibilities.filter((r: string) => r.trim() !== ""),
        },
        requirements: values.requirements,
        salaryRange: values.salaryRange,
        isOpen: values.isOpen,
        slug: values.slug,
        openDate: values.openDate,
        expiryDate: values.expiryDate,
      };

      const action = career ? updateCareer : createCareer;

      action(payload, {
        onSuccess: () => {
          toast.success(
            `Career ${career ? "updated" : "created"} successfully`
          );
          onSuccess();
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 
            `Failed to ${career ? "update" : "create"} career`;
          toast.error(message);
        },
      });
    } catch (error) {
      toast.error(`Failed to ${career ? "update" : "create"} career`);
    }
  };

  // Show loading state while fetching career data
  if (career && isLoadingCareer) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading career details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input

                      placeholder="slug"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Engineering"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., New York, NY"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaryRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Range</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., $50,000 - $70,000"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="openDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Open Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isOpen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Position Open</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Toggle to mark this position as open or closed
                    </p>
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
          </div>

          {/* Overview */}
          <FormField
            control={form.control}
            name="description.overview"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Overview *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    initialContent={field.value ?? ""}
                    onChange={(value: string) => field.onChange(value)}
                    placeholder="Provide a brief overview of the position..."
                    className="min-h-[200px] bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />



          {/* Requirements */}
          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requirements *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    initialContent={field.value ?? ""}
                    onChange={(value: string) => field.onChange(value)}
                    placeholder="Enter job requirements (e.g., 3+ years of experience in frontend development...)"
                    className="min-h-[200px] bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreatePending || isUpdatePending}
            >
              {career
                ? isUpdatePending
                  ? "Updating..."
                  : "Update Career"
                : isCreatePending
                  ? "Creating..."
                  : "Create Career"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
