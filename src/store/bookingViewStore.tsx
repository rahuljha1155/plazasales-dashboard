import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BookingViewStore {
    showBooking: boolean;
    setShowBooking: (show: boolean) => void;
}

const useBookingViewStore = create<BookingViewStore>()(
    persist(
        (set) => ({
            showBooking: true,
            setShowBooking: (show: boolean) => set({ showBooking: show }),
        }),
        {
            name: "booking-view-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useBookingViewStore;
