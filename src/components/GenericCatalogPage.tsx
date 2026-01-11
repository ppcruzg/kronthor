"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Search, Plus, Pencil, Trash, Tag, Database } from "lucide-react";
import { Label } from "@/components/ui/label";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CatalogItem {
    id: number;
    name: string;
    code?: string;
    description?: string;
}

interface GenericCatalogPageProps {
    tableName: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
}

const PAGE_SIZE = 10;

export function GenericCatalogPage({ tableName, title, description, icon }: GenericCatalogPageProps) {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<CatalogItem | null>(null);
    const [open, setOpen] = useState(false);
    const [toDelete, setToDelete] = useState<CatalogItem | null>(null);
    const [page, setPage] = useState(1);
    // const [refreshKey, setRefreshKey] = useState(0); // Removed unused

    const fetchItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .order("id", { ascending: true });

        if (!error) setItems(data || []);
        setLoading(false);
    }, [tableName]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        fetchItems();
    }, [fetchItems]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter((x) =>
            !q ||
            x.name.toLowerCase().includes(q) ||
            (x.code && x.code.toLowerCase().includes(q))
        );
    }, [items, query]);

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    const onDelete = async () => {
        if (!toDelete) return;
        const { error } = await supabase.from(tableName).delete().eq("id", toDelete.id);
        if (!error) fetchItems();
        setToDelete(null);
    };

    return (
        <div className="min-h-screen gradient-bg text-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-700">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter flex items-center gap-4 neon-text uppercase">
                            <div className="p-2 glass-card rounded-xl neon-border">
                                {icon || <Database className="h-6 w-6 text-indigo-400" />}
                            </div>
                            {title}
                        </h1>
                        <p className="text-slate-400 font-medium ml-1">{description}</p>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_20px_rgba(79,70,229,0.3)] font-bold">
                                <Plus className="mr-2 h-4 w-4" /> NUEVO REGISTRO
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-dialog">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black neon-text italic">
                                    {editing ? "RE-CONFIGURAR" : "CREAR REGISTRO"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Define las propiedades del catálogo para {title}.
                                </DialogDescription>
                            </DialogHeader>
                            {open && (
                                <CatalogForm
                                    tableName={tableName}
                                    editing={editing}
                                    onSuccess={() => {
                                        fetchItems();
                                        setOpen(false);
                                    }}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <Card className="glass-card border-white/10 bg-white/[0.02] dark:bg-slate-950/50">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Buscar por nombre o código..."
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                                className="pl-10 bg-white/5 border-white/10 focus:ring-indigo-500/50"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Grid / List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl bg-white/5 dark:bg-slate-950/50" />)
                    ) : (
                        paginated.map((x) => (
                            <Card key={x.id} className="glass-card border-white/10 bg-white/[0.02] dark:bg-slate-950/50 hover:neon-border transition-all group shadow-lg dark:shadow-none">
                                <CardContent className="p-5 flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Tag className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight">{x.name}</h3>
                                            {x.code && <Badge className="bg-white/10 text-slate-300 border-none text-[10px]">{x.code}</Badge>}
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2">{x.description || "Sin descripción."}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 dark:text-blue-400 hover:text-blue-400 hover:bg-blue-500/10" onClick={() => { setEditing(x); setOpen(true); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 dark:text-rose-400 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => setToDelete(x)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between glass-card p-4 rounded-2xl border-white/5">
                        <p className="text-slate-400 text-sm">Viendo {paginated.length} de {filtered.length} registros</p>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="hover:bg-white/10">Anterior</Button>
                            <div className="flex items-center px-4 font-bold text-indigo-400">Página {page} de {totalPages}</div>
                            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="hover:bg-white/10">Siguiente</Button>
                        </div>
                    </div>
                )}

                {/* Delete Dialog */}
                <AlertDialog open={!!toDelete} onOpenChange={(o) => { if (!o) setToDelete(null); }}>
                    <AlertDialogContent className="glass-dialog">
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                                Esta acción eliminará &quot;{toDelete?.name}&quot; del catálogo y podría afectar a los registros que lo utilizan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/5 border-white/10 text-white" onClick={() => setToDelete(null)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="bg-rose-600 hover:bg-rose-700 font-bold">ELIMINAR</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

interface CatalogFormProps {
    tableName: string;
    editing: CatalogItem | null;
    onSuccess: () => void;
}

function CatalogForm({ tableName, editing, onSuccess }: CatalogFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: editing?.name || "",
        code: editing?.code || "",
        description: editing?.description || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            name: formData.name,
            ...(formData.code ? { code: formData.code } : {}),
            ...(formData.description ? { description: formData.description } : {})
        };

        let error;
        if (editing) {
            error = (await supabase.from(tableName).update(payload).eq("id", editing.id)).error;
        } else {
            error = (await supabase.from(tableName).insert(payload)).error;
        }

        if (!error) onSuccess();
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Nombre</Label>
                <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 font-bold"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Código (Opcional)</Label>
                <Input
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="bg-white/5 border-white/10 italic font-bold"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Descripción (Opcional)</Label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-24 rounded-lg bg-white/5 border border-white/10 p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                />
            </div>
            <Button type="submit" disabled={loading} className="w-full py-6 font-black tracking-widest bg-indigo-600 hover:neon-border transition-all duration-300">
                {loading ? "SINCRONIZANDO..." : (editing ? "ACTUALIZAR CORE" : "DESPLEGAR REGISTRO")}
            </Button>
        </form>
    );
}
