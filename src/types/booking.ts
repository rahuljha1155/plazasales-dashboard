export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export enum BookingReplyStatus {
  APPROVED = "approved",
  DECLINED = "declined",
  RESCHEDULED = "rescheduled",
  PENDING = "pending",
}

export enum BookingStatusFinal {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export interface BookingReplyData {
  bookingId: string;
  message: string;
  status: BookingReplyStatus; // Mapped from BookingReplyStatus
  subject?: string; // Optional field for subject
  bookingStatus: BookingStatusFinal; // The reply status from the form
}

export interface BookingReplyProps {
  bookingId: string;
}

export interface PersonalInfo {
  _id: string;
  fullName: string;
  email: string;
  country: string;
  phoneNumber: string;
  gender?: "male" | "female" | "other" | "prefer not to say";
  dateOfBirth?: string; // ISO string (from Date)
  passportNumber?: string;
  passportExpiryDate?: string; // ISO string (from Date)
}

export interface PackageInfo {
  _id?: string;
  name: string;
  duration: string;
  id: string;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  adults?: number;
  children?: number;
  numberOfTravelers?: number;
  package: string | PackageInfo;
  personalInfo: PersonalInfo[];
  arrivalDate: string; // ISO string
  departureDate: string; // ISO string
  message?: string;
  termsAccepted?: boolean;
  createdBy?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  seen: boolean;
  __v?: number;
  id?: string;
}

export interface BookingsResponse {
  status: string;
  results: number;
  data: {
    bookings: Booking[];
  };
}
