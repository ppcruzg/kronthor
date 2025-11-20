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
  name: string;
}

interface MuscleOption {
  id: number;
  name: string;
  group_id: number;
  group_name: string;
}

interface ExerciseMuscleRecord {
  id: number;
  exercise_id: string;
  muscle_id: number;
  role: "primary" | "secondary";
  exercise_name: string;
  muscle_name: string;
  group_name: string;
}

interface MuscleGroup {
  id: number;
  name: string;
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
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [selectedPrimaryMuscles, setSelectedPrimaryMuscles] = useState<number[]>([]);
  const [selectedSecondaryMuscles, setSelectedSecondaryMuscles] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [primaryMuscleQuery, setPrimaryMuscleQuery] = useState("");
  const [secondaryMuscleQuery, setSecondaryMuscleQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    return records.filter(
      (item) =>
        !q ||
        item.exercise_name.toLowerCase().includes(q) ||
        item.muscle_name.toLowerCase().includes(q) ||
        item.group_name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q)
    );
  }, [records, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const filteredPrimaryMuscles = useMemo(() => {
    const q = primaryMuscleQuery.trim().toLowerCase();
    return muscles.filter(
      (muscle) =>
        !q || muscle.name.toLowerCase().includes(q) || muscle.group_name.toLowerCase().includes(q)
    );
  }, [muscles, primaryMuscleQuery]);

  const filteredSecondaryMuscles = useMemo(() => {
    const q = secondaryMuscleQuery.trim().toLowerCase();
    return muscles.filter(
      (muscle) =>
        !q || muscle.name.toLowerCase().includes(q) || muscle.group_name.toLowerCase().includes(q)
    );
  }, [muscles, secondaryMuscleQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rangeStart = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = filtered.length ? Math.min(page * PAGE_SIZE, filtered.length) : 0;

  const mapRecord = (item: any): ExerciseMuscleRecord => {
    const exercise = normalizeRelation(item.exercise);
    const muscle = normalizeRelation(item.muscle);
    const group = normalizeRelation(muscle?.group);

    return {
      id: item.id,
      role: (item.role as "primary" | "secondary") ?? "primary",
      exercise_id: exercise?.id ?? "",
      exercise_name: exercise?.name_es ?? exercise?.name ?? "",
      muscle_id: muscle?.id ?? 0,
      muscle_name: muscle?.name ?? "",
      group_name: group?.name ?? "",
    };
  };

  const loadRecords = useCallback(async () => {
    const { data, error } = await supabase
      .from("exercise_muscle")
      .select(`
    id,
    role,
    exercise:exercise_id ( id, name_es ),
    muscle:muscle_id (
        id,
        name,
        group:group_id (
            id,
            name
        )
    )
  `)
      .order("id", { ascending: true });

    if (error) {
      toast.error("No se pudieron cargar las relaciones");
      console.error("Load error:", error);
      return;
    }

    console.log("Records loaded:", data);
    setRecords((data || []).map(mapRecord));
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      const [{ data: exerciseList, error: exerciseError }, { data: muscleList, error: muscleError }] =
        await Promise.all([
          supabase.from("exercise").select("id, name_es").order("name_es"),
          supabase
            .from("muscle")
            .select(
              `
            id,
            name,
            group:group_id (
              id,
              name
            )
          `
            )
            .order("name"),
        ]);

      if (exerciseError) {
        console.error("Exercise Error:", exerciseError);
        toast.error("No se pudieron cargar ejercicios");
        return;
      }

      if (muscleError) {
        console.error("Muscle Error:", muscleError);
        toast.error("No se pudieron cargar músculos");
        return;
      }

      console.log("Exercises:", exerciseList);
      console.log("Muscles:", muscleList);

      setExercises((exerciseList || []).map(({ id, name_es }) => ({ id, name: name_es })));
      setMuscles(
        (muscleList || []).map((item) => {
          const group = normalizeRelation(item.group as MuscleGroup | MuscleGroup[] | null | undefined);
          return {
            id: item.id,
            name: item.name,
            group_id: group?.id ?? 0,
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
    let duplicateQuery = supabase
      .from("exercise_muscle")
      .select("id", { count: "exact", head: true })
      .eq("exercise_id", values.exercise_id)
      .eq("muscle_id", values.muscle_id)
      .eq("role", values.role);

    if (editing?.id) {
      duplicateQuery = duplicateQuery.neq("id", editing.id);
    }

    const { error, count } = await duplicateQuery;

    if (error) {
      toast.error("No se pudo validar el registro");
      return true;
    }

    return (count ?? 0) > 0;
  };

  const submit = async (values: FormValues) => {
    console.log("Submitting values:", values);
    setSubmitting(true);
    try {
      if (await checkDuplicate(values)) {
        toast.error("La combinación ya existe");
        return;
      }

      if (editing?.id) {
        const { data, error } = await supabase
          .from("exercise_muscle")
          .update({
            exercise_id: values.exercise_id,
            muscle_id: values.muscle_id,
            role: values.role,
          })
          .eq("id", editing.id)
          .select(`
    id,
    role,
    exercise:exercise_id ( id, name_es ),
    muscle:muscle_id (
        id,
        name,
        group:group_id (
            id,
            name
        )
    )
  `)
          .single();

        if (error || !data) {
          toast.error("Error al actualizar");
          console.error("Update error:", error);
          return;
        }

        toast.success("Relación actualizada");
        setRecords((prev) => prev.map((item) => (item.id === editing.id ? mapRecord(data) : item)));
      } else {
        const { data, error } = await supabase
          .from("exercise_muscle")
          .insert({
            exercise_id: values.exercise_id,
            muscle_id: values.muscle_id,
            role: values.role,
          })
          .select(`
    id,
    role,
    exercise:exercise_id ( id, name_es ),
    muscle:muscle_id (
        id,
        name,
        group:group_id (
            id,
            name
        )
    )
  `)
          .single();

        if (error || !data) {
          toast.error("Error al crear");
          console.error("Insert error:", error);
          return;
        }

        toast.success("Relación creada");
        setRecords((prev) => [mapRecord(data), ...prev]);
      }

      setOpen(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  };

  const onFormError = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Revisa los campos del formulario");
  };

  const onDelete = async () => {
    if (!toDelete) return;

    const { error } = await supabase.from("exercise_muscle").delete().eq("id", toDelete.id);

    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }

    toast.success("Relación eliminada");
    setRecords((prev) => prev.filter((item) => item.id !== toDelete.id));
    setToDelete(null);
  };

  const handlePrimaryToggle = (muscleId: number, checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setSelectedPrimaryMuscles(prev =>
      isChecked ? [...prev, muscleId] : prev.filter(id => id !== muscleId)
    );
    // Remove from secondary if it's there
    setSelectedSecondaryMuscles(prev => prev.filter(id => id !== muscleId));
  };

  const handleSecondaryToggle = (muscleId: number, checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setSelectedSecondaryMuscles(prev =>
      isChecked ? [...prev, muscleId] : prev.filter(id => id !== muscleId)
    );
    // Remove from primary if it's there
    setSelectedPrimaryMuscles(prev => prev.filter(id => id !== muscleId));
  };

  const submitMulti = async () => {
    if (!selectedExerciseId || (selectedPrimaryMuscles.length === 0 && selectedSecondaryMuscles.length === 0)) {
      toast.error("Selecciona ejercicio y al menos un músculo");
      return;
    }

    const relations = [
      ...selectedPrimaryMuscles.map(muscleId => ({
        exercise_id: selectedExerciseId,
        muscle_id: muscleId,
        role: "primary" as const
      })),
      ...selectedSecondaryMuscles.map(muscleId => ({
        exercise_id: selectedExerciseId,
        muscle_id: muscleId,
        role: "secondary" as const
      }))
    ];

    try {
      const { data, error } = await supabase
        .from("exercise_muscle")
        .insert(relations)
        .select(`
    id,
    role,
    exercise:exercise_id ( id, name_es ),
    muscle:muscle_id (
        id,
        name,
        group:group_id (
            id,
            name
        )
    )
  `);

      if (error) {
        toast.error("Error al crear relaciones");
        console.error("Insert error:", error);
        return;
      }

      toast.success(`${relations.length} relaciones creadas`);
      setRecords(prev => [...(data || []).map(mapRecord), ...prev]);
      setOpen(false);
      setSelectedExerciseId("");
      setSelectedPrimaryMuscles([]);
      setSelectedSecondaryMuscles([]);
    } catch (err) {
      toast.error("Error inesperado");
    }
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
            <DialogContent className="max-w-xl md:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar relación" : "Nueva relación"}
                </DialogTitle>
                <DialogDescription>
                  {editing ? "Modifica la relación." : "Selecciona ejercicio y músculos con sus roles."}
                </DialogDescription>
              </DialogHeader>

              {editing ? (
                <form className="space-y-6" onSubmit={form.handleSubmit(submit, onFormError)}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="exercise_id">Ejercicio</Label>
                      <select
                        id="exercise_id"
                        value={form.watch("exercise_id")}
                        onChange={(e) => form.setValue("exercise_id", e.target.value)}
                        className="border px-3 py-2 rounded text-sm"
                      >
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="muscle_id">Músculo</Label>
                      <select
                        id="muscle_id"
                        value={form.watch("muscle_id")?.toString()}
                        onChange={(e) => form.setValue("muscle_id", Number(e.target.value))}
                        className="border px-3 py-2 rounded text-sm"
                      >
                        {muscles.map((muscle) => (
                          <option key={muscle.id} value={muscle.id}>
                            {muscle.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="role">Rol</Label>
                      <select
                        id="role"
                        value={form.watch("role")}
                        onChange={(e) => form.setValue("role", e.target.value as "primary" | "secondary")}
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

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Ejercicio</Label>
                      <select
                        value={selectedExerciseId}
                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                        className="border px-3 py-2 rounded text-sm"
                      >
                        <option value="">Seleccionar ejercicio</option>
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Músculos Primarios</Label>
                        <Input
                          placeholder="Buscar músculo primario..."
                          value={primaryMuscleQuery}
                          onChange={(e) => setPrimaryMuscleQuery(e.target.value)}
                          className="mb-2"
                        />
                        <div className="max-h-64 overflow-y-auto border rounded p-2">
                          {filteredPrimaryMuscles.map((muscle) => (
                            <div key={muscle.id} className="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                id={`primary-${muscle.id}`}
                                checked={selectedPrimaryMuscles.includes(muscle.id)}
                                onChange={(e) =>
                                  handlePrimaryToggle(muscle.id, e.target.checked)
                                }
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor={`primary-${muscle.id}`}
                                className="text-sm cursor-pointer flex items-center gap-2"
                              >
                                {muscle.name}
                                <span className="text-gray-400">/</span>
                                <span className="text-blue-600 font-semibold">
                                  {`${muscle.group_name.charAt(0).toUpperCase()}${muscle.group_name.slice(1).toLowerCase()}`}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Músculos Secundarios</Label>
                        <Input
                          placeholder="Buscar músculo secundario..."
                          value={secondaryMuscleQuery}
                          onChange={(e) => setSecondaryMuscleQuery(e.target.value)}
                          className="mb-2"
                        />
                        <div className="max-h-64 overflow-y-auto border rounded p-2">
                          {filteredSecondaryMuscles.map((muscle) => (
                            <div key={muscle.id} className="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                id={`secondary-${muscle.id}`}
                                checked={selectedSecondaryMuscles.includes(muscle.id)}
                                onChange={(e) =>
                                  handleSecondaryToggle(muscle.id, e.target.checked)
                                }
                                className="w-4 h-4"
                              />
                              <label
                                htmlFor={`secondary-${muscle.id}`}
                                className="text-sm cursor-pointer flex items-center gap-2"
                              >
                                {muscle.name}
                                <span className="text-gray-400">/</span>
                                <span className="text-blue-600 font-semibold">
                                  {`${muscle.group_name.charAt(0).toUpperCase()}${muscle.group_name.slice(1).toLowerCase()}`}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={submitMulti} disabled={saving}>
                      {saving ? "Guardando..." : "Crear Relaciones"}
                    </Button>
                  </div>
                </div>
              )}
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
              placeholder="Buscar por ejercicio, musculo, grupo o rol"
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
                  <TableHead>Músculo</TableHead>
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
