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
import { updateEmailAction, type SettingsState } from "@/app/(app)/settings/actions";

export function EmailForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateEmailAction,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">E-posta</CardTitle>
        <CardDescription>
          E-posta değiştirdiğinizde, değişiklik yalnızca yeni adresteki onay
          bağlantısını tıkladıktan sonra etkinleşir.
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
              autoComplete="email"
              defaultValue={email}
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
            Güncelle
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
