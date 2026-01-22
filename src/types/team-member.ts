export type Member = {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  addToHome: boolean;
  fullname: string;
  designation: string;
  image: string;
  countryCode: string;
  phoneNumber: string;
  isLeader?: boolean;
  description?: {
    text: string;
  };
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
};
