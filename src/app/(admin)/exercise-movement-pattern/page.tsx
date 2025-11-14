"use client";

import { useEffect, useMemo, useState } from "react";
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

export type FormValues = z.infer<typeof schema>;

interface ExerciseMovementPattern {
  id: number;
  exercise_id: string;
  pattern_id: number;
  exercise_name: string;
  pattern_name: string;
}

interface Exercise {
  id: string;
  name_es: string;
}

interface MovementPattern {
  id: number;
  name: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  id: z.number().int().positive().optional(),
  exercise_id: z.string().uuid(),
  pattern_id: z.number().int(),
});

const PAGE_SIZE = 10;

export default function ExerciseMovementPatternPage() {
  const [records, setRecords] = useState<ExerciseMovementPattern[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [patterns, setPatterns] = useState<MovementPattern[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ExerciseMovementPattern | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExerciseMovementPattern | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter(
      (x) =>
        !q ||
        x.exercise_name.toLowerCase().includes(q) ||
        x.pattern_name.toLowerCase().includes(q)
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

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: exerciseList }, { data: patternList }, { data }] =
        await Promise.all([
          supabase.from("exercise").select("id, name_es").order("name_es"),
          supabase.from("movement_pattern").select("id, name").order("name"),
          supabase
            .from("exercise_movement_pattern")
            .select(
              `
                id,
                exercise_id,
                pattern_id,
                exercise:exercise_id (
                  id,
                  name_es
                ),
                movement_pattern:pattern_id (
                  id,
                  name
                )
              `
            )
            .order("id", { ascending: true }),
        ]);

      setExercises(exerciseList || []);
      setPatterns(patternList || []);
      setRecords(
        (data || []).map((item) => ({
          id: item.id,
          exercise_id: item.exercise_id,
          pattern_id: item.pattern_id,
          exercise_name: item.exercise?.name_es ?? "Sin nombre",
          pattern_name: item.movement_pattern?.name ?? "Sin nombre",
        }))
      );
      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((prev) => {
      const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      return Math.min(prev, lastPage);
    });
  }, [filtered.length]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: editing
      ? {
          id: editing.id,
          exercise_id: editing.exercise_id,
          pattern_id: editing.pattern_id,
        }
      : {
          exercise_id: "",
          pattern_id: patterns[0]?.id ?? 0,
        },
  });

  const submit = async (values: FormValues) => {
    if (editing?.id) {
      const { data, error } = await supabase
        .from("exercise_movement_pattern")
        .update({
          exercise_id: values.exercise_id,
          pattern_id: values.pattern_id,
        })
        .eq("id", editing.id)
        .select(
          `
            id,
            exercise_id,
            pattern_id,
            exercise:exercise_id (
              id,
              name_es
            ),
            movement_pattern:pattern_id (
              id,
              name
            )
          `
        )
        .single();

      if (!error && data) {
        setRecords((prev) =>
          prev.map((p) =>
            p.id === editing.id
              ? {
                  id: data.id,
                  exercise_id: data.exercise_id,
                  pattern_id: data.pattern_id,
                  exercise_name: data.exercise?.name_es ?? "Sin nombre",
                  pattern_name: data.movement_pattern?.name ?? "Sin nombre",
                }
              : p
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from("exercise_movement_pattern")
        .insert({
          exercise_id: values.exercise_id,
          pattern_id: values.pattern_id,
        })
        .select(
          `
            id,
            exercise_id,
            pattern_id,
            exercise:exercise_id (
              id,
              name_es
            ),
            movement_pattern:pattern_id (
              id,
              name
            )
          `
        )
        .single();

      if (!error && data) {
        setRecords((prev) => [
          {
            id: data.id,
            exercise_id: data.exercise_id,
            pattern_id: data.pattern_id,
            exercise_name: data.exercise?.name_es ?? "Sin nombre",
            pattern_name: data.movement_pattern?.name ?? "Sin nombre",
          },
          ...prev,
        ]);
      }
    }
    setOpen(false);
  };

  const onDelete = async () => {
    if (!toDelete) return;

    const { error } = await supabase
      .from("exercise_movement_pattern")
      .delete()
      .eq("id", toDelete.id);

    if (!error)
      setRecords((prev) => prev.filter((p) => p.id !== toDelete.id));

    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Patrones por ejercicio</h1>
            <p className="text-muted-foreground">
              Relaciona ejercicios con sus patrones de movimiento.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  form.reset({
                    exercise_id: exercises[0]?.id ?? "",
                    pattern_id: patterns[0]?.id ?? 0,
                  });
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar relación" : "Nueva relación"}
                </DialogTitle>
                <DialogDescription>
                  Selecciona el ejercicio y el patrón de movimiento.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(submit)}
              >
                <div className="grid gap-2">
                  <Label htmlFor="exercise_id">Ejercicio</Label>
                  <select
                    id="exercise_id"
                    {...form.register("exercise_id")}
                    className="border px-3 py-2 rounded text-sm"
                  >
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name_es}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pattern_id">Patrón</Label>
                  <select
                    id="pattern_id"
                    {...form.register("pattern_id", { valueAsNumber: true })}
                    className="border px-3 py-2 rounded text-sm"
                  >
                    {patterns.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name}
                      </option>
                    ))}
                  </select>
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
              placeholder="Buscar por ejercicio o patrón"
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
                  <TableHead>Patrón</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell>{x.id}</TableCell>
                    <TableCell>{x.exercise_name}</TableCell>
                    <TableCell>{x.pattern_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditing(x);
                            form.reset({
                              id: x.id,
                              exercise_id: x.exercise_id,
                              pattern_id: x.pattern_id,
                            });
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setToDelete(x)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
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
        <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
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
