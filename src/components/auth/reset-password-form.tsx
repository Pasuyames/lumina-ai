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
import { updatePasswordAction, type AuthState } from "@/app/(auth)/actions";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updatePasswordAction,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          Yeni şifre belirleyin
        </CardTitle>
        <CardDescription>
          Hesabınız için yeni bir parola girin.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Yeni parola</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-describedby={state?.error ? "reset-password-error" : undefined}
              aria-invalid={state?.error ? true : undefined}
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
              aria-describedby={state?.error ? "reset-password-error" : undefined}
              aria-invalid={state?.error ? true : undefined}
            />
          </div>
          {state?.error && (
            <p
              id="reset-password-error"
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-2">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Spinner />}
            Parolayı güncelle
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
