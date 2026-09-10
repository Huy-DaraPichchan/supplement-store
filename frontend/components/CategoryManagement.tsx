"use client";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type AdminActionState,
} from "@/app/admin/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminCategory } from "@/lib/admin";
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

const initialState: AdminActionState = { status: "idle" };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function CategoryForm({ category, close }: { category?: AdminCategory; close: () => void }) {
  const action = category ? updateCategoryAction.bind(null, category.id) : createCategoryAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(category));

  useEffect(() => {
    if (state.status === "success") close();
  }, [state.status, close]);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor={`${category?.id || "new"}-category-name`}>Category name</Label>
        <Input
          id={`${category?.id || "new"}-category-name`}
          name="name"
          value={name}
          onChange={(event) => {
            const value = event.target.value;
            setName(value);
            if (!slugEdited) setSlug(slugify(value));
          }}
          required
          maxLength={120}
          className="h-11"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${category?.id || "new"}-category-slug`}>Slug</Label>
        <Input
          id={`${category?.id || "new"}-category-slug`}
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value.toLowerCase());
            setSlugEdited(true);
          }}
          required
          maxLength={140}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          className="h-11"
        />
      </div>
      <Label className="flex min-h-14 justify-between rounded-lg border border-border px-4 py-3">
        <span><span className="block">Active category</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Available to the storefront and product filters.</span></span>
        <Switch name="is_active" defaultChecked={category?.is_active ?? true} />
      </Label>
      {state.status === "error" && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>}
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Cancel</DialogClose>
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : category ? "Save changes" : "Add category"}</Button>
      </DialogFooter>
    </form>
  );
}

function CategoryDialog({ category }: { category?: AdminCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={category ? <Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} /> : <Button size="lg" className="h-11" />}>
        {category ? <Pencil /> : <><Plus /> Add category</>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg!">
        <DialogHeader>
          <DialogTitle className="text-xl">{category ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>Use a clear customer-facing name and URL-friendly slug.</DialogDescription>
        </DialogHeader>
        <CategoryForm category={category} close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({ category }: { category: AdminCategory }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function remove() {
    setMessage(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (result.status === "error") {
        setMessage(result.message || "Unable to delete the category.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} className="text-destructive" />}><Trash2 /></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {category.name}?</AlertDialogTitle>
          <AlertDialogDescription>Products assigned to this category will remain in the catalog as uncategorized.</AlertDialogDescription>
        </AlertDialogHeader>
        {message && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>{pending ? "Deleting…" : "Delete category"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function CategoryManagement({ categories }: { categories: AdminCategory[] }) {
  return (
    <section aria-labelledby="categories-heading" className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Catalog organization</p>
          <h2 id="categories-heading" className="mt-1 font-heading text-3xl font-semibold">Categories</h2>
          <p className="mt-2 text-sm text-muted-foreground">Organize products and control which categories appear in the storefront.</p>
        </div>
        <CategoryDialog />
      </div>
      {categories.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <Table>
            <TableHeader><TableRow className="bg-muted/50"><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Status</TableHead><TableHead className="w-24"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{category.slug}</TableCell>
                  <TableCell><Badge variant="outline" className={category.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}>{category.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell><div className="flex justify-end gap-1"><CategoryDialog category={category} /><DeleteCategoryDialog category={category} /></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border p-12 text-center"><Boxes className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 font-medium">No categories yet</p><p className="mt-1 text-sm text-muted-foreground">Add a category to organize the catalog.</p></div>
      )}
    </section>
  );
}
