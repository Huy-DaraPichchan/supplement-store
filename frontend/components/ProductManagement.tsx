"use client";

import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { AdminCategory, AdminProduct } from "@/lib/admin";
import { ChevronLeft, ChevronRight, ImageIcon, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

const initialState: AdminActionState = { status: "idle" };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ProductForm({
  product,
  categories,
  close,
}: {
  product?: AdminProduct;
  categories: AdminCategory[];
  close: () => void;
}) {
  const action = product ? updateProductAction.bind(null, product.id) : createProductAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));

  useEffect(() => {
    if (state.status === "success") close();
  }, [state.status, close]);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor={`${product?.id || "new"}-product-name`}>Product name</Label>
          <Input
            id={`${product?.id || "new"}-product-name`}
            name="name"
            value={name}
            onChange={(event) => {
              const value = event.target.value;
              setName(value);
              if (!slugEdited) setSlug(slugify(value));
            }}
            required
            maxLength={180}
            className="h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${product?.id || "new"}-product-slug`}>Slug</Label>
          <Input
            id={`${product?.id || "new"}-product-slug`}
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value.toLowerCase());
              setSlugEdited(true);
            }}
            required
            maxLength={200}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${product?.id || "new"}-product-sku`}>SKU</Label>
          <Input
            id={`${product?.id || "new"}-product-sku`}
            name="sku"
            defaultValue={product?.sku}
            required
            maxLength={80}
            className="h-11 uppercase"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${product?.id || "new"}-product-category`}>Category</Label>
          <Select name="category_id" defaultValue={product?.category_id || "uncategorized"}>
            <SelectTrigger id={`${product?.id || "new"}-product-category`} className="h-11 w-full">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}{category.is_active ? "" : " (inactive)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor={`${product?.id || "new"}-product-price`}>Price (USD)</Label>
            <Input
              id={`${product?.id || "new"}-product-price`}
              name="price_usd"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={product ? (product.price_usd_cents / 100).toFixed(2) : ""}
              required
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${product?.id || "new"}-product-stock`}>Stock</Label>
            <Input
              id={`${product?.id || "new"}-product-stock`}
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.stock ?? 0}
              required
              className="h-11"
            />
          </div>
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor={`${product?.id || "new"}-product-description`}>Description</Label>
          <Textarea
            id={`${product?.id || "new"}-product-description`}
            name="description"
            defaultValue={product?.description}
            rows={4}
            className="min-h-24"
          />
        </div>
      </div>

      <Label className="flex min-h-14 justify-between rounded-lg border border-border px-4 py-3">
        <span>
          <span className="block">Active product</span>
          <span className="mt-1 block text-xs font-normal text-muted-foreground">Visible in the storefront when stock and filters allow.</span>
        </span>
        <Switch name="is_active" defaultChecked={product?.is_active ?? true} />
      </Label>

      {state.status === "error" && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      )}

      <DialogFooter className="mt-1">
        <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Cancel</DialogClose>
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : product ? "Save changes" : "Add product"}</Button>
      </DialogFooter>
    </form>
  );
}

function ProductDialog({ product, categories }: { product?: AdminProduct; categories: AdminCategory[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={product
          ? <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`} />
          : <Button size="lg" className="h-11" />}
      >
        {product ? <Pencil /> : <><Plus /> Add product</>}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl!">
        <DialogHeader>
          <DialogTitle className="text-xl">{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>Products are created without an image in this pass.</DialogDescription>
        </DialogHeader>
        <ProductForm product={product} categories={categories} close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteProductDialog({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setMessage(null);
    startTransition(async () => {
      const result = await deleteProductAction(product.id);
      if (result.status === "error") {
        setMessage(result.message || "Unable to delete the product.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon" aria-label={`Delete ${product.name}`} className="text-destructive" />}>
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
          <AlertDialogDescription>The product will be removed, but historical order item snapshots will remain.</AlertDialogDescription>
        </AlertDialogHeader>
        {message && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>{pending ? "Deleting…" : "Delete product"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function ProductManagement({
  products,
  categories,
  query,
  page,
  hasNext,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  query: string;
  page: number;
  hasNext: boolean;
}) {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextPage > 1) params.set("page", String(nextPage));
    const suffix = params.toString();
    return suffix ? `/admin/products?${suffix}` : "/admin/products";
  };

  return (
    <section aria-labelledby="products-heading" className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Catalog management</p>
          <h2 id="products-heading" className="mt-1 font-heading text-3xl font-semibold">Products</h2>
          <p className="mt-2 text-sm text-muted-foreground">Manage storefront products, prices, stock, and availability.</p>
        </div>
        <ProductDialog categories={categories} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/admin/products" className="flex w-full max-w-2xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={query} placeholder="Search by product name or SKU" className="h-11 pl-9" />
          </div>
          <Button type="submit" variant="outline" size="lg" className="h-11">Search</Button>
          {query && <Button nativeButton={false} render={<Link href="/admin/products" aria-label="Clear product search" />} variant="ghost" size="icon-lg"><X /></Button>}
        </form>
        <p className="shrink-0 text-sm text-muted-foreground">Page {page}</p>
      </div>

      {products.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex min-w-52 items-center gap-3">
                      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
                        {product.image_url ? <Image src={product.image_url} alt="" fill sizes="44px" className="object-contain p-1" /> : <ImageIcon className="size-5" />}
                      </span>
                      <div className="min-w-0"><p className="truncate font-medium">{product.name}</p><p className="truncate text-xs text-muted-foreground lg:hidden">{product.category_id ? categoryNames.get(product.category_id) || "Unknown category" : "Uncategorized"}</p></div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{product.category_id ? categoryNames.get(product.category_id) || "Unknown category" : "Uncategorized"}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">{product.sku}</TableCell>
                  <TableCell className="font-medium">${(product.price_usd_cents / 100).toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                  <TableCell><Badge variant="outline" className={product.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}>{product.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ProductDialog product={product} categories={categories} />
                      <DeleteProductDialog product={product} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-border p-12 text-center">
          <ImageIcon className="mx-auto size-9 text-muted-foreground" />
          <p className="mt-3 font-medium">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">{query ? "Try another search." : "Add your first product to the catalog."}</p>
        </div>
      )}

      <nav aria-label="Product pagination" className="mt-5 flex items-center justify-end gap-2">
        <Button nativeButton={false} render={<Link href={pageHref(page - 1)} aria-disabled={page === 1} tabIndex={page === 1 ? -1 : undefined} />} variant="outline" size="lg" className={page === 1 ? "pointer-events-none opacity-50" : ""}><ChevronLeft /> Previous</Button>
        <Button nativeButton={false} render={<Link href={pageHref(page + 1)} aria-disabled={!hasNext} tabIndex={!hasNext ? -1 : undefined} />} variant="outline" size="lg" className={!hasNext ? "pointer-events-none opacity-50" : ""}>Next <ChevronRight /></Button>
      </nav>
    </section>
  );
}
