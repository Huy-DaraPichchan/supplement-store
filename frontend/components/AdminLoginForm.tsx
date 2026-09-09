"use client";

import {
  loginAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";
import { useActionState } from "react";

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAction, { status: "idle" as const });

  return (
    <form action={action} className="mt-7 grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-11 text-base"
          placeholder="admin@example.com"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 text-base"
        />
      </div>
      {state.status === "error" && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="h-11 font-semibold shadow-card"
      >
        <LogIn className="size-4" />
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
