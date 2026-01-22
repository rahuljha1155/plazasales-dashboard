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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { IFAQ } from "@/types/IFaq";
import { useCreateFAQ, useUpdateFAQ } from "@/hooks/useFaqs";
import { useEffect } from "react";
import { faqSchema } from "@/schema/faq";
import * as z from "zod";
import RichTextEditor from "@/components/RichTextEditor";

interface FAQFormProps {
    faq?: IFAQ;
    onSuccess: () => void;
    onCancel: () => void;
}

type FAQFormValues = z.infer<typeof faqSchema>;

export function FAQForm({ faq, onSuccess, onCancel }: FAQFormProps) {
    const { mutate: createFAQ, isPending: isCreatePending } = useCreateFAQ();
    const { mutate: updateFAQ, isPending: isUpdatePending } = useUpdateFAQ(faq?.id || "");

    const form = useForm<FAQFormValues>({
        resolver: zodResolver(faqSchema),
        defaultValues: {
            title: faq?.title || "",
            description: {
                content: faq?.description?.content || "",
            },
            isActive: faq?.isActive ?? true,
        },
    });

    useEffect(() => {
        if (faq) {
            form.reset({
                title: faq.title || "",
                description: {
                    content: faq.description?.content || "",
                },
                isActive: faq.isActive ?? true,
            });
        }
    }, [faq, form]);

    const onSubmit = async (values: FAQFormValues) => {
        try {
            const payload = {
                title: values.title,
                description: {
                    content: values.description.content,
                },
                isActive: values.isActive,
            };

            if (faq) {
                updateFAQ(payload as any, {
                    onSuccess: () => {
                        toast.success("FAQ updated successfully");
                        onSuccess();
                    },
                    onError: (error) => {
                        toast.error("Failed to update FAQ");
                    },
                });
            } else {
                createFAQ(payload as any, {
                    onSuccess: () => {
                        toast.success("FAQ created successfully");
                        onSuccess();
                    },
                    onError: (error) => {
                        toast.error("Failed to create FAQ");
                    },
                });
            }
        } catch (error) {
            toast.error(`Failed to ${faq ? "update" : "create"} FAQ`);
        }
    };

    return (
        <div className="mt-6 ">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title Field */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter FAQ title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Content Field with Rich Text Editor */}
                    <FormField
                        control={form.control}
                        name="description.content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
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

                    {/* Is Active Toggle */}
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active Status</FormLabel>
                                    <div className="text-sm text-muted-foreground">
                                        Enable or disable this FAQ
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

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-md"
                            disabled={isCreatePending || isUpdatePending}
                        >
                            {faq ? "Update FAQ" : "Create FAQ"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
