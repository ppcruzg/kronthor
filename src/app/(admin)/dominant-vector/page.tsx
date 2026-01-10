"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { MoveHorizontal } from "lucide-react";

export default function DominantVectorPage() {
    return (
        <GenericCatalogPage
            tableName="dominant_vector"
            title="Vectores Dominantes"
            description="Dirección principal de la aplicación de fuerza."
            icon={<MoveHorizontal className="h-6 w-6 text-indigo-400" />}
        />
    );
}
