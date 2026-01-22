export type fixedDate = {
  _id: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  status: "active" | "inactive" | "Booked";
  price: number;
};
