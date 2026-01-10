"use client";

import { GenericCatalogPage } from "@/components/GenericCatalogPage";
import { Zap } from "lucide-react";

export default function SSCDemandPage() {
    return (
        <GenericCatalogPage
            tableName="ssc_demand"
            title="Demanda SSC"
            description="Exigencia del ciclo estiramiento-acortamiento (elasticidad)."
            icon={<Zap className="h-6 w-6 text-indigo-400" />}
        />
    );
}
