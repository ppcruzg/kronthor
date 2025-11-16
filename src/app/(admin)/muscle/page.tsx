"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface MuscleGroup {
  id: number;
  name: string;
}

interface MuscleRecord {
  id: number;
  name: string;
  group_id: number;
  group_name: string;
}

type SupabaseMuscle = {
  id: number;
  name: string;
  group_id: number;
  muscle_group?: MuscleGroup | MuscleGroup[] | null;
};

const normalizeRelation = <T,>(value: T | T[] | null | undefined): T | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const mapRecord = (item: SupabaseMuscle): MuscleRecord => {
  const group = normalizeRelation(item.muscle_group);
  return {
    id: item.id,
    name: item.name,
    group_id: item.group_id ?? group?.id ?? 0,
    group_name: group?.name ?? "Sin grupo",
  };
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2, "Requerido"),
  group_id: z.number().int().min(1, "Selecciona un grupo muscular"),
});

type FormValues = z.infer<typeof schema>;

const PAGE_SIZE = 10;

export default function MuscleCatalogPage() {
  const [records, setRecords] = useState<MuscleRecord[]>([]);
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MuscleRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<MuscleRecord | null>(null);
  const [page, setPage] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", group_id: 0 },
  });

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: groupData, error: groupError }, { data: muscleData, error: muscleError }] =
        await Promise.all([
          supabase.from("muscle_group").select("id, name").order("name", { ascending: true }),
          supabase
            .from("muscle")
            .select(
              `
              id,
              name,
              group_id,
              muscle_group:group_id (
                id,
                name
              )
            `
            )
            .order("name", { ascending: true }),
        ]);

      if (groupError) {
        toast.error("No se pudieron cargar los grupos musculares.");
      } else {
        setGroups(groupData ?? []);
      }

      if (muscleError) {
        toast.error("No se pudieron cargar los musculos.");
      } else {
        setRecords((muscleData ?? []).map((item) => mapRecord(item as SupabaseMuscle)));
      }
    };

    fetchAll();
  }, []);

  const handleDialogChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setEditing(null);
    }
  };

  const handleNew = () => {
    if (!groups.length) {
      toast.error("Crea primero al menos un grupo muscular.");
      return;
    }
    setEditing(null);
    form.reset({ name: "", group_id: groups[0].id });
    setOpen(true);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter(
      (item) =>
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.group_name.toLowerCase().includes(q)
    );
  }, [records, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rangeStart = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = filtered.length ? Math.min(page * PAGE_SIZE, filtered.length) : 0;

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((prev) => {
      const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      return Math.min(prev, lastPage);
    });
  }, [filtered.length]);

  const submit = async (values: FormValues) => {
    if (editing) {
      const { data, error } = await supabase
        .from("muscle")
        .update({ name: values.name, group_id: values.group_id })
        .eq("id", editing.id)
        .select(
          `
          id,
          name,
          group_id,
          muscle_group:group_id (
            id,
            name
          )
        `
        )
        .single();

      if (error) {
        toast.error("No se pudo actualizar el musculo.");
        return;
      }

      const updated = mapRecord(data as SupabaseMuscle);
      setRecords((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Musculo actualizado.");
    } else {
      const { data, error } = await supabase
        .from("muscle")
        .insert({ name: values.name, group_id: values.group_id })
        .select(
          `
          id,
          name,
          group_id,
          muscle_group:group_id (
            id,
            name
          )
        `
        )
        .single();

      if (error) {
        toast.error("No se pudo crear el musculo.");
        return;
      }

      const created = mapRecord(data as SupabaseMuscle);
      setRecords((prev) => [created, ...prev]);
      toast.success("Musculo creado.");
    }

    setOpen(false);
    setEditing(null);
  };

  const onDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("muscle").delete().eq("id", toDelete.id);

    if (error) {
      toast.error("No se pudo eliminar el musculo.");
      return;
    }

    setRecords((prev) => prev.filter((item) => item.id !== toDelete.id));
    toast.success("Musculo eliminado.");
    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Musculos</h1>
            <p className="text-muted-foreground">
              Administra el catalogo de musculos y su grupo correspondiente.
            </p>
          </div>
          <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar musculo" : "Nuevo musculo"}</DialogTitle>
                <DialogDescription>
                  Completa los campos para guardar el registro.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...form.register("name")} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="group_id">Grupo muscular</Label>
                  <select
                    id="group_id"
                    {...form.register("group_id", { valueAsNumber: true })}
                    className="border px-3 py-2 rounded text-sm"
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Busqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por musculo o grupo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Musculo</TableHead>
                  <TableHead>Grupo muscular</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.group_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditing(item);
                            form.reset({
                              id: item.id,
                              name: item.name,
                              group_id: item.group_id,
                            });
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setToDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Sin resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex flex-col gap-2 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Mostrando {rangeStart}-{rangeEnd} de {filtered.length} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || filtered.length === 0}
                >
                  Anterior
                </Button>
                <span>
                  Pagina {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages || filtered.length === 0}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={!!toDelete} onOpenChange={(next) => !next && setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar</AlertDialogTitle>
              <AlertDialogDescription>
                Estas seguro de que deseas eliminar "{toDelete?.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
