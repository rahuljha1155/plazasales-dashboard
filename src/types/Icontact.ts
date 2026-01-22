// Base contact interface
export interface IContact {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  fullname: string;
  email: string;
  organization: string | null;
  phoneNo: string;
  address: string;
  message: string;
  isView: boolean;
  purpose: string;
}

// Contact list item (for getAll response)
export interface IContactListItem {
  id: string;
  createdAt: string;
  fullname: string;
  email: string;
  organization: string | null;
  phoneNo: string;
  purpose: string;
  isView: boolean;
}

// Request/Response Interfaces
export interface IPostContact {
  fullname: string;
  email: string;
  phoneNo: string;
  address: string;
  message: string;
  purpose: string;
}

export interface ICreateContactResponse {
  status: number;
  message: string;
}





export interface IGetAllContactsResponse {
  status: number;
  data: {
    contacts: IContactListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  cached: boolean;
}

export interface IGetContactByIdResponse {
  status: number;
  contact: IContact;
  cached: boolean;
}

export interface IDeleteContactResponse {
  status: number;
  message: string;
}