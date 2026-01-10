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
  TableCaption,
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
  name: z.string().min(2, "Min 2 chars"),
  capability_id: z.number().int(),
});

type SubCapability = z.infer<typeof schema>;

type Capability = {
  id: number;
  name: string;
};

export default function PhysicalSubCapabilityPage() {
  const [items, setItems] = useState<SubCapability[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SubCapability | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SubCapability | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((x) => !q || x.name.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    const fetch = async () => {
      const { data: caps } = await supabase.from("physical_capability").select("id, name");
      const { data, error } = await supabase
        .from("physical_subcapability")
        .select("id, name, capability_id")
        .order("id", { ascending: true });
      if (!error && data) {
        setItems(data);
        setCapabilities(caps || []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const form = useForm<SubCapability>({
    resolver: zodResolver(schema),
    defaultValues: editing ?? { name: "", capability_id: 1 },
  });

  const submit = async (values: SubCapability) => {
    if (editing?.id) {
      const { error } = await supabase
        .from("physical_subcapability")
        .update({ name: values.name, capability_id: values.capability_id })
        .eq("id", editing.id);
      if (!error)
        setItems((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, name: values.name, capability_id: values.capability_id } : p))
        );
    } else {
      const { data, error } = await supabase
        .from("physical_subcapability")
        .insert({ name: values.name, capability_id: values.capability_id })
        .select()
        .single();
      if (!error && data) setItems((prev) => [data, ...prev]);
    }
    setOpen(false);
  };

  const onDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("physical_subcapability").delete().eq("id", toDelete.id);
    if (!error) setItems((prev) => prev.filter((p) => p.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Subcapacidades físicas</h1>
            <p className="text-muted-foreground">Catálogo relacionado con capacidades físicas.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                form.reset();
                setEditing(null);
                setOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar" : "Crear"}</DialogTitle>
                <DialogDescription>Asociar con una capacidad existente</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...form.register("name")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capability_id">Capacidad física</Label>
                  <select
                    id="capability_id"
                    {...form.register("capability_id", { valueAsNumber: true })}
                    className="border px-3 py-2 rounded text-sm"
                  >
                    {capabilities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nombre"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

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
                  <TableHead>Capacidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell>{x.id}</TableCell>
                    <TableCell>{x.name}</TableCell>
                    <TableCell>{capabilities.find((c) => c.id === x.capability_id)?.name ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" onClick={() => {
                          setEditing(x);
                          form.reset(x);
                          setOpen(true);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setToDelete(x)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Sin resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
