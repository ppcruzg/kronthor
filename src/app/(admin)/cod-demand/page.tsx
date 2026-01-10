"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { Activity } from "lucide-react";

export default function CODDemandPage() {
    return (
        <GenericCatalogPage
            tableName="cod_demand"
            title="Demanda de COD"
            description="Exigencia de cambios de dirección y redirección de aceleración."
            icon={<Activity className="h-6 w-6 text-indigo-400" />}
        />
    );
}
