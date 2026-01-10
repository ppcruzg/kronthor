"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { AlertCircle } from "lucide-react";

export default function RiskZonePage() {
    return (
        <GenericCatalogPage
            tableName="risk_zone"
            title="Zonas de Riesgo"
            description="Áreas anatómicas con mayor incidencia de lesión en el deporte."
            icon={<AlertCircle className="h-6 w-6 text-indigo-400" />}
        />
    );
}
