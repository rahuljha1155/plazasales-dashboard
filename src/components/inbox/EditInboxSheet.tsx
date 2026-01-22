"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet" // Removed SheetTrigger

import { useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import { Textarea } from "@/components/ui/textarea"
import RichTextEditor from "../RichTextEditor"

import { toast } from "sonner"

import { api } from "@/services/api"

import { Loader } from "lucide-react" // Removed FilePenLine as it's not used here

import { useUpdateContact } from "@/hooks/useContact"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company is required"),
  budget: z.string().min(1, "Budget is required"),
  goal: z.string().min(1, "Goal is required"),
  message: z.string().optional(),
  number: z.string().optional(),
  source: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

interface EditContactSheetProps {
  id: string
  onSuccess?: () => void
  open: boolean // This prop will now control the sheet's visibility
  onOpenChange: (open: boolean) => void // This prop will notify the parent when the sheet's visibility changes
  // defaultValues prop is no longer strictly necessary if data is always fetched on open
}

export function EditInboxSheet({ id, onSuccess, open, onOpenChange }: EditContactSheetProps) {
  const [isLoadingData, setIsLoadingData] = useState(false) // New state for loading contact data
  const { mutateAsync: updateContact, isPending: isUpdating } = useUpdateContact(id as string) // Renamed isPending to isUpdating for clarity

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    // Default values will be overridden by fetched data, but good for initial empty state
    defaultValues: {
      name: "",
      email: "",
      company: "",
      budget: "",
      goal: "",
      message: "",
      number: "",
      source: "",
    },
  })

  // Fetch contact data when the sheet opens or id changes
  useEffect(() => {
    if (open && id) {
      const fetchContactData = async () => {
        setIsLoadingData(true)
        try {
          const { data } = await api.get(`contact/${id}`)
          form.reset(data.data) // Populate form with fetched data
        } catch (error) {
          toast.error("Failed to fetch contact data")
          onOpenChange(false) // Close sheet if data fetching fails
        } finally {
          setIsLoadingData(false)
        }
      }
      fetchContactData()
    } else if (!open) {
      // Reset form when sheet closes
      form.reset()
    }
  }, [open, id, form, onOpenChange]) // Added onOpenChange to dependency array

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await updateContact(values, {
        onSuccess: () => {
          toast.success("Contact updated successfully")
          onOpenChange(false) // Close the sheet by notifying the parent
          onSuccess?.() // Call parent's onSuccess callback
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update contact")
        },
      })
    } catch (error) {
      toast.error("Failed to update contact")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Removed SheetTrigger as the parent component will control opening */}
      <SheetContent className="w-full sm:max-w-3xl z-[999] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Contact</SheetTitle>
          <SheetDescription>Update the contact information below.</SheetDescription>
        </SheetHeader>
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input placeholder="Budget" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal</FormLabel>
                    <FormControl>
                      <Input placeholder="Goal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        initialContent={field.value || ""}
                        onChange={(content) => field.onChange(content)}
                        placeholder="Enter message"
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input placeholder="How they found us" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Contact
              </Button>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  )
}
