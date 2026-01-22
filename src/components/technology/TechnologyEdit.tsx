import { useParams } from "react-router-dom";
import { useGetTechnologyById } from "@/services/technology";
import TechnologyForm from "./TechnologyForm";

export default function TechnologyEdit() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useGetTechnologyById(id || "");

    return (
        <TechnologyForm
            mode="edit"
            technology={data?.technology}
            isLoading={isLoading}
        />
    );
}
