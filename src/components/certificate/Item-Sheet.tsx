import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { certificate } from "@/types/certificate";
import {
  useCreateCertificate,
  useUpdateCertificate,
} from "@/hooks/useCertificate";
import RichTextEditor from "../RichTextEditor";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

interface CertificateFormProps {
  certificate?: certificate;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CertificateForm({
  certificate,
  onSuccess,
  onCancel,
}: CertificateFormProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    certificate?.image || null
  );

  const { mutate: updateCertificate, isPending: isUpdatePending } =
    useUpdateCertificate(certificate?._id as string);
  const { mutate: addCertificate, isPending: isAddPending } =
    useCreateCertificate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: certificate?.name || "",
      description: certificate?.description || "",
    },
  });

  useEffect(() => {
    if (certificate) {
      form.reset({
        title: certificate.name || "",
        description: certificate.description || "",
      });
      setImagePreview(certificate.image || null);
    } else {
      form.reset();
      setImagePreview(null);
    }
    setImage(null);
  }, [certificate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("name", values.title);
      formData.append("description", values.description);
      if (image) formData.append("image", image);

      const action = certificate ? updateCertificate : addCertificate;

      action(formData, {
        onSuccess: () => {
          toast.success(
            `Certificate ${certificate ? "updated" : "created"} successfully`
          );
          onSuccess();
        },
        onError: () => {
          toast.error(
            `Failed to ${certificate ? "update" : "create"} certificate`
          );
        },
      });
    } catch (error) {
      toast.error(`Failed to ${certificate ? "update" : "create"} certificate`);
    }
  };

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
                  <FormLabel>Certificate Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter certificate title"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Image Upload (480x370)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    setImagePreview(file ? URL.createObjectURL(file) : null);
                  }}
                  className="bg-white flex items-center cursor-pointer pt-3"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Max 3MB image. JPG or PNG preferred.
              </p>
              <FormMessage />
            </FormItem>
          </div>

          {imagePreview && (
            <div className="w-full">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-48 h-36 object-cover rounded-sm shadow-md border mb-4"
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <RichTextEditor
                    initialContent={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Write about the certificate..."
                    className="min-h-[300px] bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-center gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAddPending || isUpdatePending}>
              {certificate
                ? isUpdatePending
                  ? "Updating..."
                  : "Update"
                : isAddPending
                  ? "Creating..."
                  : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
