"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { Star } from "lucide-react";

export default function PhysicalPriorityPage() {
    return (
        <GenericCatalogPage
            tableName="physical_priority"
            title="Prioridades Físicas"
            description="Jerarquía de capacidades físicas necesarias para el éxito."
            icon={<Star className="h-6 w-6 text-indigo-400" />}
        />
    );
}
