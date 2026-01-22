import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types for Private Trip
export interface PrivateTrip {
  _id: string;
  date: string;
  leadTravellerName: string;
  email: string;
  phone: string;
  numberOfTraveller: number;
  country: string;
  howDidYouReachUs: string;
  message: string;
  termsAndAgreement: boolean;
  createdAt: string;
  updatedAt: string;

}

export interface Booking {
  _id: string;
  package: PackageDetails;
  date: string; // ISO date string (e.g. "2023-12-25T00:00:00.000Z")
  leadTravellerName: string;
  email: string;
  phone: string;
  numberOfTraveller: number;
  country: string;
  howDidYouReachUs: string;
  message: string;
  termsAndAgreement: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PackageDetails {
  _id: string;
  activity: string;
  groupSize: string;
  vehicle: string;
  difficulty: string;
  accommodation: string;
  meal: string;
  tripHighlight: string[];
  visitPlaces: string[];
  isPopular: boolean;
  addToHome: boolean;
  location: string;
  duration: string;
  categoryId: string;
  subCategoryId: string;
  name: string;
  overview: string;
  coverImage: string;
  elevation: number;
  distance: number;
  bestSeller: boolean;
  top10Trek: boolean;
  attraction: string[];
  itinerary: string[];
  seasonalTrek: string[];
  gearInfo: string[];
  importantNotice: string[];
  insurance: string[];
  addons: string[];
  videos: string[];
  faq: string[];
  exclusion: string[];
  inclusion: string[];
  requirements: string[];
  routeMap: string;
  sortOrder: number;
  pax: string[];
  gallery: string[];
  fixedDates: string[];
  slug: string;
  testimonial: string[];
  whyLoveThisTrek: string[];
  packageInfo: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  makeBestSeller: boolean;
  note: string;
}


export interface CreatePrivateTripInput {
  date: string;
  leadTravellerName: string;
  email: string;
  phone: string;
  numberOfTraveller: number;
  country: string;
  howDidYouReachUs: string;
  message: string;
  termsAndAgreement: boolean;
  captchaToken: string;
  captchaAnswer: number;
}

export interface UpdatePrivateTripInput {
  date?: string;
  leadTravellerName?: string;
  email?: string;
  phone?: string;
  numberOfTraveller?: number;
  country?: string;
  howDidYouReachUs?: string;
  message?: string;
  termsAndAgreement?: boolean;

}

export interface privateTripData {
  date: string
  package: PackageDetails
  leadTravellerName: string
  email: string
  phone: string
  numberOfTraveller: number
  country: string
  howDidYouReachUs: string
  message: string
  termsAndAgreement: boolean
  createdAt: string
  updatedAt: string
  __v: number
  _id: string
};

interface privateTripResponse {
  status: string;
  message: string;
  data: {
    date: string
    package: PackageDetails
    leadTravellerName: string
    email: string
    phone: string
    numberOfTraveller: number
    country: string
    howDidYouReachUs: string
    message: string
    termsAndAgreement: boolean
    createdAt: string
    updatedAt: string
    __v: number
  }[];
  pagination: {
    total: 1,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 100,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: null,
    previousPage: null
  },
  fromCache: false



}

// Create a private trip (public)
export const useCreatePrivateTrip = () => {
  return useMutation({
    mutationFn: async (data: CreatePrivateTripInput) => {
      const response = await api.post("/private-trip", data);
      return response.data.data;
    },
  });
};

// Get all private trips (admin)
export const useGetPrivateTrips = (params?: {
  limit?: number;
  page?: number;
  sort?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["privateTrips", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.sort) searchParams.append("sort", params.sort);
      if (params?.search) searchParams.append("search", params.search);
      const response = await api.get<privateTripResponse>(
        `/private-trip?${searchParams.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get a single private trip (admin)
export const useGetPrivateTrip = (privateTripId: string) => {
  return useQuery({
    queryKey: ["privateTrip", privateTripId],
    queryFn: async () => {
      const response = await api.get(`/private-trip/${privateTripId}`);
      return response.data.data;
    },
    enabled: !!privateTripId,
  });
};

// Update a private trip (admin)
export const useUpdatePrivateTrip = (privateTripId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePrivateTripInput) => {
      const response = await api.patch(`/private-trip/${privateTripId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["privateTrip", privateTripId],
      });
      queryClient.invalidateQueries({ queryKey: ["privateTrips"] });
    },
  });
};

// Delete a private trip (admin)
export const useDeletePrivateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (privateTripId: string) => {
      const response = await api.delete(`/private-trip/${privateTripId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privateTrips"] });
    },
  });
};

// Delete multiple private trips (admin)
export const useDeleteManyPrivateTrips = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.post("/private-trip/multiple-delete", {
        ids,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privateTrips"] });
    },
  });
};
