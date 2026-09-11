"use client";

import {
  createProductAction,
  deleteProductAction,
  uploadProductImageAction,
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
import { ChevronLeft, ChevronRight, ImageIcon, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";

const initialState: AdminActionState = { status: "idle" };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 4 * 1024 * 1024;

function ProductImageInput({
  id,
  existingImageUrl,
}: {
  id: string;
  existingImageUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function clearSelection() {
    setPreviewUrl(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    if (!file) {
      clearSelection();
      return;
    }
    if (!allowedImageTypes.has(file.type)) {
      setPreviewUrl(null);
      setFileName(file.name);
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > maxImageBytes) {
      setPreviewUrl(null);
      setFileName(file.name);
      setError("Choose an image up to 4 MB.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
  }

  const displayedImage = previewUrl || existingImageUrl;

  return (
    <div className="grid min-w-0 gap-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className={`relative mx-auto flex aspect-square w-full max-w-72 items-center justify-center overflow-hidden rounded-lg border border-border bg-card text-muted-foreground ${displayedImage ? "" : "border-dashed"}`}>
        {displayedImage ? (
          <Image
            src={displayedImage}
            alt="Product image preview"
            fill
            sizes="(max-width: 640px) 256px, 288px"
            className="object-contain p-4"
            unoptimized={Boolean(previewUrl)}
          />
        ) : (
          <div className="grid justify-items-center gap-2 px-4 text-center">
            <ImageIcon className="size-10" />
            <span className="text-sm">Choose a product image</span>
          </div>
        )}
      </div>
      <div className="mx-auto grid w-full max-w-lg gap-2">
        <Input
          ref={inputRef}
          id={id}
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={selectImage}
          className="h-11 min-w-0 cursor-pointer py-1.5 leading-8 file:mr-3 file:h-8 file:cursor-pointer file:items-center file:rounded-md file:bg-muted file:px-3 file:align-middle file:font-semibold file:shadow-sm file:ring-1 file:ring-border file:transition-colors hover:file:bg-accent"
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        />
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          Optional. JPEG, PNG, or WebP, up to 4 MB.
        </p>
        {fileName && (
          <div className="flex items-center gap-2 text-xs">
            <span className="min-w-0 truncate text-muted-foreground">Selected: {fileName}</span>
            <Button type="button" variant="ghost" size="sm" className="h-7 shrink-0 px-2" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        )}
        {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}

function ImageUploadRetry({
  productId,
  message,
  close,
}: {
  productId: string;
  message?: string;
  close: () => void;
}) {
  const router = useRouter();
  const action = uploadProductImageAction.bind(null, productId);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      close();
    }
  }, [state.status, close, router]);

  return (
    <form action={formAction} className="grid gap-5">
      <ProductImageInput id={`${productId}-retry-image`} />
      <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-3 text-sm text-foreground">
        <p className="font-medium">The product was created without its image.</p>
        <p className="mt-1 text-muted-foreground">
          {state.status === "error" ? state.message : message}
        </p>
        <p className="mt-1 text-muted-foreground">Choose the image again to retry. This will not create another product.</p>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={close}>Close</Button>
        <Button type="submit" size="lg" disabled={pending}>
          <Upload /> {pending ? "Uploading…" : "Retry image upload"}
        </Button>
      </DialogFooter>
    </form>
  );
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
  const categoryItems = Object.fromEntries([
    ["uncategorized", "Uncategorized"],
    ...categories.map((category) => [
      category.id,
      `${category.name}${category.is_active ? "" : " (inactive)"}`,
    ]),
  ]);

  useEffect(() => {
    if (state.status === "success") close();
  }, [state.status, close]);

  if (state.status === "partial" && state.productId) {
    return <ImageUploadRetry productId={state.productId} message={state.message} close={close} />;
  }

  return (
    <form
      action={formAction}
      className="grid min-w-0 gap-4 md:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] md:items-start md:gap-5"
    >
      <ProductImageInput
        id={`${product?.id || "new"}-product-image`}
        existingImageUrl={product?.image_url}
      />

      <div className="grid min-w-0 gap-4">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
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
            <Select
              name="category_id"
              defaultValue={product?.category_id || "uncategorized"}
              items={categoryItems}
            >
              <SelectTrigger id={`${product?.id || "new"}-product-category`} className="h-11 min-w-0 w-full overflow-hidden">
                <SelectValue placeholder="Choose a category" className="min-w-0 truncate" />
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}{category.is_active ? "" : " (inactive)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-3 [&>*]:min-w-0">
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
              rows={3}
              className="min-h-20"
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
      </div>

      <DialogFooter className="mt-1 md:col-span-2">
        <DialogClose render={<Button type="button" variant="outline" size="lg" />}>Cancel</DialogClose>
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving…" : product ? "Save changes" : "Add product"}</Button>
      </DialogFooter>
    </form>
  );
}

function ProductDialog({
  product,
  categories,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: {
  product?: AdminProduct;
  categories: AdminCategory[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger
          render={product
            ? <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`} />
            : <Button size="lg" className="h-11" />}
        >
          {product ? <Pencil /> : <><Plus /> Add product</>}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-4xl!">
        <DialogHeader>
          <DialogTitle className="text-xl">{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product details or replace its image." : "Add the product details and an optional image."}
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={product} categories={categories} close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ProductTableRow({
  product,
  categories,
  categoryName,
}: {
  product: AdminProduct;
  categories: AdminCategory[];
  categoryName: string;
}) {
  const [editOpen, setEditOpen] = useState(false);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTableRowElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setEditOpen(true);
    }
  }

  return (
    <>
      <TableRow
        tabIndex={0}
        aria-label={`Edit ${product.name}`}
        className="cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onClick={() => setEditOpen(true)}
        onKeyDown={handleKeyDown}
      >
        <TableCell>
          <div className="flex min-w-52 items-center gap-3">
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
              {product.image_url ? <Image src={product.image_url} alt="" fill sizes="44px" className="object-contain p-1" /> : <ImageIcon className="size-5" />}
            </span>
            <div className="min-w-0"><p className="truncate font-medium">{product.name}</p><p className="truncate text-xs text-muted-foreground lg:hidden">{categoryName}</p></div>
          </div>
        </TableCell>
        <TableCell className="hidden lg:table-cell">{categoryName}</TableCell>
        <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">{product.sku}</TableCell>
        <TableCell className="font-medium">${(product.price_usd_cents / 100).toFixed(2)}</TableCell>
        <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
        <TableCell><Badge variant="outline" className={product.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}>{product.is_active ? "Active" : "Inactive"}</Badge></TableCell>
        <TableCell>
          <div
            className="flex justify-end gap-1"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`} onClick={() => setEditOpen(true)}>
              <Pencil />
            </Button>
            <DeleteProductDialog product={product} />
          </div>
        </TableCell>
      </TableRow>
      <ProductDialog
        product={product}
        categories={categories}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
      />
    </>
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
    <section aria-labelledby="products-heading" className="w-full">
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
              {products.map((product) => {
                const categoryName = product.category_id
                  ? categoryNames.get(product.category_id) || "Unknown category"
                  : "Uncategorized";
                return (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    categories={categories}
                    categoryName={categoryName}
                  />
                );
              })}
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
