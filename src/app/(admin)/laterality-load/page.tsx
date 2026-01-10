"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { Weight } from "lucide-react";

export default function LateralityLoadPage() {
    return (
        <GenericCatalogPage
            tableName="laterality_load"
            title="Lateralidad de Carga"
            description="Distribución de la carga externa respecto al centro de masas."
            icon={<Weight className="h-6 w-6 text-indigo-400" />}
        />
    );
}
