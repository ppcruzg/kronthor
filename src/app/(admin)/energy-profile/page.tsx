"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { BatteryCharging } from "lucide-react";

export default function EnergyProfilePage() {
    return (
        <GenericCatalogPage
            tableName="energy_profile"
            title="Perfil Energético"
            description="Sustrato predominante y dinámica de esfuerzos del deporte."
            icon={<BatteryCharging className="h-6 w-6 text-indigo-400" />}
        />
    );
}
