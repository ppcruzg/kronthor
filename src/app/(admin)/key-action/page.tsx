"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { Crosshair } from "lucide-react";

export default function KeyActionPage() {
    return (
        <GenericCatalogPage
            tableName="key_action"
            title="Acciones Clave"
            description="Gestos técnicos y motores fundamentales del rendimiento."
            icon={<Crosshair className="h-6 w-6 text-indigo-400" />}
        />
    );
}
