"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { ShieldAlert } from "lucide-react";

export default function AntirotationStabilityPage() {
    return (
        <GenericCatalogPage
            tableName="antirotation_stability"
            title="Estabilidad Antirotación"
            description="Capacidad de resistir torques rotacionales no deseados."
            icon={<ShieldAlert className="h-6 w-6 text-indigo-400" />}
        />
    );
}
