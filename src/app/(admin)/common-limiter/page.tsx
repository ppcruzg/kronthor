"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { ShieldX } from "lucide-react";

export default function CommonLimiterPage() {
    return (
        <GenericCatalogPage
            tableName="common_limiter"
            title="Limitantes Comunes"
            description="Factores que restringen el rendimiento o aumentan el riesgo."
            icon={<ShieldX className="h-6 w-6 text-indigo-400" />}
        />
    );
}
