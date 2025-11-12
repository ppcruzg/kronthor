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

// ---------------- Types ----------------
// FormValues generated from Zod
export type FormValues = z.infer<typeof schema>;

interface TrainingMethod {
  id: number;
  name: string;
  description?: string | null;
  subcapability_id: number;
}

interface Subcapability {
  id: number;
  name: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------- Schema ----------------
const schema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2, "Min 2 chars"),
  description: z.string().optional(),
  subcapability_id: z.number().int(),
});

export default function TrainingMethodPage() {
  const [methods, setMethods] = useState<TrainingMethod[]>([]);
  const [subcaps, setSubcaps] = useState<Subcapability[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TrainingMethod | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TrainingMethod | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return methods.filter((x) => !q || x.name.toLowerCase().includes(q));
  }, [methods, query]);

  useEffect(() => {
    const fetch = async () => {
      const { data: subc } = await supabase
        .from("physical_subcapability")
        .select("id, name")
        .order("name", { ascending: true });

      const { data } = await supabase
        .from("training_method")
        .select("id, name, description, subcapability_id")
        .order("id", { ascending: true });

      setSubcaps(subc || []);
      setMethods(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: editing
      ? {
          id: editing.id,
          name: editing.name,
          description: editing.description ?? "",
          subcapability_id: editing.subcapability_id,
        }
      : {
          name: "",
          description: "",
          subcapability_id: 1,
        },
  });

  const submit = async (values: FormValues) => {
    if (editing?.id) {
      const { error } = await supabase
        .from("training_method")
        .update({
          name: values.name,
          description: values.description,
          subcapability_id: values.subcapability_id,
        })
        .eq("id", editing.id);

      if (!error)
        setMethods((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...values } : p))
        );
    } else {
      const { data, error } = await supabase
        .from("training_method")
        .insert({
          name: values.name,
          description: values.description,
          subcapability_id: values.subcapability_id,
        })
        .select()
        .single();

      if (!error && data) setMethods((prev) => [data, ...prev]);
    }
    setOpen(false);
  };

  const onDelete = async () => {
    if (!toDelete) return;

    const { error } = await supabase
      .from("training_method")
      .delete()
      .eq("id", toDelete.id);

    if (!error)
      setMethods((prev) => prev.filter((p) => p.id !== toDelete.id));

    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Métodos de entrenamiento</h1>
            <p className="text-muted-foreground">
              Catálogo asociado a subcapacidades físicas.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  form.reset();
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar método" : "Crear método"}
                </DialogTitle>
                <DialogDescription>
                  Selecciona la subcapacidad asociada.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...form.register("name")} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input id="description" {...form.register("description")} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subcapability_id">Subcapacidad</Label>
                  <select
                    id="subcapability_id"
                    {...form.register("subcapability_id", { valueAsNumber: true })}
                    className="border px-3 py-2 rounded text-sm"
                  >
                    {subcaps.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Subcapacidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>              <TableBody>
                {filtered.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell>{x.id}</TableCell>
                    <TableCell>{x.name}</TableCell>
                    <TableCell>{x.description || "-"}</TableCell>
                    <TableCell>
                      {subcaps.find((s) => s.id === x.subcapability_id)?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditing(x);
                            form.reset({ ...x, description: x.description ?? "" });
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Sin resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
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
