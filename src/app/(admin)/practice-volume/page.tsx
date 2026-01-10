"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { BarChart3 } from "lucide-react";

export default function PracticeVolumePage() {
    return (
        <GenericCatalogPage
            tableName="practice_volume"
            title="Volumen de Práctica"
            description="Escala de exposición típica en el deporte o entrenamiento."
            icon={<BarChart3 className="h-6 w-6 text-indigo-400" />}
        />
    );
}
