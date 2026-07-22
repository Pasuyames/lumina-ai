"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  updateAccountPasswordAction,
  type SettingsState,
} from "@/app/(app)/settings/actions";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateAccountPasswordAction,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Parola</CardTitle>
        <CardDescription>Hesabınızın parolasını değiştirin.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_password">Mevcut parola</Label>
            <Input
              id="current_password"
              name="current_password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">Yeni parola</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Yeni parola (tekrar)</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
          {state && "error" in state && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state && "success" in state && (
            <p role="status" className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
              {state.success}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner />}
            Parolayı güncelle
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
