"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Search,
    Plus,
    Dumbbell,
    Edit,
    Trash,
    Video,
    ExternalLink,
    Zap,
    Layers,
    Activity,
    ChevronRight,
    Copy,
    Info,
    CheckCircle2,
    XCircle,
    Hash
} from "lucide-react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ExerciseMixVisual } from "@/components/ExerciseMixVisual";
import { cn } from "@/lib/utils";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Exercise {
    id: string;
    name_es: string;
    name_en: string | null;
    description: string | null;
    urlvideo: string | null;
    is_active: boolean;
    type_id: number | null;
    difficulty_id: number | null;
    training_method_id: number | null;
    laterality_support_id: number | null;
    laterality_load_id: number | null;
    ssc_demand_id: number | null;
    impact_demand_id: number | null;
    antirotation_stability_id: number | null;
    movement_pattern_id: number | null;
    exercise_type: { name: string } | null;
    difficulty: { name: string } | null;
    training_method: { name: string } | null;
    laterality_support: { name: string } | null;
    laterality_load: { name: string } | null;
    ssc_demand: { name: string } | null;
    impact_demand: { name: string } | null;
    antirotation_stability: { name: string } | null;
    movement_pattern: { name: string } | null;
    exercise_vector_mix: { id: number; weight: number; dominant_vector: { name: string } }[];
    exercise_plane_mix: { id: number; weight: number; plane: { name: string } }[];
    exercise_muscle: { role: "primary" | "secondary"; muscle: { name: string } }[];
    exercise_equipment: { equipment: { id: number; name: string } }[];
}

export default function ExercisesCatalogModern() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchExercises = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("exercise")
            .select(`
        *,
        exercise_type:type_id (name),
        difficulty:difficulty_id (name),
        training_method:training_method_id (name),
        laterality_support:laterality_support_id (name),
        laterality_load:laterality_load_id (name),
        ssc_demand:ssc_demand_id (name),
        impact_demand:impact_demand_id (name),
        antirotation_stability:antirotation_stability_id (name),
        movement_pattern:movement_pattern_id (name),
        exercise_vector_mix (id, weight, dominant_vector:vector_id (name)),
        exercise_plane_mix (id, weight, plane:plane_id (name)),
        exercise_muscle!exercise_muscle_exercise_id_fkey (role, muscle:muscle_id (name)),
        exercise_equipment (equipment:equipment_id (id, name))
      `)
            .order("name_es", { ascending: true });

        if (!error) {
            setExercises(data || []);
            if (data && data.length > 0 && !selectedId) {
                setSelectedId(data[0].id);
            }
        }
        setLoading(false);
    };

    useEffect(() => { fetchExercises(); }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return exercises.filter(ex =>
            ex.name_es.toLowerCase().includes(q) ||
            (ex.name_en && ex.name_en.toLowerCase().includes(q)) ||
            ex.exercise_muscle.some(em => em.muscle.name.toLowerCase().includes(q))
        );
    }, [exercises, search]);

    const selectedExercise = useMemo(() =>
        exercises.find(ex => ex.id === selectedId) || null
        , [exercises, selectedId]);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('exercise').delete().eq('id', id);
        if (!error) {
            setExercises(prev => prev.filter(ex => ex.id !== id));
            if (selectedId === id) setSelectedId(exercises[0]?.id || null);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Dumbbell className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Ejercicios</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Catálogo Core de Alto Rendimiento</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <CreateExerciseDialog onSuccess={fetchExercises} />
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
                                placeholder="Buscar por nombre o músculo..."
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
                                {filtered.map(ex => (
                                    <button
                                        key={ex.id}
                                        onClick={() => setSelectedId(ex.id)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-center justify-between group",
                                            selectedId === ex.id
                                                ? "bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white"
                                                : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className={cn("text-sm font-black truncate uppercase tracking-tight", selectedId === ex.id ? "text-white" : "text-slate-900 dark:text-slate-200")}>
                                                {ex.name_es}
                                            </div>
                                            <div className={cn("text-[10px] font-bold truncate opacity-70 italic", selectedId === ex.id ? "text-indigo-100" : "text-slate-500")}>
                                                {ex.name_en || ex.name_es}
                                            </div>
                                        </div>
                                        <ChevronRight className={cn("h-4 w-4 transition-transform", selectedId === ex.id ? "scale-110 opacity-100" : "opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0")} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Details & Analysis */}
                <div className="flex-1 min-h-0 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm flex flex-col">
                    {selectedExercise ? (
                        <>
                            {/* Detail Header */}
                            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-start bg-slate-50/30 dark:bg-transparent">
                                <div className="space-y-3 max-w-4xl">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                                            {selectedExercise.exercise_type?.name || "STANDARD"}
                                        </Badge>
                                        <Badge variant="outline" className={cn(
                                            "font-black text-[10px] uppercase tracking-widest px-3 py-1 border-none",
                                            selectedExercise.difficulty?.name === 'Avanzado' ? 'bg-rose-500/10 text-rose-600' :
                                                selectedExercise.difficulty?.name === 'Intermedio' ? 'bg-amber-500/10 text-amber-600' :
                                                    'bg-emerald-500/10 text-emerald-600'
                                        )}>
                                            {selectedExercise.difficulty?.name || "Básico"}
                                        </Badge>
                                        {!selectedExercise.is_active && (
                                            <Badge className="bg-red-500/10 text-red-600 border-none font-black text-[10px] uppercase">Inactivo</Badge>
                                        )}
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                                        {selectedExercise.name_es}
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 font-bold text-sm leading-relaxed max-w-xl">
                                        {selectedExercise.description || "Sin descripción científica detallada aún."}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <CreateExerciseDialog editData={selectedExercise} onSuccess={fetchExercises} />
                                    <CreateExerciseDialog
                                        duplicateData={selectedExercise}
                                        onSuccess={fetchExercises}
                                        trigger={
                                            <Button variant="outline" className="rounded-xl font-bold border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5" title="Duplicar como base">
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
                                                <AlertDialogTitle className="text-xl font-black uppercase">¿Eliminar ejercicio?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-slate-600 dark:text-slate-400 font-bold">
                                                    Esta acción es irreversible y afectará a todos los programas que usen este ejercicio.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(selectedExercise.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl font-bold">
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
                                                <Activity className="h-4 w-4" /> Análisis de Coordenadas
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <ExerciseMixVisual
                                                    items={selectedExercise.exercise_vector_mix.map(v => ({ id: v.id, name: v.dominant_vector.name, weight: v.weight }))}
                                                    title="Vectores de Fuerza"
                                                    type="vector"
                                                />
                                                <ExerciseMixVisual
                                                    items={selectedExercise.exercise_plane_mix.map(p => ({ id: p.id, name: p.plane.name, weight: p.weight }))}
                                                    title="Planos de Ejecución"
                                                    type="plane"
                                                />
                                            </div>
                                        </div>

                                        {/* Muscles & Equipment */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                    <Layers className="h-3 w-3" /> Foco Muscular
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedExercise.exercise_muscle.map((m, i) => (
                                                        <Badge key={i} variant={m.role === 'primary' ? 'default' : 'secondary'} className={cn(
                                                            "text-[10px] font-black uppercase px-2 py-0.5",
                                                            m.role === 'primary' ? "bg-indigo-600" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                                                        )}>
                                                            {m.muscle.name} {m.role === 'primary' ? '(P)' : '(S)'}
                                                        </Badge>
                                                    ))}
                                                    {selectedExercise.exercise_muscle.length === 0 && <span className="text-xs text-slate-400 italic">No definido</span>}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                    <Plus className="h-3 w-3" /> Equipamiento
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedExercise.exercise_equipment.map((e, i) => (
                                                        <Badge key={i} variant="outline" className="text-[10px] font-black uppercase border-slate-200 dark:border-white/10">
                                                            {e.equipment.name}
                                                        </Badge>
                                                    ))}
                                                    {selectedExercise.exercise_equipment.length === 0 && <span className="text-xs text-slate-400 italic">Peso corporal</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Parameters Grid */}
                                    <div className="lg:col-span-5 space-y-10">
                                        {/* Params Group: Biomechanics */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Parámetros Biomecánicos</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                <DetailRow label="Patrón" value={selectedExercise.movement_pattern?.name} icon={<Activity className="h-3.5 w-3.5" />} />
                                                <DetailRow label="Apoyo" value={selectedExercise.laterality_support?.name} icon={<Hash className="h-3.5 w-3.5" />} />
                                                <DetailRow label="Carga" value={selectedExercise.laterality_load?.name} icon={<Layers className="h-3.5 w-3.5" />} />
                                                <DetailRow label="Anti-Rotación" value={selectedExercise.antirotation_stability?.name} icon={<Activity className="h-3.5 w-3.5" />} />
                                            </div>
                                        </div>

                                        {/* Params Group: Physiology */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Perfil Fisiológico</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                <DetailRow label="Demanda SSC" value={selectedExercise.ssc_demand?.name} icon={<Zap className="h-3.5 w-3.5" />} color="text-amber-500" />
                                                <DetailRow label="Demanda Impacto" value={selectedExercise.impact_demand?.name} icon={<Activity className="h-3.5 w-3.5" />} color="text-rose-500" />
                                                <DetailRow label="Método" value={selectedExercise.training_method?.name} icon={<Info className="h-3.5 w-3.5" />} />
                                            </div>
                                        </div>

                                        {/* Video Resource */}
                                        {selectedExercise.urlvideo && (
                                            <a
                                                href={selectedExercise.urlvideo}
                                                target="_blank"
                                                rel="noopener"
                                                className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 group hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-600 rounded-lg">
                                                        <Video className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span className="text-sm font-black text-indigo-700 dark:text-indigo-300 uppercase">Ver Multimedia</span>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </a>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                            <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full">
                                <Dumbbell className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registro Maestro</h3>
                                <p className="text-slate-500 font-bold max-w-xs">Selecciona un ejercicio de la lista para gestionar sus parámetros biomecánicos y fisiológicos.</p>
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

{/* Re-using and improving Dialog from original for consistency */ }
interface CreateExerciseDialogProps {
    editData?: Exercise;
    duplicateData?: Exercise;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

function CreateExerciseDialog({ editData, duplicateData, onSuccess, trigger }: CreateExerciseDialogProps) {
    const isEdit = !!editData;
    const isDuplicate = !!duplicateData;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [options, setOptions] = useState<any>({
        planes: [], supports: [], loads: [], ssc: [], impact: [], antirot: [], methods: [], types: [], difficulties: [], patterns: [], equipments: [], vectors: []
    });

    const [formData, setFormData] = useState<any>({
        name_es: "", name_en: "", description: "", urlvideo: "", type_id: "", difficulty_id: "", training_method_id: "", laterality_support_id: "", laterality_load_id: "", ssc_demand_id: "", impact_demand_id: "", antirotation_stability_id: "", movement_pattern_id: "",
    });

    useEffect(() => {
        if (open) {
            const fetchOptions = async () => {
                const [planes, supports, loads, ssc, impact, antirot, methods, types, diffs, patterns, equips, vectors] = await Promise.all([
                    supabase.from("plane").select("id, name"),
                    supabase.from("laterality_support").select("id, name"),
                    supabase.from("laterality_load").select("id, name"),
                    supabase.from("ssc_demand").select("id, name"),
                    supabase.from("impact_demand").select("id, name"),
                    supabase.from("antirotation_stability").select("id, name"),
                    supabase.from("training_method").select("id, name"),
                    supabase.from("exercise_type").select("id, name"),
                    supabase.from("difficulty_level").select("id, name"),
                    supabase.from("movement_pattern").select("id, name"),
                    supabase.from("equipment").select("id, name"),
                    supabase.from("dominant_vector").select("id, name")
                ]);
                setOptions({ planes: planes.data || [], supports: supports.data || [], loads: loads.data || [], ssc: ssc.data || [], impact: impact.data || [], antirot: antirot.data || [], methods: methods.data || [], types: types.data || [], difficulties: diffs.data || [], patterns: patterns.data || [], equipments: equips.data || [], vectors: vectors.data || [] });
            };
            fetchOptions();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (editData) {
                setFormData({
                    name_es: editData.name_es, name_en: editData.name_en || "", description: editData.description || "", urlvideo: editData.urlvideo || "", type_id: editData.type_id?.toString() || "", difficulty_id: editData.difficulty_id?.toString() || "", training_method_id: editData.training_method_id?.toString() || "", laterality_support_id: editData.laterality_support_id?.toString() || "", laterality_load_id: editData.laterality_load_id?.toString() || "", ssc_demand_id: editData.ssc_demand_id?.toString() || "", impact_demand_id: editData.impact_demand_id?.toString() || "", antirotation_stability_id: editData.antirotation_stability_id?.toString() || "", movement_pattern_id: editData.movement_pattern_id?.toString() || "",
                });
            } else if (duplicateData) {
                setFormData({
                    name_es: `${duplicateData.name_es} (COPIA)`, name_en: duplicateData.name_en ? `${duplicateData.name_en} (COPY)` : "", description: duplicateData.description || "", urlvideo: duplicateData.urlvideo || "", type_id: duplicateData.type_id?.toString() || "", difficulty_id: duplicateData.difficulty_id?.toString() || "", training_method_id: duplicateData.training_method_id?.toString() || "", laterality_support_id: duplicateData.laterality_support_id?.toString() || "", laterality_load_id: duplicateData.laterality_load_id?.toString() || "", ssc_demand_id: duplicateData.ssc_demand_id?.toString() || "", impact_demand_id: duplicateData.impact_demand_id?.toString() || "", antirotation_stability_id: duplicateData.antirotation_stability_id?.toString() || "", movement_pattern_id: duplicateData.movement_pattern_id?.toString() || "",
                });
            } else {
                setFormData({
                    name_es: "", name_en: "", description: "", urlvideo: "", type_id: "", difficulty_id: "", training_method_id: "", laterality_support_id: "", laterality_load_id: "", ssc_demand_id: "", impact_demand_id: "", antirotation_stability_id: "", movement_pattern_id: "",
                });
            }
        }
    }, [editData, duplicateData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const dataToSave = { ...formData, type_id: parseInt(formData.type_id) || null, difficulty_id: parseInt(formData.difficulty_id) || null, training_method_id: parseInt(formData.training_method_id) || null, laterality_support_id: parseInt(formData.laterality_support_id) || null, laterality_load_id: parseInt(formData.laterality_load_id) || null, ssc_demand_id: parseInt(formData.ssc_demand_id) || null, impact_demand_id: parseInt(formData.impact_demand_id) || null, antirotation_stability_id: parseInt(formData.antirotation_stability_id) || null, movement_pattern_id: parseInt(formData.movement_pattern_id) || null };
        let error;
        if (isEdit) { error = (await supabase.from("exercise").update(dataToSave).eq("id", editData.id)).error; }
        else { error = (await supabase.from("exercise").insert(dataToSave).select()).error; }
        if (!error) { onSuccess(); setOpen(false); }
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
                        <Plus className="mr-2 h-4 w-4" /> REGISTRAR EJERCICIO
                    </Button>
                ))}
            </DialogTrigger>
            <DialogContent className="glass-dialog max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                        {isEdit ? "Optimizar Parámetros" : (isDuplicate ? "Duplicar Ejercicio" : "Nuevo Atleta Mecánico")}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold">
                        Define el ADN biomecánico para este ejercicio.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-8 py-4">
                    {/* Form fields - compressed version of original for space */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nombre (ES)</Label>
                            <Input value={formData.name_es} onChange={e => setFormData({ ...formData, name_es: e.target.value })} className="rounded-xl bg-white/5 font-bold" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Name (EN)</Label>
                            <Input value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} className="rounded-xl bg-white/5 font-bold italic" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <SelectField label="Patrón" value={formData.movement_pattern_id} options={options.patterns} onChange={v => setFormData({ ...formData, movement_pattern_id: v })} />
                        <SelectField label="Tipo Apoyo" value={formData.laterality_support_id} options={options.supports} onChange={v => setFormData({ ...formData, laterality_support_id: v })} />
                        <SelectField label="Tipo Carga" value={formData.laterality_load_id} options={options.loads} onChange={v => setFormData({ ...formData, laterality_load_id: v })} />
                        <SelectField label="SSC" value={formData.ssc_demand_id} options={options.ssc} onChange={v => setFormData({ ...formData, ssc_demand_id: v })} />
                        <SelectField label="Impacto" value={formData.impact_demand_id} options={options.impact} onChange={v => setFormData({ ...formData, impact_demand_id: v })} />
                        <SelectField label="Dificultad" value={formData.difficulty_id} options={options.difficulties} onChange={v => setFormData({ ...formData, difficulty_id: v })} />
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <Input placeholder="URL Vídeo descriptivo" value={formData.urlvideo} onChange={e => setFormData({ ...formData, urlvideo: e.target.value })} className="rounded-xl bg-white/5 font-bold" />
                        <textarea placeholder="Descripción técnica del ejercicio..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-24 rounded-2xl bg-white/5 border border-slate-200 dark:border-white/10 p-4 font-bold text-sm outline-none focus:ring-1 focus:ring-indigo-600" />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full py-6 rounded-2xl bg-indigo-600 text-lg font-black tracking-widest uppercase">
                        {loading ? "Sincronizando..." : (isEdit ? "Confirmar Cambios" : "Desplegar Ejercicio")}
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
                    {options.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id.toString()} className="font-bold">{opt.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
