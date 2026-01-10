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

interface MuscleGroup {
  id: number;
  name: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2, "Min 2 chars"),
});

const PAGE_SIZE = 10;

export default function MuscleGroupPage() {
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MuscleGroup | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<MuscleGroup | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((x) => !q || x.name.toLowerCase().includes(q));
  }, [groups, query]);

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
    const fetch = async () => {
      const { data } = await supabase
        .from("muscle_group")
        .select("id, name")
        .order("id", { ascending: true });

      setGroups(data || []);
    };

    fetch();
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
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (editing) {
      form.reset({ id: editing.id, name: editing.name });
    } else {
      form.reset({ name: "" });
    }
  }, [editing, form]);

  const submit = async (values: FormValues) => {
    if (editing?.id) {
      const { error } = await supabase
        .from("muscle_group")
        .update({ name: values.name })
        .eq("id", editing.id);

      if (!error) {
        setGroups((prev) =>
          prev.map((item) =>
            item.id === editing.id ? { ...item, name: values.name } : item
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from("muscle_group")
        .insert({ name: values.name })
        .select()
        .single();

      if (!error && data) setGroups((prev) => [data, ...prev]);
    }

    setOpen(false);
    setEditing(null);
  };

  const onDelete = async () => {
    if (!toDelete) return;

    const { error } = await supabase
      .from("muscle_group")
      .delete()
      .eq("id", toDelete.id);

    if (!error) {
      setGroups((prev) => prev.filter((item) => item.id !== toDelete.id));
    }

    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Grupos musculares</h1>
            <p className="text-muted-foreground">
              Catalogo para clasificar los musculos trabajados.
            </p>
          </div>
          <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar grupo" : "Nuevo grupo"}</DialogTitle>
                <DialogDescription>
                  Define el nombre del grupo muscular.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...form.register("name")} />
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
            <CardTitle>Busqueda</CardTitle>
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
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
        <AlertDialog open={!!toDelete} onOpenChange={(next) => !next && setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar</AlertDialogTitle>
              <AlertDialogDescription>
                Estas seguro de que deseas eliminar "{toDelete?.name}"?
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
