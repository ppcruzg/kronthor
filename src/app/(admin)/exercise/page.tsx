"use client";

import Link from "next/link";
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

type SelectOption = { id: number; name: string };

interface ExerciseRecord {
  id: string;
  name_es: string;
  name_en: string;
  description?: string | null;
  plane_id: number | null;
  laterality_id: number | null;
  difficulty_id: number | null;
  training_method_id: number | null;
  type_id: number | null;
  is_active: boolean;
  plane?: SelectOption | null;
  laterality?: SelectOption | null;
  difficulty_level?: SelectOption | null;
  training_method?: SelectOption | null;
  exercise_type?: SelectOption | null;
  equipment: SelectOption[];
  patterns: SelectOption[];
  muscles: SelectOption[];
}

type MuscleRelationInfo = {
  primary: string[];
  secondary: string[];
  subgroups: string[];
  groups: string[];
};

const normalizeRelation = <T,>(relation: T | T[] | null | undefined): T | undefined => {
  if (!relation) return undefined;
  return Array.isArray(relation) ? relation[0] : relation;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  id: z.string().uuid().optional(),
  name_es: z.string().min(2, "Requerido"),
  name_en: z.string().min(2, "Requerido"),
  description: z.string().optional(),
  is_active: z.boolean(),
  plane_id: z.number().int(),
  laterality_id: z.number().int(),
  difficulty_id: z.number().int(),
  training_method_id: z.number().int(),
  type_id: z.number().int(),
  equipment_ids: z.array(z.number().int()),
  pattern_ids: z.array(z.number().int()),
  muscle_ids: z.array(z.number().int()),
});

type FormValues = z.infer<typeof schema>;

const PAGE_SIZE = 10;

export default function ExercisePage() {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [planes, setPlanes] = useState<SelectOption[]>([]);
  const [lateralities, setLateralities] = useState<SelectOption[]>([]);
  const [difficulties, setDifficulties] = useState<SelectOption[]>([]);
  const [methods, setMethods] = useState<SelectOption[]>([]);
  const [exerciseTypes, setExerciseTypes] = useState<SelectOption[]>([]);
  const [equipment, setEquipment] = useState<SelectOption[]>([]);
  const [patterns, setPatterns] = useState<SelectOption[]>([]);
  const [muscles, setMuscles] = useState<SelectOption[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ExerciseRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ExerciseRecord | null>(null);
  const [page, setPage] = useState(1);
  const [muscleRelations, setMuscleRelations] = useState<
    Record<string, MuscleRelationInfo>
  >({});
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_es: "",
      name_en: "",
      description: "",
      is_active: true,
      plane_id: 0,
      laterality_id: 0,
      difficulty_id: 0,
      training_method_id: 0,
      type_id: 0,
      equipment_ids: [],
      pattern_ids: [],
      muscle_ids: [],
    },
  });

  const buildExerciseRecord = (item: any): ExerciseRecord => ({
    id: item.id,
    name_es: item.name_es,
    name_en: item.name_en,
    description: item.description,
    plane_id: item.plane_id,
    laterality_id: item.laterality_id,
    difficulty_id: item.difficulty_id,
    training_method_id: item.training_method_id,
    type_id: item.type_id,
    is_active: item.is_active ?? true,
    plane: item.plane,
    laterality: item.laterality,
    difficulty_level: item.difficulty_level,
    training_method: item.training_method,
    exercise_type: item.exercise_type,
    equipment:
      item.exercise_equipment?.map((row: any) => row.equipment).filter(Boolean) ??
      [],
    patterns:
      item.exercise_movement_pattern
        ?.map((row: any) => row.movement_pattern)
        .filter(Boolean) ?? [],
    muscles:
      item.exercise_muscle?.map((row: any) => row.muscle_group).filter(Boolean) ??
      [],
  });

  const loadExercises = useCallback(async () => {
    const { data } = await supabase
      .from("exercise")
      .select(
        `
          id,
          name_es,
          name_en,
          description,
          plane_id,
          laterality_id,
          difficulty_id,
          training_method_id,
          type_id,
          is_active,
          plane:plane_id ( id, name ),
          laterality:laterality_id ( id, name ),
          difficulty_level:difficulty_id ( id, name ),
          training_method:training_method_id ( id, name ),
          exercise_type:type_id ( id, name ),
          exercise_equipment (
            equipment:equipment_id ( id, name )
          ),
          exercise_movement_pattern (
            movement_pattern:pattern_id ( id, name )
          ),
          exercise_muscle (
            muscle_group:muscle_id ( id, name )
          )
        `
      )
      .order("name_es", { ascending: true });

    setRecords((data || []).map(buildExerciseRecord));
  }, []);

  const loadExerciseMuscles = useCallback(async () => {
    const { data, error } = await supabase
      .from("exercise_muscle")
      .select(
        `
        id,
        role,
        exercise_id,
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
      return;
    }

    const map: Record<string, MuscleRelationInfo> = {};

    (data || []).forEach((item) => {
      if (!item.exercise_id) return;
      const entry =
        map[item.exercise_id] ||
        (map[item.exercise_id] = {
          primary: [],
          secondary: [],
          subgroups: [],
          groups: [],
        });

      const muscle = normalizeRelation(item.muscle);
      const subgroup = normalizeRelation(muscle?.subgroup);
      const group = normalizeRelation(subgroup?.group);

      const muscleName = muscle?.name;
      if (muscleName) {
        if ((item.role as string) === "secondary") {
          if (!entry.secondary.includes(muscleName)) {
            entry.secondary.push(muscleName);
          }
        } else {
          if (!entry.primary.includes(muscleName)) {
            entry.primary.push(muscleName);
          }
        }
      }

      const subgroupName = subgroup?.name;
      if (subgroupName && !entry.subgroups.includes(subgroupName)) {
        entry.subgroups.push(subgroupName);
      }

      const groupName = group?.name;
      if (groupName && !entry.groups.includes(groupName)) {
        entry.groups.push(groupName);
      }
    });

    setMuscleRelations(map);
  }, []);

  const loadCatalogs = useCallback(async () => {
    const [
      { data: planeData },
      { data: lateralityData },
      { data: difficultyData },
      { data: methodData },
      { data: typeData },
      { data: equipmentData },
      { data: patternData },
      { data: muscleData },
    ] = await Promise.all([
      supabase.from("plane").select("id, name").order("name"),
      supabase.from("laterality").select("id, name").order("name"),
      supabase.from("difficulty_level").select("id, name").order("name"),
      supabase.from("training_method").select("id, name").order("name"),
      supabase.from("exercise_type").select("id, name").order("id"),
      supabase.from("equipment").select("id, name").order("name"),
      supabase.from("movement_pattern").select("id, name").order("name"),
      supabase.from("muscle_group").select("id, name").order("name"),
    ]);

    setPlanes(planeData || []);
    setLateralities(lateralityData || []);
    setDifficulties(difficultyData || []);
    setMethods(methodData || []);
    setExerciseTypes(typeData || []);
    setEquipment(equipmentData || []);
    setPatterns(patternData || []);
    setMuscles(muscleData || []);
  }, []);

  useEffect(() => {
    loadCatalogs();
    loadExercises();
    loadExerciseMuscles();
  }, [loadCatalogs, loadExercises, loadExerciseMuscles]);

  useEffect(() => {
    if (!records.length) {
      setSelectedExerciseId(null);
      return;
    }

    if (!selectedExerciseId || !records.some((item) => item.id === selectedExerciseId)) {
      setSelectedExerciseId(records[0].id);
    }
  }, [records, selectedExerciseId]);

  useEffect(() => {
    if (editing) {
      form.reset({
        id: editing.id,
        name_es: editing.name_es,
        name_en: editing.name_en,
        description: editing.description ?? "",
        is_active: editing.is_active,
        plane_id: editing.plane_id || planes[0]?.id || 0,
        laterality_id: editing.laterality_id || lateralities[0]?.id || 0,
        difficulty_id: editing.difficulty_id || difficulties[0]?.id || 0,
        training_method_id:
          editing.training_method_id || methods[0]?.id || 0,
        type_id: editing.type_id || exerciseTypes[0]?.id || 0,
        equipment_ids: editing.equipment.map((eq) => eq.id),
        pattern_ids: editing.patterns.map((pt) => pt.id),
        muscle_ids: editing.muscles.map((ms) => ms.id),
      });
    } else {
      form.reset({
        name_es: "",
        name_en: "",
        description: "",
        is_active: true,
        plane_id: planes[0]?.id || 0,
        laterality_id: lateralities[0]?.id || 0,
        difficulty_id: difficulties[0]?.id || 0,
        training_method_id: methods[0]?.id || 0,
        type_id: exerciseTypes[0]?.id || 0,
        equipment_ids: [],
        pattern_ids: [],
        muscle_ids: [],
      });
    }
  }, [
    editing,
    form,
    planes,
    lateralities,
    difficulties,
    methods,
    exerciseTypes,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter(
      (item) =>
        !q ||
        item.name_es.toLowerCase().includes(q) ||
        item.name_en.toLowerCase().includes(q)
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
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const syncRelation = async (
    exerciseId: string,
    table: string,
    column: string,
    values: number[]
  ) => {
    await supabase.from(table).delete().eq("exercise_id", exerciseId);
    if (values.length === 0) return;
    await supabase
      .from(table)
      .insert(values.map((value) => ({ exercise_id: exerciseId, [column]: value })));
  };

  const submit = async (values: FormValues) => {
    if (editing?.id) {
      const { data, error } = await supabase
        .from("exercise")
        .update({
          name_es: values.name_es,
          name_en: values.name_en,
          description: values.description,
          plane_id: values.plane_id,
          laterality_id: values.laterality_id,
          difficulty_id: values.difficulty_id,
          training_method_id: values.training_method_id,
          type_id: values.type_id,
          is_active: values.is_active,
        })
        .eq("id", editing.id)
        .select()
        .single();

      if (!error && data) {
        await Promise.all([
          syncRelation(data.id, "exercise_equipment", "equipment_id", values.equipment_ids),
          syncRelation(
            data.id,
            "exercise_movement_pattern",
            "pattern_id",
            values.pattern_ids
          ),
          syncRelation(data.id, "exercise_muscle", "muscle_id", values.muscle_ids),
        ]);
        await loadExercises();
      }
    } else {
      const { data, error } = await supabase
        .from("exercise")
        .insert({
          name_es: values.name_es,
          name_en: values.name_en,
          description: values.description,
          plane_id: values.plane_id,
          laterality_id: values.laterality_id,
          difficulty_id: values.difficulty_id,
          training_method_id: values.training_method_id,
          type_id: values.type_id,
          is_active: values.is_active,
        })
        .select()
        .single();

      if (!error && data) {
        await Promise.all([
          syncRelation(data.id, "exercise_equipment", "equipment_id", values.equipment_ids),
          syncRelation(
            data.id,
            "exercise_movement_pattern",
            "pattern_id",
            values.pattern_ids
          ),
          syncRelation(data.id, "exercise_muscle", "muscle_id", values.muscle_ids),
        ]);
        await loadExercises();
      }
    }

    setOpen(false);
    setEditing(null);
  };

  const onDelete = async () => {
    if (!toDelete) return;

    const exerciseId = toDelete.id;

    await Promise.all([
      supabase.from("exercise_equipment").delete().eq("exercise_id", exerciseId),
      supabase
        .from("exercise_movement_pattern")
        .delete()
        .eq("exercise_id", exerciseId),
      supabase.from("exercise_muscle").delete().eq("exercise_id", exerciseId),
    ]);

    await supabase.from("exercise").delete().eq("id", exerciseId);

    setRecords((prev) => prev.filter((item) => item.id !== exerciseId));
    setToDelete(null);
  };

  const handleMultiSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    field: "equipment_ids" | "pattern_ids" | "muscle_ids"
  ) => {
    const values = Array.from(event.target.selectedOptions).map((option) =>
      Number(option.value)
    );
    form.setValue(field, values, { shouldDirty: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Ejercicios</h1>
            <p className="text-muted-foreground">
              Administra el catálogo maestro de ejercicios y sus relaciones.
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
            <DialogContent className="w-full max-w-none sm:max-w-[95vw] xl:max-w-7xl max-h-[95vh] overflow-y-auto px-8 py-8 sm:px-12 sm:py-10">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar ejercicio" : "Nuevo ejercicio"}
                </DialogTitle>
                <DialogDescription>
                  Completa la información y relaciones del ejercicio.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-14" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-12">
                  <div className="space-y-8">
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="name_es">Nombre (ES)</Label>
                        <Input id="name_es" {...form.register("name_es")} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name_en">Nombre (EN)</Label>
                        <Input id="name_en" {...form.register("name_en")} />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Descripcion</Label>
                      <Input id="description" {...form.register("description")} />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        id="is_active"
                        type="checkbox"
                        className="h-4 w-4"
                        {...form.register("is_active")}
                      />
                      <Label htmlFor="is_active" className="text-sm">
                        Activo
                      </Label>
                    </div>

                    <div className="grid gap-2 w-full md:w-2/5">
                      <Label htmlFor="type_id" className="font-semibold">Tipo de ejercicio</Label>
                      <select
                        id="type_id"
                        {...form.register("type_id", { valueAsNumber: true })}
                        className="border px-3 py-2 rounded text-sm"
                      >
                        <option value={0}>-- Seleccionar --</option>
                        {exerciseTypes.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="grid gap-2">
                        <Label htmlFor="plane_id">Plano</Label>
                        <select
                          id="plane_id"
                          {...form.register("plane_id", { valueAsNumber: true })}
                          className="border px-3 py-2 rounded text-sm"
                        >
                          {planes.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="laterality_id">Lateralidad</Label>
                        <select
                          id="laterality_id"
                          {...form.register("laterality_id", { valueAsNumber: true })}
                          className="border px-3 py-2 rounded text-sm"
                        >
                          {lateralities.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="difficulty_id">Dificultad</Label>
                        <select
                          id="difficulty_id"
                          {...form.register("difficulty_id", { valueAsNumber: true })}
                          className="border px-3 py-2 rounded text-sm"
                        >
                          {difficulties.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="training_method_id">Metodo</Label>
                        <select
                          id="training_method_id"
                          {...form.register("training_method_id", { valueAsNumber: true })}
                          className="border px-3 py-2 rounded text-sm"
                        >
                          {methods.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="grid gap-8 md:grid-cols-[1.2fr_1.2fr_1fr]">
                      <div className="grid gap-2">
                        <Label htmlFor="equipment_ids">Equipo</Label>
                        <select
                          id="equipment_ids"
                          multiple
                          value={form.watch("equipment_ids").map(String)}
                          onChange={(event) => handleMultiSelectChange(event, "equipment_ids")}
                          className="border px-3 py-2 rounded text-sm min-h-[280px] md:min-w-[16rem]"
                        >
                          {equipment.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="pattern_ids">Patrones</Label>
                        <select
                          id="pattern_ids"
                          multiple
                          value={form.watch("pattern_ids").map(String)}
                          onChange={(event) => handleMultiSelectChange(event, "pattern_ids")}
                          className="border px-3 py-2 rounded text-sm min-h-[280px] md:min-w-[16rem]"
                        >
                          {patterns.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="muscle_ids">Musculos</Label>
                        <select
                          id="muscle_ids"
                          multiple
                          value={form.watch("muscle_ids").map(String)}
                          onChange={(event) => handleMultiSelectChange(event, "muscle_ids")}
                          className="border px-3 py-2 rounded text-sm min-h-[280px] md:min-w-[18rem]"
                        >
                          {muscles.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-2">
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
              placeholder="Buscar por nombre"
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Lateralidad</TableHead>
                  <TableHead>Dificultad</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Patrones</TableHead>
                  <TableHead>Músculos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name_es}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.name_en}
                      </div>
                    </TableCell>
                    <TableCell>{item.plane?.name || "-"}</TableCell>
                    <TableCell>{item.laterality?.name || "-"}</TableCell>
                    <TableCell>{item.difficulty_level?.name || "-"}</TableCell>
                    <TableCell>{item.training_method?.name || "-"}</TableCell>
                    <TableCell>{item.exercise_type?.name || "-"}</TableCell>
                    <TableCell>
                      {item.equipment.map((eq) => eq.name).join(", ") || "-"}
                    </TableCell>
                    <TableCell>
                      {item.patterns.map((pt) => pt.name).join(", ") || "-"}
                    </TableCell>
                    <TableCell>
                      {item.muscles.map((ms) => ms.name).join(", ") || "-"}
                    </TableCell>
                    <TableCell>
                      {item.is_active ? "Activo" : "Inactivo"}
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
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
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

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Músculos relacionados</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Consulta los músculos asociados al ejercicio seleccionado y accede a
                  los catálogos correspondientes.
                </p>
              </div>
              {records.length > 0 && (
                <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center">
                  <Label htmlFor="muscle-section-exercise">Ejercicio</Label>
                  <select
                    id="muscle-section-exercise"
                    value={selectedExerciseId ?? ""}
                    onChange={(event) => setSelectedExerciseId(event.target.value)}
                    className="border px-3 py-2 rounded text-sm"
                  >
                    {records.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name_es}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay ejercicios registrados actualmente.
              </p>
            ) : (
              <>
                {(() => {
                  const info = selectedExerciseId
                    ? muscleRelations[selectedExerciseId]
                    : undefined;
                  const renderList = (items?: string[]) =>
                    items && items.length > 0 ? (
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        {items.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin registros.</p>
                    );

                  return (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-semibold">Músculos primarios</h4>
                          {renderList(info?.primary)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">Músculos secundarios</h4>
                          {renderList(info?.secondary)}
                        </div>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-semibold">Subgrupos musculares</h4>
                          {renderList(info?.subgroups)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">Grupos musculares</h4>
                          {renderList(info?.groups)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                <div className="flex flex-wrap gap-3 pt-6">
                  <Button variant="outline" asChild>
                    <Link href="/admin/exercise-muscle">Administrar músculos</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/exercise-muscle-subgroup">
                      Administrar subgrupos
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={!!toDelete} onOpenChange={(next) => !next && setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar "{toDelete?.name_es}"?
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

