import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contactServices } from "@/services/contactService";
import { api2 } from "@/services/api";

// Query keys
export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (filters: any) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

// Get all contacts hook with pagination
export const useGetAllContacts = (page: number = 1, limit: number = 10, search: string = "") => {
  return useQuery({
    queryKey: ["contacts", "list", page, limit, search],
    queryFn: () => contactServices.getAllContacts(page, limit, search),
  });
};

// Get contact by ID hook
export const useGetContactById = (contactId: string) => {
  return useQuery({
    queryKey: contactKeys.detail(contactId),
    queryFn: () => contactServices.getContactById(contactId),
    enabled: !!contactId, // Only run if contactId is provided
  });
};

// Create contact hook
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactServices.createContact,
    onSuccess: (data) => {
      // Invalidate and refetch contacts list
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });

      toast.success(data.message || "Contact submitted successfully", {
        position: "bottom-right",
        description: "Your contact inquiry has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit contact", {
        position: "bottom-right",
        description: "An error occurred while submitting your contact inquiry.",
      });
    },
  });
};

// Update contact hook
export const useUpdateContact = (contactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => contactServices.updateContact(contactId, data),
    onSuccess: (data) => {
      // Invalidate both lists and specific contact detail
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(contactId) });

      toast.success(data.message || "Contact updated successfully", {
        position: "bottom-right",
        description: "The contact has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update contact", {
        position: "bottom-right",
        description: "An error occurred while updating the contact.",
      });
    },
  });
};

// Delete contact hook
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactServices.deleteContact,
    onSuccess: (data, variables) => {
      // Invalidate both lists and specific contact detail
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables) });

      toast.success(data.message || "Contact deleted successfully", {
        position: "bottom-right",
        description: "The contact has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete contact", {
        position: "bottom-right",
        description: "An error occurred while deleting the contact.",
      });
    },
  });
};

export const useDeleteBulkContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteBulkContacts"],
    mutationFn: async (ids: string[]) => {
      const response = await api2.delete(`/contact/delete-contact/${ids.join(',')}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success(data.message || "Contacts deleted successfully", {
        position: "bottom-right",
        description: "The selected contacts have been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete contacts", {
        position: "bottom-right"
      });
    },
  });
};

// Get deleted contacts hook
export const useGetDeletedContacts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["getDeletedContacts", page, limit],
    queryFn: () => contactServices.getDeletedContacts(page, limit),
  });
};

// Recover contacts hook
export const useRecoverContacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => contactServices.recoverContacts(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getDeletedContacts"] });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });

      toast.success(data.message || "Contacts recovered successfully", {
        position: "bottom-right",
        description: "The selected contacts have been recovered successfully.",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to recover contacts", {
        position: "bottom-right",
        description: "An error occurred while recovering the contacts.",
      });
    },
  });
};

// Destroy contact permanently hook
export const useDestroyContactPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactServices.destroyContactPermanently(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getDeletedContacts"] });

      toast.success(data.message || "Contact permanently deleted", {
        position: "bottom-right",
        description: "The contact has been permanently deleted from the system.",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete contact permanently", {
        position: "bottom-right",
        description: "An error occurred while deleting the contact permanently.",
      });
    },
  });
};