import { useEffect } from "react";
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
import { toast } from "sonner";
import { useCreateHomefaq, useUpdateHomefaq } from "@/hooks/homefaq";
import type { homefaq } from "@/types/homefaq";
import RichTextEditor from "../RichTextEditor";

const formSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().min(1, "description is required"),
});

interface ItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkge?: homefaq;
  onSuccess: () => void;
}

export function ItemSheet({
  open,
  onOpenChange,
  pkge,
  onSuccess,
}: ItemSheetProps) {
  const { mutate: updatePkge, isPending: isUpdatePending } = useUpdateHomefaq(
    pkge?._id as string
  );

  const { mutate: addPkge, isPending: isAddPending } = useCreateHomefaq();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: pkge?.name || "",

      description: pkge?.description || "",
    },
  });

  const onOpenChangeHandler = () => {
    onOpenChange(false);
    form.reset();
  };

  useEffect(() => {
    if (!open) {
      onOpenChangeHandler();
    }
  }, [open, onOpenChange]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const description = values.description.replace(/<[^>]+>/g, "");

      const payload = {
        name: values.title,
        description: description,
      };

      if (pkge) {
        updatePkge(payload, {
          onSuccess: () => {
            toast(`homefaq updated successfully`);
            onSuccess();
            onOpenChangeHandler();
          },
          onError: () => {
            toast(`Failed to update homefaq`);
          },
        });
      } else {
        addPkge(payload, {
          onSuccess: () => {
            toast(`homefaq created successfully`);
            onSuccess();
            onOpenChangeHandler();
          },
          onError: () => {
            toast(`Failed to create homefaq`);
          },
        });
      }
    } catch (error) {
      toast(`Failed to ${pkge ? "update" : "create"} homefaq`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{pkge ? "Edit homefaq" : "Add homefaq"}</SheetTitle>
        </SheetHeader>
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
                      <Input placeholder="  title" {...field} />
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
                        initialContent={field.value || ""}
                        onChange={(content: any) => field.onChange(content)}
                        placeholder="Enter description"
                        className="min-h-[300px]"
                      />
                    </FormControl>
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
                  {pkge ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
