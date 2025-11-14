"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2, "Requerido"),
  group_id: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

interface MuscleGroup {
  id: number;
  name: string;
}

interface MuscleSubgroup {
  id: number;
  name: string;
  group_id: number;
  group?: MuscleGroup | null;
}

const buildSubgroup = (item: any): MuscleSubgroup => ({
  id: item.id,
  name: item.name,
  group_id: item.group_id,
  group: Array.isArray(item.group)
    ? item.group[0] ?? null
    : item.group ?? null,
});

const PAGE_SIZE = 10;

export default function MuscleSubgroupPage() {
  const [records, setRecords] = useState<MuscleSubgroup[]>([]);
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MuscleSubgroup | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<MuscleSubgroup | null>(null);
  const [page, setPage] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      group_id: 0,
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter(
      (item) =>
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.group?.name.toLowerCase().includes(q)
    );
  }, [records, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rangeStart = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = filtered.length
    ? Math.min(page * PAGE_SIZE, filtered.length)
    : 0;

  const loadSubgroups = useCallback(async () => {
    const { data } = await supabase
      .from("muscle_subgroup")
      .select("id, name, group_id, group:group_id ( id, name )")
      .order("name", { ascending: true });

    setRecords((data || []).map(buildSubgroup));
  }, []);

  useEffect(() => {
    const loadGroups = async () => {
      const { data } = await supabase
        .from("muscle_group")
        .select("id, name")
        .order("name", { ascending: true });

      setGroups(data || []);
    };

    loadGroups();
    loadSubgroups();
  }, [loadSubgroups]);

  useEffect(() => {
    if (editing) {
      form.reset({
        id: editing.id,
        name: editing.name,
        group_id: editing.group_id,
      });
    } else {
      form.reset({
        name: "",
        group_id: groups[0]?.id || 0,
      });
    }
  }, [editing, form, groups]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const submit = async (values: FormValues) => {
    if (editing?.id) {
      const { error } = await supabase
        .from("muscle_subgroup")
        .update({ name: values.name, group_id: values.group_id })
        .eq("id", editing.id);

      if (!error) {
        await loadSubgroups();
      }
    } else {
      const { error } = await supabase
        .from("muscle_subgroup")
        .insert({ name: values.name, group_id: values.group_id });

      if (!error) {
        await loadSubgroups();
      }
    }

    setOpen(false);
    setEditing(null);
  };

  const onDelete = async () => {
    if (!toDelete) return;

    await supabase.from("muscle_subgroup").delete().eq("id", toDelete.id);
    setRecords((prev) => prev.filter((item) => item.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Subgrupos musculares</h1>
            <p className="text-muted-foreground">
              Administra el catálogo maestro de subgrupos.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar subgrupo" : "Nuevo subgrupo"}
                </DialogTitle>
                <DialogDescription>
                  Completa la información del subgrupo muscular.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-4">
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
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
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
            <CardTitle>Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por subgrupo o grupo"
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
                  <TableHead>Subgrupo</TableHead>
                  <TableHead>Grupo muscular</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.group?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditing(item);
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
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
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
                  Página {page} de {totalPages}
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
                ¿Estás seguro de que deseas eliminar "{toDelete?.name}"?
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

