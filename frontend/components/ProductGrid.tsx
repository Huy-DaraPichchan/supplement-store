"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  getCategories,
  getProducts,
  PAGE_SIZE,
  type Category,
  type ProductQuery,
  type ProductSort,
} from "@/lib/api";
import type { Product } from "@/lib/types/product";
import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

const sortOptions: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

function readSort(value: string | null): ProductSort {
  return value === "price_asc" || value === "price_desc" ? value : "newest";
}

type FilterControlsProps = {
  categories: Category[];
  category: string;
  inStock: boolean;
  onCategoryChange: (value: string) => void;
  onStockChange: (value: boolean) => void;
};

function FilterControls({
  categories,
  category,
  inStock,
  onCategoryChange,
  onStockChange,
}: FilterControlsProps) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-base font-semibold">Category</legend>
        <div className="space-y-1">
          {[
            { id: "all", slug: "all", name: "All products" },
            ...categories,
          ].map((item) => (
            <label
              key={item.id}
              className={`flex min-h-11 cursor-pointer items-center rounded-md px-3 text-base transition-colors ${category === item.slug ? "bg-primary-soft font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <input
                type="radio"
                name="category"
                value={item.slug}
                checked={category === item.slug}
                onChange={() => onCategoryChange(item.slug)}
                className="sr-only"
              />
              {item.name}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-base font-semibold">Availability</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => onStockChange(event.target.checked)}
            className="size-4 shrink-0 accent-primary"
          />
          In stock only
        </label>
      </fieldset>
    </div>
  );
}

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const query = searchParams.get("q") || "";
  const sort = readSort(searchParams.get("sort"));
  const inStock = searchParams.get("in_stock") === "true";
  const [categories, setCategories] = useState<Category[]>([]);

  function setParam(name: string, value?: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || (name === "sort" && value === "newest"))
      next.delete(name);
    else next.set(name, value);
    const nextQuery = next.toString();
    window.history.pushState(
      null,
      "",
      nextQuery ? `/products?${nextQuery}` : "/products",
    );
  }

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const activeFilterCount = (category !== "all" ? 1 : 0) + (inStock ? 1 : 0);
  const productQuery = useMemo<ProductQuery>(
    () => ({ category, search: query, sort, inStock }),
    [category, inStock, query, sort],
  );
  return (
    <section className="mx-auto max-w-7xl px-3 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 text-base font-semibold">Filter products</h2>
            <FilterControls
              categories={categories}
              category={category}
              inStock={inStock}
              onCategoryChange={(value) => setParam("category", value)}
              onStockChange={(value) =>
                setParam("in_stock", value ? "true" : undefined)
              }
            />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-card p-2.5 shadow-card sm:p-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <CatalogSearch query={query} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 lg:w-auto lg:shrink-0 lg:justify-end">
              <MobileFilters
                activeCount={activeFilterCount}
                categories={categories}
                category={category}
                inStock={inStock}
                onCategoryChange={(value) => setParam("category", value)}
                onStockChange={(value) =>
                  setParam("in_stock", value ? "true" : undefined)
                }
              />
              <SortSelect
                sort={sort}
                onSortChange={(value) => setParam("sort", value)}
              />
            </div>
          </div>
          <CatalogResults
            query={productQuery}
            onClear={() => window.history.pushState(null, "", "/products")}
          />
        </div>
      </div>
    </section>
  );
}

function SortSelect({
  sort,
  onSortChange,
}: {
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLabel = sortOptions.find(
    (option) => option.value === sort,
  )?.label;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-base text-foreground outline-none transition-[border-color,box-shadow] hover:bg-muted focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-auto"
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <span className="hidden text-muted-foreground sm:inline">Sort</span>
          {activeLabel}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-10 mt-2 w-full min-w-[11rem] overflow-hidden rounded-lg border border-border bg-card p-1 shadow-panel sm:w-auto"
        >
          {sortOptions.map((option) => {
            const active = option.value === sort;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onSortChange(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 text-left text-base transition-colors ${
                  active
                    ? "bg-primary-soft font-medium text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {option.label}
                {active && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CatalogSearch({ query }: { query: string }) {
  const searchParams = useSearchParams();
  const [edit, setEdit] = useState({ sourceQuery: query, value: query });
  const value = edit.sourceQuery === query ? edit.value : query;

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === query) return;
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      const nextQuery = next.toString();
      window.history.replaceState(
        null,
        "",
        nextQuery ? `/products?${nextQuery}` : "/products",
      );
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query, searchParams, value]);

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(event) =>
          setEdit({ sourceQuery: query, value: event.target.value })
        }
        placeholder="Search by product name, description, or SKU"
        aria-label="Search catalog"
        className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-12 text-base outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      {value && (
        <button
          type="button"
          onClick={() => setEdit({ sourceQuery: query, value: "" })}
          aria-label="Clear search"
          className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function CatalogResults({
  query,
  onClear,
}: {
  query: ProductQuery;
  onClear: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const queryKey = `${query.category}:${query.search}:${query.sort}:${query.inStock}`;
  const activeQueryRef = useRef(queryKey);
  const [displayedQueryKey, setDisplayedQueryKey] = useState(queryKey);
  const refreshing = !initialLoading && displayedQueryKey !== queryKey;

  useEffect(() => {
    let cancelled = false;
    activeQueryRef.current = queryKey;
    loadingMoreRef.current = false;
    getProducts(query)
      .then((nextProducts) => {
        if (cancelled) return;
        setProducts(nextProducts);
        setHasMore(nextProducts.length === PAGE_SIZE);
        setDisplayedQueryKey(queryKey);
        setLoadingMore(false);
        setError(null);
        setLoadMoreError(false);
      })
      .catch(() => {
        if (!cancelled) {
          setDisplayedQueryKey(queryKey);
          setLoadingMore(false);
          setHasMore(false);
          setError("Products could not be loaded. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, queryKey]);

  const loadNextPage = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;

    const requestQueryKey = activeQueryRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);

    try {
      const nextProducts = await getProducts({
        ...query,
        offset: products.length,
      });
      if (activeQueryRef.current !== requestQueryKey) return;
      setProducts((current) => [...current, ...nextProducts]);
      setHasMore(nextProducts.length === PAGE_SIZE);
    } catch {
      if (activeQueryRef.current === requestQueryKey) setLoadMoreError(true);
    } finally {
      if (activeQueryRef.current === requestQueryKey) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [hasMore, products.length, query]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      initialLoading ||
      refreshing ||
      loadingMore ||
      !hasMore ||
      loadMoreError
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void loadNextPage();
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    hasMore,
    initialLoading,
    loadMoreError,
    loadNextPage,
    loadingMore,
    refreshing,
  ]);

  return (
    <div aria-busy={initialLoading || refreshing || loadingMore}>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-base text-destructive"
        >
          {error}
        </div>
      )}
      {initialLoading ? (
        <ProductGridSkeleton />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border-strong bg-card px-6 py-16 text-center shadow-card">
          <h2 className="font-semibold">No products found</h2>
          <p className="mt-1 text-base text-muted-foreground">
            Try a different search or clear your filters.
          </p>
          {/* <button
            type="button"
            onClick={onClear}
            className="mt-4 min-h-11 rounded-md px-3 text-base font-semibold text-primary hover:bg-primary-soft hover:text-primary-hover"
          >
            Clear all filters
          </button> */}
        </div>
      )}
      <div
        ref={sentinelRef}
        className="flex min-h-20 items-center justify-center py-6"
        aria-live="polite"
      >
        {loadingMore && (
          <span className="text-base text-muted-foreground">
            Loading more products…
          </span>
        )}
        {loadMoreError && !loadingMore && (
          <button
            type="button"
            onClick={() => void loadNextPage()}
            className="min-h-11 rounded-md px-3 text-base font-semibold text-primary hover:bg-primary-soft hover:text-primary-hover"
          >
            Loading more failed. Try again
          </button>
        )}
        {!initialLoading && !loadingMore && !hasMore && products.length > 0 && (
          <span className="text-sm text-muted-foreground">
            You have reached the end.
          </span>
        )}
      </div>
    </div>
  );
}

function MobileFilters({
  activeCount,
  categories,
  category,
  inStock,
  onCategoryChange,
  onStockChange,
}: FilterControlsProps & { activeCount: number }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className={`flex h-11 items-center gap-2 rounded-md border px-3 text-base font-medium transition-colors lg:hidden ${
          activeCount > 0
            ? "border-primary/40 bg-primary-soft text-primary hover:bg-primary-soft/80"
            : "border-input bg-card text-foreground hover:bg-muted"
        }`}
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-foreground/30 backdrop-blur-[1px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-xl border-t border-border bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-panel transition-transform duration-200 data-ending-style:translate-y-full data-starting-style:translate-y-full sm:p-5">
          <div
            className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden"
            aria-hidden="true"
          />

          <div className="mb-5 flex items-center justify-between">
            <div>
              <Dialog.Title className="font-semibold">Filters</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Narrow down the catalog
              </Dialog.Description>
            </div>
            <Dialog.Close className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="size-5" />
              <span className="sr-only">Close filters</span>
            </Dialog.Close>
          </div>

          <FilterControls
            categories={categories}
            category={category}
            inStock={inStock}
            onCategoryChange={onCategoryChange}
            onStockChange={onStockChange}
          />

          <div className="mt-6 flex gap-2">
            {/* {activeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onCategoryChange("all");
                  onStockChange(false);
                }}
                className="h-11 flex-1 rounded-md border border-input text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Clear all
              </button>
            )} */}
            <Dialog.Close
              className={`h-11 rounded-md bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover ${
                activeCount > 0 ? "flex-[2]" : "w-full"
              }`}
            >
              View products
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProductGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4"
      aria-label="Loading products"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
