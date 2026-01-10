"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { UserCheck } from "lucide-react";

export default function LateralitySupportPage() {
    return (
        <GenericCatalogPage
            tableName="laterality_support"
            title="Lateralidad de Apoyo"
            description="Configuración de los puntos de apoyo durante el ejercicio."
            icon={<UserCheck className="h-6 w-6 text-indigo-400" />}
        />
    );
}
