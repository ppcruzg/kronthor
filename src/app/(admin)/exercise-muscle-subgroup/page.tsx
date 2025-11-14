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
  exercise_id: z.string().uuid(),
  subgroup_id: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

interface ExerciseOption {
  id: string;
  name_es: string;
}

interface SubgroupOption {
  id: number;
  name: string;
  group_name: string;
}

interface ExerciseMuscleSubgroupRecord {
  id: number;
  exercise_id: string;
  subgroup_id: number;
  exercise_name: string;
  subgroup_name: string;
  muscle_group_name: string;
}

const PAGE_SIZE = 10;

export default function ExerciseMuscleSubgroupPage() {
  const [records, setRecords] = useState<ExerciseMuscleSubgroupRecord[]>([]);
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [subgroups, setSubgroups] = useState<SubgroupOption[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ExerciseMuscleSubgroupRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExerciseMuscleSubgroupRecord | null>(null);
  const [page, setPage] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      exercise_id: "",
      subgroup_id: 0,
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((item) => {
      if (!q) return true;
      return (
        item.exercise_name.toLowerCase().includes(q) ||
        item.subgroup_name.toLowerCase().includes(q) ||
        item.muscle_group_name.toLowerCase().includes(q)
      );
    });
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

  const loadRecords = useCallback(async () => {
    const { data } = await supabase
      .from("exercise_muscle_subgroup")
      .select(
        `
        id,
        exercise_id,
        subgroup_id,
        exercise:exercise_id ( id, name_es ),
        subgroup:subgroup_id (
          id,
          name,
          group:group_id ( id, name )
        )
      `
      )
      .order("id", { ascending: true });

    setRecords(
      (data || []).map((item) => ({
        id: item.id,
        exercise_id: item.exercise_id,
        subgroup_id: item.subgroup_id,
        exercise_name: item.exercise?.name_es ?? "",
        subgroup_name: item.subgroup?.name ?? "",
        muscle_group_name: item.subgroup?.group?.name ?? "",
      }))
    );
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      const [{ data: exerciseList }, { data: subgroupList }] = await Promise.all([
        supabase.from("exercise").select("id, name_es").order("name_es"),
        supabase
          .from("muscle_subgroup")
          .select("id, name, group:group_id ( id, name )")
          .order("name"),
      ]);

      setExercises(exerciseList || []);
      setSubgroups(
        (subgroupList || []).map((item) => ({
          id: item.id,
          name: item.name,
          group_name: item.group?.name ?? "",
        }))
      );
    };

    loadOptions();
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (editing) {
      form.reset({
        id: editing.id,
        exercise_id: editing.exercise_id,
        subgroup_id: editing.subgroup_id,
      });
    } else {
      form.reset({
        exercise_id: exercises[0]?.id ?? "",
        subgroup_id: subgroups[0]?.id ?? 0,
      });
    }
  }, [editing, form, exercises, subgroups]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const submit = async (values: FormValues) => {
    if (editing?.id) {
      const { error } = await supabase
        .from("exercise_muscle_subgroup")
        .update({
          exercise_id: values.exercise_id,
          subgroup_id: values.subgroup_id,
        })
        .eq("id", editing.id);

      if (!error) {
        await loadRecords();
      }
    } else {
      const { error } = await supabase
        .from("exercise_muscle_subgroup")
        .insert({
          exercise_id: values.exercise_id,
          subgroup_id: values.subgroup_id,
        });

      if (!error) {
        await loadRecords();
      }
    }

    setOpen(false);
    setEditing(null);
  };

  const onDelete = async () => {
    if (!toDelete) return;

    await supabase.from("exercise_muscle_subgroup").delete().eq("id", toDelete.id);
    setRecords((prev) => prev.filter((item) => item.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Ejercicio - Subgrupos</h1>
            <p className="text-muted-foreground">
              Administra las relaciones entre ejercicios y subgrupos musculares.
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
            <DialogContent className="max-w-xl md:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar relación" : "Nueva relación"}
                </DialogTitle>
                <DialogDescription>
                  Selecciona el ejercicio y el subgrupo muscular.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="exercise_id">Ejercicio</Label>
                    <select
                      id="exercise_id"
                      {...form.register("exercise_id")}
                      className="border px-3 py-2 rounded text-sm"
                    >
                      {exercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name_es}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subgroup_id">Subgrupo muscular</Label>
                    <select
                      id="subgroup_id"
                      {...form.register("subgroup_id", { valueAsNumber: true })}
                      className="border px-3 py-2 rounded text-sm"
                    >
                      {subgroups.map((subgroup) => (
                        <option key={subgroup.id} value={subgroup.id}>
                          {`${subgroup.name}${
                            subgroup.group_name ? ` (${subgroup.group_name})` : ""
                          }`}
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
              placeholder="Buscar por ejercicio, subgrupo o grupo"
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
                  <TableHead>Ejercicio</TableHead>
                  <TableHead>Subgrupo</TableHead>
                  <TableHead>Grupo muscular</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.exercise_name}</TableCell>
                    <TableCell>{item.subgroup_name}</TableCell>
                    <TableCell>{item.muscle_group_name || "-"}</TableCell>
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                ¿Estás seguro de que deseas eliminar esta relación?
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
