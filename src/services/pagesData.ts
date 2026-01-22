import type { PageResponse } from "@/types/pages";
import { api } from "./api";

export async function getPageData(id:string):Promise<PageResponse>{
    const req = await api.get(`/pages/${id}`);
    return req.data;
}