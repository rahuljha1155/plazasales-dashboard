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
import { toast } from "sonner";
import type { homefaq } from "@/types/homefaq";
import { useCreateHomefaq, useUpdateHomefaq } from "@/hooks/homefaq";
import { useEffect } from "react";
import RichTextEditor from "@/components/RichTextEditor";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

interface ItemFormProps {
  item?: homefaq;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ItemForm({ item, onSuccess, onCancel }: ItemFormProps) {
  const { mutate: updateInfo, isPending: isUpdatePending } = useUpdateHomefaq(
    item?._id as string
  );

  const { mutate: addInfo, isPending: isAddPending } = useCreateHomefaq();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.name || "",
      description: item?.description || "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        title: item.name || "",
        description: item.description || "",
      });
    }
  }, [item]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const description = values.description.replace(/<[^>]+>/g, "");

      const payload = {
        name: values.title,
        description: description,
      };

      if (item) {
        updateInfo(payload, {
          onSuccess: () => {
            toast(`Info updated successfully`);
            onSuccess();
          },
          onError: () => {
            toast(`Failed to update info`);
          },
        });
      } else {
        addInfo(payload, {
          onSuccess: () => {
            toast(`Info created successfully`);
            onSuccess();
          },
          onError: () => {
            toast(`Failed to create info`);
          },
        });
      }
    } catch (error) {
      toast(`Failed to ${item ? "update" : "create"} info`);
    }
  };

  return (
    <div className="mt-6 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-8">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAddPending || isUpdatePending}>
              {item ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
