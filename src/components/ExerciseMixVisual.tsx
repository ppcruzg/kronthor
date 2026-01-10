"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface MixItem {
    id: number;
    name: string;
    weight: number;
    color?: string;
}

interface ExerciseMixVisualProps {
    items: MixItem[];
    title: string;
    type: "vector" | "plane";
}

const VECTOR_COLORS: Record<string, string> = {
    "horizontal": "var(--vector-hor)",
    "vertical": "var(--vector-ver)",
    "rotacional": "var(--vector-rot)",
    "HOR": "var(--vector-hor)",
    "VER": "var(--vector-ver)",
    "ROT": "var(--vector-rot)",
};

const PLANE_COLORS: Record<string, string> = {
    "sagital": "var(--plane-sag)",
    "frontal": "var(--plane-fro)",
    "transversal": "var(--plane-tra)",
    "SAG": "var(--plane-sag)",
    "FRO": "var(--plane-fro)",
    "TRA": "var(--plane-tra)",
};

export function ExerciseMixVisual({ items, title, type }: ExerciseMixVisualProps) {
    const hasData = items && items.length > 0 && items.some(i => i.weight > 0);
    if (!hasData) return null;

    const colorMap = type === "vector" ? VECTOR_COLORS : PLANE_COLORS;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {title}
                </span>
                <div className="flex gap-1">
                    {items.map((item) => (
                        <Badge
                            key={item.id}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-100 font-bold"
                        >
                            {item.weight}%
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="relative h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                {items.map((item, index) => {
                    const color = colorMap[item.name.toLowerCase()] || colorMap[item.name] || "#6366f1";
                    return (
                        <div
                            key={item.id}
                            style={{
                                width: `${item.weight}%`,
                                backgroundColor: color,
                                boxShadow: index === 0 ? `0 0 10px ${color}80` : 'none'
                            }}
                            className="h-full transition-all duration-500 ease-out"
                            title={`${item.name}: ${item.weight}%`}
                        />
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1">
                {items.map((item) => {
                    const color = colorMap[item.name.toLowerCase()] || colorMap[item.name] || "#6366f1";
                    return (
                        <div key={item.id} className="flex items-center gap-1.5 leading-none">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-[11px] text-slate-700 dark:text-slate-400 font-bold capitalize">
                                {item.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
