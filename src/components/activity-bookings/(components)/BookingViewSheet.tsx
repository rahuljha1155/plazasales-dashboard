
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,

  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import moment from "moment";
 
import { api } from "@/services/api";


  export default function BookingDetailSheet({ id }: any) {
  const [history, setHistory] = useState<any>();
  useEffect(() => {
    const fetch = async () => { 
      try {
        id;
        const { data } = await api.get(`/activity-bookings/${id}`);
        data;
        setHistory(data?.data);
      } catch (error: any) {
        error.message;
      }
    };
    fetch();
  }, [id]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <span className=" flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ">
          View Details
        </span>
      </SheetTrigger>

      <SheetContent className="sm:max-w-5xl min-h-screen overflow-y-scroll overflow-x-hidden">
        <SheetHeader className=" mb-4">
          <SheetTitle className=" flex items-center gap-2">
            {/* Stock Out Detail <IconStockOut className=" h-5 w-5 text-primary" />{" "} */}
          </SheetTitle>
        </SheetHeader>

        <div>
          {history && (
            <Card>
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="group flex items-center gap-2 text-lg">
                    Booking Detail
                  </CardTitle>
                  <CardDescription>
                    Duration :
                    <time>
                      {moment(history?.arrivalDate)?.format("MMMM Do YYYY")}
                    </time>{" "}
                    to{" "}
                    <time>
                      {moment(history?.departureDate)?.format("MMMM Do YYYY")}
                    </time>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className=" text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold">User Details</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        User Full Name
                      </span>
                      <span>{history?.fullName}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Email Address
                      </span>
                      <span>{history.email}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Date of birth
                      </span>
                      <span>{history?.dob}</span>
                    </li>

                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Country</span>
                      <span>{history?.country}</span>
                    </li>
                    {history?.note && history?.note?.length > 0 && (
                      <>
                        <li className="flex flex-col">
                          <span className="font-semibold">Note</span>
                          <span className="text-muted-foreground mt-1">
                            {history?.note}
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                {/* <div className="text-xs text-muted-foreground">
                                    Trip Duration : 
                                    <time>{moment(history?.startDate)?.format("MMMM Do YYYY")}</time> 
                                    {' '}
                                    to 
                                    {' '}
                                    <time>{moment(history?.endDate)?.format("MMMM Do YYYY")}</time>
                                </div> */}
                Booked on: {moment(history?.createdAt)?.format("Do MMM YYYY")}
              </CardFooter>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
