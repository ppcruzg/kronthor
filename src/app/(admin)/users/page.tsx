"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { Plus, Pencil, Trash2, Search } from "lucide-react";

// =====================================================
// ✅ SCHEMA
// =====================================================

const roles = ["admin", "manager", "viewer"] as const;
const statuses = ["active", "suspended"] as const;

// ✅ El tipo User ACEPTA createdAt como opcional
type User = {
  id?: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  status: "active" | "suspended";
  createdAt?: string;
};

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(roles),
  status: z.enum(statuses),
});

// =====================================================
// ✅ MOCK DATA
// =====================================================

const initialData: User[] = [
  {
    id: "1",
    name: "Alice Mendoza",
    email: "alice@example.com",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    email: "carlos@example.com",
    role: "manager",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

// =====================================================
// ✅ PAGE COMPONENT
// =====================================================

export default function Page() {
  const [users, setUsers] = useState<User[]>(initialData);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) =>
      `${u.name} ${u.email}`.toLowerCase().includes(q)
    );
  }, [users, search]);

  function save(user: User) {
    setUsers((prev) => {
      const exists = prev.some((p) => p.id === user.id);
      if (exists) {
        return prev.map((p) => (p.id === user.id ? user : p));
      }
      return [
        ...prev,
        {
          ...user,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ];
    });
    setOpenForm(false);
  }

  function remove(user: User) {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setConfirmDelete(null);
  }

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold mb-4">User Administration</h1>

      <Card className="mb-4">
        <CardContent className="flex gap-3 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpenForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> New User
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle>
              </DialogHeader>

              <UserForm
                initial={editing ?? undefined}
                onCancel={() => setOpenForm(false)}
                onSubmit={(u) =>
                  save({
                    ...u,
                    id: editing?.id ?? crypto.randomUUID(),
                    createdAt: editing?.createdAt ?? new Date().toISOString(),
                  })
                }
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge className="capitalize">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={u.status === "active"}
                      onCheckedChange={(v) =>
                        setUsers((prev) =>
                          prev.map((x) =>
                            x.id === u.id
                              ? {
                                  ...x,
                                  status: (v
                                    ? "active"
                                    : "suspended") as User["status"],
                                }
                              : x
                          )
                        )
                      }
                    />
                  </TableCell>

                  <TableCell className="text-right flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditing(u);
                        setOpenForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setConfirmDelete(u)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDelete && remove(confirmDelete)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =====================================================
// ✅ USER FORM
// =====================================================

function UserForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: User;
  onCancel: () => void;
  onSubmit: (u: User) => void;
}) {
  const form = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: initial ?? ({
      name: "",
      email: "",
      role: "viewer",
      status: "active",
    } as User),
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Label>Name</Label>
        <Input {...form.register("name")} />
      </div>

      <div>
        <Label>Email</Label>
        <Input type="email" {...form.register("email")} />
      </div>

      <div>
        <Label>Role</Label>
        <Select
          value={form.watch("role")}
          onValueChange={(v) => form.setValue("role", v as User["role"])}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Status</Label>
        <Select
          value={form.watch("status")}
          onValueChange={(v) => form.setValue("status", v as User["status"])}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
