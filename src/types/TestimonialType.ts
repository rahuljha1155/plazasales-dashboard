export interface TestimonialType {
  _id: string;
  packageId: {
    _id: string;
    name: string;
  };
  fullName: string;
  image?: string;
  rating: number;
  comment: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}