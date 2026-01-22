"use client";

import { useParams, useNavigate } from "react-router-dom";
import { ContactDetailsView } from "./ContactDetailsView";

export default function ContactDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard/inbox");
  };

  return <ContactDetailsView contactId={id || ""} onBack={handleBack} />;
}
