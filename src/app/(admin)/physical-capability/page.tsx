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
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2, Download } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2, "Min 2 chars"),
});

type Capability = z.infer<typeof schema>;

export default function PhysicalCapabilityAdmin() {
  const [items, setItems] = useState<Capability[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Capability | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Capability | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((x) => !q || x.name.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from("physical_capability").select("id, name").order("id", { ascending: true });
      if (!error && data) setItems(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const form = useForm<Capability>({
    resolver: zodResolver(schema),
    defaultValues: editing ?? { name: "" },
  });

  const submit = async (values: Capability) => {
    if (editing?.id) {
      const { error } = await supabase.from("physical_capability").update({ name: values.name }).eq("id", editing.id);
      if (!error) setItems((prev) => prev.map((p) => (p.id === editing.id ? { ...p, name: values.name } : p)));
    } else {
      const { data, error } = await supabase.from("physical_capability").insert({ name: values.name }).select().single();
      if (!error && data) setItems((prev) => [data, ...prev]);
    }
    setOpen(false);
  };

  const onDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("physical_capability").delete().eq("id", toDelete.id);
    if (!error) setItems((prev) => prev.filter((p) => p.id !== toDelete.id));
    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Physical Capability</h1>
            <p className="text-muted-foreground">Catálogo físico base conectado a Supabase.</p>
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
                <DialogDescription>Registro directo en Supabase</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...form.register("name")} />
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell>{x.id}</TableCell>
                    <TableCell>{x.name}</TableCell>
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
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
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
