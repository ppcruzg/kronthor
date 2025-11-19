"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Dumbbell, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
interface Exercise {
  id: number;
  name_es: string;
  name_en: string | null;
  description: string | null;
  urlvideo: string | null;

  // Joins de uno a uno
  laterality: { name: string } | null;
  difficulty: { name: string } | null;
  plane: { name: string } | null;
  exercise_type: { name: string } | null;
  training_method: { name: string } | null;

  // Relaciones muchos a muchos
  exercise_muscle: {
    role: "primary" | "secondary" | "tertiary";
    muscle: {
      name: string;
    };
  }[];
  exercise_equipment: {
    equipment: {
      name: string;
    };
  }[];
  exercise_movement_pattern: {
    movement_pattern: {
      name: string;
    };
  }[];
}

const PAGE_SIZE = 15;

export default function ExercisesCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("exercise")
        .select(`
          id,
          name_es,
          name_en,
          description,
          urlvideo,
          laterality_id,
          difficulty_id,
          plane_id,
          type_id,
          training_method_id,
          laterality:laterality_id (name),
          difficulty:difficulty_level (name),
          plane:plane_id (name),
          exercise_type:type_id (name),
          training_method:training_method_id (name),
          exercise_muscle!exercise_muscle_exercise_id_fkey (
            role,
            muscle!inner (name)
          ),
          exercise_equipment (
            equipment!inner (name)
          ),
          exercise_movement_pattern!exercise_movement_pattern_exercise_id_fkey (
            movement_pattern!inner (name)
          )
        `)
        .order("name_es", { ascending: true });

      if (error) {
        console.error("Error fetching exercises:", error);
        setLoading(false);
        return;
      }

      const formatted: Exercise[] = data.map((ex: any) => ({
        id: ex.id,
        name_es: ex.name_es,
        name_en: ex.name_en ?? ex.name_es,
        description: ex.description,
        urlvideo: ex.urlvideo ?? null,
        laterality: ex.laterality,
        difficulty: ex.difficulty,
        plane: ex.plane,
        exercise_type: ex.exercise_type,
        training_method: ex.training_method,
        exercise_muscle: ex.exercise_muscle || [],
        exercise_equipment: ex.exercise_equipment || [],
        exercise_movement_pattern: ex.exercise_movement_pattern || [],
      }));

      setExercises(formatted);
      setLoading(false);
    };

    fetchExercises();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name_es.toLowerCase().includes(q) ||
        (ex.name_en && ex.name_en.toLowerCase().includes(q)) ||
        ex.exercise_muscle.some((em) =>
          em.muscle.name.toLowerCase().includes(q)
        );
      return matchesSearch;
    });
  }, [exercises, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Dumbbell className="h-8 w-8" />
              Catálogo de Ejercicios
            </h1>
            <p className="text-muted-foreground">
              Explora y gestiona todos los ejercicios de la base de datos
            </p>
          </div>

          <CreateExerciseDialog />
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda y filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nombre o músculo principal..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filtered.length} ejercicio{filtered.length !== 1 && "s"} encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Seleccionar</TableHead>
                      <TableHead className="font-bold">Nombre</TableHead>
                      <TableHead className="font-bold">Vídeo</TableHead>
                      <TableHead className="hidden sm:table-cell font-bold">Plano</TableHead>
                      <TableHead className="hidden sm:table-cell font-bold">Lateralidad</TableHead>
                      <TableHead className="hidden sm:table-cell font-bold">Tipo</TableHead>
                      <TableHead className="hidden sm:table-cell font-bold">Dificultad</TableHead>
                      <TableHead className="hidden md:table-cell font-bold">Método de Entrenamiento</TableHead>
                      <TableHead className="hidden lg:table-cell font-bold">Equipamiento</TableHead>
                      <TableHead className="hidden lg:table-cell font-bold">Músculos Primarios</TableHead>
                      <TableHead className="hidden lg:table-cell font-bold">Músculos Secundarios</TableHead>
                      <TableHead className="hidden lg:table-cell font-bold">Patrón de Movimiento</TableHead>
                      <TableHead className="text-right font-bold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((ex) => {
                      const primaryMuscles = ex.exercise_muscle
                        .filter((em) => em.role === "primary")
                        .map((em) => em.muscle.name);

                      const secondaryMuscles = ex.exercise_muscle
                        .filter((em) => em.role === "secondary")
                        .map((em) => em.muscle.name);

                      const allMuscles = primaryMuscles.concat(secondaryMuscles);

                      return (
                        <TableRow key={ex.id}>
                          <TableCell>
                            <input type="checkbox" className="w-5 h-5" />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <div className="text-base">{ex.name_es}</div>
                              {ex.name_en && ex.name_en !== ex.name_es && (
                                <div className="text-xs text-muted-foreground">{ex.name_en}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {ex.urlvideo ? (
                              <a href={ex.urlvideo} target="_blank" rel="noopener noreferrer">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </a>
                            ) : <XCircle className="h-5 w-5 text-red-600" />}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell bg-muted/10">
                            {ex.plane?.name || "—"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell bg-muted/10">
                            {ex.laterality?.name || "—"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell bg-muted/10">
                            {ex.exercise_type?.name || "—"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell bg-muted/10">
                            <Badge
                              variant={
                                ex.difficulty?.name === "Avanzado"
                                  ? "destructive"
                                  : ex.difficulty?.name === "Intermedio"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {ex.difficulty?.name || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell bg-muted/10">
                            {ex.training_method?.name || "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {ex.exercise_equipment.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {ex.exercise_equipment.slice(0, 2).map((eq) => (
                                  <Badge key={eq.equipment.name} variant="outline" className="text-xs">
                                    {eq.equipment.name}
                                  </Badge>
                                ))}
                                {ex.exercise_equipment.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{ex.exercise_equipment.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Peso corporal</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {primaryMuscles.length > 0 ? (
                                primaryMuscles.slice(0, 3).map((m) => (
                                  <Badge key={m} variant="secondary" className="text-xs">
                                    {m}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {secondaryMuscles.length > 0 ? (
                                secondaryMuscles.slice(0, 3).map((m) => (
                                  <Badge key={m} variant="outline" className="text-xs">
                                    {m}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {ex.exercise_movement_pattern.length > 0 ? (
                                ex.exercise_movement_pattern.map((mp) => (
                                  <Badge key={mp.movement_pattern.name} variant="default" className="text-xs">
                                    {mp.movement_pattern.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm">
                              <Link href={`/ejercicios/${ex.id}`}>Ver detalle →</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Paginación */}
                <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
                  <p>
                    Mostrando {(page - 1) * PAGE_SIZE + 1}-
                    {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="px-3 py-1">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateExerciseDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name_es: "",
    name_en: "",
    urlvideo: "",
    plane_id: "",
    laterality_id: "",
    type_id: "",
    difficulty_id: "",
    training_method_id: "",
    equipment_id: "",
  });
  const [planes, setPlanes] = useState<any[]>([]);
  const [lateralities, setLateralities] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  const [training_methods, setTrainingMethods] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const [planesData, lateralitiesData, typesData, difficultiesData, trainingMethodsData, equipmentsData] = await Promise.all([
        supabase.from("plane").select("id, name"),
        supabase.from("laterality").select("id, name"),
        supabase.from("exercise_type").select("id, name"),
        supabase.from("difficulty_level").select("id, name"),
        supabase.from("training_method").select("id, name"),
        supabase.from("equipment").select("id, name"),
      ]);

      setPlanes(planesData.data || []);
      setLateralities(lateralitiesData.data || []);
      setTypes(typesData.data || []);
      setDifficulties(difficultiesData.data || []);
      setTrainingMethods(trainingMethodsData.data || []);
      setEquipments(equipmentsData.data || []);
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { name_es, name_en, urlvideo, plane_id, laterality_id, type_id, difficulty_id, training_method_id, equipment_id } = formData;
    const response = await supabase.from("exercise").insert({
      name_es,
      name_en: name_en || null,
      urlvideo: urlvideo || undefined,
      plane_id: plane_id ? parseInt(plane_id) : undefined,
      laterality_id: laterality_id ? parseInt(laterality_id) : undefined,
      type_id: type_id ? parseInt(type_id) : undefined,
      difficulty_id: difficulty_id ? parseInt(difficulty_id) : undefined,
      training_method_id: training_method_id ? parseInt(training_method_id) : undefined,
    });
    const { data, error } = response as { data: any[] | null; error: any };

    if (error) {
      console.error("Error creating exercise:", error);
      setLoading(false);
      return;
    }

    if (data && (data as any)[0] && equipment_id) {
      const exerciseId = (data as any)[0].id;
      await supabase.from("exercise_equipment").insert({
        exercise_id: exerciseId,
        equipment_id: parseInt(equipment_id),
      });
    }

    setOpen(false);
    setFormData({
      name_es: "",
      name_en: "",
      urlvideo: "",
      plane_id: "",
      laterality_id: "",
      type_id: "",
      difficulty_id: "",
      training_method_id: "",
      equipment_id: "",
    });
    window.location.reload(); // Simple refresh
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo ejercicio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>Crear nuevo ejercicio</DialogTitle>
          <DialogDescription>
            Completa los campos para crear un nuevo ejercicio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name_es">Nombre Español</Label>
            <Input
              id="name_es"
              value={formData.name_es}
              onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="name_en">Nombre Inglés</Label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="url">URL Vídeo</Label>
            <Input
              id="url"
              value={formData.urlvideo}
              onChange={(e) => setFormData({ ...formData, urlvideo: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="plane">Plano</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, plane_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plano" />
              </SelectTrigger>
              <SelectContent>
                {planes.map((plane) => (
                  <SelectItem key={plane.id} value={plane.id.toString()}>
                    {plane.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="laterality">Lateralidad</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, laterality_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar lateralidad" />
              </SelectTrigger>
              <SelectContent>
                {lateralities.map((lat) => (
                  <SelectItem key={lat.id} value={lat.id.toString()}>
                    {lat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, type_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="difficulty">Dificultad</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, difficulty_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar dificultad" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff.id} value={diff.id.toString()}>
                    {diff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="training_method">Método de Entrenamiento</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, training_method_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                {training_methods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="equipment">Equipamiento</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar equipamiento" />
              </SelectTrigger>
              <SelectContent>
                {equipments.map((equip) => (
                  <SelectItem key={equip.id} value={equip.id.toString()}>
                    {equip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Crear ejercicio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
