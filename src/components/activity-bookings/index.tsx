import { string, z } from "zod";

export const formSchema = z.object({
    fullName: z
        .string(),

    email: z.string()
    ,
   
    country: z.string()
    ,
    dob: z.string()
    ,
    phone: z.string()
    ,
    arrivalDate:z.string(),
    departureDate:z.string(),
   activity:z.any()

});