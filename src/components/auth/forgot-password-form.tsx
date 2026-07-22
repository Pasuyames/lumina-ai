"use client";

import { useActionState } from "react";
import Link from "next/link";
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
  requestPasswordResetAction,
  type ResetRequestState,
} from "@/app/(auth)/actions";
import { ROUTES } from "@/lib/constants";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    ResetRequestState,
    FormData
  >(requestPasswordResetAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          Şifrenizi mi unuttunuz?
        </CardTitle>
        <CardDescription>
          E-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ornek@marka.com"
              disabled={state != null && "success" in state}
              aria-describedby="reset-request-message"
            />
          </div>
          {state && "error" in state && (
            <p
              id="reset-request-message"
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.error}
            </p>
          )}
          {state && "success" in state && (
            <p
              id="reset-request-message"
              role="status"
              className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary"
            >
              {state.success}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-2 flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={pending || (state != null && "success" in state)}
          >
            {pending && <Spinner />}
            Sıfırlama bağlantısı gönder
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={ROUTES.login}
              className="font-medium text-primary hover:underline"
            >
              Girişe dön
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
