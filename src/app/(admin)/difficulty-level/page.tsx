"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { Gauge } from "lucide-react";

export default function DifficultyLevelPage() {
  return (
    <GenericCatalogPage
      tableName="difficulty_level"
      title="Niveles de dificultad"
      description="Catálogo para clasificar la complejidad técnica de los ejercicios."
      icon={<Gauge className="h-6 w-6 text-indigo-400" />}
    />
  );
}
