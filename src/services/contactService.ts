import type {
  IPostContact,
  ICreateContactResponse,
  IGetAllContactsResponse,
  IGetContactByIdResponse,
  IDeleteContactResponse,
} from "@/types/Icontact";
import { api2 } from "./api";

export const contactServices = {
  // Create new contact
  createContact: async (contactData: IPostContact): Promise<ICreateContactResponse> => {
    const response = await api2.post<ICreateContactResponse>(
      "/contact/get-all-contacts", // Note: This endpoint name seems incorrect for creating, but following your example
      contactData
    );
    return response.data;
  },

  // Get all contacts with pagination
  getAllContacts: async (page: number = 1, limit: number = 10, search: string = ""): Promise<IGetAllContactsResponse> => {
    let url = `/contact/get-all-contacts?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await api2.get<IGetAllContactsResponse>(url);
    return response.data;
  },

  // Get contact by ID
  getContactById: async (contactId: string): Promise<IGetContactByIdResponse> => {
    const response = await api2.get<IGetContactByIdResponse>(
      `/contact/get-contact/${contactId}`
    );
    return response.data;
  },

  // Update contact
  updateContact: async (contactId: string, contactData: any): Promise<any> => {
    const response = await api2.put(
      `/contact/${contactId}`,
      contactData
    );
    return response.data;
  },

  // Delete contact
  deleteContact: async (contactId: string): Promise<IDeleteContactResponse> => {
    const response = await api2.delete<IDeleteContactResponse>(
      `/contact/delete-contact/${contactId}`
    );
    return response.data;
  },

  // Get deleted contacts
  getDeletedContacts: async (page: number = 1, limit: number = 10): Promise<any> => {
    const response = await api2.get(
      `/contact/deleted-contacts?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Recover contacts
  recoverContacts: async (ids: string[]): Promise<any> => {
    const response = await api2.put("/contact/recover-contacts", { ids });
    return response.data;
  },

  // Destroy contact permanently
  destroyContactPermanently: async (id: string): Promise<any> => {
    const response = await api2.delete(`/contact/destroy-contact/${id}`);
    return response.data;
  },
};