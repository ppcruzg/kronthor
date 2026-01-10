"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { Footprints } from "lucide-react";

export default function ImpactDemandPage() {
    return (
        <GenericCatalogPage
            tableName="impact_demand"
            title="Demanda de Impacto"
            description="Nivel de fuerzas de reacción contra el suelo."
            icon={<Footprints className="h-6 w-6 text-indigo-400" />}
        />
    );
}
