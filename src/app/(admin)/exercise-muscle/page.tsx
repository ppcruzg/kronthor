"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  id: z.number().int().positive().optional(),
  exercise_id: z.string().uuid({ message: "Selecciona un ejercicio" }),
  muscle_id: z.number().int({ message: "Selecciona un musculo" }),
  role: z.enum(["primary", "secondary"]),
});

type FormValues = z.infer<typeof schema>;

interface ExerciseOption {
  id: string;
  name_es: string;
}

interface MuscleOption {
  id: number;
  name: string;
  subgroup_name: string;
  group_name: string;
}

interface ExerciseMuscleRecord {
  id: number;
  exercise_id: string;
  muscle_id: number;
  role: "primary" | "secondary";
  exercise_name: string;
  muscle_name: string;
  subgroup_name: string;
  group_name: string;
}

const normalizeRelation = <T,>(value: T | T[] | null | undefined): T | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const PAGE_SIZE = 10;
const ROLE_OPTIONS = [
  { value: "primary", label: "Primario" },
  { value: "secondary", label: "Secundario" },
];

export default function ExerciseMusclePage() {
  const [records, setRecords] = useState<ExerciseMuscleRecord[]>([]);
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [muscles, setMuscles] = useState<MuscleOption[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ExerciseMuscleRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExerciseMuscleRecord | null>(null);
  const [page, setPage] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      exercise_id: "",
      muscle_id: 0,
      role: "primary",
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((item) =>
      !q ||
      item.exercise_name.toLowerCase().includes(q) ||
      item.muscle_name.toLowerCase().includes(q) ||
      item.subgroup_name.toLowerCase().includes(q) ||
      item.group_name.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q)
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

  const loadRecords = useCallback(async () => {
    const { data, error } = await supabase
      .from("exercise_muscle")
      .select(
        `
        id,
        role,
        exercise_id,
        muscle_id,
        exercise:exercise_id ( id, name_es ),
        muscle:muscle_id (
          id,
          name,
          subgroup:subgroup_id (
            id,
            name,
            group:group_id ( id, name )
          )
        )
      `
      )
      .order("id", { ascending: true });

    if (error) {
      toast.error("No se pudieron cargar las relaciones");
      return;
    }

    setRecords(
      (data || []).map((item) => {
        const exercise = normalizeRelation(item.exercise);
        const muscle = normalizeRelation(item.muscle);
        const subgroup = normalizeRelation(muscle?.subgroup);
        const group = normalizeRelation(subgroup?.group);
        return {
          id: item.id,
          exercise_id: item.exercise_id,
          muscle_id: item.muscle_id,
          role: (item.role as "primary" | "secondary") ?? "primary",
          exercise_name: exercise?.name_es ?? "",
          muscle_name: muscle?.name ?? "",
          subgroup_name: subgroup?.name ?? "",
          group_name: group?.name ?? "",
        };
      })
    );
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      const [{ data: exerciseList, error: exerciseError }, { data: muscleList, error: muscleError }] =
        await Promise.all([
          supabase.from("exercise").select("id, name_es").order("name_es"),
          supabase
            .from("muscle")
            .select("id, name, subgroup:subgroup_id ( id, name, group:group_id ( id, name ) )")
            .order("name"),
        ]);

      if (exerciseError || muscleError) {
        toast.error("No se pudieron cargar los cat?logos");
        return;
      }

      setExercises((exerciseList || []).map(({ id, name_es }) => ({ id, name_es })));
      setMuscles(
        (muscleList || []).map((item) => {
          const subgroup = normalizeRelation(item.subgroup);
          const group = normalizeRelation(subgroup?.group);
          return {
            id: item.id,
            name: item.name,
            subgroup_name: subgroup?.name ?? "",
            group_name: group?.name ?? "",
          };
        })
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
        muscle_id: editing.muscle_id,
        role: editing.role,
      });
    } else {
      form.reset({
        exercise_id: exercises[0]?.id ?? "",
        muscle_id: muscles[0]?.id ?? 0,
        role: "primary",
      });
    }
  }, [editing, form, exercises, muscles]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const checkDuplicate = async (values: FormValues) => {
    let query = supabase
      .from("exercise_muscle")
      .select("id", { count: "exact", head: true })
      .eq("exercise_id", values.exercise_id)
      .eq("muscle_id", values.muscle_id)
      .eq("role", values.role);

    if (editing?.id) {
      query = query.neq("id", editing.id);
    }

    const { error, count } = await query;

    if (error) {
      toast.error("No se pudo validar el registro");
      return true;
    }

    return (count ?? 0) > 0;
  };

  const submit = async (values: FormValues) => {
    if (await checkDuplicate(values)) {
      toast.error("La combinaci?n ya existe");
      return;
    }

    if (editing?.id) {
      const { error } = await supabase
        .from("exercise_muscle")
        .update({
          exercise_id: values.exercise_id,
          muscle_id: values.muscle_id,
          role: values.role,
        })
        .eq("id", editing.id);

      if (error) {
        toast.error("Error al actualizar");
        return;
      }

      toast.success("Relaci?n actualizada");
    } else {
      const { error } = await supabase
        .from("exercise_muscle")
        .insert({
          exercise_id: values.exercise_id,
          muscle_id: values.muscle_id,
          role: values.role,
        });

      if (error) {
        toast.error("Error al crear");
        return;
      }

      toast.success("Relaci?n creada");
    }

    await loadRecords();
    setOpen(false);
    setEditing(null);
  };

  const onDelete = async () => {
    if (!toDelete) return;

    const { error } = await supabase.from("exercise_muscle").delete().eq("id", toDelete.id);

    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }

    toast.success("Relaci?n eliminada");
    setRecords((prev) => prev.filter((item) => item.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Ejercicio - musculos</h1>
            <p className="text-muted-foreground">
              Administra las relaciones entre ejercicios y musculos.
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
                  {editing ? "Editar relaci?n" : "Nueva relaci?n"}
                </DialogTitle>
                <DialogDescription>
                  Selecciona el ejercicio, el musculo y el rol.
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
                    <Label htmlFor="muscle_id">musculo</Label>
                    <select
                      id="muscle_id"
                      {...form.register("muscle_id", { valueAsNumber: true })}
                      className="border px-3 py-2 rounded text-sm"
                    >
                      {muscles.map((muscle) => (
                        <option key={muscle.id} value={muscle.id}>
                          {`${muscle.name}${
                            muscle.subgroup_name
                              ? ` (${muscle.subgroup_name}${
                                  muscle.group_name ? ` - ${muscle.group_name}` : ""
                                })`
                              : ""
                          }`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rol</Label>
                    <select
                      id="role"
                      {...form.register("role")}
                      className="border px-3 py-2 rounded text-sm"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
            <CardTitle>B?squeda</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por ejercicio, musculo, subgrupo, grupo o rol"
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
                  <TableHead>Ejercicio</TableHead>
                  <TableHead>musculo</TableHead>
                  <TableHead>Subgrupo</TableHead>
                  <TableHead>Grupo muscular</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.exercise_name}</TableCell>
                    <TableCell>{item.muscle_name}</TableCell>
                    <TableCell>{item.subgroup_name || "-"}</TableCell>
                    <TableCell>{item.group_name || "-"}</TableCell>
                    <TableCell>
                      {ROLE_OPTIONS.find((role) => role.value === item.role)?.label || item.role}
                    </TableCell>
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                  P?gina {page} de {totalPages}
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
                ?Est?s seguro de que deseas eliminar esta relaci?n?
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




