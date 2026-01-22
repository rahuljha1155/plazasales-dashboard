import { api } from "./api";


  export async function fetchVisitDataByCountry() {
    const { data } = await api.get("/visits/stats");
    return {
     data
    };
  }