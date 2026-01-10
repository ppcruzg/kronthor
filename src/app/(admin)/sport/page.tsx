"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Plus,
    Trophy,
    Trash,
    Edit,
    Activity,
    Target,
    ShieldAlert,
    Zap,
    BarChart2,
    Users,
    ChevronRight,
    Copy,
    Info,
    ExternalLink,
    Hash,
    Layers
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ExerciseMixVisual } from "@/components/ExerciseMixVisual";
import { cn } from "@/lib/utils";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Sport {
    id: string;
    sport_id: string;
    name: string;
    position_role: string | null;
    is_active: boolean;
    laterality_support_id: number | null;
    laterality_load_id: number | null;
    antirotation_stability_id: number | null;
    cod_demand_id: number | null;
    ssc_demand_id: number | null;
    impact_demand_id: number | null;
    practice_volume_id: number | null;
    energy_profile_id: number | null;

    // Catalogs Joins
    laterality_support: { name: string } | null;
    laterality_load: { name: string } | null;
    antirotation_stability: { name: string } | null;
    cod_demand: { name: string } | null;
    ssc_demand: { name: string } | null;
    impact_demand: { name: string } | null;
    practice_volume: { name: string } | null;
    energy_profile: { name: string } | null;

    // Relations
    sport_key_action: { action: { name: string } }[];
    sport_physical_priority: { priority: { name: string }, rank: number }[];
    sport_risk_zone: { zone: { name: string } }[];
    sport_common_limiter: { limiter: { name: string } }[];

    // Mixes
    sport_vector_mix: { id: number, weight: number, dominant_vector: { name: string } }[];
    sport_plane_mix: { id: number, weight: number, plane: { name: string } }[];
}

export default function SportsDashboardMasterDetail() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchSports = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("sport")
            .select(`
                *,
                laterality_support:laterality_support_id (name),
                laterality_load:laterality_load_id (name),
                antirotation_stability:antirotation_stability_id (name),
                cod_demand:cod_demand_id (name),
                ssc_demand:ssc_demand_id (name),
                impact_demand:impact_demand_id (name),
                practice_volume:practice_volume_id (name),
                energy_profile:energy_profile_id (name),
                sport_key_action ( action:action_id (name) ),
                sport_physical_priority ( priority:priority_id (name), rank ),
                sport_risk_zone ( zone:zone_id (name) ),
                sport_common_limiter ( limiter:limiter_id (name) ),
                sport_vector_mix ( id, weight, dominant_vector:vector_id (name) ),
                sport_plane_mix ( id, weight, plane:plane_id (name) )
            `)
            .order("name", { ascending: true });

        if (!error) {
            setSports(data || []);
            if (data && data.length > 0 && !selectedId) {
                setSelectedId(data[0].id);
            }
        }
        setLoading(false);
    };

    useEffect(() => { fetchSports(); }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return sports.filter(s => s.name.toLowerCase().includes(q) || (s.position_role && s.position_role.toLowerCase().includes(q)));
    }, [sports, search]);

    const selectedSport = useMemo(() =>
        sports.find(s => s.id === selectedId) || null
        , [sports, selectedId]);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("sport").delete().eq("id", id);
        if (!error) {
            setSports(prev => prev.filter(s => s.id !== id));
            if (selectedId === id) setSelectedId(sports[0]?.id || null);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Deportes</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Análisis de Demandas Competitivas</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <CreateSportDialog onSuccess={fetchSports} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-4 min-h-0 px-4 pb-4">
                {/* Left Pane: List */}
                <div className="w-80 shrink-0 flex flex-col gap-4 min-h-0 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-transparent">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 font-bold" />
                            <Input
                                placeholder="Buscar perfil..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-slate-100 font-bold placeholder:text-slate-400"
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
                            <span>{filtered.length} RESULTADOS</span>
                            <span>ORDEN: A-Z</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scroll-thumb-white/10">
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-100 dark:bg-white/5" />)}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filtered.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedId(s.id)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-center justify-between group",
                                            selectedId === s.id
                                                ? "bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white"
                                                : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className={cn("text-sm font-black truncate uppercase tracking-tight", selectedId === s.id ? "text-white" : "text-slate-900 dark:text-slate-200")}>
                                                {s.name}
                                            </div>
                                            <div className={cn("text-[10px] font-bold truncate opacity-70 italic", selectedId === s.id ? "text-indigo-100" : "text-slate-500")}>
                                                {s.position_role || "Perfil general"}
                                            </div>
                                        </div>
                                        <ChevronRight className={cn("h-4 w-4 transition-transform", selectedId === s.id ? "scale-110 opacity-100" : "opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0")} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Details & Analysis */}
                <div className="flex-1 min-h-0 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm flex flex-col">
                    {selectedSport ? (
                        <>
                            {/* Detail Header */}
                            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-slate-50/30 dark:bg-transparent">
                                <div className="space-y-3 max-w-4xl">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                                            {selectedSport.sport_id}
                                        </Badge>
                                        {!selectedSport.is_active && (
                                            <Badge className="bg-red-500/10 text-red-600 border-none font-black text-[10px] uppercase">Inactivo</Badge>
                                        )}
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                                        {selectedSport.name}
                                    </h2>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm">
                                        <Users className="h-4 w-4" />
                                        {selectedSport.position_role || "Perfil general del deporte"}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <CreateSportDialog editData={selectedSport} onSuccess={fetchSports} />
                                    <CreateSportDialog
                                        duplicateData={selectedSport}
                                        onSuccess={fetchSports}
                                        trigger={
                                            <Button variant="outline" className="rounded-xl font-bold border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5" title="Duplicar perfil">
                                                <Copy className="h-4 w-4 mr-2" />
                                                DUPLICAR
                                            </Button>
                                        }
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="rounded-xl font-bold text-rose-600 border-rose-100 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="glass-dialog">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-xl font-black uppercase">¿Eliminar perfil deportivo?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-slate-600 dark:text-slate-400 font-bold">
                                                    Esta acción borrará "{selectedSport.name}" y toda su configuración analítica.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(selectedSport.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl font-bold">
                                                    ELIMINAR PERMANENTE
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            {/* Detail Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                    {/* Left Column: Analysis */}
                                    <div className="lg:col-span-7 space-y-10">
                                        {/* Visual Mixes Card */}
                                        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-8">
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                                <BarChart2 className="h-4 w-4" /> Perfil de Coordenadas
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <ExerciseMixVisual
                                                    items={selectedSport.sport_vector_mix.map(v => ({ id: v.id, name: v.dominant_vector.name, weight: v.weight }))}
                                                    title="Vectores Dominantes"
                                                    type="vector"
                                                />
                                                <ExerciseMixVisual
                                                    items={selectedSport.sport_plane_mix.map(p => ({ id: p.id, name: p.plane.name, weight: p.weight }))}
                                                    title="Planos de Movimiento"
                                                    type="plane"
                                                />
                                            </div>
                                        </div>

                                        {/* Priorities TOP 3 */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                                <Activity className="h-4 w-4" /> Prioridades Físicas (Top 3)
                                            </h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                {selectedSport.sport_physical_priority
                                                    .sort((a, b) => a.rank - b.rank)
                                                    .slice(0, 3)
                                                    .map((p, i) => (
                                                        <div key={i} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                                            <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white mb-2 shadow-sm">#{p.rank}</div>
                                                            <div className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 tracking-tight">{p.priority.name}</div>
                                                        </div>
                                                    ))}
                                                {selectedSport.sport_physical_priority.length === 0 && (
                                                    <div className="col-span-3 py-6 text-center text-slate-400 italic font-bold border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                                                        Prioridades no definidas
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Risk Zones & Limiters */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                    <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Zonas de Riesgo
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedSport.sport_risk_zone.map((z, i) => (
                                                        <Badge key={i} variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none px-3 py-1 font-black text-[10px] uppercase">
                                                            {z.zone.name}
                                                        </Badge>
                                                    ))}
                                                    {selectedSport.sport_risk_zone.length === 0 && <span className="text-xs text-slate-400 italic">No registradas</span>}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                    <Info className="h-3.5 w-3.5 text-amber-500" /> Limitantes Comunes
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedSport.sport_common_limiter.map((l, i) => (
                                                        <Badge key={i} variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none px-3 py-1 font-black text-[10px] uppercase">
                                                            {l.limiter.name}
                                                        </Badge>
                                                    ))}
                                                    {selectedSport.sport_common_limiter.length === 0 && <span className="text-xs text-slate-400 italic">Sin limitantes definidos</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Key Parameters */}
                                    <div className="lg:col-span-5 space-y-10">
                                        {/* Biomechanics Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Demandas Biomecánicas</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                <DetailRow label="Apoyo" value={selectedSport.laterality_support?.name} icon={<Hash className="h-3.5 w-3.5" />} />
                                                <DetailRow label="Carga" value={selectedSport.laterality_load?.name} icon={<Layers className="h-3.5 w-3.5" />} />
                                                <DetailRow label="Anti-Rotación" value={selectedSport.antirotation_stability?.name} icon={<Activity className="h-3.5 w-3.5" />} />
                                                <DetailRow label="Demanda COD" value={selectedSport.cod_demand?.name} icon={<Zap className="h-3.5 w-3.5" />} color="text-indigo-500" />
                                            </div>
                                        </div>

                                        {/* Physiology Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Perfil Fisiológico & Volumen</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                <DetailRow label="Demanda SSC" value={selectedSport.ssc_demand?.name} icon={<Zap className="h-3.5 w-3.5" />} color="text-amber-500" />
                                                <DetailRow label="Demanda Impacto" value={selectedSport.impact_demand?.name} icon={<Activity className="h-3.5 w-3.5" />} color="text-rose-500" />
                                                <DetailRow label="Volumen Práctica" value={selectedSport.practice_volume?.name} icon={<BarChart2 className="h-3.5 w-3.5" />} />
                                                <DetailRow label="Perfil Energético" value={selectedSport.energy_profile?.name} icon={<Target className="h-3.5 w-3.5" />} />
                                            </div>
                                        </div>

                                        {/* Key Actions */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Acciones Clave</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSport.sport_key_action.map((a, i) => (
                                                    <Badge key={i} variant="default" className="bg-indigo-600 text-white font-black text-[10px] uppercase px-3 py-1">
                                                        {a.action.name}
                                                    </Badge>
                                                ))}
                                                {selectedSport.sport_key_action.length === 0 && <span className="text-xs text-slate-400 italic">No definidas</span>}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                            <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full">
                                <Trophy className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Análisis Deportivo</h3>
                                <p className="text-slate-500 font-bold max-w-xs">Selecciona un perfil deportivo para visualizar sus demandas mecánicas y fisias competitivas.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, icon, color = "text-indigo-500" }: { label: string, value?: string, icon: React.ReactNode, color?: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100/50 dark:border-white/5">
            <div className="flex items-center gap-3">
                <div className={cn("p-1.5 opacity-80", color)}>{icon}</div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                {value || "---"}
            </span>
        </div>
    );
}

interface CreateSportDialogProps {
    editData?: Sport;
    duplicateData?: Sport;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

function CreateSportDialog({ editData, duplicateData, onSuccess, trigger }: CreateSportDialogProps) {
    const isEdit = !!editData;
    const isDuplicate = !!duplicateData;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [options, setOptions] = useState<any>({
        supports: [], loads: [], antirot: [], cod: [], ssc: [], impact: [], volumes: [], profiles: []
    });

    const [formData, setFormData] = useState<any>({
        sport_id: "", name: "", position_role: "", is_active: true,
        laterality_support_id: "", laterality_load_id: "", antirotation_stability_id: "",
        cod_demand_id: "", ssc_demand_id: "", impact_demand_id: "",
        practice_volume_id: "", energy_profile_id: ""
    });

    useEffect(() => {
        if (open) {
            const fetchOptions = async () => {
                const [supports, loads, antirot, cod, ssc, impact, volumes, profiles] = await Promise.all([
                    supabase.from("laterality_support").select("id, name"),
                    supabase.from("laterality_load").select("id, name"),
                    supabase.from("antirotation_stability").select("id, name"),
                    supabase.from("cod_demand").select("id, name"),
                    supabase.from("ssc_demand").select("id, name"),
                    supabase.from("impact_demand").select("id, name"),
                    supabase.from("practice_volume").select("id, name"),
                    supabase.from("energy_profile").select("id, name")
                ]);
                setOptions({
                    supports: supports.data || [], loads: loads.data || [], antirot: antirot.data || [],
                    cod: cod.data || [], ssc: ssc.data || [], impact: impact.data || [],
                    volumes: volumes.data || [], profiles: profiles.data || []
                });
            };
            fetchOptions();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (editData) {
                setFormData({
                    sport_id: editData.sport_id, name: editData.name, position_role: editData.position_role || "", is_active: editData.is_active,
                    laterality_support_id: editData.laterality_support_id?.toString() || "",
                    laterality_load_id: editData.laterality_load_id?.toString() || "",
                    antirotation_stability_id: editData.antirotation_stability_id?.toString() || "",
                    cod_demand_id: editData.cod_demand_id?.toString() || "",
                    ssc_demand_id: editData.ssc_demand_id?.toString() || "",
                    impact_demand_id: editData.impact_demand_id?.toString() || "",
                    practice_volume_id: editData.practice_volume_id?.toString() || "",
                    energy_profile_id: editData.energy_profile_id?.toString() || ""
                });
            } else if (duplicateData) {
                setFormData({
                    sport_id: `${duplicateData.sport_id}_CLONE`, name: `${duplicateData.name} (COPIA)`, position_role: duplicateData.position_role || "", is_active: true,
                    laterality_support_id: duplicateData.laterality_support_id?.toString() || "",
                    laterality_load_id: duplicateData.laterality_load_id?.toString() || "",
                    antirotation_stability_id: duplicateData.antirotation_stability_id?.toString() || "",
                    cod_demand_id: duplicateData.cod_demand_id?.toString() || "",
                    ssc_demand_id: duplicateData.ssc_demand_id?.toString() || "",
                    impact_demand_id: duplicateData.impact_demand_id?.toString() || "",
                    practice_volume_id: duplicateData.practice_volume_id?.toString() || "",
                    energy_profile_id: duplicateData.energy_profile_id?.toString() || ""
                });
            } else {
                setFormData({
                    sport_id: "", name: "", position_role: "", is_active: true,
                    laterality_support_id: "", laterality_load_id: "", antirotation_stability_id: "",
                    cod_demand_id: "", ssc_demand_id: "", impact_demand_id: "",
                    practice_volume_id: "", energy_profile_id: ""
                });
            }
        }
    }, [editData, duplicateData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const dataToSave = {
            ...formData,
            laterality_support_id: parseInt(formData.laterality_support_id) || null,
            laterality_load_id: parseInt(formData.laterality_load_id) || null,
            antirotation_stability_id: parseInt(formData.antirotation_stability_id) || null,
            cod_demand_id: parseInt(formData.cod_demand_id) || null,
            ssc_demand_id: parseInt(formData.ssc_demand_id) || null,
            impact_demand_id: parseInt(formData.impact_demand_id) || null,
            practice_volume_id: parseInt(formData.practice_volume_id) || null,
            energy_profile_id: parseInt(formData.energy_profile_id) || null
        };

        let error;
        if (isEdit) {
            error = (await supabase.from("sport").update(dataToSave).eq("id", editData.id)).error;
        } else {
            error = (await supabase.from("sport").insert(dataToSave)).error;
        }

        if (!error) {
            onSuccess();
            setOpen(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (isEdit ? (
                    <Button variant="outline" className="rounded-xl font-bold border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                        <Edit className="h-4 w-4 mr-2" /> EDITAR
                    </Button>
                ) : (
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_20px_rgba(79,70,229,0.3)] rounded-xl font-bold">
                        <Plus className="mr-2 h-4 w-4" /> REGISTRAR PERFIL
                    </Button>
                ))}
            </DialogTrigger>
            <DialogContent className="glass-dialog max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                        {isEdit ? "Optimizar Ficha Técnica" : (isDuplicate ? "Duplicar Perfil" : "Nuevo Perfil Competitivo")}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold">
                        Define el ADN competitivo y las demandas físicas del deporte.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-8 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">ID Deporte (Código)</Label>
                            <Input value={formData.sport_id} onChange={e => setFormData({ ...formData, sport_id: e.target.value })} className="rounded-xl bg-white/5 font-bold uppercase" placeholder="EJ: FOT-DEL" />
                        </div>
                        <div className="space-y-1.5 col-span-1 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre del Deporte</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="rounded-xl bg-white/5 font-bold" placeholder="EJ: Fútbol" />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Posición / Rol Específico</Label>
                            <Input value={formData.position_role} onChange={e => setFormData({ ...formData, position_role: e.target.value })} className="rounded-xl bg-white/5 font-bold" placeholder="EJ: Delantero Centro" />
                        </div>
                        <div className="space-y-1.5 flex items-end">
                            <Button type="button" variant="outline" className={cn("w-full rounded-xl font-bold h-10 uppercase text-[10px]", formData.is_active ? "border-emerald-500/30 text-emerald-500" : "border-rose-500/30 text-rose-500")} onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                {formData.is_active ? "Perfil Activo" : "Perfil Inactivo"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Coordenadas Biomecánicas</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <SelectField label="Apoyo" value={formData.laterality_support_id} options={options.supports} onChange={v => setFormData({ ...formData, laterality_support_id: v })} />
                            <SelectField label="Carga" value={formData.laterality_load_id} options={options.loads} onChange={v => setFormData({ ...formData, laterality_load_id: v })} />
                            <SelectField label="Anti-Rotación" value={formData.antirotation_stability_id} options={options.antirot} onChange={v => setFormData({ ...formData, antirotation_stability_id: v })} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500">Perfil de Demandas</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <SelectField label="COD Demand" value={formData.cod_demand_id} options={options.cod} onChange={v => setFormData({ ...formData, cod_demand_id: v })} />
                            <SelectField label="SSC Demand" value={formData.ssc_demand_id} options={options.ssc} onChange={v => setFormData({ ...formData, ssc_demand_id: v })} />
                            <SelectField label="Impact Demand" value={formData.impact_demand_id} options={options.impact} onChange={v => setFormData({ ...formData, impact_demand_id: v })} />
                            <SelectField label="Práctica Vol" value={formData.practice_volume_id} options={options.volumes} onChange={v => setFormData({ ...formData, practice_volume_id: v })} />
                            <SelectField label="Energy Profile" value={formData.energy_profile_id} options={options.profiles} onChange={v => setFormData({ ...formData, energy_profile_id: v })} />
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase text-center mb-2 italic">Próximamente: Gestión de Acciones Clave, Prioridades y Mezclas Visuales</p>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full py-6 rounded-2xl bg-indigo-600 text-lg font-black tracking-widest uppercase shadow-lg shadow-indigo-600/20">
                        {loading ? "Sincronizando..." : (isEdit ? "Actualizar Perfil" : "Desplegar Perfil")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SelectField({ label, value, options, onChange }: { label: string, value: string, options: any[], onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-slate-500 font-black ml-1">{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="rounded-xl bg-white/5 h-10 font-bold border-slate-200 dark:border-white/10">
                    <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent className="glass-dialog rounded-xl">
                    {options.map((opt: any) => (
                        <SelectItem key={opt.id} value={opt.id.toString()} className="font-bold">{opt.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
